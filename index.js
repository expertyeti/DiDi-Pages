document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURACIÓN E INICIALIZACIÓN ---
    const BASE_PATH = 'assets/secctions/html/';
    const contentContainer = document.getElementById('dynamic-content');
    const scrollContainer = document.querySelector('.chips-wrapper');
    const btnLeft = document.querySelector('.nav-arrow.left');
    const btnRight = document.querySelector('.nav-arrow.right');
    const navbar = document.querySelector('.navbar'); // Referencia al nav
    
    // --- 2. CONTROL DEL SCROLL EN NAVBAR ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- 3. FUNCIÓN DE CARGA DINÁMICA ---
    async function loadContent(filename) {
        try {
            contentContainer.style.opacity = '0.5';
            const response = await fetch(BASE_PATH + filename);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            contentContainer.innerHTML = await response.text();
            
            contentContainer.classList.remove('fade-in');
            void contentContainer.offsetWidth; // Force Reflow
            contentContainer.classList.add('fade-in');

            // Inicializar lógicas específicas
            if (filename.includes('pax.html')) {
                // Verificamos si la función modular existe
                if (typeof window.initPaxPage === 'function') {
                    window.initPaxPage();
                } else {
                    console.warn('initPaxPage no está cargado. Asegúrate de incluir src/pax.js');
                }
            }
            else if (filename.includes('drv.html')) {
                initDriverPage(); 
            }

        } catch (error) {
            console.error('Error cargando contenido:', error);
        } finally {
            contentContainer.style.opacity = '1';
        }
    }

    // --- 4. LÓGICA DE DRV.HTML ---
    function initDriverPage() {
        const card4w = document.getElementById('card-4w');
        const card2w = document.getElementById('card-2w');
        const servicesContainer = document.getElementById('services-container');
        const serviceTitle = document.getElementById('service-title');

        const servicesData = {
            '4w': {
                title: "Modalidades para Auto:",
                items: [
                    { name: "Express", icon: "fa-car-side" },
                    { name: "Fleet", icon: "fa-users-rays" },
                    { name: "Pon tu Precio", icon: "fa-hand-holding-dollar" },
                    { name: "Entrega", icon: "fa-box-open" },
                    { name: "Taxi", icon: "fa-taxi" }
                ]
            },
            '2w': {
                title: "Modalidades para Moto:",
                items: [
                    { name: "DiDi Moto", icon: "fa-motorcycle" },
                    { name: "Entrega Light", icon: "fa-bolt" }
                ]
            }
        };

        function updateDriverServices(type) {
            if (type === '4w') {
                if(card4w) card4w.classList.add('selected');
                if(card2w) card2w.classList.remove('selected');
            } else {
                if(card2w) card2w.classList.add('selected');
                if(card4w) card4w.classList.remove('selected');
            }

            const data = servicesData[type];
            if (serviceTitle) {
                serviceTitle.innerText = data.title;
                serviceTitle.style.opacity = 0;
                setTimeout(() => serviceTitle.style.opacity = 1, 200);
            }
            
            if (servicesContainer) {
                servicesContainer.innerHTML = '';
                data.items.forEach((item, index) => {
                    const div = document.createElement('div');
                    div.className = 'service-item';
                    div.style.animationDelay = `${index * 0.1}s`;
                    div.innerHTML = `<i class="fa-solid ${item.icon} serv-icon"></i><div class="serv-name">${item.name}</div>`;
                    servicesContainer.appendChild(div);
                });
            }
        }

        if (card4w) card4w.addEventListener('click', () => updateDriverServices('4w'));
        if (card2w) card2w.addEventListener('click', () => updateDriverServices('2w'));

        // Init por defecto
        if (card4w) updateDriverServices('4w');
    }

    // --- 5. LOGICA GENERAL ---
    function checkScrollLimits() {
        if (!scrollContainer) return;
        const tolerance = 2;
        if (scrollContainer.scrollLeft <= tolerance) {
            if(btnLeft) { btnLeft.style.opacity = '0'; btnLeft.style.pointerEvents = 'none'; }
        } else {
            if(btnLeft) { btnLeft.style.opacity = '1'; btnLeft.style.pointerEvents = 'auto'; }
        }
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        if (scrollContainer.scrollLeft >= maxScroll - tolerance) {
            if(btnRight) { btnRight.style.opacity = '0'; btnRight.style.pointerEvents = 'none'; }
        } else {
            if(btnRight) { btnRight.style.opacity = '1'; btnRight.style.pointerEvents = 'auto'; }
        }
    }

    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', checkScrollLimits);
        window.addEventListener('resize', checkScrollLimits);
        if(btnLeft) btnLeft.addEventListener('click', () => scrollContainer.scrollBy({ left: -150, behavior: 'smooth' }));
        if(btnRight) btnRight.addEventListener('click', () => scrollContainer.scrollBy({ left: 150, behavior: 'smooth' }));
    }

    const radios = document.querySelectorAll('input[name="didi-tabs"]');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const targetFile = e.target.getAttribute('data-target');
            if (targetFile) loadContent(targetFile);

            const labelId = 'label-' + e.target.id.split('-')[1];
            const labelEl = document.getElementById(labelId);
            if (labelEl && window.innerWidth <= 900 && scrollContainer) {
                const centerPos = labelEl.offsetLeft - (scrollContainer.clientWidth / 2) + (labelEl.clientWidth / 2);
                scrollContainer.scrollTo({ left: centerPos, behavior: 'smooth' });
            }
        });
    });

    const activeRadio = document.querySelector('input[name="didi-tabs"]:checked');
    if (activeRadio) {
        loadContent(activeRadio.getAttribute('data-target'));
    }
    
    setTimeout(checkScrollLimits, 100);
});