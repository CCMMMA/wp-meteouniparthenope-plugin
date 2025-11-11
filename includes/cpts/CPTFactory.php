<?php

namespace Meteouniparthenope\cpts;

use Exception;
use Meteouniparthenope\FactoryInterface;

class CPTFactory implements FactoryInterface{

    private static $customPostTypes= [
        'places' => CustomPostTypePlaces::class,
        'instruments' => CustomPostTypeInstruments::class
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
            $cpt = CPTFactory::create($tag);
            $cpt->registerCTP();
        }
    }

    public static function register($tag, $class){

    }
}

?>