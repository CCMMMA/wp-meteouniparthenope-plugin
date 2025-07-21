<?php
get_header();
?>

<div class="wrap">
    <main id="primary" class="site-main">
        <?php
        if (have_posts()) :
            while (have_posts()) :
                the_post();

                // Recupero i meta fields
                $place_id = get_post_meta(get_the_ID(), 'place_id', true);
                $long_name = get_post_meta(get_the_ID(), 'long_name_it', true);
                $domain = get_post_meta(get_the_ID(), 'domain', true);
                $coordinates = get_post_meta(get_the_ID(), 'coordinates', true);
                $bbox = get_post_meta(get_the_ID(), 'bbox', true);
                $allowed_models = get_post_meta(get_the_ID(), 'allowed_models', true);
                $cards = get_post_meta(get_the_ID(), 'cards', true);

                // Parsing dei dati JSON
                $coords_array = json_decode($coordinates, true);
                $bbox_array = json_decode($bbox, true);
                $models_array = json_decode($allowed_models, true);
                $cards = json_decode($cards, true);
        ?>

                <article id="post-<?php the_ID(); ?>" <?php post_class('place-single'); ?>>
                    <header class="entry-header">
                        <h1 class="entry-title"><?php the_title(); ?></h1>
                        <?php if ($long_name && $long_name !== get_the_title()): ?>
                            <p class="place-long-name"><em><?php echo esc_html($long_name); ?></em></p>
                        <?php endif; ?>
                    </header>

                    <div class="entry-content">
                        <?php if (get_the_content()): ?>
                            <?php the_content(); ?>
                        <?php endif; ?>

                        <div class="place-details">
                            <h3>Dettagli del Posto</h3>

                            <?php if ($place_id): ?>
                                <div class="place-meta-item">
                                    <strong>ID:</strong> <?php echo esc_html($place_id); ?>
                                </div>
                            <?php endif; ?>

                            <?php if ($domain): ?>
                                <div class="place-meta-item">
                                    <strong>Dominio:</strong> <?php echo esc_html($domain); ?>
                                </div>
                            <?php endif; ?>

                            <?php if ($coords_array && is_array($coords_array) && count($coords_array) >= 2): ?>
                                <div class="place-meta-item">
                                    <strong>Coordinate:</strong>
                                    Latitudine: <?php echo esc_html($coords_array[0]); ?>,
                                    Longitudine: <?php echo esc_html($coords_array[1]); ?>
                                </div>
                            <?php endif; ?>

                            <?php if ($bbox_array && is_array($bbox_array)): ?>
                                <div class="place-meta-item">
                                    <strong>Bounding Box:</strong>
                                    <ul class="bbox-list">
                                        <?php foreach ($bbox_array as $index => $couple): ?>
                                            <?php if (is_array($couple) && isset($couple[0]) && is_array($couple[0]) && count($couple[0]) >= 2): ?>
                                                <li>Punto <?php echo ($index + 1); ?>: (<?php echo esc_html($couple[0][0]); ?>, <?php echo esc_html($couple[0][1]); ?>)</li>
                                            <?php endif; ?>
                                        <?php endforeach; ?>
                                    </ul>
                                </div>
                            <?php endif; ?>
                        </div>
                        <div class="forecast-container">
                            
                        </div>
                        <div class="plot-container">

                        </div>
                        <div class="istogram-container">

                        </div>
                    </div>
                </article>

        <?php
            endwhile;
        else :
            echo '<p>Nessun contenuto trovato.</p>';
        endif;
        ?>
    </main>
</div>

<?php
get_footer();
?>