import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import OnboardingPage from "@/app/onboarding/page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
        };
    },
}));

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
        expect(screen.getByText("What's your goal?")).toBeInTheDocument();

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
        expect(screen.getByText("What's your goal?")).toBeInTheDocument();

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
        const optionBtn = screen.getByText("Cut").closest("button");
        fireEvent.click(optionBtn!);

        // Button should be enabled
        await waitFor(() => {
            expect(screen.getByText("Continue").closest("button")).not.toBeDisabled();
        });
    });

    it("validates complex inputs on About You step (Step 2)", async () => {
        render(<OnboardingPage />);

        // 0 -> 1
        fireEvent.click(screen.getByText("Let's Get Started →"));
        // 1 -> 2
        fireEvent.click(screen.getByText("Cut").closest("button")!);
        await waitFor(() => expect(screen.getByText("Continue").closest("button")).not.toBeDisabled());
        fireEvent.click(screen.getByText("Continue").closest("button")!);

        // On About You step
        expect(screen.getByText("About you")).toBeInTheDocument();
        const continueBtn = screen.getByText("Continue").closest("button");
        expect(continueBtn).toBeDisabled(); // Initially disabled because fields are missing

        // Fill Name
        const nameInput = screen.getByPlaceholderText("Your first name");
        fireEvent.change(nameInput, { target: { value: "Alex" } });
        await act(async () => { jest.advanceTimersByTime(200); });

        // Fill Age
        const ageInput = screen.getByPlaceholderText("25");
        fireEvent.change(ageInput, { target: { value: "30" } });
        await act(async () => { jest.advanceTimersByTime(200); });

        // Change weight to invalid (20kg)
        fireEvent.click(screen.getByText("KG").closest("button")!);
        await act(async () => { jest.advanceTimersByTime(200); });

        const weightInput1 = screen.getByPlaceholderText("0");
        fireEvent.change(weightInput1, { target: { value: "20" } });
        await act(async () => { jest.advanceTimersByTime(200); });

        // Let the debounce propagate and re-render
        await act(async () => { jest.runAllTimers(); });
        expect(screen.getByText(/Weight must be between 30 and 350kg/i)).toBeInTheDocument();

        // Fix weight
        const weightInput2 = screen.getByPlaceholderText("0");
        fireEvent.change(weightInput2, { target: { value: "70" } });
        await act(async () => { jest.advanceTimersByTime(200); });

        // Add valid height (CM)
        fireEvent.click(screen.getByText("CM").closest("button")!);
        await act(async () => { jest.advanceTimersByTime(200); });

        const heightInput = screen.getByPlaceholderText("175");
        fireEvent.change(heightInput, { target: { value: "180" } });
        await act(async () => { jest.advanceTimersByTime(200); });

        // Select gender
        fireEvent.click(screen.getByText("Male").closest("button")!);
        await act(async () => { jest.advanceTimersByTime(200); });

        // Let the debounce propagate and re-render
        await act(async () => { jest.runAllTimers(); });

        // Should now be enabled
        await waitFor(() => {
            expect(screen.getByText("Continue").closest("button")).not.toBeDisabled();
        });
    });

    it("renders Activity Level step (Step 3) with pre-selected default and advances", async () => {
        render(<OnboardingPage />);

        // Advance to Step 3 rapidly
        fireEvent.click(screen.getByText("Let's Get Started →"));

        fireEvent.click(screen.getByText("Cut").closest("button")!);
        await waitFor(() => expect(screen.getByText("Continue").closest("button")).not.toBeDisabled());
        fireEvent.click(screen.getByText("Continue").closest("button")!);

        const nameInput = screen.getByPlaceholderText("Your first name");
        fireEvent.change(nameInput, { target: { value: "Alex" } });
        const ageInput = screen.getByPlaceholderText("25");
        fireEvent.change(ageInput, { target: { value: "30" } });

        fireEvent.click(screen.getByText("CM").closest("button")!);
        const heightInput = await screen.findByPlaceholderText("175");
        fireEvent.change(heightInput, { target: { value: "180" } });

        fireEvent.click(screen.getByText("KG").closest("button")!);
        const weightInput = await screen.findByPlaceholderText("0");
        fireEvent.change(weightInput, { target: { value: "70" } });

        fireEvent.click(screen.getByText("Male").closest("button")!);

        await act(async () => { jest.runAllTimers(); });
        await waitFor(() => expect(screen.getByText("Continue").closest("button")).not.toBeDisabled());
        fireEvent.click(screen.getByText("Continue").closest("button")!);

        // Assert Step 3 is reached
        expect(screen.getByText("How active are you?")).toBeInTheDocument();
        expect(screen.getByText("Be honest. I won't judge. Much. 👀")).toBeInTheDocument();

        // 5 cards should render
        expect(screen.getByText("Sedentary")).toBeInTheDocument();
        expect(screen.getByText("Lightly Active")).toBeInTheDocument();
        expect(screen.getByText("Moderately Active")).toBeInTheDocument();
        expect(screen.getByText("Very Active")).toBeInTheDocument();
        expect(screen.getByText("Athlete")).toBeInTheDocument();

        // Continue should NOT be disabled (it has a default 'moderate')
        expect(screen.getByText("Continue").closest("button")).not.toBeDisabled();

        // Option selection works
        fireEvent.click(screen.getByText("Athlete").closest("button")!);
        await act(async () => { jest.advanceTimersByTime(200); });

        // Let state settle
        await act(async () => { jest.runAllTimers(); });

        // Go to next step
        fireEvent.click(screen.getByText("Continue").closest("button")!);

        // For now, the next step hasn't been implemented specifically, but it's empty state or generic UI will render
    });
});
