export interface Company {
  id: string;
  name: string;
  initial: string;
  brandColor: string;
  sector: string;
  stage: string;
  founderName: string;
  description: string;
  keyMetric?: string;
  tags: string[];
  featured?: boolean;
  rising?: boolean;
  openForCollaboration?: boolean;
  hiring?: boolean;
  hiringRoles?: number;
  fundraising?: boolean;
  fundingRound?: string;
  fundingTarget?: string;
  lastUpdated?: string;
  updateNote?: string;
}

export interface SectorInfo {
  name: string;
  icon: string;
  companyCount: number;
  color: string;
}
