let verticalProfileMarker = null;
let verticalProfileMap = null;

(function($){
    $(document).ready(function() {
        // Attendi che la mappa sia inizializzata e il collapse sia aperto
        $('#map-collapse').on('shown.bs.collapse', function () {
            // Attendi un attimo per essere sicuri che la mappa sia pronta
            setTimeout(function() {
                initializeVerticalProfileInteraction();
            }, 300);
        });
    });
})(jQuery);

function initializeVerticalProfileInteraction() {
    // Usa la variabile globale mapInstance esposta da map_shortcode.js
    if (typeof mapInstance !== 'undefined' && mapInstance !== null) {
        verticalProfileMap = mapInstance;
        
        // Verifica se il listener non è già stato aggiunto
        if (!verticalProfileMap._verticalProfileInitialized) {
            verticalProfileMap.on('click', handleMapClick);
            verticalProfileMap._verticalProfileInitialized = true;
            console.log('Vertical profile interaction initialized');
        }
    } else {
        console.log('Map not ready yet, retrying...');
        // Riprova dopo mezzo secondo
        setTimeout(initializeVerticalProfileInteraction, 500);
    }
}

function handleMapClick(e) {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;
    
    // Verifica se il punto cliccato è all'interno della bounding box
    if (!isPointInBoundingBox(lat, lon)) {
        alert('Please click inside the bounding box area!');
        return;
    }
    
    // Rimuovi il marker precedente se esiste
    if (verticalProfileMarker) {
        verticalProfileMap.removeLayer(verticalProfileMarker);
    }
    
    // Aggiungi un nuovo marker
    verticalProfileMarker = L.marker([lat, lon], {
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(verticalProfileMap);
    
    // Aggiungi un popup al marker
    verticalProfileMarker.bindPopup(`Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}<br>Loading vertical profile...`).openPopup();
    
    // Ottieni la data e ora dai form di controllo
    const dateTime = getDateTime();
    
    // Effettua il caricamento dell'immagine
    fetchVerticalProfile(lat, lon, dateTime);
}

function isPointInBoundingBox(lat, lon) {
    // Ottieni le coordinate della bounding box dal mapData
    const bbox = placeBoundingBox;
    
    if (!bbox || bbox.length === 0) {
        console.error('Bounding box not defined');
        return false;
    }
    
    // Estrai i valori min/max di lat e lon dalla bounding box
    const lats = bbox.map(coord => coord[0]);
    const lons = bbox.map(coord => coord[1]);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    
    // Verifica se il punto è all'interno
    return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
}

function getDateTime() {
    // Recupera data e ora dai form di controllo
    const date = jQuery('#control-select-date').val();
    const time = jQuery('#control-select-time').val();
    
    if (!date || !time) {
        console.warn('Date or time not selected, using current date/time');
        // Fallback: usa la data e ora corrente in formato ISO
        const now = new Date();
        return now.toISOString().slice(0, 16).replace('T', ' ');
    }
    
    // Combina data e ora nel formato richiesto (assumendo formato: YYYY-MM-DD HH:00)
    return `${date} ${time}`;
}

function fetchVerticalProfile(lat, lon, dateTime) {
    const placeId = mapData['place_id'];
    const containerId = 'vertical-profile-plot-image';
    
    // Costruisci l'URL dell'immagine direttamente
    const imageUrl = getVerticalProfileImageUrl(placeId, lat, lon, dateTime);
    
    // Crea l'HTML con loader e immagine
   let html=
        `<div id="${containerId}_loader" style="display: block;"><img src="${METEOUNIP_PLUGIN_LOADING_DIR}/loading_gif.gif"/></div>` +
        `<div id="${containerId}_image" style="display: none">` +
        `<img src="${imageUrl}`;
        html += `" onload="jQuery('#${containerId}_loader').hide();jQuery('#${containerId}_image').show()"/>` +
        `</div>`;
    jQuery('#' + containerId).html(html);
    
    // Aggiorna il popup del marker
    if (verticalProfileMarker) {
        verticalProfileMarker.setPopupContent(`Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`);
    }
}

function getVerticalProfileImageUrl(placeId, lat, lon, dateTime) {
    // Costruisci l'URL dell'API per l'immagine del profilo verticale
    return `https://api.meteo.uniparthenope.it/products/wrf5/forecast/plot/SkewT/image?date=${dateTime}&lat=${lat}&lon=${lon}`;
}