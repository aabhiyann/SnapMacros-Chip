export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="rounded-xl bg-card border border-elevated p-8 text-center">
      <h3 className="font-heading text-lg font-semibold text-text mb-2">{title}</h3>
      <p className="text-text-secondary text-sm mb-4 max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="touch-target inline-flex items-center justify-center min-h-[48px] px-6 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
