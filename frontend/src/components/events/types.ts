import type { LucideIcon } from "lucide-react";

export type EventType =
  | "Workshop"
  | "Meetup"
  | "Panel"
  | "Fireside"
  | "Networking"
  | "Hackathon"
  | "Summit"
  | "Awards"
  | "Demo Day";

export type EventFormat = "Virtual" | "In-Person" | "Hybrid";

export interface WosoolEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: EventType;
  format: EventFormat;
  icon?: LucideIcon;
}

export interface SignatureEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: LucideIcon;
}

export interface FounderSession {
  id: string;
  title: string;
  founderName: string;
  description: string;
  date: string;
  time: string;
  format: EventFormat;
}

export interface ExternalEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  url: string;
}

export interface PrivateSession {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  memberTier: string;
}

export interface PartnerEvent {
  id: string;
  title: string;
  partnerName: string;
  description: string;
  date: string;
  time: string;
  format: EventFormat;
}
