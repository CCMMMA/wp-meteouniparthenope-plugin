<?php

namespace includes\JSONParser;

use includes\JSONParser\JSONParser;
use InvalidArgumentException;

class ProductParser implements JSONParser
{
    public function parseMultipleFromJSON($json): array
    {
        if (is_string($json)) {
            $data = json_decode($json, true);
        } elseif (is_array($json)) {
            $data = $json;
        } else {
            throw new InvalidArgumentException('Input non valido: deve essere JSON string o array.');
        }
        $products = $data['prods'];
        return $products;
    }

    public function parseSingleFromJSON($json)
    {
        
    }
}

?>