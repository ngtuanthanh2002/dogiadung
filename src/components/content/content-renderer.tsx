import type { ContentBlock } from "@/data/types";

/** Render nội dung chính sách từ dữ liệu có cấu trúc. */
export function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="prose-content">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return <h2 key={i}>{block.text}</h2>;
          case "h3":
            return <h3 key={i}>{block.text}</h3>;
          case "p":
            return <p key={i}>{block.text}</p>;
          case "ul":
            return (
              <ul key={i}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            );
          case "note":
            return (
              <p key={i} className="my-8! border-l border-ink bg-sand/60 py-4 pl-5 pr-4 text-[15px] text-ink-soft">
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
}
