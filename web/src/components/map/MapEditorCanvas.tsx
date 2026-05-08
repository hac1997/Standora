"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Rect, Text, Line, Circle, Image as KonvaImage, Shape } from "react-konva";
import type Konva from "konva";
import StatusManager, { type StatusDef, DEFAULT_STATUSES } from "./StatusManager";
import ColorPicker from "./ColorPicker";

const GRID = 20;
const DRAG_SNAP = 5;
const LAYOUT_W = 1000; // referência fixa para posicionar o croqui (mesma em editor e portal)
const LAYOUT_H = 560;
const snap     = (v: number) => Math.round(v / GRID) * GRID;
const snapDrag = (v: number) => Math.round(v / DRAG_SNAP) * DRAG_SNAP;

type Shape = "rect" | "polygon";

interface StandData {
  id: string;
  name: string;
  shape: Shape;
  x: number;
  y: number;
  width: number;
  height: number;
  points: number[];
  colorHex: string;
  basePrice: number;
  status: string;
  forSale?: boolean;   // default true — false = estande bloqueado para venda
  photoUrl?: string;
}

interface Props {
  eventId: string;
  initialStands?: StandData[];
  readonly?: boolean;
  onStandSelect?: (s: StandData) => void;
}

function centroid(pts: number[] | undefined) {
  if (!pts || pts.length < 4) return { x: 0, y: 0 };
  let cx = 0, cy = 0;
  const n = pts.length / 2;
  for (let i = 0; i < pts.length; i += 2) { cx += pts[i]; cy += pts[i + 1]; }
  return { x: cx / n, y: cy / n };
}

function segLen(x1: number, y1: number, x2: number, y2: number, ratio: number | null) {
  const px = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  if (!ratio) return `${Math.round(px)}px`;
  return `${(px / 100 * ratio).toFixed(1)}m`;
}

function segMid(x1: number, y1: number, x2: number, y2: number) {
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
}

function polyArea(pts: number[] | undefined) {
  if (!pts || pts.length < 6) return 0; // precisa de no mínimo 3 pontos (6 valores)
  let area = 0;
  const n = Math.floor(pts.length / 2);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += pts[i * 2] * pts[j * 2 + 1];
    area -= pts[j * 2] * pts[i * 2 + 1];
  }
  return Math.abs(area / 2);
}

export default function MapEditorCanvas({ eventId, readonly = false, onStandSelect }: Props) {
  const [stands, setStands] = useState<StandData[]>([]);
  const [statuses, setStatuses] = useState<StatusDef[]>(DEFAULT_STATUSES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<"select" | "rect" | "polygon">("select");
  const [drawPts, setDrawPts] = useState<number[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 560 });
  const [floorPlanUrl, setFloorPlanUrl] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [bgImageNatural, setBgImageNatural] = useState<{ w: number; h: number } | null>(null);
  const [scaleRatio, setScaleRatio] = useState<number | null>(null);
  const [scaleInput, setScaleInput] = useState("");
  const [uploading, setUploading] = useState<"floor" | "photo" | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: Math.max(560, window.innerHeight - 300),
        });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    fetch(`/api/events/${eventId}/map`)
      .then((r) => r.json())
      .then((data) => {
        if (data.map?.canvasJson) {
          try {
            const parsed = JSON.parse(data.map.canvasJson);
            if (parsed.stands) setStands(parsed.stands);
            if (parsed.statuses && Array.isArray(parsed.statuses)) setStatuses(parsed.statuses);
          } catch {}
        }
        if (data.map?.floorPlanUrl) setFloorPlanUrl(data.map.floorPlanUrl);
        if (data.map?.scaleRatio) {
          setScaleRatio(data.map.scaleRatio);
          setScaleInput(String(data.map.scaleRatio));
        }
      });
  }, [eventId]);

  useEffect(() => {
    if (!floorPlanUrl) { setBgImage(null); setBgImageNatural(null); return; }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = floorPlanUrl;
    img.onload = () => {
      setBgImage(img);
      setBgImageNatural({ w: img.naturalWidth, h: img.naturalHeight });
    };
  }, [floorPlanUrl]);

  const handleSave = useCallback(async (overrideFloorPlanUrl?: string | null) => {
    setSaving(true);
    const url = overrideFloorPlanUrl !== undefined ? overrideFloorPlanUrl : floorPlanUrl;
    try {
      const res = await fetch(`/api/events/${eventId}/map`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canvasJson: JSON.stringify({ stands, statuses }),
          floorPlanUrl: url,
          scaleRatio: scaleRatio,
          stands: stands.map((s) => ({
            name: s.name,
            widthM: s.shape === "rect" ? s.width / GRID : Math.sqrt(polyArea(s.points)) / GRID,
            depthM: s.shape === "rect" ? s.height / GRID : Math.sqrt(polyArea(s.points)) / GRID,
            positionX: s.shape === "rect" ? s.x : centroid(s.points).x,
            positionY: s.shape === "rect" ? s.y : centroid(s.points).y,
            colorHex: s.colorHex,
            basePrice: s.basePrice,
            status: s.status,
            photoUrl: s.photoUrl ?? null,
          })),
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erro HTTP ${res.status}`);
      }
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
    } catch (err) {
      console.error("[handleSave]", err);
      // surface error visually if upload error state is available
      alert(`Erro ao salvar: ${err instanceof Error ? err.message : "Tente novamente"}`);
    } finally {
      setSaving(false);
    }
  }, [eventId, stands, statuses, floorPlanUrl, scaleRatio]);

  function addStand(shape: "rect" | "polygon" = "rect", pts: number[] = [], pos?: { x: number; y: number }): StandData {
    const defaultStatus = statuses[0] ?? { key: "disponivel", label: "Disponível", color: "#22c55e" };
    const id = `stand-${Date.now()}`;
    const base = {
      id,
      name: `A${stands.length + 1}`,
      colorHex: defaultStatus.color,
      basePrice: 1000,
      status: defaultStatus.key,
      forSale: true,
    };
    if (shape === "polygon") {
      return { ...base, shape: "polygon", x: 0, y: 0, width: 0, height: 0, points: pts };
    }
    const x = pos ? snap(pos.x - GRID * 2) : snap(100);
    const y = pos ? snap(pos.y - GRID * 2) : snap(100);
    return { ...base, shape: "rect", x, y, width: GRID * 4, height: GRID * 4, points: [] };
  }

  async function uploadFile(file: File, folder: string): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok || !data.url) {
      throw new Error(data.error ?? `Erro ${res.status} no upload`);
    }
    return data.url;
  }

  async function handleFloorUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("floor");
    setUploadError(null);
    try {
      const url = await uploadFile(file, "floor-plans");
      setFloorPlanUrl(url);
      // Auto-salva imediatamente com a URL nova (state ainda não atualizou)
      await handleSave(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erro no upload do croqui");
    } finally {
      setUploading(null);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedId) return;
    setUploading("photo");
    setUploadError(null);
    try {
      const url = await uploadFile(file, "stand-photos");
      setStands((prev) => prev.map((s) => s.id === selectedId ? { ...s, photoUrl: url } : s));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erro no upload da foto");
    } finally {
      setUploading(null);
    }
  }

  function handleStageClick(e: Konva.KonvaEventObject<MouseEvent>) {
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    if (tool === "polygon") {
      if (drawPts.length >= 4) {
        const dx = pos.x - drawPts[0], dy = pos.y - drawPts[1];
        if (Math.sqrt(dx * dx + dy * dy) < 15) {
          setStands((prev) => [...prev, addStand("polygon", drawPts)]);
          setDrawPts([]);
          setTool("select");
          return;
        }
      }
      setDrawPts((prev) => [...prev, snap(pos.x), snap(pos.y)]);
      return;
    }

    if (tool === "rect") {
      setStands((prev) => [...prev, addStand("rect", [], pos)]);
      setTool("select");
      return;
    }

    if (e.target === stage) setSelectedId(null);
  }

  function handleMouseMove() {
    // Only track mouse position when drawing polygons; throttle via RAF
    if (tool !== "polygon" || drawPts.length < 2) return;
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      const pos = stageRef.current?.getPointerPosition();
      if (pos) setMousePos({ x: snap(pos.x), y: snap(pos.y) });
      rafRef.current = null;
    });
  }

  const selected = stands.find((s) => s.id === selectedId);

  const cursorStyle = tool === "polygon" || tool === "rect" ? "crosshair" : "default";

  return (
    <div className="flex flex-col h-full">
      {!readonly && (
        <div className="flex items-center justify-between gap-2 pt-2 pb-3 pl-4 pr-2">
          {/* Grupo esquerdo — ferramentas + configurações */}
          <div className="flex flex-wrap items-center gap-2">
            {(["select", "rect", "polygon"] as const).map((t) => (
              <button key={t} onClick={() => { setTool(t); if (t !== "polygon") setDrawPts([]); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${tool === t ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}`}>
                {t === "select" ? "↖ Selecionar" : t === "rect" ? "⬜ Retângulo" : "✏️ Polígono"}
              </button>
            ))}

            <span className="w-px h-5 bg-slate-200 mx-1" />

            {selectedId && (
              <button onClick={() => { setStands((p) => p.filter((s) => s.id !== selectedId)); setSelectedId(null); }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                🗑 Remover
              </button>
            )}
            {tool === "polygon" && drawPts.length >= 4 && (
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                Clique no 1º ponto para fechar · ESC cancela
              </span>
            )}

            <span className="w-px h-5 bg-slate-200 mx-1" />

            <label className="px-3 py-1.5 rounded-lg text-sm font-medium border bg-white text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer transition-colors">
              {uploading === "floor" ? "Enviando..." : "🗺 Croqui"}
              <input type="file" className="hidden" accept="image/*" onChange={handleFloorUpload} />
            </label>
            {floorPlanUrl && (
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-slate-500 whitespace-nowrap">100px =</label>
                <input type="number" min="0.1" step="0.1" value={scaleInput}
                  onChange={(e) => { setScaleInput(e.target.value); setScaleRatio(parseFloat(e.target.value) || null); }}
                  placeholder="metros" className="w-20 px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-slate-900" />
                <label className="text-xs text-slate-500">m</label>
              </div>
            )}
            <StatusManager statuses={statuses} onChange={setStatuses} />
          </div>

          {/* Grupo direito — Salvar */}
          <div className="flex items-center gap-2 shrink-0">
            {savedOk && <span className="text-emerald-600 text-sm font-medium">✓ Salvo!</span>}
            <button onClick={() => handleSave()} disabled={saving}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">
              {saving ? "Salvando..." : "💾 Salvar"}
            </button>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
          <span className="flex-1">⚠️ {uploadError}</span>
          <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-600 font-bold text-lg leading-none">×</button>
        </div>
      )}

      <div className="flex gap-4 flex-1">
        <div ref={containerRef} className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden" style={{ cursor: cursorStyle }}>
          <Stage ref={stageRef} width={containerSize.width} height={containerSize.height}
            onClick={handleStageClick} onMouseMove={handleMouseMove}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Escape") { setDrawPts([]); setTool("select"); } }}>
            <Layer listening={false}>
              {bgImage && bgImageNatural && (() => {
                // Contain usando dimensões FIXAS (LAYOUT_W × LAYOUT_H) para que
                // o croqui tenha sempre a mesma posição em todas as views
                const scale = Math.min(
                  LAYOUT_W / bgImageNatural.w,
                  LAYOUT_H / bgImageNatural.h
                );
                const w = bgImageNatural.w * scale;
                const h = bgImageNatural.h * scale;
                const x = (LAYOUT_W - w) / 2;
                const y = (LAYOUT_H - h) / 2;
                return (
                  <KonvaImage image={bgImage} x={x} y={y}
                    width={w} height={h} opacity={0.4}
                    perfectDrawEnabled={false} />
                );
              })()}
              {/* Single canvas draw call for the entire grid — far faster than individual <Line> elements */}
              <Shape
                perfectDrawEnabled={false}
                listening={false}
                sceneFunc={(ctx) => {
                  ctx.beginPath();
                  ctx.strokeStyle = "#f1f5f9";
                  ctx.lineWidth = 1;
                  for (let x = 0; x < containerSize.width; x += GRID) {
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, containerSize.height);
                  }
                  for (let y = 0; y < containerSize.height; y += GRID) {
                    ctx.moveTo(0, y);
                    ctx.lineTo(containerSize.width, y);
                  }
                  ctx.stroke();
                }}
              />
            </Layer>

            <Layer>
              {stands.map((s) => {
                const isSel = selectedId === s.id;
                const notForSale = s.forSale === false;
                // Em readonly (portal): apaga o fill do selecionado para dar feedback visual
                const polyOpacity = readonly && isSel ? 0.35 : (isSel ? 1 : 0.8);
                if (s.shape === "polygon") {
                  const c = centroid(s.points);
                  // bbox aproximado para a linha diagonal de strikethrough
                  const xs = s.points.filter((_, i) => i % 2 === 0);
                  const ys = s.points.filter((_, i) => i % 2 !== 0);
                  const minX = Math.min(...xs), maxX = Math.max(...xs);
                  const minY = Math.min(...ys), maxY = Math.max(...ys);
                  return (
                    <React.Fragment key={s.id}>
                      <Line points={s.points} closed fill={s.colorHex} opacity={polyOpacity}
                        stroke={isSel ? (readonly ? "white" : "#0f172a") : "rgba(0,0,0,0.2)"}
                        strokeWidth={isSel ? 2.5 : 1}
                        perfectDrawEnabled={false}
                        shadowEnabled={false}
                        draggable={!readonly}
                        onClick={() => { if (readonly && onStandSelect) { setSelectedId(s.id); onStandSelect(s); } else setSelectedId(s.id); }}
                        onDragEnd={(e) => {
                          const dx = e.target.x(), dy = e.target.y();
                          e.target.x(0); e.target.y(0);
                          setStands((prev) => prev.map((st) => st.id === s.id
                            ? { ...st, points: st.points.map((v, i) => i % 2 === 0 ? snapDrag(v + dx) : snapDrag(v + dy)) }
                            : st));
                        }} />
                      {scaleRatio && s.points.length >= 4 && Array.from({ length: s.points.length / 2 }).map((_, i) => {
                        const j = (i + 1) % (s.points.length / 2);
                        const x1 = s.points[i * 2], y1 = s.points[i * 2 + 1];
                        const x2 = s.points[j * 2], y2 = s.points[j * 2 + 1];
                        const mid = segMid(x1, y1, x2, y2);
                        return (
                          <Text key={i} x={mid.x - 20} y={mid.y - 8} width={40} text={segLen(x1, y1, x2, y2, scaleRatio)}
                            fontSize={9} fill="#1e293b" align="center"
                            perfectDrawEnabled={false} listening={false} />
                        );
                      })}
                      <Text x={c.x - 30} y={c.y - 8} width={60} text={s.name}
                        fontSize={11} fontStyle="bold" fill="white" align="center"
                        perfectDrawEnabled={false} listening={false} />
                      {notForSale && (
                        <Line
                          points={[minX + 4, minY + 4, maxX - 4, maxY - 4]}
                          stroke="rgba(255,255,255,0.75)" strokeWidth={2}
                          dash={[5, 3]} lineCap="round"
                          perfectDrawEnabled={false} listening={false} />
                      )}
                    </React.Fragment>
                  );
                }
                const rectOpacity = readonly && isSel ? 0.35 : (isSel ? 1 : 0.85);
                return (
                  <React.Fragment key={s.id}>
                    <Rect id={s.id} x={s.x} y={s.y} width={s.width} height={s.height}
                      fill={s.colorHex} opacity={rectOpacity} cornerRadius={4}
                      stroke={isSel ? (readonly ? "white" : "#0f172a") : "transparent"} strokeWidth={isSel ? 2.5 : 0}
                      perfectDrawEnabled={false}
                      shadowEnabled={isSel && !readonly}
                      shadowColor="rgba(0,0,0,0.25)" shadowBlur={8} shadowOffsetY={3}
                      draggable={!readonly}
                      onClick={() => { if (readonly && onStandSelect) { setSelectedId(s.id); onStandSelect(s); } else setSelectedId(s.id); }}
                      onDragEnd={(e) => {
                        const node = e.target;
                        setStands((prev) => prev.map((st) => st.id === s.id
                          ? { ...st, x: snapDrag(node.x()), y: snapDrag(node.y()) } : st));
                      }} />
                    <Text x={s.x + 4} y={s.y + s.height / 2 - 8} width={s.width - 8}
                      text={s.name} fontSize={12} fontStyle="bold" fill="white" align="center"
                      perfectDrawEnabled={false} listening={false} />
                    {notForSale && (
                      <Line
                        points={[s.x + 6, s.y + 6, s.x + s.width - 6, s.y + s.height - 6]}
                        stroke="rgba(255,255,255,0.75)" strokeWidth={2}
                        dash={[5, 3]} lineCap="round"
                        perfectDrawEnabled={false} listening={false} />
                    )}
                    {scaleRatio && (
                      <Text x={s.x + 4} y={s.y + s.height / 2 + 4} width={s.width - 8}
                        text={`${(s.width / 100 * scaleRatio).toFixed(1)}×${(s.height / 100 * scaleRatio).toFixed(1)}m`}
                        fontSize={9} fill="rgba(255,255,255,0.8)" align="center"
                        perfectDrawEnabled={false} listening={false} />
                    )}
                  </React.Fragment>
                );
              })}
            </Layer>

            {/* Polygon drawing preview */}
            {tool === "polygon" && drawPts.length >= 2 && (
              <Layer>
                <Line points={drawPts} stroke="#6366f1" strokeWidth={2} dash={[6, 3]} />
                {mousePos && drawPts.length >= 2 && (
                  <Line points={[drawPts[drawPts.length - 2], drawPts[drawPts.length - 1], mousePos.x, mousePos.y]}
                    stroke="#6366f1" strokeWidth={1.5} dash={[4, 4]} />
                )}
                {Array.from({ length: drawPts.length / 2 }).map((_, i) => {
                  const x = drawPts[i * 2], y = drawPts[i * 2 + 1];
                  const isFirst = i === 0;
                  if (i > 0 && scaleRatio) {
                    const px = drawPts[(i - 1) * 2], py = drawPts[(i - 1) * 2 + 1];
                    const mid = segMid(px, py, x, y);
                    return (
                      <React.Fragment key={i}>
                        <Circle x={x} y={y} radius={isFirst ? 7 : 5}
                          fill={isFirst ? "#6366f1" : "white"} stroke="#6366f1" strokeWidth={2} />
                        <Text x={mid.x - 20} y={mid.y - 8} width={40}
                          text={segLen(px, py, x, y, scaleRatio)}
                          fontSize={9} fill="#4338ca" align="center" />
                      </React.Fragment>
                    );
                  }
                  return (
                    <Circle key={i} x={x} y={y} radius={isFirst ? 7 : 5}
                      fill={isFirst ? "#6366f1" : "white"} stroke="#6366f1" strokeWidth={2} />
                  );
                })}
              </Layer>
            )}
          </Stage>
        </div>

        {!readonly && selected && (
          <div
            className="w-64 bg-white border border-slate-200 rounded-xl shrink-0 overflow-y-auto"
            style={{ height: containerSize.height }}
          >
            <div className="p-4 pb-6">
            <h3 className="font-semibold text-slate-800 mb-4">Estande</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nome</label>
                <input type="text" value={selected.name}
                  onChange={(e) => setStands((p) => p.map((s) => s.id === selectedId ? { ...s, name: e.target.value } : s))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
              {/* Toggle: disponível para venda */}
              <div>
                <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-xs font-medium text-slate-700">Disponível para venda</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Expositores podem reservar</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStands((p) => p.map((s) => s.id === selectedId ? { ...s, forSale: s.forSale === false ? true : false } : s))}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                      selected.forSale !== false ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      selected.forSale !== false ? "translate-x-4" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Status</label>
                <div className="flex flex-wrap gap-1.5">
                  {statuses.map((st) => (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => setStands((p) => p.map((s) => s.id === selectedId
                        ? { ...s, status: st.key, colorHex: st.color } : s))}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        selected.status === st.key
                          ? "border-slate-900 text-slate-900 shadow-sm"
                          : "border-slate-200 text-slate-600 hover:border-slate-400"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Cor personalizada</label>
                <ColorPicker
                  value={selected.colorHex}
                  onChange={(color) => setStands((p) => p.map((s) => s.id === selectedId ? { ...s, colorHex: color } : s))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Preço Base (R$)</label>
                <input type="number" min="0" value={selected.basePrice}
                  onChange={(e) => setStands((p) => p.map((s) => s.id === selectedId ? { ...s, basePrice: parseFloat(e.target.value) || 0 } : s))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
              {selected.shape === "rect" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Largura (px)</label>
                    <input type="number" step={GRID} min={GRID} value={selected.width}
                      onChange={(e) => setStands((p) => p.map((s) => s.id === selectedId ? { ...s, width: parseInt(e.target.value) || GRID } : s))}
                      className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Altura (px)</label>
                    <input type="number" step={GRID} min={GRID} value={selected.height}
                      onChange={(e) => setStands((p) => p.map((s) => s.id === selectedId ? { ...s, height: parseInt(e.target.value) || GRID } : s))}
                      className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Foto do local</label>
                {selected.photoUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={selected.photoUrl} alt="Stand" className="w-full h-28 object-cover rounded-lg mb-2" />
                )}
                <label className={`w-full text-center py-2 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500 cursor-pointer hover:bg-slate-50 block ${uploading === "photo" ? "opacity-50 pointer-events-none" : ""}`}>
                  {uploading === "photo" ? "Enviando..." : selected.photoUrl ? "Trocar foto" : "📷 Adicionar foto"}
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>{/* /space-y-3 */}
            </div>{/* /p-4 pb-6 */}
          </div>
        )}
      </div>
    </div>
  );
}
