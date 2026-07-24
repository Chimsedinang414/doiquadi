import axios from 'axios';

const client = axios.create({ baseURL: '/api', timeout: 10000 });

client.interceptors.response.use(response => response, error => {
  const message = error.response?.data?.error
    || Object.values(error.response?.data || {})[0]
    || error.message
    || 'Không thể kết nối máy chủ';
  return Promise.reject(new Error(message));
});

export const api = {
  getPosts: () => client.get('/posts').then(response => response.data),
  getProfile: (userId, viewerId) => client.get('/users/' + userId + '/profile', { params: viewerId ? { viewerId } : {} }).then(response => response.data),
  toggleFollow: data => client.put('/follows', data).then(response => response.data),
  getPost: id => client.get('/posts/' + id).then(response => response.data),
  createPost: data => client.post('/posts', data).then(response => response.data),
  addComment: (postId, data) => client.post('/posts/' + postId + '/comments', data).then(response => response.data),
  toggleLike: (postId, userId) => client.put('/posts/' + postId + '/like', { userId }).then(response => response.data),
  getLocations: () => client.get('/locations').then(response => response.data),
  getLocation: id => client.get('/locations/' + id).then(response => response.data),
  createLocation: data => client.post('/locations', data).then(response => response.data),
  toggleFavorite: data => client.put('/favorites', data).then(response => response.data),
  getFavorites: userId => client.get('/users/' + userId + '/favorites').then(response => response.data),
  getNotifications: userId => client.get('/users/' + userId + '/notifications').then(response => response.data),
  markNotificationRead: (id, userId) => client.patch('/notifications/' + id + '/read?userId=' + encodeURIComponent(userId)).then(response => response.data),
  login: data => client.post('/auth/login', data).then(response => response.data),
  register: data => client.post('/auth/register', data).then(response => response.data),
};

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('localfoodUser')) || null;
  } catch {
    return null;
  }
}

export function toPostView(post) {
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
    saved: false,
    tags: (post.tags || []).map(tag => tag.startsWith('#') ? tag : '#' + tag),
    description: post.content || post.title,
    time: post.createdAt ? new Date(post.createdAt).toLocaleString('vi-VN') : '',
    open: true,
    locationId: post.location?.id,
    author: post.author,
    imageUrl: post.imageUrls?.[0],
    colors: ['#f58529', '#dd2a7b'],
  };
}