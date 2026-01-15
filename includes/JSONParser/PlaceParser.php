<?php

namespace Meteouniparthenope\JSONParser;

use Meteouniparthenope\cpts\Place;

use InvalidArgumentException;

class PlaceParser implements JSONParser
{
    /**
     * @param string|array $json
     * @return Place[]
     */
    public function parseMultipleFromJSON($json): array
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
            return $item;
            //console_log($item);
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

    public function parseSingleFromJSON($json)
    {
        if (is_string($json)) {
            $data = json_decode($json, true);
        } elseif (is_array($json)) {
            $data = $json;
        } else {
            throw new InvalidArgumentException('Input non valido: deve essere JSON string o array.');
        }

        $place = new Place(
            name: $data['name']['it'] ?? '',
            longName: $data['long_name']['it'] ?? '',
            IDPlace: $data['id'],
            pos: $data['pos']['coordinates'],
            boundingBox: array(array($data['bbox']['coordinates'][0]),
                array($data['bbox']['coordinates'][1]),
                array($data['bbox']['coordinates'][2]),
                array($data['bbox']['coordinates'][3]),
                array($data['bbox']['coordinates'][4])),
            domain: 'domain_default',
            availableProducts: array()
        );

        return $place;
    }
}

?>