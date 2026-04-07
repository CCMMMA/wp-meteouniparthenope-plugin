<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class MeteoRecentPlacesShortcode extends BaseShortcode{

    public function enqueueAssets(){

    }

    public function prepareData($atts) {
        return null;
    }

    protected function generateHTML($data){
        // Solo frontend, mai in admin
        if (is_admin()) return '';
        
        return '<section class="meteo-recent-places-section" aria-label="' 
            . esc_attr__('Recents', 'meteounip') . '">'
            . '<h2>' . esc_html__('Recents', 'meteounip') . '</h2>'
            . '<div id="meteo-recent-places" aria-live="polite"></div>'
            . '</section>';
    }

}

?>