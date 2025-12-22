import { axiosInstance } from "./config";

class CollegeApis {
  static path = "/colleges";

  static getAllCollege = async () => {
    const res = await axiosInstance.get(this.path);
    return res.data;
  };

  static getCollege = async (id:string) => {
    const res = await axiosInstance.get(`${this.path}/${id}`);
    return res.data;
  };
  
  static createCollege = async (data:any) => {
    const res = await axiosInstance.post(this.path, data);
    return res.data;
  };

  static updateCollege = async (id:string,data:any) => {
    const res = await axiosInstance.put((`${this.path}/${id}`), data);
    return res.data;
  };

  static deleteCollege = async (id:string,data:any) => {
    const res = await axiosInstance.delete((`${this.path}/${id}`), data);
    return res.data;
  };

}

export default CollegeApis;