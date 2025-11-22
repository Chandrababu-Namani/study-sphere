import React, { useState } from 'react';
import { X, MessageSquarePlus } from 'lucide-react';
import { addRequest } from '../services/storageService';

interface RequestModalProps {
  onClose: () => void;
}

const RequestModal: React.FC<RequestModalProps> = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await addRequest(title, details);
      alert("Request submitted! We'll try to add this soon.");
      onClose();
    } catch (error) {
      alert("Error submitting request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-zinc-800 transform transition-all">
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2 text-primary">
                    <MessageSquarePlus className="h-6 w-6" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Request Resource</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X size={24} />
                </button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Can't find what you're looking for? Let us know and we'll upload it!
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject / Topic</label>
                    <input 
                        required
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Thermodynamics, Linear Algebra..."
                        className="w-full p-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Details</label>
                    <textarea 
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Any specific book, video, or year?"
                        rows={3}
                        className="w-full p-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                    />
                </div>

                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50"
                    >
                        {isSubmitting ? 'Sending...' : 'Submit Request'}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;
