BlogX- Modern Full Stack Blogging Platform
<p align="center">
  <img src="/api/placeholder/300/150" alt="BlogCraft Logo" />
</p>
<p align="center">
  A modern, responsive blogging platform built with React, Node.js, and MongoDB.
</p>
<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#api-documentation">API Documentation</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>
Features

🚀 Modern React front-end with Tailwind CSS
📱 Fully responsive design for all devices
📝 Rich blog editor with auto-save functionality
🔍 Advanced search and filtering capabilities
🏷️ Tag-based categorization system
👤 User authentication and authorization
📊 User dashboard with content analytics
💾 Draft saving and auto-recovery
🖼️ Image upload and management
🌐 SEO optimized content structure

Tech Stack
Frontend

React: A JavaScript library for building user interfaces
React Router: Declarative routing for React
Tailwind CSS: Utility-first CSS framework
Heroicons: Beautiful hand-crafted SVG icons
Axios: Promise-based HTTP client for the browser and Node.js

Backend

Node.js: JavaScript runtime built on Chrome's V8 JavaScript engine
Express: Web application framework for Node.js
MongoDB: NoSQL document database
Mongoose: MongoDB object modeling tool for Node.js
JWT: JSON Web Tokens for authentication

Development Tools

Vite: Next generation frontend tooling
ESLint: Static code analysis tool
Prettier: Code formatter
Jest: JavaScript testing framework
React Testing Library: Testing utilities for React

Getting Started
Prerequisites

Node.js (v16.x or later)
npm or yarn
MongoDB (local or Atlas)

Installation
1. Clone the repository
bashgit clone https://github.com/yourusername/blogcraft.git
cd BlogX
2. Install dependencies
bash# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
3. Environment Setup
Create .env files in both client and server directories.
Client (.env):
VITE_REACT_APP_BACKEND_URL=http://localhost:8080
Server (.env):
PORT=8080
MONGODB_URI=YOUR_MONGODB_URI
JWT_SECRET=your_jwt_secret_key
4. Run the development server
bash# Start the backend server
cd server
npm run dev

# In a new terminal, start the frontend
cd client
npm run dev
The frontend will be available at http://localhost:5173 and the backend at http://localhost:8080.
Project Structure
 BlogX
    ├── backend
    │   ├── Controllers
    │   ├── DB
    │   ├── Middlewares
    │   ├── Models
    │   ├── node_modules
    │   ├── Routes
    │   ├── .env
    │   ├── index.js
    │   ├── package-lock.json
    │   ├── package.json
    │   └── vercel.json
    └── frontend
        ├── node_modules
        ├── public
        ├── src
        ├── .env
        ├── .gitignore
        ├── eslint.config.js
        ├── index.html
        ├── package-lock.json
        ├── package.json
        ├── README.md
        ├── vercel.json
        └── vite.config.js
Contributing

Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

License
Distributed under the MIT License. See LICENSE for more information.

Contact
Your Name - @SAmmyuxh - samruddhshubhadarshi@gmail.com
Project Link: https://blog-x-yrfk.vercel.app/
