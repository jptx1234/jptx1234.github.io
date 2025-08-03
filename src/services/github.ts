import { GitHubUser, GitHubRepo, GitHubLanguageStats, GitHubContributor, GitHubCommitActivity } from '../types/github';

const GITHUB_API_BASE = 'https://api.github.com';
const USERNAME = 'jptx1234';
const CACHE_DURATION = 60 * 60 * 1000; // 1小时缓存

// 缓存键名
const CACHE_KEYS = {
  USER_INFO: 'github_user_info',
  USER_REPOS: 'github_user_repos'
};

// 缓存工具函数
function getCachedData<T>(key: string): T | null {
  try {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    if (now - timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(key);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

function setCachedData<T>(key: string, data: T): void {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    sessionStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
}

// GitHub API请求函数
async function fetchGitHubAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`);
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// 获取用户信息
export async function fetchUserInfo(): Promise<GitHubUser> {
  // 尝试从缓存获取
  const cached = getCachedData<GitHubUser>(CACHE_KEYS.USER_INFO);
  if (cached) {
    return cached;
  }
  
  // 从API获取并缓存
  const user = await fetchGitHubAPI<GitHubUser>(`/users/${USERNAME}`);
  setCachedData(CACHE_KEYS.USER_INFO, user);
  return user;
}

// 获取用户仓库列表
export async function fetchUserRepos(): Promise<GitHubRepo[]> {
  // 尝试从缓存获取
  const cached = getCachedData<GitHubRepo[]>(CACHE_KEYS.USER_REPOS);
  if (cached) {
    return cached;
  }
  
  // 从API获取
  const repos = await fetchGitHubAPI<GitHubRepo[]>(
    `/users/${USERNAME}/repos?sort=updated&direction=desc&per_page=100`
  );
  
  // 过滤掉私有仓库和归档仓库
  const filteredRepos = repos.filter(repo => !repo.private && !repo.archived);
  
  // 缓存结果
  setCachedData(CACHE_KEYS.USER_REPOS, filteredRepos);
  return filteredRepos;
}

// 获取单个仓库信息
export async function fetchRepoDetails(repoName: string): Promise<GitHubRepo> {
  return fetchGitHubAPI<GitHubRepo>(`/repos/${USERNAME}/${repoName}`);
}

// 获取仓库的README内容
export async function fetchRepoReadme(repoName: string): Promise<string> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${USERNAME}/${repoName}/readme`);
    
    if (!response.ok) {
      return '# README\n\n该仓库暂无README文件。';
    }
    
    const data = await response.json();
    const content = atob(data.content.replace(/\s/g, ''));
    return content;
  } catch (error) {
    console.error('Error fetching README:', error);
    return '# README\n\n无法加载README内容。';
  }
}

// 获取仓库语言统计
export async function fetchRepoLanguages(repoName: string): Promise<GitHubLanguageStats> {
  try {
    return await fetchGitHubAPI<GitHubLanguageStats>(`/repos/${USERNAME}/${repoName}/languages`);
  } catch (error) {
    console.error('Error fetching languages:', error);
    return {};
  }
}

// 获取仓库贡献者
export async function fetchRepoContributors(repoName: string): Promise<GitHubContributor[]> {
  try {
    return await fetchGitHubAPI<GitHubContributor[]>(`/repos/${USERNAME}/${repoName}/contributors`);
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return [];
  }
}

// 获取仓库提交活动统计
export async function fetchRepoCommitActivity(repoName: string): Promise<GitHubCommitActivity[]> {
  try {
    return await fetchGitHubAPI<GitHubCommitActivity[]>(`/repos/${USERNAME}/${repoName}/stats/commit_activity`);
  } catch (error) {
    console.error('Error fetching commit activity:', error);
    return [];
  }
}

// 计算用户统计信息
export async function calculateUserStats(repos: GitHubRepo[]) {
  const totalRepos = repos.length;
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  
  // 语言统计
  const languageStats: GitHubLanguageStats = {};
  
  for (const repo of repos.slice(0, 20)) { // 限制请求数量
    try {
      const languages = await fetchRepoLanguages(repo.name);
      Object.entries(languages).forEach(([lang, bytes]) => {
        languageStats[lang] = (languageStats[lang] || 0) + bytes;
      });
    } catch (error) {
      console.error(`Error fetching languages for ${repo.name}:`, error);
    }
  }
  
  return {
    totalRepos,
    totalStars,
    totalForks,
    totalCommits: 0, // 这个需要更复杂的计算，暂时设为0
    languageStats
  };
}

// 获取编程语言颜色映射
export const languageColors: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#239120',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Go: '#00ADD8',
  Rust: '#dea584',
  Swift: '#ffac45',
  Kotlin: '#F18E33',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#1572B6',
  Vue: '#4FC08D',
  React: '#61DAFB',
  Shell: '#89e051',
  Dockerfile: '#384d54',
  Makefile: '#427819',
  Jupyter: '#DA5B0B',
  default: '#858585'
};

export function getLanguageColor(language: string): string {
  return languageColors[language] || languageColors.default;
}