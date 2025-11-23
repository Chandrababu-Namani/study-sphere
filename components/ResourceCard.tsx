import React, { useState, useEffect } from 'react';
import { FileText, Video, PlayCircle, Eye, ThumbsUp, ThumbsDown, Pin } from 'lucide-react';
import { Resource, ResourceType } from '../types';
import { voteResource } from '../services/storageService';

interface ResourceCardProps {
  resource: Resource;
  onView: (resource: Resource) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onView }) => {
  const [imageError, setImageError] = useState(false);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);

  // Load vote state from local storage on mount
  useEffect(() => {
      const storedVote = localStorage.getItem(`vote_${resource.id}`);
      if (storedVote === 'like' || storedVote === 'dislike') {
          setUserVote(storedVote);
      }
  }, [resource.id]);

  const handleVote = (e: React.MouseEvent, type: 'like' | 'dislike') => {
      e.stopPropagation();
      
      const previousVote = userVote;
      let newVote: 'like' | 'dislike' | null = null;

      if (previousVote === type) {
          // Removing vote
          newVote = null;
          voteResource(resource.id, type, false); // Decrement
      } else {
          // Changing vote or adding new vote
          newVote = type;
          if (previousVote) {
              // Remove previous opposite vote first
              voteResource(resource.id, previousVote, false);
          }
          // Add new vote
          voteResource(resource.id, type, true);
      }

      setUserVote(newVote);
      if (newVote) {
          localStorage.setItem(`vote_${resource.id}`, newVote);
      } else {
          localStorage.removeItem(`vote_${resource.id}`);
      }
  };

  const getIcon = () => {
    if (resource.type === ResourceType.PDF) {
      return <FileText className="h-10 w-10 text-red-600" />;
    }
    return <Video className="h-10 w-10 text-blue-600" />;
  };

  const getThumbnailUrl = () => {
      if (imageError) return null;

      // Priority 1: Explicitly provided thumbnail
      if (resource.thumbnailUrl) {
          if (resource.thumbnailUrl.includes('drive.google.com')) {
              // Robust extraction for .../d/ID/... or ?id=ID
              const idMatch = resource.thumbnailUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || 
                              resource.thumbnailUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
              
              if (idMatch && idMatch[1]) {
                  // Using lh3.googleusercontent.com is much more reliable for img tags than drive.google.com
                  return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
              }
          }
          return resource.thumbnailUrl;
      }

      // Priority 2: Auto-generate from YouTube
      if (resource.type === ResourceType.VIDEO && resource.url.includes('youtube.com')) {
          const videoId = resource.url.split('v=')[1]?.split('&')[0];
          if (videoId) {
              return `https://img.youtube.com/vi/${videoId}/0.jpg`;
          }
      }
      return null;
  }

  const thumbnail = getThumbnailUrl();

  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border flex flex-col h-full group cursor-pointer relative ${resource.isPinned ? 'border-indigo-400 dark:border-indigo-700 ring-2 ring-indigo-100 dark:ring-indigo-900/30' : 'border-gray-300 dark:border-zinc-800'}`} onClick={() => onView(resource)}>
        
        {/* Pinned Badge */}
        {resource.isPinned && (
            <div className="absolute top-3 left-3 z-20 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Pin size={12} className="fill-current" />
                FEATURED
            </div>
        )}

        {/* Type Badge (Image Overlay) */}
        <div className={`absolute top-3 right-3 z-20 text-xs font-bold px-2 py-1 rounded shadow-lg ${
            resource.type === ResourceType.PDF 
            ? 'bg-red-600 text-white' 
            : 'bg-blue-600 text-white'
        }`}>
            {resource.type}
        </div>

        {thumbnail ? (
            <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-zinc-950">
                <img 
                    src={thumbnail} 
                    alt={resource.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={() => setImageError(true)}
                    referrerPolicy="no-referrer"
                />
                
                {/* Show Play icon only for videos */}
                {resource.type === ResourceType.VIDEO && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all">
                        <PlayCircle className="text-white opacity-0 group-hover:opacity-100 w-12 h-12 drop-shadow-lg transform scale-75 group-hover:scale-100 transition-all" />
                    </div>
                )}

                {/* Show Eye icon overlay for PDFs on hover */}
                {resource.type === ResourceType.PDF && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all">
                         <Eye className="text-white opacity-0 group-hover:opacity-100 w-12 h-12 drop-shadow-lg transform scale-75 group-hover:scale-100 transition-all" />
                    </div>
                )}
            </div>
        ) : (
             <div className="h-48 w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center group-hover:bg-gray-100 dark:group-hover:bg-zinc-800 transition-colors">
                 {getIcon()}
             </div>
        )}
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wide">
                    {resource.category}
                </span>
                <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${resource.type === ResourceType.PDF ? 'text-red-600 border-red-200 dark:border-red-900/30' : 'text-blue-600 border-blue-200 dark:border-blue-900/30'}`}>
                     {resource.type === ResourceType.PDF ? <FileText size={10}/> : <Video size={10}/>}
                     {resource.type}
                </span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600 dark:text-zinc-500">
                <Eye size={14} />
                <span className="text-xs font-medium">{resource.views || 0}</span>
            </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
            {resource.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow line-clamp-3 leading-relaxed">
            {resource.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex space-x-3">
                 <button 
                    onClick={(e) => handleVote(e, 'like')}
                    className={`flex items-center space-x-1 text-xs font-medium transition-colors ${userVote === 'like' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 hover:text-green-600 dark:hover:text-green-400'}`}
                 >
                     <ThumbsUp size={16} className={userVote === 'like' ? 'fill-current' : ''} />
                     <span>{resource.likes || 0}</span>
                 </button>
                 <button 
                    onClick={(e) => handleVote(e, 'dislike')}
                    className={`flex items-center space-x-1 text-xs font-medium transition-colors ${userVote === 'dislike' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 hover:text-red-600 dark:hover:text-red-400'}`}
                 >
                     <ThumbsDown size={16} className={userVote === 'dislike' ? 'fill-current' : ''} />
                     <span>{resource.dislikes || 0}</span>
                 </button>
            </div>

            <button
            onClick={(e) => {
                e.stopPropagation();
                onView(resource);
            }}
            className="inline-flex items-center justify-center px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-semibold hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary transition-colors"
            >
             Open {resource.type}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;