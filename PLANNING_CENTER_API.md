# 🔌 Planning Center API Integration

Complete guide for integrating with Planning Center Check-Ins API.

---

## 📊 API Structure

The code is now structured to match the **exact** Planning Center Check-Ins API format, so switching from mock to live data will work seamlessly.

---

## 🔑 API Endpoints

### Base URL
```
https://api.planningcenteronline.com/check-ins/v2/
```

### Check-Ins Endpoint
```
GET /check_ins
```

**Query Parameters Used:**
- `filter=created_at` - Filter by creation date
- `where[created_at][gte]=YYYY-MM-DD` - Get check-ins from specific date
- `include=person,event` - Include related person and event data
- `per_page=100` - Limit results per page

**Full URL Example:**
```
https://api.planningcenteronline.com/check-ins/v2/check_ins?filter=created_at&where[created_at][gte]=2024-01-15&include=person,event&per_page=100
```

---

## 📋 Data Structure Mapping

### Check-In Object (PCOCheckIn)

```typescript
interface PCOCheckIn {
  type: "CheckIn";
  id: string;
  attributes: {
    created_at: string;           // ISO 8601 timestamp
    updated_at: string;           // ISO 8601 timestamp
    kind: string;                 // Type of check-in
    security_code: string;        // Parent pickup code
    number: number;               // Check-in number
    first_time?: boolean;         // ✅ First-time visitor flag
  };
  relationships?: {
    person?: {
      data?: {
        type: "Person";
        id: string;
      };
    };
    event?: {
      data?: {
        type: "Event";
        id: string;
      };
    };
  };
}
```

### Person Object (PCOPerson)

```typescript
interface PCOPerson {
  type: "Person";
  id: string;
  attributes: {
    first_name: string;           // Child's first name
    last_name: string;            // Child's last name
    medical_notes?: string;       // Medical/allergy information
    birthdate?: string;           // ✅ Format: "YYYY-MM-DD"
    child?: boolean;              // Indicates if person is a child
  };
}
```

### Event Object (PCOEvent)

```typescript
interface PCOEvent {
  type: "Event";
  id: string;
  attributes: {
    name: string;                 // Service name (e.g., "9:00 AM - Kids Worship")
    starts_at: string;            // ISO 8601 timestamp
  };
}
```

---

## 🎯 Field Mappings

### From Planning Center → Dashboard

| PCO Field | Dashboard Field | Notes |
|-----------|----------------|-------|
| `checkIn.id` | `id` | Unique check-in ID |
| `person.attributes.first_name` | `childName` | First name only |
| `person.attributes.last_name` | `familyName` | Last name / family name |
| `checkIn.attributes.security_code` | `securityCode` | Parent pickup code |
| `event.attributes.name` | `serviceName` | Service time name |
| `checkIn.attributes.created_at` | `checkInTime` | ISO timestamp |
| `person.attributes.medical_notes` | `medicalNotes` | Allergies/medical info |
| `event.id` | `eventId` | Event identifier |
| `checkIn.attributes.first_time` | `isFirstTime` | ✅ First-time visitor |
| `person.attributes.birthdate` | `hasBirthday` | ✅ Calculated (7-day window) |

---

## 🎂 Birthday Calculation Logic

The dashboard shows a birthday badge if the child's birthday is **within the next 7 days**.

```typescript
function hasBirthdayComingUp(birthdate?: string): boolean {
  if (!birthdate) return false;

  const today = new Date();
  const [year, month, day] = birthdate.split('-').map(Number);
  
  // Create birthday date for this year
  const thisYearBirthday = new Date(today.getFullYear(), month - 1, day);
  
  // If birthday already passed, check next year
  const upcomingBirthday = thisYearBirthday < today
    ? new Date(today.getFullYear() + 1, month - 1, day)
    : thisYearBirthday;
  
  // Calculate days until birthday
  const daysUntilBirthday = Math.ceil(
    (upcomingBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Return true if birthday is within the next 7 days
  return daysUntilBirthday >= 0 && daysUntilBirthday <= 7;
}
```

**You can adjust the 7-day window** by changing the comparison:
```typescript
return daysUntilBirthday >= 0 && daysUntilBirthday <= 14; // 14 days
```

---

## 🔐 Authentication

### Basic Authentication

Planning Center API uses HTTP Basic Authentication:

```typescript
const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

headers: {
  'Authorization': `Basic ${auth}`,
  'Content-Type': 'application/json',
}
```

### Getting Credentials

1. Go to https://api.planningcenteronline.com/oauth/applications
2. Log in to your Planning Center account
3. Click "New Personal Access Token" or "New Application"
4. Copy the **Application ID** → `PCO_CLIENT_ID`
5. Copy the **Secret** → `PCO_CLIENT_SECRET`

---

## 📝 API Response Example

### Full Response Structure

```json
{
  "data": [
    {
      "type": "CheckIn",
      "id": "123456",
      "attributes": {
        "created_at": "2024-01-15T09:30:00Z",
        "updated_at": "2024-01-15T09:30:00Z",
        "kind": "regular",
        "security_code": "A123",
        "number": 1,
        "first_time": true
      },
      "relationships": {
        "person": {
          "data": {
            "type": "Person",
            "id": "789"
          }
        },
        "event": {
          "data": {
            "type": "Event",
            "id": "456"
          }
        }
      }
    }
  ],
  "included": [
    {
      "type": "Person",
      "id": "789",
      "attributes": {
        "first_name": "Emma",
        "last_name": "Johnson",
        "medical_notes": "Allergic to peanuts",
        "birthdate": "2018-01-20",
        "child": true
      }
    },
    {
      "type": "Event",
      "id": "456",
      "attributes": {
        "name": "9:00 AM - Kids Worship",
        "starts_at": "2024-01-15T09:00:00Z"
      }
    }
  ],
  "meta": {
    "total_count": 1,
    "count": 1
  }
}
```

### Transformed Dashboard Data

```json
{
  "id": "123456",
  "childName": "Emma",
  "familyName": "Johnson",
  "securityCode": "A123",
  "serviceName": "9:00 AM - Kids Worship",
  "checkInTime": "2024-01-15T09:30:00Z",
  "medicalNotes": "Allergic to peanuts",
  "eventId": "456",
  "isFirstTime": true,
  "hasBirthday": true
}
```

---

## 🔄 How It Works

### 1. Fetch Data

```typescript
const response = await fetch(
  'https://api.planningcenteronline.com/check-ins/v2/check_ins?...',
  {
    headers: {
      'Authorization': `Basic ${base64(clientId:clientSecret)}`
    }
  }
);
```

### 2. Parse Response

```typescript
const pcoData = await response.json();
// Returns: { data: [...], included: [...], meta: {...} }
```

### 3. Build Lookup Maps

```typescript
const peopleMap = new Map<string, PCOPerson>();
const eventsMap = new Map<string, PCOEvent>();

included.forEach((item) => {
  if (item.type === 'Person') {
    peopleMap.set(item.id, item);
  } else if (item.type === 'Event') {
    eventsMap.set(item.id, item);
  }
});
```

### 4. Transform Data

```typescript
data.map((checkIn) => {
  const person = peopleMap.get(checkIn.relationships.person.data.id);
  const event = eventsMap.get(checkIn.relationships.event.data.id);
  
  return {
    childName: person.attributes.first_name,
    familyName: person.attributes.last_name,
    securityCode: checkIn.attributes.security_code,
    // ... etc
  };
});
```

---

## ⚙️ Switching from Mock to Live

### Step 1: Update `.env.local`

```env
# Change this:
USE_MOCK_DATA=true

# To this:
USE_MOCK_DATA=false

# Add your credentials:
PCO_CLIENT_ID=your_actual_client_id
PCO_CLIENT_SECRET=your_actual_secret
```

### Step 2: Restart Server

```bash
# Stop the server (Ctrl+C)
# Start again:
npm run dev
```

### Step 3: Verify

The dashboard will now:
- ✅ Fetch real check-ins from Planning Center
- ✅ Show actual first-time visitors (from PCO's `first_time` flag)
- ✅ Calculate birthdays from actual birthdates
- ✅ Display real security codes
- ✅ Show actual medical notes

**No code changes needed!** The transformation logic handles everything automatically.

---

## 🛠️ Customization Options

### Change Birthday Window

In `lib/pcoApi.ts`:

```typescript
// Change from 7 days to 14 days:
return daysUntilBirthday >= 0 && daysUntilBirthday <= 14;
```

### Filter by Specific Event

Update the API URL:

```typescript
const url = `https://api.planningcenteronline.com/check-ins/v2/check_ins
  ?filter=created_at,event_id
  &where[created_at][gte]=${today}
  &where[event_id]=${eventId}
  &include=person,event
  &per_page=100`;
```

### Increase Results Limit

```typescript
// Change from 100 to 500:
&per_page=500
```

### Add Pagination

```typescript
// Get next page:
&page[offset]=100&page[limit]=100
```

---

## 🔍 Debugging

### Test API Connection

The code includes a test function:

```typescript
import { testPCOConnection } from './lib/pcoApi';

const isConnected = await testPCOConnection();
console.log('PCO Connected:', isConnected);
```

### Check Response Structure

Add logging to see what PCO returns:

```typescript
const data = await response.json();
console.log('PCO Response:', JSON.stringify(data, null, 2));
```

### Verify Credentials

Check if credentials are set:

```bash
echo $PCO_CLIENT_ID
echo $PCO_CLIENT_SECRET
```

---

## 📚 API Documentation Links

- **Check-Ins API**: https://developer.planning.center/docs/#/apps/check-ins
- **Authentication**: https://developer.planning.center/docs/#/overview/authentication
- **API Reference**: https://developer.planning.center/docs/#/apps/check-ins/2023-04-05/vertices/check_in

---

## ⚠️ Important Notes

### Rate Limiting

- PCO API has rate limits
- The code caches responses for 30 seconds
- Don't make requests more frequently than needed

### Data Privacy

- Never log sensitive data in production
- Medical notes contain private health information
- Security codes should not be stored long-term

### Error Handling

The code handles common errors:
- Missing credentials
- Network failures
- Invalid API responses
- Malformed data

---

## ✅ Verification Checklist

Before going live with Planning Center API:

- [ ] Obtained API credentials from Planning Center
- [ ] Set `PCO_CLIENT_ID` in `.env.local`
- [ ] Set `PCO_CLIENT_SECRET` in `.env.local`
- [ ] Set `USE_MOCK_DATA=false`
- [ ] Restarted the development server
- [ ] Verified check-ins are loading
- [ ] Confirmed first-time badges appear correctly
- [ ] Confirmed birthday badges appear for upcoming birthdays
- [ ] Tested with actual check-in data from PCO

---

## 🎉 Ready to Go!

Your dashboard is now configured to work seamlessly with Planning Center's actual API structure. Just flip the switch in `.env.local` and you're live! 🚀

**The transformation logic handles all the complexity of mapping Planning Center's API format to your dashboard display.**

