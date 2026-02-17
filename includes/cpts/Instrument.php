<?php

namespace Meteouniparthenope\cpts;

class Instrument{
    private string $IDInstrument;
    
    private string $longName;

    private float $lat;
    
    private float $long;

    private array $variablesNames;

    private array $variablesDescriptions;

    private $wordpressID;

    public function __construct(
        string $IDInstrument,
        string $longName,
        float $lat,
        float $long,
        array $variablesNames = [],
        array $variablesDescriptions = []
    ){
        $this->IDInstrument = $IDInstrument;
        $this->longName = $longName;
        $this->lat = $lat;
        $this->long = $long;
        $this->variablesNames = $variablesNames;
        $this->variablesDescriptions = $variablesDescriptions;
        $this->wordpressID = -1;
    }

    // Getter and Setter methods
    public function getIDInstrument(): string {
        return $this->IDInstrument;
    }

    public function setIDInstrument(string $IDInstrument): void {
        $this->IDInstrument = $IDInstrument;
    }

    public function getLongName(): string {
        return $this->longName;
    }

    public function setLongName(string $longName): void {
        $this->longName = $longName;
    }

    public function getLat(): float {
        return $this->lat;
    }

    public function setLat(float $lat): void {
        $this->lat = $lat;
    }

    public function getLong(): float {
        return $this->long;
    }

    public function setLong(float $long): void {
        $this->long = $long;
    }

    public function getVariablesNames(): array {
        return $this->variablesNames;
    }

    public function setVariablesNames(array $variablesNames): void {
        $this->variablesNames = $variablesNames;
    }

    public function getVariablesDescriptions(): array {
        return $this->variablesDescriptions;
    }

    public function setVariablesDescriptions(array $variablesDescriptions): void {
        $this->variablesNames = $variablesDescriptions;
    }

    public function getWordpressID() {
        return $this->wordpressID;
    }

    public function setWordpressID($wordpressID): void {
        $this->wordpressID = $wordpressID;
    }
}

?>