import { render } from "@testing-library/react";
import { Chip } from "@/components/Chip";

describe("Chip", () => {
  it("renders without crashing", () => {
    render(<Chip />);
    const img = document.querySelector("img");
    expect(img).toBeInTheDocument();
  });

  it("renders with default emotion happy", () => {
    render(<Chip />);
    const img = document.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", expect.stringContaining("happy-state"));
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
      const img = document.querySelector("img");
      expect(img).toBeInTheDocument();
      unmount();
    });
  });

  it("accepts custom size", () => {
    render(<Chip size={120} />);
    const img = document.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("width", "120");
    expect(img).toHaveAttribute("height", "120");
  });
});
