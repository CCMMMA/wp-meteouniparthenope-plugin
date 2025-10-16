<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class UrlRewritingShortcode extends BaseShortcode{

    public function enqueueAssets(){
        wp_enqueue_script(
            'url-rewriting-shortcode',
            $this->plugin_dir_url . 'static/js/shortcodes/url_rewriting_shortcode.js',
            [],
            null,
            true
        );
    }

    public function prepareData($atts){
        $this->post_id = get_the_ID();
        return [
            'place_id' => get_post_meta($this->post_id,'place_id',true)
        ];
    }

    protected function generateHTML($data) {
        wp_localize_script('url-rewriting-shortcode','urlRewritingShortcodeData',$data);
        return '<div id="url_rewriting_shortcode-root"></div>';
    }
}

?>