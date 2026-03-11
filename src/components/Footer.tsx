import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="space-y-2 border-t border-border px-4 py-8 text-center text-sm text-muted-foreground">
      <p>Built with curiosity. Baseline country data from the U.S. Census Bureau IDB API.</p>
      <p>
        Open-source under MIT License ·{" "}
        <a
          href="https://github.com/jasoncnyu/future-population"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-foreground transition-colors hover:text-primary"
        >
          <Github className="h-3.5 w-3.5" />
          GitHub
        </a>
        {" · "}
        <a
          href="https://leanvibe.io/vibe/future-population-simulator-mmmbonpo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-foreground transition-colors hover:text-primary"
        >
          <img
            src="https://leanvibe.io/favicon-32x32.png"
            alt=""
            className="h-3.5 w-3.5 rounded-sm"
          />
          Listed on LeanVibe
        </a>
      </p>
    </footer>
  );
}
