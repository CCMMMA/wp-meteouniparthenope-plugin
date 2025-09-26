let currentPlotRequest = null;

//Wordpress input
let formButton = 'generate-button';
let controlSelectProductID = 'control-select-product';
let controlSelectOutputID = 'control-select-output';
let controlSelectDate = 'control-select-date';
let controlSelectTime = 'control-select-time';

//Inizialization of all shortcodes
Object.keys(allPlotData).forEach(function(key) {
    let plotData = allPlotData[key];
    let shortcode_id = plotData['shortcode_id'];
    
    initializeShortcode(plotData, shortcode_id);
});

function initializeShortcode(plotData, shortcode_id){
    (function($){
        $(document).ready(function(){
            let completeShortcodeID = shortcode_id ? "plot_shortcode-root-"+shortcode_id : "plot_shortcode-root";
            let $divShortcodeRoot = $('#'+completeShortcodeID);
            
            let $divPlotContainer = $('<div>');
            let divPlotID = shortcode_id ? "plot-container-"+shortcode_id : "plot-container";
            $divPlotContainer.attr('id',divPlotID);
            $divShortcodeRoot.append($divPlotContainer);

            let $loadingDiv = $('<div>').attr('class','loading-gif');
            $loadingDiv.attr('id','loading-div');
            let $loadingGif = $('<img>').attr('id','loading-gif');
            $loadingGif.attr('src',METEOUNIP_PLUGIN_LOADING_DIR + "/loading_gif.gif");
            $loadingDiv.append($loadingGif);
            
            if (plotData['control_forms'] !== "STANDALONE"){
                const queryString = window.location.search;
                const urlParams = new URLSearchParams(queryString);
                if(urlParams.size !== 0){
                    if(urlParams.get('id') !== plotData['place_id']){
                        $.ajax({
                            url: `/wp-json/meteounip/v1/places/${urlParams.get('id')}/link`,
                            success: function(data){
                                var wpLink = data['link'];
                                var newLink = wpLink + `?id=${urlParams.get('id')}&date=${urlParams.get('date')}&prod=${urlParams.get('prod')}&output=${urlParams.get('output')}`;
                                window.location = newLink;
                            }
                        });
                    }
                    plotData['date'] = urlParams.get('date');
                    plotData['product'] = urlParams.get('prod');
                    plotData['output'] = urlParams.get('output');
                }
            }

            switch(plotData['control_forms']){
                case "STANDALONE":{
                    let plotObj = new MeteoPlot({
                        apiBaseURL: apiBaseUrl,
                        place: plotData['place_id'],
                        product: plotData['product'],
                        output: plotData['output'],
                        dateTime: null
                    });
                    
                    $divPlotContainer.append($loadingDiv);
                    
                    $loadingDiv.show();
                    $.ajax({
                        url: plotObj.getImageUrl(),
                        type: 'GET',
                        dataType: 'html',
                        success: function(data){
                            
                        },
                        complete: function() {
                            $loadingDiv.hide();
                            let $plotImg = $('<img>');
                            $plotImg.attr('src', plotObj.getImageUrl());
                            $plotImg.addClass('meteo-icon');
                            $plotImg.addClass('hover-zoom-image');
                            $divPlotContainer.append($plotImg);
                        }
                    });
                    break;
                }
                case "DATE-TIME_ONLY":{
                    let selectedDate = $('#'+controlSelectDate).val();
                    let selectedTime = $('#'+controlSelectTime).val();

                    let plotObj = new MeteoPlot({
                        apiBaseURL: apiBaseUrl,
                        place: plotData['place_id'],
                        product: plotData['product'],
                        output: plotData['output'],
                        dateTime: DateFormatter.formatFromDateToAPI(selectedDate,selectedTime)
                    });

                    $divPlotContainer.empty();
                    $divPlotContainer.append($loadingDiv);
                    
                    $loadingDiv.show();
                    
                    $.ajax({
                        url: plotObj.getImageUrl(),
                        type: 'GET',
                        dataType: 'html',
                        tryCount: 1,
                        retryLimit: 3,
                        retryInterval: 2000,
                        success: function(data){
                            
                        },
                        complete: function() {
                            $loadingDiv.hide();
                            let $plotImg = $('<img>');
                            $plotImg.attr('src', plotObj.getImageUrl());
                            $plotImg.addClass('meteo-icon');
                            $plotImg.addClass('hover-zoom-image');
                            $divPlotContainer.append($plotImg);
                        },
                        error: function(xhr, textStatus, errorThrown){
                            console.log("ERRORE richiesta dati, tentativo "+this.tryCount+"/"+this.retryLimit);
                            this.tryCount++;
                            if (this.tryCount <= this.retryLimit) {
                                var self = this;
                                setTimeout(() =>{
                                    $.ajax(self);
                                },this.retryInterval);
                            }
                            else{
                                $divPlotContainer.append('<p>No data available</p>');
                            }
                        }
                    });
                    $dateSelect = $('#'+controlSelectDate);
                    $timeSelect = $('#'+controlSelectTime);
                    $dateSelect.add($timeSelect).change(function(){
                        selectedDate = $dateSelect.val();
                        selectedTime = $timeSelect.val();
                        let plotObj = new MeteoPlot({
                            apiBaseURL: apiBaseUrl,
                            place: plotData['place_id'],
                            product: plotData['product'],
                            output: plotData['output'],
                            dateTime: DateFormatter.formatFromDateToAPI(selectedDate,selectedTime)
                        });
                        $divPlotContainer.empty();
                        $divPlotContainer.append($loadingDiv);
                        
                        $loadingDiv.show();
                        $.ajax({
                            url: plotObj.getImageUrl(),
                            type: 'GET',
                            dataType: 'html',
                            tryCount: 1,
                            retryLimit: 3,
                            retryInterval: 2000,
                            success: function(data){
                                
                            },
                            complete: function() {
                                $loadingDiv.hide();
                                let $plotImg = $('<img>');
                                $plotImg.attr('src', plotObj.getImageUrl());
                                $plotImg.addClass('meteo-icon');
                                $plotImg.addClass('hover-zoom-image');
                                $divPlotContainer.append($plotImg);
                            },
                            error: function(xhr, textStatus, errorThrown){
                                console.log("ERRORE richiesta dati, tentativo "+this.tryCount+"/"+this.retryLimit);
                                this.tryCount++;
                                if (this.tryCount <= this.retryLimit) {
                                    var self = this;
                                    setTimeout(() =>{
                                        $.ajax(self);
                                    },this.retryInterval);
                                }
                                else{
                                    $divPlotContainer.append('<p>No data available</p>');
                                }
                            }
                        });
                    });
                    break;
                }
                case "FULL":{
                    let $controlForms = $('.plot-control-forms');

                    
                    function initializePlot() {
                        $controlForms.change(function(){
                            let plotPlaceID = plotData['place_id'];
                            let plotProduct = $('#'+controlSelectProductID).val();
                            let plotOutput = $('#'+controlSelectOutputID).val();
                            let dateValue = $('#'+controlSelectDate).val();
                            let timeValue = $('#'+controlSelectTime).val();
                
                            let dateTime = DateFormatter.formatFromDateToAPI(dateValue,timeValue);
                            
                            let plotConstructorParameters = {
                                apiBaseURL: apiBaseUrl,
                                place: plotPlaceID,
                                product: plotProduct,
                                output: plotOutput,
                                dateTime: dateTime
                            };
                            let plotObj = new MeteoPlot(plotConstructorParameters);
                
                            let $plotDiv = plotObj.generatePlotElement();
                
                            let $imageContainerParent = $('#plot-image-container').parent();
                            $imageContainerParent.append($loadingDiv);
                            
                            $loadingDiv.show();
                            $('#plot-image-container').empty();
                            $('#plot-image-container').hide();
                            
                            currentPlotRequest = $.ajax({
                                url: plotObj.getImageUrl(),
                                type: 'GET',
                                dataType: 'html',
                                tryCount: 1,
                                retryLimit: 3,
                                retryInterval: 2000,
                                beforeSend: function(){
                                    if(currentPlotRequest != null){
                                        currentPlotRequest.abort();
                                    }
                                },
                                success: function(data){
                                    
                                },
                                complete: function() {
                                    $('#plot-image-container').append($plotDiv);
                                    $loadingDiv.hide();
                                    $('#plot-image-container').show();
                                },
                                error: function(xhr, textStatus, errorThrown){
                                    console.log("ERRORE richiesta dati, tentativo "+this.tryCount+"/"+this.retryLimit);
                                    this.tryCount++;
                                    if (this.tryCount <= this.retryLimit) {
                                        var self = this;
                                        setTimeout(() =>{
                                            $.ajax(self);
                                        },this.retryInterval);
                                    }
                                    else{
                                        $divPlotContainer.append('<p>No data available</p>');
                                    }
                                }
                            });
                        });
                        
                        // Trigger solo dopo che i prodotti sono caricati
                        $('#'+controlSelectOutputID).trigger('change');
                    }

                    // Aspetta che i prodotti siano caricati
                    function waitForProducts() {
                        if (productsDataFromAPI !== null && $('#'+controlSelectProductID+' option').length > 0) {
                            initializePlot();
                        } else {
                            setTimeout(waitForProducts, 100); // Riprova dopo 100ms
                        }
                    }

                    const queryString = window.location.search;
                    const urlParams = new URLSearchParams(queryString);
                    var date;
                    var time;
                    var product;
                    var output;
                    if(urlParams.size !== 0){
                        if (urlParams.has('date')){
                            var dateAndTime = urlParams.get('date').split("Z");
                            var date = dateAndTime[0];
                            var year = date.substring(0, 4);
                            var month = date.substring(4, 6);
                            var day = date.substring(6, 8);
    
                            var time = dateAndTime[1].substring(0,2) + ":00";
                            //Date and time input
                            $('#'+controlSelectDate).val(`${year}-${month}-${day}`);
                            $('#'+controlSelectTime).val(time);
                        }
                        if(urlParams.has('prod')){
                            //Product input
                            var product = urlParams.get('prod');
                            $('#'+controlSelectProductID).val(product);
                        }
                        if(urlParams.has('output')){
                            //Output input
                            var output = urlParams.get('output');
                            $('#'+controlSelectOutputID).val(output);
                        }
                    }
                    
                    waitForProducts();
                    break;
                }
            }
        });
    })(jQuery);
}
