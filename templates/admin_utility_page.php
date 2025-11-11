<div class="wrap">
    <h1>Plugin Utilities</h1>

    <h2>Place management</h2>
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
            <div id="add-progress-fill" class="progress-container">
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
        
        <!-- Form per eliminazione tramite REST API -->
        <div id="delete-places-container">
            <!-- Progress bar per l'eliminazione -->
            <div class="progress-container" id="delete-progress-container" style="display: none; margin: 15px 0;">
                <div class="progress-bar">
                    <div class="progress-fill" id="delete-progress-fill">0%</div>
                </div>
                <div class="progress-info" id="delete-progress-info" style="margin-top: 10px; font-size: 14px; color: #666;">
                    Preparazione eliminazione...
                </div>
            </div>
            
            <p class="submit">
                <button type="button" id="delete-all-places-btn" class="button delete">
                    <span class="dashicons dashicons-trash"></span>
                    Elimina tutti i Places via API
                </button>
            </p>
            
            <!-- Div per i risultati dell'eliminazione -->
            <div id="delete-result"></div>
        </div>
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
    
    <br>
    <br>
    <br>
    <br>
    
    <h2>Instrument management</h2>
    <div class="utility-section">
        <h2><span class="dashicons dashicons-chart-area"></span> Statistiche</h2>
        <table class="form-table">
            <tr><th>Instruments pubblicati:</th><td><span id="instruments-published"><?php echo esc_html($instrument_count->publish); ?></span></td></tr>
            <tr><th>Instruments in bozza:</th><td><span id="instruments-draft"><?php echo esc_html($instrument_count->draft); ?></span></td></tr>
            <tr><th>Instruments nel cestino:</th><td><span id="instruments-trash"><?php echo esc_html($instrument_count->trash); ?></span></td></tr>
            <tr><th>Totale instruments:</th><td><span id="instruments-total"><?php echo esc_html($instrument_count->publish + $instrument_count->draft + $instrument_count->private); ?></span></td></tr>
        </table>
    </div>
</div>