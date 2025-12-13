import React, { useEffect, useState } from 'react';
import { 
  Search, Edit2, Trash2, ChevronLeft, ChevronRight, Gift, Mail, Phone, MapPin, Lock, MoreHorizontal
} from 'lucide-react';
import { userService } from '../../services/supabaseService';
import { User } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface UsersViewProps {
  onNotify: (type: 'success' | 'error', msg: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ onNotify }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Edit/Modal State
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormPoints, setEditFormPoints] = useState<number>(0);
  const [editFormPassword, setEditFormPassword] = useState<string>('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const filtered = users.filter(u => 
      (u.name || '').toLowerCase().includes(lower) || 
      (u.email || '').toLowerCase().includes(lower) ||
      (u.phone1 || '').includes(lower) ||
      (u.phone2 || '').includes(lower) ||
      (u.city || '').toLowerCase().includes(lower) ||
      (u.country || '').toLowerCase().includes(lower)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      onNotify('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setEditFormPoints(user.points || 0);
    setEditFormPassword('');
    setEditModalOpen(true);
  };

  const handleAddPoints = async (user: User) => {
    try {
      const newPoints = (user.points || 0) + 100;
      await userService.updateUser(user.id, { points: newPoints });
      onNotify('success', `Added 100 points to ${user.name}`);
      loadUsers();
    } catch (err) {
      onNotify('error', 'Failed to add points');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userService.deleteUser(id);
      onNotify('success', 'User deleted successfully');
      loadUsers();
    } catch (err) {
      onNotify('error', 'Failed to delete user');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const updates: Partial<User> & { password?: string } = {
        points: editFormPoints
    };
    
    if (editFormPassword.trim()) {
        updates.password = editFormPassword.trim();
    }

    try {
      await userService.updateUser(selectedUser.id, updates);
      setEditModalOpen(false);
      onNotify('success', 'User updated successfully');
      loadUsers();
    } catch (err) {
      onNotify('error', 'Update failed');
    }
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const displayedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
        <div>
           <h1 className="text-[34px] font-bold text-gray-900 dark:text-white tracking-tight">Users</h1>
        </div>
        
        <div className="relative group w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full sm:w-64 bg-gray-100 dark:bg-[#1C1C1E] border-none rounded-lg text-[15px] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:bg-white dark:focus:bg-[#2C2C2E] transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : displayedUsers.length === 0 ? (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-12 text-center border border-gray-100 dark:border-white/5">
            <p className="text-gray-500">No users found.</p>
        </div>
      ) : (
        <>
            {/* Desktop Table - Apple Style */}
            <div className="hidden lg:block bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-apple border border-gray-100 dark:border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="border-b border-gray-100 dark:border-white/5">
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stats</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right"></th>
                    </tr>
                    </thead>
                    <tbody>
                        {displayedUsers.map((user) => (
                        <tr key={user.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5 last:border-0">
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-200 flex items-center justify-center font-semibold text-sm mr-3 shadow-inner">
                                    {(user.name || '?').charAt(0)}
                                    </div>
                                    <div>
                                       <div className="font-medium text-gray-900 dark:text-white text-[15px]">{user.name || 'Unknown'}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-sm text-gray-900 dark:text-gray-200">{user.email || '-'}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col text-sm">
                                    <span className="text-gray-900 dark:text-gray-200 font-medium">{user.phone1 || '-'}</span>
                                    {user.phone2 && (
                                      <span className="text-xs text-gray-500">{user.phone2}</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col text-sm text-gray-500">
                                    <span className="text-gray-900 dark:text-gray-200">{user.city || '-'}</span>
                                    <span className="text-xs">{user.country}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                                    {user.points} pts
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end items-center gap-1">
                                    <ActionButtons user={user} onAddPoints={handleAddPoints} onEdit={() => handleOpenEdit(user)} onDelete={handleDelete} />
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
                {displayedUsers.map((user) => (
                    <div key={user.id} className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-white/5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-semibold text-gray-700 dark:text-white mr-3">
                                    {(user.name || '?').charAt(0)}
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</h3>
                                    <p className="text-sm text-primary-600 dark:text-primary-400 truncate flex items-center mt-0.5">
                                      <Mail size={12} className="mr-1" />
                                      {user.email}
                                    </p>
                                </div>
                            </div>
                            <span className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2">
                                {user.points} pts
                            </span>
                        </div>
                        
                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-white/5 p-3 rounded-xl">
                            <div className="flex items-center">
                                <Phone size={14} className="mr-2 text-gray-400"/> 
                                <span className="font-medium text-gray-900 dark:text-white">{user.phone1 || 'No phone'}</span>
                                {user.phone2 && <span className="text-gray-500 ml-1">/ {user.phone2}</span>}
                            </div>
                            <div className="flex items-center">
                                <MapPin size={14} className="mr-2 text-gray-400"/> 
                                <span>{[user.city, user.country].filter(Boolean).join(', ') || 'No address'}</span>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end space-x-2">
                             <ActionButtons user={user} onAddPoints={handleAddPoints} onEdit={() => handleOpenEdit(user)} onDelete={handleDelete} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination - iOS style dots or clean buttons */}
            <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-500">
                {currentPage} / {totalPages}
                </span>
                <div className="flex space-x-2">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white dark:bg-[#1C1C1E] shadow-sm border border-gray-200 dark:border-white/10 disabled:opacity-50 transition-all hover:bg-gray-50 dark:hover:bg-white/5"
                >
                    <ChevronLeft size={18} />
                </button>
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 rounded-lg bg-white dark:bg-[#1C1C1E] shadow-sm border border-gray-200 dark:border-white/10 disabled:opacity-50 transition-all hover:bg-gray-50 dark:hover:bg-white/5"
                >
                    <ChevronRight size={18} />
                </button>
                </div>
            </div>
        </>
      )}

      {/* Edit Modal - macOS Sheet Style */}
      <AnimatePresence>
        {isEditModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setEditModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col border border-gray-200 dark:border-white/10"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-white/50 dark:bg-white/5 backdrop-blur-xl z-10">
                <h3 className="text-[17px] font-semibold text-gray-900 dark:text-white">Edit User</h3>
                <button onClick={() => setEditModalOpen(false)} className="text-gray-500 hover:bg-gray-200/50 p-1 rounded-full transition-colors">
                    <XIcon />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 custom-scroll">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Read-Only Section */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Information</h4>
                        
                        <div className="bg-white dark:bg-[#2C2C2E] rounded-xl p-1 border border-gray-200/50 dark:border-white/5 shadow-sm">
                            <div className="px-3 py-2 border-b border-gray-100 dark:border-white/5">
                                <label className="block text-[11px] font-medium text-gray-500 uppercase">Name</label>
                                <div className="text-[15px] text-gray-900 dark:text-white py-0.5">{selectedUser.name || 'Unknown'}</div>
                            </div>
                            <div className="px-3 py-2 border-b border-gray-100 dark:border-white/5">
                                <label className="block text-[11px] font-medium text-gray-500 uppercase">Email</label>
                                <div className="text-[15px] text-gray-900 dark:text-white py-0.5 truncate">{selectedUser.email}</div>
                            </div>
                            <div className="px-3 py-2 border-b border-gray-100 dark:border-white/5">
                                <label className="block text-[11px] font-medium text-gray-500 uppercase">Phone</label>
                                <div className="text-[15px] text-gray-900 dark:text-white py-0.5">
                                  {selectedUser.phone1}
                                  {selectedUser.phone2 && <span className="text-gray-500 ml-2">({selectedUser.phone2})</span>}
                                </div>
                            </div>
                             <div className="px-3 py-2">
                                <label className="block text-[11px] font-medium text-gray-500 uppercase">Location</label>
                                <div className="text-[15px] text-gray-900 dark:text-white py-0.5">{selectedUser.city}, {selectedUser.country}</div>
                            </div>
                        </div>
                    </div>

                    {/* Editable Section */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-3">Actions</h4>
                        
                        <div className="bg-white dark:bg-[#2C2C2E] rounded-xl p-4 border border-gray-200/50 dark:border-white/5 shadow-sm space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Points</label>
                                <div className="flex items-center bg-gray-100 dark:bg-black/20 rounded-lg px-3 py-2 border border-transparent focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                                    <Gift className="text-gray-400 mr-3" size={18} />
                                    <input
                                        type="number"
                                        value={editFormPoints}
                                        onChange={(e) => setEditFormPoints(parseInt(e.target.value) || 0)}
                                        className="bg-transparent w-full outline-none text-gray-900 dark:text-white font-semibold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                <div className="flex items-center bg-gray-100 dark:bg-black/20 rounded-lg px-3 py-2 border border-transparent focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                                    <Lock className="text-gray-400 mr-3" size={18} />
                                    <input
                                        type="password"
                                        placeholder="Min 8 characters"
                                        value={editFormPassword}
                                        onChange={(e) => setEditFormPassword(e.target.value)}
                                        className="bg-transparent w-full outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-5 py-2.5 text-[15px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-white/10 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-[15px] font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-full shadow-lg shadow-primary-500/30 transition-all active:scale-95"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActionButtons = ({ user, onAddPoints, onEdit, onDelete }: any) => (
    <>
        <button 
        onClick={() => onAddPoints(user)}
        className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
        title="Add Points"
        >
        <Gift size={18} />
        </button>
        <button 
        onClick={onEdit}
        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        title="Edit"
        >
        <Edit2 size={18} />
        </button>
        <button 
        onClick={() => onDelete(user.id)}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        title="Delete"
        >
        <Trash2 size={18} />
        </button>
    </>
);

const XIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);