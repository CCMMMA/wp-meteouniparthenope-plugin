(function($){
    $(document).ready(function(){
        
        let $controlForms = $('.plot-control-forms');
        $controlForms.change(function(){
            const urlParams = new URLSearchParams(window.location.search);
    
            const baseUrl = window.location.origin + window.location.pathname;
            
            //id parameter
            if(!urlParams.has('id')){
                urlParams.append('id',urlRewritingShortcodeData['place_id']);
            }

            //date parameter
            let $controlSelectDate = $('#control-select-date');
            var date = $controlSelectDate.val();
            let $controlSelectTime = $('#control-select-time');
            var time = $controlSelectTime.val();
            var newDateTime = DateFormatter.formatFromDateToAPI(date,time);
            if(urlParams.has('date')){
                urlParams.set('date',newDateTime);
            }
            else{
                urlParams.append('date',newDateTime);
            }

            //prod parameter
            let $controlSelectProduct = $('#control-select-product');
            var product = $controlSelectProduct.val();
            if(urlParams.has('prod')){
                urlParams.set('prod',product);
            }
            else{
                urlParams.append('prod',product);
            }

            //output parameter
            let $controlSelectOutput = $('#control-select-output');
            var output = $controlSelectOutput.val();
            if(urlParams.has('output')){
                urlParams.set('output',output);
            }
            else{
                urlParams.append('output',output);
            }

            //hours parameter
            //probabile aggiunta di forms per decidere questi due parametri di aggregaazione (hours,step)
            if(urlParams.has('hours')){
                urlParams.set('hours',urlParams.get('hours'));
            }
            else{
                urlParams.append('hours',0);
            }
            
            //step paramter
            //probabile aggiunta di forms per decidere questi due parametri di aggregaazione (hours,step)s
            if(urlParams.has('step')){
                urlParams.set('step',urlParams.get('step'));
            }
            else{
                urlParams.append('step',1);
            }


            const newUrl = baseUrl + '?' + urlParams.toString();
            console.log(newUrl);
            
            //Aggiorna l'URL senza ricaricare la pagina
            window.history.pushState({}, '', newUrl);
        });

    });
})(jQuery)