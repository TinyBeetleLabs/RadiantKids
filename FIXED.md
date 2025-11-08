# Fixed: Mock Data API Structure Issue

## What Was Wrong

The mock data was not matching the exact structure of the Planning Center API response. The PCO API includes person data (first_name, last_name, medical_notes) directly in the CheckIn attributes, not in a separate included array.

## Changes Made

### 1. Updated `lib/pcoApi.ts`
- Modified interfaces to match actual PCO API structure
- Person data is now expected in CheckIn attributes
- Changed relationship structure to use `event_period` instead of direct `event` relationship  
- Updated `one_time_guest` flag (was incorrectly using `first_time`)
- Added `birthdate` to CheckIn attributes

### 2. Updated `lib/mockData.ts`
- Completely rewrote to return exact PCO API structure
- Added `getMockPCOResponse()` that returns data in PCO format with:
  - `data` array of CheckIn objects with person info in attributes
  - `included` array of EventPeriod and Event objects
  - `meta` object with counts
- Added `transformMockData()` to mimic the transformation in `pcoApi.ts`
- Maintains all test scenarios (siblings, first-timers, birthdays)

### 3. Fixed `next.config.js`
- Removed `output: 'standalone'` which was causing development issues

### 4. Resolved Port Conflicts
- Cleared stale processes on ports 3000/3001
- Server now running on port 3002

## Current Status

✅ **Mock data now perfectly mirrors the Planning Center API structure**
✅ **API endpoint working**: http://localhost:3002/api/checkins
✅ **Dashboard running**: http://localhost:3002
✅ **Data structure aligned for seamless live/mock switching**

## How to Access

The development server is now running on **port 3002**:
- Dashboard: http://localhost:3002
- API: http://localhost:3002/api/checkins

## Next Steps

1. Open http://localhost:3002 in your browser
2. Verify the dashboard displays correctly with mock data
3. When ready to switch to live data:
   - Update `.env.local`: `USE_MOCK_DATA=false`
   - Ensure PCO credentials are correct
   - Restart the server

## Data Structure Example

The mock data now returns this structure (matching PCO):

```json
{
  "data": [{
    "type": "CheckIn",
    "id": "1",
    "attributes": {
      "first_name": "Emma",
      "last_name": "Johnson",
      "medical_notes": "Allergic to peanuts",
      "security_code": "A123",
      "created_at": "2025-10-25T03:04:51.422Z",
      "one_time_guest": false,
      "birthdate": "1990-10-28",
      ...
    },
    "relationships": {
      "event_period": {
        "data": { "type": "EventPeriod", "id": "ep1" }
      }
    }
  }],
  "included": [
    { "type": "EventPeriod", "id": "ep1", ... },
    { "type": "Event", "id": "e1", ... }
  ]
}
```

This matches the exact structure from Planning Center's API.

