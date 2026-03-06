import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "@/components/EmptyState";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState title="No items" description="Get started by adding one." />
    );
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("Get started by adding one.")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    const onAction = jest.fn();
    render(
      <EmptyState
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

  it("does not render button when onAction is missing", () => {
    render(
      <EmptyState title="Empty" description="Desc" actionLabel="Add" />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
