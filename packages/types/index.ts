export interface Employee {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  job_title_id: number;
  country_id: number;
  state_id?: number;
  department_id: number;
  salary: number;
  currency: string;
  joining_date: Date;
  status: 'active' | 'inactive';
  added_by: number;
  updated_by?: number;
  created_at: Date;
  updated_at: Date;
}

export interface HRManager {
  id: number;
  full_name: string;
  email: string;
  role: 'admin' | 'manager';
  is_active: boolean;
  created_at: Date;
}

export interface Country {
  id: number;
  country: string;
  countryCode: string;
  currency: string;
  status: 'Active' | 'Inactive';
}

export interface State {
  id: number;
  state: string;
  stateCode: string;
  countryId: number;
  status: 'Active' | 'Inactive';
}

export interface Department {
  id: number;
  name: string;
}

export interface JobTitle {
  id: number;
  title: string;
}

export interface AuditLog {
  id: number;
  hr_id: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'employee' | 'hr_manager' | 'salary';
  entity_id: number;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
  created_at: Date;
}

export interface PaginationParams {
  page: number;
  limit: 10 | 20 | 30 | 50 | 100;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
