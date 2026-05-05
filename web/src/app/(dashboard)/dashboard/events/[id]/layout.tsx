import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { EventSidebar } from "./EventSidebar";

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let event: { id: string; name: string; slug: string; status: string; type: string } | null = null;
  try {
    event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true, status: true, type: true },
    });
  } catch {
    event = null;
  }

  if (!event) notFound();

  return (
    <>
      {/* Hide parent sidebar and remove margin via style override */}
      <style>{`
        aside[class*="fixed"] { display: none !important; }
        main[class*="ml-"] { margin-left: 0 !important; }
        main > div { max-width: none !important; padding: 0 !important; }
      `}</style>

      <div className="flex min-h-screen bg-[#f5f6fa]">
        {/* Event lifecycle sidebar — takes over the full left side */}
        <div className="w-[240px] shrink-0 fixed inset-y-0 left-0 z-40">
          <EventSidebar event={event} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 ml-[240px]">
          <div className="max-w-[900px] mx-auto px-8 py-7">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
