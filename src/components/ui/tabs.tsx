"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export type TabItem = { value: string; label: React.ReactNode; content: React.ReactNode };

/**
 * Tabs (Radix). Nội dung được render sẵn ở server và luôn có trong HTML (forceMount) — tốt cho SEO.
 */
export function Tabs({ items, className, ariaLabel }: { items: TabItem[]; className?: string; ariaLabel?: string }) {
  return (
    <TabsPrimitive.Root defaultValue={items[0]?.value} className={className}>
      <TabsPrimitive.List aria-label={ariaLabel} className="scrollbar-none flex gap-10 overflow-x-auto border-b border-line">
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            className="-mb-px shrink-0 cursor-pointer border-b border-transparent pb-4 font-serif text-lg text-muted outline-none transition-colors hover:text-ink data-[state=active]:border-ink data-[state=active]:text-ink"
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content key={item.value} value={item.value} forceMount className={cn("pt-8 outline-none data-[state=inactive]:hidden")}>
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
