import React, { useState, useEffect } from 'react';
import { Lock, Plus, FileText, Video, Trash2, Image, BarChart3, Eye, Layers, Pin, MessageSquare, Check, Users } from 'lucide-react';
import { Resource, ResourceType, ResourceRequest } from '../types';
import { 
    addResource, 
    deleteResource, 
    subscribeToResources, 
    togglePinResource, 
    subscribeToRequests, 
    updateRequestStatus, 
    deleteRequest,
    subscribeToLiveCount
} from '../services/storageService';

// Hardcoded simple passkey for MVP demonstration
const ADMIN_PASSKEY = "9121";

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'resources' | 'requests'>('resources');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: ResourceType.PDF,
    url: '',
    thumbnailUrl: '',
    category: '',
  });

  const [resourceList, setResourceList] = useState<Resource[]>([]);
  const [requestList, setRequestList] = useState<ResourceRequest[]>([]);
  const [liveUserCount, setLiveUserCount] = useState(0);

  // Subscribe to data
  useEffect(() => {
    if (isAuthenticated) {
        const unsubResources = subscribeToResources((data) => {
            setResourceList(data);
        });
        const unsubRequests = subscribeToRequests((data) => {
            setRequestList(data);
        });
        const unsubLive = subscribeToLiveCount((count) => {
            setLiveUserCount(count);
        });

        return () => {
            unsubResources();
            unsubRequests();
            unsubLive();
        };
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSKEY) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid passkey');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newResource = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      url: formData.url,
      thumbnailUrl: formData.thumbnailUrl,
      category: formData.category,
      addedAt: Date.now(),
    };

    try {
        await addResource(newResource);
        setFormData({
          title: '',
          description: '',
          type: ResourceType.PDF,
          url: '',
          thumbnailUrl: '',
          category: '',
        });
        alert('Resource added successfully!');
    } catch (e) {
        // Error handled in service
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
      if(confirm("Are you sure you want to delete this resource?")) {
          await deleteResource(id);
      }
  }

  const handlePin = async (r: Resource) => {
      await togglePinResource(r.id, r.isPinned || false);
  }

  const handleRequestStatus = async (id: string, currentStatus: 'pending' | 'completed') => {
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      await updateRequestStatus(id, newStatus);
  }

  const handleDeleteRequest = async (id: string) => {
      if(confirm("Delete this request?")) {
          await deleteRequest(id);
      }
  }

  // Analytics Calculations
  const totalViews = resourceList.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalResources = resourceList.length;
  const topResource = resourceList.reduce((prev, current) => {
      return ((prev.views || 0) > (current.views || 0)) ? prev : current
  }, resourceList[0] || null);
  const pendingRequests = requestList.filter(r => r.status === 'pending').length;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-200 dark:border-zinc-800">
          <div className="text-center mb-6">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-red-500 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Access</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">Please enter the passkey to manage resources.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Passkey"
                className="w-full p-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            <button
              type="submit"
              className="w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition-colors shadow-md"
            >
              Unlock Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-zinc-800 flex items-center space-x-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400">
                  <Eye size={24} />
              </div>
              <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Views</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalViews}</h3>
              </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-zinc-800 flex items-center space-x-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-full text-rose-600 dark:text-rose-400">
                  <Users size={24} />
              </div>
              <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Live Users</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {liveUserCount}
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                  </h3>
              </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-zinc-800 flex items-center space-x-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full text-purple-600 dark:text-purple-400">
                  <Layers size={24} />
              </div>
              <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Resources</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalResources}</h3>
              </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-zinc-800 flex items-center space-x-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full text-green-600 dark:text-green-400">
                  <BarChart3 size={24} />
              </div>
              <div className="min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Top Resource</p>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate" title={topResource?.title || 'N/A'}>
                      {topResource ? topResource.title : 'N/A'}
                  </h3>
                  {topResource && <p className="text-xs text-green-600 font-medium">{topResource.views} views</p>}
              </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800">
          <button 
            onClick={() => setActiveTab('resources')}
            className={`px-6 py-3 font-bold text-sm transition-colors relative ${activeTab === 'resources' ? 'text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
              Manage Resources
              {activeTab === 'resources' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 font-bold text-sm transition-colors relative flex items-center gap-2 ${activeTab === 'requests' ? 'text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
              Requests
              {pendingRequests > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingRequests}</span>}
              {activeTab === 'requests' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>}
          </button>
      </div>

      {activeTab === 'resources' ? (
        <>
            {/* Upload Form */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-zinc-800 animate-fade-in">
                <div className="flex items-center mb-6 border-b border-gray-100 dark:border-zinc-800 pb-4">
                    <div className="bg-primary p-2 rounded-lg mr-3">
                        <Plus className="text-white h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Link Resource</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="e.g., Calculus 101"
                    />
                    </div>
                    
                    <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category/Subject</label>
                    <input
                        required
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="e.g., Mathematics"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Resource Type</label>
                    <div className="flex space-x-4">
                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer flex-1 justify-center transition-colors ${formData.type === ResourceType.PDF ? 'bg-indigo-50 dark:bg-indigo-900/20 border-primary text-primary' : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300'}`}>
                        <input
                            type="radio"
                            name="type"
                            value={ResourceType.PDF}
                            checked={formData.type === ResourceType.PDF}
                            onChange={() => setFormData({ ...formData, type: ResourceType.PDF })}
                            className="hidden"
                        />
                        <FileText className="mr-2 h-4 w-4" /> PDF Link
                        </label>
                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer flex-1 justify-center transition-colors ${formData.type === ResourceType.VIDEO ? 'bg-indigo-50 dark:bg-indigo-900/20 border-primary text-primary' : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300'}`}>
                        <input
                            type="radio"
                            name="type"
                            value={ResourceType.VIDEO}
                            checked={formData.type === ResourceType.VIDEO}
                            onChange={() => setFormData({ ...formData, type: ResourceType.VIDEO })}
                            className="hidden"
                        />
                        <Video className="mr-2 h-4 w-4" /> Video Link
                        </label>
                    </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full p-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="Brief summary of the content..."
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Content URL</label>
                    <input
                        required
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="Paste Google Drive or YouTube Link"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <Image className="w-4 h-4 mr-1" /> Cover Image URL (Optional)
                    </label>
                    <input
                        type="url"
                        value={formData.thumbnailUrl}
                        onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="https://example.com/image.jpg"
                    />
                    </div>

                    <div className="flex justify-end items-end h-full pb-1 pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg w-full md:w-auto ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Saving...' : 'Add Resource'}
                        </button>
                    </div>
                </div>
                </form>
            </div>

            {/* Manage List */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-zinc-800 animate-fade-in">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Manage Existing Resources</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                        <thead className="bg-gray-50 dark:bg-zinc-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pin</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Views</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                            {resourceList.map(r => (
                                <tr key={r.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button 
                                            onClick={() => handlePin(r)}
                                            className={`transition-colors ${r.isPinned ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-300 dark:text-zinc-600 hover:text-gray-500'}`}
                                            title="Toggle Pin"
                                        >
                                            <Pin size={18} className={r.isPinned ? 'fill-current' : ''} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white max-w-xs truncate" title={r.title}>{r.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${r.type === ResourceType.PDF ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'}`}>
                                            {r.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">{r.views || 0}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDelete(r.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
      ) : (
          /* Requests List */
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-zinc-800 animate-fade-in">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Student Requests</h3>
              {requestList.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                      <MessageSquare className="mx-auto h-12 w-12 text-gray-300 dark:text-zinc-700 mb-2" />
                      <p>No requests yet.</p>
                  </div>
              ) : (
                <div className="grid gap-4">
                    {requestList.map(req => (
                        <div key={req.id} className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h4 className={`font-bold ${req.status === 'completed' ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                                    {req.title}
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">{req.details}</p>
                                <p className="text-xs text-gray-500 mt-2 font-medium">{new Date(req.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleRequestStatus(req.id, req.status)}
                                    className={`p-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                                        req.status === 'completed' 
                                        ? 'bg-gray-200 text-gray-600 dark:bg-zinc-700 dark:text-gray-300' 
                                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                    }`}
                                >
                                    {req.status === 'completed' ? 'Completed' : <><Check size={16} /> Mark Done</>}
                                </button>
                                <button 
                                    onClick={() => handleDeleteRequest(req.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
              )}
          </div>
      )}
    </div>
  );
};

export default AdminPanel;