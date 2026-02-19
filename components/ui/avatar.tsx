"use client";

import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/utils";

export function Avatar({
  src,
  alt,
  fallback,
  className,
}: {
  src?: string | null;
  alt: string;
  fallback: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative inline-flex h-8 w-8 shrink-0 overflow-hidden rounded-full border bg-muted",
        className,
      )}
      aria-label={alt}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes="32px" className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-semibold">
          {fallback}
        </div>
      )}
    </div>
  );
}

