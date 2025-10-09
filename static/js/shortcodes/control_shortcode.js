(function($){
    $(document).ready(function(){
        //PRIMO AVVIO
        var urlParams = null;
        var outputsGivenProduct = {};
        var productFromAPI = {};
        var ajaxLoadProducts = null;
        
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
                .text(hourFormatted);
                timeSelect.append(option);
            }
        }
        function setURLDateTime(dateTimeURLString){
            var dateString = DateFormatter.formatFromAPIToDateString(dateTimeURLString);
            var timeString = DateFormatter.formatFromAPIToTimeString(dateTimeURLString);
            $('#control-select-date').val(dateString);
            $('#control-select-time').val(timeString);
        }
        function setMaxDateFromToday(){
            let nowDate = new Date();
            let maxDate = new Date(nowDate);
            maxDate.setDate(maxDate.getDate() + 6);
            let maxMonth = ((maxDate.getMonth() + 1) < 10 ? '0' + (maxDate.getMonth() + 1) : (maxDate.getMonth() + 1));
            let maxDay = (maxDate.getDate() < 10 ? '0' + maxDate.getDate() : maxDate.getDate());
            let maxDateString = maxDate.getFullYear() + '-' + maxMonth + '-' + maxDay;
            $('#control-select-date').attr('max', maxDateString);

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
            const newTime = (newHour) + ':00';
            
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
        function loadProducts(){
            ajaxLoadProducts = $.ajax({
                url: apiProdBaseUrl,
                success: function(data){
                    productFromAPI = data['products'];
                    let $selectProduct = $('#control-select-product');
                    $.each(controlData['available_products'], function(index, value){
                        try{
                            console.log(productFromAPI[index]);
                            outputsGivenProduct[index] = productFromAPI[index]['outputs'];
                            $selectProduct.append(`<option value="${index}">${productFromAPI[index]['desc'][apiUsageLanguage]}</option>`);
                        } catch(err){
                        }
                    });
                    $(document).trigger('place.products.loaded');
                }
            })
        }
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
        function setProduct(product){
            $('#control-select-product option[value='+product+']').prop('selected', true);
            loadOutputs(productFromAPI[urlParams.get('prod')]);
            setOutput(urlParams.get('output'));
        }
        function setOutput(output){
            $('#control-select-output option[value='+output+']').prop('selected', true);
        }
        function setHours(hours){
            $('#control-select-hours option[value='+hours+']').prop('selected', true);
        }
        function setStep(step){
            $('#control-select-step option[value='+step+']').prop('selected', true);
        }
        
        populateTimeSelect();
        setMaxDateFromToday();
        setupTimeButtons();
        loadProducts();
        
        $(document).on('place.url.loaded', function() {
            Promise.all([ajaxLoadProducts]).then(function(requests){
                urlParams = new URLSearchParams(window.location.search);
                setURLDateTime(urlParams.get('date'));
                setProduct(urlParams.get('prod'));
                setHours(urlParams.get('hours'));
                setStep(urlParams.get('step'));
                $(document).trigger('place.control_forms.loaded', { 
                    message: 'New URL loaded',
                    timestamp: Date.now()
                });
            });
        });

        //FINE PRIMO AVVIO


        //On changes
        $('#control-select-product').on('change',function(){
            loadOutputs(productFromAPI[$(this).val()]);
            var newProduct = $(this).val();
            urlParams.set('prod',newProduct);
            $('#control-select-output').trigger('change');
        });

        $('#control-select-output').on('change',function(){
            var newOutput = $(this).val();
            urlParams.set('output',newOutput);
        });

        $('#control-select-date, #control-select-time').on('change',function(){
            var newDateString = DateFormatter.formatFromDateToAPI($('#control-select-date').val(),$('#control-select-time').val());
            console.log(newDateString);
            urlParams.set('date',newDateString);
        });

        $('#control-select-hours').on('change',function(){
            var newHours = $(this).val();
            urlParams.set('hours',newHours);
        });

        $('#control-select-step').on('change',function(){
            var newStep = $(this).val();
            urlParams.set('step',newStep);
        });

        $('.control-forms').on('change',function(){
            var baseUrl = window.location.origin + window.location.pathname;
            const newUrl = baseUrl + '?' + urlParams.toString();
            window.history.pushState({}, '', newUrl);
        });
    });
})(jQuery);