let NEW_CHART_placeID = chartData['place_id'];
let NEW_CHART_longNameIT = chartData['long_name_it'];
let NEW_CHART_chartHours = 0;
let NEW_CHART_chartStep = 1;

let NEW_CHART_loadedChart = {};

let NEW_CHART_defaultChartProduct = "wrf5";
let NEW_CHART_defaultCharOutput = "gen";

(function($){
    let $loadingDiv;
    let $loadingGif;
    let $chartBox;
    let $chartBoxCanvaJS;

    $(document).ready(function() {
        $(document).on('place.control_forms.loaded',function(){
            $loadingDiv = $('<div>').attr('class','loading-gif');
            $loadingDiv.attr('id','loading-div');
            $loadingGif = $('<img>').attr('id','loading-gif');
            $loadingGif.attr('src',METEOUNIP_PLUGIN_LOADING_DIR + "/loading_gif.gif");
            $loadingDiv.addClass('d-flex justify-content-center align-items-center');
            $loadingDiv.css('height', '400px');
            $loadingDiv.append($loadingGif);
    
            $chartBox = $('#chart-box');
            $chartBox.append($loadingDiv);

            prepareChart();
    
            $('.control-forms').on('change',prepareChart);
        });
    });

    function prepareChart(){
        $chartBoxCanvaJS = $('#chart-container-canvasDiv');

        // Prima nasconde il canvas e svuota il contenuto
        $chartBoxCanvaJS.empty();
        $chartBoxCanvaJS.hide();
        
        $loadingDiv.addClass('d-flex justify-content-center align-items-center');
        $loadingDiv.css('height', '400px');
        $loadingDiv.show();
        
        let $selectProduct = $('#control-select-product');
        var product = $selectProduct.val();

        let $selectOutput = $('#control-select-output');
        var output = $selectOutput.val();
        
        var ncepDate = DateFormatter.formatFromDateToAPI($('#control-select-date').val(),$('#control-select-time').val());

        let $selectHours = $('#control-select-hours');
        var hours = $selectHours.val();

        let $selectStep = $('#control-select-step');
        var step = $selectStep.val();
        
        var key = product + "-" + output + "-" + ncepDate + "-" + hours + "-" + step;
        
        if(!(key in NEW_CHART_loadedChart)){
            let chartTimeseriesAPIUrl = `${apiProdBaseUrl}/${product}/timeseries/${NEW_CHART_placeID}?date=${ncepDate}&hours=${hours}&step=${step}`;
            console.log("chart url: " + chartTimeseriesAPIUrl);
            var ajaxRequestForTimeseries = $.ajax({
                url: chartTimeseriesAPIUrl,
                type: 'GET',
                tryCount: 1,
                retryLimit: 3,
                retryInterval: 2000,
                error: function(xhr, textStatus, errorThrown){
                    console.log("ERRORE 500, tentativo "+this.tryCount+"/"+this.retryLimit);
                    this.tryCount++;
                    if (this.tryCount <= this.retryLimit) {
                        var self = this;
                        setTimeout(() =>{
                            $.ajax(self);
                        },this.retryInterval);
                    }
                    else{
                        $('#chart-container-canvasDiv').append('<p>No data available</p>');
                    }
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
            let chartMetadatasAPIUrl = `${apiProdBaseUrl}/${product}/plot/${output}/metacharts`;
            console.log("chart metadata url: " + chartMetadatasAPIUrl);
            var ajaxRequestForMetadata = $.ajax({
                url: chartMetadatasAPIUrl,
                type: 'GET'
            });

            Promise.all([ajaxRequestForTimeseries,ajaxRequestForMetadata]).then(function(responses){
                var data = {
                    'meta-chart': responses[1]['meta-chart'],
                    'timeseries': responses[0]['timeseries'],
                }
                console.log(data['meta-chart']);
                drawChart(data,product,output,ncepDate);
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
    }

    function drawChart(timeSeriesDataAndMetadata,product,output,ncepDate){
        let chartMetadata = timeSeriesDataAndMetadata['meta-chart'];
        console.log(chartMetadata);
        let title = "Forecast";
        let dataPoints = [];
        let dataPoints2 = [];
        let data=[];
        let axisY=null, axisY2=null;

        title = chartMetadata['title_chart'];
        if(Object.hasOwn(chartMetadata,'pos_bars')){
            axisY = {
                title: chartMetadata['title_bars'],
                minimum: chartMetadata['clevels'][0],
                maximum: chartMetadata['clevels'][ chartMetadata['clevels'].length - 1 ],
                includeZero: false,
                //suffix: (extractUnit(chartMetadata['title_bars']) == "%") ? "" : ` ${extractUnit(chartMetadata['title_bars'])}`,
                //valueFormatString: (extractUnit(chartMetadata['title_bars']) == "%") ? "#%" : chartMetadata['unit_bars'],
                //valueFormatString: chartMetadata['unit_bars']
            };
            data.push({
                name: chartMetadata['var_bars'],
                type: "column",
                //yValueFormatString: (extractUnit(chartMetadata['title_bars']) == "%") ? "#%" : chartMetadata['unit_bars'],
                //yValueFormatString: chartMetadata['unit_bars'],
                dataPoints: dataPoints
            });
        }
        if(Object.hasOwn(chartMetadata,'pos_line')){
            axisY2 = {
                title: chartMetadata['title_line'],
                includeZero: false,
                //suffix: ` ${extractUnit(chartMetadata['title_line'])}`
                minimum: chartMetadata['values_line'][0],
                maximum: chartMetadata['values_line'][ chartMetadata['values_line'].length-1 ]
                //interval: chartMetadata['values_line'][1]-chartMetadata['values_line'][0]
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
                valueFormatString: "DD MMM, HHZ",
                labelAngle: -45
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
                    //color: chartColorFunctions[ chartMetadata['var_bars'] ] ( val[ chartMetadata['var_bars'] ] )
                    color: value2Color( val[ chartMetadata['var_bars'] ], chartMetadata['clevels'], chartMetadata['ccolors'] )
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
})(jQuery);