"use client";

import { MediaType } from "@/types/media";
import { LucideIcon, SquareLibrary } from "lucide-react";

interface StatsPanelProps {
  totalDisplayed: number;
  countThisYear: number;
  countBySpecificType: Record<string, number>;
  allowedMediaTypes: MediaType[];
  mediaTypeIcons: Partial<Record<MediaType, LucideIcon>>;
  statsTitle: string;
}

export default function StatsPanel({
  totalDisplayed,
  countThisYear,
  countBySpecificType,
  allowedMediaTypes,
  mediaTypeIcons,
  statsTitle,
}: StatsPanelProps) {
  return (
    <div className="absolute top-0 -left-1/4 w-1/4 h-auto bg-powder/80 backdrop-blur-sm text-zinc-400 text-sm rounded-lg shadow-lg p-6 z-30 hidden lg:block max-h-[calc(100vh-100px)] overflow-y-auto">
      <p className="font-medium text-zinc-200 text-lg mb-3">{statsTitle}</p>
      <div className="grid grid-cols-1 gap-4 text-center">
        {/* Display total count */}
        <div>
          Total:{" "}
          <span className="text-zinc-100 font-semibold block text-xl">
            {totalDisplayed}
          </span>
        </div>
        {/* Display count for current year */}
        <div>
          This Year:{" "}
          <span className="text-zinc-100 font-semibold block text-xl">
            {countThisYear}
          </span>
        </div>
        {/* Display count for each allowed media type */}
        {allowedMediaTypes.map((type) => {
          const IconComponent = mediaTypeIcons[type] || SquareLibrary;
          return (
            <div
              key={type}
              className="flex flex-col items-center gap-1 hover:text-sky-400 transition-colors"
            >
              <IconComponent className="w-6 h-6" />
              <span className="capitalize text-xs">
                {type.replace(/_/g, " ")}
              </span>
              <span className="text-zinc-100 font-semibold text-lg">
                {countBySpecificType[type] || 0}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
