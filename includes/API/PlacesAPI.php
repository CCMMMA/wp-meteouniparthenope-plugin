<?php

namespace includes\API;

use Exception;
use includes\API\MeteoAPI;

class PlacesAPI implements MeteoAPI
{

    function getData(string $url): string
    {
        //console_log($url);
        $response = wp_remote_get($url, array('sslverify' => FALSE));

        if (is_wp_error($response)) {
            throw new Exception('Errore nella richiesta: ' . $response->get_error_message());
        }

        $body = wp_remote_retrieve_body($response);

        if (empty($body)) {
            throw new Exception('La risposta è vuota.');
        }

        return $body;
    }
}

?>