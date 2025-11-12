"use client";
import React from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  eventLabel: string;
  location: string;
};

export default function CtaLink({ href, children, className, eventLabel, location }: Props) {
  return (
    <Link
      href={href}
      onClick={() => track("cta_click", { location, label: eventLabel, href })}
      className={className}
    >
      {children}
    </Link>
  );
}
