<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class DateControlShortcode extends BaseShortcode{
    
    public function enqueueAssets(){
        wp_enqueue_script(
            'control-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/date_control_shortcode.js',
            [],
            null,
            true
        );
    }

    public function prepareData($atts) {
        return null;
    }

    protected function generateHTML($data) {
        return '<div id="date_control_shortcode-root"></div>';
    }
}

?>