import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { HRManager } from '../entities/hr-manager.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'salary_management',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
});

const adminSeed = async () => {
  await AppDataSource.initialize();
  console.log('Database connected!');

  const hrManagerRepository = AppDataSource.getRepository(HRManager);

  console.log('Checking for Super Admin...');
  const existing = await hrManagerRepository.findOneBy({ email: 'admin@salary.com' });

  if (!existing) {
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    const admin = hrManagerRepository.create({
      full_name: 'Super Admin',
      email: 'admin@salary.com',
      password: hashedPassword,
      role: 'admin',
      is_active: true,
    });

    await hrManagerRepository.save(admin);
    console.log('✅ Super Admin created successfully!');
  } else {
    console.log('⏭️  Super Admin already exists!');
  }

  await AppDataSource.destroy();
};

adminSeed().catch(console.error);
