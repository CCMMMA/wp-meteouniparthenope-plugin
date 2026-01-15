<?php

namespace Meteouniparthenope\restapi;

use Exception;

class RESTLoader{
    private static $restControllers = [
        'places' => PlaceRESTController::class,
    ];
    
    public static function loadRESTControllers(){
        //$this->api_controller = new PlaceRESTController();
        //$this->api_controller->register_routes();
        foreach (self::$restControllers as $tag => $class) {
            $api_controller = self::create($tag);
            $api_controller->register_routes();
        }
    }

    public static function create($name){
        if (!isset(self::$restControllers[$name])) {
            throw new Exception("REST Controller '{$name}' non registrato nel plugin.");
        }
        
        $class = self::$restControllers[$name];
        return new $class();
    }

}

?>