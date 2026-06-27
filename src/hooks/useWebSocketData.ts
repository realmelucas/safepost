import { useContext } from 'react';
import { WebSocketContext } from '../context/WebSocketContext';
import type { WebSocketContextValue } from '../context/WebSocketContext';

export function useWebSocketData(): WebSocketContextValue {
  return useContext(WebSocketContext);
}
