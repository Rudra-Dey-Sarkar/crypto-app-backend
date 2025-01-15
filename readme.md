# Crypto Price Alert and User Management Backend

This is the backend for a crypto price alert and user management system. It is built using Node.js, Express, MongoDB, and other libraries for handling email notifications, scheduling tasks, and more.

## Features
- **User Registration and Login**:- Allows users to register and log in with secure credentials.
- **Password Recovery with OTP**:- Sends an OTP to the registered email for password reset.
- **Crypto Price Alerts**:- Fetches live crypto prices and checks user-defined criteria to send price alerts.
- **CRUD Operations on Criteria**:- Manage user-specific price monitoring criteria for crypto assets.
- **Automated Price Monitoring**:- Uses cron jobs to fetch crypto prices and send alerts continuously.

## Directory Structure
```
rudra-dey-sarkar-crypto-app-backend/
├── package.json           # Project dependencies and scripts
├── server.js              # Main server file
├── vercel.json            # Configuration for Vercel deployment
└── src/
    ├── config/
    │   └── db.js         # Database connection configuration
    └── models/
        ├── criteria.js  # Mongoose schema for user-defined criteria
        └── user.js      # Mongoose schema for user data
```

## Endpoints

### Root Endpoint
#### `GET /`
**Description:-** Test route to ensure the server is running.

**Response:-**
- Status 200:- Returns "Working" message.

### User Registration
#### `POST /register`
**Description:-** Registers a new user with unique username and email.

**Request Body:-**
```json
{
  "username":- "string",
  "email":- "string",
  "password":- "string"
}
```
**Response:-**
- Status 200:- Returns user data on success.
- Status 404:- Username or email already exists.

### User Login
#### `POST /login`
**Description:-** Authenticates a user using username or email and password.

**Request Body:-**
```json
{
  "username":- "string", // Optional
  "email":- "string",    // Optional
  "password":- "string"
}
```
**Response:-**
- Status 200:- Returns user data.
- Status 404:- Invalid credentials.

### Password Recovery (OTP Request)
#### `POST /forget-otp`
**Description:-** Sends a fixed OTP (123) for password reset.

**Request Body:-**
```json
{
  "username":- "string", // Optional
  "email":- "string"     // Optional
}
```
**Response:-**
- Status 200:- OTP sent to email.
- Status 404:- User not found.

### Password Update After OTP Verification
#### `PUT /forget`
**Description:-** Updates user password after verifying OTP.

**Request Body:-**
```json
{
  "otp":- "string",
  "username":- "string", // Optional
  "email":- "string",    // Optional
  "password":- "string"
}
```
**Response:-**
- Status 200:- Password updated successfully.
- Status 400:- Incorrect OTP.
- Status 404:- User not found.

### Get All Crypto Prices
#### `GET /crypto-prices`
**Description:-** Fetches real-time prices of all cryptocurrencies.

**Response:-**
- Status 200:- List of cryptocurrencies and their prices.
- Status 400:- Failed to fetch data.

### Add Criteria
#### `POST /add-criteria`
**Description:-** Adds user-specific criteria for monitoring crypto prices.

**Request Body:-**
```json
{
  "userId":- "string",
  "criteria":- [
    {
      "coinId":- "string",
      "less":- "number",
      "greater":- "number"
    }
  ]
}
```
**Response:-**
- Status 200:- Criteria added.
- Status 400:- Failed to add criteria.

### Edit Criteria
#### `PUT /edit-criteria`
**Description:-** Edits or adds new criteria for a user.

**Request Body:-**
```json
{
  "addNew":- true,
  "userId":- "string",
  "criteria":- {
    "coinId":- "string",
    "less":- "number",
    "greater":- "number"
  }
}
```
**Response:-**
- Status 200:- Criteria updated.
- Status 404:- User criteria not found.

## Environment Variables
Create a `.env` file in the root directory with:-
```
PORT=<port_number>
EMAIL=<your_email>
PW=<your_email_password>
COIN_GECKO=<coin_gecko_api_key>
```

## Dependencies
- `express` - Web framework for Node.js
- `mongoose` - MongoDB object modeling for Node.js
- `cors` - Middleware to enable CORS
- `dotenv` - Loads environment variables
- `nodemailer` - Sends email notifications
- `node-cron` - Schedules recurring tasks
- `node-fetch` - Fetches data from external APIs

## Usage
1. Install dependencies:-
   ```bash
   npm install
   ```
2. Start the server:-
   ```bash
   npm start
   ```

## Deployment
The backend is configured for Vercel deployment with the `vercel.json` file.