<?php

namespace Meteouniparthenope\loaders;

class AssetsLoader{
    private $plugin_dir_path = METEOUNIPARTHENOPE_PLUGIN_DIR_ABS;
    private $plugin_dir_url = METEOUNIPARTHENOPE_PLUGIN_DIR;

    function loadAllAssets(){
        //HTML templates, styles and dependencies
        add_action('wp_enqueue_scripts', [$this,'meteounipplugin_enqueue_custom_styles']);
        add_action('wp_enqueue_scripts', [$this,'meteounipplugin_enqueue_frontend_tecnologies']);

        //JS data structures
        add_action('wp_enqueue_scripts',[$this,'meteounipplugin_enqueue_global_data']);
        
        // Leaflet plugins per mappa meteo (ORDINE CRITICO!)
        add_action('wp_enqueue_scripts', [$this,'meteounipplugin_enqueue_leaflet_plugins']);
    }

    

    // meteo@uniparthenope css style
    function meteounipplugin_enqueue_custom_styles(){
        wp_enqueue_style(
            'meteounipplugin-global-style',
            $this->plugin_dir_url . 'static/css/global_style.css',
            array(),
            filemtime($this->plugin_dir_path . 'static/css/global_style.css')
        );
        
        if (is_singular('places')) {
            wp_enqueue_style(
                'place-custom-style',
                $this->plugin_dir_url . 'static/css/place-custom-style.css',
                array(),
                filemtime($this->plugin_dir_path . 'static/css/place-custom-style.css')
            );
        }

        wp_enqueue_style(
            'loading-gif-style',
            $this->plugin_dir_url . 'static/css/loading_animation.css',
            array(),
            filemtime($this->plugin_dir_path . 'static/css/loading_animation.css')
        );
    }

    // Frontend files
    function meteounipplugin_enqueue_frontend_tecnologies(){
        wp_enqueue_style(
            'bootstrap-css',
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css'
        );

        // JS di Bootstrap (CORRETTO)
        
        wp_enqueue_script(
            'bootstrap-js',
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js', // <-- URL corretto per Bootstrap JS
            array('jquery'),
            '5.3.7',
            true
        );


        // jQueryUI
        wp_enqueue_script(
            'jQueryUI-js',
            'https://code.jquery.com/ui/1.14.1/jquery-ui.js',
            array(),
            '1.14.1',
            true
        );
        wp_enqueue_style(
            'jQueryUI-css',
            'https://code.jquery.com/ui/1.14.1/themes/base/jquery-ui.css',
            array(),
            '1.14.1',
            true
        );

        //if (is_singular('places') || is_singular('instruments')) {

            wp_enqueue_script(
                'canvasjs-core', 
                'https://cdn.canvasjs.com/ga/canvasjs.min.js', 
                array(), 
                '3.10.6', 
                true
            );
            
            
            // Carica CanvasJS Stock (dipende dal core)
            wp_enqueue_script(
                'canvasjs-stock', 
                'https://cdn.canvasjs.com/ga/canvasjs.stock.min.js', 
                array('canvasjs-core'), // <-- Dipendenza importante!
                '3.10.6', 
                true
            );

            wp_enqueue_script(
                'chartjs',
                'https://cdn.jsdelivr.net/npm/chart.js',
                array(),
                '4.5.0',
                true
            );

            wp_enqueue_script(
                'chartjs-adapter-date-fns',
                'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js',
                array('chartjs'),
                '3.0.0',
                true
            );

            //Leaflet CSS
            wp_enqueue_style(
                'leaflet-css',
                'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
                array(),
                '1.9.4'
            );
            
            // Leaflet JavaScript
            wp_enqueue_script(
                'leaflet-js',
                'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
                array(),
                '1.9.4',
                true
            );

            //Leaflet to image
            wp_enqueue_script(
                'leaflet-to-image',
                'https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-image/v0.0.4/leaflet-image.js',
                array(),
                '0.0.4'
            );
            wp_enqueue_style(
                'mapbox-css',
                'https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css',
                array(),
                '3.12.0'
            );
            wp_enqueue_script(
                'mapbox-js',
                'https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.js',
                array(),
                '3.12.'
            );
        //}
        wp_enqueue_script(
            'js-cookie',
            'https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/dist/js.cookie.min.js',
            array(),
            '3.0.5'
        );
    }
    
    // Leaflet plugins necessari per la mappa meteo
    // ORDINE CRITICO: questi devono essere caricati PRIMA di meteo_map_shortcode.js
    function meteounipplugin_enqueue_leaflet_plugins(){
        
        // ========================================
        // CSS per i plugin Leaflet
        // ========================================
        
        // Leaflet Velocity (vento)
        wp_enqueue_style(
            'leaflet-velocity-css',
            $this->plugin_dir_url . 'static/css/leaflet-plugins/leaflet-velocity.min.css',
            array('leaflet-css'),
            '1.0.0'
        );
        
        // Control Loading
        wp_enqueue_style(
            'leaflet-control-loading-css',
            $this->plugin_dir_url . 'static/css/leaflet-plugins/Control.Loading.css',
            array('leaflet-css'),
            '1.0.0'
        );
        
        // ========================================
        // JavaScript plugin Leaflet
        // ORDINE IMPORTANTISSIMO!
        // ========================================
        
        // 1. Spin.js (per il loading spinner)
        wp_enqueue_script(
            'spin-js',
            $this->plugin_dir_url . 'static/js/leaflet-plugins/spin.js',
            array(),
            '2.3.2',
            true
        );
        
        // 2. Control.Loading (dipende da spin.js e leaflet)
        wp_enqueue_script(
            'leaflet-control-loading-js',
            $this->plugin_dir_url . 'static/js/leaflet-plugins/Control.Loading.js',
            array('leaflet-js', 'spin-js'),
            '1.0.0',
            true
        );
        
        // 3. Leaflet Velocity (visualizzazione vento)
        wp_enqueue_script(
            'leaflet-velocity-js',
            $this->plugin_dir_url . 'static/js/leaflet-plugins/leaflet-velocity.min.js',
            array('leaflet-js'),
            '1.0.0',
            true
        );
        
        // 4. GeoJSON Tile Layer (CRUCIALE! - deve essere caricato PRIMA di geojson-layer)
        wp_enqueue_script(
            'leaflet-geojson-tile-layer-js',
            $this->plugin_dir_url . 'static/js/leaflet-plugins/geojson-tile-layer.js',
            array('leaflet-js'),
            '1.0.0',
            true
        );
        
        // 5. GeoJSON Layer (per le tile meteo - dipende da geojson-tile-layer)
        wp_enqueue_script(
            'leaflet-geojson-layer-js',
            $this->plugin_dir_url . 'static/js/leaflet-plugins/geojson-layer.js',
            array('leaflet-js', 'leaflet-geojson-tile-layer-js'),
            '1.0.0',
            true
        );
        
        // 6. Grouped Layer Control
        wp_enqueue_script(
            'leaflet-grouped-layer-control-js',
            $this->plugin_dir_url . 'static/js/leaflet-plugins/leaflet.groupedlayercontrol.js',
            array('leaflet-js'),
            '1.0.0',
            true
        );
        
        // Navionics Web API (per mappe nautiche - opzionale)
        wp_enqueue_style(
            'navionics-css',
            'https://webapiv2.navionics.com/dist/webapi/webapi.min.css',
            array(),
            '2.0.0'
        );
        
        wp_enqueue_script(
            'navionics-js',
            'https://webapiv2.navionics.com/dist/webapi/webapi.min.no-dep.js',
            array('leaflet-js'),
            '2.0.0',
            true
        );
    }

    // Global data
    function meteounipplugin_enqueue_global_data(){
        wp_enqueue_script(
            'global-data-js',
            $this->plugin_dir_url . 'static/js/global_data.js',
            [],
            null,
            true
        );
        
        $data = [
            "PLUGIN_DIR" => $this->plugin_dir_url,
            "LOADING_DIR" => $this->plugin_dir_url."static/resources/images",
            // AGGIUNGO API_BASE_URL GLOBALE
            "API_BASE_URL" => "https://api.meteo.uniparthenope.it",
            "WEATHER_ICON_URL" => "https://api.meteo.uniparthenope.it/static/img/weather/"
        ];
        wp_localize_script('global-data-js', 'globalData', $data);
        
        wp_enqueue_script(
            'DateFormatter-class-js',
            $this->plugin_dir_url . 'static/js/shortcodes/DateFormatter.js',
            [],
            null,
            true
        );
        wp_enqueue_script(
            'ControlFormDate-class-js',
            $this->plugin_dir_url . 'static/js/shortcodes/ControlFormDate.js',
            [],
            null,
            true
        );
        wp_enqueue_script(
            'ForecastTable-class-js',
            $this->plugin_dir_url . 'static/js/shortcodes/ForecastTable.js',
            [],
            null,
            true
        );
        wp_enqueue_script(
            'ForecastSubtable-class-js',
            $this->plugin_dir_url . 'static/js/shortcodes/ForecastSubtable.js',
            [],
            null,
            true
        );
        wp_enqueue_script(
            'InstrumentsMap-class-js',
            $this->plugin_dir_url . 'static/js/shortcodes/InstrumentsMap.js',
            [],
            null,
            true
        );

        wp_enqueue_script(
            'meteo-unip-recent',
            $this->plugin_dir_url . 'static/js/cookies.js',
            [],
            '1.0.0',
            true
        );
        wp_localize_script('meteo-unip-recent', 'MeteoUnipCookieData', [
            'restUrl'      => esc_url_raw(rest_url('meteounip/v1')),
            'nonce'        => wp_create_nonce('wp_rest'), // nonce standard REST API di WP
            'currentPlace' => is_singular('places') ? get_post_meta(get_the_ID(), 'place_id', true) : null,
        ]);
    }
}

?>