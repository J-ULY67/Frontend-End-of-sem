// point all API calls at backend
const API_BASE = 'https://backend-end-of-sem.onrender.com/api';


// Auth helpers
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

function setAuth(user, tkn) {
  currentUser = user;
  token = tkn;
  localStorage.setItem('currentUser', JSON.stringify(user));
  localStorage.setItem('token', tkn);
}

function clearAuth() {
  currentUser = null;
  token = null;
  localStorage.removeItem('currentUser');
  localStorage.removeItem('token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  };
}

// Redirect non-logged in users
document.addEventListener('DOMContentLoaded', () => {
  const publicPaths = ['/', '/index.html', 'index.html'];
  const path = location.pathname.replace(/^\//, '');
  if (!token && !publicPaths.includes(location.pathname) && !publicPaths.includes(path)) {
    window.location.href = 'index.html';
  }

  const span = document.getElementById('currentUserInfo');
  if (span && currentUser) {
    span.textContent = `Logged in as: ${currentUser.role === 'admin' ? 'Admin' : currentUser.name}`;
  }
});

// AUTH: register / login / logout
async function register() {
  const name = document.getElementById('name').value;
  const studentId = document.getElementById('studentId').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const role = document.getElementById('regRole').value;

  if (!name || !studentId || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, studentId, email, password, role })
  });

  if (!res.ok) {
    const err = await res.json();
    return alert(err.message);
  }

  const { token: tkn, user } = await res.json();
  setAuth(user, tkn);

  // redirect based on role
  if (user.role === 'admin') {
    window.location.href = 'admin-applications.html';
  } else {
    window.location.href = 'dashboard.html';
  }
}

function showRegister() {
  document.querySelector('.form-container').style.display = 'none';
  document.getElementById('register-form').classList.remove('hidden');
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const err = await res.json();
    return alert(err.message);
  }

  const { token: tkn, user } = await res.json();
  setAuth(user, tkn);

  if (user.role === 'admin') {
    window.location.href = 'admin-applications.html';
  } else {
    window.location.href = 'dashboard.html';
  }
}

function logout() {
  clearAuth();
  window.location.href = 'index.html';
}

// STUDENT: load hostels & apply
async function loadHostelsForApply() {
  const container = document.getElementById('hostelContainer');
  if (!container) return;

  const res = await fetch(`${API_BASE}/hostels`, {
    headers: authHeaders()
  });

  if (!res.ok) {
    const err = await res.json();
    return alert(err.message);
  }

  const hostels = await res.json();
  container.innerHTML = '';

  hostels.forEach(h => {
    const isFull = h.occupancy >= h.capacity;
    const card = document.createElement('div');
    card.className = 'room-card';
    card.innerHTML = `
      <img src="${h.image || 'default-hostel.jpg'}" alt="${h.name}" />
      <h3>${h.name}</h3>
      <p>${h.description}</p>
      <p><strong>Type:</strong> ${h.type}</p>
      <p><strong>Occupancy:</strong> ${h.occupancy} / ${h.capacity}</p>
      <button ${isFull ? 'disabled' : ''} onclick="applyForRoom(${h.id})">
        ${isFull ? 'Full' : 'Apply for this Room'}
      </button>
    `;
    container.appendChild(card);
  });
}

async function applyForRoom(hostelId) {
  const res = await fetch(`${API_BASE}/applications`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ hostelId })
  });

  if (!res.ok) {
    const err = await res.json();
    return alert(err.message);
  }

  alert('Application submitted!');
  window.location.href = 'dashboard.html';
}

// STUDENT: dashboard
async function renderStudentDashboard() {
  const nameSpan = document.getElementById('dashboardName');
  const content = document.getElementById('dashboardContent');
  if (!nameSpan || !content || !currentUser) return;

  nameSpan.textContent = currentUser.name;

  const res = await fetch(`${API_BASE}/applications`, {
    headers: authHeaders()
  });

  if (!res.ok) {
    const err = await res.json();
    return alert(err.message);
  }

  const apps = await res.json();

  if (!apps.length) {
    content.innerHTML = `
      <p>You have not applied for housing yet.</p>
      <a href="apply.html"><button>Apply Now</button></a>
    `;
    return;
  }

  const app = apps[0];
  let cls = app.status.toLowerCase();
  let html = `
    <h3>Application Status</h3>
    <span class="badge ${cls}">${app.status}</span>
  `;

  if (app.status === 'accepted') {
    html += `
      <h4>Room Assignment</h4>
      <p><strong>Hostel:</strong> ${app.hostel}</p>
      <p><strong>Room Type:</strong> ${app.type}</p>
    `;
  } else if (app.status === 'rejected') {
    html += `
      <p>Your application was rejected. You may reapply.</p>
      <a href="apply.html"><button>Reapply</button></a>
    `;
  }

  content.innerHTML = html;
}

if (document.getElementById('dashboardContent')) {
  renderStudentDashboard();
}

// ADMIN: Applications
async function renderAdminApplications() {
  const tableBody = document.getElementById('adminApplications');
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  if (!tableBody) return;

  const res = await fetch(`${API_BASE}/applications`, {
    headers: authHeaders()
  });

  if (!res.ok) {
    const err = await res.json();
    return alert(err.message);
  }

  const apps = await res.json();
  tableBody.innerHTML = '';

  apps
    .filter(a => a.userEmail.toLowerCase().includes(search))
    .forEach(app => {
      const cls = app.status.toLowerCase();
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${app.userEmail}</td>
        <td>${app.hostel}</td>
        <td>${app.type}</td>
        <td><span class="badge ${cls}">${app.status}</span></td>
        <td>
          <button onclick="approveApp(${app.id})">Approve</button>
          <button onclick="rejectApp(${app.id})">Reject</button>
          <button onclick="confirmDelete(${app.id})">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
}

function filterApplications() {
  renderAdminApplications();
}

if (document.getElementById('adminApplications')) {
  renderAdminApplications();
}

async function approveApp(id) {
  const res = await fetch(`${API_BASE}/applications/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status: 'accepted' })
  });

  if (!res.ok) {
    const err = await res.json();
    return alert(err.message);
  }

  renderAdminApplications();
}

async function rejectApp(id) {
  const res = await fetch(`${API_BASE}/applications/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status: 'rejected' })
  });

  if (!res.ok) {
    const err = await res.json();
    return alert(err.message);
  }

  renderAdminApplications();
}

function confirmDelete(id) {
  if (confirm('Really delete this application?')) {
    deleteApp(id);
  }
}

async function deleteApp(id) {
  const res = await fetch(`${API_BASE}/applications/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });

  if (!res.ok) {
    const err = await res.json();
    return alert(err.message);
  }

  renderAdminApplications();
}

// ADMIN: Hostel Management
async function renderHostels() {
  const container = document.getElementById('hostelList');
  if (!container) return;

  const res = await fetch(`${API_BASE}/hostels`, { headers: authHeaders() });

  if (!res.ok) {
    const err = await res.json();
    return alert(err.message);
  }

  const hostels = await res.json();
  container.innerHTML = '';

  hostels.forEach(h => {
    const used = h.occupancy;
    const card = document.createElement('div');
    card.className = 'room-card';
    card.innerHTML = `
      <img src="${h.image || 'default-hostel.jpg'}" alt="${h.name}" />
      <h3>${h.name}</h3>
      <p>${h.description}</p>
      <p><strong>Type:</strong> ${h.type}</p>
      <p><strong>Capacity:</strong> ${used} / ${h.capacity}</p>
      <button onclick="deleteHostel(${h.id})">Delete</button>
    `;
    container.appendChild(card);
  });
}

const hostelForm = document.getElementById('hostelForm');
if (hostelForm) {
  hostelForm.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('hostelName').value,
      description: document.getElementById('hostelDesc').value,
      image: document.getElementById('hostelImage').value,
      type: document.getElementById('hostelType').value,
      capacity: parseInt(document.getElementById('hostelCap').value, 10)
    };

    const res = await fetch(`${API_BASE}/hostels`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      return alert(err.message);
    }

    hostelForm.reset();
    renderHostels();
  });
}

async function deleteHostel(id) {
  if (!confirm('Delete this hostel?')) return;

  const res = await fetch(`${API_BASE}/hostels/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });

  if (!res.ok) {
    const err = await res.json();
    return alert(err.message);
  }

  renderHostels();
}

if (document.getElementById('hostelList')) {
  renderHostels();
}

if (document.getElementById('hostelContainer')) {
  loadHostelsForApply();
}
