<?php
get_header();
?>

<div class="wrap">
    <main id="primary" class="site-main">
        <article id="post-<?php the_ID(); ?>" <?php post_class('instrument-single'); ?>>
            <header class="entry-header">
                <h1 class="entry-title"><?php the_title(); ?></h1>
            </header>

            <div class="entry-content">
                <?php if (get_the_content()): ?>
                    <?php the_content(); ?>
                <?php endif; ?>

                <?php echo do_shortcode('[instrument_map_shortcode]'); ?>
                <?php echo do_shortcode('[instrument_shortcode]'); ?>

            </div>
        </article>
    </main>
</div>

<?php
get_footer();
?>