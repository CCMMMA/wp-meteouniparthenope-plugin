<?php

namespace Meteouniparthenope\cpts;

class CustomPostTypeInstruments implements MeteoCustomPostType{

    public function registerCTP(){
        $labels = array(
            'name'               => 'Instruments',
            'singular_name'      => 'Instrument',
            'menu_name'          => 'Instruments',
            'name_admin_bar'     => 'Instrument',
            'add_new'            => 'Add New',
            'add_new_item'       => 'Add New Instrument',
            'new_item'           => 'New Instrument',
            'edit_item'          => 'Edit Instrument',
            'view_item'          => 'View Instrument',
            'all_items'          => 'All Instruments',
            'search_items'       => 'Search Instruments',
            'parent_item_colon'  => 'Parent Instruments:',
            'not_found'          => 'No instruments found.',
            'not_found_in_trash' => 'No instruments found in Trash.',
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
            'rewrite'            => array('slug' => 'instruments', 'with_front' => false),
            'supports'           => array('title', 'editor', 'excerpt', 'custom-fields')
        );

        register_post_type('instruments', $args);
    }
}

?>