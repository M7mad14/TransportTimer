# Transportation Timer - مؤقّت الرحلات

## Overview

Transportation Timer is a React Native mobile application built with Expo that helps users track multi-stop trips with different transportation modes. The app records timestamps for various trip events (leaving home, boarding car/metro, arrival, etc.) and generates Arabic-formatted summaries that can be copied and shared. All data is stored locally on the device with no backend requirements.

**Key Features:**
- Track trip events with timestamps
- Add custom events and photos
- Calculate time differences between events
- Generate and share trip summaries
- View trip history with editing capabilities
- Fully Arabic interface with RTL layout

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React Native with Expo SDK 54
- **Navigation:** React Navigation v7 with native stack navigator
- **State Management:** React hooks (useState, useEffect, useCallback)
- **UI Components:** Custom themed components with dark/light mode support
- **Animations:** React Native Reanimated for smooth interactions
- **Gesture Handling:** React Native Gesture Handler for improved touch interactions
- **Styling:** StyleSheet API with centralized theme system

**Design System:**
- Centralized theme constants (`constants/theme.ts`) defining colors, spacing, typography, and border radius
- Custom themed components (`ThemedView`, `ThemedText`) that adapt to light/dark mode
- Reusable layout components (`ScreenScrollView`, `ScreenKeyboardAwareScrollView`, `ScreenFlatList`)
- Consistent spacing and elevation system
- RTL (right-to-left) support for Arabic language

**Component Architecture:**
- Screen components for main views (TimerScreen, HistoryScreen, TripDetailScreen)
- Reusable UI components (Button, Card, HeaderTitle, ErrorBoundary)
- Custom hooks for theme and screen insets
- Error boundary for graceful error handling

### Data Storage

**Storage Solution:** AsyncStorage (React Native AsyncStorage)
- All data stored locally on device
- No backend or cloud synchronization
- Data persists across app sessions

**Data Models:**
```typescript
TripEvent: {
  id: number
  label: string (Arabic)
  time: Date
  timeDiff?: number (seconds)
  photoUri?: string (local file path)
}

SavedTrip: {
  id: string (timestamp-based)
  startTime: Date
  endTime: Date
  events: TripEvent[]
  summary: string (Arabic formatted text)
}
```

**Storage Operations:**
- Save new trips with auto-generated IDs
- Retrieve all trips with date deserialization
- Update existing trip events
- Delete trips from history
- Recalculate trip data after edits

### Navigation Structure

**Single Stack Navigator:**
- Timer Screen (Home) - Main trip tracking interface
- History Screen - List of saved trips
- Trip Detail Screen - View and edit individual trips

**Navigation Features:**
- Transparent headers with blur effects (iOS)
- Custom header titles with app icon
- Platform-specific styling (iOS/Android/Web)
- Gesture-based navigation

### Platform Support

**Target Platforms:**
- iOS (primary)
- Android (edge-to-edge enabled)
- Web (limited support with fallbacks)

**Platform-Specific Adaptations:**
- KeyboardAwareScrollView falls back to regular ScrollView on web
- Different header styling per platform
- Conditional gesture handling based on platform capabilities

### Build System

**Babel Configuration:**
- Module resolver for `@/` path alias
- React Native Reanimated plugin
- Expo preset

**TypeScript Configuration:**
- Strict mode enabled
- Path mapping for clean imports
- Expo base configuration extended

**Development Features:**
- React Compiler experiments enabled
- New React Native architecture support
- Hot reloading via Expo Dev Client

### Internationalization

**Language:** Arabic only
- All UI text in Arabic
- RTL layout enforced via `I18nManager.forceRTL(true)`
- Right-aligned text throughout
- Arabic time formatting (hours, minutes, seconds)

### Error Handling

**Error Boundary Implementation:**
- Class-based ErrorBoundary component wrapping app root
- Custom ErrorFallback with developer mode details
- App restart capability via `expo.reloadAppAsync()`
- Modal for viewing error stack traces in development

## External Dependencies

### Core Dependencies

**Expo Framework:**
- `expo` - Core Expo SDK
- `expo-status-bar` - Status bar styling
- `expo-splash-screen` - Splash screen management
- `expo-constants` - App constants and config
- `expo-font` - Custom font loading
- `expo-linking` - Deep linking support
- `expo-system-ui` - System UI customization

**Navigation:**
- `@react-navigation/native` - Navigation framework
- `@react-navigation/native-stack` - Native stack navigator
- `@react-navigation/bottom-tabs` - Tab navigation (installed but not actively used)
- `@react-navigation/elements` - Navigation UI elements
- `react-native-screens` - Native screen components
- `react-native-safe-area-context` - Safe area handling

**UI & Interaction:**
- `react-native-gesture-handler` - Advanced gesture handling
- `react-native-reanimated` - High-performance animations
- `react-native-keyboard-controller` - Keyboard management
- `@expo/vector-icons` - Icon library
- `expo-blur` - Blur effects
- `expo-glass-effect` - Glass morphism effects
- `expo-haptics` - Haptic feedback
- `expo-image` - Optimized image component
- `expo-symbols` - SF Symbols support

**Media & Sharing:**
- `expo-image-picker` - Photo selection from gallery
- `expo-clipboard` - Clipboard operations
- `expo-sharing` - Native share sheet
- `expo-web-browser` - In-app browser

**Storage:**
- `@react-native-async-storage/async-storage` - Local key-value storage (no database)

**Development:**
- `eslint` - Code linting
- `eslint-config-expo` - Expo-specific ESLint rules
- `eslint-plugin-prettier` - Prettier integration
- `babel-plugin-module-resolver` - Path aliasing
- `@types/react` - TypeScript definitions

### Runtime Environment

**Deployment:** Replit-hosted Expo development server
- Environment variables for Replit domain configuration
- Custom dev script for Replit proxy URL handling
- Static hosting capability via build script

**No External Services:**
- No authentication providers
- No cloud storage or databases
- No analytics or crash reporting
- No push notifications
- No ads or monetization services