(function($){
    $(document).ready(function(){
        
        let $controlForms = $('.plot-control-forms');
        $controlForms.change(function(){
            const urlParams = new URLSearchParams();
    
            const baseUrl = window.location.origin + window.location.pathname;
            
            //id parameter
            urlParams.append('id',urlRewritingShortcodeData['place_id']);

            //date parameter
            let $controlSelectDate = $('#control-select-date');
            var date = $controlSelectDate.val();
            let $controlSelectTime = $('#control-select-time');
            var time = $controlSelectTime.val();
            var newDateTime = DateFormatter.formatFromDateToAPI(date,time);
            urlParams.append('date',newDateTime);

            //prod parameter
            let $controlSelectProduct = $('#control-select-product');
            var product = $controlSelectProduct.val();
            urlParams.append('prod',product);

            //output parameter
            let $controlSelectOutput = $('#control-select-output');
            var output = $controlSelectOutput.val();
            urlParams.append('output',output);

            const newUrl = baseUrl + '?' + urlParams.toString();
            console.log(newUrl);
            
            //Aggiorna l'URL senza ricaricare la pagina
            window.history.pushState({}, '', newUrl);

        });

    });
})(jQuery)