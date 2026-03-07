import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "@/components/EmptyState";

describe("EmptyState", () => {
  it("renders dashboard variant by default", () => {
    const { container } = render(<EmptyState />);
    expect(screen.getByText("No meals logged yet.")).toBeInTheDocument();
    // Use container to find the arrow SVG logic instead of text if it was pure motion
    expect(screen.getByText("Tap the snap button below to get started")).toBeInTheDocument();
  });

  it("renders title and description in default variant", () => {
    render(
      <EmptyState variant="default" title="No items" description="Get started by adding one." />
    );
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("Get started by adding one.")).toBeInTheDocument();
  });

  it("renders action button when provided in default variant", () => {
    const onAction = jest.fn();
    render(
      <EmptyState
        variant="default"
        title="Empty"
        description="Desc"
        actionLabel="Add item"
        onAction={onAction}
      />
    );
    const button = screen.getByRole("button", { name: /add item/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("does not render button when onAction is missing in default variant", () => {
    render(
      <EmptyState variant="default" title="Empty" description="Desc" actionLabel="Add" />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
