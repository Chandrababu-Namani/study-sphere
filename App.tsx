import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ResourceCard from './components/ResourceCard';
import AdminPanel from './components/AdminPanel';
import ResourceViewer from './components/ResourceViewer';
import RequestModal from './components/RequestModal';
import Footer from './components/Footer';
import { AppView, Resource } from './types';
import { subscribeToResources, incrementView, sendHeartbeat } from './services/storageService';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

type SortOption = 'newest' | 'popular' | 'views' | 'oldest';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (localStorage.getItem('theme') === 'dark') {
        return true;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
      setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    // Subscribe to resources
    const unsubscribe = subscribeToResources((data) => {
      setResources(data);
      setIsLoading(false);
    });
    
    // Start Heartbeat for Live Count (Every 60s)
    sendHeartbeat(); // Initial beat
    const heartbeatInterval = setInterval(() => {
        sendHeartbeat();
    }, 60000);

    return () => {
        unsubscribe();
        clearInterval(heartbeatInterval);
    };
  }, []);

  // Filter Logic
  const categories = ['All', ...Array.from(new Set(resources.map((r) => r.category)))];
  
  const filteredResources = resources.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
      // Always show pinned items first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Then apply user sort
      switch (sortBy) {
          case 'newest':
              return b.addedAt - a.addedAt;
          case 'oldest':
              return a.addedAt - b.addedAt;
          case 'popular':
              return (b.likes || 0) - (a.likes || 0);
          case 'views':
              return (b.views || 0) - (a.views || 0);
          default:
              return 0;
      }
  });

  const handleViewResource = (resource: Resource) => {
    setViewingResource(resource);
    // Increment view count in DB
    incrementView(resource.id);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME:
        return (
          <div className="space-y-8 min-h-screen">
            {/* Search & Filters Section */}
            <div className="flex flex-col items-center space-y-6 pt-8 pb-4" id="resources-grid">
              
              {/* Centered Search Bar */}
              <div className="relative w-full max-w-2xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-zinc-800 rounded-full shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-lg transition-all hover:shadow-md placeholder-gray-400 dark:placeholder-zinc-600"
                />
              </div>
              
              {/* Filters & Sort */}
              <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-4xl justify-between">
                  {/* Categories */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedCategory === cat 
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-md transform scale-105' 
                            : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <ArrowUpDown size={16} className="text-gray-400" />
                      </div>
                      <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as SortOption)}
                          className="appearance-none pl-10 pr-8 py-2 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                          <option value="newest">Newest</option>
                          <option value="popular">Most Popular</option>
                          <option value="views">Most Viewed</option>
                          <option value="oldest">Oldest</option>
                      </select>
                  </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-b border-gray-200 dark:border-zinc-800 w-full"></div>

            {/* Grid */}
            {isLoading ? (
              <div className="text-center py-20 text-gray-500 dark:text-gray-400">Loading resources...</div>
            ) : filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
                {filteredResources.map((resource) => (
                  <ResourceCard 
                    key={resource.id} 
                    resource={resource} 
                    onView={handleViewResource}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-block p-6 rounded-full bg-gray-100 dark:bg-zinc-900 mb-4">
                     <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No resources found</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or filters.</p>
                <button 
                    onClick={() => setIsRequestModalOpen(true)}
                    className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Request a Resource
                </button>
              </div>
            )}
          </div>
        );
      case AppView.ADMIN:
        return <AdminPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-sans flex flex-col transition-colors duration-200">
      <Navbar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
        onRequestClick={() => setIsRequestModalOpen(true)} 
      />
      
      <main className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full flex-grow">
        {renderContent()}
      </main>
      
      <Footer />
      
      {/* Modals */}
      {viewingResource && (
        <ResourceViewer 
          resource={viewingResource} 
          onClose={() => setViewingResource(null)} 
        />
      )}

      {isRequestModalOpen && (
          <RequestModal onClose={() => setIsRequestModalOpen(false)} />
      )}
    </div>
  );
};

export default App;
