<?php

namespace Meteouniparthenope\cpts;

class CustomPostTypePlace implements MeteoCustomPostType{
    
    public function registerCTP(){
        $labels = array(
            'name'               => 'Places',
            'singular_name'      => 'Place',
            'menu_name'          => 'Places',
            'name_admin_bar'     => 'Place',
            'add_new'            => 'Add New',
            'add_new_item'       => 'Add New Place',
            'new_item'           => 'New Place',
            'edit_item'          => 'Edit Place',
            'view_item'          => 'View Place',
            'all_items'          => 'All Places',
            'search_items'       => 'Search Places',
            'parent_item_colon'  => 'Parent Places:',
            'not_found'          => 'No places found.',
            'not_found_in_trash' => 'No places found in Trash.',
        );

        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'has_archive'        => true,
            'show_in_search'     => true,
            'exclude_from_search'=> false,
            'show_ui'            => true,
            'show_in_menu'       => false,
            'show_in_rest'       => true,
            'rewrite'            => array('slug' => 'places', 'with_front' => false),
            'supports'           => array('title', 'editor', 'excerpt', 'custom-fields')
        );

        register_post_type('places', $args);
    }
}

?>