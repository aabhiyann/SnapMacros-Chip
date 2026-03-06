"use client";

import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className, children }: SkeletonProps) {
  const baseClass = "skeleton min-h-[1rem]";
  if (children != null) {
    return <div className={cn(baseClass, className)}>{children}</div>;
  }
  return <div className={cn(baseClass, className)} aria-hidden />;
}
