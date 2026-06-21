import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const hexToRgb = (hex) => {
  const validHex = /^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(hex);
  if (!validHex) return null;

  let cleanHex = hex.replace("#", "");

  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `${r}, ${g}, ${b}`;
};

export function ImageSplit({
  src,
  sections = 9,
  offsetStep = 30,
  initialBorderOpacity = 0.4,
  enableBorder = true,
  borderColor = "#ffffff",
  viewportThreshold = 0.3,
  className,
  ...props
}) {
  const [imagePieces, setImagePieces] = useState([]);

  // Progress is now strictly a Ref to prevent costly re-renders on every scroll
  const isCompleteRef = useRef(false);
  const canvasRef = useRef(null);
  const parentRef = useRef(null);
  const imgRefs = useRef([]);
  const scrollContainerRef = useRef(null);
  const animationFrameRef = useRef(0);
  const progressRef = useRef(0);

  const borderRgb = hexToRgb(borderColor) || "255, 255, 255";

  useEffect(() => {
    const image = new Image();
    image.src = src;
    image.onload = () => cutImageUp(image);
  }, [src, sections]);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;

    scrollContainerRef.current = getScrollParent(parent);
    setupScrollListener();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const getScrollParent = (element) => {
    while (element) {
      const style = getComputedStyle(element);
      if (["auto", "scroll"].includes(style.overflowY)) return element;
      if (!element.parentElement) return null;
      element = element.parentElement;
    }
    return null;
  };

  const setupScrollListener = () => {
    const scrollContainer = scrollContainerRef.current;
    const parent = parentRef.current;
    if (!parent) return;

    const updateProgress = () => {
      if (isCompleteRef.current) return;

      const parentRect = parent.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      let calculatedProgress;

      if (scrollContainer instanceof HTMLElement) {
        const scrollContainerRect = scrollContainer.getBoundingClientRect();
        const start = scrollContainerRect.bottom;
        const end = scrollContainerRect.top + viewportHeight * viewportThreshold;
        const current = parentRect.top;
        calculatedProgress = (current - end) / (start - end);
      } else {
        const startTrigger = viewportHeight;
        const endTrigger = viewportHeight * viewportThreshold;
        const current = parentRect.top;
        calculatedProgress = (current - endTrigger) / (startTrigger - endTrigger);
      }

      const nextProgress = 1 - Math.min(1, Math.max(0, calculatedProgress));

      progressRef.current = Math.max(progressRef.current, nextProgress);
      const progress = progressRef.current;

      // When animation is complete, snap to final positions
      if (progress >= 1) {
        isCompleteRef.current = true;

        imgRefs.current.forEach((img, index) => {
          if (!img) return;
          img.style.transform = "translateY(0px)";

          if (enableBorder && index !== imagePieces.length - 1) {
            img.style.borderRight = `1px solid rgba(${borderRgb}, ${initialBorderOpacity})`;
          }
        });
        return;
      }

      // High-performance direct DOM manipulation (No state changes)
      const currentBorderOpacity = progress * initialBorderOpacity;

      imgRefs.current.forEach((img, index) => {
        if (!img) return;

        const offset = getOffset(index);
        const currentOffset = offset * (1 - progress);

        img.style.transform = `translateY(${currentOffset}px)`;

        if (enableBorder && index !== imagePieces.length - 1) {
          img.style.borderRight = `1px solid rgba(${borderRgb}, ${currentBorderOpacity})`;
        }
      });
    };

    const handleScroll = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    const target = scrollContainer || window;
    target.addEventListener("scroll", handleScroll, { passive: true });

    // Fire once immediately to set initial positions
    handleScroll();

    return () => target.removeEventListener("scroll", handleScroll);
  };

  const cutImageUp = (image) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pieceWidth = Math.floor(image.width / sections);
    const pieceHeight = image.height;
    const context = canvas.getContext("2d");
    if (!context) return;

    const newImagePieces = [];
    for (let i = 0; i < sections; i++) {
      canvas.width = pieceWidth;
      canvas.height = pieceHeight;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        i * pieceWidth,
        0,
        pieceWidth,
        pieceHeight,
        0,
        0,
        pieceWidth,
        pieceHeight
      );
      newImagePieces.push(canvas.toDataURL());
    }
    setImagePieces(newImagePieces);
  };

  const getOffset = (index) => {
    if (index === 0 || index === sections - 1) return 0;
    return Math.min(index, sections - 1 - index) * offsetStep;
  };

  return (
    <div
      ref={parentRef}
      className={cn("relative flex w-full rounded-[inherit]", className)}
      {...props}
    >
      <canvas ref={canvasRef} className="hidden" />
      {imagePieces.map((piece, index) => (
        <img
          key={index}
          src={piece}
          alt={`section-${index}`}
          ref={(el) => {
            imgRefs.current[index] = el;
          }}
          className={cn(
            "object-contain transition-transform duration-300 ease-out",
            {
              "rounded-l-[inherit]": index === 0,
              "rounded-r-[inherit]": index === imagePieces.length - 1,
            }
          )}
          style={{
            width: `${100 / sections}%`,
            zIndex: sections - index,
            marginRight: enableBorder && index !== imagePieces.length - 1 ? "-1px" : "0",
            boxSizing: "border-box",
            // Note: Transform and borderRight are purposefully omitted here 
            // because they are handled dynamically via Refs for better performance.
          }}
        />
      ))}
    </div>
  );
}