# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" or "Sign Up"
3. Create an account with email and password
4. Verify your email

## Step 2: Create a Cluster

1. After login, click "Create" to build a new database
2. Select **Free** tier (M0)
3. Choose your preferred cloud provider (AWS recommended)
4. Select a region close to you
5. Click "Create Cluster" (takes 5-10 minutes to initialize)

## Step 3: Create Database User

1. In the left sidebar, go to **Security** → **Database Access**
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Set username: `turf_user`
5. Set password: Create a strong password (save this!)
6. Click **Add User**

## Step 4: Allow Network Access

1. In the left sidebar, go to **Security** → **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (or add your IP)
4. Click **Confirm**

## Step 5: Get Connection String

1. Go to **Deployment** → **Databases**
2. Click "Connect" on your cluster
3. Select "Drivers" (Node.js)
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `myFirstDatabase` with `turf_booking`

## Step 6: Add to .env File

In `server/.env`, replace the MONGO_URI:

```env
MONGO_URI=mongodb+srv://turf_user:YOUR_PASSWORD@cluster0.mongodb.net/turf_booking
PORT=5000
NODE_ENV=development
```

## Example Connection String

```
mongodb+srv://turf_user:SecurePassword123@cluster0.1q2w3.mongodb.net/turf_booking?retryWrites=true&w=majority
```

## Troubleshooting

- **Connection timeout**: Check if your IP is whitelisted in Network Access
- **Authentication failed**: Verify username, password, and cluster name
- **Connection string issue**: Make sure there are no special characters without URL encoding

## Verify Connection

After adding MONGO_URI to .env, run:

```bash
npm run dev
```

You should see:
```
✔ Server is running on http://localhost:5000
✔ MongoDB Connected: cluster0.mongodb.net
```
