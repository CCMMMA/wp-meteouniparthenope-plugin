<?php

namespace Meteouniparthenope\loaders;

class AdminLoader{
    private $plugin_dir_path = METEOUNIPARTHENOPE_PLUGIN_DIR_ABS;
    private $plugin_dir_url = METEOUNIPARTHENOPE_PLUGIN_DIR;

    public function loadAdminComponents(){
        add_action('admin_menu', [$this,'meteounipplugin_add_admin_menu']);
        add_action('admin_enqueue_scripts', [$this,'meteounipplugin_enqueue_admin_assets']);
    }

    function meteounipplugin_add_admin_menu() {
        add_menu_page(
            'meteo@uniparthenope-plugin',
            'meteo@uniparthenope-plugin',
            'manage_options',
            'meteounipplugin_dashboard',
            [$this,'meteounipplugin_render_dashboard_page'],
            'dashicons-cloud'
        );

        add_submenu_page(
            'meteounipplugin_dashboard',
            'Dashboard',
            'Dashboard',
            'manage_options',
            'meteounipplugin_dashboard',
            [$this,'meteounipplugin_render_dashboard_page']
        );

        add_submenu_page(
            'meteounipplugin_dashboard',
            'Places',
            'Places',
            'manage_options',
            'edit.php?post_type=places'
        );

        add_submenu_page(
            'meteounipplugin_dashboard',
            'Instruments',
            'Instruments',
            'manage_options',
            'edit.php?post_type=instruments'
        );

        add_submenu_page(
            'meteounipplugin_dashboard',
            'Utility',
            'Utility',
            'manage_options',
            'meteounipplugin_utility',
            [$this,'meteounipplugin_render_utility_page']
        );
    }

    function meteounipplugin_render_dashboard_page() {
        ?>
        <div class="wrap">
            <h1>Welcome to meteo@uniparthenope plugin dashboard!</h1>
            <p>Uses the following links to dive into plugin's sections:</p>

            <ul style="list-style: none; margin-left: 0; padding-left: 0;">
                <li style="margin-bottom: 10px;">
                    <a href="<?php echo admin_url('edit.php?post_type=places'); ?>" class="button button-primary">Places management</a>
                </li>
                <li style="margin-bottom: 10px;">
                    <a href="<?php echo admin_url('edit.php?post_type=instruments'); ?>" class="button button-primary">Instruments management</a>
                </li>
                <li style="margin-bottom: 10px;">
                    <a href="<?php echo admin_url('admin.php?page=meteounipplugin_utility'); ?>" class="button">Plugin utilities</a>
                </li>
            </ul>
        </div>
        <?php
    }

    function meteounipplugin_render_utility_page(){
        $template_data = array(
            //'nonce_single_place' => wp_create_nonce('add_single_place_nonce'),
            //'nonce_import_places' => wp_create_nonce('import_places_nonce'),
            'place_count' => wp_count_posts('places'),
            //'ajaxurl' => admin_url('admin-ajax.php')
            'instrument_count' => wp_count_posts('instruments')
        );

        extract($template_data);

        $template_path = $this->plugin_dir_path . 'templates/admin_utility_page.php';
        // Verifica che il file esista
        if (file_exists($template_path)) {
            // Cattura l'output del template
            ob_start();
            include $template_path;
            $content = ob_get_clean();
            echo $content;
        } else {
            echo '<div class="notice notice-error"><p>Template non trovato: ' . $template_name . '</p></div>';
        }
    }

    function meteounipplugin_enqueue_admin_assets($hook) {
        // Controlla sia il nome completo che quello semplificato della pagina
        if ($hook === 'meteouniparthenope-plugin_page_meteounipplugin_utility' || 
            $hook === 'meteo@uniparthenope-plugin_page_meteounipplugin_utility' ||
            strpos($hook, 'meteounipplugin_utility') !== false) {
            
            wp_enqueue_style(
                'admin-utility-page-style',
                $this->plugin_dir_url . 'static/css/admin_utility_page.css',
                array(),
                filemtime($this->plugin_dir_path . 'static/css/admin_utility_page.css')
            );

            wp_enqueue_script(
                'admin-utility-page-js',
                $this->plugin_dir_url . 'static/js/admin_utility_page.js',
                array('jquery'), // Dipendenza da jQuery
                filemtime($this->plugin_dir_path . 'static/js/admin_utility_page.js'),
                true // Carica nel footer
            );

            wp_enqueue_script(
                'massive-import-js',
                $this->plugin_dir_url . 'static/js/massive_import.js',
                array('jquery'), // Dipendenza da jQuery
                filemtime($this->plugin_dir_path . 'static/js/massive_import.js'),
                true // Carica nel footer
            );

            // CORRETTO: Fornisce dati REST API al JavaScript
            wp_localize_script('admin-utility-page-js', 'wpApiSettings', array(
                'root' => esc_url_raw(rest_url()),
                'nonce' => wp_create_nonce('wp_rest'),
                'ajaxurl' => admin_url('admin-ajax.php') // Per compatibilità
            ));
        }
    }
}

?>