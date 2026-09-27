# studhub

StudHub is a collaborative study platform designed to help students stay focused, organize their study sessions, and connect with other students in real time.

The project was built as a full-stack web application, with a React frontend, Node.js/Express backend, MongoDB database, and Socket.IO for real-time communication.

## Features

### User Authentication

* User registration and login
* Secure user authentication
* User-specific application data

### Study Buddy

* Connect with other students through the Study Buddy feature
* View and interact with study-related information
* Designed to make studying feel less isolated

### Study Space

* Create and join collaborative study spaces
* Study alongside other users
* Real-time interaction between users in a shared space

### Shared Study Timer

* Start and manage a study timer within a study space
* Synchronizes timer activity between users
* Designed for collaborative study sessions

### Real-Time Functionality

* Real-time communication and updates using Socket.IO
* Server-client events for collaborative features
* Shared state between users in study spaces

## Tech Stack

**Frontend**

* React
* Vite
* JavaScript
* CSS

**Backend**

* Node.js
* Express.js
* Socket.IO

**Database**

* MongoDB
* MongoDB Atlas

**Development Tools**

* Git
* GitHub
* Visual Studio Code

## Application Architecture

StudHub follows a client-server architecture:

```text
┌─────────────────────┐
│   React + Vite      │
│     Frontend        │
└──────────┬──────────┘
           │
           │ HTTP / Socket.IO
           ▼
┌─────────────────────┐
│  Node.js + Express  │
│      Backend        │
└──────────┬──────────┘
           │
           │ MongoDB Driver
           ▼
┌─────────────────────┐
│   MongoDB Atlas     │
│      Database       │
└─────────────────────┘
```

Socket.IO provides the real-time communication required for collaborative features such as shared study spaces and the study timer.

## Getting Started

### Prerequisites

Before running StudHub locally, make sure you have:

* Node.js installed
* npm installed
* A MongoDB Atlas account or local MongoDB installation
* Git

### Clone the Repository

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd studhub
```

### Install Dependencies

Install the frontend dependencies:

```bash
cd client
npm install
```

Then install the backend dependencies:

```bash
cd ../server
npm install
```

### Environment Variables

The backend requires environment variables for configuration.

Create a `.env` file in the backend directory and add the required values.

Example:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

Additional environment variables may be required depending on the application's authentication and deployment configuration.

**Do not commit your `.env` file to GitHub.**

### Run the Application

Start the backend:

```bash
cd server
npm start
```

Start the frontend in a separate terminal:

```bash
cd client
npm run dev
```

The application can then be accessed through the local development URL provided by Vite.

## Project Structure

```text
studhub/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── package.json
│
├── server/
│   ├── ...
│   └── package.json
│
├── .gitignore
└── README.md
```

## Future Improvements

Potential future improvements include:

* Additional study and productivity features
* Improved user profiles and matching
* More collaborative study tools
* Expanded notifications
* Additional testing
* UI/UX improvements
* Production deployment and performance improvements

## Project Status

StudHub's core functionality is currently complete. The project is being prepared for production deployment, with additional improvements and refinements planned.

## What I Learned

Building StudHub provided experience with:

* Full-stack application development
* Building REST APIs with Express
* Connecting a frontend to a backend
* MongoDB database integration
* Real-time communication with Socket.IO
* Managing application state across client and server
* User authentication
* Debugging and integrating multiple technologies into a single application
* Using Git and GitHub for version control

## Author

**Nyashia**

StudHub was developed as a personal full-stack software engineering project.
