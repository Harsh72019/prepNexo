import { cn } from "@interview-battlefield/ui/lib/utils";

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={`${part}-${index}`} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

export function MarkdownContent({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");

  return (
    <div className={cn("space-y-2 text-sm leading-6", className)}>
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={`blank-${index}`} className="h-1" />;

        if (trimmed.startsWith("### ")) {
          return <h3 key={`${trimmed}-${index}`} className="pt-2 text-base font-semibold"><InlineText text={trimmed.slice(4)} /></h3>;
        }

        if (trimmed.startsWith("## ")) {
          return <h2 key={`${trimmed}-${index}`} className="pt-2 text-lg font-semibold"><InlineText text={trimmed.slice(3)} /></h2>;
        }

        if (trimmed.startsWith("# ")) {
          return <h2 key={`${trimmed}-${index}`} className="pt-2 text-lg font-semibold"><InlineText text={trimmed.slice(2)} /></h2>;
        }

        if (/^[-*]\s+/.test(trimmed)) {
          return (
            <div key={`${trimmed}-${index}`} className="grid grid-cols-[14px_1fr] gap-2">
              <span className="mt-[0.62rem] size-1.5 rounded-full bg-primary" />
              <p><InlineText text={trimmed.replace(/^[-*]\s+/, "")} /></p>
            </div>
          );
        }

        if (/^\d+\.\s+/.test(trimmed)) {
          const marker = trimmed.match(/^\d+\./)?.[0] ?? "";
          return (
            <div key={`${trimmed}-${index}`} className="grid grid-cols-[28px_1fr] gap-2">
              <span className="text-muted-foreground">{marker}</span>
              <p><InlineText text={trimmed.replace(/^\d+\.\s+/, "")} /></p>
            </div>
          );
        }

        return <p key={`${trimmed}-${index}`}><InlineText text={trimmed} /></p>;
      })}
    </div>
  );
}
