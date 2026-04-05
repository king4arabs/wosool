export interface Founder {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  title: string;
  company: string;
  sector: string;
  stage: string;
  location: string;
  founderScore: number;
  tags: string[];
  bio: string;
  joinedDate: string;
  featured?: boolean;
}

export interface FounderStory {
  id: string;
  quote: string;
  founderName: string;
  company: string;
  initials: string;
  avatarColor: string;
}

export interface ScoreMetric {
  name: string;
  description: string;
  icon: string;
}
