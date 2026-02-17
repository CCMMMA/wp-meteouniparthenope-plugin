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
        <p>Importa tutti i places disponibili dall'API. Il sistema verificherà automaticamente quali places sono già presenti ed importerà solo quelli mancanti.</p>
        
        <!-- Info box con statistiche -->
        <div class="notice notice-info inline" style="margin: 15px 0; padding: 12px;">
            <p><strong>ℹ️ Come funziona:</strong></p>
            <ul style="margin-left: 20px;">
                <li>Il sistema recupera prima la lista dei places già importati</li>
                <li>Confronta con i places disponibili nell'API</li>
                <li>Importa solo i places non ancora presenti nel database</li>
                <li>Nessun duplicato verrà creato</li>
            </ul>
        </div>
        
        <form id="import-places-form">
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="import-source-select">Sorgente Dati</label>
                    </th>
                    <td>
                        <select id="import-source-select" name="source">
                            <option value="default">Tutti i places (solo nuovi)</option>
                            <option value="boundingbox">Area geografica specifica</option>
                            <option value="coords">Coordinate specifiche</option>
                        </select>
                        <p class="description">Seleziona la sorgente dei dati da importare. I places già presenti verranno automaticamente saltati.</p>
                    </td>
                </tr>
            </table>
            <div id="add-progress-fill" class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill">0%</div>
                </div>
            </div>
            <p class="submit">
                <button type="submit" id="import-places-btn" class="button button-primary">
                    <span class="dashicons dashicons-download" style="margin-top: 3px;"></span>
                    Importa nuovi Places
                </button>
            </p>
        </form>
        <div id="import-result"></div>
    </div>

    <!-- SEZIONE 2B: Cerca places mancanti -->
    <div class="utility-section">
        <h2><span class="dashicons dashicons-search"></span> Cerca Places Mancanti</h2>
        <p>Confronta i places disponibili nell'API con quelli già importati ed esporta la lista dei mancanti in formato JSON.</p>
        
        <div class="notice notice-info inline" style="margin: 15px 0; padding: 12px;">
            <p><strong>ℹ️ Come funziona:</strong></p>
            <ul style="margin-left: 20px;">
                <li>Il sistema confronta i places dell'API con quelli nel database</li>
                <li>Genera un file JSON con i places mancanti nel formato: <code>{"id": "nome"}</code></li>
                <li>Puoi scaricare il file e condividerlo o usarlo per un'importazione successiva</li>
            </ul>
        </div>
        
        <p class="submit">
            <button type="button" id="search-missing-places-btn" class="button button-primary">
                <span class="dashicons dashicons-search"></span>
                Cerca Places Mancanti
            </button>
            <button type="button" id="download-missing-json-btn" class="button button-secondary" style="display: none; margin-left: 10px;">
                <span class="dashicons dashicons-download"></span>
                Scarica JSON
            </button>
        </p>
        
        <div id="search-missing-result"></div>
    </div>

    <!-- SEZIONE 2C: Importazione da file JSON -->
    <div class="utility-section">
        <h2><span class="dashicons dashicons-media-code"></span> Importazione da File JSON</h2>
        <p>Importa places da un file JSON nel formato <code>{"place_id": "nome_place"}</code></p>
        
        <div class="notice notice-info inline" style="margin: 15px 0; padding: 12px;">
            <p><strong>📋 Formato file JSON richiesto:</strong></p>
            <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">{
  "com63049": "Napoli",
  "com63073": "Portici",
  "com63004": "Acerra"
}</pre>
        </div>
        
        <form id="json-import-form">
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="json-file-input">File JSON</label>
                    </th>
                    <td>
                        <input type="file" id="json-file-input" accept=".json" class="regular-text" />
                        <p class="description">Seleziona un file JSON con i places da importare</p>
                    </td>
                </tr>
            </table>
            
            <div class="progress-container" id="json-import-progress-container" style="display: none; margin: 15px 0;">
                <div class="progress-bar">
                    <div class="progress-fill" id="json-import-progress-fill">0%</div>
                </div>
            </div>
            
            <p class="submit">
                <button type="submit" id="json-import-btn" class="button button-primary" disabled>
                    <span class="dashicons dashicons-upload"></span>
                    Avvia Importazione
                </button>
            </p>
        </form>
        
        <div id="json-import-result"></div>
    </div>

    <!-- SEZIONE 3: Eliminazione -->
    <div class="utility-section">
        <h2><span class="dashicons dashicons-trash"></span> Gestione Places</h2>
        <p><strong>⚠️ Attenzione:</strong> Questa operazione eliminerà definitivamente tutti i places dal database.</p>
        
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
        <h2><span class="dashicons dashicons-chart-area"></span> Statistiche Places</h2>
        <table class="form-table">
            <tr>
                <th>Places pubblicati:</th>
                <td>
                    <span id="places-published" style="font-weight: bold; font-size: 16px; color: #2271b1;">
                        <?php echo esc_html($place_count->publish); ?>
                    </span>
                </td>
            </tr>
            <tr>
                <th>Places in bozza:</th>
                <td>
                    <span id="places-draft">
                        <?php echo esc_html($place_count->draft); ?>
                    </span>
                </td>
            </tr>
            <tr>
                <th>Places nel cestino:</th>
                <td>
                    <span id="places-trash">
                        <?php echo esc_html($place_count->trash); ?>
                    </span>
                </td>
            </tr>
            <tr>
                <th>Totale places:</th>
                <td>
                    <span id="places-total" style="font-weight: bold; font-size: 16px;">
                        <?php echo esc_html($place_count->publish + $place_count->draft + $place_count->private); ?>
                    </span>
                </td>
            </tr>
        </table>
        
        <div class="notice notice-info inline" style="margin-top: 15px;">
            <p>
                <strong>💡 Suggerimento:</strong> 
                Utilizza l'importazione massiva per aggiungere automaticamente i places mancanti dall'API. 
                Il sistema eviterà duplicati controllando i places già presenti.
            </p>
        </div>
    </div>
    
    <br>
    <br>
    <br>
    <br>
    
    <h2>Instrument management</h2>
    
    <!-- SEZIONE INSTRUMENTS 1: Importazione massiva -->
    <div class="utility-section">
        <h2><span class="dashicons dashicons-download"></span> Importazione massiva Instruments</h2>
        <p>Importa tutti gli instruments disponibili dall'API. Il sistema verificherà automaticamente quali instruments sono già presenti ed importerà solo quelli mancanti.</p>
        
        <!-- Info box con statistiche -->
        <div class="notice notice-info inline" style="margin: 15px 0; padding: 12px;">
            <p><strong>ℹ️ Come funziona:</strong></p>
            <ul style="margin-left: 20px;">
                <li>Il sistema recupera tutti gli instruments dall'API</li>
                <li>Verifica quali sono già presenti nel database</li>
                <li>Importa solo gli instruments mancanti</li>
                <li>Nessun duplicato verrà creato</li>
            </ul>
        </div>
        
        <div id="import-instruments-progress-container" class="progress-container" style="display: none;">
            <div class="progress-bar">
                <div class="progress-fill" id="import-instruments-progress-fill">0%</div>
            </div>
        </div>
        
        <p class="submit">
            <button type="button" id="import-instruments-btn" class="button button-primary">
                <span class="dashicons dashicons-download" style="margin-top: 3px;"></span>
                Importa tutti gli Instruments
            </button>
        </p>
        
        <div id="import-instruments-result"></div>
    </div>

    <!-- SEZIONE INSTRUMENTS 2: Eliminazione -->
    <div class="utility-section">
        <h2><span class="dashicons dashicons-trash"></span> Gestione Instruments</h2>
        <p><strong>⚠️ Attenzione:</strong> Questa operazione eliminerà definitivamente tutti gli instruments dal database.</p>
        
        <!-- Progress bar per l'eliminazione -->
        <div class="progress-container" id="delete-instruments-progress-container" style="display: none; margin: 15px 0;">
            <div class="progress-bar">
                <div class="progress-fill" id="delete-instruments-progress-fill">0%</div>
            </div>
            <div class="progress-info" id="delete-instruments-progress-info" style="margin-top: 10px; font-size: 14px; color: #666;">
                Preparazione eliminazione...
            </div>
        </div>
        
        <p class="submit">
            <button type="button" id="delete-all-instruments-btn" class="button delete">
                <span class="dashicons dashicons-trash"></span>
                Elimina tutti gli Instruments
            </button>
        </p>
        
        <!-- Div per i risultati dell'eliminazione -->
        <div id="delete-instruments-result"></div>
    </div>

    <!-- SEZIONE INSTRUMENTS 3: Statistiche -->
    <div class="utility-section">
        <h2><span class="dashicons dashicons-chart-area"></span> Statistiche Instruments</h2>
        <table class="form-table">
            <tr>
                <th>Instruments pubblicati:</th>
                <td>
                    <span id="instruments-published" style="font-weight: bold; font-size: 16px; color: #2271b1;">
                        <?php echo esc_html($instrument_count->publish); ?>
                    </span>
                </td>
            </tr>
            <tr>
                <th>Instruments in bozza:</th>
                <td>
                    <span id="instruments-draft">
                        <?php echo esc_html($instrument_count->draft); ?>
                    </span>
                </td>
            </tr>
            <tr>
                <th>Instruments nel cestino:</th>
                <td>
                    <span id="instruments-trash">
                        <?php echo esc_html($instrument_count->trash); ?>
                    </span>
                </td>
            </tr>
            <tr>
                <th>Totale instruments:</th>
                <td>
                    <span id="instruments-total" style="font-weight: bold; font-size: 16px;">
                        <?php echo esc_html($instrument_count->publish + $instrument_count->draft + $instrument_count->private); ?>
                    </span>
                </td>
            </tr>
        </table>
        
        <div class="notice notice-info inline" style="margin-top: 15px;">
            <p>
                <strong>💡 Suggerimento:</strong> 
                Utilizza l'importazione massiva per aggiungere automaticamente gli instruments dall'API. 
                Il sistema eviterà duplicati controllando gli instruments già presenti.
            </p>
        </div>
    </div>
</div>

<style>
/* Stili aggiuntivi per migliorare l'aspetto */
.utility-section {
    background: #fff;
    border: 1px solid #c3c4c7;
    box-shadow: 0 1px 1px rgba(0,0,0,.04);
    margin-bottom: 20px;
    padding: 20px;
}

.utility-section h2 {
    margin-top: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #dcdcde;
}

.progress-container {
    margin: 20px 0;
}

.progress-bar {
    width: 100%;
    height: 30px;
    background-color: #f0f0f1;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #c3c4c7;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #2271b1 0%, #135e96 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    transition: width 0.3s ease;
    min-width: 40px;
}

.notice.inline {
    display: block;
}

.notice.inline ul {
    margin: 8px 0;
}

.button .dashicons {
    vertical-align: middle;
    margin-right: 5px;
}
</style>