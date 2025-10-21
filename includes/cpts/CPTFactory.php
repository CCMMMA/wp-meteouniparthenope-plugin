<?php

namespace Meteouniparthenope\cpts;

use Exception;
use Meteouniparthenope\FactoryInterface;

class CPTFactory implements FactoryInterface{

    private static $customPostTypes= [
        'places' => CustomPostTypePlace::class
    ];

    public static function create($cpt_name){
        if (!isset(self::$customPostTypes[$cpt_name])) {
            throw new Exception("Shortcode '{$cpt_name}' non registrato nella factory.");
        }
        
        $class = self::$customPostTypes[$cpt_name];
        return new $class();
    }

    public static function registerAll(){
        foreach (self::$customPostTypes as $tag => $class) {
            add_action('init',[CPTFactory::create($tag),'registerCTP']);
        }
    }

    public static function register($tag, $class){

    }
}

?>