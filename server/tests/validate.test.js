
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  isEmpty,
  checkPassword,
  checkClient,
  checkCar,
  checkRepair,
  checkPhone,
  checkEmailPassword,
  checkLogin,
  checkFutureDate
} from '../validate.js';
import { toSqlDateTime } from '../dates.js';

describe('Server validation tests', () => {

  it('checks if a value is empty', () => {
    assert.equal(isEmpty(''), true);
    assert.equal(isEmpty('John'), false);
  });

  it('rejects passwords shorter than 6 characters', () => {
    assert.equal(
      checkPassword('123'),
      'Password must be at least 6 characters'
    );
  });

  it('accepts a valid password', () => {
    assert.equal(checkPassword('123456'), null);
  });

  it('rejects a client with missing information', () => {
    assert.equal(
      checkClient({ name: '', phone: '123456', email: 'john@gmail.com' }),
      'Name, phone and email are required'
    );
  });

  it('rejects a car with an invalid VIN length', () => {
    assert.equal(
      checkCar({
        brand: 'Toyota',
        model: 'Yaris',
        year: 2022,
        vin: '12345'
      }),
      'VIN must be exactly 17 characters'
    );
  });

  it('rejects a repair with a negative cost', () => {
    assert.equal(
      checkRepair({
        description: 'Oil change',
        cost: -10,
        date: '2026-11-17',
        status: 'done'
      }),
      'Cost must be a positive number'
    );
  });

  it('accepts phone numbers with digits, spaces and +, rejects letters', () => {
    assert.equal(checkPhone('03 123 456'), null);
    assert.equal(checkPhone('+961 3 123 456'), null);
    assert.equal(checkPhone('abc123'), 'Phone must contain only numbers (example: 03 123 456)');
  });

  it('rejects an invalid email', () => {
    assert.equal(
      checkEmailPassword({ email: 'john.gmail.com', password: '123456' }),
      'Invalid email (example: email@example.com)'
    );
    assert.equal(checkEmailPassword({ email: 'john@gmail.com', password: '123456' }), null);
  });

  it('needs email, password and a valid account type to log in', () => {
    assert.equal(checkLogin({ email: '', password: '123456', role: 'client' }), 'Email and password are required');
    assert.equal(checkLogin({ email: 'a@b.com', password: '123456', role: 'admin' }), 'Choose Client or Owner');
    assert.equal(checkLogin({ email: 'a@b.com', password: '123456', role: 'owner' }), null);
  });

  it('only accepts appointment dates in the future', () => {
    assert.equal(checkFutureDate('2020-01-01T10:00'), 'The date must be in the future');
    assert.equal(checkFutureDate('not a date'), 'Invalid date');
    assert.equal(checkFutureDate('2099-01-01T10:00'), null);
  });

  it('rejects an unknown repair status', () => {
    assert.equal(
      checkRepair({ description: 'Brakes', cost: 50, date: '2026-11-17', status: 'finished' }),
      'Invalid status'
    );
  });

  it('turns a form date into the SQL Server format', () => {
    assert.equal(toSqlDateTime('2026-11-28T10:30'), '2026-11-28 10:30:00');
    assert.equal(toSqlDateTime('2026-11-28T10:30:45'), '2026-11-28 10:30:45');
    assert.equal(toSqlDateTime('hello'), null);
  });

});
