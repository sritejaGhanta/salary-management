export interface EmployeeColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export const employeeColumns: EmployeeColumn[] = [
  { key: 'full_name', label: 'Full Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'jobTitle', label: 'Job Title' },
  { key: 'department', label: 'Department' },
  { key: 'country', label: 'Country' },
  { key: 'salary', label: 'Salary', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'joining_date', label: 'Joining Date', sortable: true },
  { key: 'actions', label: 'Actions' },
];
