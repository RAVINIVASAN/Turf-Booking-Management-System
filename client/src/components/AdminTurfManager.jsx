import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, SearchX } from 'lucide-react';
import { Button } from './Button';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export function AdminTurfManager() {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const { addToast } = useToast();

  useEffect(() => {
    fetchTurfs();
  }, [page, filter]);

  const fetchTurfs = async () => {
    try {
      setLoading(true);
      const isActive = filter === 'active' ? 'true' : filter === 'inactive' ? 'false' : undefined;
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (isActive !== undefined) params.append('isActive', isActive);

      const response = await api.get(`/admin/turfs?${params.toString()}`);
      setTurfs(response.data.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load turfs';
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTurf = async (id) => {
    if (!window.confirm('Are you sure you want to delete this turf?')) return;

    try {
      await api.delete(`/turfs/${id}`);
      addToast('Turf deleted successfully', 'success');
      fetchTurfs();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete turf';
      addToast(errorMsg, 'error');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading turfs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">All Turfs</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
          className="gap-2"
        >
          <Plus size={18} />
          Add Turf (Coming Soon)
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6">
        {['all', 'active', 'inactive'].map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
              filter === f
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Turfs Table */}
      {turfs.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Pricing</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {turfs.map((turf) => (
                  <tr key={turf._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{turf.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{turf.location}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="text-teal-600">
                        ₹{turf.priceSlots.morning} · ₹{turf.priceSlots.afternoon} · ₹
                        {turf.priceSlots.evening}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          turf.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {turf.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                          <Edit2 size={18} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteTurf(turf._id)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <SearchX size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">No turfs found</p>
        </div>
      )}
    </div>
  );
}
