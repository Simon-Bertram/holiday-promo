"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type CollapsibleSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible onOpenChange={setIsOpen} open={isOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left">
        <h2 className="font-semibold text-2xl">{title}</h2>
        <ChevronDown
          className={cn(
            "size-5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
