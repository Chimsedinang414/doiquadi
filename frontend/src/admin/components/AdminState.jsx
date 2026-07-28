import React from 'react';
import { AlertTriangle, Inbox, LoaderCircle, RotateCcw } from 'lucide-react';

export function AdminLoading() {
  return <div className="admin-state"><LoaderCircle className="admin-spin" size={24} />Đang tải dữ liệu…</div>;
}

export function AdminError({ message, onRetry }) {
  return <div className="admin-state error"><AlertTriangle size={24} /><p>{message}</p><button type="button" onClick={onRetry}><RotateCcw size={15} /> Thử lại</button></div>;
}

export function AdminEmpty({ children = 'Chưa có dữ liệu.' }) {
  return <div className="admin-state"><Inbox size={25} />{children}</div>;
}
