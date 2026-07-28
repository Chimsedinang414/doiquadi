import React from 'react';
import { BellRing, MessageCircle, ShieldCheck, Users } from 'lucide-react';

export default function ChatPage() {
  return (
    <section className="chat-placeholder-page">
      <div className="chat-placeholder-card">
        <div className="chat-placeholder-icon" aria-hidden="true">
          <MessageCircle size={38} strokeWidth={1.9} />
        </div>
        <span className="chat-placeholder-kicker">SẮP RA MẮT</span>
        <h1>Tin nhắn LocalFood</h1>
        <p>
          Không gian trò chuyện dành cho cộng đồng yêu ẩm thực đang được xây dựng.
        </p>

        <div className="chat-placeholder-features" aria-label="Tính năng dự kiến">
          <div>
            <Users aria-hidden="true" />
            <span>Trò chuyện cộng đồng</span>
          </div>
          <div>
            <BellRing aria-hidden="true" />
            <span>Thông báo tin nhắn</span>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <span>Bảo vệ riêng tư</span>
          </div>
        </div>

        <div className="chat-placeholder-status">
          <i aria-hidden="true" />
          Đang trong giai đoạn phát triển
        </div>
      </div>
    </section>
  );
}
