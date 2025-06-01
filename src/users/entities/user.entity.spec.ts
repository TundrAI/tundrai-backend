import { validate } from 'class-validator';

import { User, UserRole } from './user.entity';

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.id = '123e4567-e89b-12d3-a456-426614174000';
    user.email = 'test@example.com';
    user.password = 'hashedPassword';
    user.role = UserRole.USER;
    user.firstName = 'John';
    user.lastName = 'Doe';
    user.isActive = true;
    user.emailVerified = false;
    user.createdAt = new Date();
    user.updatedAt = new Date();
  });

  describe('validation', () => {
    it('should validate a valid user', async () => {
      const errors = await validate(user);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid email', async () => {
      user.email = 'invalid-email';
      const errors = await validate(user);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with invalid role', async () => {
      user.role = 'invalid-role' as UserRole;
      const errors = await validate(user);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('role');
    });

    it('should fail validation with too long firstName', async () => {
      user.firstName = 'a'.repeat(101);
      const errors = await validate(user);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('firstName');
    });

    it('should fail validation with too long lastName', async () => {
      user.lastName = 'a'.repeat(101);
      const errors = await validate(user);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('lastName');
    });
  });

  describe('emailToLowerCase', () => {
    it('should convert email to lowercase', () => {
      user.email = 'TEST@EXAMPLE.COM';
      user.emailToLowerCase();
      expect(user.email).toBe('test@example.com');
    });
  });

  describe('UserRole enum', () => {
    it('should have correct role values', () => {
      expect(UserRole.ADMIN).toBe('admin');
      expect(UserRole.USER).toBe('user');
      expect(UserRole.UPLOADER).toBe('uploader');
    });
  });
});
