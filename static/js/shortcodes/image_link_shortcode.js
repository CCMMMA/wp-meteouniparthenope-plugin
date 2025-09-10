Object.keys(allImageLinkShortcodeData).forEach(function(key) {
    let imageLinkData = allImageLinkShortcodeData[key];
    let shortcode_id = imageLinkData['shortcode_id'];
    
    initializeShortcode(imageLinkData, shortcode_id);
});

function initializeShortcode(imageLinkData, shortcode_id){
    (function($){
        $(document).ready(function(){
            let plotID = imageLinkData['plot_id'];
            let plotDivID = '#plot-container-'+plotID;

            // Aspetta che appaia un'immagine nel tuo div
            waitForChildElement(plotDivID, 'img.meteo-icon')
                .then((container) => {
                    // Qui puoi eseguire il tuo codice
                    const img = container.querySelector('img.meteo-icon');
                    
                    // Se vuoi aspettare anche che l'immagine sia completamente renderizzata:
                    if (img.complete) {
                        // Immagine già caricata
                        createLink($(img));
                    } else {
                        // Aspetta il caricamento completo
                        img.onload = () => createLink($(img));;
                    }
                })
                .catch((error) => {
                    
                });            
        });

        function waitForChildElement(parentSelector, childSelector = null, timeout = 10000) {
            return new Promise((resolve, reject) => {
                const parent = document.querySelector(parentSelector);
                if (!parent) {
                    reject(new Error(`Elemento parent ${parentSelector} non trovato`));
                    return;
                }

                // Controlla se l'elemento figlio è già presente
                const checkChild = () => {
                    if (childSelector) {
                        return parent.querySelector(childSelector) !== null;
                    } else {
                        return parent.children.length > 0;
                    }
                };

                if (checkChild()) {
                    resolve(parent);
                    return;
                }

                // Configura MutationObserver
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList' && checkChild()) {
                            observer.disconnect();
                            resolve(parent);
                        }
                    });
                });

                observer.observe(parent, {
                    childList: true,
                    subtree: true
                });

                // Timeout di sicurezza
                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Timeout: elemento figlio non trovato dopo ${timeout}ms`));
                }, timeout);
            });
        }

        function createLink($img){
            let $plotDiv = $img.parent();
            var plot_link = new URL($img.attr('src'));
            
            const pathParts = plot_link.pathname.split('/');
            const productIndex = pathParts.indexOf('products');
            const forecastIndex = pathParts.indexOf('forecast');
    
            const params = new URLSearchParams(plot_link.search);
            
            let linkParams = {
                product: productIndex !== -1 ? pathParts[productIndex + 1] : null,
                output: params.get('output'),
                date: params.get('date'),
                placeID: forecastIndex !== -1 ? pathParts[forecastIndex + 1] : null
            };

            $.ajax({
                url: `/wp-json/meteounip/v1/places/${linkParams['placeID']}/link`,
                success: function(data){
                    var wpLink = data['link'];
                    var newLink = wpLink + `?id=${linkParams['placeID']}&date=${linkParams['date']}&prod=${linkParams['product']}&output=${linkParams['output']}`;
                    console.log(newLink);
                    
                    $plotDiv.css('cursor', 'pointer').click(function(){
                        window.location.href = newLink;
                    })
                }
            });
        }
    })(jQuery)
}
