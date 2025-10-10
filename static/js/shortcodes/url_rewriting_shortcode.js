(function($){
    $(document).ready(function(){
        var urlParams = new URLSearchParams(window.location.search);
        var baseUrl = window.location.origin + window.location.pathname;

        //Primo avvio
        //id parameter
        if(!urlParams.has('place_id')){
            urlParams.append('place_id',urlRewritingShortcodeData['place_id']);
        }
        else{
            console.log("CONFRONTO URL");
            console.log(urlParams.get('place_id')+"!=="+urlRewritingShortcodeData['place_id']);
            
            if(urlParams.get('place_id') !== urlRewritingShortcodeData['place_id']){
                console.log("DIVERSO");
                
                jQuery.ajax({
                    url: `/wp-json/meteounip/v1/places/${urlParams.get('place_id')}/link`,
                    success: function(data){
                        var wpLink = data['link'];
                        var newLink = wpLink + `?place_id=${urlParams.get('place_id')}`;
                        window.location.href = newLink;
                    },
                    error: function(){
                        alert("ERROR: Incorrect place id or place not registered, redirect not performed");
                    }
                });
            }
            else{
                console.log("UGUALE");
            }
        }

        //date parameter
        if(!urlParams.has('date')){
            var newDateTime = DateFormatter.formatFromDateUTCObjToAPI(new Date());
            urlParams.append('date',newDateTime);
        }
        
        //product
        if(!urlParams.has('prod')){
            urlParams.append('prod',METEOUNIP_PLUGIN_DEFAULT_PRODUCT);
        }

        //output
        if(!urlParams.has('output')){
            urlParams.append('output',METEOUNIP_PLUGIN_DEFAULT_OUTPUT);
        }

        //hours
        if(!urlParams.has('hours')){
            urlParams.append('hours',METEOUNIP_PLUGIN_DEFAULT_HOURS);
        }

        //step
        if(!urlParams.has('step')){
            urlParams.append('step',METEOUNIP_PLUGIN_DEFAULT_STEP);
        }

        const newUrl = baseUrl + '?' + urlParams.toString();
        console.log("new url: " + newUrl);
        
        //Aggiorna l'URL senza ricaricare la pagina
        window.history.pushState({}, '', newUrl);

        $(document).trigger('place.url.loaded', { 
            message: 'New URL loaded',
            timestamp: Date.now()
        });
    });
})(jQuery)