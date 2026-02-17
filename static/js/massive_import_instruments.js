// Sistema di Importazione Massiva Instruments
(function($) {
    'use strict';

    // Configurazione
    const CONFIG = {
        API_INSTRUMENTS_URL: 'https://api.meteo.uniparthenope.it/instrument',
        REST_IMPORT_ENDPOINT: '/wp-json/meteounip/v1/instruments/import-all',
        DELETE_ENDPOINT: '/wp-json/meteounip/v1/instruments/delete-all',
        COUNT_ENDPOINT: '/wp-json/meteounip/v1/instruments/count',
        BATCH_SIZE: 10 // Numero di instruments da eliminare per batch
    };

    // Stato dell'importazione
    let importState = {
        isRunning: false,
        totalInstruments: 0,
        created: 0,
        skipped: 0,
        errors: []
    };

    // Stato dell'eliminazione
    let deleteState = {
        isDeleting: false,
        totalToDelete: 0,
        deleted: 0,
        remaining: 0
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
            // Import
            importButton: $('#import-instruments-btn'),
            importProgressContainer: $('#import-instruments-progress-container'),
            importProgressBar: $('#import-instruments-progress-fill'),
            importResult: $('#import-instruments-result'),
            
            // Delete
            deleteButton: $('#delete-all-instruments-btn'),
            deleteProgressContainer: $('#delete-instruments-progress-container'),
            deleteProgressBar: $('#delete-instruments-progress-fill'),
            deleteProgressInfo: $('#delete-instruments-progress-info'),
            deleteResult: $('#delete-instruments-result'),
            
            // Stats
            instrumentsPublished: $('#instruments-published'),
            instrumentsDraft: $('#instruments-draft'),
            instrumentsTrash: $('#instruments-trash'),
            instrumentsTotal: $('#instruments-total')
        };
    }

    /**
     * Associa gli eventi
     */
    function bindEvents() {
        elements.importButton.on('click', handleImportClick);
        elements.deleteButton.on('click', handleDeleteClick);
    }

    /**
     * Gestisce il click sul pulsante di importazione
     */
    async function handleImportClick(e) {
        e.preventDefault();
        
        if (importState.isRunning) {
            return;
        }

        if (!confirm('Vuoi importare tutti gli instruments dall\'API? I duplicati verranno automaticamente saltati.')) {
            return;
        }

        await startImport();
    }

    /**
     * Avvia l'importazione
     */
    async function startImport() {
        try {
            // Reset stato
            resetImportState();
            updateImportUI('start');
            
            showImportMessage('Avvio importazione instruments dall\'API...', 'info');
            
            // Chiamata all'endpoint di importazione
            const response = await fetch(CONFIG.REST_IMPORT_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': wpApiSettings?.nonce || ''
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP Error: ${response.status}`);
            }

            const result = await response.json();
            
            importState.totalInstruments = result.total_instruments || 0;
            importState.created = result.created || 0;
            importState.skipped = result.skipped || 0;
            importState.errors = result.errors || [];
            
            completeImport(result);
            
        } catch (error) {
            handleImportError(error);
        }
    }

    /**
     * Completa l'importazione
     */
    function completeImport(result) {
        importState.isRunning = false;
        updateImportUI('complete');
        
        let message = `Importazione completata!\n`;
        message += `Instruments totali dall'API: ${result.total_instruments}\n`;
        message += `Instruments creati: ${result.created}\n`;
        message += `Instruments già esistenti (saltati): ${result.skipped}\n`;
        
        if (result.errors && result.errors.length > 0) {
            message += `Errori: ${result.errors.length}`;
            showImportMessage(message, 'warning');
            displayImportErrors(result.errors);
        } else {
            showImportMessage(message, 'success');
        }
        
        // Aggiorna le statistiche
        updateStatistics();
    }

    /**
     * Gestisce gli errori dell'importazione
     */
    function handleImportError(error) {
        importState.isRunning = false;
        updateImportUI('error');
        
        console.error('Errore importazione:', error);
        showImportMessage(`Errore durante l'importazione: ${error.message}`, 'error');
    }

    /**
     * Mostra gli errori di importazione
     */
    function displayImportErrors(errors) {
        if (!errors || errors.length === 0) return;
        
        let errorHtml = '<div class="import-errors" style="margin-top: 20px;">';
        errorHtml += '<h4>Errori durante l\'importazione:</h4>';
        errorHtml += '<ul style="max-height: 200px; overflow-y: auto; border: 1px solid #ccd0d4; padding: 10px; background: #f9f9f9;">';
        
        errors.forEach(error => {
            errorHtml += `<li>${error}</li>`;
        });
        
        errorHtml += '</ul></div>';
        elements.importResult.append(errorHtml);
    }

    /**
     * Reset dello stato dell'importazione
     */
    function resetImportState() {
        importState = {
            isRunning: true,
            totalInstruments: 0,
            created: 0,
            skipped: 0,
            errors: []
        };
    }

    /**
     * Aggiorna l'interfaccia utente per l'importazione
     */
    function updateImportUI(state) {
        switch (state) {
            case 'start':
                elements.importButton.prop('disabled', true).text('Importazione in corso...');
                elements.importProgressContainer.show();
                elements.importProgressBar.css('width', '50%').text('50%');
                break;
                
            case 'complete':
            case 'error':
                elements.importButton.prop('disabled', false).text('Importa tutti gli Instruments');
                elements.importProgressBar.css('width', '100%').text('100%');
                setTimeout(() => {
                    elements.importProgressContainer.hide();
                    elements.importProgressBar.css('width', '0%').text('0%');
                }, 2000);
                break;
        }
    }

    /**
     * Mostra un messaggio nell'area risultati importazione
     */
    function showImportMessage(message, type = 'info') {
        const alertClass = getAlertClass(type);
        const messageHtml = `
            <div class="notice ${alertClass} is-dismissible">
                <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
        `;
        elements.importResult.html(messageHtml);
    }

    // ==================== ELIMINAZIONE ====================

    /**
     * Gestisce il click sul pulsante di eliminazione
     */
    async function handleDeleteClick(e) {
        e.preventDefault();
        
        if (deleteState.isDeleting) {
            return;
        }

        // Doppia conferma per sicurezza
        if (!confirm('ATTENZIONE: Questa operazione eliminerà TUTTI gli instruments dal database.\n\nSei sicuro di voler continuare?')) {
            return;
        }

        if (!confirm('Conferma definitiva: eliminare TUTTI gli instruments?')) {
            return;
        }

        await startDeletion();
    }

    /**
     * Avvia l'eliminazione
     */
    async function startDeletion() {
        try {
            deleteState.isDeleting = true;
            updateDeleteUI('start');
            
            // Prima ottiene il conteggio totale
            const countResponse = await fetch(CONFIG.COUNT_ENDPOINT, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!countResponse.ok) {
                throw new Error('Errore nel recupero del conteggio instruments');
            }

            const countData = await countResponse.json();
            deleteState.totalToDelete = countData.total_count || 0;
            deleteState.remaining = deleteState.totalToDelete;

            if (deleteState.totalToDelete === 0) {
                showDeleteMessage('Nessun instrument da eliminare.', 'info');
                updateDeleteUI('complete');
                return;
            }

            showDeleteMessage(`Trovati ${deleteState.totalToDelete} instruments da eliminare. Avvio eliminazione...`, 'info');

            // Elimina a batch fino a quando non ci sono più instruments
            while (deleteState.remaining > 0 && deleteState.isDeleting) {
                await deleteBatch();
            }

            // Completamento
            completeDeletion();

        } catch (error) {
            handleDeleteError(error);
        }
    }

    /**
     * Elimina un batch di instruments
     */
    async function deleteBatch() {
        try {
            const response = await fetch(CONFIG.DELETE_ENDPOINT, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': wpApiSettings?.nonce || ''
                },
                body: JSON.stringify({
                    confirm: true,
                    batch_size: CONFIG.BATCH_SIZE
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP Error: ${response.status}`);
            }

            const result = await response.json();
            
            deleteState.deleted += result.deleted_in_batch || 0;
            deleteState.remaining = result.remaining_count || 0;
            
            updateDeleteProgress();
            
            // Se l'eliminazione è completata, esce dal loop
            if (result.is_completed) {
                deleteState.remaining = 0;
            }

            // Piccola pausa tra i batch
            await sleep(300);

        } catch (error) {
            throw error;
        }
    }

    /**
     * Completa l'eliminazione
     */
    function completeDeletion() {
        deleteState.isDeleting = false;
        updateDeleteUI('complete');
        
        showDeleteMessage(
            `Eliminazione completata!\nInstruments eliminati: ${deleteState.deleted}`,
            'success'
        );
        
        // Aggiorna le statistiche
        updateStatistics();
    }

    /**
     * Gestisce gli errori dell'eliminazione
     */
    function handleDeleteError(error) {
        deleteState.isDeleting = false;
        updateDeleteUI('error');
        
        console.error('Errore eliminazione:', error);
        showDeleteMessage(`Errore durante l'eliminazione: ${error.message}`, 'error');
    }

    /**
     * Aggiorna la progress bar dell'eliminazione
     */
    function updateDeleteProgress() {
        if (deleteState.totalToDelete === 0) return;
        
        const percentage = Math.round(((deleteState.totalToDelete - deleteState.remaining) / deleteState.totalToDelete) * 100);
        elements.deleteProgressBar.css('width', percentage + '%').text(percentage + '%');
        
        const info = `Eliminati: ${deleteState.deleted}/${deleteState.totalToDelete} - Rimanenti: ${deleteState.remaining}`;
        elements.deleteProgressInfo.text(info);
    }

    /**
     * Aggiorna l'interfaccia utente per l'eliminazione
     */
    function updateDeleteUI(state) {
        switch (state) {
            case 'start':
                elements.deleteButton.prop('disabled', true).text('Eliminazione in corso...');
                elements.deleteProgressContainer.show();
                elements.deleteProgressBar.css('width', '0%').text('0%');
                elements.deleteProgressInfo.text('Preparazione eliminazione...');
                break;
                
            case 'complete':
            case 'error':
                elements.deleteButton.prop('disabled', false).text('Elimina tutti gli Instruments');
                setTimeout(() => {
                    elements.deleteProgressContainer.hide();
                }, 2000);
                break;
        }
    }

    /**
     * Mostra un messaggio nell'area risultati eliminazione
     */
    function showDeleteMessage(message, type = 'info') {
        const alertClass = getAlertClass(type);
        const messageHtml = `
            <div class="notice ${alertClass} is-dismissible">
                <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
        `;
        elements.deleteResult.html(messageHtml);
    }

    // ==================== UTILITIES ====================

    /**
     * Aggiorna le statistiche nella pagina
     */
    async function updateStatistics() {
        try {
            const response = await fetch(CONFIG.COUNT_ENDPOINT, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Errore nel recupero delle statistiche');
            }

            const data = await response.json();
            
            elements.instrumentsPublished.text(data.by_status?.publish || 0);
            elements.instrumentsDraft.text(data.by_status?.draft || 0);
            elements.instrumentsTrash.text(data.by_status?.trash || 0);
            elements.instrumentsTotal.text(data.total_count || 0);
            
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
