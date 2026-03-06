export default function LogPage() {
  return (
    <div className="p-4">
      <h2 className="font-heading text-xl font-bold text-text mb-4">Log a meal</h2>
      <div className="rounded-xl bg-card border border-elevated p-8 text-center">
        <p className="text-text-secondary mb-4">
          Camera and photo upload will go here. Photo → Claude vision → macro breakdown.
        </p>
        <button
          type="button"
          className="touch-target inline-flex items-center justify-center min-h-[48px] px-6 rounded-lg bg-primary text-white font-medium"
          disabled
          aria-disabled
        >
          Coming soon
        </button>
      </div>
    </div>
  );
}
