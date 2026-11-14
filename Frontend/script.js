const API = window.FATODEL_API || 'http://localhost:5000/api/v1';

const $ = (id) => document.getElementById(id);

const esc = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c],
  );

const fmt = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');
const fmtL = (n) => Number(n || 0).toLocaleString('en-NG') + ' L';
const day = (d) => String(d).slice(0, 10);
const today = () => new Date().toISOString().slice(0, 10);

let token = localStorage.getItem('fatodel_token');
let me = null;

async function api(path, { method = 'GET', body, auth = true } = {}) {
  let res;

  try {
    res = await fetch(API + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(auth && token ? { Authorization: 'Bearer ' + token } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      'Cannot reach the server. Check that the backend is running.',
    );
  }

  let data = null;

  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    if (res.status === 401 && auth) {
      logout('Session expired. Please sign in again.');
    }

    const err = new Error(data?.message || 'Something went wrong.');
    err.status = res.status;
    throw err;
  }

  return data;
}

const setToken = (t) => {
  token = t;
  localStorage.setItem('fatodel_token', t);
};

function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  $('toast-container').appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function showAlert(id, msg, type = 'error') {
  const a = $(id);
  a.textContent = msg;
  a.className = 'alert ' + type;
}

const hideAlert = (id) => {
  $(id).className = 'alert hidden';
};

function modal(title, body, foot = '') {
  $('modal-title').textContent = title;
  $('modal-body').innerHTML = body;
  $('modal-foot').innerHTML = foot;
  $('modal-overlay').classList.remove('hidden');
}

const closeModal = () => {
  $('modal-overlay').classList.add('hidden');
};

$('modal-close').onclick = closeModal;

$('modal-overlay').onclick = (e) => {
  if (e.target === $('modal-overlay')) closeModal();
};

function ask(msg, onOk, label = 'Confirm') {
  modal(
    'Please confirm',
    `<p style="line-height:1.6;color:var(--text-2)">${esc(msg)}</p>`,
    `<button class="btn-ghost" id="ask-no">Cancel</button>
     <button class="btn-danger" id="ask-yes">${label}</button>`,
  );

  $('ask-no').onclick = closeModal;

  $('ask-yes').onclick = () => {
    closeModal();
    onOk();
  };
}

async function run(btn, fn) {
  if (btn) btn.disabled = true;

  try {
    await fn();
  } catch (e) {
    toast(e.message, 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

const emptyRow = (cols, title, text) =>
  `<tr><td colspan="${cols}">
    <div class="empty-state">
      <h4>${title}</h4>
      <p>${text}</p>
    </div>
  </td></tr>`;

const showScreen = (n) => {
  document
    .querySelectorAll('.auth-screen')
    .forEach((s) => s.classList.remove('active'));

  $('screen-' + n).classList.add('active');
};

$('go-signup').onclick = (e) => {
  e.preventDefault();
  showScreen('signup');
};

$('go-login').onclick = (e) => {
  e.preventDefault();
  showScreen('login');
};

$('login-form').onsubmit = async (e) => {
  e.preventDefault();
  hideAlert('login-alert');

  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;

  try {
    const r = await api('/users/login', {
      method: 'POST',
      auth: false,
      body: {
        email: $('l-email').value.trim(),
        password: $('l-pw').value,
      },
    });

    setToken(r.token);
    startApp(r.data.user);
  } catch (err) {
    showAlert('login-alert', err.message);
  }

  btn.disabled = false;
};

$('signup-form').onsubmit = async (e) => {
  e.preventDefault();
  hideAlert('signup-alert');

  if ($('s-pw').value !== $('s-cpw').value) {
    return showAlert('signup-alert', 'Passwords do not match.');
  }

  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;

  try {
    const r = await api('/users/signup', {
      method: 'POST',
      auth: false,
      body: {
        role: 'admin',
        name: $('s-name').value.trim(),
        email: $('s-email').value.trim(),
        password: $('s-pw').value,
        passwordConfirm: $('s-cpw').value,
      },
    });

    setToken(r.token);
    startApp(r.data.user);
  } catch (err) {
    showAlert('signup-alert', err.message);
  }

  btn.disabled = false;
};

function logout(msg) {
  token = null;
  me = null;
  ownerStationId = null;
  ownerStationRecords = [];

  localStorage.removeItem('fatodel_token');

  $('app-shell').classList.add('hidden');
  $('auth-wrapper').classList.remove('hidden');
  $('login-form').reset();

  showScreen('login');

  if (msg) showAlert('login-alert', msg, 'info');
}

$('sb-logout').onclick = () =>
  ask('Sign out of FATODEL Hub?', () => logout(), 'Sign out');

window.addEventListener('DOMContentLoaded', async () => {
  const theme = localStorage.getItem('fatodel_theme');

  if (theme) {
    document.documentElement.dataset.theme = theme;
  }

  if (!token) {
    return $('auth-wrapper').classList.remove('hidden');
  }

  try {
    startApp((await api('/users/me')).data);
  } catch {
    if (token) logout();
  }
});

const ICON = {
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  users:
    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M1 12h4M19 12h4M4.2 19.8L7 17M17 7l2.8-2.8"/>',
};

const NAV = {
  admin: [
    ['overview', 'Overview', 'grid'],
    ['stations', 'Stations', 'pin'],
    ['managers', 'Managers', 'users'],
    ['settings', 'Settings', 'cog'],
  ],
  manager: [
    ['mgr-dashboard', 'Daily Record', 'grid'],
    ['mgr-records', 'My Records', 'file'],
    ['settings', 'Settings', 'cog'],
  ],
};

const RENDER = {
  overview: renderOverview,
  stations: renderStations,
  'station-records': renderOwnerStationRecords,
  managers: renderManagers,
  'mgr-dashboard': renderMgrDashboard,
  'mgr-records': () => {
    page = 1;
    noMore = false;
    loadRecords();
  },
  settings: renderSettings,
};

function startApp(user) {
  me = user;

  $('auth-wrapper').classList.add('hidden');
  $('app-shell').classList.remove('hidden');

  $('sb-uname').textContent = user.name;
  $('sb-urole').textContent = user.role;
  $('sb-avatar').textContent = user.name.charAt(0).toUpperCase();

  const nav = $('sb-nav');
  nav.innerHTML = '';

  NAV[user.role].forEach(([id, label, icon]) => {
    const b = document.createElement('button');

    b.className = 'nav-item';
    b.dataset.view = id;

    b.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2">
        ${ICON[icon]}
      </svg>
      ${label}
    `;

    b.onclick = () => navigateTo(id);
    nav.appendChild(b);
  });

  navigateTo(NAV[user.role][0][0]);
}

function navigateTo(id) {
  if (id === 'station-records' && me?.role !== 'admin') {
    return toast('You are not allowed to view this page.', 'error');
  }

  document.querySelectorAll('.nav-item[data-view]').forEach((n) => {
    n.classList.toggle('active', n.dataset.view === id);
  });

  document
    .querySelectorAll('.view')
    .forEach((v) => v.classList.remove('active'));

  const view = $('view-' + id);

  if (!view) {
    return toast('Page not found. Check your index.html.', 'error');
  }

  view.classList.add('active');

  $('sidebar').classList.remove('open');
  $('sb-overlay').classList.remove('active');

  if (RENDER[id]) RENDER[id]();
}

$('hamburger').onclick = () => {
  $('sidebar').classList.toggle('open');
  $('sb-overlay').classList.toggle('active');
};

$('sb-overlay').onclick = () => {
  $('sidebar').classList.remove('open');
  $('sb-overlay').classList.remove('active');
};

$('theme-toggle').onclick = () => {
  const h = document.documentElement;

  h.dataset.theme = h.dataset.theme === 'dark' ? 'light' : 'dark';

  localStorage.setItem('fatodel_theme', h.dataset.theme);
};

async function renderOverview() {
  const grid = $('stat-grid');
  const split = $('split-card');

  split.innerHTML = '';

  try {
    const s = (await api('/dashboard/stats')).data;

    const cards = [
      ['Monthly Revenue', fmt(s.monthlyRevenue), '#f97316'],
      ['Fuel Sold', fmtL(s.monthlyLiterSales), '#3b82f6'],
      ['Total Expenses', fmt(s.totalExpenses), '#ef4444'],
      ['Net Profit', fmt(s.netProfit), '#22c55e'],
      ['Average Fuel Price', fmt(Math.round(s.avgFuelPrice)) + '/L', '#fbbf24'],
      ['Records', s.recordCount, '#8b5cf6'],
    ];

    grid.innerHTML = cards
      .map(
        ([l, v, c]) =>
          `<div class="stat-card" style="--accent:${c}">
        <div class="sc-label">${l}</div>
        <div class="sc-value">${v}</div>
      </div>`,
      )
      .join('');

    const rev = s.monthlyRevenue || 0;

    const ePct = rev
      ? Math.min(100, Math.max(0, (s.totalExpenses / rev) * 100))
      : 0;

    split.innerHTML = `
      <div class="chart-card-head"><h3>Where revenue went</h3></div>
      <div class="split-bar">
        <div class="split-exp" style="width:${ePct}%"></div>
        <div class="split-profit" style="width:${100 - ePct}%"></div>
      </div>
      <div class="split-legend">
        <span><i class="dot exp"></i>Expenses ${ePct.toFixed(1)}%</span>
        <span><i class="dot profit"></i>Net profit ${(100 - ePct).toFixed(1)}%</span>
      </div>
    `;
  } catch (e) {
    grid.innerHTML = `
      <div class="empty-state">
        <h4>${e.status === 404 ? 'No records yet' : 'Could not load stats'}</h4>
        <p>${
          e.status === 404
            ? 'Stats appear once managers submit records.'
            : esc(e.message)
        }</p>
      </div>
    `;
  }
}

async function adminData() {
  const [u, s] = await Promise.all([api('/users'), api('/station/all')]);

  return {
    managers: u.data.filter((x) => x.role === 'manager'),
    stations: s.data,
  };
}

async function renderStations() {
  const tb = $('stations-tbody');

  tb.innerHTML = emptyRow(4, 'Loading…', '');

  try {
    const { managers, stations } = await adminData();

    window._managers = managers;
    window._stations = stations;

    tb.innerHTML = stations.length
      ? stations
          .map((s) => {
            const m = managers.find((x) => x._id === s.manager);

            return `
            <tr>
              <td>${esc(s.stationName)}</td>
              <td>${esc(s.location)}</td>
              <td>
                ${
                  m
                    ? esc(m.name)
                    : '<span style="color:var(--text-3)">Manager removed</span>'
                }
              </td>
              <td>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  <button class="act-btn edit" data-records="${s._id}">
                    View Monthly Records
                  </button>

                  <button class="act-btn edit"
                    data-id="${s._id}"
                    data-name="${esc(s.stationName)}">
                    Rename
                  </button>
                </div>
              </td>
            </tr>
          `;
          })
          .join('')
      : emptyRow(
          4,
          'No stations yet',
          'Create a manager first, then add their station.',
        );

    tb.querySelectorAll('[data-id]').forEach((b) => {
      b.onclick = () => renameStation(b.dataset.id, b.dataset.name);
    });

    tb.querySelectorAll('[data-records]').forEach((b) => {
      b.onclick = () => openOwnerStationRecords(b.dataset.records);
    });
  } catch (e) {
    tb.innerHTML = emptyRow(4, 'Could not load stations', esc(e.message));
  }
}

let ownerStationId = null;
let ownerStationRecords = [];

function openOwnerStationRecords(stationId) {
  if (me?.role !== 'admin') {
    return toast('Only the owner can view station records.', 'error');
  }

  const station = (window._stations || []).find((s) => s._id === stationId);

  if (!station) {
    return toast('Station not found.', 'error');
  }

  ownerStationId = stationId;

  $('owner-records-title').textContent =
    station.stationName + ' — Monthly Records';

  const manager = (window._managers || []).find(
    (m) => m._id === station.manager,
  );

  $('owner-records-subtitle').textContent =
    `Location: ${station.location || '—'} | Manager: ${manager?.name || '—'}`;

  $('owner-record-month').value = new Date().toISOString().slice(0, 7);

  navigateTo('station-records');
}

async function renderOwnerStationRecords() {
  if (me?.role !== 'admin' || !ownerStationId) {
    return navigateTo('stations');
  }

  await loadOwnerStationRecords();
}

async function loadOwnerStationRecords() {
  const tb = $('owner-records-tbody');
  const stats = $('owner-record-stats');

  tb.innerHTML = emptyRow(8, 'Loading records…', '');
  stats.innerHTML = '';

  const month = $('owner-record-month').value;

  if (!month) {
    tb.innerHTML = emptyRow(
      8,
      'Select a month',
      'Choose a month to view records.',
    );
    return;
  }

  try {
    const qs = new URLSearchParams({ month });

    const response = await api(
      '/record/station/' + encodeURIComponent(ownerStationId) + '?' + qs,
    );

    ownerStationRecords = Array.isArray(response.data)
      ? response.data
      : response.data?.records || [];

    const records = ownerStationRecords;

    const totalSales = records.reduce(
      (sum, r) => sum + Number(r.dailyTotalSales || 0),
      0,
    );

    const totalExpenses = records.reduce(
      (sum, r) => sum + Number(r.dailyExpenses || 0),
      0,
    );

    const totalLitres = records.reduce(
      (sum, r) => sum + Number(r.literSold || 0),
      0,
    );

    const profit = totalSales - totalExpenses;

    const cards = [
      ['Total Sales', fmt(totalSales)],
      ['Total Expenses', fmt(totalExpenses)],
      ['Net Profit', fmt(profit)],
      ['Fuel Sold', fmtL(totalLitres)],
      ['Number of Records', records.length],
    ];

    stats.innerHTML = cards
      .map(
        ([label, value]) => `
      <div class="stat-card">
        <div class="sc-label">${label}</div>
        <div class="sc-value">${value}</div>
      </div>
    `,
      )
      .join('');

    if (!records.length) {
      tb.innerHTML = emptyRow(
        8,
        'No records found',
        'This station has no records for the selected month.',
      );
      return;
    }

    tb.innerHTML = records
      .map(
        (r) => `
      <tr>
        <td>${day(r.date)}</td>
        <td>${Number(r.OpeningMeter || 0).toLocaleString('en-NG')}</td>
        <td>${Number(r.closingMeter || 0).toLocaleString('en-NG')}</td>
        <td>${Number(r.literSold || 0).toLocaleString('en-NG')}</td>
        <td>${fmt(r.rate)}</td>
        <td style="color:var(--green);font-weight:600">
          ${fmt(r.dailyTotalSales)}
        </td>
        <td style="color:var(--red)">
          ${fmt(r.dailyExpenses)}
        </td>
        <td>${fmt(Number(r.dailyTotalSales || 0) - Number(r.dailyExpenses || 0))}</td>
      </tr>
    `,
      )
      .join('');
  } catch (e) {
    ownerStationRecords = [];

    tb.innerHTML = emptyRow(8, 'Could not load records', esc(e.message));
  }
}

$('owner-record-month').onchange = () => {
  loadOwnerStationRecords();
};

$('back-to-stations-btn').onclick = () => {
  ownerStationId = null;
  ownerStationRecords = [];
  navigateTo('stations');
};

function renameStation(id, name) {
  modal(
    'Rename Station',
    `<div class="fg">
      <label>Station Name</label>
      <input id="st-rename" value="${esc(name)}"/>
    </div>`,
    `<button class="btn-ghost" onclick="closeModal()">Cancel</button>
     <button class="btn-primary" id="st-save">Save</button>`,
  );

  $('st-save').onclick = (e) =>
    run(e.target, async () => {
      await api('/station/' + id, {
        method: 'PATCH',
        body: {
          stationName: $('st-rename').value.trim(),
        },
      });

      closeModal();
      toast('Station renamed');
      renderStations();
    });
}

$('add-station-btn').onclick = async () => {
  try {
    const { managers, stations } = await adminData();

    const free = managers.filter(
      (m) => !stations.some((s) => s.manager === m._id),
    );

    if (!free.length) {
      return toast(
        'Every manager already has a station. Add a manager first.',
        'info',
      );
    }

    modal(
      'Add Station',
      `
        <div class="fg">
          <label>Station Name</label>
          <input id="st-name"/>
        </div>
        <div class="fg">
          <label>Location</label>
          <input id="st-loc"/>
        </div>
        <div class="fg">
          <label>Manager</label>
          <select id="st-mgr">
            ${free
              .map(
                (m) =>
                  `<option value="${m._id}">
                ${esc(m.name)} (${esc(m.email)})
              </option>`,
              )
              .join('')}
          </select>
        </div>
      `,
      `<button class="btn-ghost" onclick="closeModal()">Cancel</button>
       <button class="btn-primary" id="st-create">Create Station</button>`,
    );

    $('st-create').onclick = (e) =>
      run(e.target, async () => {
        await api('/station/' + $('st-mgr').value, {
          method: 'POST',
          body: {
            stationName: $('st-name').value.trim(),
            location: $('st-loc').value.trim(),
          },
        });

        closeModal();
        toast('Station created');
        renderStations();
      });
  } catch (e) {
    toast(e.message, 'error');
  }
};

async function renderManagers() {
  const tb = $('managers-tbody');

  tb.innerHTML = emptyRow(4, 'Loading…', '');

  try {
    const { managers, stations } = await adminData();

    tb.innerHTML = managers.length
      ? managers
          .map((m) => {
            const st = stations.find((s) => s.manager === m._id);

            return `
            <tr>
              <td>${esc(m.name)}</td>
              <td>${esc(m.email)}</td>
              <td>
                ${
                  st
                    ? esc(st.stationName)
                    : '<span style="color:var(--text-3)">No station yet</span>'
                }
              </td>
              <td>
                <button class="act-btn del"
                  data-id="${m._id}"
                  data-name="${esc(m.name)}">
                  Delete
                </button>
              </td>
            </tr>
          `;
          })
          .join('')
      : emptyRow(
          4,
          'No managers yet',
          'Add a manager so someone can submit daily records.',
        );

    tb.querySelectorAll('[data-id]').forEach((b) => {
      b.onclick = () =>
        ask(
          `Delete manager ${b.dataset.name}? Their account is removed permanently.`,
          () =>
            run(null, async () => {
              await api('/station/manager/' + b.dataset.id, {
                method: 'DELETE',
              });

              toast('Manager deleted', 'info');
              renderManagers();
            }),
          'Delete',
        );
    });
  } catch (e) {
    tb.innerHTML =
      e.status === 404
        ? emptyRow(
            4,
            'No managers yet',
            'Add a manager so someone can submit daily records.',
          )
        : emptyRow(4, 'Could not load managers', esc(e.message));
  }
}

$('add-manager-btn').onclick = () => {
  modal(
    'Add Manager',
    `
      <div class="fg">
        <label>Full Name</label>
        <input id="mg-name"/>
      </div>
      <div class="fg">
        <label>Email</label>
        <input type="email" id="mg-email"/>
      </div>
      <div class="fg">
        <label>Password</label>
        <input type="password" id="mg-pw" placeholder="Min 8 characters"/>
      </div>
      <div class="fg">
        <label>Confirm Password</label>
        <input type="password" id="mg-cpw"/>
      </div>
    `,
    `<button class="btn-ghost" onclick="closeModal()">Cancel</button>
     <button class="btn-primary" id="mg-create">Create Manager</button>`,
  );

  $('mg-create').onclick = (e) =>
    run(e.target, async () => {
      const password = $('mg-pw').value;
      const confirmPassword = $('mg-cpw').value;

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      await api('/station/manager', {
        method: 'POST',
        body: {
          name: $('mg-name').value.trim(),
          email: $('mg-email').value.trim(),
          password,
          passwordConfirm: confirmPassword,
        },
      });

      closeModal();
      toast('Manager created. Add their station under Stations.');
      renderManagers();
    });
};

function renderMgrDashboard() {
  $('mgr-date').textContent = new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  resetRecordForm();
  loadMgrStats();
}

async function loadMgrStats() {
  const set = (a, b, c) => {
    $('ms-revenue').textContent = a;
    $('ms-litres').textContent = b;
    $('ms-profit').textContent = c;
  };

  try {
    const s = (await api('/dashboard/stats')).data;

    set(fmt(s.monthlyRevenue), fmtL(s.monthlyLiterSales), fmt(s.netProfit));
  } catch {
    set('—', '—', '—');
  }
}

function resetRecordForm() {
  $('mgr-record-form').reset();
  $('rec-date').value = today();
  hideAlert('mgr-form-alert');
  calcSold();
}

function calcSold() {
  const sold =
    (parseFloat($('rec-open').value) || 0) -
    (parseFloat($('rec-close').value) || 0);

  console.log('calcSold', sold, $('rec-open').value, $('rec-close').value);

  $('calc-sold').textContent =
    sold > 0 ? sold.toLocaleString() + ' Litres' : '— Litres';
}

$('rec-open').oninput = $('rec-close').oninput = calcSold;

$('reset-form-btn').onclick = resetRecordForm;

$('mgr-record-form').onsubmit = async (e) => {
  e.preventDefault();

  hideAlert('mgr-form-alert');

  const close = parseFloat($('rec-close').value);
  const open = parseFloat($('rec-open').value);

  if (close > open) {
    return showAlert(
      'mgr-form-alert',
      'Closing meter cannot be greater than opening meter.',
    );
  }

  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;

  try {
    await api('/dashboard', {
      method: 'POST',
      body: {
        date: $('rec-date').value,
        rate: +$('rec-price').value,
        OpeningMeter: open,
        closingMeter: close,
        literSold: open - close,
        dailyTotalSales: +$('rec-sales').value,
        dailyExpenses: +$('rec-expenses').value,
        note: $('rec-note').value.trim(),
      },
    });

    resetRecordForm();
    loadMgrStats();
    toast('Record saved');
  } catch (err) {
    showAlert('mgr-form-alert', err.message);
  }

  btn.disabled = false;
};

const LIMIT = 10;

let page = 1;
let noMore = false;
let recs = [];

async function loadRecords() {
  const tb = $('mgr-tbody');

  const qs = new URLSearchParams({
    page,
    limit: LIMIT,
    sort: $('mgr-sort').value,
  });

  if ($('mgr-month').value) {
    qs.set('month', $('mgr-month').value);
  }

  try {
    const response = await api('/record?' + qs);
    recs = Array.isArray(response.data) ? response.data : [];

    tb.innerHTML = recs.length
      ? recs
          .map(
            (r) => `
        <tr>
          <td>${day(r.date)}</td>
          <td>${Number(r.OpeningMeter || 0).toLocaleString('en-NG')}</td>
          <td>${Number(r.closingMeter || 0).toLocaleString('en-NG')}</td>
          <td>${Number(r.literSold || 0).toLocaleString('en-NG')}</td>
          <td>${fmt(r.rate)}</td>
          <td style="color:var(--green);font-weight:600">${fmt(r.dailyTotalSales)}</td>
          <td style="color:var(--red)">${fmt(r.dailyExpenses)}</td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="act-btn edit" data-v="${r._id}">View</button>
              <button class="act-btn edit" data-e="${r._id}">Edit</button>
              <button class="act-btn del" data-d="${r._id}">Del</button>
            </div>
          </td>
        </tr>
      `,
          )
          .join('')
      : emptyRow(8, 'No records found', 'Nothing matches this month yet.');

    tb.querySelectorAll('[data-v]').forEach((b) => {
      b.onclick = () => viewRecord(b.dataset.v);
    });

    tb.querySelectorAll('[data-e]').forEach((b) => {
      b.onclick = () => editRecord(b.dataset.e);
    });

    tb.querySelectorAll('[data-d]').forEach((b) => {
      b.onclick = () =>
        ask(
          'Delete this record permanently?',
          () =>
            run(null, async () => {
              await api('/record/' + b.dataset.d, {
                method: 'DELETE',
              });

              toast('Record deleted', 'info');
              loadRecords();
            }),
          'Delete',
        );
    });

    noMore = recs.length < LIMIT;
  } catch (e) {
    recs = [];

    tb.innerHTML = emptyRow(8, 'Could not load records', esc(e.message));
  }

  const pg = $('mgr-pagination');

  pg.innerHTML = `
    <button class="pg-btn" id="pg-prev" ${page <= 1 ? 'disabled' : ''}>
      Previous
    </button>
    <span class="pg-info">Page ${page}</span>
    <button class="pg-btn" id="pg-next" ${noMore ? 'disabled' : ''}>
      Next
    </button>
  `;

  $('pg-prev').onclick = () => {
    if (page > 1) {
      page--;
      loadRecords();
    }
  };

  $('pg-next').onclick = () => {
    if (!noMore) {
      page++;
      loadRecords();
    }
  };
}

$('mgr-month').onchange = $('mgr-sort').onchange = () => {
  page = 1;
  noMore = false;
  loadRecords();
};

function viewRecord(id) {
  const r = recs.find((x) => x._id === id);

  if (!r) return;

  const row = (l, v) =>
    `<div class="detail-row"><span>${l}</span><span>${v}</span></div>`;

  modal(
    'Record Details',
    row('Date', day(r.date)) +
      row('Station', esc(r.station?.stationName || '—')) +
      row('Opening meter', Number(r.OpeningMeter || 0).toLocaleString()) +
      row('Closing meter', Number(r.closingMeter || 0).toLocaleString()) +
      row('Litres sold', fmtL(r.literSold)) +
      row('Price per litre', fmt(r.rate)) +
      row('Daily sales', fmt(r.dailyTotalSales)) +
      row('Daily expenses', fmt(r.dailyExpenses)) +
      row(
        'Net',
        fmt(Number(r.dailyTotalSales || 0) - Number(r.dailyExpenses || 0)),
      ) +
      row('Note', esc(r.note || '—')) +
      row('Submitted by', esc(r.createdBy?.name || '—')),
    `<button class="btn-ghost" onclick="closeModal()">Close</button>`,
  );
}

function editRecord(id) {
  const r = recs.find((x) => x._id === id);

  if (!r) return;

  modal(
    'Edit Record',
    `
      <div class="fg-row-2">
        <div class="fg">
          <label>Date</label>
          <input type="date" id="ed-date" value="${day(r.date)}"/>
        </div>
        <div class="fg">
          <label>Price/L (₦)</label>
          <input type="number" id="ed-rate" value="${r.rate}"/>
        </div>
      </div>

      <div class="fg-row-2">
        <div class="fg">
          <label>Opening Meter</label>
          <input type="number" id="ed-open" value="${r.OpeningMeter}"/>
        </div>
        <div class="fg">
          <label>Closing Meter</label>
          <input type="number" id="ed-close" value="${r.closingMeter}"/>
        </div>
      </div>

      <div class="fg-row-2">
        <div class="fg">
          <label>Daily Sales (₦)</label>
          <input type="number" id="ed-sales" value="${r.dailyTotalSales}"/>
        </div>
        <div class="fg">
          <label>Daily Expenses (₦)</label>
          <input type="number" id="ed-exp" value="${r.dailyExpenses}"/>
        </div>
      </div>
    `,
    `<button class="btn-ghost" onclick="closeModal()">Cancel</button>
     <button class="btn-primary" id="ed-save">Save Changes</button>`,
  );

  $('ed-save').onclick = (e) =>
    run(e.target, async () => {
      const open = +$('ed-open').value;
      const close = +$('ed-close').value;

      if (close > open) {
        throw new Error('Closing meter cannot be greater than opening meter.');
      }

      await api('/record/' + id, {
        method: 'PATCH',
        body: {
          date: $('ed-date').value,
          rate: +$('ed-rate').value,
          OpeningMeter: open,
          closingMeter: close,
          literSold: open - close,
          dailyTotalSales: +$('ed-sales').value,
          dailyExpenses: +$('ed-exp').value,
        },
      });

      closeModal();
      toast('Record updated');
      loadRecords();
    });
}

function renderSettings() {
  $('set-name').value = me.name;
  $('set-email').value = me.email;

  ['pw-current', 'pw-new', 'pw-confirm'].forEach((i) => {
    $(i).value = '';
  });
}

$('save-profile-btn').onclick = (e) =>
  run(e.target, async () => {
    const r = await api('/users/updateMe', {
      method: 'PATCH',
      body: {
        name: $('set-name').value.trim(),
        email: $('set-email').value.trim(),
      },
    });

    me = {
      ...me,
      ...r.updatedUser,
    };

    $('sb-uname').textContent = me.name;
    $('sb-avatar').textContent = me.name.charAt(0).toUpperCase();

    toast('Profile updated');
  });

$('save-pw-btn').onclick = (e) =>
  run(e.target, async () => {
    const r = await api('/users/updateMyPassword', {
      method: 'PATCH',
      body: {
        currentPassword: $('pw-current').value,
        password: $('pw-new').value,
        passwordConfirm: $('pw-confirm').value,
      },
    });

    setToken(r.token);
    renderSettings();

    toast('Password updated');
  });

$('deactivate-btn').onclick = () =>
  ask(
    'Deactivate your account? You will be signed out and will not be able to sign in again.',
    () =>
      run(null, async () => {
        await api('/users/deleteMe', {
          method: 'DELETE',
        });

        logout();
      }),
    'Deactivate',
  );

function exportRecordsToExcel(records, filename, stationName = '') {
  if (!window.XLSX) {
    toast('Excel library failed to load. Please refresh the page.', 'error');
    return;
  }

  if (!records || records.length === 0) {
    toast('No records available to export.', 'error');
    return;
  }

  const excelData = records.map((record) => ({
    Station: stationName || record.station?.stationName || '',
    Date: record.date ? new Date(record.date).toLocaleDateString() : '',
    'Opening Meter': record.OpeningMeter ?? '',
    'Closing Meter': record.closingMeter ?? '',
    'Litres Sold': record.literSold ?? '',
    'Price Per Litre': record.rate ?? '',
    'Total Sales (NGN)': record.dailyTotalSales ?? '',
    'Expenses (NGN)': record.dailyExpenses ?? '',
    'Net Profit (NGN)':
      Number(record.dailyTotalSales || 0) - Number(record.dailyExpenses || 0),
    Note: record.note || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  worksheet['!cols'] = [
    { wch: 22 },
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
    { wch: 15 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Station Records');

  XLSX.writeFile(workbook, filename);

  toast('Excel file downloaded successfully!', 'success');
}

$('export-manager-records-btn')?.addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  const month = $('mgr-month')?.value;

  if (!month) {
    toast('Please select a month first.', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Preparing Excel...';

  try {
    const allRecords = [];
    const exportLimit = 100;
    let exportPage = 1;

    while (true) {
      const qs = new URLSearchParams({
        page: exportPage,
        limit: exportLimit,
        sort: $('mgr-sort').value,
        month,
      });

      const response = await api('/record?' + qs);

      const records = Array.isArray(response.data) ? response.data : [];

      allRecords.push(...records);

      if (records.length < exportLimit) {
        break;
      }

      exportPage++;
    }

    if (allRecords.length === 0) {
      toast('No records available for this month.', 'error');
      return;
    }

    exportRecordsToExcel(allRecords, `Manager-Records-${month}.xlsx`);
  } catch (error) {
    toast('Could not export records: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Download Excel';
  }
});

$('export-owner-records-btn')?.addEventListener('click', () => {
  const month = $('owner-record-month')?.value;

  if (!month) {
    toast('Please select a month first.', 'error');
    return;
  }

  const records = ownerStationRecords || [];

  const station = window._stations?.find((s) => s._id === ownerStationId);

  const stationName = station?.stationName || 'Station';

  exportRecordsToExcel(
    records,
    `${stationName.replace(/[^a-z0-9]/gi, '-')}-${month}.xlsx`,
    stationName,
  );
});

async function checkAdminExists() {
  const signupLink = $('go-signup');
  const signupSwitch = signupLink?.closest('.auth-switch');

  if (!signupSwitch) return;

  try {
    const response = await api('/users/admin-exists', {
      auth: false,
    });

    const adminExists = response.adminExists ?? response.data?.adminExists;

    signupSwitch.style.display = adminExists ? 'none' : '';
  } catch (error) {
    console.error('Could not check admin account:', error);
    signupSwitch.style.display = 'none';
  }
}

checkAdminExists();
