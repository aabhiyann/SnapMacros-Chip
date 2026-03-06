export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Something went wrong.", onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-xl bg-card border border-elevated p-8 text-center">
      <p className="text-danger text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="touch-target inline-flex items-center justify-center min-h-[48px] px-6 rounded-lg bg-elevated text-text font-medium hover:bg-card transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
