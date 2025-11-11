<?php

namespace Meteouniparthenope\loaders;

class SearchLoader{
    public function loadSearchComponents(){
        add_action('pre_get_posts', [$this,'meteounipplugin_include_place_in_search'], 99);
        add_filter('template_include', [$this,'meteounipplugin_use_custom_search_template']);
        add_action('wp_enqueue_scripts', [$this,'meteounipplugin_enqueue_custom_search_styles']);
        add_filter('the_content', [$this,'meteounipplugin_autocomplete_search_injection']);
    }

    function meteounipplugin_include_place_in_search($query){
        if(is_search() && $query->is_main_query()){             // Ensure you only alter your desired query
            
            $post_types = $query->get('post_type');             // Get the currnet post types in the query
            
            if(!is_array($post_types) && !empty($post_types)){   // Check that the current posts types are stored as an array
                $post_types = explode(',', $post_types);
            }
            
            if(empty($post_types)){                              // If there are no post types defined, be sure to include posts so that they are not ignored
                $post_types[] = 'post';
            }         
            $post_types[] = 'places';                         // Add your custom post type
            
            $post_types = array_map('trim', $post_types);       // Trim every element, just in case
            $post_types = array_filter($post_types);            // Remove any empty elements, just in case

            $query->set('post_type', $post_types);              // Add the updated list of post types to your query

        }

        return $query;
    }

    function meteounipplugin_use_custom_search_template($template) {
        if (is_search()) {
            $custom_template = plugin_dir_path(__FILE__) . 'templates/custom-search.php';
            if (file_exists($custom_template)) {
                return $custom_template;
            }
        }
        return $template;
    }

    function meteounipplugin_enqueue_custom_search_styles() {
        if (is_search()) {
            wp_enqueue_style(
                'custom-search-style',
                plugin_dir_url(__FILE__) . 'static/css/custom-search-style.css',
                array(),
                '1.0.0'
            );
        }
    }

    // Autocomplete shortcode injection
    function meteounipplugin_autocomplete_search_injection($content){
        $content = '[autocomplete_search_shortcode]' . $content;
        return $content;
    }

}

?>