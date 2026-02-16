# Task Board Application

A modern, responsive Kanban-style Task Board application built with React and Vite. Organize your tasks efficiently with drag-and-drop functionality, status management, and local persistence.

## 🚀 Live Demo

[**View Live Deployment**](https://makechor.netlify.app/login)

---

## ✨ Features

- **Task Management**: Create, edit, and delete tasks easily.
- **Drag & Drop Interface**: Intuitive drag-and-drop to move tasks between statuses (To Do, Doing, Done).
- **Persistent Storage**: Changes are automatically saved to your browser's Local Storage, keeping your data safe across sessions.
- **Filtering & Search**: Quickly find tasks by searching titles or filtering by priority (Low, Medium, High).
- **Responsive Layout**: Designed to work seamlessly on various screen sizes.
- **Activity Log**: Tracks your recent actions on the board.
- **Dark Mode UI**: Sleek, modern dark-themed interface for better visual comfort.

---

## � Layout Architecture

The application implements a robust Kanban layout with specific design decisions:

- **Full-Height Containers**: The board container is kept full-height to divide the page into clear vertical sections.
- **Adaptive Columns**: The columns wrapper explicitly takes up all remaining vertical space, acting as the main task board area.
- **Internal Scrolling**: Scrolling responsibility is moved *inside* the column content rather than the entire page.

**This specifically ensures:**
- Columns stretch vertically and align properly with equal height.
- Empty columns still look intentional and usable.
- Tasks stack naturally inside columns.
- The **Activity Log** sits at the bottom without interfering with column height.

---

## �🛠️ Technology Stack

- **Frontend Framework**: [React](https://reactjs.org/) (v18+)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Drag & Drop**: [@dnd-kit/core](https://dndkit.com/) & `@dnd-kit/sortable`
- **Routing**: [React Router DOM](https://reactrouter.com/) (v6)
- **State Management**: React Context API & useReducer
- **Styling**: Vanilla CSS with modern Flexbox/Grid layouts
- **Testing**: Vitest & React Testing Library

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (v14 or higher) - [Download Here](https://nodejs.org/)
- **npm** (Node Package Manager) - Included with Node.js

---

## ⚙️ Setup & Installation

Follow these steps to get the project running locally on your machine.

### 1. Clone the Repository

Open your terminal or command prompt and run:

```bash
git clone <repository-url>
cd Hintro
```
*(Replace `<repository-url>` with the actual URL of this repository if applicable, or simply navigate to the project folder if you downloaded the source code.)*

### 2. Install Dependencies

Install all the necessary packages using npm:

```bash
npm install
```
*Note: If you encounter dependency conflicts (common with some React/testing library versions), you can try `npm install --force` or `npm install --legacy-peer-deps`.*

### 3. Run the Development Server

Start the local development server:

```bash
npm run dev
```

The terminal will display a local URL, typically `http://localhost:5173/`. Open this link in your browser to view the application.

---

## 🚀 Building for Production

To create an optimized production build of the application:

1. Run the build command:
   ```bash
   npm run build
   ```
   This will generate a `dist` folder containing the compiled HTML, CSS, and JavaScript files.

2. To preview the production build locally:
   ```bash
   npm run preview
   ```

---

## 🧪 Running Tests

This project includes unit tests configured with Vitest. To run them:

```bash
npm test
```

---

## 📂 Project Structure

A brief overview of the key directories:

```
src/
├── components/      # Reusable UI components (TaskCard, ActivityLog, etc.)
├── context/         # React Context providers (AuthContext, BoardContext)
├── pages/           # Main application pages (Login, TaskBoard)
├── assets/          # Static assets like images/icons
├── App.jsx          # Main application component & routing setup
└── main.jsx         # Application entry point
```

---

## 🛡️ Authentication Note

Currently, the application uses a simulated token-based authentication system for demonstration purposes. 
- **User data** is stored in Local Storage.
- You can "Login" with any credentials (validation logic is client-side).
- "Deep linking" to protected routes redirects to Login if no session exists.

---

## 📝 Usage Guide

1. **Login**: Enter any credentials to access the board.
2. **Add Task**: Use the top form to enter a title, priority, and date, then click "Add Task".
3. **Move Task**: Click and hold any task card to drag it to a different column (To Do → Doing → Done).
4. **Edit/Delete**: Hover over a task to see "Edit" (pencil) and "Delete" (X) icons.
5. **Reset**: Use the "Reset Board" button in the header to clear all tasks and start fresh.

---

This README provides all the necessary steps to set up, run, and understand the Task Board application. Enjoy organizing!
