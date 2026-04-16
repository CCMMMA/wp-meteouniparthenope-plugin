<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class ShowFavoritesShortcode extends BaseShortcode{

    public function enqueueAssets(){
        wp_enqueue_script(
            'show-favorites-shortcode-js',
            $this->plugin_dir_url . 'static/js/shortcodes/show_favorites_shortcode.js',
            [],
            null,
            true
        );
    }

    public function prepareData($atts) {
        return null;
    }

    protected function generateHTML($data){
        // Solo frontend, mai in admin
        if (is_admin()) return '';
        
        return '<section class="meteo-recent-places-section" aria-label="' 
            . esc_attr__('Favorites', 'meteounip') . '">'
            . '<h2>' . esc_html__('Favorites', 'meteounip') . '</h2>'
            . '<div id="show_favorites_shortcode-root" aria-live="polite"></div>'
            . '</section>';
        
            return '<div id="show_favorites_shortcode-root"></div>';
    }

}

?>