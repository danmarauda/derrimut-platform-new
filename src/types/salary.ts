/**
 * Salary and payroll-related type definitions
 */

export interface Allowance {
  type: 'transport' | 'meal' | 'housing' | 'performance' | 'overtime';
  amount: number;
  isPercentage: boolean;
}

export interface Deduction {
  type: 'tax' | 'epf' | 'etf' | 'insurance' | 'advance';
  amount: number;
  isPercentage: boolean;
}

export type PaymentFrequency = 'monthly' | 'bi-weekly' | 'weekly';
export type SalaryStatus = 'active' | 'pending' | 'inactive';
export type EmployeeRole = 'admin' | 'trainer' | 'user';

export interface SalaryStructure {
  _id: string;
  _creationTime: number;
  employeeName: string;
  employeeId: string;
  employeeClerkId: string;
  employeeRole: EmployeeRole;
  baseSalary: number;
  allowances: Allowance[];
  deductions: Deduction[];
  paymentFrequency: PaymentFrequency;
  effectiveDate: number;
  status: SalaryStatus;
  performanceBonus?: number;
  trainerSessionRate?: number;
  overtimeRate?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface SalaryStructureForm {
  employeeName: string;
  employeeId: string;
  employeeRole: EmployeeRole;
  baseSalary: number;
  allowances: {
    transport?: number;
    meal?: number;
    housing?: number;
    performance?: number;
    overtime?: number;
  };
  deductions: {
    tax?: number;
    epf?: number;
    etf?: number;
    insurance?: number;
    advance?: number;
  };
  paymentFrequency: string;
  effectiveDate: string;
  status: string;
}

export interface SalaryStats {
  totalEmployeesOnPayroll: number;
  totalMonthlyPayroll: number;
  totalPendingApprovals: number;
  averageSalary: number;
}
