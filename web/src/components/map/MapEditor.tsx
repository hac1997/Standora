"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";

// Types
interface StandData {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  colorHex: string;
  basePrice: number;
  status: "disponivel" | "reservado" | "ocupado";
}

const STATUS_COLORS: Record<string, string> = {
  disponivel: "#22c55e",
  reservado: "#f59e0b",
  ocupado: "#64748b",
};

const GRID_SIZE = 20;

function snap(value: number) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

// Lazy-load Konva components (SSR-unsafe)
const Stage = dynamic(() => import("react-konva").then((m) => m.Stage), { ssr: false });
const Layer = dynamic(() => import("react-konva").then((m) => m.Layer), { ssr: false });
const Rect = dynamic(() => import("react-konva").then((m) => m.Rect), { ssr: false });
const Text = dynamic(() => import("react-konva").then((m) => m.Text), { ssr: false });
const Line = dynamic(() => import("react-konva").then((m) => m.Line), { ssr: false });
const Transformer = dynamic(() => import("react-konva").then((m) => m.Transformer), { ssr: false });

interface MapEditorProps {
  eventId: string;
  initialStands?: StandData[];
  readonly?: boolean;
  onStandSelect?: (stand: StandData) => void;
}

export default function MapEditor({ eventId, initialStands = [], readonly = false, onStandSelect }: MapEditorProps) {
  const [stands, setStands] = useState<StandData[]>(initialStands);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<"select" | "add">("select");
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 560 });
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<{ nodes: (nodes: unknown[]) => void } | null>(null);
  const stageRef = useRef<{ findOne: (selector: string) => unknown } | null>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: Math.max(560, window.innerHeight - 300),
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    fetch(`/api/events/${eventId}/map`)
      .then((r) => r.json())
      .then((data) => {
        if (data.map?.canvasJson) {
          try {
            const parsed = JSON.parse(data.map.canvasJson);
            if (parsed.stands) setStands(parsed.stands);
          } catch {}
        }
      });
  }, [eventId]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    await fetch(`/api/events/${eventId}/map`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        canvasJson: JSON.stringify({ stands }),
        stands: stands.map((s) => ({
          name: s.name,
          widthM: s.width / GRID_SIZE,
          depthM: s.height / GRID_SIZE,
          positionX: s.x,
          positionY: s.y,
          colorHex: s.colorHex,
          basePrice: s.basePrice,
          status: s.status,
        })),
      }),
    });
    setSaving(false);
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2000);
  }, [eventId, stands]);

  function addStand() {
    const newStand: StandData = {
      id: `stand-${Date.now()}`,
      name: `A${stands.length + 1}`,
      x: snap(100 + (stands.length % 8) * (GRID_SIZE * 6)),
      y: snap(100 + Math.floor(stands.length / 8) * (GRID_SIZE * 6)),
      width: GRID_SIZE * 4,
      height: GRID_SIZE * 4,
      colorHex: STATUS_COLORS.disponivel,
      basePrice: 1000,
      status: "disponivel",
    };
    setStands((prev) => [...prev, newStand]);
  }

  function removeSelected() {
    if (!selectedId) return;
    setStands((prev) => prev.filter((s) => s.id !== selectedId));
    setSelectedId(null);
  }

  const selectedStand = stands.find((s) => s.id === selectedId);

  function updateSelected(field: keyof StandData, value: string | number) {
    setStands((prev) =>
      prev.map((s) => {
        if (s.id !== selectedId) return s;
        if (field === "status") {
          return { ...s, status: value as StandData["status"], colorHex: STATUS_COLORS[value as string] };
        }
        return { ...s, [field]: value };
      })
    );
  }

  // Grid lines
  const gridLines: number[] = [];
  for (let x = 0; x < containerSize.width; x += GRID_SIZE) gridLines.push(x);
  const gridLinesH: number[] = [];
  for (let y = 0; y < containerSize.height; y += GRID_SIZE) gridLinesH.push(y);

  return (
    <div className="flex flex-col h-full">
      {!readonly && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <button
            onClick={() => setTool("select")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${tool === "select" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}`}
          >
            ↖ Selecionar
          </button>
          <button
            onClick={addStand}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border bg-white text-slate-700 border-slate-300 hover:bg-slate-50 transition-colors"
          >
            + Adicionar Estande
          </button>
          {selectedId && (
            <button
              onClick={removeSelected}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              🗑 Remover
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            {savedOk && <span className="text-emerald-600 text-sm font-medium">✓ Salvo!</span>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {saving ? "Salvando..." : "💾 Salvar Mapa"}
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-4 flex-1">
        <div ref={containerRef} className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <Stage
            ref={stageRef as React.RefObject<Parameters<typeof Stage>[0]["ref"] extends infer T ? Exclude<T, undefined> : never>}
            width={containerSize.width}
            height={containerSize.height}
            onClick={(e) => {
              if (e.target === e.target.getStage()) {
                setSelectedId(null);
              }
            }}
          >
            <Layer>
              {/* Grid */}
              {gridLines.map((x) => (
                <Line key={`v-${x}`} points={[x, 0, x, containerSize.height]} stroke="#f1f5f9" strokeWidth={1} />
              ))}
              {gridLinesH.map((y) => (
                <Line key={`h-${y}`} points={[0, y, containerSize.width, y]} stroke="#f1f5f9" strokeWidth={1} />
              ))}

              {/* Stands */}
              {stands.map((stand) => (
                <React.Fragment key={stand.id}>
                  <Rect
                    id={stand.id}
                    x={stand.x}
                    y={stand.y}
                    width={stand.width}
                    height={stand.height}
                    fill={stand.colorHex}
                    opacity={selectedId === stand.id ? 1 : 0.85}
                    cornerRadius={4}
                    stroke={selectedId === stand.id ? "#0f172a" : "transparent"}
                    strokeWidth={2}
                    draggable={!readonly}
                    onClick={() => {
                      if (readonly && onStandSelect) {
                        onStandSelect(stand);
                      } else {
                        setSelectedId(stand.id);
                      }
                    }}
                    onDragEnd={(e) => {
                      const node = e.target;
                      setStands((prev) =>
                        prev.map((s) =>
                          s.id === stand.id
                            ? { ...s, x: snap(node.x()), y: snap(node.y()) }
                            : s
                        )
                      );
                    }}
                    shadowColor="rgba(0,0,0,0.15)"
                    shadowBlur={4}
                    shadowOffsetY={2}
                  />
                  <Text
                    x={stand.x + 4}
                    y={stand.y + stand.height / 2 - 8}
                    width={stand.width - 8}
                    text={stand.name}
                    fontSize={12}
                    fontStyle="bold"
                    fill="white"
                    align="center"
                    listening={false}
                  />
                  <Text
                    x={stand.x + 4}
                    y={stand.y + stand.height / 2 + 4}
                    width={stand.width - 8}
                    text={stand.basePrice > 0 ? `R$ ${stand.basePrice.toLocaleString("pt-BR")}` : ""}
                    fontSize={10}
                    fill="rgba(255,255,255,0.85)"
                    align="center"
                    listening={false}
                  />
                </React.Fragment>
              ))}
            </Layer>
          </Stage>
        </div>

        {!readonly && selectedStand && (
          <div className="w-64 bg-white border border-slate-200 rounded-xl p-5 shrink-0">
            <h3 className="font-semibold text-slate-800 mb-4">Propriedades do Estande</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nome / Código</label>
                <input
                  type="text"
                  value={selectedStand.name}
                  onChange={(e) => updateSelected("name", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <select
                  value={selectedStand.status}
                  onChange={(e) => updateSelected("status", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="disponivel">Disponível</option>
                  <option value="reservado">Reservado</option>
                  <option value="ocupado">Ocupado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Preço Base (R$)</label>
                <input
                  type="number"
                  min="0"
                  value={selectedStand.basePrice}
                  onChange={(e) => updateSelected("basePrice", parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Largura (px)</label>
                  <input
                    type="number"
                    step={GRID_SIZE}
                    min={GRID_SIZE}
                    value={selectedStand.width}
                    onChange={(e) => updateSelected("width", parseInt(e.target.value) || GRID_SIZE)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Profund. (px)</label>
                  <input
                    type="number"
                    step={GRID_SIZE}
                    min={GRID_SIZE}
                    value={selectedStand.height}
                    onChange={(e) => updateSelected("height", parseInt(e.target.value) || GRID_SIZE)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Disponível
                  <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block ml-2" /> Reservado
                  <span className="w-3 h-3 rounded-sm bg-slate-500 inline-block ml-2" /> Ocupado
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Need to import React for Fragment usage in JSX
import React from "react";
