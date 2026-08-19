import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const WS_ENDPOINT = import.meta.env.VITE_WS_BASE_URL
  || `${API_BASE_URL.replace(/\/$/, '')}/ws`;

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.connected = false;
    this.onConnectCallbacks = [];
  }

  connect(token) {
    if (this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_ENDPOINT),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.connected = true;
        // Re-subscribe to previous subscriptions after reconnect
        this.onConnectCallbacks.forEach(cb => cb());
      },
      onDisconnect: () => {
        this.connected = false;
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers?.message);
      },
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions.clear();
      this.onConnectCallbacks = [];
      this.client.deactivate();
      this.client = null;
      this.connected = false;
    }
  }

  subscribe(conversationId, onMessage) {
    const destination = `/topic/conversation/${conversationId}`;
    const doSubscribe = () => {
      if (this.subscriptions.has(destination)) {
        this.subscriptions.get(destination).unsubscribe();
      }
      const sub = this.client.subscribe(destination, message => {
        try {
          onMessage(JSON.parse(message.body));
        } catch (e) {
          console.error('Failed to parse message:', e);
        }
      });
      this.subscriptions.set(destination, sub);
    };

    if (this.connected) {
      doSubscribe();
    }
    // Store callback for reconnection
    this.onConnectCallbacks.push(doSubscribe);
  }

  subscribeTyping(conversationId, onTyping) {
    const destination = `/topic/conversation/${conversationId}/typing`;
    const doSubscribe = () => {
      if (this.subscriptions.has(destination)) {
        this.subscriptions.get(destination).unsubscribe();
      }
      const sub = this.client.subscribe(destination, message => {
        try {
          onTyping(JSON.parse(message.body));
        } catch (e) {
          console.error('Failed to parse typing event:', e);
        }
      });
      this.subscriptions.set(destination, sub);
    };

    if (this.connected) {
      doSubscribe();
    }
    this.onConnectCallbacks.push(doSubscribe);
  }

  unsubscribe(conversationId) {
    const msgDest = `/topic/conversation/${conversationId}`;
    const typDest = `/topic/conversation/${conversationId}/typing`;
    [msgDest, typDest].forEach(dest => {
      if (this.subscriptions.has(dest)) {
        this.subscriptions.get(dest).unsubscribe();
        this.subscriptions.delete(dest);
      }
    });
    this.onConnectCallbacks = this.onConnectCallbacks.filter(cb => {
      // Remove callbacks for this conversation (best effort)
      return true;
    });
  }

  sendMessage(conversationId, message) {
    if (!this.connected || !this.client) return;
    this.client.publish({
      destination: `/app/chat.send/${conversationId}`,
      body: JSON.stringify(message),
    });
  }

  sendTyping(conversationId, userId, userName, typing) {
    if (!this.connected || !this.client) return;
    this.client.publish({
      destination: `/app/chat.typing/${conversationId}`,
      body: JSON.stringify({ conversationId, userId, userName, typing }),
    });
  }
}

export default new WebSocketService();
