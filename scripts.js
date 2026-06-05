// ── NAV SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── MOBILE MENU ──
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileMenuOverlay');
    const hamburger = document.getElementById('navHamburger');
    const isOpen = menu.classList.contains('active');
    menu.classList.toggle('active');
    overlay.style.display = isOpen ? 'none' : 'block';
    setTimeout(() => overlay.classList.toggle('active', !isOpen), 10);
    hamburger.classList.toggle('open', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
    // Aplicar idioma actual al abrir
    if (!isOpen) {
        const lang = document.body.classList.contains('lang-en') ? 'en' : 'es';
        setLang(lang);
    }
}

function closeMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileMenuOverlay');
    const hamburger = document.getElementById('navHamburger');
    menu.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
}

// ── REVEAL ON SCROLL ──
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
    });
}, { threshold: 0.08 });
reveals.forEach(r => observer.observe(r));

// ── FILTER BUTTONS ──
document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

// ── LANG SWITCH ──
function setLang(lang) {
    document.body.classList.toggle('lang-en', lang === 'en');
    document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.toggle('active', b.textContent.trim().toLowerCase() === lang);
    });
    // Controlar menú móvil manualmente (no usa clases CSS del body)
    const menu = document.getElementById('mobileMenu');
    if (!menu) return;
    menu.querySelectorAll('a[data-es], a[data-en]').forEach(el => {
        const isEs = el.hasAttribute('data-es');
        const isEn = el.hasAttribute('data-en');
        if (lang === 'en') {
            el.style.display = isEn ? 'block' : 'none';
        } else {
            el.style.display = isEs ? 'block' : 'none';
        }
    });
    // Controlar texto del botón carrito
    menu.querySelectorAll('span[data-es], span[data-en]').forEach(el => {
        const isEn = el.hasAttribute('data-en');
        el.style.display = (lang === 'en') === isEn ? 'inline' : 'none';
    });
}

// ── FORM SUBMIT ──
function handleSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('.form-submit');
    const isEn = document.body.classList.contains('lang-en');
    btn.textContent = isEn ? '✓ Message Sent!' : '✓ ¡Mensaje enviado!';
    btn.style.background = '#2d5a3f';
    setTimeout(() => {
        btn.textContent = isEn ? 'Send Message' : 'Enviar Mensaje';
        btn.style.background = '';
    }, 3000);
}

// ── MOSTRAR PRODUCTO (TIENDA) ──
function mostrarProducto(tipo) {
    document.querySelectorAll('.producto-seccion').forEach(sec => {
        sec.style.display = 'none';
    });
    const seccion = document.getElementById(tipo);
    if (seccion) {
        seccion.style.display = 'block';
        seccion.scrollIntoView({ behavior: 'smooth' });
    }
}

// ── GALERÍA ──
function toggleGaleria() {
    const galeria = document.getElementById('galeriaGrid');
    const boton = document.querySelector('.galeria-btn');
    galeria.classList.toggle('active');
    const abierta = galeria.classList.contains('active');
    boton.innerHTML = abierta
        ? `<span data-es>Ocultar galería</span><span data-en>Hide gallery</span>`
        : `<span data-es>Explorar galería</span><span data-en>Explore gallery</span>`;
    // Reaplicar idioma activo tras cambiar innerHTML
    const lang = document.body.classList.contains('lang-en') ? 'en' : 'es';
    setLang(lang);
}

// ── MODAL GALERÍA ──
const imagenesGaleria = document.querySelectorAll('.galeria-grid img');
let imagenActual = 0;

imagenesGaleria.forEach((img, index) => {
    img.addEventListener('click', () => {
        imagenActual = index;
        abrirModal(img.src);
    });
});

function abrirModal(src) {
    const modal = document.getElementById('modalGaleria');
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

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') cerrarModal();
});

// ── SELECTOR DE PRESENTACIÓN (TIENDA) ──

// Almacena la presentación seleccionada por producto
const presentacionSeleccionada = {};

// Abre el dropdown de presentaciones
function abrirSelector(id) {
    document.querySelectorAll('.selector-dropdown.abierto').forEach(el => {
        if (el.id !== 'selector-' + id) el.classList.remove('abierto');
    });
    const dropdown = document.getElementById('selector-' + id);
    if (dropdown) dropdown.classList.toggle('abierto');
}

// Cierra el dropdown
function cerrarSelector(id) {
    const dropdown = document.getElementById('selector-' + id);
    if (dropdown) dropdown.classList.remove('abierto');
}

// Al elegir una opción: actualiza precio, botón y guarda la selección
function elegirPresentacion(id, peso, precio) {
    // Guardar selección
    presentacionSeleccionada[id] = { peso, precio };

    // Actualizar precio en tarjeta
    const precioEl = document.getElementById('precio-' + id);
    if (precioEl) {
        precioEl.querySelector('.precio-val').textContent = 'USD $' + precio;
        precioEl.querySelector('.precio-peso').textContent = '/ ' + peso;
    }

    // Actualizar texto del botón presentación con el peso elegido
    const btn = document.getElementById('btn-' + id);
    if (btn) {
        btn.querySelectorAll('span[data-es], span[data-en]').forEach(span => {
            span.textContent = peso;
        });
    }

    // Marcar opción seleccionada visualmente
    document.querySelectorAll('#selector-' + id + ' .selector-opcion').forEach(op => {
        op.classList.remove('seleccionado');
    });
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('seleccionado');
    }

    setTimeout(() => cerrarSelector(id), 200);
}

// Cerrar dropdown al hacer clic fuera de la tarjeta
document.addEventListener('click', function (e) {
    if (!e.target.closest('.producto-card')) {
        document.querySelectorAll('.selector-dropdown.abierto').forEach(el => {
            el.classList.remove('abierto');
        });
    }
});

// ── CARRITO ──
let carrito = [];

function toggleCarrito() {
    const panel = document.getElementById('cartPanel');
    const overlay = document.getElementById('cartOverlay');
    panel.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = panel.classList.contains('active') ? 'hidden' : '';
}

function agregarAlCarrito(id, nombre, tipo) {
    const sel = presentacionSeleccionada[id];
    const precioEl = document.getElementById('precio-' + id);
    let peso, precio;

    if (sel) {
        peso = sel.peso;
        precio = sel.precio;
    } else if (precioEl) {
        // Leer el precio actual del elemento si no se eligió presentación
        const valText = precioEl.querySelector('.precio-val').textContent;
        const pesoText = precioEl.querySelector('.precio-peso').textContent;
        precio = parseFloat(valText.replace(/[^0-9.]/g, '')) || 0;
        peso = pesoText.replace('/', '').trim();
    } else {
        peso = '250g';
        precio = 0;
    }

    // Buscar si ya existe el mismo producto con la misma presentación
    const itemKey = id + '-' + peso;
    const existente = carrito.find(i => i.key === itemKey);
    if (existente) {
        existente.qty += 1;
    } else {
        carrito.push({ key: itemKey, id, nombre, tipo, peso, precio, qty: 1 });
    }

    actualizarCarrito();
    mostrarToast(nombre + ' – ' + peso);
}

function cambiarCantidad(key, delta) {
    const item = carrito.find(i => i.key === key);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) carrito = carrito.filter(i => i.key !== key);
    actualizarCarrito();
}

function eliminarItem(key) {
    carrito = carrito.filter(i => i.key !== key);
    actualizarCarrito();
}

function vaciarCarrito() {
    carrito = [];
    actualizarCarrito();
}

function actualizarCarrito() {
    const badge = document.getElementById('cartBadge');
    const itemsEl = document.getElementById('cartItems');
    const emptyEl = document.getElementById('cartEmpty');
    const footer = document.getElementById('cartFooter');
    const totalEl = document.getElementById('cartTotal');

    const totalItems = carrito.reduce((s, i) => s + i.qty, 0);
    const totalPrecio = carrito.reduce((s, i) => s + i.precio * i.qty, 0);

    // Badge — sincronizar los tres
    const badgeIds = ['cartBadge', 'cartBadgeMobile', 'cartBadgeMenu'];
    badgeIds.forEach(bid => {
        const b = document.getElementById(bid);
        if (b) {
            b.textContent = totalItems;
            b.classList.toggle('visible', totalItems > 0);
        }
    });

    // Items
    if (carrito.length === 0) {
        emptyEl.style.display = 'block';
        footer.style.display = 'none';
        // Limpiar items extra
        itemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());
    } else {
        emptyEl.style.display = 'none';
        footer.style.display = 'block';
        totalEl.textContent = 'USD $' + totalPrecio.toFixed(0);

        // Re-renderizar todos los items
        itemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());
        carrito.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-icon">☕</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.nombre}</div>
                    <div class="cart-item-meta">${item.tipo} · ${item.peso}</div>
                    <div class="cart-item-actions">
                        <button class="cart-qty-btn" onclick="cambiarCantidad('${item.key}', -1)">−</button>
                        <span class="cart-qty-val">${item.qty}</span>
                        <button class="cart-qty-btn" onclick="cambiarCantidad('${item.key}', 1)">+</button>
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
                    <span class="cart-item-price">USD $${(item.precio * item.qty).toFixed(0)}</span>
                    <button class="cart-item-remove" onclick="eliminarItem('${item.key}')">✕</button>
                </div>`;
            itemsEl.appendChild(div);
        });
    }
}

function mostrarToast(msg) {
    const isEn = document.body.classList.contains('lang-en');
    const toast = document.getElementById('cartToast');
    toast.textContent = (isEn ? '✓ Added: ' : '✓ Agregado: ') + msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
}

function checkout() {
    if (carrito.length === 0) return;
    const isEn = document.body.classList.contains('lang-en');
    let msg = isEn ? 'Hello, I want to order:\n' : 'Hola, quiero pedir:\n';
    carrito.forEach(i => {
        msg += `• ${i.tipo} ${i.nombre} – ${i.peso} x${i.qty} = USD $${(i.precio * i.qty).toFixed(0)}\n`;
    });
    const total = carrito.reduce((s, i) => s + i.precio * i.qty, 0);
    msg += (isEn ? '\nTotal: USD $' : '\nTotal: USD $') + total.toFixed(0);
    window.open('https://wa.me/573000000000?text=' + encodeURIComponent(msg), '_blank');
}

// ── FINCAS IOT ──
const chartInstances = {};

async function toggleFinca(button, fincaId) {
    const card = button.closest('.finca-card');
    const panel = card.querySelector('.finca-data');
    panel.classList.toggle('active');

    // Si el panel se cerró, no hacer nada más
    if (!panel.classList.contains('active')) return;

    // Si ya se cargaron las gráficas para esta finca, no volver a crearlas
    if (chartInstances[`loaded_${fincaId}`]) return;

    try {
        const response = await fetch(`http://192.168.1.5:8000/fermentacion/public/${fincaId}`);
        const datos = await response.json();
        const ultimo = datos[0];

        card.querySelector('.ph').innerText  = ultimo.ph;
        card.querySelector('.brix').innerText = ultimo.brix;
        card.querySelector('.temp').innerText = ultimo.temperatura + '°C';
        card.querySelector('.obs').innerText  = ultimo.observacion || '-';

        const graficaResponse = await fetch(`http://192.168.1.5:8000/fermentacion/public/grafica/${fincaId}`);
        const historial = await graficaResponse.json();

        const labels   = historial.map(d => d.fecha);
        const phData   = historial.map(d => d.ph);
        const tempData = historial.map(d => d.temperatura);
        const brixData = historial.map(d => d.brix);

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true } },
            scales: { x: { ticks: { maxTicksLimit: 8 } } }
        };

        const tempCanvas = document.getElementById(`temp-chart-${fincaId}`);
        const phCanvas   = document.getElementById(`ph-chart-${fincaId}`);
        const brixCanvas = document.getElementById(`brix-chart-${fincaId}`);

        if (tempCanvas && phCanvas && brixCanvas) {
            chartInstances[`temp_${fincaId}`] = new Chart(tempCanvas, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Temperatura (°C)',
                        data: tempData,
                        borderColor: '#c9a84c',
                        backgroundColor: 'rgba(201,168,76,0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: chartOptions
            });

            chartInstances[`ph_${fincaId}`] = new Chart(phCanvas, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'pH',
                        data: phData,
                        borderColor: '#2d5a3f',
                        backgroundColor: 'rgba(45,90,63,0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: chartOptions
            });

            chartInstances[`brix_${fincaId}`] = new Chart(brixCanvas, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Brix',
                        data: brixData,
                        borderColor: '#4a8c62',
                        backgroundColor: 'rgba(74,140,98,0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: chartOptions
            });

            chartInstances[`loaded_${fincaId}`] = true;
        }
    } catch (error) {
        console.log('Error cargando datos IoT:', error);
    }
}

// ── CARGAR FINCAS ALIADAS ──
async function cargarFincas() {
    try {
        const response = await fetch('http://192.168.1.5:8000/fincas/public');
        const fincas = await response.json();
        const container = document.getElementById('fincas-container');
        container.innerHTML = '';

        fincas.forEach(finca => {
            let imagen = 'imagenes/finca-default.jpg';
            if (finca.foto) {
                imagen = 'http://192.168.1.5:8000/' + finca.foto.replace(/\\/g, '/');
            }
            container.innerHTML += `
            <div class="finca-card">
                <img src="${imagen}" alt="${finca.nombre}">
                <div class="iot-status">● IoT Activo</div>
                <div class="finca-card-content">
                    <h3>${finca.nombre}</h3>
                    <p>📍 ${finca.ubicacion}</p>
                    <p>🌱 ${finca.descripcion}</p>
                    <button class="finca-btn" onclick="toggleFinca(this, ${finca.id})">
                        Ver monitoreo
                    </button>
                    <div class="finca-data">
                        <div class="dashboard-header">
                            <h4>📡 Monitoreo IoT</h4>
                            <div class="iot-online">● Sistema en línea</div>
                        </div>
                        <div class="iot-grid">
                            <div class="dato-card"><span>pH</span><strong class="ph">--</strong></div>
                            <div class="dato-card"><span>Brix</span><strong class="brix">--</strong></div>
                            <div class="dato-card"><span>Temperatura</span><strong class="temp">--</strong></div>
                            <div class="dato-card"><span>Observación</span><strong class="obs">--</strong></div>
                        </div>
                        <div class="charts-container">
                            <div class="chart-box">
                                <h5>🌡️ Temperatura</h5>
                                <div class="chart-canvas-wrapper">
                                    <canvas id="temp-chart-${finca.id}"></canvas>
                                </div>
                            </div>
                            <div class="chart-box">
                                <h5>⚗️ pH</h5>
                                <div class="chart-canvas-wrapper">
                                    <canvas id="ph-chart-${finca.id}"></canvas>
                                </div>
                            </div>
                            <div class="chart-box">
                                <h5>☕ Brix</h5>
                                <div class="chart-canvas-wrapper">
                                    <canvas id="brix-chart-${finca.id}"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        });
    } catch (error) {
        console.error('Error cargando fincas:', error);
    }
}

cargarFincas();

// ── LOGIN JWT ──
let token = null;

async function loginAPI() {
    try {
        const response = await fetch('http://192.168.1.5:8000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'username=admin&password=123456'
        });
        const data = await response.json();
        token = data.access_token;
        console.log('JWT conectado');
    } catch (error) {
        console.error('Error login:', error);
    }
}

loginAPI();