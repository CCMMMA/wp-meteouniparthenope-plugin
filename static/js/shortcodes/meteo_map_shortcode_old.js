/**
 * Meteo Map Shortcode - VERSIONE CORRETTA FINALE
 * Fix: altezza container, place code, nomi layer, processLayer completo
 */

(function($) {
    'use strict';

    const API_BASE_URL = window.globalData?.API_BASE_URL || 'https://api.meteo.uniparthenope.it';
    const WEATHER_ICON_URL = window.globalData?.WEATHER_ICON_URL || 'https://api.meteo.uniparthenope.it/static/img/weather/';
    
    window.apiBaseUrl = API_BASE_URL;
    window.weatherIconUrl = WEATHER_ICON_URL;
    
    let currentLanguage = (navigator.language || navigator.userLanguage);

    function pad(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    class MeteoMap {
        constructor(containerId, options = {}) {
            this.containerId = containerId;
            this.options = {
                place: options.place || 'com63049',  // FIX: era com063049
                ncepDate: options.ncepDate || this.getCurrentNcepDate(),
                mapName: options.mapName || 'muggles',
                language: options.language || 'it',  // FIX: forza 'it'
                baseLink: options.baseLink || window.location.href,
                noPopup: options.noPopup || false,
                customPrefix: options.customPrefix || null,
                height: options.height || '50vh'
            };
            
            this.map = null;
            this.controlLayers = null;
            this.center = new L.LatLng(40.85, 14.28);
            this.zoom = 5;
            this.domain = 'd01';
            this.prefix = '';
            this.overlayMaps = {};
            this.baseMaps = {};
            
            this.init();
        }

        getCurrentNcepDate() {
            const dateTime = new Date();
            return dateTime.getUTCFullYear() + 
                   pad(dateTime.getUTCMonth() + 1, 2) + 
                   pad(dateTime.getUTCDate(), 2) + 
                   'Z' + 
                   pad(dateTime.getUTCHours(), 2) + '00';
        }

        init() {
            const container = $('#' + this.containerId);
            
            if (container.length === 0) {
                console.error('Container non trovato:', this.containerId);
                return;
            }

            // FIX: Forza l'altezza usando this.options.height se container.css('height') è '0px'
            let containerHeight = container.css('height');
            if (!containerHeight || containerHeight === '0px' || containerHeight === 'auto') {
                containerHeight = this.options.height;
                console.log('⚠️ Altezza container era 0px, usando:', containerHeight);
            }

            const mapWrapper = $('<div>')
                .attr('id', this.containerId + '-map-container');

            const mapDiv = $('<div>')
                .attr('id', this.containerId + '-map-container-mapid')
                .css({
                    'height': containerHeight,
                    'width': '100%',
                    'position': 'relative'  // FIX: era 'inherit'
                });

            mapWrapper.append(mapDiv);
            container.append(mapWrapper);

            try {
                this.map = new L.Map(this.containerId + '-map-container-mapid');
                console.log('✅ Leaflet Map creata');
            } catch (error) {
                console.error('❌ Errore creazione Leaflet Map:', error);
                return;
            }

            this.loadPlaceData();
        }

        loadPlaceData() {
            const placeUrl = `${API_BASE_URL}/places/${this.options.place}`;
            console.log('Caricamento dati luogo:', placeUrl);

            $.getJSON(placeUrl, (placeData) => {
                console.log('✅ Dati luogo ricevuti');
                this.setupMapBounds(placeData);
                this.loadMapConfiguration();
            }).fail((error) => {
                console.error('Errore caricamento dati luogo:', error);
                this.map.setView(this.center, this.zoom);
                this.loadMapConfiguration();
            });
        }

        setupMapBounds(placeData) {
            if (!placeData.bbox || !placeData.bbox.coordinates) {
                this.map.setView(this.center, this.zoom);
                return;
            }

            const coords = placeData.bbox.coordinates;
            const marker0 = L.marker([coords[0][1], coords[0][0]]);
            const marker1 = L.marker([coords[1][1], coords[1][0]]);
            const marker2 = L.marker([coords[2][1], coords[2][0]]);
            
            const group = new L.featureGroup([marker0, marker1, marker2]);
            
            this.center = new L.LatLng(placeData.cLat, placeData.cLon);
            this.map.setView(this.center, this.zoom);
            this.map.fitBounds(group.getBounds());
            
            this.zoom = this.map.getZoom();
            this.center = this.map.getBounds().getCenter();
        }

        loadMapConfiguration() {
            const mapUrl = `${API_BASE_URL}/v2/maps/${this.options.mapName}`;
            console.log('Caricamento configurazione mappa:', mapUrl);

            $.ajax({
                url: mapUrl,
                async: true,
                success: (dataMaps) => {
                    this.setupBaseMaps(dataMaps);
                    this.setupMapEvents();
                },
                error: (error) => {
                    console.error('Errore configurazione mappa:', error);
                    this.setupDefaultBaseMap();
                    this.setupMapEvents();
                    setTimeout(() => this.changeDomain(), 100);
                }
            });
        }

        setupBaseMaps(dataMaps) {
            if (!dataMaps.baseMaps) {
                this.setupDefaultBaseMap();
                return;
            }

            let processedMaps = 0;
            const totalMaps = dataMaps.baseMaps.length;

            dataMaps.baseMaps.forEach((baseMapItem) => {
                const baseMapName = Object.keys(baseMapItem)[0];
                const isActiveDefault = baseMapItem[baseMapName];
                const baseMapUrl = `${API_BASE_URL}/v2/basemaps/${baseMapName}`;

                $.ajax({
                    url: baseMapUrl,
                    async: false,
                    success: (dataBaseMap) => {
                        // FIX: Gestisci meglio il nome della lingua
                        let name = dataBaseMap.name[this.options.language];
                        if (!name) {
                            // Fallback: prova 'it', poi prendi la prima chiave disponibile
                            name = dataBaseMap.name['it'] || Object.values(dataBaseMap.name)[0];
                        }
                        
                        const type = dataBaseMap.type;
                        const extras = dataBaseMap.extras || {};

                        let layer = null;

                        switch (type) {
                            case 'tiled':
                                layer = L.tileLayer(dataBaseMap.url, extras);
                                break;
                            
                            case 'navionics':
                                if (typeof JNC !== 'undefined') {
                                    extras.chartType = eval(extras.chartType);
                                    layer = new JNC.Leaflet.NavionicsOverlay(extras);
                                }
                                break;
                        }

                        if (layer) {
                            this.baseMaps[name] = layer;
                            
                            const cookieBaseMap = Cookies.get('baseMap');
                            const isActive = cookieBaseMap ? 
                                (name === cookieBaseMap) : 
                                isActiveDefault;

                            if (isActive) {
                                layer.addTo(this.map);
                                Cookies.set('baseMap', name);
                            }
                        }
                    },
                    error: (error) => {
                        console.error('Errore caricamento baseMap:', baseMapName, error);
                    },
                    complete: () => {
                        processedMaps++;
                        
                        if (processedMaps === totalMaps) {
                            this.controlLayers = L.control.layers(
                                this.baseMaps, 
                                this.overlayMaps, 
                                { collapsed: true }
                            ).addTo(this.map);

                            if (typeof L.Control.loading !== 'undefined') {
                                const loadingControl = L.Control.loading({
                                    spinjs: true
                                });
                                this.map.addControl(loadingControl);
                            }
                            
                            // Chiama changeDomain dopo che tutto è pronto
                            setTimeout(() => {
                                this.changeDomain();
                            }, 100);
                        }
                    }
                });
            });
        }

        setupDefaultBaseMap() {
            const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            });
            
            osmLayer.addTo(this.map);
            this.baseMaps['OpenStreetMap'] = osmLayer;
            
            this.controlLayers = L.control.layers(
                this.baseMaps, 
                this.overlayMaps, 
                { collapsed: true }
            ).addTo(this.map);
        }

        setupMapEvents() {
            this.map.on('zoomend', () => {
                this.zoom = this.map.getZoom();
                this.changeDomain();
            });

            this.map.on('moveend', () => {
                this.center = this.map.getBounds().getCenter();
                this.changeDomain();
            });

            this.map.on('baselayerchange', (e) => {
                Cookies.set('baseMap', e.name);
            });

            this.map.on('overlayadd', (e) => {
                Cookies.set(e.name, true);
            });

            this.map.on('overlayremove', (e) => {
                Cookies.set(e.name, false);
            });
        }

        changeDomain() {
            const bounds = this.map.getBounds();
            
            let newPrefix = null;
            
            if (this.options.customPrefix !== null) {
                newPrefix = this.options.customPrefix;
            } else {
                if (this.zoom >= 0 && this.zoom <= 6) {
                    newPrefix = 'reg';
                } else if (this.zoom >= 7 && this.zoom <= 10) {
                    newPrefix = 'prov';
                } else {
                    newPrefix = 'com';
                }
            }

            let newDomain = null;
            const boundsD01 = L.latLngBounds(L.latLng(27.64, -19.68), L.latLng(63.48, 34.80));
            const boundsD02 = L.latLngBounds(L.latLng(34.40, 3.58), L.latLng(47.83, 22.26));
            const boundsD03 = L.latLngBounds(L.latLng(39.15, 13.56), L.latLng(41.62, 16.31));

            if (boundsD03.contains(bounds)) {
                newDomain = 'd03';
            } else if (boundsD02.contains(bounds)) {
                newDomain = 'd02';
            } else {
                newDomain = 'd01';
            }

            if (newDomain !== this.domain) {
                this.domain = newDomain;
                console.log('Domain change:', this.domain);
                this.updateLayers('domain');
            }

            if (newPrefix !== this.prefix) {
                this.prefix = newPrefix;
                console.log('Prefix change:', this.prefix);
                this.updateLayers('prefix');
            }
        }

        updateLayers(changeType) {
            const urlMap = `${API_BASE_URL}/v2/maps/${this.options.mapName}`;

            $.ajax({
                url: urlMap,
                async: true,
                success: (dataMaps) => {
                    if (!dataMaps.layers) {
                        console.warn('Nessun layer disponibile');
                        return;
                    }

                    $.each(dataMaps.layers, (index, value) => {
                        const layerName = Object.keys(value)[0];
                        const urlLayer = `${API_BASE_URL}/v2/layers/${layerName}`;

                        $.ajax({
                            url: urlLayer,
                            async: false,
                            success: (dataLayer) => {
                                this.processLayer(dataLayer, value, layerName);
                            },
                            error: (error) => {
                                console.error('Errore caricamento layer:', layerName, error);
                            }
                        });
                    });
                },
                error: (error) => {
                    console.error('Errore caricamento layers:', error);
                }
            });
        }

        processLayer(dataLayer, value, layerName) {
            // FIX: Gestisci meglio il nome della lingua
            let name = dataLayer.name[this.options.language];
            if (!name) {
                name = dataLayer.name['it'] || Object.values(dataLayer.name)[0];
            }
            
            const type = dataLayer.type;
            const extras = dataLayer.extras || {};

            const year = this.options.ncepDate.substring(0, 4);
            const month = this.options.ncepDate.substring(4, 6);
            const day = this.options.ncepDate.substring(6, 8);

            let isActive = false;
            if (Cookies.get(name)) {
                isActive = eval(Cookies.get(name));
            } else {
                isActive = eval(value[layerName]);
            }
            Cookies.set(name, isActive);

            let url = null;
            if ('url' in dataLayer) {
                url = dataLayer.url;
                url = url.replace(/{domain}/g, this.domain);
                url = url.replace(/{prefix}/g, this.prefix);
                url = url.replace(/{year}/g, year);
                url = url.replace(/{month}/g, month);
                url = url.replace(/{day}/g, day);
                url = url.replace(/{ncepDate}/g, this.options.ncepDate);
            }

            let layerInstance = null;

            switch (type) {
                case 'velocity':
                    layerInstance = this.createVelocityLayer(name, url, extras);
                    break;
                
                case 'icon':
                    layerInstance = this.createIconLayer(name, url, dataLayer, extras);
                    break;
                
                case 'wms':
                    // FIX: Aggiungi supporto per layer WMS!
                    layerInstance = this.createWMSLayer(name, url, dataLayer, extras);
                    break;
            }

            if (layerInstance !== null) {
                if (name in this.overlayMaps && this.overlayMaps[name] !== null) {
                    this.map.removeLayer(this.overlayMaps[name]);
                    if (this.controlLayers) {
                        this.controlLayers.removeLayer(this.overlayMaps[name]);
                    }
                }

                this.overlayMaps[name] = layerInstance;
                
                if (this.controlLayers) {
                    this.controlLayers.addOverlay(this.overlayMaps[name], name);
                }
                
                if (isActive) {
                    setTimeout(() => {
                        if (this.map && this.overlayMaps[name]) {
                            this.map.addLayer(this.overlayMaps[name]);
                        }
                    }, 50);
                }
            }
        }

        createVelocityLayer(name, url, extras) {
            let layerInstance = null;

            $.ajax({
                url: url,
                async: false,
                success: (data) => {
                    extras.data = data;
                    
                    if (typeof L.velocityLayer !== 'undefined') {
                        layerInstance = L.velocityLayer(extras);
                    } else {
                        console.warn('L.velocityLayer non disponibile');
                    }
                },
                error: (error) => {
                    console.error('Errore caricamento dati velocity:', error);
                }
            });

            return layerInstance;
        }

        createIconLayer(name, url, dataLayer, extras) {
            let layerInstance = null;
            const self = this;

            const geojsonOptions = {
                style: dataLayer.style || {},
                pointToLayer: function(features, latlng) {
                    const icon = features.properties.icon;
                    
                    function getResourceName(url) {
                        return url.substring(url.lastIndexOf('/') + 1);
                    }

                    const iconData = dataLayer.extras.icons[icon];
                    const iconObject = L.icon({
                        iconUrl: WEATHER_ICON_URL + getResourceName(iconData.url),
                        iconRetinaUrl: WEATHER_ICON_URL + getResourceName(iconData.url),
                        iconSize: iconData.iconSize,
                        iconAnchor: iconData.iconAnchor,
                        popupAnchor: iconData.popupAnchor
                    });

                    return L.marker(latlng, { icon: iconObject });
                },
                filter: function(features, layer) {
                    return true;
                },
                onEachFeature: function(feature, layer) {
                    if (!feature.properties) return;

                    if (self.options.noPopup === true) {
                        let link = self.options.baseLink;
                        $.each(dataLayer.extras.popup, function(index, item) {
                            if ('link' in item) {
                                const value = feature.properties[item.property];
                                if (link.endsWith('?')) {
                                    link = link + value;
                                } else {
                                    const arr = link.split('?');
                                    if (link.length > 1 && arr[1] !== '') {
                                        link = link + '&' + value;
                                    } else {
                                        link = link + '?' + value;
                                    }
                                }
                            }
                        });

                        layer.on('click', function(e) {
                            window.open(link);
                        });
                    } else {
                        let popupString = 
                            "<div class='popup'>" +
                            "<table class='tg' style='undefined;table-layout: fixed; width: 230px'>" +
                            "<colgroup>" +
                            "<col style='width: 85px'>" +
                            "<col style='width: 60px'>" +
                            "</colgroup>";

                        $.each(dataLayer.extras.popup, function(index, item) {
                            let value = feature.properties[item.property];
                            
                            if ('eval' in item) {
                                const formula = item.eval.replace(item.property, 'feature.properties.' + item.property);
                                value = eval(formula);
                            }
                            
                            let unit = '';
                            if ('unit' in item) {
                                unit = item.unit;
                            }

                            if ('link' in item) {
                                let link = self.options.baseLink;
                                if (link.endsWith('?')) {
                                    link = link + value;
                                } else {
                                    const arr = link.split('?');
                                    if (link.length > 1 && arr[1] !== '') {
                                        link = link + '&' + value;
                                    } else {
                                        link = link + '?' + value;
                                    }
                                }

                                popupString +=
                                    "<tr>" +
                                    "<td class='tg-j0tj'></td>" +
                                    "<td class='tg-j0tj'><a href='" + link + "'>" + item.name[self.options.language] + "</a></td>" +
                                    "</tr>";
                            } else {
                                popupString +=
                                    "<tr>" +
                                    "<td class='tg-j0tj'>" + item.name[self.options.language] + "</td>" +
                                    "<td class='tg-j0tj'>" + value + unit + "</td>" +
                                    "</tr>";
                            }
                        });

                        popupString += "</table></div>";
                        layer.bindPopup(popupString);
                    }
                }
            };

            console.log('geoJSONTileLayer url:', url);
            
            if (typeof L.geoJSONTileLayer !== 'undefined') {
                layerInstance = new L.geoJSONTileLayer(url, geojsonOptions);
            } else {
                console.error('L.geoJSONTileLayer non disponibile!');
            }

            return layerInstance;
        }

        // NUOVO: Supporto layer WMS (nuvole, pioggia, neve)
        createWMSLayer(name, url, dataLayer, extras) {
            console.log('Creando WMS layer:', name);
            
            // Estrai il base URL (prima del '?')
            const baseUrl = url.split('?')[0];
            
            // WMS options
            const wmsOptions = {
                layers: extras.layers || '',
                format: extras.format || 'image/png',
                transparent: extras.transparent !== false,
                version: extras.version || '1.3.0',
                attribution: extras.attribution || '',
                opacity: extras.opacity || 0.7
            };
            
            // Aggiungi parametri extra se presenti
            if (extras.styles) wmsOptions.styles = extras.styles;
            if (extras.time) wmsOptions.time = extras.time;
            if (extras.crs) wmsOptions.crs = L.CRS[extras.crs];
            
            const layer = L.tileLayer.wms(baseUrl, wmsOptions);
            
            return layer;
        }

        update(place, ncepDate) {
            if (place) this.options.place = place;
            if (ncepDate) this.options.ncepDate = ncepDate;
            
            this.changeDomain();
        }

        destroy() {
            if (this.map) {
                this.map.remove();
                this.map = null;
            }
        }
    }

    $(document).ready(function() {
        const mapContainer = $('#meteo_map_shortcode-root');
        
        if (mapContainer.length > 0) {
            const options = {
                place: mapContainer.data('place') || 'com63049',
                ncepDate: mapContainer.data('ncep-date') || null,
                mapName: mapContainer.data('map-name') || 'muggles',
                height: mapContainer.data('height') || '50vh',
                language: mapContainer.data('language') || 'it'
            };

            const meteoMap = new MeteoMap('meteo_map_shortcode-root', options);
            window.meteoMapInstance = meteoMap;
            
            console.log('✅ Mappa meteo inizializzata');
        }
    });

})(jQuery);