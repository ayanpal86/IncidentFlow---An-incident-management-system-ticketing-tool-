import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  AlertCircle, 
  Clock, 
  Tag, 
  MessageSquare,
  Send,
  Edit3,
  Trash2,
  Mail,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Ticket, Comment } from '../types/Ticket';
import { ticketService } from '../utils/ticketService';

interface TicketDetailProps {
  ticket: Ticket;
  onBack: () => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticketId: string) => void;
  onRefresh: () => void;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({
  ticket,
  onBack,
  onEdit,
  onDelete,
  onRefresh
}) => {
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await ticketService.addComment(ticket.id, {
        author: 'current.user@company.com',
        content: newComment.trim(),
        internal: isInternal
      });
      setNewComment('');
      setIsInternal(false);
      onRefresh();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'text-red-600 bg-red-50 border-red-200';
      case 'P2': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'P3': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'P4': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'In Progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Resolved': return 'text-green-600 bg-green-50 border-green-200';
      case 'Closed': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const isOverdue = () => {
    return ticket.status !== 'Resolved' && ticket.status !== 'Closed' && 
           new Date() > ticket.slaDeadline;
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const deadline = ticket.slaDeadline;
    const diffMs = deadline.getTime() - now.getTime();
    const diffHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMs < 0) {
      return `${diffDays > 0 ? `${diffDays}d ` : ''}${diffHours % 24}h overdue`;
    } else {
      return `${diffDays > 0 ? `${diffDays}d ` : ''}${diffHours % 24}h remaining`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{ticket.title}</h1>
            <p className="text-gray-600 mt-1 font-mono text-sm">{ticket.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(ticket)}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
          >
            <Edit3 size={16} className="mr-2" />
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this ticket?')) {
                onDelete(ticket.id);
                onBack();
              }
            }}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center"
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare size={20} className="mr-2" />
              Comments ({ticket.comments?.length || 0})
            </h2>

            {/* Comment List */}
            <div className="space-y-4 mb-6">
              {ticket.comments?.map((comment) => (
                <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {comment.author.split('@')[0]}
                      </span>
                      {comment.internal && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Internal
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {comment.createdAt.toLocaleDateString()} {comment.createdAt.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
              
              {(!ticket.comments || ticket.comments.length === 0) && (
                <p className="text-gray-500 italic text-center py-4">No comments yet</p>
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="border-t pt-4">
              <div className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Add a comment..."
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Internal comment</span>
                  </label>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send size={16} className="mr-2" />
                        Add Comment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Priority</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Priority</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>
              {ticket.escalated && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Escalated</span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                    Yes
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* People */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">People</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 flex items-center mb-1">
                  <Mail size={14} className="mr-1" />
                  Reporter
                </label>
                <p className="text-sm text-gray-900">{ticket.reportedBy}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 flex items-center mb-1">
                  <User size={14} className="mr-1" />
                  Assignee
                </label>
                <p className="text-sm text-gray-900">
                  {ticket.assignedTo || <span className="italic text-gray-500">Unassigned</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 flex items-center mb-1">
                  <Calendar size={14} className="mr-1" />
                  Created
                </label>
                <p className="text-sm text-gray-900">
                  {ticket.createdAt.toLocaleDateString()} at {ticket.createdAt.toLocaleTimeString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 flex items-center mb-1">
                  <Clock size={14} className="mr-1" />
                  Last Updated
                </label>
                <p className="text-sm text-gray-900">
                  {ticket.updatedAt.toLocaleDateString()} at {ticket.updatedAt.toLocaleTimeString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 flex items-center mb-1">
                  <AlertCircle size={14} className="mr-1" />
                  SLA Deadline
                </label>
                <div className="flex items-center space-x-2">
                  <p className={`text-sm ${isOverdue() ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                    {ticket.slaDeadline.toLocaleDateString()} at {ticket.slaDeadline.toLocaleTimeString()}
                  </p>
                  {isOverdue() && <AlertCircle size={14} className="text-red-500" />}
                </div>
                <p className={`text-xs mt-1 ${isOverdue() ? 'text-red-600' : 'text-gray-500'}`}>
                  {getTimeRemaining()}
                </p>
              </div>
              {ticket.resolvedAt && (
                <div>
                  <label className="text-sm text-gray-600 flex items-center mb-1">
                    <CheckCircle size={14} className="mr-1" />
                    Resolved
                  </label>
                  <p className="text-sm text-gray-900">
                    {ticket.resolvedAt.toLocaleDateString()} at {ticket.resolvedAt.toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tags & Category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Category</label>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  {ticket.category}
                </span>
              </div>
              {ticket.tags && ticket.tags.length > 0 && (
                <div>
                  <label className="text-sm text-gray-600 flex items-center mb-2">
                    <Tag size={14} className="mr-1" />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ticket.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};