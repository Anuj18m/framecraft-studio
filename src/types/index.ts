export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  skills: string[];
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    email?: string;
    instagram?: string;
    behance?: string;
  };
  specialties: string[];
  experience: string;
}

export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  description: string;
  category: 'milestone' | 'achievement' | 'launch';
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  tags: string[];
  client?: string;
  location?: string;
  camera?: string;
  lens?: string;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface RipplePosition {
  x: number;
  y: number;
  timestamp: number;
}

export * from './share';
export * from './profile';
export * from './favorite';