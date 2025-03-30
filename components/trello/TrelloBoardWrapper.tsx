"use client";

import dynamic from "next/dynamic";

// Dynamic import with { ssr: false } to prevent server-side rendering
const TrelloBoard = dynamic(() => import("./TrelloBoard"), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full animate-pulse bg-secondary/30 rounded-md" />
  ),
});

interface TrelloBoardWrapperProps {
  url: string;
  className?: string;
}

export default function TrelloBoardWrapper({
  url,
  className,
}: TrelloBoardWrapperProps) {
  return <TrelloBoard url={url} className={className} />;
}
