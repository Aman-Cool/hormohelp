# HarmoHelp — Hormonal Wellness Platform

A full-featured hormonal health web application built with React. HarmoHelp empowers users to track symptoms, access evidence-based education, connect with a community, shop for wellness products, and book consultations with health experts — all in one seamless platform.

---

## Features

- **Symptom Tracker** — Log daily symptoms with severity sliders and notes; visualize trends over time
- **Personalized Dashboard** — Real-time charts for symptom severity and weekly activity, streak tracking, health score, and daily goals
- **Educational Hub** — Filterable library of videos, articles, infographics, PDFs, and quizzes across hormone health topics
- **Community Forum** — Post, like, comment, and engage with thousands of members across categorized health discussions
- **Health & Wellness Shop** — Browse and cart 12+ curated hormone-health products with search, filter, and sort
- **Consultation Booking** — Multi-step booking flow for video, phone, or text consultations with licensed professionals
- **Authentication Flow** — Sign up, sign in, and a 4-step personalized onboarding experience
- **Protected Routes** — Dashboard and inner pages are gated behind authentication

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| Icons | Lucide React |
| State | React Context API |

---

## Project Structure

```
hormohelp/
├── public/
├── src/
│   ├── components/
│   │   └── DashboardNav.jsx       # Persistent inner-app navigation
│   ├── context/
│   │   └── AuthContext.js         # Global auth state
│   ├── pages/
│   │   ├── HomePage.jsx           # Landing page
│   │   ├── LoginPage.jsx          # Sign in
│   │   ├── SignupPage.jsx         # Create account
│   │   ├── OnboardingPage.jsx     # 4-step onboarding wizard
│   │   ├── DashboardPage.jsx      # User health overview
│   │   ├── SymptomTrackerPage.jsx # Daily symptom logging
│   │   ├── EducationPage.jsx      # Content hub
│   │   ├── CommunityPage.jsx      # Forum & discussions
│   │   ├── ShopPage.jsx           # Product store
│   │   └── ConsultationsPage.jsx  # Expert booking
│   ├── App.jsx                    # Router configuration
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles + Tailwind
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v16 or higher
- npm v8 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/Aman-Cool/hormohelp.git

# Navigate into the project
cd hormohelp

# Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

The optimized output will be in the `dist/` folder, ready to deploy to any static hosting provider (Vercel, Netlify, GitHub Pages, etc.).

### Preview Production Build

```bash
npm run preview
```

---

## Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | Home | No |
| `/login` | Sign In | No |
| `/signup` | Create Account | No |
| `/onboarding` | Personalization Wizard | Yes |
| `/dashboard` | Health Overview | Yes |
| `/symptom-tracker` | Symptom Logger | Yes |
| `/education` | Educational Hub | Yes |
| `/community` | Community Forum | Yes |
| `/shop` | Wellness Store | Yes |
| `/consultations` | Book a Consultation | Yes |

---

## Design

The UI follows a consistent visual identity throughout:

- **Color palette** — Warm cream (`#FFFBEF`), deep navy (`#1a1a2e`), soft yellow accents (`#D4B83A`), and light blue tones
- **Typography** — Inter (Google Fonts) with heavy black weights for headings
- **Components** — Rounded cards, pill buttons, gradient hero sections, and data visualizations
- **Layout** — Fully responsive with a sticky navigation bar on all inner pages

---

## License

This project is private. All rights reserved.
