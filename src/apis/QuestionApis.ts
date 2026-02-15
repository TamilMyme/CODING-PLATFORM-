import { axiosInstance } from "./config";

class QuestionApis {
  static path = "/questions";

  // Basic CRUD
  static getAllQuestions = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    difficulty?: string;
    topic?: string;
    company?: string;
    type?: string;
  }) => {
    const res = await axiosInstance.get(this.path, { params });
    return res.data;
  };

  static getQuestion = async (id: string) => {
    const res = await axiosInstance.get(`${this.path}/${id}`);
    return res.data;
  };

  static getQuestionBySlug = async (slug: string) => {
    const res = await axiosInstance.get(`${this.path}/slug/${slug}`);
    return res.data;
  };

  static createQuestion = async (data: any) => {
    const res = await axiosInstance.post(this.path, data);
    return res.data;
  };

  static updateQuestion = async (id: string, data: any) => {
    const res = await axiosInstance.put(`${this.path}/${id}`, data);
    return res.data;
  };

  static deleteQuestion = async (id: string) => {
    const res = await axiosInstance.delete(`${this.path}/${id}`);
    return res.data;
  };

  // LeetCode-style endpoints
  static getQuestionsByDifficulty = async (difficulty: string) => {
    const res = await axiosInstance.get(`${this.path}/difficulty/${difficulty}`);
    return res.data;
  };

  static getQuestionsByTopic = async (topic: string) => {
    const res = await axiosInstance.get(`${this.path}/topic/${topic}`);
    return res.data;
  };

  static getQuestionsByCompany = async (company: string) => {
    const res = await axiosInstance.get(`${this.path}/company/${company}`);
    return res.data;
  };

  static getPopularQuestions = async (limit?: number) => {
    const res = await axiosInstance.get(`${this.path}/popular`, { params: { limit } });
    return res.data;
  };

  static getQuestionsByAcceptanceRate = async (ascending: boolean = false) => {
    const res = await axiosInstance.get(`${this.path}/acceptance-rate`, { params: { ascending } });
    return res.data;
  };

  // Meta data endpoints
  static getAllTopics = async () => {
    const res = await axiosInstance.get(`${this.path}/meta/topics`);
    return res.data;
  };

  static getAllCompanies = async () => {
    const res = await axiosInstance.get(`${this.path}/meta/companies`);
    return res.data;
  };

  // Hints and Editorial
  static getHints = async (id: string) => {
    const res = await axiosInstance.get(`${this.path}/${id}/hints`);
    return res.data;
  };

  static getEditorial = async (id: string) => {
    const res = await axiosInstance.get(`${this.path}/${id}/editorial`);
    return res.data;
  };

  // Statistics
  static updateStatistics = async (id: string, accepted: boolean) => {
    const res = await axiosInstance.post(`${this.path}/${id}/statistics`, { accepted });
    return res.data;
  };

  // Similar Problems
  static getSimilarProblems = async (id: string) => {
    const res = await axiosInstance.get(`${this.path}/${id}/similar`);
    return res.data;
  };
}

export default QuestionApis;
