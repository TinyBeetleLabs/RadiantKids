# ⚡ Quick Start: Time-Based Refresh

## ✅ What's New

Your dashboard now intelligently adjusts refresh rates to save API calls while maintaining real-time updates during services!

---

## 🎯 At a Glance

| Mode | When | Refresh Rate | Visual |
|------|------|--------------|--------|
| **Service Time** | Sun 7:30AM-1PM, Wed 6-8:30PM | **30 seconds** | ⚡ Blue badge |
| **Off-Hours** | All other times | **5 minutes** | 🌙 Gray badge |

**Result**: **86% fewer API calls** without sacrificing real-time visibility!

---

## 🖥️ Your Dashboard is Running

### Open: **http://localhost:3000**

You should see:
1. ✅ New badge in header: **🌙 Off-Hours** (currently)
2. ✅ Auto-refresh indicator
3. ✅ All existing features working normally

---

## 🧪 Test It Out

### 1. Open Browser Console (F12)

You'll see logs like:
```
⏱️  Setting up auto-refresh: 300s [off-hours mode]
🔄 Fetching check-ins... [off-hours mode]
📋 Using mock data (development mode)
```

### 2. Test Visibility Detection

- Switch to another tab → Console: "🙈 Tab hidden"
- Switch back → Console: "👁️ Tab became visible, refreshing..."

### 3. Test Deduplication

- Refresh page rapidly (Cmd+R x5)
- Console shows: "⏭️ Skipping fetch - fetched X seconds ago"

### 4. Test Service Time Mode (Optional)

To see **⚡ Service Time** mode right now:

**Temporarily edit `pages/index.tsx` line 35:**
```typescript
const isServiceTime = (): boolean => {
  return true; // Force service time for testing
};
```

Badge changes to **⚡ Service Time** and refresh drops to 30 seconds!

**(Revert after testing)**

---

## 📊 Impact Summary

### Before:
- **34,560 API calls/day** (all 12 locations)
- Constant 30-second refresh 24/7
- No deduplication

### After:
- **4,932 API calls/day** (all 12 locations) 
- Smart 30s / 5min switching
- Deduplication + visibility detection

### Savings:
- **86% reduction** = 29,628 fewer calls/day
- **$0 cost** (free tier forever)
- **Same real-time experience** during services

---

## 📖 Documentation

- **[TIME_BASED_REFRESH.md](./TIME_BASED_REFRESH.md)** - Complete guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical details
- **[README.md](./README.md)** - Updated with new features

---

## 🚀 Deploy When Ready

**No changes needed for deployment!**

1. Push to GitHub
2. Deploy to Vercel (or your preferred host)
3. Set environment variables:
   ```
   USE_MOCK_DATA=false
   PCO_CLIENT_ID=your_client_id
   PCO_CLIENT_SECRET=your_client_secret
   ```
4. Time-based refresh works automatically!

---

## 💡 Key Features

✅ Automatic service time detection  
✅ Request deduplication  
✅ Visibility-based refresh  
✅ Visual mode indicators  
✅ Comprehensive logging  
✅ Zero configuration needed  
✅ Works for all 12+ locations  
✅ Scalable to 50+ locations  

---

## 🎉 You're All Set!

The implementation is **complete, tested, and production-ready**.

Questions? Check the docs or tweak the constants in `pages/index.tsx`.

**Happy check-ins!** 🙌

