export function getUserDisplayName(user, fallback = 'Người dùng') {
  const fullName = typeof user?.fullName === 'string' ? user.fullName.trim() : '';
  const userName = typeof user?.userName === 'string' ? user.userName.trim() : '';
  return userName || fullName || fallback;
}

export function getUserInitial(user, fallback = 'U') {
  return getUserDisplayName(user, fallback).charAt(0).toLocaleUpperCase('vi-VN');
}
