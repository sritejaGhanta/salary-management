import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { JobTitle } from './job-title.entity';
import { Country } from './country.entity';
import { State } from './state.entity';
import { Department } from './department.entity';
import { HRManager } from './hr-manager.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  full_name: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column()
  job_title_id: number;

  @Column({ unsigned: true })
  country_id: number;

  @Column({ unsigned: true, nullable: true })
  state_id: number;

  @Column()
  department_id: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  salary: number;

  @Column({ length: 10, default: 'INR' })
  currency: string;

  @Column({ type: 'date' })
  joining_date: Date;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Column()
  added_by: number;

  @Column({ nullable: true })
  updated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => JobTitle)
  @JoinColumn({ name: 'job_title_id' })
  jobTitle: JobTitle;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'state_id' })
  state: State;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => HRManager)
  @JoinColumn({ name: 'added_by' })
  addedBy: HRManager;
}
