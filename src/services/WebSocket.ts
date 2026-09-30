export type CityFlowEvent = {
  event: string;
  timestamp: string;
  version: string;
  data: any;
};

type EventHandler = (event: CityFlowEvent) => void;

class CityFlowWebSocket {
  private socket: WebSocket | null = null;
  private handlers: EventHandler[] = [];
  private reconnectTimer: number | null = null;

  connect() {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const wsUrl =
  import.meta.env.VITE_WS_URL ||
  (() => {
    const protocol =
      window.location.protocol === "https:"
        ? "wss:"
        : "ws:";

    return `${protocol}//${window.location.hostname}:8000/ws`;
  })();

console.log(
  "🔌 Connecting to CITYFLOW WebSocket:",
  wsUrl
);

this.socket = new WebSocket(wsUrl);

    console.log("🔌 Connecting to CITYFLOW WebSocket:", wsUrl);

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log("🟢 CITYFLOW WebSocket connected");
    };

    this.socket.onmessage = (message) => {
      try {
        const event: CityFlowEvent = JSON.parse(message.data);

        console.log("📡 CITYFLOW:", event.event);

        this.handlers.forEach((handler) => {
          handler(event);
        });
      } catch (error) {
        console.error(
          "❌ Invalid CITYFLOW WebSocket message:",
          error
        );
      }
    };

    this.socket.onerror = (error) => {
      console.error(
        "❌ CITYFLOW WebSocket error:",
        error
      );
    };

    this.socket.onclose = () => {
      console.log(
        "🔴 CITYFLOW WebSocket disconnected"
      );

      this.socket = null;

      if (this.reconnectTimer === null) {
        this.reconnectTimer = window.setTimeout(() => {
          this.reconnectTimer = null;
          this.connect();
        }, 3000);
      }
    };
  }

  disconnect() {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  subscribe(handler: EventHandler) {
    this.handlers.push(handler);

    return () => {
      this.handlers = this.handlers.filter(
        (item) => item !== handler
      );
    };
  }

  isConnected() {
    return (
      this.socket?.readyState === WebSocket.OPEN
    );
  }
}

export const cityFlowWebSocket =
  new CityFlowWebSocket();