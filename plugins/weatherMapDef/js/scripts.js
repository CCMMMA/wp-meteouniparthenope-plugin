document.addEventListener('DOMContentLoaded', function () {
    const mapConfigs = {
        mainMap: { product: 'wrf5', place: 'it000' },
        precipitationMap: { product: 'rms3', place: 'ca000' },
        airQualityMap: { product: 'aiq3', place: 'ca000' },
        wavesMap: { product: 'ww33', place: 'it000' },
        currentsMap: { product: 'wcm3', place: 'ca000' }
    };

    let selectedDay = document.querySelector('.dayCard.active')?.dataset.day;
    let selectedHour = document.querySelector('.hourCard.active')?.dataset.hour;
    let isLoading = false;

    // Preload an image and resolve when ready
    function preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    // Format date and hour for API call
    function formatDateForAPI(date, hour) {
        const dateObj = new Date(date);
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        const h = hour.replace(':', '');
        return `${y}${m}${d}Z${h}`;
    }

    // Build API image URL for a given map
    function buildApiUrl(mapType, formattedDate) {
        const config = mapConfigs[mapType];
        return `https://api.meteo.uniparthenope.it/products/${config.product}/forecast/${config.place}/plot/image?date=${formattedDate}&output=gen`;
    }

    // Apply visual loading effect on map
    function showLoadingEffect(img) {
        img.style.opacity = '0.6';
        img.style.filter = 'blur(2px)';
        img.style.transform = 'scale(0.98)';

        const parent = img.parentElement;
        let loadingOverlay = parent.querySelector('.loading-overlay');

        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
            `;
            parent.appendChild(loadingOverlay);
        }

        loadingOverlay.style.opacity = '1';
    }

    // Remove visual loading effect
    function hideLoadingEffect(img) {
        img.style.opacity = '1';
        img.style.filter = 'none';
        img.style.transform = 'scale(1)';

        const parent = img.parentElement;
        const loadingOverlay = parent.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                if (loadingOverlay.parentElement) {
                    loadingOverlay.parentElement.removeChild(loadingOverlay);
                }
            }, 300);
        }
    }

    // Update all maps with the selected date and hour
    async function updateAllMaps() {
        if (isLoading) return;

        isLoading = true;
        const formattedDate = formatDateForAPI(selectedDay, selectedHour);
        const updatePromises = [];

        Object.keys(mapConfigs).forEach(mapType => {
            const img = document.querySelector(`.${mapType} img`);
            if (img) {
                showLoadingEffect(img);
                const apiUrl = buildApiUrl(mapType, formattedDate);

                const updatePromise = preloadImage(apiUrl)
                    .then(newImg => {
                        return new Promise(resolve => {
                            setTimeout(() => {
                                img.src = newImg.src;
                                hideLoadingEffect(img);
                                resolve();
                            }, 200);
                        });
                    })
                    .catch(() => {
                        hideLoadingEffect(img);
                        img.src = apiUrl;
                    });

                updatePromises.push(updatePromise);
            }
        });

        await Promise.all(updatePromises);
        isLoading = false;
    }

    // Handle day/hour card click and trigger callback
    function handleCardClick(cards, callback) {
        cards.forEach(card => {
            card.addEventListener('click', function () {
                if (this.classList.contains('active')) return;

                cards.forEach(c => {
                    c.classList.remove('active');
                    c.style.animation = 'none';
                });

                this.classList.add('active');
                this.style.animation = 'pulse 2s infinite';

                const ripple = document.createElement('div');
                ripple.className = 'ripple';
                this.appendChild(ripple);

                setTimeout(() => {
                    if (ripple.parentElement) ripple.parentElement.removeChild(ripple);
                }, 600);

                callback(this);
            });

            card.addEventListener('mouseenter', function () {
                if (!this.classList.contains('active')) {
                    this.style.transform = 'translateY(-4px) scale(1.05)';
                }
            });

            card.addEventListener('mouseleave', function () {
                if (!this.classList.contains('active')) {
                    this.style.transform = 'translateY(0) scale(1)';
                }
            });
        });
    }

    // Register click handlers for day and hour selectors
    handleCardClick(document.querySelectorAll('.dayCard'), card => {
        selectedDay = card.dataset.day;
        updateAllMaps();
    });

    handleCardClick(document.querySelectorAll('.hourCard'), card => {
        selectedHour = card.dataset.hour;
        updateAllMaps();
    });

    // Auto-refresh maps every 15 minutes
    setInterval(() => {
        if (!isLoading) updateAllMaps();
    }, 15 * 60 * 1000);

    // Optimize performance on window resize (mobile)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth < 768) {
                document.querySelectorAll('.weatherCorpus img').forEach(img => {
                    img.style.transition = 'none';
                    setTimeout(() => {
                        img.style.transition = 'all 0.3s ease';
                    }, 100);
                });
            }
        }, 250);
    });

    // Lazy loading with Intersection Observer
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.style.opacity = '1';
                    img.style.transform = 'scale(1)';
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('.weatherCorpus img').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Add dynamic styles (spinner, ripple, transitions)
    const dynamicStyles = document.createElement('style');
    dynamicStyles.textContent = `
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 16px;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 10;
        }

        .loading-spinner {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }

        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        .weatherCorpus > div {
            position: relative;
        }

        .weatherCorpus img {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
    `;
    document.head.appendChild(dynamicStyles);

    // Animate map loading on initial render
    setTimeout(() => {
        document.querySelectorAll('.weatherCorpus > div').forEach((div, index) => {
            div.style.opacity = '0';
            div.style.transform = 'translateY(20px)';
            setTimeout(() => {
                div.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                div.style.opacity = '1';
                div.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 300);
});
