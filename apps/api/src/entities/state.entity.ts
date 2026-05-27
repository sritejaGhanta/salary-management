import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('states')
export class State {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ length: 255 })
  state: string;

  @Column({ length: 20 })
  stateCode: string;

  @Column({ nullable: true })
  countryId: number;

  @Column({ type: 'enum', enum: ['Active', 'Inactive'], nullable: true })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
