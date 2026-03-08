import "@testing-library/jest-dom";

// Global mock for Supabase client
jest.mock("@/lib/supabase/client", () => ({
    createClient: jest.fn(() => ({
        auth: {
            getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
            signInWithPassword: jest.fn().mockResolvedValue({ data: {}, error: null }),
            signUp: jest.fn().mockResolvedValue({ data: {}, error: null }),
            signOut: jest.fn().mockResolvedValue({ error: null }),
        },
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: { onboarding_completed: true } })
        }))
    }))
}));
