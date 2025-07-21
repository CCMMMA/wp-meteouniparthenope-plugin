let productsDataFromAPI= null;

let controlDefaultProduct = "wrf5";
let controlDefaultOutput = "gen";

(function($){
    $(document).ready(function() {
        // Funzione per popolare la select delle ore
        function populateTimeSelect() {
            const timeSelect = $('#control-select-time');
            timeSelect.empty(); // Pulisce eventuali opzioni esistenti
            
            // Crea le opzioni dalle 00:00 alle 23:00
            for (let hour = 0; hour < 24; hour++) {
                const hourFormatted = hour.toString().padStart(2, '0');
                const timeValue = hourFormatted + ':00';
                const option = $('<option></option>')
                    .attr('value', timeValue)
                    .text(timeValue);
                timeSelect.append(option);
            }
        }
        
        // Funzione per impostare data e ora correnti
        function setCurrentDateTime() {
            const now = new Date();
            
            // Imposta la data corrente nel campo date
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            const currentDate = `${year}-${month}-${day}`;
            
            $('#control-select-date').val(currentDate);
            
            // Imposta l'ora corrente nella select
            const currentHour = now.getHours().toString().padStart(2, '0');
            const currentTime = currentHour + ':00';
            
            $('#control-select-time').val(currentTime);
        }
        
        // Inizializza tutto
        populateTimeSelect();
        setCurrentDateTime();
        
        //Carica i prdodtti per questo place
        function loadProducts(){
            let $selectProduct = $('#control-select-product');
            
            $.each(controlData['available_products'], function(index, value){
                try{
                    $selectProduct.append(`<option value="${index}">${products[index]['desc'][apiUsageLanguage]}</option>`);
                } catch(err){

                }
            });
            
            //Caricamento degli output del product di default
            let defaultProduct = $selectProduct.children(':first').val();
            loadOutputs(products[defaultProduct]);
        }
        function getProducts(){
            $.ajax({
                url: apiProdBaseUrl,
                type: 'GET',
                dataType: 'json',
                success: function(data){
                    productsDataFromAPI = data;
                    products = productsDataFromAPI['products'];
                    loadProducts();
                    $('#control-select-product option[value='+controlDefaultProduct+']').prop('selected', true);
                    console.log("Valore di default product: "+$('#control-select-product').val());
                    loadOutputs(products[controlDefaultProduct]);
                    $('#control-select-output option[value='+controlDefaultOutput+']').prop('selected', true);
                    console.log("Valore di default output: "+$('#control-select-output').val());
                },
                error: function (  jqXHR,  textStatus,  errorThrown) {
                    //console.log("Error:"+textStatus);
                }

            })
        }
        getProducts();

        //Funzione per ottenere gli output di un dato prodotto
        function loadOutputs(product){
            let $selectOutput = $('#control-select-output');
            $selectOutput.empty();

            let outputs = product['outputs'];
            $.each(outputs, function(key,value){
                let outputLanguage = value['title'].length < 2 ? 'en-US' : apiUsageLanguage;
                $selectOutput.append(`<option value="${key}">${value['title'][outputLanguage]}</option>`);
            });
        }

       $('#control-select-product').change(function(){
            let product = this.value;
            loadOutputs(products[product]);
        });
    });
})(jQuery);
