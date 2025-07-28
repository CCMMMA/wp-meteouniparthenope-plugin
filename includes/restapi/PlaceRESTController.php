<?php
/**
 * REST API Controller per la gestione dei Places
 * File: includes/API/PlaceAPIController.php
 */

namespace includes\API;

use Exception;
use WP_REST_Controller;
use WP_REST_Server;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use includes\API\PlacesAPI;
use includes\cpts\Place;
use includes\executors\WPPlaceExecutor;
use includes\JSONParser\PlaceParser;

class PlaceRESTController{

    /**
     * Namespace della REST API
     */
    protected $namespace = 'meteounip/v1';
    
    /**
     * Base dell'endpoint
     */
    protected $rest_base = 'places';

    /**
     * Base delle api meteo
     */
    private $apiBaseUrl = 'https://api.meteo.uniparthenope.it/places';

    /**
     * Registra le route
     */
    public function register_routes() {
        //console_log("Registrazione routes effettuata!");
        // Endpoint per aggiungere un singolo place
        register_rest_route($this->namespace, '/' . $this->rest_base . '/single', array(
            array(
                'methods'             => WP_REST_Server::CREATABLE, // POST
                'callback'            => array($this, 'add_single_place'),
                'permission_callback' => array($this, 'create_item_permissions_check'),
                'args'                => $this->get_single_place_args(),
            ),
        ));
    }

    /**
     * Args per l'endpoint single place
     */
    public function get_single_place_args() {
        return array(
            'place_id' => array(
                'required' => true,
                'type' => 'string',
                'description' => 'ID univoco del place',
                'validate_callback' => function($param, $request, $key) {
                    return !empty($param);
                }
            ),
            'long_name_it' => array(
                'required' => false,
                'type' => 'string',
                'description' => 'Nome lungo in italiano del place'
            ),
            'coordinates' => array(
                'required' => false,
                'type' => 'object',
                'description' => 'Coordinate del place'
            ),
            'domain' => array(
                'required' => false,
                'type' => 'string',
                'description' => 'Dominio del place'
            )
        );
    }

    /**
     * Aggiunge un singolo place
     */
    public function add_single_place($request) {
        try {
            $place_data = $request->get_json_params();
            
            // Validazione base dei dati
            if (empty($place_data['place_id'])) {
                return new WP_Error(
                    'missing_place_id',
                    'Place ID è richiesto',
                    array('status' => 400)
                );
            }

            // Verifica se il place esiste già
            $existing_place = $this->get_place_by_place_id($place_data['place_id']);
            if ($existing_place) {
                return new WP_Error(
                    'place_already_exists',
                    'Place già esistente con ID: ' . $place_data['place_id'],
                    array('status' => 409) // Conflict
                );
            }

            // Creazione del place utilizzando il tuo executor esistente
            $wpExecutor = new WPPlaceExecutor();
            $placeAPI = new PlacesAPI();
            $urlRequest = $this->apiBaseUrl . '/'. $place_data['place_id'];
            $apiResponse = $placeAPI->getData($urlRequest);
            $placeParser = new PlaceParser();
            $place = $placeParser->parseSingleFromJSON($apiResponse);
            $result = $wpExecutor->executePostCreation($place);

            if ($result === 0) {
                return new WP_REST_Response(array(
                    'success' => true,
                    'message' => 'Place creato con successo',
                    'place_id' => $place_data['place_id']
                ), 201);
            } else {
                return new WP_Error(
                    'creation_failed',
                    'Errore durante la creazione del place',
                    array('status' => 500)
                );
            }

        } catch (Exception $e) {
            return new WP_Error(
                'server_error',
                'Errore del server: ' . $e->getMessage(),
                array('status' => 500)
            );
        }
    }

    /**
     * Controllo permessi per creazione
     */
    public function create_item_permissions_check($request) {
        return current_user_can('manage_options');
    }

    /**
     * Utility: trova place per place_id
     */
    private function get_place_by_place_id($place_id) {
        $args = array(
            'post_type' => 'place',
            'meta_query' => array(
                array(
                    'key' => 'place_id',
                    'value' => $place_id,
                    'compare' => '='
                )
            ),
            'posts_per_page' => 1
        );

        $posts = get_posts($args);
        return !empty($posts) ? $posts[0] : null;
    }
}

?>