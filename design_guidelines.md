# Transportation Timer - Mobile Design Guidelines

## Core Requirements

### Language & Direction
- **All interface elements MUST be in Arabic**
- **Entire app MUST use RTL (right-to-left) layout**
- All text labels, buttons, placeholders, alerts, and summary content in Arabic
- Text alignment: right-aligned throughout

## Architecture Decisions

### Authentication
**No authentication required** - This is a single-user utility app with local data storage only.

### Navigation
**Stack-Only Navigation** - Single screen app with no tab bar or drawer navigation.

## Screen Specifications

### Main Screen (Trip Timer Screen)

**Screen Name:** Transportation Timer ("مؤقّت الرحلات")

**Layout:**
- **Header:** Standard navigation header with title "مؤقّت الرحلات"
- **Main Content:** Scrollable view with white card container
- **Safe Area Insets:** 
  - Top: insets.top + Spacing.xl
  - Bottom: insets.bottom + Spacing.xl
  - Horizontal: Spacing.lg

**Card Container:**
- White background (#FFFFFF)
- Rounded corners (borderRadius: 16)
- Soft shadow:
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.08
  - shadowRadius: 8
- Padding: Spacing.lg

**Content Sections (Top to Bottom):**

1. **Control Buttons Section:**
   - Grid layout of primary action buttons
   - Buttons (in order):
     - "بدء الرحلة" (Start Trip) - Primary action, accent color
     - "خروج من المنزل" (Exit Home)
     - "ركوب السيارة" (Ride Car)
     - "ركوب المترو" (Ride Metro)
     - "الوصول للوجهة" (Arrive Destination)
     - "إعادة تعيين" (Reset) - Destructive color
   - Button styling: Rounded (borderRadius: 8), minimum touch target 44pt
   - Disabled state for event buttons until trip starts
   - Visual feedback on press (slight opacity reduction to 0.7)

2. **Custom Event Section:**
   - Text input field
     - Placeholder: "اكتب وصف الحدث (مثلاً: توقف عند محطة البنزين)"
     - RTL text alignment
     - Border: subtle gray, rounded corners
   - Button: "إضافة حدث مخصص"
     - Full width below input
     - Same styling as event buttons

3. **Events Table:**
   - Four columns (RTL order):
     - "#" (Event number)
     - "الحدث" (Event description)
     - "الوقت" (Time - HH:MM:SS)
     - "الفرق عن الحدث السابق" (Time difference)
   - Header row: Bold text, subtle background
   - Data rows: Clean separation with subtle borders
   - Scrollable if content exceeds viewport

4. **Summary Section:**
   - Label: "ملخص الرحلة" (Trip Summary)
   - Read-only textarea/text display
     - Light gray background
     - RTL text
     - Minimum height to show multiple lines
     - Rounded corners
   - Button: "نسخ الملخص" (Copy Summary)
     - Full width below summary
     - Success state after copy

5. **Footer Note:**
   - Small, light gray text
   - Content: "الوقت يُحسب بحسب ساعة جهازك. يمكنك نسخ الملخص ولصقه في واتساب أو الملاحظات."

## Visual Design

### Color Palette
- **Background:** Light gray (#F5F5F5)
- **Card Background:** White (#FFFFFF)
- **Primary/Accent:** Blue or teal for "بدء الرحلة" button
- **Destructive:** Red for "إعادة تعيين" button
- **Secondary Buttons:** Light gray or neutral color
- **Text Primary:** Dark gray/black (#1A1A1A)
- **Text Secondary:** Medium gray (#666666)
- **Borders:** Light gray (#E0E0E0)

### Typography
- **Screen Title:** Bold, 20-22pt
- **Button Text:** Medium weight, 16pt
- **Table Headers:** Bold, 14pt
- **Table Content:** Regular, 14pt
- **Summary Text:** Regular, 14pt
- **Footer Text:** Regular, 12pt
- **All text must support Arabic characters properly**

### Spacing
- Card padding: 16-20pt
- Button spacing: 12pt between buttons
- Section spacing: 20-24pt vertical separation
- Input padding: 12pt
- Table cell padding: 8-12pt

## Interaction Design

### Time Formatting
Time differences displayed in Arabic format:
- Seconds only: "30 ث"
- Minutes only: "5 د"
- Minutes and seconds: "3 د و 20 ث"
- First event: "-" or empty

### Summary Format (Arabic)
```
ملخص الرحلة:

1- بداية الرحلة عند 14:05:10
2- خروج من المنزل عند 14:10:00 (بعد 4 د و 50 ث من الحدث السابق)
3- ركوب السيارة عند 14:20:30 (بعد 10 د و 30 ث من الحدث السابق)

إجمالي مدة الرحلة تقريباً: 25 د و 20 ث
```

### Button States
- **Start Trip:** Enabled initially, clears previous data on press
- **Event Buttons:** Disabled until trip starts
- **Custom Event:** Disabled until trip starts, does nothing if input empty
- **Reset:** Always enabled, shows confirmation alert in Arabic
- **Copy:** Shows success alert in Arabic: "تم نسخ الملخص إلى الحافظة ✅"

### Alerts
- Copy success: "تم نسخ الملخص إلى الحافظة ✅"
- Copy failure: "لم يتم النسخ تلقائياً، انسخ النص يدوياً."
- All alerts in Arabic

## Accessibility
- Minimum touch targets: 44pt x 44pt
- High contrast between text and background
- Clear button labels in Arabic
- Visual feedback for all touchable elements
- Support for Arabic screen readers

## Assets
**No custom assets required** - Use standard system icons for buttons if needed, but primary focus is on clear Arabic text labels.