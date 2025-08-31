<?php
/**
 * REST API Controller per la gestione dei Places
 * File: includes/API/PlacesAPIController.php
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

class PlacesAPIController extends WP_REST_Controller {
    
    /**
     * Namespace della REST API
     */
    protected $namespace = 'meteounip/v1';
    
    /**
     * Base dell'endpoint
     */
    protected $rest_base = 'places';

    private $apiBaseUrl = 'https://api.meteo.uniparthenope.it';

    /**
     * Registra le route
     */
    public function register_routes() {
        
        // Endpoint per aggiungere un singolo place
        register_rest_route($this->namespace, '/' . $this->rest_base . '/single', array(
            array(
                'methods'             => WP_REST_Server::CREATABLE, // POST
                'callback'            => array($this, 'add_single_place'),
                'permission_callback' => array($this, 'create_item_permissions_check'),
                'args'                => $this->get_single_place_args(),
            ),
        ));

        // Endpoint per importare tutti i places
        register_rest_route($this->namespace, '/' . $this->rest_base . '/import-all', array(
            array(
                'methods'             => WP_REST_Server::CREATABLE, // POST
                'callback'            => array($this, 'import_all_places'),
                'permission_callback' => array($this, 'create_item_permissions_check'),
                'args'                => $this->get_import_all_args(),
            ),
        ));

        // Endpoint per eliminare tutti i places
        register_rest_route($this->namespace, '/' . $this->rest_base . '/delete-all', array(
            array(
                'methods'             => WP_REST_Server::CREATABLE, // POST
                'callback'            => array($this, 'delete_all_places'),
                'permission_callback' => array($this, 'delete_item_permissions_check'),
            ),
        ));
    }

    /**
     * Controllo permessi per creazione
     */
    public function create_item_permissions_check($request) {
        return current_user_can('manage_options');
    }

    /**
     * Controllo permessi per eliminazione
     */
    public function delete_item_permissions_check($request) {
        return current_user_can('manage_options');
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
            $urlRequest = $this->apiBaseUrl . '/places/'. $place_data['place_id'];
            $apiResponse = $placeAPI->getData($urlRequest);
            $placeParser = new PlaceParser();
            $place = $placeParser->parseFromJSON($apiResponse);
            $result = $wpExecutor->executePostCreation($place[0]);

            if ($result === 0) {
                return new WP_REST_Response(array(
                    'success' => true,
                    'message' => 'Place creato con successo',
                    'place_id' => $place_data['place_id']
                ), 201);
            } else {
                /*
                return new WP_Error(
                    'creation_failed',
                    'Errore durante la creazione del place',
                    array('status' => 500)
                );
                */
                return new WP_Error(
                    'creation failed',
                    $urlRequest . ', ' . $apiResponse . ', ' . $place,
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
     * Importa tutti i places dall'API esterna
     */
    public function import_all_places($request) {
        try {
            $params = $request->get_json_params();
            
            // URL API (puoi renderlo configurabile)
            $api_urls = array(
                'default' => "https://api.meteo.uniparthenope.it/places",
                'boundingbox' => "https://api.meteo.uniparthenope.it/places/search/byboundingbox/41.46/13.78/39.50/15.06",
                'coords' => "https://api.meteo.uniparthenope.it/places/search/bycoords/40.83/14.24"
            );

            $api_url = isset($params['source']) && isset($api_urls[$params['source']]) 
                      ? $api_urls[$params['source']] 
                      : $api_urls['default'];

            // Recupero dati dall'API
            $api = new PlacesAPI();
            $jsonString = $api->getData($api_url);

            if (empty($jsonString)) {
                return new WP_Error(
                    'api_error',
                    'Impossibile recuperare dati dall\'API esterna',
                    array('status' => 502) // Bad Gateway
                );
            }

            // Parsing dei dati
            $jsonParser = new PlaceParser();
            $placesList = $jsonParser->parseFromJSON($jsonString);

            if (empty($placesList)) {
                return new WP_Error(
                    'parsing_error',
                    'Nessun place trovato nei dati dell\'API',
                    array('status' => 400)
                );
            }

            // Creazione dei posts
            $wpExecutor = new WPPlaceExecutor();
            $status = $wpExecutor->executePostsCreation($placesList);

            if ($status === 0) {
                return new WP_REST_Response(array(
                    'success' => true,
                    'message' => 'Importazione completata con successo',
                    'imported_count' => count($placesList),
                    'source' => $api_url
                ), 200);
            } else {
                return new WP_Error(
                    'import_failed',
                    'Errore durante l\'importazione dei places',
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
     * Elimina tutti i places
     */
    public function delete_all_places($request) {
        try {
            $args = array(
                'post_type' => 'place',
                'post_status' => 'any',
                'numberposts' => -1,
                'fields' => 'ids' // Solo gli ID per performance
            );

            $place_ids = get_posts($args);
            $deleted_count = 0;

            foreach ($place_ids as $place_id) {
                if (wp_delete_post($place_id, true)) { // true = elimina definitivamente
                    $deleted_count++;
                }
            }

            return new WP_REST_Response(array(
                'success' => true,
                'message' => 'Eliminazione completata',
                'deleted_count' => $deleted_count
            ), 200);

        } catch (Exception $e) {
            return new WP_Error(
                'server_error',
                'Errore del server: ' . $e->getMessage(),
                array('status' => 500)
            );
        }
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
     * Args per l'endpoint import all
     */
    public function get_import_all_args() {
        return array(
            'source' => array(
                'required' => false,
                'type' => 'string',
                'enum' => array('default', 'boundingbox', 'coords'),
                'default' => 'default',
                'description' => 'Sorgente dei dati da importare'
            )
        );
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