/**
 * 顏色相關工具函數
 * 提供顏色轉換、混合、主題管理等功能
 */

import { RequirementType } from '../types';

// ============================================================================
// 顏色常數
// ============================================================================

/**
 * Tailwind CSS 顏色對應的 hex 值
 */
export const TAILWIND_COLORS = {
  // Blue 系列
  'blue-100': '#DBEAFE',
  'blue-200': '#BFDBFE', 
  'blue-300': '#93C5FD',
  'blue-400': '#60A5FA',
  'blue-500': '#3B82F6',
  'blue-600': '#2563EB',
  'blue-700': '#1D4ED8',
  'blue-800': '#1E40AF',
  'blue-900': '#1E3A8A',

  // Red 系列
  'red-100': '#FEE2E2',
  'red-200': '#FECACA',
  'red-300': '#FCA5A5',
  'red-400': '#F87171',
  'red-500': '#EF4444',
  'red-600': '#DC2626',
  'red-700': '#B91C1C',
  'red-800': '#991B1B',
  'red-900': '#7F1D1D',

  // Green 系列
  'green-100': '#DCFCE7',
  'green-200': '#BBF7D0',
  'green-300': '#86EFAC',
  'green-400': '#4ADE80',
  'green-500': '#22C55E',
  'green-600': '#16A34A',
  'green-700': '#15803D',
  'green-800': '#166534',
  'green-900': '#14532D',

  // Purple 系列
  'purple-100': '#F3E8FF',
  'purple-200': '#E9D5FF',
  'purple-300': '#C4B5FD',
  'purple-400': '#A78BFA',
  'purple-500': '#8B5CF6',
  'purple-600': '#7C3AED',
  'purple-700': '#6D28D9',
  'purple-800': '#5B21B6',
  'purple-900': '#4C1D95',

  // Yellow 系列
  'yellow-100': '#FEF3C7',
  'yellow-200': '#FDE68A',
  'yellow-300': '#FCD34D',
  'yellow-400': '#FBBF24',
  'yellow-500': '#F59E0B',
  'yellow-600': '#D97706',
  'yellow-700': '#B45309',
  'yellow-800': '#92400E',
  'yellow-900': '#78350F',

  // Pink 系列
  'pink-100': '#FCE7F3',
  'pink-200': '#FBCFE8',
  'pink-300': '#F9A8D4',
  'pink-400': '#F472B6',
  'pink-500': '#EC4899',
  'pink-600': '#DB2777',
  'pink-700': '#BE185D',
  'pink-800': '#9D174D',
  'pink-900': '#831843',

  // Gray 系列
  'gray-50': '#F9FAFB',
  'gray-100': '#F3F4F6',
  'gray-200': '#E5E7EB',
  'gray-300': '#D1D5DB',
  'gray-400': '#9CA3AF',
  'gray-500': '#6B7280',
  'gray-600': '#4B5563',
  'gray-700': '#374151',
  'gray-800': '#1F2937',
  'gray-900': '#111827',
} as const;

/**
 * 需求類型的預設顏色配置
 */
export const REQUIREMENT_COLORS: Record<RequirementType, {
  primary: string;
  secondary: string;
  fill: string;
  stroke: string;
  text: string;
}> = {
  starbucks: {
    primary: TAILWIND_COLORS['blue-500'],
    secondary: TAILWIND_COLORS['blue-100'],
    fill: TAILWIND_COLORS['blue-300'],
    stroke: TAILWIND_COLORS['blue-400'],
    text: TAILWIND_COLORS['blue-800']
  },
  gym: {
    primary: TAILWIND_COLORS['red-500'],
    secondary: TAILWIND_COLORS['red-100'],
    fill: TAILWIND_COLORS['red-300'],
    stroke: TAILWIND_COLORS['red-400'],
    text: TAILWIND_COLORS['red-800']
  },
  convenience: {
    primary: TAILWIND_COLORS['green-500'],
    secondary: TAILWIND_COLORS['green-100'],
    fill: TAILWIND_COLORS['green-300'],
    stroke: TAILWIND_COLORS['green-400'],
    text: TAILWIND_COLORS['green-800']
  }
};

// ============================================================================
// 顏色轉換函數
// ============================================================================

/**
 * 十六進位顏色轉 RGB
 * @param hex 十六進位顏色 (例如: "#FF0000" 或 "FF0000")
 * @returns RGB 物件 { r, g, b }
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const cleanHex = hex.replace('#', '');
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);
  
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * RGB 轉十六進位顏色
 * @param r 紅色分量 (0-255)
 * @param g 綠色分量 (0-255)
 * @param b 藍色分量 (0-255)
 * @returns 十六進位顏色字串
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * HSL 轉 RGB
 * @param h 色相 (0-360)
 * @param s 飽和度 (0-100)
 * @param l 明度 (0-100)
 * @returns RGB 物件
 */
export const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // 無彩色
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

/**
 * RGB 轉 HSL
 * @param r 紅色分量 (0-255)
 * @param g 綠色分量 (0-255)
 * @param b 藍色分量 (0-255)
 * @returns HSL 物件 { h, s, l }
 */
export const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // 無彩色
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0; break;
    }
    
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

// ============================================================================
// 顏色操作函數
// ============================================================================

/**
 * 調整顏色的透明度
 * @param color 顏色（支援 hex 或 rgba）
 * @param alpha 透明度 (0-1)
 * @returns RGBA 顏色字串
 */
export const adjustOpacity = (color: string, alpha: number): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clampedAlpha})`;
};

/**
 * 調整顏色的亮度
 * @param color 十六進位顏色
 * @param amount 調整量 (-100 到 100)
 * @returns 調整後的十六進位顏色
 */
export const adjustBrightness = (color: string, amount: number): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const adjust = amount / 100 * 255;
  
  return rgbToHex(
    rgb.r + adjust,
    rgb.g + adjust,
    rgb.b + adjust
  );
};

/**
 * 調整顏色的飽和度
 * @param color 十六進位顏色
 * @param amount 調整量 (-100 到 100)
 * @returns 調整後的十六進位顏色
 */
export const adjustSaturation = (color: string, amount: number): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.s = Math.max(0, Math.min(100, hsl.s + amount));
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
};

/**
 * 混合兩種顏色
 * @param color1 第一種顏色
 * @param color2 第二種顏色
 * @param ratio 混合比例 (0-1，0為完全是color1，1為完全是color2)
 * @returns 混合後的顏色
 */
export const blendColors = (color1: string, color2: string, ratio: number = 0.5): string => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return color1;

  const clampedRatio = Math.max(0, Math.min(1, ratio));
  
  return rgbToHex(
    rgb1.r + (rgb2.r - rgb1.r) * clampedRatio,
    rgb1.g + (rgb2.g - rgb1.g) * clampedRatio,
    rgb1.b + (rgb2.b - rgb1.b) * clampedRatio
  );
};

/**
 * 混合多種顏色
 * @param colors 顏色陣列
 * @returns 混合後的顏色
 */
export const blendMultipleColors = (colors: string[]): string => {
  if (colors.length === 0) return '#000000';
  if (colors.length === 1) return colors[0];

  let totalR = 0, totalG = 0, totalB = 0;
  let validColors = 0;

  for (const color of colors) {
    const rgb = hexToRgb(color);
    if (rgb) {
      totalR += rgb.r;
      totalG += rgb.g;
      totalB += rgb.b;
      validColors++;
    }
  }

  if (validColors === 0) return '#000000';

  return rgbToHex(
    Math.round(totalR / validColors),
    Math.round(totalG / validColors),
    Math.round(totalB / validColors)
  );
};

// ============================================================================
// 主題相關函數
// ============================================================================

/**
 * 根據需求類型取得顏色配置
 * @param requirementType 需求類型
 * @returns 顏色配置物件
 */
export const getRequirementColors = (requirementType: RequirementType) => {
  return REQUIREMENT_COLORS[requirementType];
};

/**
 * 產生漸層顏色陣列
 * @param startColor 起始顏色
 * @param endColor 結束顏色
 * @param steps 步驟數
 * @returns 漸層顏色陣列
 */
export const generateGradientColors = (
  startColor: string,
  endColor: string,
  steps: number
): string[] => {
  const colors: string[] = [];
  
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    colors.push(blendColors(startColor, endColor, ratio));
  }
  
  return colors;
};

/**
 * 根據數值產生熱力圖顏色
 * @param value 數值 (0-1)
 * @param colorScheme 顏色方案
 * @returns 對應的顏色
 */
export const getHeatmapColor = (
  value: number,
  colorScheme: 'blue' | 'red' | 'green' | 'rainbow' = 'blue'
): string => {
  const clampedValue = Math.max(0, Math.min(1, value));

  switch (colorScheme) {
    case 'blue':
      return blendColors('#E3F2FD', '#0D47A1', clampedValue);
    case 'red':
      return blendColors('#FFEBEE', '#B71C1C', clampedValue);
    case 'green':
      return blendColors('#E8F5E8', '#1B5E20', clampedValue);
    case 'rainbow':
      if (clampedValue < 0.25) {
        return blendColors('#0000FF', '#00FFFF', clampedValue * 4);
      } else if (clampedValue < 0.5) {
        return blendColors('#00FFFF', '#00FF00', (clampedValue - 0.25) * 4);
      } else if (clampedValue < 0.75) {
        return blendColors('#00FF00', '#FFFF00', (clampedValue - 0.5) * 4);
      } else {
        return blendColors('#FFFF00', '#FF0000', (clampedValue - 0.75) * 4);
      }
    default:
      return '#000000';
  }
};

// ============================================================================
// 工具函數
// ============================================================================

/**
 * 驗證是否為有效的十六進位顏色
 * @param color 顏色字串
 * @returns 是否有效
 */
export const isValidHexColor = (color: string): boolean => {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * 計算顏色的對比度
 * @param color1 第一種顏色
 * @param color2 第二種顏色
 * @returns 對比度 (1-21)
 */
export const calculateContrast = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;

    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * 取得適合的文字顏色（黑色或白色）
 * @param backgroundColor 背景顏色
 * @returns 文字顏色
 */
export const getContrastTextColor = (backgroundColor: string): string => {
  const whiteContrast = calculateContrast(backgroundColor, '#FFFFFF');
  const blackContrast = calculateContrast(backgroundColor, '#000000');
  
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
};