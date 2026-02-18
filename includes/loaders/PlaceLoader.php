<?php

namespace Meteouniparthenope\loaders;

class PlaceLoader{
    private $plugin_dir_path = METEOUNIPARTHENOPE_PLUGIN_DIR_ABS;
    private $plugin_dir_url = METEOUNIPARTHENOPE_PLUGIN_DIR;

    public function loadPlaceComponents(){
        add_filter('template_include', [$this, 'meteounipplugin_use_custom_place_template']);
        add_filter('template_include', [$this,'meteounipplugin_use_custom_places_list_template']);
        add_action('wp_enqueue_scripts', [$this,'meteounipplugin_enqueue_custom_places_list_styles']);
    }

    function meteounipplugin_use_custom_place_template($template) {
        if (is_singular('places')) {
            $theme_template = get_stylesheet_directory() . '/single-places.php';
            if (file_exists($theme_template)) {
                return $theme_template;
            }
            return $this->plugin_dir_path . 'templates/single-places.php';
        }
        return $template;
    }

    function meteounipplugin_use_custom_places_list_template($template){
        if (is_post_type_archive('places')) {
            $theme_template = get_stylesheet_directory() . '/archive-places.php';
            if (file_exists($theme_template)) {
                return $theme_template;
            }
            return $this->plugin_dir_path . 'templates/archive-places.php';
        }
    
        return $template;
    }

    function meteounipplugin_enqueue_custom_places_list_styles() {
        if (is_post_type_archive('places')) {
            wp_enqueue_style(
                'custom-search-style',
                $this->plugin_dir_url . 'static/css/custom-search-style.css',
                array(),
                '1.0.0'
            );
        }
    }
}

?>