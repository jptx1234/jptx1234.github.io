import { create } from 'zustand';
import { GitHubUser, GitHubRepo } from '../types/github';
import { fetchUserInfo, fetchUserRepos } from '../services/github';

interface GitHubStore {
  // 状态
  user: GitHubUser | null;
  repos: GitHubRepo[];
  loading: boolean;
  error: string | null;
  
  // 操作
  fetchData: () => Promise<void>;
  clearError: () => void;
}

export const useGitHubStore = create<GitHubStore>((set, get) => ({
  // 初始状态
  user: null,
  repos: [],
  loading: false,
  error: null,
  
  // 获取数据
  fetchData: async () => {
    set({ loading: true, error: null });
    
    try {
      // 并行获取用户信息和仓库列表
      const [user, repos] = await Promise.all([
        fetchUserInfo(),
        fetchUserRepos()
      ]);
      
      set({ 
        user, 
        repos, 
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      set({ 
        error: error instanceof Error ? error.message : '获取数据失败', 
        loading: false 
      });
    }
  },
  
  // 清除错误
  clearError: () => {
    set({ error: null });
  }
}));