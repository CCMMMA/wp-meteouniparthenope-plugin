let dateForMeteo = null;

let products = null;

let apiForecastBaseUrl = apiBaseUrl + "/";
let availableForecastLanguages = {en: 'Forecast', it: 'Previsioni'};
let forecastTitle = availableForecastLanguages[language];

let defaultPlace = forecastData['place_id'];
let defaultName = forecastData['long_name_it'];
let defaultProd = "wrf5";
let defaultHours = 0;
let defaultStep = 24;
let defaultType = "daybox";

let currentForecastRequest = null;

let hourlyForecastData = {};

(function($){
    $(document).ready(function(){

        let $loadingDiv = $('<div>').attr('class','loading-gif');
        $loadingDiv.attr('id','loading-div');
        let $loadingGif = $('<img>').attr('id','loading-gif');
        let hour = new Date().getHours();
        
        let gif = hour >=7 && hour < 19 ? "day_loading.gif" : "night_loading.gif";
        
        $loadingGif.attr('src',METEOUNIP_PLUGIN_LOADING_DIR + "/" + gif);
        $loadingDiv.append($loadingGif);

        let $forecastContainerDiv = $('#forecast-box');
        $forecastContainerDiv.append($loadingDiv).show();

        function createForecast(place = defaultPlace, name = defaultName ,prod = defaultProd, hours = defaultHours, step = defaultStep){
            let forecastUrl = apiBaseUrl+"/products/"+prod+"/timeseries/"+place+"?hours="+hours+"&step="+step;
            
            console.log("forecastUrl: " + forecastUrl);

            let timeseriesUrl = apiBaseUrl+"/products/"+prod+"/timeseries/"+forecastData['place_id']+"?hours=0&step=1";
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
                    success: function(data){
                        $loadingDiv.hide();
                        printForecast(data);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {

                    },
                    complete: function(){
                        
                    }
                });
            });
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

            let table = $('<table>');
            table.attr('id','forecast-table');
            table.attr('width',"100%");
            table.attr('cellspacing','0');
            table.attr('cellpadding','0');
            table.attr('border','0');
            
            let $forecastTitleDiv = $('#forecast-box-title');
            let $forecastDiv = $('#forecast-box');
            $forecastTitleDiv.append('<div class="forecast-title">'+forecastData['long_name_it']+'</div>');

            if (prod==="wrf5") {
                if (type == "minibox") {
                    table.append('<tr class="legenda">' +
                        '<td width="60%" colspan="2" valign="top" align="left">Forecast</td>' +
                        '<td width="20%" valign="top" align="center">Wind</td>' +
                        '<td width="20%" valign="top" align="center">Sea</td>' +
                        '</tr>');
                } else if (type == "compactbox") {
                    table.append('<tr class="legenda">' +
                        '<td width="40%" colspan="2">Forecast</td>' +
                        '<td width="20%" colspan="2">Temp</td>' +
                        '<td width="20%">Wind</td>' +
                        '<td width="20%">Sea</td>' +
                        '</tr>');
                } else if (type == "daybox") {
                    table.append('<tr class="legenda">' +
                        '<td width="32%" colspan="2">Forecast</td>' +
                        '<td width="9%" class="tMin">T&nbsp;min &deg;C</td>' +
                        '<td width="9%" class="tMax">T&nbsp;max &deg;C</td>' +
                        '<td width="21%" colspan="2">Wind (kn)</td>' +
                        '<td width="28%">Rain (mm)</td>' +
                        '</tr>');
                } else {
                    table.append('<tr class="legenda">' +
                        '<td width="32%" colspan="2">Forecast</td>' +
                        '<td width="9%" class="press">Press (hPa)</td>' +
                        '<td width="9%" class="temp">Temp &deg;C</td>' +
                        '<td width="21%" colspan="2">Wind (kn)</td>' +
                        '<td width="28%">Rain (mm)</td>' +
                        '</tr>')
                }
            }
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

                if (prod==="wrf5") {
                    if (type == "minibox") {
                        row += '  <td class="forecast-td-data " valign="top" align="center">';
                        row += '    <a class="forecast-link" href="' + val['link'] + '" target="_blank" class="day" title="Meteo ' + forecastData['long_name_it'] + ' - ' + weekDayLabel + ' ' + monthDay + '" >';
                        row += weekDayLabel + "<br/>" + monthDay;
                        row += '    </a>';
                        row += '  </td>';
                        row += '  <td class="forecast-td-data " valign="top" align="center">';
                        row += '      <img class="forecast-image" src="' + wIconUrl + '" width="16" height="16" alt="' + wTextLabel + '" title="' + wTextLabel + '" />';
                        row += '    <br/>' + val['t2c-min'] + '/' + val['t2c-max'];
                        row += '  </td>';
                        row += '  <td class="forecast-td-data "  align="center">';
                        row += '    <img class="forecast-image" src="' + windBarbUrl + '" alt="' + windLabel + '" title="' + windLabel + '" width="16" heigh="16" />';
                        row += '  </td>';
                        row += '  <td class="forecast-td-data "  align="center">';
                        row += '    <img class="forecast-image" src="' + seaWaveUrl + '" alt="' + waveLabel + '" title="' + waveLabel + '" width="16" heigh="16" />';
                        row += '  </td>';
                    } else if (type == "compactbox") {
                        row += '  <td class="forecast-td-data ">'
                        row += '    <a class="forecast-link" href="' + val['link'] + '" target="_blank" class="day" title="Meteo ' + forecastData['long_name_it'] + ' - ' + weekDayLabel + ' ' + monthDay + '" >';
                        row += weekDayLabel + " " + monthDay;
                        row += '    </a>';
                        row += '  </td>';
                        row += '  <td class="forecast-td-data ">';
                        row += '  <img class="forecast-image" src="' + wIconUrl + '" width="16" height="16" alt="' + wTextLabel + '" title="' + wTextLabel + '" />';
                        row += '  </td>';
                        row += '  <td class="forecast-td-data  tmin">' + val['t2c-min'] + '</td>';
                        row += '  <td class="forecast-td-data  tmax">' + val['t2c-max'] + '</td>';
                        row += '  <td class="forecast-td-data ">';
                        row += '    <img class="forecast-image" src="' + windBarbUrl + '" alt="' + windLabel + '" title="' + windLabel + '" width="16" heigh="16" />';
                        row += '  </td>';
                        row += '  <td class="forecast-td-data ">';
                        row += '    <img class="forecast-image" src="' + seaWaveUrl + '" alt="' + waveLabel + '" title="' + waveLabel + '" width="16" heigh="16" />';
                        row += '  </td>';
                    } else if (type == "daybox") {
                        row += '  <td class="forecast-td-data ">'
                        row += '    <a class="forecast-link" href="' + val['link'] + '" target="_blank" class="day" title="Meteo ' + forecastData['long_name_it'] + ' - ' + weekDayLabel + ' ' + monthDay + '" >';
                        row += weekDayLabel + ", " + monthDay;
                        row += '    </a><br/><br/>';

                        row += '<button id="'+val['dateTime']+'-button" class="btn btn-sm btn-primary ml-2" data-toggle="collapse" data-target="#'+val['dateTime']+'-collapse">Show hourly forecast</button>';

                        row += '  <br/></td>';
                        row += '  <td class="forecast-td-data ">';
                        row += '  <img class="forecast-image" src="' + wIconUrl + '" class="weathericon" alt="' + wTextLabel + '" title="' + wTextLabel + '" />';
                        row += '  </td>';
                        row += '  <td class="forecast-td-data  tmin">' + val['t2c-min'] + '</td>';
                        row += '  <td class="forecast-td-data  tmax">' + val['t2c-max'] + '</td>';
                        row += '  <td class="forecast-td-data ">' + val['winds'] + '</td>';
                        row += '  <td class="forecast-td-data ">' + val['ws10n'] + '</td>';
                        row += '  <td class="forecast-td-data ">' + val['crh'] + '</td>';
                    } else {
                        row += '  <td class="forecast-td-data ">'
                        row += '    <a class="forecast-link" href="' + val['link'] + '" target="_blank" class="day" title="Meteo ' + forecastData['long_name_it'] + ' - ' + formatDate(dateTime) + '" >';
                        row += formatDate(dateTime);
                        row += '    </a>';
                        row += '  </td>';
                        row += '  <td class="forecast-td-data ">';
                        row += '  <img class="forecast-image" src="' + wIconUrl + '" class="weathericon" alt="' + wTextLabel + '" title="' + wTextLabel + '" />';
                        row += '  </td>';
                        row += '  <td class="forecast-td-data  press">' + val['slp'] + '</td>';
                        row += '  <td class="forecast-td-data  temp">' + val['t2c'] + '</td>';
                        row += '  <td class="forecast-td-data ">' + val['winds'] + '</td>';
                        row += '  <td class="forecast-td-data ">' + val['ws10n'] + '</td>';
                        row += '  <td class="forecast-td-data ">' + val['crh'] + '</td>';
                    }
                }
                row+='</tr>';
                table.append(row);
                
                let subtable = '<tr class="collapse" id="'+val['dateTime']+'-collapse">';
                subtable += '<td colspan="7">'; // 7 colonne per daybox
                subtable += '<table class="table table-sm table-bordered">';
                subtable += '<thead>' + 
                        '<tr><th>Hour</th><th>Forecast</th><th>T °C</th><th>Wind (kn)</th><th>Rain (mm)</th></tr>' +
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
                        subtable += '<td class="forecast-td-data">'+value['t2c']+'</td>';
                        subtable += '<td class="forecast-td-data">' + value['winds'] + '</td>';
                        subtable += '<td class="forecast-td-data">' + value['crh'] + '</td>';
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
                    if( $this.text() === "Show hourly forecast"){
                        $this.text('Hide');
                    }
                    else{
                        $this.text('Show hourly forecast');
                    }
                });

            });

            $(document).on('click', '.forecast-link', function(e){
                e.preventDefault();
                let obj = fromLinkToObject($(this).attr('href'));
                
                $('#control-select-date').val(obj.date);
                $('#control-select-time').val('00:00');
                $('#control-select-product').val(obj.product);
                $('#control-select-output').val('gen');

                $('#generate-button').click();
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

        createForecast();

        $('#generate-button').on('click',function(){
            let $selectProduct = $('#control-select-product');
            let prod = $selectProduct.val();
            let hours = 0;
            let step = 24;

            let forecastUrl = apiBaseUrl+"/products/"+prod+"/timeseries/"+defaultPlace+"?hours="+hours+"&step="+step;
            
            $.ajax({
                url: forecastUrl,
                type: 'GET',
                dataType: 'json',
                success: function(data){
                    
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    
                },
                complete: function(){
                    
                }
            });
        });
    });
})(jQuery);