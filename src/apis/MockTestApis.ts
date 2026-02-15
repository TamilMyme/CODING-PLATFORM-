import { axiosInstance } from "./config";

class MockTestApis {
  static path = "/mock-tests";

  static getAllMockTests = async (params?: { batchId?: string; courseId?: string; testType?: string; search?: string }) => {
    const res = await axiosInstance.get(this.path, { params });
    return res.data;
  };

  static getMockTest = async (id:string) => {
    const res = await axiosInstance.get(`${this.path}/${id}`);
    return res.data;
  };
  
  static createMockTest = async (data:any) => {
    const res = await axiosInstance.post(this.path, data);
    return res.data;
  };

  static updateMockTest = async (id:string,data:any) => {
    const res = await axiosInstance.put((`${this.path}/${id}`), data);
    return res.data;
  };

  static deleteMockTest = async (id:string, data?:any) => {
    const res = await axiosInstance.delete(`${this.path}/${id}`, { data });
    return res.data;
  };

  // Get mock tests by batch ID
  static getMockTestsByBatch = async (batchId: string) => {
    const res = await axiosInstance.get(`${this.path}/batch/${batchId}`);
    return res.data;
  };

  // Get mock tests by course ID
  static getMockTestsByCourse = async (courseId: string) => {
    const res = await axiosInstance.get(`${this.path}/course/${courseId}`);
    return res.data;
  };

  // Get mock tests by test type
  static getMockTestsByType = async (testType: string) => {
    const res = await axiosInstance.get(`${this.path}/type/${testType}`);
    return res.data;
  };

  // Get mock tests for dropdown
  static getMockTestsForDropdown = async () => {
    const res = await axiosInstance.get(`${this.path}/dropdown`);
    return res.data;
  };

}

export default MockTestApis;
