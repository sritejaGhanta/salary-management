import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { HRManager } from './hr-manager.entity';

@Entity('salary_history')
export class SalaryHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employee_id: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  old_salary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  new_salary: number;

  @Column()
  changed_by: number;

  @CreateDateColumn()
  changed_at: Date;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => HRManager)
  @JoinColumn({ name: 'changed_by' })
  changedBy: HRManager;
}
