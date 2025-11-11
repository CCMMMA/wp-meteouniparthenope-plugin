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

        if (is_singular('places')) {

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
        }
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
            "LOADING_DIR" => $this->plugin_dir_url."static/resources/images"
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
    }
}

?>