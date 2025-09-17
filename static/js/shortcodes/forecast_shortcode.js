let dateForMeteo = null;

let products = null;

let apiForecastBaseUrl = apiBaseUrl + "/";
let availableForecastLanguages = {en: 'Forecast', it: 'Previsioni'};
let forecastTitle = availableForecastLanguages[language];

let defaultPlace = forecastData['place_id'];
let defaultName = forecastData['long_name_it'];
let defaultProd = "wrf5";
let defaultHours = 0;
let defaultStep = 1;
let defaultType = "daybox";

let currentForecastRequest = null;

let hourlyForecastData = {};

(function($){
    $(document).ready(function(){

        let $loadingDiv = $('<div>').attr('class','loading-gif');
        $loadingDiv.attr('id','loading-div');
        let $loadingGif = $('<img>').attr('id','loading-gif');    
        $loadingGif.attr('src',METEOUNIP_PLUGIN_LOADING_DIR + "/loading_gif.gif");
        $loadingDiv.append($loadingGif);

        $('#loading-box').append($loadingDiv).show();

        function createForecast(place = defaultPlace, name = defaultName , forecastDate , prod = defaultProd, hours = defaultHours, step = defaultStep){
            $loadingDiv.show();

            let forecastUrl = apiBaseUrl+"/products/"+prod+"/timeseries/"+place+"?date="+forecastDate+"&hours=0&step=24";
            console.log("forecastUrl: " + forecastUrl);

            let timeseriesUrl = apiBaseUrl+"/products/"+prod+"/timeseries/"+forecastData['place_id']+"?hours="+(hours ? hours : 0)+"&step="+(step ? step : 1);
            console.log("hourly forecst url: "+timeseriesUrl);

            var h24ForecastAJAX = $.ajax({
                url: forecastUrl,
                type: 'GET',
                dataType: 'json',
            });

            var hourlyForecastAJAX = $.ajax({
                url: timeseriesUrl,
                type: 'GET',
                dataType: 'json',
            });

            //Wait until both ajax request are completed
            Promise.all([h24ForecastAJAX, hourlyForecastAJAX]).then(function(forecasts){
                let keyToAppend = null;
                $.each(forecasts[1]['timeseries'], function(key, value){
                    let dateObj = DateFormatter.formatFromAPIToDateObj(value['dateTime']);
                    let hourOfTheDay = dateObj.getHours().toString().padStart(2, '0');
                    if ( hourOfTheDay === "00"){
                        keyToAppend = value['dateTime'];
                        hourlyForecastData[keyToAppend] = [];
                    }
                    hourlyForecastData[keyToAppend].push(value);
                });

                console.log("hourlyForecastData:");
                console.log(hourlyForecastData);
                var forecastTableObj = new ForecastTable();
                forecastTableObj.fillTable(forecasts[0]['timeseries'],hourlyForecastData,prod,step,forecastData['imagesUrl']);
                $loadingDiv.hide();
                let $forecastBox = $('#forecast-box');
                $forecastBox.show();
            });
            
        }

        //Da mettere dentro alla funzione che crea la tabella
        $(document).on('click', '.forecast-link', function(e){
            e.preventDefault();
            let obj = fromLinkToObject($(this).attr('href'));
            
            $('#control-select-date').val(obj.date);
            $('#control-select-time').val('00:00');
            $('#control-select-product').val(obj.product);
            $('#control-select-output').val('gen').trigger('change');
        });

        function fromLinkToObject(link){
            const params = new URLSearchParams(link);
            return {
                product: params.get('product'),
                date: formatDateForInput(params.get('date'))
            };
        };
        function formatDateForInput(dateString) {
            if (!dateString || dateString.length < 8) {
                return null;
            }
            
            const year = dateString.substring(0, 4);
            const month = dateString.substring(4, 6);
            const day = dateString.substring(6, 8);
            
            return `${year}-${month}-${day}`;
        }

        $('.plot-control-forms').change(function(){
            let $forecastBox = $('#forecast-box');
            //console.log($forecastBox);
            $forecastBox.hide();
            $forecastBox.empty();
            //console.log($loadingDiv);
            $loadingDiv.show();

            var date = $('#control-select-date').val();
            date = DateFormatter.formatFromDateToAPI(date,"00:00'");

            var product = $('#control-select-product').val();

            var urlParams = new URLSearchParams(window.location.search);
            var hours = urlParams.get('hours');
            var step = urlParams.get('step');

            createForecast(undefined, undefined, date, product, hours, step);

            //$loadingDiv.hide();
            $forecastBox.show();
        });

        //createForecast();
    });
})(jQuery);