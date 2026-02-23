// The Fruity Custard Carnival - App Logic

// ========== Cart ==========
let cart = [];

function loadCart() {
    const saved = localStorage.getItem('fruityCustardCart');
    if (saved) {
        try {
            cart = JSON.parse(saved);
        } catch (e) {
            cart = [];
        }
    }
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('fruityCustardCart', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(name, price) {
    cart.push({ name, price });
    saveCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price, 0);
}

function updateCartUI() {
    const countEl = document.getElementById('cartCount');
    const itemsEl = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');

    if (countEl) countEl.textContent = cart.length;

    if (itemsEl) {
        itemsEl.innerHTML = cart.length === 0
            ? '<li class="cart-empty">Your cart is empty</li>'
            : cart.map((item, i) => `
                <li class="cart-item">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">$${item.price}</span>
                    <button class="cart-item-remove" data-index="${i}" aria-label="Remove">✕</button>
                </li>
            `).join('');
    }

    if (totalEl) totalEl.textContent = getCartTotal().toFixed(2);
}

function openCart() {
    document.getElementById('cartSidebar').classList.add('open');
    document.getElementById('cartOverlay').classList.add('open');
}

function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
}

// ========== Feedback Form ==========
function handleFeedbackSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('customerName')?.value || '';
    const email = document.getElementById('customerEmail')?.value || '';
    const rating = document.querySelector('input[name="rating"]:checked')?.value || '';
    const feedback = document.getElementById('feedbackText')?.value || '';

    const favorites = Array.from(
        document.querySelectorAll('#checklist input[type="checkbox"]:checked')
    ).map(input => {
        const label = document.querySelector('label[for="' + input.id + '"]');
        return label ? label.textContent.trim() : input.value;
    });

    const payload = { name, email, favorites, rating, feedback };

    // Google Apps Script Web App URL (saves feedback to Google Sheet)
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbxTv7_qCtsM3QCht03IZEkGmkTv1EPptftvAT6MkBugw9BTEZO7xtQ7qZNBr6-wRUeN/exec';

    fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
        .then(res => res.json().catch(() => ({})))
        .then(() => {
            alert('Thank you for your feedback! We appreciate your support.');
            e.target.reset();
        })
        .catch(() => {
            alert('There was a problem saving your feedback. Please try again later.');
        });
}

// ========== Page Loader ==========
function hidePageLoader() {
    const loader = document.getElementById('pageLoader');
    if (loader && !loader.classList.contains('hidden')) {
        loader.classList.add('hidden');
    }
}

// Hide loader after 7 seconds
window.addEventListener('load', () => {
    setTimeout(hidePageLoader, 7000);
});

// Fallback: hide after 7s if load event is slow
setTimeout(hidePageLoader, 7000);

// ========== Image Lightbox for menu cards (mobile) ==========
function openImageLightbox(src, caption) {
    const lightbox = document.getElementById('imageLightbox');
    const img = document.getElementById('lightboxImage');
    const cap = document.getElementById('lightboxCaption');
    if (!lightbox || !img || !cap) return;

    img.src = src;
    img.alt = caption || '';
    cap.textContent = caption || '';

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeImageLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// ========== Mobile Menu ==========
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const menuToggle = document.getElementById('menuToggle');
    if (navLinks && menuToggle) {
        navLinks.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    }
}

function closeMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const menuToggle = document.getElementById('menuToggle');
    if (navLinks && menuToggle) {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
}

// ========== Event Listeners ==========
document.addEventListener('DOMContentLoaded', () => {
    loadCart();

    // Desktop menu toggle
    document.getElementById('menuToggle')?.addEventListener('click', toggleMobileMenu);
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close Uiverse mobile menu when a link is clicked
    document.querySelectorAll('.mobile-menu .menu-list').forEach(link => {
        link.addEventListener('click', () => {
            const inp = document.querySelector('.mobile-menu-inp');
            if (inp) inp.checked = true;
        });
    });

    // Image lightbox for menu cards (mobile only)
    const mobileQuery = window.matchMedia('(max-width: 900px)');

    document.querySelectorAll('.menu-card .card-image').forEach(cardImg => {
        cardImg.addEventListener('click', () => {
            if (!mobileQuery.matches) return;

            const card = cardImg.closest('.menu-card');
            const title = card?.querySelector('h3')?.textContent?.trim() || '';

            let src = '';
            if (cardImg.classList.contains('custom-cake')) {
                src = 'assets/mixed-fruit-custard.png';
            } else if (cardImg.classList.contains('custard')) {
                src = 'assets/strawberry.png';
            } else if (cardImg.classList.contains('macarons')) {
                src = 'assets/chocolate.png';
            } else if (cardImg.classList.contains('cupcakes')) {
                src = 'assets/mixed-fruit.png';
            }

            if (!src) return;
            openImageLightbox(src, title);
        });
    });

    document.getElementById('imageLightbox')?.addEventListener('click', (e) => {
        if (e.target.id === 'imageLightbox') {
            closeImageLightbox();
        }
    });

    document.querySelector('.image-lightbox-close')?.addEventListener('click', closeImageLightbox);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeImageLightbox();
        }
    });

    // Add to cart buttons
    document.querySelectorAll('.btn-add').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);
            addToCart(name, price);
        });
    });

    // Cart
    document.getElementById('cartBtn')?.addEventListener('click', openCart);
    document.getElementById('closeCart')?.addEventListener('click', closeCart);
    document.getElementById('cartOverlay')?.addEventListener('click', closeCart);

    document.getElementById('cartItems')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.cart-item-remove');
        if (btn) {
            const index = parseInt(btn.dataset.index, 10);
            removeFromCart(index);
        }
    });

    document.getElementById('checkoutBtn')?.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty. Add items from the menu!');
            return;
        }
        alert('Checkout flow would open here. Total: $' + getCartTotal().toFixed(2));
    });

    // Feedback form
    document.getElementById('feedbackForm')?.addEventListener('submit', handleFeedbackSubmit);
});
