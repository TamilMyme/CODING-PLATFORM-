import { axiosInstance } from "./config";
import type { IBatch } from "../types/interfaces";

export default class BatchApis {
  private static readonly basePath = "/batches";

  static async getAll(courseId?: string): Promise<IBatch[]> {
    const params = courseId ? { courseId } : {};
    const response = await axiosInstance.get(this.basePath, { params });
    return response.data.data;
  }

  static async getById(id: string): Promise<IBatch> {
    const response = await axiosInstance.get(`${this.basePath}/${id}`);
    return response.data.data;
  }

  static async create(batchData: Partial<IBatch>): Promise<IBatch> {
    const response = await axiosInstance.post(this.basePath, batchData);
    return response.data.data;
  }

  static async update(id: string, batchData: Partial<IBatch>): Promise<IBatch> {
    const response = await axiosInstance.put(`${this.basePath}/${id}`, batchData);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.basePath}/${id}`);
  }

  static async addStudent(batchId: string, studentId: string): Promise<IBatch> {
    const response = await axiosInstance.post(`${this.basePath}/student/add`, {
      batchId,
      studentId,
    });
    return response.data.data;
  }

  static async removeStudent(batchId: string, studentId: string): Promise<IBatch> {
    const response = await axiosInstance.post(`${this.basePath}/student/remove`, {
      batchId,
      studentId,
    });
    return response.data.data;
  }
}