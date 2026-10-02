import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useWaStore } from "../store.js";

/**
 * Hook de Socket.IO hacia el backend de Render.
 * Eventos entrantes: qr, ready, disconnected, session_lost, message_status
 * Salientes: request_qr (y emit genérico)
 */
export function useSocket(backendUrl) {
  const socketRef = useRef(null);

  const setQr = useWaStore((s) => s.setQr);
  const setWaStatus = useWaStore((s) => s.setWaStatus);
  const setSessionLost = useWaStore((s) => s.setSessionLost);
  const setSocketOk = useWaStore((s) => s.setSocketOk);
  const applyMessageStatus = useWaStore((s) => s.applyMessageStatus);
  const pushToast = useWaStore((s) => s.pushToast);

  useEffect(() => {
    if (!backendUrl) {
      setSocketOk(false);
      return undefined;
    }

    const socket = io(backendUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1200,
      reconnectionDelayMax: 8000,
      timeout: 20000
    });
    socketRef.current = socket;

    const onQr = (payload) => {
      const value = typeof payload === "string" ? payload : payload?.qr || payload?.data || "";
      setQr(value || null);
      setWaStatus("waiting_scan");
      setSessionLost(false);
    };

    const onReady = () => {
      setQr(null);
      setWaStatus("connected");
      setSessionLost(false);
      setSocketOk(true);
      pushToast({ kind: "ok", text: "WhatsApp conectado" });
    };

    const onDisconnected = () => {
      setWaStatus("disconnected");
      setQr(null);
      pushToast({ kind: "err", text: "WhatsApp se desconectó" });
    };

    const onSessionLost = () => {
      setSessionLost(true);
      setWaStatus("disconnected");
      setQr(null);
    };

    const onMessageStatus = (payload) => {
      if (!payload) return;
      applyMessageStatus(payload);
    };

    socket.on("qr", onQr);
    socket.on("ready", onReady);
    socket.on("disconnected", onDisconnected);
    socket.on("session_lost", onSessionLost);
    socket.on("message_status", onMessageStatus);

    socket.on("connect", () => setSocketOk(true));
    socket.on("disconnect", () => setSocketOk(false));
    socket.on("connect_error", () => setSocketOk(false));
    socket.on("reconnect", () => {
      setSocketOk(true);
      pushToast({ kind: "ok", text: "Socket reconectado" });
    });
    socket.on("reconnect_attempt", () => setSocketOk(false));

    return () => {
      socket.off("qr", onQr);
      socket.off("ready", onReady);
      socket.off("disconnected", onDisconnected);
      socket.off("session_lost", onSessionLost);
      socket.off("message_status", onMessageStatus);
      socket.removeAllListeners();
      socket.close();
      socketRef.current = null;
    };
  }, [backendUrl, setQr, setWaStatus, setSessionLost, setSocketOk, applyMessageStatus, pushToast]);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  const requestQr = useCallback(() => {
    socketRef.current?.emit("request_qr");
  }, []);

  return { emit, requestQr, socket: socketRef };
}
