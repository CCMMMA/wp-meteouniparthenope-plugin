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
    }
    
    getTableContainer(){
        return this.$tableContainer;
    }

    fillTable(timeSeriesDataH24, timeseriesDataH1, product, step ,imagesUrl){
        //Create table
        this.$table = jQuery('<table class="forecast-table">');
        this.$table.attr('id',this.forecastTableID);
        this.$table.attr('width',"100%");
        this.$table.attr('cellspacing','0');
        this.$table.attr('cellpadding','0');
        this.$table.attr('border','0');

        //this.$tableContainer.append(this.$table);

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
            var $tableLink = jQuery(`<a class="forecast-link" href="${val['link']}" target="_blank" class="day" title="Meteo ${forecastData['long_name_it']} - ${weekDayLabel} ${monthDay}">`);
            $tableLink.text(`${weekDayLabel},\n ${monthDay}\n`);
            $tableLink.append('<br>');
            $tableTD.append($tableLink);
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

            var $subTable = jQuery('<table class="table table-bordered table-striped table-responsive">');
            var $subTableTHead = jQuery('<thead>');

            var $subTableRow = jQuery('<tr>');
            var $subTableTH = jQuery('<th>');
            $subTableTH.text('Hour');
            $subTableRow.append($subTableTH);
            $subTableTH = jQuery('<th>');
            $subTableTH.text('Forecast');
            $subTableRow.append($subTableTH);

            var subTableDiscriminant = 'subtable';
            if(product !== "wrf5" && step != 1){
                subTableDiscriminant  ='table';
            }

            jQuery.each(forecastTableColumns[product]['descs'],function(index,description){
                $subTableTH = jQuery(`<th colspan="${forecastTableColumns[product][subTableDiscriminant]['colspan'][index]}">`);
                $subTableTH.text(`${description}`);
                $subTableRow.append($subTableTH);
            });
            $subTableTHead.append($subTableRow);
            $subTable.append($subTableTHead);

            var $subTableTBody = jQuery('<tbody>');

            if (timeseriesDataH1[val['dateTime']] && timeseriesDataH1[val['dateTime']].length > 0) {
                jQuery.each(timeseriesDataH1[val['dateTime']], function(subTableKey, value){
                    let subTableHour = DateFormatter.formatFromAPIToDateObj(value['dateTime']).getHours().toString().padStart(2, '0');
                    let wIconUrl = weatherIconUrl + "/" + value['icon'];
                    let wTextLabel = value['text'];

                    $subTableRow = jQuery('<tr>');
                    var $subTableTD = jQuery('<td class="forecast-td-data">');
                    $subTableTD.text(`${subTableHour}:00`);
                    $subTableRow.append($subTableTD);
                    $subTableTD = jQuery('<td class="forecast-td-data">');
                    if(value['icon']){
                        $subTableTD.append('<img class="forecast-image" src="' + wIconUrl + '" class="weathericon" alt="' + wTextLabel + '" title="' + wTextLabel + '" />');
                    }
                    else{
                        $subTableTD.text("Weather icon not available!");
                    }
                    $subTableRow.append($subTableTD);
                    

                    jQuery.each(forecastTableColumns[product][subTableDiscriminant]['vars'],function(index,variable){
                        $subTableTD = jQuery('<td class="forecast-td-data">');
                        $subTableTD.text(`${value[variable]}`);
                        $subTableRow.append($subTableTD);
                    });
                    $subTableTBody.append($subTableRow);
                });
            } else {
                $subTableTBody.append('<tr><td colspan="5" class="text-center">Nessun dato orario disponibile</td></tr>');
            }

            $subTable.append($subTableTBody);

            $tableTD.append($subTable);
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