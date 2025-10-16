// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class MapShortcode extends BaseShortcode {
    
    public function enqueueAssets() {
        wp_enqueue_script(
            'map-shortcode-js',
            $this->plugin_url . 'static/js/shortcodes/map_shortcode.js',
            [],
            null,
            true
        );
    }
    
    public function prepareData($atts) {
        return $this->getPlaceMetadata();
    }
    
    protected function generateHTML($data) {
        wp_localize_script('map-shortcode-js', 'mapData', $data);
        return '<div id="map_shortcode-root"></div>';
    }
}