# 🕉️ Bhagwati Enterprises — Website

A full-stack spiritual products website built with vanilla HTML/CSS/JS and Firebase.

## 📁 File Structure

```
bhagwati-enterprises/
├── index.html      ← Main website (Home, Products, About, Contact)
├── admin.html      ← Admin panel (products + enquiries management)
├── style.css       ← All styles
├── app.js          ← Frontend logic (auth, products, enquiry form)
├── admin.js        ← Admin panel logic
├── firebase.js     ← Firebase config & exports
└── README.md
```

## 🚀 Deployment to Firebase Hosting

### Step 1 — Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Step 2 — Initialize Firebase Hosting
```bash
cd bhagwati-enterprises
firebase init hosting
```
- Select your project: `bhagwati-enterprises-1be1a`
- Public directory: `.` (current folder)
- Single-page app: **No**
- Overwrite index.html: **No**

### Step 3 — Deploy
```bash
firebase deploy --only hosting
```

Your site will be live at: `https://bhagwati-enterprises-1be1a.web.app`

---

## 🔥 Firebase Setup

### Firestore Rules
Go to Firebase Console → Firestore → Rules and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Products: public read, admin write only
    match /products/{id} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email in
        ['admin@bhagwatienterprises.in', 'sachin@bhagwatienterprises.in'];
    }

    // Enquiries: anyone can create, admin can read/update/delete
    match /enquiries/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && request.auth.token.email in
        ['admin@bhagwatienterprises.in', 'sachin@bhagwatienterprises.in'];
    }

    // Users: authenticated users can create their own profile
    match /users/{id} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && request.auth.uid == resource.data.uid;
    }
  }
}
```

### Create Admin Account
1. Go to Firebase Console → Authentication → Users → Add User
2. Email: `admin@bhagwatienterprises.in` (or your preferred admin email)
3. Set a strong password
4. Update `ADMIN_EMAILS` array in `admin.js` if you use a different email

---

## ✨ Features

| Feature | Details |
|---|---|
| 🏠 Home Page | Hero section with animated Om symbol |
| 🛕 Products | Filter by category, enquire from product card |
| 📖 About | Company story, values, images |
| 📩 Contact | Enquiry form saved to Firestore |
| 🔐 Auth | Customer login/register via Firebase Auth |
| 🛠️ Admin | Add/Edit/Delete products, manage enquiries |
| 📊 Dashboard | Live stats — products, enquiries, users |

---

## 🎨 Customisation

**Change store details** (address, phone, email) in `index.html` — search for `Bhagwati Enterprises,`

**Change admin email** in `admin.js` — update the `ADMIN_EMAILS` array

**Change colours** in `style.css` — edit the `:root` CSS variables at the top

---

Made with 🙏 for Bhagwati Enterprises
