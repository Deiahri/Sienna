"use client";

import { useEffect, useRef, useState } from "react";

import "./ImageZoom.css";

/**
 * Click a picture in a write-up to see it full size. Ported from Junda's site (Kleos K6), where it
 * came from Brundain Part 6d. Kept close to that copy so a fix there is easy to bring over.
 *
 * It sits beside the article, never around it: the renderer stays a server component (see
 * Article.tsx), and this ships a few hundred bytes, none of the parser. It listens to the article
 * just before it, so a page with several articles opens one picture at a time. A cropped picture
 * opens whole: the crop is only how the essay frames it.
 *
 * A native <dialog>: Escape closes it and focus stays inside while it's open. A click on the
 * backdrop or × closes it too. Pins and "Hide pins" keep their own clicks.
 */
export function ImageZoom() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<{ src: string; alt: string; caption: string } | null>(null);

  useEffect(() => {
    const article = dialog.current?.previousElementSibling;
    if (!(article instanceof HTMLElement)) return;
    const images = [...article.querySelectorAll<HTMLImageElement>(".md-image img")];
    for (const img of images) {
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", `Enlarge picture${img.alt ? `: ${img.alt}` : ""}`);
    }
    const show = (img: HTMLImageElement) => {
      const caption = img.closest("figure")?.querySelector("figcaption")?.textContent ?? "";
      setOpen({ src: img.currentSrc || img.src, alt: img.alt, caption });
    };
    const target = (event: Event) => {
      const el = event.target as Element | null;
      if (!el || el.closest(".md-pin, .md-image__toggle")) return null;
      return el.matches(".md-image img") ? (el as HTMLImageElement) : null;
    };
    const onClick = (event: MouseEvent) => {
      const img = target(event);
      if (img) show(img);
    };
    const onKey = (event: KeyboardEvent) => {
      const img = target(event);
      if (img && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        show(img);
      }
    };
    article.addEventListener("click", onClick);
    article.addEventListener("keydown", onKey);
    return () => {
      article.removeEventListener("click", onClick);
      article.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className="image-zoom"
      aria-label={open?.alt ? `Picture: ${open.alt}` : "Picture"}
      onClose={() => setOpen(null)}
      onClick={(event) => {
        // The dialog itself is the backdrop: the picture and the button are inside it.
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
      data-probe="image-zoom"
    >
      {open && (
        <figure className="image-zoom__figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={open.src} alt={open.alt} className="image-zoom__image" />
          {open.caption && <figcaption className="image-zoom__caption">{open.caption}</figcaption>}
        </figure>
      )}
      <button type="button" className="image-zoom__close" onClick={() => dialog.current?.close()} aria-label="Close">
        ×
      </button>
    </dialog>
  );
}
