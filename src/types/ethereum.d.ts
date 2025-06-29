interface Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    isMetaMask?: boolean;
    on: (eventName: string, handler: (...args: unknown[]) => void) => void;
    removeListener: (eventName: string, handler: (...args: unknown[]) => void) => void;
  };
}