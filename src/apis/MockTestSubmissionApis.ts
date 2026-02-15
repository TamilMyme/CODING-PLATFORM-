import { axiosInstance } from "./config";

class MockTestSubmissionApis {
  static path = "/submissions";

  static getAllMockTestSubmissions = async (params?: { page?: number; limit?: number; search?: string }) => {
    const res = await axiosInstance.get(this.path, { params });
    return res.data;
  };

  static getMockTestSubmission = async (id: string) => {
    const res = await axiosInstance.get(`${this.path}/${id}`);
    return res.data;
  };
  
  static createMockTestSubmission = async (data: any) => {
    const res = await axiosInstance.post(this.path, data);
    return res.data;
  };

  static updateMockTestSubmission = async (id: string, data: any) => {
    const res = await axiosInstance.put(`${this.path}/${id}`, data);
    return res.data;
  };

  static deleteMockTestSubmission = async (id: string) => {
    const res = await axiosInstance.delete(`${this.path}/${id}`);
    return res.data;
  };

  // Get submissions by student ID
  static getSubmissionsByStudent = async (studentId: string) => {
    const res = await axiosInstance.get(`${this.path}`, { 
      params: { student: studentId } 
    });
    return res.data;
  };
}

export default MockTestSubmissionApis;
