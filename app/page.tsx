import Link from "next/link";

export default function HomePage() {
  return (
    <div className="p-4">
      <section className="rounded-xl bg-card border border-elevated p-6 mb-4">
        <h2 className="font-heading text-xl font-bold text-text mb-2">Welcome back</h2>
        <p className="text-text-secondary text-sm">
          Snap a photo of your meal to get an instant macro breakdown. Chip is here to keep you company.
        </p>
        <Link
          href="/log"
          className="touch-target mt-4 inline-flex items-center justify-center min-h-[48px] px-6 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          Log a meal
        </Link>
      </section>
      <section className="rounded-xl bg-card border border-elevated p-6">
        <h2 className="font-heading text-lg font-bold text-text mb-2">Quick links</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/meals" className="text-primary hover:underline">
              View meal history
            </Link>
          </li>
          <li>
            <Link href="/roast" className="text-primary hover:underline">
              This week&apos;s roast
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
