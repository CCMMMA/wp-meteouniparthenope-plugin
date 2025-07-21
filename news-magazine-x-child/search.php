<?php
/**
 * Template per i risultati di ricerca
 * New Magazine X Child Theme
 * Mantiene la struttura originale del tema padre
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

get_header();
?>

<div id="content" class="site-content">
    <main id="main" class="site-main">
        <div class="newsx-archive-page-wrap<?php echo esc_attr(newsx_get_boxed_content_class()); ?>">
            <?php
            // Page Header utilizzando la funzione del tema padre
            newsx_archive_page_header_markup( 'search', false );
            
            // Primary Content
            echo '<div id="primary" class="content-area primary">';
            
            // Utilizziamo la struttura del feed originale ma con le nostre personalizzazioni
            ?>
            
            <?php
            // Include Presets del tema padre
            require_once NEWSX_PARENT_DIR .'/template-parts/blog-page/presets/class-newsx-blog-posts-presets.php';
            
            // Get Layout Class (stesso del tema padre)
            $posts_layout = defined('NEWSX_CORE_PRO_VERSION') && newsx_core_pro_fs()->can_use_premium_code() ? newsx_get_option('bp_feed_layout') : 'list-7';
            if ( str_contains($posts_layout, 'list') ) {
                $layout_class = 'newsx-list-layout newsx-list-layout-'. $posts_layout;
            } else {
                $layout_class = 'newsx-grid-layout newsx-grid-layout-'. $posts_layout;
            }
            
            echo '<div class="newsx-posts-feed '. esc_attr($layout_class) .'">';
            
            // Edit Button (stesso del tema padre)
            echo newsx_customizer_edit_button_markup('bp_posts_feed');
            
            if ( have_posts() ) :
                // Loop Start
                while ( have_posts() ) :
                    the_post();
                    
                    // Per i post di tipo 'place', usiamo un template personalizzato
                    if ( get_post_type() === 'place' ) {
                        // Template personalizzato per i place
                        ?>
                        <article id="post-<?php the_ID(); ?>" <?php post_class('newsx-post-item'); ?>>
                            <div class="newsx-post-content">
                                <header class="entry-header">
                                    <h2 class="entry-title">
                                        <a href="<?php the_permalink(); ?>" rel="bookmark">
                                            <?php the_title(); ?>
                                        </a>
                                    </h2>
                                    
                                    <div class="entry-meta">
                                        <span class="post-type-badge">
                                            <?php echo esc_html__('Località Meteo', 'news-magazine-x-child'); ?>
                                        </span>
                                    </div>
                                </header>

                                <div class="entry-content">
                                    <?php
                                        // Aggiunge le informazioni meteo
                                    $place_id = get_post_meta(get_the_ID(), 'place_id', true);
                                    $long_name_it = get_post_meta(get_the_ID(), 'long_name_it', true);
                                    $coordinates = get_post_meta(get_the_ID(), 'coordinates', true);
                                    ?>
                                    <!-- Shortcode meteo -->
                                    <div class="meteo-preview">
                                        <h4><?php echo esc_html__('Previsioni Meteo', 'news-magazine-x-child'); ?></h4>
                                        <?php 
                                        $shortcode = '[plot_shortcode shortcode_id="' . get_the_ID() . '" control_form="STANDALONE" place="'.$place_id.'" product="wrf5" output="gen"]';
                                        echo do_shortcode($shortcode);
                                        ?>
                                    </div>
                                    <?php 
                                    // Mostra l'excerpt normale
                                    the_excerpt();
                                    ?>
                                    
                                    
                                </div>

                                <footer class="entry-footer">
                                    <a href="<?php the_permalink(); ?>" class="newsx-btn newsx-btn-primary">
                                        <?php echo esc_html__('Visualizza previsioni complete', 'news-magazine-x-child'); ?>
                                    </a>
                                </footer>
                            </div>
                        </article>
                        <?php
                    } else {
                        // Per tutti gli altri post, usa il template originale del tema
                        $posts_presets = new Newsx_Blog_Posts_Presets();
                        $posts_presets->display();
                    }
                    
                endwhile; // Loop End
                
                // Pagination (stesso del tema padre)
                get_template_part( 'template-parts/blog-page/pagination' );
                
            endif; // have_posts()
            
            echo '</div>'; // .newsx-posts-feed
            
            echo '</div>'; // #primary
            ?>
            
        </div> <!-- .newsx-archive-page-wrap -->
    </main>
</div>

<?php get_footer(); ?>