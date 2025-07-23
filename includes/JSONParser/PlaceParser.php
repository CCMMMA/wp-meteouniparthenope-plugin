<?php

namespace includes\JSONParser;

use includes\cpts\Place;
use includes\JSONParser\JSONParser;

class PlaceParser implements JSONParser
{
    /**
     * @param string|array $json
     * @return Place[]
     */
    public function parseFromJSON($json): array
    {
        if (is_string($json)) {
            $data = json_decode($json, true);
        } elseif (is_array($json)) {
            $data = $json;
        } else {
            throw new InvalidArgumentException('Input non valido: deve essere JSON string o array.');
        }

        $places = [];

        foreach ($data as $item) {
            console_log($item);
            $place = new Place(
                name: $item['name']['it'] ?? '',
                longName: $item['long_name']['it'] ?? '',
                IDPlace: $item['id'],
                pos: $item['pos']['coordinates'],
                boundingBox: array(array($item['bbox']['coordinates'][0]),
                    array($item['bbox']['coordinates'][1]),
                    array($item['bbox']['coordinates'][2]),
                    array($item['bbox']['coordinates'][3]),
                    array($item['bbox']['coordinates'][4])),
                domain: 'domain_default',
                availableProducts: array()
            );

            $places[] = $place;
        }

        return $places;
    }
}

?>