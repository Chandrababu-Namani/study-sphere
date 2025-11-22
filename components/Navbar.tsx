import React from 'react';
import { BookOpen, ShieldCheck, Library, Sun, Moon, MessageSquarePlus } from 'lucide-react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onRequestClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onChangeView, isDarkMode, toggleDarkMode, onRequestClick }) => {
  const navItems = [
    { id: AppView.HOME, label: 'Study Hub', icon: <Library size={20} /> },
    { id: AppView.ADMIN, label: 'Admin', icon: <ShieldCheck size={20} /> },
  ];

  return (
    <nav className="bg-white dark:bg-zinc-900 shadow-sm sticky top-0 z-50 transition-colors duration-200 border-b border-gray-100 dark:border-zinc-800">
      <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onChangeView(AppView.HOME)}>
            <BookOpen className="h-8 w-8 text-primary dark:text-indigo-400" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Study Sphere</span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
             {/* Request Button (Only visible on Home) */}
             {currentView === AppView.HOME && (
                 <button
                    onClick={onRequestClick}
                    className="hidden sm:flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                 >
                     <MessageSquarePlus size={16} className="mr-1.5" />
                     Request Resource
                 </button>
             )}

             <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              title="Toggle Dark Mode"
             >
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>

            <div className="flex space-x-1 sm:space-x-2 items-center">
                {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onChangeView(item.id)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    currentView === item.id
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:hover:text-white'
                    }`}
                >
                    <span className="mr-2 hidden sm:inline">{item.icon}</span>
                    {item.label}
                </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;