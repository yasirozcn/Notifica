# Notifica - Train & Flight Ticket Search Platform

## Overview

Notifica is a comprehensive ticket search platform that allows users to search for both train and flight tickets in Turkey. The platform integrates with TCDD (Turkish State Railways) for train tickets and Enuygun.com for flight tickets, providing real-time availability and pricing information.

## Features

- **Train Ticket Search**: Search TCDD train tickets with station selection and date filtering
- **Flight Ticket Search**: Search flights across multiple airlines with airport autocomplete
- **User Authentication**: Secure user authentication system using Clerk
- **Responsive Design**: Full mobile and desktop support
- **Real-time Updates**: Live ticket availability and pricing information
- **Notification System**: Email notifications for ticket availability (Train tickets only)

## Tech Stack

### Frontend

- React.js with Vite
- Tailwind CSS for styling
- Clerk for authentication
- Axios for API requests

### Backend

- Node.js with Express
- Puppeteer for web scraping
- MongoDB for database
- Nodemailer for email notifications
- Node-cron for scheduled tasks

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Git

### Installation

1. Clone the repository
2. Install Backend Dependencies
3. Install Frontend Dependencies
4. Environment Setup

Backend (.env file in BE folder):
Frontend (.env.local file in Client folder):

5. Start the Development Servers

The application will be available at `http://localhost:5173` or for see the frontend of my app you can check `https://notifica-1.onrender.com`
Backend is not deployed yet. Still development in progress

## Project Structure

```
notifica/
├── BE/ # Backend directory
│ ├── models/ # MongoDB models
│ ├── server.js # Main server file
│ └── Dockerfile # Backend Docker configuration
│
├── Client/ # Frontend directory
│ ├── src/
│ │ ├── components/ # Reusable components
│ │ ├── routes/ # Page components
│ │ ├── utils/ # Utility functions
│ │ ├── config/ # Configuration files
│ │ └── assets/ # Static assets
│ └── public/ # Public assets
```

## Features in Detail

### Train Ticket Search

- Select departure and arrival stations from TCDD network
- Choose travel date
- View available trains and their schedules
- Business class option
- Real-time availability check

### Flight Ticket Search

- Airport autocomplete with IATA codes
- International and domestic flight search
- Real-time pricing from multiple airlines
- Interactive search results

### Authentication

- User registration and login
- Social login options
- Secure session management
- Protected routes

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

- TCDD for train data
- \*\* for flight data
- Clerk for authentication services
