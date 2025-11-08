# 👨‍👩‍👧‍👦 Family Grouping Feature

The dashboard now groups siblings who share the same security code under their family name!

---

## ✨ What's New

### Family-Based Display
- **Siblings grouped together** - Children with the same security code are displayed as one family unit
- **Family name prominent** - Shows "Johnson Family", "Davis Family", etc.
- **Single security code** - Code shown once per family (not repeated for each child)
- **All children listed** - Easy to see all kids in the family at a glance

---

## 📊 Updated Data Structure

### CheckInData Interface

```typescript
export interface CheckInData {
  id: string;
  childName: string;      // First name only (e.g., "Emma")
  familyName: string;     // Last name (e.g., "Johnson")
  securityCode: string;   // Shared by siblings
  serviceName: string;
  checkInTime: string;
  medicalNotes?: string;
  eventId: string;
}
```

### Example Mock Data

```typescript
// Johnson Family - Two siblings with same code
{
  childName: 'Emma',
  familyName: 'Johnson',
  securityCode: 'A123',  // Same code
},
{
  childName: 'Liam',
  familyName: 'Johnson',
  securityCode: 'A123',  // Same code (sibling)
}

// Davis Family - Three siblings
{
  childName: 'Noah',
  familyName: 'Davis',
  securityCode: 'A125',
},
{
  childName: 'Sophia',
  familyName: 'Davis',
  securityCode: 'A125',  // Same code
},
{
  childName: 'Elijah',
  familyName: 'Davis',
  securityCode: 'A125',  // Same code
}
```

---

## 🖥️ Desktop/Tablet View

### Table Layout:

```
┌────────────────────────────────────────────────────────────┐
│ Family / Children  │ Security Code │ Time    │ Medical     │
├────────────────────────────────────────────────────────────┤
│ Johnson Family     │               │         │             │
│   • Emma           │     A123      │ 9:30 AM │ Emma: Pea   │
│   • Liam           │               │         │ allergies   │
├────────────────────────────────────────────────────────────┤
│ Davis Family       │               │         │             │
│   • Noah           │     A125      │ 9:35 AM │ Sophia:     │
│   • Sophia         │               │         │ Dairy       │
│   • Elijah         │               │         │ allergy     │
└────────────────────────────────────────────────────────────┘
```

### Features:
- ✅ Family name in bold
- ✅ Children listed below with bullet points
- ✅ Security code shown once per family
- ✅ Medical notes include child's name
- ✅ Check-in time shows earliest check-in for the family

---

## 📱 Mobile View

### Card Layout:

```
┌──────────────────────────────┐
│ FAMILY                  CODE │
│ Johnson Family          A123 │
│   • Emma                     │
│   • Liam                     │
│                              │
│ CHECK-IN TIME                │
│ 9:30 AM (30 minutes ago)    │
│                              │
│ MEDICAL NOTES                │
│ ⚠️ Emma: Allergic to peanuts│
└──────────────────────────────┘
```

### Features:
- ✅ Family name at top
- ✅ All children listed together
- ✅ Large security code badge
- ✅ Medical notes show which child has the note
- ✅ Clean, card-based layout

---

## 📈 Service Header Updates

Shows both family count and total children:

```
┌────────────────────────────────────┐
│ 9:00 AM - Kids Worship             │
│ [3 families] [6 children]          │
└────────────────────────────────────┘
```

---

## 🎯 Benefits for Parent Pickup

### Before (Individual Children):
- Parent arrives with code **A123**
- Sees "Emma Johnson" in list
- Might not immediately see "Liam Johnson"
- Has to search for all their kids

### After (Family Grouping):
- Parent arrives with code **A123**
- Sees "**Johnson Family**" with **A123**
- Lists all children: Emma, Liam
- One entry, all kids, clear and simple! ✨

---

## 🔧 How It Works

### 1. Grouping Logic

```typescript
const groupByFamily = (): FamilyGroup[] => {
  const familyMap = new Map<string, FamilyGroup>();
  
  checkIns.forEach((checkIn) => {
    const key = checkIn.securityCode;  // Group by security code
    
    if (!familyMap.has(key)) {
      familyMap.set(key, {
        familyName: checkIn.familyName,
        securityCode: checkIn.securityCode,
        children: [],
        checkInTime: checkIn.checkInTime,
      });
    }
    
    familyMap.get(key)!.children.push(checkIn);
  });
  
  return Array.from(familyMap.values());
};
```

### 2. Sorting
- Families sorted by earliest check-in time
- If multiple siblings check in at different times, uses the earliest

### 3. Medical Notes
- Shows child's name with each medical note
- Example: "Emma: Allergic to peanuts"
- Multiple notes shown if multiple children have notes

---

## 📊 Mock Data Examples

The mock data now includes:

### 9:00 AM Service:
- **Johnson Family** (A123) - Emma & Liam (2 kids)
- **Martinez Family** (A124) - Olivia (1 kid)
- **Davis Family** (A125) - Noah, Sophia & Elijah (3 kids)

### 10:30 AM Service:
- **Anderson Family** (B201) - Mason & Ava (2 kids)
- **Thomas Family** (B202) - Isabella (1 kid)
- **Taylor Family** (B203) - Ethan (1 kid)

### 12:00 PM Service:
- **Moore Family** (C301) - James & Mia (2 kids)
- **Wilson Family** (C302) - Benjamin (1 kid)

**Total**: 13 children across 8 families

---

## 🔌 Planning Center API Integration

The `pcoApi.ts` transformation now:

```typescript
return {
  id: checkIn.id,
  childName: person?.attributes.first_name || 'Unknown',
  familyName: person?.attributes.last_name || 'Unknown',
  securityCode: checkIn.attributes.security_code || '',
  serviceName: event?.attributes.name || 'Unknown Service',
  checkInTime: checkIn.attributes.created_at,
  medicalNotes: person?.attributes.medical_notes || '',
  eventId: eventId || 'unknown',
};
```

- Extracts **first_name** as `childName`
- Extracts **last_name** as `familyName`
- Groups automatically happen on the frontend by security code

---

## ✅ Component Updates

### Files Modified:

1. **`lib/mockData.ts`**
   - Added `familyName` to interface
   - Updated mock data with families and siblings
   - Fixed `generateRandomCheckIn()` to include familyName

2. **`lib/pcoApi.ts`**
   - Updated API transformation to separate first/last names
   - Now returns `childName` and `familyName` separately

3. **`components/ServiceGroup.tsx`**
   - Added `groupByFamily()` function
   - Completely rewrote desktop table view
   - Completely rewrote mobile card view
   - Updated service header to show family count
   - Medical notes now show which child has the note

---

## 🎨 UI Enhancements

### Family Display:
- **Bold family name** - "Johnson Family" stands out
- **Indented children** - Bullet points show all kids
- **Single security code** - Not repeated per child
- **Smart medical notes** - Shows "Emma: Allergic to peanuts"

### Visual Hierarchy:
1. Family name (largest, bold)
2. Children names (indented, bulleted)
3. Security code (large badge, one per family)
4. Medical notes (with child identification)

---

## 🚀 Real-World Scenario

### Pickup Time at Church:

**Parent arrives:** "Hi, I'm here to pick up my kids. Code A125."

**Staff looks at dashboard:**
```
Davis Family                    A125
  • Noah
  • Sophia  
  • Elijah
```

**Staff response:** "Great! We have Noah, Sophia, and Elijah. I'll get all three for you!"

✨ **Much clearer than seeing three separate entries!**

---

## 🔮 Future Enhancements

Potential additions:
- [ ] Show parent names if available in PCO API
- [ ] Group by household ID (if different from security code)
- [ ] Collapse/expand families with many children
- [ ] Highlight families when parent arrives (future feature)
- [ ] Print family pickup slips with QR code

---

## ✅ Testing

### To Test:
1. Run `npm run dev`
2. Open http://localhost:3000
3. Look for families with multiple children:
   - Johnson Family (2 kids)
   - Davis Family (3 kids)
   - Anderson Family (2 kids)
   - Moore Family (2 kids)

### What to Verify:
- ✅ Families are grouped together
- ✅ Security code shown once per family
- ✅ All children listed under family name
- ✅ Medical notes include child's name
- ✅ Both desktop and mobile views work
- ✅ Header shows family count

---

## 📝 Benefits Summary

| Before | After |
|--------|-------|
| Individual entries per child | Grouped by family |
| Security code repeated | Code shown once |
| Hard to see siblings | Siblings clearly grouped |
| "Emma Johnson" | "Johnson Family: Emma, Liam" |
| Medical notes unlabeled | "Emma: Allergic to peanuts" |
| Harder for parent pickup | Easy to see all kids at once |

---

**The dashboard is now optimized for families! 👨‍👩‍👧‍👦🎉**

