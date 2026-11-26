-- For a database that already exists (created with the old create_tables.sql):
-- adds the new index on plate_number. Run it once in SSMS on GarageManagement.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_cars_plate_number')
    CREATE INDEX IX_cars_plate_number ON cars(plate_number);
