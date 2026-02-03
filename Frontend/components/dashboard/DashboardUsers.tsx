import React, { useState } from 'react';
import { Pagination } from '../Pagination';
import { api } from '../../services/api';

/**
 * DashboardUsers Component
 *
 * Displays user management interface with table view and performance metrics.
 * Handles user CRUD operations and displays user statistics.
 */
interface DashboardUsersProps {
  users: any[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  articles: any[];
}

const DashboardUsers: React.FC<DashboardUsersProps> = ({
  users,
  setUsers,
  articles,
}) => {
  const [usersPage, setUsersPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState<any>({ name: '', email: '', role: 'Contributor', bio: '', image: '' });
  const [newUserFile, setNewUserFile] = useState<File | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const paginatedUsers = users.slice((usersPage - 1) * ITEMS_PER_PAGE, usersPage * ITEMS_PER_PAGE);

  const handleOpenInviteModal = (user?: any) => {
    if (user) {
      setNewUserData({ name: user.name, email: user.email, role: user.role, bio: user.bio || '', image: user.image || '' });
      setEditingUserId(user.id);
    } else {
      setNewUserData({ name: '', email: '', role: 'Contributor', bio: '', image: '' });
      setEditingUserId(null);
    }
    setIsInviteUserModalOpen(true);
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsUserProfileModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If a file is selected, upload it first.
      if (newUserFile) {
        if (editingUserId) {
          const uploaded = await api.users.uploadImage(editingUserId, newUserFile);
          if (uploaded && (uploaded as any).data) {
            newUserData.image = (uploaded as any).data.url || (uploaded as any).data.path;
          }
        } else {
          const uploaded = await api.users.uploadInviteImage(newUserFile);
          if (uploaded && (uploaded as any).data) {
            newUserData.image = (uploaded as any).data.url || (uploaded as any).data.path;
          }
        }
      }

      if (editingUserId) {
        const res = await api.users.update(editingUserId, newUserData);
        setUsers(users.map(u => u.id === editingUserId ? res.data : u));
      } else {
        const res = await api.users.create(newUserData);
        setUsers([res.data, ...users]);
      }
      setIsInviteUserModalOpen(false);
    } catch (error) {
      console.error('Failed to save user', error);
      alert('Failed to save user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        await api.users.delete(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        console.error('Failed to delete user', error);
        alert('Failed to delete user.');
      }
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#001733]">System Users</h3>
          <button
            onClick={() => handleOpenInviteModal()}
            className="bg-[#001733] text-white px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-black transition-colors"
          >
            Invite User
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-black uppercase tracking-widest text-gray-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Articles</th>
                <th className="px-6 py-4">Performance</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.map(user => {
                const userArticles = articles.filter(a => a.author === user.name);
                const articleCount = user.total_articles || 0;
                const publishedCount = user.articles_published || 0;
                const avgSeo = articleCount > 0
                  ? Math.round(userArticles.reduce((acc, curr) => acc + (curr.seo_score || curr.seoScore || 0), 0) / articleCount)
                  : 0;

                const lastActiveRaw = user.last_active || user.lastActive || user.created_at;
                const formatLastActive = (dateStr: string | null) => {
                  if (!dateStr) return 'Never';
                  const date = new Date(dateStr);
                  const now = new Date();
                  const diffMs = now.getTime() - date.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMs / 3600000);
                  const diffDays = Math.floor(diffMs / 86400000);

                  if (diffMins < 1) return 'Just now';
                  if (diffMins < 60) return `${diffMins}m ago`;
                  if (diffHours < 24) return `${diffHours}h ago`;
                  if (diffDays < 7) return `${diffDays}d ago`;
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                };

                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 overflow-hidden">
                          {user.image ? (
                            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[#001733]">{user.name}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-sm ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold ${user.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>
                        ● {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-[#001733]">{articleCount}</div>
                      <div className="text-[10px] text-gray-400">{publishedCount} published</div>
                    </td>
                    <td className="px-6 py-4">
                      {articleCount > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${avgSeo >= 80 ? 'bg-green-500' : avgSeo >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${avgSeo}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-gray-600">{avgSeo}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatLastActive(lastActiveRaw)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => handleViewUser(user)} className="text-gray-400 hover:text-[#001733] text-xs font-bold uppercase tracking-wider">View</button>
                        <button onClick={() => handleOpenInviteModal(user)} className="text-gray-400 hover:text-[#001733] text-xs font-bold uppercase tracking-wider">Edit</button>
                        <button onClick={() => handleDeleteUser(user.id)} className="text-gray-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider">Remove</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={usersPage} totalItems={users.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setUsersPage} />
      </div>

      {/* Invite/Edit User Modal */}
      {isInviteUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#001733]">{editingUserId ? 'Edit User' : 'Invite User'}</h3>
              <button onClick={() => setIsInviteUserModalOpen(false)} className="text-gray-400 hover:text-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                  <input type="text" required value={newUserData.name} onChange={e => setNewUserData({ ...newUserData, name: e.target.value })} className="w-full border border-gray-200 p-3 text-sm focus:border-[#001733] outline-none rounded-sm" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                  <input type="email" required value={newUserData.email} onChange={e => setNewUserData({ ...newUserData, email: e.target.value })} className="w-full border border-gray-200 p-3 text-sm focus:border-[#001733] outline-none rounded-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Role</label>
                <select value={newUserData.role} onChange={e => setNewUserData({ ...newUserData, role: e.target.value })} className="w-full border border-gray-200 p-3 text-sm focus:border-[#001733] outline-none rounded-sm bg-white">
                  <option value="Contributor">Contributor</option>
                  <option value="Editor">Editor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">LinkedIn (optional)</label>
                <input type="url" value={(newUserData as any).linkedin || ''} onChange={e => setNewUserData({ ...newUserData, linkedin: e.target.value })} placeholder="https://linkedin.com/in/username" className="w-full border border-gray-200 p-3 text-sm focus:border-[#001733] outline-none rounded-sm" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Bio</label>
                <textarea value={(newUserData as any).bio || ''} onChange={e => setNewUserData({ ...newUserData, bio: e.target.value })} rows={4} className="w-full border border-gray-200 p-3 text-sm focus:border-[#001733] outline-none rounded-sm" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Profile Image (optional)</label>
                <input type="file" accept="image/*" onChange={e => setNewUserFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsInviteUserModalOpen(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black">Cancel</button>
                <button type="submit" disabled={loading} className="bg-[#001733] text-white px-6 py-2 text-xs font-black uppercase tracking-widest hover:bg-[#e5002b] transition-colors disabled:opacity-50 rounded-sm">
                  {loading ? 'Saving...' : (editingUserId ? 'Save Changes' : 'Send Invite')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {isUserProfileModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-sm shadow-2xl text-center p-8 relative">
            <button onClick={() => setIsUserProfileModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
              {selectedUser.image ? <img src={selectedUser.image} alt={selectedUser.name} className="w-full h-full object-cover" /> : <span className="text-4xl font-bold text-gray-500 flex items-center justify-center h-full">{selectedUser.name.charAt(0)}</span>}
            </div>
            <h3 className="text-2xl font-bold text-[#001733]">{selectedUser.name}</h3>
            <p className="text-sm text-gray-400">{selectedUser.email}</p>
            <span className="inline-block my-4 text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-700">{selectedUser.role}</span>
            <p className="text-sm text-gray-600">{selectedUser.bio || 'No bio available.'}</p>
            {(selectedUser.linkedin || (selectedUser as any).linkedin_url) && (
              <p className="text-sm mt-2"><a href={selectedUser.linkedin || (selectedUser as any).linkedin_url} target="_blank" rel="noreferrer" className="text-[#001733] font-bold">LinkedIn profile</a></p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardUsers;
