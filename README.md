# Garage Management System

A full-stack web application for managing a garage's clients, vehicles, and repair history.

## Project Structure

- `client/` – React + Vite frontend.
- `server/` – Node.js + Express backend.
- `.gitignore` – Excludes dependencies, build files, and private environment files.

## Technologies

- React + Vite
- React Router
- Node.js + Express
- Microsoft SQL Server
- `mssql` package
- bcrypt + JWT

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd garage-management
```

### 2. Setup the frontend

```bash
cd client
npm install
npm run dev
```

The frontend runs at `http://localhost:5173/`.

### 3. Setup the backend

Open another terminal:

```bash
cd server
npm install
```

Create a `.env` file using `.env.example` as a template, then configure the required environment variables.

Start the backend:

```bash
npm run dev
```

The backend runs at `http://localhost:3000/`.

## Environment Variables

The backend uses a `.env` file for configuration and sensitive information.

Never commit the `.env` file. Use `.env.example` as a reference.

## Database

The application uses Microsoft SQL Server. Database creation and configuration instructions will be added during the database implementation.

## Development

The frontend and backend run independently. Keep both development servers running while working on the application.


### Configure environment variables

Inside the `server/` folder:

1. Create a copy of `.env.example`.
2. Rename the copy to `.env`.
3. Replace the example values with your local configuration.

Example:

```env
PORT=3000

DB_SERVER=localhost
DB_NAME=GarageManagement
DB_USER=your_username
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
```

Each developer must configure their own `.env` file.

**Important:** Never commit or share your `.env` file. Only `.env.example` should be uploaded to GitHub.