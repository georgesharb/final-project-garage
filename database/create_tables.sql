-- 1. USERS
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,

    CONSTRAINT CK_users_role
    CHECK (role IN ('owner', 'client'))
);

-- 2. CLIENTS
CREATE TABLE clients (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    name NVARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,

    deleted_at DATETIME2 NULL,
    CONSTRAINT FK_clients_users
    FOREIGN KEY (user_id)
    REFERENCES users(id)
);

-- 3. CARS
CREATE TABLE cars (
    id INT IDENTITY(1,1) PRIMARY KEY,
    client_id INT NOT NULL,
    brand NVARCHAR(50) NOT NULL,
    model NVARCHAR(50) NOT NULL,
    year SMALLINT NULL,
    vin VARCHAR(17) NOT NULL UNIQUE,
    plate_number NVARCHAR(20) NULL,

    deleted_at DATETIME2 NULL,
    CONSTRAINT FK_cars_clients
    FOREIGN KEY (client_id)
    REFERENCES clients(id)
);

-- Additional constraint for appointments
ALTER TABLE cars
ADD CONSTRAINT UQ_cars_id_client
UNIQUE (id, client_id);

-- 4. REPAIRS
CREATE TABLE repairs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    car_id INT NOT NULL,
    client_id INT NOT NULL,
    date DATE NOT NULL,
    description NVARCHAR(500) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,

    deleted_at DATETIME2 NULL,
    CONSTRAINT FK_repairs_cars
    FOREIGN KEY (car_id)
    REFERENCES cars(id),

    CONSTRAINT FK_repairs_clients
    FOREIGN KEY (client_id)
    REFERENCES clients(id),

    CONSTRAINT CK_repairs_status
    CHECK (status IN ('in progress', 'done'))
);

-- 5. APPOINTMENTS
CREATE TABLE appointments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    client_id INT NOT NULL,
    car_id INT NOT NULL,
    service_requested NVARCHAR(255) NOT NULL,
    preferred_datetime DATETIME2 NOT NULL,
    notes NVARCHAR(500) NULL,
    status VARCHAR(20) NOT NULL,
    proposed_datetime DATETIME2 NULL,

    CONSTRAINT FK_appointments_clients
    FOREIGN KEY (client_id)
    REFERENCES clients(id),

    CONSTRAINT FK_appointments_cars
    FOREIGN KEY (car_id, client_id)
    REFERENCES cars(id, client_id),
-- The composite foreign key guarantees that the selected car_id and client_id match the same car record.
    CONSTRAINT CK_appointments_status
    CHECK (status IN ('pending', 'accepted', 'rejected', 'rescheduled'))
);

-- Allow only one owner account: It prevents SQL Server from storing a second user with the role owner, while allowing unlimited client accounts.
CREATE UNIQUE INDEX UX_users_single_owner
ON users(role)
WHERE role = 'owner';
-- Faster search by plate number (the owner searches cars by plate or VIN).
-- The VIN is UNIQUE, so SQL Server already has an index for it.
CREATE INDEX IX_cars_plate_number
ON cars(plate_number);
