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

function configureSnipcartProduct(card) {
  const button = card.querySelector('.quick-add');
  const activeOption = card.querySelector('.art-option.active');

  if (!button || !activeOption) return;

  const kind = activeOption.dataset.kind;
  const sizePicker = card.querySelector('.print-size');
  const sizeSelect = sizePicker ? sizePicker.querySelector('select') : null;
  const selectedSizeText = sizeSelect && sizeSelect.selectedIndex >= 0 ? sizeSelect.options[sizeSelect.selectedIndex].textContent.trim() : '';
  const price = kind === 'original' ? Number(card.dataset.priceOriginal || 0) : Number(sizeSelect ? sizeSelect.value : 0);
  const pageUrl = new URL(window.location.href.split('#')[0]);
  const imageUrl = card.dataset.image ? new URL(card.dataset.image, pageUrl.href).href : pageUrl.href;
  const productTitle = card.dataset.title || card.querySelector('h3')?.textContent || 'Artwork';
  const stableItemId = button.dataset.itemId || `art-${String(card.dataset.id).padStart(3, '0')}`;

  button.type = 'button';
  button.classList.add('snipcart-add-item');
  button.dataset.itemId = stableItemId;
  button.dataset.itemPrice = String(price);
  button.dataset.itemUrl = pageUrl.href;
  button.dataset.itemDescription = kind === 'original' ? 'Original artwork' : `Archival print - ${selectedSizeText}`;
  button.dataset.itemImage = imageUrl;
  button.dataset.itemName = button.dataset.itemName || productTitle;
  button.dataset.itemQuantity = '1';
  button.dataset.itemShippable = 'true';
}

artCards.forEach(configureSnipcartProduct);

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
    configureSnipcartProduct(card);
  });
});

document.querySelectorAll('.print-size select').forEach((select) => {
  select.addEventListener('change', () => {
    const card = select.closest('.art-card');
    if (card.querySelector('.art-option.active').dataset.kind === 'print') {
      card.querySelector('.art-meta strong').textContent = money(Number(select.value));
      configureSnipcartProduct(card);
    }
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

