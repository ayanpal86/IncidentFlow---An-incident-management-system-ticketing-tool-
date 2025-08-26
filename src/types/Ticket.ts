export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo?: string;
  reportedBy: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  category: string;
  tags: string[];
  slaDeadline: Date;
  escalated: boolean;
  comments: Comment[];
}

export interface Comment {
  id: string;
  ticketId: string;
  author: string;
  content: string;
  createdAt: Date;
  internal: boolean;
}

export interface SLAConfig {
  P1: number; // hours
  P2: number;
  P3: number;
  P4: number;
}

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: Date;
  acknowledged: boolean;
}