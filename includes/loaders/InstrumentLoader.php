<?php

namespace Meteouniparthenope\loaders;

class InstrumentLoader{
    private $plugin_dir_path = METEOUNIPARTHENOPE_PLUGIN_DIR_ABS;
    private $plugin_dir_url = METEOUNIPARTHENOPE_PLUGIN_DIR;

    public function loadInstrumentComponents(){
        add_filter('template_include', [$this, 'meteounipplugin_use_custom_instrument_template']);
        add_filter('template_include', [$this,'meteounipplugin_use_custom_instruments_list_template']);
        add_action('wp_enqueue_scripts', [$this,'meteounipplugin_enqueue_custom_instruments_list_styles']);
    }

    function meteounipplugin_use_custom_instrument_template($template) {
        if (is_singular('instruments')) {
            $theme_template = get_stylesheet_directory() . '/single-instruments.php';
            if (file_exists($theme_template)) {
                return $theme_template;
            }
            return $this->plugin_dir_path . 'templates/single-instruments.php';
        }
        return $template;
    }

    function meteounipplugin_use_custom_instruments_list_template($template){
        if (is_post_type_archive('instruments')) {
            $theme_template = get_stylesheet_directory() . '/archive-instruments.php';
            if (file_exists($theme_template)) {
                return $theme_template;
            }
            return $this->plugin_dir_path . 'templates/archive-instruments.php';
        }
    
        return $template;
    }

    function meteounipplugin_enqueue_custom_instruments_list_styles() {
        if (is_post_type_archive('instruments')) {
            wp_enqueue_style(
                'custom-search-instruments-style',
                $this->plugin_dir_url . 'static/css/custom-search-instruments-style.css',
                array(),
                '1.0.0'
            );
        }
    }
}

?>