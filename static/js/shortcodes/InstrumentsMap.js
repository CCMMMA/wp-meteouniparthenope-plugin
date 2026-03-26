/**
 * InstrumentsMap - Classe Singleton
 * Gestisce un'unica istanza della mappa Leaflet condivisa tra tutti gli InstrumentLiveChart.
 * Il container della mappa viene renderizzato dal plugin WordPress una sola volta nella pagina
 * nel div con id "instrument_shortcode-map-root".
 */
class InstrumentsMap {

    static _instance = null;

    static getInstance() {
        if (!InstrumentsMap._instance) {
            InstrumentsMap._instance = new InstrumentsMap();
        }
        return InstrumentsMap._instance;
    }

    constructor() {
        if (InstrumentsMap._instance) {
            return InstrumentsMap._instance;
        }

        this.mapInstance = null;
        this.markers = {}; // Dizionario { instrument_id: L.marker }

        const tileLayerUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png';
        const tileLayerOptions = {
            attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        };

        // Crea il div della mappa nel container predisposto dal plugin WordPress
        let $mapDiv = jQuery('<div>').attr('id', 'instruments-map').css({
            'width': '100%',
            'height': '400px'
        });
        jQuery('#instrument_shortcode-map-root').append($mapDiv);

        // Inizializza la mappa Leaflet
        this.mapInstance = L.map('instruments-map').setView([41.9, 14.0], 7);
        L.tileLayer(tileLayerUrl, tileLayerOptions).addTo(this.mapInstance);

        setTimeout(() => this.mapInstance.invalidateSize(), 100);
    }

    /**
     * Aggiunge (o aggiorna) il marker di uno strumento sulla mappa.
     * Con un solo marker, centra la mappa su di esso e apre il popup.
     * Con più marker, adatta i bounds per mostrarli tutti.
     *
     * @param {string} instrument_id - ID univoco dello strumento
     * @param {number|string} lat    - Latitudine (verrà convertita a numero)
     * @param {number|string} lng    - Longitudine (verrà convertita a numero)
     * @param {string} label         - Nome da mostrare nel popup
     */
    addMarker(instrument_id, lat, lng, label) {
        // CORREZIONE: Converti esplicitamente a numero
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        
        // Valida le coordinate
        if (isNaN(latitude) || isNaN(longitude)) {
            console.error(`Invalid coordinates for ${instrument_id}: lat=${lat}, lng=${lng}`);
            return;
        }
        
        // Se esiste già un marker per questo strumento, rimuovilo prima di ricrearlo
        if (this.markers[instrument_id]) {
            this.mapInstance.removeLayer(this.markers[instrument_id]);
        }

        const marker = L.marker([latitude, longitude]).addTo(this.mapInstance);
        marker.bindPopup(`<b>${label}</b><br>Lat: ${latitude.toFixed(6)}<br>Lon: ${longitude.toFixed(6)}`);
        this.markers[instrument_id] = marker;

        const allMarkers = Object.values(this.markers);
        if (allMarkers.length === 1) {
            // Un solo marker: centra su di esso e apri il popup
            this.mapInstance.setView([latitude, longitude], 13);
            marker.openPopup();
        } else {
            // Più marker: adatta i bounds per mostrarli tutti
            const group = L.featureGroup(allMarkers);
            this.mapInstance.fitBounds(group.getBounds().pad(0.2));
        }
       
        console.log(this.markers[instrument_id]);
        
    }

    /**
     * Rimuove il marker di uno strumento dalla mappa.
     *
     * @param {string} instrument_id - ID univoco dello strumento da rimuovere
     */
    removeMarker(instrument_id) {
        if (this.markers[instrument_id]) {
            this.mapInstance.removeLayer(this.markers[instrument_id]);
            delete this.markers[instrument_id];

            // Riadatta la vista ai marker rimasti, se ce ne sono
            const allMarkers = Object.values(this.markers);
            if (allMarkers.length > 0) {
                const group = L.featureGroup(allMarkers);
                this.mapInstance.fitBounds(group.getBounds().pad(0.2));
            }
        }
    }
}