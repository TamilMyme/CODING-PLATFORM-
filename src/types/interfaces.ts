
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
