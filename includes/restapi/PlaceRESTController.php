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

class PlaceRESTController extends WP_REST_Controller{

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

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/autocomplete',
            array(
                array(
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_places_autocomplete' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                    'args'                => $this->get_collection_params(),
                ),
                'schema' => array( $this, 'get_public_item_schema' ),
            )
        );
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
     * Endpoint per autocomplete dei places
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
     */
    public function get_places_autocomplete( $request ) {
        $search = $request->get_param( 'search' );
        $per_page = $request->get_param( 'per_page' );
        $orderby = $request->get_param( 'orderby' );
        $order = $request->get_param( 'order' );
        
        // Parametri per la query
        $query_args = array(
            'post_type'      => 'place',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page ? intval( $per_page ) : 20,
            'orderby'        => $orderby ? sanitize_text_field( $orderby ) : 'title',
            'order'          => $order ? sanitize_text_field( $order ) : 'ASC'
        );
        
        // Aggiungi ricerca se specificata
        if ( ! empty( $search ) ) {
            $query_args['s'] = sanitize_text_field( $search );
        }
        
        // Ottieni i titoli
        $places = $this->get_place_titles( $query_args );
        
        // Prepara la risposta
        $data = array();
        foreach ( $places as $place ) {
            $data[] = array(
                'label' => $place['title'],
                'value' => $place['title'],
                'link'  => $place['url']
            );
        }
        
        return new WP_REST_Response( $data, 200 );
    }

    /**
     * Controlla le permissioni per leggere i places
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return true|WP_Error True if the request has read access, WP_Error object otherwise.
     */
    public function get_items_permissions_check( $request ) {
        // Puoi personalizzare le permissioni qui
        // Per ora permetti a tutti di leggere
        return true;
        
        // Esempi di controlli permessi:
        //return current_user_can( 'read' );
        //return current_user_can('manage_options');
        // return is_user_logged_in();
    }
    
    /**
     * Restituisce un array con i titoli dei post di tipo "Place"
     * (stessa funzione dell'artifact precedente)
     */
    private function get_place_titles( $args = array() ) {
        $default_args = array(
            'post_type' => 'place',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'orderby' => 'title',
            'order' => 'ASC',
            'fields' => 'ids'
        );
        
        $query_args = wp_parse_args( $args, $default_args );
        $places = get_posts( $query_args );
        $result = array();
        
        foreach ( $places as $place_id ) {
            $title = get_the_title( $place_id );
            if ( ! empty( $title ) ) {
                $result[] = array(
                    'id' => $place_id,
                    'title' => html_entity_decode( $title, ENT_QUOTES | ENT_HTML5, 'UTF-8' ),
                    'url' => get_permalink( $place_id )
                );
            }
        }
        
        return $result;
    }
    
    /**
     * Parametri della collection
     */
    public function get_collection_params() {
        $params = parent::get_collection_params();
        
        $params['search'] = array(
            'description'       => __( 'Cerca nei titoli dei places.' ),
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
        );
        
        $params['per_page'] = array(
            'description'       => __( 'Numero massimo di elementi da restituire.' ),
            'type'              => 'integer',
            'default'           => 20,
            'minimum'           => 1,
            'maximum'           => 100,
            'sanitize_callback' => 'absint',
        );
        
        $params['orderby'] = array(
            'description' => __( 'Ordina per campo.' ),
            'type'        => 'string',
            'default'     => 'title',
            'enum'        => array( 'title', 'date', 'menu_order' ),
        );
        
        $params['order'] = array(
            'description' => __( 'Ordine di sorting.' ),
            'type'        => 'string',
            'default'     => 'ASC',
            'enum'        => array( 'ASC', 'DESC' ),
        );
        
        return $params;
    }
    
    /**
     * Schema per l'item
     */
    public function get_public_item_schema() {
        $schema = array(
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'place_autocomplete',
            'type'       => 'object',
            'properties' => array(
                'label' => array(
                    'description' => __( 'Titolo del place per visualizzazione.' ),
                    'type'        => 'string',
                    'readonly'    => true,
                ),
                'value' => array(
                    'description' => __( 'Valore del place.' ),
                    'type'        => 'string',
                    'readonly'    => true,
                ),
            ),
        );
        
        return $schema;
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