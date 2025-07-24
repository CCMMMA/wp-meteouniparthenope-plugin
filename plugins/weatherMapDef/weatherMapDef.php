<?php
/**
 * Plugin Name: Weather Map
 * Description: Visualizes weather maps with day/hour selectors using 3bMeteo.
 * Version: 1.0
 * Author: vincenzo.bucciero001@studenti.uniparthenope.it
 */

// Mock WordPress functions for non-WordPress environments (for testing only)
if (!function_exists('add_action')) {
    function add_action($hook, $callback) {}
}
if (!function_exists('add_shortcode')) {
    function add_shortcode($tag, $callback) {}
}
if (!function_exists('wp_enqueue_style')) {
    function wp_enqueue_style($handle, $src, $deps = [], $ver = false, $media = 'all') {}
}
if (!function_exists('wp_enqueue_script')) {
    function wp_enqueue_script($handle, $src, $deps = [], $ver = false, $in_footer = false) {}
}
if (!function_exists('plugin_dir_url')) {
    function plugin_dir_url($file) { return ''; }
}
if (!defined('ABSPATH')) exit;

class WeatherMapDef
{
    // Configuration for each map type
    private $mapConfigs = [
        'mainMap'          => ['product' => 'wrf5',  'place' => 'it000'],
        'precipitationMap' => ['product' => 'rms3',  'place' => 'ca000'],
        'airQualityMap'    => ['product' => 'aiq3',  'place' => 'ca000'],
        'wavesMap'         => ['product' => 'ww33',  'place' => 'it000'],
        'currentsMap'      => ['product' => 'wcm3',  'place' => 'ca000']
    ];

    // Constructor: hooks for scripts and shortcode
    public function __construct()
    {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        add_shortcode('weather_map_def', [$this, 'render_shortcode']);
    }

    // Enqueue CSS and JS assets
    public function enqueue_assets()
    {
        wp_enqueue_style(
            'weather-map-font',
            'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap',
            [],
            time()
        );
        wp_enqueue_style(
            'weather-map-def-style',
            plugin_dir_url(__FILE__) . 'css/styles.css',
            [],
            time()
        );
        wp_enqueue_style(
            'font-awesome',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
            [],
            time()
        );

        wp_enqueue_script(
            'weather-map-def-script',
            plugin_dir_url(__FILE__) . 'js/scripts.js',
            [],
            time(),
            true
        );
    }

    // Generate the API URL for a given product, place, date, and hour
    private function generateApiUrl($product, $place, $date, $hour = '12:00')
    {
        $dateObj = new DateTime($date);
        $formattedDate = $dateObj->format('Ymd') . 'Z' . str_replace(':', '', $hour);
        return "https://api.meteo.uniparthenope.it/products/{$product}/forecast/{$place}/plot/image?date={$formattedDate}&output=gen";
    }

    // Render the shortcode output with selectors and weather maps
    public function render_shortcode()
    {
        ob_start();
        $today = date('Y-m-d');
        ?>
        <div class="weatherContainer">
            <div class="weatherHeader">
                <div class="selectorWrapper">
                    <h1>
                        <img class="weatherIcon" src="<?php echo plugin_dir_url(__FILE__) . 'images/285670_calendar_icon.svg'; ?>" alt="Calendar Icon">
                        Day Selection
                    </h1>
                    <div class="daySelectorRow">
                        <?php for ($i = 0; $i < 6; $i++):
                            $day = date('Y-m-d', strtotime("+$i day"));
                            $label = date('d/m', strtotime($day));
                            $weekDay = date('D', strtotime($day));
                            $active = $i === 0 ? 'active' : '';
                        ?>
                            <div class="dayCard <?php echo $active; ?>" data-day="<?php echo $day; ?>">
                                <span class="label"><?php echo $label; ?></span>
                                <span class="weekday"><?php echo $weekDay; ?></span>
                            </div>
                        <?php endfor; ?>
                    </div>
                    <h1>
                        <img src="<?php echo plugin_dir_url(__FILE__) . 'images/2530808_alarm_clock_deadline_general_office_icon.svg'; ?>" alt="Clock Icon" style="width:20px; vertical-align:middle; margin: right 20px;">
                        Hour Selection
                    </h1>
                    <div class="hourSelectorRow">
                        <?php foreach (['06:00', '12:00', '18:00', '21:00'] as $hour):
                            $active = $hour === '12:00' ? 'active' : '';
                        ?>
                            <div class="hourCard <?php echo $active; ?>" data-hour="<?php echo $hour; ?>">
                                <?php echo $hour; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <div class="weatherCorpus">
                <?php foreach ($this->mapConfigs as $mapClass => $config): ?>
                    <div class="<?php echo $mapClass; ?>">
                        <h1><?php echo ucfirst(str_replace('Map', ' Map', $mapClass)); ?></h1>
                        <img src="<?php echo $this->generateApiUrl($config['product'], $config['place'], $today); ?>" />
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

new WeatherMapDef();
