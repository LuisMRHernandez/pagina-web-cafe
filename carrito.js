/**
 * carrito.js — Carrito compartido entre index.html y tienda.html
 * Usa localStorage con clave 'kito_cart'
 * Formato único: { key, nombre, tipo, peso, precio, qty }
 */

const CART_KEY = 'kito_cart';

// ── Leer y normalizar desde localStorage ──────────────────────────────────────
function cartLoad() {
    try {
        const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        return raw.map(i => ({
            key:    i.key    || '',
            nombre: i.nombre || i.name  || '',
            tipo:   i.tipo   || i.type  || '',
            peso:   i.peso   || i.size  || '',
            precio: i.precio != null ? Number(i.precio) : (i.price != null ? Number(i.price) : 0),
            qty:    Number(i.qty) || 1
        }));
    } catch (e) { return []; }
}

// ── Guardar en localStorage ───────────────────────────────────────────────────
function cartSave(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
}

// ── Agregar ítem ──────────────────────────────────────────────────────────────
function cartAdd(items, nombre, tipo, peso, precio) {
    const key = [nombre, tipo, peso].join('|').replace(/\s+/g, '-');
    const existing = items.find(i => i.key === key);
    if (existing) {
        existing.qty++;
    } else {
        items.push({ key, nombre, tipo, peso, precio: Number(precio), qty: 1 });
    }
    cartSave(items);
    return items;
}

// ── Cambiar cantidad ──────────────────────────────────────────────────────────
function cartChangeQty(items, key, delta) {
    const item = items.find(i => i.key === key);
    if (!item) return items;
    item.qty += delta;
    if (item.qty <= 0) items = items.filter(i => i.key !== key);
    cartSave(items);
    return items;
}

// ── Eliminar ítem ─────────────────────────────────────────────────────────────
function cartRemove(items, key) {
    items = items.filter(i => i.key !== key);
    cartSave(items);
    return items;
}

// ── Vaciar ────────────────────────────────────────────────────────────────────
function cartClear() {
    cartSave([]);
    return [];
}

// ── Renderizar panel lateral ──────────────────────────────────────────────────
function cartRender(items, opts) {
    // opts: { badgeIds, itemsId, emptyId, footerId, totalId }
    const totalQty   = items.reduce((s, i) => s + i.qty, 0);
    const totalPrice = items.reduce((s, i) => s + i.precio * i.qty, 0);

    // Badges
    (opts.badgeIds || ['cartBadge']).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = totalQty;
        el.classList.toggle('visible', totalQty > 0);
    });

    // Items container
    const itemsEl = document.getElementById(opts.itemsId || 'cartItems');
    const emptyEl = document.getElementById(opts.emptyId || 'cartEmpty');
    const footer  = document.getElementById(opts.footerId || 'cartFooter');
    const totalEl = document.getElementById(opts.totalId || 'cartTotal');

    if (!itemsEl) return;
    itemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());

    if (items.length === 0) {
        if (emptyEl) emptyEl.style.display = 'block';
        if (footer)  footer.style.display  = 'none';
    } else {
        if (emptyEl) emptyEl.style.display = 'none';
        if (footer)  footer.style.display  = 'block';
        if (totalEl) totalEl.textContent   = 'USD $' + totalPrice.toFixed(0);

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-icon">☕</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.nombre}</div>
                    <div class="cart-item-meta">${item.tipo} · ${item.peso}</div>
                    <div class="cart-item-actions">
                        <button class="cart-qty-btn" onclick="onCartChangeQty('${item.key}',-1)">−</button>
                        <span class="cart-qty-val">${item.qty}</span>
                        <button class="cart-qty-btn" onclick="onCartChangeQty('${item.key}',1)">+</button>
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
                    <span class="cart-item-price">USD $${(item.precio * item.qty).toFixed(0)}</span>
                    <button class="cart-item-remove" onclick="onCartRemove('${item.key}')">✕</button>
                </div>`;
            itemsEl.appendChild(div);
        });
    }
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function cartToast(msg) {
    const el = document.getElementById('cartToast');
    if (!el) return;
    el.textContent = '✓ ' + msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2800);
}

// ── Checkout WhatsApp ─────────────────────────────────────────────────────────
function cartCheckout(items, phone) {
    if (!items.length) return;
    let msg = 'Hola, quiero pedir:\n';
    items.forEach(i => {
        msg += `• ${i.tipo} ${i.nombre} – ${i.peso} x${i.qty} = USD $${(i.precio*i.qty).toFixed(0)}\n`;
    });
    msg += '\nTotal: USD $' + items.reduce((s,i) => s + i.precio*i.qty, 0).toFixed(0);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}