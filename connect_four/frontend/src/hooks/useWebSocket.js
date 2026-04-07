import { useRef, useCallback, useState, useEffect } from "react";

export function useWebSocket() {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimer = useRef(null);
  const onMessageRef = useRef(null);
  const roomCodeRef = useRef(null);
  const initialMessageRef = useRef(null);
  const intentionalClose = useRef(false);
  const errorReceived = useRef(false);

  const connect = useCallback((roomCode, onMessage, initialMessage) => {
    onMessageRef.current = onMessage;
    roomCodeRef.current = roomCode;
    initialMessageRef.current = initialMessage;
    intentionalClose.current = false;
    errorReceived.current = false;

    if (wsRef.current) {
      intentionalClose.current = true;
      wsRef.current.close();
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const url = `${protocol}//${host}/ws/${roomCode}`;

    intentionalClose.current = false;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      if (initialMessage) {
        ws.send(JSON.stringify(initialMessage));
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "error") {
        errorReceived.current = true;
      }
      if (onMessageRef.current) onMessageRef.current(data);
    };

    ws.onclose = () => {
      setConnected(false);
      if (intentionalClose.current || errorReceived.current) return;
      reconnectTimer.current = setTimeout(() => {
        if (onMessageRef.current && roomCodeRef.current) {
          connect(roomCodeRef.current, onMessageRef.current, initialMessageRef.current);
        }
      }, 3000);
    };

    ws.onerror = () => ws.close();
  }, []);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const disconnect = useCallback(() => {
    clearTimeout(reconnectTimer.current);
    intentionalClose.current = true;
    onMessageRef.current = null;
    roomCodeRef.current = null;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(reconnectTimer.current);
      intentionalClose.current = true;
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return { connected, connect, send, disconnect };
}
