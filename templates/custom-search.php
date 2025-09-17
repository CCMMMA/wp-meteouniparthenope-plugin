<?php
/**
 * Custom Search Results Template
 * Questo file viene caricato dal plugin
 */

get_header(); ?>

<div class="custom-search-results">
    <header class="page-header">
        <h1 class="page-title">
            <?php printf('Search result for: %s', '<span>' . get_search_query() . '</span>'); ?>
        </h1>
    </header>
    <br>

    <main class="search-results-content">
        <?php if (have_posts()) : ?>
            <div class="search-results-list">
                <?php $i = 0; while (have_posts()) : the_post(); ?>
                    <article class="search-result-item <?php echo get_post_type(); ?>-result">
                        <?php if (get_post_type() === 'place') : ?>
                            <!-- Template per Place con preview meteo -->
                            <div class="place-result">
                                <div class="place-info">
                                    <h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                                    <p class="place-description"><?php the_excerpt(); ?></p>
                                    <?php
                                        $placeID = get_post_meta(get_the_id(), 'place_id', true);
                                        echo do_shortcode('[forecast_preview_shortcode shortcode_id="'.$i.'" place_id="'.$placeID.'" product="wrf5" output="gen"]');
                                    ?>
                                </div>
                                <div class="weather-preview" data-place-id="<?php echo get_the_ID(); ?>">
                                    <!-- <div class="weather-loading">Caricamento previsioni...</div> -->
                                    <div id="weathre-preview"> <?php 
                                        echo do_shortcode('[plot_shortcode shortcode_id="'.$i.'" control_forms="STANDALONE" place="'.$placeID.'" product="wrf5" output="gen"]');
                                        echo do_shortcode('[image_link_shortcode shortcode_id="'.$i.'" plot_id="'.$i.'"]');
                                        $i++;
                                        ?>
                                    </div>
                                    <!-- Il contenuto meteo verrà caricato via JavaScript -->
                                </div>
                            </div>
                        <?php else : ?>
                            <!-- Template standard per altri post types -->
                            <div class="standard-result">
                                <h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                                <div class="result-meta">
                                    <span class="post-type"><?php echo get_post_type_object(get_post_type())->labels->singular_name; ?></span>
                                    <span class="post-date"><?php echo get_the_date(); ?></span>
                                </div>
                                <p class="result-excerpt"><?php the_excerpt(); ?></p>
                            </div>
                        <?php endif; ?>
                    </article>
                    <br>
                <?php endwhile; ?>
            </div>
            
            <?php
            // Pagination
            the_posts_pagination(array(
                'mid_size' => 2,
                'prev_text' => __('← Precedente'),
                'next_text' => __('Successivo →'),
            ));
            ?>
            
        <?php else : ?>
            <div class="no-results">
                <h2>Nessun risultato trovato</h2>
                <p>Prova con termini di ricerca diversi.</p>
            </div>
        <?php endif; ?>
    </main>
</div>

<?php get_footer(); ?>