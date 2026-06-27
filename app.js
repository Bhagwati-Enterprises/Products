// ==========================================
//  Bhagwati Enterprises — Main App Logic
// ==========================================
import { auth, db } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection, addDoc, getDocs, query,
  orderBy, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---- Utility: Toast ----
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `show ${type}`;
  setTimeout(() => { t.className = ''; }, 3500);
}

// ---- Utility: Form message ----
function showMsg(el, msg, type) {
  el.textContent = msg;
  el.className = `form-msg ${type}`;
}

// ---- Footer year ----
document.getElementById('footer-year').textContent = new Date().getFullYear();

// =================== NAVBAR SCROLL ===================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ---- Hamburger ----
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// =================== AUTH STATE ===================
const navLoginItem = document.getElementById('nav-login-item');
const navUserInfo  = document.getElementById('nav-user-info');
const navUserName  = document.getElementById('nav-user-name');

onAuthStateChanged(auth, user => {
  if (user) {
    navLoginItem.style.display  = 'none';
    navUserInfo.style.display   = 'flex';
    navUserName.textContent = user.displayName || user.email.split('@')[0];
  } else {
    navLoginItem.style.display  = 'list-item';
    navUserInfo.style.display   = 'none';
  }
});

// ---- Logout ----
document.getElementById('btn-logout').addEventListener('click', async () => {
  await signOut(auth);
  showToast('You have been signed out. 🙏');
});

// =================== AUTH MODAL ===================
const authModal = document.getElementById('auth-modal');

document.getElementById('btn-open-auth').addEventListener('click', e => {
  e.preventDefault();
  authModal.classList.add('open');
});
document.getElementById('auth-modal-close').addEventListener('click', () => {
  authModal.classList.remove('open');
});
authModal.addEventListener('click', e => {
  if (e.target === authModal) authModal.classList.remove('open');
});

// ---- Tabs ----
document.querySelectorAll('.modal-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
  });
});

// ---- Login ----
document.getElementById('btn-login').addEventListener('click', async () => {
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-pass').value;
  const msgEl = document.getElementById('login-msg');
  if (!email || !pass) { showMsg(msgEl, 'Please fill in all fields.', 'error'); return; }
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    authModal.classList.remove('open');
    showToast('Welcome back! 🙏', 'success');
  } catch(err) {
    showMsg(msgEl, friendlyError(err.code), 'error');
  }
});

// ---- Register ----
document.getElementById('btn-register').addEventListener('click', async () => {
  const fname = document.getElementById('r-fname').value.trim();
  const lname = document.getElementById('r-lname').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const pass  = document.getElementById('r-pass').value;
  const msgEl = document.getElementById('register-msg');
  if (!fname || !email || !pass) { showMsg(msgEl, 'Please fill in all required fields.', 'error'); return; }
  if (pass.length < 6)           { showMsg(msgEl, 'Password must be at least 6 characters.', 'error'); return; }
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: `${fname} ${lname}`.trim() });
    // Store user in Firestore
    await addDoc(collection(db, 'users'), {
      uid: cred.user.uid,
      name: `${fname} ${lname}`.trim(),
      email,
      createdAt: serverTimestamp(),
      role: 'customer'
    });
    authModal.classList.remove('open');
    showToast(`Welcome, ${fname}! 🙏`, 'success');
  } catch(err) {
    showMsg(msgEl, friendlyError(err.code), 'error');
  }
});

// ---- Forgot Password ----
document.getElementById('btn-forgot').addEventListener('click', async e => {
  e.preventDefault();
  const email = document.getElementById('l-email').value.trim();
  const msgEl = document.getElementById('login-msg');
  if (!email) { showMsg(msgEl, 'Enter your email address above first.', 'error'); return; }
  try {
    await sendPasswordResetEmail(auth, email);
    showMsg(msgEl, 'Password reset email sent! Check your inbox.', 'success');
  } catch(err) {
    showMsg(msgEl, friendlyError(err.code), 'error');
  }
});

function friendlyError(code) {
  const map = {
    'auth/user-not-found':      'No account found with this email.',
    'auth/wrong-password':      'Incorrect password. Please try again.',
    'auth/email-already-in-use':'This email is already registered.',
    'auth/invalid-email':       'Please enter a valid email address.',
    'auth/weak-password':       'Password is too weak. Use at least 6 characters.',
    'auth/too-many-requests':   'Too many attempts. Please try again later.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

// =================== PRODUCTS ===================
let allProducts = [];
let activeFilter = 'all';

async function loadProducts() {
  const grid   = document.getElementById('products-grid');
  const loader = document.getElementById('products-loader');
  const noEl   = document.getElementById('no-products');
  loader.style.display = 'block';
  grid.innerHTML = '';
  noEl.style.display = 'none';

  try {
    const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
    allProducts = [];
    snap.forEach(doc => allProducts.push({ id: doc.id, ...doc.data() }));
    loader.style.display = 'none';

    if (allProducts.length === 0) {
      // Show demo products if Firestore is empty
      allProducts = getDemoProducts();
    }
    renderProducts();
  } catch(err) {
    loader.style.display = 'none';
    // Fallback to demo products on error
    allProducts = getDemoProducts();
    renderProducts();
  }
}

function getDemoProducts() {
  return [
    { id:'d1', name:'Brass Ganesha Idol', category:'Idols & Murtis', price:899, description:'Handcrafted pure brass Ganesha murti, perfect for home puja altar.', imageUrl:'images/idols-murtis.jpg', badge:'Popular', available:true },
    { id:'d2', name:'Pure Ghee Diyas (Set of 12)', category:'Pooja Essentials', price:199, description:'Traditional clay diyas for lighting during aarti and festivals.', imageUrl:'images/pooja-essentials.jpg', badge:'', available:true },
    { id:'d3', name:'Chandan Agarbatti Box', category:'Incense & Dhoop', price:149, description:'Pure sandalwood incense sticks for divine fragrance during prayer.', imageUrl:'images/incense-dhoop.jpg', badge:'New', available:true },
    { id:'d4', name:'Copper Puja Thali Set', category:'Puja Thali', price:1299, description:'Complete copper thali with diya, ghanti, and incense holder.', imageUrl:'images/puja-thali.jpg', badge:'', available:true },
    { id:'d5', name:'Bhagavad Gita (Hindi)', category:'Sacred Books', price:299, description:'Illustrated Bhagavad Gita in Hindi with commentary. Hardcover edition.', imageUrl:'images/sacred-books.jpg', badge:'', available:true },
    { id:'d6', name:'Om Wall Hanging', category:'Spiritual Decor', price:549, description:'Brass Om symbol wall hanging, perfect for prayer rooms and living spaces.', imageUrl:'images/spiritual-decor.jpg', badge:'', available:true },
    { id:'d7', name:'Kumkum & Haldi Set', category:'Pooja Essentials', price:129, description:'Pure kumkum and haldi in decorative containers for daily puja.', imageUrl:'images/pooja-essentials.jpg', badge:'', available:true },
    { id:'d8', name:'Silver-Plated Lakshmi Idol', category:'Idols & Murtis', price:1599, description:'Beautifully crafted silver-plated Maa Lakshmi for home and office blessing.', imageUrl:'images/idols-murtis.jpg', badge:'Premium', available:true },
  ];
}

function renderProducts() {
  const grid  = document.getElementById('products-grid');
  const noEl  = document.getElementById('no-products');
  const items = activeFilter === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === activeFilter);

  grid.innerHTML = '';
  if (items.length === 0) { noEl.style.display = 'block'; return; }
  noEl.style.display = 'none';

  items.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img-wrap">
        <img src="${p.imageUrl || 'images/idols-murtis.jpg'}" alt="${p.name}" loading="lazy" />
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
      </div>
      <div class="product-body">
        <div class="product-category">${p.category || 'Spiritual Products'}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.description || ''}</div>
        <div class="product-footer">
          <div class="product-price">₹${Number(p.price).toLocaleString('en-IN')} <span>/ piece</span></div>
          <button class="btn-enquire" data-name="${p.name}">Enquire</button>
        </div>
      </div>`;
    card.querySelector('.btn-enquire').addEventListener('click', () => {
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      document.getElementById('c-subject').value = 'Product Enquiry';
      document.getElementById('c-message').value = `I am interested in: ${p.name}. Please share more details.`;
      setTimeout(() => document.getElementById('c-name').focus(), 600);
    });
    grid.appendChild(card);
  });
}

// ---- Filter buttons ----
document.getElementById('products-filters').addEventListener('click', e => {
  if (!e.target.classList.contains('filter-btn')) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  activeFilter = e.target.dataset.filter;
  renderProducts();
});

// =================== ENQUIRY FORM ===================
document.getElementById('btn-send-enquiry').addEventListener('click', async () => {
  const name    = document.getElementById('c-name').value.trim();
  const phone   = document.getElementById('c-phone').value.trim();
  const email   = document.getElementById('c-email').value.trim();
  const subject = document.getElementById('c-subject').value;
  const message = document.getElementById('c-message').value.trim();
  const msgEl   = document.getElementById('contact-msg');

  if (!name || !phone || !subject || !message) {
    showMsg(msgEl, '⚠️ Please fill in all required fields.', 'error');
    return;
  }

  const btn = document.getElementById('btn-send-enquiry');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  try {
    await addDoc(collection(db, 'enquiries'), {
      name, phone, email, subject, message,
      status: 'new',
      createdAt: serverTimestamp()
    });
    showMsg(msgEl, '🙏 Thank you! Your enquiry has been received. We will contact you shortly.', 'success');
    ['c-name','c-phone','c-email','c-message'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('c-subject').value = '';
    showToast('Enquiry sent successfully! 🙏', 'success');
  } catch(err) {
    showMsg(msgEl, '❌ Failed to send. Please try again or call us directly.', 'error');
  } finally {
    btn.textContent = '🙏 Send Enquiry';
    btn.disabled = false;
  }
});

// =================== INIT ===================
loadProducts();
