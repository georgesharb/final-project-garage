/*
=========================================================
GARAGE MANAGEMENT SYSTEM
UPDATES NEEDED BY THE BACKEND
=========================================================
Run once on the GarageManagement database (after create_tables.sql).

1. deleted_at  -> the owner's "Bin": a deleted client, car or repair is
                  not erased, it gets a date here and can be restored.
                  NULL = active.
2. plate_number -> optional (a new car may not have a plate yet).
                  The VIN stays required and unique.
=========================================================
*/

-- 1. Bin (soft delete)
ALTER TABLE clients ADD deleted_at DATETIME2 NULL;
ALTER TABLE cars    ADD deleted_at DATETIME2 NULL;
ALTER TABLE repairs ADD deleted_at DATETIME2 NULL;

-- 2. Plate number optional
ALTER TABLE cars ALTER COLUMN plate_number NVARCHAR(20) NULL;
