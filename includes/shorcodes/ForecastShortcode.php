<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class ForecastShortcode extends BaseShortcode {
    
    public function enqueueAssets() {
        wp_enqueue_script(
            'forecast-shortcode-js',
            $this->plugin_dir_url . 'static/js/shortcodes/forecast_shortcode.js',
            [],
            null,
            true
        );
    }
    
    public function prepareData($atts) {
        $metadata = $this->getPlaceMetadata();
        return [
            'place_id' => $metadata['place_id'],
            'long_name_it' => $metadata['long_name_it'],
            'imagesUrl' => $this->plugin_dir_url . 'static/resources/images',
            'pluginUrl' => $this->plugin_dir_url
        ];
    }
    
    protected function generateHTML($data) {
        wp_localize_script('forecast-shortcode-js', 'forecastData', $data);
        return '<div id="forecast_shortcode-root"></div>';
    }
}

?>