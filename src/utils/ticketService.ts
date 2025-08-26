import { Ticket, Comment, SLAConfig } from '../types/Ticket';

const SLA_CONFIG: SLAConfig = {
  P1: 4,   // 4 hours for critical issues
  P2: 24,  // 24 hours for high priority
  P3: 72,  // 72 hours for medium priority
  P4: 168, // 1 week for low priority
};

class TicketService {
  private storageKey = 'incident_tickets';
  private commentsKey = 'ticket_comments';

  generateId(): string {
    return `INC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateSLADeadline(priority: Ticket['priority'], createdAt: Date): Date {
    const hours = SLA_CONFIG[priority];
    return new Date(createdAt.getTime() + hours * 60 * 60 * 1000);
  }

  createTicket(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'slaDeadline' | 'escalated' | 'comments'>): Ticket {
    const now = new Date();
    const ticket: Ticket = {
      ...ticketData,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
      slaDeadline: this.calculateSLADeadline(ticketData.priority, now),
      escalated: false,
      comments: [],
    };

    const tickets = this.getAllTickets();
    tickets.push(ticket);
    this.saveTickets(tickets);
    
    return ticket;
  }

  getAllTickets(): Ticket[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];
    
    return JSON.parse(stored).map((ticket: any) => ({
      ...ticket,
      createdAt: new Date(ticket.createdAt),
      updatedAt: new Date(ticket.updatedAt),
      slaDeadline: new Date(ticket.slaDeadline),
      resolvedAt: ticket.resolvedAt ? new Date(ticket.resolvedAt) : undefined,
      comments: ticket.comments.map((comment: any) => ({
        ...comment,
        createdAt: new Date(comment.createdAt),
      })),
    }));
  }

  getTicketById(id: string): Ticket | null {
    const tickets = this.getAllTickets();
    return tickets.find(ticket => ticket.id === id) || null;
  }

  updateTicket(id: string, updates: Partial<Ticket>): Ticket | null {
    const tickets = this.getAllTickets();
    const ticketIndex = tickets.findIndex(ticket => ticket.id === id);
    
    if (ticketIndex === -1) return null;

    const updatedTicket = {
      ...tickets[ticketIndex],
      ...updates,
      updatedAt: new Date(),
    };

    if (updates.status === 'Resolved' && !tickets[ticketIndex].resolvedAt) {
      updatedTicket.resolvedAt = new Date();
    }

    tickets[ticketIndex] = updatedTicket;
    this.saveTickets(tickets);
    
    return updatedTicket;
  }

  deleteTicket(id: string): boolean {
    const tickets = this.getAllTickets();
    const filteredTickets = tickets.filter(ticket => ticket.id !== id);
    
    if (filteredTickets.length === tickets.length) return false;
    
    this.saveTickets(filteredTickets);
    return true;
  }

  checkForEscalations(): Ticket[] {
    const tickets = this.getAllTickets();
    const now = new Date();
    const escalatedTickets: Ticket[] = [];

    tickets.forEach(ticket => {
      if (ticket.status !== 'Resolved' && ticket.status !== 'Closed' && 
          !ticket.escalated && now > ticket.slaDeadline) {
        const escalatedTicket = this.updateTicket(ticket.id, { escalated: true });
        if (escalatedTicket) {
          escalatedTickets.push(escalatedTicket);
        }
      }
    });

    return escalatedTickets;
  }

  getTicketStats() {
    const tickets = this.getAllTickets();
    const now = new Date();

    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'Open').length,
      inProgress: tickets.filter(t => t.status === 'In Progress').length,
      resolved: tickets.filter(t => t.status === 'Resolved').length,
      closed: tickets.filter(t => t.status === 'Closed').length,
      overdue: tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed' && now > t.slaDeadline).length,
      escalated: tickets.filter(t => t.escalated).length,
      byPriority: {
        P1: tickets.filter(t => t.priority === 'P1').length,
        P2: tickets.filter(t => t.priority === 'P2').length,
        P3: tickets.filter(t => t.priority === 'P3').length,
        P4: tickets.filter(t => t.priority === 'P4').length,
      }
    };
  }

  addComment(ticketId: string, comment: Omit<Comment, 'id' | 'ticketId' | 'createdAt'>): Comment | null {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return null;

    const newComment: Comment = {
      ...comment,
      id: this.generateId(),
      ticketId,
      createdAt: new Date(),
    };

    ticket.comments.push(newComment);
    this.updateTicket(ticketId, { comments: ticket.comments });

    return newComment;
  }

  private saveTickets(tickets: Ticket[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tickets));
  }

  // Demo data initialization
  initializeDemoData(): void {
    const existingTickets = this.getAllTickets();
    if (existingTickets.length > 0) return;

    const demoTickets = [
      {
        title: 'Database Connection Timeout',
        description: 'Production database is experiencing connection timeouts affecting user authentication.',
        priority: 'P1' as const,
        status: 'Open' as const,
        reportedBy: 'john.doe@company.com',
        assignedTo: 'sarah.tech@company.com',
        category: 'Infrastructure',
        tags: ['database', 'production', 'authentication'],
      },
      {
        title: 'Email Notifications Not Working',
        description: 'Users are not receiving email notifications for password resets and account verification.',
        priority: 'P2' as const,
        status: 'In Progress' as const,
        reportedBy: 'alice.smith@company.com',
        assignedTo: 'mike.dev@company.com',
        category: 'Application',
        tags: ['email', 'notifications', 'user-experience'],
      },
      {
        title: 'Mobile App Crashes on iOS 17',
        description: 'Mobile application crashes when opening the profile section on iOS 17 devices.',
        priority: 'P2' as const,
        status: 'Open' as const,
        reportedBy: 'bob.johnson@company.com',
        category: 'Mobile',
        tags: ['mobile', 'ios', 'crash', 'profile'],
      },
      {
        title: 'Feature Request: Dark Mode',
        description: 'Multiple users have requested a dark mode option for the web application.',
        priority: 'P4' as const,
        status: 'Open' as const,
        reportedBy: 'carol.user@company.com',
        category: 'Enhancement',
        tags: ['feature-request', 'ui', 'dark-mode'],
      },
    ];

    demoTickets.forEach(ticketData => {
      this.createTicket(ticketData);
    });
  }
}

export const ticketService = new TicketService();