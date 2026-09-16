// ---------- Storage ----------
const STORAGE_KEY = 'warranty_tracker_items_v1';

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load items', e);
    return [];
  }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

let items = loadItems();
let currentFilter = 'all';

// ---------- Date helpers ----------
function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + Number(days || 0));
  return d;
}

function addMonths(dateStr, months) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + Number(months || 0));
  return d;
}

function daysUntil(date) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ---------- Rendering ----------
function computeDeadlines(item) {
  const deadlines = [];
  if (item.returnDays) {
    const d = addDays(item.purchaseDate, item.returnDays);
    deadlines.push({ type: 'Return window', date: d, daysLeft: daysUntil(d) });
  }
  if (item.warrantyMonths) {
    const d = addMonths(item.purchaseDate, item.warrantyMonths);
    deadlines.push({ type: 'Warranty', date: d, daysLeft: daysUntil(d) });
  }
  return deadlines;
}

function badgeClassFor(daysLeft) {
  if (daysLeft < 0) return 'dim';
  if (daysLeft <= 3) return 'danger';
  if (daysLeft <= 10) return 'warn';
  return 'ok';
}

function badgeLabel(type, daysLeft) {
  if (daysLeft < 0) return `${type} expired`;
  if (daysLeft === 0) return `${type} ends today`;
  return `${type}: ${daysLeft}d left`;
}

function itemMatchesFilter(item, deadlines) {
  if (currentFilter === 'all') return true;
  if (currentFilter === 'returns') return deadlines.some(d => d.type === 'Return window' && d.daysLeft >= 0);
  if (currentFilter === 'warranties') return deadlines.some(d => d.type === 'Warranty' && d.daysLeft >= 0);
  if (currentFilter === 'expired') return deadlines.length > 0 && deadlines.every(d => d.daysLeft < 0);
  return true;
}

function render() {
  const list = document.getElementById('itemList');
  const emptyState = document.getElementById('emptyState');
  list.innerHTML = '';

  // sort by nearest upcoming deadline
  const withDeadlines = items.map(item => {
    const deadlines = computeDeadlines(item);
    const upcoming = deadlines.filter(d => d.daysLeft >= 0).sort((a, b) => a.daysLeft - b.daysLeft);
    const soonest = upcoming[0] ? upcoming[0].daysLeft : Infinity;
    return { item, deadlines, soonest };
  }).filter(entry => itemMatchesFilter(entry.item, entry.deadlines));

  withDeadlines.sort((a, b) => a.soonest - b.soonest);

  if (withDeadlines.length === 0) {
    emptyState.classList.remove('hidden');
    emptyState.textContent = items.length === 0
      ? 'No purchases tracked yet. Tap the + button to add your first item.'
      : 'No items match this filter.';
  } else {
    emptyState.classList.add('hidden');
  }

  withDeadlines.forEach(({ item, deadlines }) => {
    const li = document.createElement('li');
    li.className = 'item-card';
    li.dataset.id = item.id;

    const badges = deadlines.map(d =>
      `<span class="badge ${badgeClassFor(d.daysLeft)}">${badgeLabel(d.type, d.daysLeft)}</span>`
    ).join('');

    li.innerHTML = `
      <div class="item-top">
        <span class="item-name">${escapeHtml(item.name)}</span>
        ${item.price ? `<span class="item-price">$${Number(item.price).toFixed(2)}</span>` : ''}
      </div>
      <div class="item-meta">${escapeHtml(item.retailer || 'Unknown retailer')} · purchased ${formatDate(new Date(item.purchaseDate + 'T00:00:00'))}</div>
      <div class="badge-row">${badges}</div>
    `;

    li.addEventListener('click', () => openForm(item.id));
    list.appendChild(li);
  });

  renderSummary();
}

function renderSummary() {
  let urgent = 0;
  let totalValue = 0;

  items.forEach(item => {
    const deadlines = computeDeadlines(item);
    if (deadlines.some(d => d.daysLeft >= 0 && d.daysLeft <= 3)) urgent++;
    if (item.price) totalValue += Number(item.price);
  });

  document.getElementById('statUrgent').textContent = urgent;
  document.getElementById('statTotal').textContent = items.length;
  document.getElementById('statSaved').textContent = `$${totalValue.toFixed(0)}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Form handling ----------
const overlay = document.getElementById('overlay');
const sheet = document.getElementById('formSheet');
const form = document.getElementById('itemForm');

function openForm(id) {
  form.reset();
  document.getElementById('deleteBtn').classList.add('hidden');
  document.getElementById('formTitle').textContent = 'Add purchase';
  document.getElementById('itemId').value = '';

  if (id) {
    const item = items.find(i => i.id === id);
    if (item) {
      document.getElementById('formTitle').textContent = 'Edit purchase';
      document.getElementById('itemId').value = item.id;
      document.getElementById('itemName').value = item.name;
      document.getElementById('retailer').value = item.retailer || '';
      document.getElementById('price').value = item.price || '';
      document.getElementById('purchaseDate').value = item.purchaseDate;
      document.getElementById('returnDays').value = item.returnDays || '';
      document.getElementById('warrantyMonths').value = item.warrantyMonths || '';
      document.getElementById('notes').value = item.notes || '';
      document.getElementById('deleteBtn').classList.remove('hidden');
    }
  } else {
    document.getElementById('purchaseDate').valueAsDate = new Date();
  }

  overlay.classList.remove('hidden');
  sheet.classList.remove('hidden');
}

function closeForm() {
  overlay.classList.add('hidden');
  sheet.classList.add('hidden');
}

document.getElementById('addBtn').addEventListener('click', () => openForm(null));
document.getElementById('closeForm').addEventListener('click', closeForm);
overlay.addEventListener('click', closeForm);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('itemId').value || String(Date.now());

  const item = {
    id,
    name: document.getElementById('itemName').value.trim(),
    retailer: document.getElementById('retailer').value.trim(),
    price: document.getElementById('price').value,
    purchaseDate: document.getElementById('purchaseDate').value,
    returnDays: document.getElementById('returnDays').value,
    warrantyMonths: document.getElementById('warrantyMonths').value,
    notes: document.getElementById('notes').value.trim(),
  };

  const existingIndex = items.findIndex(i => i.id === id);
  if (existingIndex >= 0) {
    items[existingIndex] = item;
  } else {
    items.push(item);
  }

  saveItems(items);
  scheduleNotificationsFor(item);
  render();
  closeForm();
});

document.getElementById('deleteBtn').addEventListener('click', () => {
  const id = document.getElementById('itemId').value;
  items = items.filter(i => i.id !== id);
  saveItems(items);
  render();
  closeForm();
});

// ---------- Filters ----------
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.filter;
    render();
  });
});

// ---------- Local notifications (native only) ----------
async function requestNotificationPermission() {
  try {
    const { LocalNotifications } = window.Capacitor?.Plugins || {};
    if (!LocalNotifications) return;
    await LocalNotifications.requestPermissions();
  } catch (e) {
    console.warn('Notifications not available', e);
  }
}

async function scheduleNotificationsFor(item) {
  try {
    const { LocalNotifications } = window.Capacitor?.Plugins || {};
    if (!LocalNotifications) return; // running in plain browser, skip

    const deadlines = computeDeadlines(item);
    const notifications = [];

    deadlines.forEach((d, idx) => {
      const reminderDate = new Date(d.date);
      reminderDate.setDate(reminderDate.getDate() - 2); // 2 days before deadline
      if (reminderDate.getTime() > Date.now()) {
        notifications.push({
          id: Number(item.id) % 1000000 + idx,
          title: `${d.type} closing soon`,
          body: `${item.name}: ${d.type.toLowerCase()} ends ${formatDate(d.date)}`,
          schedule: { at: reminderDate },
        });
      }
    });

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch (e) {
    console.warn('Failed to schedule notification', e);
  }
}

// ---------- AdMob banner ----------
const ADMOB_BANNER_ID = 'ca-app-pub-9502060049942116/2395408598';

async function initAdMobBanner() {
  try {
    const { AdMob } = window.Capacitor?.Plugins || {};
    if (!AdMob) return; // running in plain browser, skip

    await AdMob.initialize();

    // EU/UK consent flow (required by Google policy for users in those regions).
    // If this fails for any reason, fall back to just showing the banner.
    try {
      let consentInfo = await AdMob.requestConsentInfo();
      if (consentInfo.isConsentFormAvailable && consentInfo.status === 'REQUIRED') {
        consentInfo = await AdMob.showConsentForm();
      }
      if (consentInfo.canRequestAds === false) return;
    } catch (consentErr) {
      console.warn('AdMob consent flow skipped', consentErr);
    }

    await AdMob.showBanner({
      adId: ADMOB_BANNER_ID,
      adSize: 'ADAPTIVE_BANNER',
      position: 'BOTTOM_CENTER',
      margin: 0,
    });

    // Reserve space so the banner never overlaps the item list / add button
    document.body.classList.add('has-ad-banner');
  } catch (e) {
    console.warn('AdMob banner failed to load', e);
  }
}

// ---------- Init ----------
requestNotificationPermission();
initAdMobBanner();
render();
