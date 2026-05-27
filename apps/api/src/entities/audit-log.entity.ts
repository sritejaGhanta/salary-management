import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HRManager } from './hr-manager.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hr_id: number;

  @Column({ type: 'enum', enum: ['CREATE', 'UPDATE', 'DELETE'] })
  action: string;

  @Column({ type: 'enum', enum: ['employee', 'hr_manager', 'salary'] })
  entity: string;

  @Column()
  entity_id: number;

  @Column({ type: 'json', nullable: true })
  old_data: any;

  @Column({ type: 'json', nullable: true })
  new_data: any;

  @Column({ length: 50, nullable: true })
  ip_address: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => HRManager)
  @JoinColumn({ name: 'hr_id' })
  hrManager: HRManager;
}
