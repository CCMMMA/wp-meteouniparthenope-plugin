<?php

namespace Meteouniparthenope\JSONParser;

use Meteouniparthenope\cpts\Instrument;
use InvalidArgumentException;

class InstrumentParser implements JSONParser {

    /**
     * Parsa un singolo instrument dal JSON GeoJSON Feature
     * 
     * @param array $feature Feature GeoJSON
     * @return Instrument
     */
    private function parseFeature(array $instrument): Instrument {
        /*
        // Estrai i dati dalle properties
        $properties = $feature['properties'] ?? [];
        $geometry = $feature['geometry'] ?? [];
        $coordinates = $geometry['coordinates'] ?? [0, 0, 0];

        // Estrai i campi necessari
        $id = $properties['id'] ?? '';
        $organization = $properties['organization'] ?? '';
        $type = $properties['type'] ?? '';
        
        // Estrai le coordinate (long, lat, alt nel formato GeoJSON)
        $longitude = floatval($coordinates[0]);
        $latitude = floatval($coordinates[1]);

        // Estrai i nomi delle variabili
        $variablesData = $properties['variables'] ?? [];
        $variableNames = array_keys($variablesData);
        */

        $id = $instrument['uuid'] ?? '';
        $long_name = $instrument['name']['value'] ?? '';
        //$long_name = $id;
        $latitude = $instrument['navigation']['position']['value']['latitude'] ?? 0.0;
        $longitude = $instrument['navigation']['position']['value']['longitude'] ?? 0.0;
        $variableNames = ["relativeHumidity","temperature","rate","directionTrue","speedTrue"];
        $variableDescriptions = ["Relative humidity","Outside air temperature","Rainfall sensor","The wind direction relative to true north","True wind speed"];

        // Crea e restituisce l'oggetto Instrument
        return new Instrument(
            $id,
            $long_name,
            $latitude,
            $longitude,
            $variableNames,
            $variableDescriptions
        );
    }

    /**
     * Parsa multipli instruments da JSON
     * 
     * @param string|array $json JSON string o array già decodificato
     * @return Instrument[] Array di oggetti Instrument
     */
    public function parseMultipleFromJSON($json): array {
        // Se è una stringa, decodifica
        if (is_string($json)) {
            $data = json_decode($json, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new InvalidArgumentException('JSON non valido: ' . json_last_error_msg());
            }
        } elseif (is_array($json)) {
            $data = $json;
        } else {
            throw new InvalidArgumentException('Il parametro deve essere una stringa JSON o un array');
        }

        $instruments = [];

        // Se è una FeatureCollection
        /*
        if (isset($data['type']) && $data['type'] === 'FeatureCollection') {
            $features = $data['features'] ?? [];
            foreach ($features as $feature) {
                try {
                    $instrument = $this->parseFeature($feature);
                    $instruments[] = $instrument;
                } catch (\Exception $e) {
                    // Log dell'errore ma continua con gli altri
                    error_log('Errore parsing instrument: ' . $e->getMessage());
                }
            }
        }
        */

        
        foreach ($data as $uuid){
            try{
                $instrument = $this->parseFeature($uuid);
                error_log("STRUMENTO: ");
                error_log($instrument->getIDInstrument());
                error_log($instrument->getLat());
                error_log($instrument->getLong());
                error_log($instrument->getLongName());
                error_log($instrument->getWordpressID());
                /*
                if($instrument->getLongName() != ''){
                    $instruments[] = $instrument;
                }
                */
                $instruments[] = $instrument;
            } catch(\Exception $e){
                error_log('Errore parsing instrument: ' . $e->getMessage());
            }
        }

        error_log("SEMBRA SIA ANDATO TUTTO BENE in InstrumentParser");

        return $instruments;
    }

    /**
     * Parsa un singolo instrument da JSON
     * 
     * @param string|array $json JSON string o array già decodificato
     * @return Instrument|null
     */
    public function parseSingleFromJSON($json) {
        // Se è una stringa, decodifica
        if (is_string($json)) {
            $data = json_decode($json, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new InvalidArgumentException('JSON non valido: ' . json_last_error_msg());
            }
        } elseif (is_array($json)) {
            $data = $json;
        } else {
            throw new InvalidArgumentException('Il parametro deve essere una stringa JSON o un array');
        }

        // Se è una FeatureCollection, prendi il primo elemento
        if (isset($data['type']) && $data['type'] === 'FeatureCollection') {
            $features = $data['features'] ?? [];
            if (empty($features)) {
                return null;
            }
            return $this->parseFeature($features[0]);
        }

        // Se è un singolo Feature
        if (isset($data['type']) && $data['type'] === 'Feature') {
            return $this->parseFeature($data);
        }

        return null;
    }
}

?>