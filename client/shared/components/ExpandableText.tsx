"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";

interface ExpandableTextProps {
  text?: string;
  lines?: number;
  className?: string;
  textClassName?: string;
  buttonClassName?: string;
  seeMoreLabel?: string;
  seeLessLabel?: string;
  stopPropagation?: boolean;
}

export default function ExpandableText({
  text = "",
  lines = 2,
  className = "",
  textClassName = "",
  buttonClassName = "",
  seeMoreLabel = "See more",
  seeLessLabel = "See less",
  stopPropagation = true,
}: ExpandableTextProps) {
  const content = text?.trim();
  const [expanded, setExpanded] = useState(false);
  const [isOverflowed, setIsOverflowed] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return;

    const checkOverflow = () => {
      setIsOverflowed(el.scrollHeight > el.clientHeight + 1);
    };

    checkOverflow();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);

    return () => observer.disconnect();
  }, [text, lines, expanded]);

  if (!content) return null;

  const clampStyle: CSSProperties | undefined = !expanded
    ? { WebkitLineClamp: lines }
    : undefined;

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
      event.preventDefault();
    }
    setExpanded((prev) => !prev);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <p
        ref={textRef}
        className={`${textClassName} ${expanded ? "" : "clamped-text"}`}
        style={clampStyle}
      >
        {content}
      </p>
      {isOverflowed && (
        <button
          type="button"
          onClick={handleToggle}
          className={`text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors ${buttonClassName}`}
        >
          {expanded ? seeLessLabel : seeMoreLabel}
        </button>
      )}
    </div>
  );
}
