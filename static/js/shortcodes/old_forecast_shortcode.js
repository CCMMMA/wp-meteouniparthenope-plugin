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

        //let $forecastTitleDiv = $('#forecast-box-title');
        //$forecastTitleDiv.append('<div class="forecast-title">'+forecastData['long_name_it']+'</div>');

        function createForecast(place = defaultPlace, name = defaultName , forecastDate , prod = defaultProd, hours = defaultHours, step = defaultStep){
            $loadingDiv.show();
            //var urlParams = new URLSearchParams(window.location.search);
            //var date = urlParams.get('date').substring(0,8);
            //console.log("forecast date: "+date);
            let forecastUrl = apiBaseUrl+"/products/"+prod+"/timeseries/"+place+"?date="+forecastDate+"&hours=0&step=24";
            
            console.log("forecastUrl: " + forecastUrl);

            let timeseriesUrl = apiBaseUrl+"/products/"+prod+"/timeseries/"+forecastData['place_id']+"?hours="+(hours ? hours : 0)+"&step="+(step ? step : 1);
            $.getJSON(timeseriesUrl, function(data){
                let keyToAppend = null;
                $.each(data['timeseries'], function(key, value){
                    let dateObj = DateFormatter.formatFromAPIToDateObj(value['dateTime']);
                    let hourOfTheDay = dateObj.getHours().toString().padStart(2, '0');
                    if ( hourOfTheDay === "00"){
                        keyToAppend = value['dateTime'];
                        hourlyForecastData[keyToAppend] = [];
                    }
                    hourlyForecastData[keyToAppend].push(value);

                });
                $.ajax({
                    url: forecastUrl,
                    type: 'GET',
                    dataType: 'json',
                    tryCount: 0,
                    retryLimit: 3,
                    firstTry: true,
                    success: function(data){
                        printForecast(data);
                        $loadingDiv.hide();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        if(textStatus == "timeout"){
                            this.tryCount++;
                            if(this.tryCount <= this.retryLimit){
                                $.ajax(this);
                                return;
                            }
                            return;
                        }
                        if (jqXHR.status == 500 && this.firstTry){
                            console.log("BAD REQUEST,retry for getting forecast");
                            this.firstTry = false;
                            $.ajax(this);
                        }
                    },
                    complete: function(){

                    }
                });
            });
            //$loadingDiv.hide();
        }
        function printForecast(data){
            let timeseriesData = data['timeseries'];
            let weatherIconUrl = forecastData['imagesUrl'];
            
            let type = defaultType;
            let prod = defaultProd;
            
            step=1;
            if (type == "minibox" || type == "compactbox" || type == "daybox") {
                step=24;
            }

            let table = $('<table class="forecast-table">');
            table.attr('id','forecast-table');
            table.attr('width',"100%");
            table.attr('cellspacing','0');
            table.attr('cellpadding','0');
            table.attr('border','0');
            
            let $forecastDiv = $('#forecast-box');
            
            table.append('<tr class="legenda">' +
                        //'<td width="5%" colspan="2">Forecast</td>' +
                        //'<td width="21%" class="temperature" colspan="2">T &deg;C</td>' +
                        //'<td width="14%" colspan="2">Wind (kn)</td>' +
                        //'<td width="9%">Rain (mm)</td>' +
                        //'<td width="7%">Pressure (hPa)</>'+
                        //'<td width="7%">Humidity (%)</>'+
                        '<td colspan="2">Forecast</td>' +
                        '<td class="temperature" colspan="2">T &deg;C</td>' +
                        '<td colspan="2">Wind (kn)</td>' +
                        '<td>Rain (mm)</td>' +
                        '<td>Pressure (hPa)</>'+
                        '<td>Humidity (%)</>'+
                        '</tr>');
            $forecastDiv.append(table);

            $.each( timeseriesData, function( key, val ) {
                let year = val['dateTime'].substring(0, 4);
                let month = val['dateTime'].substring(4, 6);
                let day = val['dateTime'].substring(6, 8);
                let hour = val['dateTime'].substring(9, 11);
                let sDateTime = year + "-" + month + "-" + day + "T" + hour + ":00:00Z";

                let dateTime = new Date(sDateTime);

                let weekDayLabel=dayOfWeek(val['dateTime']);
                let monthDay=monthOfYear(val['dateTime']) + "-" + val['dateTime'].substring(6,8);

                let wIconUrl=weatherIconUrl+"/"+val['icon'];
                let wTextLabel=val['text'];

                let windLabel="";
                let windBarbUrl="";

                let seaWaveUrl="";
                let waveLabel="";

                let row='<tr>';
                
                row += '  <td class="forecast-td-data ">'
                row += '    <a class="forecast-link" href="' + val['link'] + '" target="_blank" class="day" title="Meteo ' + forecastData['long_name_it'] + ' - ' + weekDayLabel + ' ' + monthDay + '" >';
                row += weekDayLabel + ',<br> ' + monthDay+'<br>';
                row += '    </a>';

                row += '<button id="'+val['dateTime']+'-button" class="btn btn-sm btn-primary ml-2" data-toggle="collapse" data-target="#'+val['dateTime']+'-collapse">+</button>';
                
                row += '  </td>';
                row += '  <td class="forecast-td-data ">';
                row += '  <img class="forecast-image" src="' + wIconUrl + '" class="weathericon" alt="' + wTextLabel + '" title="' + wTextLabel + '" />';
                row += '  </td>';
                row += '  <td class="forecast-td-data  tmin">' + val['t2c-min'] + '</td>';
                row += '  <td class="forecast-td-data  tmax">' + val['t2c-max'] + '</td>';
                row += '  <td class="forecast-td-data ">' + val['winds'] + '</td>';
                row += '  <td class="forecast-td-data ">' + val['ws10n'] + '</td>';
                row += '  <td class="forecast-td-data ">' + val['crh'] + '</td>';
                row += '  <td class="forecast-td-data ">' + val['slp'] + '</td>';
                row += '  <td class="forecast-td-data ">' + val['rh2'] + '</td>';
                row+='</tr>';
                table.append(row);
                
                let subtable = '<tr class="collapse" id="'+val['dateTime']+'-collapse">';
                subtable += '<td colspan="9">';
                subtable += '<table class="table table-bordered table-striped table-responsive">';
                subtable += '<thead>' + 
                        '<tr><th>Hour</th><th>Forecast</th><th>T °C</th><th colspan=2>Wind (kn)</th><th>Rain (mm)</th><th>Pressure (hPa)</th><th>Humidity (%)</th></tr>' +
                        '</thead>' +
                        '<tbody>';

                if (hourlyForecastData[val['dateTime']] && hourlyForecastData[val['dateTime']].length > 0) {
                    $.each(hourlyForecastData[val['dateTime']], function(key, value){
                        let subTableHour = DateFormatter.formatFromAPIToDateObj(value['dateTime']).getHours().toString().padStart(2, '0');
                        let wIconUrl = weatherIconUrl + "/" + value['icon'];
                        let wTextLabel = value['text'];
                        subtable += '<tr>'
                        subtable += '<td class="forecast-td-data">'+subTableHour+':00</td>';
                        subtable += '<td class="forecast-td-data">';
                        subtable += '<img class="forecast-image" src="' + wIconUrl + '" class="weathericon" alt="' + wTextLabel + '" title="' + wTextLabel + '" />';
                        subtable += '</td>';
                        subtable += '<td class="forecast-td-data">'+ value['t2c'] +'</td>';
                        subtable += '<td class="forecast-td-data">' + value['winds'] + '</td>';
                        subtable += '<td class="forecast-td-data ">' + val['ws10n'] + '</td>';
                        subtable += '<td class="forecast-td-data">' + value['crh'] + '</td>';
                        subtable += '<td class="forecast-td-data">' + value['slp'] + '</td>';
                        subtable += '<td class="forecast-td-data">' + value['rh2'] + '</td>';
                        subtable += '</tr>';
                    });
                } else {
                    subtable += '<tr><td colspan="5" class="text-center">Nessun dato orario disponibile</td></tr>';
                }

                subtable += "</tbody>";
                subtable += "</table>";
                subtable += "</td>";
                subtable += "</tr>";
                
                table.append(subtable);

                $('[data-toggle="collapse"]').on('click', function(e) {
                    e.preventDefault();
                    let target = $(this).data('target');
                    $(target).collapse('toggle');
                });

                $('#'+val['dateTime']+'-button').on('click', function () {
                    let $this = $(this);
                    if( $this.text() === "+"){
                        $this.text('-');
                    }
                    else{
                        $this.text('+');
                    }
                });

            });

            $(document).on('click', '.forecast-link', function(e){
                e.preventDefault();
                let obj = fromLinkToObject($(this).attr('href'));
                
                $('#control-select-date').val(obj.date);
                $('#control-select-time').val('00:00');
                $('#control-select-product').val(obj.product);
                $('#control-select-output').val('gen').trigger('change');
            });
        }

        function dayOfWeek(date) {
            let year = date.substring(0, 4);
            let month = date.substring(4, 6);
            let day = date.substring(6, 8);

            let dayOfWeek = new Date(year + "-" + month + "-" + day).getDay();
            return isNaN(dayOfWeek) ? null : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
        };
        function monthOfYear(date) {
            let month = parseInt(date.substring(4, 6)) - 1;
            
            return isNaN(month) ? null : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month];
        };
        function formatDate(date) {
            let hours = date.getHours();
            let minutes = date.getMinutes();
            minutes = minutes < 10 ? '0'+minutes : minutes;
            let strTime = hours + ':' + minutes;
            return  date.getDate()+ "/" + (date.getMonth()+1)+ "/" + date.getFullYear() + "  " + strTime;
        };
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

            var urlParams = new URLSearchParams(window.location.search);
            var hours = urlParams.get('hours');
            var step = urlParams.get('step');

            createForecast(undefined, undefined, date, undefined, hours, step);

            //$loadingDiv.hide();
            $forecastBox.show();
        });

        //createForecast();
    });
})(jQuery);