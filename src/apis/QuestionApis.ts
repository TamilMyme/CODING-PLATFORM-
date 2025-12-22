import { axiosInstance } from "./config";

class QuestionApis {
  static path = "/questions";

  static getAllQuestions = async () => {
    const res = await axiosInstance.get(this.path);
    return res.data;
  };

  static getQuestion = async (id:string) => {
    const res = await axiosInstance.get(`${this.path}/${id}`);
    return res.data;
  };
  
  static createQuestion = async (data:any) => {
    const res = await axiosInstance.post(this.path, data);
    return res.data;
  };

  static updateQuestion = async (id:string,data:any) => {
    const res = await axiosInstance.put((`${this.path}/${id}`), data);
    return res.data;
  };

  static deleteQuestion = async (id:string,data:any) => {
    const res = await axiosInstance.delete((`${this.path}/${id}`), data);
    return res.data;
  };

}

export default QuestionApis;
