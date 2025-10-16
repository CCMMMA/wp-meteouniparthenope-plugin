<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class LiveChartShortcode extends BaseShortcode{

    public function enqueueAssets(){
        wp_enqueue_script(
            'live-chart-shortcode-js',
            $this->plugin_dir_url . 'static/js/shortcodes/live_chart_shortcode.js',
            [],
            null,
            true
        );
    }

    public function prepareData($atts) {
        return null;
    }

    protected function generateHTML($data){
        return '<div id="live_chart_shortcode-root"></div>';
    }

}

?>