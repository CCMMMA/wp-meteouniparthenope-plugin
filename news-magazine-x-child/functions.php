<?php
/**
 * Child Theme Functions
 * Funzioni personalizzate per New Magazine X Child
 */

// Sicurezza: impedisce l'accesso diretto
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Carica gli stili del tema padre e del child theme
 */
function new_magazine_x_child_enqueue_styles() {
    // Carica lo stile del tema padre
    wp_enqueue_style(
        'new-magazine-x-parent-style',
        get_template_directory_uri() . '/style.css',
        array(),
        wp_get_theme()->get('Version')
    );
    
    // Carica lo stile del child theme
    wp_enqueue_style(
        'new-magazine-x-child-style',
        get_stylesheet_directory_uri() . '/style.css',
        array('new-magazine-x-parent-style'),
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', 'new_magazine_x_child_enqueue_styles');

/**
 * Modifica l'excerpt per i post di tipo 'place' nei risultati di ricerca
 * per includere informazioni meteo (solo nell'excerpt, non nel contenuto completo)
 */
function modify_place_excerpt_for_search($excerpt) {
    if (is_search() && get_post_type() === 'place' && !is_singular()) {
        global $post;
        
        // Aggiunge informazioni meteo all'excerpt solo se non è già presente
        $place_id = get_post_meta($post->ID, 'place_id', true);
        $long_name_it = get_post_meta($post->ID, 'long_name_it', true);
        
        if ($place_id && $long_name_it) {
            $excerpt .= '<br><small><em>Località meteo disponibile per le previsioni</em></small>';
        }
    }
    
    return $excerpt;
}
add_filter('the_excerpt', 'modify_place_excerpt_for_search');

/**
 * Funzione di debug per verificare che il child theme sia attivo
 */
function debug_child_theme_active() {
    if (current_user_can('manage_options') && isset($_GET['debug_child_theme'])) {
        echo '<div style="background: #007cba; color: white; padding: 10px; margin: 10px 0;">Child Theme Attivo: New Magazine X Child</div>';
    }
}
add_action('wp_head', 'debug_child_theme_active');

/**
 * Aggiunge una classe CSS personalizzata al body per i risultati di ricerca
 */
function add_search_body_class($classes) {
    if (is_search()) {
        $classes[] = 'search-results';
    }
    return $classes;
}
add_filter('body_class', 'add_search_body_class');