import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { GitHubRepo } from '../types/github';
import { getLanguageColor } from '../services/github';

interface RepoCardProps {
  repo: GitHubRepo;
}

const RepoCard: React.FC<RepoCardProps> = ({ repo }) => {
  const handleClick = () => {
    window.location.href = repo.html_url;
  };

  return (
    <motion.div
      className="group relative bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 cursor-pointer overflow-hidden h-full flex flex-col"
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0, 212, 255, 0.1)'
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
    >
      {/* 发光边框效果 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* 内容 */}
      <div className="relative z-10 flex flex-col h-full">
        {/* 头部 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-200 font-['Orbitron'] line-clamp-1">
              {repo.name}
            </h3>
            {repo.description && (
              <p className="text-slate-300 text-sm mt-1 line-clamp-2 min-h-[2.5rem]">
                {repo.description}
              </p>
            )}
            {!repo.description && (
              <div className="min-h-[2.5rem]" />
            )}
          </div>
          <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors duration-200 ml-2 flex-shrink-0" />
        </div>

        {/* 主要语言 */}
        {repo.language && (
          <div className="flex items-center mb-3">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: getLanguageColor(repo.language) }}
            />
            <span className="text-sm text-slate-300 font-medium">
              {repo.language}
            </span>
          </div>
        )}


        {/* Topics */}
        <div className="mt-auto pt-3">
          {repo.topics && repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {repo.topics.slice(0, 3).map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30"
                >
                  {topic}
                </span>
              ))}
              {repo.topics.length > 3 && (
                <span className="px-2 py-1 text-xs bg-slate-500/20 text-slate-400 rounded-full border border-slate-500/30">
                  +{repo.topics.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 悬停时的光效 */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
    </motion.div>
  );
};

export default RepoCard;