class InstrumentLivePreview {
    static get defaults() {
        return {
            instrument_id: "it_uniparthenope_meteo_ws1",
            container_id: -1,
            apiBaseURL: apiBaseUrl,
            loadingGifPath: METEOUNIP_PLUGIN_LOADING_DIR + "/loading_gif.gif"
        };
    }

    constructor(options = {}) {
        this.instrument_id = options.instrument_id || InstrumentLivePreview.defaults.instrument_id;
        this.container_id = options.container_id || InstrumentLivePreview.defaults.container_id;
        this.apiBaseURL = options.apiBaseURL || InstrumentLivePreview.defaults.apiBaseURL;
        this.loadingGifPath = options.loadingGifPath || InstrumentLivePreview.defaults.loadingGifPath;

        this.createTable();
    }

    createTable() {
        var self = this;
        var previewUrl = `${self.apiBaseURL}/instruments/${self.instrument_id}`;

        jQuery.ajax({
            url: previewUrl,
            success: function (data) {
                try{
                    let instrumentData = data;
                    console.log(instrumentData);
    
                    let $previewContainer = jQuery(`#${self.container_id}`);
    
                    // Responsive container
                    let $responsiveContainer = jQuery('<div>');
                    $responsiveContainer.addClass('forecast-responsive-container');
    
                    // Extract values
                    let stationName = instrumentData['name']['value'];

                    let relativeHumidity = instrumentData['environment']['outside']['relativeHumidity']['value'];

                    let temperature = instrumentData['environment']['outside']['temperature']['value'];

                    //let rainRate = instrumentData['environment']['rain']['rate']['value'];
                    let rainRate = instrumentData['environment']['rain']['day']['value'];

                    //let windDirectionTrue = instrumentData['environment']['wind']['directionTrue']['value'];
                    let windDirectionTrue = instrumentData['environment']['wind']['angleApparent']['value'];

                    //let windSpeedTrue = instrumentData['environment']['wind']['speedTrue']['value'];
                    let windSpeedTrue = instrumentData['environment']['wind']['speedApparent']['value'];

                    //let timestamp = instrumentData['environment']['outside']['temperature']['timestamp'];
                    let timestamp = instrumentData['environment']['outside']['temperature']['value'];
    
                    // Unit conversions
                    let temperatureCelsius = (temperature - 273.15).toFixed(1);           // K → °C
                    let humidityPercent = (relativeHumidity * 100).toFixed(0);            // ratio → %
                    let windDirectionDeg = (windDirectionTrue * (180 / Math.PI)).toFixed(0); // rad → deg
                    let windSpeedKnots = (windSpeedTrue * 1.94384).toFixed(1);            // m/s → kn
                    let windDirectionLabel = InstrumentLivePreview.degToCompass(parseFloat(windDirectionDeg));
    
                    // Format timestamp
                    let dateObj = new Date(timestamp);
                    let formattedDate = dateObj.toLocaleDateString('it-IT', {
                        weekday: 'short',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    let formattedTime = dateObj.toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
    
                    // Build card
                    let card = '<div class="forecast-card">';
    
                    // Station name and date
                    card += '<div class="forecast-item forecast-date-icon">';
                    card += '  <div class="forecast-date">';
                    card += '    <p class="day" title="Stazione: ' + stationName + '">';
                    card += stationName + ',<br>' + formattedDate + '<br>' + formattedTime;
                    card += '    </p>';
                    card += '  </div>';
                    card += '</div>';
    
                    // Temperature
                    card += '<div class="forecast-item">';
                    card += '  <span class="forecast-label">T °C</span>';
                    card += '  <span class="forecast-value">' + temperatureCelsius + '</span>';
                    card += '</div>';
    
                    // Relative Humidity
                    card += '<div class="forecast-item">';
                    card += '  <span class="forecast-label">Humidity (%)</span>';
                    card += '  <span class="forecast-value">' + humidityPercent + '</span>';
                    card += '</div>';
    
                    // Wind Direction
                    card += '<div class="forecast-item">';
                    card += '  <span class="forecast-label">Wind Dir</span>';
                    card += '  <span class="forecast-value">' + windDirectionLabel + '<br>' + windDirectionDeg + '°</span>';
                    card += '</div>';
    
                    // Wind Speed
                    card += '<div class="forecast-item">';
                    card += '  <span class="forecast-label">Wind (kn)</span>';
                    card += '  <span class="forecast-value">' + windSpeedKnots + '</span>';
                    card += '</div>';
    
                    // Rain Rate
                    card += '<div class="forecast-item">';
                    card += '  <span class="forecast-label">Rain (mm/h)</span>';
                    card += '  <span class="forecast-value">' + Math.round(rainRate) + '</span>';
                    card += '</div>';
    
                    card += '</div>';
    
                    $responsiveContainer.append(card);
                    $previewContainer.append($responsiveContainer);

                } catch (error){
                    let $previewContainer = jQuery(`#${self.container_id}`);
                    $previewContainer.text("Error while accessing the instrument value! Try again later");
                    console.log(error);
                }
            },
            error: function () {
                console.error("Error fetching instrument data for: " + self.instrument_id);
            }
        });
    }

    /**
     * Converts degrees to compass direction label (N, NE, E, SE, S, SW, W, NW)
     * @param {number} deg - degrees (0-360)
     * @returns {string} compass label
     */
    static degToCompass(deg) {
        let directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                          'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        let index = Math.round(deg / 22.5) % 16;
        return directions[index];
    }
}