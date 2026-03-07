import { render, screen, act, fireEvent } from "@testing-library/react";
import SignupPage from "@/app/(auth)/signup/page";
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

describe("Signup Screen", () => {
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
        render(<SignupPage />);
        expect(screen.getByPlaceholderText("What should Chip call you?")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
        expect(screen.getByText("Create Account")).toBeInTheDocument();
        expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    });

    it("shows error when submitting empty fields", async () => {
        render(<SignupPage />);

        fireEvent.click(screen.getByText("Create Account"));

        expect(screen.getByText("Please fill out all the fields.")).toBeInTheDocument();
    });

    it("shows error for short passwords", async () => {
        render(<SignupPage />);

        fireEvent.change(screen.getByPlaceholderText("What should Chip call you?"), { target: { value: "John" } });
        fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "john@test.com" } });
        fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "123" } });
        fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "123" } });

        fireEvent.click(screen.getByText("Create Account"));

        expect(screen.getByText("Password must be at least 6 characters.")).toBeInTheDocument();
    });

    it("shows error for mismatched passwords", async () => {
        render(<SignupPage />);

        fireEvent.change(screen.getByPlaceholderText("What should Chip call you?"), { target: { value: "John" } });
        fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "john@test.com" } });
        fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "password123" } });
        fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "wrongpassword123" } });

        fireEvent.click(screen.getByText("Create Account"));

        expect(screen.getByText("Those passwords don't match. Try again.")).toBeInTheDocument();
    });

    it("routes to onboarding on successful sign up", async () => {
        render(<SignupPage />);

        fireEvent.change(screen.getByPlaceholderText("What should Chip call you?"), { target: { value: "John" } });
        fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "john@test.com" } });
        fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "securepassword" } });
        fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "securepassword" } });

        fireEvent.click(screen.getByText("Create Account"));

        await act(async () => {
            jest.advanceTimersByTime(1200); // 1.2s fake auth delay
        });

        expect(screen.getByText("Let's go! 🎉")).toBeInTheDocument();
        expect(screen.getByText("Success!")).toBeInTheDocument();

        await act(async () => {
            jest.advanceTimersByTime(600); // 600ms success flash delay before routing
        });

        expect(mockPush).toHaveBeenCalledWith("/onboarding");
    });
});
