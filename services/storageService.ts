import { 
  collection, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  increment,
  setDoc,
  serverTimestamp,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Resource, ResourceType, ResourceRequest } from '../types';

const COLLECTION_NAME = 'resources';
const REQUESTS_COLLECTION = 'requests';
const PRESENCE_COLLECTION = 'presence';

// Fallback data for when the database is empty or not connected yet
const INITIAL_DATA: Resource[] = [
  {
    id: '1',
    title: 'Calculus Cheat Sheet',
    description: 'A comprehensive quick reference guide for limits, derivatives, and integrals.',
    type: ResourceType.PDF,
    url: 'https://pdfobject.com/pdf/sample.pdf', 
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/De_Agnesi_-_Instituzioni_analitiche_ad_uso_della_giovent%C3%B9_italiana%2C_1748_-_3983685.tif/lossy-page1-1200px-De_Agnesi_-_Instituzioni_analitiche_ad_uso_della_giovent%C3%B9_italiana%2C_1748_-_3983685.tif.jpg',
    category: 'Mathematics',
    addedAt: Date.now(),
    likes: 12,
    dislikes: 1,
    views: 120,
    isPinned: true
  },
  {
    id: '2',
    title: 'The French Revolution Explained',
    description: 'Deep dive into the causes and effects of the revolution.',
    type: ResourceType.VIDEO,
    url: 'https://www.youtube.com/watch?v=VEZqarUnVpo', 
    category: 'History',
    addedAt: Date.now() - 100000,
    likes: 45,
    dislikes: 2,
    views: 340
  }
];

/**
 * Subscribes to the resources collection in Firestore.
 */
export const subscribeToResources = (callback: (resources: Resource[]) => void) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('addedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const resources: Resource[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        resources.push({ 
          id: doc.id, 
          ...data,
          likes: data.likes || 0,
          dislikes: data.dislikes || 0,
          views: data.views || 0,
          isPinned: data.isPinned || false
        } as Resource);
      });
      
      if (resources.length === 0) {
        // If DB is empty, use initial data
        callback(INITIAL_DATA);
      } else {
        callback(resources);
      }
    }, (error) => {
      console.error("Error fetching resources:", error);
      callback(INITIAL_DATA);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up Firebase listener:", error);
    callback(INITIAL_DATA);
    return () => {};
  }
};

/**
 * Adds a new resource link to Firestore.
 */
export const addResource = async (resource: Omit<Resource, 'id'>): Promise<void> => {
  try {
    await addDoc(collection(db, COLLECTION_NAME), {
        ...resource,
        likes: 0,
        dislikes: 0,
        views: 0,
        isPinned: false
    });
  } catch (error) {
    console.error("Error adding resource: ", error);
    alert("Failed to save to database. Check Firebase Config.");
    throw error;
  }
};

/**
 * Deletes a resource from Firestore.
 */
export const deleteResource = async (id: string): Promise<void> => {
  try {
    if (id === '1' || id === '2') {
       alert("Cannot delete sample data.");
       return;
    }
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting resource: ", error);
    alert("Failed to delete.");
    throw error;
  }
};

/**
 * Toggle Pin Status
 */
export const togglePinResource = async (id: string, currentStatus: boolean) => {
    try {
        if (id === '1' || id === '2') return;
        const resourceRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(resourceRef, {
            isPinned: !currentStatus
        });
    } catch (error) {
        console.error("Error pinning resource:", error);
    }
};

/**
 * Vote on a resource
 */
export const voteResource = async (id: string, voteType: 'like' | 'dislike', incrementVal: boolean) => {
    try {
        if (id === '1' || id === '2') return;
        const resourceRef = doc(db, COLLECTION_NAME, id);
        const field = voteType === 'like' ? 'likes' : 'dislikes';
        await updateDoc(resourceRef, {
            [field]: increment(incrementVal ? 1 : -1)
        });
    } catch (error) {
        console.error("Error voting: ", error);
    }
};

/**
 * Increment View Count
 */
export const incrementView = async (id: string) => {
    try {
        if (id === '1' || id === '2') return;
        const resourceRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(resourceRef, {
            views: increment(1)
        });
    } catch (error) {
        console.error("Error incrementing view:", error);
    }
};

// --- REQUESTS SYSTEM ---

export const addRequest = async (title: string, details: string) => {
    try {
        await addDoc(collection(db, REQUESTS_COLLECTION), {
            title,
            details,
            status: 'pending',
            createdAt: Date.now()
        });
    } catch (error) {
        console.error("Error adding request:", error);
        throw error;
    }
};

export const subscribeToRequests = (callback: (requests: ResourceRequest[]) => void) => {
    const q = query(collection(db, REQUESTS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const reqs: ResourceRequest[] = [];
        snapshot.forEach(doc => {
            reqs.push({ id: doc.id, ...doc.data() } as ResourceRequest);
        });
        callback(reqs);
    });
};

export const updateRequestStatus = async (id: string, status: 'pending' | 'completed') => {
     await updateDoc(doc(db, REQUESTS_COLLECTION, id), { status });
};

export const deleteRequest = async (id: string) => {
    await deleteDoc(doc(db, REQUESTS_COLLECTION, id));
};

// --- PRESENCE SYSTEM (LIVE COUNT) ---

const getClientId = () => {
    let id = localStorage.getItem('study_sphere_client_id');
    if (!id) {
        id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('study_sphere_client_id', id);
    }
    return id;
};

export const sendHeartbeat = async () => {
    const clientId = getClientId();
    const presenceRef = doc(db, PRESENCE_COLLECTION, clientId);
    try {
        // Update timestamp
        await setDoc(presenceRef, {
            lastSeen: serverTimestamp() 
        }, { merge: true });
    } catch (e) {
        // Silently fail if offline
    }
};

export const subscribeToLiveCount = (callback: (count: number) => void) => {
    // Query users seen in the last 2 minutes
    // Note: Firestore query on serverTimestamp requires 'where' clauses carefully.
    // For simplicity in this frontend-only MVP, we fetch all presence docs and filter in JS.
    // In a high-scale app, use Cloud Functions to aggregate this.
    
    const q = query(collection(db, PRESENCE_COLLECTION));
    
    return onSnapshot(q, (snapshot) => {
        const now = Date.now();
        let activeCount = 0;
        
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.lastSeen) {
                // Convert Firestore Timestamp to millis
                const lastSeenMillis = data.lastSeen.toMillis ? data.lastSeen.toMillis() : Date.now();
                // Consider active if seen in last 2 minutes
                if (now - lastSeenMillis < 2 * 60 * 1000) {
                    activeCount++;
                }
            }
        });
        
        callback(activeCount);
    });
};
