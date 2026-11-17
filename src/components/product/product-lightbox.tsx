"use client";

import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

/**
 * Xem ảnh sản phẩm toàn màn hình (yet-another-react-lightbox):
 * - Phóng to / thu nhỏ: con lăn chuột, nhấp đúp, nút +/−, chụm 2 ngón trên điện thoại; kéo để di chuyển khi đang phóng to.
 * - Chuyển ảnh: mũi tên, phím ← →, vuốt, hoặc bấm ảnh nhỏ bên dưới. Esc / nút × để đóng.
 * File này chỉ được tải khi người dùng mở ảnh lần đầu (xem product-gallery.tsx).
 */
export default function ProductLightbox({
  images,
  name,
  open,
  index,
  onClose,
  onIndexChange,
}: {
  images: string[];
  name: string;
  open: boolean;
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const multiple = images.length > 1;

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      on={{ view: ({ index: i }) => onIndexChange(i) }}
      slides={images.map((src, i) => ({ src, alt: i === 0 ? name : `${name} — ảnh ${i + 1}` }))}
      plugins={multiple ? [Zoom, Thumbnails, Counter] : [Zoom]}
      // Một ảnh: ẩn nút chuyển ảnh, không cho vuốt vòng
      carousel={{ finite: !multiple, padding: "16px", spacing: "10%", imageFit: "contain" }}
      render={multiple ? undefined : { buttonPrev: () => null, buttonNext: () => null }}
      zoom={{ maxZoomPixelRatio: 3, zoomInMultiplier: 2, doubleClickMaxStops: 2, scrollToZoom: true }}
      thumbnails={{ position: "bottom", width: 72, height: 90, border: 0, borderRadius: 6, padding: 0, gap: 10, imageFit: "cover", vignette: false, showToggle: false }}
      counter={{ container: { style: { top: 0, bottom: "unset" } } }}
      animation={{ fade: 250, swipe: 300, zoom: 250 }}
      controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
      labels={{
        Previous: "Ảnh trước",
        Next: "Ảnh sau",
        Close: "Đóng",
        "Zoom in": "Phóng to",
        "Zoom out": "Thu nhỏ",
        Lightbox: `Ảnh sản phẩm ${name}`,
        Carousel: "Bộ ảnh",
        Slide: "Ảnh",
        "Photo gallery": "Ảnh sản phẩm",
        "{index} of {total}": "Ảnh {index} / {total}",
        "Show thumbnails": "Hiện ảnh nhỏ",
        "Hide thumbnails": "Ẩn ảnh nhỏ",
      }}
      styles={{
        container: { backgroundColor: "rgba(20, 18, 16, 0.96)" },
        thumbnailsContainer: { backgroundColor: "rgba(20, 18, 16, 0.96)" },
        thumbnail: { backgroundColor: "#2a2723" },
      }}
    />
  );
}
