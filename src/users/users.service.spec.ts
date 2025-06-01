import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';
import {
  setupTestDatabase,
  cleanTestDatabase,
  teardownTestDatabase,
} from '../test/utils/database.utils';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let configService: ConfigService;

  beforeAll(async () => {
    const dataSource = await setupTestDatabase();
    userRepository = dataSource.getRepository(User);
  });

  beforeEach(async () => {
    await cleanTestDatabase();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                ADMIN_EMAIL: 'admin@test.com',
                ADMIN_PASSWORD: 'TestPassword123!',
                ADMIN_FIRST_NAME: 'Test',
                ADMIN_LAST_NAME: 'Admin',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
      };

      const user = await service.create(createUserDto);

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.role).toBe(UserRole.USER);

      // Verify password is hashed
      const isPasswordValid = await bcrypt.compare(
        'password123',
        user.password,
      );
      expect(isPasswordValid).toBe(true);
    });

    it('should lowercase email on creation', async () => {
      const createUserDto = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };

      const user = await service.create(createUserDto);

      expect(user.email).toBe('test@example.com');
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const user = await service.create({
        email: 'test@example.com',
        password: 'password123',
      });

      const foundUser = await service.findByEmail('test@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(user.id);
    });

    it('should find user by email case-insensitively', async () => {
      await service.create({
        email: 'test@example.com',
        password: 'password123',
      });

      const foundUser = await service.findByEmail('TEST@EXAMPLE.COM');

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe('test@example.com');
    });

    it('should return null when user not found', async () => {
      const foundUser = await service.findByEmail('notfound@example.com');

      expect(foundUser).toBeNull();
    });
  });

  describe('seedAdminUser', () => {
    it('should create admin user on module init', async () => {
      await service.onModuleInit();

      const adminUser = await service.findByEmail('admin@test.com');

      expect(adminUser).toBeDefined();
      expect(adminUser?.role).toBe(UserRole.ADMIN);
      expect(adminUser?.emailVerified).toBe(true);
      expect(adminUser?.isActive).toBe(true);
      expect(adminUser?.firstName).toBe('Test');
      expect(adminUser?.lastName).toBe('Admin');
    });

    it('should not create duplicate admin user', async () => {
      await service.onModuleInit();
      await service.onModuleInit(); // Call twice

      const users = await userRepository.find({
        where: { email: 'admin@test.com' },
      });

      expect(users).toHaveLength(1);
    });

    it('should skip seeding when ADMIN_EMAIL is not configured', async () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'ADMIN_EMAIL') return undefined;
        return 'some-value';
      });

      await service.onModuleInit();

      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });

    it('should throw error when admin creation fails', async () => {
      jest
        .spyOn(service, 'create')
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(service.onModuleInit()).rejects.toThrow('Database error');
    });
  });
});
