let NEW_CHART_placeID = chartData['place_id'];
let NEW_CHART_longNameIT = chartData['long_name_it'];
let NEW_CHART_chartHours = 0;
let NEW_CHART_chartStep = 1;

let NEW_CHART_loadedChart = {};

let NEW_CHART_defaultChartProduct = "wrf5";
let NEW_CHART_defaultCharOutput = "gen";

(function($){
    $(document).ready(function() {
        let $loadingDiv = $('<div>').attr('class','loading-gif');
        $loadingDiv.attr('id','loading-div');
        let $loadingGif = $('<img>').attr('id','loading-gif');
        $loadingGif.attr('src',METEOUNIP_PLUGIN_LOADING_DIR + "/loading_gif.gif");
        $loadingDiv.addClass('d-flex justify-content-center align-items-center');
        $loadingDiv.css('height', '400px');
        $loadingDiv.append($loadingGif);

        let $chartBox = $('#chart-box');
        $chartBox.append($loadingDiv);
        let $chartBoxCanvaJS = $('#chart-container-canvasDiv');
        
        //url parameters check
        let urlParams = new URLSearchParams(window.location.search);
        let ncepDate = urlParams.has('date') ? urlParams.get('date') : formatDateForMeteoAPI(null,null);
        let product = urlParams.has('prod') ? urlParams.get('prod') : NEW_CHART_defaultChartProduct;
        let output = urlParams.has('output') ? urlParams.get('output') : NEW_CHART_defaultCharOutput;
        let hours = urlParams.has('hours') ? urlParams.get('hours') : 0;
        let step = urlParams.has('step') ? urlParams.get('step') : 1;

        $('.plot-control-forms').on('change',function(){
            // Prima nasconde il canvas e svuota il contenuto
            $chartBoxCanvaJS.hide();
            $chartBoxCanvaJS.empty();
            $loadingDiv.addClass('d-flex justify-content-center align-items-center');
            $loadingDiv.css('height', '400px');
            $loadingDiv.show();
            
            let $selectProduct = $('#control-select-product');
            product = $selectProduct.val();

            let $selectOutput = $('#control-select-output');
            output = $selectOutput.val();
            
            ncepDate = formatDateForMeteoAPI(null,null);
            
            var key = product + "-" + output + "-" + ncepDate;
            
            if(!(key in NEW_CHART_loadedChart)){
                let chartAPIUrl = `${apiProdBaseUrl}/${product}/timeseries/${NEW_CHART_placeID}?date=${ncepDate}&output=${output}&hours=${hours}&step=${step}`;
                console.log("chart url: " + chartAPIUrl);
                $.ajax({
                    url: chartAPIUrl,
                    success: function(data){
                        drawChart(data,product,output,ncepDate);
                    },
                    complete: function(){
                        $loadingDiv.hide();
                        $loadingDiv.attr('class','loading-gif');
                        // Assicurati che il container sia visibile prima di mostrare il chart
                        $chartBoxCanvaJS.show();
                        
                        // Forza il ridimensionamento del chart dopo un breve delay
                        setTimeout(function(){
                            var currentChart = NEW_CHART_loadedChart[key];
                            if(currentChart){
                                currentChart.render();
                            }
                        }, 100);
                    }
                });
            } else {
                // Se il chart è già in cache, lo ri-renderizza
                $loadingDiv.hide();
                $chartBoxCanvaJS.show();
                
                // Assicura che il container abbia le dimensioni corrette
                setTimeout(function(){
                    NEW_CHART_loadedChart[key].render();
                }, 100);
            }
        });
    });

    function drawChart(timeSeriesDataAndMetadata,product,output,ncepDate){
        let chartMetadata = timeSeriesDataAndMetadata['meta-chart'];
        console.log(chartMetadata);
        let title = "Forecast";
        let dataPoints = [];
        let dataPoints2 = [];
        let data=[];
        let axisY=null, axisY2=null;
        let colorSet=null;

        title = chartMetadata['title_chart'];
        if(Object.hasOwn(chartMetadata,'pos_bars')){
            axisY = {
                title: chartMetadata['title_bars'],
                includeZero: false,
                suffix: ` ${extractUnit(chartMetadata['title_bars'])}`
            };
            data.push({
                name: chartMetadata['var_bars'],
                type: "column",
                yValueFormatString: chartMetadata['unit_bars'],
                dataPoints: dataPoints
            });
        }
        if(Object.hasOwn(chartMetadata,'pos_line')){
            axisY2 = {
                title: chartMetadata['title_line'],
                includeZero: false,
                suffix: ` ${extractUnit(chartMetadata['title_line'])}`
            };
            data.push({
                name: chartMetadata['var_line'],
                type: "line",
                axisYType: "secondary",
                yValueFormatString: chartMetadata['unit_line'],
                dataPoints: dataPoints2
            });
        }

        let options= {
            animationEnabled: true,
            theme: "light2",
            title: {
                text: title
            },
            axisX: {
                valueFormatString: "DD MMM, HHZ"
            },
            axisY: axisY,
            axisY2: axisY2,
            // Aggiungi opzioni per il ridimensionamento
            //height: 400, // Altezza fissa
            // Oppure usa responsive
            responsive: true,
            data: data
        };

        // Assicurati che il container sia visibile e abbia dimensioni
        let $container = $('#chart-container-canvasDiv');
        $container.show();
        
        let chart = new CanvasJS.Chart("chart-container-canvasDiv", options);
        
        $.each( timeSeriesDataAndMetadata['timeseries'], function(key, val){
            let date = val.dateTime;
            let year = date.substring(0, 4);
            let month = date.substring(4, 6);
            let day = date.substring(6, 8);
            let hour = date.substring(9, 11);
            let sDateTime = year + "-" + month + "-" + day + "T" + hour + ":00:00Z";

            let dateTime = new Date(sDateTime);
            
            if(Object.hasOwn(chartMetadata,'pos_bars')){
                dataPoints.push({
                    x: dateTime,
                    y: val[ chartMetadata['var_bars'] ],
                    color: chartColorFunctions[ chartMetadata['var_bars'] ] ( val[ chartMetadata['var_bars'] ] )
                });
            }
            if(Object.hasOwn(chartMetadata,'pos_line')){
                dataPoints2.push({
                    x: dateTime,
                    y: val[ chartMetadata['var_line'] ]
                })
            }
        });
        
        // Renderizza il chart dopo un piccolo delay per assicurarsi che il DOM sia pronto
        setTimeout(function(){
            chart.render();
        }, 50);
        
        var key = product + "-" + output + "-" + ncepDate;
        NEW_CHART_loadedChart[key] = chart;
    }

    function formatDateForMeteoAPI(dateValue, timeValue){
        // Se non vengono passati parametri, usa i valori correnti dagli input
        if (!dateValue) {
            dateValue = $('#control-select-date').val();
        }
        if (!timeValue) {
            timeValue = $('#control-select-time').val();
        }
        
        // Verifica che i valori siano validi
        if (!dateValue || !timeValue) {
            console.error('Data o ora non valide');
            return null;
        }
        
        // Estrae anno, mese, giorno dalla data (formato YYYY-MM-DD)
        const dateParts = dateValue.split('-');
        const year = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];
        
        // Estrae l'ora dal tempo (formato HH:MM)
        const timeParts = timeValue.split(':');
        const hour = timeParts[0];
        
        // Compone il formato finale: yyyymmddZhh00
        const formattedDateTime = year + month + day + 'Z' + hour + '00';
        
        return formattedDateTime;
    }

    function extractUnit(str) {
        if (typeof str !== 'string') {
            return null;
        }
        
        // Regex per trovare contenuto tra parentesi tonde o quadre
        // Cerca l'ultima occorrenza per gestire casi con multiple parentesi
        const regex = /[\(\[](.*?)[\)\]]/g;
        let match;
        let lastMatch = null;
        
        // Trova l'ultima occorrenza di parentesi
        while ((match = regex.exec(str)) !== null) {
            lastMatch = match[1].trim();
        }
        
        return lastMatch ? lastMatch : "";
    }

})(jQuery);