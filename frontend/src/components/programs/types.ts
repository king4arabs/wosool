import type { LucideIcon } from "lucide-react";

export interface Program {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  icon: LucideIcon;
  outcomes: string[];
}

export interface ProgramStep {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface Cohort {
  id: string;
  programName: string;
  startDate: string;
  spotsAvailable: number;
  totalSpots: number;
}

export interface ProgramFAQ {
  question: string;
  answer: string;
}
