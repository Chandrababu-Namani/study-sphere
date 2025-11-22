export enum ResourceType {
  PDF = 'PDF',
  VIDEO = 'VIDEO',
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  thumbnailUrl?: string; // Added for custom cover images
  category: string;
  addedAt: number;
  likes?: number;
  dislikes?: number;
  views?: number; // New field for tracking views
  isPinned?: boolean; // Featured content
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppView {
  HOME = 'HOME',
  ADMIN = 'ADMIN'
}

export interface ResourceRequest {
  id: string;
  title: string;
  details: string;
  status: 'pending' | 'completed';
  createdAt: number;
}
