<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class UrlRewritingShortcode extends BaseShortcode{

    public function enqueueAssets(){
        wp_enqueue_script(
            'url-rewriting-shortcode',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/url_rewriting_shortcode.js',
            [],
            null,
            true
        );
    }

    public function prepareData($atts){
        return [
            'place_id' => get_post_meta(get_the_ID(),'place_id',true)
        ];
    }

    protected function generateHTML($data) {
        wp_localize_script('url-rewriting-shortcode','urlRewritingShortcodeData',$data);
        return '<div id="url_rewriting_shortcode-root"></div>';
    }
}

?>