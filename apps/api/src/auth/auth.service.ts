import { Injectable, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { HRManager } from '../entities/hr-manager.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(HRManager)
    private readonly hrManagerRepository: Repository<HRManager>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, currentUser: any) {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admin users can register new HR Managers');
    }

    const existingUser = await this.hrManagerRepository.findOneBy({ email: dto.email });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    
    const manager = this.hrManagerRepository.create({
      full_name: dto.full_name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      is_active: true,
    });

    const savedManager = await this.hrManagerRepository.save(manager);
    const { password, ...result } = savedManager;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.hrManagerRepository.findOneBy({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    const { password, ...userWithoutPassword } = user;
    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async getMe(userId: number) {
    const user = await this.hrManagerRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...result } = user;
    return result;
  }
}
