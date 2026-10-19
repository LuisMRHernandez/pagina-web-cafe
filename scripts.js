// ══════════════════════════════════════════
// KITUPAMBA — scripts.js
// ══════════════════════════════════════════

// ── SEGURIDAD: escapar HTML antes de insertarlo en el DOM ──
function escapeHTML(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

// ── NAV SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── MOBILE MENU ──
function toggleMobileMenu() {
    const menu      = document.getElementById('mobileMenu');
    const overlay   = document.getElementById('mobileMenuOverlay');
    const hamburger = document.getElementById('navHamburger');
    const isOpen    = menu.classList.contains('active');

    if (isOpen) {
        menu.classList.remove('active');
        overlay.classList.remove('active');
        hamburger.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(() => { overlay.style.display = 'none'; }, 300);
    } else {
        overlay.style.display = 'block';
        setTimeout(() => {
            menu.classList.add('active');
            overlay.classList.add('active');
            hamburger.classList.add('open');
            document.body.style.overflow = 'hidden';
            const lang = document.body.classList.contains('lang-en') ? 'en' : 'es';
            setLang(lang);
        }, 10);
    }
}

function closeMobileMenu() {
    const menu      = document.getElementById('mobileMenu');
    const overlay   = document.getElementById('mobileMenuOverlay');
    const hamburger = document.getElementById('navHamburger');
    menu.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
}

// ── REVEAL ON SCROLL ──
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.07 });
document.querySelectorAll('.reveal').forEach(r => revealObserver.observe(r));

const staggerObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.05 });
document.querySelectorAll('.reveal-stagger').forEach(r => staggerObserver.observe(r));

// ── LANG SWITCH ──
function setLang(lang) {
    document.body.classList.toggle('lang-en', lang === 'en');
    document.querySelectorAll('.menu-lang-btn').forEach(b => {
        b.classList.toggle('active', b.textContent.trim().toLowerCase() === lang);
    });
    const menu = document.getElementById('mobileMenu');
    if (!menu) return;
    menu.querySelectorAll('a[data-es], a[data-en]').forEach(el => {
        el.style.display = (lang === 'en')
            ? (el.hasAttribute('data-en') ? 'block' : 'none')
            : (el.hasAttribute('data-es') ? 'block' : 'none');
    });
    menu.querySelectorAll('span[data-es], span[data-en]').forEach(el => {
        el.style.display = ((lang === 'en') === el.hasAttribute('data-en')) ? 'inline' : 'none';
    });
}

// ── MODAL GALERÍA ──
const imagenesGaleria = document.querySelectorAll('.slide img');
let imagenActual = 0;

imagenesGaleria.forEach((img, index) => {
    img.closest('.slide').addEventListener('click', (e) => {
        if (e.target.closest('.slide-caption')) return;
        imagenActual = index;
        abrirModal(img.src);
    });
});

function abrirModal(src) {
    const modal  = document.getElementById('modalGaleria');
    const imagen = document.getElementById('imagenModal');
    imagen.src = src;
    modal.classList.add('active');
}

function cerrarModal() {
    document.getElementById('modalGaleria').classList.remove('active');
}

function cambiarImagen(direccion) {
    imagenActual += direccion;
    if (imagenActual < 0) imagenActual = imagenesGaleria.length - 1;
    if (imagenActual >= imagenesGaleria.length) imagenActual = 0;
    document.getElementById('imagenModal').src = imagenesGaleria[imagenActual].src;
}

// ── CARRITO ──
function toggleCarrito() {
    const panel   = document.getElementById('cartPanel');
    const overlay = document.getElementById('cartOverlay');
    panel.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = panel.classList.contains('active') ? 'hidden' : '';
}

function vaciarCarrito() {
    cartClear();
    renderCarrito();
}

function checkout() {
    const cart = cartLoad();
    if (!cart.length) return;
    let msg = 'Hola, quiero pedir:\n';
    cart.forEach(i => {
        msg += `• ${i.tipo} ${i.nombre} – ${i.peso} x${i.qty} = ${fmtCOP(i.precio * i.qty)}\n`;
    });
    msg += '\nTotal: ' + fmtCOP(cart.reduce((s, i) => s + i.precio * i.qty, 0));
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
}

function renderCarrito() {
    const cart    = cartLoad();
    const badge   = document.getElementById('cartBadge');
    const itemsEl = document.getElementById('cartItems');
    const emptyEl = document.getElementById('cartEmpty');
    const footer  = document.getElementById('cartFooter');
    const totalEl = document.getElementById('cartTotal');
    const altEl   = document.getElementById('cartTotalAlt');

    const totalQty   = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.precio * i.qty, 0);

    if (badge) {
        badge.textContent = totalQty;
        badge.classList.toggle('visible', totalQty > 0);
    }

    itemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());

    if (cart.length === 0) {
        emptyEl.style.display = 'block';
        footer.style.display  = 'none';
    } else {
        emptyEl.style.display = 'none';
        footer.style.display  = 'block';
        totalEl.textContent   = fmtPrice(totalPrice);
        if (altEl) altEl.textContent = fmtAlt(totalPrice);

        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-icon">☕</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${escapeHTML(item.nombre)}</div>
                    <div class="cart-item-meta">${escapeHTML(item.tipo)} · ${escapeHTML(item.peso)}</div>
                    <div class="cart-item-actions">
                        <button class="cart-qty-btn" data-key="${escapeHTML(item.key)}" onclick="onCartChangeQty(this.dataset.key,-1)">−</button>
                        <span class="cart-qty-val">${item.qty}</span>
                        <button class="cart-qty-btn" data-key="${escapeHTML(item.key)}" onclick="onCartChangeQty(this.dataset.key,1)">+</button>
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
                    <span class="cart-item-price">${fmtPrice(item.precio * item.qty)}</span>
                    <button class="cart-item-remove" data-key="${escapeHTML(item.key)}" onclick="onCartRemove(this.dataset.key)">✕</button>
                </div>`;
            itemsEl.appendChild(div);
        });
    }
}

function onCartChangeQty(key, delta) {
    cartChangeQty(cartLoad(), key, delta);
    renderCarrito();
}

function onCartRemove(key) {
    cartRemove(cartLoad(), key);
    renderCarrito();
}

// ── SLIDER GALERÍA ──
(function () {
    const slides      = document.querySelectorAll('.slide');
    const dotsWrap    = document.getElementById('sliderDots');
    const progressBar = document.getElementById('sliderProgressBar');
    const INTERVAL    = 5000;
    let current = 0;
    let timer   = null;

    if (!slides.length) return;

    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
    });

    function getDots() { return dotsWrap.querySelectorAll('.slider-dot'); }

    function goTo(index) {
        slides[current].classList.remove('active');
        getDots()[current].classList.remove('active');
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('active');
        getDots()[current].classList.add('active');
        resetProgress();
    }

    function resetProgress() {
        if (progressBar) {
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
            progressBar.offsetWidth;
            progressBar.style.transition = `width ${INTERVAL}ms linear`;
            progressBar.style.width = '100%';
        }
    }

    function startAuto() {
        clearInterval(timer);
        timer = setInterval(() => goTo(current + 1), INTERVAL);
    }

    const wrap = document.querySelector('.slider-wrap');
    if (wrap) {
        wrap.addEventListener('mouseenter', () => clearInterval(timer));
        wrap.addEventListener('mouseleave', () => startAuto());
        let touchStartX = 0;
        wrap.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
        wrap.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 40) dx < 0 ? sliderNext() : sliderPrev();
        }, { passive: true });
    }

    resetProgress();
    startAuto();

    window.sliderNext = () => { goTo(current + 1); clearInterval(timer); startAuto(); };
    window.sliderPrev = () => { goTo(current - 1); clearInterval(timer); startAuto(); };
})();

// ── SLIDER IMPACTO ──
(function () {
    let current = 0;
    const slides = document.querySelectorAll('.impacto-slide');
    const dots   = document.querySelectorAll('.impacto-dot');
    if (!slides.length) return;

    const INTERVAL = 6000;
    let timer = setInterval(() => impactoNext(), INTERVAL);

    function update() {
        slides.forEach((s, i) => s.classList.toggle('active', i === current));
        dots.forEach((d, i)   => d.classList.toggle('active', i === current));
    }

    window.impactoGoTo = function(idx) {
        current = idx; update();
        clearInterval(timer);
        timer = setInterval(() => impactoNext(), INTERVAL);
    };
    window.impactoNext = function() { current = (current + 1) % slides.length; update(); };
    window.impactoPrev = function() { current = (current - 1 + slides.length) % slides.length; update(); };

    const slider = document.querySelector('.impacto-slider');
    if (slider) {
        slider.addEventListener('mouseenter', () => clearInterval(timer));
        slider.addEventListener('mouseleave', () => { timer = setInterval(() => impactoNext(), INTERVAL); });
    }
})();

// ── ESCAPE KEY ──
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        cerrarModal();
        if (openProductId) closeProduct();
        if (document.getElementById('cartPanel').classList.contains('active')) toggleCarrito();
        if (document.getElementById('mobileMenu').classList.contains('active')) closeMobileMenu();
    }
});

// ══════════════════════════════════════════
// TIENDA — Moneda, Productos, Modal
// ══════════════════════════════════════════

// Los precios oficiales están en COP. COP_RATE solo se usa para mostrar el equivalente aproximado en USD.
const COP_RATE = 4200;
let shopCurrency = 'COP';

function setCurrency(cur, btn) {
    shopCurrency = cur;
    document.querySelectorAll('.currency-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateAllPrices();
    if (openProductId) refreshModalPrices();
    renderCarrito();
}

function fmtCOP(cop) {
    return 'COP $' + Math.round(cop).toLocaleString('es-CO');
}

function fmtUSD(cop) {
    return 'USD $' + (cop / COP_RATE).toFixed(2);
}

// Precio principal según la moneda elegida (el valor de entrada siempre es COP)
function fmtPrice(cop) {
    return shopCurrency === 'COP' ? fmtCOP(cop) : fmtUSD(cop);
}

// Equivalente en la otra moneda
function fmtAlt(cop) {
    return shopCurrency === 'COP' ? '≈ ' + fmtUSD(cop) : fmtCOP(cop);
}

// ── Presentaciones oficiales Kitupamba (precios en COP) ──
const TAMANOS_OFICIALES = [
    { l: '250 g',  p: 31500 },
    { l: '340 g',  p: 55000 },
    { l: '500 g',  p: 65000 },
    { l: '1000 g', p: 80000 },
];

// ── Productos ──  (para un precio distinto en un producto: sizes: [{l:'250 g', p:...}, ...])
const PRODUCTS = {
    'to-bourbon': {
        img: 'imagenes/CafeTostado/BourbonRosado.png', badge: 'Tostado', score: '88+',
        tag: 'Kitupamba · Tostado Medio · Planta Pasto, Nariño',
        name: 'Bourbon Rosado', subtitle: 'Pink Bourbon · Natural · Tostado Medio',
        notas: ['Maracuyá', 'Caramelo', 'Cacao', 'Frutas tropicales', 'Miel'],
        fichaL: [['Productor','Patricia Gelpud'],['Finca','Altos de Kitupamba'],['Municipio','Buesaco, Nariño'],['Altura','2.200 msnm'],['Variedad','Bourbon Rosado']],
        fichaR: [['Proceso','Natural – Fermentación anaerobia 72h'],['Secado','Camas africanas 22–28 días'],['Tostión','Media (Medium Roast)'],['SCA','88+ puntos'],['Disponible','En grano / Molido']],
        proceso: 'Los cerezos maduros son seleccionados a mano por Patricia Gelpud y su familia. El café se somete a fermentación anaerobia durante 72 horas en tanques sellados antes de secarse lentamente en camas africanas elevadas bajo la luz del Cañón del Juanambu, logrando una concentración de azúcares y complejidad frutal excepcional.',
        sizes: TAMANOS_OFICIALES,
    },
    'to-geisha': {
        img: 'imagenes/CafeTostado/Geisha.png', badge: 'Tostado', score: '90',
        tag: 'Kitupamba · Tostado Claro · Planta Pasto, Nariño',
        name: 'Geisha', subtitle: 'Variedad Geisha · Lavado · Tostado Claro',
        notas: ['Jazmín', 'Té blanco', 'Durazno', 'Bergamota', 'Limón meyer'],
        fichaL: [['Productor','Patricia Gelpud'],['Finca','Altos de Kitupamba'],['Municipio','Buesaco, Nariño'],['Altura','2.200 msnm'],['Variedad','Geisha']],
        fichaR: [['Proceso','Lavado – Fermentación controlada 36h'],['Secado','Camas africanas 18–24 días'],['Tostión','Clara (Light Roast)'],['SCA','90+ puntos'],['Disponible','En grano / Molido']],
        proceso: 'La Geisha de Kitupamba pasa por un meticuloso proceso de fermentación controlada de 36 horas, con monitoreo IoT de temperatura y pH cada hora. El despulpado es inmediato post-cosecha para preservar la integridad floral. El secado en camas africanas bajo temperatura regulada permite un desarrollo lento que potencia los aromas de jazmín y bergamota que hacen única a esta variedad.',
        sizes: TAMANOS_OFICIALES,
    },
    'to-caturra': {
        img: 'imagenes/CafeTostado/Caturro.png', badge: 'Tostado', score: '85+',
        tag: 'Kitupamba · Tostado Medio · Planta Pasto, Nariño',
        name: 'Caturra', subtitle: 'Variedad Caturra · Lavado · Tostado Medio',
        notas: ['Naranja', 'Panela', 'Caramelo', 'Cítrico', 'Miel'],
        fichaL: [['Productor','Patricia Gelpud'],['Finca','Altos de Kitupamba'],['Municipio','Buesaco, Nariño'],['Altura','2.200 msnm'],['Variedad','Caturra']],
        fichaR: [['Proceso','Lavado – Fermentación 24–30h'],['Secado','Camas elevadas + invernadero'],['Tostión','Media (Medium Roast)'],['SCA','85+ puntos'],['Disponible','En grano / Molido']],
        proceso: 'El Caturra de Kitupamba se procesa por vía húmeda con fermentación en tanque abierto de 24 a 30 horas. Patricia Gelpud supervisa personalmente cada etapa del beneficio. El secado combina camas africanas y cobertura de invernadero para proteger el grano de lluvias y garantizar homogeneidad lote a lote.',
        sizes: TAMANOS_OFICIALES,
    },
    'to-castillo': {
        img: 'imagenes/CafeTostado/Castillo.png', badge: 'Tostado', score: '84+',
        tag: 'Kitupamba · Tostado Oscuro · Planta Pasto, Nariño',
        name: 'Castillo', subtitle: 'Variedad Castillo · Lavado · Tostado Oscuro',
        notas: ['Chocolate', 'Nuez', 'Caramelo', 'Manzana', 'Dulce'],
        fichaL: [['Productor','Patricia Gelpud'],['Finca','Altos de Kitupamba'],['Municipio','Buesaco, Nariño'],['Altura','2.200 msnm'],['Variedad','Castillo']],
        fichaR: [['Proceso','Lavado – Fermentación 20–26h'],['Secado','Camas africanas 20–25 días'],['Tostión','Oscura (Dark Roast)'],['SCA','84+ puntos'],['Disponible','En grano / Molido']],
        proceso: 'El Castillo de Kitupamba destaca por su resistencia y perfil chocolatado desarrollado a 2.200 msnm. El proceso lavado con fermentación de 20 a 26 horas limpia los azúcares externos del grano preservando la dulzura natural. La tostión oscura resalta el cuerpo pleno y el retrogusto a chocolate amargo.',
        sizes: TAMANOS_OFICIALES,
    },
    'to-colombia': {
        img: 'imagenes/CafeTostado/colombia.png', badge: 'Tostado', score: '85',
        tag: 'Kitupamba · Tostado Medio · Planta Pasto, Nariño',
        name: 'Colombia', subtitle: 'Variedad Colombia · Lavado · Tostado Medio',
        notas: ['Frutal', 'Cítrico', 'Miel', 'Avellana', 'Caramelo'],
        fichaL: [['Productor','Patricia Gelpud'],['Finca','Altos de Kitupamba'],['Municipio','Buesaco, Nariño'],['Altura','2.200 msnm'],['Variedad','Colombia']],
        fichaR: [['Proceso','Lavado – Fermentación 24h'],['Secado','Camas africanas 18–22 días'],['Tostión','Media (Medium Roast)'],['SCA','85 puntos'],['Disponible','En grano / Molido']],
        proceso: 'La variedad Colombia de Kitupamba combina resistencia agronómica con un perfil sensorial equilibrado propio de las altitudes extremas del Cañón del Juanambu. Proceso lavado con fermentación de 24 horas y secado meticuloso en camas africanas. Patricia Gelpud ha perfeccionado el punto de recolección para garantizar la madurez óptima de cada cereza.',
        sizes: TAMANOS_OFICIALES,
    },
};

// ── Estado modal ──
let openProductId   = null;
let selectedSizeIdx = 0;
let selectedGrind   = 'grano';
let selectedQty     = 1;

function openProduct(id) {
    const p = PRODUCTS[id];
    if (!p) return;
    openProductId   = id;
    selectedSizeIdx = 0;
    selectedGrind   = 'grano';
    selectedQty     = 1;

    const stageImg = document.getElementById('pm-img');
    pmEdge = PM_EDGE_DEFAULT;
    stageImg.onload = () => { pmEdge = pmSampleEdge(stageImg) || PM_EDGE_DEFAULT; pmSizeStage(); pmApplyStageNow(); };
    stageImg.src = p.img;
    document.getElementById('pm-img').alt              = p.name;
    document.getElementById('pm-badge').textContent    = p.badge;
    document.getElementById('pm-score').innerHTML      = '<b>' + p.score + '</b><small>SCA</small>';
    document.getElementById('pm-tag').textContent      = p.tag;
    document.getElementById('pm-name').textContent     = p.name;
    document.getElementById('pm-subtitle').textContent = p.subtitle;

    pmBuildCallouts(p.notas);
    buildStory(p);

    const grindSection = document.getElementById('pm-grind-section');
    grindSection.style.display = p.badge === 'Tostado' ? 'block' : 'none';
    document.getElementById('grindGrano').classList.add('selected');
    document.getElementById('grindMolido').classList.remove('selected');
    document.getElementById('pmQtyVal').textContent = '1';

    renderSizes(p);
    refreshModalPrices();

    // Medir navbar y bloquear scroll
    const navbarEl = document.getElementById('navbar');
    const navH = navbarEl ? navbarEl.getBoundingClientRect().height : 60;
    document.documentElement.style.setProperty('--navbar-h', navH + 'px');

    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    document.body.dataset.scrollY = scrollY;

    document.getElementById('productOverlay').classList.add('active');
    document.getElementById('productModal').classList.add('active');

    pmSizeStage();
    document.getElementById('pmInfo').scrollTop = 0;
    pmSetStageTarget(0, true);
    document.getElementById('pmProgress').style.width = '0%';
    pmOnScroll();
    setTimeout(() => { pmInitReveal(); pmWatchBuy(); pmOnScroll(); }, 120);
}

// ══════════════════════════════════════════
// MODAL DE PRODUCTO — HISTORIA CON SCROLL
// ══════════════════════════════════════════
const PM_REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

const PM_LABELS = {
    'Productor': ['Productor', 'Producer'], 'Finca': ['Finca', 'Farm'], 'Municipio': ['Municipio', 'Municipality'],
    'Altura': ['Altura', 'Elevation'], 'Variedad': ['Variedad', 'Variety'], 'Proceso': ['Proceso', 'Process'],
    'Secado': ['Secado', 'Drying'], 'Tostión': ['Tostión', 'Roast'], 'SCA': ['SCA', 'SCA'], 'Disponible': ['Disponible', 'Available']
};

function pmLabel(k) {
    const l = PM_LABELS[k] || [k, k];
    return `<span data-es>${escapeHTML(l[0])}</span><span data-en>${escapeHTML(l[1])}</span>`;
}
function pmGet(arr, key) { const r = arr.find(([k]) => k === key); return r ? r[1] : ''; }
function pmNum(str) { const m = String(str).match(/[\d.,]+/); return m ? parseInt(m[0].replace(/[.,]/g, ''), 10) : NaN; }
function pmFmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

function buildStory(p) {
    // 01 · Origen
    const rows = p.fichaL.map(([k, v]) => {
        const n = k === 'Altura' ? pmNum(v) : NaN;
        const val = isNaN(n)
            ? escapeHTML(v)
            : `<span data-count="${n}">0</span><small>${escapeHTML(String(v).replace(/^[\d.,\s]+/, ''))}</small>`;
        return `<div class="pm-or-row rv"><span class="pm-or-k">${pmLabel(k)}</span><span class="pm-or-v">${val}</span></div>`;
    }).join('');

    // 02 · Del beneficio a la tostión
    const steps = ['Proceso', 'Secado', 'Tostión'].map(k => [k, pmGet(p.fichaR, k)]).filter(([, v]) => v);
    const tl = steps.map(([k, v], i) => `
        <div class="pm-tl-item rv" style="--d:${i * 120}ms">
            <span class="pm-tl-dot">${i + 1}</span>
            <div class="pm-tl-k">${pmLabel(k)}</div>
            <div class="pm-tl-v">${escapeHTML(v)}</div>
        </div>`).join('');

    const words = (p.proceso || '').split(/\s+/).filter(Boolean)
        .map(w => `<span class="pm-w">${escapeHTML(w)}</span>`).join(' ');
    const quote = words ? `
        <div class="pm-quote">
            <div class="pm-eyebrow"><span data-es>La historia del lote</span><span data-en>The story of this lot</span></div>
            <p id="pmQuote">${words}</p>
        </div>` : '';

    // 03 · Puntaje SCA
    const score  = pmNum(p.score);
    const suffix = String(p.score).includes('+') ? '+' : '';
    const scoreSec = isNaN(score) ? '' : `
        <section class="pm-sec pm-score-sec">
            <div class="pm-eyebrow rv"><b>03</b><span data-es>Puntaje de catación</span><span data-en>Cupping score</span></div>
            <div class="pm-score-big rv" style="--d:100ms"><span data-count="${score}" data-suffix="${suffix}">0</span><small>SCA</small></div>
            <div class="pm-score-cap rv" style="--d:200ms"><span data-es>puntos sobre 100</span><span data-en>points out of 100</span></div>
            <div class="pm-score-track rv" style="--w:${Math.min(100, score)}%; --d:250ms">
                <div class="pm-score-fill"></div>
                <span class="pm-score-tick" style="left:80%"></span>
            </div>
            <div class="pm-score-scale rv" style="--d:350ms">
                <span style="left:0">0</span>
                <span style="left:80%; transform:translateX(-50%)"><span data-es>80 · Especialidad</span><span data-en>80 · Specialty</span></span>
                <span style="right:0">100</span>
            </div>
        </section>`;

    document.getElementById('pmStory').innerHTML = `
        <div class="pm-one">
            <section class="pm-sec pm-origen">
                <div class="pm-eyebrow rv"><b>01</b><span data-es>Origen</span><span data-en>Origin</span></div>
                <div class="pm-sec-title rv" style="--d:80ms"><span data-es>Donde nace esta taza</span><span data-en>Where this cup begins</span></div>
                ${rows}
            </section>
            <section class="pm-sec pm-proceso">
                <div class="pm-eyebrow rv"><b>02</b><span data-es>Del beneficio a la tostión</span><span data-en>From processing to roasting</span></div>
                <div class="pm-sec-title rv" style="--d:80ms"><span data-es>Así se hizo este café</span><span data-en>How this coffee was made</span></div>
                <div class="pm-tl rv rv-plain"><div class="pm-tl-line"></div>${tl}</div>
            </section>
            <div class="pm-low">
                <div class="pm-sec pm-lote">${quote}</div>
                ${scoreSec}
            </div>
        </div>`;

    pmWords = Array.from(document.querySelectorAll('#pmQuote .pm-w'));
    pmWordsOn = -1;
    if (PM_REDUCED) pmWords.forEach(w => w.classList.add('on'));
}

let pmObserver = null, pmBuyObserver = null, pmWords = [], pmWordsOn = -1, pmTick = false;
let pmBuyVisible = false, pmStageDone = false;
const PM_EDGE_DEFAULT = [20, 16, 13];
let pmEdge = PM_EDGE_DEFAULT, pmSpTarget = 0, pmSpCur = 0, pmRaf = 0;

function pmRunCounters(root) {
    const list = Array.from(root.querySelectorAll('[data-count]'));
    if (root.matches('[data-count]')) list.push(root);
    list.forEach(el => {
        const target = Number(el.dataset.count) || 0;
        const suffix = el.dataset.suffix || '';
        if (PM_REDUCED) { el.textContent = pmFmt(target) + suffix; return; }
        const t0 = performance.now(), dur = 1500;
        const step = t => {
            const k = Math.min(1, (t - t0) / dur);
            el.textContent = pmFmt(target * (1 - Math.pow(1 - k, 3))) + suffix;
            if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    });
}

function pmInitReveal() {
    const info = document.getElementById('pmInfo');
    if (!info) return;
    if (pmObserver) pmObserver.disconnect();
    info.querySelectorAll('.rv.in').forEach(el => el.classList.remove('in'));
    const items = info.querySelectorAll('.rv');
    if (!('IntersectionObserver' in window) || PM_REDUCED) {
        items.forEach(el => { el.classList.add('in'); pmRunCounters(el); });
        return;
    }
    pmObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.classList.add('in');
            pmRunCounters(e.target);
            pmObserver.unobserve(e.target);
        });
    }, { root: info, threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(el => pmObserver.observe(el));
}

function pmUpdateBar() {
    const bar = document.getElementById('pmBar');
    if (bar) bar.classList.toggle('hide', pmBuyVisible || !pmStageDone);
}

// El atajo "Ver opciones de compra" aparece al terminar la escena y se oculta cuando ya estás en la compra
function pmWatchBuy() {
    const info = document.getElementById('pmInfo');
    const bar  = document.getElementById('pmBar');
    const buy  = document.getElementById('pmBuy');
    if (!info || !bar || !buy) return;
    if (pmBuyObserver) pmBuyObserver.disconnect();
    pmBuyVisible = false;
    pmStageDone  = false;
    bar.classList.add('hide');
    if (!('IntersectionObserver' in window)) { pmStageDone = true; pmUpdateBar(); return; }
    pmBuyObserver = new IntersectionObserver(([e]) => { pmBuyVisible = e.isIntersecting; pmUpdateBar(); }, { root: info, threshold: 0 });
    pmBuyObserver.observe(buy);
}

function pmSizeStage() {
    const info = document.getElementById('pmInfo');
    const body = document.querySelector('.pm-stage-body');
    const img  = document.getElementById('pm-img');
    if (!info || !body || !img) return;
    info.style.setProperty('--pm-vh', info.clientHeight + 'px');

    // La foto ocupa el mayor tamaño posible. En escritorio no se recorta; en celular (pantalla vertical)
    // se recorta a un formato más alto, centrado en la bolsa, y se solapa con sus márgenes oscuros.
    const nw = img.naturalWidth  || 4;
    const nh = img.naturalHeight || 3;
    const mobile = window.innerWidth <= 768;
    const W = info.clientWidth;
    if (mobile) {
        const OV = 0.09;                                                      // fracción de la foto que se solapa arriba y abajo
        const callH = Math.max(document.getElementById('pm-notes-l').offsetHeight, document.getElementById('pm-notes-r').offsetHeight) + 10;
        const availH = Math.max(160, body.clientHeight - callH - 12);
        const wantH = availH / (1 - 2 * OV);
        const capH  = (W / (0.56 * nw)) * nh;                                 // deja visible al menos el 56% del ancho de la foto
        const H = Math.max(Math.min(wantH, capH), W * nh / nw);               // nunca más baja que la foto completa
        info.style.setProperty('--img-w', Math.round(W) + 'px');
        info.style.setProperty('--img-h', Math.round(H) + 'px');
    } else {
        const availW = Math.min(W * 0.58, 1200);
        const availH = Math.max(120, body.clientHeight - 18);
        const k = Math.min(availW / nw, availH / nh);
        info.style.setProperty('--img-w', Math.round(nw * k) + 'px');
        info.style.setProperty('--img-h', Math.round(nh * k) + 'px');
    }
}

// Color medio del borde de la foto: el fondo de la escena se funde con él
function pmSampleEdge(img) {
    try {
        const w = 48, h = 48, cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        const cx = cv.getContext('2d', { willReadFrequently: true });
        cx.drawImage(img, 0, 0, w, h);
        const d = cx.getImageData(0, 0, w, h).data;
        let r = 0, g = 0, b = 0, n = 0;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            if (x > 2 && x < w - 3 && y > 2 && y < h - 3) continue;
            const i = (y * w + x) * 4;
            if (d[i + 3] < 128) continue;
            r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
        }
        return n ? [Math.round(r / n), Math.round(g / n), Math.round(b / n)] : null;
    } catch (e) { return null; }   // imagen de otro origen o abierta como archivo local
}

// Suavizado: la animación "alcanza" al scroll en vez de saltar, así se siente más lenta y fluida
function pmLoop() {
    pmRaf = 0;
    const stage = document.getElementById('pmStage');
    if (!stage) return;
    const d = pmSpTarget - pmSpCur;
    if (Math.abs(d) < 0.0004) pmSpCur = pmSpTarget;
    else pmSpCur += d * (window.innerWidth <= 768 ? 0.09 : 0.055);
    pmApplyStage(stage, pmSpCur);
    if (pmSpCur !== pmSpTarget) pmRaf = requestAnimationFrame(pmLoop);
}

function pmSetStageTarget(sp, immediate) {
    if (PM_REDUCED) { sp = 1; immediate = true; }
    pmSpTarget = sp;
    if (immediate) {
        pmSpCur = sp;
        const stage = document.getElementById('pmStage');
        if (stage) pmApplyStage(stage, sp);
        return;
    }
    if (!pmRaf) pmRaf = requestAnimationFrame(pmLoop);
}

function pmApplyStageNow() {
    const stage = document.getElementById('pmStage');
    if (stage) pmApplyStage(stage, pmSpCur);
}

function pmBuildCallouts(notas) {
    const left = ['<div class="pm-callout pm-co-label" data-i="-0.6"><span data-es>Notas de taza</span><span data-en>Cup notes</span></div>'];
    const right = [];
    notas.forEach((n, i) => {
        const html = `<div class="pm-callout" data-i="${i}"><span class="pm-co-n">${String(i + 1).padStart(2, '0')}</span><span class="pm-co-t">${escapeHTML(n)}</span></div>`;
        (i % 2 === 0 ? left : right).push(html);
    });
    document.getElementById('pm-notes-l').innerHTML = left.join('');
    document.getElementById('pm-notes-r').innerHTML = right.join('');
}

// Progreso de la escena fija (0 → 1):
//  0.05–0.30 el nombre sube y se compacta · 0.10–0.42 aparece la foto y el fondo se oscurece
//  0.44–0.81 salen las notas una a una · 0.81–0.92 la escena completa queda quieta · luego sube la historia
function pmApplyStage(stage, sp) {
    const cl = t => Math.min(1, Math.max(0, t));
    const S  = t => { t = cl(t); return t * t * (3 - 2 * t); };
    const w  = (a, b) => S((sp - a) / (b - a));
    const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
    const rgb = c => 'rgb(' + c.join(',') + ')';
    const lum = c => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;

    const dk = w(0.12, 0.42);
    const CREMA = [245, 240, 232], VERDE = [26, 58, 42], SUAVE = [90, 90, 84], CLARO = [214, 208, 196];
    const dark = lum(pmEdge) < 0.5;                       // si la foto es clara, el texto se queda verde
    stage.style.setProperty('--sbg',    rgb(mix(CREMA, pmEdge, dk)));
    stage.style.setProperty('--c-name', rgb(dark ? mix(VERDE, CREMA, dk) : VERDE));
    stage.style.setProperty('--c-sub',  rgb(dark ? mix(SUAVE, CLARO, dk) : SUAVE));
    stage.style.setProperty('--hm',  w(0.05, 0.30).toFixed(3));
    stage.style.setProperty('--in',  w(0.10, 0.42).toFixed(3));
    stage.style.setProperty('--cue', (1 - cl(sp / 0.05)).toFixed(3));
    stage.querySelectorAll('.pm-callout').forEach(el => {
        const i = Number(el.dataset.i);
        el.style.setProperty('--k', w(0.44 + i * 0.065, 0.55 + i * 0.065).toFixed(3));
    });
}

function pmOnScroll() {
    const info = document.getElementById('pmInfo');
    if (!info) return;
    const max = info.scrollHeight - info.clientHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, info.scrollTop / max)) : 0;
    document.getElementById('pmProgress').style.width = (p * 100).toFixed(1) + '%';

    const stage = document.getElementById('pmStage');
    if (stage) {
        const range = stage.offsetHeight - info.clientHeight;
        const scrolled = info.getBoundingClientRect().top - stage.getBoundingClientRect().top;
        const sp = range > 0 ? Math.min(1, Math.max(0, scrolled / range)) : 1;
        pmSetStageTarget(sp, false);
        const done = PM_REDUCED ? info.scrollTop > info.clientHeight * 0.6 : sp >= 0.9;
        if (done !== pmStageDone) { pmStageDone = done; pmUpdateBar(); }
    }

    // El texto de la historia se ilumina palabra por palabra al subir por la pantalla
    if (pmWords.length && !PM_REDUCED) {
        const q = document.getElementById('pmQuote');
        if (!q) return;
        const r = q.getBoundingClientRect(), v = info.getBoundingClientRect();
        const startTop = v.top + v.height * 0.85;
        const endTop   = v.top + v.height * 0.40 - r.height;
        const k = Math.min(1, Math.max(0, (startTop - r.top) / (startTop - endTop)));
        const n = Math.round(k * pmWords.length);
        if (n !== pmWordsOn) {
            pmWordsOn = n;
            pmWords.forEach((w, i) => w.classList.toggle('on', i < n));
        }
    }
}

function pmTeardown() {
    if (pmRaf) { cancelAnimationFrame(pmRaf); pmRaf = 0; }
    if (pmObserver) { pmObserver.disconnect(); pmObserver = null; }
    if (pmBuyObserver) { pmBuyObserver.disconnect(); pmBuyObserver = null; }
}

window.addEventListener('resize', () => { if (openProductId) { pmSizeStage(); pmOnScroll(); } });

(function () {
    const info = document.getElementById('pmInfo');
    if (!info) return;
    info.addEventListener('scroll', () => {
        if (pmTick) return;
        pmTick = true;
        requestAnimationFrame(() => { pmTick = false; pmOnScroll(); });
    }, { passive: true });
})();

function selectGrind(tipo) {
    selectedGrind = tipo;
    document.getElementById('grindGrano').classList.toggle('selected', tipo === 'grano');
    document.getElementById('grindMolido').classList.toggle('selected', tipo === 'molido');
}

function changeQty(delta) {
    selectedQty = Math.max(1, selectedQty + delta);
    document.getElementById('pmQtyVal').textContent = selectedQty;
}

function renderSizes(p) {
    const wrap = document.getElementById('pm-sizes');
    wrap.innerHTML = '';
    p.sizes.forEach((s, i) => {
        const btn = document.createElement('button');
        btn.className = 'pm-size-btn' + (i === selectedSizeIdx ? ' selected' : '');
        btn.innerHTML = `<span class="sz-label">${s.l}</span><span class="sz-price">${fmtPrice(s.p)}</span>`;
        btn.onclick = () => { selectedSizeIdx = i; renderSizes(p); refreshModalPrices(); };
        wrap.appendChild(btn);
    });
}

function refreshModalPrices() {
    const p = PRODUCTS[openProductId];
    if (!p) return;
    const s = p.sizes[selectedSizeIdx];
    document.getElementById('pm-price-main').textContent = fmtPrice(s.p);
    document.getElementById('pm-price-alt').textContent  = fmtAlt(s.p);
    document.getElementById('pm-price-size').textContent = '/ ' + s.l;
    const barName  = document.getElementById('pmBarName');
    const barPrice = document.getElementById('pmBarPrice');
    if (barName)  barName.textContent  = p.name + ' · ' + s.l;
    if (barPrice) barPrice.textContent = fmtPrice(s.p);
}

function closeProduct() {
    if (!openProductId) return;
    document.getElementById('productOverlay').classList.remove('active');
    document.getElementById('productModal').classList.remove('active');
    const scrollY = parseInt(document.body.dataset.scrollY || '0');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
    window.scrollTo({ top: scrollY, behavior: 'instant' });
    openProductId = null;
    pmTeardown();
}

function addFromModal() {
    const p = PRODUCTS[openProductId];
    if (!p) return;
    const s = p.sizes[selectedSizeIdx];
    const grindLabel  = p.badge === 'Tostado' ? (selectedGrind === 'molido' ? ' · Molido' : ' · En grano') : '';
    const tipoConGrind = p.badge + grindLabel;
    let cart = cartLoad();
    for (let i = 0; i < selectedQty; i++) {
        cart = cartAdd(cart, p.name, tipoConGrind, s.l, s.p);
    }
    renderCarrito();
    showToast('✓ ' + p.name + ' · ' + s.l + grindLabel + ' ×' + selectedQty + ' agregado');

    const btn = document.getElementById('pmAddBtn');
    btn.textContent = '✓ Agregado';
    btn.classList.add('added');
    setTimeout(() => {
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg><span data-es>Agregar al carrito</span><span data-en>Add to cart</span>`;
        btn.classList.remove('added');
        setLang(document.body.classList.contains('lang-en') ? 'en' : 'es');
    }, 2000);
}

function buyNowModal() {
    const p = PRODUCTS[openProductId];
    if (!p) return;
    const s = p.sizes[selectedSizeIdx];
    const grindLabel = p.badge === 'Tostado' ? (selectedGrind === 'molido' ? ' · Molido' : ' · En grano') : '';
    let msg = 'Hola, quiero comprar:\n';
    msg += `• ${p.badge}${grindLabel} ${p.name} – ${s.l} x${selectedQty} = ${fmtCOP(s.p * selectedQty)}\n`;
    msg += '\nTotal: ' + fmtCOP(s.p * selectedQty);
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
}

function buyNowCard(id) {
    const p = PRODUCTS[id];
    if (!p) return;
    const s = p.sizes[0];
    let msg = 'Hola, quiero comprar:\n';
    msg += `• ${p.badge} ${p.name} – ${s.l} x1 = ${fmtCOP(s.p)}\n`;
    msg += '\n(Por favor confirmar cantidad y presentación)';
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
}

function updateAllPrices() {
    Object.keys(PRODUCTS).forEach(id => {
        const el = document.getElementById('list-price-' + id);
        if (!el) return;
        const first = PRODUCTS[id].sizes[0];
        el.innerHTML = fmtPrice(first.p) + ` <small>/ ${first.l}</small>`;
    });
}

function filterProducts(cat) {
    document.querySelectorAll('.sf-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === cat));
    let visible = 0;
    document.querySelectorAll('.product-card').forEach(card => {
        const show = cat === 'todos' || card.dataset.category === cat;
        card.style.display = show ? '' : 'none';   // '' conserva el display:flex de la tarjeta
        if (show) visible++;
    });
    const emptyEl = document.getElementById('shopEmpty');
    if (emptyEl) emptyEl.style.display = visible === 0 ? 'block' : 'none';
}

function showToast(msg) {
    const el = document.getElementById('cartToast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2800);
}

updateAllPrices();
renderCarrito();

// ══════════════════════════════════════════
// MUNDO CAFÉ — Noticias del sector
// ══════════════════════════════════════════

let mcCurrentIndex = 0;
let mcCards = [];

function mcGetVisible() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
}

// Opcional: URL de tu propio backend que devuelva un JSON con el mismo formato.
// NUNCA llames a APIs con clave secreta (Anthropic, etc.) directamente desde el navegador.
const NEWS_ENDPOINT = '';

const NOTICIAS_RESPALDO = [
        { titulo: 'FNC: exportaciones de café superan los 13 millones de sacos en 2024', resumen: 'La Federación Nacional de Cafeteros destacó el crecimiento en la demanda internacional. Nariño y Huila lideran los orígenes más valorados por tostadores europeos y asiáticos.', fuente: 'Federación Nacional de Cafeteros', fecha: 'Dic 2024', tag: 'Exportaciones', url: 'https://federaciondecafeteros.org' },
        { titulo: 'Precio interno del café supera récords históricos en Colombia', resumen: 'El precio de compra al caficultor alcanzó niveles sin precedentes impulsados por la demanda global y reducción de inventarios en Brasil, beneficiando especialmente a Nariño.', fuente: 'Portafolio', fecha: 'Ene 2025', tag: 'Precios', url: 'https://portafolio.co' },
        { titulo: 'Nariño gana tres medallas en la Taza de Excelencia Colombia 2024', resumen: 'Tres fincas nariñenses obtuvieron los puntajes más altos del certamen, consolidando la región como principal origen de cafés especiales del país por tercer año consecutivo.', fuente: 'El Tiempo', fecha: 'Nov 2024', tag: 'Especialidad', url: 'https://eltiempo.com' },
        { titulo: 'Cenicafé lidera proyectos IoT para mejorar beneficio del café', resumen: 'El centro de investigación cafetera implementa sensores de fermentación en fincas piloto de Nariño y Huila, con incrementos del 18% en calidad sensorial medida en taza.', fuente: 'La República', fecha: 'Feb 2025', tag: 'Tecnología', url: 'https://larepublica.co' },
        { titulo: 'Geisha colombiana rompe récord de precio en subasta de Tokio', resumen: 'Un lote de Geisha lavado de Nariño fue adjudicado a USD $85 la libra, el precio más alto pagado por un café colombiano en los últimos cinco años en mercados asiáticos.', fuente: 'Semana', fecha: 'Mar 2025', tag: 'Especialidad', url: 'https://semana.com' },
        { titulo: 'Mujeres cafeteras de Nariño acceden a exportación directa sin intermediarios', resumen: 'Un programa liderado por Ecomindala conecta productoras de Buesaco y La Unión con tostadores europeos, aumentando sus ingresos hasta un 40% frente al canal tradicional.', fuente: 'Portafolio', fecha: 'Abr 2025', tag: 'Impacto Social', url: 'https://portafolio.co' },
];

async function cargarNoticiasIA() {
    const track = document.getElementById('mcNewsTrack');
    const btn   = document.getElementById('mcRefreshBtn');
    if (!track) return;

    if (btn) btn.classList.add('loading');
    track.innerHTML = `<div class="mc-skeleton-wrap">
        <div class="mc-skeleton"></div>
        <div class="mc-skeleton"></div>
        <div class="mc-skeleton"></div>
    </div>`;

    try {
        if (!NEWS_ENDPOINT) throw new Error('Sin endpoint de noticias configurado');
        const response = await fetch(NEWS_ENDPOINT);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const noticias = await response.json();
        if (!Array.isArray(noticias) || !noticias.length) throw new Error('Vacío');
        renderNoticiasSlider(noticias);
    } catch (err) {
        renderNoticiasSlider(NOTICIAS_RESPALDO);
    } finally {
        if (btn) btn.classList.remove('loading');
    }
}

function renderNoticiasSlider(noticias) {
    const track = document.getElementById('mcNewsTrack');
    const dotsEl = document.getElementById('mcDots');
    if (!track) return;

    mcCards = noticias;
    mcCurrentIndex = 0;
    const mcVisible = mcGetVisible();

    track.innerHTML = noticias.map(n => `
        <a class="mc-news-card" href="${escapeHTML(n.url && n.url.startsWith('http') ? n.url : '#')}" target="_blank" rel="noopener noreferrer">
            <div class="mc-news-source">
                <div class="mc-news-source-dot"></div>
                <span class="mc-news-source-name">${escapeHTML(n.fuente)}</span>
                <span class="mc-news-date">${escapeHTML(n.fecha)}</span>
            </div>
            <span class="mc-news-tag">${escapeHTML(n.tag)}</span>
            <div class="mc-news-title">${escapeHTML(n.titulo)}</div>
            <div class="mc-news-summary">${escapeHTML(n.resumen)}</div>
            <div class="mc-news-read">Leer más
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>
        </a>
    `).join('');

    const totalSlides = Math.ceil(noticias.length / mcVisible);
    dotsEl.innerHTML = Array.from({ length: totalSlides }, (_, i) =>
        `<button class="mc-dot ${i === 0 ? 'active' : ''}" onclick="mcGoTo(${i})"></button>`
    ).join('');

    mcUpdateSlider();
}

function mcUpdateSlider() {
    const track = document.getElementById('mcNewsTrack');
    if (!track || !track.children.length) return;
    const mcVisible = mcGetVisible();
    const cardW = track.parentElement.offsetWidth / mcVisible;
    const offset = mcCurrentIndex * cardW;

    Array.from(track.children).forEach(c => {
        c.style.flex = `0 0 ${cardW}px`;
        c.style.maxWidth = `${cardW}px`;
    });
    track.style.transform = `translateX(-${offset}px)`;

    document.querySelectorAll('.mc-dot').forEach((d, i) =>
        d.classList.toggle('active', i === Math.floor(mcCurrentIndex / mcVisible)));

    const prev = document.querySelector('.mc-arrow-prev');
    const next = document.querySelector('.mc-arrow-next');
    if (prev) prev.disabled = mcCurrentIndex === 0;
    if (next) next.disabled = mcCurrentIndex >= mcCards.length - mcVisible;
}

function mcGoTo(slideIndex) {
    mcCurrentIndex = slideIndex * mcGetVisible();
    mcUpdateSlider();
}

function mcSliderPrev() {
    const v = mcGetVisible();
    mcCurrentIndex = Math.max(0, mcCurrentIndex - v);
    mcUpdateSlider();
}

function mcSliderNext() {
    const v = mcGetVisible();
    mcCurrentIndex = Math.min(mcCards.length - v, mcCurrentIndex + v);
    mcUpdateSlider();
}

window.addEventListener('resize', () => { if (mcCards.length) mcUpdateSlider(); });

document.addEventListener('DOMContentLoaded', () => { cargarNoticiasIA(); });