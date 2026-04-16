<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class AddFavoritesShortcode extends BaseShortcode{

    public function enqueueAssets(){
        wp_enqueue_script(
            'add-favorites-shortcode-js',
            $this->plugin_dir_url . 'static/js/shortcodes/add_favorites_shortcode.js',
            [],
            null,
            true
        );
    }

    public function prepareData($atts) {
        return null;
    }

    protected function generateHTML($data){
        return '<div id="add_favorites_shortcode-root"></div>';
    }

}

?>