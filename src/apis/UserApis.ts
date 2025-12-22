import { axiosInstance } from "./config";

class UserApis {
  static usersPath = "/users";

  // ================= USERS =================

  static getAllUsers = async () => {
    const res = await axiosInstance.get(this.usersPath);
    return res.data;
  };

  static createUser = async (data:any) => {
    const res = await axiosInstance.post(this.usersPath, data);
    return res.data;
  };

  static updateUser = async (id:string,data:any) => {
    const res = await axiosInstance.put(`${this.usersPath}/${id}`, data);
    return res.data;
  };

  static deleteUser = async (id:string) => {
    const res = await axiosInstance.delete(`${this.usersPath}/${id}`);
    return res.data;
  };

  // ================= AUTH =================

  static signIn = async (data:any) => {
    const res = await axiosInstance.post("/sign-in", data);
    return res.data;
  };

  static signOut = async () => {
    const res = await axiosInstance.post("/sign-out");
    return res.data;
  };

  static resetPassword = async (data:any) => {
    const res = await axiosInstance.patch("/reset-password", data);
    return res.data;
  };

  static getUserByToken = async () => {
    const res = await axiosInstance.post("/get-user");
    return res.data;
  };
}

export default UserApis;
