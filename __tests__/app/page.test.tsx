import { render, screen, act } from "@testing-library/react";
import AppLaunchPage from "@/app/page";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Mock next/navigation
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

// Mock Supabase Auth
jest.mock("@/lib/supabase/client", () => ({
    createClient: jest.fn(),
}));

// Mock Framer Motion to skip animations and render immediately
jest.mock("framer-motion", () => {
    const React = require("react");
    return {
        motion: new Proxy({}, {
            get: (_, prop) => {
                return ({ children, initial, animate, exit, transition, variants, whileHover, whileTap, ...props }: any) => {
                    const Tag = prop as string;
                    return <Tag {...props}>{children}</Tag>;
                };
            }
        }),
        AnimatePresence: ({ children }: any) => <>{children}</>,
    };
});

describe("App Launch / Splash Screen", () => {
    let mockReplace: jest.Mock;
    let mockGetSession: jest.Mock;
    let mockSingle: jest.Mock;

    beforeEach(() => {
        jest.useFakeTimers();

        mockReplace = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });

        mockGetSession = jest.fn();
        mockSingle = jest.fn();

        const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
        const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

        const mockSupabase = {
            auth: { getSession: mockGetSession },
            from: jest.fn(() => ({
                select: mockSelect
            }))
        };
        (createClient as jest.Mock).mockReturnValue(mockSupabase);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it("renders splash screen text perfectly", async () => {
        render(<AppLaunchPage />);
        expect(screen.getByText("Snap")).toBeInTheDocument();
        expect(screen.getByText("Macros")).toBeInTheDocument();
        expect(screen.getByText("Snap. Track. Roast.")).toBeInTheDocument();

        await act(async () => {
            jest.advanceTimersByTime(900);
        });

        expect(screen.getByText(/Hey! Let's track something/)).toBeInTheDocument();
    });

    it("routes to /login when user is not authenticated", async () => {
        mockGetSession.mockResolvedValue({ data: { session: null } });
        render(<AppLaunchPage />);

        // Fast-forward past the 1200ms animation timeout
        await act(async () => {
            jest.advanceTimersByTime(1200);
        });

        expect(mockReplace).toHaveBeenCalledWith("/login");
    });

    it("routes to /onboarding when user is authenticated but hasn't completed onboarding", async () => {
        mockGetSession.mockResolvedValue({ data: { session: { user: { id: "123" } } } });
        mockSingle.mockResolvedValue({ data: null });

        render(<AppLaunchPage />);

        await act(async () => {
            jest.advanceTimersByTime(1200);
        });

        expect(mockReplace).toHaveBeenCalledWith("/onboarding");
    });

    it("routes to /dashboard when user is authenticated and has completed onboarding", async () => {
        mockGetSession.mockResolvedValue({ data: { session: { user: { id: "123" } } } });
        mockSingle.mockResolvedValue({ data: { onboarding_completed: true } });

        render(<AppLaunchPage />);

        await act(async () => {
            jest.advanceTimersByTime(1200);
        });

        expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    });
});
