
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

