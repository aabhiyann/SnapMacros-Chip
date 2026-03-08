import "@testing-library/jest-dom";

// Mock fetch for API calls (e.g. bootstrap-demo)
global.fetch = jest.fn().mockResolvedValue({ ok: true });

// Global mock for Supabase client
jest.mock("@/lib/supabase/client", () => ({
    createClient: jest.fn(() => ({
        auth: {
            getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
            signInWithPassword: jest.fn(async ({ email }) => {
                if (email === "wrong@test.com") {
                    return { data: null, error: new Error("Invalid login credentials") };
                }
                return { data: {}, error: null };
            }),
            signUp: jest.fn().mockResolvedValue({ data: {}, error: null }),
            signOut: jest.fn().mockResolvedValue({ error: null }),
        },
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: { onboarding_completed: true } }),
            maybeSingle: jest.fn().mockResolvedValue({ data: { onboarding_completed: true } })
        }))
    }))
}));
