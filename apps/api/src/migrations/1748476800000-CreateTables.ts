import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1748476800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    // 1. countries table
    await queryRunner.query(`
      CREATE TABLE countries (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        country VARCHAR(255) NOT NULL,
        countryCode CHAR(3) NOT NULL,
        countryCodeISO3 CHAR(50) DEFAULT NULL,
        countryFlag VARCHAR(255) DEFAULT NULL,
        dialCode VARCHAR(10) DEFAULT NULL,
        defaultTimezoneId INT DEFAULT NULL,
        description TEXT,
        currency VARCHAR(10) DEFAULT NULL,
        status ENUM('Active','Inactive') DEFAULT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
    `);

    // 2. states table
    await queryRunner.query(`
      CREATE TABLE states (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        state VARCHAR(255) NOT NULL,
        stateCode VARCHAR(20) NOT NULL,
        countryId INT DEFAULT NULL,
        status ENUM('Active','Inactive') DEFAULT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
    `);

    // 3. departments table
    await queryRunner.query(`
      CREATE TABLE departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. job_titles table
    await queryRunner.query(`
      CREATE TABLE job_titles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. hr_managers table
    await queryRunner.query(`
      CREATE TABLE hr_managers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager') DEFAULT 'manager',
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 6. employees table
    await queryRunner.query(`
      CREATE TABLE employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20),
        job_title_id INT NOT NULL,
        country_id INT UNSIGNED NOT NULL,
        state_id INT UNSIGNED,
        department_id INT NOT NULL,
        salary DECIMAL(12, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        joining_date DATE NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        added_by INT NOT NULL,
        updated_by INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (job_title_id) REFERENCES job_titles(id),
        FOREIGN KEY (country_id) REFERENCES countries(id),
        FOREIGN KEY (state_id) REFERENCES states(id),
        FOREIGN KEY (department_id) REFERENCES departments(id),
        FOREIGN KEY (added_by) REFERENCES hr_managers(id)
      )
    `);

    // 7. salary_history table
    await queryRunner.query(`
      CREATE TABLE salary_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        old_salary DECIMAL(12, 2) NOT NULL,
        new_salary DECIMAL(12, 2) NOT NULL,
        changed_by INT NOT NULL,
        changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id),
        FOREIGN KEY (changed_by) REFERENCES hr_managers(id)
      )
    `);

    // 8. audit_logs table
    await queryRunner.query(`
      CREATE TABLE audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hr_id INT NOT NULL,
        action ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
        entity ENUM('employee', 'hr_manager', 'salary') NOT NULL,
        entity_id INT NOT NULL,
        old_data JSON,
        new_data JSON,
        ip_address VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hr_id) REFERENCES hr_managers(id)
      )
    `);

    // Indexes
    await queryRunner.query(`CREATE INDEX idx_employees_country ON employees(country_id)`);
    await queryRunner.query(`CREATE INDEX idx_employees_job_title ON employees(job_title_id)`);
    await queryRunner.query(`CREATE INDEX idx_employees_department ON employees(department_id)`);
    await queryRunner.query(`CREATE INDEX idx_employees_status ON employees(status)`);
    await queryRunner.query(`CREATE INDEX idx_employees_salary ON employees(salary)`);
    await queryRunner.query(`CREATE INDEX idx_employees_email ON employees(email)`);
    await queryRunner.query(`CREATE INDEX idx_audit_logs_hr_id ON audit_logs(hr_id)`);
    await queryRunner.query(`CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET foreign_key_checks = 0`);
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs`);
    await queryRunner.query(`DROP TABLE IF EXISTS salary_history`);
    await queryRunner.query(`DROP TABLE IF EXISTS employees`);
    await queryRunner.query(`DROP TABLE IF EXISTS hr_managers`);
    await queryRunner.query(`DROP TABLE IF EXISTS job_titles`);
    await queryRunner.query(`DROP TABLE IF EXISTS departments`);
    await queryRunner.query(`DROP TABLE IF EXISTS states`);
    await queryRunner.query(`DROP TABLE IF EXISTS countries`);
    await queryRunner.query(`SET foreign_key_checks = 1`);
  }
}
