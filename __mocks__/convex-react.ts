// Mock for convex/react - Vitest version
import { vi } from 'vitest';

export const useQuery = vi.fn(() => undefined);
export const useMutation = vi.fn(() => vi.fn());
export const useAction = vi.fn(() => vi.fn());
export const ConvexProvider = ({ children }: { children: React.ReactNode }) => children;
export const ConvexReactClient = vi.fn().mockImplementation(() => ({
  query: vi.fn(),
  mutation: vi.fn(),
  action: vi.fn(),
  setAuth: vi.fn(),
  clearAuth: vi.fn(),
  close: vi.fn(),
}));

