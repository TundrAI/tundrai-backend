import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedAdminUser();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  private async seedAdminUser(): Promise<void> {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');

    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL not configured, skipping admin user seed');
      return;
    }

    const existingAdmin = await this.findByEmail(adminEmail);

    if (existingAdmin) {
      this.logger.log('Admin user already exists, skipping seed');
      return;
    }

    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
    const adminFirstName = this.configService.get<string>('ADMIN_FIRST_NAME');
    const adminLastName = this.configService.get<string>('ADMIN_LAST_NAME');

    try {
      const adminUser = await this.create({
        email: adminEmail,
        password: adminPassword!,
        role: UserRole.ADMIN,
        firstName: adminFirstName,
        lastName: adminLastName,
        isActive: true,
        emailVerified: true,
      });

      this.logger.log(`Admin user created successfully: ${adminUser.email}`);
    } catch (error) {
      this.logger.error('Failed to create admin user', error);
      throw error;
    }
  }
}
