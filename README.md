# MiniBlog API

A production-ready full-stack application demonstrating secure authentication, role-based access control, and scalable REST API design.

## 🚀 Live Deployments
- **Frontend Live URL (Netlify):** [https://primeminiblog.netlify.app/](https://primeminiblog.netlify.app/)
- **Backend API (Render):** [https://miniblog-jtuz.onrender.com/](https://miniblog-jtuz.onrender.com/)
- **Swagger Docs:** [https://miniblog-jtuz.onrender.com/api-docs](https://miniblog-jtuz.onrender.com/api-docs)

## 📸 Project Previews

### Public Home Feed (Published Posts)
![Public Home Feed](assets/Public-Home-Feed.png)

### User & Admin Login UI
![Login Interface](assets/Login.png)

### User Dashboard (CRUD Operations)
![User Dashboard](assets/User-Dashboard.png)

### Admin Dashboard (Moderation Tools)
![Admin Dashboard](assets/Admin-Dashboard.png)

### Automatically Generated API Documentation
![Swagger API Docs](assets/Swagger.png)

---

## 🏗️ Project Structure
- **/backend**: Node.js, Express, MongoDB API
- **/frontend**: React.js (Vite) User Interface

## 🛡️ Role-Based Access Control (RBAC)
This project enforces strict authorization constraints using JWT-based middleware.
- **User Role**: Standard registered users. They have complete CRUD authority over *only* their generated posts. They cannot modify, unpublish, or delete content created by other users. This is guarded at the controller level by verifying `post.author.toString() === req.user.id`.
- **Admin Role**: Platform moderators. While admins cannot edit the text of another author's post, they have elevated authorization to forcefully unpublish inappropriate content back to draft status, or permanently delete any post from the database via the `authorize('admin')` middleware endpoint barriers.

## 🗄️ Database Schema Representation
Using MongoDB Atlas mapped through Mongoose, the core schema relationships are highly normalized.

**1. User Model**
- `name` (String, required)
- `email` (String, unique, valid format required)
- `password` (String, securely hashed via bcrypt, permanently excluded from standard query selections)
- `role` (Enum: `['user', 'admin']`, defaults to `user`)
- `timestamps` (Created/Updated)

**2. Post Model**
- `title` (String, required, strictly capped length)
- `content` (String, required)
- `status` (Enum: `['draft', 'published']`, defaults to `draft`)
- `author` (ObjectId Reference -> matching `User._id`)
- `timestamps` (Created/Updated)

## 📡 API Response Standardization
All backend controllers utilize a single source-of-truth utility `sendResponse()` to guarantee perfectly consistent JSON payload structures. This ensures the frontend client always knows exactly how to parse inbound data and errors indiscriminately without crashing.

**Example Standard Response:**
```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": {
    "_id": "64efc82...",
    "title": "Scaling Node.js Backends",
    "content": "Load balancing provides...",
    "status": "published",
    "author": "64efc1...",
    "createdAt": "2026-04-21T14:00:00.000Z"
  }
}
```

## 🚀 Quick Test Guide (Reviewer Journey)
To manually test the core engine of this platform, follow this sequence:
1. Navigate to `/register` and create an account. You will automatically be issued a secure JWT token into browser storage and redirected to your Dashboard.
2. Under "Create New Post", input a title and content block, then hit **Save as Draft**.
3. Locate the new post in "Your Posts" below, verify its Draft badge, and click **Publish**. 
4. Check the global **Home** feed to see your post officially populating the public cache alongside its author credentials.
5. Log out, register a *second* dummy account, and confirm that you entirely lack the controls to edit or delete the original account's post.

---

## 🌐 Architecture & Scalability Notes
- **Modular Structure**: Separated cleanly into config, controllers, routes, models, and utils for horizontal code growth.
- **Microservices Ready**: Easily split into Auth and Post services using an API Gateway handling auth resolution.
- **Load Balancing**: Fully stateless architecture using JWTs. Can comfortably run behind load balancers like NGINX dynamically handling 10,000+ simultaneous requests.
- **Caching**: Endpoints like `GET /api/v1/posts` are perfect candidates for Redis caching under heavier traffic loads.
- **Database**: Mongoose powered with straightforward expansion paths for composite schema indexing.

---

## 🛠️ Setup Instructions

### Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your `MONGODB_URI` along with your JWT secrets.
4. Launch the local dev server:
   ```bash
   npm run dev
   ```
5. Visit `http://localhost:5000/api-docs` to interact with the API endpoints!

### Frontend
1. Open a *new* terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Establish your `.env` explicitly injecting `VITE_API_URL=http://localhost:5000/api/v1`.
4. Launch the Vite dev server:
   ```bash
   npm run dev
   ```

## 📦 Postman Collection
Import the provided `postman_collection.json` file found in the root directory into your standard Postman workspace for rapid, preconfigured endpoint tests.
