<?php

namespace Meteouniparthenope\loaders;

class PlaceLoader{
    private $plugin_dir_path = METEOUNIPARTHENOPE_PLUGIN_DIR_ABS;
    private $plugin_dir_url = METEOUNIPARTHENOPE_PLUGIN_DIR;

    public function loadPlaceComponents(){
        add_filter('template_include', [$this, 'meteounipplugin_use_custom_place_template']);
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
}

?>