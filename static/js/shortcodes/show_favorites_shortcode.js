(function($){

    const ROOT_ID      = 'show_favorites_shortcode-root';
    const API_BASE     = MeteoUnipCookieData.restUrl;
    const NONCE        = MeteoUnipCookieData.nonce;
    const API_IMG_BASE = 'https://api.meteo.uniparthenope.it/products';

    function getTodayDateParam() {
        const now  = new Date();
        const yyyy = now.getFullYear();
        const mm   = String(now.getMonth() + 1).padStart(2, '0');
        const dd   = String(now.getDate()).padStart(2, '0');
        return `${yyyy}${mm}${dd}Z1200`;
    }

    function clearFavorites() {
        if (!window.confirm('Do you really want to clear your favorites list?')) return;
        MeteoUniParthenopeCookies.setCookie('meteo_unip_favorites', [], 30);
        const root = document.getElementById(ROOT_ID);
        if (!root) return;
        root.innerHTML = '<p class="meteo-favorites-empty">No places in favorites.</p>';
    }

    async function renderFavorites() {
        const root = document.getElementById(ROOT_ID);
        if (!root) return;

        const entries = MeteoUniParthenopeCookies.getFavorites();
        if (!entries.length) {
            root.innerHTML = '<p class="meteo-favorites-empty">No places in favorites.</p>';
            return;
        }

        // Wrapper con padding e header per il pulsante
        const wrapper = document.createElement('div');
        wrapper.style.padding = '1rem 0';
        wrapper.innerHTML = `
            <div class="meteo-section-header">
                <button id="meteo-clear-favorites-btn" class="meteo-clear-btn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                    Clear favorites
                </button>
                <div id="meteo-favorites-list" class="recent-list"></div>
            </div>
        `;
        root.appendChild(wrapper);

        const clearBtn = wrapper.querySelector('#meteo-clear-favorites-btn');
        if (clearBtn) clearBtn.addEventListener('click', clearFavorites);

        const container = wrapper.querySelector('#meteo-favorites-list');
        if (!container) return;

        // Skeleton loader
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
                container.innerHTML = '<p class="meteo-favorites-empty">No places in favorites.</p>';
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
            console.warn('MeteoUnip: Unable to load favorite places', e);
        }
    }

    $(document).ready(function() {
        renderFavorites();
    });

})(jQuery);