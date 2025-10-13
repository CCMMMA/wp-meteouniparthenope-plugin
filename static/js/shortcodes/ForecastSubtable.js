class ForecastSubtable{
    static get defaults() {
        return {
            tableContainerID: 'forecast-box',
            forecastTableID: 'forecast-table',
            forecastTableRowForSubtableID: null
        };
    }

    constructor(options={}){
        this.tableContainerID = options.tableContainerID || ForecastSubtable.defaults.tableContainerID;
        this.forecastTableID = options.forecastTableID || ForecastSubtable.defaults.forecastTableID;
        this.forecastTableRowForSubtable = options.forecastTableRowForSubtable || ForecastSubtable.defaults.forecastTableRowForSubtable;
    }

    fillSubtable(hourlyForecastData, dateTimeFormTableRow, product, step, imagesUrl){
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
            subTableDiscriminant = 'table';
        }
        
        jQuery.each(forecastTableColumns[product]['descs'], function(index, description){
            $subTableTH = jQuery(`<th colspan="${forecastTableColumns[product][subTableDiscriminant]['colspan'][index]}">`);
            $subTableTH.text(`${description}`);
            $subTableRow.append($subTableTH);
        });
        
        $subTableTHead.append($subTableRow);
        $subTable.append($subTableTHead);
        
        var $subTableTBody = jQuery('<tbody>');
        
        if (hourlyForecastData.length > 0) {
            jQuery.each(hourlyForecastData, function(subTableKey, value){
                let subTableHour = DateFormatter.formatFromAPIToDateObj(value['dateTime']).getHours().toString().padStart(2, '0');
                let wIconUrl = imagesUrl + "/" + value['icon'];
                let wTextLabel = value['text'];
                
                $subTableRow = jQuery('<tr>');
                var $subTableTD = jQuery('<td class="forecast-td-data">');
                
                // Crea uno span cliccabile per l'ora
                var $timeSelector = jQuery('<span class="forecast-time-selector" style="cursor: pointer; color: #0073aa; text-decoration: underline;">');
                $timeSelector.text(`${subTableHour}:00`);
                $timeSelector.attr('title', 'Clicca per selezionare quest\'ora');
                
                // Aggiungi l'evento click per impostare l'ora
                $timeSelector.on('click', function(e) {
                    console.log(dateTimeFormTableRow);
                    e.preventDefault();
                    
                    let timeValue = `${subTableHour}:00`;
                    
                    let $dateSelect = jQuery('#control-select-date');
                    if ($dateSelect.length) {
                        $dateSelect.val(DateFormatter.formatFromAPIToDateString(dateTimeFormTableRow));
                    } else {
                        console.warn('Select con id "control-select-time" non trovato');
                    }

                    // Imposta il valore del select dell'ora
                    let $timeSelect = jQuery('#control-select-time');
                    if ($timeSelect.length) {
                        $timeSelect.val(timeValue);
                        // Triggera l'evento change
                        $timeSelect.trigger('change');
                    } else {
                        console.warn('Select con id "control-select-time" non trovato');
                    }

                });
                
                $subTableTD.append($timeSelector);
                $subTableRow.append($subTableTD);
                
                $subTableTD = jQuery('<td class="forecast-td-data">');
                if(value['icon']){
                    $subTableTD.append('<img class="forecast-image" src="' + wIconUrl + '" class="weathericon" alt="' + wTextLabel + '" title="' + wTextLabel + '" />');
                }
                else{
                    $subTableTD.text("Weather icon not available!");
                }
                $subTableRow.append($subTableTD);
                
                jQuery.each(forecastTableColumns[product][subTableDiscriminant]['vars'], function(index, variable){
                    $subTableTD = jQuery('<td class="forecast-td-data">');
                    if(variable === "winds"){
                        $subTableTD.append(`${value[variable]}`);
                        $subTableTD.append('<br>');
                        $subTableTD.append(`${Math.round(value['wd10'])}°`);
                    }
                    else{
                        $subTableTD.text(`${value[variable]}`);
                    }
                    $subTableRow.append($subTableTD);
                });
                
                $subTableTBody.append($subTableRow);
            });
        } else {
            $subTableTBody.append('<tr><td colspan="5" class="text-center">Nessun dato orario disponibile</td></tr>');
        }
        
        $subTable.append($subTableTBody);
        return $subTable;
    }
}