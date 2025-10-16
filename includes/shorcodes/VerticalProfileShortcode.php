// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class VerticalProfileShortcode implements BaseShortcode{

    public function enqueueAssets(){
        wp_enqueue_script(
            'vertical-profile-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/vertical_profile_shortcode.js',
            [],
            null,
            true
        );
    }

    public function prepareData($atts){
        $metadata = $this->getPlaceMetadata();
        return [
            'place_id' => $metadata['place_id'],
            'long_name_it' => $metadata['long_name_it'],
            'coordinates' => json_decode($metadata['coordinates']),
            'bbox' => json_decode($metadata['bbox'])
        ];
    }


    protected function generateHTML($data) {
        wp_localize_script('vertical-profile-shortcode-js', 'verticalProfileData', $data);
        return '<div id="vertical_profile_shortcode-root"></div>';
    }
}