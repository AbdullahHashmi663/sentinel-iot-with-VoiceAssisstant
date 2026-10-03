"use client";

import React from 'react';

// Rich Cyber Defense Chinese Characters + Classic Matrix Katakana
const CHINESE_CYBER_CHARS = "零日防御网络安全机密系统矩阵量子终端数据流监控态势雷达拦截核心协议加密信道破解漏洞烽火卫士智能审计威胁溯源认证节点溯流战术阻断凭证隔离侦测诱捕沙箱规避侵入防火墙指令代码追踪预警密钥拓扑集群算力节点";
const KATAKANA_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ";

// Interleave Chinese cyber words and Katakana for balanced digital rain distribution
const MATRIX_STRING = Array.from(
  { length: Math.max(CHINESE_CYBER_CHARS.length, KATAKANA_CHARS.length) * 2 },
  (_, i) => (i % 2 === 0
    ? CHINESE_CYBER_CHARS[(i / 2) % CHINESE_CYBER_CHARS.length]
    : KATAKANA_CHARS[Math.floor(i / 2) % KATAKANA_CHARS.length])
).join("");

// Deterministic static distribution across 3200 cells (high density for all viewports)
// 30% Slate/Carbon Ink, 18% Emerald Green, 52% Cyber Cobalt Blue
const MATRIX_ITEMS = Array.from({ length: 3200 }, (_, i) => {
  const char = MATRIX_STRING[i % MATRIX_STRING.length];
  // Deterministic pseudo-random hash across index
  const hash = (i * 9301 + 49297) % 233280;
  const ratio = hash / 233280;

  let colorClass = "c-blue"; // Default 52%
  if (ratio < 0.30) {
    colorClass = "c-white"; // 30% Carbon Black/Ink in light mode, White in dark mode
  } else if (ratio < 0.48) {
    colorClass = "c-green"; // 18% Emerald Cyber Green
  }

  return { char, colorClass };
});

export default function Pattern() {
  return (
    <div className="jp-matrix-wrapper w-full h-full absolute inset-0 pointer-events-none select-none">
      <div className="jp-matrix">
        {MATRIX_ITEMS.map((item, idx) => (
          <span key={idx} className={item.colorClass}>
            {item.char}
          </span>
        ))}
      </div>
    </div>
  );
}
