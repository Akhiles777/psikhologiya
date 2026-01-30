import Link from "next/link";
import { Button } from "@/components/ui";

export function Hero() {
  return (
    <header
      className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
      aria-labelledby="hero-heading"
    >
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute right-1/3 top-1/2 h-40 w-40 rounded-2xl border border-primary/20 bg-primary/5" />
      <div className="absolute left-1/4 top-1/3 h-24 w-24 rounded-full bg-accent/20" />
      <div className="relative mx-auto max-w-4xl text-center">
        <h1
          id="hero-heading"
          className="font-display text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl lg:text-7xl leading-tight"
        >
          Находим &quot;своего&quot; психолога вместе.
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-neutral-dark sm:text-xl">
          Профессиональный реестр специалистов с прозрачной системой сертификации и честным подходом к терапии.
        </p>
        <div className="mt-12">
          <Link href="/psy-list">
            <Button variant="primary" size="lg">
              Подобрать специалиста
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
