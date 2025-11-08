# 🎯 Expand/Collapse Family Feature

Families with multiple children now have expand/collapse functionality, matching the Planning Center UI pattern!

---

## ✨ What's New

### Expand/Collapse Behavior
- **Families with multiple children** have a collapse/expand arrow button
- **Single children** displayed without expand button (always visible)
- **Default state**: All families expanded on load
- **Smooth animations**: Arrow rotates 90° when expanding/collapsing
- **Full names displayed**: Shows "Emma Johnson" instead of just "Emma"

---

## 🖥️ Desktop/Tablet View

### Layout Structure:

```
┌────────────────────────────────────────────────────────┐
│ ▶ Johnson Family (2 children)    A123    9:30 AM      │
│                                                        │
│     Emma Johnson                          Allergic to │
│                                           peanuts      │
│     Liam Johnson                          None         │
├────────────────────────────────────────────────────────┤
│   Martinez Family                 A124    9:32 AM      │
│                                                        │
│     Olivia Martinez                       Asthma       │
└────────────────────────────────────────────────────────┘
```

### Features:
- ✅ **Family Header Row** - Bold family name, child count, security code
- ✅ **Expand Arrow** - Clickable arrow (▶) rotates to (▼) when expanded
- ✅ **Child Rows** - Indented, shows full name (First + Last)
- ✅ **Medical Notes** - Only on child rows, not family header
- ✅ **Summary** - Family header shows "2 medical notes" count
- ✅ **Single Children** - No expand button, always visible

---

## 📱 Mobile View

### Card Layout:

```
┌──────────────────────────────┐
│ ▶ FAMILY              CODE   │
│   Johnson Family (2)  A123   │
│                              │
│   • Emma Johnson             │
│   • Liam Johnson             │
│                              │
│ CHECK-IN: 9:30 AM           │
│ ⚠️ Emma Johnson: Peanuts    │
└──────────────────────────────┘
```

### Features:
- ✅ Smaller expand arrow for mobile
- ✅ Child count badge
- ✅ Full names in children list
- ✅ Medical notes with full child names

---

## 🎨 UI Details

### Expand/Collapse Button

**Collapsed State:**
```
▶ Johnson Family (2 children)
```
- Arrow points right (▶)
- Children hidden
- Shows child count

**Expanded State:**
```
▼ Johnson Family (2 children)
    Emma Johnson
    Liam Johnson
```
- Arrow points down (▼)
- Children visible
- Full names shown

### Single Children (No Button)

```
  Martinez Family
    Olivia Martinez
```
- No expand button
- Always visible
- Cleaner interface

---

## 🔄 How It Works

### State Management

```typescript
// Track which families are expanded
const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());

// Initialize all as expanded on mount
React.useEffect(() => {
  const allCodes = new Set(families.map(f => f.securityCode));
  setExpandedFamilies(allCodes);
}, [families.length]);
```

### Toggle Function

```typescript
const toggleFamily = (securityCode: string) => {
  setExpandedFamilies(prev => {
    const newSet = new Set(prev);
    if (newSet.has(securityCode)) {
      newSet.delete(securityCode);  // Collapse
    } else {
      newSet.add(securityCode);     // Expand
    }
    return newSet;
  });
};
```

### Check Function

```typescript
const isFamilyExpanded = (securityCode: string) => {
  return expandedFamilies.has(securityCode);
};
```

---

## 📊 Display Logic

### Desktop Table

```typescript
{families.map((family) => {
  const isExpanded = isFamilyExpanded(family.securityCode);
  const isSingleChild = family.children.length === 1;
  
  return (
    <>
      {/* Family Header Row */}
      <tr>
        {!isSingleChild && (
          <button onClick={() => toggleFamily(family.securityCode)}>
            ▶
          </button>
        )}
        {family.familyName} Family
      </tr>
      
      {/* Children Rows - Only show if expanded or single child */}
      {(isExpanded || isSingleChild) && family.children.map(child => (
        <tr>
          {child.childName} {child.familyName}
        </tr>
      ))}
    </>
  );
})}
```

---

## 🎯 Comparison: Before vs After

### Before (No Expand/Collapse):

```
Johnson Family (2 children)
  • Emma
  • Liam

Davis Family (3 children)
  • Noah
  • Sophia
  • Elijah
```

**Issues:**
- ❌ First names only
- ❌ Always visible (cluttered for large families)
- ❌ No way to collapse long lists

### After (With Expand/Collapse):

```
▶ Johnson Family (2)
    Emma Johnson
    Liam Johnson

▶ Davis Family (3)
    Noah Davis
    Sophia Davis
    Elijah Davis
```

**Benefits:**
- ✅ Full names (First + Last)
- ✅ Can collapse to save space
- ✅ Default expanded for quick view
- ✅ Clean interface for single children

---

## 🎨 Visual States

### Family Header Row

**Elements:**
1. **Expand Button** (if multiple children)
   - Icon: Right arrow (▶) or Down arrow (▼)
   - Hover: Gray background
   - Transition: Smooth 90° rotation

2. **Family Name**
   - Bold text
   - "Family" suffix
   - Child count badge

3. **Security Code**
   - Large badge
   - Primary colors
   - Always visible

4. **Medical Summary**
   - Shows count: "2 medical notes"
   - Or "None" if no notes
   - Red text if notes exist

### Child Rows

**Elements:**
1. **Full Name**
   - Indented (pl-16 on desktop)
   - Format: "FirstName LastName"
   - Normal weight text

2. **Check-In Time** (if different from family time)
   - Smaller text
   - Gray color

3. **Medical Notes** (individual)
   - Red warning icon
   - Note text
   - Or "None" if no notes

---

## 💡 User Interaction

### Click Behavior

1. **Click expand arrow** → Family collapses/expands
2. **Single children** → No click action (always visible)
3. **Hover** → Arrow button shows gray background

### Keyboard Accessibility

- Button has `aria-label` for screen readers
- Tab navigation works correctly
- Enter/Space activates toggle

---

## 📊 Medical Notes Display

### Family Header Row
Shows summary:
- "2 medical notes" (if multiple)
- "1 medical note" (if single)
- "None" (if no notes)

### Child Rows
Shows specific notes:
- "Emma Johnson: Allergic to peanuts"
- Icon + text in red
- Only for that specific child

---

## 🎯 Real-World Scenarios

### Scenario 1: Large Family (Davis - 3 Kids)

**Expanded:**
```
▼ Davis Family (3 children)    A125
    Noah Davis                   None
    Sophia Davis                 Dairy allergy
    Elijah Davis                 None
```

**Collapsed:**
```
▶ Davis Family (3 children)    A125    1 medical note
```

Staff can collapse to reduce clutter, but see medical note count!

### Scenario 2: Single Child (Martinez)

```
  Martinez Family               A124
    Olivia Martinez             Asthma inhaler
```

No expand button - always visible since it's just one child.

---

## 🚀 Benefits

### For Staff:
- ✅ **Cleaner view** when families collapsed
- ✅ **Quick scan** of family headers
- ✅ **Medical note counts** visible even when collapsed
- ✅ **Full names** when expanded for verification

### For Parents:
- ✅ **Easier to find** their family name
- ✅ **All kids visible** by default
- ✅ **Full names** reduce confusion

### For Large Services:
- ✅ **Reduces scroll** with many families
- ✅ **Still accessible** - just one click to expand
- ✅ **Defaults open** for immediate viewing

---

## ⚙️ Technical Details

### State Persistence
- State is per-session (doesn't persist across page refreshes)
- Each family tracks independently
- Uses Set for O(1) lookup performance

### Performance
- ✅ Efficient re-renders (only affected family)
- ✅ React.Fragment prevents extra DOM nodes
- ✅ Minimal state updates

### Responsive
- ✅ Works on desktop and mobile
- ✅ Different button sizes for mobile
- ✅ Same functionality on all devices

---

## ✅ Testing Checklist

### Desktop View:
- [ ] Click expand/collapse button
- [ ] Arrow rotates smoothly
- [ ] Children show/hide correctly
- [ ] Full names displayed
- [ ] Medical notes appear on child rows
- [ ] Single children have no expand button
- [ ] Family header shows medical count when collapsed

### Mobile View:
- [ ] Expand button visible and clickable
- [ ] Children list collapses properly
- [ ] Full names shown in bullet list
- [ ] Medical notes with full names
- [ ] Touch targets large enough

### General:
- [ ] All families expanded by default
- [ ] State persists during session
- [ ] Keyboard navigation works
- [ ] Screen reader friendly

---

## 🎉 Summary

The dashboard now matches the Planning Center UI pattern with:

1. ✅ **Full names** (First + Last) for all children
2. ✅ **Expand/Collapse** for families with multiple kids
3. ✅ **Default expanded** so everything is visible immediately
4. ✅ **No button** for single children (cleaner interface)
5. ✅ **Medical summaries** on family headers
6. ✅ **Individual notes** on child rows
7. ✅ **Smooth animations** and hover states

**Perfect for classroom use! 👨‍👩‍👧‍👦🎉**

