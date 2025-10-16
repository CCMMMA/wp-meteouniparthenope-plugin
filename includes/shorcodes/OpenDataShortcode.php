<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class OpenDataShortcode extends BaseShortcode {
    
    public function enqueueAssets() {
        wp_enqueue_script(
            'open-data-shortcode-js',
            $this->plugin_dir_url . 'static/js/shortcodes/open_data_shortcode.js',
            [],
            null,
            true
        );
    }
    
    public function prepareData($atts) {
        $this->post_id =get_the_ID();
        return ['place_id' => get_post_meta($this->post_id, 'place_id', true)];
    }
    
    protected function generateHTML($data) {
        wp_localize_script('open-data-shortcode-js', 'openDataData', $data);
        return '<div id="open_data_shortcode-root"></div>';
    }
}

?>