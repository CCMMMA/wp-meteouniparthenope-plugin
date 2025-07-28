<div class="wrap">
    <h1>Plugin Utilities</h1>

    <!-- SEZIONE 1: Aggiungi singolo Place -->
    <div class="utility-section">
        <h2><span class="dashicons dashicons-plus-alt"></span> Aggiungi singolo Place</h2>
        <p>Inserisci l'ID di un place specifico per aggiungerlo al database:</p>
        <form id="add-single-place-form">
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="place_id">Place ID:</label></th>
                    <td>
                        <input type="text" id="place_id" name="place_id" class="regular-text" placeholder="es: com63049" />
                        <p class="description">Inserisci l'ID alfanumerico del place da importare dall'API (es: com63049).</p>
                    </td>
                </tr>
            </table>
            <p class="submit">
                <button type="submit" id="add-single-place-btn" class="button button-primary">Aggiungi Place</button>
            </p>
        </form>
        <div id="single-place-result"></div>
    </div>

    <!-- SEZIONE 2: Importazione massiva -->
    <div class="utility-section">
        <h2><span class="dashicons dashicons-download"></span> Importazione massiva Places</h2>
        <p>Importa tutti i places disponibili dall'API:</p>
        <form id="import-places-form">
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="import-source-select">Sorgente Dati</label>
                    </th>
                    <td>
                        <select id="import-source-select" name="source">
                            <option value="default">Tutti i places</option>
                            <option value="boundingbox">Area geografica specifica</option>
                            <option value="coords">Coordinate specifiche</option>
                        </select>
                        <p class="description">Seleziona la sorgente dei dati da importare</p>
                    </td>
                </tr>
            </table>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill">0%</div>
                </div>
            </div>
            <p class="submit">
                <button type="submit" id="import-places-btn" class="button button-primary">Importa tutti i Places</button>
            </p>
        </form>
        <div id="import-result"></div>
    </div>

    <!-- SEZIONE 3: Eliminazione -->
    <div class="utility-section">
        <h2><span class="dashicons dashicons-trash"></span> Gestione Places</h2>
        <p><strong>Attenzione:</strong> Questa operazione eliminerà definitivamente tutti i places dal database.</p>
        <?php if (!empty($deletion_message)): ?>
        <div class="notice-custom notice-error">
            <p><?php echo esc_html($deletion_message); ?></p>
        </div>
        <?php endif; ?>
        <form method="post">
            <?php wp_nonce_field('meteounipplugin_delete_nonce'); ?>
            <p class="submit">
                <button type="submit" id="delete-all-places-btn" class="button delete">Elimina tutti i Places</button>
            </p>
        </form>
    </div>

    <!-- SEZIONE 4: Statistiche -->
    <div class="utility-section">
        <h2><span class="dashicons dashicons-chart-area"></span> Statistiche</h2>
        <table class="form-table">
            <tr><th>Places pubblicati:</th><td><span id="places-published"><?php echo esc_html($place_count->publish); ?></span></td></tr>
            <tr><th>Places in bozza:</th><td><span id="places-draft"><?php echo esc_html($place_count->draft); ?></span></td></tr>
            <tr><th>Places nel cestino:</th><td><span id="places-trash"><?php echo esc_html($place_count->trash); ?></span></td></tr>
            <tr><th>Totale places:</th><td><span id="places-total"><?php echo esc_html($place_count->publish + $place_count->draft + $place_count->private); ?></span></td></tr>
        </table>
    </div>
</div>