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
        $loadingDiv.append($loadingGif);

        let $chartBoxCanvaJS = $('#chart-container-canvasDiv');
        $chartBoxCanvaJS.append($loadingDiv);
        let product = NEW_CHART_defaultChartProduct;
        let output = NEW_CHART_defaultCharOutput;
        let ncepDate = formatDateForMeteoAPI(null,null);

        let chartAPIUrl = `${apiProdBaseUrl}/${product}/timeseries/${NEW_CHART_placeID}?output=${output}`;
        console.log(chartAPIUrl);
        $.ajax({
            url: chartAPIUrl,
            success: function(data){
                drawChart(data,product,output,ncepDate);
                $loadingDiv.hide();
                $('#chart-box').show();
            }
        });

        $('.plot-control-forms').on('change',function(){
            $chartBoxCanvaJS.empty();
            
            let $selectProduct = $('#control-select-product');
            product = $selectProduct.val();

            let $selectOutput = $('#control-select-output');
            output = $selectOutput.val();
            
            ncepDate = formatDateForMeteoAPI(null,null);
            
            $loadingDiv.show();
            var key =  product + "-" + output + "-" + ncepDate;
            if( !(key in NEW_CHART_loadedChart)){
                let chartAPIUrl = `${apiProdBaseUrl}/${product}/timeseries/${NEW_CHART_placeID}?output=${output}`;
                console.log(chartAPIUrl);
                $.ajax({
                    url: chartAPIUrl,
                    success: function(data){
                        drawChart(data,product,output,ncepDate);
                        $loadingDiv.hide();
                        $('#chart-box').show();
                    }
                });
            }
            else{
                NEW_CHART_loadedChart[key].render();
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

            data: data
        };

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
        chart.render();
        var key =  product + "-" + output + "-" + ncepDate;
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