let GLOBAL_LAST_PLACES = {};

const MeteoUniParthenopeCookies = (() => {

    const COOKIE_NAME          = 'meteo_unip_recent_places';
    const LAST_PROD_OUT_COOKIE = 'meteo_unip_last_prod_out';
    const FAVORITES_COOKIE     = 'meteo_unip_favorites';
    const MAX_ENTRIES          = 6;
    const COOKIE_DAYS          = 30;
    const API_BASE             = MeteoUnipCookieData.restUrl;
    const NONCE                = MeteoUnipCookieData.nonce;
    const API_IMG_BASE         = 'https://api.meteo.uniparthenope.it/products';

    // ── Cookie helpers (privati) ────────────────────────────────────

    function getCookie(name) {
        return document.cookie.split('; ')
            .find(row => row.startsWith(name + '='))
            ?.split('=')[1] ?? null;
    }

    function setCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
        //document.cookie = `${name}=${value}; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; SameSite=Lax`;
    }

    // ── API pubblica generica ───────────────────────────────────────

    function setCookiePublic(name, value, days = COOKIE_DAYS) {
        setCookie(name, encodeURIComponent(JSON.stringify(value)), days);
    }

    function getCookiePublic(name) {
        const raw = getCookie(name);
        try { return raw ? JSON.parse(decodeURIComponent(raw)) : null; }
        catch(e) { return null; }
    }

    // ── Recent places ───────────────────────────────────────────────

    function getEntries() {
        const raw = getCookie(COOKIE_NAME);
        try { return raw ? JSON.parse(decodeURIComponent(raw)) : []; }
        catch(e) { return []; }
    }

    function saveEntry(place, prod, output, date) {
        let entries = getEntries().filter(
            e => !(e.place === place && e.prod === prod && e.output === output)
        );
        entries.unshift({ place, prod, output, date });
        entries = entries.slice(0, MAX_ENTRIES);
        GLOBAL_LAST_PLACES['prod']   = prod;
        GLOBAL_LAST_PLACES['output'] = output;
        setCookie(COOKIE_NAME, encodeURIComponent(JSON.stringify(entries)), COOKIE_DAYS);
        saveLastProdOut(prod, output, date);
    }

    // ── Last prod/output ────────────────────────────────────────────

    function saveLastProdOut(prod, output, date) {
        setCookie(LAST_PROD_OUT_COOKIE, encodeURIComponent(JSON.stringify({ prod, output, date })), COOKIE_DAYS);
    }

    function getLastProdOut() {
        const raw = getCookie(LAST_PROD_OUT_COOKIE);
        try { return raw ? JSON.parse(decodeURIComponent(raw)) : null; }
        catch(e) { return null; }
    }

    // -- Favorites -------------------------------------------------

    function getFavorites() {
        const raw = getCookie(FAVORITES_COOKIE);
        try { return raw ? JSON.parse(decodeURIComponent(raw)) : []; }
        catch(e) { return []; }
    }

    function isFavorite(place, prod, output) {
        return getFavorites().some(
            e => e.place === place && e.prod === prod && e.output === output
        );
    }

    function saveFavorite(place, prod, output) {
        if (isFavorite(place, prod, output)) return;
        const favorites = getFavorites();
        favorites.unshift({ place, prod, output });
        setCookie(FAVORITES_COOKIE, encodeURIComponent(JSON.stringify(favorites)), COOKIE_DAYS);
    }

    function removeFavorite(place, prod, output) {
        const favorites = getFavorites().filter(
            e => !(e.place === place && e.prod === prod && e.output === output)
        );
        setCookie(FAVORITES_COOKIE, encodeURIComponent(JSON.stringify(favorites)), COOKIE_DAYS);
    }


    // ── Helper data ─────────────────────────────────────────────────

    function getTodayDateParam() {
        const now  = new Date();
        const yyyy = now.getFullYear();
        const mm   = String(now.getMonth() + 1).padStart(2, '0');
        const dd   = String(now.getDate()).padStart(2, '0');
        return `${yyyy}${mm}${dd}Z1200`;
    }

    // ── Tracciamento visita ─────────────────────────────────────────

    function trackCurrentPage(url = window.location.search) {
        if (!MeteoUnipCookieData.currentPlace) return;
        console.log("SONO NEL PLACE!");

        const params = new URLSearchParams(url);
        const place  = params.get('place')  || MeteoUnipCookieData.currentPlace;
        const prod   = params.get('prod')   || '';
        const output = params.get('output') || '';
        const date = params.get('date') || '';

        if (place && prod && output && date) {
            saveEntry(place, prod, output, date);
        }
    }

    // ── Rendering card in homepage ──────────────────────────────────

    async function renderRecentPlaces() {
        const outer = document.getElementById('meteo-recent-places');
        if (!outer) return;
        console.log("NON LO SUPERO");

        const list = document.createElement('div');
        list.style.padding = '1rem 0';
        list.innerHTML = "<div id='meteo-recent-list' class='recent-list'></div>";
        outer.appendChild(list);

        const container = list.querySelector('#meteo-recent-list');
        if (!container) return;

        // ... resto del codice invariato

        const entries = getEntries();
        console.log("ENTRIES:");
        console.log(entries);
        if (!entries.length) return;

        container.innerHTML = Array(entries.length).fill(`
            <div class="recent-card">
                <div class="recent-card__image">
                    <div class="recent-card__image-skeleton"></div>
                </div>
                <div class="recent-card__body">
                    <div class="recent-card__image-skeleton" style="height:14px;width:60%;border-radius:4px;"></div>
                    <div class="recent-card__image-skeleton" style="height:11px;width:30%;border-radius:4px;margin-top:4px;"></div>
                </div>
            </div>
        `).join('');

        try {
            const res = await fetch(`${API_BASE}/places/recent/resolve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce':   NONCE,
                },
                body: JSON.stringify({ entries }),
            });

            const json = await res.json();

            if (!json.success || !json.data.length) {
                container.innerHTML = '';
                return;
            }

            const date = getTodayDateParam();

            container.innerHTML = json.data.map(item => {
                const imgUrl = `${API_IMG_BASE}/${item.prod}/forecast/${item.place_id}/plot/image?date=${date}&output=${item.output}&opt=bars`;
                return `
                    <a class="recent-card" href="${item.permalink}">
                        <div class="recent-card__image">
                            <img
                                src="${imgUrl}"
                                alt="${item.title}"
                                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                            />
                            <div class="recent-card__image-error" style="display:none">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                            </div>
                        </div>
                        <div class="recent-card__body">
                            <p class="recent-card__title">${item.title}</p>
                            <div class="recent-card__meta">
                                <span class="recent-card__badge badge-prod">${item.prod_label}</span>
                                <span class="recent-card__badge badge-output">${item.output_label}</span>
                            </div>
                        </div>
                    </a>
                `;
            }).join('');

        } catch(e) {
            container.innerHTML = '';
            console.warn('MeteoUnip: impossibile caricare i places recenti', e);
        }
    }

    // ── Integrazione CookieYes ──────────────────────────────────────

    function hasFunctionalConsent() {
        if (typeof getCkyConsent !== 'function') return false;
        return getCkyConsent()?.categories?.functional === true;
    }

    function init() {
        // TODO: ripristinare il controllo consenso CookieYes prima del deploy in produzione
        //document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
        trackCurrentPage();
        renderRecentPlaces();
    }

    // ── API pubblica del modulo ─────────────────────────────────────

    return {
        init,
        trackCurrentPage,
        saveLastProdOut,
        getLastProdOut,
        getFavorites,
        isFavorite,
        saveFavorite,
        removeFavorite,
        setCookie: setCookiePublic,
        getCookie: getCookiePublic,
    };

})();

(function($){
    $(document).on('place.url.loaded', function(event, data){
        MeteoUniParthenopeCookies.init();
    });

    $(document).ready(function(){
        MeteoUniParthenopeCookies.init();
    });
})(jQuery);