// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class ForecastPreviewShortcode implements BaseShortcode{
    private static $instanceCount = 0;
    
    public function enqueueAssets() {
        wp_enqueue_script(
            'forecast-preview-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/forecast_preview_shortcode.js',
            [],
            null,
            true
        );
    }
    
    public function prepareData($atts) {
        $place = isset($atts['place_id']) ? esc_js($atts['place_id']) : get_post_meta($this->post_id, 'place_id', true);
        $product = isset($atts['product']) ? esc_js($atts['product']) : "wrf5";
        $output = isset($atts['output']) ? esc_js($atts['output']) : "gen";
        
        return [
            'id' => 'forecast_preview_shortcode-root-' . self::$instanceCount++,
            'place' => $place,
            'product' => $product,
            'output' => $output
        ];
    }
    
    protected function generateHTML($data) {
        $inlineScript = sprintf(
            'new ForecastPreview({container_id: "%s", place: "%s", product: "%s", output: "%s"});',
            $data['id'],
            $data['place'],
            $data['product'],
            $data['output']
        );
        
        wp_add_inline_script('forecast-preview-shortcode-js', $inlineScript);
        return '<div id="' . $data['id'] . '"></div>';
    }
}