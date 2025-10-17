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

        //Other plugins functionalities
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

    // Autocomplete shortcode injection
    function meteounipplugin_autocomplete_search_injection($content){
        $content = '[autocomplete_search_shortcode]' . $content;
        return $content;
    }

    // Frontend files
    function meteounipplugin_enqueue_frontend_tecnologies(){
        wp_enqueue_style(
            'bootstrap-css',
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css'
        );

        // JS di Bootstrap (CORRETTO)
        
        wp_enqueue_script(
            'bootstrap-js',
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js', // <-- URL corretto per Bootstrap JS
            array('jquery'),
            '5.3.7',
            true
        );


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