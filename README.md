
# Matrix Fitness Center Admin Dashboard

A full-stack web application for managing gym members, workout plans, and administrative tasks at Matrix Fitness Center.

## Features

- **Member Management:** Add, edit, and delete gym members with detailed profiles.
- **Workout Plan Management:** Create, assign, and update personalized workout plans for members.
- **Dashboard:** View all members and their assigned plans in a clean, responsive interface.
- **Filtering:** Filter workout plans by type (e.g., weight loss, muscle gain, general fitness).
- **Secure Authentication:** (Optional) Admin login and role-based access.
- **RESTful API:** Backend exposes endpoints for all CRUD operations.
- **Responsive Design:** Works on desktop and mobile devices.

## Tech Stack

- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **Frontend:** HTML, CSS, JavaScript (Vanilla or React, as applicable)
- **Deployment:** Ready for cloud deployment (Render, Railway, Netlify, Vercel, etc.)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository:**
    ```
    git clone https://github.com/Sabarrish5/matrix-fitness-center.git
    cd matrix-fitness-center
    ```

2. **Install dependencies:**
    ```
    npm install
    ```

3. **Set up environment variables:**
    - Create a `.env` file in the root directory.
    - Add your MongoDB connection string and any other required config:
      ```
      MONGODB_URI=your_mongodb_connection_string
      PORT=5000
      ```

4. **Start the server:**
    ```
    npm start
    ```
    The backend will run on `http://localhost:5000` by default.

5. **Open the dashboard:**
    - Open `admin-dashboard.html` in your browser, or visit the deployed frontend URL.

## API Endpoints

- `GET /api/members` — List all members
- `POST /api/members` — Add a new member
- `PUT /api/members/:id` — Update a member
- `DELETE /api/members/:id` — Delete a member
- `GET /api/plans` — List all workout plans
- `POST /api/plans` — Create a new workout plan
- ...and more

## Deployment

You can deploy this app to platforms like Render, Railway, Netlify, or Vercel.  
Refer to their documentation for step-by-step instructions.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)

---

**Made with ❤️ by Sabarrish and contributors**
=======

