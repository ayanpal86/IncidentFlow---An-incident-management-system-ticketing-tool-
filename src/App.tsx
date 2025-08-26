import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  List, 
  Plus, 
  Bell, 
  Settings,
  Search,
  Menu,
  X
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { TicketList } from './components/TicketList';
import { TicketForm } from './components/TicketForm';
import { TicketDetail } from './components/TicketDetail';
import { ticketService } from './utils/ticketService';
import { emailService } from './utils/emailService';
import { Ticket } from './types/Ticket';

type View = 'dashboard' | 'tickets' | 'ticketDetail';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Initialize demo data and load tickets
    ticketService.initializeDemoData();
    loadTickets();
    loadNotifications();

    // Check for escalations every minute
    const escalationInterval = setInterval(() => {
      const escalatedTickets = ticketService.checkForEscalations();
      if (escalatedTickets.length > 0) {
        escalatedTickets.forEach(ticket => {
          emailService.sendEscalationNotification(ticket);
        });
        loadTickets();
        loadNotifications();
      }
    }, 60000);

    return () => clearInterval(escalationInterval);
  }, []);

  const loadTickets = () => {
    const allTickets = ticketService.getAllTickets();
    setTickets(allTickets);
    
    // Update selected ticket if it's being viewed
    if (selectedTicket) {
      const updated = allTickets.find(t => t.id === selectedTicket.id);
      if (updated) {
        setSelectedTicket(updated);
      }
    }
  };

  const loadNotifications = () => {
    const recentNotifications = emailService.getRecentNotifications(24);
    setNotifications(recentNotifications);
  };

  const handleTicketSubmit = (ticket: Ticket) => {
    loadTickets();
    loadNotifications();
  };

  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setCurrentView('ticketDetail');
  };

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsFormOpen(true);
  };

  const handleDeleteTicket = (ticketId: string) => {
    ticketService.deleteTicket(ticketId);
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null);
      setCurrentView('tickets');
    }
    loadTickets();
  };

  const handleCreateNew = () => {
    setEditingTicket(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTicket(null);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedTicket(null);
  };

  const handleBackToList = () => {
    setCurrentView('tickets');
    setSelectedTicket(null);
  };

  const getStats = () => {
    return ticketService.getTicketStats();
  };

  const stats = getStats();
  const unacknowledgedCount = notifications.filter(n => !n.acknowledged).length;

  const NavigationButton: React.FC<{
    view: View;
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }> = ({ view, icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">IncidentFlow</h1>
                  <p className="text-xs text-gray-500">Incident Management System</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Quick Search */}
              <div className="hidden sm:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Quick search..."
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell size={20} />
                {unacknowledgedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unacknowledgedCount > 9 ? '9+' : unacknowledgedCount}
                  </span>
                )}
              </button>

              {/* Create Ticket */}
              <button
                onClick={handleCreateNew}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 font-medium"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">New Ticket</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-2">
              <NavigationButton
                view="dashboard"
                icon={<BarChart3 size={20} />}
                label="Dashboard"
                isActive={currentView === 'dashboard'}
                onClick={() => {
                  setCurrentView('dashboard');
                  setIsMobileMenuOpen(false);
                }}
              />
              <NavigationButton
                view="tickets"
                icon={<List size={20} />}
                label="All Tickets"
                isActive={currentView === 'tickets'}
                onClick={() => {
                  setCurrentView('tickets');
                  setIsMobileMenuOpen(false);
                }}
              />
            </div>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
              <nav className="space-y-2">
                <NavigationButton
                  view="dashboard"
                  icon={<BarChart3 size={20} />}
                  label="Dashboard"
                  isActive={currentView === 'dashboard'}
                  onClick={() => setCurrentView('dashboard')}
                />
                <NavigationButton
                  view="tickets"
                  icon={<List size={20} />}
                  label="All Tickets"
                  isActive={currentView === 'tickets'}
                  onClick={() => setCurrentView('tickets')}
                />
              </nav>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Open</span>
                    <span className="font-medium text-orange-600">{stats.open}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">In Progress</span>
                    <span className="font-medium text-blue-600">{stats.inProgress}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Overdue</span>
                    <span className="font-medium text-red-600">{stats.overdue}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {currentView === 'dashboard' && (
              <Dashboard onRefresh={loadTickets} />
            )}

            {currentView === 'tickets' && (
              <TicketList
                tickets={tickets}
                onTicketSelect={handleTicketSelect}
                onEditTicket={handleEditTicket}
                onDeleteTicket={handleDeleteTicket}
                onRefresh={loadTickets}
              />
            )}

            {currentView === 'ticketDetail' && selectedTicket && (
              <TicketDetail
                ticket={selectedTicket}
                onBack={handleBackToList}
                onEdit={handleEditTicket}
                onDelete={handleDeleteTicket}
                onRefresh={loadTickets}
              />
            )}
          </main>
        </div>
      </div>

      {/* Ticket Form Modal */}
      <TicketForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleTicketSubmit}
        editTicket={editingTicket}
      />
    </div>
  );
}

export default App;