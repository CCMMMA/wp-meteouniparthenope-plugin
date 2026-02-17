<?php
/**
 * REST API Controller per la gestione degli Instruments
 * File: includes/API/InstrumentAPIController.php
 */

namespace Meteouniparthenope\restapi;

use Exception;
use WP_REST_Controller;
use WP_REST_Server;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use Meteouniparthenope\API\InstrumentsAPI;
use Meteouniparthenope\executors\WPInstrumentExecutor;
use Meteouniparthenope\JSONParser\InstrumentParser;
use Meteouniparthenope\cpts\Instrument;

class InstrumentRESTController extends WP_REST_Controller{

    /**
     * Namespace della REST API
     */
    protected $namespace = 'meteounip/v1';
    
    /**
     * Base dell'endpoint
     */
    protected $rest_base = 'instruments';

    /**
     * Base delle api meteo
     */
    private $apiBaseUrl = 'https://api.meteo.uniparthenope.it/instruments';
    //private $apiBaseUrl = 'https://signalk.meteo.uniparthenope.it/signalk/v1/api/meteo';

    /**
     * Registra le route
     */
    public function register_routes() {
        // Endpoint per aggiungere tutti gli instruments dalla API
        register_rest_route($this->namespace, '/' . $this->rest_base . '/import-all', array(
            array(
                'methods'             => WP_REST_Server::CREATABLE, // POST
                'callback'            => array($this, 'import_all_instruments'),
                'permission_callback' => array($this, 'create_item_permissions_check'),
            ),
        ));

        // Endpoint per aggiungere un singolo instrument
        register_rest_route($this->namespace, '/' . $this->rest_base . '/single', array(
            array(
                'methods'             => WP_REST_Server::CREATABLE, // POST
                'callback'            => array($this, 'add_single_instrument'),
                'permission_callback' => array($this, 'create_item_permissions_check'),
                'args'                => $this->get_single_instrument_args(),
            ),
        ));

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/autocomplete',
            array(
                array(
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_instruments_autocomplete' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                    'args'                => $this->get_collection_params(),
                ),
                'schema' => array( $this, 'get_public_item_schema' ),
            )
        );

        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<instrument_id>[^/]+)/link', array(
            array(
                'methods'             => WP_REST_Server::READABLE, // GET
                'callback'            => array($this, 'get_instrument_link'),
                'permission_callback' => array($this, 'get_items_permissions_check'),
                'args'                => array(
                    'instrument_id' => array(
                        'required' => true,
                        'type' => 'string',
                        'description' => 'ID univoco dell\'instrument',
                        'validate_callback' => function($param, $request, $key) {
                            return !empty($param);
                        }
                    ),
                ),
            ),
        ));

        // Endpoint per contare gli instruments
        register_rest_route($this->namespace, '/' . $this->rest_base . '/count', array(
            array(
                'methods'             => WP_REST_Server::READABLE, // GET
                'callback'            => array($this, 'count_instruments'),
                'permission_callback' => array($this, 'delete_items_permissions_check'),
            ),
        ));

        // Endpoint per ottenere tutti gli instrument_id esistenti
        register_rest_route($this->namespace, '/' . $this->rest_base . '/existing-ids', array(
            array(
                'methods'             => WP_REST_Server::READABLE, // GET
                'callback'            => array($this, 'get_existing_instrument_ids'),
                'permission_callback' => array($this, 'get_items_permissions_check'),
            ),
        ));

        // Endpoint per eliminare tutti gli instruments
        register_rest_route($this->namespace, '/' . $this->rest_base . '/delete-all', array(
            array(
                'methods'             => WP_REST_Server::DELETABLE, // DELETE
                'callback'            => array($this, 'delete_all_instruments'),
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
    }

    /**
     * Args per l'endpoint single instrument
     */
    public function get_single_instrument_args() {
        return array(
            'instrument_id' => array(
                'required' => true,
                'type' => 'string',
                'description' => 'ID univoco dell\'instrument',
                'validate_callback' => function($param, $request, $key) {
                    return !empty($param);
                }
            ),
            'long_name' => array(
                'required' => false,
                'type' => 'string',
                'description' => 'Nome lungo dell\'instrument (organization)'
            ),
            'latitude' => array(
                'required' => false,
                'type' => 'number',
                'description' => 'Latitudine dell\'instrument'
            ),
            'longitude' => array(
                'required' => false,
                'type' => 'number',
                'description' => 'Longitudine dell\'instrument'
            ),
            'type' => array(
                'required' => false,
                'type' => 'string',
                'description' => 'Tipo di instrument'
            ),
            'variables' => array(
                'required' => false,
                'type' => 'array',
                'description' => 'Array di nomi di variabili'
            )
        );
    }

    /**
     * Importa tutti gli instruments dalla API
     */
    public function import_all_instruments($request) {
        try {
            // Chiamata alla API per ottenere tutti gli instruments
            $instrumentAPI = new InstrumentsAPI();
            $apiResponse = $instrumentAPI->getData($this->apiBaseUrl);
            
            if (empty($apiResponse)) {
                return new WP_Error(
                    'api_error',
                    'Errore nel recupero dei dati dalla API',
                    array('status' => 500)
                );
            }

            // Parsa gli instruments dal JSON
            $instrumentParser = new InstrumentParser();
            $instruments = $instrumentParser->parseMultipleFromJSON($apiResponse);

            if (empty($instruments)) {
                return new WP_Error(
                    'parse_error',
                    'Nessun instrument trovato nel JSON o errore di parsing',
                    array('status' => 500)
                );
            }

            // Crea i post per tutti gli instruments
            $wpExecutor = new WPInstrumentExecutor();
            $created_count = 0;
            $skipped_count = 0;
            $errors = array();

            foreach ($instruments as $instrument) {
                // Verifica se esiste già
                $existing = $this->get_instrument_by_instrument_id($instrument->getIDInstrument());
                if ($existing) {
                    $skipped_count++;
                    continue;
                }

                $result = $wpExecutor->executePostCreation($instrument);
                if ($result === 0) {
                    $created_count++;
                } else {
                    $errors[] = 'Errore nella creazione di: ' . $instrument->getIDInstrument();
                }
            }

            return new WP_REST_Response(array(
                'success' => true,
                'message' => 'Importazione completata',
                'total_instruments' => count($instruments),
                'created' => $created_count,
                'skipped' => $skipped_count,
                'errors' => $errors
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
     * Aggiunge un singolo instrument
     */
    public function add_single_instrument($request) {
        try {
            $instrument_data = $request->get_json_params();
            
            // Validazione base dei dati
            if (empty($instrument_data['instrument_id'])) {
                return new WP_Error(
                    'missing_instrument_id',
                    'Instrument ID è richiesto',
                    array('status' => 400)
                );
            }

            // Verifica se l'instrument esiste già
            $existing_instrument = $this->get_instrument_by_instrument_id($instrument_data['instrument_id']);
            if ($existing_instrument) {
                return new WP_Error(
                    'instrument_already_exists',
                    'Instrument già esistente con ID: ' . $instrument_data['instrument_id'],
                    array('status' => 409) // Conflict
                );
            }

            // Crea l'oggetto Instrument dai dati forniti
            $instrument = new Instrument(
                $instrument_data['instrument_id'],
                $instrument_data['long_name'] ?? '',
                floatval($instrument_data['latitude'] ?? 0),
                floatval($instrument_data['longitude'] ?? 0),
                $instrument_data['variables'] ?? []
            );

            // Creazione dell'instrument
            $wpExecutor = new WPInstrumentExecutor();
            $result = $wpExecutor->executePostCreation($instrument);

            if ($result === 0) {
                return new WP_REST_Response(array(
                    'success' => true,
                    'message' => 'Instrument creato con successo',
                    'instrument_id' => $instrument_data['instrument_id'],
                    'wordpress_id' => $instrument->getWordpressID()
                ), 201);
            } else {
                return new WP_Error(
                    'creation_failed',
                    'Errore durante la creazione dell\'instrument',
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
     * Endpoint per autocomplete degli instruments
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
     */
    public function get_instruments_autocomplete( $request ) {
        $search = $request->get_param( 'search' );
        $per_page = $request->get_param( 'per_page' );
        $orderby = $request->get_param( 'orderby' );
        $order = $request->get_param( 'order' );
        
        // Parametri per la query
        $query_args = array(
            'post_type'      => 'instruments',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page ? intval( $per_page ) : 20,
            'orderby'        => $orderby ? sanitize_text_field( $orderby ) : 'title',
            'order'          => $order ? sanitize_text_field( $order ) : 'ASC',
        );
        
        // Aggiunge la ricerca se presente
        if ( ! empty( $search ) ) {
            $query_args['s'] = sanitize_text_field( $search );
        }
        
        $query = new \WP_Query( $query_args );
        $instruments = array();
        
        if ( $query->have_posts() ) {
            while ( $query->have_posts() ) {
                $query->the_post();
                $post_id = get_the_ID();
                
                // Recupera le variabili e le decodifica dal JSON
                $variables_json = get_post_meta( $post_id, 'variables', true );
                $variables = !empty($variables_json) ? json_decode($variables_json, true) : [];
                
                $instruments[] = array(
                    'id'            => $post_id,
                    'title'         => get_the_title(),
                    'instrument_id' => get_post_meta( $post_id, 'instrument_id', true ),
                    'long_name'     => get_post_meta( $post_id, 'long_name', true ),
                    'latitude'      => get_post_meta( $post_id, 'latitude', true ),
                    'longitude'     => get_post_meta( $post_id, 'longitude', true ),
                    'type'          => get_post_meta( $post_id, 'type', true ),
                    'variables'     => $variables,
                    'permalink'     => get_permalink( $post_id ),
                );
            }
            wp_reset_postdata();
        }
        
        return new WP_REST_Response( $instruments, 200 );
    }

    /**
     * Parametri per la collection
     */
    public function get_collection_params() {
        return array(
            'search' => array(
                'description'       => 'Cerca instruments per titolo',
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'per_page' => array(
                'description'       => 'Numero massimo di risultati',
                'type'              => 'integer',
                'default'           => 20,
                'minimum'           => 1,
                'maximum'           => 100,
            ),
            'orderby' => array(
                'description'       => 'Campo per ordinamento',
                'type'              => 'string',
                'default'           => 'title',
                'enum'              => array( 'title', 'date', 'id' ),
            ),
            'order' => array(
                'description'       => 'Direzione ordinamento',
                'type'              => 'string',
                'default'           => 'ASC',
                'enum'              => array( 'ASC', 'DESC' ),
            ),
        );
    }

    /**
     * Controllo permessi per lettura
     */
    public function get_items_permissions_check( $request ) {
        return true; // Pubblico
    }

    /**
     * Ottiene tutti gli instrument_id esistenti
     */
    public function get_existing_instrument_ids($request) {
        try {
            global $wpdb;
            
            // Query ottimizzata per ottenere solo i meta_value degli instrument_id
            $instrument_ids = $wpdb->get_col("
                SELECT DISTINCT pm.meta_value 
                FROM {$wpdb->postmeta} pm
                INNER JOIN {$wpdb->posts} p ON pm.post_id = p.ID
                WHERE pm.meta_key = 'instrument_id'
                AND p.post_type = 'instruments'
                AND p.post_status IN ('publish', 'draft', 'private')
                ORDER BY pm.meta_value ASC
            ");
            
            return new WP_REST_Response(array(
                'success' => true,
                'count' => count($instrument_ids),
                'instrument_ids' => $instrument_ids
            ), 200);
            
        } catch (Exception $e) {
            return new WP_Error(
                'query_error',
                'Errore nel recupero degli IDs: ' . $e->getMessage(),
                array('status' => 500)
            );
        }
    }

    /**
     * Ottiene il link del post WordPress tramite instrument_id
     * 
     * @param string $instrument_id L'ID dell'instrument
     * @return string|false Il permalink del post o false se non trovato
     */
    public function getInstrumentPostLinkByID($instrument_id) {
        $posts = get_posts([
            'post_type' => 'instruments',
            'post_status' => 'publish',
            'numberposts' => 1,
            'fields' => 'ids',
            'meta_key' => 'instrument_id',
            'meta_value' => sanitize_text_field($instrument_id)
        ]);
        
        if (!empty($posts)) {
            return get_permalink($posts[0]);
        }
        
        return false;
    }

    /**
     * Ottiene l'ID del post WordPress tramite instrument_id
     * 
     * @param string $instrument_id L'ID dell'instrument
     * @return int|false L'ID del post WordPress o false se non trovato
     */
    public function getInstrumentPostIDByInstrumentID($instrument_id) {
        $posts = get_posts([
            'post_type' => 'instruments',
            'post_status' => 'publish',
            'numberposts' => 1,
            'fields' => 'ids',
            'meta_key' => 'instrument_id',
            'meta_value' => sanitize_text_field($instrument_id)
        ]);
        
        return !empty($posts) ? $posts[0] : false;
    }

    /**
     * Ottiene il post object completo tramite instrument_id
     * 
     * @param string $instrument_id L'ID dell'instrument
     * @return WP_Post|null Il post object o null se non trovato
     */
    private function get_instrument_by_instrument_id($instrument_id) {
        $posts = get_posts([
            'post_type' => 'instruments',
            'post_status' => 'publish',
            'numberposts' => 1,
            'meta_key' => 'instrument_id',
            'meta_value' => sanitize_text_field($instrument_id)
        ]);
        
        return !empty($posts) ? $posts[0] : null;
    }

    /**
     * Callback per l'endpoint che restituisce il link dell'instrument
     * 
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure
     */
    public function get_instrument_link($request) {
        $instrument_id = $request->get_param('instrument_id');
        
        if (empty($instrument_id)) {
            return new WP_Error(
                'missing_instrument_id',
                'Instrument ID è richiesto',
                array('status' => 400)
            );
        }
        
        $link = $this->getInstrumentPostLinkByID($instrument_id);
        
        if ($link === false) {
            return new WP_Error(
                'instrument_not_found',
                'Nessun instrument trovato con ID: ' . $instrument_id,
                array('status' => 404)
            );
        }
        
        return new WP_REST_Response(array(
            'instrument_id' => $instrument_id,
            'link' => $link,
            'success' => true
        ), 200);
    }

    /**
     * Conta gli instruments totali
     */
    public function count_instruments($request) {
        try {
            $count = wp_count_posts('instruments');
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
     * Elimina instruments a batch per supportare la progress bar
     */
    public function delete_all_instruments($request) {
        try {
            $confirm = $request->get_param('confirm');
            $batch_size = $request->get_param('batch_size') ?: 10;
            
            if (!$confirm) {
                return new WP_Error(
                    'confirmation_required',
                    'Conferma richiesta per eliminare tutti gli instruments',
                    array('status' => 400)
                );
            }

            // Usa sempre offset 0 e prendi sempre i primi N instruments
            $instruments = get_posts(array(
                'post_type' => 'instruments',
                'post_status' => array('publish', 'draft', 'private', 'trash'),
                'posts_per_page' => $batch_size,
                'offset' => 0,
                'fields' => 'ids',
                'orderby' => 'ID',
                'order' => 'ASC'
            ));

            $deleted_count = 0;
            $errors = array();

            // Se non ci sono più instruments da eliminare
            if (empty($instruments)) {
                return new WP_REST_Response(array(
                    'success' => true,
                    'deleted_in_batch' => 0,
                    'remaining_count' => 0,
                    'is_completed' => true,
                    'errors' => array(),
                    'message' => "Eliminazione completata! Nessun instrument rimanente."
                ), 200);
            }

            foreach ($instruments as $instrument_id) {
                // Forza l'eliminazione definitiva (bypass cestino)
                $result = wp_delete_post($instrument_id, true);
                
                if ($result) {
                    $deleted_count++;
                } else {
                    $errors[] = "Errore eliminazione instrument ID: $instrument_id";
                }
            }

            // Conta gli instruments rimanenti
            $remaining_count = wp_count_posts('instruments');
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
                    "Eliminazione completata! Eliminati $deleted_count instruments in questo batch." :
                    "Eliminati $deleted_count instruments. Rimangono $total_remaining instruments."
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
     * Controllo permessi per eliminazione
     */
    public function delete_items_permissions_check($request) {
        return current_user_can('manage_options');
    }
    
}

?>