import React from 'react';
import { Heart, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 mt-auto">
      <div className="max-w-[95%] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Study Sphere</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Empowering students with curated resources.
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center font-medium">
              Built with <Heart size={16} className="mx-1 text-red-500 fill-current" /> for Students
            </span>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-zinc-800 text-center md:text-left text-xs text-gray-500 dark:text-gray-500">
          <p>&copy; {new Date().getFullYear()} Study Sphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;