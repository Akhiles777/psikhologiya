"use client";

import { motion } from "framer-motion";

const steps = [
  { num: "1", title: "Выберите фильтры", sub: "Парадигма, цена, город, уровень" },
  { num: "2", title: "Смотрите карточки", sub: "Фото, био, образование" },
  { num: "3", title: "Свяжитесь со специалистом", sub: "Контакты в анкете" },
];

export function HowItWorks() {
  return (
    <section
      className="border-y border-neutral-light/60 bg-background-subtle px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="how-heading"
          className="font-display text-3xl font-bold tracking-tighter text-foreground sm:text-4xl text-center"
        >
          Как это работает
        </h2>
        <div className="mt-16 flex flex-col gap-8 sm:flex-row sm:justify-center sm:gap-12">
          {steps.map((item, i) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-6"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent font-display text-2xl font-bold text-foreground">
                {item.num}
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1 leading-relaxed text-neutral-dark">{item.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
