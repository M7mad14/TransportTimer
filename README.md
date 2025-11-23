# 🚀 TransportTimer - مؤقت الرحلات

A beautiful, modern Arabic transportation timing app built with React Native and Expo.

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB.svg)
![Expo](https://img.shields.io/badge/Expo-54.0.23-000020.svg)

---

## ✨ Features

### 🕐 Trip Timing
- Precise trip tracking with millisecond accuracy
- Real-time elapsed timer display
- Multiple event logging per trip
- Time difference calculations

### 📍 Location Tracking
- Start location input
- GPS auto-location
- Maps integration
- Location history

### 📊 Statistics & Analytics
- Total trips and duration
- Average trip length
- Most common events
- Day/hour distribution
- Visual charts and graphs

### 📤 Export & Backup
- Export to JSON, CSV, Text
- Full backup/restore system
- Share functionality
- Data portability

### 🔐 Security
- PIN authentication
- Biometric (Face ID/Touch ID)
- Local data storage
- Privacy-focused

### 🎨 Beautiful UI
- Modern gradient design
- Card-based layout
- Smooth animations
- Dark mode support
- RTL (Arabic) layout

---

## 📱 Screenshots

```
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│                     │   │                     │   │                     │
│    ⏰ 00:15:42     │   │   📊 إحصائيات     │   │   📤 تصدير         │
│                     │   │                     │   │                     │
│  🚀 بدء رحلة جديدة │   │  ┌─────┐ ┌─────┐  │   │  💾 JSON           │
│                     │   │  │ 25  │ │45min│  │   │  📊 CSV            │
│  ┌────┐  ┌────┐   │   │  └─────┘ └─────┘  │   │  📄 Text           │
│  │رحلات│  │أحداث│   │   │                     │   │                     │
│  └────┘  └────┘   │   │  📈 تحليلات        │   │  [Share Button]    │
│                     │   │                     │   │                     │
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘
    Timer Screen           Statistics Screen        Export Screen
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd TransportTimer

# Install dependencies
npm install

# Start the development server
npm start

# Or run on specific platform
npm run ios
npm run android
npm run web
```

---

## 📁 Project Structure

```
TransportTimer/
├── screens/           # Main app screens
│   ├── TimerScreen.tsx
│   ├── HistoryScreen.tsx
│   ├── StatisticsScreen.tsx
│   ├── ExportScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── TripDetailScreen.tsx
│   └── AuthScreen.tsx
├── components/        # Reusable components
│   ├── ThemedText.tsx
│   ├── ThemedView.tsx
│   ├── AnimatedPressable.tsx
│   ├── FadeInView.tsx
│   ├── LoadingSpinner.tsx
│   └── ...
├── hooks/            # Custom React hooks
│   ├── useTrips.ts
│   ├── useTripTimer.ts
│   ├── useHaptics.ts
│   └── useTheme.ts
├── utils/            # Utility functions
│   ├── storage.ts
│   ├── exportTrips.ts
│   ├── backup.ts
│   └── tripAnalytics.ts
├── constants/        # Theme and constants
│   └── theme.ts
└── navigation/       # Navigation setup
    └── RootStackNavigator.tsx
```

---

## 🎨 Design System

### Colors
```typescript
Primary:   #6366F1 (Indigo)
Secondary: #8B5CF6 (Purple)
Success:   #10B981 (Green)
Warning:   #F59E0B (Amber)
Danger:    #EF4444 (Red)
```

### Spacing
```typescript
xs:  4px   md: 12px   xl:  20px   3xl: 32px
sm:  8px   lg: 16px   2xl: 24px   4xl: 40px
```

### Border Radius
```typescript
sm: 16px   lg: 24px   2xl: 32px
md: 20px   xl: 28px   full: 9999px
```

See [README_DESIGN.md](./README_DESIGN.md) for complete design documentation.

---

## 🔧 Configuration

### Theme Customization
Edit `constants/theme.ts` to customize colors, spacing, and typography.

### Navigation
Modify `navigation/RootStackNavigator.tsx` to add or change screens.

### Storage
All data is stored locally using AsyncStorage. See `utils/storage.ts`.

---

## 📚 Documentation

- **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** - Feature improvements list
- **[DESIGN_CHANGES.md](./DESIGN_CHANGES.md)** - Design overhaul details
- **[LAYOUT_IMPROVEMENTS.md](./LAYOUT_IMPROVEMENTS.md)** - Layout restructuring
- **[README_DESIGN.md](./README_DESIGN.md)** - Design system guide
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history

---

## 🛠️ Built With

- **[React Native](https://reactnative.dev/)** - Mobile framework
- **[Expo](https://expo.dev/)** - Development platform
- **[React Navigation](https://reactnavigation.org/)** - Navigation
- **[React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)** - Animations
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** - Local storage
- **[Expo Vector Icons](https://icons.expo.fyi/)** - Icon set
- **TypeScript** - Type safety

---

## 📦 Key Dependencies

```json
{
  "react-native": "0.81.5",
  "expo": "^54.0.23",
  "react-navigation": "^7.x",
  "react-native-reanimated": "~4.1.1",
  "expo-linear-gradient": "latest",
  "expo-local-authentication": "^17.0.7",
  "expo-document-picker": "^14.0.7"
}
```

---

## 🎯 Features Overview

### Timer Screen
- Start/stop trip tracking
- Quick action grid
- Event shortcuts
- Custom event input
- Location tracking
- Photo attachments

### History Screen
- Search and filter trips
- Sort by date/duration
- Quick access to stats
- Export options
- Trip detail view

### Statistics Screen
- Trip metrics
- Event analysis
- Temporal patterns
- Visual charts
- Trend tracking

### Export Screen
- Multiple formats
- Native sharing
- Easy backup
- Data portability

### Settings Screen
- Biometric auth
- Backup/restore
- Data management
- App information

---

## 🔐 Security & Privacy

- **Local Storage**: All data stored on device
- **No Cloud**: No data sent to servers
- **PIN Protection**: Optional PIN security
- **Biometric Auth**: Face ID/Touch ID support
- **User Control**: Full data export/delete

---

## 🌍 Localization

Currently supports:
- ✅ Arabic (ar) - Full RTL support

Coming soon:
- English (en)
- French (fr)

---

## 📱 Platform Support

- ✅ iOS 13+
- ✅ Android 5.0+
- ✅ Web (limited)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Built with ❤️ using React Native and Expo

---

## 🎉 Acknowledgments

- Expo team for the amazing platform
- React Native community
- All open source contributors

---

## 📞 Support

For support, please open an issue in the repository.

---

## 🗺️ Roadmap

### v1.2.0 (Planned)
- [ ] Cloud sync
- [ ] Home screen widgets
- [ ] Voice commands
- [ ] Apple Watch app
- [ ] More languages

### v1.3.0 (Future)
- [ ] Trip templates
- [ ] Calendar integration
- [ ] Advanced analytics
- [ ] Social features

---

**Made with 💙 in React Native**

