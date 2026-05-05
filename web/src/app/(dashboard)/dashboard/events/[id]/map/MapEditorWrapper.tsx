"use client";

import dynamic from "next/dynamic";

const MapEditor = dynamic(() => import("@/components/map/MapEditor"), { ssr: false });

export function MapEditorWrapper({ eventId }: { eventId: string }) {
  return <MapEditor eventId={eventId} />;
}
