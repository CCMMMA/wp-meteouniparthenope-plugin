<?php

class Place extends MeteoCustomPostType{
    private string $name;
    private string $longName;
    private string $IDPlace;
    private array $pos;
    private array $boundingBox;
    private string $domain;
    private array $availableProducts;

    /*
    public function __construct()
    {
        $this->name="";
        $this->longName="";
        $this->IDPlace="";
        $this->boundingBox=array(0.0, 0.0, 0.0, 0.0);
        $this->domain="";
        $this->allowedModels=array();
    }
    */

    
    
    public function __construct(
        string $name,
        string $longName,
        string $IDPlace,
        array $pos,
        array $boundingBox,
        string $domain,
        array $availableProducts
    ) {
        $this->name = $name;
        $this->longName = $longName;
        $this->IDPlace = $IDPlace;
        $this->pos = $pos;
        $this->boundingBox = $boundingBox;
        $this->domain = $domain;
        $this->availableProducts = $availableProducts;
    }
    

    function getName(): string{
        return $this->name;
    }

    function setName($name){
        $this->name = $name;
    }

    function getLongName(): string{
        return $this->longName;
    }

    function setLongName($longName){
        $this->longName = $longName;
    }

    function getID(): string{
        return $this->IDPlace;
    }

    function setID($IDPlace){
        $this->IDPlace = $IDPlace;
    }

    function getPos(): array{
        return $this->pos;
    }

    function setPos($pos){
        $this->pos = $pos;
    }

    function getBoundingBox(): array{
        return $this->boundingBox;
    }

    function setBoundingBox($boundingBox){
        $this->boundingBox = $boundingBox;
    }

    function getDomain(): string{
        return $this->domain;
    }

    function setDomain($domain){
        $this->domain = $domain;
    }

    function getAvailableProducts(): array{
        return $this->availableProducts;
    }

    function setAvailableProducts($availableProducts){
        $this->availableProducts = $availableProducts;
    }

}

?>