import Link from "next/link";
import { Button } from "@/components/ui";

export function Cta() {
  return (
    <section
      className="px-4 py-24 sm:px-6 lg:px-8"
      aria-labelledby="cta-heading"
    >
      <div
        className="mx-auto max-w-4xl rounded-2xl px-8 py-16 text-center sm:px-14 sm:py-20"
        style={{ backgroundColor: "#5858E2" }}
      >
        <h2
          id="cta-heading"
          className="font-display text-3xl font-bold tracking-tighter text-white sm:text-4xl"
        >
          Найди своего психолога
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/90">
          Открой каталог, задай фильтры и выбери специалиста по подходу, цене и уровню.
        </p>
        <div className="mt-10">
          <Link href="/catalog">
            <Button
              variant="accent"
              size="lg"
              className="!bg-[#A7FF5A] !text-foreground hover:!bg-[#8ee64a]"
            >
              Подобрать специалиста
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
