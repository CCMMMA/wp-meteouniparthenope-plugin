/**
 * Meteo Map - Versione Semplificata per WordPress Plugin
 * 
 * Questo file contiene una versione snella e modulare della mappa meteo
 * ottimizzata per l'integrazione in WordPress
 */

(function($, window, document) {
    'use strict';
    
    // Namespace per evitare conflitti
    window.MeteoMap = window.MeteoMap || {};
    
    /**
     * Configurazione di default
     */
    const defaultConfig = {
        apiUrl: 'https://api.meteo.uniparthenope.it',
        defaultPlace: 'com63049',
        defaultMapName: 'muggles',
        defaultCenter: [40.85, 14.28],
        defaultZoom: 5,
        language: 'it'
    };
    
    /**
     * Classe principale MeteoMap
     */
    class MeteoMap {
        
        constructor(containerId, options = {}) {
            this.containerId = containerId;
            this.config = { ...defaultConfig, ...options };
            this.map = null;
            this.layers = {
                base: {},
                overlay: {}
            };
            this.controlLayers = null;
            
            this.init();
        }
        
        /**
         * Inizializza la mappa
         */
        async init() {
            try {
                // Crea istanza Leaflet
                this.map = L.map(this.containerId, {
                    center: this.config.defaultCenter,
                    zoom: this.config.defaultZoom,
                    loadingControl: true
                });
                
                // Carica dati del luogo
                await this.loadPlaceData(this.config.place || this.config.defaultPlace);
                
                // Carica mappe base
                await this.loadBaseMaps(this.config.mapName || this.config.defaultMapName);
                
                // Carica layer meteorologici
                await this.loadWeatherLayers();
                
                // Setup eventi
                this.setupMapEvents();
                
                console.log('MeteoMap initialized successfully');
                
            } catch (error) {
                console.error('Error initializing MeteoMap:', error);
                this.handleError(error);
            }
        }
        
        /**
         * Carica e applica i dati del luogo
         */
        async loadPlaceData(placeId) {
            const url = `${this.config.apiUrl}/places/${placeId}`;
            
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const placeData = await response.json();
                
                // Crea bounds dal bbox
                const bounds = L.latLngBounds(
                    placeData.bbox.coordinates.map(coord => [coord[1], coord[0]])
                );
                
                // Centra la mappa
                this.map.fitBounds(bounds);
                
                // Salva dati
                this.placeData = placeData;
                
                return placeData;
                
            } catch (error) {
                console.error('Error loading place data:', error);
                throw error;
            }
        }
        
        /**
         * Carica le mappe base disponibili
         */
        async loadBaseMaps(mapName) {
            const url = `${this.config.apiUrl}/v2/maps/${mapName}`;
            
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const mapConfig = await response.json();
                
                // Carica ogni basemap
                for (const baseMapItem of mapConfig.baseMaps) {
                    const baseMapId = Object.keys(baseMapItem)[0];
                    const isActive = baseMapItem[baseMapId];
                    
                    await this.loadSingleBaseMap(baseMapId, isActive);
                }
                
                // Aggiungi controllo layer
                this.controlLayers = L.control.layers(
                    this.layers.base, 
                    this.layers.overlay, 
                    { collapsed: true }
                ).addTo(this.map);
                
            } catch (error) {
                console.error('Error loading base maps:', error);
                // Fallback a OpenStreetMap
                this.addDefaultBaseMap();
            }
        }
        
        /**
         * Carica una singola basemap
         */
        async loadSingleBaseMap(baseMapId, isActive) {
            const url = `${this.config.apiUrl}/v2/basemaps/${baseMapId}`;
            
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const baseMapData = await response.json();
                
                const name = baseMapData.name[this.config.language] || 
                           baseMapData.name['en'] || 
                           baseMapId;
                
                let layer;
                
                switch (baseMapData.type) {
                    case 'tiled':
                        layer = L.tileLayer(baseMapData.url, baseMapData.extras || {});
                        break;
                        
                    case 'navionics':
                        // Solo se il plugin Navionics è disponibile
                        if (window.JNC && window.JNC.Leaflet) {
                            const extras = { ...baseMapData.extras };
                            if (extras.chartType) {
                                extras.chartType = eval(extras.chartType);
                            }
                            layer = new JNC.Leaflet.NavionicsOverlay(extras);
                        }
                        break;
                }
                
                if (layer) {
                    this.layers.base[name] = layer;
                    
                    if (isActive) {
                        layer.addTo(this.map);
                    }
                }
                
            } catch (error) {
                console.error(`Error loading basemap ${baseMapId}:`, error);
            }
        }
        
        /**
         * Aggiunge una basemap di default (OpenStreetMap)
         */
        addDefaultBaseMap() {
            const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            });
            
            this.layers.base['OpenStreetMap'] = osmLayer;
            osmLayer.addTo(this.map);
        }
        
        /**
         * Carica i layer meteorologici
         */
        async loadWeatherLayers() {
            const mapName = this.config.mapName || this.config.defaultMapName;
            const url = `${this.config.apiUrl}/v2/maps/${mapName}`;
            
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const mapConfig = await response.json();
                
                // Processa overlays se presenti
                if (mapConfig.overlays) {
                    for (const overlayItem of mapConfig.overlays) {
                        await this.loadWeatherOverlay(overlayItem);
                    }
                }
                
            } catch (error) {
                console.error('Error loading weather layers:', error);
            }
        }
        
        /**
         * Carica un singolo overlay meteorologico
         */
        async loadWeatherOverlay(overlayConfig) {
            // Implementazione specifica basata sul tipo di overlay
            const overlayId = Object.keys(overlayConfig)[0];
            const url = `${this.config.apiUrl}/v2/overlays/${overlayId}`;
            
            try {
                const response = await fetch(url);
                if (!response.ok) return;
                
                const overlayData = await response.json();
                
                const name = overlayData.name[this.config.language] || 
                           overlayData.name['en'] || 
                           overlayId;
                
                let layer;
                
                switch (overlayData.type) {
                    case 'geojson':
                        layer = this.createGeoJSONLayer(overlayData);
                        break;
                        
                    case 'velocity':
                        layer = this.createVelocityLayer(overlayData);
                        break;
                        
                    case 'tiled':
                        layer = L.tileLayer(overlayData.url, overlayData.extras || {});
                        break;
                }
                
                if (layer) {
                    this.layers.overlay[name] = layer;
                    
                    // Aggiungi al controllo se già creato
                    if (this.controlLayers) {
                        this.controlLayers.addOverlay(layer, name);
                    }
                }
                
            } catch (error) {
                console.error(`Error loading overlay ${overlayId}:`, error);
            }
        }
        
        /**
         * Crea un layer GeoJSON
         */
        createGeoJSONLayer(config) {
            if (!window.L.geoJSONTileLayer) {
                console.warn('GeoJSON Tile Layer plugin not available');
                return null;
            }
            
            const layer = new L.geoJSONTileLayer(config.url, {
                unique: function(feature) {
                    return feature.id || feature.properties.id;
                },
                ...config.extras
            });
            
            return layer;
        }
        
        /**
         * Crea un layer velocity (vento)
         */
        createVelocityLayer(config) {
            if (!window.L.velocityLayer) {
                console.warn('Velocity Layer plugin not available');
                return null;
            }
            
            // Il layer velocity richiede dati in formato specifico
            // Questo è un placeholder - adatta secondo la tua API
            const layer = L.velocityLayer({
                displayValues: true,
                displayOptions: {
                    velocityType: 'Wind',
                    displayPosition: 'bottomleft',
                    displayEmptyString: 'No wind data'
                },
                data: null, // Dati caricati dinamicamente
                maxVelocity: 15,
                ...config.extras
            });
            
            return layer;
        }
        
        /**
         * Configura gli eventi della mappa
         */
        setupMapEvents() {
            // Evento zoom
            this.map.on('zoomend', () => {
                const zoom = this.map.getZoom();
                console.log('Zoom level:', zoom);
                
                // Puoi aggiungere logica per caricare/nascondere layer
                // basata sul livello di zoom
                this.onZoomChange(zoom);
            });
            
            // Evento spostamento
            this.map.on('moveend', () => {
                const center = this.map.getCenter();
                const bounds = this.map.getBounds();
                console.log('Map moved to:', center);
                
                // Aggiorna layer se necessario
                this.onMapMove(bounds);
            });
            
            // Evento cambio basemap
            this.map.on('baselayerchange', (e) => {
                console.log('Base layer changed to:', e.name);
                this.onBaseLayerChange(e.name);
            });
            
            // Evento aggiunta overlay
            this.map.on('overlayadd', (e) => {
                console.log('Overlay added:', e.name);
                this.onOverlayAdd(e.name);
            });
            
            // Evento rimozione overlay
            this.map.on('overlayremove', (e) => {
                console.log('Overlay removed:', e.name);
                this.onOverlayRemove(e.name);
            });
        }
        
        /**
         * Callback per cambio zoom
         */
        onZoomChange(zoom) {
            // Override in una sottoclasse o passa callback nel config
            if (this.config.onZoomChange) {
                this.config.onZoomChange(zoom);
            }
        }
        
        /**
         * Callback per spostamento mappa
         */
        onMapMove(bounds) {
            if (this.config.onMapMove) {
                this.config.onMapMove(bounds);
            }
        }
        
        /**
         * Callback per cambio basemap
         */
        onBaseLayerChange(name) {
            if (this.config.onBaseLayerChange) {
                this.config.onBaseLayerChange(name);
            }
        }
        
        /**
         * Callback per aggiunta overlay
         */
        onOverlayAdd(name) {
            if (this.config.onOverlayAdd) {
                this.config.onOverlayAdd(name);
            }
        }
        
        /**
         * Callback per rimozione overlay
         */
        onOverlayRemove(name) {
            if (this.config.onOverlayRemove) {
                this.config.onOverlayRemove(name);
            }
        }
        
        /**
         * Gestione errori
         */
        handleError(error) {
            // Mostra messaggio all'utente
            const container = document.getElementById(this.containerId);
            if (container) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'meteo-map-error';
                errorDiv.innerHTML = `
                    <p><strong>Errore nel caricamento della mappa</strong></p>
                    <p>${error.message}</p>
                `;
                container.appendChild(errorDiv);
            }
            
            // Callback personalizzato
            if (this.config.onError) {
                this.config.onError(error);
            }
        }
        
        /**
         * Distrugge la mappa e pulisce le risorse
         */
        destroy() {
            if (this.map) {
                this.map.remove();
                this.map = null;
            }
            this.layers = { base: {}, overlay: {} };
            this.controlLayers = null;
        }
        
        /**
         * Aggiorna la mappa con nuovi dati
         */
        async update(options = {}) {
            const newConfig = { ...this.config, ...options };
            
            // Se cambia il luogo, ricarica
            if (options.place && options.place !== this.config.place) {
                await this.loadPlaceData(options.place);
            }
            
            // Aggiorna configurazione
            this.config = newConfig;
        }
    }
    
    /**
     * Helper per formattazione date
     */
    function pad(n, width, z = '0') {
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    
    /**
     * Genera stringa data NCEP dal Date object
     */
    function formatNcepDate(date = new Date()) {
        return date.getFullYear() +
               pad(date.getMonth() + 1, 2) +
               pad(date.getDate(), 2) + 'Z' +
               pad(date.getHours(), 2) + '00';
    }
    
    /**
     * Inizializzazione automatica via data attributes
     * 
     * Uso:
     * <div id="my-map" 
     *      data-meteo-map 
     *      data-place="com63049" 
     *      data-map-name="muggles"
     *      style="height: 500px">
     * </div>
     */
    function autoInit() {
        $('[data-meteo-map]').each(function() {
            const $el = $(this);
            const config = {
                place: $el.data('place'),
                mapName: $el.data('map-name'),
                language: $el.data('language'),
                apiUrl: $el.data('api-url')
            };
            
            // Rimuovi proprietà undefined
            Object.keys(config).forEach(key => {
                if (config[key] === undefined) delete config[key];
            });
            
            // Crea istanza
            const mapId = this.id || 'meteo-map-' + Date.now();
            this.id = mapId;
            
            const instance = new MeteoMap(mapId, config);
            
            // Salva riferimento all'istanza nell'elemento
            $el.data('meteo-map-instance', instance);
        });
    }
    
    // Esponi nel namespace globale
    window.MeteoMap.Map = MeteoMap;
    window.MeteoMap.formatNcepDate = formatNcepDate;
    window.MeteoMap.pad = pad;
    
    // Auto-inizializzazione quando il DOM è pronto
    $(document).ready(function() {
        autoInit();
    });
    
})(jQuery, window, document);
