import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const OAUTH_BASE_URL = import.meta.env.VITE_OAUTH_BASE_URL
  || (import.meta.env.DEV ? 'http://localhost:8080/api' : API_BASE_URL);
const USER_KEY = 'localfoodUser';
const REFRESH_TOKEN_KEY = 'localfoodRefreshToken';

let accessToken = null;
let refreshPromise = null;

export const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  // Required when the frontend and API use different origins: the short-lived
  // HttpOnly OAuth linking cookie must reach the provider callback.
  withCredentials: true,
});

function readSessionValue(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setAuthSession(auth) {
  if (!auth?.accessToken || !auth?.refreshToken || !auth?.user) {
    throw new Error('Phản hồi đăng nhập không hợp lệ');
  }
  accessToken = auth.accessToken;
  sessionStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
  sessionStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event('auth-changed'));
  return auth.user;
}

export function clearAuthSession() {
  accessToken = null;
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event('auth-changed'));
}

async function refreshAccessToken() {
  const refreshToken = readSessionValue(REFRESH_TOKEN_KEY);
  if (!refreshToken) throw new Error('Phiên đăng nhập đã hết hạn');
  if (!refreshPromise) {
    refreshPromise = axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken }, { timeout: 10000 })
      .then(response => {
        setAuthSession(response.data);
        return response.data.accessToken;
      })
      .catch(error => {
        clearAuthSession();
        throw error;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

client.interceptors.request.use(async config => {
  const isAuthEndpoint = String(config.url || '').startsWith('/auth/');
  if (!isAuthEndpoint && !accessToken && readSessionValue(REFRESH_TOKEN_KEY)) {
    try {
      await refreshAccessToken();
    } catch {
      // Continue anonymously; protected endpoints will return a normalized 401.
    }
  }
  if (!isAuthEndpoint && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

client.interceptors.response.use(response => response, async error => {
  const original = error.config;
  const canRetry = error.response?.status === 401
    && original
    && !original.__authRetry
    && !String(original.url || '').startsWith('/auth/')
    && readSessionValue(REFRESH_TOKEN_KEY);
  if (canRetry) {
    original.__authRetry = true;
    try {
      const token = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${token}`;
      return client(original);
    } catch {
      // Return the normalized error after clearing the invalid session.
    }
  }
  const message = error.response?.data?.message
    || error.response?.data?.error
    || Object.values(error.response?.data || {})[0]
    || error.message
    || 'Không thể kết nối máy chủ';
  return Promise.reject(new Error(message));
});

export const api = {
  getPosts: () => client.get('/posts').then(response => response.data),
  getProfile: (userId, viewerId) => client.get('/users/' + userId + '/profile', { params: viewerId ? { viewerId } : {} }).then(response => response.data),
  searchUsers: query => client.get('/users/search', { params: { query } }).then(response => response.data),
  getFollowers: userId => client.get('/users/' + userId + '/followers').then(response => response.data),
  getFollowing: userId => client.get('/users/' + userId + '/following').then(response => response.data),
  toggleFollow: followingId => client.put('/follows', { followingId }).then(response => response.data),
  getPost: id => client.get('/posts/' + id).then(response => response.data),
  getComments: postId => client.get('/posts/' + postId + '/comments').then(response => response.data),
  createPost: data => client.post('/posts', data).then(response => response.data),
  updatePost: (postId, data) => client.put('/posts/' + postId, data).then(response => response.data),
  addComment: (postId, data) => client.post('/posts/' + postId + '/comments', data).then(response => response.data),
  toggleLike: (postId, userId) => client.put('/posts/' + postId + '/like', { userId }).then(response => response.data),
  getLocations: () => client.get('/locations').then(response => response.data),
  getMyLocations: userId => client.get('/locations/my', { params: { userId } }).then(response => response.data),
  getLocation: id => client.get('/locations/' + id).then(response => response.data),
  createLocation: data => client.post('/locations', data).then(response => response.data),
  updateLocation: (id, userId, data) => client.put('/locations/' + id, data, { params: { userId } }).then(response => response.data),
  deleteLocation: (id, userId) => client.delete('/locations/' + id, { params: { userId } }).then(response => response.data),
  deletePost: (postId, userId) => client.delete('/posts/' + postId, { params: { userId } }).then(response => response.data),
  presignUpload: data => client.post('/uploads/presign', data).then(response => response.data),
  completeUpload: data => client.post('/uploads/complete', data).then(response => response.data),
  toggleFavorite: data => client.put('/favorites', data).then(response => response.data),
  getFavorites: userId => client.get('/users/' + userId + '/favorites').then(response => response.data),
  getNotifications: userId => client.get('/users/' + userId + '/notifications').then(response => response.data),
  markNotificationRead: (id, userId) => client.patch('/notifications/' + id + '/read?userId=' + encodeURIComponent(userId)).then(response => response.data),
  login: data => client.post('/auth/login', data).then(response => response.data),
  register: data => client.post('/auth/register', data).then(response => response.data),
  forgotPassword: data => client.post('/auth/password/forgot', data).then(response => response.data),
  resetPassword: data => client.post('/auth/password/reset', data).then(response => response.data),
  exchangeOAuthCode: code => client.post('/auth/oauth2/exchange', { code }).then(response => response.data),
  getOAuthLinks: () => client.get('/oauth2/links').then(response => response.data),
  startOAuthLink: provider => client.post(`/oauth2/links/${encodeURIComponent(provider)}/start`)
    .then(response => response.data),
  updateProfile: (userId, data) => client.put('/users/' + userId, data).then(response => response.data),

  // ── Checkins & Collections ──────────────────────────────────
  checkin: data => client.post('/checkins', data).then(response => response.data),
  getCheckins: userId => client.get('/users/' + userId + '/checkins').then(response => response.data),
  createCollection: data => client.post('/collections', data).then(response => response.data),
  getCollections: userId => client.get('/users/' + userId + '/collections').then(response => response.data),
  addCollectionItem: (collectionId, data) => client.post('/collections/' + collectionId + '/items', data).then(response => response.data),

  // ── Reports ──────────────────────────────────────────────────
  createReport: data => client.post('/reports', data).then(response => response.data),

  // ── Messaging ───────────────────────────────────────────────
  getMutualFollows: userId => client.get('/messaging/mutual-follows', { params: { userId } }).then(r => r.data),
  getConversations: userId => client.get('/messaging/conversations', { params: { userId } }).then(r => r.data),
  createDirectConversation: data => client.post('/messaging/conversations/direct', data).then(r => r.data),
  createGroup: data => client.post('/messaging/conversations/group', data).then(r => r.data),
  getMessages: (conversationId, userId, page = 0) => client.get(`/messaging/conversations/${conversationId}/messages`, { params: { userId, page } }).then(r => r.data),
  sendMessage: (conversationId, data) => client.post(`/messaging/conversations/${conversationId}/messages`, data).then(r => r.data),
  addMembers: (conversationId, data) => client.post(`/messaging/conversations/${conversationId}/members`, data).then(r => r.data),
  removeMember: (conversationId, userId, targetUserId) => client.delete(`/messaging/conversations/${conversationId}/members/${targetUserId}`, { params: { userId } }).then(r => r.data),
  updateGroup: (conversationId, userId, data) => client.put(`/messaging/conversations/${conversationId}`, data, { params: { userId } }).then(r => r.data),
  markAsRead: (conversationId, userId) => client.put(`/messaging/conversations/${conversationId}/read`, null, { params: { userId } }).then(r => r.data),
};

export function getOAuthAuthorizationUrl(provider) {
  return `${OAUTH_BASE_URL.replace(/\/$/, '')}/oauth2/authorization/${encodeURIComponent(provider)}`;
}

export async function uploadImage(file, userId, onProgress) {
  const presigned = await api.presignUpload({
    userId,
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
  });

  await axios.put(presigned.uploadUrl, file, {
    headers: presigned.requiredHeaders,
    timeout: 120000,
    onUploadProgress: event => {
      if (event.total && onProgress) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });

  return api.completeUpload({ userId, objectKey: presigned.objectKey });
}

export function getCurrentUser() {
  try {
    return JSON.parse(readSessionValue(USER_KEY)) || null;
  } catch {
    return null;
  }
}

export function updateCurrentUser(user) {
  const currentUser = getCurrentUser();
  if (!currentUser || !user || currentUser.id !== user.id) return;
  sessionStorage.setItem(USER_KEY, JSON.stringify({ ...currentUser, ...user }));
  window.dispatchEvent(new Event('auth-changed'));
}

export function toPostView(post, savedLocationIds) {
  const locationId = post.location?.id;
  return {
    id: post.id,
    restaurantName: post.location?.name || post.title,
    address: post.location?.address || '',
    category: post.tags?.[0] || 'Ẩm thực',
    rating: post.rating || 0,
    reviews: post.comments || 0,
    likes: post.likes || 0,
    commentsCount: post.comments || 0,
    liked: false,
    saved: !!(locationId && savedLocationIds && savedLocationIds.has(locationId)),
    tags: (post.tags || []).map(tag => tag.startsWith('#') ? tag : '#' + tag),
    description: post.content || post.title,
    time: post.createdAt ? new Date(post.createdAt).toLocaleString('vi-VN') : '',
    open: true,
    locationId,
    author: post.author,
    imageUrl: post.imageUrls?.[0],
    imageUrls: post.imageUrls || [],
    colors: ['#f58529', '#dd2a7b'],
  };
}
