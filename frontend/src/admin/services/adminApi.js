import { client } from '../../services/api';

export const adminApi = {
  getDashboard: () => client.get('/admin/dashboard/summary').then(response => response.data),
  getGrowth: () => client.get('/admin/dashboard/content-growth').then(response => response.data),
  getReportStatistics: () => client.get('/admin/dashboard/report-statistics').then(response => response.data),
  getTopLocations: () => client.get('/admin/dashboard/top-locations').then(response => response.data),

  getUsers: params => client.get('/admin/users', { params }).then(response => response.data),
  getUser: id => client.get(`/admin/users/${encodeURIComponent(id)}`).then(response => response.data),
  getUserViolations: id => client.get(`/admin/users/${encodeURIComponent(id)}/violations`).then(response => response.data),
  warnUser: (id, reason) => client.patch(`/admin/users/${encodeURIComponent(id)}/warn`, { reason }).then(r => r.data),
  suspendUser: (id, reason, suspendedUntil) => client.patch(`/admin/users/${encodeURIComponent(id)}/suspend`, { reason, suspendedUntil }).then(r => r.data),
  banUser: (id, reason) => client.patch(`/admin/users/${encodeURIComponent(id)}/ban`, { reason }).then(r => r.data),
  unbanUser: (id, reason) => client.patch(`/admin/users/${encodeURIComponent(id)}/unban`, { reason }).then(r => r.data),
  updateUserRoles: (id, roles) => client.put(`/admin/users/${encodeURIComponent(id)}/roles`, { roles }).then(r => r.data),

  getPosts: params => client.get('/admin/posts', { params }).then(response => response.data),
  getPost: id => client.get(`/admin/posts/${encodeURIComponent(id)}`).then(response => response.data),
  hidePost: (id, reason) => client.patch(`/admin/posts/${encodeURIComponent(id)}/hide`, { reason }).then(r => r.data),
  restorePost: (id, reason) => client.patch(`/admin/posts/${encodeURIComponent(id)}/restore`, { reason }).then(r => r.data),
  deletePost: (id, reason) => client.delete(`/admin/posts/${encodeURIComponent(id)}`, { data: { reason } }).then(r => r.data),

  getComments: params => client.get('/admin/comments', { params }).then(response => response.data),
  getComment: id => client.get(`/admin/comments/${encodeURIComponent(id)}`).then(response => response.data),
  hideComment: (id, reason) => client.patch(`/admin/comments/${encodeURIComponent(id)}/hide`, { reason }).then(r => r.data),
  restoreComment: (id, reason) => client.patch(`/admin/comments/${encodeURIComponent(id)}/restore`, { reason }).then(r => r.data),
  deleteComment: (id, reason) => client.delete(`/admin/comments/${encodeURIComponent(id)}`, { data: { reason } }).then(r => r.data),

  getReports: params => client.get('/admin/reports', { params }).then(response => response.data),
  assignReport: id => client.patch(`/admin/reports/${encodeURIComponent(id)}/assign`).then(r => r.data),
  resolveReport: (id, note, action) => client.patch(`/admin/reports/${encodeURIComponent(id)}/resolve`, { note, action }).then(r => r.data),
  rejectReport: (id, note) => client.patch(`/admin/reports/${encodeURIComponent(id)}/reject`, { note, action: 'NONE' }).then(r => r.data),

  getLocations: params => client.get('/admin/locations', { params }).then(response => response.data),
  getLocation: id => client.get(`/admin/locations/${encodeURIComponent(id)}`).then(response => response.data),
  approveLocation: (id, reason) => client.patch(`/admin/locations/${encodeURIComponent(id)}/approve`, { reason }).then(r => r.data),
  rejectLocation: (id, reason) => client.patch(`/admin/locations/${encodeURIComponent(id)}/reject`, { reason }).then(r => r.data),
  updateLocationStatus: (id, status, reason) => client.patch(`/admin/locations/${encodeURIComponent(id)}/status`, { status, reason }).then(r => r.data),

  getDishes: params => client.get('/admin/dishes', { params }).then(response => response.data),
  updateDish: (id, data) => client.patch(`/admin/dishes/${encodeURIComponent(id)}`, data).then(r => r.data),

  getAuditLogs: params => client.get('/admin/audit-logs', { params }).then(response => response.data),
  getAuditLog: id => client.get(`/admin/audit-logs/${encodeURIComponent(id)}`).then(response => response.data),
};
