<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class VerticalProfileShortcode extends BaseShortcode{

    public function enqueueAssets(){
        wp_enqueue_script(
            'vertical-profile-shortcode-js',
            $this->plugin_dir_url . 'static/js/shortcodes/vertical_profile_shortcode.js',
            [],
            null,
            true
        );
    }

    public function prepareData($atts){
        return $this->getPlaceMetadata();
    }


    protected function generateHTML($data) {
        wp_localize_script('vertical-profile-shortcode-js', 'verticalProfileData', $data);
        return '<div id="vertical_profile_shortcode-root"></div>';
    }
}

?>