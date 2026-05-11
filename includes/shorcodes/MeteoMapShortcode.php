<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// SHORTCODE PER MAPPA METEO
// ============================================

class MeteoMapShortcode extends BaseShortcode {
    
    public function enqueueAssets() {
        // IMPORTANTE: Specifica TUTTE le dipendenze nell'ordine corretto!
        wp_enqueue_script(
            'meteo-map-shortcode-js',
            $this->plugin_dir_url . 'static/js/shortcodes/meteo_map_shortcode.js',
            [
                'jquery',                           // jQuery
                'leaflet-js',                       // Leaflet core
                'leaflet-geojson-tile-layer-js',   // GeoJSON Tile Layer (DEVE essere caricato!)
                'leaflet-geojson-layer-js',        // GeoJSON Layer
                'leaflet-velocity-js',             // Velocity layer
                'leaflet-control-loading-js',      // Loading control
                'js-cookie'                         // Cookies
            ],
            '1.0.0',
            true  // Carica nel footer
        );
    }
    
    public function prepareData($atts) {
        // Attributi dello shortcode con valori di default
        $attributes = shortcode_atts([
            'place' => 'com63049',           // Codice luogo (default: Napoli area)
            'map_name' => 'muggles',         // Nome della mappa
            'height' => '50vh',              // Altezza della mappa
            'ncep_date' => null,             // Data NCEP (se null, usa data corrente)
            'language' => 'it'               // Lingua (it, en, etc.)
        ], $atts);
        
        return $attributes;
    }
    
    protected function generateHTML($data) {
        // Passa i dati come data attributes al div
        $html = sprintf(
            '<div id="meteo_map_shortcode-root" 
                  data-place="%s" 
                  data-map-name="%s" 
                  data-height="%s" 
                  data-ncep-date="%s"
                  data-language="%s"
                  style="width: 100%%; position: relative;">
             </div>',
            esc_attr($data['place']),
            esc_attr($data['map_name']),
            esc_attr($data['height']),
            esc_attr($data['ncep_date'] ?? ''),
            esc_attr($data['language'])
        );
        
        return $html;
    }
}

?>