//Inizialization of all shortcodes
Object.keys(allForecastPreviewData).forEach(function(key) {
    let forecastData = allForecastPreviewData[key];
    let shortcode_id = forecastData['shortcode_id'];
    
    initializeShortcode(forecastData, shortcode_id);
});

function initializeShortcode(forecastData, shortcode_id){
    let place = forecastData['place_id'];
    let product = forecastData['product'];
    
    (function($){
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
        //console.log(forecastData);
        let forecastUrl = apiBaseUrl+"/products/"+product+"/forecast/"+place;
        $.ajax({
            url: forecastUrl,
            success: function(data){
                let todayForecast = data;
                let weatherIconUrl = forecastData['imagesUrl'];

                //console.log(todayForecast);
                
                let $forecastPreviewContainer = $('#forecast_preview_shortcode-root-'+shortcode_id);
                
                // Creo il wrapper con scroll orizzontale come nel forecast_shortcode
                let $tableContainer = $('<div>');
                $tableContainer.addClass('forecast-table-container');
                $tableContainer.addClass('forecast-preview-container');
                
                let table = $('<table class="forecast-preview-table forecast-table">');
                table.attr('id','forecast-preview-table-'+shortcode_id);
                table.attr('width',"100%");
                table.attr('cellspacing','0');
                table.attr('cellpadding','0');
                table.attr('border','0');
                    
                //$forecastPreviewContainer.append('<div class="forecast-title">'+forecastData['long_name_it']+'</div>');
                
                table.append('<tr class="legenda forecast-preview-tr">' +
                            //'<td width="5%" colspan="2">Forecast</td>' +
                            //'<td width="21%" class="temperature" colspan="2">T &deg;C</td>' +
                            //'<td width="14%" colspan="2">Wind (kn)</td>' +
                            //'<td width="9%">Rain (mm)</td>' +
                            //'<td width="7%">Pressure (hPa)</>'+
                            //'<td width="7%">Humidity (%)</>'+
                            '<td class="forecast-preview-td" colspan="2">Forecast</td>' +
                            '<td class="temperature forecast-preview-td" colspan="2">T &deg;C</td>' +
                            '<td class="forecast-preview-td" colspan="2">Wind (kn)</td>' +
                            '<td class="forecast-preview-td">Rain (mm)</td>' +
                            '<td class="forecast-preview-td">Pressure (hPa)</>'+
                            '<td class="forecast-preview-td">Humidity (%)</>'+
                            '</tr>');
                
                // Aggiungo la tabella al container con scroll e poi al container principale
                $tableContainer.append(table);
                $forecastPreviewContainer.append($tableContainer);
                
                let year = todayForecast['dateTime'].substring(0, 4);
                let month = todayForecast['dateTime'].substring(4, 6);
                let day = todayForecast['dateTime'].substring(6, 8);
                let hour = todayForecast['dateTime'].substring(9, 11);
                let sDateTime = year + "-" + month + "-" + day + "T" + hour + ":00:00Z";
        
                let dateTime = new Date(sDateTime);
        
                let weekDayLabel=dayOfWeek(todayForecast['dateTime']);
                let monthDay=monthOfYear(todayForecast['dateTime']) + "-" + todayForecast['dateTime'].substring(6,8);
        
                let wIconUrl=weatherIconUrl+"/"+todayForecast['icon'];
                let wTextLabel=todayForecast['text'];

                let row='<tr>';
                
                row += '  <td class="forecast-td-data forecast-preview-td">'
                row += '    <p class="day" title="Meteo, ' + weekDayLabel + ' ' + monthDay + '" >';
                row += weekDayLabel + ',<br> ' + monthDay+'<br>';
                row += '    </p>';
                
                row += '  </td>';
                row += '  <td class="forecast-td-data forecast-preview-td">';
                row += '  <img class="forecast-image weathericon" src="' + wIconUrl + '" alt="' + wTextLabel + '" title="' + wTextLabel + '" />';
                row += '  </td>';
                row += '  <td class="forecast-td-data forecast-preview-td tmin">' + todayForecast['t2c-min'] + '</td>';
                row += '  <td class="forecast-td-data forecast-preview-td tmax">' + todayForecast['t2c-max'] + '</td>';
                row += '  <td class="forecast-td-data forecast-preview-td">' + todayForecast['winds'] + '</td>';
                row += '  <td class="forecast-td-data forecast-preview-td">' + todayForecast['ws10n'] + '</td>';
                row += '  <td class="forecast-td-data forecast-preview-td">' + todayForecast['crh'] + '</td>';
                row += '  <td class="forecast-td-data forecast-preview-td">' + todayForecast['slp'] + '</td>';
                row += '  <td class="forecast-td-data forecast-preview-td">' + todayForecast['rh2'] + '</td>';
                row+='</tr>';
                table.append(row);
            }
        });

        
    })(jQuery);
}