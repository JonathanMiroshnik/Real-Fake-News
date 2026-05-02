---
### 📁 `src/`
Root of all source code.
---

### 📁 `assets/`

Static files like images, fonts, and global CSS.

---

### 📁 `components/`

Reusable UI building blocks (e.g., buttons, cards). These are **generic**, not tied to specific features.

---

### 📁 `features/`

Grouped by **business logic or domain** (e.g., auth, user profile). Each folder contains UI, state, and logic for that feature.

---

### 📁 `pages/`

Top-level views that correspond to routes (e.g., HomePage, LoginPage). They often compose features and components.

---

### 📁 `routes/`

Defines and organizes app routing using React Router or similar.

---

### 📁 `hooks/`

Custom reusable logic built with React hooks (e.g., `useAuth`, `useDebounce`).

---

### 📁 `lib/`

General-purpose utilities, API clients, or shared logic not specific to React.

---

### 📁 `types/`

Global TypeScript types and interfaces shared across the app.

---

### 📁 `context/`

React Contexts and Providers for global state (e.g., theme, auth, settings).

---

### 📄 `App.tsx`

Main component that wires everything together—routing, providers, layout.

---

### 📄 `main.tsx` / `index.tsx`

Entry point. Bootstraps the app and renders it to the DOM.

---
