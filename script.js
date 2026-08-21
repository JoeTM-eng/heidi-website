const cart = [];
const drawer = document.querySelector('#cart-drawer');
const overlay = document.querySelector('#drawer-overlay');
const cartItems = document.querySelector('#cart-items');
const cartCount = document.querySelector('#cart-count');
const drawerCount = document.querySelector('#drawer-count');
const cartTotal = document.querySelector('#cart-total');
const artCards = document.querySelectorAll('.art-card');
artCards.forEach((card) => { card.dataset.collection = card.dataset.collection || 'dreams'; });
const artworkNames = { '1': 'dusk', '2': 'dawn', '3': 'a dream', '4': 'april in bloom', '5': 'animal friends' };
artCards.forEach((card) => {
  const name = artworkNames[card.dataset.id];
  if (!name) return;
  card.dataset.title = name;
  card.querySelector('.art-meta h3').textContent = name;
  const kind = card.querySelector('.art-option.active').dataset.kind;
  card.querySelector('.quick-add').setAttribute('aria-label', `Add ${name} ${kind} to bag`);
});
artCards.forEach((card) => {
  if (card.dataset.collection !== 'still-life') return;
  card.dataset.priceOriginal = '30';
  card.querySelector('.art-meta strong').textContent = '£30';
  card.querySelector('.art-option[data-kind="original"] span').textContent = '£30';
  card.querySelector('.print-size select option').value = '9';
  card.querySelector('.print-size select option').textContent = '10 cm x 10 cm · £9';
});

lucide.createIcons();

function money(value) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value);
}

function updateCart() {
  const count = cart.length;
  cartCount.textContent = count;
  drawerCount.textContent = count;
  cartTotal.textContent = money(cart.reduce((total, item) => total + item.price, 0));

  if (!count) {
    cartItems.innerHTML = '<div class="empty-cart"><i data-lucide="shopping-bag"></i><p>Your bag is waiting for something beautiful.</p><a href="#collection" id="browse-work">Browse the work</a></div>';
    lucide.createIcons();
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}" />
      <div class="cart-item-info"><h3>${item.title}</h3><p>${item.type === 'original' ? 'Original artwork' : `Print · ${item.size}`}</p><strong>${money(item.price)}</strong></div>
      <button class="remove-item" data-index="${index}" aria-label="Remove ${item.title}">Remove</button>
    </div>`).join('');

  document.querySelectorAll('.remove-item').forEach((button) => {
    button.addEventListener('click', () => {
      cart.splice(Number(button.dataset.index), 1);
      updateCart();
    });
  });
}

function setDrawer(open) {
  drawer.classList.toggle('open', open);
  overlay.classList.toggle('open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
}

document.querySelector('#open-cart').addEventListener('click', () => setDrawer(true));
document.querySelector('#close-cart').addEventListener('click', () => setDrawer(false));
overlay.addEventListener('click', () => setDrawer(false));

document.querySelectorAll('.quick-add').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.art-card');
    const kind = card.querySelector('.art-option.active').dataset.kind;
    const sizeSelect = card.querySelector('.print-size select');
    const item = { title: card.dataset.title, price: kind === 'original' ? Number(card.dataset.priceOriginal) : Number(sizeSelect.value), image: card.dataset.image, type: kind, size: kind === 'print' ? sizeSelect.options[sizeSelect.selectedIndex].text : '' };
    if (!cart.some((cartItem) => cartItem.title === item.title)) cart.push(item);
    updateCart();
    setDrawer(true);
  });
});

document.querySelectorAll('.art-option').forEach((option) => {
  option.addEventListener('click', () => {
    if (option.disabled) return;
    const card = option.closest('.art-card');
    const kind = option.dataset.kind;
    const sizePicker = card.querySelector('.print-size');
    const sizeSelect = sizePicker.querySelector('select');
    card.querySelector('.art-option.active').classList.remove('active');
    option.classList.add('active');
    sizePicker.classList.toggle('visible', kind === 'print');
    card.querySelector('.art-meta strong').textContent = money(kind === 'original' ? Number(card.dataset.priceOriginal) : Number(sizeSelect.value));
    card.querySelector('.availability').textContent = kind === 'original' ? 'Original · 1 of 1' : 'Print · Open edition';
    card.querySelector('.quick-add').setAttribute('aria-label', `Add ${card.dataset.title} ${kind} to bag`);
  });
});

document.querySelectorAll('.print-size select').forEach((select) => {
  select.addEventListener('change', () => {
    const card = select.closest('.art-card');
    if (card.querySelector('.art-option.active').dataset.kind === 'print') card.querySelector('.art-meta strong').textContent = money(Number(select.value));
  });
});

const collectionTabs = document.querySelectorAll('.collection-tab');
const collectionPanels = document.querySelectorAll('[role="tabpanel"]');
const itemCount = document.querySelector('#item-count');

collectionTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const collection = tab.dataset.collection;
    const visibleCards = [...artCards].filter((card) => card.dataset.collection === collection);
    collectionTabs.forEach((collectionTab) => {
      const isActive = collectionTab === tab;
      collectionTab.classList.toggle('active', isActive);
      collectionTab.setAttribute('aria-selected', String(isActive));
    });
    artCards.forEach((card) => { card.hidden = card.dataset.collection !== collection; });
    collectionPanels.forEach((panel) => { panel.hidden = panel.id !== `collection-${collection}`; });
    itemCount.textContent = visibleCards.length;
  });
});

document.querySelector('#newsletter-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.querySelector('#email').value.trim();
  const subject = encodeURIComponent('New newsletter signup');
  const body = encodeURIComponent(`Please add ${email} to the newsletter list.`);
  window.location.href = `mailto:artbyheidijoy@gmail.com?subject=${subject}&body=${body}`;
  document.querySelector('#form-message').textContent = 'Your email app is opening to complete your signup.';
  event.target.reset();
});

document.querySelector('#checkout').addEventListener('click', () => {
  if (cart.length) alert('Checkout is ready to connect to your payment provider.');
});
