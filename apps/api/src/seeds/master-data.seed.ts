import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Department } from '../entities/department.entity';
import { JobTitle } from '../entities/job-title.entity';
import { countriesData } from './data/countries-data';
import { statesData } from './data/states-data';

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

const masterDataSeed = async () => {
  await AppDataSource.initialize();
  console.log('Database connected!');

  // ─── 1. Countries ─────────────────────────────────────────────────
  console.log('Seeding countries...');
  const countryCount = await AppDataSource.query(
    'SELECT COUNT(*) as count FROM countries'
  );
  if (parseInt(countryCount[0].count) === 0) {
    // Batch insert — 50 at a time for performance
    const batchSize = 50;
    for (let i = 0; i < countriesData.length; i += batchSize) {
      const batch = countriesData.slice(i, i + batchSize);
      await AppDataSource.query(
        `INSERT INTO countries (id, country, countryCode, countryCodeISO3, dialCode, status) VALUES ${
          batch.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')
        }`,
        batch.flatMap(c => [c.id, c.country, c.countryCode, c.countryCodeISO3, c.dialCode, c.status])
      );
    }
    console.log(`✅ Countries inserted: ${countriesData.length}`);
  } else {
    console.log(`⏭️  Countries already seeded: ${countryCount[0].count}`);
  }

  // ─── 2. States ────────────────────────────────────────────────────
  console.log('Seeding states...');
  const stateCount = await AppDataSource.query(
    'SELECT COUNT(*) as count FROM states'
  );
  if (parseInt(stateCount[0].count) === 0) {
    // Batch insert — 100 at a time
    const batchSize = 100;
    for (let i = 0; i < statesData.length; i += batchSize) {
      const batch = statesData.slice(i, i + batchSize);
      await AppDataSource.query(
        `INSERT INTO states (id, state, stateCode, countryId, status) VALUES ${
          batch.map(() => '(?, ?, ?, ?, ?)').join(', ')
        }`,
        batch.flatMap(s => [s.id, s.state, s.stateCode, s.countryId, s.status])
      );
    }
    console.log(`✅ States inserted: ${statesData.length}`);
  } else {
    console.log(`⏭️  States already seeded: ${stateCount[0].count}`);
  }

  // ─── 3. Departments ───────────────────────────────────────────────
  console.log('Seeding departments...');
  const departmentRepository = AppDataSource.getRepository(Department);
  const departments = [
    'Engineering', 'Product', 'Design', 'HR', 'Finance',
    'Marketing', 'Sales', 'Operations', 'Legal', 'Customer Support'
  ];
  for (const name of departments) {
    const existing = await departmentRepository.findOneBy({ name });
    if (!existing) {
      await departmentRepository.save({ name });
      console.log(`  + Department: ${name}`);
    }
  }
  console.log('✅ Departments seeded!');

  // ─── 4. Job Titles ────────────────────────────────────────────────
  console.log('Seeding job titles...');
  const jobTitleRepository = AppDataSource.getRepository(JobTitle);
  const jobTitles = [
    'Software Engineer', 'Senior Software Engineer',
    'Tech Lead', 'Engineering Manager', 'Product Manager',
    'UI/UX Designer', 'Data Analyst', 'HR Manager',
    'Finance Manager', 'Marketing Manager', 'Sales Executive',
    'Operations Manager', 'Legal Counsel', 'Customer Support',
    'DevOps Engineer'
  ];
  for (const title of jobTitles) {
    const existing = await jobTitleRepository.findOneBy({ title });
    if (!existing) {
      await jobTitleRepository.save({ title });
      console.log(`  + Job Title: ${title}`);
    }
  }
  console.log('✅ Job Titles seeded!');

  console.log('\n🎉 All master data seeded successfully!');
  await AppDataSource.destroy();
};

masterDataSeed().catch(console.error);
