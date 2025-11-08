# 📱 Mobile & Accessibility Development Guidelines

> **Living Document** - Reference this for all new features

---

## 🎯 Core Principles

### **1. Accessibility First**
Every feature MUST meet WCAG 2.1 AA before merge.

### **2. Mobile First**
Design for iPad/tablet, enhance for desktop.

### **3. Progressive Enhancement**
Basic functionality works everywhere, advanced features enhance experience.

---

## ✅ Mobile Features Checklist

### **Current Mobile Optimizations** ✅

#### **Touch Interactions**
- [x] Pull-to-refresh gesture (implemented)
- [x] Large touch targets (44px+ minimum)
- [x] No hover-dependent interactions
- [x] Swipe-friendly cards (mobile view)
- [x] Proper spacing between interactive elements

#### **Responsive Design**
- [x] Mobile-first breakpoints (md: 768px)
- [x] Card layout on mobile (< 768px)
- [x] Table layout on tablet/desktop (≥ 768px)
- [x] Flexible search bar (wraps on mobile)
- [x] Readable text sizes (16px+ base)

#### **Performance**
- [x] Pagination (20 items default)
- [x] Search filtering (instant, no API calls)
- [x] Time-based refresh (30s service, 5min off-hours)
- [x] Request deduplication
- [x] Lazy loading (pagination)

#### **Accessibility**
- [x] WCAG 2.1 AA compliant
- [x] Keyboard navigation
- [x] Screen reader support (ARIA labels)
- [x] Focus indicators
- [x] High contrast colors

---

## 🚀 Recommended Mobile Enhancements

### **HIGH PRIORITY** (Next Sprint)

#### 1. **Progressive Web App (PWA)** 🔥
**Why**: Install on iPad home screen, works offline, feels native

**Implementation**:
```javascript
// public/manifest.json
{
  "name": "Radiant Kids Check-In",
  "short_name": "Kids Check-In",
  "description": "Live classroom check-in dashboard",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#10B981",
  "theme_color": "#10B981",
  "orientation": "landscape-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Benefits**:
- ✅ Add to home screen
- ✅ No browser chrome (immersive)
- ✅ Faster load times
- ✅ Offline fallback page

**Accessibility**: Add manifest for better mobile experience

---

#### 2. **Haptic Feedback** 📳
**Why**: Tactile confirmation of actions on touch devices

**Implementation**:
```typescript
// Add to check-out handlers
const vibrateOnAction = () => {
  if (navigator.vibrate) {
    navigator.vibrate(50); // Short vibration
  }
};

// In handleCheckOut
const handleCheckOut = (securityCode: string) => {
  vibrateOnAction();
  // ... existing code
};
```

**Use Cases**:
- Check-out button press
- Family expand/collapse
- Search clear
- Show More/All button

**Accessibility**: Provides non-visual confirmation for motor-impaired users

---

#### 3. **Native Keyboard Handling** ⌨️
**Why**: Better iPad keyboard experience

**Implementation**:
```typescript
// pages/index.tsx - Add keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Focus search on "/"
    if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
    
    // Clear search on "Escape"
    if (e.key === 'Escape') {
      setSearchQuery('');
    }
    
    // Refresh on "R"
    if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
      e.preventDefault();
      fetchCheckIns(true);
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

**Shortcuts**:
- `/` - Focus search
- `Esc` - Clear search
- `Cmd/Ctrl + R` - Force refresh

**Accessibility**: Essential for keyboard-only users

---

#### 4. **Offline Detection** 🌐
**Why**: Show status when internet drops

**Implementation**:
```tsx
// components/OfflineIndicator.tsx
export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline) return null;
  
  return (
    <div 
      className="fixed top-0 left-0 right-0 bg-orange-500 text-white px-4 py-2 text-center z-50"
      role="alert"
      aria-live="assertive"
    >
      ⚠️ No internet connection - showing cached data
    </div>
  );
}
```

**Accessibility**: `role="alert"` announces to screen readers

---

#### 5. **Landscape/Portrait Lock Message** 📲
**Why**: App works best in landscape on tablets

**Implementation**:
```tsx
// components/OrientationPrompt.tsx
export default function OrientationPrompt() {
  const [isPortrait, setIsPortrait] = useState(false);
  
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);
  
  if (!isPortrait) return null;
  
  return (
    <div className="fixed inset-0 bg-primary-600 text-white flex items-center justify-center z-50 p-8">
      <div className="text-center">
        <svg className="w-24 h-24 mx-auto mb-4 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
        <h2 className="text-2xl font-bold mb-2">Rotate Device</h2>
        <p className="text-lg">
          For the best experience, please rotate your device to landscape mode.
        </p>
      </div>
    </div>
  );
}
```

**Accessibility**: Clear visual and text prompt

---

### **MEDIUM PRIORITY** (Nice to Have)

#### 6. **Service Worker (Offline Caching)** 💾
**Why**: Works offline, faster loads

**Implementation**: Next.js PWA plugin
```bash
npm install next-pwa
```

**Benefits**:
- Cache static assets
- Offline fallback page
- Background sync for check-outs

---

#### 7. **Touch Gesture Enhancements** 👆
**Current**: Pull-to-refresh  
**Add**:
- Long-press for quick actions
- Swipe family rows left to check-out
- Pinch-to-zoom on medical notes (accessibility!)

---

#### 8. **Voice Input for Search** 🎤
**Why**: Hands-free when managing kids

**Implementation**:
```typescript
const startVoiceSearch = () => {
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };
    recognition.start();
  }
};
```

**Accessibility**: Critical for motor-impaired users

---

#### 9. **Dark Mode** 🌙
**Why**: Better for evening services, accessibility

**Implementation**: TailwindCSS `darkMode: 'class'`
```css
/* Auto-detect system preference */
@media (prefers-color-scheme: dark) {
  /* Dark styles */
}
```

**Accessibility**: Reduces eye strain, helps dyslexia

---

#### 10. **Smart App Banner (iOS)** 🍎
**Why**: Prompts to add to home screen

**Implementation**:
```html
<!-- pages/_document.tsx -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Kids Check-In" />
```

---

## 📝 New Feature Checklist

Use this checklist for **EVERY** new feature:

### **Accessibility Requirements** ✅

#### Color & Contrast
- [ ] Text contrast: 4.5:1 minimum (normal), 3:1 (large 18px+)
- [ ] UI component contrast: 3:1 minimum
- [ ] No information by color alone
- [ ] Test with WebAIM Contrast Checker

#### Keyboard Navigation
- [ ] All interactive elements reachable via Tab
- [ ] Focus indicators visible (2px+ border/ring)
- [ ] Logical tab order
- [ ] No keyboard traps
- [ ] Test without mouse

#### Screen Readers
- [ ] All images have `alt` text or `aria-label`
- [ ] Decorative images have `aria-hidden="true"`
- [ ] Buttons have descriptive labels
- [ ] Form inputs have labels or `aria-label`
- [ ] Dynamic content uses `aria-live`
- [ ] Test with VoiceOver/NVDA

#### Touch Targets (Mobile)
- [ ] Minimum 44x44px touch targets
- [ ] 8px spacing between targets
- [ ] No overlapping hit areas
- [ ] Test on actual device

#### ARIA Attributes
- [ ] Use semantic HTML first (`<button>`, `<nav>`, etc.)
- [ ] Add ARIA only when necessary
- [ ] `role`, `aria-label`, `aria-expanded` as needed
- [ ] `aria-live` for dynamic updates

---

### **Mobile Requirements** 📱

#### Responsive Design
- [ ] Mobile-first approach
- [ ] Test at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll
- [ ] Readable text (16px+ base)
- [ ] Touch-friendly spacing

#### Performance
- [ ] Lazy load images/components
- [ ] Paginate large lists (20-50 items)
- [ ] Debounce search (if API-based)
- [ ] Minimize re-renders
- [ ] Lighthouse score: 90+ performance

#### Touch Interactions
- [ ] Pull-to-refresh (if applicable)
- [ ] No hover-only interactions
- [ ] Visual feedback on tap (ripple, highlight)
- [ ] Swipe gestures documented
- [ ] Prevent accidental taps (confirmation for destructive actions)

#### Network Awareness
- [ ] Show loading states
- [ ] Handle offline gracefully
- [ ] Retry failed requests
- [ ] Cache when possible

---

## 🎨 Mobile Design Patterns

### **Touch Targets**
```tsx
// ✅ GOOD - 44px minimum
<button className="px-4 py-3">Check Out</button>

// ❌ BAD - Too small
<button className="px-2 py-1">Check Out</button>
```

### **Spacing**
```tsx
// ✅ GOOD - 8px gap
<div className="flex gap-2">...</div>

// ❌ BAD - No spacing
<div className="flex">...</div>
```

### **Font Sizes**
```tsx
// ✅ GOOD - Readable
<p className="text-base">...</p>  {/* 16px */}

// ❌ BAD - Too small
<p className="text-xs">...</p>    {/* 12px */}
```

### **Focus Indicators**
```tsx
// ✅ GOOD - Visible
<button className="focus:ring-2 focus:ring-primary-500">

// ❌ BAD - Removed
<button className="focus:outline-none">
```

---

## 🧪 Testing Strategy

### **Accessibility Testing**

#### Automated Tools
```bash
# Lighthouse audit
npm run build
npm run start
# Open Chrome DevTools → Lighthouse → Accessibility

# axe DevTools
# Install Chrome extension
# Run audit on each page

# Pa11y CLI
npm install -g pa11y
pa11y http://localhost:3000
```

#### Manual Testing
- [ ] Keyboard-only navigation (unplug mouse)
- [ ] Screen reader (VoiceOver: Cmd+F5)
- [ ] Zoom to 200% (no horizontal scroll)
- [ ] High contrast mode
- [ ] Color blindness simulation

---

### **Mobile Testing**

#### Real Device Testing (Priority)
- [ ] iPad (primary device)
- [ ] iPhone (secondary)
- [ ] Android tablet
- [ ] Android phone

#### Browser DevTools
- [ ] Chrome Device Emulation
- [ ] Firefox Responsive Design Mode
- [ ] Safari Developer Mode

#### Network Conditions
- [ ] Slow 3G
- [ ] Offline
- [ ] Flaky connection

---

## 📚 Resources

### **Accessibility**
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Inclusive Components](https://inclusive-components.design/)

### **Mobile**
- [Mobile Web Best Practices](https://web.dev/mobile-web/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Touch Design Guidelines](https://www.nngroup.com/articles/touch-target-size/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios/)

### **Testing**
- [VoiceOver User Guide](https://www.apple.com/accessibility/voiceover/)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

## 🎯 Success Metrics

### **Accessibility Metrics**
- ✅ Lighthouse Accessibility Score: 95+
- ✅ axe DevTools: 0 violations
- ✅ All WCAG 2.1 AA criteria met
- ✅ Keyboard navigation: 100% coverage
- ✅ Screen reader: All content accessible

### **Mobile Metrics**
- ✅ Lighthouse Performance: 90+
- ✅ First Contentful Paint: < 1.5s
- ✅ Time to Interactive: < 3s
- ✅ Touch target compliance: 100%
- ✅ No horizontal scroll at any breakpoint

---

## 🔄 Ongoing Maintenance

### **Quarterly (Every 3 Months)**
- [ ] Full accessibility audit
- [ ] Mobile device testing
- [ ] Update dependencies (security)
- [ ] Review new WCAG guidelines
- [ ] Test with latest iOS/Android

### **After Each Feature**
- [ ] Run accessibility checklist
- [ ] Test on mobile devices
- [ ] Update documentation
- [ ] Screen reader verification

### **Annual Review**
- [ ] User feedback session with accessibility users
- [ ] Update guidelines based on learnings
- [ ] Training for new team members
- [ ] External accessibility audit

---

## 💡 Quick Tips

### **Accessibility**
- Semantic HTML > ARIA attributes
- Test with real users when possible
- "If you can use a native element, use it"
- Color contrast tools are your friend

### **Mobile**
- Design for thumb zones (bottom 2/3 of screen)
- Test on real devices, not just simulators
- Landscape mode is primary for tablets
- Loading states are critical on mobile

### **Performance**
- Smaller bundle = faster mobile load
- Images: Use WebP, lazy load
- Code split: Load what you need
- Cache aggressively, invalidate smartly

---

## 📋 Example: Adding a New Feature

### **Feature**: "Check-Out All" Button

#### 1. Design Phase
```
✅ Accessibility checklist:
- Button needs 44px height for touch
- Needs descriptive aria-label
- Confirmation dialog required (destructive action)
- Focus indicator required

✅ Mobile checklist:
- Works in landscape and portrait
- Loading state while processing
- Haptic feedback on press
- Error handling for offline
```

#### 2. Implementation
```tsx
<button
  onClick={handleCheckOutAll}
  className="px-6 py-3 bg-orange-600 text-white rounded-lg
           focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
           disabled:opacity-50 disabled:cursor-not-allowed
           hover:bg-orange-700 active:bg-orange-800"
  aria-label={`Check out all ${activeKids} kids from ${serviceName}`}
  disabled={loading}
>
  {loading ? 'Checking Out...' : 'Check Out All'}
</button>
```

#### 3. Testing
```
✅ Keyboard: Tab to button, Enter to activate
✅ Screen reader: "Check out all 23 kids from 11:00 AM Service"
✅ Touch: 48px height, easy to tap
✅ Contrast: Orange-600 on white = 4.6:1 ✅
✅ Loading state: Button disabled, text changes
✅ Mobile: Works in portrait and landscape
```

---

**Last Updated**: October 25, 2025  
**Next Review**: January 25, 2026  
**Owner**: Development Team  
**Status**: ✅ Living Document - Update with each new feature

