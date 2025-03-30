"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProjectLink {
  id: string;
  title: string;
  url: string;
  description: string | null;
  type: "design" | "staging" | "production" | "document";
}

export default function LinkCard({ link }: { link: ProjectLink }) {
  // Map type to color
  const typeColor =
    {
      design: "bg-purple-100 text-purple-800",
      staging: "bg-amber-100 text-amber-800",
      production: "bg-green-100 text-green-800",
      document: "bg-blue-100 text-blue-800",
    }[link.type] || "bg-gray-100 text-gray-800";

  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer">
      <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer pb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-6">
            <CardTitle className="text-base flex items-center gap-2">
              {link.title}
              <ExternalLink size={14} />
            </CardTitle>
            <Badge variant="outline" className={typeColor}>
              {link.type}
            </Badge>
          </div>
          {link.description && (
            <CardDescription className="line-clamp-2">
              {link.description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </a>
  );
}
