/**
 * Renders a JSON-LD script block. `JSON.stringify` is safe for the values, and `<` is
 * escaped to `\u003c` to prevent script-tag breakout from user-controlled strings.
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
