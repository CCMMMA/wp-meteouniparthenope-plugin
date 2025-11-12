(function($){
    $(document).ready(function(){
        //PRIMO AVVIO
        var urlParams = null;
        var outputsGivenProduct = {};
        var productFromAPI = {};
        var ajaxLoadProducts = null;
        var maxDateString = null;

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
            maxDate.setDate(maxDate.getDate() + 5);
            let maxMonth = ((maxDate.getMonth() + 1) < 10 ? '0' + (maxDate.getMonth() + 1) : (maxDate.getMonth() + 1));
            let maxDay = (maxDate.getDate() < 10 ? '0' + maxDate.getDate() : maxDate.getDate());
            maxDateString = maxDate.getFullYear() + '-' + maxMonth + '-' + maxDay;
            $('#control-select-date').attr('max', maxDateString);

            let $controlForms = $('.plot-control-forms');
            $controlForms.change(function(){
                const currentDate = $('#control-select-date').val();
                const currentTime = $('#control-select-time').val();
                
                // Disabilita il pulsante +1d se siamo alla data massima
                if(currentDate >= maxDateString){
                    $('#control-next-day').prop("disabled", true);
                } else {
                    $('#control-next-day').prop("disabled", false);
                }
                
                // Disabilita il pulsante +1h se siamo alla data massima e all'ultima ora
                if(currentDate >= maxDateString){
                    if(currentTime === "23:00"){
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
        //Function to adjust the days
        function adjustDay(dayDelta) {
            const currentDate = $('#control-select-date').val();
            const currentTime = $('#control-select-time').val();
            
            if (!currentDate || !currentTime) {
                return; //If values are missing, do nothing
            }

            const currentDateTime = new Date(currentDate + 'T' + currentTime + ':00');
            
            //Add/Subtract days
            currentDateTime.setDate(currentDateTime.getDate() + dayDelta);
            
            //Update fields to new values
            const newYear = currentDateTime.getFullYear();
            const newMonth = (currentDateTime.getMonth() + 1).toString().padStart(2, '0');
            const newDay = currentDateTime.getDate().toString().padStart(2, '0');
            const newDate = `${newYear}-${newMonth}-${newDay}`;
            
            $('#control-select-date').val(newDate);
            $('#control-select-time').trigger('change');
        }
        //Function to set a specific time
        function setTime(timeValue) {
            $('#control-select-time').val(timeValue);
            $('#control-select-time').trigger('change');
        }
        //Function for create and add hourly buttons - Updated for responsive
        function setupTimeButtons() {
            const $prevDayButton = $('<button type="button" id="control-prev-day" class="btn btn-primary">-1d</button>');
            const $prevButton = $('<button type="button" id="control-prev-hour" class="btn btn-primary">-1h</button>');
            const $time00Button = $('<button type="button" id="control-time-00" class="btn btn-primary">00</button>');
            const $time06Button = $('<button type="button" id="control-time-06" class="btn btn-primary">06</button>');
            const $time12Button = $('<button type="button" id="control-time-12" class="btn btn-primary">12</button>');
            const $time18Button = $('<button type="button" id="control-time-18" class="btn btn-primary">18</button>');
            const $nextButton = $('<button type="button" id="control-next-hour" class="btn btn-primary">+1h</button>');
            const $nextDayButton = $('<button type="button" id="control-next-day" class="btn btn-primary">+1d</button>');

            //Adding event handlers
            $prevDayButton.on('click', function() {
                adjustDay(-1);
            });
            
            $prevButton.on('click', function() {
                adjustTime(-1);
            });
            
            $time00Button.on('click', function() {
                setTime('00:00');
            });
            
            $time06Button.on('click', function() {
                setTime('06:00');
            });
            
            $time12Button.on('click', function() {
                setTime('12:00');
            });
            
            $time18Button.on('click', function() {
                setTime('18:00');
            });
            
            $nextButton.on('click', function() {
                adjustTime(1);
            });
            
            $nextDayButton.on('click', function() {
                adjustDay(1);
            });
            
            const $timeSelect = $('#control-select-time');
            const $timeContainer = $timeSelect.parent();
            
            // Create an input-group container for Bootstrap styling consistency
            const $inputGroup = $('<div class="input-group"></div>');
            
            // Layout: [-1d][-1h][00][06]<select>[12][18][+1h][+1d]
            $inputGroup.append($prevDayButton);
            $inputGroup.append($prevButton);
            $inputGroup.append($time00Button);
            $inputGroup.append($time06Button);
            $inputGroup.append($timeSelect);
            $inputGroup.append($time12Button);
            $inputGroup.append($time18Button);
            $inputGroup.append($nextButton);
            $inputGroup.append($nextDayButton);
            
            $timeContainer.html('');
            $timeContainer.append($inputGroup);
        }
        function loadProducts(){
            ajaxLoadProducts = $.ajax({
                url: apiProdBaseUrl,
                success: function(data){
                    productFromAPI = data['products'];
                    let $selectProduct = $('#control-select-product');
                    $.each(controlData['available_products'], function(index, value){
                        try{
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
            if(urlParams.get('prod') in productFromAPI){
                $('#control-select-product option[value='+product+']').prop('selected', true);
                loadOutputs(productFromAPI[urlParams.get('prod')]);
                if(urlParams.get('output') in outputsGivenProduct[urlParams.get('prod')]){
                    setOutput(urlParams.get('output'));
                }
                else{
                    alert("ERROR: Output not allowed for given product");
                }
            }
            else{
                alert("ERROR: Product not allowed for this place");
                $('#control-select-product option[value="wrf5"]').prop('selected', true);
                loadOutputs(productFromAPI['wrf5']);
                setOutput("gen");
            }
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
        //FINE PRIMO AVVIO


        //On changes
        $('#control-select-product').on('change',function(){
            loadOutputs(productFromAPI[$(this).val()]);
            var newProduct = $(this).val();
            urlParams.set('prod',newProduct);
            setOutput('gen');
            urlParams.set('output','gen');
            //$('#control-select-output').trigger('change');
        });

        $('#control-select-output').on('change',function(){
            var newOutput = $(this).val();
            urlParams.set('output',newOutput);
        });

        $('#control-select-date, #control-select-time').on('change',function(){
            var newDateString = DateFormatter.formatFromDateToAPI($('#control-select-date').val(),$('#control-select-time').val());
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