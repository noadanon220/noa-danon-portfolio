
export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  color: string;
  imageUrl: string;
  githubUrl?: string;
  repoName?: string;
  featured?: boolean;
  // Visual metadata for curated playground layout
  size?: 'sm' | 'md' | 'lg' | 'xl';
  aspect?: 'square' | 'video' | 'portrait';
  initialRotate?: number;
}

export interface Skill {
  name: string;
  icon: string;
  category: 'frontend' | 'backend' | 'design' | 'other';
  color: string;
}
