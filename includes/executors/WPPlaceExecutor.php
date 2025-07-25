<?php

namespace includes\executors;


use includes\API\PlacesAPI;
use includes\cpts\Place;
use WP_Query;

use includes\JSONParser\ProductParser;

class WPPlaceExecutor
{

    public function executePostCreation(Place $place): int
    {
        if (
            !method_exists($place, 'getName') ||
            !method_exists($place, 'getLongName') ||
            !method_exists($place, 'getID')) {
            return 1; // L'oggetto non ha i metodi richiesti
        }

        $title = sanitize_text_field($place->getLongName());
        $shortName = sanitize_text_field($place->getName());
        $longName = sanitize_text_field($place->getLongName());
        $idPlace = sanitize_text_field($place->getID());
        $pos = method_exists($place, 'getPos') ? $place->getPos() : [];

        // Preparo eventuali info aggiuntive (facoltative)
        $boundingBox = method_exists($place, 'getBoundingBox') ? $place->getBoundingBox() : [];
        $domain = method_exists($place, 'getDomain') ? $place->getDomain() : '';
        $availableProducts = method_exists($place, 'getAvailableProducts') ? $place->getAvailableProducts() : [];

        // Controllo se esiste già
        $args = [
            'post_type' => 'place',
            'title' => $title,
            'post_status' => 'any',
            'posts_per_page' => 1,
            'fields' => 'ids',
        ];

        $query = new WP_Query($args);
        if (!empty($query->posts)) {
            return 0; // Esiste già
        }


        // Inserimento post con contenuto minimo
        $wp_post_id = wp_insert_post([
            'post_title' => $title,
            'post_content' => '', // Contenuto vuoto, useremo i meta fields
            'post_status' => 'publish',
            'post_type' => 'place',
        ]);

        if (is_wp_error($wp_post_id) || !$wp_post_id) {
            return 1;
        }

        // Salvataggio dei meta fields
        update_post_meta($wp_post_id, 'place_id', $idPlace);
        update_post_meta($wp_post_id, 'short_name', $shortName);
        update_post_meta($wp_post_id, 'long_name_it', $longName);
        update_post_meta($wp_post_id, 'domain', $domain);

        // Salvo le coordinate come JSON
        if (!empty($pos)) {
            update_post_meta($wp_post_id, 'coordinates', json_encode($pos));
        }

        // Salvo il bounding box come JSON
        if (!empty($boundingBox)) {
            update_post_meta($wp_post_id, 'bbox', json_encode($boundingBox));
        }

        // Salvo i modelli consentiti come JSON
        $api = new PlacesAPI;
        $api_url = "https://api.meteo.uniparthenope.it/places/" . $idPlace;
        $apiProducts = $api->getData($api_url);
        console_log($apiProducts);
        $parser = new ProductParser;
        $availableProducts = $parser->parseFromJSON($apiProducts);
        $place->setAvailableProducts($availableProducts);


        if (!empty($availableProducts)) {
            update_post_meta($wp_post_id, 'available_products', json_encode($availableProducts));
        }

        $place->setWordpressID($wp_post_id);

        return (is_wp_error($wp_post_id) || !$wp_post_id) ? 1 : 0;
    }

    /**
     * @param Place[] $placesList
     */
    public function executePostsCreation(array $placesList): int
    {
        if (!is_array($placesList)) {
            return 1; // Input non valido
        }

        foreach ($placesList as $place) {
            $result = $this->executePostCreation($place);
            if ($result !== 0) {
                return 1; // Almeno un errore nella creazione
            }
        }

        return 0; // Tutto ok
    }
}

?>