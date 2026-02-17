<?php

namespace Meteouniparthenope\API;

use Exception;

class InstrumentsAPI implements MeteoAPI
{

    function getData(string $url): string
    {
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