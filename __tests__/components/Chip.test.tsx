import { render } from "@testing-library/react";
import { Chip } from "@/components/Chip";

describe("Chip", () => {
  it("renders without crashing", () => {
    render(<Chip />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders with default emotion happy", () => {
    render(<Chip />);
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  it("renders all 8 emotions", () => {
    const emotions = [
      "happy",
      "hype",
      "shocked",
      "laughing",
      "sad",
      "on_fire",
      "thinking",
      "sleepy",
    ] as const;
    emotions.forEach((emotion) => {
      const { unmount } = render(<Chip emotion={emotion} />);
      expect(document.querySelector("svg")).toBeInTheDocument();
      unmount();
    });
  });

  it("accepts custom size", () => {
    render(<Chip size={120} />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("width", "120");
    expect(svg).toHaveAttribute("height", "120");
  });
});
