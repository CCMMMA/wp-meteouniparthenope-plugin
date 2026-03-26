class InstrumentLiveChart {
    static get defaults() {
        return {
            shortcode_id: 0,
            instrument_id: "it_uniparthenope_meteo_ws1",
            long_name: "Centro Direzionale",
            lat: 40.8564635,
            long: 14.2946362,
            variablesName: [],
            variablesDescription: [],
            defaultVariables: ["environment.outside.temperature","environment.wind.speedTrue"],  // Array di path delle variabili da selezionare di default
            mode: "POST"
        };
    }

    constructor(options = {}) {
        this.shortcode_id = options.shortcode_id || InstrumentLiveChart.defaults.shortcode_id;
        this.instrument_id = options.instrument_id || InstrumentLiveChart.defaults.instrument_id;
        this.long_name = options.long_name || InstrumentLiveChart.defaults.long_name;
        this.lat = options.lat || InstrumentLiveChart.defaults.lat;
        this.long = options.long || InstrumentLiveChart.defaults.long;
        this.variablesName = options.variablesName || InstrumentLiveChart.defaults.variablesName;
        this.variablesDescription = options.variablesDescription || InstrumentLiveChart.defaults.variablesDescription;
        this.defaultVariables = options.defaultVariables || InstrumentLiveChart.defaults.defaultVariables;
        this.mode = options.mode || InstrumentLiveChart.defaults.mode;

        // Configurazione variabili disponibili con metadati
        this.AVAILABLE_VARIABLES = {};
        this.VARIABLES_PATHS = [];
        if(this.mode=="STANDALONE" && this.variablesName){
            this.long_name = instrumentsNames[this.instrument_id];
            this.AVAILABLE_VARIABLES = instrumentsAvailableVariables;
            for(var key in instrumentsAvailableVariables){
                this.VARIABLES_PATHS.push(key);
            }
            this.lat = instrumentsLatLon[this.instrument_id]['latitude'];
            this.long = instrumentsLatLon[this.instrument_id]['longitude'];
        }
        else{
            var self = this;
            console.log("variablesName:");
            console.log(this.variablesName);
            
            this.variablesName.forEach(function(value,index){
                self.VARIABLES_PATHS.push(value);
                self.AVAILABLE_VARIABLES[value] = instrumentsAvailableVariables[value];
            });
            console.log("VARIABLES_PATHS:");
            console.log(this.VARIABLES_PATHS);
            console.log("AVAILABLE_VARIABLES:");
            console.log(this.AVAILABLE_VARIABLES);
        }

        // Costanti
        this.MAX_ACTIVE_VARIABLES = 2;
        this.THRESHOLD_POINTS = 10;
        this.VISIBLE_POINTS = 20;

        // Stato interno
        this.allVariableData = {};
        this.activeVariables = [];
        this.currentViewStart = 0;
        this.isFollowingLatest = true;
        this.discoveredVariables = new Set();
        this.mychart = null;
        this.ws = null;
        this.mapInstance = null;

        //console.log(this);

        this.createChart();
        this.createMap();
    }

    registerEvent() {instrumentsAvailableVariables
        // Event delegation per le checkbox
        jQuery(document).on('change', `.variable-checkbox-${this.shortcode_id}`, (event) => {
            this.handleVariableToggle(event.target);
        });

        // Event listeners per i controlli di scroll
        jQuery(`#scrollLeft-${this.shortcode_id}`).on('click', () => {
            if (this.currentViewStart > 0) {
                this.currentViewStart = Math.max(0, this.currentViewStart - 5);
                this.isFollowingLatest = false;
                this.updateChartView();
            }
        });

        jQuery(`#scrollRight-${this.shortcode_id}`).on('click', () => {
            const firstVariable = this.activeVariables[0];
            const totalPoints = firstVariable ? (this.allVariableData[firstVariable] || []).length : 0;
            
            if (this.currentViewStart + this.VISIBLE_POINTS < totalPoints) {
                this.currentViewStart = Math.min(totalPoints - this.VISIBLE_POINTS, this.currentViewStart + 5);
                if (this.currentViewStart + this.VISIBLE_POINTS >= totalPoints) {
                    this.isFollowingLatest = true;
                }
                this.updateChartView();
            }
        });

        jQuery(`#goToLatest-${this.shortcode_id}`).on('click', () => {
            const firstVariable = this.activeVariables[0];
            const totalPoints = firstVariable ? (this.allVariableData[firstVariable] || []).length : 0;
            
            if (totalPoints > this.VISIBLE_POINTS) {
                this.currentViewStart = totalPoints - this.VISIBLE_POINTS;
            } else {
                this.currentViewStart = 0;
            }
            this.isFollowingLatest = true;
            this.updateChartView();
        });
    }

    handleVariableToggle(checkbox) {
        const variablePath = checkbox.value;
        const isChecked = checkbox.checked;

        if (isChecked) {
            // Controlla il limite massimo
            if (this.activeVariables.length >= this.MAX_ACTIVE_VARIABLES) {
                checkbox.checked = false;
                alert(`Puoi visualizzare massimo ${this.MAX_ACTIVE_VARIABLES} variabili contemporaneamente`);
                return;
            }
            this.activeVariables.push(variablePath);
        } else {
            this.activeVariables = this.activeVariables.filter(v => v !== variablePath);
        }

        this.updateChartDatasets();
        this.updateChartView();
    }

    updateChartDatasets() {
        // Rimuovi tutti i dataset esistenti
        this.mychart.data.datasets = [];
        
        // Rimuovi tutte le scale Y esistenti
        Object.keys(this.mychart.options.scales).forEach(key => {
            if (key !== 'x') {
                delete this.mychart.options.scales[key];
            }
        });

        // Aggiungi dataset per ogni variabile attiva
        this.activeVariables.forEach((variablePath, index) => {
            const config = this.AVAILABLE_VARIABLES[variablePath];
            if (!config) return;

            const yAxisID = `y${index}`;
            
            // Crea dataset
            this.mychart.data.datasets.push({
                label: config.label,
                data: this.allVariableData[variablePath] || [],
                borderWidth: 2,
                type: config.chartType,
                yAxisID: yAxisID,
                backgroundColor: config.color.replace('rgb', 'rgba').replace(')', ', 0.5)'),
                borderColor: config.color,
                fill: false
            });

            // Crea scala Y
            const scaleConfig = {
                title: {
                    display: true,
                    text: config.unit
                },
                type: 'linear',
                display: true,
                position: index === 0 ? 'left' : 'right',
                beginAtZero: config.min === undefined
            };

            if (config.min !== undefined) scaleConfig.min = config.min;
            if (config.max !== undefined) scaleConfig.max = config.max;

            // Offset per evitare sovrapposizioni se ci sono più di 2 assi
            if (index > 1) {
                scaleConfig.grid = { drawOnChartArea: false };
            }

            this.mychart.options.scales[yAxisID] = scaleConfig;
        });

        this.mychart.update('none');
    }

    updateChartView() {
        if (this.activeVariables.length === 0) {
            this.mychart.update('active');
            this.updateControls();
            return;
        }

        const firstVariable = this.activeVariables[0];
        const totalPoints = (this.allVariableData[firstVariable] || []).length;
        
        if (totalPoints <= this.THRESHOLD_POINTS) {
            // Mostra tutti i dati
            this.activeVariables.forEach((variablePath, index) => {
                if (this.mychart.data.datasets[index]) {
                    this.mychart.data.datasets[index].data = [...(this.allVariableData[variablePath] || [])];
                }
            });
            this.currentViewStart = 0;
        } else {
            // Modalità scrolling
            const endIndex = Math.min(this.currentViewStart + this.VISIBLE_POINTS, totalPoints);
            this.activeVariables.forEach((variablePath, index) => {
                if (this.mychart.data.datasets[index]) {
                    const data = this.allVariableData[variablePath] || [];
                    this.mychart.data.datasets[index].data = data.slice(this.currentViewStart, endIndex);
                }
            });
        }
        
        this.mychart.update('active');
        this.updateControls();
    }

    updateControls() {
        const firstVariable = this.activeVariables[0];
        const totalPoints = firstVariable ? (this.allVariableData[firstVariable] || []).length : 0;
        
        const scrollLeftBtn = document.getElementById(`scrollLeft-${this.shortcode_id}`);
        const scrollRightBtn = document.getElementById(`scrollRight-${this.shortcode_id}`);
        const goToLatestBtn = document.getElementById(`goToLatest-${this.shortcode_id}`);
        const info = document.getElementById(`info-${this.shortcode_id}`);
        
        if (info) {
            const visibleCount = Math.min(this.VISIBLE_POINTS, totalPoints - this.currentViewStart);
            info.textContent = `Dati visualizzati: ${visibleCount}/${totalPoints}`;
        }
        
        if (scrollLeftBtn) scrollLeftBtn.disabled = this.currentViewStart <= 0;
        if (scrollRightBtn) scrollRightBtn.disabled = this.currentViewStart + this.VISIBLE_POINTS >= totalPoints;
        if (goToLatestBtn) goToLatestBtn.disabled = this.isFollowingLatest;
    }

    updateVariableCheckboxes() {
        const container = document.getElementById(`variable-checkboxes-${this.shortcode_id}`);
        if (!container) return;

        // Filtra solo le variabili che sono in variablesName
        const allowedVariables = this.variablesName.length > 0 
            ? Array.from(this.discoveredVariables).filter(v => this.VARIABLES_PATHS.includes(v))
            : Array.from(this.discoveredVariables);

        // Crea checkbox per ogni variabile scoperta e consentita
        allowedVariables.forEach(variablePath => {
            // Salta se checkbox già esiste
            if (document.getElementById(`var-${variablePath.replace(/\./g, '-')}-${this.shortcode_id}`)) return;

            const config = this.AVAILABLE_VARIABLES[variablePath];
            if (!config) return;

            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'variable-checkbox-item';
            checkboxDiv.style.marginBottom = '8px';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = `variable-checkbox-${this.shortcode_id}`;
            checkbox.id = `var-${variablePath.replace(/\./g, '-')}-${this.shortcode_id}`;
            checkbox.value = variablePath;

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = ` ${config.label} (${config.unit})`;
            label.style.marginLeft = '5px';
            label.style.cursor = 'pointer';

            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(label);
            container.appendChild(checkboxDiv);
        });

        // Attiva automaticamente le variabili di default
        this.activateDefaultVariables();
    }

    activateDefaultVariables() {
        if (this.defaultVariables.length === 0) return;

        // Attiva le variabili di default (massimo MAX_ACTIVE_VARIABLES)
        const variablesToActivate = this.defaultVariables.slice(0, this.MAX_ACTIVE_VARIABLES);
        
        variablesToActivate.forEach(variablePath => {
            const checkbox = document.getElementById(`var-${variablePath.replace(/\./g, '-')}-${this.shortcode_id}`);
            if (checkbox && !checkbox.checked) {
                checkbox.checked = true;
                // Trigger manuale del toggle
                this.handleVariableToggle(checkbox);
            }
        });
    }

    createChart() {
        let contextUrl = `meteo.${this.instrument_id}`;
        //let contextUrl = this.instrument_id;

        // Crea container principale
        let $rootContainer = jQuery(`#${this.shortcode_id}`);
        
        // Crea controlli
        let $controlsDiv = jQuery('<div>').attr('id', `chart-controls-${this.shortcode_id}`).css({
            'margin-bottom': '10px',
            'padding': '10px',
            'border': '1px solid #ddd',
            'border-radius': '4px'
        });
        
        let $checkboxesDiv = jQuery('<div>').attr('id', `variable-checkboxes-${this.shortcode_id}`).css({
            'margin-bottom': '10px'
        });
        
        let $buttonsDiv = jQuery('<div>').css({
            'display': 'flex',
            'gap': '10px',
            'align-items': 'center'
        });
        
        let $scrollLeftBtn = jQuery('<button>').attr('id', `scrollLeft-${this.shortcode_id}`).text('← Indietro');
        let $scrollRightBtn = jQuery('<button>').attr('id', `scrollRight-${this.shortcode_id}`).text('Avanti →');
        let $goToLatestBtn = jQuery('<button>').attr('id', `goToLatest-${this.shortcode_id}`).text('Vai agli ultimi dati');
        let $infoSpan = jQuery('<span>').attr('id', `info-${this.shortcode_id}`);
        
        $buttonsDiv.append($scrollLeftBtn, $scrollRightBtn, $goToLatestBtn, $infoSpan);
        $controlsDiv.append($checkboxesDiv, $buttonsDiv);
        $rootContainer.append($controlsDiv);

        // Crea container chart
        let $chartDivContainer = jQuery('<div>').attr('id', `chart-container-${this.shortcode_id}`);
        $rootContainer.append($chartDivContainer);
        
        let $canvas = jQuery('<canvas>').attr('id', `myChart-${this.shortcode_id}`);
        $chartDivContainer.append($canvas);

        const ctx = document.getElementById(`myChart-${this.shortcode_id}`);

        this.mychart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: this.long_name
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute'
                        }
                    }
                }
            }
        });

        // Registra eventi
        this.registerEvent();

        // Avvia WebSocket
        this.getLiveData(contextUrl);
    }

    getLiveData(contextUrl) {
        if ("WebSocket" in window) {
            this.ws = new WebSocket("wss://signalk.meteo.uniparthenope.it/signalk/v1/stream?subscribe=none");
            let count = 0;
            
            this.ws.onopen = () => {
                let subscription = {
                    "context": contextUrl,
                    "subscribe": [
                        {
                            "path": "*",
                            "period": 1000,
                            "policy": "fixed"
                        }
                    ]
                };
                this.ws.send(JSON.stringify(subscription));
                console.log("WebSocket connesso, sottoscrizione inviata");
            };
        
            this.ws.onmessage = (evt) => {
                let received_msg = evt.data;
                let updateChart = false;
                
                if (this.mychart) {
                    let mydata = JSON.parse(received_msg);
                    
                    if (mydata.updates && Array.isArray(mydata.updates)) {
                        mydata.updates.forEach(update => {
                            update.values.forEach(value => {
                                
                                if (value.path === "name") {
                                    this.mychart.options.plugins.title.text = value.value;
                                    updateChart = true;
                                } 
                                else if (this.AVAILABLE_VARIABLES[value.path]) {
                                    const config = this.AVAILABLE_VARIABLES[value.path];
                                    const variablePath = value.path;
                                    
                                    // Controlla se la variabile è consentita (se variablesName è vuoto, consenti tutte)
                                    if (this.variablesName.length > 0 && !this.VARIABLES_PATHS.includes(variablePath)) {
                                        return; // Salta questa variabile
                                    }
                                    
                                    // Scopri nuova variabile
                                    if (!this.discoveredVariables.has(variablePath)) {
                                        this.discoveredVariables.add(variablePath);
                                        this.updateVariableCheckboxes();
                                    }

                                    // Inizializza array se non esiste
                                    if (!this.allVariableData[variablePath]) {
                                        this.allVariableData[variablePath] = [];
                                    }

                                    // Aggiungi dato
                                    this.allVariableData[variablePath].push({
                                        x: update.timestamp,
                                        y: config.conversion(value.value)
                                    });

                                    // Limita a 600 punti
                                    if (this.allVariableData[variablePath].length > 600) {
                                        this.allVariableData[variablePath].splice(0, 1);
                                    }

                                    updateChart = true;
                                }
                            });
                        });
                    }
        
                    if (updateChart === true && this.activeVariables.length > 0) {
                        // Se stiamo seguendo gli ultimi dati, aggiorna la vista
                        if (this.isFollowingLatest) {
                            const firstVariable = this.activeVariables[0];
                            const totalPoints = (this.allVariableData[firstVariable] || []).length;
                            if (totalPoints > this.THRESHOLD_POINTS) {
                                this.currentViewStart = Math.max(0, totalPoints - this.VISIBLE_POINTS);
                            }
                        }
                        
                        this.updateChartView();
                        count++;
                    }
                }
            };
        
            this.ws.onclose = () => { 
                console.log("Connection is closed..."); 
            };

            this.ws.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
        } else { 
            alert("WebSocket NOT supported by your Browser!"); 
        }
    }

    resetChart() {
        this.allVariableData = {};
        this.discoveredVariables.clear();
        this.activeVariables = [];
        this.currentViewStart = 0;
        this.isFollowingLatest = true;

        // Chiudi WebSocket esistente e ricrea
        if (this.ws) {
            this.ws.close();
        }
        
        // Ricrea chart vuoto
        if (this.mychart) {
            this.mychart.destroy();
        }
        
        // Resetta checkbox
        jQuery(`.variable-checkbox-${this.shortcode_id}`).prop('checked', false);
        
        this.createChart();
    }
    
    createMap() {
        const instrumentsMap = InstrumentsMap.getInstance();
        instrumentsMap.addMarker(this.instrument_id, this.lat, this.long, this.long_name);
    }

    createLink() {
        
    }
}