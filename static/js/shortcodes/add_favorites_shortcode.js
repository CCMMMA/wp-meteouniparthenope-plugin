(function($){

    const BTN_ID      = 'meteo-add-favorite-btn';
    const ROOT_ID     = 'add_favorites_shortcode-root';

    const LABEL_ADD   = '&#9825; Add to favorites';
    const LABEL_SAVED = '&#9829; Saved to favorites';
    const CLASS_BASE  = 'meteo-favorite-btn';
    const CLASS_SAVED = 'meteo-favorite-btn--saved';

    /**
     * Legge place, prod, output dall'URL corrente.
     * Restituisce null se uno dei tre manca.
     */
    function getCurrentParams() {
        const params = new URLSearchParams(window.location.search);
        const place  = params.get('place')  || '';
        const prod   = params.get('prod')   || '';
        const output = params.get('output') || '';
        if (!place || !prod || !output) return null;
        return { place, prod, output };
    }

    /**
     * Aggiorna lo stato grafico del pulsante in base a isFavorite.
     */
    function syncButton(btn, place, prod, output) {
        const saved = MeteoUniParthenopeCookies.isFavorite(place, prod, output);
        if (saved) {
            btn.innerHTML = LABEL_SAVED;
            btn.classList.add(CLASS_SAVED);
        } else {
            btn.innerHTML = LABEL_ADD;
            btn.classList.remove(CLASS_SAVED);
        }
    }

    function init() {
        const root = document.getElementById(ROOT_ID);
        if (!root) return;

        const current = getCurrentParams();
        if (!current) return; // non siamo su una pagina place con params completi

        const { place, prod, output } = current;

        // Crea il pulsante
        const btn = document.createElement('button');
        btn.id        = BTN_ID;
        btn.className = CLASS_BASE;
        syncButton(btn, place, prod, output);

        btn.addEventListener('click', function() {
            if (MeteoUniParthenopeCookies.isFavorite(place, prod, output)) {
                MeteoUniParthenopeCookies.removeFavorite(place, prod, output);
            } else {
                MeteoUniParthenopeCookies.saveFavorite(place, prod, output);
            }
            syncButton(btn, place, prod, output);
        });

        root.appendChild(btn);
    }

    // Si aggancia sia al caricamento iniziale che all'evento di url rewriting
    $(document).on('place.url.loaded', function() {
        // L'URL è stato aggiornato: riniziamo il pulsante
        const root = document.getElementById(ROOT_ID);
        if (root) root.innerHTML = '';
        init();
    });

    $(document).ready(function() {
        init();
    });

})(jQuery);