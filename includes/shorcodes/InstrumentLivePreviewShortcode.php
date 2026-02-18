<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// CONCRETE CLASSES FOR EVERY SHORTCODE
// ============================================

class InstrumentLivePreviewShortcode extends BaseShortcode{

    private static $instanceCount = 0;

    public function enqueueAssets(){
        wp_enqueue_script(
            'instruments-live-preview-shortcode-js',
            $this->plugin_dir_url . 'static/js/shortcodes/instruments_live_preview_shortcode.js',
            [],
            null,
            true
        );
    }

    public function prepareData($atts) {
        $this->post_id = get_the_ID();
        $instrument_id = isset($atts['instrument_id']) ? esc_js($atts['instrument_id']) : get_post_meta($this->post_id, 'instrument_id', true);

        return [
            'id' => 'instrument_live_preview_shortcode-root-' . self::$instanceCount++,
            'instrument_id' => $instrument_id
        ];
    }

    protected function generateHTML($data){
        $inlineScript = sprintf(
            'new InstrumentLivePreview({container_id: "%s", instrument_id: "%s"});',
            $data['id'],
            $data['instrument_id']
        );
        
        wp_add_inline_script('instruments-live-preview-shortcode-js', $inlineScript);
        return '<div id="' . $data['id'] . '"></div>';
    }

}

?>