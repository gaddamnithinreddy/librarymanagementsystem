# 📚 Library Management System

A comprehensive full-stack Library Management System built with React.js and Node.js. This application allows users to browse, borrow, and manage books while providing administrative controls for library management.

## ✨ Features

### 👥 User Features
- **Authentication**: User registration and login
- **Book Browsing**: Search and filter books by title, author, category
- **Book Management**: Borrow and return books
- **Personal Library**: View borrowed books and reading history
- **Ratings & Reviews**: Rate and review books
- **Favorites & Wishlist**: Save favorite books and create wishlists
- **User Profile**: Manage personal information and preferences
- **Reading Lists**: Create and manage custom reading lists
- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Mobile, tablet, and desktop friendly

### 🔧 Admin Features
- **Book Management**: Add, edit, and delete books
- **User Management**: View and manage user accounts
- **Analytics Dashboard**: Library statistics and insights
- **Category Management**: Organize books by categories
- **Data Export**: Export library data for backup
- **Borrowing Management**: Track book borrowing and returns
- **Fine Management**: Handle overdue book fines

### 🎨 Technical Features
- **Responsive UI**: Material-UI components with custom styling
- **Real-time Updates**: Live status updates for book availability
- **Data Visualization**: Charts and analytics for admin dashboard
- **Secure Authentication**: JWT-based authentication system
- **Database Integration**: MongoDB with comprehensive schemas
- **Modern Frontend**: React with Hooks and Context API
- **Smooth Animations**: Framer Motion for enhanced UX

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI Library
- **Material-UI (MUI)** - Component Library
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Context API** - State Management

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password Hashing
- **CORS** - Cross-Origin Resource Sharing

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gaddamnithinreddy/librarymanagementsystem.git
   cd librarymanagementsystem
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   MONGO_URL=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/library_management
   JWT_USER_PASSWORD=your_secure_user_jwt_secret
   JWT_ADMIN_PASSWORD=your_secure_admin_jwt_secret
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start the application**
   
   **Backend** (Terminal 1):
   ```bash
   npm start
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🗂️ Project Structure

```
library-management-system/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # Context providers
│   │   └── ...
│   └── package.json
├── routes/                  # Express route handlers
│   ├── user.js             # User authentication routes
│   ├── book.js             # Book management routes
│   ├── admin.js            # Admin routes
│   └── ...
├── middleware/              # Custom middleware
├── db.js                   # Database models and schemas
├── index.js                # Main server file
├── config.js               # Configuration file
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_USER_PASSWORD` | JWT secret for user authentication | `your_secure_secret_key` |
| `JWT_ADMIN_PASSWORD` | JWT secret for admin authentication | `your_admin_secret_key` |
| `PORT` | Backend server port | `3001` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 📖 API Endpoints

### User Authentication
- `POST /user/signup` - User registration
- `POST /user/signin` - User login

### Books
- `GET /book/all` - Get all books
- `POST /book/borrow` - Borrow a book
- `POST /book/return` - Return a book
- `POST /book/rate` - Rate a book

### Admin
- `POST /admin/signup` - Admin registration
- `POST /admin/signin` - Admin login
- `GET /admin/books` - Get all books (admin)
- `POST /admin/book` - Add new book
- `PUT /admin/book` - Update book
- `DELETE /admin/book` - Delete book

### User Features
- `GET /user/favorites` - Get user favorites
- `POST /user/favorites` - Add to favorites
- `GET /user/wishlist` - Get user wishlist
- `POST /user/wishlist` - Add to wishlist

## 🎨 UI Features

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: 
  - Mobile: `< 600px`
  - Tablet: `600px - 1200px`
  - Desktop: `> 1200px`

### Theme Support
- **Light Mode**: Clean, minimal design
- **Dark Mode**: Easy on the eyes for night usage
- **Auto Detection**: Remembers user preference

### Component Features
- **Book Cards**: Interactive cards with hover effects
- **Search & Filter**: Real-time search with category filters
- **Navigation**: Responsive navbar with mobile hamburger menu
- **Forms**: Accessible forms with validation
- **Animations**: Smooth transitions and micro-interactions

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Environment Variables**: Sensitive data protection
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Server-side validation for all inputs

## 🚀 Deployment

### Using Heroku (Backend)
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git or GitHub integration

### Using Vercel/Netlify (Frontend)
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the build folder to your preferred platform
3. Update environment variables for production

### Environment Setup for Production
```env
MONGO_URL=your_production_mongodb_url
JWT_USER_PASSWORD=strong_production_secret
JWT_ADMIN_PASSWORD=strong_admin_secret
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Nithin Reddy** - Initial work - [gaddamnithinreddy](https://github.com/gaddamnithinreddy)

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- MongoDB for the robust database solution
- React team for the amazing frontend framework
- All contributors and users of this project

## 📞 Support

If you have any questions or need help with setup, please:
1. Check the [Issues](https://github.com/gaddamnithinreddy/librarymanagementsystem/issues) page
2. Create a new issue if your problem isn't already addressed
3. Provide detailed information about your setup and the issue

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - User authentication and book management
  - Admin dashboard and analytics
  - Responsive design with dark/light mode
  - Full CRUD operations for books and users

---

**Happy Reading! 📚✨**