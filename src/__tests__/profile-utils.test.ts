import { describe, expect, it } from 'vitest';
import {
  formatPhoneNumber,
  splitFullName,
  validateProfileForm,
} from '../components/portal/profileUtils';

describe('profileUtils', () => {
  it('splits a full name into first and last names', () => {
    expect(splitFullName('John Burkhardt')).toEqual({
      firstName: 'John',
      lastName: 'Burkhardt',
    });
  });

  it('keeps multi-part surnames intact', () => {
    expect(splitFullName('John Ronald Reuel Tolkien')).toEqual({
      firstName: 'John',
      lastName: 'Ronald Reuel Tolkien',
    });
  });

  it('formats a ten-digit phone number for display', () => {
    expect(formatPhoneNumber('9523346093')).toBe('(952) 334-6093');
  });

  it('validates the required profile form fields', () => {
    expect(
      validateProfileForm({
        fullName: '',
        email: 'not-an-email',
        phone: '123',
        companyName: '',
      }),
    ).toEqual({
      fullName: 'Full name is required.',
      email: 'Enter a valid email address.',
      phone: 'Enter a valid phone number.',
      companyName: 'Company name is required.',
    });
  });
});
