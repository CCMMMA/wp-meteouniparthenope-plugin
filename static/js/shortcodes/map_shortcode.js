let placeCoordinates = [ mapData['coordinates'][1] , mapData['coordinates'][0] ];
let placeBoundingBox = swapCoordinates();
let placeMinZoom = 14; //mapData['min_zoom'];
let placeMaxZoom = 999;

let tileLayerUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png' //Da aggiornare in modo dinamico
let extras = {attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"};

(function($){
    $(document).ready(function() {
        //console.log(mapData);
        //console.log(placeCoordinates);

        var map = L.map('map').setView(placeCoordinates, placeMinZoom);
        $('#map-collapse').on('shown.bs.collapse', function () {
            map.invalidateSize();
        });
        L.tileLayer(tileLayerUrl, extras).addTo(map);
        var polygon = L.polygon(placeBoundingBox).addTo(map);
    });
})(jQuery);

function swapCoordinates(){
    //console.log(mapData['bbox']);

    let fixedCoordinates = [];

    mapData['bbox'].forEach(function(item,index){
        fixedCoordinates.push([item[0][1], item[0][0]]);
    });

    return fixedCoordinates;
}