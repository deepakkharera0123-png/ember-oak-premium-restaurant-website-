document.addEventListener('DOMContentLoaded', () => {

  // ==================== 1. MOBILE NAV DRAWER ====================
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  // ==================== 2. MENU CATEGORY FILTER ====================
  const filterButtons = document.querySelectorAll('.menu-buttons');
  const menuDishes = document.querySelectorAll('.menu-dish');

  if (filterButtons.length > 0 && menuDishes.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const selectedCategory = button.getAttribute('data-category');

        menuDishes.forEach(dish => {
          const dishCategory = dish.getAttribute('data-category');
          if (selectedCategory === 'all' || dishCategory === selectedCategory) {
            dish.style.display = 'flex';
          } else {
            dish.style.display = 'none';
          }
        });
      });
    });
  }

  // ==================== 3. CART SYSTEM ENGINE ====================
  const cart = {};

  const headerCartBadge = document.getElementById('header-cart-badge');
  const floatingCartPill = document.getElementById('floating-cart-pill');
  const pillCountBadge = document.getElementById('pill-count-badge');
  const pillTotalText = document.getElementById('pill-total-text');
  const navCartTrigger = document.getElementById('nav-cart-trigger');

  const cartDrawer = document.getElementById('cart-drawer');
  const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  const cartDrawerClose = document.getElementById('cart-drawer-close');
  const cartItemsBody = document.getElementById('cart-items-body');
  const drawerTotalPrice = document.getElementById('drawer-total-price');
  const drawerCheckoutForm = document.getElementById('drawer-checkout-form');

  const orderSuccessModal = document.getElementById('order-success-modal');
  const btnCloseReceipt = document.getElementById('btn-close-receipt');
  const receiptOrderId = document.getElementById('receipt-order-id');
  const receiptSummaryBox = document.getElementById('receipt-summary-box');

  function openCartDrawer() {
    if (cartDrawer && cartDrawerOverlay) {
      cartDrawer.classList.add('active');
      cartDrawerOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCartDrawer() {
    if (cartDrawer && cartDrawerOverlay) {
      cartDrawer.classList.remove('active');
      cartDrawerOverlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }

  if (navCartTrigger) navCartTrigger.addEventListener('click', openCartDrawer);
  if (floatingCartPill) floatingCartPill.addEventListener('click', openCartDrawer);
  if (cartDrawerClose) cartDrawerClose.addEventListener('click', closeCartDrawer);
  if (cartDrawerOverlay) cartDrawerOverlay.addEventListener('click', closeCartDrawer);

  function updateCartState() {
    let totalItems = 0;
    let totalPrice = 0;

    for (const id in cart) {
      if (cart[id].qty > 0) {
        totalItems += cart[id].qty;
        totalPrice += cart[id].qty * cart[id].price;
      } else {
        delete cart[id];
      }
    }

    if (headerCartBadge) headerCartBadge.textContent = totalItems;
    if (pillCountBadge) pillCountBadge.textContent = `${totalItems} item${totalItems === 1 ? '' : 's'}`;
    if (pillTotalText) pillTotalText.textContent = `₹${totalPrice}`;

    if (totalItems > 0 && floatingCartPill) {
      floatingCartPill.classList.add('active');
    } else if (floatingCartPill) {
      floatingCartPill.classList.remove('active');
    }

    if (drawerTotalPrice) drawerTotalPrice.textContent = `₹${totalPrice}`;

    renderDrawerItems(totalItems);
  }

  function renderDrawerItems(totalItems) {
    if (!cartItemsBody) return;
    cartItemsBody.innerHTML = '';

    if (totalItems === 0) {
      cartItemsBody.innerHTML = `
        <div class="empty-cart-msg">
          <p>Your order tray is currently empty.</p>
          <small>Add dishes from the menu to build your feast!</small>
        </div>
      `;
      return;
    }

    for (const id in cart) {
      const item = cart[id];
      const row = document.createElement('div');
      row.className = 'drawer-item-row';
      row.innerHTML = `
        <div class="drawer-item-info">
          <strong>${item.name}</strong>
          <span>₹${item.price * item.qty} (₹${item.price} each)</span>
        </div>
        <div class="stepper-controls">
          <button type="button" class="btn-step btn-minus" data-id="${id}" aria-label="Decrease quantity">-</button>
          <span style="font-weight: 700; font-size: 0.9rem;">${item.qty}</span>
          <button type="button" class="btn-step btn-plus" data-id="${id}" aria-label="Increase quantity">+</button>
        </div>
      `;
      cartItemsBody.appendChild(row);
    }

    cartItemsBody.querySelectorAll('.btn-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        cart[id].qty++;
        updateCartState();
      });
    });

    cartItemsBody.querySelectorAll('.btn-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        cart[id].qty--;
        updateCartState();
      });
    });
  }

  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = parseInt(btn.getAttribute('data-price'), 10);

      if (!cart[id]) {
        cart[id] = { name, price, qty: 1 };
      } else {
        cart[id].qty++;
      }

      updateCartState();
    });
  });

  // ==================== 4. DIRECT IN-APP ORDER PLACEMENT ====================
  if (drawerCheckoutForm) {
    drawerCheckoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let orderLines = [];
      let grandTotal = 0;
      let count = 0;

      for (const id in cart) {
        const item = cart[id];
        const lineTotal = item.qty * item.price;
        grandTotal += lineTotal;
        count += item.qty;
        orderLines.push(`
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span>${item.qty}x ${item.name}</span>
            <strong>₹${lineTotal}</strong>
          </div>
        `);
      }

      if (count === 0) {
        alert('Please add at least 1 dish to your tray first.');
        return;
      }

      const randomId = 'EO-' + Math.floor(1000 + Math.random() * 9000);
      if (receiptOrderId) receiptOrderId.textContent = `Order #${randomId}`;

      if (receiptSummaryBox) {
        receiptSummaryBox.innerHTML = `
          ${orderLines.join('')}
          <hr style="border:0; border-top:1px dashed var(--border-color); margin:8px 0;">
          <div style="display:flex; justify-content:space-between; font-weight:800;">
            <span>Total Bill:</span>
            <span style="color:var(--accent);">₹${grandTotal}</span>
          </div>
        `;
      }

      closeCartDrawer();
      if (orderSuccessModal) orderSuccessModal.classList.add('active');

      for (const key in cart) delete cart[key];
      updateCartState();
      drawerCheckoutForm.reset();
    });
  }

  if (btnCloseReceipt && orderSuccessModal) {
    btnCloseReceipt.addEventListener('click', () => {
      orderSuccessModal.classList.remove('active');
    });
  }

  // ==================== 5. TABLE RESERVATION SUBMISSION ====================
  const tableResForm = document.getElementById('table-reservation-form');
  const resSuccessModal = document.getElementById('reservation-success-modal');
  const btnCloseResModal = document.getElementById('btn-close-res-modal');
  const resBookingId = document.getElementById('res-booking-id');
  const resSummaryBox = document.getElementById('res-summary-box');

  if (tableResForm) {
    tableResForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('res-name')?.value.trim() || 'Guest';
      const phone = document.getElementById('res-phone')?.value.trim() || 'N/A';
      const date = document.getElementById('res-date')?.value || 'N/A';
      const time = document.getElementById('res-time')?.value || 'N/A';
      const guests = document.getElementById('res-guests')?.value || '2 Guests';
      const notes = document.getElementById('res-notes')?.value.trim() || 'None';

      const randomResId = 'EO-RES-' + Math.floor(100 + Math.random() * 900);
      if (resBookingId) resBookingId.textContent = `Booking #${randomResId}`;

      if (resSummaryBox) {
        resSummaryBox.innerHTML = `
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span>Guest Name:</span>
            <strong>${name}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span>Date & Time:</span>
            <strong>${date} at ${time}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span>Party Size:</span>
            <strong>${guests}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span>Contact:</span>
            <strong>${phone}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:4px;">
            <span>Requests:</span>
            <span>${notes}</span>
          </div>
        `;
      }

      if (resSuccessModal) resSuccessModal.classList.add('active');
      tableResForm.reset();
    });
  }

  if (btnCloseResModal && resSuccessModal) {
    btnCloseResModal.addEventListener('click', () => {
      resSuccessModal.classList.remove('active');
    });
  }

});