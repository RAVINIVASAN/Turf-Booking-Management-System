# TurfHub Frontend

Modern React frontend for the Turf Booking Management System.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API calls
- **Lucide React** - Icons

## Quick Start

```bash
cd client
npm install
npm run dev
```

App will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── Button.jsx
│   ├── Navbar.jsx
│   ├── LoadingSpinner.jsx
│   ├── Toast.jsx
│   └── ProtectedRoute.jsx
├── pages/            # Page components
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   └── TurfDetailsPage.jsx
├── context/          # React Context (Auth, Toast)
├── services/         # API integration
└── App.jsx          # Main app component
```

## Features

✅ User Authentication (Login/Register)
✅ Turf Browsing & Discovery
✅ Booking System with Time Slots
✅ Real-time Availability
✅ Price Display by Time Period
✅ Toast Notifications
✅ Protected Routes
✅ Responsive Design
✅ Modern Green Theme

## Routes

- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Browse all turfs (protected)
- `/turf/:id` - Turf details & booking (protected)

## Build

```bash
npm run build
npm run preview
```

For more details, see full documentation in the file.

