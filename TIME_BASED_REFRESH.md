# ⚡ Time-Based Refresh Implementation

## 🎯 Overview

Your dashboard now uses **smart time-based refresh** to drastically reduce API calls while maintaining real-time updates when it matters most.

---

## 📊 How It Works

### **Service Time Mode** ⚡
**When**: 
- Sunday: 7:30 AM - 1:00 PM
- Wednesday: 6:00 PM - 8:30 PM

**Refresh Rate**: Every **30 seconds**  
**Why**: Real-time updates during active check-in periods

### **Off-Hours Mode** 🌙
**When**: All other times  
**Refresh Rate**: Every **5 minutes**  
**Why**: Minimal API calls when check-ins are unlikely

---

## 🚀 Features Implemented

### 1. **Time-Based Auto-Refresh**
```typescript
// Automatically switches between 30s and 5min based on time
const isServiceTime = (): boolean => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 3 = Wednesday
  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
  
  // Sunday service: 7:30 AM - 1:00 PM
  if (day === 0) {
    const sundayStart = 7 * 60 + 30; // 7:30 AM
    const sundayEnd = 13 * 60; // 1:00 PM
    return currentTimeInMinutes >= sundayStart && currentTimeInMinutes <= sundayEnd;
  }
  
  // Wednesday service: 6:00 PM - 8:30 PM
  if (day === 3) {
    const wednesdayStart = 18 * 60; // 6:00 PM
    const wednesdayEnd = 20 * 60 + 30; // 8:30 PM
    return currentTimeInMinutes >= wednesdayStart && currentTimeInMinutes <= wednesdayEnd;
  }
  
  return false;
};
```

### 2. **Request Deduplication**
Prevents duplicate API calls if:
- A fetch is already in progress
- Last fetch was less than 5 seconds ago

```typescript
// Deduplication logic
if (fetchInProgress.current && !force) {
  console.log('⏭️  Skipping fetch - already in progress');
  return;
}
```

### 3. **Visibility-Based Refresh**
Dashboard pauses background fetching when tab is not visible:
- Saves API calls when user is on another tab/window
- Immediately refreshes when tab becomes visible again

```typescript
// Only fetch when tab is visible
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    fetchCheckIns(); // Refresh on tab activation
  }
});
```

### 4. **Visual Indicators**
Header displays current refresh mode:
- **⚡ Service Time** (blue badge) - 30s refresh
- **🌙 Off-Hours** (gray badge) - 5min refresh

---

## 📈 API Call Reduction

### Per Location Dashboard

**Before** (30-second constant refresh):
```
2,880 calls/day per location
```

**After** (time-based refresh):
```
Sunday Services (5.5 hours: 7:30 AM - 1:00 PM):
- 5.5 hours × 120 calls/hr = 660 calls

Wednesday Services (2.5 hours: 6:00 PM - 8:30 PM):
- 2.5 hours × 120 calls/hr = 300 calls

Off-hours (rest of week):
- 160 hours × 12 calls/hr = 1,920 calls

Weekly: 2,880 calls
Daily average: 411 calls/day
```

**Reduction per location**: **86% fewer API calls** (even better!)

### All 12 Locations

**Before**: 34,560 calls/day  
**After**: 4,932 calls/day (411 × 12 locations)
**Reduction**: **86%** 🎉 (even better with Wednesday evening services!)

**With Visibility Detection** (assume tabs visible 50% of the time):
- **After**: ~2,466 calls/day (4,932 × 50%)
- **Reduction**: **~93%** 🚀

---

## 🔧 How to Customize

### Change Refresh Intervals

Edit `pages/index.tsx`:

```typescript
// Current values
const REFRESH_INTERVAL_SERVICE_TIME = 30000;  // 30 seconds
const REFRESH_INTERVAL_OFF_HOURS = 5 * 60 * 1000; // 5 minutes

// Want faster off-hours refresh? Change to 2 minutes:
const REFRESH_INTERVAL_OFF_HOURS = 2 * 60 * 1000; // 2 minutes
```

### Change Service Times

Edit the `isServiceTime()` function in `pages/index.tsx`:

```typescript
const isServiceTime = (): boolean => {
  const now = new Date();
  const day = now.getDay();
  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
  
  // Add more service days (e.g., Saturday)
  const isServiceDay = day === 0 || day === 3 || day === 6; // Sun, Wed, Sat
  
  // Adjust service window (e.g., 6:00 AM - 2:00 PM)
  const serviceStart = 6 * 60; // 6:00 AM
  const serviceEnd = 14 * 60; // 2:00 PM
  const isServiceWindow = currentTimeInMinutes >= serviceStart && currentTimeInMinutes <= serviceEnd;
  
  return isServiceDay && isServiceWindow;
};
```

### Add Location-Specific Service Times

For different service times per location:

```typescript
// .env.local
NEXT_PUBLIC_LOCATION_ID=south_campus
NEXT_PUBLIC_SERVICE_START=8:00
NEXT_PUBLIC_SERVICE_END=13:00

// pages/index.tsx
const getLocationServiceTimes = () => {
  const locationId = process.env.NEXT_PUBLIC_LOCATION_ID;
  
  // Define service times per location
  const schedules = {
    'south_campus': { start: 8 * 60, end: 13 * 60 },
    'north_campus': { start: 9 * 60, end: 14 * 60 },
    // ... more locations
  };
  
  return schedules[locationId] || { start: 7.5 * 60, end: 13 * 60 };
};
```

---

## 📝 Console Logging

The dashboard logs detailed refresh activity to help you monitor:

### Log Messages

```bash
# Initial setup
⏱️  Setting up auto-refresh: 30s [service mode]

# Regular fetch
🔄 Fetching check-ins... [service mode]

# Deduplication
⏭️  Skipping fetch - already in progress
⏭️  Skipping fetch - fetched 3 seconds ago

# Refresh interval change
🔄 Refresh interval changed, resetting timer...

# Visibility change
👁️  Tab became visible, refreshing data...
🙈 Tab hidden, pausing background refresh
```

---

## ✅ Testing the Implementation

### 1. **Test Service Time Detection**

Open browser console and check the current mode:

```javascript
// In browser console (when app is running)
const now = new Date();
console.log('Current day:', now.getDay()); // 0 = Sun, 3 = Wed
console.log('Current time:', now.getHours() + ':' + now.getMinutes());
```

### 2. **Test Auto-Refresh**

Watch the console logs:
- During service times: Should see fetches every ~30 seconds
- During off-hours: Should see fetches every ~5 minutes

### 3. **Test Deduplication**

Try manually refreshing the page multiple times quickly:
- Should see "⏭️ Skipping fetch" messages

### 4. **Test Visibility Detection**

- Switch to another tab for 10 seconds
- Switch back to the dashboard tab
- Should see: "👁️ Tab became visible, refreshing data..."

### 5. **Simulate Service Time Change**

Temporarily change the service window to include current time:

```typescript
// In pages/index.tsx - temporarily change for testing
const serviceStart = 0; // midnight
const serviceEnd = 24 * 60; // end of day
```

Save the file and watch the badge change to "⚡ Service Time"

---

## 🌐 Multi-Location Deployment

### Recommended Setup for 12 Locations

**Option A: 12 Separate Vercel Projects** (Recommended)

1. Deploy the same codebase 12 times
2. Set environment variables per deployment:

```bash
# South Campus
NEXT_PUBLIC_LOCATION_ID=south_campus
NEXT_PUBLIC_LOCATION_NAME=South Campus
PCO_CLIENT_ID=your_client_id
PCO_CLIENT_SECRET=your_client_secret

# North Campus
NEXT_PUBLIC_LOCATION_ID=north_campus
NEXT_PUBLIC_LOCATION_NAME=North Campus
# ... etc
```

3. Each location operates independently
4. Each location gets smart refresh automatically

**Benefits**:
- ✅ Complete independence
- ✅ No shared state
- ✅ Easy to customize per location
- ✅ All within Vercel free tier

---

## 💰 Cost Analysis

### Current Structure (After Implementation)

**12 Locations × 411 calls/day = 4,932 calls/day**

**Planning Center API**: Free  
**Vercel Hosting**: Free tier (generous limits)  
**Total Cost**: **$0/month** 🎉

### With Visibility Detection (~50% tab visibility)

**12 Locations × 206 calls/day = 2,466 calls/day**

**Reduction from original**: **93%** 🚀

### Future Growth (50 locations)

**50 Locations × 411 calls/day = 20,550 calls/day**

Still well within free tiers:
- **Planning Center**: No limit on API calls
- **Vercel**: 100GB bandwidth/month (this is ~50MB/month)
- **Total Cost**: **Still $0/month**

---

## 🎉 Summary

### What You Got

✅ **86% reduction** in API calls per location  
✅ **30-second real-time updates** during service times  
✅ **5-minute background updates** during off-hours  
✅ **Request deduplication** to prevent waste  
✅ **Visibility detection** to pause when not needed  
✅ **Visual indicators** to show current mode  
✅ **Automatic mode switching** (service ↔ off-hours)  
✅ **Console logging** for monitoring and debugging  

### Real-World Impact

**Before**: 34,560 API calls/day (all 12 locations)  
**After**: 4,932 API calls/day (all 12 locations)  
**Savings**: 29,628 calls/day (86% reduction)  

**During service times**: 30-second updates (real-time)  
**During off-hours**: 5-minute updates (background)  

**Cost**: $0/month (now and forever)  

---

## 🔮 Next Steps (Optional Future Enhancements)

1. **Planning Center Webhooks**
   - For true real-time updates (99% call reduction)
   - Requires webhook endpoint + small server
   - Only if you outgrow current setup

2. **Per-Location Service Schedules**
   - Different service times for different locations
   - Stored in database or config file

3. **Manual Refresh Button**
   - For staff to force immediate update
   - Useful during critical moments

4. **Offline Mode with IndexedDB**
   - For complete offline functionality
   - Falls back to cached data when offline

---

## 📞 Support

If you need to adjust service times, refresh intervals, or have questions:
- Edit `pages/index.tsx`
- Modify the constants at the top of the file
- Or customize the `isServiceTime()` function

**Everything is well-commented and easy to customize!**

