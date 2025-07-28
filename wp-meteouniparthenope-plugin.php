<?php
/**
 * Plugin Name: meteo@uniparthenope-plugin
 * Description: Management system for meteo@uniparthenope.it
 * Author: Francesco Peluso
 * Author URI: 
 * Version: Alphav1.0
 * Text Domain: meteo@uniparthenope
 */

//use Kirki\Section_Types\Expanded;

 //Security system
use includes\API\PlacesAPI;
use includes\executors\WPPlaceExecutor;
use includes\JSONParser\PlaceParser;

if (!defined( 'ABSPATH' )) {
    exit; // Exit if accessed directly
}

spl_autoload_register(function ($class_name) {
    $base_dir = plugin_dir_path(__FILE__) . 'includes/';
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base_dir));

    foreach ($iterator as $file) {
        if ($file->isFile() && $file->getExtension() === 'php') {
            if (strpos($file->getFilename(), '.php') !== false) {
                require_once $file->getPathname();
            }
        }
    }
});

class MeteoUniParthenopePluginMain{
    private $CPTPlaces = array();

    function __construct()
    {
        //Registrazione del CTP del place
        add_action('init', [$this,'meteounipplugin_register_cpt_place']);
        add_action('admin_menu', [$this,'meteounipplugin_add_admin_menu']);
        
        //Per la ricerca nativa di wordpress
        add_action('pre_get_posts', [$this,'meteounipplugin_include_place_in_search'], 99);
        //add_filter('posts_search', [$this,'meteounipplugin_extend_place_in_search'], 20, 2);

        //HTML templates, styles and dependencies
        add_filter('template_include', [$this, 'meteounipplugin_use_custom_place_template']);
        add_action('wp_enqueue_scripts', [$this,'meteounipplugin_enqueue_custom_styles']);   
        add_action('wp_enqueue_scripts', [$this,'meteounipplugin_enqueue_frontend_tecnologies']);

        //JS data structures
        add_action('wp_enqueue_scripts',[$this,'meteounipplugin_enqueue_global_data']);

        //Shortcodes
        add_shortcode('forecast_shortcode', [$this,'forecast_shortcode_callback']);
        add_shortcode('control_shortcode',[$this, 'control_shortcode_callback']);
        add_shortcode('date_control_shortcode',[$this, 'date_control_shortcode_callback']);
        add_shortcode('plot_shortcode', [$this,'plot_shortcode_callback']);
        add_shortcode('chart_shortcode', [$this,'chart_shortcode_callback']);
        add_shortcode('map_shortcode', [$this,'map_shortcode_callback']);
        add_shortcode('live_chart_shortcode',[$this,'live_chart_shortcode_callback']);
        add_shortcode('open_data_shortcode',[$this,'open_data_shortcode_callback']);
        add_shortcode('autocomplete_search_shortcode',[$this,'autocomplete_search_shortcode_callback']);

        //Other plugins functionalities
        add_action('wp_ajax_add_single_place', [$this, 'handle_add_single_place']);
        add_filter('the_content', [$this,'meteounipplugin_autocomplete_search_injection']);
    }

    //1) "Place" CPT registration
    function meteounipplugin_register_cpt_place() {
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
            'has_archive'        => true,
            'show_in_search'     => true,
            'exclude_from_search' => false,
            'show_ui'            => true,
            'show_in_menu'       => false,
            'supports'           => array('title', 'editor', 'excerpt', 'custom-fields')
        );

        register_post_type('place', $args);
        flush_rewrite_rules();
    }

    // 3. Adding custom plugin menu + submenu
    function meteounipplugin_add_admin_menu() {
        add_menu_page(
            'meteo@uniparthenope-plugin',
            'meteo@uniparthenope-plugin',
            'manage_options',
            'meteounipplugin_dashboard',
            [$this,'meteounipplugin_render_dashboard_page'],
            'dashicons-cloud'
        );

        add_submenu_page(
            'meteounipplugin_dashboard',
            'Dashboard',
            'Dashboard',
            'manage_options',
            'meteounipplugin_dashboard',
            [$this,'meteounipplugin_render_dashboard_page']
        );

        add_submenu_page(
            'meteounipplugin_dashboard',
            'Places',
            'Places',
            'manage_options',
            'edit.php?post_type=place'
        );

        add_submenu_page(
            'meteounipplugin_dashboard',
            'Utility',
            'Utility',
            'manage_options',
            'meteounipplugin_utility',
            [$this,'meteounipplugin_render_utility_page']
        );
    }
    
    // 4. Dashboard menu page
    function meteounipplugin_render_dashboard_page() {
        ?>
        <div class="wrap">
            <h1>Welcome to meteo@uniparthenope plugin dashboard!</h1>
            <p>Uses the following links to dive into plugin's sections:</p>

            <ul style="list-style: none; margin-left: 0; padding-left: 0;">
                <li style="margin-bottom: 10px;">
                    <a href="<?php echo admin_url('edit.php?post_type=place'); ?>" class="button button-primary">Places management</a>
                </li>
                <li style="margin-bottom: 10px;">
                    <a href="<?php echo admin_url('admin.php?page=meteounipplugin_utility'); ?>" class="button">Plugin utilities</a>
                </li>
            </ul>
        </div>
        <?php
    }

    // 5. API import function in the "Utility" menu page
    //$api_url="https://api.meteo.uniparthenope.it/places/search/byboundingbox/41.46/13.78/39.50/15.06"; //594 places
    //$api_url = "https://api.meteo.uniparthenope.it/places/search/bycoords/40.83/14.24"; //Pochi per prova
    //$api_url = "https://api.meteo.uniparthenope.it/places"; //Tutti i place
    function meteounipplugin_render_utility_page() {
        echo '<div class="wrap"><h1>Importa Places da API</h1>';
        //IMPORT places
        if (isset($_POST['meteounipplugin_import_places']) && check_admin_referer('meteounipplugin_import_nonce')) {
            //$api_url="https://api.meteo.uniparthenope.it/places/search/byboundingbox/41.46/13.78/39.50/15.06"; //594 places
            $api_url = "https://api.meteo.uniparthenope.it/places/search/bycoords/40.83/14.24"; //Pochi per prova
            //$api_url = "https://api.meteo.uniparthenope.it/places"; //Tutti i place
            //2,3) Richiesta recupero dati e recupero JSON
            $api = new PlacesAPI;
            $jsonString = $api->getData($api_url);

            //4,5) Richiesta parsing e dati parsati
            $jsonParser = new PlaceParser;
            $placesList = $jsonParser->parseFromJSON($jsonString);
            //console_log($placesList);
            
            //6,7)Creazione dei posts
            $wpExecutor = new WPPlaceExecutor;
            $status = $wpExecutor->executePostsCreation($placesList);

            //8)Controllo status
            if($status != 0){
                echo "Something went wrong...!";
            }

            echo '<div class="notice notice-success"><p>Importazione completata!</p></div>';
        }

        //Form: Importa
        echo '<form method="post">';
        wp_nonce_field('meteounipplugin_import_nonce');
        submit_button('Importa Places', 'primary', 'meteounipplugin_import_places');
        echo '</form></div>';

        // ELIMINA places
        if (isset($_POST['meteounipplugin_delete_places']) && check_admin_referer('meteounipplugin_delete_nonce')) {
            $deleted = $this->meteounipplugin_delete_all_places();
            echo '<div class="notice notice-error"><p>' . $deleted . ' place eliminati definitivamente.</p></div>';
        }

        // Form: Elimina
        echo '<form method="post">';
        wp_nonce_field('meteounipplugin_delete_nonce');
        submit_button('Elimina tutti i Places', 'delete', 'meteounipplugin_delete_places');
        echo '</form>';

        echo '</div>';
    }

    function meteounipplugin_delete_all_places(): int {
        $args = array(
            'post_type' => 'place',
            'post_status' => 'any',
            'numberposts' => -1
        );

        $places = get_posts($args);
        $count = 0;

        foreach ($places as $place) {
            wp_delete_post($place->ID, true); // true = elimina definitivamente
            $count++;
        }

        return $count;
    }

    /*
    function meteounipplugin_places_search_shortcode(){
        $output = '';

        // Prendo il termine di ricerca dal parametro GET 'titolo' (o lo puoi rinominare a piacere)
        $termine = isset($_GET['titolo']) ? sanitize_text_field($_GET['titolo']) : '';

        // Form di ricerca
        $output .= '<form method="get" action="' . esc_url(get_permalink()) . '">';
        $output .= '<input type="text" name="titolo" placeholder="Cerca place per titolo..." value="' . esc_attr($termine) . '" />';
        $output .= '<button type="submit">Cerca</button>';
        $output .= '</form>';

        // Se è stato inserito un termine, faccio la query
        if (!empty($termine)) {
            $args = array(
                'post_type' => 'place',       // Qui cambio il CPT
                'posts_per_page' => 100,
                's' => $termine,              // Termine di ricerca
            );

            $query = new WP_Query($args);

            if ($query->have_posts()) {
                $output .= '<ul>';
                while ($query->have_posts()) {
                    $query->the_post();
                    $output .= '<li><a href="' . get_permalink() . '">' . get_the_title() . '</a></li>';
                }
                $output .= '</ul>';
            } else {
                $output .= '<p>Nessun place trovato.</p>';
            }

            wp_reset_postdata();
        }

        return $output;
    }
    */

    function meteounipplugin_include_place_in_search($query){
        if(is_search() && $query->is_main_query()){             // Ensure you only alter your desired query
            
            $post_types = $query->get('post_type');             // Get the currnet post types in the query
            
            if(!is_array($post_types) && !empty($post_types)){   // Check that the current posts types are stored as an array
                $post_types = explode(',', $post_types);
            }
            
            if(empty($post_types)){                              // If there are no post types defined, be sure to include posts so that they are not ignored
                $post_types[] = 'post';
            }         
            $post_types[] = 'place';                         // Add your custom post type
            
            $post_types = array_map('trim', $post_types);       // Trim every element, just in case
            $post_types = array_filter($post_types);            // Remove any empty elements, just in case

            $query->set('post_type', $post_types);              // Add the updated list of post types to your query

        }

        return $query;
    }

    /*
    function meteounipplugin_extend_place_in_search($search, $wp_query){
        global $wpdb;
        
        if (!is_admin() && $wp_query->is_search() && $wp_query->is_main_query()) {
            $search_term = $wp_query->get('s');
            console_log($search_term);
            
            if (!empty($search_term)) {
                // Modifica la query per cercare anche nel contenuto
                $search = " AND (
                    ({$wpdb->posts}.post_title LIKE '%{$search_term}%') 
                    OR ({$wpdb->posts}.post_content LIKE '%{$search_term}%')
                    OR ({$wpdb->posts}.post_excerpt LIKE '%{$search_term}%')
                ) ";
            }
        }
        
        return $search;
    }
    */

    function meteounipplugin_use_custom_place_template($template) {
        if (is_singular('place')) {
            $theme_template = get_stylesheet_directory() . '/single-place.php';
            if (file_exists($theme_template)) {
                return $theme_template;
            }
            return plugin_dir_path(__FILE__) . 'templates/single-place.php';
        }
        return $template;
    }

    // Forecast shortcode
    function forecast_shortcode_callback($atts) {
        $post_id = get_the_ID();
        $placeID = get_post_meta($post_id, 'place_id', true);
        $longNameIT = get_post_meta($post_id, 'long_name_it', true);
        
        $data = [
            'place_id' => $placeID,
            'long_name_it' => $longNameIT
        ];
        $data['imagesUrl'] = plugin_dir_url(__FILE__) . 'static/resources/images';
        $data['pluginUrl'] = plugin_dir_url(__FILE__);

        wp_enqueue_script(
            'forecast-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/forecast_shortcode.js',
            [],
            null,
            true
        );

        wp_localize_script('forecast-shortcode-js', 'forecastData', $data);

        return '<div id="forecast_shortcode-root"></div>';
    }

    // Control shortcode
    function control_shortcode_callback($atts) {
        //Ottenimento dei metadati salvati
        $post_id = get_the_ID();
        $placeID = get_post_meta($post_id, 'place_id', true);
        $longNameIT = get_post_meta($post_id, 'long_name_it', true);
        $domain = get_post_meta($post_id, 'domain', true);
        $coordinates = get_post_meta($post_id, 'coordinates', true);
        $bbox = get_post_meta($post_id, 'bbox', true);
        $availableProducts = get_post_meta($post_id, 'available_products', true);

        //Preparazione dati per shortcode
        $data = [
            'place_id' => $placeID,
            'long_name_it' => $longNameIT,
            'domain' => $domain,
            'coordinates' => json_decode($coordinates),
            'bbox' => json_decode($bbox),
            'available_products' => json_decode($availableProducts)
        ];


        wp_enqueue_script(
            'control-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/control_shortcode.js',
            [],
            null,
            true
        );

        wp_localize_script('control-shortcode-js', 'controlData', $data);

        return '<div id="control_shortcode-root"></div>';
    }

    // Date and time forms shortcode
    function date_control_shortcode_callback($atts) {
        wp_enqueue_script(
            'control-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/date_control_shortcode.js',
            [],
            null,
            true
        );
        return '<div id="date_control_shortcode-root"></div>';
    }

    // Plot shortcode
    function plot_shortcode_callback($atts) {
        static $shortcode_instances = [];
        
        $post_id = get_the_ID();
        $placeID = get_post_meta($post_id, 'place_id', true);
        
        $data = [
            'place_id' => $placeID
        ];
        
        $returnString = null;
        
        if(isset($atts['control_forms'])){
            $data['control_forms'] = $atts['control_forms'];

            if(isset($atts['shortcode_id'])){
                $data['shortcode_id'] = $atts['shortcode_id'];
                $data['place_id'] = $atts['place'];
                $data['product'] = $atts['product'];
                $data['output'] = $atts['output'];
                $returnString = '<div id="plot_shortcode-root-'.$atts['shortcode_id'].'"></div>';
                
                // Aggiungi all'array statico
                $shortcode_instances[$atts['shortcode_id']] = $data;
            }
            else{
                $shortcode_instances['default'] = $data;
            }
        }

        
        wp_enqueue_script(
            'plot-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/plot_shortcode.js',
            [],
            null,
            true
        );
        
        // Passa tutti gli shortcode instances
        wp_localize_script('plot-shortcode-js', 'allPlotData', $shortcode_instances);
        
        return $returnString ? $returnString : '<div id="plot_shortcode-root"></div>';
    }

    // Chart shortcode
    function chart_shortcode_callback($atts) {
        $post_id = get_the_ID();
        $placeID = get_post_meta($post_id, 'place_id', true);
        $longNameIT = get_post_meta($post_id, 'long_name_it', true);

        $data = [
            'place_id' => $placeID,
            'long_name_it' => $longNameIT,
        ];

        wp_enqueue_script(
            'chart-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/chart_shortcode.js',
            [],
            null,
            true
        );

        wp_localize_script('chart-shortcode-js', 'chartData', $data);

        return '<div id="chart_shortcode-root"></div>';
    }

    // Map shortcode
    function map_shortcode_callback($atts){
        $post_id = get_the_ID();
        $placeID = get_post_meta($post_id, 'place_id', true);
        $longNameIT = get_post_meta($post_id, 'long_name_it', true);
        $coordinates = get_post_meta($post_id, 'coordinates', true);
        $bbox = get_post_meta($post_id, 'bbox', true);

        $data = [
            'place_id' => $placeID,
            'long_name_it' => $longNameIT,
            'coordinates' => json_decode($coordinates),
            'bbox' => json_decode($bbox),
        ];

        wp_enqueue_script(
            'map-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/map_shortcode.js',
            [],
            null,
            true
        );

        wp_localize_script('map-shortcode-js', 'mapData', $data);

        return '<div id="map_shortcode-root"></div>';
    }

    // Live chart shortcode
    function live_chart_shortcode_callback(){
        wp_enqueue_script(
            'live-chart-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/live_chart_shortcode.js',
            [],
            null,
            true
        );

        return '<div id="live_chart_shortcode-root"></div>';
    }

    // Open data shortcode
    function open_data_shortcode_callback(){
        $post_id = get_the_ID();
        $placeID = get_post_meta($post_id, 'place_id', true);
        $longNameIT = get_post_meta($post_id, 'long_name_it', true);
        $coordinates = get_post_meta($post_id, 'coordinates', true);
        $bbox = get_post_meta($post_id, 'bbox', true);

        $data = [
            'place_id' => $placeID,
        ];

        wp_enqueue_script(
            'open-data-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/open_data_shortcode.js',
            [],
            null,
            true
        );

        wp_localize_script('open-data-shortcode-js', 'openDataData', $data);

        return '<div id="open_data_shortcode-root"></div>';
    }

    // Global data
    function meteounipplugin_enqueue_global_data(){
        wp_enqueue_script(
            'global-data-js',
            plugin_dir_url(__FILE__) . 'static/js/global_data.js',
            [],
            null,
            true
        );
        
        $data = [
            "PLUGIN_DIR" => plugin_dir_url(__FILE__),
            "LOADING_DIR" => plugin_dir_url(__FILE__)."static/resources/images"
        ];
        wp_localize_script('global-data-js', 'globalData', $data);
        

        wp_enqueue_script(
            'Plot-class-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/MeteoPlot.js',
            [],
            null,
            true
        );
        wp_enqueue_script(
            'DateFormatter-class-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/DateFormatter.js',
            [],
            null,
            true
        );
        wp_enqueue_script(
            'ControlFormDate-class-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/ControlFormDate.js',
            [],
            null,
            true
        );
    }

    // Autocomplete shortcode
    function autocomplete_search_shortcode_callback($atts){
        $CPTPlaces = array();    
        // Query per recuperare tutti i post del custom post type "place"
        $args = array(
            'post_type' => 'place',
            'post_status' => 'publish',
            'posts_per_page' => -1, // -1 per recuperare tutti i post
            'orderby' => 'title',
            'order' => 'ASC'
        );
        
        $places_query = new WP_Query($args);
        
        if ($places_query->have_posts()) {
            while ($places_query->have_posts()) {
                $places_query->the_post();
                
                // Crea l'array associativo con titolo => link
                $CPTPlaces[get_the_title()] = get_permalink();
            }
            wp_reset_postdata();
        }

        wp_enqueue_script(
            'autocomplete-search-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/autocomplete_search_shortcode.js',
            [],
            null,
            true
        );

        wp_localize_script('autocomplete-search-shortcode-js','CPTPlaces', $CPTPlaces);

        return '<div id="autocomplete_search_shortcode-root"></div>';
    }

    // Autocomplete shortcode injection
    function meteounipplugin_autocomplete_search_injection($content){
        if( is_search() || is_home() ){
        }
        $content = '[autocomplete_search_shortcode]' . $content;
        return $content;
    }

    // Frontend files
    function meteounipplugin_enqueue_frontend_tecnologies(){
        wp_enqueue_style(
            'bootstrap-css',
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css'
        );
        /*
        wp_enqueue_style(
            'bootstrap-css',
            'https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css'
        );
        */

        // JS di Bootstrap (CORRETTO)
        
        wp_enqueue_script(
            'bootstrap-js',
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js', // <-- URL corretto per Bootstrap JS
            array('jquery'),
            '5.3.7',
            true
        );
        
        /*
        wp_enqueue_script(
            'bootstrap-js',
            'https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js', // <-- URL corretto per Bootstrap JS
            array('jquery'),
            '4.0.0',
            true
        );
        */

        // jQueryUI
        wp_enqueue_script(
            'jQueryUI-js',
            'https://code.jquery.com/ui/1.14.1/jquery-ui.js',
            array(),
            '1.14.1',
            true
        );
        wp_enqueue_style(
            'jQueryUI-css',
            'https://code.jquery.com/ui/1.14.1/themes/base/jquery-ui.css',
            array(),
            '1.14.1',
            true
        );

        if (is_singular('place')) {

            wp_enqueue_script(
                'canvasjs-core', 
                'https://cdn.canvasjs.com/ga/canvasjs.min.js', 
                array(), 
                '3.10.6', 
                true
            );
            
            
            // Carica CanvasJS Stock (dipende dal core)
            wp_enqueue_script(
                'canvasjs-stock', 
                'https://cdn.canvasjs.com/ga/canvasjs.stock.min.js', 
                array('canvasjs-core'), // <-- Dipendenza importante!
                '3.10.6', 
                true
            );

            wp_enqueue_script(
                'chartjs',
                'https://cdn.jsdelivr.net/npm/chart.js',
                array(),
                '4.5.0',
                true
            );

            wp_enqueue_script(
                'chartjs-adapter-date-fns',
                'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js',
                array('chartjs'),
                '3.0.0',
                true
            );

            //Leaflet CSS
            wp_enqueue_style(
                'leaflet-css',
                'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
                array(),
                '1.9.4'
            );
            
            // Leaflet JavaScript
            wp_enqueue_script(
                'leaflet-js',
                'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
                array(),
                '1.9.4',
                true
            );

            //Leaflet to image
            wp_enqueue_script(
                'leaflet-to-image',
                'https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-image/v0.0.4/leaflet-image.js',
                array(),
                '0.0.4'
            );
            wp_enqueue_style(
                'mapbox-css',
                'https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css',
                array(),
                '3.12.0'
            );
            wp_enqueue_script(
                'mapbox-js',
                'https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.js',
                array(),
                '3.12.'
            );
        }
    }

    // meteo@uniparthenope css syle
    function meteounipplugin_enqueue_custom_styles(){
        if (is_singular('place')) {
            wp_enqueue_style(
                'place-custom-style',
                plugin_dir_url(__FILE__) . 'static/css/place-custom-style.css',
                array(), // Nessuna dipendenza
                filemtime(plugin_dir_path(__FILE__) . 'static/css/place-custom-style.css') // Versione dinamica per cache busting
            );
        }
    }
}


$pluginMainInstance = new MeteoUniparthenopePluginMain;









//https://api.meteo.uniparthenope.it/places/search/byboundingbox/41.46/13.78/39.50/15.06

// Utility function
function console_log($data) {
    echo '<script>';
    echo 'console.log(' . json_encode($data) . ')';
    echo '</script>';
}

?>
