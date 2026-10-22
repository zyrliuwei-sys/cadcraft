/**
 * FAQ list for MDX blog posts. Fed from the post's `meta.faq`, the same
 * pairs the route emits as FAQPage JSON-LD, so visible text and schema match.
 */
export function PostFaq({ items }: { items: [string, string][] }) {
  return (
    <div className="mt-4 space-y-5">
      {items.map(([question, answer]) => (
        <div key={question}>
          <h3 className="text-foreground text-base font-semibold tracking-tight">
            {question}
          </h3>
          <p className="text-foreground/90 mt-1.5 leading-7">{answer}</p>
        </div>
      ))}
    </div>
  );
}
