import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Employee } from '../entities/employee.entity';
import { Country } from '../entities/country.entity';
import { State } from '../entities/state.entity';
import { Department } from '../entities/department.entity';
import { JobTitle } from '../entities/job-title.entity';
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

const seedEmployees = async () => {
  const startTime = Date.now();
  await AppDataSource.initialize();
  console.log('Database connected!');

  const employeeRepository = AppDataSource.getRepository(Employee);
  const countryRepository = AppDataSource.getRepository(Country);
  const stateRepository = AppDataSource.getRepository(State);
  const departmentRepository = AppDataSource.getRepository(Department);
  const jobTitleRepository = AppDataSource.getRepository(JobTitle);
  const hrManagerRepository = AppDataSource.getRepository(HRManager);

  // Check current count
  const count = await employeeRepository.count();
  if (count >= 10000) {
    console.log(`⏭️  Employees table already has ${count} employees (10000+). Skipping seeding.`);
    await AppDataSource.destroy();
    return;
  }

  // Load name files
  const firstNamesPath = path.join(__dirname, 'data', 'first_names.txt');
  const lastNamesPath = path.join(__dirname, 'data', 'last_names.txt');

  const firstNames = fs.readFileSync(firstNamesPath, 'utf-8')
    .split(',')
    .map(name => name.trim())
    .filter(Boolean);

  const lastNames = fs.readFileSync(lastNamesPath, 'utf-8')
    .split(',')
    .map(name => name.trim())
    .filter(Boolean);

  console.log(`Loaded ${firstNames.length} first names and ${lastNames.length} last names.`);

  // Fetch Master Data
  const countries = await countryRepository.find({ where: { status: 'Active' } });
  const states = await stateRepository.find({ where: { status: 'Active' } });
  const departments = await departmentRepository.find();
  const jobTitles = await jobTitleRepository.find();
  const admin = await hrManagerRepository.findOne({ where: { role: 'admin' } });

  if (countries.length === 0 || departments.length === 0 || jobTitles.length === 0) {
    throw new Error('Required master data (countries, departments, job titles) is missing.');
  }

  const addedBy = admin ? admin.id : 1;

  // Group states by countryId
  const statesByCountry = new Map<number, number[]>();
  states.forEach(s => {
    if (s.countryId) {
      if (!statesByCountry.has(s.countryId)) {
        statesByCountry.set(s.countryId, []);
      }
      statesByCountry.get(s.countryId)!.push(s.id);
    }
  });

  const allStateIds = states.map(s => s.id);

  console.log('Generating 10,000 employees...');
  const employeesData: any[] = [];
  const emailSet = new Set<string>();

  const startMs = new Date('2018-01-01').getTime();
  const endMs = new Date('2024-12-31').getTime();

  for (let i = 0; i < 10000; i++) {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];

    let email = '';
    do {
      const randNum = Math.floor(100000 + Math.random() * 900000);
      email = `${first.toLowerCase()}.${last.toLowerCase()}.${randNum}@company.com`;
    } while (emailSet.has(email));
    emailSet.add(email);

    const phone = '+91' + Math.floor(1000000000 + Math.random() * 9000000000);

    const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];

    // Get matching state or fallback to any state
    const countryStates = statesByCountry.get(country.id) || [];
    const stateId = countryStates.length > 0
      ? countryStates[Math.floor(Math.random() * countryStates.length)]
      : (allStateIds.length > 0 ? allStateIds[Math.floor(Math.random() * allStateIds.length)] : null);

    const salary = Math.floor(30000 + Math.random() * 470000);
    const currency = country.currency || 'USD';
    const joiningDate = new Date(startMs + Math.random() * (endMs - startMs));
    const status = Math.random() < 0.9 ? 'active' : 'inactive';

    employeesData.push({
      full_name: `${first} ${last}`,
      email,
      phone,
      job_title_id: jobTitle.id,
      country_id: country.id,
      state_id: stateId,
      department_id: department.id,
      salary,
      currency,
      joining_date: joiningDate,
      status,
      added_by: addedBy,
    });
  }

  const batchSize = 500;
  const totalBatches = Math.ceil(employeesData.length / batchSize);
  console.log(`Starting parallel batch insertion of ${totalBatches} batches...`);

  const batchPromises: Promise<any>[] = [];

  for (let i = 0; i < employeesData.length; i += batchSize) {
    const batch = employeesData.slice(i, i + batchSize);
    const batchIndex = i / batchSize + 1;
    const promise = employeeRepository.insert(batch)
      .then(() => {
        console.log(`Inserted batch ${batchIndex}/${totalBatches}`);
      });
    batchPromises.push(promise);
  }

  await Promise.all(batchPromises);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Successfully seeded 10,000 employees in ${duration} seconds!`);

  await AppDataSource.destroy();
};

seedEmployees().catch(async (error) => {
  console.error('❌ Error seeding employees:', error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});
