# Vocab Hero Design System

## Overview

Vocab Hero 的設計系統靈感來自 Duolingo，採用明亮、友善、遊戲化的視覺風格，旨在創造一個有趣且引人入勝的學習體驗。

## Design Principles

### 1. 友善與親和力 (Friendly & Approachable)
- 使用圓潤的圓角設計（1rem）
- 明亮、活潑的色彩
- 柔和的陰影效果

### 2. 清晰的視覺層次 (Clear Visual Hierarchy)
- 卡片式設計
- 明確的間距系統
- 一致的排版規則

### 3. 遊戲化元素 (Gamification)
- 進度條和成就徽章
- 動畫反饋（成功、錯誤）
- 連續天數追蹤

### 4. 響應式設計 (Responsive)
- Mobile-first 設計方法
- 適應各種螢幕尺寸
- 觸控友善的互動元素

## Color Palette

### Primary Colors

#### Duolingo Green (主色調)
- **Primary**: `oklch(0.72 0.19 142)` - #58CC02
- **Primary Foreground**: `oklch(1 0 0)` - White
- 用途：主要按鈕、連結、強調元素

#### Secondary Green (次要色)
- **Secondary**: `oklch(0.95 0.05 142)` - Light Green
- **Secondary Foreground**: `oklch(0.35 0.15 142)` - Dark Green
- 用途：次要按鈕、背景區塊

### Semantic Colors

#### Success (成功)
- **Success**: `oklch(0.72 0.19 142)` - Green
- **Success Foreground**: `oklch(1 0 0)` - White
- 用途：成功訊息、正確答案

#### Warning (警告)
- **Warning**: `oklch(0.75 0.15 85)` - Yellow
- **Warning Foreground**: `oklch(0.3 0.1 85)` - Dark Yellow
- 用途：警告訊息、提示

#### Destructive (錯誤/刪除)
- **Destructive**: `oklch(0.6 0.22 25)` - Red
- **Destructive Foreground**: White
- 用途：錯誤訊息、刪除按鈕

#### Info (資訊)
- **Info**: `oklch(0.65 0.2 240)` - Blue
- **Info Foreground**: `oklch(1 0 0)` - White
- 用途：資訊提示、說明

### Neutral Colors

#### Background
- **Light Mode**: `oklch(0.98 0.005 240)` - Very Light Blue-Gray
- **Dark Mode**: `oklch(0.15 0.01 240)` - Very Dark Blue-Gray

#### Foreground (Text)
- **Light Mode**: `oklch(0.25 0.01 240)` - Dark Gray
- **Dark Mode**: `oklch(0.95 0.005 240)` - Light Gray

#### Card
- **Light Mode**: `oklch(1 0 0)` - Pure White
- **Dark Mode**: `oklch(0.2 0.01 240)` - Dark Gray

#### Border
- **Light Mode**: `oklch(0.9 0.005 240)` - Light Gray
- **Dark Mode**: `oklch(0.3 0.01 240)` - Medium Gray

### Chart Colors

用於數據視覺化的活潑色彩：

1. **Chart 1**: `oklch(0.72 0.19 142)` - Green
2. **Chart 2**: `oklch(0.65 0.2 240)` - Blue
3. **Chart 3**: `oklch(0.7 0.18 60)` - Yellow
4. **Chart 4**: `oklch(0.65 0.2 320)` - Purple
5. **Chart 5**: `oklch(0.65 0.2 25)` - Red

## Typography

### Font Families

- **Sans-serif**: Geist Sans (主要字體)
- **Monospace**: Geist Mono (代碼、日文假名)

### Font Sizes

遵循 Tailwind CSS 的字體大小系統：

- `text-xs`: 0.75rem (12px)
- `text-sm`: 0.875rem (14px)
- `text-base`: 1rem (16px)
- `text-lg`: 1.125rem (18px)
- `text-xl`: 1.25rem (20px)
- `text-2xl`: 1.5rem (24px)
- `text-3xl`: 1.875rem (30px)
- `text-4xl`: 2.25rem (36px)

### Font Weights

- `font-normal`: 400
- `font-medium`: 500
- `font-semibold`: 600
- `font-bold`: 700

## Spacing

使用 Tailwind CSS 的間距系統（基於 0.25rem = 4px）：

- `1`: 0.25rem (4px)
- `2`: 0.5rem (8px)
- `3`: 0.75rem (12px)
- `4`: 1rem (16px)
- `6`: 1.5rem (24px)
- `8`: 2rem (32px)
- `12`: 3rem (48px)
- `16`: 4rem (64px)

## Border Radius

Duolingo 風格的圓潤設計：

- **Base Radius**: `1rem` (16px)
- `radius-sm`: 0.75rem (12px)
- `radius-md`: 0.875rem (14px)
- `radius-lg`: 1rem (16px) - 預設
- `radius-xl`: 1.25rem (20px)
- `radius-2xl`: 1.5rem (24px)
- `radius-3xl`: 1.75rem (28px)
- `radius-4xl`: 2rem (32px)

## Shadows

### Card Shadow
```css
box-shadow: 0 2px 8px oklch(0 0 0 / 0.08);
```

### Card Hover Shadow
```css
box-shadow: 0 4px 16px oklch(0 0 0 / 0.12);
```

### Button Shadow (Duolingo Style)
```css
box-shadow: 0 4px 0 0 oklch(0.6 0.19 142);
```

## Animations

### Success Animation
```css
@keyframes success-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

### Error Animation
```css
@keyframes error-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

## Component Patterns

### Buttons

#### Primary Button
- Background: Primary Green
- Text: White
- Shadow: Bottom shadow (Duolingo style)
- Hover: Slightly darker
- Active: Translate down + reduce shadow

#### Secondary Button
- Background: Secondary Green
- Text: Dark Green
- Border: Optional
- Hover: Slightly darker background

### Cards

- Background: Card color (white in light mode)
- Border Radius: `radius-lg` (1rem)
- Shadow: `card-shadow`
- Hover: `card-shadow-hover` (lift effect)

### Progress Bars

- Background: Muted color
- Fill: Green gradient
- Border Radius: Full (9999px)
- Height: 0.5rem - 1rem
- Transition: Smooth width change

## Usage Guidelines

### Do's ✅

- 使用圓潤的圓角（至少 1rem）
- 使用明亮、友善的顏色
- 提供清晰的視覺反饋（動畫、顏色變化）
- 保持一致的間距和對齊
- 使用卡片式設計來組織內容

### Don'ts ❌

- 避免尖銳的角落
- 避免過於暗淡或嚴肅的顏色
- 避免過度使用動畫（保持簡潔）
- 避免不一致的間距
- 避免過於擁擠的佈局

