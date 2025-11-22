import React, { useRef } from 'react';
import { X, ExternalLink, Download, Maximize } from 'lucide-react';
import { Resource, ResourceType } from '../types';

interface ResourceViewerProps {
  resource: Resource;
  onClose: () => void;
}

const ResourceViewer: React.FC<ResourceViewerProps> = ({ resource, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Helper to format URLs for embedding
  const getEmbedUrl = (url: string, type: ResourceType): string => {
    if (!url) return '';

    if (type === ResourceType.VIDEO) {
      // Handle YouTube
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('v=')) {
          videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].split('?')[0];
        }
        
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        }
      }
    }
    
    if (type === ResourceType.PDF) {
      // Handle Google Drive
      if (url.includes('drive.google.com')) {
        // Convert /view to /preview for embedding to avoid headers issues
        return url.replace(/\/view.*/, '/preview');
      }
    }
    
    return url;
  };

  const embedUrl = getEmbedUrl(resource.url, resource.type);

  const toggleFullScreen = () => {
    if (!contentRef.current) return;

    if (!document.fullscreenElement) {
      contentRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-[95%] h-[90vh] flex flex-col shadow-2xl overflow-hidden relative border border-gray-200 dark:border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{resource.title}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
               <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold uppercase">{resource.category}</span>
               <span>•</span>
               <span>{resource.type}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {resource.type === ResourceType.PDF && (
              <>
                <button
                  onClick={toggleFullScreen}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                  title="Full Screen"
                >
                  <Maximize size={20} />
                </button>
                <a
                  href={resource.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                  title="Download"
                >
                  <Download size={20} />
                </a>
              </>
            )}
            <a 
              href={resource.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
              title="Open in new tab"
            >
              <ExternalLink size={20} />
            </a>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors rounded-full"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div 
          id="resource-content-container" 
          ref={contentRef}
          className="flex-1 bg-black relative flex items-center justify-center overflow-hidden"
        >
          {embedUrl ? (
             <iframe
             src={embedUrl}
             title={resource.title}
             className="w-full h-full border-0"
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
             allowFullScreen
           />
          ) : (
            <div className="text-white text-center p-8">
                <p className="text-lg">Unable to embed this resource.</p>
                <a href={resource.url} target="_blank" rel="noreferrer" className="text-primary hover:underline mt-2 inline-block">Click here to open it</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceViewer;