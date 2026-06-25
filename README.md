# AuraMenu — Self-Hosted Restaurant Menu App

A luxury restaurant menu app fully powered by **your own Supabase project**. No third-party backend. Your data stays yours.

## 🚀 Quick Setup (Per Restaurant)

### 1. Create a Supabase Project
Go to [supabase.com](https://supabase.com) → New Project → Choose a name and password.

### 2. Run the Database Setup
Open **SQL Editor** in your Supabase dashboard, paste the contents of `SUPABASE_SETUP.sql`, and click Run.

### 3. Create Image Storage Bucket
Go to **Storage** → New Bucket → Name: `menu-images` → Toggle **Public** ON → Create.

### 4. Get Your Credentials
Go to **Settings → API** and copy:
- Project URL: `https://xxxxxxxxxxxx.supabase.co`
- Anon / Public Key: `eyJhbGci...`

### 5. Deploy This App
Deploy to Vercel, Netlify, or any static host:
```bash
npm install
npm run build
# deploy the /dist folder
```

### 6. First-Time Connect
Open your deployed app → you'll see a **"Connect Your Database"** screen → paste your URL + Anon Key → Connect.

### 7. Go to Admin Panel
On the menu page, tap the user icon → Owner Login → use `admin` / `admin123` (change in Admin > Branding).

---

## 🏢 SaaS Model (Selling to Multiple Restaurants)

You deploy **one copy** of this app per restaurant (or use a single deployment and the restaurant owner enters their own Supabase credentials). Each restaurant has total data isolation via their own Supabase project.

### Deployment options:
- **Vercel**: Connect GitHub repo → Deploy → Share URL with restaurant → They connect their Supabase
- **Custom domain**: Restaurant connects their own domain via Admin > Hosting

---

## 🗂️ Architecture

```
Customer visits menu URL
    ↓
SupabaseGate checks localStorage for sb_url + sb_anon_key
    ↓ (if not set)
Shows "Connect Database" screen (one-time setup)
    ↓ (if set)
App loads — all data from the restaurant's Supabase project
    ↓
Admin Panel → Admin > Supabase → Can update credentials anytime
```

## 📦 Tech Stack
- React 18 + Vite
- Supabase REST API (no Supabase JS SDK needed)
- TanStack Query for data fetching
- Tailwind CSS + shadcn/ui
- Framer Motion
