/**
 * Rozana Fashion - Porto Modest Store Engine
 * Version 1.0.0
 */

let rozanaStoreData = null;
let rozanaCart = {};
let rozanaWishlist = [];

// 1. DATA INITIALIZATION
function loadRozanaStoreData() {
    try {
        const local = localStorage.getItem('rozana_store_data');
        if (local) {
            rozanaStoreData = JSON.parse(local);
        }
    } catch(e) {
        console.error('Error reading rozana_store_data from localStorage:', e);
    }

    // Load Cart
    try {
        const savedCart = localStorage.getItem('rozana_cart');
        if (savedCart) rozanaCart = JSON.parse(savedCart);
    } catch(e) {}

    // Load Wishlist
    try {
        const savedWish = localStorage.getItem('rozana_wishlist');
        if (savedWish) rozanaWishlist = JSON.parse(savedWish);
    } catch(e) {}
}

function saveRozanaCart() {
    try {
        localStorage.setItem('rozana_cart', JSON.stringify(rozanaCart));
    } catch(e) {}
}

function saveRozanaWishlist() {
    try {
        localStorage.setItem('rozana_wishlist', JSON.stringify(rozanaWishlist));
    } catch(e) {}
}

// 2. CART DRAWER OPERATIONS
function openCartDrawer() {
    const drawer = document.getElementById('cartSlideDrawer');
    const overlay = document.getElementById('drawerOverlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
    const drawer = document.getElementById('cartSlideDrawer');
    const overlay = document.getElementById('drawerOverlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function openMobileDrawer() {
    const drawer = document.getElementById('mobileNavDrawer');
    const overlay = document.getElementById('drawerOverlay');
    if (drawer) {
        drawer.style.transform = 'translateX(0)';
        drawer.classList.add('open');
    }
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileDrawer() {
    const drawer = document.getElementById('mobileNavDrawer');
    const overlay = document.getElementById('drawerOverlay');
    if (drawer) {
        drawer.style.transform = 'translateX(100%)';
        drawer.classList.remove('open');
    }
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function closeAllDrawers() {
    closeCartDrawer();
    closeMobileDrawer();
    closeQuickView();
}

function addToRozanaCart(id, name, price, img, size = '54', color = 'الافتراضي') {
    const itemKey = id + '_' + size;
    if (rozanaCart[itemKey]) {
        rozanaCart[itemKey].qty += 1;
    } else {
        rozanaCart[itemKey] = {
            id: id,
            name: name,
            price: parseFloat(price),
            img: img,
            size: size,
            color: color,
            qty: 1
        };
    }
    saveRozanaCart();
    updateRozanaCartUI();
    showToast(`تمت إضافة "${name}" إلى حقيبة المشتريات`);
    openCartDrawer();
}

function removeRozanaCartItem(itemKey) {
    if (rozanaCart[itemKey]) {
        delete rozanaCart[itemKey];
        saveRozanaCart();
        updateRozanaCartUI();
        showToast('تم حذف القطعة من حقيبة المشتريات');
    }
}

function changeRozanaCartQty(itemKey, delta) {
    if (rozanaCart[itemKey]) {
        rozanaCart[itemKey].qty += delta;
        if (rozanaCart[itemKey].qty <= 0) {
            delete rozanaCart[itemKey];
        }
        saveRozanaCart();
        updateRozanaCartUI();
    }
}

function updateRozanaCartUI() {
    let total = 0;
    let count = 0;
    const list = document.getElementById('drawerCartList');

    if (list) {
        list.innerHTML = '';
        const keys = Object.keys(rozanaCart);

        if (keys.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 48px 15px; color: #777;">
                    <i class="fa-solid fa-bag-shopping" style="font-size: 46px; margin-bottom: 14px; color: #D5DCE2;"></i>
                    <p style="font-size: 16px; font-weight: 700; color: #222529;">حقيبة المشتريات فارغة حالياً</p>
                    <p style="font-size: 13px; color: #888; margin-top: 6px;">تصفحي مجموعتنا الفاخرة وأضيفي لمستكِ المفضلة</p>
                    <a href="shop.html" class="btn" style="display:inline-block; margin-top:16px; background:#0088CC; color:#fff; padding:9px 24px; border-radius:4px; font-weight:700; font-size:13px;">تصفحي المتجر الآن</a>
                </div>
            `;
        } else {
            keys.forEach(k => {
                const item = rozanaCart[k];
                const itemTotal = item.price * item.qty;
                total += itemTotal;
                count += item.qty;

                const card = document.createElement('div');
                card.className = 'cart-item-card';
                card.style.cssText = 'display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid #ECECEC;';
                card.innerHTML = `
                    <img src="${item.img}" alt="${item.name}" style="width:58px; height:68px; object-fit:cover; border-radius:4px; border:1px solid #E5E5E5;">
                    <div style="flex:1;">
                        <div style="font-weight:700; font-size:13.5px; color:#222529; line-height:1.4; margin-bottom:4px;">${item.name}</div>
                        <div style="font-size:12px; color:#666; margin-bottom:4px;">
                            ${item.size ? `<span style="background:#F2F4F7; padding:2px 6px; border-radius:3px; margin-left:6px;">المقاس: ${item.size}</span>` : ''}
                        </div>
                        <div style="display:flex; align-items:center; justify-content:space-between;">
                            <span style="font-weight:800; color:#0088CC; font-size:14px;">${item.price.toLocaleString()} ر.س</span>
                            <div style="display:flex; align-items:center; gap:6px; background:#F8F9FA; border:1px solid #DDD; border-radius:4px; padding:2px 6px;">
                                <button onclick="changeRozanaCartQty('${k}', -1)" style="border:none; background:none; cursor:pointer; font-size:12px; font-weight:800; padding:0 4px;">-</button>
                                <span style="font-size:12.5px; font-weight:700; min-width:16px; text-align:center;">${item.qty}</span>
                                <button onclick="changeRozanaCartQty('${k}', 1)" style="border:none; background:none; cursor:pointer; font-size:12px; font-weight:800; padding:0 4px;">+</button>
                            </div>
                        </div>
                    </div>
                    <button onclick="removeRozanaCartItem('${k}')" style="background:none; border:none; color:#C53030; cursor:pointer; padding:6px; font-size:14px;" title="حذف">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;
                list.appendChild(card);
            });
        }
    } else {
        // Calculate total and count even if drawer is not present
        Object.keys(rozanaCart).forEach(k => {
            const item = rozanaCart[k];
            total += (item.price * item.qty);
            count += item.qty;
        });
    }

    // Update badges
    const countBadge = document.getElementById('cartCountBadge');
    const mobBadge = document.getElementById('mobCartCount');
    const drawerCount = document.getElementById('drawerItemsCount');
    const headerTotal = document.getElementById('headerCartTotal');
    const drawerTotal = document.getElementById('drawerSubtotal');

    if (countBadge) countBadge.textContent = count;
    if (mobBadge) mobBadge.textContent = count;
    if (drawerCount) drawerCount.textContent = count;
    if (headerTotal) headerTotal.textContent = total.toLocaleString() + ' ر.س';
    if (drawerTotal) drawerTotal.textContent = total.toLocaleString() + ' ر.س';
}

// 3. WHATSAPP CHECKOUT
function proceedRozanaWhatsAppCheckout() {
    const keys = Object.keys(rozanaCart);
    if (keys.length === 0) {
        showToast('حقيبة المشتريات فارغة حالياً!');
        return;
    }

    let phone = '201027093535';
    if (rozanaStoreData && rozanaStoreData.storeInfo && rozanaStoreData.storeInfo.whatsappFormatted) {
        phone = rozanaStoreData.storeInfo.whatsappFormatted;
    }

    let msg = `*طلب شراء جديد من متجر روزانا فاشن (Porto Modest)* ✨👘%0a%0a`;
    let total = 0;
    let idx = 1;

    keys.forEach(k => {
        const item = rozanaCart[k];
        const lineTotal = item.price * item.qty;
        total += lineTotal;
        msg += `${idx}. *${item.name}*%0a`;
        msg += `   - الكمية: ${item.qty}%0a`;
        if (item.size) msg += `   - المقاس: ${item.size}%0a`;
        msg += `   - السعر: ${item.price} ر.س (الإجمالي: ${lineTotal} ر.س)%0a%0a`;
        idx++;
    });

    msg += `-----------------------------------%0a`;
    msg += `💰 *إجمالي الطلب:* ${total.toLocaleString()} ر.س%0a`;
    msg += `🚚 *الشحن:* توصيل مجاني للطلبات فوق 299 ر.س%0a%0a`;
    msg += `أرجو تأكيد الطلب وتزويدي ببيانات الشحن والتوصيل. شكراً لكِ!`;

    const waUrl = `https://wa.me/${phone}?text=${msg}`;
    window.open(waUrl, '_blank');
}

// 4. WISHLIST OPERATIONS
function toggleRozanaWishlist(id, name) {
    const index = rozanaWishlist.indexOf(id);
    if (index > -1) {
        rozanaWishlist.splice(index, 1);
        showToast(`تمت إزالة "${name || 'القطعة'}" من قائمة أمنياتك`);
    } else {
        rozanaWishlist.push(id);
        showToast(`تمت إضافة "${name || 'القطعة'}" إلى قائمة أمنياتك ❤️`);
    }
    saveRozanaWishlist();
    updateRozanaWishlistUI();
}

function updateRozanaWishlistUI() {
    const badge = document.getElementById('wishlistBadge');
    const mobBadge = document.getElementById('mobWishlistCount');
    if (badge) badge.textContent = rozanaWishlist.length;
    if (mobBadge) mobBadge.textContent = rozanaWishlist.length;
}

// 5. QUICK VIEW MODAL
function openQuickView(id, name, cat, price, oldPrice, img, desc) {
    const modal = document.getElementById('quickViewModal');
    const overlay = document.getElementById('drawerOverlay');

    if (document.getElementById('modalImg')) document.getElementById('modalImg').src = img;
    if (document.getElementById('modalCat')) document.getElementById('modalCat').textContent = cat || 'أزياء محتشمة';
    if (document.getElementById('modalTitle')) document.getElementById('modalTitle').textContent = name;
    if (document.getElementById('modalPrice')) document.getElementById('modalPrice').textContent = parseFloat(price).toLocaleString() + ' ر.س';
    if (document.getElementById('modalDesc')) document.getElementById('modalDesc').textContent = desc || 'خامات ملكية راقية مصممة بدقة لتضمن لكِ أعلى درجات الراحة والفخامة.';

    const btn = document.getElementById('btnModalAddToCart');
    if (btn) {
        btn.onclick = function() {
            addToRozanaCart(id, name, price, img);
            closeQuickView();
        };
    }

    if (modal) modal.classList.add('active');
    if (overlay) overlay.classList.add('active');
}

function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    const overlay = document.getElementById('drawerOverlay');
    if (modal) modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

// 6. TOAST NOTIFICATIONS
function showToast(msg) {
    let toast = document.getElementById('toastNotify');
    let toastMsg = document.getElementById('toastMsg');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastNotify';
        toast.className = 'toast-notify';
        toast.style.cssText = 'position:fixed; bottom:25px; left:25px; background:#222529; color:#fff; padding:14px 24px; border-radius:8px; font-weight:700; font-size:14px; box-shadow:0 10px 30px rgba(0,0,0,0.3); z-index:999999; display:flex; align-items:center; gap:10px; opacity:0; transform:translateY(20px); transition:all 0.3s ease; pointer-events:none; border-right:4px solid #0088CC;';
        toast.innerHTML = '<i class="fa-solid fa-circle-check" style="color:#0088CC; font-size:18px;"></i> <span id="toastMsg"></span>';
        document.body.appendChild(toast);
        toastMsg = document.getElementById('toastMsg');
    }

    if (toastMsg) toastMsg.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    toast.style.pointerEvents = 'auto';

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.pointerEvents = 'none';
    }, 3200);
}

// 7. NEWSLETTER
function subscribeNewsletter() {
    const input = document.getElementById('newsletterEmail');
    if (input && input.value.trim()) {
        showToast('شكراً لاشتراكك! تم إرسال كود الخصم ROZANA15 إلى بريدك بنجاح.');
        input.value = '';
    } else {
        showToast('يرجى كتابة البريد الإلكتروني بشكل صحيح.');
    }
}

// 8. CATEGORY DROPDOWN TOGGLE
function setupCategoryDropdown() {
    const btn = document.getElementById('catMenuToggleBtn');
    const menu = document.getElementById('catDropdownMenu');
    if (btn && menu) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('open');
        });
        document.addEventListener('click', () => {
            menu.classList.remove('open');
        });
    }
}

// 9. LIVE CMS SYNC FROM LOCALSTORAGE
function applyRozanaLiveCMS() {
    if (!rozanaStoreData) return;
    try {
        const info = rozanaStoreData.storeInfo;
        if (info) {
            // Update phone / whatsapp links
            const topbarMsg = document.querySelector('.topbar-msg span:nth-child(2)');
            if (topbarMsg && info.topbarAnnouncement) topbarMsg.textContent = info.topbarAnnouncement;

            const hotlineEl = document.querySelector('.hotline-number');
            if (hotlineEl && info.hotline) hotlineEl.textContent = info.hotline;
        }

        const pages = rozanaStoreData.pages;
        if (pages && pages.home) {
            const h = pages.home;
            const heroTitle = document.querySelector('.hero-title-main');
            if (heroTitle && h.heroTitle) heroTitle.textContent = h.heroTitle;

            const heroSub = document.querySelector('.hero-brand-script');
            if (heroSub && h.heroSubtitle) heroSub.textContent = h.heroSubtitle;

            const heroPrice = document.querySelector('.hero-red-price-badge .price-big');
            if (heroPrice && h.heroPrice) heroPrice.textContent = h.heroPrice;

            const saleTitle = document.querySelector('.big-sale-text-col h3');
            if (saleTitle && h.saleBannerTitle) saleTitle.textContent = h.saleBannerTitle;
        }
    } catch(e) {
        console.error('Error applying live CMS:', e);
    }
}

// DOM READY
document.addEventListener('DOMContentLoaded', () => {
    loadRozanaStoreData();
    setupCategoryDropdown();
    updateRozanaCartUI();
    updateRozanaWishlistUI();
    applyRozanaLiveCMS();
});
