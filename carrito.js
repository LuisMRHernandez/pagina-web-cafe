/**
 * carrito.js — Carrito compartido (index.html / tienda.html)
 * Usa localStorage con clave 'kito_cart'
 * Formato único: { key, nombre, tipo, peso, precio (COP), qty }
 */

// v2: los precios ahora se guardan en COP (antes USD). Clave nueva para no mezclar carritos viejos.
const CART_KEY = 'kito_cart_v2';

// Número único de WhatsApp (formato internacional, sin "+"). Cámbialo solo aquí.
const WHATSAPP_NUMBER = '573176564364';

// ── Leer y normalizar desde localStorage ──────────────────────────────────────
function cartLoad() {
    try {
        const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        if (!Array.isArray(raw)) return [];
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

// ── Guardar en localStorage (puede fallar en modo privado o con cuota llena) ──
function cartSave(items) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (e) {
        console.warn('No se pudo guardar el carrito:', e.message);
    }
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

// Nota: se eliminaron cartRender() y cartCheckout(). Estaban sin uso (scripts.js
// tiene su propio renderCarrito/checkout) y cartRender insertaba texto sin escapar (XSS).