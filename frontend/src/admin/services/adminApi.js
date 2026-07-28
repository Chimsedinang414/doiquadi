import { client } from '../../services/api';

export const adminApi = {
  getDashboard: () => client.get('/admin/dashboard').then(response => response.data),
  getUsers: params => client.get('/admin/users', { params }).then(response => response.data),
  updateUserStatus: (id, enabled) => client.patch(`/admin/users/${encodeURIComponent(id)}/status`, { enabled })
    .then(response => response.data),
  updateAdminRole: (id, admin) => client.put(`/admin/users/${encodeURIComponent(id)}/roles`, { admin })
    .then(response => response.data),
  getPosts: params => client.get('/admin/posts', { params }).then(response => response.data),
  deletePost: id => client.delete(`/admin/posts/${encodeURIComponent(id)}`),
  getLocations: params => client.get('/admin/locations', { params }).then(response => response.data),
  deleteLocation: id => client.delete(`/admin/locations/${encodeURIComponent(id)}`),
  getAuditLogs: params => client.get('/admin/audit-logs', { params }).then(response => response.data),
};
