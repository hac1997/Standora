"use client";

import dynamic from "next/dynamic";

interface StandData {
  id: string;
  name: string;
  shape: "rect" | "polygon";
  x: number;
  y: number;
  width: number;
  height: number;
  points: number[];
  colorHex: string;
  basePrice: number;
  status: string;
  photoUrl?: string;
}

interface MapEditorProps {
  eventId: string;
  initialStands?: StandData[];
  readonly?: boolean;
  onStandSelect?: (stand: StandData) => void;
}

// Load the entire Konva canvas as a single dynamic import (ssr: false).
// Konva components must be real instances — individually dynamic-wrapping each
// one breaks Stage's internal instanceof checks for Layer children.
const MapEditorCanvas = dynamic(
  () => import("./MapEditorCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Carregando editor de mapa…
      </div>
    ),
  }
);

export default function MapEditor(props: MapEditorProps) {
  return <MapEditorCanvas {...props} />;
}
