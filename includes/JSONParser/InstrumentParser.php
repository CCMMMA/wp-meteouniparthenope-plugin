<?php

namespace Meteouniparthenope\JSONParser;

use Meteouniparthenope\cpts\Instrument;
use InvalidArgumentException;

class InstrumentParser implements JSONParser {

    /**
     * Estrae ricorsivamente tutti i path in dot notation che contengono un campo 'value'
     * 
     * @param array $data Array dei dati
     * @param string $prefix Prefisso del path corrente
     * @return array Array di path in dot notation
     */
    private function extractVariablePaths(array $data, string $prefix = ''): array {
        $paths = [];
        
        foreach ($data as $key => $value) {
            // Salta chiavi speciali che non fanno parte del path
            if ($key === '$source' || $key === 'meta' || $key === 'timestamp' || $key === 'value') {
                continue;
            }
            
            $currentPath = $prefix === '' ? $key : $prefix . '.' . $key;
            
            if (is_array($value)) {
                // Se questo nodo ha un campo 'value', è una variabile
                if (isset($value['value'])) {
                    $paths[] = $currentPath;
                }
                
                // Continua a esplorare ricorsivamente
                $subPaths = $this->extractVariablePaths($value, $currentPath);
                $paths = array_merge($paths, $subPaths);
            }
        }
        
        return $paths;
    }

    /**
     * Parsa un singolo instrument dal JSON
     * 
     * @param string $instrumentId ID della weather station (chiave dell'array)
     * @param array $instrumentData Dati dell'instrument
     * @return Instrument
     */
    private function parseFeature(string $instrumentId, array $instrumentData): Instrument {
        // Estrai il nome della stazione
        $longName = $instrumentData['name']['value'] ?? '';
        
        // Estrai le coordinate
        $latitude = $instrumentData['navigation']['position']['value']['latitude'] ?? 0.0;
        $longitude = $instrumentData['navigation']['position']['value']['longitude'] ?? 0.0;
        
        // Estrai dinamicamente tutti i path delle variabili disponibili
        $variablePaths = $this->extractVariablePaths($instrumentData);
        
        // Filtra i path per escludere quelli che non sono variabili meteo rilevanti
        // (opzionale: puoi rimuovere questo filtro se vuoi TUTTI i path)
        $relevantPaths = array_filter($variablePaths, function($path) {
            // Escludi alcuni path non rilevanti
            $excludePatterns = [
                'name',
                'navigation.position',
                'url',
                'electrical.batteries',
                'sun.rise',
                'sun.set',
                'weather.forecast.icon',
                'weather.forecast.ruleNumber'
            ];
            
            foreach ($excludePatterns as $pattern) {
                if (strpos($path, $pattern) === 0) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Riordina gli indici dell'array
        $variableNames = array_values($relevantPaths);
        
        // Per le descrizioni, usa i displayName o description dai meta, altrimenti il path stesso
        $variableDescriptions = array_map(function($path) use ($instrumentData) {
            $parts = explode('.', $path);
            $current = $instrumentData;
            
            // Naviga attraverso il path per trovare i meta
            foreach ($parts as $part) {
                if (isset($current[$part])) {
                    $current = $current[$part];
                } else {
                    return $path; // Fallback al path stesso
                }
            }
            
            // Cerca displayName o description nei meta
            if (isset($current['meta']['displayName'])) {
                return $current['meta']['displayName'];
            } elseif (isset($current['meta']['description'])) {
                return $current['meta']['description'];
            }
            
            return $path; // Fallback al path stesso
        }, $variableNames);
        
        // Log per debug
        error_log("Instrument ID: {$instrumentId}");
        error_log("Found " . count($variableNames) . " variables");
        error_log("Variables: " . implode(', ', array_slice($variableNames, 0, 5)) . (count($variableNames) > 5 ? '...' : ''));

        // Crea e restituisce l'oggetto Instrument
        return new Instrument(
            $instrumentId,
            $longName,
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

        // Itera su ogni weather station usando CHIAVE => VALORE
        foreach ($data as $instrumentId => $instrumentData) {
            try {
                // Passa sia l'ID che i dati al parser
                $instrument = $this->parseFeature($instrumentId, $instrumentData);
                
                // Log per debug
                error_log("Parsed instrument: ID={$instrument->getIDInstrument()}, Name={$instrument->getLongName()}, Lat={$instrument->getLat()}, Lng={$instrument->getLong()}");
                
                // Aggiungi l'instrument alla lista
                $instruments[] = $instrument;
                
            } catch (\Exception $e) {
                error_log("Errore parsing instrument ID '{$instrumentId}': " . $e->getMessage());
            }
        }

        error_log("InstrumentParser: Parsed " . count($instruments) . " instruments successfully");

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

        // Prendi il primo elemento
        if (empty($data)) {
            return null;
        }

        // Ottieni la prima chiave e il primo valore
        reset($data);
        $instrumentId = key($data);
        $instrumentData = current($data);

        return $this->parseFeature($instrumentId, $instrumentData);
    }
}

?>