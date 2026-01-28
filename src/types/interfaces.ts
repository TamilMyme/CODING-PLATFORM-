
export type UserRole = "STUDENT" | "ADMIN" | "SUPER_ADMIN";

export type ColumnType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "email"
  | "url"
  | "phone"
  | "textarea"
  | "select"
  | "image"
  | "file"
  | "json"
  | "uuid"
  | "float"
  | "integer"
  | "relation"; // new type

export interface TableColumn {
  id: string;
  name: string;
  type: ColumnType;
  required: boolean;
  defaultValue?: string;
  relation?: { table: string; column: string };
}

export type ColumnValue = string | number | boolean | Date | null;
export type FormState = Record<string, ColumnValue>;

export interface TableDatas {
  name: string;
  columns: TableColumn[];
  datas: FormState[];
}

// interfaces/mockTest.interface.ts

interface Question {
  id: string;
  question: string;
  options: string[];
  multiSelect: boolean;
  type: "mcq" | "coding";
}

export interface IMockTestQuestion {
  id: string;
  question: string;
  options: string[];
  multiSelect: boolean;
  type: "mcq" | "coding";
}
export interface IMockTest {
  _id: string;

  title: string;
  description?: string;
  instructions?: string;

  duration: number; // minutes
  totalMarks: number;

  questions: IMockTestQuestion[];

  isPublished: boolean;

  startTime?: string; // ISO string from backend
  endTime?: string;   // ISO string from backend

  allowedAttempts: number;

  createdBy?: string;

  isDeleted: boolean;

  createdAt: string;
  updatedAt: string;
}

// Course and Batch interfaces
export interface ICourse {
  _id: string;
  title: string;
  description?: string;
  roadmap: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IBatch {
  _id: string;
  name: string;
  course: ICourse | string;
  students: any[]; // User objects or IDs
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}
