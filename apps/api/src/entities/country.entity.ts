import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ length: 255 })
  country: string;

  @Column({ length: 3 })
  countryCode: string;

  @Column({ length: 50, nullable: true })
  countryCodeISO3: string;

  @Column({ length: 255, nullable: true })
  countryFlag: string;

  @Column({ length: 10, nullable: true })
  dialCode: string;

  @Column({ length: 10, nullable: true })
  currency: string;

  @Column({ type: 'enum', enum: ['Active', 'Inactive'], nullable: true })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
