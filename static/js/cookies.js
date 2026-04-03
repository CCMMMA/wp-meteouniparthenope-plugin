let GLOBAL_LAST_PLACES = {};

const MeteoUniParthenopeCookies = (() => {

    const COOKIE_NAME          = 'meteo_unip_recent_places';
    const LAST_PROD_OUT_COOKIE = 'meteo_unip_last_prod_out';
    const MAX_ENTRIES          = 5;
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

    function saveEntry(place, prod, output) {
        let entries = getEntries().filter(e => e.place !== place);
        entries.unshift({ place, prod, output });
        entries = entries.slice(0, MAX_ENTRIES);
        GLOBAL_LAST_PLACES['prod']   = prod;
        GLOBAL_LAST_PLACES['output'] = output;
        setCookie(COOKIE_NAME, encodeURIComponent(JSON.stringify(entries)), COOKIE_DAYS);
        saveLastProdOut(prod, output);
    }

    // ── Last prod/output ────────────────────────────────────────────

    function saveLastProdOut(prod, output) {
        setCookie(LAST_PROD_OUT_COOKIE, encodeURIComponent(JSON.stringify({ prod, output })), COOKIE_DAYS);
    }

    function getLastProdOut() {
        const raw = getCookie(LAST_PROD_OUT_COOKIE);
        try { return raw ? JSON.parse(decodeURIComponent(raw)) : null; }
        catch(e) { return null; }
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

        const params = new URLSearchParams(url);
        const place  = params.get('place')  || MeteoUnipCookieData.currentPlace;
        const prod   = params.get('prod')   || '';
        const output = params.get('output') || '';

        if (place && prod && output) {
            saveEntry(place, prod, output);
        }
    }

    // ── Rendering card in homepage ──────────────────────────────────

    async function renderRecentPlaces() {
        var container = document.getElementById('meteo-recent-places');
        var tmp = jQuery(container).append("<div style='padding: 1rem 0;'><div id='meteo-recent-list' class='recent-list'>");
        var container = document.getElementById('meteo-recent-list');
        if (!container) return;

        const entries = getEntries();
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
                                <span class="recent-card__badge badge-prod">${item.prod}</span>
                                <span class="recent-card__badge badge-output">${item.output}</span>
                            </div>
                        </div>
                        <div class="recent-card__arrow">›</div>
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
        trackCurrentPage();
        renderRecentPlaces();
    }

    // ── API pubblica del modulo ─────────────────────────────────────

    return {
        init,
        trackCurrentPage,
        saveLastProdOut,
        getLastProdOut,
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

