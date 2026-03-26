/**
 * @jest-environment node
 *
 * Tests for the streak calculation logic in POST /api/log.
 * Exercises: first log ever, consecutive days, gap in streak, same-day log.
 */

const TODAY = "2026-03-25";
const YESTERDAY = "2026-03-24";
const TWO_DAYS_AGO = "2026-03-23";

// Mock createClient for server context
jest.mock("@/lib/supabase/server", () => ({
    createClient: jest.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { POST } from "@/app/api/log/route";

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

/** Build a minimal Supabase chain mock */
function buildSupabaseMock({
    profile,
}: {
    profile: Record<string, unknown> | null;
}) {
    // Track what was passed to update()
    const updateArgs: Record<string, unknown>[] = [];

    const chainBase = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockImplementation((args) => {
            updateArgs.push(args);
            return chainBase;
        }),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
    };

    // Override single for specific tables
    const profileChain = {
        ...chainBase,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: profile, error: null }),
        update: jest.fn().mockImplementation((args) => {
            updateArgs.push(args);
            return {
                eq: jest.fn().mockResolvedValue({ data: null, error: null }),
            };
        }),
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    };

    const logChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
            data: { id: "log-1", meal_name: "Test Food", calories: 400 },
            error: null,
        }),
    };

    const summaryChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
    };

    const supabaseMock = {
        auth: {
            getUser: jest.fn().mockResolvedValue({
                data: { user: { id: "user-123" } },
                error: null,
            }),
        },
        from: jest.fn().mockImplementation((table: string) => {
            if (table === "profiles") return profileChain;
            if (table === "logs") return logChain;
            if (table === "daily_summaries") return summaryChain;
            return chainBase;
        }),
        _updateArgs: updateArgs,
        _profileChain: profileChain,
    };

    return supabaseMock;
}

function makeRequest(body: Record<string, unknown> = {}) {
    const defaultBody = {
        food_name: "Test Food",
        calories: 400,
        protein: 30,
        carbs: 40,
        fat: 10,
        ...body,
    };
    return new Request("http://localhost/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultBody),
    });
}

// Pin today's date for deterministic tests
beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(`${TODAY}T12:00:00Z`));
});

afterAll(() => {
    jest.useRealTimers();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("POST /api/log — streak calculation", () => {
    it("starts streak at 1 for very first log (no existing profile)", async () => {
        const mock = buildSupabaseMock({ profile: null });
        mockCreateClient.mockResolvedValue(mock as ReturnType<typeof createClient>);

        const res = await POST(makeRequest());
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.streak).toBe(1);
    });

    it("increments streak when last log was yesterday", async () => {
        const mock = buildSupabaseMock({
            profile: {
                streak_days: 5,
                longest_streak: 10,
                last_log_date: YESTERDAY,
            },
        });
        mockCreateClient.mockResolvedValue(mock as ReturnType<typeof createClient>);

        const res = await POST(makeRequest());
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.streak).toBe(6);
    });

    it("resets streak to 1 when last log was 2+ days ago", async () => {
        const mock = buildSupabaseMock({
            profile: {
                streak_days: 8,
                longest_streak: 15,
                last_log_date: TWO_DAYS_AGO,
            },
        });
        mockCreateClient.mockResolvedValue(mock as ReturnType<typeof createClient>);

        const res = await POST(makeRequest());
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.streak).toBe(1);
    });

    it("keeps streak unchanged when already logged today", async () => {
        const mock = buildSupabaseMock({
            profile: {
                streak_days: 7,
                longest_streak: 7,
                last_log_date: TODAY,
            },
        });
        mockCreateClient.mockResolvedValue(mock as ReturnType<typeof createClient>);

        const res = await POST(makeRequest());
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.streak).toBe(7);
    });

    it("updates longest_streak when new streak exceeds previous best", async () => {
        const mock = buildSupabaseMock({
            profile: {
                streak_days: 14,
                longest_streak: 14,
                last_log_date: YESTERDAY,
            },
        });
        mockCreateClient.mockResolvedValue(mock as ReturnType<typeof createClient>);

        const res = await POST(makeRequest());
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.streak).toBe(15);
        // Verify the update call included longest_streak: 15
        const updateCall = mock._profileChain.update.mock.calls[0]?.[0];
        expect(updateCall?.longest_streak).toBe(15);
    });

    it("preserves longest_streak when reset streak is lower", async () => {
        const mock = buildSupabaseMock({
            profile: {
                streak_days: 30,
                longest_streak: 30,
                last_log_date: TWO_DAYS_AGO,
            },
        });
        mockCreateClient.mockResolvedValue(mock as ReturnType<typeof createClient>);

        const res = await POST(makeRequest());
        const body = await res.json();

        expect(body.streak).toBe(1);
        const updateCall = mock._profileChain.update.mock.calls[0]?.[0];
        expect(updateCall?.longest_streak).toBe(30); // preserved
    });
});

describe("POST /api/log — validation", () => {
    it("returns 401 when unauthenticated", async () => {
        const mock = buildSupabaseMock({ profile: null });
        mock.auth.getUser = jest.fn().mockResolvedValue({
            data: { user: null },
            error: new Error("Not authenticated"),
        });
        mockCreateClient.mockResolvedValue(mock as ReturnType<typeof createClient>);

        const res = await POST(makeRequest());
        expect(res.status).toBe(401);
    });

    it("returns 400 for invalid payload (negative calories)", async () => {
        const mock = buildSupabaseMock({ profile: null });
        mockCreateClient.mockResolvedValue(mock as ReturnType<typeof createClient>);

        const res = await POST(makeRequest({ calories: -100 }));
        expect(res.status).toBe(400);
    });

    it("returns 400 when food_name is empty", async () => {
        const mock = buildSupabaseMock({ profile: null });
        mockCreateClient.mockResolvedValue(mock as ReturnType<typeof createClient>);

        const res = await POST(makeRequest({ food_name: "" }));
        expect(res.status).toBe(400);
    });
});
