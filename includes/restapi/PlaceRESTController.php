<?php
/**
 * REST API Controller per la gestione dei Places
 * File: includes/API/PlaceAPIController.php
 */

namespace Meteouniparthenope\restapi;

use Exception;
use WP_REST_Controller;
use WP_REST_Server;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use Meteouniparthenope\API\PlacesAPI;
use Meteouniparthenope\executors\WPPlaceExecutor;
use Meteouniparthenope\JSONParser\PlaceParser;
use Meteouniparthenope\cpts\Place;

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
     * Maximum number of recent places
     */
    private $MAX_RECENT_PLACES = 6;

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

        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<place_id>[^/]+)/link', array(
            array(
                'methods'             => WP_REST_Server::READABLE, // GET
                'callback'            => array($this, 'get_place_link'),
                'permission_callback' => array($this, 'get_items_permissions_check'),
                'args'                => array(
                    'place_id' => array(
                        'required' => true,
                        'type' => 'string',
                        'description' => 'ID univoco del place',
                        'validate_callback' => function($param, $request, $key) {
                            return !empty($param);
                        }
                    ),
                ),
            ),
        ));

        // Endpoint per contare i places
        register_rest_route($this->namespace, '/' . $this->rest_base . '/count', array(
            array(
                'methods'             => WP_REST_Server::READABLE, // GET
                'callback'            => array($this, 'count_places'),
                'permission_callback' => array($this, 'delete_items_permissions_check'),
            ),
        ));

        // NUOVO: Endpoint per ottenere tutti i place_id esistenti
        register_rest_route($this->namespace, '/' . $this->rest_base . '/existing-ids', array(
            array(
                'methods'             => WP_REST_Server::READABLE, // GET
                'callback'            => array($this, 'get_existing_place_ids'),
                'permission_callback' => array($this, 'get_items_permissions_check'),
            ),
        ));

        // Endpoint per eliminare tutti i places
        register_rest_route($this->namespace, '/' . $this->rest_base . '/delete-all', array(
            array(
                'methods'             => WP_REST_Server::DELETABLE, // DELETE
                'callback'            => array($this, 'delete_all_places'),
                'permission_callback' => array($this, 'delete_items_permissions_check'),
                'args'                => array(
                    'confirm' => array(
                        'required' => true,
                        'type' => 'boolean',
                        'description' => 'Conferma per eliminazione di massa',
                        'validate_callback' => function($param, $request, $key) {
                            return $param === true;
                        }
                    ),
                ),
            ),
        ));

        register_rest_route($this->namespace, '/' . $this->rest_base . '/recent/resolve', array(
            array(
                'methods'             => WP_REST_Server::CREATABLE, // POST
                'callback'            => array($this, 'resolve_recent_places'),
                'permission_callback' => array($this, 'get_items_permissions_check'),
                'args'                => array(
                    'entries' => array(
                        'required'          => true,
                        'type'              => 'array',
                        'description'       => 'Array di {place, prod, output} dal cookie',
                        'validate_callback' => function($param) {
                            // Accetta sia array già deserializzato che stringa JSON
                            if ( is_string($param) ) {
                                $decoded = json_decode($param, true);
                                return is_array($decoded) && count($decoded) <= $this->MAX_RECENT_PLACES;
                            }
                            return is_array($param) && count($param) <= $this->MAX_RECENT_PLACES;
                        },
                    ),
                ),
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
            'post_type'      => 'places',
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
            $data[] = $this->prepare_item_for_response( $place, $request );
        }
        
        $response = rest_ensure_response( $data );
        
        // Aggiungi header con il totale se disponibile
        $response->header( 'X-WP-Total', count( $data ) );
        
        return $response;
    }
    
    /**
     * Ottiene i titoli dei places basandosi sui parametri di query
     *
     * @param array $query_args Query arguments.
     * @return array Array di post objects.
     */
    private function get_place_titles( $query_args ) {
        // Esegui la query
        $query = new \WP_Query( $query_args );
        
        // Restituisci i post
        return $query->posts;
    }
    
    /**
     * Prepara un singolo item per la risposta
     *
     * @param \WP_Post        $post    Post object.
     * @param WP_REST_Request $request Request object.
     * @return array
     */
    public function prepare_item_for_response( $post, $request ) {
        // Ottieni i metadati del place
        $place_id = get_post_meta( $post->ID, 'place_id', true );
        
        $data = array(
            'id'       => $post->ID,
            'title'    => $post->post_title,
            'place_id' => $place_id,
            'value'    => $post->post_title, // Per compatibilità con sistemi di autocomplete
            'link'     => get_permalink( $post->ID )
        );
        
        return $data;
    }
    
    /**
     * Ottiene i parametri per la collection
     *
     * @return array
     */
    public function get_collection_params() {
        return array(
            'search' => array(
                'description'       => __( 'Cerca nei titoli dei places.' ),
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'validate_callback' => 'rest_validate_request_arg',
            ),
            'per_page' => array(
                'description'       => __( 'Numero massimo di risultati da restituire.' ),
                'type'              => 'integer',
                'default'           => 20,
                'minimum'           => 1,
                'maximum'           => 100,
                'sanitize_callback' => 'absint',
                'validate_callback' => 'rest_validate_request_arg',
            ),
            'orderby' => array(
                'description'       => __( 'Ordina i risultati per campo.' ),
                'type'              => 'string',
                'default'           => 'title',
                'enum'              => array( 'title', 'date', 'modified' ),
                'sanitize_callback' => 'sanitize_text_field',
                'validate_callback' => 'rest_validate_request_arg',
            ),
            'order' => array(
                'description'       => __( 'Ordine di ordinamento (ascendente o discendente).' ),
                'type'              => 'string',
                'default'           => 'ASC',
                'enum'              => array( 'ASC', 'DESC' ),
                'sanitize_callback' => 'sanitize_text_field',
                'validate_callback' => 'rest_validate_request_arg',
            ),
        );
    }
    
    /**
     * Controllo permessi per lettura
     */
    public function get_items_permissions_check( $request ) {
        return true; // Pubblicamente accessibile
    }
    
    /**
     * Ottiene lo schema per l'item
     *
     * @return array
     */
    public function get_public_item_schema() {
        $schema = array(
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'place',
            'type'       => 'object',
            'properties' => array(
                'id' => array(
                    'description' => __( 'ID univoco del post.' ),
                    'type'        => 'integer',
                    'readonly'    => true,
                ),
                'title' => array(
                    'description' => __( 'Titolo del place.' ),
                    'type'        => 'string',
                    'readonly'    => true,
                ),
                'place_id' => array(
                    'description' => __( 'ID del place dall\'API.' ),
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
     * NUOVO: Ottiene tutti gli ID dei places esistenti nel database
     * Ottimizzato per performance con query diretta
     * 
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure
     */
    public function get_existing_place_ids($request) {
        try {
            global $wpdb;
            
            // Query ottimizzata che prende solo i place_id dai metadati
            $query = "
                SELECT DISTINCT meta_value 
                FROM {$wpdb->postmeta} pm
                INNER JOIN {$wpdb->posts} p ON pm.post_id = p.ID
                WHERE p.post_type = 'places'
                AND p.post_status IN ('publish', 'draft', 'private')
                AND pm.meta_key = 'place_id'
                AND pm.meta_value IS NOT NULL
                AND pm.meta_value != ''
            ";
            
            $place_ids = $wpdb->get_col($query);
            
            return new WP_REST_Response(array(
                'success' => true,
                'place_ids' => $place_ids,
                'count' => count($place_ids)
            ), 200);
            
        } catch (Exception $e) {
            return new WP_Error(
                'query_error',
                'Errore nel recupero degli ID: ' . $e->getMessage(),
                array('status' => 500)
            );
        }
    }

    /**
     * Utility: trova place per place_id
     */
    /**
     * Ottiene il link del post WordPress tramite place_id (versione ottimizzata)
     * 
     * @param string $place_id L'ID del place
     * @return string|false Il permalink del post o false se non trovato
     */
    public function getPlacePostLinkByID($place_id) {
        $posts = get_posts([
            'post_type' => 'places',
            'post_status' => 'publish',
            'numberposts' => 1,
            'fields' => 'ids', // Ottieni solo gli ID per massima efficienza
            'meta_key' => 'place_id',
            'meta_value' => sanitize_text_field($place_id)
        ]);
        
        if (!empty($posts)) {
            return get_permalink($posts[0]);
        }
        
        return false;
    }

    /**
     * Ottiene l'ID del post WordPress tramite place_id (versione ottimizzata della tua funzione esistente)
     * 
     * @param string $place_id L'ID del place
     * @return int|false L'ID del post WordPress o false se non trovato
     */
    public function getPlacePostIDByPlaceID($place_id) {
        $posts = get_posts([
            'post_type' => 'places',
            'post_status' => 'publish',
            'numberposts' => 1,
            'fields' => 'ids',
            'meta_key' => 'place_id',
            'meta_value' => sanitize_text_field($place_id)
        ]);
        
        return !empty($posts) ? $posts[0] : false;
    }

    /**
     * Ottiene il post object completo tramite place_id (aggiornamento della tua funzione esistente)
     * Ora più efficiente e con lo stesso nome della tua funzione attuale
     * 
     * @param string $place_id L'ID del place
     * @return WP_Post|null Il post object o null se non trovato
     */
    private function get_place_by_place_id($place_id) {
        $posts = get_posts([
            'post_type' => 'places',
            'post_status' => 'publish',
            'numberposts' => 1,
            'meta_key' => 'place_id',
            'meta_value' => sanitize_text_field($place_id)
        ]);
        
        return !empty($posts) ? $posts[0] : null;
    }

    /**
     * Callback per l'endpoint che restituisce il link del place
     * 
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure
     */
    public function get_place_link($request) {
        $place_id = $request->get_param('place_id');
        
        if (empty($place_id)) {
            return new WP_Error(
                'missing_place_id',
                'Place ID è richiesto',
                array('status' => 400)
            );
        }
        
        $link = $this->getPlacePostLinkByID($place_id);
        
        if ($link === false) {
            return new WP_Error(
                'place_not_found',
                'Nessun place trovato con ID: ' . $place_id,
                array('status' => 404)
            );
        }
        
        return new WP_REST_Response(array(
            'place_id' => $place_id,
            'link' => $link,
            'success' => true
        ), 200);
    }
    /**
     * Conta i places totali da eliminare
     */
    public function count_places($request) {
        try {
            $count = wp_count_posts('places');
            $total = $count->publish + $count->draft + $count->private + $count->trash;
            
            return new WP_REST_Response(array(
                'success' => true,
                'total_count' => $total,
                'by_status' => array(
                    'publish' => $count->publish,
                    'draft' => $count->draft,
                    'private' => $count->private,
                    'trash' => $count->trash
                )
            ), 200);
            
        } catch (Exception $e) {
            return new WP_Error(
                'count_error',
                'Errore nel conteggio: ' . $e->getMessage(),
                array('status' => 500)
            );
        }
    }

    /**
     * Elimina places a batch per supportare la progress bar
     * CORREZIONE: Usa sempre offset 0 perché eliminiamo sempre i primi N places
     */
    public function delete_all_places($request) {
        try {
            $confirm = $request->get_param('confirm');
            $batch_size = $request->get_param('batch_size') ?: 10;
            
            if (!$confirm) {
                return new WP_Error(
                    'confirmation_required',
                    'Conferma richiesta per eliminare tutti i places',
                    array('status' => 400)
                );
            }

            // CORREZIONE: Usa sempre offset 0 e prendi sempre i primi N places
            // Perché quando elimini, quelli successivi "scivolano" in prima posizione
            $places = get_posts(array(
                'post_type' => 'places',
                'post_status' => array('publish', 'draft', 'private', 'trash'),
                'posts_per_page' => $batch_size,
                'offset' => 0, // SEMPRE 0!
                'fields' => 'ids',
                'orderby' => 'ID',
                'order' => 'ASC'
            ));

            $deleted_count = 0;
            $errors = array();

            // Se non ci sono più places da eliminare
            if (empty($places)) {
                return new WP_REST_Response(array(
                    'success' => true,
                    'deleted_in_batch' => 0,
                    'remaining_count' => 0,
                    'is_completed' => true,
                    'errors' => array(),
                    'message' => "Eliminazione completata! Nessun place rimanente."
                ), 200);
            }

            foreach ($places as $place_id) {
                // Forza l'eliminazione definitiva (bypass cestino)
                $result = wp_delete_post($place_id, true);
                
                if ($result) {
                    $deleted_count++;
                } else {
                    $errors[] = "Errore eliminazione place ID: $place_id";
                }
            }

            // Conta i places rimanenti
            $remaining_count = wp_count_posts('places');
            $total_remaining = $remaining_count->publish + $remaining_count->draft + 
                            $remaining_count->private + $remaining_count->trash;

            $is_completed = $total_remaining === 0;

            // Se è l'ultimo batch, pulisci anche eventuali meta orfani
            if ($is_completed) {
                global $wpdb;
                $wpdb->query("
                    DELETE pm FROM {$wpdb->postmeta} pm
                    LEFT JOIN {$wpdb->posts} p ON pm.post_id = p.ID
                    WHERE p.ID IS NULL
                ");
            }

            return new WP_REST_Response(array(
                'success' => true,
                'deleted_in_batch' => $deleted_count,
                'remaining_count' => $total_remaining,
                'is_completed' => $is_completed,
                'errors' => $errors,
                'message' => $is_completed ? 
                    "Eliminazione completata! Eliminati $deleted_count places in questo batch." :
                    "Eliminati $deleted_count places. Rimangono $total_remaining places."
            ), 200);

        } catch (Exception $e) {
            return new WP_Error(
                'deletion_error',
                'Errore durante l\'eliminazione: ' . $e->getMessage(),
                array('status' => 500)
            );
        }
    }

    /**
     * Recupera prod_label e output_label dall'API meteo esterna.
     * Endpoint: /products/{prod}/forecast/{place}/plot/alt?output={output}
     * Risposta attesa: "Hours HH:MM UTC of day DD-MM-YYYY, <place_label>, <prod_label>, <output_label>"
     *
     * @param string $place_id  ID del place (es. "ca001")
     * @param string $prod      Prodotto (es. "wrf5")
     * @param string $output    Output (es. "gen")
     * @return array            ['prod_label' => string, 'output_label' => string]
     */
    private function fetch_labels( string $place_id, string $prod, string $output ): array {
        $url = "https://api.meteo.uniparthenope.it/products/{$prod}/forecast/{$place_id}/plot/alt?output={$output}";

        $response = wp_remote_get( $url, [
            'timeout'   => 5,
            'sslverify' => true,
        ]);

        // Fallback silenzioso: se l'API non risponde usiamo i codici grezzi
        if ( is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200 ) {
            return [
                'prod_label'   => $prod,
                'output_label' => $output,
            ];
        }

        $body = trim( wp_remote_retrieve_body($response) );

        // Parsing: split per virgola, trim di ogni segmento
        // Formato atteso: "Hours HH:MM UTC of day DD-MM-YYYY, <place>, <prod_label>, <output_label>"
        $parts = array_map( 'trim', explode( ',', $body ) );

        // Ci aspettiamo almeno 4 segmenti; prod_label = indice 2, output_label = indice 3
        if ( count($parts) < 4 ) {
            return [
                'prod_label'   => $prod,
                'output_label' => $output,
            ];
        }

        return [
            'prod_label'   => $parts[2],
            'output_label' => trim($parts[3], '"'),
        ];
    }

    public function resolve_recent_places( WP_REST_Request $request ) {
        $entries = $request->get_param('entries');

        // Gestisce il caso in cui entries arrivi come stringa JSON
        if ( is_string($entries) ) {
            $entries = json_decode($entries, true);
        }

        if ( ! is_array($entries) ) {
            return new WP_Error('invalid_entries', 'Entries non valide', ['status' => 400]);
        }

        // Allowed values per prod e output — adattale ai valori reali del tuo sistema
        $allowed_prods   = ['wrf5', 'aiq3', 'rms3', 'wcm3', 'ww33']; // esempio
        $allowed_outputs = ['gen','crd','crh','gp5','gp8','mcape','rh2','tsp','uh','wn1','wn2','wn4', //wrf5
                            'mci', //aiq3
                            'scu','sss','sst', //rms3
                            'cof','con', //wcm3
                            'fpd','hsd','lmd','ppd' //ww33
                            ];   

        $results = [];

        foreach ( array_slice($entries, 0, $this->MAX_RECENT_PLACES) as $entry ) {
            // Sanitizzazione
            $place_id = isset($entry['place'])  ? sanitize_text_field($entry['place'])  : '';
            $prod     = isset($entry['prod'])   ? sanitize_text_field($entry['prod'])   : '';
            $output   = isset($entry['output']) ? sanitize_text_field($entry['output']) : '';

            // Validazione
            if ( empty($place_id) ) continue;
            if ( ! in_array($prod,   $allowed_prods,   true) ) continue;
            if ( ! in_array($output, $allowed_outputs, true) ) continue;

            // Trova il post WP tramite il meta place_id (riusi la tua funzione esistente)
            $post_id = $this->getPlacePostIDByPlaceID($place_id);
            if ( ! $post_id ) continue;

            $labels = $this->fetch_labels( $place_id, $prod, $output );

            $results[] = [
                'place_id'     => $place_id,
                'prod'         => $prod,
                'output'       => $output,
                'prod_label'   => $labels['prod_label'],
                'output_label' => $labels['output_label'],
                'title'        => get_the_title($post_id),
                'permalink'    => add_query_arg(
                                      ['prod' => $prod, 'output' => $output],
                                      get_permalink($post_id)
                                  ),
            ];
        }

        return new WP_REST_Response([
            'success' => true,
            'data'    => $results,
        ], 200);
    }

/**
 * Controllo permessi per eliminazione
 */
public function delete_items_permissions_check($request) {
    return current_user_can('manage_options');
}

    
}

?>