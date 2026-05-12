import { useState, useEffect } from 'react';
import { Shield, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export function AdminUsersManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (roleFilter) params.append('role', roleFilter);

      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load users';
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      addToast(`User role updated to ${newRole}`, 'success');
      fetchUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update role';
      addToast(errorMsg, 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      addToast('User deleted successfully', 'success');
      fetchUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete user';
      addToast(errorMsg, 'error');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
        <div className="flex gap-3">
          {['', 'user', 'vendor', 'admin'].map((role) => (
            <button
              key={role || 'all'}
              onClick={() => { setRoleFilter(role); setPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                roleFilter === role
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {users.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 items-center">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="user">User</option>
                          <option value="vendor">Vendor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <p className="text-gray-600">No users found</p>
        </div>
      )}
    </div>
  );
}
