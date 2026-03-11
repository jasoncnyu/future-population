import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="space-y-2 border-t border-border px-4 py-8 text-center text-sm text-muted-foreground">
      <p>Built with curiosity. Data from the World Bank.</p>
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
      </p>
    </footer>
  );
}
