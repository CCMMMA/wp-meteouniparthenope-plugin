<?php

namespace Meteouniparthenope\executors;

use Meteouniparthenope\API\InstrumentsAPI;
use Meteouniparthenope\cpts\Instrument;
use WP_Query;

class WPInstrumentExecutor
{

    public function executePostCreation(Instrument $instrument): int
    {
        // Verifica che l'oggetto Instrument abbia i getter necessari
        if (
            !method_exists($instrument, 'getIDInstrument') ||
            !method_exists($instrument, 'getLongName')) {
            return 1; // L'oggetto non ha i metodi richiesti
        }

        $instrumentID = sanitize_text_field($instrument->getIDInstrument());
        $longName = sanitize_text_field($instrument->getLongName());
        $title = $longName; // Usiamo il long_name (organization) come titolo del post

        // Recupero tutti i campi
        $lat = method_exists($instrument, 'getLat') ? $instrument->getLat() : null;
        $long = method_exists($instrument, 'getLong') ? $instrument->getLong() : null;
        $variablesNames = method_exists($instrument, 'getVariablesNames') ? $instrument->getVariablesNames() : [];
        $variablesDescriptions = method_exists($instrument, 'getVariablesDescriptions') ? $instrument->getVariablesDescriptions() : [];

        // Controllo se esiste già
        $args = [
            'post_type' => 'instruments',
            'meta_query' => array(
                array(
                    'key' => 'instrument_id',
                    'value' => $instrumentID,
                    'compare' => '='
                )
            ),
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
            'post_type' => 'instruments',
        ]);

        if (is_wp_error($wp_post_id) || !$wp_post_id) {
            return 1;
        }

        // Salvataggio dei meta fields
        update_post_meta($wp_post_id, 'instrument_id', $instrumentID);
        update_post_meta($wp_post_id, 'long_name', $longName);

        // Salvo le coordinate
        if ($lat !== null) {
            update_post_meta($wp_post_id, 'latitude', $lat);
        }
        if ($long !== null) {
            update_post_meta($wp_post_id, 'longitude', $long);
        }

        // Salvo le coordinate come JSON per compatibilità
        if ($lat !== null && $long !== null) {
            $coordinates = array(
                'lat' => $lat,
                'lng' => $long
            );
            update_post_meta($wp_post_id, 'coordinates', json_encode($coordinates));
        }

        // Salvo l'array dei nomi delle variabili come JSON
        if (!empty($variablesNames)) {
            update_post_meta($wp_post_id, 'variablesNames', json_encode($variablesNames));
        } else {
            // Salvo array vuoto come JSON
            update_post_meta($wp_post_id, 'variablesNames', json_encode([]));
        }

        // Salvo l'array delle descrizioni delle variabili come JSON
        if (!empty($variablesDescriptions)) {
            update_post_meta($wp_post_id, 'variablesDescriptions', json_encode($variablesDescriptions));
        } else {
            // Salvo array vuoto come JSON
            update_post_meta($wp_post_id, 'variablesDescriptions', json_encode([]));
        }

        $instrument->setWordpressID($wp_post_id);

        return 0; // Successo
    }

    /**
     * @param Instrument[] $instrumentsList
     */
    public function executePostsCreation(array $instrumentsList): int
    {
        if (!is_array($instrumentsList)) {
            return 1; // Input non valido
        }

        foreach ($instrumentsList as $instrument) {
            $result = $this->executePostCreation($instrument);
            if ($result !== 0) {
                return 1; // Almeno un errore nella creazione
            }
        }

        return 0; // Tutto ok
    }
}

?>