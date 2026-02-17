<?php

namespace Meteouniparthenope\loaders;

class InstrumentLoader{
    private $plugin_dir_path = METEOUNIPARTHENOPE_PLUGIN_DIR_ABS;
    private $plugin_dir_url = METEOUNIPARTHENOPE_PLUGIN_DIR;

    public function loadInstrumentComponents(){
        add_filter('template_include', [$this, 'meteounipplugin_use_custom_instrument_template']);
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
}

?>