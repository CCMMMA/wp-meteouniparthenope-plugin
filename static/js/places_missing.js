// Sistema di Gestione Places Mancanti
(function($) {
    'use strict';

    // Configurazione
    const CONFIG = {
        API_PLACES_URL: 'https://api.meteo.uniparthenope.it/places',
        EXISTING_IDS_ENDPOINT: '/wp-json/meteounip/v1/places/existing-ids',
        REST_ENDPOINT: '/wp-json/meteounip/v1/places/single',
        BATCH_SIZE: 5,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 2000
    };

    // Stato
    let missingPlacesState = {
        isSearching: false,
        missingPlaces: [],
        totalFromAPI: 0,
        totalExisting: 0
    };

    let jsonImportState = {
        isRunning: false,
        totalPlaces: 0,
        processedPlaces: 0,
        successfulImports: 0,
        failedImports: [],
        currentBatch: 0
    };

    // Elementi DOM
    let elements = {};

    // Inizializzazione
    $(document).ready(function() {
        initializeElements();
        bindEvents();
    });

    /**
     * Inizializza gli elementi DOM
     */
    function initializeElements() {
        elements = {
            // Ricerca places mancanti
            searchBtn: $('#search-missing-places-btn'),
            searchResult: $('#search-missing-result'),
            downloadBtn: $('#download-missing-json-btn'),
            
            // Import da JSON
            jsonImportForm: $('#json-import-form'),
            jsonFileInput: $('#json-file-input'),
            jsonImportBtn: $('#json-import-btn'),
            jsonProgressContainer: $('#json-import-progress-container'),
            jsonProgressBar: $('#json-import-progress-fill'),
            jsonResult: $('#json-import-result'),
            
            // Statistiche
            placesPublished: $('#places-published'),
            placesTotal: $('#places-total')
        };
    }

    /**
     * Associa gli eventi
     */
    function bindEvents() {
        elements.searchBtn.on('click', handleSearchMissing);
        elements.downloadBtn.on('click', handleDownloadJSON);
        elements.jsonImportForm.on('submit', handleJSONImport);
        elements.jsonFileInput.on('change', handleFileSelect);
    }

    /**
     * Gestisce il file selezionato
     */
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            elements.jsonImportBtn.prop('disabled', false);
            showJSONMessage(`File selezionato: ${file.name}`, 'info');
        } else {
            elements.jsonImportBtn.prop('disabled', true);
        }
    }

    /**
     * Gestisce la ricerca dei places mancanti
     */
    async function handleSearchMissing(e) {
        e.preventDefault();
        
        if (missingPlacesState.isSearching) {
            return;
        }

        try {
            missingPlacesState.isSearching = true;
            elements.searchBtn.prop('disabled', true).text('Ricerca in corso...');
            elements.downloadBtn.hide();
            
            showSearchMessage('Recupero places dall\'API...', 'info');
            
            // Recupera tutti i places dall'API
            const apiPlaces = await fetchPlacesFromAPI();
            missingPlacesState.totalFromAPI = apiPlaces.length;
            
            showSearchMessage(`Trovati ${apiPlaces.length} places nell'API. Controllo database locale...`, 'info');
            
            // Recupera gli ID esistenti nel database
            const existingIds = await fetchExistingPlaceIds();
            missingPlacesState.totalExisting = existingIds.length;
            const existingSet = new Set(existingIds);
            
            // Trova i places mancanti
            missingPlacesState.missingPlaces = apiPlaces
                .filter(place => !existingSet.has(place.id))
                .map(place => ({
                    id: place.id,
                    name: place.long_name?.it || place.name?.it || 'Nome non disponibile'
                }));
            
            displaySearchResults();
            
        } catch (error) {
            showSearchMessage(`Errore durante la ricerca: ${error.message}`, 'error');
        } finally {
            missingPlacesState.isSearching = false;
            elements.searchBtn.prop('disabled', false).text('Cerca Places Mancanti');
        }
    }

    /**
     * Mostra i risultati della ricerca
     */
    function displaySearchResults() {
        const missing = missingPlacesState.missingPlaces.length;
        const total = missingPlacesState.totalFromAPI;
        const existing = missingPlacesState.totalExisting;
        
        let message = `<strong>Risultati della ricerca:</strong><br>`;
        message += `📊 Places totali nell'API: ${total}<br>`;
        message += `✅ Places già importati: ${existing}<br>`;
        message += `❌ Places mancanti: ${missing}`;
        
        if (missing > 0) {
            message += `<br><br>Puoi scaricare la lista dei places mancanti in formato JSON.`;
            elements.downloadBtn.show();
        } else {
            message += `<br><br>🎉 Ottimo! Tutti i places sono già stati importati.`;
        }
        
        showSearchMessage(message, missing > 0 ? 'warning' : 'success');
    }

    /**
     * Gestisce il download del file JSON
     */
    function handleDownloadJSON(e) {
        e.preventDefault();
        
        if (missingPlacesState.missingPlaces.length === 0) {
            showSearchMessage('Nessun place mancante da esportare.', 'warning');
            return;
        }

        try {
            // Crea l'oggetto JSON nel formato richiesto
            const jsonData = {};
            missingPlacesState.missingPlaces.forEach(place => {
                jsonData[place.id] = place.name;
            });
            
            // Converte in stringa JSON formattata
            const jsonString = JSON.stringify(jsonData, null, 2);
            
            // Crea il blob e il link per il download
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            // Genera nome file con timestamp
            const timestamp = new Date().toISOString().slice(0, 10);
            link.download = `places_mancanti_${timestamp}.json`;
            link.href = url;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Cleanup
            URL.revokeObjectURL(url);
            
            showSearchMessage(`✅ File JSON scaricato con successo: ${missingPlacesState.missingPlaces.length} places.`, 'success');
            
        } catch (error) {
            showSearchMessage(`Errore durante la creazione del file: ${error.message}`, 'error');
        }
    }

    /**
     * Gestisce l'importazione da file JSON
     */
    async function handleJSONImport(e) {
        e.preventDefault();
        
        if (jsonImportState.isRunning) {
            stopJSONImport();
            return;
        }

        const file = elements.jsonFileInput[0].files[0];
        if (!file) {
            showJSONMessage('Seleziona un file JSON prima di importare.', 'warning');
            return;
        }

        try {
            // Leggi il file JSON
            const jsonContent = await readJSONFile(file);
            
            // Valida il formato
            if (typeof jsonContent !== 'object' || Array.isArray(jsonContent)) {
                throw new Error('Il file JSON deve essere un oggetto con coppie "id": "nome"');
            }

            // Converti in array di places
            const placesToImport = Object.entries(jsonContent).map(([id, name]) => ({
                id: id,
                name: name
            }));

            if (placesToImport.length === 0) {
                showJSONMessage('Il file JSON è vuoto.', 'warning');
                return;
            }

            // Avvia l'importazione
            await startJSONImport(placesToImport);
            
        } catch (error) {
            showJSONMessage(`Errore durante l'importazione: ${error.message}`, 'error');
        }
    }

    /**
     * Legge e parsifica il file JSON
     */
    function readJSONFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    resolve(json);
                } catch (error) {
                    reject(new Error('File JSON non valido: ' + error.message));
                }
            };
            
            reader.onerror = () => reject(new Error('Errore nella lettura del file'));
            reader.readAsText(file);
        });
    }

    /**
     * Avvia l'importazione da JSON
     */
    async function startJSONImport(placesToImport) {
        try {
            // Reset stato
            jsonImportState = {
                isRunning: true,
                totalPlaces: placesToImport.length,
                processedPlaces: 0,
                successfulImports: 0,
                failedImports: [],
                currentBatch: 0
            };
            
            updateJSONUI('start');
            showJSONMessage(`Avvio importazione di ${placesToImport.length} places...`, 'info');
            
            // Processa a batch
            await processJSONPlacesInBatches(placesToImport);
            
            // Completamento
            completeJSONImport();
            
        } catch (error) {
            handleJSONImportError(error);
        }
    }

    /**
     * Processa i places da JSON in batch
     */
    async function processJSONPlacesInBatches(placesToImport) {
        const batches = createBatches(placesToImport, CONFIG.BATCH_SIZE);
        
        for (let i = 0; i < batches.length && jsonImportState.isRunning; i++) {
            jsonImportState.currentBatch = i + 1;
            
            const batchPromises = batches[i].map(place => 
                processJSONPlaceWithRetry(place)
            );
            
            await Promise.allSettled(batchPromises);
            updateJSONProgressBar();
            
            if (i < batches.length - 1) {
                await sleep(500);
            }
        }
    }

    /**
     * Processa un singolo place da JSON con retry
     */
    async function processJSONPlaceWithRetry(placeData, attempt = 1) {
        try {
            await importSinglePlace(placeData.id);
            jsonImportState.successfulImports++;
        } catch (error) {
            if (error.status === 409) {
                // Place già esistente, non è un errore
                console.log(`Place ${placeData.id} già esistente, saltato.`);
            } else if (attempt < CONFIG.RETRY_ATTEMPTS) {
                console.warn(`Retry ${attempt} per place ${placeData.id}:`, error.message);
                await sleep(CONFIG.RETRY_DELAY);
                return processJSONPlaceWithRetry(placeData, attempt + 1);
            } else {
                jsonImportState.failedImports.push({
                    place_id: placeData.id,
                    name: placeData.name,
                    error: error.message
                });
            }
        } finally {
            jsonImportState.processedPlaces++;
        }
    }

    /**
     * Importa un singolo place (usa solo il place_id)
     */
    async function importSinglePlace(placeId) {
        const requestData = {
            place_id: placeId,
            domain: 'json-import'
        };

        const response = await fetch(CONFIG.REST_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': wpApiSettings?.nonce || ''
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `HTTP Error: ${response.status}`;
            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        }

        return await response.json();
    }

    /**
     * Ferma l'importazione JSON
     */
    function stopJSONImport() {
        jsonImportState.isRunning = false;
        updateJSONUI('stop');
        showJSONMessage('Importazione interrotta dall\'utente.', 'warning');
    }

    /**
     * Completa l'importazione JSON
     */
    function completeJSONImport() {
        jsonImportState.isRunning = false;
        updateJSONUI('complete');
        
        const successRate = ((jsonImportState.successfulImports / jsonImportState.totalPlaces) * 100).toFixed(1);
        
        let message = `Importazione da JSON completata!<br>`;
        message += `Places processati: ${jsonImportState.processedPlaces}/${jsonImportState.totalPlaces}<br>`;
        message += `Importazioni riuscite: ${jsonImportState.successfulImports} (${successRate}%)<br>`;
        message += `Errori: ${jsonImportState.failedImports.length}`;
        
        showJSONMessage(message, 'success');
        
        if (jsonImportState.failedImports.length > 0) {
            displayJSONFailedImports();
        }
        
        // Aggiorna statistiche
        updateStatistics();
        
        // Reset form
        elements.jsonFileInput.val('');
        elements.jsonImportBtn.prop('disabled', true);
    }

    /**
     * Gestisce errori importazione JSON
     */
    function handleJSONImportError(error) {
        jsonImportState.isRunning = false;
        updateJSONUI('error');
        showJSONMessage(`Errore durante l'importazione: ${error.message}`, 'error');
    }

    /**
     * Aggiorna UI per importazione JSON
     */
    function updateJSONUI(state) {
        switch (state) {
            case 'start':
                elements.jsonImportBtn.text('Ferma Importazione').removeClass('button-primary').addClass('button-secondary');
                elements.jsonProgressContainer.show();
                updateJSONProgressBar();
                break;
                
            case 'stop':
            case 'complete':
            case 'error':
                elements.jsonImportBtn.text('Avvia Importazione').removeClass('button-secondary').addClass('button-primary');
                break;
        }
    }

    /**
     * Aggiorna progress bar JSON
     */
    function updateJSONProgressBar() {
        if (jsonImportState.totalPlaces === 0) return;
        
        const percentage = Math.round((jsonImportState.processedPlaces / jsonImportState.totalPlaces) * 100);
        elements.jsonProgressBar.css('width', percentage + '%').text(percentage + '%');
    }

    /**
     * Mostra places falliti da JSON
     */
    function displayJSONFailedImports() {
        if (jsonImportState.failedImports.length === 0) return;
        
        let failedHtml = '<div class="failed-imports" style="margin-top: 20px;">';
        failedHtml += '<h4>Places non importati:</h4>';
        failedHtml += '<ul style="max-height: 200px; overflow-y: auto; border: 1px solid #ccd0d4; padding: 10px; background: #f9f9f9;">';
        
        jsonImportState.failedImports.forEach(failure => {
            failedHtml += `<li><strong>${failure.place_id}</strong> (${failure.name}): ${failure.error}</li>`;
        });
        
        failedHtml += '</ul></div>';
        elements.jsonResult.append(failedHtml);
    }

    // Utility functions condivise

    async function fetchPlacesFromAPI() {
        const response = await fetch(CONFIG.API_PLACES_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    }

    async function fetchExistingPlaceIds() {
        const response = await fetch(CONFIG.EXISTING_IDS_ENDPOINT, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        return data.place_ids || [];
    }

    function createBatches(array, batchSize) {
        const batches = [];
        for (let i = 0; i < array.length; i += batchSize) {
            batches.push(array.slice(i, i + batchSize));
        }
        return batches;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function showSearchMessage(message, type = 'info') {
        const alertClass = getAlertClass(type);
        const messageHtml = `
            <div class="notice ${alertClass} is-dismissible">
                <p>${message}</p>
            </div>
        `;
        elements.searchResult.html(messageHtml);
    }

    function showJSONMessage(message, type = 'info') {
        const alertClass = getAlertClass(type);
        const messageHtml = `
            <div class="notice ${alertClass} is-dismissible">
                <p>${message}</p>
            </div>
        `;
        elements.jsonResult.html(messageHtml);
    }

    function getAlertClass(type) {
        const classes = {
            'success': 'notice-success',
            'error': 'notice-error',
            'warning': 'notice-warning',
            'info': 'notice-info'
        };
        return classes[type] || 'notice-info';
    }

    function updateStatistics() {
        try {
            const currentPublished = parseInt(elements.placesPublished.text()) || 0;
            const currentTotal = parseInt(elements.placesTotal.text()) || 0;
            
            elements.placesPublished.text(currentPublished + jsonImportState.successfulImports);
            elements.placesTotal.text(currentTotal + jsonImportState.successfulImports);
        } catch (error) {
            console.error('Errore aggiornamento statistiche:', error);
        }
    }

})(jQuery);