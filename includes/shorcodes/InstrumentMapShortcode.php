<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class InstrumentMapShortcode extends BaseShortcode {
    private static $instanceCount = 0;

    private static $mapRender = false;
    
    public function enqueueAssets() {
        /*    
        wp_enqueue_script(
                'instrument-map-shortcode-js',
                $this->plugin_dir_url . 'static/js/shortcodes/instrument_map_shortcode.js',
                [],
                null,
                true
            );
        */
    }
    
    public function prepareData($atts) {
        /*
        $this->post_id = get_the_ID();
        $instrument_id = isset($atts['instrument_id']) ? esc_js($atts['instrument_id']) : get_post_meta($this->post_id, 'instrument_id', true);
        $long_name = get_post_meta($this->post_id, 'long_name', true);
        $lat = get_post_meta($this->post_id, 'latitude', true);
        $long = get_post_meta($this->post_id, 'longitude', true);
        $variablesNames = isset($atts['variables']) ? esc_js($atts['variables']) : get_post_meta($this->post_id, 'variablesNames', true);
        $variablesDescriptions = isset($atts['variables_desc']) ? esc_js($atts['variables_desc']) : get_post_meta($this->post_id, 'variablesDescriptions', true);
        $mode = "POST";
        if(isset($atts['mode'])){
            if($atts['mode']=="STANDALONE"){
                $mode = "STANDALONE";
                //$variables = isset($atts['variable']) ? esc_js($atts['variable']) : null;
            }
        }

        return [
            'id' => 'instrument_shortcode-root-' . self::$instanceCount++,
            'instrument_id' => $instrument_id,
            'long_name' => $long_name,
            'lat' => $lat,
            'long' => $long,
            'variablesNames' => $variablesNames,
            'variablesDescriptions' => $variablesDescriptions,
            'mode' => $mode
        ];
        */
    }
    
    protected function generateHTML($data) {
        /*
        $variablesNames_string = isset($data['variablesNames']) ? $data['variablesNames'] : "[]";
        $variablesDescriptions_string = isset($data['variablesDescriptions']) ? $data['variablesDescriptions'] : "[]";
        $inlineScript = sprintf(
            'new InstrumentLiveChart({instrument_id: "%s", long_name: "%s", lat: "%s", long: "%s" , mode: "%s", variablesName: %s, variablesDescription: %s});',
            $data['instrument_id'],
            $data['long_name'],
            $data['lat'],
            $data['long'],
            $data['mode'],
            $variablesNames_string,
            $variablesDescriptions_string
        );
        
        
        wp_add_inline_script('instrument-map-shortcode-js', $inlineScript);
        return '<div id="' . $data['id'] . '"></div>';
        */
        if(!$this->mapRender){
            $this->mapRender = true;
            return '<div id="instrument_shortcode-map-root"></div>';
        }
    }
}

?>