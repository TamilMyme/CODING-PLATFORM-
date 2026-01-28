import { axiosInstance } from "./config";
import type { ICourse } from "../types/interfaces";

export default class CourseApis {
  private static readonly basePath = "/courses";

  static async getAll(): Promise<ICourse[]> {
    const response = await axiosInstance.get(this.basePath);
    return response.data.data;
  }

  static async getById(id: string): Promise<ICourse> {
    const response = await axiosInstance.get(`${this.basePath}/${id}`);
    return response.data.data;
  }

  static async create(courseData: Partial<ICourse>): Promise<ICourse> {
    const response = await axiosInstance.post(this.basePath, courseData);
    return response.data.data;
  }

  static async update(id: string, courseData: Partial<ICourse>): Promise<ICourse> {
    const response = await axiosInstance.put(`${this.basePath}/${id}`, courseData);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.basePath}/${id}`);
  }
}