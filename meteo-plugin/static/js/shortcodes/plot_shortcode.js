let currentPlotRequest = null;

//Input da wordpress
//let shortcode_id = plotData['shortcode_id'];
let formButton = 'generate-button';
let controlSelectProductID = 'control-select-product';
let controlSelectOutputID = 'control-select-output';
let controlSelectDate = 'control-select-date';
let controlSelectTime = 'control-select-time';

// Per ogni shortcode, inizializza separatamente
Object.keys(allPlotData).forEach(function(key) {
    let plotData = allPlotData[key];
    let shortcode_id = plotData['shortcode_id'];
    
    // Il tuo codice di inizializzazione qui, usando plotData e shortcode_id
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
            let hour = new Date().getHours();
            console.log(hour);
            let gif = hour >=7 && hour < 19 ? "day_loading.gif" : "night_loading.gif";
            console.log(gif);
            $loadingGif.attr('src',METEOUNIP_PLUGIN_LOADING_DIR + "/" + gif);
            $loadingDiv.append($loadingGif);

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
                            // Mostra l'immagine
                        },
                        complete: function() {
                            $loadingDiv.hide();
                            let $plotImg = $('<img>');
                            $plotImg.attr('src', plotObj.getImageUrl());
                            $plotImg.attr('class', "meteo-icon");
                            $divPlotContainer.append($plotImg);
                            // Nasconde sempre la GIF, sia in caso di successo che errore
                            //$('#plot-loading').hide();
                            //$('#plot-table-tbody').show();
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
                        success: function(data){
                            // Mostra l'immagine
                        },
                        complete: function() {
                            $loadingDiv.hide();
                            let $plotImg = $('<img>');
                            $plotImg.attr('src', plotObj.getImageUrl());
                            $plotImg.attr('class', "meteo-icon");
                            $divPlotContainer.append($plotImg);
                            // Nasconde sempre la GIF, sia in caso di successo che errore
                            //$('#plot-loading').hide();
                            //$('#plot-table-tbody').show();
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
                            success: function(data){
                                // Mostra l'immagine
                            },
                            complete: function() {
                                $loadingDiv.hide();
                                let $plotImg = $('<img>');
                                $plotImg.attr('src', plotObj.getImageUrl());
                                $plotImg.attr('class', "meteo-icon");
                                $divPlotContainer.append($plotImg);
                                // Nasconde sempre la GIF, sia in caso di successo che errore
                                //$('#plot-loading').hide();
                                //$('#plot-table-tbody').show();
                            }
                        });
                    });
                    break;
                }
                case "FULL":{
                    $('#'+formButton).on('click',function(){
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
                        if (currentPlotRequest && currentPlotRequest.readyState !== 4) {
                            currentPlotRequest.abort();
                        }
                        
                        currentPlotRequest = $.ajax({
                            url: plotObj.getImageUrl(),
                            type: 'GET',
                            dataType: 'html',
                            success: function(data){
                                // Mostra l'immagine
                            },
                            complete: function() {
                                // Nasconde sempre la GIF, sia in caso di successo che errore
                                $('#plot-image-container').append($plotDiv);
                                $loadingDiv.hide();
                                $('#plot-image-container').show();
                            }
                        });
                    });

                    $('#'+formButton).click();
                    break;
                }
            }
        });
    })(jQuery);
}
