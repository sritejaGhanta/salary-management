export interface EmployeeColumn {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
}

export const employeeColumns: EmployeeColumn[] = [
  { key: 'full_name', label: 'Full Name', sortable: true, className: '' },
  { key: 'email', label: 'Email', sortable: true, className: 'hidden md:table-cell' },
  { key: 'jobTitle', label: 'Job Title', className: '' },
  { key: 'department', label: 'Department', className: 'hidden md:table-cell' },
  { key: 'country', label: 'Country', className: 'hidden md:table-cell' },
  { key: 'salary', label: 'Salary', sortable: true, className: '' },
  { key: 'status', label: 'Status', sortable: true, className: '' },
  { key: 'joining_date', label: 'Joining Date', sortable: true, className: 'hidden lg:table-cell' },
  { key: 'actions', label: 'Actions', className: '' },
];
