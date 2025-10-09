class ForecastPreview {
    static get defaults() {
        return {
            apiBaseURL: apiBaseUrl,
            place: "it000",
            product: "wrf5",
            output: "gen",
            container_id: -1,
            loadingGifPath: METEOUNIP_PLUGIN_LOADING_DIR+"/loading_gif.gif",
            weatherIconsDirPath: METEOUNIP_PLUGIN_LOADING_DIR
        };
    }

    constructor(options = {}) {
        this.container_id = options.container_id || ForecastPreview.defaults.container_id;
        this.apiBaseURL = options.apiBaseURL || ForecastPreview.defaults.apiBaseURL;
        this.place = options.place || ForecastPreview.defaults.place;
        this.product = options.product || ForecastPreview.defaults.product;
        this.output = options.output || ForecastPreview.defaults.output;
        this.loadingGifPath = options.loadingGifPath || ForecastPreview.defaults.loadingGifPath;
        this.weatherIconsDirPath = options.weatherIconsDirPath || ForecastPreview.defaults.weatherIconsDirPath;

        this.createTable();
    }

    createTable(){
        var self = this;
        var forecastUrl = self.apiBaseURL+"/products/"+self.product+"/forecast/"+self.place;
        jQuery.ajax({
            url: forecastUrl,
            success: function(data){
                let todayForecast = data;
                console.log(todayForecast);
                let weatherIconUrl = self.weatherIconsDirPath;
                
                let $forecastPreviewContainer = jQuery(`#${self.container_id}`);
                
                //Responsive container
                let $responsiveContainer = jQuery('<div>');
                $responsiveContainer.addClass('forecast-responsive-container');
                
                let year = todayForecast['dateTime'].substring(0, 4);
                let month = todayForecast['dateTime'].substring(4, 6);
                let day = todayForecast['dateTime'].substring(6, 8);
                let hour = todayForecast['dateTime'].substring(9, 11);
                let sDateTime = year + "-" + month + "-" + day + "T" + hour + ":00:00Z";
        
                let dateTime = new Date(sDateTime);
        
                let weekDayLabel = DateFormatter.dayOfWeek(todayForecast['dateTime']);
                let monthDay = DateFormatter.monthOfYear(todayForecast['dateTime']) + "-" + todayForecast['dateTime'].substring(6,8);
        
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
                card += '  <span class="forecast-value">' + Math.round(todayForecast['t2c']) + '</span>';
                card += '</div>';
                
                //Wind direction
                card += '<div class="forecast-item">';
                card += '  <span class="forecast-label">Wind Dir</span>';
                card += '  <span class="forecast-value">' + todayForecast['winds'] + '</span>';
                card += '</div>';
                
                //Wind speed
                card += '<div class="forecast-item">';
                card += '  <span class="forecast-label">Wind (kn)</span>';
                card += '  <span class="forecast-value">' + Math.round(todayForecast['ws10n']) + '</span>';
                card += '</div>';
                
                //Rain
                card += '<div class="forecast-item">';
                card += '  <span class="forecast-label">Rain (mm/h)</span>';
                card += '  <span class="forecast-value">' + Math.round(todayForecast['crh']) + '</span>';
                card += '</div>';
                
                //Pressure
                card += '<div class="forecast-item">';
                card += '  <span class="forecast-label">Pressure (hPa)</span>';
                card += '  <span class="forecast-value">' + Math.round(todayForecast['slp']) + '</span>';
                card += '</div>';
                
                //Humidity
                card += '<div class="forecast-item">';
                card += '  <span class="forecast-label">Humidity (%)</span>';
                card += '  <span class="forecast-value">' + Math.round(todayForecast['rh2']) + '</span>';
                card += '</div>';
                
                card += '</div>';
                
                $responsiveContainer.append(card);
                $forecastPreviewContainer.append($responsiveContainer);
            }
        });
    }
}