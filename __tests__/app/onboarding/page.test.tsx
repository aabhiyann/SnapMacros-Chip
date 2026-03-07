import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import OnboardingPage from "@/app/onboarding/page";

// Mock framer-motion to execute immediately
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

describe("Onboarding Controller (Flow 3)", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it("renders Welcome Step initially without a progress bar or back button", () => {
        render(<OnboardingPage />);

        // Welcome step should exist
        expect(screen.getByText("Snap. Track.Roast.")).toBeInTheDocument();
        expect(screen.getByText("Let's Get Started →")).toBeInTheDocument();

        // Progress bar should NOT be rendered
        const backButtons = document.querySelectorAll("button");
        const hasBackButton = Array.from(backButtons).some(b => b.querySelector('svg'));
        expect(hasBackButton).toBe(false); // ChevronLeft svg not there
    });

    it("advances to Step 1 and renders progress bar with 5 pills and back button", () => {
        render(<OnboardingPage />);

        // Click Let's Get Started
        fireEvent.click(screen.getByText("Let's Get Started →"));

        // Header from GoalStep should exist
        expect(screen.getByText("What's the main goal?")).toBeInTheDocument();

        // Check for 5 pills in the progress bar
        // We know they are divs inside a flex-1 flex justify-center gap-2
        const progressContainer = document.querySelector('.flex-1.flex.justify-center.gap-2');
        expect(progressContainer).toBeInTheDocument();
        expect(progressContainer?.children.length).toBe(5);

        // Check for back button
        const backButton = document.querySelector('button');
        expect(backButton).toBeInTheDocument();
    });

    it("allows navigating back to the previous step", () => {
        render(<OnboardingPage />);

        // Go 0 -> 1
        fireEvent.click(screen.getByText("Let's Get Started →"));
        expect(screen.getByText("What's the main goal?")).toBeInTheDocument();

        // Click Back Button
        const backButton = document.querySelector('button');
        fireEvent.click(backButton as Element);

        // Should return to Welcome Step 0
        expect(screen.getByText("Snap. Track.Roast.")).toBeInTheDocument();
    });

    it("enforces disabled states on required steps", async () => {
        render(<OnboardingPage />);

        // Go 0 -> 1
        fireEvent.click(screen.getByText("Let's Get Started →"));

        // Continue button should be disabled initially on Goal Step
        expect(screen.getByText("Continue").closest("button")).toBeDisabled();

        // Select an option (click the parent button to ensure the mock triggers)
        const optionBtn = screen.getByText("Lose Weight").closest("button");
        fireEvent.click(optionBtn!);

        // Button should be enabled
        await waitFor(() => {
            expect(screen.getByText("Continue").closest("button")).not.toBeDisabled();
        });
    });
});
