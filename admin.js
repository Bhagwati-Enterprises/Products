// ==========================================
//  Bhagwati Enterprises — Admin Panel Logic
// ==========================================
import { auth, db } from './firebase.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection, addDoc, getDocs, getDoc, doc,
  updateDoc, deleteDoc, query, orderBy, serverTimestamp, where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---- Config: set your admin email here ----
// For production, use Firebase custom claims instead.
const ADMIN_EMAILS = ['admin@bhagwatienterprises.in', 'sachin@bhagwatienterprises.in'];

// ---- Toast ----
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `show ${type}`;
  setTimeout(() => { t.className = ''; }, 3500);
}

function showFormMsg(elId, msg, type) {
  const el = document.getElementById(elId);
  el.textContent = msg;
  el.className = `form-msg ${type}`;
  setTimeout(() => { el.className = 'form-msg'; el.textContent = ''; }, 5000);
}

function fmtDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

// =================== AUTH ===================
const loginScreen   = document.getElementById('admin-login');
const dashboard     = document.getElementById('admin-dashboard');

onAuthStateChanged(auth, user => {
  if (user && ADMIN_EMAILS.includes(user.email)) {
    loginScreen.style.display = 'none';
    dashboard.style.display   = 'block';
    document.getElementById('admin-email-display').textContent = user.email;
    loadDashboard();
  } else if (user) {
    // Logged in but not admin
    signOut(auth);
    showFormMsg('admin-login-msg', 'Access denied. Admin accounts only.', 'error');
    loginScreen.style.display = 'flex';
    dashboard.style.display   = 'none';
  } else {
    loginScreen.style.display = 'flex';
    dashboard.style.display   = 'none';
  }
});

document.getElementById('btn-admin-login').addEventListener('click', async () => {
  const email = document.getElementById('al-email').value.trim();
  const pass  = document.getElementById('al-pass').value;
  if (!email || !pass) { showFormMsg('admin-login-msg', 'Please enter email and password.', 'error'); return; }
  const btn = document.getElementById('btn-admin-login');
  btn.textContent = 'Signing in…'; btn.disabled = true;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch(err) {
    showFormMsg('admin-login-msg', 'Invalid credentials. Please try again.', 'error');
    btn.textContent = 'Sign In to Admin'; btn.disabled = false;
  }
});

document.getElementById('btn-admin-logout').addEventListener('click', async () => {
  await signOut(auth);
  showToast('Signed out successfully.');
});

// =================== NAVIGATION ===================
document.querySelectorAll('[data-page]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(link.dataset.page);
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    document.querySelector(`.sidebar-nav a[data-page="${link.dataset.page}"]`)?.classList.add('active');
  });
});

document.getElementById('goto-add-product').addEventListener('click', () => navigateTo('add-product'));

function navigateTo(page) {
  document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`)?.classList.add('active');
  if (page === 'dashboard') loadDashboard();
  if (page === 'products')  loadProducts();
  if (page === 'enquiries') loadEnquiries();
  if (page === 'add-product') resetProductForm();
}

// =================== DASHBOARD ===================
async function loadDashboard() {
  try {
    const [prodSnap, enquirySnap, userSnap] = await Promise.all([
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'enquiries')),
      getDocs(collection(db, 'users'))
    ]);
    document.getElementById('stat-products').textContent  = prodSnap.size;
    document.getElementById('stat-enquiries').textContent = enquirySnap.size;
    document.getElementById('stat-users').textContent     = userSnap.size;

    let newCount = 0;
    const rows = [];
    enquirySnap.forEach(d => {
      const e = { id: d.id, ...d.data() };
      if (e.status === 'new') newCount++;
      rows.push(e);
    });
    document.getElementById('stat-new').textContent = newCount;

    // Recent 5 enquiries
    const tbody = document.getElementById('dash-enquiries-body');
    tbody.innerHTML = '';
    rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 5).forEach(e => {
        tbody.innerHTML += `<tr>
          <td><strong>${e.name}</strong></td>
          <td>${e.subject}</td>
          <td>${e.phone}</td>
          <td><span class="status-badge ${e.status || 'new'}">${e.status || 'new'}</span></td>
          <td>${fmtDate(e.createdAt)}</td>
        </tr>`;
      });
    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="table-empty">No enquiries yet.</td></tr>';
    }
  } catch(err) {
    console.error('Dashboard load error:', err);
  }
}

// =================== PRODUCTS ===================
async function loadProducts() {
  const tbody = document.getElementById('products-table-body');
  const emptyEl = document.getElementById('products-table-empty');
  tbody.innerHTML = '<tr><td colspan="6" class="table-empty"><div class="spinner"></div></td></tr>';

  try {
    const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
    tbody.innerHTML = '';
    if (snap.empty) { emptyEl.style.display = 'block'; return; }
    emptyEl.style.display = 'none';

    snap.forEach(d => {
      const p = { id: d.id, ...d.data() };
      tbody.innerHTML += `<tr>
        <td><img src="${p.imageUrl || ''}" class="product-thumb" alt="${p.name}" onerror="this.style.display='none'" /></td>
        <td><strong>${p.name}</strong></td>
        <td>${p.category || '—'}</td>
        <td><strong>₹${Number(p.price).toLocaleString('en-IN')}</strong></td>
        <td><span class="status-badge ${p.available !== false ? 'avail' : 'unavail'}">${p.available !== false ? 'Available' : 'Out of Stock'}</span></td>
        <td>
          <button class="btn-table-action btn-edit" data-id="${p.id}">Edit</button>
          <button class="btn-table-action btn-delete" data-id="${p.id}" data-name="${p.name}">Delete</button>
        </td>
      </tr>`;
    });

    // Edit buttons
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => loadProductForEdit(btn.dataset.id));
    });
    // Delete buttons
    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteProduct(btn.dataset.id, btn.dataset.name));
    });
  } catch(err) {
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Error loading products.</td></tr>';
  }
}

async function loadProductForEdit(productId) {
  navigateTo('add-product');
  try {
    const snap = await getDoc(doc(db, 'products', productId));
    if (!snap.exists()) { showToast('Product not found.', 'error'); return; }
    const p = snap.data();
    document.getElementById('edit-product-id').value   = productId;
    document.getElementById('p-name').value            = p.name || '';
    document.getElementById('p-category').value        = p.category || '';
    document.getElementById('p-price').value           = p.price || '';
    document.getElementById('p-badge').value           = p.badge || '';
    document.getElementById('p-available').value       = p.available !== false ? 'true' : 'false';
    document.getElementById('p-desc').value            = p.description || '';
    document.getElementById('p-image-url').value       = p.imageUrl || '';
    previewImage(p.imageUrl);
    document.getElementById('add-product-heading').textContent = 'Edit Product';
    document.getElementById('product-form-title').textContent  = 'Edit Product Details';
    document.getElementById('btn-save-product').textContent    = '💾 Update Product';
    document.getElementById('btn-cancel-edit').style.display   = 'inline-flex';
  } catch(err) {
    showToast('Error loading product.', 'error');
  }
}

async function deleteProduct(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  try {
    await deleteDoc(doc(db, 'products', id));
    showToast(`"${name}" deleted.`, 'success');
    loadProducts();
  } catch(err) {
    showToast('Error deleting product.', 'error');
  }
}

// =================== ADD / EDIT PRODUCT ===================
document.getElementById('p-image-url').addEventListener('input', e => previewImage(e.target.value));

function previewImage(url) {
  const img = document.getElementById('img-preview');
  if (url) {
    img.src = url;
    img.style.display = 'block';
    img.onerror = () => { img.style.display = 'none'; };
  } else {
    img.style.display = 'none';
  }
}

function resetProductForm() {
  document.getElementById('edit-product-id').value        = '';
  document.getElementById('p-name').value                 = '';
  document.getElementById('p-category').value             = '';
  document.getElementById('p-price').value                = '';
  document.getElementById('p-badge').value                = '';
  document.getElementById('p-available').value            = 'true';
  document.getElementById('p-desc').value                 = '';
  document.getElementById('p-image-url').value            = '';
  document.getElementById('img-preview').style.display    = 'none';
  document.getElementById('add-product-heading').textContent = 'Add New Product';
  document.getElementById('product-form-title').textContent  = 'Product Details';
  document.getElementById('btn-save-product').textContent    = '💾 Save Product';
  document.getElementById('btn-cancel-edit').style.display   = 'none';
}

document.getElementById('btn-cancel-edit').addEventListener('click', () => {
  resetProductForm();
  navigateTo('products');
});

document.getElementById('btn-save-product').addEventListener('click', async () => {
  const editId  = document.getElementById('edit-product-id').value;
  const name     = document.getElementById('p-name').value.trim();
  const category = document.getElementById('p-category').value;
  const price    = document.getElementById('p-price').value;
  const badge    = document.getElementById('p-badge').value.trim();
  const available= document.getElementById('p-available').value === 'true';
  const desc     = document.getElementById('p-desc').value.trim();
  const imageUrl = document.getElementById('p-image-url').value.trim();

  if (!name || !category || !price || !desc) {
    showFormMsg('product-form-msg', 'Please fill in all required fields.', 'error'); return;
  }

  const btn = document.getElementById('btn-save-product');
  btn.textContent = 'Saving…'; btn.disabled = true;

  const data = { name, category, price: Number(price), badge, available, description: desc, imageUrl };

  try {
    if (editId) {
      await updateDoc(doc(db, 'products', editId), { ...data, updatedAt: serverTimestamp() });
      showToast(`"${name}" updated successfully! 🙏`);
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, 'products'), data);
      showToast(`"${name}" added successfully! 🙏`);
    }
    resetProductForm();
    navigateTo('products');
  } catch(err) {
    showFormMsg('product-form-msg', 'Error saving product. Please try again.', 'error');
  } finally {
    btn.textContent = editId ? '💾 Update Product' : '💾 Save Product';
    btn.disabled = false;
  }
});

// =================== ENQUIRIES ===================
async function loadEnquiries() {
  const tbody  = document.getElementById('enquiries-table-body');
  const emptyEl = document.getElementById('enquiries-table-empty');
  tbody.innerHTML = '<tr><td colspan="6" class="table-empty"><div class="spinner"></div></td></tr>';

  try {
    const snap = await getDocs(query(collection(db, 'enquiries'), orderBy('createdAt', 'desc')));
    tbody.innerHTML = '';
    if (snap.empty) { emptyEl.style.display = 'block'; return; }
    emptyEl.style.display = 'none';

    snap.forEach(d => {
      const e = { id: d.id, ...d.data() };
      const rowId = `eq-row-${e.id}`;
      tbody.innerHTML += `
        <tr id="${rowId}" class="enquiry-row">
          <td><strong>${e.name}</strong><br><span style="font-size:0.75rem;color:var(--text-light);">${e.email || ''}</span></td>
          <td>${e.phone}</td>
          <td>${e.subject}</td>
          <td>
            <select class="status-select" data-id="${e.id}" style="border:1px solid var(--ivory-dark);border-radius:5px;padding:4px 8px;font-size:0.78rem;">
              <option value="new"     ${e.status==='new'     ?'selected':''}>New</option>
              <option value="read"    ${e.status==='read'    ?'selected':''}>Read</option>
              <option value="replied" ${e.status==='replied' ?'selected':''}>Replied</option>
              <option value="closed"  ${e.status==='closed'  ?'selected':''}>Closed</option>
            </select>
          </td>
          <td>${fmtDate(e.createdAt)}</td>
          <td>
            <button class="btn-table-action btn-view" data-rowid="${rowId}">View</button>
            <button class="btn-table-action btn-delete" data-id="${e.id}">Delete</button>
          </td>
        </tr>
        <tr><td colspan="6" style="padding:0 16px 12px;">
          <div class="enquiry-message" id="msg-${e.id}">
            <strong>Message:</strong><br>${e.message}
          </div>
        </td></tr>`;
    });

    // View toggle
    tbody.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = document.getElementById(btn.dataset.rowid);
        const msgEl = document.getElementById(`msg-${btn.dataset.rowid.replace('eq-row-', '')}`);
        row.classList.toggle('expanded');
        msgEl.style.display = row.classList.contains('expanded') ? 'block' : 'none';
        btn.textContent = row.classList.contains('expanded') ? 'Hide' : 'View';
      });
    });

    // Status change
    tbody.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        try {
          await updateDoc(doc(db, 'enquiries', sel.dataset.id), { status: sel.value });
          showToast('Status updated.');
        } catch { showToast('Error updating status.', 'error'); }
      });
    });

    // Delete
    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this enquiry?')) return;
        try {
          await deleteDoc(doc(db, 'enquiries', btn.dataset.id));
          showToast('Enquiry deleted.');
          loadEnquiries();
        } catch { showToast('Error deleting enquiry.', 'error'); }
      });
    });
  } catch(err) {
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Error loading enquiries.</td></tr>';
  }
}
