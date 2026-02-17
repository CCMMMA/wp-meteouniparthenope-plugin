// Sistema di Importazione Massiva Places
(function($) {
    'use strict';

    // Configurazione
    const CONFIG = {
        API_PLACES_URL: 'https://api.meteo.uniparthenope.it/places',
        REST_ENDPOINT: '/wp-json/meteounip/v1/places/single',
        EXISTING_IDS_ENDPOINT: '/wp-json/meteounip/v1/places/existing-ids',
        BATCH_SIZE: 5, // Numero di chiamate simultanee per evitare sovraccarico
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 2000 // millisecondi
    };

    // Stato dell'importazione
    let importState = {
        isRunning: false,
        totalPlaces: 0,
        processedPlaces: 0,
        successfulImports: 0,
        skippedPlaces: 0,
        failedImports: [],
        currentBatch: 0,
        existingPlaceIds: new Set()
    };

    // Elementi DOM
    let elements = {};

    // Inizializzazione quando il DOM è pronto
    $(document).ready(function() {
        initializeElements();
        bindEvents();
    });

    /**
     * Inizializza gli elementi DOM
     */
    function initializeElements() {
        elements = {
            form: $('#import-places-form'),
            button: $('#import-places-btn'),
            sourceSelect: $('#import-source-select'),
            progressContainer: $('#add-progress-fill'),
            progressBar: $('.progress-fill'),
            resultDiv: $('#import-result'),
            placesPublished: $('#places-published'),
            placesTotal: $('#places-total')
        };
    }

    /**
     * Associa gli eventi
     */
    function bindEvents() {
        elements.form.on('submit', handleFormSubmit);
    }

    /**
     * Gestisce l'invio del form
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        if (importState.isRunning) {
            stopImport();
            return;
        }

        const source = elements.sourceSelect.val();
        if (source === 'default') {
            startMassImport();
        } else {
            showMessage('Altre opzioni di importazione non ancora implementate.', 'warning');
        }
    }

    /**
     * Avvia l'importazione massiva
     */
    async function startMassImport() {
        try {
            // Reset stato
            resetImportState();
            updateUI('start');
            
            showMessage('Recupero places già esistenti...', 'info');
            
            // Recupera gli ID dei places già presenti nel database
            const existingIds = await fetchExistingPlaceIds();
            importState.existingPlaceIds = new Set(existingIds);
            
            showMessage(`Trovati ${existingIds.length} places già importati. Recupero elenco completo dall'API...`, 'info');
            
            // Recupera tutti i places dall'API
            const placesData = await fetchPlacesFromAPI();
            
            if (!placesData || placesData.length === 0) {
                throw new Error('Nessun place trovato nell\'API');
            }

            // Filtra solo i places che non sono già presenti
            const placesToImport = placesData.filter(place => 
                !importState.existingPlaceIds.has(place.id)
            );
            
            const alreadyImported = placesData.length - placesToImport.length;

            if (placesToImport.length === 0) {
                showMessage(
                    `Tutti i ${placesData.length} places dall'API sono già stati importati. Nessuna azione necessaria.`,
                    'success'
                );
                updateUI('complete');
                return;
            }

            importState.totalPlaces = placesToImport.length;
            importState.skippedPlaces = alreadyImported;
            
            showMessage(
                `Trovati ${placesData.length} places nell'API.\n` +
                `${alreadyImported} già importati, ${placesToImport.length} da importare.\n` +
                `Avvio importazione...`,
                'info'
            );
            
            // Avvia l'importazione a batch
            await processPLacesInBatches(placesToImport);
            
            // Importazione completata
            completeImport();
            
        } catch (error) {
            handleImportError(error);
        }
    }

    /**
     * Recupera gli ID dei places già esistenti nel database
     */
    async function fetchExistingPlaceIds() {
        try {
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
            
        } catch (error) {
            console.error('Errore nel recupero dei places esistenti:', error);
            // In caso di errore, restituisce array vuoto per procedere comunque
            // (l'API rest controllerà comunque i duplicati)
            return [];
        }
    }

    /**
     * Recupera i places dall'API esterna
     */
    async function fetchPlacesFromAPI() {
        try {
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
            
        } catch (error) {
            console.error('Errore nel recupero dei places:', error);
            throw new Error(`Impossibile recuperare i places: ${error.message}`);
        }
    }

    /**
     * Processa i places in batch per evitare sovraccarico del server
     */
    async function processPLacesInBatches(placesData) {
        const batches = createBatches(placesData, CONFIG.BATCH_SIZE);
        
        for (let i = 0; i < batches.length && importState.isRunning; i++) {
            importState.currentBatch = i + 1;
            
            // Processa il batch corrente
            const batchPromises = batches[i].map(place => 
                processPlaceWithRetry(place)
            );
            
            await Promise.allSettled(batchPromises);
            
            // Aggiorna la progress bar (che ora include anche il messaggio batch)
            updateProgressBar();
            
            // Piccola pausa tra i batch per non sovraccaricare il server
            if (i < batches.length - 1) {
                await sleep(500);
            }
        }
    }

    /**
     * Crea array di batch dai places
     */
    function createBatches(array, batchSize) {
        const batches = [];
        for (let i = 0; i < array.length; i += batchSize) {
            batches.push(array.slice(i, i + batchSize));
        }
        return batches;
    }

    /**
     * Processa un singolo place con retry logic
     */
    async function processPlaceWithRetry(placeData, attempt = 1) {
        try {
            await importSinglePlace(placeData);
            importState.successfulImports++;
        } catch (error) {
            // Se il place esiste già (409), non ritentiamo ma lo contiamo come skippato
            if (error.status === 409) {
                importState.skippedPlaces++;
                console.log(`Place ${placeData.id} già esistente, saltato.`);
            } else if (attempt < CONFIG.RETRY_ATTEMPTS) {
                console.warn(`Retry ${attempt} per place ${placeData.id}:`, error.message);
                await sleep(CONFIG.RETRY_DELAY);
                return processPlaceWithRetry(placeData, attempt + 1);
            } else {
                // Aggiunge agli errori dopo tutti i tentativi
                importState.failedImports.push({
                    place_id: placeData.id,
                    name: placeData.long_name?.it || placeData.name?.it || 'Nome non disponibile',
                    error: error.message
                });
            }
        } finally {
            importState.processedPlaces++;
        }
    }

    /**
     * Importa un singolo place via REST API
     */
    async function importSinglePlace(placeData) {
        const requestData = {
            place_id: placeData.id,
            long_name_it: placeData.long_name?.it || placeData.name?.it,
            coordinates: placeData.pos?.coordinates || placeData.loc,
            domain: 'api-import'
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
     * Ferma l'importazione
     */
    function stopImport() {
        importState.isRunning = false;
        updateUI('stop');
        showMessage('Importazione interrotta dall\'utente.', 'warning');
    }

    /**
     * Completa l'importazione
     */
    function completeImport() {
        importState.isRunning = false;
        updateUI('complete');
        
        const totalProcessed = importState.processedPlaces + importState.skippedPlaces;
        const successRate = totalProcessed > 0 
            ? ((importState.successfulImports / importState.processedPlaces) * 100).toFixed(1)
            : 0;
        
        let message = `Importazione completata!\n`;
        message += `Places totali dall'API: ${totalProcessed + importState.skippedPlaces}\n`;
        message += `Places già esistenti (saltati): ${importState.skippedPlaces}\n`;
        message += `Places da importare: ${importState.processedPlaces}\n`;
        message += `Importazioni riuscite: ${importState.successfulImports} (${successRate}%)\n`;
        message += `Errori: ${importState.failedImports.length}`;
        
        showMessage(message, 'success');
        
        if (importState.failedImports.length > 0) {
            displayFailedImports();
        }
        
        // Aggiorna le statistiche
        updateStatistics();
    }

    /**
     * Gestisce gli errori dell'importazione
     */
    function handleImportError(error) {
        importState.isRunning = false;
        updateUI('error');
        
        console.error('Errore importazione:', error);
        showMessage(`Errore durante l'importazione: ${error.message}`, 'error');
    }

    /**
     * Reset dello stato dell'importazione
     */
    function resetImportState() {
        importState = {
            isRunning: true,
            totalPlaces: 0,
            processedPlaces: 0,
            successfulImports: 0,
            skippedPlaces: 0,
            failedImports: [],
            currentBatch: 0,
            existingPlaceIds: new Set()
        };
    }

    /**
     * Aggiorna l'interfaccia utente
     */
    function updateUI(state) {
        switch (state) {
            case 'start':
                elements.button.text('Ferma Importazione').removeClass('button-primary').addClass('button-secondary');
                elements.progressContainer.show();
                updateProgressBar();
                break;
                
            case 'stop':
            case 'complete':
            case 'error':
                elements.button.text('Importa tutti i Places').removeClass('button-secondary').addClass('button-primary');
                break;
        }
    }

    /**
     * Aggiorna la barra di progresso
     */
    function updateProgressBar() {
        if (importState.totalPlaces === 0) return;
        
        const percentage = Math.round((importState.processedPlaces / importState.totalPlaces) * 100);
        elements.progressBar.css('width', percentage + '%').text(percentage + '%');
        
        // Aggiorna anche il messaggio con dettagli
        const details = `${importState.processedPlaces}/${importState.totalPlaces} places processati (${importState.successfulImports} importati, ${importState.skippedPlaces} già esistenti)`;
        updateMessage(details);
    }

    /**
     * Mostra un messaggio nell'area risultati
     */
    function showMessage(message, type = 'info') {
        const alertClass = getAlertClass(type);
        const messageHtml = `
            <div class="notice ${alertClass} is-dismissible">
                <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
        `;
        elements.resultDiv.html(messageHtml);
    }

    /**
     * Aggiorna solo il messaggio mantenendo gli elementi esistenti
     */
    function updateMessage(message) {
        const existingNotice = elements.resultDiv.find('.notice p');
        if (existingNotice.length) {
            existingNotice.html(message);
        } else {
            showMessage(message, 'info');
        }
    }

    /**
     * Mostra l'elenco degli import falliti
     */
    function displayFailedImports() {
        if (importState.failedImports.length === 0) return;
        
        let failedHtml = '<div class="failed-imports" style="margin-top: 20px;">';
        failedHtml += '<h4>Places non importati:</h4>';
        failedHtml += '<ul style="max-height: 200px; overflow-y: auto; border: 1px solid #ccd0d4; padding: 10px; background: #f9f9f9;">';
        
        importState.failedImports.forEach(failure => {
            failedHtml += `<li><strong>${failure.place_id}</strong> (${failure.name}): ${failure.error}</li>`;
        });
        
        failedHtml += '</ul></div>';
        elements.resultDiv.append(failedHtml);
    }

    /**
     * Aggiorna le statistiche nella pagina
     */
    async function updateStatistics() {
        try {
            // Qui potresti fare una chiamata per ottenere statistiche aggiornate
            // Per ora incrementiamo manualmente basandoci sugli import riusciti
            const currentPublished = parseInt(elements.placesPublished.text()) || 0;
            const currentTotal = parseInt(elements.placesTotal.text()) || 0;
            
            elements.placesPublished.text(currentPublished + importState.successfulImports);
            elements.placesTotal.text(currentTotal + importState.successfulImports);
        } catch (error) {
            console.error('Errore aggiornamento statistiche:', error);
        }
    }

    /**
     * Ottiene la classe CSS per gli alert
     */
    function getAlertClass(type) {
        const classes = {
            'success': 'notice-success',
            'error': 'notice-error',
            'warning': 'notice-warning',
            'info': 'notice-info'
        };
        return classes[type] || 'notice-info';
    }

    /**
     * Utility per pause asincrone
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

})(jQuery);