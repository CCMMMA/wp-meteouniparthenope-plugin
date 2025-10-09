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

    fillSubtable(hourlyForecastData,product,step, imagesUrl){
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

            if (hourlyForecastData.length > 0) {
                jQuery.each(hourlyForecastData, function(subTableKey, value){
                    let subTableHour = DateFormatter.formatFromAPIToDateObj(value['dateTime']).getHours().toString().padStart(2, '0');
                    let wIconUrl = imagesUrl + "/" + value['icon'];
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

            return $subTable;
    }
}