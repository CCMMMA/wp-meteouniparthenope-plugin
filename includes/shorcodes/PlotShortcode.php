<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class PlotShortcode extends BaseShortcode {
    private static $instanceCount = 0;
    
    public function enqueueAssets() {
        wp_enqueue_script(
            'plot-shortcode-js',
            $this->plugin_dir_url . 'static/js/shortcodes/plot_shortcode.js',
            [],
            null,
            true
        );
    }
    
    public function prepareData($atts) {
        $place = isset($atts['place_id']) ? esc_js($atts['place_id']) : get_post_meta($this->post_id, 'place_id', true);
        $product = isset($atts['product']) ? esc_js($atts['product']) : null;
        $output = isset($atts['output']) ? esc_js($atts['output']) : null;
        $controlForms = isset($atts['control_forms']) ? esc_js($atts['control_forms']) : null;
        
        return [
            'id' => 'plot_shortcode-root-' . self::$instanceCount++,
            'place' => $place,
            'product' => $product,
            'output' => $output,
            'controlForms' => $controlForms
        ];
    }
    
    protected function generateHTML($data) {
        $inlineScript = sprintf(
            'new MeteoPlot({container_id: "%s", place: "%s", product: "%s", output: "%s", controlForms: "%s"});',
            $data['id'],
            $data['place'],
            $data['product'],
            $data['output'],
            $data['controlForms']
        );
        
        wp_add_inline_script('plot-shortcode-js', $inlineScript);
        return '<div id="' . $data['id'] . '"></div>';
    }
}

?>