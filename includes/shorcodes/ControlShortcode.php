<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class ControlShortcode extends BaseShortcode{

    public function enqueueAssets(){
        wp_enqueue_script(
            'control-shortcode-js',
            $this->plugin_dir_url . 'static/js/shortcodes/control_shortcode.js',
            [],
            null,
            true
        );
    }

    public function prepareData($atts){
        return $this->getPlaceMetadata();
    }

    protected function generateHTML($data) {
        wp_localize_script('control-shortcode-js', 'controlData', $data);
        return '<div id="control_shortcode-root"></div>';
    }

}

?>