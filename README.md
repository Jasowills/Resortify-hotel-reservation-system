# Resortify Hotel Reservation System

A comprehensive hotel reservation system built as a capstone project for the Thinkful curriculum. Resortify provides a complete solution for managing hotel bookings, room availability, and customer reservations.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## 🏨 Overview

Resortify is a full-stack hotel reservation system designed to streamline the booking process for both customers and hotel administrators. The system allows users to search for available rooms, make reservations, and manage their bookings, while providing administrators with tools to manage inventory and view booking analytics.

## ✨ Features

### Customer Features
- **Room Search & Booking**: Search for available rooms based on dates, room type, and guest capacity
- **User Registration & Authentication**: Secure account creation and login system
- **Booking Management**: View, modify, and cancel existing reservations
- **Payment Processing**: Secure payment handling for reservations
- **Booking Confirmation**: Email confirmations and booking receipts

### Admin Features
- **Dashboard**: Overview of bookings, revenue, and occupancy rates
- **Room Management**: Add, edit, and manage room inventory
- **Reservation Management**: View and manage all customer reservations
- **User Management**: Manage customer accounts and access levels
- **Analytics & Reporting**: Generate reports on bookings and revenue

### System Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Availability**: Live room availability updates
- **Search & Filter**: Advanced search and filtering options
- **Date Validation**: Prevents invalid booking dates and conflicts

## 🛠 Technologies Used

### Frontend
- **React.js** - User interface library
- **JavaScript (ES6+)** - Programming language
- **HTML5 & CSS3** - Markup and styling
- **Bootstrap/Material-UI** - UI components and styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Primary database
- **Knex.js** - SQL query builder

### Development Tools
- **Git** - Version control
- **npm** - Package management
- **Postman** - API testing
- **Jest** - Testing framework

## 🚀 Installation

### Prerequisites
- Node.js (v14.0.0 or higher)
- PostgreSQL (v12.0 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jasowills/Resortify-hotel-reservation-system.git
   cd Resortify-hotel-reservation-system
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies (if separate)
   cd frontend
   npm install
   cd ..
   ```

3. **Database Setup**
   ```bash
   # Create database
   createdb resortify_db
   
   # Run migrations
   npx knex migrate:latest
   
   # Seed database with sample data
   npx knex seed:run
   ```

4. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost/resortify_db
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the application**
   ```bash
   # Start backend server
   npm start
   
   # In another terminal, start frontend (if separate)
   cd frontend
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📖 Usage

### For Customers
1. **Create an Account**: Register with email and password
2. **Search Rooms**: Enter check-in/out dates and guest count
3. **Select Room**: Choose from available room options
4. **Make Payment**: Complete booking with secure payment
5. **Manage Bookings**: View and modify reservations in your account

### For Administrators
1. **Admin Login**: Access admin panel with administrator credentials
2. **Manage Rooms**: Add new rooms, update pricing and availability
3. **View Reservations**: Monitor all customer bookings
4. **Generate Reports**: Access booking and revenue analytics

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/available` - Get available rooms by date
- `GET /api/rooms/:id` - Get specific room details
- `POST /api/rooms` - Create new room (Admin only)
- `PUT /api/rooms/:id` - Update room (Admin only)
- `DELETE /api/rooms/:id` - Delete room (Admin only)

### Reservations
- `GET /api/reservations` - Get user reservations
- `POST /api/reservations` - Create new reservation
- `GET /api/reservations/:id` - Get specific reservation
- `PUT /api/reservations/:id` - Update reservation
- `DELETE /api/reservations/:id` - Cancel reservation

### Admin
- `GET /api/admin/dashboard` - Get dashboard data
- `GET /api/admin/reservations` - Get all reservations
- `GET /api/admin/users` - Get all users

## 🗄 Database Schema

### Tables
- **users**: User account information
- **rooms**: Room inventory and details
- **reservations**: Booking records
- **payments**: Payment transaction records

### Key Relationships
- Users can have multiple reservations
- Each reservation is linked to one room
- Payments are associated with reservations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Notes

### Running Tests
```bash
npm test
```

### Code Style
- Use ESLint for code linting
- Follow Prettier formatting guidelines
- Write meaningful commit messages

### Deployment
The application can be deployed to platforms like:
- Heroku (backend)
- Netlify/Vercel (frontend)
- Railway or DigitalOcean (full-stack)

## 🐛 Known Issues

- Check the [Issues](https://github.com/Jasowills/Resortify-hotel-reservation-system/issues) page for current bugs and feature requests

## 📞 Support

For support or questions about this project:
- Create an issue on GitHub
- Contact the developer through GitHub profile

## 📄 License

This project is part of the Thinkful curriculum capstone project. Please refer to the license file for usage terms.

---

**Built with ❤️ by [Jasowills](https://github.com/Jasowills)**
