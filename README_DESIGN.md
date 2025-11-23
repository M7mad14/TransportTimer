# 🎨 TransportTimer - Beautiful Design System

## Quick Visual Guide

### 🎯 Color Palette

#### Light Mode
```
█ #6366F1 Primary (Indigo)
█ #8B5CF6 Secondary (Purple)
█ #10B981 Success (Green)
█ #F59E0B Warning (Amber)
█ #EF4444 Danger (Red)
```

#### Dark Mode
```
█ #818CF8 Primary (Light Indigo)
█ #A78BFA Secondary (Light Purple)
█ #34D399 Success (Light Green)
█ #FBBF24 Warning (Light Amber)
█ #F87171 Danger (Light Red)
```

---

## 📐 Spacing System

```
xs   =  4px  ▪
sm   =  8px  ▪▪
md   = 12px  ▪▪▪
lg   = 16px  ▪▪▪▪
xl   = 20px  ▪▪▪▪▪
2xl  = 24px  ▪▪▪▪▪▪
3xl  = 32px  ▪▪▪▪▪▪▪▪
```

---

## 🎨 Component Showcase

### Buttons
```
┌─────────────────────────┐
│     Primary Action      │  54px height
│   #6366F1 background    │  16px border radius
│  Bold white text        │  Deep shadow
└─────────────────────────┘

┌─────────────────────────┐
│   Secondary Action      │  48px height
│  Light bg, dark text    │  16px border radius
│   Medium shadow         │  Less prominent
└─────────────────────────┘
```

### Cards
```
╔═══════════════════════════╗
║                           ║
║   Beautiful Card          ║  24px radius
║   Generous padding        ║  Soft shadow
║   Gradient border         ║  Elevated
║                           ║
╚═══════════════════════════╝
```

### Timer Display
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                         ┃
┃     00:15:42           ┃  64px font
┃                         ┃  Bold weight
┃   الوقت المنقضي        ┃  Premium feel
┃                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 🎭 Screen Designs

### Home (Timer)
```
┌─────────────────────────────────┐
│         ⏰ 00:15:42            │
│       الوقت المنقضي            │
│                                 │
│  ┌───────────────────────────┐ │
│  │    🚀 بدء الرحلة         │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │   🕐 الرحلات السابقة      │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │   ⚙️ الإعدادات            │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

### Statistics
```
┌─────────────────────────────────┐
│   📊 الإحصائيات                │
│                                 │
│  ┌──────────┐  ┌──────────┐   │
│  │ 📍 25    │  │ ⏱️ 45min │   │
│  │ رحلات    │  │ متوسط    │   │
│  └──────────┘  └──────────┘   │
│                                 │
│  ╔══════════════════════════╗  │
│  ║  الأحداث الأكثر شيوعاً  ║  │
│  ║  ▓▓▓▓▓▓▓░░░ ركوب        ║  │
│  ║  ▓▓▓▓░░░░░░ وصول        ║  │
│  ╚══════════════════════════╝  │
└─────────────────────────────────┘
```

---

## 💎 Design Tokens

### Typography Scale
```
Hero:     64px / 800 weight
Title:    28px / 800 weight
Heading:  22px / 700 weight
Body:     16px / 600 weight
Caption:  14px / 500 weight
Small:    12px / 400 weight
```

### Shadow Levels
```
Level 1:  elevation: 1 (subtle)
Level 2:  elevation: 2 (light)
Level 3:  elevation: 3 (medium)
Level 4:  elevation: 4 (strong)
Level 5:  elevation: 5 (dramatic)
```

### Border Radius
```
Small:    12px (inputs, chips)
Medium:   16px (buttons, small cards)
Large:    20px (standard cards)
XLarge:   24px (feature cards)
XXLarge:  32px (hero sections)
Circle:   50% (avatars, icons)
```

---

## 🎨 Usage Examples

### Creating a Card
```tsx
<ThemedView style={{
  padding: 24,
  borderRadius: 20,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 3,
  borderWidth: 1,
  borderColor: 'rgba(99, 102, 241, 0.1)'
}}>
  {/* Content */}
</ThemedView>
```

### Creating a Button
```tsx
<Pressable
  style={{
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#6366F1',
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3
  }}
>
  <Text style={{
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  }}>
    انقر هنا
  </Text>
</Pressable>
```

### Using Gradients
```tsx
import { GradientCard } from '@/components/GradientCard';

<GradientCard variant="primary">
  <Text style={{ color: '#FFFFFF' }}>
    Beautiful gradient!
  </Text>
</GradientCard>
```

---

## 🎯 Best Practices

### ✅ Do's
- Use the defined color palette
- Follow spacing scale
- Maintain consistent border radius
- Add shadows for depth
- Ensure 48px+ touch targets
- Use gradients sparingly

### ❌ Don'ts
- Mix different spacing values
- Use random colors
- Make buttons too small
- Overuse shadows
- Ignore RTL layout
- Forget dark mode

---

## 🌈 Color Combinations

### Primary Actions
```
Background: #6366F1 (Indigo)
Text:       #FFFFFF (White)
Icon:       #FFFFFF (White)
Shadow:     rgba(99, 102, 241, 0.3)
```

### Success States
```
Background: #10B981 (Green)
Text:       #FFFFFF (White)
Icon:       #FFFFFF (White)
Shadow:     rgba(16, 185, 129, 0.2)
```

### Cards
```
Background: #FFFFFF (Light) / #1F2937 (Dark)
Border:     rgba(99, 102, 241, 0.1)
Shadow:     rgba(0, 0, 0, 0.08)
Text:       #1F2937 (Light) / #F9FAFB (Dark)
```

---

## 📱 Responsive Design

### Small Screens (<400px)
- Reduce padding by 25%
- Use smaller font sizes
- Maintain minimum touch targets
- Compact spacing

### Medium Screens (400-600px)
- Standard spacing
- Full font sizes
- Comfortable padding
- Optimal for most phones

### Large Screens (>600px)
- Increased padding
- Larger text
- More generous spacing
- Tablet-optimized

---

## 🎨 Animation Guidelines

### Timing
```
Fast:    150-200ms (micro interactions)
Normal:  300-400ms (most transitions)
Slow:    500-600ms (major changes)
```

### Easing
```
Ease Out: Button press
Ease In:  Dismissals
Spring:   Bouncy actions
Linear:   Continuous motion
```

---

## 📐 Grid System

### Layout
```
Margins:  16px (mobile) / 24px (tablet)
Gutters:  12px between items
Columns:  12-column grid
Max Width: 1200px for large screens
```

---

## 🎯 Accessibility

### Contrast Ratios
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### Touch Targets
- Minimum: 48x48px
- Recommended: 54x54px
- Spacing: 8px between targets

### Focus States
- Visible outline
- High contrast
- 2px minimum width
- Never removed

---

## 🚀 Quick Start

1. **Import theme**:
   ```tsx
   import { useTheme } from '@/hooks/useTheme';
   const { theme } = useTheme();
   ```

2. **Use colors**:
   ```tsx
   backgroundColor: theme.accent
   color: theme.text
   ```

3. **Apply spacing**:
   ```tsx
   import { Spacing } from '@/constants/theme';
   padding: Spacing.lg
   ```

4. **Add shadows**:
   ```tsx
   shadowOffset: { width: 0, height: 4 },
   shadowOpacity: 0.08,
   shadowRadius: 16,
   elevation: 3,
   ```

---

## 🎉 Result

Beautiful, consistent, professional design throughout your entire app!

**Happy designing! 🎨✨**

