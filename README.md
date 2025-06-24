# Boardly - Real-time Collaborative Whiteboard

A modern, real-time collaborative whiteboard application built with React,
Node.js, and Socket.IO. Create, share, and collaborate on digital whiteboards
with anyone, anywhere.

## ✨ Features

- 🎨 Real-time drawing and collaboration
- 💬 Built-in chat system with typing indicators
- 🔒 Private rooms with password protection
- 👥 Multi-user support with presence indicators
- 🔄 Undo/Redo functionality
- 📱 Responsive design for all devices
- 🎯 Multiple drawing tools (pen, shapes, text)
- 🎨 Color picker and brush size controls
- 💾 Export drawings as PNG or PDF

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (optional, falls back to in-memory storage)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/0x4Nayan04/boardly.git
cd boardly
```

2. Install dependencies for both frontend and backend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
```

4. Create a `.env` file in the frontend directory:

```env
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Running the Application

1. Start the backend server:

```bash
cd backend
npm start
```

2. Start the frontend development server:

```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`.

## 🛠️ Built With

- [React](https://reactjs.org/) - Frontend framework
- [Node.js](https://nodejs.org/) - Backend runtime
- [Socket.IO](https://socket.io/) - Real-time communication
- [MongoDB](https://www.mongodb.com/) - Database (optional)
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## Demo Link

## Deployed Link
