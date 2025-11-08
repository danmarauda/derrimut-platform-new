// Mock for convex/react
module.exports = {
  useQuery: jest.fn(() => undefined),
  useMutation: jest.fn(() => jest.fn()),
  useAction: jest.fn(() => jest.fn()),
  ConvexProvider: ({ children }) => children,
  ConvexReactClient: jest.fn().mockImplementation(() => ({
    query: jest.fn(),
    mutation: jest.fn(),
    action: jest.fn(),
    setAuth: jest.fn(),
    clearAuth: jest.fn(),
    close: jest.fn(),
  })),
};
