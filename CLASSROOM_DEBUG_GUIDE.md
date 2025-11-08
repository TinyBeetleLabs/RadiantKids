# Classroom Data Debugging Guide

## 🚨 ISSUE: Classrooms Not Showing

**Symptoms**:
- "BY CLASSROOM" section in Admin Overview is empty
- Classroom dropdown shows "All (8 kids)" but no individual classrooms
- Kids have no classroom assigned

---

## 🔍 Step 1: Check Browser Console

Refresh your dashboard and open the browser console. Look for these critical messages:

### ✅ **GOOD SIGN**: EventLocations Found
```
✅ EventLocations found: 5
   Classrooms: ["Dreamers", "Explorers", "Heros", "Legends", "Club 456"]
```
**If you see this**, EventLocations ARE being returned. Skip to Step 2.

### ❌ **BAD SIGN**: No EventLocations
```
🚨 CRITICAL: NO EVENTLOCATIONS (CLASSROOMS) IN API RESPONSE!
   BY CLASSROOM section will be EMPTY in UI
   className will be undefined for all check-ins
```
**If you see this**, EventLocations are NOT being returned. Continue to Step 1a.

---

## 🔧 Step 1a: Check Initial API Response (if NO EventLocations)

Look for this log in console:
```
📦 FULL Initial API Response: {
  includedCounts: {
    EventLocation: 0  ← Should be > 0!
  }
}
```

### If EventLocation count is 0, check:

1. **Planning Center Setup**:
   - Are your events configured with "Event Locations" (classrooms)?
   - In Planning Center, go to Check-Ins → Events → [Your Event] → Event Locations
   - Each service time should have classrooms assigned

2. **API Query**:
   - The API query includes `event_location` but PCO might not be returning it
   - Check if `/events/{id}/locations` or `/event_periods/{id}?include=event_location` are returning data

---

## 🔧 Step 2: Check Classroom Assignment (if EventLocations found but not assigned)

Look for this error for the FIRST check-in:
```
❌ NO CLASSROOM ASSIGNED for CheckIn 12345
   Method 1 (direct): none
   Method 2 (event_period): none
   Method 1b (event.event_locations): 0
   EventLocations available in map: 5
   Available classrooms: ["Dreamers", "Explorers", "Heros", "Legends", "Club 456"]
```

### This means:
- ✅ EventLocations ARE in the system (map size: 5)
- ❌ But the matching logic can't connect them to check-ins

### Why this happens:
1. **No relationships**: Check-ins don't have `event_location`, `event_period`, or `event` relationships
2. **Missing data**: The `event_period` or `event` objects don't link to `event_locations`
3. **API structure**: Planning Center API isn't returning the relationship data we need

---

## 🔍 What to Look For in Console

### 1. Initial Response Check
```javascript
📦 FULL Initial API Response: {
  includedCounts: {
    EventPeriod: 3,  // Should be > 0
    Event: 2,        // Should be > 0
    EventLocation: 5, // ← THIS IS CRITICAL! Should be > 0
  }
}
```

### 2. Lookup Maps Check
```javascript
📊 Lookup Maps (from included[]):
{
  eventLocations: 5,  // ← THIS IS CRITICAL! Should match EventLocation count
  allEventLocations: [
    { id: "123", name: "Dreamers" },
    { id: "124", name: "Explorers" },
    ...
  ]
}
```

### 3. Individual Check-In Check
```javascript
❌ NO CLASSROOM ASSIGNED for CheckIn 12345
   EventLocations available in map: 5
   Available classrooms: ["Dreamers", "Explorers", ...] // ← If you see this, classrooms exist but aren't matching
```

---

## 🚀 Solutions

### If EventLocations count is 0:
**Root Cause**: Planning Center isn't returning EventLocation data

**Solutions**:
1. **Check Planning Center Setup**:
   - Ensure events have "Event Locations" configured
   - Each service time (event_period) should be linked to a classroom (event_location)

2. **Check API Permissions**:
   - Ensure your API credentials have access to event_locations
   - Test in Postman: `GET /check-ins/v2/event_locations`

3. **Try Manual Query**:
   ```
   GET /check-ins/v2/events/{event_id}/locations
   ```
   - If this returns 404 or empty, the event doesn't have locations configured

### If EventLocations exist but aren't matching:
**Root Cause**: Relationship data is missing

**Solutions**:
1. **Check if event_periods have event_location relationships**:
   - Look for this log: `✅ Updated EventPeriod {id} in included array`
   - If missing, the fetch for `/event_periods/{id}?include=event_location` might be failing

2. **Check if events have event_locations relationships**:
   - The `event` object should have `event_locations: { data: [...] }`
   - If missing, use `/events/{id}/event_locations` endpoint

---

## 📋 What to Send Me

Please copy and paste from your console:

1. **EventLocations count**:
```
Look for: "✅ EventLocations found:" or "🚨 CRITICAL: NO EVENTLOCATIONS"
```

2. **First check-in assignment**:
```
Look for: "❌ NO CLASSROOM ASSIGNED for CheckIn..."
```

3. **Initial API counts**:
```
Look for: "includedCounts: { EventLocation: X }"
```

With this info, I can pinpoint exactly why classrooms aren't showing!

---

## 🎯 Quick Reference

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| `eventLocations: 0` in Lookup Maps | PCO not returning EventLocation data | Check Planning Center event setup |
| `EventLocations: 5` but "NO CLASSROOM ASSIGNED" | Relationships missing | Check event_period/event relationships |
| Empty BY CLASSROOM section | `className` is undefined | Check console logs above |
| Service times showing but no classrooms | EventLocations exist but not matched | Check relationship data |

---

**Next Step**: Refresh your dashboard and check the browser console. Share the output with me!

