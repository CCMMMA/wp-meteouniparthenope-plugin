<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class AutocompleteSearchShortcode extends BaseShortcode{

    public function enqueueAssets(){
        wp_enqueue_script(
            'autocomplete-search-shortcode-js',
            $this->plugin_dir_url . 'static/js/shortcodes/autocomplete_search_shortcode.js',
            [],
            null,
            true
        );
    }

    public function prepareData($atts) {
        return null;
    }

    protected function generateHTML($data){
        return '<div id="autocomplete_search_shortcode-root"></div>';
    }

    
}

?>