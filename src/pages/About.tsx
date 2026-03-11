import { motion, useScroll, useTransform } from "framer-motion";
import type { ElementType } from "react";
import { useRef } from "react";
import { ArrowRight, Github, Globe, HelpCircle, TrendingDown, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

function StatCard({
  icon: Icon,
  value,
  label,
  index,
}: {
  icon: ElementType;
  value: string;
  label: string;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 transition-colors group-hover:bg-primary/10" />
      <Icon className="mb-3 h-5 w-5 text-primary" />
      <p className="text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}

export default function About() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <section ref={heroRef} className="relative flex min-h-[85vh] items-center justify-center px-4">
        <motion.div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <motion.div
            className="absolute h-[600px] w-[600px] rounded-full border border-border/30"
            style={{ top: "10%", left: "-10%" }}
            animate={{ scale: [1, 1.05, 1], rotate: [0, 3, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute h-[400px] w-[400px] rounded-full border border-border/20"
            style={{ bottom: "5%", right: "-5%" }}
            animate={{ scale: [1, 1.08, 1], rotate: [0, -5, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute h-[200px] w-[200px] rounded-full bg-primary/3"
            style={{ top: "30%", right: "20%" }}
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative mx-auto max-w-3xl space-y-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
              Open-Source Population Simulator
            </p>
            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-7xl">
              What happens
              <br />
              <span className="text-muted-foreground">when we shrink?</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            Fertility is falling. Populations are ageing. The future is uncertain, but it is not unimaginable. Explore
            the numbers yourself.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button asChild size="lg" className="gap-2 text-base">
              <Link to="/en">
                Start simulating
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 text-base">
              <a href="https://github.com/jasoncnyu/future-population" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                View on GitHub
              </a>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex h-8 w-5 justify-center rounded-full border-2 border-muted-foreground/30 pt-1">
            <div className="h-2 w-1 rounded-full bg-muted-foreground/50" />
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="grid grid-cols-1 gap-6 sm:grid-cols-3"
        >
          <StatCard icon={TrendingDown} value="< 2.1" label="TFR in most OECD countries" index={0} />
          <StatCard icon={Users} value="61%" label="of world population in sub-replacement countries" index={1} />
          <StatCard icon={Globe} value="2086" label="projected peak of world population (UN medium)" index={2} />
        </motion.div>
      </section>

      <section className="mx-auto max-w-3xl space-y-24 px-4 py-16 lg:px-8">
        <motion.div
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="space-y-6"
        >
          <div className="h-px w-12 bg-primary" />
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
            The quiet transformation
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Many developed economies are facing sustained fertility below replacement and rapid ageing. This reshapes
            labor markets, housing demand, social security, and intergenerational balance. The effects are slow, but
            they are compounding, and by the time they become obvious, the demographic structure that produced them is
            already decades old.
          </p>
        </motion.div>

        <motion.div
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="space-y-6"
        >
          <div className="h-px w-12 bg-primary" />
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
            Will the trend bend?
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Will population keep falling forever, or will the trajectory change? Policy, migration, technology, and
            shifting cultural preferences could all alter the path. Pronatalist policies have shown mixed results:
            some countries have seen modest fertility rebounds, while others have seen almost no effect. The honest
            answer is that we do not know.
          </p>
        </motion.div>

        <motion.div
          custom={2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="space-y-6"
        >
          <div className="h-px w-12 bg-primary" />
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
            Dystopia or utopia?
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            A smaller population could mean less congestion and lower emissions, or it could mean shrinking
            communities and fiscal stress. Is a depopulating future dystopian or utopian? The answer is not
            predetermined. It depends on the choices societies make along the way. That is why it matters to think
            about these numbers now.
          </p>
        </motion.div>
      </section>

      <section className="px-4 py-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-border bg-card p-8 text-center md:p-12"
        >
          <HelpCircle className="mx-auto h-8 w-8 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Let&apos;s project the future together
          </h2>
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground">
            This simulator is open source. If you have ideas, data, or expertise, contribute. Demography is too
            important to leave to closed models and paywalled datasets.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link to="/en">
                Try the simulator
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <a href="https://github.com/jasoncnyu/future-population" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                Contribute on GitHub
              </a>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
