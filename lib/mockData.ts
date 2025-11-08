/**
 * Mock Data Generator for Development
 * 
 * This file provides comprehensive sample check-in data that mimics the exact structure
 * returned by the Planning Center Check-Ins API.
 * 
 * Church Structure:
 * - 5 locations (campuses): Heights, South Tampa, Hillsborough, Clearwater, Odessa
 * - 5 classrooms per location: Dreamers, Explorers, Heros, Legends, Club 456
 * - Service times vary by location:
 *   - Heights: 8:30 AM, 10:00 AM, 11:30 AM
 *   - South Tampa: 8:00 AM, 9:30 AM, 11:00 AM, 12:30 PM
 *   - Hillsborough: 8:00 AM, 9:30 AM, 11:00 AM, 12:30 PM
 *   - Clearwater: 8:00 AM, 9:30 AM, 11:00 AM (no 12:30 PM)
 *   - Odessa: 9:30 AM, 11:00 AM, 12:30 PM (starts at 9:30 AM)
 * 
 * Use this during development by setting USE_MOCK_DATA=true in .env.local
 */

/**
 * CheckInData interface - normalized structure for check-in records
 * This matches the transformed data from Planning Center API
 */
export interface CheckInData {
  id: string;
  childName: string;
  familyName: string;
  securityCode: string;
  serviceName: string; // Full service name (e.g., "Sunday Services – Heights • 10:00 AM")
  checkInTime: string;
  medicalNotes?: string;
  eventId: string;
  isFirstTime?: boolean;
  hasBirthday?: boolean;
  className?: string; // Classroom name: Dreamers, Explorers, Heros, Legends, Club 456
  checkedOut?: boolean; // Whether the child has been checked out
  checkOutTime?: string; // Timestamp when checked out
  status?: 'active' | 'checked-out' | 'no-show'; // Current status of the check-in
  dismissTime?: string; // ISO timestamp of when they were marked as no-show
  
  // Planning Center structure fields
  locationId?: string; // Physical location ID (e.g., "loc_heights")
  locationName?: string; // Physical location name (e.g., "Heights", "South Tampa")
  eventName?: string; // Event name (e.g., "Sunday Services – Heights")
  serviceTime?: string; // Service time only (e.g., "8:00 AM", "9:30 AM")
  
  // Roll-over fields
  rolledOverFrom?: string; // e.g., "Heights, 8:30 AM, Dreamers" (if rolled over from previous service)
  isMultiService?: boolean; // true if pre-registered for multiple services via Planning Center
  originalCheckInTime?: string; // Original check-in timestamp (for rolled-over kids)
  rolloverTimestamp?: number; // Unix timestamp for undo tracking (e.g., 1699123456789)
}

export type Classroom = 'Dreamers' | 'Explorers' | 'Heros' | 'Legends' | 'Club 456';

/**
 * Location configuration matching Planning Center structure
 * Each location has an event with multiple service times and classrooms
 */
interface LocationConfig {
  id: string;
  name: string;
  eventName: string; // e.g., "Sunday Services – Heights"
  eventId: string;
  serviceTimes: string[]; // ["8:30 AM", "10:00 AM", "11:30 AM"]
  classrooms: Classroom[];
}

export const LOCATIONS: LocationConfig[] = [
  {
    id: 'loc_heights',
    name: 'Heights',
    eventName: 'Sunday Services – Heights',
    eventId: 'evt_heights_001',
    serviceTimes: ['8:30 AM', '10:00 AM', '11:30 AM'],
    classrooms: ['Dreamers', 'Explorers', 'Heros', 'Legends', 'Club 456']
  },
  {
    id: 'loc_south_tampa',
    name: 'South Tampa',
    eventName: 'Sunday Services – South Tampa',
    eventId: 'evt_south_tampa_001',
    serviceTimes: ['8:00 AM', '9:30 AM', '11:00 AM', '12:30 PM'],
    classrooms: ['Dreamers', 'Explorers', 'Heros', 'Legends', 'Club 456']
  },
  {
    id: 'loc_hillsborough',
    name: 'Hillsborough',
    eventName: 'Sunday Services – Hillsborough',
    eventId: 'evt_hillsborough_001',
    serviceTimes: ['8:00 AM', '9:30 AM', '11:00 AM', '12:30 PM'],
    classrooms: ['Dreamers', 'Explorers', 'Heros', 'Legends', 'Club 456']
  },
  {
    id: 'loc_clearwater',
    name: 'Clearwater',
    eventName: 'Sunday Services – Clearwater',
    eventId: 'evt_clearwater_001',
    serviceTimes: ['8:00 AM', '9:30 AM', '11:00 AM'],
    classrooms: ['Dreamers', 'Explorers', 'Heros', 'Legends', 'Club 456']
  },
  {
    id: 'loc_odessa',
    name: 'Odessa',
    eventName: 'Sunday Services – Odessa',
    eventId: 'evt_odessa_001',
    serviceTimes: ['9:30 AM', '11:00 AM', '12:30 PM'],
    classrooms: ['Dreamers', 'Explorers', 'Heros', 'Legends', 'Club 456']
  },
];

/**
 * Sample family names for generating realistic check-ins
 */
const FAMILY_NAMES = [
  'Anderson', 'Martinez', 'Thompson', 'Davis', 'Wilson', 'Rodriguez', 'Garcia', 
  'Brown', 'Lee', 'Taylor', 'White', 'Harris', 'Martin', 'Jackson', 'Moore',
  'Cooper', 'Mitchell', 'Price', 'Bennett', 'Foster', 'Sanders', 'Peterson',
  'Hayes', 'Collins', 'Reed', 'Morgan', 'Bell', 'Murphy', 'Rivera', 'Cook',
  'Rogers', 'Stewart', 'Morris', 'Richardson', 'Cox', 'Howard', 'Ward', 'Torres',
  'Gray', 'Ramirez', 'James', 'Watson', 'Phillips', 'Campbell', 'Parker', 'Evans',
  'Edwards', 'Sanchez', 'Powell', 'Perry', 'Long', 'Hughes', 'Flores', 'Washington',
  'Butler', 'Simmons', 'Griffin', 'Russell', 'King', 'Wright', 'Lopez', 'Hill',
  'Scott', 'Green', 'Adams', 'Nelson', 'Carter', 'Perez', 'Roberts', 'Turner'
];

/**
 * Sample first names for generating realistic check-ins
 */
const FIRST_NAMES = [
  'Sophia', 'Liam', 'Emma', 'Noah', 'Olivia', 'Elijah', 'Mia', 'Lucas', 'Ava',
  'Isabella', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Ethan', 'Harper', 'Mason',
  'Evelyn', 'Alexander', 'Ella', 'Sebastian', 'Scarlett', 'Jackson', 'Luna', 'Ellie',
  'Caleb', 'Zoe', 'Maya', 'Nathan', 'Aria', 'Logan', 'Chloe', 'Isaac', 'Bella',
  'Ryan', 'Leah', 'Connor', 'Sophie', 'Tyler', 'Aubrey', 'Wyatt', 'Jacob', 'Natalie',
  'Landon', 'Hannah', 'Cameron', 'Violet', 'Owen', 'Lily', 'Miles', 'Stella', 'Blake',
  'Savannah', 'Aiden', 'Lucy', 'Julian', 'Madelyn', 'Grayson', 'Paisley', 'Hudson',
  'Eleanor', 'Lincoln', 'Hazel', 'Nolan', 'Kennedy', 'Beckett', 'Reagan', 'Rylee',
  'Axel', 'Brooklyn', 'Easton', 'Piper', 'Maverick', 'Aurora', 'Jaxon', 'Kinsley',
  'Carson', 'Skylar', 'Brody', 'Asher', 'Ivy', 'Wesley', 'Emerson', 'Sawyer', 'Quinn',
  'Rowan', 'Silas', 'Nova', 'Declan', 'Ember', 'River', 'Levi', 'Willow', 'Knox'
];

/**
 * Sample medical notes for variety
 */
const MEDICAL_NOTES = [
  'Peanut allergy',
  'Dairy allergy',
  'EpiPen for bee stings',
  'Asthma - inhaler in bag',
  'Gluten-free snacks only',
  'Needs help with bathroom',
  'Lactose intolerant',
  'Shellfish allergy',
  'Needs to sit near front',
  'ADHD medication at noon',
  'Needs water frequently',
  'Type 1 diabetes - monitor sugar',
  'Egg allergy',
  'Hearing aid - speak clearly',
  'Gluten allergy',
  'Carries EpiPen',
  'No red dye #40',
  'Milk, Eggs',
  'No Cashews',
  ''
];

/**
 * Helper to generate a random check-in time offset (minutes ago from now)
 */
function getTimeOffset(serviceTime: string): number {
  const baseOffsets: Record<string, number> = {
    '8:00 AM': 180,
    '8:30 AM': 165,
    '9:30 AM': 90,
    '10:00 AM': 60,
    '11:00 AM': 15,
    '11:30 AM': 0,
    '12:30 PM': -30,
  };
  return baseOffsets[serviceTime] || 60;
}

/**
 * Returns comprehensive mock check-in data across all locations
 * Generates 150+ check-ins distributed across all campuses, services, and classrooms
 */
export function getMockCheckIns(): CheckInData[] {
  const now = Date.now();
  let id = 1;
  let codeNum = 100;
  
  const checkIns: CheckInData[] = [];
  
  // Track used names to avoid duplicates
  const usedNames = new Set<string>();
  
  /**
   * Helper to create a check-in record
   */
  const addCheckIn = (
    firstName: string,
    lastName: string,
    locationId: string,
    serviceTime: string,
    classroom: Classroom,
    options: {
      medicalNotes?: string;
      isFirstTime?: boolean;
      hasBirthday?: boolean;
      sameFamily?: boolean;
    } = {}
  ) => {
    const location = LOCATIONS.find(loc => loc.id === locationId);
    if (!location) return;
    
    // Calculate check-in time
    const offset = getTimeOffset(serviceTime);
    const checkInTime = new Date(now - offset * 60000 + Math.random() * 10 * 60000); // Add some randomness
    
    // Generate security code (4 characters: letter + 3 digits)
    const code = options.sameFamily 
      ? `${String.fromCharCode(65 + Math.floor((codeNum - 1) / 1000))}${((codeNum - 1) % 1000).toString().padStart(3, '0')}`
      : `${String.fromCharCode(65 + Math.floor(codeNum / 1000))}${(codeNum++ % 1000).toString().padStart(3, '0')}`;
    
    // Construct full service name
    const serviceName = `${location.eventName} • ${serviceTime}`;
    
    checkIns.push({
      id: String(id++),
      childName: `${firstName} ${lastName}`,
      familyName: lastName,
      securityCode: code,
      serviceName,
      serviceTime,
      locationId: location.id,
      locationName: location.name,
      eventName: location.eventName,
      eventId: location.eventId,
      className: classroom,
      checkInTime: checkInTime.toISOString(),
      medicalNotes: options.medicalNotes || '',
      isFirstTime: options.isFirstTime,
      hasBirthday: options.hasBirthday,
    });
  };
  
  /**
   * Generate random check-ins for a location/service/classroom
   */
  const generateCheckInsForClassroom = (
    locationId: string,
    serviceTime: string,
    classroom: Classroom,
    count: number
  ) => {
    for (let i = 0; i < count; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = FAMILY_NAMES[Math.floor(Math.random() * FAMILY_NAMES.length)];
      const fullName = `${firstName} ${lastName}`;
      
      // Skip if name already used
      if (usedNames.has(fullName)) continue;
      usedNames.add(fullName);
      
      // Random chance for special attributes
      const options: Parameters<typeof addCheckIn>[5] = {
        isFirstTime: Math.random() < 0.15,
        hasBirthday: Math.random() < 0.10,
        medicalNotes: Math.random() < 0.30 ? MEDICAL_NOTES[Math.floor(Math.random() * MEDICAL_NOTES.length)] : '',
      };
      
      addCheckIn(firstName, lastName, locationId, serviceTime, classroom, options);
      
      // 30% chance of sibling
      if (Math.random() < 0.30 && i < count - 1) {
        const siblingFirstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        addCheckIn(siblingFirstName, lastName, locationId, serviceTime, classroom, {
          sameFamily: true,
          medicalNotes: Math.random() < 0.20 ? MEDICAL_NOTES[Math.floor(Math.random() * MEDICAL_NOTES.length)] : '',
        });
        i++; // Increment to account for sibling
      }
    }
  };
  
  // Generate check-ins for each location
  LOCATIONS.forEach(location => {
    location.serviceTimes.forEach(serviceTime => {
      location.classrooms.forEach(classroom => {
        // Vary the number of kids per classroom (2-8 kids)
        const kidsCount = Math.floor(Math.random() * 7) + 2;
        generateCheckInsForClassroom(location.id, serviceTime, classroom, kidsCount);
      });
    });
  });
  
  // Add some specific notable check-ins for testing
  
  // Heights - 10:00 AM - Club 456 (for testing specific scenarios)
  addCheckIn('Gracie', 'Feet', 'loc_heights', '10:00 AM', 'Club 456', {
    medicalNotes: 'Peanut allergy'
  });
  
  // South Tampa - 8:00 AM - Dreamers (early service testing)
  addCheckIn('Edward', 'Hills', 'loc_south_tampa', '8:00 AM', 'Dreamers');
  
  // Hillsborough - Multiple siblings
  addCheckIn('Kate', 'Brady', 'loc_hillsborough', '11:00 AM', 'Legends');
  addCheckIn('Mike', 'Brady', 'loc_hillsborough', '11:00 AM', 'Legends', { sameFamily: true });
  addCheckIn('Jan', 'Brady', 'loc_hillsborough', '11:00 AM', 'Legends', { 
    sameFamily: true, 
    hasBirthday: true 
  });
  
  // Clearwater - First-timers
  addCheckIn('Bella', 'Swan', 'loc_clearwater', '9:30 AM', 'Heros', {
    isFirstTime: true,
    medicalNotes: 'Shy, needs encouragement'
  });
  
  // Odessa - Late service (12:30 PM)
  addCheckIn('Mason', 'South', 'loc_odessa', '12:30 PM', 'Legends', {
    hasBirthday: true
  });
  
  return checkIns;
}
