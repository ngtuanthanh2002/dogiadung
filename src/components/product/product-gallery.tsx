"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row md:gap-4">
      {images.length > 1 && (
        <ul className="flex gap-3 md:w-20 md:flex-col" aria-label="Chọn ảnh sản phẩm">
          {images.map((src, i) => (
            <li key={src} className="w-16 md:w-full">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Xem ảnh ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "relative block aspect-[4/5] w-full overflow-hidden bg-sand transition-all duration-300",
                  i === active ? "opacity-100 ring-1 ring-ink ring-offset-2 ring-offset-ivory" : "opacity-60 hover:opacity-100",
                )}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative aspect-[4/5] flex-1 overflow-hidden bg-sand">
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === 0 ? name : `${name} — ảnh ${i + 1}`}
            fill
            sizes="(min-width: 1024px) 620px, 100vw"
            preload={i === 0}
            loading={i === 0 ? "eager" : "lazy"}
            className={cn("object-cover transition-opacity duration-500", i === active ? "opacity-100" : "pointer-events-none opacity-0")}
          />
        ))}
      </div>
    </div>
  );
}
