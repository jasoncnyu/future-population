import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Github } from "lucide-react";

import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Section({
  title,
  children,
  index,
}: {
  title: string;
  children: ReactNode;
  index: number;
}) {
  return (
    <motion.section
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      <div className="space-y-3 leading-relaxed text-muted-foreground">{children}</div>
    </motion.section>
  );
}

function FormulaBlock({ children }: { children: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-muted/50 px-5 py-4 font-mono text-sm text-foreground">
      {children}
    </div>
  );
}

export default function Theory() {
  const { locale } = useLocale();
  const sections = [
    {
      title: t(locale, "theory.model.title"),
      body: [t(locale, "theory.model.p1"), t(locale, "theory.model.p2"), t(locale, "theory.model.p3")],
      formula: t(locale, "theory.model.formula"),
    },
    {
      title: t(locale, "theory.mortality.title"),
      body: [t(locale, "theory.mortality.p1"), t(locale, "theory.mortality.p2"), t(locale, "theory.mortality.p3")],
      formula: t(locale, "theory.mortality.formula"),
    },
    {
      title: t(locale, "theory.fertility.title"),
      body: [t(locale, "theory.fertility.p1"), t(locale, "theory.fertility.p2"), t(locale, "theory.fertility.p3")],
      formula: t(locale, "theory.fertility.formula"),
    },
    {
      title: t(locale, "theory.ageStructure.title"),
      body: [t(locale, "theory.ageStructure.p1"), t(locale, "theory.ageStructure.p2")],
    },
    {
      title: t(locale, "theory.data.title"),
      body: [t(locale, "theory.data.p1"), t(locale, "theory.data.p2"), t(locale, "theory.data.p3")],
    },
    {
      title: t(locale, "theory.limitations.title"),
      body: [t(locale, "theory.limitations.p1"), t(locale, "theory.limitations.p2")],
    },
  ];

  const readingKeys = [
    "theory.reading.1",
    "theory.reading.2",
    "theory.reading.3",
    "theory.reading.4",
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl space-y-16 px-4 py-12 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
            {t(locale, "theory.hero.title")}
            <br />
            <span className="text-2xl font-medium text-muted-foreground md:text-3xl">{t(locale, "theory.hero.subtitle")}</span>
          </h1>
          <div className="h-1 w-16 rounded-full bg-primary" />
        </motion.div>

        {sections.map((section, index) => (
          <Section key={section.title} title={section.title} index={index + 1}>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.title === t(locale, "theory.limitations.title") ? (
              <p>
                {t(locale, "theory.limitations.p3")}{" "}
                <a
                  href="https://github.com/jasoncnyu/future-population"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                >
                  <Github className="h-4 w-4" />
                  {t(locale, "theory.limitations.github")}
                </a>
                .
              </p>
            ) : null}
            {section.formula ? <FormulaBlock>{section.formula}</FormulaBlock> : null}
          </Section>
        ))}

        <motion.section
          custom={sections.length + 1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="space-y-3 border-t border-border pt-8"
        >
          <h2 className="text-lg font-semibold text-foreground">{t(locale, "theory.reading.title")}</h2>
          <ul className="list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
            {readingKeys.map((key) => (
              <li key={key}>{t(locale, key)}</li>
            ))}
          </ul>
        </motion.section>
      </div>
    </div>
  );
}
