// File: static/js/admin_utility_page.js

jQuery(document).ready(function($) {
    
    // Verifica che wpApiSettings sia disponibile
    if (typeof wpApiSettings === 'undefined') {
        console.error('wpApiSettings non è definito. Verifica che wp_localize_script sia configurato correttamente.');
        return;
    }
    
    // Configurazione base per le chiamate REST API
    const API_BASE = wpApiSettings.root + 'meteounip/v1/places/';
    const API_NONCE = wpApiSettings.nonce;

    /**
     * Utility function per mostrare loading
     */
    function toggleLoading(button, isLoading) {
        if (isLoading) {
            button.prop('disabled', true);
            button.data('original-text', button.text());
            button.text('Caricamento...');
        } else {
            button.prop('disabled', false);
            button.text(button.data('original-text'));
        }
    }

    /**
     * Aggiunta singolo place
     */
    $('#add-single-place-form').on('submit', function(e) {
        e.preventDefault();
        
        const button = $('#add-single-place-btn');
        const resultDiv = $('#single-place-result');
        const placeData = {
            place_id: $('#place_id').val().trim(),
            // Il nome verrà recuperato dall'API esterna
        };

        // Validazione base
        if (!placeData.place_id) {
            resultDiv.html('<div class="notice-custom notice-error"><p>Place ID è richiesto</p></div>');
            return;
        }

        toggleLoading(button, true);
        resultDiv.empty();

        $.ajax({
            url: API_BASE + 'single',
            method: 'POST',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('X-WP-Nonce', API_NONCE);
            },
            contentType: 'application/json',
            data: JSON.stringify(placeData),
            success: function(response) {
                console.log(response);
                resultDiv.html('<div class="notice-custom notice-success"><p>Place aggiunto con successo!</p></div>');
                // Reset form
                $('#place_id').val('');
                // Aggiorna il contatore se presente
                updatePlaceCount();
            },
            error: function(xhr) {
                let errorMessage = 'Errore durante l\'aggiunta del place';
                
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                
                resultDiv.html(`<div class="notice-custom notice-error"><p>${errorMessage}</p></div>`);
                console.error('Errore API:', xhr.responseJSON);
                
                console.error(xhr);
            },
            complete: function() {
                toggleLoading(button, false);
            }
        });
    });

    /**
     * Aggiorna il contatore dei places
     */
    function updatePlaceCount() {
        // Aggiorna le statistiche tramite REST API
        $.get(wpApiSettings.root + 'wp/v2/place?per_page=1&status=publish,draft,trash,private', function(data, status, xhr) {
            // Fai una chiamata separata per ogni stato per ottenere i conteggi precisi
            updateCountForStatus('publish');
            updateCountForStatus('draft');
            updateCountForStatus('trash');
            updateCountForStatus('private');
        });
    }

    function updateCountForStatus(postStatus) {
        $.get(wpApiSettings.root + 'wp/v2/place?per_page=1&status=' + postStatus, function(data, status, xhr) {
            const count = xhr.getResponseHeader('X-WP-Total') || '0';
            
            switch(postStatus) {
                case 'publish':
                    $('#places-published').text(count);
                    break;
                case 'draft':
                    $('#places-draft').text(count);
                    break;
                case 'trash':
                    $('#places-trash').text(count);
                    break;
                case 'private':
                    // Aggiorna il totale ricalcolandolo
                    updateTotalCount();
                    break;
            }
        });
    }

    function updateTotalCount() {
        const published = parseInt($('#places-published').text()) || 0;
        const draft = parseInt($('#places-draft').text()) || 0;
        const trash = parseInt($('#places-trash').text()) || 0;
        const total = published + draft + trash;
        $('#places-total').text(total);
    }

/**
 * Variabili globali per il tracking della progress bar di eliminazione
 */
let deletionInProgress = false;
let totalPlacesToDelete = 0;
let deletedPlacesCount = 0;

/**
 * Funzione per aggiornare la progress bar di eliminazione
 */
function updateDeleteProgressBar(deleted, total, message = '') {
    const percentage = total > 0 ? Math.round((deleted / total) * 100) : 0;
    const $progressFill = $('#delete-progress-fill');
    const $progressInfo = $('#delete-progress-info');
    
    // Aggiorna la barra visuale
    $progressFill.css('width', percentage + '%');
    $progressFill.text(percentage + '%');
    
    // Aggiorna il messaggio informativo
    let infoText = `Eliminati ${deleted} di ${total} places`;
    if (message) {
        infoText += ` - ${message}`;
    }
    $progressInfo.text(infoText);
    
    // Colore della barra basato sul progresso
    if (percentage < 30) {
        $progressFill.css('background-color', '#e74c3c'); // Rosso
    } else if (percentage < 70) {
        $progressFill.css('background-color', '#f39c12'); // Arancione
    } else if (percentage < 100) {
        $progressFill.css('background-color', '#3498db'); // Blu
    } else {
        $progressFill.css('background-color', '#27ae60'); // Verde
    }
}

/**
 * Funzione ricorsiva per eliminare places a batch
 */
function deletePlacesBatch(offset = 0, batchSize = 10) {
    const $resultDiv = $('#delete-result');
    
    return $.ajax({
        url: API_BASE + 'delete-all',
        method: 'DELETE',
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-WP-Nonce', API_NONCE);
        },
        contentType: 'application/json',
        data: JSON.stringify({
            confirm: true,
            batch_size: batchSize,
            offset: offset
        }),
        success: function(response) {
            console.log('Batch eliminazione completato:', response);
            
            // Aggiorna il conteggio
            deletedPlacesCount += response.deleted_in_batch;
            
            // Aggiorna la progress bar
            const remaining = response.remaining_count || 0;
            const processed = totalPlacesToDelete - remaining;
            updateDeleteProgressBar(processed, totalPlacesToDelete, response.message);
            
            // Se non è completato, continua con il prossimo batch
            if (!response.is_completed && remaining > 0) {
                // Piccolo delay per non sovraccaricare il server
                setTimeout(() => {
                    deletePlacesBatch(response.processed_offset, batchSize)
                        .catch(handleDeleteError);
                }, 100);
            } else {
                // Eliminazione completata!
                completeDeletion(response);
            }
        }
    });
}

/**
 * Gestione del completamento dell'eliminazione
 */
function completeDeletion(response) {
    const $button = $('#delete-all-places-btn');
    const $resultDiv = $('#delete-result');
    const $progressContainer = $('#delete-progress-container');
    const $progressInfo = $('#delete-progress-info');
    
    deletionInProgress = false;
    
    // Messaggio finale
    updateDeleteProgressBar(totalPlacesToDelete, totalPlacesToDelete, 'Completato!');
    $progressInfo.text(`✅ Eliminazione completata! ${totalPlacesToDelete} places eliminati con successo.`);
    
    // Messaggio di successo
    let successMessage = `<strong>Eliminazione completata con successo!</strong><br>`;
    successMessage += `Totale places eliminati: ${totalPlacesToDelete}`;
    
    if (response.errors && response.errors.length > 0) {
        successMessage += `<br><small>Alcuni errori riscontrati: ${response.errors.length}</small>`;
    }
    
    $resultDiv.html(`<div class="notice-custom notice-success"><p>${successMessage}</p></div>`);
    
    // Ripristina il bottone
    toggleLoading($button, false);
    
    // Aggiorna le statistiche
    updatePlaceCount();
    
    // Nascondi la progress bar dopo 3 secondi
    setTimeout(() => {
        $progressContainer.fadeOut('slow');
    }, 3000);
}

/**
 * Gestione degli errori durante l'eliminazione
 */
function handleDeleteError(xhr) {
    const $button = $('#delete-all-places-btn');
    const $resultDiv = $('#delete-result');
    const $progressContainer = $('#delete-progress-container');
    
    deletionInProgress = false;
    
    let errorMessage = 'Errore durante l\'eliminazione dei places';
    
    if (xhr.responseJSON && xhr.responseJSON.message) {
        errorMessage = xhr.responseJSON.message;
    }
    
    $resultDiv.html(`<div class="notice-custom notice-error"><p>${errorMessage}</p></div>`);
    console.error('Errore eliminazione:', xhr.responseJSON || xhr);
    
    // Ripristina il bottone
    toggleLoading($button, false);
    
    // Nascondi la progress bar
    $progressContainer.hide();
}

/**
 * Conteggio places prima dell'eliminazione
 */
function countPlacesForDeletion() {
    return $.ajax({
        url: API_BASE + 'count',
        method: 'GET',
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-WP-Nonce', API_NONCE);
        }
    });
}

/**
 * Event handler principale per l'eliminazione con progress bar
 */
$('#delete-all-places-btn').on('click', function(e) {
    e.preventDefault();
    
    // Previeni doppi click
    if (deletionInProgress) {
        return;
    }
    
    const $button = $(this);
    const $resultDiv = $('#delete-result');
    const $progressContainer = $('#delete-progress-container');
    
    // Conferma dell'utente
    const confirmMessage = 'ATTENZIONE: Questa operazione eliminerà DEFINITIVAMENTE tutti i places dal database.\n\n' +
                          'Questa azione NON PUÒ essere annullata.\n\n' +
                          'Sei sicuro di voler continuare?';
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Doppia conferma per sicurezza
    const doubleConfirm = 'ULTIMA CONFERMA: Stai per eliminare TUTTI i places.\n\n' +
                         'Digitare "ELIMINA" (tutto maiuscolo) per confermare:';
    
    const userInput = prompt(doubleConfirm);
    if (userInput !== 'ELIMINA') {
        $resultDiv.html('<div class="notice-custom notice-info"><p>Operazione annullata dall\'utente.</p></div>');
        return;
    }
    
    // Inizia il processo
    deletionInProgress = true;
    deletedPlacesCount = 0;
    
    toggleLoading($button, true);
    $resultDiv.empty();
    
    // Prima conta i places da eliminare
    countPlacesForDeletion()
        .done(function(countResponse) {
            totalPlacesToDelete = countResponse.total_count;
            
            if (totalPlacesToDelete === 0) {
                $resultDiv.html('<div class="notice-custom notice-info"><p>Nessun place da eliminare.</p></div>');
                toggleLoading($button, false);
                deletionInProgress = false;
                return;
            }
            
            // Mostra la progress bar
            $progressContainer.show();
            updateDeleteProgressBar(0, totalPlacesToDelete, 'Iniziando eliminazione...');
            
            // Inizia l'eliminazione a batch
            deletePlacesBatch(10) // CORREZIONE: Solo batch size, no offset
                .catch(handleDeleteError);
        })
        .fail(function(xhr) {
            handleDeleteError(xhr);
        });
});

/**
 * Funzione di utilità per reset della progress bar (opzionale)
 */
function resetDeleteProgress() {
    $('#delete-progress-container').hide();
    $('#delete-progress-fill').css('width', '0%').text('0%');
    $('#delete-progress-info').text('');
    deletionInProgress = false;
    totalPlacesToDelete = 0;
    deletedPlacesCount = 0;
}
});