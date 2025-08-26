import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Users,
  Mail
} from 'lucide-react';
import { ticketService } from '../utils/ticketService';
import { emailService } from '../utils/emailService';

interface DashboardProps {
  onRefresh: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onRefresh }) => {
  const [stats, setStats] = useState<any>(null);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = () => {
      const ticketStats = ticketService.getTicketStats();
      const notifications = emailService.getRecentNotifications(24);
      
      setStats(ticketStats);
      setRecentNotifications(notifications);
    };

    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData();
      onRefresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [onRefresh]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'text-red-600 bg-red-50 border-red-200';
      case 'P2': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'P3': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'P4': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your incident management system</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock size={16} />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4 flex items-center">
            <TrendingUp size={14} className="mr-1" />
            All time statistics
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Tickets</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.open}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            {stats.inProgress} in progress
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            {stats.closed} closed tickets
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdue}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-full">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            {stats.escalated} escalated
          </p>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 size={20} className="mr-2" />
            Priority Distribution
          </h2>
          <div className="space-y-4">
            {Object.entries(stats.byPriority).map(([priority, count]) => {
              const total = Object.values(stats.byPriority).reduce((a: any, b: any) => a + b, 0);
              const percentage = total > 0 ? ((count as number) / total * 100).toFixed(1) : '0';
              
              return (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(priority)}`}>
                      {priority}
                    </span>
                    <span className="text-sm text-gray-600">
                      {priority === 'P1' ? 'Critical' :
                       priority === 'P2' ? 'High' :
                       priority === 'P3' ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          priority === 'P1' ? 'bg-red-500' :
                          priority === 'P2' ? 'bg-orange-500' :
                          priority === 'P3' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Mail size={20} className="mr-2" />
            Recent Notifications
            {recentNotifications.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {recentNotifications.length}
              </span>
            )}
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentNotifications.length > 0 ? (
              recentNotifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-1 rounded-full ${
                    notification.subject.includes('Escalated') ? 'bg-red-100' :
                    notification.subject.includes('Created') ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    <Mail size={14} className={
                      notification.subject.includes('Escalated') ? 'text-red-600' :
                      notification.subject.includes('Created') ? 'text-blue-600' : 'text-green-600'
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.subject}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      To: {notification.to} • {notification.sentAt.toLocaleTimeString()}
                    </p>
                  </div>
                  {!notification.acknowledged && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Mail size={32} className="mx-auto mb-3 opacity-50" />
                <p>No recent notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};