import { render, screen, act, fireEvent } from "@testing-library/react";
import LoginPage from "@/app/(auth)/login/page";
import { useRouter } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

// Mock Framer Motion
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

describe("Login Screen", () => {
    let mockPush: jest.Mock;

    beforeEach(() => {
        jest.useFakeTimers();
        mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it("renders correctly", () => {
        render(<LoginPage />);
        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
        expect(screen.getByText("Sign In")).toBeInTheDocument();
        expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    });

    it("shows error when submitting empty fields", async () => {
        render(<LoginPage />);

        fireEvent.click(screen.getByText("Sign In"));

        // The component sets errMessage immediately, Framer presence might need a tick
        expect(screen.getByText("That password isn't right. Try again or reset it.")).toBeInTheDocument();
    });

    it("types into email and password fields", () => {
        render(<LoginPage />);

        const emailInput = screen.getByPlaceholderText("Email") as HTMLInputElement;
        const passwordInput = screen.getByPlaceholderText("Password") as HTMLInputElement;

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });

        expect(emailInput.value).toBe("test@example.com");
        expect(passwordInput.value).toBe("password123");
    });

    it("shows specific error for invalid mock credentials", async () => {
        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "wrong@test.com" } });
        fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "wrongpass" } });

        fireEvent.click(screen.getByText("Sign In"));

        await act(async () => {
            jest.advanceTimersByTime(800); // Wait out the mock network delay
        });

        expect(screen.getByText("That password isn't right. Try again or reset it.")).toBeInTheDocument();
    });

    it("routes to dashboard on success with demo credentials", async () => {
        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "demo@snapmacros.app" } });
        fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "SnapMacros2026Demo!" } });

        fireEvent.click(screen.getByText("Sign In"));

        await act(async () => {
            jest.advanceTimersByTime(800); // network delay
        });

        expect(screen.getByText("We're in! 🚀")).toBeInTheDocument(); // Success state text
        expect(screen.getByText("Success!")).toBeInTheDocument(); // Button text

        await act(async () => {
            jest.advanceTimersByTime(600); // flash success delay before routing
        });

        expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
});
