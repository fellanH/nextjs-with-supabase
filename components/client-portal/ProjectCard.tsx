// components/client-portal/ProjectCard.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: "planning" | "in-progress" | "completed";
}

export default function ProjectCard({ project }: { project: Project }) {
  // Format dates with explicit locale and format options to prevent hydration mismatches
  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const startDate = new Date(project.start_date).toLocaleDateString(
    "en-US",
    dateFormatOptions
  );
  const endDate = project.end_date
    ? new Date(project.end_date).toLocaleDateString("en-US", dateFormatOptions)
    : "Ongoing";

  // Map status to color
  const statusColor =
    {
      planning: "bg-amber-100 text-amber-800",
      "in-progress": "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
    }[project.status] || "bg-gray-100 text-gray-800";

  return (
    <Link href={`/client-portal/projects/${project.id}`}>
      <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <Badge variant="outline" className={statusColor}>
              {project.status}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {project.description || "No description provided"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm pb-2">
          <div className="grid grid-cols-2 gap-1">
            <div className="text-muted-foreground">Start:</div>
            <div>{startDate}</div>
            <div className="text-muted-foreground">End:</div>
            <div>{endDate}</div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <span className="text-xs text-primary">View project details →</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
