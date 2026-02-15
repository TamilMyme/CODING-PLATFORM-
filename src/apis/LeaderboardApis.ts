import { axiosInstance } from "./config";

class LeaderboardApis {
  static path = "/leaderboards";

  static getAllLeaderboards = async (params?: { page?: number; limit?: number }) => {
    const res = await axiosInstance.get(this.path, { params });
    return res.data;
  };

  static getLeaderboardById = async (id: string) => {
    const res = await axiosInstance.get(`${this.path}/${id}`);
    return res.data;
  };

  static getLeaderboardByBatch = async (batchId: string) => {
    const res = await axiosInstance.get(`${this.path}/batch/${batchId}`);
    return res.data;
  };

  static createLeaderboard = async (data: { batch: string; rankings?: { user: string; score: number }[] }) => {
    const res = await axiosInstance.post(this.path, data);
    return res.data;
  };

  static updateLeaderboard = async (id: string, data: { batch?: string; rankings?: { user: string; score: number }[] }) => {
    const res = await axiosInstance.put(`${this.path}/${id}`, data);
    return res.data;
  };

  static deleteLeaderboard = async (id: string) => {
    const res = await axiosInstance.delete(`${this.path}/${id}`);
    return res.data;
  };

  static addOrUpdateUserRanking = async (id: string, data: { userId: string; score: number }) => {
    const res = await axiosInstance.put(`${this.path}/${id}/ranking`, data);
    return res.data;
  };

  static removeUserFromLeaderboard = async (id: string, userId: string) => {
    const res = await axiosInstance.delete(`${this.path}/${id}/users/${userId}`);
    return res.data;
  };
}

export default LeaderboardApis;
