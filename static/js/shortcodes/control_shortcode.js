let productsDataFromAPI= null;

let controlDefaultProduct = "wrf5";
let controlDefaultOutput = "gen";

(function($){
    $(document).ready(function() {
        //Function for populating the time select
        function populateTimeSelect() {
            const timeSelect = $('#control-select-time');
            timeSelect.empty();
            
            //Create options from 00:00 to 23:00
            for (let hour = 0; hour < 24; hour++) {
                const hourFormatted = hour.toString().padStart(2, '0');
                const timeValue = hourFormatted + ':00';
                const option = $('<option></option>')
                    .attr('value', timeValue)
                    .text(timeValue);
                timeSelect.append(option);
            }
        }
        
        //Function for setting current date and time
        function setCurrentDateTime() {
            const now = new Date();
            
            //Set the current date
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            const currentDate = `${year}-${month}-${day}`;
            
            $('#control-select-date').val(currentDate);
            
            //Set the current time
            const currentHour = now.getHours().toString().padStart(2, '0');
            const currentTime = currentHour + ':00';
            
            $('#control-select-time').val(currentTime);
        }
        
        //Function to adjust the hours
        function adjustTime(hourDelta) {
            const currentDate = $('#control-select-date').val();
            const currentTime = $('#control-select-time').val();
            
            if (!currentDate || !currentTime) {
                return; //If values are missing, do nothing
            }

            const currentDateTime = new Date(currentDate + 'T' + currentTime + ':00');
            
            //Add/Subtract hours
            currentDateTime.setHours(currentDateTime.getHours() + hourDelta);
            
            //Update fields to new values
            const newYear = currentDateTime.getFullYear();
            const newMonth = (currentDateTime.getMonth() + 1).toString().padStart(2, '0');
            const newDay = currentDateTime.getDate().toString().padStart(2, '0');
            const newDate = `${newYear}-${newMonth}-${newDay}`;
            
            const newHour = currentDateTime.getHours().toString().padStart(2, '0');
            const newTime = newHour + ':00';
            
            $('#control-select-date').val(newDate);
            $('#control-select-time').val(newTime);
            $('#control-select-time').trigger('change');
        }
        
        //Function for create and add hourly buttons - Updated for responsive
        function setupTimeButtons() {
            const $prevButton = $('<button type="button" id="control-prev-hour" class="btn btn-primary btn-time-control">- 1h</button>');
            const $nextButton = $('<button type="button" id="control-next-hour" class="btn btn-primary btn-time-control">+ 1h</button>');

            //Adding event handlers
            $prevButton.on('click', function() {
                adjustTime(-1);
            });
            
            $nextButton.on('click', function() {
                adjustTime(1);
            });
            
            const $timeSelect = $('#control-select-time');
            const $timeContainer = $timeSelect.parent();
            
            // Create a button container for better responsive layout
            const $buttonContainer = $('<div class="time-buttons-container mt-2"></div>');
            $buttonContainer.append($prevButton);
            $buttonContainer.append($nextButton);
            
            $timeContainer.append($buttonContainer);
        }
        
        populateTimeSelect();
        setCurrentDateTime();
        setupTimeButtons();
        
        //Load the product for the current place
        function loadProducts(){
            let $selectProduct = $('#control-select-product');
            
            $.each(controlData['available_products'], function(index, value){
                try{
                    $selectProduct.append(`<option value="${index}">${products[index]['desc'][apiUsageLanguage]}</option>`);
                } catch(err){

                }
            });
            
            //Loading of outputs for default product
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
                error: function (jqXHR, textStatus, errorThrown) {
                    //console.log("Error:"+textStatus);
                }
            })
        }
        getProducts();

        //Function to obtain output of a given product
        function loadOutputs(product){
            let $selectOutput = $('#control-select-output');
            $selectOutput.empty();

            let outputs = product['outputs'];
            $.each(outputs, function(key,value){
                let outputLanguage = value['title'].length < 2 ? 'en-US' : apiUsageLanguage;
                if(key.length <= 3 || key === "mcape"){
                    $selectOutput.append(`<option value="${key}">${value['title'][outputLanguage]}</option>`);
                }
            });
        }

       $('#control-select-product').change(function(){
            let product = this.value;
            loadOutputs(products[product]);
        });

        let nowDate = new Date();
        let maxDate = new Date(nowDate);
        maxDate.setDate(maxDate.getDate() + 6);
        let maxMonth = ((maxDate.getMonth() + 1) < 10 ? '0' + (maxDate.getMonth() + 1) : (maxDate.getMonth() + 1));
        let maxDay = (maxDate.getDate() < 10 ? '0' + maxDate.getDate() : maxDate.getDate());
        let maxDateString = maxDate.getFullYear() + '-' + maxMonth + '-' + maxDay;
        $('#'+controlSelectDate).attr('max', maxDateString);

        let $controlForms = $('.plot-control-forms');
        $controlForms.change(function(){
            const currentDate = $('#control-select-date').val();
            if(currentDate >= maxDateString){
                const currentTime = $('#control-select-time').val();
                if(currentTime === "23:00"){
                    //If the hour is 23:00 and is the last available day for forecasting
                    //  the "next hour" button must be disabled
                    $('#control-next-hour').prop("disabled",true);
                }
                else {
                    $('#control-next-hour').prop("disabled",false);
                }
            }
        });
    });
})(jQuery);