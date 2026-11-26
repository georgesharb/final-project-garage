/*
=========================================================
GARAGE MANAGEMENT SYSTEM
DATABASE USER FOR THE ONLINE BACKEND (Azure SQL only)
=========================================================
On our laptops the backend uses Windows Authentication: this file is NOT needed.

Online (Azure SQL Database), run it ONCE, after create_tables.sql,
connected to the GarageManagement database (not "master").
The backend then logs in with this user instead of the admin account.

1. Replace the password below with a strong one.
2. Put the SAME values in the Render settings: DB_USER = garage_app, DB_PASSWORD = ...
=========================================================
*/

-- 1. A user that only exists inside our database
CREATE USER garage_app WITH PASSWORD = 'Replace_With_A_Strong_Password_1!';

-- 2. Rights: read and write data only (it cannot create or drop tables)
ALTER ROLE db_datareader ADD MEMBER garage_app;
ALTER ROLE db_datawriter ADD MEMBER garage_app;
