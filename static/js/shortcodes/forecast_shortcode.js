(function($){
    $(document).ready(function(){
        let $loadingDiv = $('<div>').attr('class','loading-gif');
        $loadingDiv.attr('id','loading-div');
        let $loadingGif = $('<img>').attr('id','loading-gif');    
        $loadingGif.attr('src',METEOUNIP_PLUGIN_LOADING_DIR + "/loading_gif.gif");
        $loadingDiv.append($loadingGif);

        $('#loading-box').append($loadingDiv).show();

        function createForecast(){
            let $forecastBox = $('#forecast-box');
            $forecastBox.hide();
            $forecastBox.empty();
            $loadingDiv.show();

            var forecastDate = DateFormatter.formatFromDateToAPI($('#control-select-date').val(),"00:00");
            var place = forecastData['place_id']
            var product = $('#control-select-product').val();
            
            let forecastH24Url = `${apiProdBaseUrl}/${product}/timeseries/${place}?&output=gen&date=${forecastDate}&hours=0&step=24`
            console.log("forecastUrl: " + forecastH24Url);

            $.ajax({
                url: forecastH24Url,
                type: 'GET',
                dataType: 'json',
                tryCount: 1,
                retryLimit: 3,
                retryInterval: 2000,
                success: function(data){
                    var forecastTableObj = new ForecastTable();
                    forecastTableObj.fillTable(data['timeseries'],place,product,forecastData['imagesUrl']);
                    $loadingDiv.hide();
                    let $forecastBox = $('#forecast-box');
                    $forecastBox.show();
                },
                error: function(xhr, textStatus, errorThrown){
                    if (xhr.status !== 404){
                        console.log("ERRORE 500, tentativo "+this.tryCount+"/"+this.retryLimit);
                        this.tryCount++;
                        if (this.tryCount <= this.retryLimit) {
                            var self = this;
                            setTimeout(() =>{
                                $.ajax(self);
                            },this.retryInterval);
                        }
                        else{
                            $('#forecast_shortcode-root').append('<p>No data available</p>');
                        }
                    }
                }
            });
        }

        $(document).on('place.control_forms.loaded',createForecast);

        $('.forecast-control-forms').on('change',createForecast);
    });
})(jQuery);