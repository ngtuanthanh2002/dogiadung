"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Expand } from "lucide-react";
import { cn } from "@/lib/utils";

// Thư viện xem ảnh chỉ tải khi người dùng bấm vào ảnh lần đầu → trang sản phẩm vẫn nhẹ
const ProductLightbox = dynamic(() => import("./product-lightbox"), { ssr: false });

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  // Giữ lightbox đã mount sau lần mở đầu để hiệu ứng đóng mượt và mở lại tức thì
  const [mounted, setMounted] = useState(false);

  const openViewer = () => {
    setMounted(true);
    setOpen(true);
  };

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
                  "relative block aspect-[4/5] w-full cursor-pointer overflow-hidden bg-sand transition-all duration-300",
                  i === active ? "opacity-100 ring-1 ring-ink ring-offset-2 ring-offset-ivory" : "opacity-60 hover:opacity-100",
                )}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={openViewer}
        aria-label={`Phóng to ảnh ${active + 1} của ${name}`}
        className="group relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden bg-sand focus-visible:outline-offset-2"
      >
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === 0 ? name : `${name} — ảnh ${i + 1}`}
            fill
            sizes="(min-width: 1024px) 620px, 100vw"
            preload={i === 0}
            loading={i === 0 ? "eager" : "lazy"}
            className={cn(
              "object-cover transition-[opacity,transform] duration-500 group-hover:scale-[1.02]",
              i === active ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          />
        ))}
        <span
          className="pointer-events-none absolute bottom-4 right-4 flex h-10 items-center gap-2 rounded-full bg-ivory/90 px-3.5 text-[13px] text-ink shadow-sm backdrop-blur-sm transition-all duration-300 md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100"
          aria-hidden
        >
          <Expand className="h-4 w-4" strokeWidth={1.8} />
          Phóng to
        </span>
      </button>

      {mounted && (
        <ProductLightbox
          images={images}
          name={name}
          open={open}
          index={active}
          onClose={() => setOpen(false)}
          onIndexChange={setActive}
        />
      )}
    </div>
  );
}
