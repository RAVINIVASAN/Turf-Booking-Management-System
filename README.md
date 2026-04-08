# Turf Booking Management System

A comprehensive booking management system for turf facilities built with Node.js, Express, and MongoDB.

## Project Structure

```
smart-turf-booking/
├── client/          # Frontend React application
├── server/          # Backend Node.js + Express server
│   ├── config/      # Database and configuration files
│   ├── controllers/ # Request handlers
│   ├── models/      # MongoDB schemas
│   ├── routes/      # API routes
│   ├── server.js    # Main server file
│   └── package.json # Dependencies
└── README.md        # Project documentation
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (for database)
- Git

## Backend Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` folder and add:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/turf_booking
PORT=5000
NODE_ENV=development
```

### 3. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication (Day 2)
- **POST** `/api/auth/register` - Register a new user
- **POST** `/api/auth/login` - Login and receive JWT token
- **GET** `/api/auth/me` - Get current user (protected)

### Health Check
- **GET** `/api/health` - Check server health

### Home
- **GET** `/` - Welcome message

## Authentication Features

✅ Secure password hashing with bcryptjs
✅ JWT token generation and validation
✅ Email uniqueness validation
✅ Password confirmation
✅ Protected routes with middleware
✅ 30-day token expiration
✅ Role-based access (user, admin, vendor)

For complete API testing guide, see `API_TESTING_GUIDE.md`

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Create a database user
4. Get the connection string
5. Add your connection string to `.env` file

## Features

- [x] User authentication (Day 2)
- [ ] Turf booking management
- [ ] Payment integration
- [ ] User profile management
- [ ] Admin dashboard
- [ ] Notifications

## Development

To start developing:

```bash
cd server
npm run dev
```

## License

ISC
