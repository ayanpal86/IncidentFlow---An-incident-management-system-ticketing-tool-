import { EmailNotification, Ticket } from '../types/Ticket';

class EmailService {
  private storageKey = 'email_notifications';

  private generateId(): string {
    return `EMAIL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveNotifications(notifications: EmailNotification[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(notifications));
  }

  private getAllNotifications(): EmailNotification[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];
    
    return JSON.parse(stored).map((notification: any) => ({
      ...notification,
      sentAt: new Date(notification.sentAt),
    }));
  }

  async sendTicketCreatedNotification(ticket: Ticket): Promise<boolean> {
    const notification: EmailNotification = {
      id: this.generateId(),
      to: ticket.assignedTo || 'support@company.com',
      subject: `New ${ticket.priority} Incident: ${ticket.title}`,
      body: this.generateTicketCreatedEmail(ticket),
      sentAt: new Date(),
      acknowledged: false,
    };

    const notifications = this.getAllNotifications();
    notifications.push(notification);
    this.saveNotifications(notifications);

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('📧 Email sent:', notification);
    return true;
  }

  async sendTicketUpdatedNotification(ticket: Ticket, previousStatus: string): Promise<boolean> {
    const notification: EmailNotification = {
      id: this.generateId(),
      to: ticket.reportedBy,
      subject: `Ticket ${ticket.id} Status Updated: ${ticket.status}`,
      body: this.generateTicketUpdatedEmail(ticket, previousStatus),
      sentAt: new Date(),
      acknowledged: false,
    };

    const notifications = this.getAllNotifications();
    notifications.push(notification);
    this.saveNotifications(notifications);

    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('📧 Email sent:', notification);
    return true;
  }

  async sendEscalationNotification(ticket: Ticket): Promise<boolean> {
    const notification: EmailNotification = {
      id: this.generateId(),
      to: 'manager@company.com',
      subject: `🚨 SLA Breach - Ticket ${ticket.id} Escalated`,
      body: this.generateEscalationEmail(ticket),
      sentAt: new Date(),
      acknowledged: false,
    };

    const notifications = this.getAllNotifications();
    notifications.push(notification);
    this.saveNotifications(notifications);

    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('🚨 Escalation email sent:', notification);
    return true;
  }

  acknowledgeNotification(notificationId: string): boolean {
    const notifications = this.getAllNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    
    if (!notification) return false;
    
    notification.acknowledged = true;
    this.saveNotifications(notifications);
    return true;
  }

  getUnacknowledgedNotifications(): EmailNotification[] {
    return this.getAllNotifications().filter(n => !n.acknowledged);
  }

  getRecentNotifications(hours: number = 24): EmailNotification[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.getAllNotifications()
      .filter(n => n.sentAt > cutoff)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  private generateTicketCreatedEmail(ticket: Ticket): string {
    return `
Dear Support Team,

A new ${ticket.priority} incident has been created and requires your attention.

Ticket Details:
- ID: ${ticket.id}
- Title: ${ticket.title}
- Priority: ${ticket.priority}
- Reporter: ${ticket.reportedBy}
- SLA Deadline: ${ticket.slaDeadline.toLocaleString()}

Description:
${ticket.description}

Please review and take appropriate action.

Best regards,
Incident Management System
    `.trim();
  }

  private generateTicketUpdatedEmail(ticket: Ticket, previousStatus: string): string {
    return `
Dear ${ticket.reportedBy},

Your ticket has been updated with a new status.

Ticket Details:
- ID: ${ticket.id}
- Title: ${ticket.title}
- Previous Status: ${previousStatus}
- Current Status: ${ticket.status}
- Assigned To: ${ticket.assignedTo || 'Unassigned'}

${ticket.status === 'Resolved' ? 
  'Your issue has been resolved. If you continue to experience problems, please reopen this ticket.' :
  'We are continuing to work on your issue and will keep you updated.'}

You can view the full ticket details in the support portal.

Best regards,
Support Team
    `.trim();
  }

  private generateEscalationEmail(ticket: Ticket): string {
    return `
URGENT: SLA BREACH ALERT

Ticket ${ticket.id} has exceeded its SLA deadline and requires immediate attention.

Critical Details:
- Title: ${ticket.title}
- Priority: ${ticket.priority}
- Current Status: ${ticket.status}
- SLA Deadline: ${ticket.slaDeadline.toLocaleString()}
- Time Overdue: ${Math.round((Date.now() - ticket.slaDeadline.getTime()) / (1000 * 60 * 60))} hours

Immediate action is required to prevent further customer impact.

Please review and escalate as necessary.

Incident Management System
    `.trim();
  }
}

export const emailService = new EmailService();