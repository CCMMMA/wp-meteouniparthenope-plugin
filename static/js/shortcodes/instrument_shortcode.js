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
            defaultVariables: ["environment.outside.temperature", "environment.wind.speedTrue"],
            mode: "POST"
        };
    }

    constructor(options = {}) {
        this.shortcode_id       = options.shortcode_id       || InstrumentLiveChart.defaults.shortcode_id;
        this.instrument_id      = options.instrument_id      || InstrumentLiveChart.defaults.instrument_id;
        this.long_name          = options.long_name          || InstrumentLiveChart.defaults.long_name;
        this.lat                = options.lat                || InstrumentLiveChart.defaults.lat;
        this.long               = options.long               || InstrumentLiveChart.defaults.long;
        this.variablesName      = options.variablesName      || InstrumentLiveChart.defaults.variablesName;
        this.variablesDescription = options.variablesDescription || InstrumentLiveChart.defaults.variablesDescription;
        this.defaultVariables   = options.defaultVariables   || InstrumentLiveChart.defaults.defaultVariables;
        this.mode               = options.mode               || InstrumentLiveChart.defaults.mode;

        // ── Build the catalogue of variables this instance may show ──
        this.AVAILABLE_VARIABLES = {};
        this.VARIABLES_PATHS     = [];

        if (this.mode === "STANDALONE" && this.variablesName) {
            this.long_name = instrumentsNames[this.instrument_id];
            this.AVAILABLE_VARIABLES = instrumentsAvailableVariables;
            this.VARIABLES_PATHS = Object.keys(instrumentsAvailableVariables);
            this.lat  = instrumentsLatLon[this.instrument_id]['latitude'];
            this.long = instrumentsLatLon[this.instrument_id]['longitude'];
        } else {
            this.variablesName.forEach(v => {
                this.VARIABLES_PATHS.push(v);
                this.AVAILABLE_VARIABLES[v] = instrumentsAvailableVariables[v];
            });
        }

        // ── Runtime constants ────────────────────────────────────────
        this.THRESHOLD_POINTS = 10;
        this.VISIBLE_POINTS   = 20;

        // ── Runtime state ────────────────────────────────────────────
        this.allVariableData  = {};

        /**
         * activeVariables separates assignments into two named columns:
         *   bars  → rendered as Chart.js 'bar'  datasets (left Y-axes)
         *   lines → rendered as Chart.js 'line' datasets (right Y-axes)
         * Both lists are unbounded; every entry gets its own Y-axis.
         */
        this.activeVariables  = { bars: [], lines: [] };

        this.currentViewStart    = 0;
        this.isFollowingLatest   = true;
        this.discoveredVariables = new Set();
        this.mychart             = null;
        this.ws                  = null;

        // drag-and-drop state
        this._dragVar  = null;   // path being dragged
        this._dragFrom = null;   // 'available' | 'bars' | 'lines'

        this._injectStyles();
        this.createChart();
        this.createMap();
    }

    // ══════════════════════════════════════════════════════════════
    // CSS — injected once per page
    // ══════════════════════════════════════════════════════════════
    _injectStyles() {
        if (document.getElementById('ilc-global-styles')) return;
        const s = document.createElement('style');
        s.id = 'ilc-global-styles';
        s.textContent = `
/* ── 3-column selector ───────────────────────────────────── */
.ilc-selector {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
    align-items: stretch;
}
.ilc-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid #ddd;
    min-height: 100px;
    transition: border-color .2s, box-shadow .2s;
}
.ilc-column--bars      { border-color: #1976D2; }
.ilc-column--available { border-color: #757575; }
.ilc-column--lines     { border-color: #388E3C; }
.ilc-column.ilc-drop-active {
    box-shadow: 0 0 0 3px rgba(0,0,0,.15);
    opacity: .85;
}

.ilc-col-header {
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: #fff;
    flex-shrink: 0;
}
.ilc-column--bars      .ilc-col-header { background: #1976D2; }
.ilc-column--available .ilc-col-header { background: #757575; }
.ilc-column--lines     .ilc-col-header { background: #388E3C; }

.ilc-col-body {
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    overflow-y: auto;
    flex: 1;
    min-height: 60px;
    max-height: 280px;
}

/* empty-state label */
.ilc-empty-hint {
    text-align: center;
    font-size: 11px;
    color: #bbb;
    font-style: italic;
    padding: 14px 6px;
}

/* ── Variable card ───────────────────────────────────────── */
.ilc-card {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    padding: 5px 7px;
    border-radius: 5px;
    border-left: 4px solid var(--card-accent, #bbb);
    background: #fafafa;
    font-size: 12px;
    cursor: grab;
    user-select: none;
    transition: background .15s, box-shadow .15s;
}
.ilc-card:hover      { background: #f0f4ff; box-shadow: 0 2px 6px rgba(0,0,0,.12); }
.ilc-card.is-dragging { opacity: .35; }

.ilc-card-name {
    flex: 1;
    font-weight: 600;
    color: #333;
    min-width: 70px;
    line-height: 1.3;
}
.ilc-card-unit {
    font-size: 10px;
    color: #888;
    background: #ececec;
    border-radius: 3px;
    padding: 1px 5px;
    white-space: nowrap;
}

/* action buttons row (only on available cards) */
.ilc-card-actions { display: flex; gap: 3px; width: 100%; margin-top: 2px; }
.ilc-btn {
    flex: 1;
    border: none;
    border-radius: 4px;
    padding: 3px 6px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: filter .15s;
    white-space: nowrap;
}
.ilc-btn:hover { filter: brightness(.88); }
.ilc-btn--tobars  { background: #BBDEFB; color: #0D47A1; }
.ilc-btn--tolines { background: #C8E6C9; color: #1B5E20; }
.ilc-btn--remove  {
    flex: none;
    background: #FFCDD2;
    color: #B71C1C;
    padding: 3px 7px;
    margin-left: auto;
}

/* ── Scroll controls bar ─────────────────────────────────── */
.ilc-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 7px 10px;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 6px;
    margin-bottom: 10px;
}
.ilc-controls button {
    padding: 4px 12px;
    border-radius: 4px;
    border: 1px solid #bbb;
    background: #fff;
    font-size: 13px;
    cursor: pointer;
    transition: background .15s;
}
.ilc-controls button:hover:not(:disabled) { background: #e8e8e8; }
.ilc-controls button:disabled { opacity: .4; cursor: not-allowed; }
.ilc-info { font-size: 12px; color: #666; margin-left: auto; }

/* ── Responsive ─────────────────────────────────────────── */
@media (max-width: 600px) {
    .ilc-selector { flex-direction: column; }
    .ilc-col-body { max-height: 160px; }
}
        `;
        document.head.appendChild(s);
    }

    // ══════════════════════════════════════════════════════════════
    // Helpers
    // ══════════════════════════════════════════════════════════════

    /** Flat ordered list: bars first, then lines. */
    get allActiveVariables() {
        return [...this.activeVariables.bars, ...this.activeVariables.lines];
    }

    _columnOf(path) {
        if (this.activeVariables.bars.includes(path))  return 'bars';
        if (this.activeVariables.lines.includes(path)) return 'lines';
        return 'available';
    }

    _totalPoints() {
        const first = this.allActiveVariables[0];
        return first ? (this.allVariableData[first] || []).length : 0;
    }

    _allowedDiscovered() {
        const all = Array.from(this.discoveredVariables);
        return this.variablesName.length > 0
            ? all.filter(v => this.VARIABLES_PATHS.includes(v))
            : all;
    }

    // ══════════════════════════════════════════════════════════════
    // Variable assignment  (the core of the new logic)
    // ══════════════════════════════════════════════════════════════

    /**
     * Move a variable to a target column.
     * @param {string} path    – variable path
     * @param {string} target  – 'bars' | 'lines' | 'available'
     */
    assignVariable(path, target) {
        // Remove from both active lists
        this.activeVariables.bars  = this.activeVariables.bars.filter(v => v !== path);
        this.activeVariables.lines = this.activeVariables.lines.filter(v => v !== path);

        if (target === 'bars' || target === 'lines') {
            this.activeVariables[target].push(path);
        }
        // 'available' → already removed, not re-added

        this.updateChartDatasets();
        this.updateChartView();
        this.renderSelector();
    }

    // ══════════════════════════════════════════════════════════════
    // Chart datasets
    // ══════════════════════════════════════════════════════════════

    updateChartDatasets() {
        // Clear datasets
        this.mychart.data.datasets = [];

        // Remove all Y-scales except X
        Object.keys(this.mychart.options.scales).forEach(k => {
            if (k !== 'x') delete this.mychart.options.scales[k];
        });

        let leftCount  = 0;
        let rightCount = 0;

        const addDataset = (path, chartType) => {
            const cfg = this.AVAILABLE_VARIABLES[path];
            if (!cfg) return;

            const isLeft = (chartType === 'bar');
            const idx    = isLeft ? leftCount : rightCount;
            const yID    = `y_${chartType}_${idx}`;

            // Y-axis config
            const scaleCfg = {
                type:   'linear',
                display: true,
                position: isLeft ? 'left' : 'right',
                title: { display: true, text: `${cfg.label} (${cfg.unit})`, font: { size: 11 } },
                // Only draw grid lines for the very first axis on each side
                grid: { drawOnChartArea: idx === 0 },
                beginAtZero: cfg.min !== undefined ? false : true
            };
            if (cfg.min !== undefined) scaleCfg.min = cfg.min;
            if (cfg.max !== undefined) scaleCfg.max = cfg.max;
            // Visually offset additional axes on the same side
            if (idx > 0) scaleCfg.offset = true;

            this.mychart.options.scales[yID] = scaleCfg;

            // Dataset
            this.mychart.data.datasets.push({
                label:           `${cfg.label} (${cfg.unit})`,
                data:            this.allVariableData[path] || [],
                type:            chartType,
                yAxisID:         yID,
                borderWidth:     chartType === 'line' ? 2 : 1,
                backgroundColor: cfg.color.replace('rgb', 'rgba').replace(')', ', 0.55)'),
                borderColor:     cfg.color,
                fill:            false,
                tension:         0.3,
                pointRadius:     chartType === 'line' ? 2 : 0,
                order:           chartType === 'line' ? 1 : 2   // lines drawn on top
            });

            if (isLeft) leftCount++;
            else        rightCount++;
        };

        this.activeVariables.bars.forEach(p  => addDataset(p, 'bar'));
        this.activeVariables.lines.forEach(p => addDataset(p, 'line'));

        this.mychart.update('none');
    }

    // ══════════════════════════════════════════════════════════════
    // Chart view (windowing / scrolling)
    // ══════════════════════════════════════════════════════════════

    updateChartView() {
        const active = this.allActiveVariables;

        if (active.length === 0) {
            this.mychart.update('active');
            this.updateControls();
            return;
        }

        const totalPoints = this._totalPoints();

        if (totalPoints <= this.THRESHOLD_POINTS) {
            // Show everything
            active.forEach((path, i) => {
                if (this.mychart.data.datasets[i]) {
                    this.mychart.data.datasets[i].data = [...(this.allVariableData[path] || [])];
                }
            });
            this.currentViewStart = 0;
        } else {
            // Sliding window
            const end = Math.min(this.currentViewStart + this.VISIBLE_POINTS, totalPoints);
            active.forEach((path, i) => {
                if (this.mychart.data.datasets[i]) {
                    this.mychart.data.datasets[i].data =
                        (this.allVariableData[path] || []).slice(this.currentViewStart, end);
                }
            });
        }

        this.mychart.update('active');
        this.updateControls();
    }

    updateControls() {
        const total        = this._totalPoints();
        const visibleCount = Math.min(this.VISIBLE_POINTS, total - this.currentViewStart);

        const byId = id => document.getElementById(`${id}-${this.shortcode_id}`);

        const info = byId('info');
        if (info) info.textContent = `Dati visualizzati: ${visibleCount}/${total}`;

        const btnL = byId('scrollLeft');
        const btnR = byId('scrollRight');
        const btnG = byId('goToLatest');

        if (btnL) btnL.disabled = this.currentViewStart <= 0;
        if (btnR) btnR.disabled = this.currentViewStart + this.VISIBLE_POINTS >= total;
        if (btnG) btnG.disabled = this.isFollowingLatest;
    }

    // ══════════════════════════════════════════════════════════════
    // Variable discovery → delegate to selector render
    // ══════════════════════════════════════════════════════════════

    updateVariableCheckboxes() {
        this.renderSelector();
        this._activateDefaultVariables();
    }

    _activateDefaultVariables() {
        if (!this.defaultVariables.length) return;

        const alreadyActive = this.allActiveVariables;
        let changed = false;

        this.defaultVariables.forEach((path, idx) => {
            if (alreadyActive.includes(path)) return;
            if (!this.discoveredVariables.has(path)) return;

            // Alternate: even index → bars, odd → lines
            const target = idx % 2 === 0 ? 'bars' : 'lines';
            this.activeVariables[target].push(path);
            changed = true;
        });

        if (changed) {
            this.updateChartDatasets();
            this.updateChartView();
            this.renderSelector();
        }
    }

    // ══════════════════════════════════════════════════════════════
    // 3-column selector render
    // ══════════════════════════════════════════════════════════════

    renderSelector() {
        const root = document.getElementById(`variable-selector-${this.shortcode_id}`);
        if (!root) return;
        root.innerHTML = '';

        const allowed       = this._allowedDiscovered();
        const availableVars = allowed.filter(v => this._columnOf(v) === 'available');

        // ── Card factory ─────────────────────────────────────────
        const makeCard = (path, location) => {
            const cfg = this.AVAILABLE_VARIABLES[path];
            if (!cfg) return null;

            const card = document.createElement('div');
            card.className      = 'ilc-card';
            card.draggable      = true;
            card.dataset.path   = path;
            card.dataset.from   = location;
            card.title          = path;
            card.style.setProperty('--card-accent', cfg.color);

            const nameSpan = document.createElement('span');
            nameSpan.className   = 'ilc-card-name';
            nameSpan.textContent = cfg.label;

            const unitSpan = document.createElement('span');
            unitSpan.className   = 'ilc-card-unit';
            unitSpan.textContent = cfg.unit || '—';

            card.appendChild(nameSpan);
            card.appendChild(unitSpan);

            if (location === 'available') {
                const actions = document.createElement('div');
                actions.className = 'ilc-card-actions';

                const toBars = document.createElement('button');
                toBars.className   = 'ilc-btn ilc-btn--tobars';
                toBars.textContent = '▌ Bars';
                toBars.title       = 'Add to Bars';
                toBars.addEventListener('click', () => this.assignVariable(path, 'bars'));

                const toLines = document.createElement('button');
                toLines.className   = 'ilc-btn ilc-btn--tolines';
                toLines.textContent = '∿ Lines';
                toLines.title       = 'Add to Lines';
                toLines.addEventListener('click', () => this.assignVariable(path, 'lines'));

                actions.appendChild(toBars);
                actions.appendChild(toLines);
                card.appendChild(actions);
            } else {
                const rmBtn = document.createElement('button');
                rmBtn.className   = 'ilc-btn ilc-btn--remove';
                rmBtn.textContent = '✕';
                rmBtn.title       = 'Remove';
                rmBtn.addEventListener('click', () => this.assignVariable(path, 'available'));
                card.appendChild(rmBtn);
            }

            // ── Drag events ──────────────────────────────────────
            card.addEventListener('dragstart', e => {
                this._dragVar  = path;
                this._dragFrom = location;
                e.dataTransfer.effectAllowed = 'move';
                // delay class so the ghost image is rendered first
                requestAnimationFrame(() => card.classList.add('is-dragging'));
            });
            card.addEventListener('dragend', () => {
                card.classList.remove('is-dragging');
                this._dragVar  = null;
                this._dragFrom = null;
            });

            return card;
        };

        // ── Column factory ───────────────────────────────────────
        const makeColumn = (location, title, vars) => {
            const col = document.createElement('div');
            col.className = `ilc-column ilc-column--${location}`;

            const header = document.createElement('div');
            header.className   = 'ilc-col-header';
            header.textContent = title;
            col.appendChild(header);

            const body = document.createElement('div');
            body.className = 'ilc-col-body';

            if (vars.length === 0) {
                const hint = document.createElement('div');
                hint.className   = 'ilc-empty-hint';
                hint.textContent = location === 'available' ? 'Waiting for data…' : 'Drop here';
                body.appendChild(hint);
            } else {
                vars.forEach(v => {
                    const card = makeCard(v, location);
                    if (card) body.appendChild(card);
                });
            }

            col.appendChild(body);

            // Drop-zone events
            col.addEventListener('dragover', e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                col.classList.add('ilc-drop-active');
            });
            col.addEventListener('dragleave', e => {
                // Only remove class when truly leaving the column (not a child)
                if (!col.contains(e.relatedTarget)) {
                    col.classList.remove('ilc-drop-active');
                }
            });
            col.addEventListener('drop', e => {
                e.preventDefault();
                col.classList.remove('ilc-drop-active');
                if (this._dragVar && this._dragFrom !== location) {
                    this.assignVariable(this._dragVar, location);
                }
            });

            return col;
        };

        const colBars  = makeColumn('bars',      '📊 Bars',       this.activeVariables.bars);
        const colAvail = makeColumn('available', '⚙ Variables',   availableVars);
        const colLines = makeColumn('lines',     '📈 Lines',      this.activeVariables.lines);

        root.appendChild(colBars);
        root.appendChild(colAvail);
        root.appendChild(colLines);
    }

    // ══════════════════════════════════════════════════════════════
    // DOM construction
    // ══════════════════════════════════════════════════════════════

    createChart() {
        const contextUrl      = `meteo.${this.instrument_id}`;
        const $rootContainer  = jQuery(`#${this.shortcode_id}`);
        const sid             = this.shortcode_id;

        // ── 3-column selector ────────────────────────────────────
        const $selector = jQuery('<div>')
            .addClass('ilc-selector')
            .attr('id', `variable-selector-${sid}`);
        $rootContainer.append($selector);

        // ── Scroll / navigation controls ─────────────────────────
        const $controls   = jQuery('<div>').addClass('ilc-controls');
        const $btnLeft    = jQuery('<button>').attr('id', `scrollLeft-${sid}`).text('← Back');
        const $btnRight   = jQuery('<button>').attr('id', `scrollRight-${sid}`).text('Forward →');
        const $btnLatest  = jQuery('<button>').attr('id', `goToLatest-${sid}`).text('Go to latest');
        const $info       = jQuery('<span>').addClass('ilc-info').attr('id', `info-${sid}`);
        $controls.append($btnLeft, $btnRight, $btnLatest, $info);
        $rootContainer.append($controls);

        // ── Chart canvas ─────────────────────────────────────────
        const $chartWrap = jQuery('<div>').attr('id', `chart-container-${sid}`);
        const $canvas    = jQuery('<canvas>').attr('id', `myChart-${sid}`);
        $chartWrap.append($canvas);
        $rootContainer.append($chartWrap);

        // ── Chart.js instance ────────────────────────────────────
        const ctx = document.getElementById(`myChart-${sid}`);
        this.mychart = new Chart(ctx, {
            type: 'bar',   // default; each dataset overrides with its own `type`
            data: { labels: [], datasets: [] },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 4,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    title:  { display: true, text: this.long_name },
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'minute' }
                    }
                }
            }
        });

        // ── Wire up controls ─────────────────────────────────────
        this.registerEvent();

        // Initial (empty) selector render
        this.renderSelector();

        // Start live data
        this.getLiveData(contextUrl);
    }

    // ══════════════════════════════════════════════════════════════
    // Event wiring (scroll buttons)
    // ══════════════════════════════════════════════════════════════

    registerEvent() {
        jQuery(`#scrollLeft-${this.shortcode_id}`).on('click', () => {
            if (this.currentViewStart > 0) {
                this.currentViewStart  = Math.max(0, this.currentViewStart - 5);
                this.isFollowingLatest = false;
                this.updateChartView();
            }
        });

        jQuery(`#scrollRight-${this.shortcode_id}`).on('click', () => {
            const total = this._totalPoints();
            if (this.currentViewStart + this.VISIBLE_POINTS < total) {
                this.currentViewStart = Math.min(total - this.VISIBLE_POINTS, this.currentViewStart + 5);
                if (this.currentViewStart + this.VISIBLE_POINTS >= total) {
                    this.isFollowingLatest = true;
                }
                this.updateChartView();
            }
        });

        jQuery(`#goToLatest-${this.shortcode_id}`).on('click', () => {
            const total = this._totalPoints();
            this.currentViewStart  = total > this.VISIBLE_POINTS ? total - this.VISIBLE_POINTS : 0;
            this.isFollowingLatest = true;
            this.updateChartView();
        });
    }

    // ══════════════════════════════════════════════════════════════
    // WebSocket live data
    // ══════════════════════════════════════════════════════════════

    getLiveData(contextUrl) {
        if (!('WebSocket' in window)) {
            alert('WebSocket NOT supported by your Browser!');
            return;
        }

        this.ws = new WebSocket('wss://signalk.meteo.uniparthenope.it/signalk/v1/stream?subscribe=none');

        this.ws.onopen = () => {
            this.ws.send(JSON.stringify({
                context: contextUrl,
                subscribe: [{ path: '*', period: 1000, policy: 'fixed' }]
            }));
            console.log(`[ILC ${this.shortcode_id}] WebSocket connected`);
        };

        this.ws.onmessage = evt => {
            if (!this.mychart) return;

            let mydata;
            try { mydata = JSON.parse(evt.data); } catch (e) { return; }
            if (!mydata.updates || !Array.isArray(mydata.updates)) return;

            let needsUpdate = false;

            mydata.updates.forEach(update => {
                (update.values || []).forEach(value => {

                    // Station name update
                    if (value.path === 'name') {
                        this.mychart.options.plugins.title.text = value.value;
                        needsUpdate = true;
                        return;
                    }

                    // Only track variables in our catalogue
                    if (!this.AVAILABLE_VARIABLES[value.path]) return;

                    const path = value.path;

                    // Filter by allowed list when configured
                    if (this.variablesName.length > 0 && !this.VARIABLES_PATHS.includes(path)) return;

                    // Discover new variable → rebuild selector
                    if (!this.discoveredVariables.has(path)) {
                        this.discoveredVariables.add(path);
                        this.updateVariableCheckboxes();
                    }

                    // Store data point
                    if (!this.allVariableData[path]) this.allVariableData[path] = [];
                    const cfg = this.AVAILABLE_VARIABLES[path];
                    this.allVariableData[path].push({
                        x: update.timestamp,
                        y: cfg.conversion(value.value)
                    });

                    // Rolling buffer: keep 600 points max
                    if (this.allVariableData[path].length > 600) {
                        this.allVariableData[path].splice(0, 1);
                    }

                    needsUpdate = true;
                });
            });

            if (needsUpdate && this.allActiveVariables.length > 0) {
                if (this.isFollowingLatest) {
                    const total = this._totalPoints();
                    if (total > this.THRESHOLD_POINTS) {
                        this.currentViewStart = Math.max(0, total - this.VISIBLE_POINTS);
                    }
                }
                this.updateChartView();
            }
        };

        this.ws.onclose = ()      => console.log(`[ILC ${this.shortcode_id}] WebSocket closed`);
        this.ws.onerror = error   => console.error(`[ILC ${this.shortcode_id}] WebSocket error`, error);
    }

    // ══════════════════════════════════════════════════════════════
    // Reset
    // ══════════════════════════════════════════════════════════════

    resetChart() {
        this.allVariableData     = {};
        this.discoveredVariables.clear();
        this.activeVariables     = { bars: [], lines: [] };
        this.currentViewStart    = 0;
        this.isFollowingLatest   = true;

        if (this.ws)      this.ws.close();
        if (this.mychart) this.mychart.destroy();

        this.createChart();
    }

    // ══════════════════════════════════════════════════════════════
    // Map marker
    // ══════════════════════════════════════════════════════════════

    createMap() {
        const instrumentsMap = InstrumentsMap.getInstance();
        instrumentsMap.addMarker(this.instrument_id, this.lat, this.long, this.long_name);
    }

    createLink() {}
}