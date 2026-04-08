# API Testing Guide - Day 2 Authentication

## Setup

Before testing, ensure:
1. Server is running: `npm run dev`
2. Add MONGO_URI to `.env` (or tests will work without MongoDB connected)

## Testing Tools

Use any of these:
- **Postman** (recommended) - https://www.postman.com/downloads/
- **Thunder Client** - VS Code extension
- **cURL** - Command line
- **REST Client** - VS Code extension

## API Endpoints

### 1. Register User

**Endpoint:** `POST http://localhost:5000/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### 2. Login User

**Endpoint:** `POST http://localhost:5000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3. Get Current User (Protected Route)

**Endpoint:** `GET http://localhost:5000/api/auth/me`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <your_jwt_token_here>
```

**Example with actual token:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY...
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

---

## Testing Steps

### Step 1: Register a New User

1. Open Postman → Create new request
2. Method: `POST`
3. URL: `http://localhost:5000/api/auth/register`
4. Go to Body → Raw → JSON
5. Paste:
```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```
6. Click **Send**
7. Save the token from response

Expected: Status `201 Created`

---

### Step 2: Test Duplicate Email

1. Use same request again with different name
2. Click **Send**

Expected: Status `400 Bad Request` - "Email already registered"

---

### Step 3: Test Wrong Password Confirmation

1. Create new request
2. URL: `http://localhost:5000/api/auth/register`
3. Body:
```json
{
  "name": "Bob Smith",
  "email": "bob@example.com",
  "password": "password123",
  "confirmPassword": "differentPassword"
}
```
4. Click **Send**

Expected: Status `400 Bad Request` - "Passwords do not match"

---

### Step 4: Login

1. Create new POST request
2. URL: `http://localhost:5000/api/auth/login`
3. Body:
```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```
4. Click **Send**
5. Copy the token from response

Expected: Status `200 OK` with token

---

### Step 5: Test Protected Route

1. Create new GET request
2. URL: `http://localhost:5000/api/auth/me`
3. Headers tab:
   - Key: `Authorization`
   - Value: `Bearer <paste_your_token_here>`
4. Click **Send**

Expected: Status `200 OK` with user details

---

### Step 6: Test Without Token

1. Same as Step 5 but don't add Authorization header
2. Click **Send**

Expected: Status `401 Unauthorized` - "Not authorized"

---

## cURL Examples

### Register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","confirmPassword":"password123"}'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Get Current User:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Key Points

✅ Passwords are hashed with bcryptjs (never stored in plain text)
✅ JWT tokens expire in 30 days
✅ Email validation ensures valid format
✅ Duplicate emails are prevented
✅ All errors have proper HTTP status codes
✅ Protected routes require valid JWT token

## Status Codes

- **200** - Successful login
- **201** - Successful registration
- **400** - Bad request (validation error)
- **401** - Unauthorized (invalid token, wrong password)
- **403** - Forbidden (inactive account)
- **404** - Not found
- **500** - Server error
