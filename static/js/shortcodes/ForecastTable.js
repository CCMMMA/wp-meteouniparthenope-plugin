class ForecastTable{

    static get defaults() {
        return {
            tableContainerID: 'forecast-box',
            forecastTableID: 'forecast-table'
        };
    }

    constructor(inputs = {}) {
        this.tableContainerID = inputs.tableContainerID || ForecastTable.defaults.tableContainerID;
        this.forecastTableID = inputs.forecastTableID|| ForecastTable.defaults.forecastTableID;

        this.$tableContainer = jQuery('#'+this.tableContainerID);
        this.$table = null;

        this.cache = {};
    }
    
    getTableContainer(){
        return this.$tableContainer;
    }

    fillTable(timeSeriesDataH24, place, product, imagesUrl){
        //Create table
        this.$table = jQuery('<table class="forecast-table">');
        this.$table.attr('id',this.forecastTableID);
        this.$table.attr('width',"100%");
        this.$table.attr('cellspacing','0');
        this.$table.attr('cellpadding','0');
        this.$table.attr('border','0');

        var $tableRow = jQuery('<tr class="legenda">');
        $tableRow.append('<td colspan="2">Forecast</td>');
        jQuery.each(forecastTableColumns[product]['descs'],function(key,value){
            var tdString = "<td";
            if(forecastTableColumns[product]['table']['colspan'][key] != 1){
                tdString += ' colspan="'+forecastTableColumns[product]['table']['colspan'][key]+'"';
            }
            tdString += ">";
            var $tableTD = jQuery(tdString);
            $tableTD.text(`${value}`);
            $tableRow.append($tableTD);
        });
        this.$table.append($tableRow);

        const self = this;
        jQuery.each( timeSeriesDataH24, function( key, val ){
            let weatherIconUrl = imagesUrl;
            let wIconUrl = weatherIconUrl+"/"+val['icon'];
            let wTextLabel = val['text'];

            let weekDayLabel = self.dayOfWeek(val['dateTime']);
            let monthDay = self.monthOfYear(val['dateTime']) + "-" + val['dateTime'].substring(6,8);
            
            $tableRow = jQuery('<tr>');
            var $tableTD = jQuery('<td class="forecast-td-data">');
            
            // Crea uno span cliccabile invece di un link
            var $dateTimeSelector = jQuery('<span class="forecast-date-selector" style="cursor: pointer; color: #0073aa; text-decoration: underline;">');
            $dateTimeSelector.attr('title', `Meteo ${forecastData['long_name_it']} - ${weekDayLabel} ${monthDay}`);
            $dateTimeSelector.text(`${weekDayLabel},\n ${monthDay}\n`);
            $dateTimeSelector.append('<br>');
            
            // Aggiungi l'evento click per impostare data e ora
            $dateTimeSelector.on('click', function(e) {
                e.preventDefault();
                
                // Estrai data e ora dal dateTime (formato YYYYMMDD)
                let dateValue = DateFormatter.formatFromAPIToDateString(val['dateTime']); // es: "20231015"
                
                // Se hai anche un'ora nel dato, estraila, altrimenti usa un valore di default
                // Assumo che l'ora sia "00:00" se non specificata
                let timeValue = "00:00";
                
                // Imposta il valore del select della data
                let $dateSelect = jQuery('#control-select-date');
                if ($dateSelect.length) {
                    $dateSelect.val(dateValue);
                } else {
                    console.warn('Select con id "select-control-date" non trovato');
                }
                
                // Imposta il valore del select dell'ora
                let $timeSelect = jQuery('#control-select-time');
                if ($timeSelect.length) {
                    $timeSelect.val(timeValue);
                } else {
                    console.warn('Select con id "select-control-time" non trovato');
                }
                
                // Triggera l'evento change sul select della data
                if ($dateSelect.length) {
                    $dateSelect.trigger('change');
                }
            });
            
            $tableTD.append($dateTimeSelector);
            
            var $tableButton = jQuery('<button id="'+val['dateTime']+'-button" class="btn btn-sm btn-primary ml-2" data-toggle="collapse" data-target="#'+val['dateTime']+'-collapse">+</button>');
            $tableTD.append($tableButton);
            $tableRow.append($tableTD);
            
            $tableTD = jQuery('<td class="forecast-td-data">');
            if(val['icon']){
                $tableTD.append(`<img class="forecast-image" src="${wIconUrl}" class="weathericon" alt="${wTextLabel}" title="${wTextLabel}">`);
            }
            else{
                $tableTD.text("Weather icon not available!");
            }
            $tableRow.append($tableTD);

            jQuery.each( forecastTableColumns[product]['table']['vars'], function(keyRow,valRow){
                $tableTD = jQuery('<td class="forecast-td-data">');
                $tableTD.text(`${ val[valRow] }`);
                $tableRow.append($tableTD);
            });
            self.$table.append($tableRow);


            $tableRow = jQuery(`<tr class="collapse" id="${val['dateTime']}-collapse">`);
            var colSpans = 0;
            jQuery.each(forecastTableColumns[product]['table']['colspan'],function(index,value){
                colSpans += Number(value);
            });
            $tableTD = jQuery(`<td colspan="${colSpans + 2}">`);
            $tableRow.append($tableTD);

            //Qui va creata la subtable dopo richiesta ajax
            self.cache[`${val['dateTime']}-button`] = false;
            $tableButton.on('click',function(){
                //if first time then ajax request
                if(!self.cache[`${val['dateTime']}-button`]){
                    self.cache[`${val['dateTime']}-button`] = true;
                    let $loadingDiv = jQuery('<div>').attr('class','loading-gif');
                    $loadingDiv.attr('id','loading-div');
                    let $loadingGif = jQuery('<img>').attr('id','loading-gif');    
                    $loadingGif.attr('src',METEOUNIP_PLUGIN_LOADING_DIR + "/loading_gif.gif");
                    $loadingDiv.append($loadingGif);
                    jQuery(`#${val['dateTime']}-collapse`).children().append($loadingDiv);
                    $loadingDiv.show();

                    var prod = jQuery('#control-select-product').val();
                    var step = jQuery('#control-select-step').val();
                    let timeseriesUrl = `${apiBaseUrl}/products/${prod}/timeseries/${place}?output=gen&date=${val['dateTime']}&hours=24&step=${step}`;
                    console.log("timeseriesUrl: "+timeseriesUrl);
                    jQuery.ajax({
                        url: timeseriesUrl,
                        success: function(data){
                            var hourlyForecastData = [];
                            for(var i=0;i<(24/step);i++){
                                hourlyForecastData.push(data['timeseries'][i]);
                            }
                            
                            var subtableObj = new ForecastSubtable({tableContainerID: self.tableContainerID, forecastTableID: self.forecastTableID, forecastTableRowForSubtableID: `${val['dateTime']}-collapse`});
                            var $subTable = subtableObj.fillSubtable(hourlyForecastData,prod,step,imagesUrl);
                            $tableTD.append($subTable);
                            $loadingDiv.hide();
                            $subTable.show();
                        }
                    });
                }
                //else show normally
            });

            $tableRow.append(self.tableTD);

            self.$table.append($tableRow);
            self.$tableContainer.append(self.$table);

            jQuery('[data-toggle="collapse"]').on('click', function(e) {
                e.preventDefault();
                let target = jQuery(this).data('target');
                jQuery(target).collapse('toggle');
            });

            jQuery('#'+val['dateTime']+'-button').on('click', function () {
                let $this = jQuery(this);
                if( $this.text() === "+"){
                    $this.text('-');
                }
                else{
                    $this.text('+');
                }
            });
        });
    }
    
    dayOfWeek(date) {
        let year = date.substring(0, 4);
        let month = date.substring(4, 6);
        let day = date.substring(6, 8);

        let dayOfWeek = new Date(year + "-" + month + "-" + day).getDay();
        return isNaN(dayOfWeek) ? null : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    }

    monthOfYear(date) {
        let month = parseInt(date.substring(4, 6)) - 1;
        
        return isNaN(month) ? null : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month];
    }

}