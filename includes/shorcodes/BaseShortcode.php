<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// ABSTRACT BSE CLASS OF SHORTCODES
// ============================================

abstract class BaseShortcode implements ShortcodeInterface {
    protected $plugin_dir_url;
    protected $post_id;
    
    public function __construct() {
        $this->plugin_dir_url = METEOUNIPARTHENOPE_PLUGIN_DIR;
        $this->post_id = get_the_ID();
    }
    
    // Template method pattern
    public function render($atts) {
        $this->enqueueAssets();
        $data = $this->prepareData($atts);
        return $this->generateHTML($data);
    }

    abstract public function enqueueAssets();

    abstract public function prepareData($atts);
    
    abstract protected function generateHTML($data);
    
    // Helper for obtainning place's metadata
    protected function getPlaceMetadata() {
        return [
            'place_id' => get_post_meta($this->post_id, 'place_id', true),
            'long_name_it' => get_post_meta($this->post_id, 'long_name_it', true),
            'coordinates' => json_decode(get_post_meta($this->post_id, 'coordinates', true)),
            'bbox' => json_decode(get_post_meta($this->post_id, 'bbox', true)),
            'available_products' => json_decode(get_post_meta($this->post_id, 'available_products', true))
        ];
    }
}

?>