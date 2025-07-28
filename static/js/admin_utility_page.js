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

    // Debug - rimuovi in produzione
    console.log('API_BASE:', API_BASE);
    console.log('API_NONCE:', API_NONCE);

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
});