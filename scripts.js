// ══════════════════════════════════════════
// KITOPAMBA — scripts.js
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
    img.addEventListener('click', () => {
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
        msg += `• ${i.tipo} ${i.nombre} – ${i.peso} x${i.qty} = ${fmtPrice(i.precio * i.qty)}\n`;
    });
    msg += '\nTotal: ' + fmtPrice(cart.reduce((s, i) => s + i.precio * i.qty, 0));
    window.open('https://wa.me/573026775940?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
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
                        <button class="cart-qty-btn" onclick="onCartChangeQty('${item.key}',-1)">−</button>
                        <span class="cart-qty-val">${item.qty}</span>
                        <button class="cart-qty-btn" onclick="onCartChangeQty('${item.key}',1)">+</button>
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
                    <span class="cart-item-price">${fmtPrice(item.precio * item.qty)}</span>
                    <button class="cart-item-remove" onclick="onCartRemove('${item.key}')">✕</button>
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
    if (e.key === 'Escape') { cerrarModal(); closeProduct(); }
});

// ══════════════════════════════════════════
// TIENDA — Moneda, Productos, Modal
// ══════════════════════════════════════════

const COP_RATE = 4200;
let shopCurrency = 'USD';

function setCurrency(cur, btn) {
    shopCurrency = cur;
    document.querySelectorAll('.currency-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateAllPrices();
    if (openProductId) refreshModalPrices();
    renderCarrito();
}

function fmtPrice(usd) {
    if (shopCurrency === 'COP') {
        const cop = Math.round(usd * COP_RATE / 1000) * 1000;
        return 'COP $' + cop.toLocaleString('es-CO');
    }
    return 'USD $' + usd;
}

function fmtAlt(usd) {
    if (shopCurrency === 'COP') return '≈ USD $' + usd;
    const cop = Math.round(usd * COP_RATE / 1000) * 1000;
    return '≈ COP $' + cop.toLocaleString('es-CO');
}

// ── Productos ──
const PRODUCTS = {
    'to-bourbon': {
        img: 'imagenes/CafeTostado/BourbonRosado.png', badge: 'Tostado', score: '88+',
        tag: 'Kitopamba · Tostado Medio · Planta Pasto, Nariño',
        name: 'Bourbon Rosado', subtitle: 'Pink Bourbon · Natural · Tostado Medio',
        notas: ['Maracuyá', 'Caramelo', 'Cacao', 'Frutas tropicales', 'Miel'],
        fichaL: [['Productor','Patricia Gelpud'],['Finca','Altos de Kitopamba'],['Municipio','Buesaco, Nariño'],['Altura','2.200 msnm'],['Variedad','Bourbon Rosado']],
        fichaR: [['Proceso','Natural – Fermentación anaerobia 72h'],['Secado','Camas africanas 22–28 días'],['Tostión','Media (Medium Roast)'],['SCA','88+ puntos'],['Disponible','En grano / Molido']],
        proceso: 'Los cerezos maduros son seleccionados a mano por Guillermo Torres y su familia. El café se somete a fermentación anaerobia durante 72 horas en tanques sellados antes de secarse lentamente en camas africanas elevadas bajo la luz del Cañón del Juanambu, logrando una concentración de azúcares y complejidad frutal excepcional.',
        sizes: [{l:'250g',p:17},{l:'350g',p:23},{l:'Libra',p:30},{l:'Kilo',p:54}],
    },
    'to-geisha': {
        img: 'imagenes/CafeTostado/Geisha.png', badge: 'Tostado', score: '90',
        tag: 'Kitopamba · Tostado Claro · Planta Pasto, Nariño',
        name: 'Geisha', subtitle: 'Variedad Geisha · Lavado · Tostado Claro',
        notas: ['Jazmín', 'Té blanco', 'Durazno', 'Bergamota', 'Limón meyer'],
        fichaL: [['Productor','Patricia Gelpud'],['Finca','Altos de Kitopamba'],['Municipio','Buesaco, Nariño'],['Altura','2.200 msnm'],['Variedad','Geisha']],
        fichaR: [['Proceso','Lavado – Fermentación controlada 36h'],['Secado','Camas africanas 18–24 días'],['Tostión','Clara (Light Roast)'],['SCA','90+ puntos'],['Disponible','En grano / Molido']],
        proceso: 'La Geisha de Kitopamba pasa por un meticuloso proceso de fermentación controlada de 36 horas, con monitoreo IoT de temperatura y pH cada hora. El despulpado es inmediato post-cosecha para preservar la integridad floral. El secado en camas africanas bajo temperatura regulada permite un desarrollo lento que potencia los aromas de jazmín y bergamota que hacen única a esta variedad.',
        sizes: [{l:'250g',p:22},{l:'350g',p:29},{l:'Libra',p:38},{l:'Kilo',p:68}],
    },
    'to-caturra': {
        img: 'imagenes/CafeTostado/Caturro.png', badge: 'Tostado', score: '85+',
        tag: 'Kitopamba · Tostado Medio · Planta Pasto, Nariño',
        name: 'Caturra', subtitle: 'Variedad Caturra · Lavado · Tostado Medio',
        notas: ['Naranja', 'Panela', 'Caramelo', 'Cítrico', 'Miel'],
        fichaL: [['Productor','Patricia Gelpud'],['Finca','Altos de Kitopamba'],['Municipio','Buesaco, Nariño'],['Altura','2.200 msnm'],['Variedad','Caturra']],
        fichaR: [['Proceso','Lavado – Fermentación 24–30h'],['Secado','Camas elevadas + invernadero'],['Tostión','Media (Medium Roast)'],['SCA','85+ puntos'],['Disponible','En grano / Molido']],
        proceso: 'El Caturra de Kitopamba se procesa por vía húmeda con fermentación en tanque abierto de 24 a 30 horas. Guillermo Torres supervisa personalmente cada etapa del beneficio. El secado combina camas africanas y cobertura de invernadero para proteger el grano de lluvias y garantizar homogeneidad lote a lote.',
        sizes: [{l:'250g',p:14},{l:'350g',p:19},{l:'Libra',p:25},{l:'Kilo',p:44}],
    },
    'to-castillo': {
        img: 'imagenes/CafeTostado/Castillo.png', badge: 'Tostado', score: '84+',
        tag: 'Kitopamba · Tostado Oscuro · Planta Pasto, Nariño',
        name: 'Castillo', subtitle: 'Variedad Castillo · Lavado · Tostado Oscuro',
        notas: ['Chocolate', 'Nuez', 'Caramelo', 'Manzana', 'Dulce'],
        fichaL: [['Productor','Patricia Gelpud'],['Finca','Altos de Kitopamba'],['Municipio','Buesaco, Nariño'],['Altura','2.200 msnm'],['Variedad','Castillo']],
        fichaR: [['Proceso','Lavado – Fermentación 20–26h'],['Secado','Camas africanas 20–25 días'],['Tostión','Oscura (Dark Roast)'],['SCA','84+ puntos'],['Disponible','En grano / Molido']],
        proceso: 'El Castillo de Kitopamba destaca por su resistencia y perfil chocolatado desarrollado a 2.200 msnm. El proceso lavado con fermentación de 20 a 26 horas limpia los azúcares externos del grano preservando la dulzura natural. La tostión oscura resalta el cuerpo pleno y el retrogusto a chocolate amargo.',
        sizes: [{l:'250g',p:13},{l:'350g',p:18},{l:'Libra',p:23},{l:'Kilo',p:42}],
    },
    'to-colombia': {
        img: 'imagenes/CafeTostado/colombia.png', badge: 'Tostado', score: '85',
        tag: 'Kitopamba · Tostado Medio · Planta Pasto, Nariño',
        name: 'Colombia', subtitle: 'Variedad Colombia · Lavado · Tostado Medio',
        notas: ['Frutal', 'Cítrico', 'Miel', 'Avellana', 'Caramelo'],
        fichaL: [['Productor','Patricia Gelpud'],['Finca','Altos de Kitopamba'],['Municipio','Buesaco, Nariño'],['Altura','2.200 msnm'],['Variedad','Colombia']],
        fichaR: [['Proceso','Lavado – Fermentación 24h'],['Secado','Camas africanas 18–22 días'],['Tostión','Media (Medium Roast)'],['SCA','85 puntos'],['Disponible','En grano / Molido']],
        proceso: 'La variedad Colombia de Kitopamba combina resistencia agronómica con un perfil sensorial equilibrado propio de las altitudes extremas del Cañón del Juanambu. Proceso lavado con fermentación de 24 horas y secado meticuloso en camas africanas. Guillermo Torres ha perfeccionado el punto de recolección para garantizar la madurez óptima de cada cereza.',
        sizes: [{l:'250g',p:13},{l:'350g',p:18},{l:'Libra',p:23},{l:'Kilo',p:42}],
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

    document.getElementById('pm-img').src              = p.img;
    document.getElementById('pm-img').alt              = p.name;
    document.getElementById('pm-badge').textContent    = p.badge;
    document.getElementById('pm-score').innerHTML      = p.score + '<small>SCA pts</small>';
    document.getElementById('pm-tag').textContent      = p.tag;
    document.getElementById('pm-name').textContent     = p.name;
    document.getElementById('pm-subtitle').textContent = p.subtitle;

    const fl = document.getElementById('pm-ficha-left');
    fl.innerHTML = '<div class="pm-ficha-title">PRODUCTOR · FINCA</div>';
    p.fichaL.forEach(([k, v]) => { fl.innerHTML += `<div class="pm-ficha-row"><span class="pm-ficha-key">${k}</span><span class="pm-ficha-val">${v}</span></div>`; });

    const fr = document.getElementById('pm-ficha-right');
    fr.innerHTML = '<div class="pm-ficha-title">PROCESO · PERFIL</div>';
    p.fichaR.forEach(([k, v]) => { fr.innerHTML += `<div class="pm-ficha-row"><span class="pm-ficha-key">${k}</span><span class="pm-ficha-val">${v}</span></div>`; });

    const procesoEl = document.getElementById('pm-proceso-text');
    if (procesoEl) procesoEl.textContent = p.proceso || '';

    document.getElementById('pm-notas').innerHTML = p.notas.map(n => `<span class="pm-nota">${n}</span>`).join('');

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

    setTimeout(() => {
        const info = document.querySelector('.pm-info');
        if (info) info.scrollTop = 0;
    }, 50);
}

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
}

function closeProduct() {
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
    msg += `• ${p.badge}${grindLabel} ${p.name} – ${s.l} x${selectedQty} = ${fmtPrice(s.p * selectedQty)}\n`;
    msg += '\nTotal: ' + fmtPrice(s.p * selectedQty);
    window.open('https://wa.me/573176564364?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
}

function buyNowCard(id) {
    const p = PRODUCTS[id];
    if (!p) return;
    const s = p.sizes[0];
    let msg = 'Hola, quiero comprar:\n';
    msg += `• ${p.badge} ${p.name} – ${s.l} x1 = ${fmtPrice(s.p)}\n`;
    msg += '\n(Por favor confirmar cantidad y presentación)';
    window.open('https://wa.me/573176564364?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
}

function updateAllPrices() {
    Object.keys(PRODUCTS).forEach(id => {
        const el = document.getElementById('list-price-' + id);
        if (!el) return;
        const first = PRODUCTS[id].sizes[0];
        el.innerHTML = fmtPrice(first.p) + ` <small>/ ${first.l}</small>`;
    });
}

function filterProducts(cat, btn) {
    document.querySelectorAll('.sf-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.sf-btn').forEach(b => {
        if (b.onclick && b.onclick.toString().includes(`'${cat}'`)) b.classList.add('active');
    });
    let visible = 0;
    document.querySelectorAll('.product-card').forEach(card => {
        const show = cat === 'todos' || card.dataset.category === cat;
        card.style.display = show ? 'block' : 'none';
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

renderCarrito();

// ══════════════════════════════════════════
// MUNDO CAFÉ — Noticias con IA
// ══════════════════════════════════════════

let mcCurrentIndex = 0;
let mcCards = [];

function mcGetVisible() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
}

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
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'claude-sonnet-4-6',
                max_tokens: 2000,
                tools: [{ type: 'web_search_20250305', name: 'web_search' }],
                messages: [{
                    role: 'user',
                    content: `Busca las noticias más recientes sobre café colombiano en estos sitios web colombianos: federaciondecafeteros.org, portafolio.co, eltiempo.com, semana.com, larepublica.co. Busca noticias de 2025 sobre precios del café, exportaciones, café de especialidad, Nariño cafetero o programas para caficultores.

Devuelve ÚNICAMENTE un array JSON válido con exactamente 6 objetos. Sin texto antes ni después. Sin bloques de código markdown. Solo el array JSON puro que empiece con [ y termine con ]:

[{"titulo":"...","resumen":"máximo 2 oraciones","fuente":"nombre del medio","fecha":"mes y año en español","tag":"categoría corta","url":"url real o #"}]`
                }]
            })
        });

        const data = await response.json();
        const fullText = (data.content || [])
            .filter(b => b.type === 'text')
            .map(b => b.text)
            .join('');

        const startIdx = fullText.indexOf('[');
        const endIdx   = fullText.lastIndexOf(']');
        if (startIdx === -1 || endIdx === -1) throw new Error('No JSON');

        const noticias = JSON.parse(fullText.substring(startIdx, endIdx + 1));
        if (!Array.isArray(noticias) || !noticias.length) throw new Error('Empty');

        renderNoticiasSlider(noticias);
    } catch (err) {
        console.warn('Noticias de respaldo:', err.message);
        renderNoticiasSlider([
            { titulo: 'FNC: exportaciones de café superan los 13 millones de sacos en 2024', resumen: 'La Federación Nacional de Cafeteros destacó el crecimiento en la demanda internacional. Nariño y Huila lideran los orígenes más valorados por tostadores europeos y asiáticos.', fuente: 'Federación Nacional de Cafeteros', fecha: 'Dic 2024', tag: 'Exportaciones', url: 'https://federaciondecafeteros.org' },
            { titulo: 'Precio interno del café supera récords históricos en Colombia', resumen: 'El precio de compra al caficultor alcanzó niveles sin precedentes impulsados por la demanda global y reducción de inventarios en Brasil, beneficiando especialmente a Nariño.', fuente: 'Portafolio', fecha: 'Ene 2025', tag: 'Precios', url: 'https://portafolio.co' },
            { titulo: 'Nariño gana tres medallas en la Taza de Excelencia Colombia 2024', resumen: 'Tres fincas nariñenses obtuvieron los puntajes más altos del certamen, consolidando la región como principal origen de cafés especiales del país por tercer año consecutivo.', fuente: 'El Tiempo', fecha: 'Nov 2024', tag: 'Especialidad', url: 'https://eltiempo.com' },
            { titulo: 'Cenicafé lidera proyectos IoT para mejorar beneficio del café', resumen: 'El centro de investigación cafetera implementa sensores de fermentación en fincas piloto de Nariño y Huila, con incrementos del 18% en calidad sensorial medida en taza.', fuente: 'La República', fecha: 'Feb 2025', tag: 'Tecnología', url: 'https://larepublica.co' },
            { titulo: 'Geisha colombiana rompe récord de precio en subasta de Tokio', resumen: 'Un lote de Geisha lavado de Nariño fue adjudicado a USD $85 la libra, el precio más alto pagado por un café colombiano en los últimos cinco años en mercados asiáticos.', fuente: 'Semana', fecha: 'Mar 2025', tag: 'Especialidad', url: 'https://semana.com' },
            { titulo: 'Mujeres cafeteras de Nariño acceden a exportación directa sin intermediarios', resumen: 'Un programa liderado por Ecomindala conecta productoras de Buesaco y La Unión con tostadores europeos, aumentando sus ingresos hasta un 40% frente al canal tradicional.', fuente: 'Portafolio', fecha: 'Abr 2025', tag: 'Impacto Social', url: 'https://portafolio.co' },
        ]);
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