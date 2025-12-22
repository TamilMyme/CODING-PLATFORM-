import { axiosInstance } from "./config";

export default class BaseApi<T> {
  protected path: string;

  constructor(path: string) {
    this.path = path;
  }

  async getAll(): Promise<T[]> {
    const res = await axiosInstance.get(this.path);
    return res.data;
  }

  async getById(id: string): Promise<T> {
    const res = await axiosInstance.get(`${this.path}/${id}`);
    return res.data;
  }

  async create(data: Partial<T>): Promise<T> {
    const res = await axiosInstance.post(this.path, data);
    return res.data;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const res = await axiosInstance.put(`${this.path}/${id}`, data);
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.path}/${id}`);
  }
}
