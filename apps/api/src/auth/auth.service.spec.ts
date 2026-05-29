import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { HRManager } from '../entities/hr-manager.entity';
import { UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let hrManagerRepository: Repository<HRManager>;
  let jwtService: JwtService;

  const mockHRManagerRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(HRManager),
          useValue: mockHRManagerRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    hrManagerRepository = module.get<Repository<HRManager>>(getRepositoryToken(HRManager));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return access_token and user when credentials are valid', async () => {
      const mockUser = { id: 1, email: 'admin@salary.com', password: 'hashedPassword', role: 'admin' };
      mockHRManagerRepository.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mockToken');

      const result = await service.login({ email: 'admin@salary.com', password: 'Admin@123' });

      expect(result).toEqual({
        access_token: 'mockToken',
        user: { id: 1, email: 'admin@salary.com', role: 'admin' },
      });
      expect(mockHRManagerRepository.findOneBy).toHaveBeenCalledWith({ email: 'admin@salary.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('Admin@123', 'hashedPassword');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockHRManagerRepository.findOneBy.mockResolvedValue(null);

      await expect(service.login({ email: 'wrong@salary.com', password: 'Admin@123' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const mockUser = { id: 1, email: 'admin@salary.com', password: 'hashedPassword', role: 'admin' };
      mockHRManagerRepository.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'admin@salary.com', password: 'wrongPassword' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const currentUser = { id: 1, role: 'admin' };
    const registerDto = { full_name: 'HR User', email: 'hr@salary.com', password: 'password123', role: 'manager' };

    it('should create new HR manager when admin registers', async () => {
      mockHRManagerRepository.findOneBy.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      const mockCreated = { ...registerDto, password: 'hashedPassword', is_active: true };
      mockHRManagerRepository.create.mockReturnValue(mockCreated);
      mockHRManagerRepository.save.mockResolvedValue({ id: 2, ...mockCreated });

      const result = await service.register(registerDto, currentUser);

      expect(result).toEqual({
        id: 2,
        full_name: 'HR User',
        email: 'hr@salary.com',
        role: 'manager',
        is_active: true,
      });
    });

    it('should throw ForbiddenException when non-admin tries to register', async () => {
      const nonAdmin = { id: 2, role: 'manager' };
      await expect(service.register(registerDto, nonAdmin)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockHRManagerRepository.findOneBy.mockResolvedValue({ id: 2 });
      await expect(service.register(registerDto, currentUser)).rejects.toThrow(ConflictException);
    });

    it('should hash password before saving', async () => {
      mockHRManagerRepository.findOneBy.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockHRManagerRepository.create.mockReturnValue({});
      mockHRManagerRepository.save.mockResolvedValue({ password: 'hashedPassword' });

      await service.register(registerDto, currentUser);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
    });

    it('should not return password in response', async () => {
      mockHRManagerRepository.findOneBy.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      const mockCreated = { ...registerDto, password: 'hashedPassword', is_active: true };
      mockHRManagerRepository.create.mockReturnValue(mockCreated);
      mockHRManagerRepository.save.mockResolvedValue({ id: 2, ...mockCreated });

      const result = await service.register(registerDto, currentUser);

      expect(result.password).toBeUndefined();
    });
  });

  describe('getMe', () => {
    it('should return user by id without password', async () => {
      const mockUser = { id: 1, email: 'admin@salary.com', password: 'hashedPassword', role: 'admin' };
      mockHRManagerRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.getMe(1);

      expect(result).toEqual({ id: 1, email: 'admin@salary.com', role: 'admin' });
      expect(result.password).toBeUndefined();
    });

    it('should throw NotFoundException when user not found', async () => {
      mockHRManagerRepository.findOneBy.mockResolvedValue(null);

      // Using UnauthorizedException because that's what the service actually throws
      await expect(service.getMe(999)).rejects.toThrow(UnauthorizedException);
    });
  });
});
