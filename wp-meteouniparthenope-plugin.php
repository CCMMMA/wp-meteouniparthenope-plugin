<?php
/**
 * Plugin Name: meteo@uniparthenope-plugin
 * Description: Management system for meteo@uniparthenope.it
 * Authors: Francesco Peluso
 * Author URI: 
 * Version: 1.0
 * Text Domain: meteo@uniparthenope
 */

//use Kirki\Section_Types\Expanded;

 //Security system

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * PSR-4 Autoloader per il plugin
 */
spl_autoload_register(function ($class) {
    // Il namespace root del plugin
    $prefix = 'Meteouniparthenope\\';
    $base_dir = plugin_dir_path(__FILE__) . 'includes/';
    
    // Controlla se la classe usa il namespace del plugin
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return; // Non è una classe del nostro plugin
    }
    
    // Rimuovi il prefix dal nome della classe
    $relative_class = substr($class, $len);
    
    // Converti il namespace in percorso file
    // Es: Meteouniparthenope\API\PlacesAPI -> includes/API/PlacesAPI.php
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    
    // Se il file esiste, caricalo
    if (file_exists($file)) {
        require_once $file;
    }
});

define('METEOUNIPARTHENOPE_PLUGIN_URL', plugins_url('', __FILE__));
define('METEOUNIPARTHENOPE_PLUGIN_DIR', plugin_dir_url(__FILE__));
define('METEOUNIPARTHENOPE_PLUGIN_DIR_ABS', plugin_dir_path(__FILE__));

use Meteouniparthenope\restapi\PlaceRESTController;
use Meteouniparthenope\shorcodes\ShortcodeFactory;

class MeteoUniParthenopePluginMain{
    static $plotIDs = 0;
    static $forecastPreviewIDs = 0;
    private $api_controller; // Nuova proprietà

    function __construct()
    {
        //Registrazione del CTP del place
        add_action('init', [$this,'meteounipplugin_register_cpt_place']);
        add_action('admin_menu', [$this,'meteounipplugin_add_admin_menu']);

        // REST API registration
        add_action('rest_api_init', [$this, 'meteounipplugin_init_rest_api']);
        
        //Per la ricerca nativa di wordpress
        add_action('pre_get_posts', [$this,'meteounipplugin_include_place_in_search'], 99);
        add_filter('template_include', [$this,'meteounipplugin_use_custom_search_template']);
        add_action('wp_enqueue_scripts', [$this,'meteounipplugin_enqueue_custom_search_styles']);
        //add_filter('posts_search', [$this,'meteounipplugin_extend_place_in_search'], 20, 2);

        //HTML templates, styles and dependencies
        add_filter('template_include', [$this, 'meteounipplugin_use_custom_place_template']);
        add_action('wp_enqueue_scripts', [$this,'meteounipplugin_enqueue_custom_styles']);   
        add_action('wp_enqueue_scripts', [$this,'meteounipplugin_enqueue_frontend_tecnologies']);
        add_action('admin_enqueue_scripts', [$this,'meteounipplugin_enqueue_admin_assets']);

        //JS data structures
        add_action('wp_enqueue_scripts',[$this,'meteounipplugin_enqueue_global_data']);

        //Shortcodes
        add_action('init',[ShortcodeFactory::class, 'registerAll']);
        /*
        add_shortcode('forecast_shortcode', [$this,'forecast_shortcode_callback']);
        add_shortcode('forecast_preview_shortcode', [$this, 'forecast_preview_shortcode_callback']);
        add_shortcode('control_shortcode',[$this, 'control_shortcode_callback']);
        add_shortcode('date_control_shortcode',[$this, 'date_control_shortcode_callback']);
        add_shortcode('plot_shortcode', [$this,'plot_shortcode_callback']);
        add_shortcode('chart_shortcode', [$this,'chart_shortcode_callback']);
        add_shortcode('map_shortcode', [$this,'map_shortcode_callback']);
        add_shortcode('live_chart_shortcode',[$this,'live_chart_shortcode_callback']);
        add_shortcode('vertical_profile_shortcode',[$this,'vertical_profile_shortcode_callback']);
        add_shortcode('open_data_shortcode',[$this,'open_data_shortcode_callback']);
        add_shortcode('autocomplete_search_shortcode',[$this,'autocomplete_search_shortcode_callback']);
        add_shortcode('url_rewriting_shortcode',[$this,'url_rewriting_shortcode_callback']);
        */

        //prova
        //add_shortcode('prova_shortcode',[$this,'prova_shortcode_callback']);

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
            'edit.php?post_type=places'
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

    function meteounipplugin_init_rest_api(){
        //$this->api_controller = new PlacesAPIController();
        $this->api_controller = new PlaceRESTController();
        $this->api_controller->register_routes();
    }
    
    // 4. Dashboard menu page
    function meteounipplugin_render_dashboard_page() {
        ?>
        <div class="wrap">
            <h1>Welcome to meteo@uniparthenope plugin dashboard!</h1>
            <p>Uses the following links to dive into plugin's sections:</p>

            <ul style="list-style: none; margin-left: 0; padding-left: 0;">
                <li style="margin-bottom: 10px;">
                    <a href="<?php echo admin_url('edit.php?post_type=places'); ?>" class="button button-primary">Places management</a>
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
    /*
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
    */

    function meteounipplugin_render_utility_page(){
        $template_data = array(
            //'nonce_single_place' => wp_create_nonce('add_single_place_nonce'),
            //'nonce_import_places' => wp_create_nonce('import_places_nonce'),
            'place_count' => wp_count_posts('places')//,
            //'ajaxurl' => admin_url('admin-ajax.php')
        );

        extract($template_data);

        $template_path = plugin_dir_path(__FILE__) . 'templates/admin_utility_page.php';
        // Verifica che il file esista
        if (file_exists($template_path)) {
            // Cattura l'output del template
            ob_start();
            include $template_path;
            $content = ob_get_clean();
            echo $content;
        } else {
            echo '<div class="notice notice-error"><p>Template non trovato: ' . $template_name . '</p></div>';
        }
    }

    /*
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
    */

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

    /*
    function forecast_preview_shortcode_callback($atts){
        static $forecast_preview_shortcode_instances = [];
        $returnString = null;
        $data = [];
        if(isset($atts['shortcode_id'])){
            $data['shortcode_id'] = $atts['shortcode_id'];
            $returnString = '<div id="forecast_preview_shortcode-root-'.$atts['shortcode_id'].'"></div>';
            $data['place_id'] = $atts['place_id'];
            $data['product'] = $atts['product'];
            $data['output'] = $atts['output'];
            $data['imagesUrl'] = plugin_dir_url(__FILE__) . 'static/resources/images';
            $data['pluginUrl'] = plugin_dir_url(__FILE__);
            
            // Aggiungi all'array statico
            $forecast_preview_shortcode_instances[$atts['shortcode_id']] = $data;
        }
        else{
            $forecast_preview_shortcode_instances['default'] = $data;
        }

        wp_enqueue_script(
            'forecast-preview-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/forecast_preview_shortcode.js',
            [],
            null,
            true
        );
        
        wp_localize_script('forecast-preview-shortcode-js', 'allForecastPreviewData', $forecast_preview_shortcode_instances);

        return $returnString ? $returnString : '<div id="image_link_shortcode-root"></div>';
    }
    */
    function forecast_preview_shortcode_callback($atts){
        $id = 'forecast_preview_shortcode-root-'.self::$forecastPreviewIDs++;
        $place = null;
        $product  = "wrf5";
        $output = "gen";
        if(isset($atts['place_id'])){
            $place = $atts['place_id'];
        }
        if(isset($atts['product'])){
            $product = $atts['product'];
        }
        if(isset($atts['output'])){
            $output = $atts['output'];
        }

        wp_enqueue_script(
            'forecast-preview-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/forecast_preview_shortcode.js',
            [],
            null,
            true
        );
        
        wp_add_inline_script('forecast-preview-shortcode-js', 
            'new ForecastPreview({container_id: "'.$id.'",place: "'.$place.'",product: "'.$product.'",output: "'.$output.'"});'
        );
        $returnString = '<div id="'.$id.'"></div>';
        return $returnString;
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
        if (is_singular('places')) {
            $theme_template = get_stylesheet_directory() . '/single-places.php';
            if (file_exists($theme_template)) {
                return $theme_template;
            }
            return plugin_dir_path(__FILE__) . 'templates/single-places.php';
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

    // Forecast shortcode
    function dynamic_forecast_shortcode_callback($atts) {
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
            'dynamic-forecast-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/dynamic_forecast_shortcode.js',
            [],
            null,
            true
        );

        wp_localize_script('forecast-shortcode-js', 'dynamicForecastData', $data);

        return '<div id="dynamic_forecast_shortcode-root"></div>';
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

    // Plot shortcodeo
    function plot_shortcode_callback($atts) {
        $id = 'plot_shortcode-root-'.self::$plotIDs++;
        $place = null;
        $product = null;
        $output = null;
        $controlForms = null;
        $inPlace = false;
        if(isset($atts['control_forms'])){
            $controlForms = esc_js($atts['control_forms']);
            if($atts['control_forms'] != "FULL"){
                if(isset($atts['in_place'])){
                    if($atts['in_place'] == "ture"){
                        $inPlace = true;
                        $place = get_post_meta(get_the_ID(),'place_id',true);
                    }
                    else{
                        $place = esc_js($atts['place_id']);
                    }
                }
                else{
                    $place = esc_js($atts['place_id']);
                }
                $product = esc_js($atts['product']);
                $output = esc_js($atts['output']);
            }
            else{
                $place = get_post_meta(get_the_ID(),'place_id',true);
            }
        }

        wp_enqueue_script(
            'plot-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/plot_shortcode.js',
            [],
            null,
            true
        );
        
        wp_add_inline_script('plot-shortcode-js', 
            'new MeteoPlot({container_id: "'.$id.'",place: "'.$place.'",product: "'.$product.'", output: "'.$output.'", controlForms: "'.$controlForms.'", dateForm_id: "control-select-date", timeForm_id: "control-select-time", productForm_id: "control-select-product", outputForm_id: "control-select-output", inPlace: "'.$inPlace.'"});'
        );
        $returnString = '<div id="'.$id.'"></div>';
        return $returnString;
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

    function vertical_profile_shortcode_callback(){
        wp_enqueue_script(
            'vertical-profile-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/vertical_profile_shortcode.js',
            [],
            null,
            true
        );

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

        wp_localize_script('vertical-profile-shortcode-js', 'verticalProfileData', $data);

        return '<div id="vertical_profile_shortcode-root"></div>';
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

    function url_rewriting_shortcode_callback($atts){
        wp_enqueue_script(
            'url-rewriting-shortcode',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/url_rewriting_shortcode.js',
            [],
            null,
            true
        );

        $urlRewritingShortcodeData['place_id'] = get_post_meta(get_the_ID(),'place_id',true);

        wp_localize_script('url-rewriting-shortcode','urlRewritingShortcodeData',$urlRewritingShortcodeData);
        
        return '<div id="url_rewriting_shortcode-root"></div>';
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
        
        /*
        wp_enqueue_script(
            'Plot-class-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/MeteoPlot.js',
            [],
            null,
            true
        );
        */
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
        wp_enqueue_script(
            'ForecastTable-class-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/ForecastTable.js',
            [],
            null,
            true
        );
        wp_enqueue_script(
            'ForecastSubtable-class-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/ForecastSubtable.js',
            [],
            null,
            true
        );
    }

    // Autocomplete shortcode
    function autocomplete_search_shortcode_callback($atts){
        wp_enqueue_script(
            'autocomplete-search-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/autocomplete_search_shortcode.js',
            [],
            null,
            true
        );

        return '<div id="autocomplete_search_shortcode-root"></div>';
    }

    // Autocomplete shortcode injection
    function meteounipplugin_autocomplete_search_injection($content){
        if( is_search() || is_home() ){
        }
        $content = '[autocomplete_search_shortcode]' . $content;
        return $content;
    }

    function prova_shortcode_callback($atts){
        if (wp_script_is('prova-shortcode-js')){
            wp_dequeue_script('prova-shortcode-js');
        }
        wp_enqueue_script(
            'prova-shortcode-js',
            plugin_dir_url(__FILE__) . 'static/js/shortcodes/prova_shortcode.js',
            [],
            null,
            true
        );

        wp_localize_script('prova-shortcode-js','provaShortcodeData',$atts);

        return '<div id="prova_shortcode_'.$atts['shortcode_id'].'-root"></div>';
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

        if (is_singular('places')) {

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
        wp_enqueue_style(
            'meteounipplugin-global-style',
            plugin_dir_url(__FILE__) . 'static/css/global_style.css',
            array(), // Nessuna dipendenza
            filemtime(plugin_dir_path(__FILE__) . 'static/css/global_style.css') // Versione dinamica per cache busting
        );
        
        if (is_singular('places')) {
            wp_enqueue_style(
                'place-custom-style',
                plugin_dir_url(__FILE__) . 'static/css/place-custom-style.css',
                array(), // Nessuna dipendenza
                filemtime(plugin_dir_path(__FILE__) . 'static/css/place-custom-style.css') // Versione dinamica per cache busting
            );
        }

        wp_enqueue_style(
            'loading-gif-style',
            plugin_dir_url(__FILE__) . 'static/css/loading_animation.css',
            array(), // Nessuna dipendenza
            filemtime(plugin_dir_path(__FILE__) . 'static/css/loading_animation.css') // Versione dinamica per cache busting
        );
    }

    function meteounipplugin_enqueue_admin_assets($hook) {
        // Controlla sia il nome completo che quello semplificato della pagina
        if ($hook === 'meteouniparthenope-plugin_page_meteounipplugin_utility' || 
            $hook === 'meteo@uniparthenope-plugin_page_meteounipplugin_utility' ||
            strpos($hook, 'meteounipplugin_utility') !== false) {
            
            wp_enqueue_style(
                'admin-utility-page-style',
                plugin_dir_url(__FILE__) . 'static/css/admin_utility_page.css',
                array(),
                filemtime(plugin_dir_path(__FILE__) . 'static/css/admin_utility_page.css')
            );

            wp_enqueue_script(
                'admin-utility-page-js',
                plugin_dir_url(__FILE__) . 'static/js/admin_utility_page.js',
                array('jquery'), // Dipendenza da jQuery
                filemtime(plugin_dir_path(__FILE__) . 'static/js/admin_utility_page.js'),
                true // Carica nel footer
            );

            wp_enqueue_script(
                'massive-import-js',
                plugin_dir_url(__FILE__) . 'static/js/massive_import.js',
                array('jquery'), // Dipendenza da jQuery
                filemtime(plugin_dir_path(__FILE__) . 'static/js/massive_import.js'),
                true // Carica nel footer
            );

            // CORRETTO: Fornisce dati REST API al JavaScript
            wp_localize_script('admin-utility-page-js', 'wpApiSettings', array(
                'root' => esc_url_raw(rest_url()),
                'nonce' => wp_create_nonce('wp_rest'),
                'ajaxurl' => admin_url('admin-ajax.php') // Per compatibilità
            ));
        }
    }

    function meteounipplugin_query_vars($vars){
        $vars[] = 'place';
        $vars[] = 'date';
        $vars[] = 'prod';
        $vars[] = 'output';
        return $vars;
    }

    function meteounipplugin_disable_place_redirect_canonical($redirect_url) {
        if ( is_singular( 'places' ) ) {
            return false; // blocca il redirect canonico per i CPT place
        }
        return $redirect_url;
    }

    public static function activate() {
        // Registriamo il CPT prima del flush
        $plugin = new self();
        $plugin->meteounipplugin_register_cpt_place();
        flush_rewrite_rules();
    }

    public static function deactivate() {
        flush_rewrite_rules();
    }
}


$pluginMainInstance = new MeteoUniParthenopePluginMain();

register_activation_hook(__FILE__, ['MeteoUniParthenopePluginMain', 'activate']);
register_deactivation_hook(__FILE__, ['MeteoUniParthenopePluginMain', 'deactivate']);







//https://api.meteo.uniparthenope.it/places/search/byboundingbox/41.46/13.78/39.50/15.06