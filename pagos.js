/**
 * pagos.js — Pago en línea con ePayco (checkout embebido) para Kitupamba
 * Métodos que ofrece ePayco en Colombia: tarjetas, PSE, Nequi, Daviplata, efectivo, etc.
 *
 * CONFIGURACIÓN (obligatoria antes de publicar):
 *  1. Crea tu cuenta en https://epayco.com y copia tu llave PÚBLICA (P_KEY / public key).
 *  2. Pégala en publicKey. Con test:true los pagos son de prueba (no se cobra).
 *  3. Cuando todo funcione, pon test:false.
 *  4. Para producción real configura una URL de confirmación en TU servidor (confirmationUrl):
 *     ePayco la llama server-to-server y ahí debes validar el pago y el monto antes de despachar.
 */

const PAYMENT_CONFIG = {
    publicKey: 'TU_LLAVE_PUBLICA_EPAYCO',
    test: true,
    country: 'co',
    currency: 'cop',
    // Página a la que ePayco regresa al cliente (debe estar en tu mismo dominio, vía https en producción)
    responseUrl: new URL('pago-respuesta.html', window.location.href).href,
    // URL de tu backend que recibe la confirmación de ePayco. Vacía = sin confirmación servidor (solo pruebas).
    confirmationUrl: ''
};

const PENDING_ORDER_KEY = 'kito_pending_order';

// Total del carrito en COP (misma regla de redondeo que se muestra en pantalla)
function cartTotalCOP(cart) {
    const usd = cart.reduce((s, i) => s + i.precio * i.qty, 0);
    return Math.round(usd * COP_RATE / 1000) * 1000;
}

function pagarEnLinea() {
    const cart = cartLoad();
    if (!cart.length) return;

    const en = document.body.classList.contains('lang-en');

    if (typeof ePayco === 'undefined') {
        showToast(en ? 'Payment gateway is loading, try again' : 'La pasarela de pago está cargando, intenta de nuevo');
        return;
    }
    if (!PAYMENT_CONFIG.publicKey || PAYMENT_CONFIG.publicKey.startsWith('TU_')) {
        console.error('pagos.js: configura PAYMENT_CONFIG.publicKey con tu llave pública de ePayco.');
        showToast(en ? 'Online payment not configured yet' : 'El pago en línea aún no está configurado');
        return;
    }

    const total = cartTotalCOP(cart);
    const ref   = 'KTP-' + Date.now();
    const desc  = cart.map(i => `${i.nombre} ${i.peso} x${i.qty}`).join(', ').slice(0, 250);

    // Guardar pedido pendiente para mostrarlo/limpiar el carrito al volver
    try {
        localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify({ ref, total, items: cart, fecha: new Date().toISOString() }));
    } catch (e) { /* no crítico */ }

    const btn = document.getElementById('cartPayBtn');
    if (btn) btn.disabled = true;

    const handler = ePayco.checkout.configure({
        key: PAYMENT_CONFIG.publicKey,
        test: PAYMENT_CONFIG.test
    });

    const data = {
        name: 'Kitupamba – Café Especial',
        description: desc,
        invoice: ref,
        currency: PAYMENT_CONFIG.currency,
        amount: String(total),
        tax_base: String(total),
        tax: '0',
        country: PAYMENT_CONFIG.country,
        lang: en ? 'en' : 'es',
        external: 'false',          // checkout dentro de la página (modal)
        response: PAYMENT_CONFIG.responseUrl
    };
    if (PAYMENT_CONFIG.confirmationUrl) data.confirmation = PAYMENT_CONFIG.confirmationUrl;

    try {
        handler.open(data);
    } catch (e) {
        console.error(e);
        showToast(en ? 'Could not open payment window' : 'No se pudo abrir la ventana de pago');
    } finally {
        // Reactivar el botón por si el cliente cierra la ventana sin pagar
        setTimeout(() => { if (btn) btn.disabled = false; }, 1500);
    }
}