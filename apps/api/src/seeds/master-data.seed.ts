import { DataSource } from 'typeorm';
import { Department } from '../entities/department.entity';
import { JobTitle } from '../entities/job-title.entity';

export const masterDataSeed = async (dataSource: DataSource) => {
  const departmentRepository = dataSource.getRepository(Department);
  const jobTitleRepository = dataSource.getRepository(JobTitle);

  const departments = [
    'Engineering', 'Product', 'Design', 'HR', 'Finance',
    'Marketing', 'Sales', 'Operations', 'Legal', 'Customer Support'
  ];

  for (const name of departments) {
    const existing = await departmentRepository.findOneBy({ name });
    if (!existing) {
      await departmentRepository.save({ name });
    }
  }

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
    }
  }

  console.log('Master data seeded successfully!');
};
