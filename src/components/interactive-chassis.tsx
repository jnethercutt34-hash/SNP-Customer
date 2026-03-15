"use client";

import { useCallback, useState } from "react";
import { useConfig } from "@/lib/config-context";
import { MODULES, SLOT_CONSTRAINTS, isSlotConfigurable } from "@/lib/product-catalog";

// ── Layout constants (from SNP-Onboard chassis-diagram) ─────────────────────

const VW = 910;
const VH = 220;
const EAR = 28;
const RAIL = 20;
const SLOTS = 7;
const TOTAL_W = VW - EAR * 2;
const SW = TOTAL_W / SLOTS;
const FW = Math.round(SW * 0.9);
const FY = RAIL;
const FH = VH - RAIL * 2;

function fx(slot: number) {
  return EAR + (slot - 1) * SW;
}

// ── Shared SVG elements ─────────────────────────────────────────────────────

function Handles({ x }: { x: number }) {
  return (
    <>
      <rect x={x + 6} y={FY + 4} width={FW - 12} height={8} rx={1.5} fill="#050505" stroke="#1a1a1a" strokeWidth="0.7"/>
      <rect x={x + 10} y={FY + 5.5} width={FW - 20} height={5} rx={1} fill="#080808" stroke="#222" strokeWidth="0.5"/>
      <rect x={x + 6} y={FY + FH - 12} width={FW - 12} height={8} rx={1.5} fill="#050505" stroke="#1a1a1a" strokeWidth="0.7"/>
      <rect x={x + 10} y={FY + FH - 10.5} width={FW - 20} height={5} rx={1} fill="#080808" stroke="#222" strokeWidth="0.5"/>
    </>
  );
}

function Screws({ x, fill = "#060606", stroke = "#1a1a1a" }: { x: number; fill?: string; stroke?: string }) {
  return (
    <>
      {[[x+7, FY+7],[x+FW-7, FY+7],[x+7, FY+FH-7],[x+FW-7, FY+FH-7]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r={3} fill={fill} stroke={stroke} strokeWidth="0.6"/>
      ))}
    </>
  );
}

// ── Faceplate components (type-based) ───────────────────────────────────────

function PsuFace({ x, side }: { x: number; side: "RED" | "BLACK" }) {
  const isRed = side === "RED";
  const mid = FW / 2;
  const panelFill = isRed ? "#0f0808" : "#0a0a0a";
  const panelStroke = isRed ? "#2a1010" : "#1c1c1c";
  const labelColor = isRed ? "#ef4444" : "#60a5fa";

  return (
    <g>
      <rect x={x} y={FY} width={FW} height={FH} fill={panelFill} stroke={panelStroke} strokeWidth="0.8"/>
      <rect x={x} y={FY} width={FW} height={2} fill={isRed ? "#7f1d1d" : "#1e2a3a"} opacity="0.7"/>
      <Screws x={x} stroke={panelStroke}/>
      <Handles x={x}/>
      <text x={x+mid} y={FY+36} textAnchor="middle" fill="#6b7280" fontSize="6.5" fontFamily="monospace" letterSpacing="1.5">POWER</text>
      <text x={x+mid} y={FY+47} textAnchor="middle" fill={labelColor} fontSize="9" fontFamily="monospace" fontWeight="bold" letterSpacing="2">{side}</text>
      <text x={x+mid} y={FY+100} textAnchor="middle" fill="#4b5563" fontSize="5.5" fontFamily="monospace">28 VDC INPUT</text>
      <text x={x+mid} y={FY+115} textAnchor="middle" fill="#4b5563" fontSize="5" fontFamily="monospace">{isRed ? "5 W" : "6 W"}</text>
    </g>
  );
}

function GppFace({ x, side }: { x: number; side: "RED" | "BLACK" }) {
  const isRed = side === "RED";
  const mid = FW / 2;
  const panelFill = isRed ? "#0f0808" : "#0a0a0a";
  const panelStroke = isRed ? "#2a1010" : "#1c1c1c";
  const labelColor = isRed ? "#ef4444" : "#60a5fa";

  return (
    <g>
      <rect x={x} y={FY} width={FW} height={FH} fill={panelFill} stroke={panelStroke} strokeWidth="0.8"/>
      <rect x={x} y={FY} width={FW} height={2} fill={isRed ? "#7f1d1d" : "#1e2a3a"} opacity="0.7"/>
      <Screws x={x} stroke={panelStroke}/>
      <Handles x={x}/>
      <text x={x+mid} y={FY+36} textAnchor="middle" fill="#6b7280" fontSize="6.5" fontFamily="monospace" letterSpacing="1.5">GPP</text>
      <text x={x+mid} y={FY+47} textAnchor="middle" fill={labelColor} fontSize="9" fontFamily="monospace" fontWeight="bold" letterSpacing="2">{side}</text>
      <text x={x+mid} y={FY+75} textAnchor="middle" fill="#4b5563" fontSize="5.5" fontFamily="monospace">ARM A78AE · QUAD</text>
      <text x={x+mid} y={FY+85} textAnchor="middle" fill="#4b5563" fontSize="5.5" fontFamily="monospace">16 GB DDR4 · ECC</text>
      <text x={x+mid} y={FY+100} textAnchor="middle" fill="#5b8fa8" fontSize="5" fontFamily="monospace">+ MEZZANINE</text>
    </g>
  );
}

function CryptoFace({ x }: { x: number }) {
  const mid = FW / 2;
  return (
    <g>
      <rect x={x} y={FY} width={FW} height={FH} fill="#0a0a0a" stroke="#1c1c1c" strokeWidth="0.8"/>
      <Screws x={x}/>
      <Handles x={x}/>
      <text x={x+mid} y={FY+36} textAnchor="middle" fill="#6b7280" fontSize="6.5" fontFamily="monospace" letterSpacing="1.5">CRYPTO</text>
      <text x={x+mid} y={FY+47} textAnchor="middle" fill="#3b82f6" fontSize="9" fontFamily="monospace" fontWeight="bold">UNIT</text>
      <rect x={x+18} y={FY+70} width={FW-36} height={14} rx={1.5} fill="#060606" stroke="#1a2e50" strokeWidth="0.7"/>
      <text x={x+mid} y={FY+80} textAnchor="middle" fill="#3b82f6" fontSize="7" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">FIPS 140-2 L3</text>
      <text x={x+mid} y={FY+100} textAnchor="middle" fill="#5b8fa8" fontSize="5.5" fontFamily="monospace">AES-256 · ECC P-384</text>
    </g>
  );
}

function TimingFace({ x }: { x: number }) {
  const mid = FW / 2;
  const clockCx = x + mid;
  const clockCy = FY + 82;
  const ticks = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <g>
      <rect x={x} y={FY} width={FW} height={FH} fill="#0a0a0a" stroke="#1c1c1c" strokeWidth="0.8"/>
      <Screws x={x}/>
      <Handles x={x}/>
      <text x={x+mid} y={FY+36} textAnchor="middle" fill="#6b7280" fontSize="6.5" fontFamily="monospace" letterSpacing="1.5">TIMING</text>
      <text x={x+mid} y={FY+47} textAnchor="middle" fill="#3b82f6" fontSize="9" fontFamily="monospace" fontWeight="bold">CSAC</text>

      <circle cx={clockCx} cy={clockCy} r={20} fill="none" stroke="#1d4ed8" strokeWidth="0.7" opacity="0.5"/>
      {ticks.map(deg => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line key={deg}
                x1={clockCx + Math.sin(rad) * 16} y1={clockCy - Math.cos(rad) * 16}
                x2={clockCx + Math.sin(rad) * 20} y2={clockCy - Math.cos(rad) * 20}
                stroke="#3b82f6" strokeWidth={deg % 90 === 0 ? 1.2 : 0.6} opacity="0.45"/>
        );
      })}
      <line x1={clockCx} y1={clockCy} x2={clockCx} y2={clockCy - 12} stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" opacity="0.75"/>
      <circle cx={clockCx} cy={clockCy} r={2} fill="#60a5fa" opacity="0.9"/>

      <text x={x+mid} y={FY+116} textAnchor="middle" fill="#5b8fa8" fontSize="5.5" fontFamily="monospace">1 PPS · 10 MHz</text>
      <rect x={x+20} y={FY+122} width={FW-40} height={11} rx={1.5} fill="#060606" stroke="#181818" strokeWidth="0.6"/>
      <text x={x+mid} y={FY+130} textAnchor="middle" fill="#3b82f6" fontSize="6" fontFamily="monospace" fontWeight="bold">PRECISION SYNC</text>
    </g>
  );
}

function EmptyFace({ x }: { x: number }) {
  const mid = FW / 2;
  return (
    <g>
      <rect x={x} y={FY} width={FW} height={FH} fill="#060606" stroke="#141414" strokeWidth="0.7" strokeDasharray="5 4"/>
      <text x={x+mid} y={FY+84} textAnchor="middle" fill="#2a4060" fontSize="8" fontFamily="monospace" letterSpacing="1">SPARE</text>
      <text x={x+mid} y={FY+98} textAnchor="middle" fill="#1e3050" fontSize="6.5" fontFamily="monospace">SLOT</text>
    </g>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

interface InteractiveChassisProps {
  onSlotClick: (slotNumber: number) => void;
}

export function InteractiveChassis({ onSlotClick }: InteractiveChassisProps) {
  const { state } = useConfig();
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  const renderFace = useCallback((slotNum: number) => {
    const x = fx(slotNum);
    const slotConfig = state.slots.find((s) => s.slotNumber === slotNum);
    const moduleId = slotConfig?.moduleId;

    if (!moduleId) return <EmptyFace key={slotNum} x={x}/>;

    const mod = MODULES[moduleId];
    if (!mod) return <EmptyFace key={slotNum} x={x}/>;

    // Type-based rendering (not ID-based) — prevents silent failures
    switch (mod.type) {
      case "Power_Converter":
        return <PsuFace key={slotNum} x={x} side={slotNum <= 3 ? "RED" : "BLACK"}/>;
      case "GPP_Base":
        return <GppFace key={slotNum} x={x} side={slotNum <= 4 ? "RED" : "BLACK"}/>;
      case "Crypto_Module":
        return <CryptoFace key={slotNum} x={x}/>;
      case "Expansion_Module":
        return <TimingFace key={slotNum} x={x}/>;
      default:
        return <EmptyFace key={slotNum} x={x}/>;
    }
  }, [state.slots]);

  // Mezzanine labels on GPP slots
  const renderMezLabel = useCallback((slotNum: number) => {
    const slotConfig = state.slots.find((s) => s.slotNumber === slotNum);
    if (!slotConfig?.mezzanineId) return null;
    const mez = MODULES[slotConfig.mezzanineId];
    if (!mez) return null;
    const x = fx(slotNum);
    const mid = FW / 2;
    return (
      <g key={`mez-${slotNum}`}>
        <rect x={x + 8} y={FY + FH - 40} width={FW - 16} height={20} rx={2}
              fill="#060606" stroke="#1a2e50" strokeWidth="0.7"/>
        <text x={x + mid} y={FY + FH - 27} textAnchor="middle"
              fill="#60a5fa" fontSize="5" fontFamily="monospace" fontWeight="bold">
          {mez.name.replace(" Mezzanine", "").replace("10G ", "")}
        </text>
      </g>
    );
  }, [state.slots]);

  const occupiedSlots = state.slots.filter((s) => s.moduleId !== null).length;
  const labelText = `SNP-3UVPX · VITA 78 SpaceVPX · ${occupiedSlots} / ${SLOTS} SLOTS OCCUPIED`;

  return (
    <div className="w-full rounded-lg overflow-hidden border border-border">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full block"
        aria-label="3U SpaceVPX chassis — interactive configurator"
        style={{ maxHeight: "300px" }}
      >
        {/* Chassis body */}
        <rect width={VW} height={VH} rx={4} fill="#080808" stroke="#1a1a1a" strokeWidth="1.5"/>

        {/* Left mounting flange */}
        <rect x={0} y={0} width={EAR} height={VH} rx={3} fill="#060606" stroke="#141414" strokeWidth="1"/>
        {[30, 80, 130, 170].map(y => (
          <g key={y}>
            <circle cx={14} cy={y} r={5.5} fill="#040404" stroke="#1a1a1a" strokeWidth="0.8"/>
            <circle cx={14} cy={y} r={2.5} fill="#020202"/>
          </g>
        ))}

        {/* Right mounting flange */}
        <rect x={VW - EAR} y={0} width={EAR} height={VH} rx={3} fill="#060606" stroke="#141414" strokeWidth="1"/>
        {[30, 80, 130, 170].map(y => (
          <g key={y}>
            <circle cx={VW - 14} cy={y} r={5.5} fill="#040404" stroke="#1a1a1a" strokeWidth="0.8"/>
            <circle cx={VW - 14} cy={y} r={2.5} fill="#020202"/>
          </g>
        ))}

        {/* Top rail */}
        <rect x={EAR} y={0} width={VW - EAR * 2} height={RAIL} fill="#070707" stroke="#141414" strokeWidth="0.8"/>
        <text x={EAR + 8} y={14} fill="#4b5563" fontSize="7" fontFamily="monospace" letterSpacing="1" fontWeight="bold">
          {labelText}
        </text>

        {/* Bottom rail */}
        <rect x={EAR} y={VH - RAIL} width={VW - EAR * 2} height={RAIL} fill="#070707" stroke="#141414" strokeWidth="0.8"/>

        {/* Slot separators */}
        {Array.from({ length: SLOTS - 1 }, (_, i) => (
          <line key={i}
                x1={EAR + (i + 1) * SW - 1} y1={RAIL}
                x2={EAR + (i + 1) * SW - 1} y2={VH - RAIL}
                stroke="#0d1e34" strokeWidth="1.5"/>
        ))}

        {/* Module faces */}
        {Array.from({ length: SLOTS }, (_, i) => renderFace(i + 1))}

        {/* Mezzanine labels */}
        {[4, 6].map((s) => renderMezLabel(s))}

        {/* Slot numbers */}
        {Array.from({ length: SLOTS }, (_, i) => {
          const s = i + 1;
          const x = fx(s);
          return (
            <text key={`num-${s}`} x={x + FW / 2} y={VH - 6} textAnchor="middle"
                  fill="#4b5563" fontSize="7" fontFamily="monospace">
              {s}
            </text>
          );
        })}

        {/* Click zones */}
        {Array.from({ length: SLOTS }, (_, i) => {
          const s = i + 1;
          const configurable = isSlotConfigurable(s);
          const isHovered = hoveredSlot === s;
          return (
            <rect
              key={`click-${s}`}
              x={fx(s)}
              y={FY}
              width={FW}
              height={FH}
              fill={isHovered ? "rgba(59, 130, 246, 0.08)" : "transparent"}
              stroke={isHovered ? "rgba(59, 130, 246, 0.4)" : "transparent"}
              strokeWidth="2"
              rx={2}
              style={{ cursor: "pointer", pointerEvents: "all" }}
              onMouseEnter={() => setHoveredSlot(s)}
              onMouseLeave={() => setHoveredSlot(null)}
              onClick={() => onSlotClick(s)}
            />
          );
        })}

        {/* Configurable indicators */}
        {Array.from({ length: SLOTS }, (_, i) => {
          const s = i + 1;
          if (!isSlotConfigurable(s)) return null;
          const x = fx(s);
          return (
            <g key={`config-${s}`}>
              <circle cx={x + FW - 10} cy={FY + 12} r={4} fill="#1d4ed8" opacity="0.3"/>
              <circle cx={x + FW - 10} cy={FY + 12} r={2} fill="#3b82f6" opacity="0.7"/>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
