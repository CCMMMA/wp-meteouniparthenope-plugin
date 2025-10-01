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
        
        let forecastUrl = apiBaseUrl+"/products/"+product+"/forecast/"+place;
        $.ajax({
            url: forecastUrl,
            success: function(data){
                let todayForecast = data;
                let weatherIconUrl = forecastData['imagesUrl'];
                
                let $forecastPreviewContainer = $('#forecast_preview_shortcode-root-'+shortcode_id);
                
                //Responsive container
                let $responsiveContainer = $('<div>');
                $responsiveContainer.addClass('forecast-responsive-container');
                
                let year = todayForecast['dateTime'].substring(0, 4);
                let month = todayForecast['dateTime'].substring(4, 6);
                let day = todayForecast['dateTime'].substring(6, 8);
                let hour = todayForecast['dateTime'].substring(9, 11);
                let sDateTime = year + "-" + month + "-" + day + "T" + hour + ":00:00Z";
        
                let dateTime = new Date(sDateTime);
        
                let weekDayLabel = dayOfWeek(todayForecast['dateTime']);
                let monthDay = monthOfYear(todayForecast['dateTime']) + "-" + todayForecast['dateTime'].substring(6,8);
        
                let wIconUrl = weatherIconUrl + "/" + todayForecast['icon'];
                let wTextLabel = todayForecast['text'];

                //Responsive table
                let card = '<div class="forecast-card">';
                
                //Icon and date
                card += '<div class="forecast-item forecast-date-icon">';
                card += '  <div class="forecast-date">';
                card += '    <p class="day" title="Meteo, ' + weekDayLabel + ' ' + monthDay + '">';
                card += weekDayLabel + ',<br>' + monthDay;
                card += '    </p>';
                card += '  </div>';
                card += '  <div class="forecast-icon">';
                card += '    <img class="weathericon" src="' + wIconUrl + '" alt="' + wTextLabel + '" title="' + wTextLabel + '" />';
                card += '  </div>';
                card += '</div>';
                
                //Temperature
                card += '<div class="forecast-item">';
                card += '  <span class="forecast-label">T °C</span>';
                card += '  <span class="forecast-value">' + todayForecast['t2c'] + '</span>';
                card += '</div>';
                
                //Wind direction
                card += '<div class="forecast-item">';
                card += '  <span class="forecast-label">Wind Dir</span>';
                card += '  <span class="forecast-value">' + todayForecast['winds'] + '</span>';
                card += '</div>';
                
                //Wind speed
                card += '<div class="forecast-item">';
                card += '  <span class="forecast-label">Wind (kn)</span>';
                card += '  <span class="forecast-value">' + todayForecast['ws10n'] + '</span>';
                card += '</div>';
                
                //Rain
                card += '<div class="forecast-item">';
                card += '  <span class="forecast-label">Rain (mm)</span>';
                card += '  <span class="forecast-value">' + todayForecast['crh'] + '</span>';
                card += '</div>';
                
                //Pressure
                card += '<div class="forecast-item">';
                card += '  <span class="forecast-label">Pressure (hPa)</span>';
                card += '  <span class="forecast-value">' + todayForecast['slp'] + '</span>';
                card += '</div>';
                
                //Humidity
                card += '<div class="forecast-item">';
                card += '  <span class="forecast-label">Humidity (%)</span>';
                card += '  <span class="forecast-value">' + todayForecast['rh2'] + '</span>';
                card += '</div>';
                
                card += '</div>';
                
                $responsiveContainer.append(card);
                $forecastPreviewContainer.append($responsiveContainer);
            }
        });
    })(jQuery);
}