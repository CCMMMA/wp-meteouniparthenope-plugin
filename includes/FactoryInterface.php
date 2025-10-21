<?php

namespace Meteouniparthenope;

interface FactoryInterface{
    public static function create($keyObjName);
    public static function registerAll();
    public static function register($tag, $class);
}

?>