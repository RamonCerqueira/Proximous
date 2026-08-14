"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props} />
  );
}

function TabsList({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-[#0D0A1C]/90 text-[#AAA5BA] inline-flex h-12 w-full max-w-2xl items-center justify-between rounded-full p-1 border border-[#30204D] backdrop-blur-xl shadow-inner",
        className
      )}
      {...props} />
  );
}

function TabsTrigger({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-black whitespace-nowrap transition-all duration-300 text-[#AAA5BA] hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9B20F0] data-[state=active]:to-[#D414A8] data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(212,20,168,0.5)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props} />
  );
}

function TabsContent({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none mt-4", className)}
      {...props} />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
