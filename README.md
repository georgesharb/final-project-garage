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
- `msnodesqlv8`
- bcrypt (password hashing)
- JWT (authentication)

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

Inside the `server/` folder:

1. Create a copy of `.env.example`.
2. Rename the copy to `.env`.
3. Replace the example values with your local configuration.

Example:

```env
PORT=3000

DB_SERVER=localhost
DB_NAME=GarageManagement

JWT_SECRET=your_secret_key
```

Each developer must configure their own `.env` file.
**Important**: Never commit or share your .env file. Only .env.example should be uploaded to GitHub.

Start the backend:

```bash
npm run dev
```
The backend runs at `http://localhost:3000/`.

## Development

The frontend and backend run independently. Keep both development servers running while working on the application.

## Database

The application uses Microsoft SQL Server as its database management system.

The database is named `GarageManagement` and contains five tables:

- `users` – Stores account information and user roles.
- `clients` – Stores client profiles.
- `cars` – Stores vehicles belonging to clients.
- `repairs` – Stores vehicle repair history.
- `appointments` – Stores appointment requests and their status.

### Database Setup

1. Install Microsoft SQL Server Developer Edition and SQL Server Management Studio (SSMS).
2. Create a database named `GarageManagement`.
3. Open the `database/create_tables.sql` script in SSMS.
4. Execute the script to create the tables, relationships, and constraints.

### Database Connection

The backend connects to Microsoft SQL Server using the `mssql` and `msnodesqlv8` packages with Windows Authentication.

This allows the application to connect using the current Windows account without requiring a separate SQL Server username and password in the local development environment.

**Note:** Developers must have SQL Server installed and configured on their own machines, including the required ODBC Driver.