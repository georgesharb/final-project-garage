
/*
=========================================================
GARAGE MANAGEMENT SYSTEM
MILESTONE 3 - DATABASE TESTING
=========================================================

PART A - PREPARE DATABASE TEST DATA
PART B - PREPARE AND VERIFY SQL QUERIES
PART C - VERIFY DATABASE INTEGRITY
PART D - BACKEND AND DATABASE INTEGRATION TESTING

Parts A, B, C: COMPLETED
Part D: PENDING BACKEND IMPLEMENTATION

IMPORTANT:
- TEST_HASH values are dummy placeholders.
- Part C queries are expected to produce errors.
- Do not execute the entire file at once.
=========================================================
*/


/*
=========================================================
PART A - PREPARE DATABASE TEST DATA
=========================================================

Purpose:
Insert realistic test records into all five tables.
*/


-- A1. Insert test users

INSERT INTO users (email, password_hash, role)
VALUES
    ('owner@garage.local', 'TEST_HASH_OWNER', 'owner'),
    ('john@garage.local', 'TEST_HASH_JOHN', 'client'),
    ('sarah@garage.local', 'TEST_HASH_SARAH', 'client');

SELECT * FROM users;


-- A2. Insert client profiles

INSERT INTO clients (user_id, name, phone)
SELECT id, 'John Smith', '70123456'
FROM users
WHERE email = 'john@garage.local';

INSERT INTO clients (user_id, name, phone)
SELECT id, 'Sarah Johnson', '71123456'
FROM users
WHERE email = 'sarah@garage.local';

SELECT * FROM clients;


-- A3. Insert cars

INSERT INTO cars (client_id, brand, model, year, vin, plate_number)
VALUES
    (1, 'Toyota', 'Corolla', 2020, 'VIN00000000000001', 'B123456'),
    (1, 'Honda', 'Civic', 2022, 'VIN00000000000002', 'B234567'),
    (2, 'Kia', 'Sportage', 2023, 'VIN00000000000003', 'B345678');

SELECT * FROM cars;


-- A4. Insert repair records

INSERT INTO repairs (car_id, client_id, date, description, cost, status)
VALUES
    (1, 1, '2026-10-10', 'Oil and filter change', 50.00, 'done'),
    (1, 1, '2026-11-10', 'Brake pad replacement', 120.00, 'in progress'),
    (3, 2, '2026-10-20', 'Tire replacement', 200.00, 'done');

SELECT * FROM repairs;


-- A5. Insert appointments

INSERT INTO appointments (
    client_id,
    car_id,
    service_requested,
    preferred_datetime,
    notes,
    status,
    proposed_datetime
)
VALUES
    (1, 2, 'General maintenance', '2026-11-18 10:00',
     'Routine maintenance', 'pending', NULL),

    (2, 3, 'Tire inspection', '2026-11-20 14:00',
     'Check tire condition', 'accepted', NULL);

SELECT * FROM appointments;


/*
=========================================================
PART B - PREPARE AND VERIFY SQL QUERIES
=========================================================

Purpose:
Test the SQL operations required by the backend.
*/


-- B1. Retrieve a user by email (login)

SELECT *
FROM users
WHERE email = 'john@garage.local';


-- B2. Insert a new user

INSERT INTO users (email, password_hash, role)
VALUES ('michael@garage.local', 'TEST_HASH_MICHAEL', 'client');

SELECT *
FROM users
WHERE email = 'michael@garage.local';


-- B3. Insert a client profile linked to a user

INSERT INTO clients (user_id, name, phone)
SELECT id, 'Michael Brown', '76123456'
FROM users
WHERE email = 'michael@garage.local';

SELECT *
FROM clients
WHERE name = 'Michael Brown';


-- B4. Retrieve a client's cars

SELECT *
FROM cars
WHERE client_id = 3;


-- B5. Retrieve a car's repair history

SELECT *
FROM repairs
WHERE car_id = 1;


-- B6. Retrieve a client's appointments

SELECT *
FROM appointments
WHERE client_id = 1;


-- B7. Test INSERT, UPDATE and DELETE

-- INSERT: Add a car for Michael

INSERT INTO cars (
    client_id,
    brand,
    model,
    year,
    vin,
    plate_number
)
VALUES (
    3,
    'Mercedes',
    'C200',
    2021,
    'VIN00000000000004',
    'B456789'
);

SELECT *
FROM cars
WHERE client_id = 3;


-- UPDATE: Correct the car's year

UPDATE cars
SET year = 2022
WHERE id = 4;

SELECT *
FROM cars
WHERE id = 4;


-- DELETE: Remove the test car

DELETE FROM cars
WHERE id = 4;

SELECT *
FROM cars
WHERE id = 4;


-- B8. Retrieve appointment information using JOIN

SELECT
    clients.name,
    users.email,
    appointments.service_requested,
    appointments.preferred_datetime,
    appointments.status
FROM appointments
INNER JOIN clients
    ON appointments.client_id = clients.id
INNER JOIN users
    ON clients.user_id = users.id;


/*
=========================================================
PART C - VERIFY DATABASE INTEGRITY
=========================================================

Purpose:
Verify that database constraints prevent invalid operations.

IMPORTANT:
The following queries are EXPECTED TO FAIL.
Their errors confirm that the constraints work correctly.
*/


-- C1. Test duplicate emails

INSERT INTO users (email, password_hash, role)
VALUES ('john@garage.local', 'ANOTHER_HASH', 'client');


-- C2. Test duplicate VINs

INSERT INTO cars (
    client_id,
    brand,
    model,
    year,
    vin,
    plate_number
)
VALUES (
    2,
    'BMW',
    'X5',
    2024,
    'VIN00000000000001',
    'B567890'
);


-- C3. Test booking another client's car
-- John (client_id = 1) tries to book Sarah's Kia (car_id = 3).

INSERT INTO appointments (
    client_id,
    car_id,
    service_requested,
    preferred_datetime,
    status
)
VALUES (
    1,
    3,
    'Oil change',
    '2026-11-25 10:00',
    'pending'
);


-- C4. Test invalid appointment status

INSERT INTO appointments (
    client_id,
    car_id,
    service_requested,
    preferred_datetime,
    status
)
VALUES (
    1,
    2,
    'Oil change',
    '2026-11-25 10:00',
    'cancelled'
);


-- C4.2. Test invalid repair status

INSERT INTO repairs (
    car_id,
    client_id,
    date,
    description,
    cost,
    status
)
VALUES (
    2,
    1,
    '2026-11-15',
    'Engine inspection',
    75.00,
    'waiting'
);


-- C5. Test deleting a referenced client
-- John's client record is referenced by his cars.

DELETE FROM clients
WHERE id = 1;


/*
=========================================================
PART D - BACKEND AND DATABASE INTEGRATION TESTING
=========================================================

STATUS: PENDING BACKEND IMPLEMENTATION

Purpose:
Verify that the Express backend communicates correctly
with SQL Server.

This section requires the backend API endpoints.
It will be completed with the backend teammate.
*/


-- D1. Verify records created through API requests

-- Register a user through the API, then verify:

SELECT * FROM users;

-- Create a client profile through the API, then verify:

SELECT * FROM clients;

-- Add a car through the API, then verify:

SELECT * FROM cars;

-- Create an appointment through the API, then verify:

SELECT * FROM appointments;


-- D2. Verify API updates

-- Update a car and an appointment through the API.

SELECT * FROM cars;

SELECT * FROM appointments;


-- D3. Verify API deletions

-- Delete a test record through the API.
-- Verify that the intended record has been removed.

SELECT * FROM cars;

SELECT * FROM appointments;


-- D4. Test data persistence

-- Create a record through the API.
-- Stop and restart the Express server.
-- Verify that the record still exists.

SELECT * FROM users;

SELECT * FROM cars;


-- D5. Test API error handling

-- Verify that the API handles the following cases:
-- 1. Registering an existing email.
-- 2. Adding a car with an existing VIN.
-- 3. Booking another client's car.
-- 4. Sending an invalid appointment status.
-- 5. Sending invalid or missing data.

-- The backend should return appropriate HTTP error
-- responses without crashing the server.


/*
=========================================================
END OF MILESTONE 3 DATABASE TESTING
=========================================================
*/
