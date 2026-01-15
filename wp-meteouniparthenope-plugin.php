<?php
/**
 * Plugin Name: meteo@uniparthenope-plugin
 * Description: Management system for meteo@uniparthenope.it
 * Authors: Francesco Peluso
 * Author URI: 
 * Version: 1.0
 * Text Domain: meteo@uniparthenope
 */

//Security system

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

spl_autoload_register(function ($class) {
    //Plugin namespace root
    $prefix = 'Meteouniparthenope\\';
    $base_dir = plugin_dir_path(__FILE__) . 'includes/';
    
    //Check if the class uses the plugin namespace
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return; //It isn't a plugin's class
    }
    
    //Removes the prefix from class' name
    $relative_class = substr($class, $len);
    
    //Convert the namespace of the file path
    //e.g.: Meteouniparthenope\API\PlacesAPI -> includes/API/PlacesAPI.php
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    
    //If the file exists, load it
    if (file_exists($file)) {
        require_once $file;
    }
});

define('METEOUNIPARTHENOPE_PLUGIN_URL', plugins_url('', __FILE__));
define('METEOUNIPARTHENOPE_PLUGIN_DIR', plugin_dir_url(__FILE__));
define('METEOUNIPARTHENOPE_PLUGIN_DIR_ABS', plugin_dir_path(__FILE__));

use Meteouniparthenope\cpts\CPTFactory;
use Meteouniparthenope\restapi\RESTLoader;
use Meteouniparthenope\loaders\AssetsLoader;
use Meteouniparthenope\loaders\AdminLoader;
use Meteouniparthenope\loaders\SearchLoader;
use Meteouniparthenope\loaders\PlaceLoader;
use Meteouniparthenope\shorcodes\ShortcodeFactory;

class MeteoUniParthenopePluginMain{
    public function __construct()
    {
        //CPTs registration: 'Places' and 'Instruments'
        add_action('init',[CPTFactory::class, 'registerAll']);

        //REST API registration
        add_action('rest_api_init', [RESTLoader::class, 'loadRESTControllers']);
        
        //HTML templates, styles, dependencies and global JS data
        $assetLoader = new AssetsLoader;
        $assetLoader->loadAllAssets();

        //WP admin dashboard components
        $adminLoader = new AdminLoader();
        $adminLoader->loadAdminComponents();

        //Wordpress search override
        $searchLoader = new SearchLoader();
        $searchLoader->loadSearchComponents();

        //Place components
        $placeLoader = new PlaceLoader();
        $placeLoader->loadPlaceComponents();

        //Shortcodes
        add_action('init',[ShortcodeFactory::class, 'registerAll']);
    }

    function meteounipplugin_query_vars($vars){
        $vars[] = 'place';
        $vars[] = 'date';
        $vars[] = 'prod';
        $vars[] = 'output';
        return $vars;
    }
}

function activate() {
    CPTFactory::registerAll();
    flush_rewrite_rules();
}

function deactivate() {
    flush_rewrite_rules();
}

register_activation_hook(__FILE__,  'activate');
register_deactivation_hook(__FILE__, 'deactivate');

$pluginMainInstance = new MeteoUniParthenopePluginMain();

?>