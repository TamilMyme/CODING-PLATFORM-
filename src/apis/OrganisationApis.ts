import { axiosInstance } from "./config";

class OrganisationApis {
  static path = "/organisations";

  static getAllOrganisations = async () => {
    const res = await axiosInstance.get(this.path);
    return res.data;
  };

  static getOrganisation = async (id:string) => {
    const res = await axiosInstance.get(`${this.path}/${id}`);
    return res.data;
  };
  
  static createOrganisation = async (data:any) => {
    const res = await axiosInstance.post(this.path, data);
    return res.data;
  };

  static updateOrganisation = async (id:string,data:any) => {
    const res = await axiosInstance.put((`${this.path}/${id}`), data);
    return res.data;
  };

  static deleteOrganisation = async (id:string) => {
    const res = await axiosInstance.delete((`${this.path}/${id}`));
    return res.data;
  };
}

export default OrganisationApis;