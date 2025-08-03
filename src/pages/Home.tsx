import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink } from 'lucide-react';

import { useGitHubStore } from '../store/useGitHubStore';
import ParticleBackground from '../components/ParticleBackground';
import RepoCard from '../components/RepoCard';
import Loading from '../components/Loading';
import { GitHubRepo } from '../types/github';

const Home: React.FC = () => {

  const {
    user,
    repos,
    loading,
    error,
    fetchData,
    clearError
  } = useGitHubStore();

  const [showRepos, setShowRepos] = useState(false);

  // 项目分类逻辑
  const categorizeRepos = (repos: GitHubRepo[]) => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const myProjects = repos
      .filter(repo => !repo.fork && new Date(repo.updated_at) > oneYearAgo)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    const participatedProjects = repos
      .filter(repo => repo.fork)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    const historyProjects = repos
      .filter(repo => !repo.fork && new Date(repo.updated_at) <= oneYearAgo)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return { myProjects, participatedProjects, historyProjects };
  };

  const { myProjects, participatedProjects, historyProjects } = categorizeRepos(repos);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!loading && repos.length > 0) {
      const timer = setTimeout(() => setShowRepos(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, repos]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <ParticleBackground />
        <Loading message="正在获取 GitHub 数据..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <ParticleBackground />
        <div className="text-center space-y-4">
          <div className="text-red-400 text-xl font-semibold">加载失败</div>
          <div className="text-slate-300">{error}</div>
          <button
            onClick={() => {
              clearError();
              fetchData();
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <ParticleBackground />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* 头像 */}
          {user && (
            <motion.div
              className="relative mx-auto w-32 h-32 mb-8"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <img
                src={user.avatar_url}
                alt={user.name || user.login}
                className="w-full h-full rounded-full object-cover border-4 border-blue-400/50"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-lg" />
            </motion.div>
          )}
          
          {/* 标题 */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold font-['Orbitron'] bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {user?.name || 'jptx1234'}
            </h1>
            {user?.bio && (
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                {user.bio}
              </p>
            )}
          </motion.div>
          
          {/* 行动按钮 */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.a
              href={user?.html_url}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="w-5 h-5" />
              <span>访问 GitHub</span>
              <ExternalLink className="w-4 h-4" />
            </motion.a>
            
            <motion.button
              onClick={() => {
                const reposSection = document.getElementById('repos-section');
                reposSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 border border-blue-400/50 hover:bg-blue-400/10 rounded-lg font-medium transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              查看项目
            </motion.button>
          </motion.div>
        </div>
      </section>
      

      
      {/* 仓库列表 */}
      {showRepos && (
        <section id="repos-section" className="relative py-20 px-4">
          <div className="max-w-7xl mx-auto">

            

            
            {/* 我的项目 */}
            {myProjects.length > 0 && (
              <div className="mb-12">
                <motion.h3
                  className="text-2xl font-bold mb-6 text-blue-400"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  最近项目 ({myProjects.length})
                </motion.h3>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  {myProjects.map((repo, index) => (
                    <motion.div
                      key={repo.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="h-full"
                    >
                      <RepoCard
                        repo={repo}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* 参与项目 */}
            {participatedProjects.length > 0 && (
              <div className="mb-12">
                <motion.h3
                  className="text-2xl font-bold mb-6 text-purple-400"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  参与项目 ({participatedProjects.length})
                </motion.h3>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  {participatedProjects.map((repo, index) => (
                    <motion.div
                      key={repo.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="h-full"
                    >
                      <RepoCard
                        repo={repo}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* 历史项目 */}
            {historyProjects.length > 0 && (
              <div className="mb-12">
                <motion.div
                  className="flex items-center justify-between mb-6 cursor-pointer"
                  onClick={() => window.location.href = `${user?.html_url}?tab=repositories`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="text-2xl font-bold text-slate-400">
                    全部项目 ({repos.length})
                  </h3>
                  <motion.div
                    transition={{ duration: 0.3 }}
                  >
                    <ExternalLink className="w-6 h-6 text-slate-400" />
                  </motion.div>
                </motion.div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;