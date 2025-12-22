import { axiosInstance } from "./config";

class StudentApis {
  static path = "/students";

  static getAllStudent = async () => {
    const res = await axiosInstance.get(this.path);
    return res.data;
  };

  static getStudent = async (id:string) => {
    const res = await axiosInstance.get(`${this.path}/${id}`);
    return res.data;
  };
  
  static createStudent = async (data:any) => {
    const res = await axiosInstance.post(this.path, data);
    return res.data;
  };

  static updateStudent = async (id:string,data:any) => {
    const res = await axiosInstance.put((`${this.path}/${id}`), data);
    return res.data;
  };

  static deleteStudent = async (id:string,data:any) => {
    const res = await axiosInstance.delete((`${this.path}/${id}`), data);
    return res.data;
  };

  // ================= AUTH =================

  static signIn = async (data:any) => {
    const res = await axiosInstance.post("/studuent/sign-in", data);
    return res.data;
  };

  static signOut = async () => {
    const res = await axiosInstance.post("/studuent/sign-out");
    return res.data;
  };

  static resetPassword = async (data:any) => {
    const res = await axiosInstance.patch("/reset-password", data);
    return res.data;
  };

  static getStudentByToken = async () => {
    const res = await axiosInstance.post("/get-student");
    return res.data;
  };
}

export default StudentApis;
