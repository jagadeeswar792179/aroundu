import React from "react";

/**
 * Professional circular community logo (original design)
 * - Pure SVG, responsive, no external CSS
 * - Props:
 *   size: px of the square logo (default 360)
 *   letter: central monogram (default "U")
 *   withWordmark: adds text on the right for horizontal lockup
 *   wordmark: brand name for the lockup (default "AroundU")
 *   tagline: optional small text under wordmark
 *   theme: "ocean" | "emerald" | "sunset"
 */
export default function BrandLogo({
  size = 360,
  letter = "U",
  withWordmark = false,
  wordmark = "AroundU",
  tagline = "",
  theme = "ocean",
}) {
  const S = size;
  const cx = S / 2;
  const cy = S / 2;

  // Palette presets
  const themes = {
    ocean: {
      deep: "#103B8E",
      ring: "#C8D2DA",
      heads: ["#1A7BD9", "#19B4D0", "#17C09D", "#43C457", "#8AD742", "#1F5CB8"],
      bodyFrom: [
        "#0E4AA8",
        "#1491D9",
        "#12AAAA",
        "#0AA37A",
        "#28B34E",
        "#0E4AA8",
      ],
      bodyTo: [
        "#1B76D1",
        "#18C0DC",
        "#18BFA5",
        "#18B977",
        "#63CB41",
        "#1B76D1",
      ],
    },
    emerald: {
      deep: "#0C3B2E",
      ring: "#C9D7D2",
      heads: ["#1AB17A", "#1EC796", "#47D57E", "#8BE05E", "#B8EA63", "#3BC8A1"],
      bodyFrom: [
        "#0A9D6D",
        "#0FB889",
        "#24C274",
        "#5BD25B",
        "#8FE45A",
        "#15AC84",
      ],
      bodyTo: [
        "#18BFA5",
        "#25D3B7",
        "#49DA9C",
        "#97E46F",
        "#C8F077",
        "#3ED7B3",
      ],
    },
    sunset: {
      deep: "#6B1B3F",
      ring: "#E3C9D2",
      heads: ["#E84B5F", "#FF7A5C", "#FFA552", "#FFD166", "#B86CF1", "#7A56FF"],
      bodyFrom: [
        "#C0265A",
        "#FF6B6B",
        "#FF8F4D",
        "#FFC34D",
        "#8B4BDE",
        "#5B47E0",
      ],
      bodyTo: [
        "#F04D7A",
        "#FFA07A",
        "#FFB766",
        "#FFE08A",
        "#A77AF2",
        "#7C6BFF",
      ],
    },
  };

  const pal = themes[theme] || themes.ocean;

  // Geometry
  const R_OUT = S * 0.46;
  const R_IN = S * 0.425;
  const RIB_OUT = S * 0.41;
  const RIB_IN = S * 0.23;
  const R_HEAD = S * 0.345;
  const HEAD_R = S * 0.043;
  const NODE_R = S * 0.016;

  const deg = (d) => (Math.PI * d) / 180;
  const toXY = (r, a) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];

  // 6 positions (clockwise from top)
  const mids = [90, 30, -30, -90, -150, 150].map(deg);
  const span = deg(50); // ribbon sweep
  const pull = 0.22; // ribbon taper

  const nodeAngles = [60, 0, -60, -120, 180, 120].map(deg);

  const pathAnnularRibbon = (aMid) => {
    const a0 = aMid - span / 2;
    const a1 = aMid + span / 2;

    const [o0x, o0y] = toXY(RIB_OUT, a0);
    const [o1x, o1y] = toXY(RIB_OUT, a1);
    const a0i = a0 + pull,
      a1i = a1 - pull;
    const [i0x, i0y] = toXY(RIB_IN, a0i);
    const [i1x, i1y] = toXY(RIB_IN, a1i);

    const [q0x, q0y] = toXY((RIB_OUT + RIB_IN) / 2, a0 - 0.25);
    const [q1x, q1y] = toXY((RIB_OUT + RIB_IN) / 2, a1 + 0.25);

    return `
      M ${o1x} ${o1y}
      A ${RIB_OUT} ${RIB_OUT} 0 0 1 ${o0x} ${o0y}
      Q ${q0x} ${q0y} ${i0x} ${i0y}
      A ${RIB_IN} ${RIB_IN} 0 0 0 ${i1x} ${i1y}
      Q ${q1x} ${q1y} ${o1x} ${o1y}
      Z
    `;
  };

  // If with wordmark, canvas becomes a horizontal lockup
  const padding = withWordmark ? S * 0.2 : 0;
  const totalWidth = withWordmark ? S + padding + S * 0.9 : S;
  const baselineX = withWordmark ? S + padding : 0;
  const baselineY = cy;

  return (
    <svg
      width={totalWidth}
      height={S}
      viewBox={`0 0 ${totalWidth} ${S}`}
      role="img"
      aria-label="Brand logo"
    >
      <defs>
        {/* Subtle shadow for depth */}
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy={S * 0.01}
            stdDeviation={S * 0.02}
            floodOpacity="0.15"
          />
        </filter>

        {/* Per-segment gradients (outer → inner) */}
        {mids.map((aMid, i) => {
          const [x1, y1] = toXY(RIB_OUT, aMid);
          const [x2, y2] = toXY(RIB_IN, aMid);
          return (
            <linearGradient
              key={`seg-${i}`}
              id={`seg-${i}`}
              gradientUnits="userSpaceOnUse"
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
            >
              <stop offset="0%" stopColor={pal.bodyFrom[i]} />
              <stop offset="100%" stopColor={pal.bodyTo[i]} />
            </linearGradient>
          );
        })}
      </defs>

      {/* --- Circular emblem --- */}
      <g filter="url(#softShadow)">
        {/* double ring */}
        <circle
          cx={cx}
          cy={cy}
          r={R_OUT}
          fill="none"
          stroke={pal.ring}
          strokeWidth={Math.max(2, S * 0.006)}
        />
        <circle
          cx={cx}
          cy={cy}
          r={R_IN}
          fill="none"
          stroke={pal.ring}
          strokeWidth={Math.max(1.2, S * 0.004)}
        />

        {/* connector arcs */}
        <g stroke={pal.ring} strokeWidth={Math.max(1.2, S * 0.004)} fill="none">
          {nodeAngles.map((a, i) => {
            const a2 = nodeAngles[(i + 1) % nodeAngles.length];
            const [x1, y1] = toXY(R_IN, a);
            const [x2, y2] = toXY(R_IN, a2);
            return (
              <path
                key={`conn-${i}`}
                d={`M ${x1} ${y1} A ${R_IN} ${R_IN} 0 0 1 ${x2} ${y2}`}
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* connector nodes */}
        {nodeAngles.map((a, i) => {
          const [nx, ny] = toXY(R_IN, a);
          return (
            <circle
              key={`node-${i}`}
              cx={nx}
              cy={ny}
              r={NODE_R}
              fill="#E6EEF3"
              stroke={pal.ring}
              strokeWidth={S * 0.0025}
            />
          );
        })}

        {/* wreath of ribbons + heads */}
        {mids.map((aMid, i) => {
          const [hx, hy] = toXY(R_HEAD, aMid);
          return (
            <g key={`person-${i}`}>
              <path d={pathAnnularRibbon(aMid)} fill={`url(#seg-${i})`} />
              <circle cx={hx} cy={hy} r={HEAD_R} fill={pal.heads[i]} />
            </g>
          );
        })}

        {/* monogram */}
        <text
          x={cx}
          y={cy + S * 0.045}
          textAnchor="middle"
          fontFamily="Inter, Segoe UI, system-ui, Arial, sans-serif"
          fontWeight="800"
          fontSize={S * 0.28}
          fill={pal.deep}
          letterSpacing={-S * 0.01}
        >
          {letter}
        </text>
      </g>

      {/* --- Optional wordmark lockup --- */}
      {withWordmark && (
        <g transform={`translate(${baselineX} ${baselineY})`}>
          <text
            x={0}
            y={-S * 0.03}
            fontFamily="Inter, Segoe UI, system-ui, Arial, sans-serif"
            fontWeight="800"
            fontSize={S * 0.19}
            fill={pal.deep}
            dominantBaseline="middle"
          >
            {wordmark}
          </text>
          {tagline ? (
            <text
              x={0}
              y={S * 0.12}
              fontFamily="Inter, Segoe UI, system-ui, Arial, sans-serif"
              fontWeight="500"
              fontSize={S * 0.06}
              fill="#6B7280"
            >
              {tagline}
            </text>
          ) : null}
        </g>
      )}
    </svg>
  );
}
