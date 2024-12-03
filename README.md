# **Role-Based Access Control (Restaurant Management System Backend)**

## **Overview**
This backend service implements a role-based restaurant management system with robust user authentication and access control. It features user account management, email-based activation, and role-specific functionalities. Built with **Node.js**, **Express**, **MongoDB**, and **TypeScript**, the system ensures secure and efficient operations.

---

## **Features**
- **Role-Based Access Control:** Supports roles such as Admin, Cook, Waiter, and Accounts.
- **Secure Authentication:** Uses JWT for Access and Refresh tokens.
- **Email Activation:** Account activation through email-based verification.
- **Password Management:** Secure password hashing and change functionality.
- **User Management:** Full CRUD operations for user accounts.
- **Active Member Filtering:** Retrieve all active members.

---

## **Setup Instructions**

### Clone and Navigate to the Project
```bash
git clone https://github.com/AyushiSrivastava11/VRV-Backend
cd VRV-Backend/server
npm install
touch .env
```

### Configure the `.env` File
Create a `.env` file in the project root and include the following variables:

```
PORT=5000
MONGO_URI=<Your MongoDB connection string>
ACTIVATION_SECRET=<Your activation secret>
ACCESS_TOKEN=<Your access token secret>
REFRESH_TOKEN=<Your refresh token secret>
SMTP_HOST=<SMTP host for email>
SMTP_PORT=<SMTP port for email>
SMTP_EMAIL=<Your email address>
SMTP_PASSWORD=<Your email password>
TWILIO_ACCOUNT_SID=<Twilio Account SID>
TWILIO_AUTH_TOKEN=<Twilio Auth Token>
TWILIO_PHONE_NUMBER=<Twilio Phone Number>
JWT_SECRET=<JWT secret key>

```

---

## **Running the Application**

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

---

## **Folder Structure**

```
├── src
│   ├── controllers
│   │   └── admin.controller.ts, user.controller.ts
│   ├── middlewares
│   │   ├── auth.ts
│   │   └── catchAsyncErrors.ts
│   ├── models
│   │   └── admin.model.ts , user.model.ts
│   ├── routes
│   │   └── admin.routes.ts , user.routes.ts
│   ├── services
│   │   └── admin.service.ts
│   ├── utils
│   │   ├── db.ts
│   │   ├── ErrorHandler.ts
│   │   ├── jwt.ts
│   │   └── sendMail.ts
│   ├── app.ts
│   └── server.ts
├── dist (Generated after build)
├── .env
├── tsconfig.json
├── package.json
└── README.md
```

---

## **Admin API Routes**

| **Route**                       | **HTTP Method** | **Middleware**           | **Description**                   |
|----------------------------------|-----------------|---------------------------|-----------------------------------|
| `/api/admin/register`           | POST            | None                      | Register a new admin             |
| `/api/admin/activate`           | POST            | None                      | Activate an admin account        |
| `/api/admin/login`              | POST            | None                      | Log in as admin                  |
| `/api/admin/logout`             | GET             | isAuthenticated           | Log out current admin            |
| `/api/admin/refresh`            | GET             | None                      | Refresh access token             |
| `/api/admin/me`                 | GET             | isAuthenticated           | Get current admin details        |
| `/api/admin/update-user-role`   | PUT             | isAuthenticated, validateRole | Update user role                |
| `/api/admin/update-info`        | PUT             | isAuthenticated           | Update admin profile information |
| `/api/admin/delete-user/:id`    | DELETE          | isAuthenticated, validateRole | Delete a user by ID             |
| `/api/admin/get-all-users`      | GET             | isAuthenticated, validateRole | Get all users                   |
| `/api/admin/change-password`    | PUT             | isAuthenticated           | Change admin password            |
| `/api/admin/get-all-active-members` | GET         | isAuthenticated, validateRole | Get all active users            |

---

## **Admin Model**

### Schema Fields
- **name**: `String` (Required)
- **email**: `String` (Required, Unique, Regex Validated)
- **password**: `String` (Required, Hashed before saving)
- **avatar**: `Object` (Contains `url` and `public_id`)
- **role**: `Enum` (Values: `["cook", "admin", "accounts", "waiter"]`)
- **isActive**: `Boolean` (Default: `true`)

### Schema Methods
- **`comparePassword(password)`**: Compares a provided password with the hashed password.
- **`SignAccessToken()`**: Generates a short-lived access token.
- **`SignRefreshToken()`**: Generates a long-lived refresh token.

---

## **Admin Workflow**

1. **Register**  
   Admins register with their name, email, password, and role. An activation email is sent with a unique activation code.

2. **Activate**  
   Admin activates their account using the activation token and code sent via email.

3. **Login**  
   Admin logs in using their email and password. If valid, access and refresh tokens are issued.

4. **Access & Refresh Tokens**  
   - **Access Tokens**: Expire after 15 minutes.  
   - **Refresh Tokens**: Valid for 7 days. Used to obtain new access tokens.

5. **Manage Users**  
   Admins can view, update, or delete users based on roles.

---

## **Tech Stack**
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (Access and Refresh Tokens)
- **Email Service**: Nodemailer with EJS templating
- **Environment Management**: dotenv

---

## **Scripts**

| **Script**    | **Command**      | **Description**                  |
|---------------|------------------|----------------------------------|
| `dev`         | `npm run dev`    | Run the server in development mode |
| `build`       | `npm run build`  | Compile TypeScript to JavaScript |
| `start`       | `npm start`      | Run the compiled server          |



Here’s the **User Section** of the `README.md`, tailored to your flow. It explains the simple, one-time-order-by-QR-code functionality, integrating the OTP-based authentication, order retrieval, and the overall flow:

---

# **User Authentication & Order Management (Restaurant Management System)**

## **Overview**
This section of the system handles user authentication via **OTP (One-Time Password)** for secure login and allows users to view and manage their orders. The flow is designed to be straightforward, enabling one-time orders by scanning a **QR Code**. The system focuses on easy user authentication and order management for a seamless experience.

---

## **Features**
- **OTP-Based Authentication:** Users authenticate using their phone number and receive a one-time OTP via SMS.
- **Secure Login:** Once verified, users can access their profile and view their orders.
- **Order Management:** Users can retrieve their past orders via their profile.

---

## **How it Works**

### **1. Send OTP (Request a One-Time Password)**
To authenticate the user and start the process, send an OTP to the user’s phone number.

**Endpoint:** `/send-otp`  
**Method:** `POST`  
**Request Body:**
```json
{
  "phone": "<user_phone_number>"
}
```

- **Description:** This endpoint will generate a one-time OTP and send it to the provided phone number via SMS using Twilio.
- **Response:**  
  - **200 OK:** OTP sent successfully.
  - **400 Bad Request:** If the phone number is not provided.

### **2. Verify OTP (Authenticate User)**
Once the OTP is received, the user must verify it to authenticate their session.

**Endpoint:** `/verify-otp`  
**Method:** `POST`  
**Request Body:**
```json
{
  "phone": "<user_phone_number>",
  "otp": "<received_otp>"
}
```

- **Description:** This endpoint will verify the provided OTP for the given phone number. If correct, a JWT token will be generated and returned to the user.
- **Response:**  
  - **200 OK:** Authentication successful, returns JWT token and user details.
  - **400 Bad Request:** If OTP is invalid or expired.
  - **404 Not Found:** If the OTP is not found or expired in the database.

### **3. Get User Orders**
After a successful login, users can view their past orders.

**Endpoint:** `/orders`  
**Method:** `GET`  
**Request Headers:**
```json
{
  "Authorization": "Bearer <JWT_token>"
}
```

- **Description:** This endpoint fetches the orders associated with the authenticated user’s phone number.
- **Response:**  
  - **200 OK:** Returns the user’s orders.
  - **400 Bad Request:** If the phone number or JWT token is missing or invalid.
  - **404 Not Found:** If no user is found with the provided phone number.

---

## **Flow Example**

1. **User Registration:** The user sends a request to `/send-otp` with their phone number. An OTP is sent via SMS.
2. **OTP Verification:** The user then sends the received OTP to `/verify-otp`. If correct, a JWT token is generated, and they are authenticated.
3. **Order Retrieval:** The authenticated user can then view their orders by sending a GET request to `/orders`, passing the JWT token in the header.

---



## Menu Management Flow

This project implements a robust backend system for managing menu items and categories in a restaurant application. Below is the detailed flow for the `Menu` module, showcasing the schema design, controller logic, and routing.

### 1. Schemas and Models

- **Category Schema**: Represents the category of menu items.
  - Fields:
    - `name` (required, string)

- **Menu Schema**: Represents individual menu items.
  - Fields:
    - `name` (required, string)
    - `description` (required, string)
    - `price` (required, number)
    - `image` (optional, string)
    - `categoryId` (required, objectId, references `Category`)
    - `type` (required, string)
    - `size` (required, string)
    - `availability` (required, string)

### 2. Controller Methods

- **Category Management**:
  - `createCategory`: Adds a new category to the database.
  - `updateCategory`: Updates the name of an existing category.
  - `deleteCategory`: Deletes an existing category.
  - `getCategory`: Fetches all categories.

- **Menu Item Management**:
  - `createMenuItem`: Adds a new menu item to the database.
  - `updateMenuItem`: Updates an existing menu item's details.
  - `deleteMenuItem`: Deletes an existing menu item.
  - `getMenuItem`: Fetches all menu items.

### 3. Routes

The following routes are defined for category and menu item management:

- **Category Routes**:
  - `POST /create-category`: Create a new category (Admin only).
  - `PATCH /update-category/:id`: Update a category by ID (Admin only).
  - `DELETE /delete-category/:id`: Delete a category by ID (Admin only).
  - `GET /get-categories`: Retrieve all categories.

- **Menu Item Routes**:
  - `POST /create-menuItem`: Create a new menu item (Admin only).
  - `PATCH /update-menuItem/:id`: Update a menu item by ID (Admin only).
  - `DELETE /delete-menuItem/:id`: Delete a menu item by ID (Admin only).
  - `GET /get-menuItems`: Retrieve all menu items.

