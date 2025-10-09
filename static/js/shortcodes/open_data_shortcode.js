let openDataUrlPlace = apiBaseUrl + "/places/";

let openDataDefaultProduct = "wrf5";
let openDataDefaultOutput = "gen";

(function($){
    $(document).ready(function(){
        function loadOpenData(){
            //Place button
            var placeButtonLink = openDataUrlPlace + openDataData['place_id'];
            $('#place_link').attr('href',placeButtonLink);
    
            let $controlForms = $('.plot-control-forms');
            $controlForms.change(function(){
            });
    
            //Image button
            let place = openDataData['place_id']
            let openDataProduct = $('#control-select-product').val() || openDataDefaultProduct;
            let openDataOutput = $('#control-select-output').val() || openDataDefaultOutput;
            let dateValue = $('#control-select-date').val();
            let timeValue = $('#control-select-time').val();
        
            let dateTime = DateFormatter.formatFromDateToAPI(dateValue,timeValue);
            let plotConstructorParameters = {
                apiBaseURL: apiBaseUrl,
                place: place,
                product: openDataProduct,
                output: openDataOutput,
                dateTime: dateTime
            };
            let plotObj = new MeteoPlot(plotConstructorParameters);
            var imageButtonLink = plotObj.getImageUrl()
            $('#plot_link').attr('href',imageButtonLink);
        
            //JSON button
            var jsonButtonLink = apiBaseUrl + "/products/" + openDataProduct + "/timeseries/" + place + "?date=" + dateTime;
            $('#json_link').attr('href',jsonButtonLink);
        
            //CSV button
            var csvButtonLink = apiBaseUrl + "/products/" + openDataProduct + "/timeseries/" + place + "/csv?date=" + dateTime;
            $('#csv_link').attr('href',csvButtonLink);
        
            //OPeNDAP (History) button
            var opendapHistoryLink = apiBaseUrl + "/opendap/" + openDataProduct + "/d03/history/";
            var openDataYear = dateTime.substring(0, 4);
            var openDataMonth = dateTime.substring(4, 6);
            var openDataDay = dateTime.substring(6, 8);
            opendapHistoryLink += openDataYear + "/" + openDataMonth + "/" + openDataDay + "/";
            opendapHistoryLink += openDataProduct + "_d03_" + dateTime + ".nc.html";
            $('#opendap_history_link').attr('href',opendapHistoryLink);
        
            //OPeNDAP (Archive) button
            var opendapArchiveLink = opendapHistoryLink.replace('history','archive');
            $('#opendap_archive_link').attr('href',opendapArchiveLink);
        
            //WMS (History) button
            var wmsHistoryLink = apiBaseUrl + "/ncWMS2/wms/lds/" + openDataDefaultProduct + "/d03/history";
            wmsHistoryLink += openDataYear + "/" + openDataMonth + "/" + openDataDay + "/";
            wmsHistoryLink += openDataProduct + "_d03_" + dateTime;
            wmsHistoryLink += ".nc?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0"
            $('#wms_history_link').attr('href',wmsHistoryLink);
        
            //WMS (Archive) button
            var wmsHistoryArchive = wmsHistoryLink.replace('history','archive');
            $('#wms_archive_link').attr('href',wmsHistoryArchive);
        }
        $(document).on('place.control_forms.loaded',function(){
            console.log("PRIMO CARICAMENTO DELLA PAGINA");
            loadOpenData();
        });
        $('.control-forms').on('change',function(){
            console.log("QUALCOSA È CAMBIATO");
            loadOpenData();
        });
    });

})(jQuery)