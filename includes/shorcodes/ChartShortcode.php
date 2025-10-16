<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class ChartShortcode extends BaseShortcode {
    
    public function enqueueAssets() {
        wp_enqueue_script(
            'chart-shortcode-js',
            $this->plugin_url . 'static/js/shortcodes/chart_shortcode.js',
            [],
            null,
            true
        );
    }
    
    public function prepareData($atts) {
        $metadata = $this->getPlaceMetadata();
        return [
            'place_id' => $metadata['place_id'],
            'long_name_it' => $metadata['long_name_it']
        ];
    }
    
    protected function generateHTML($data) {
        wp_localize_script('chart-shortcode-js', 'chartData', $data);
        return '<div id="chart_shortcode-root"></div>';
    }
}

?>