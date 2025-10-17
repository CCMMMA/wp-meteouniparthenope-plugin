<?php

namespace Meteouniparthenope\shorcodes;

use Exception;

class ShortcodeFactory {
    
    private static $shortcodes = [
        'forecast_shortcode' => ForecastShortcode::class,
        'forecast_preview_shortcode' => ForecastPreviewShortcode::class,
        'control_shortcode' => ControlShortcode::class,
        'date_control_shortcode' => DateControlShortcode::class,
        'plot_shortcode' => PlotShortcode::class,
        'chart_shortcode' => ChartShortcode::class,
        'map_shortcode' => MapShortcode::class,
        'live_chart_shortcode' => LiveChartShortcode::class,
        'vertical_profile_shortcode' => VerticalProfileShortcode::class,
        'open_data_shortcode' => OpenDataShortcode::class,
        'autocomplete_search_shortcode' => AutocompleteSearchShortcode::class,
        'url_rewriting_shortcode' => UrlRewritingShortcode::class,
        'weather_map_def_shotcode' => WeatherMapDefShortcode::class
    ];
    
    /**
     * Crea un'istanza dello shortcode richiesto
     */
    public static function create($shortcode_name) {
        if (!isset(self::$shortcodes[$shortcode_name])) {
            throw new Exception("Shortcode '{$shortcode_name}' non registrato nella factory.");
        }
        
        $class = self::$shortcodes[$shortcode_name];
        return new $class();
    }
    
    /**
     * Registra tutti gli shortcode WordPress
     */
    public static function registerAll() {
        foreach (self::$shortcodes as $tag => $class) {
            add_shortcode($tag, [ShortcodeFactory::create($tag),'render']);
        }
    }
    
    /**
     * Registra un nuovo tipo di shortcode
     */
    public static function register($tag, $class) {
        if (!class_exists($class)) {
            throw new Exception("Classe '{$class}' non esiste.");
        }
        self::$shortcodes[$tag] = $class;
    }
}

?>