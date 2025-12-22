import { axiosInstance } from "./config";

class MockTestApis {
  static path = "/mock-tests";

  static getAllMockTests = async () => {
    const res = await axiosInstance.get(this.path);
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

  static deleteMockTest = async (id:string,data:any) => {
    const res = await axiosInstance.delete((`${this.path}/${id}`), data);
    return res.data;
  };

}

export default MockTestApis;
