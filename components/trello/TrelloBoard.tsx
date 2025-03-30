"use client";

import { useEffect, useRef } from "react";

interface TrelloBoardProps {
  url: string;
  className?: string;
}

export default function TrelloBoard({ url, className = "" }: TrelloBoardProps) {
  const containerRef = useRef<HTMLQuoteElement>(null);

  useEffect(() => {
    // Load Trello script
    const script = document.createElement("script");
    script.src = "https://p.trellocdn.com/embed.min.js";
    script.async = true;
    document.body.appendChild(script);

    // Clean up script on unmount
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <blockquote
      className={`trello-board-compact ${className}`.trim()}
      ref={containerRef}>
      <a href={url}>Trello Board</a>
    </blockquote>
  );
}
