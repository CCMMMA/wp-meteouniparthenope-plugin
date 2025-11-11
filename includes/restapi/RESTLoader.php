<?php

namespace Meteouniparthenope\restapi;

use Exception;

class RESTLoader{
    private static $restControllers = [
        'places' => PlaceRESTController::class,
    ];
    
    public function loadRESTControlers(){
        //$this->api_controller = new PlaceRESTController();
        //$this->api_controller->register_routes();
        foreach (self::$restControllers as $tag => $class) {
            $api_controller = $this->create($tag);
            $api_controller->register_routes();
        }
    }

    function create($name){
        if (!isset(self::$restControllers[$name])) {
            throw new Exception("Shortcode '{$name}' non registrato nella factory.");
        }
        
        $class = self::$restControllers[$name];
        return new $class();
    }

}

?>