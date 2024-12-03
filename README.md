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
│   │   └── admin.controller.ts
│   ├── middlewares
│   │   ├── auth.ts
│   │   └── catchAsyncErrors.ts
│   ├── models
│   │   └── admin.model.ts
│   ├── routes
│   │   └── admin.routes.ts
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

