import React, { useState } from 'react';
import { 
  X, 
  AlertCircle, 
  Clock, 
  User, 
  Tag, 
  FileText,
  Send,
  Mail
} from 'lucide-react';
import { ticketService } from '../utils/ticketService';
import { emailService } from '../utils/emailService';
import { Ticket } from '../types/Ticket';

interface TicketFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticket: Ticket) => void;
  editTicket?: Ticket | null;
}

export const TicketForm: React.FC<TicketFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editTicket 
}) => {
  const [formData, setFormData] = useState({
    title: editTicket?.title || '',
    description: editTicket?.description || '',
    priority: editTicket?.priority || 'P3',
    status: editTicket?.status || 'Open',
    assignedTo: editTicket?.assignedTo || '',
    reportedBy: editTicket?.reportedBy || 'user@company.com',
    category: editTicket?.category || 'General',
    tags: editTicket?.tags?.join(', ') || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      let ticket: Ticket;

      if (editTicket) {
        // Update existing ticket
        const previousStatus = editTicket.status;
        const updatedTicket = ticketService.updateTicket(editTicket.id, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority as Ticket['priority'],
          status: formData.status as Ticket['status'],
          assignedTo: formData.assignedTo || undefined,
          reportedBy: formData.reportedBy,
          category: formData.category,
          tags: tagsArray
        });
        
        if (!updatedTicket) throw new Error('Failed to update ticket');
        ticket = updatedTicket;

        // Send notification if status changed
        if (previousStatus !== formData.status) {
          await emailService.sendTicketUpdatedNotification(ticket, previousStatus);
        }
      } else {
        // Create new ticket
        ticket = ticketService.createTicket({
          title: formData.title,
          description: formData.description,
          priority: formData.priority as Ticket['priority'],
          status: formData.status as Ticket['status'],
          assignedTo: formData.assignedTo || undefined,
          reportedBy: formData.reportedBy,
          category: formData.category,
          tags: tagsArray
        });

        // Send creation notification
        await emailService.sendTicketCreatedNotification(ticket);
      }

      onSubmit(ticket);
      onClose();
    } catch (error) {
      console.error('Error submitting ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'P1':
        return { label: 'Critical', color: 'text-red-600 bg-red-50 border-red-200', sla: '4 hours' };
      case 'P2':
        return { label: 'High', color: 'text-orange-600 bg-orange-50 border-orange-200', sla: '24 hours' };
      case 'P3':
        return { label: 'Medium', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', sla: '72 hours' };
      case 'P4':
        return { label: 'Low', color: 'text-green-600 bg-green-50 border-green-200', sla: '1 week' };
      default:
        return { label: 'Medium', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', sla: '72 hours' };
    }
  };

  const priorityInfo = getPriorityInfo(formData.priority);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editTicket ? 'Edit Ticket' : 'Create New Ticket'}
              </h2>
              <p className="text-sm text-gray-600">
                {editTicket ? `Ticket ID: ${editTicket.id}` : 'Fill in the details to create a new incident ticket'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="inline mr-1" />
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Brief description of the issue"
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <AlertCircle size={16} className="inline mr-1" />
              Priority *
            </label>
            <div className="grid grid-cols-4 gap-3">
              {['P1', 'P2', 'P3', 'P4'].map((priority) => {
                const info = getPriorityInfo(priority);
                const isSelected = formData.priority === priority;
                return (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => handleInputChange('priority', priority)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? `${info.color} border-current shadow-md`
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`font-semibold text-sm ${isSelected ? '' : 'text-gray-700'}`}>
                        {priority}
                      </div>
                      <div className={`text-xs mt-1 ${isSelected ? '' : 'text-gray-500'}`}>
                        {info.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <Clock size={12} className="mr-1" />
              SLA Target: {priorityInfo.sla}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Detailed description of the issue, steps to reproduce, expected behavior, etc."
              required
            />
          </div>

          {/* Row 1: Category and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="General">General</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Application">Application</option>
                <option value="Security">Security</option>
                <option value="Network">Network</option>
                <option value="Database">Database</option>
                <option value="Mobile">Mobile</option>
                <option value="Enhancement">Enhancement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Row 2: Reporter and Assignee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="inline mr-1" />
                Reported By *
              </label>
              <input
                type="email"
                value={formData.reportedBy}
                onChange={(e) => handleInputChange('reportedBy', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="reporter@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="inline mr-1" />
                Assigned To
              </label>
              <input
                type="email"
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="assignee@company.com (optional)"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag size={16} className="inline mr-1" />
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="bug, critical, database (comma separated)"
            />
            <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editTicket ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  {editTicket ? 'Update Ticket' : 'Create Ticket'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};