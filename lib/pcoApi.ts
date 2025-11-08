/**
 * Planning Center Online API Integration
 * 
 * This module handles authenticated requests to the Planning Center Check-Ins API.
 * 
 * Authentication:
 * - Uses Basic Auth with PCO_CLIENT_ID and PCO_CLIENT_SECRET
 * - Credentials are stored in .env.local and never exposed to the client
 * - The credentials are base64-encoded in the Authorization header
 * 
 * API Documentation:
 * https://developer.planning.center/docs/#/apps/check-ins
 */

import { CheckInData } from './mockData';

/**
 * Planning Center API response structure
 * This matches the actual API response format from PCO
 */
interface PCOCheckIn {
  type: "CheckIn";
  id: string;
  attributes: {
    first_name: string;
    last_name: string;
    medical_notes?: string;
    number: number;
    security_code: string;
    created_at: string;
    updated_at: string;
    checked_out_at?: string;
    confirmed_at?: string;
    emergency_contact_name?: string;
    emergency_contact_phone_number?: string;
    one_time_guest?: boolean; // First-time visitor flag
    kind: string;
    birthdate?: string; // Person's birthdate if available
  };
  relationships?: {
    event_period?: {
      data?: {
        type: "EventPeriod";
        id: string;
      };
    };
    person?: {
      data?: {
        type: "Person";
        id: string;
      };
    };
    event_location?: {
      data?: {
        type: "EventLocation";
        id: string;
      };
    };
    event?: {
      data?: {
        type: "Event";
        id: string;
      };
    };
    station?: {
      data?: {
        type: "Station";
        id: string;
      };
    };
  };
}

interface PCOEventPeriod {
  type: "EventPeriod";
  id: string;
  attributes: {
    starts_at: string;
    ends_at: string;
    name?: string;
  };
  relationships?: {
    event?: {
      data?: {
        type: "Event";
        id: string;
      };
    };
  };
}

interface PCOEvent {
  type: "Event";
  id: string;
  attributes: {
    name: string;
    frequency?: string;
  };
  relationships?: {
    location?: {
      data?: {
        type: "Location";
        id: string;
      };
    };
  };
}

interface PCOLocation {
  type: "Location";
  id: string;
  attributes: {
    name: string;
  };
}

interface PCOEventLocation {
  type: "EventLocation";
  id: string;
  attributes: {
    name: string; // Classroom name like "Heros", "Legends", etc.
    label?: string; // Alternative attribute name
    classroom?: string; // Another possible attribute name
  };
}

interface PCOPerson {
  type: "Person";
  id: string;
  attributes: {
    first_name?: string;
    last_name?: string;
    birthdate?: string;
    medical_notes?: string;
  };
}

interface PCOStation {
  type: "Station";
  id: string;
  attributes: {
    name: string; // Check-in device name
  };
}

interface PCOApiResponse {
  data: PCOCheckIn[];
  included?: (PCOEventPeriod | PCOEvent | PCOLocation | PCOEventLocation | PCOPerson | PCOStation)[];
  meta?: {
    total_count: number;
    count: number;
  };
}

/**
 * Fetches live check-in data from Planning Center API
 * 
 * @returns Array of normalized check-in data
 * @throws Error if API credentials are missing or request fails
 */
export async function getLiveCheckIns(): Promise<CheckInData[]> {
  const clientId = process.env.PCO_CLIENT_ID;
  const clientSecret = process.env.PCO_CLIENT_SECRET;

  // Validate credentials
  if (!clientId || !clientSecret) {
    throw new Error(
      'Planning Center API credentials missing. ' +
      'Please set PCO_CLIENT_ID and PCO_CLIENT_SECRET in .env.local'
    );
  }

  // Create Basic Auth token
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    // Fetch check-ins from today with related data
    const today = new Date().toISOString().split('T')[0];
    
    // Planning Center API includes - as specified
    // Include: event, event_period, location (campus), station (check-in devices), person, event_location (classrooms)
    const includeParams = [
      'event',
      'event_period',
      'location',
      'station',
      'person',
      'event_location' // Classrooms
    ].join(',');
    
    const url = `https://api.planningcenteronline.com/check-ins/v2/check_ins?filter=created_at&where[created_at][gte]=${today}&include=${includeParams}&per_page=100`;
    
    console.log('🌐 PCO API URL:', url);
    console.log('📅 Date filter:', today);

    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      // Cache for 30 seconds to avoid rate limiting
      next: { revalidate: 30 },
    });

    // If we get 422, try without the deeply nested location include
    if (!response.ok && response.status === 422) {
      console.warn('⚠️ 422 error with nested location include, trying without it...');
      const simpleIncludeParams = [
        'event',
        'event_period',
        'location',
        'station',
        'person',
        'event_location' // Classrooms
      ].join(',');
      
      const simpleUrl = `https://api.planningcenteronline.com/check-ins/v2/check_ins?filter=created_at&where[created_at][gte]=${today}&include=${simpleIncludeParams}&per_page=100`;
      console.log('🔄 Retrying with simplified URL:', simpleUrl);
      
      response = await fetch(simpleUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 30 },
      });
    }

    if (!response.ok) {
      // Try to get the actual error message from Planning Center
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = errorData.errors ? JSON.stringify(errorData.errors) : '';
        console.error('❌ Planning Center API Error Response:', errorData);
      } catch (e) {
        // If we can't parse the error, just use status text
        errorDetails = response.statusText;
      }
      
      console.error('❌ Planning Center API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorDetails,
        url: url
      });
      
      throw new Error(
        `Planning Center API error: ${response.status} ${response.statusText}${errorDetails ? ` - ${errorDetails}` : ''}`
      );
    }

    const data: PCOApiResponse = await response.json();

    // Log the FULL initial API response to understand structure
    console.log('📦 FULL Initial API Response:', {
      totalCheckIns: data.data?.length || 0,
      includedTypes: data.included?.map(item => item.type) || [],
      includedCounts: {
        CheckIn: data.data?.length || 0,
        EventPeriod: data.included?.filter(i => i.type === 'EventPeriod').length || 0,
        Event: data.included?.filter(i => i.type === 'Event').length || 0,
        Location: data.included?.filter(i => i.type === 'Location').length || 0,
        EventLocation: data.included?.filter(i => i.type === 'EventLocation').length || 0,
        Station: data.included?.filter(i => i.type === 'Station').length || 0,
        Person: data.included?.filter(i => i.type === 'Person').length || 0,
      },
      firstCheckIn: data.data?.[0] ? {
        id: data.data[0].id,
        relationships: Object.keys(data.data[0].relationships || {}),
        event_location_id: data.data[0].relationships?.event_location?.data?.id,
        event_period_id: data.data[0].relationships?.event_period?.data?.id,
        event_id: data.data[0].relationships?.event?.data?.id,
        station_id: data.data[0].relationships?.station?.data?.id,
      } : null,
      sampleIncluded: data.included?.slice(0, 10).map(item => ({
        type: item.type,
        id: item.id,
        name: (item as any).attributes?.name || (item as any).attributes?.label || 'N/A',
        attributes: Object.keys((item as any).attributes || {}),
      })) || [],
      // Check for EventLocation items specifically
      eventLocationItems: data.included?.filter(i => i.type === 'EventLocation').map(item => ({
        id: item.id,
        type: item.type,
        name: (item as any).attributes?.name,
        label: (item as any).attributes?.label,
        allAttributes: Object.keys((item as any).attributes || {})
      })) || [],
    });

    // COLLECT ALL MISSING RESOURCE IDs FIRST
    const missingEventLocationIds = new Set<string>();
    const missingLocationIds = new Set<string>();
    const missingEventIds = new Set<string>();

    data.data.forEach(checkIn => {
      // Collect missing event_location IDs (CLASSROOMS - PRIORITY #1)
      // Try multiple sources: direct check-in relationship, event_period relationship, event relationship
      let eventLocationId = checkIn.relationships?.event_location?.data?.id;
      
      // If not found on check-in, try event_period
      if (!eventLocationId) {
        const eventPeriodId = checkIn.relationships?.event_period?.data?.id;
        if (eventPeriodId) {
          const eventPeriod = data.included?.find(item => 
            item.type === 'EventPeriod' && item.id === eventPeriodId
          ) as any;
          if (eventPeriod?.relationships?.event_location?.data?.id) {
            eventLocationId = eventPeriod.relationships.event_location.data.id;
            console.log(`📍 Found event_location ${eventLocationId} via event_period for check-in ${checkIn.id}`);
          }
        }
      }
      
      // If still not found, try event
      if (!eventLocationId) {
        const directEventId = checkIn.relationships?.event?.data?.id;
        if (directEventId) {
          const event = data.included?.find(item => 
            item.type === 'Event' && item.id === directEventId
          ) as any;
          if (event?.relationships?.event_locations?.data) {
            // Event might have multiple event_locations
            const eventLocationRefs = Array.isArray(event.relationships.event_locations.data) 
              ? event.relationships.event_locations.data 
              : [event.relationships.event_locations.data];
            eventLocationRefs.forEach((ref: any) => {
              if (ref.id && !data.included?.find(item => item.type === 'EventLocation' && item.id === ref.id)) {
                missingEventLocationIds.add(ref.id);
                console.log(`📍 Found event_location ${ref.id} via event for check-in ${checkIn.id}`);
              }
            });
          }
        }
      }
      
      // Add to missing set if found but not included
      if (eventLocationId && !data.included?.find(item => item.type === 'EventLocation' && item.id === eventLocationId)) {
        missingEventLocationIds.add(eventLocationId);
        console.log(`🚨 Missing EventLocation (classroom) ${eventLocationId} for check-in ${checkIn.id}`);
      }

      // Collect missing event IDs
      const directEventId = checkIn.relationships?.event?.data?.id;
      if (directEventId) missingEventIds.add(directEventId);
      
      const eventPeriodId = checkIn.relationships?.event_period?.data?.id;
      if (eventPeriodId) {
        const eventPeriod = data.included?.find(item => 
          item.type === 'EventPeriod' && item.id === eventPeriodId
        );
        if (eventPeriod) {
          const periodEventId = (eventPeriod as any)?.relationships?.event?.data?.id;
          if (periodEventId) missingEventIds.add(periodEventId);
          
          // Also check if event_period has event_locations relationship
          const periodEventLocationId = (eventPeriod as any)?.relationships?.event_location?.data?.id;
          if (periodEventLocationId && !data.included?.find(item => item.type === 'EventLocation' && item.id === periodEventLocationId)) {
            missingEventLocationIds.add(periodEventLocationId);
            console.log(`📍 Found event_location ${periodEventLocationId} via event_period relationship`);
          }
        }
      }
    });
    
    // Also check all event_periods for event_locations
    data.included?.forEach(item => {
      if (item.type === 'EventPeriod') {
        const eventPeriod = item as any;
        const eventLocationId = eventPeriod?.relationships?.event_location?.data?.id;
        if (eventLocationId && !data.included?.find(i => i.type === 'EventLocation' && i.id === eventLocationId)) {
          missingEventLocationIds.add(eventLocationId);
          console.log(`📍 Found event_location ${eventLocationId} via event_period in included array`);
        }
      }
      
      // Also check events for event_locations
      if (item.type === 'Event') {
        const event = item as any;
        if (event?.relationships?.event_locations?.data) {
          const eventLocationRefs = Array.isArray(event.relationships.event_locations.data) 
            ? event.relationships.event_locations.data 
            : [event.relationships.event_locations.data];
          eventLocationRefs.forEach((ref: any) => {
            if (ref.id && !data.included?.find(i => i.type === 'EventLocation' && i.id === ref.id)) {
              missingEventLocationIds.add(ref.id);
              console.log(`📍 Found event_location ${ref.id} via event in included array`);
            }
          });
        }
      }
    });

    // PRIORITY #1: Fetch missing EventLocation resources (CLASSROOMS)
    if (missingEventLocationIds.size > 0) {
      console.log(`🏫 Fetching ${missingEventLocationIds.size} missing EventLocation (classroom) resources...`);
      const eventLocationPromises = Array.from(missingEventLocationIds).map(async (eventLocationId) => {
        try {
          const eventLocationResponse = await fetch(
            `https://api.planningcenteronline.com/check-ins/v2/event_locations/${eventLocationId}`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
              },
              next: { revalidate: 30 },
            }
          );
          
          if (eventLocationResponse.ok) {
            const eventLocationData = await eventLocationResponse.json();
            console.log(`✅ Fetched EventLocation (classroom) ${eventLocationId}:`, {
              name: eventLocationData.data?.attributes?.name,
              label: eventLocationData.data?.attributes?.label,
              allAttributes: Object.keys(eventLocationData.data?.attributes || {}),
              fullData: eventLocationData.data,
            });
            
            if (eventLocationData.data && !data.included?.find(item => item.type === 'EventLocation' && item.id === eventLocationId)) {
              if (!data.included) data.included = [];
              data.included.push(eventLocationData.data);
            }
          } else {
            console.warn(`⚠️ Failed to fetch EventLocation ${eventLocationId}: ${eventLocationResponse.status}`);
          }
        } catch (e) {
          console.error(`❌ Error fetching EventLocation ${eventLocationId}:`, e);
        }
      });
      
      await Promise.all(eventLocationPromises);
      console.log(`✅ Finished fetching EventLocations. Total now: ${data.included?.filter(item => item.type === 'EventLocation').length || 0}`);
    }

    // ALWAYS try fetching event_locations (classrooms) using sub-resource pattern
    // Collect all unique event IDs first if we haven't already
    if (missingEventIds.size === 0) {
      console.log('🔍 Collecting event IDs for event_locations fetch...');
      data.data.forEach(checkIn => {
        const directEventId = checkIn.relationships?.event?.data?.id;
        if (directEventId) missingEventIds.add(directEventId);
        
        const eventPeriodId = checkIn.relationships?.event_period?.data?.id;
        if (eventPeriodId) {
          const eventPeriod = data.included?.find(item => 
            item.type === 'EventPeriod' && item.id === eventPeriodId
          );
          if (eventPeriod) {
            const periodEventId = (eventPeriod as any)?.relationships?.event?.data?.id;
            if (periodEventId) missingEventIds.add(periodEventId);
          }
        }
      });
      console.log(`🔍 Collected ${missingEventIds.size} event IDs for event_locations fetch`);
    }

    // ALSO fetch event_periods with their event_location relationships
    // CRITICAL: event_periods may have event_location relationships that link service times to classrooms
    console.log('🔍 Fetching event_periods with event_location relationships...');
    const eventPeriodIds = new Set<string>();
    data.data.forEach(checkIn => {
      const eventPeriodId = checkIn.relationships?.event_period?.data?.id;
      if (eventPeriodId) eventPeriodIds.add(eventPeriodId);
    });
    
    if (eventPeriodIds.size > 0) {
      console.log(`📋 Fetching ${eventPeriodIds.size} event_periods to check for event_location relationships...`);
      const eventPeriodPromises = Array.from(eventPeriodIds).map(async (eventPeriodId) => {
        try {
          const eventPeriodResponse = await fetch(
            `https://api.planningcenteronline.com/check-ins/v2/event_periods/${eventPeriodId}?include=event_location`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
              },
              next: { revalidate: 30 },
            }
          );
          
          if (eventPeriodResponse.ok) {
            const eventPeriodData = await eventPeriodResponse.json();
            const fetchedEventPeriod = eventPeriodData.data;
            
            // Log all event_period responses to find Gracie's
            console.log(`📋 EventPeriod ${eventPeriodId} full response:`, {
              id: eventPeriodId,
              hasData: !!fetchedEventPeriod,
              starts_at: fetchedEventPeriod?.attributes?.starts_at,
              name: fetchedEventPeriod?.attributes?.name,
              relationships: Object.keys(fetchedEventPeriod?.relationships || {}),
              event_location_id: fetchedEventPeriod?.relationships?.event_location?.data?.id,
              included: eventPeriodData.included?.map((i: any) => i.type) || [],
              // CRITICAL: Parse the time to see what it actually is
              parsedTime: fetchedEventPeriod?.attributes?.starts_at ? new Date(fetchedEventPeriod.attributes.starts_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'
            });
            
            // CRITICAL: Update or add the event_period in included array with full fetched data
            // This ensures we have the correct starts_at timestamp for each event_period
            // The included.find() in transformPCOData will use this updated data
            if (!data.included) data.included = [];
            const existingEventPeriodIndex = data.included.findIndex(item => item.type === 'EventPeriod' && item.id === eventPeriodId);
            
            if (existingEventPeriodIndex >= 0) {
              // Update existing event_period with fetched data (includes correct starts_at)
              data.included[existingEventPeriodIndex] = fetchedEventPeriod;
              console.log(`✅ Updated EventPeriod ${eventPeriodId} in included array:`, {
                starts_at: fetchedEventPeriod.attributes?.starts_at,
                name: fetchedEventPeriod.attributes?.name,
                old_starts_at: (data.included[existingEventPeriodIndex] as any).attributes?.starts_at
              });
            } else {
              // Add new event_period if not already in included array
              data.included.push(fetchedEventPeriod);
              console.log(`✅ Added EventPeriod ${eventPeriodId} to included array:`, {
                starts_at: fetchedEventPeriod.attributes?.starts_at,
                name: fetchedEventPeriod.attributes?.name
              });
            }
            
            const eventLocationId = fetchedEventPeriod?.relationships?.event_location?.data?.id;
            
            if (eventLocationId) {
              console.log(`✅ EventPeriod ${eventPeriodId} has event_location ${eventLocationId}`);
              
              // If the event_location is not already included, fetch it
              if (!data.included.find(item => item.type === 'EventLocation' && item.id === eventLocationId)) {
                try {
                  const eventLocationResponse = await fetch(
                    `https://api.planningcenteronline.com/check-ins/v2/event_locations/${eventLocationId}`,
                    {
                      method: 'GET',
                      headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/json',
                      },
                      next: { revalidate: 30 },
                    }
                  );
                  
                  if (eventLocationResponse.ok) {
                    const eventLocationData = await eventLocationResponse.json();
                    if (eventLocationData.data && !data.included.find(item => item.type === 'EventLocation' && item.id === eventLocationId)) {
                      if (!data.included) data.included = [];
                      data.included.push(eventLocationData.data);
                      console.log(`✅ Fetched EventLocation ${eventLocationId} (${eventLocationData.data.attributes?.name || 'unnamed'}) for event_period ${eventPeriodId}`);
                    }
                  }
                } catch (e) {
                  console.error(`❌ Error fetching EventLocation ${eventLocationId} for event_period ${eventPeriodId}:`, e);
                }
              }
            }
          }
        } catch (e) {
          console.error(`❌ Error fetching event_period ${eventPeriodId}:`, e);
        }
      });
      
      await Promise.all(eventPeriodPromises);
    }
    
    // Try fetching event_locations (classrooms) using sub-resource pattern
    if (missingEventIds.size > 0) {
      const initialEventLocationCount = data.included?.filter(item => item.type === 'EventLocation').length || 0;
      console.log(`🏫 Fetching event_locations (classrooms) for ${missingEventIds.size} events...`);
      console.log(`   Current EventLocation count: ${initialEventLocationCount}`);
      
      if (initialEventLocationCount === 0) {
        console.log('🏫 No event_locations in initial response, trying /events/{id}/event_locations...');
      }
      const classroomPromises = Array.from(missingEventIds).map(async (eventId) => {
        try {
          const eventLocationsResponse = await fetch(
            `https://api.planningcenteronline.com/check-ins/v2/events/${eventId}/event_locations`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
              },
              next: { revalidate: 30 },
            }
          );
          
          if (eventLocationsResponse.ok) {
            const eventLocationsData = await eventLocationsResponse.json();
            console.log(`✅ Fetched event_locations for event ${eventId}:`, {
              responseStructure: {
                hasData: !!eventLocationsData.data,
                hasIncluded: !!eventLocationsData.included,
                dataType: eventLocationsData.data?.constructor?.name,
                dataLength: Array.isArray(eventLocationsData.data) ? eventLocationsData.data.length : (eventLocationsData.data ? 1 : 0),
              },
              eventLocations: Array.isArray(eventLocationsData.data) 
                ? eventLocationsData.data.map((el: any) => ({
                    id: el.id,
                    type: el.type,
                    name: el.attributes?.name,
                    label: el.attributes?.label,
                    allAttributes: Object.keys(el.attributes || {})
                  }))
                : eventLocationsData.data ? [{
                    id: eventLocationsData.data.id,
                    type: eventLocationsData.data.type,
                    name: eventLocationsData.data.attributes?.name,
                    label: eventLocationsData.data.attributes?.label,
                    allAttributes: Object.keys(eventLocationsData.data.attributes || {})
                  }] : []
            });
            
            // Add event_locations to included array
            const eventLocationItems = Array.isArray(eventLocationsData.data) ? eventLocationsData.data : (eventLocationsData.data ? [eventLocationsData.data] : []);
            eventLocationItems.forEach((eventLocation: any) => {
              if (eventLocation.type === 'EventLocation' && !data.included?.find(item => item.type === 'EventLocation' && item.id === eventLocation.id)) {
                if (!data.included) data.included = [];
                data.included.push(eventLocation);
                console.log(`✅ Added EventLocation ${eventLocation.id}: ${eventLocation.attributes?.name || eventLocation.attributes?.label || 'unnamed'}`);
              }
            });
            
            // Also check included array
            if (eventLocationsData.included) {
              eventLocationsData.included.forEach((item: any) => {
                if (item.type === 'EventLocation' && !data.included?.find(i => i.type === 'EventLocation' && i.id === item.id)) {
                  if (!data.included) data.included = [];
                  data.included.push(item);
                  console.log(`✅ Added EventLocation from included: ${item.id}: ${item.attributes?.name || item.attributes?.label || 'unnamed'}`);
                }
              });
            }
          } else {
            console.warn(`⚠️ Failed to fetch event_locations for event ${eventId}: ${eventLocationsResponse.status}`);
            try {
              const errorText = await eventLocationsResponse.text();
              console.warn(`   Error response: ${errorText}`);
            } catch (e) {
              // Ignore error reading response
            }
          }
        } catch (e) {
          console.error(`❌ Error fetching event_locations for event ${eventId}:`, e);
        }
      });
      
      await Promise.all(classroomPromises);
      const finalEventLocationCount = data.included?.filter(item => item.type === 'EventLocation').length || 0;
      console.log(`✅ Finished fetching event_locations. Total now: ${finalEventLocationCount} (was ${initialEventLocationCount})`);
      
      if (finalEventLocationCount === 0) {
        console.warn('⚠️ WARNING: Still no event_locations found after trying /events/{id}/event_locations');
        console.warn('   This might mean:');
        console.warn('   1. The endpoint /events/{id}/event_locations doesn\'t exist or returns empty');
        console.warn('   2. Events don\'t have classrooms assigned in Planning Center');
        console.warn('   3. Check the Network tab for 404 or other errors');
      }
    } else {
      console.warn('⚠️ No event IDs found, cannot fetch event_locations');
    }

    // If locations weren't included in the initial response, fetch them separately
    if (data.included && data.included.filter(item => item.type === 'Location').length === 0) {
      console.log('📥 No locations in initial response, fetching events with locations...');
      
      // Use the event IDs we already collected
      const eventIds = missingEventIds;

      // Fetch locations using the sub-resource endpoint: /events/{id}/locations
      if (eventIds.size > 0) {
        console.log(`📍 Fetching locations for ${eventIds.size} events using /events/{id}/locations...`);
        const locationPromises = Array.from(eventIds).map(async (eventId) => {
          try {
            const locationsResponse = await fetch(
              `https://api.planningcenteronline.com/check-ins/v2/events/${eventId}/locations`,
              {
                method: 'GET',
                headers: {
                  'Authorization': `Basic ${auth}`,
                  'Content-Type': 'application/json',
                },
                next: { revalidate: 30 },
              }
            );
            
            if (locationsResponse.ok) {
              const locationsData = await locationsResponse.json();
              
              console.log(`✅ Fetched locations for event ${eventId}:`, {
                responseStructure: {
                  hasData: !!locationsData.data,
                  hasIncluded: !!locationsData.included,
                  dataType: locationsData.data?.constructor?.name,
                  dataLength: Array.isArray(locationsData.data) ? locationsData.data.length : (locationsData.data ? 1 : 0),
                },
                locations: Array.isArray(locationsData.data) 
                  ? locationsData.data.map((loc: any) => ({
                      id: loc.id,
                      type: loc.type,
                      name: loc.attributes?.name,
                      allAttributes: Object.keys(loc.attributes || {})
                    }))
                  : locationsData.data ? [{
                      id: locationsData.data.id,
                      type: locationsData.data.type,
                      name: locationsData.data.attributes?.name,
                      allAttributes: Object.keys(locationsData.data.attributes || {})
                    }] : [],
                included: locationsData.included?.map((item: any) => ({
                  type: item.type,
                  id: item.id,
                  name: item.attributes?.name
                })) || []
              });
              
              // Add locations from data array
              // IMPORTANT: /events/{id}/locations may return "Location" type items that are actually classrooms
              // We need to add them as both Location (for campus) AND EventLocation (for classroom) if they appear to be classrooms
              const locationItems = Array.isArray(locationsData.data) ? locationsData.data : (locationsData.data ? [locationsData.data] : []);
              const eventLocationIds: string[] = [];
              
              locationItems.forEach((location: any) => {
                // Add as Location (campus/physical location)
                if (location.type === 'Location' && !data.included?.find(item => item.type === 'Location' && item.id === location.id)) {
                  if (!data.included) data.included = [];
                  data.included.push(location);
                  console.log(`✅ Added Location (campus) ${location.id}: ${location.attributes?.name || 'unnamed'}`);
                }
                
                // ALSO add as EventLocation (classroom) - /events/{id}/locations returns classrooms in Planning Center
                // Any Location returned from this endpoint should be treated as a classroom (EventLocation)
                // Check if it already exists as EventLocation
                if (!data.included?.find(item => item.type === 'EventLocation' && item.id === location.id)) {
                  if (!data.included) data.included = [];
                  // Create EventLocation entry from Location
                  const eventLocationFromLocation: PCOEventLocation = {
                    type: 'EventLocation',
                    id: location.id,
                    attributes: {
                      name: location.attributes?.name,
                      label: location.attributes?.label || location.attributes?.name,
                      classroom: location.attributes?.name
                    }
                  };
                  data.included.push(eventLocationFromLocation);
                  eventLocationIds.push(location.id);
                  console.log(`✅ Added EventLocation (classroom) ${location.id}: ${location.attributes?.name || 'unnamed'} (from /events/{id}/locations)`);
                }
              });
              
              // CRITICAL FIX: Update the Event object to link to these EventLocations
              // This is what was missing! The EventLocations exist but Event doesn't know about them
              if (eventLocationIds.length > 0) {
                const eventIndex = data.included?.findIndex(item => item.type === 'Event' && item.id === eventId);
                if (eventIndex !== undefined && eventIndex >= 0 && data.included) {
                  const event = data.included[eventIndex] as any;
                  if (!event.relationships) {
                    event.relationships = {};
                  }
                  event.relationships.event_locations = {
                    data: eventLocationIds.map(id => ({ type: 'EventLocation', id }))
                  };
                  console.log(`🔗 CRITICAL FIX: Updated Event ${eventId} with ${eventLocationIds.length} event_locations relationships`);
                }
              }
              
              // Add locations from included array
              if (locationsData.included) {
                locationsData.included.forEach((item: any) => {
                  if (item.type === 'Location' && !data.included?.find(i => i.type === 'Location' && i.id === item.id)) {
                    if (!data.included) data.included = [];
                    data.included.push(item);
                    console.log(`✅ Added Location from included: ${item.id}: ${item.attributes?.name || 'unnamed'}`);
                  }
                });
              }
            } else {
              console.warn(`⚠️ Failed to fetch locations for event ${eventId}: ${locationsResponse.status}`);
              try {
                const errorText = await locationsResponse.text();
                console.warn(`   Error response: ${errorText}`);
              } catch (e) {
                // Ignore error reading response
              }
            }
          } catch (e) {
            console.error(`❌ Error fetching locations for event ${eventId}:`, e);
          }
        });
        
        await Promise.all(locationPromises);
        console.log(`✅ Finished fetching locations. Total locations now: ${data.included?.filter(item => item.type === 'Location').length || 0}`);
      }
    }

    // PRIORITY #2: Fetch missing Location resources (CAMPUS) directly
    if (missingLocationIds.size > 0) {
      console.log(`📍 Fetching ${missingLocationIds.size} missing Location (campus) resources...`);
      const locationPromises = Array.from(missingLocationIds).map(async (locationId) => {
        try {
          const locationResponse = await fetch(
            `https://api.planningcenteronline.com/check-ins/v2/locations/${locationId}`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
              },
              next: { revalidate: 30 },
            }
          );
          
          if (locationResponse.ok) {
            const locationData = await locationResponse.json();
            console.log(`✅ Fetched Location (campus) ${locationId}:`, {
              name: locationData.data?.attributes?.name,
              allAttributes: Object.keys(locationData.data?.attributes || {}),
              fullData: locationData.data,
            });
            
            if (locationData.data && !data.included?.find(item => item.type === 'Location' && item.id === locationId)) {
              if (!data.included) data.included = [];
              data.included.push(locationData.data);
            }
          } else {
            console.warn(`⚠️ Failed to fetch Location ${locationId}: ${locationResponse.status}`);
          }
        } catch (e) {
          console.error(`❌ Error fetching Location ${locationId}:`, e);
        }
      });
      
      await Promise.all(locationPromises);
      console.log(`✅ Finished fetching Locations. Total now: ${data.included?.filter(item => item.type === 'Location').length || 0}`);
    }

    // Transform PCO data into our normalized format
    return transformPCOData(data);
  } catch (error) {
    console.error('Error fetching from Planning Center API:', error);
    throw error;
  }
}

/**
 * Check if a person has a birthday coming up within the next 7 days
 * 
 * @param birthdate - Birthdate string in format "YYYY-MM-DD"
 * @returns Boolean indicating if birthday is within the next 7 days
 */
function hasBirthdayComingUp(birthdate?: string): boolean {
  if (!birthdate) return false;

  try {
    const today = new Date();
    const [year, month, day] = birthdate.split('-').map(Number);
    
    // Create birthday date for this year
    const thisYearBirthday = new Date(today.getFullYear(), month - 1, day);
    
    // If birthday already passed this year, check next year
    const upcomingBirthday = thisYearBirthday < today
      ? new Date(today.getFullYear() + 1, month - 1, day)
      : thisYearBirthday;
    
    // Calculate days until birthday
    const daysUntilBirthday = Math.ceil(
      (upcomingBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Return true if birthday is within the next 7 days
    return daysUntilBirthday >= 0 && daysUntilBirthday <= 7;
  } catch (error) {
    console.error('Error parsing birthdate:', birthdate, error);
    return false;
  }
}

/**
 * Transforms Planning Center API response into our normalized data structure
 * 
 * @param pcoData - Raw response from PCO API
 * @returns Array of normalized CheckInData objects
 */
function transformPCOData(pcoData: PCOApiResponse): CheckInData[] {
  const { data, included = [] } = pcoData;

  // Create lookup maps for all related resources from included[] array
  const eventPeriodsMap = new Map<string, PCOEventPeriod>();
  const eventsMap = new Map<string, PCOEvent>();
  const locationsMap = new Map<string, PCOLocation>();
  const eventLocationsMap = new Map<string, PCOEventLocation>();
  const peopleMap = new Map<string, PCOPerson>();
  const stationsMap = new Map<string, PCOStation>();

  included.forEach((item) => {
    if (item.type === 'EventPeriod') {
      eventPeriodsMap.set(item.id, item as PCOEventPeriod);
    } else if (item.type === 'Event') {
      eventsMap.set(item.id, item as PCOEvent);
    } else if (item.type === 'Location') {
      locationsMap.set(item.id, item as PCOLocation);
    } else if (item.type === 'EventLocation') {
      eventLocationsMap.set(item.id, item as PCOEventLocation);
    } else if (item.type === 'Person') {
      peopleMap.set(item.id, item as PCOPerson);
    } else if (item.type === 'Station') {
      stationsMap.set(item.id, item as PCOStation);
    }
  });

  // Debug: Log lookup maps with detailed info
  console.log('📊 Lookup Maps (from included[]):', {
    eventPeriods: eventPeriodsMap.size,
    events: eventsMap.size,
    locations: locationsMap.size, // Campus/physical locations
    eventLocations: eventLocationsMap.size, // Classrooms - THIS IS WHAT WE NEED FOR UI
    stations: stationsMap.size, // Check-in devices
    people: peopleMap.size,
    sampleEventPeriod: Array.from(eventPeriodsMap.values())[0],
    sampleEvent: Array.from(eventsMap.values())[0],
    sampleLocation: Array.from(locationsMap.values())[0],
    sampleEventLocation: Array.from(eventLocationsMap.values())[0] || '⚠️ NO EVENTLOCATIONS FOUND',
    sampleStation: Array.from(stationsMap.values())[0],
    samplePerson: Array.from(peopleMap.values())[0],
    // Show ALL EventLocations found
    allEventLocations: Array.from(eventLocationsMap.entries()).map(([id, el]) => ({
      id,
      name: el.attributes?.name,
      label: el.attributes?.label
    }))
  });
  
  // CRITICAL: Alert if no EventLocations found
  if (eventLocationsMap.size === 0) {
    console.error('🚨 CRITICAL: NO EVENTLOCATIONS (CLASSROOMS) IN API RESPONSE!');
    console.error('   BY CLASSROOM section will be EMPTY in UI');
    console.error('   Check Planning Center setup - ensure events have event_locations configured');
  }
  
  if (eventLocationsMap.size === 0) {
    console.warn('⚠️ CRITICAL: No EventLocations (classrooms) found in lookup map!');
    console.warn('   This means className will be undefined for all check-ins.');
    console.warn('   Check the initial API response - EventLocation count should be > 0');
  }

  // First pass: Calculate summary statistics before transformation
  const statsCheck = data.map((checkIn) => {
    const eventPeriodId = checkIn.relationships?.event_period?.data?.id;
    const eventPeriod = eventPeriodId ? eventPeriodsMap.get(eventPeriodId) : null;
    const eventId = eventPeriod?.relationships?.event?.data?.id;
    const event = eventId ? eventsMap.get(eventId) : null;
    const locationId = event?.relationships?.location?.data?.id;
    const location = locationId ? locationsMap.get(locationId) : null;
    const eventLocationId = checkIn.relationships?.event_location?.data?.id;
    const eventLocation = eventLocationId ? eventLocationsMap.get(eventLocationId) : null;
    
    return {
      hasLocation: !!location?.attributes.name,
      hasEvent: !!event?.attributes.name,
      hasEventLocation: !!eventLocation?.attributes.name,
      hasServiceTime: !!eventPeriod?.attributes.starts_at
    };
  });
  
  const summary = {
    total: statsCheck.length,
    withLocation: statsCheck.filter(d => d.hasLocation).length,
    withEvent: statsCheck.filter(d => d.hasEvent).length,
    withEventLocation: statsCheck.filter(d => d.hasEventLocation).length,
    withServiceTime: statsCheck.filter(d => d.hasServiceTime).length
  };
  
  console.log('📈 Transformation Summary:', summary);
  if (summary.withLocation === 0 && summary.total > 0) {
    console.warn('⚠️ WARNING: No locations found! Check if event_period.event.location include is working.');
    console.warn('💡 Tip: Make sure your Events in Planning Center have Locations assigned.');
  }
  if (summary.withEventLocation === 0 && summary.total > 0) {
    console.warn('⚠️ WARNING: No event locations (classrooms) found! Check if event_location include is working.');
    console.warn('💡 Tip: Make sure check-ins are assigned to Labels & Locations in Planning Center.');
  }
  if (summary.withEvent === 0 && summary.total > 0) {
    console.warn('⚠️ WARNING: No events found! Check if event_period.event include is working.');
  }
  
  // CRITICAL DEBUG: Log all check-in IDs to see if we're getting multiple records for same child
  console.log(`📋 Total check-ins from API: ${data.length}`);
  const checkInIds = data.map(c => c.id);
  console.log(`📋 Check-in IDs:`, checkInIds);
  
  // Group by person to see if same person has multiple check-ins (multiple service times)
  const checkInsByPerson = new Map<string, any[]>();
  data.forEach((checkIn, idx) => {
    const personId = checkIn.relationships?.person?.data?.id || `unknown-${idx}`;
    if (!checkInsByPerson.has(personId)) {
      checkInsByPerson.set(personId, []);
    }
    checkInsByPerson.get(personId)!.push(checkIn);
  });
  
  // Log persons with multiple check-ins (should indicate multiple service times)
  checkInsByPerson.forEach((checkIns, personId) => {
    if (checkIns.length > 1) {
      const eventPeriodIds = checkIns.map(c => c.relationships?.event_period?.data?.id).filter(Boolean);
      console.log(`✅ Person ${personId} has ${checkIns.length} check-ins (multiple service times):`, {
        checkInIds: checkIns.map(c => c.id),
        eventPeriodIds,
        serviceNames: checkIns.map(c => {
          const epId = c.relationships?.event_period?.data?.id;
          // Use included.find() for consistency with transformPCOData
          const ep = included.find(i => i.id === epId && i.type === 'EventPeriod') as PCOEventPeriod | undefined;
          return ep?.attributes?.starts_at || 'MISSING';
        })
      });
    }
  });

  return data.map((checkIn, index) => {
    // Critical relationships check - only log if missing
    const hasEventPeriod = !!checkIn.relationships?.event_period?.data?.id;
    const hasEventLocation = !!checkIn.relationships?.event_location?.data?.id;
    const eventLocationIdFromCheckIn = checkIn.relationships?.event_location?.data?.id;
    
    // Only log if critical relationships are missing
    if (!hasEventPeriod && index < 3) {
      console.warn(`⚠️ CheckIn ${checkIn.id} is missing event_period relationship`);
    }
    
    // If we have an eventLocationId but it's not in the map, that's a critical issue
    if (eventLocationIdFromCheckIn && !eventLocationsMap.has(eventLocationIdFromCheckIn)) {
      console.error(`❌ CheckIn ${checkIn.id} references event_location ${eventLocationIdFromCheckIn} but it's not in the included[] array!`);
    }

    const personId = checkIn.relationships?.person?.data?.id;
    const person = personId ? peopleMap.get(personId) : null;
    const firstName = person?.attributes.first_name || checkIn.attributes.first_name || 'Unknown';
    const lastName = person?.attributes.last_name || checkIn.attributes.last_name || 'Unknown';
    const medicalNotes = person?.attributes.medical_notes || checkIn.attributes.medical_notes || '';
    const birthdate = person?.attributes.birthdate || checkIn.attributes.birthdate;
    
    // CRITICAL: Get event_period directly from included array using relationship ID
    // This ensures we get the correct event_period for this specific check-in
    const eventPeriodId = checkIn.relationships?.event_period?.data?.id;
    const eventPeriod = eventPeriodId 
      ? (included.find(i => i.id === eventPeriodId && i.type === 'EventPeriod') as PCOEventPeriod | undefined)
      : null;
    
    // CRITICAL DEBUG: Log event_period assignment for ALL check-ins to diagnose timing issues
    console.log(`🔍 CheckIn ${checkIn.id} (${firstName} ${lastName}):`, {
      eventPeriodId: eventPeriodId || 'MISSING',
      starts_at: eventPeriod?.attributes.starts_at || 'MISSING',
      parsedTime: eventPeriod?.attributes.starts_at ? new Date(eventPeriod.attributes.starts_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'
    });
    
    // CRITICAL: If event_period is missing from included array after all fetching, log error
    if (eventPeriodId && !eventPeriod) {
      console.error(`❌ CRITICAL: EventPeriod ${eventPeriodId} NOT FOUND for CheckIn ${checkIn.id} (${firstName} ${lastName})`);
      console.error(`   This check-in will have INCORRECT service time!`);
    }
    
    // Try to get event via direct CheckIn relationship first (might be more reliable)
    const directEventId = checkIn.relationships?.event?.data?.id;
    const event = directEventId ? eventsMap.get(directEventId) : 
                  (eventPeriod?.relationships?.event?.data?.id ? eventsMap.get(eventPeriod.relationships.event.data.id) : null);
    const eventId = event?.id;
    
    // Try multiple ways to get location/campus
    // Method 1: location relationship (standard)
    let locationId = event?.relationships?.location?.data?.id;
    let location = locationId ? locationsMap.get(locationId) : null;
    
    // Method 2: Check if event has campus attribute directly
    if (!location && (event as any)?.attributes?.campus) {
      console.log(`📍 Found campus in event attributes: ${(event as any).attributes.campus}`);
      // Use the campus name from event attributes as a fallback
      location = {
        type: 'Location',
        id: `campus_${eventId}`,
        attributes: {
          name: (event as any).attributes.campus
        }
      } as PCOLocation;
      if (!locationsMap.has(location.id)) {
        locationsMap.set(location.id, location);
      }
    }
    
    // Method 3: Check if event has campuses relationship (plural)
    if (!location && (event as any)?.relationships?.campuses) {
      const campuses = (event as any).relationships.campuses;
      if (campuses?.data && Array.isArray(campuses.data) && campuses.data.length > 0) {
        const campusId = campuses.data[0].id;
        location = locationsMap.get(campusId);
        if (location) {
          locationId = campusId;
        }
      }
    }
    
    // Get station (check-in device) from CheckIn relationship using included[] array
    const stationId = checkIn.relationships?.station?.data?.id;
    const station = stationId ? stationsMap.get(stationId) : null;
    
    // Try multiple methods to get event_location (classroom) from CheckIn relationship using included[] array
    // Method 1: Direct relationship on CheckIn (MOST RELIABLE - check this first)
    let eventLocationId = checkIn.relationships?.event_location?.data?.id;
    let eventLocation = eventLocationId ? eventLocationsMap.get(eventLocationId) : null;
    
    // Only log errors, not successes
    if (eventLocationId && !eventLocation) {
      console.warn(`⚠️ CheckIn ${checkIn.id} has event_location ${eventLocationId} but it's not in the map`);
    }
    
    // Method 2: Try via event_period's event_location relationship (check this BEFORE event.event_locations)
    // CRITICAL: Each event_period might have its own event_location (classroom)
    // This is how Planning Center links specific service times to specific classrooms
    // THIS IS THE MOST ACCURATE METHOD - it directly links service times to classrooms
    if (!eventLocation && eventPeriod) {
      // Check if the event_period itself has an event_location relationship
      const periodEventLocationId = (eventPeriod as any)?.relationships?.event_location?.data?.id;
      if (periodEventLocationId) {
        eventLocation = eventLocationsMap.get(periodEventLocationId);
        if (eventLocation) {
          eventLocationId = periodEventLocationId;
        } else {
          console.warn(`⚠️ CheckIn ${checkIn.id}: event_period references event_location ${periodEventLocationId} but it's not in the map`);
        }
      }
    }
    
    // Method 1b: Try via event relationship (event might have event_locations array)
    // Only use this if direct relationship and event_period relationship didn't work
    if (!eventLocation && event) {
      const eventEventLocations = (event as any)?.relationships?.event_locations?.data;
      if (eventEventLocations) {
        const eventLocationRefs = Array.isArray(eventEventLocations) ? eventEventLocations : [eventEventLocations];
        // If there's exactly ONE event_location, use it (unambiguous)
        if (eventLocationRefs.length === 1) {
          const ref = eventLocationRefs[0];
          eventLocation = eventLocationsMap.get(ref.id);
          if (eventLocation) {
            eventLocationId = ref.id;
          }
        }
      }
    }
    
    // Method 3: Match EventLocations based on event_period ID hash (only if Methods 1, 1b, 2 failed)
    // CRITICAL: Only use EventLocations that belong to this event, not all EventLocations
    // Filter EventLocations by checking if they're referenced by this event's event_locations relationship
    if (!eventLocation && eventPeriod && eventId && eventLocationsMap.size > 0) {
      // Get EventLocations that belong to this event (from event.event_locations relationship)
      let eventEventLocations: PCOEventLocation[] = [];
      if (event) {
        const eventEventLocationRefs = (event.relationships as any)?.event_locations?.data;
        if (Array.isArray(eventEventLocationRefs) && eventEventLocationRefs.length > 0) {
          eventEventLocations = eventEventLocationRefs
            .map((ref: any) => eventLocationsMap.get(ref.id))
            .filter((el: PCOEventLocation | undefined): el is PCOEventLocation => el !== undefined);
        }
      }
      
      // CRITICAL: Only use hash-based matching if we can scope EventLocations to this event
      // Without proper scoping, we might assign classrooms from other events
      if (eventEventLocations.length > 0) {
        if (eventEventLocations.length === 1) {
          // Single EventLocation - use it for all check-ins of this event
          eventLocation = eventEventLocations[0];
          eventLocationId = eventLocation.id;
        } else {
          // Multiple EventLocations - match by event_period ID hash for consistency
          // This ensures each event_period (service time) gets the same classroom consistently
          const periodHash = eventPeriodId ? parseInt(eventPeriodId) % eventEventLocations.length : index % eventEventLocations.length;
          eventLocation = eventEventLocations[periodHash];
          eventLocationId = eventLocation.id;
        }
      }
    }
    
    // Method 4 REMOVED: Last resort matching was causing cross-event contamination
    // If we reach here without an eventLocation, it means the API data is incomplete
    // Better to show no classroom than show the WRONG classroom
    
    // CRITICAL: Log if classroom assignment failed
    if (!eventLocation && index === 0) {
      console.error(`❌ NO CLASSROOM ASSIGNED for CheckIn ${checkIn.id} (${firstName} ${lastName})`);
      console.error(`   Method 1 (direct): ${checkIn.relationships?.event_location?.data?.id || 'none'}`);
      console.error(`   Method 2 (event_period): ${eventPeriod ? (eventPeriod as any)?.relationships?.event_location?.data?.id || 'none' : 'no event_period'}`);
      console.error(`   Method 1b (event.event_locations): ${event ? (event.relationships as any)?.event_locations?.data?.length || 0 : 'no event'}`);
      console.error(`   EventLocations available in map: ${eventLocationsMap.size}`);
      if (eventLocationsMap.size > 0) {
        console.error(`   Available classrooms:`, Array.from(eventLocationsMap.values()).map(el => el.attributes?.name || 'unnamed'));
      }
    }
    
    let serviceTime: string | undefined;
    if (eventPeriod?.attributes.starts_at) {
      try {
        // Parse the ISO timestamp from Planning Center
        // PCO returns times in ISO format (e.g., "2024-01-07T08:00:00Z")
        const startsAt = new Date(eventPeriod.attributes.starts_at);
        
        // Format to user's local timezone (no hardcoded timezone)
        // This respects the browser/system timezone automatically
        serviceTime = startsAt.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      } catch (e) {
        console.error(`❌ Error parsing service time for event_period ${eventPeriodId}:`, e);
        // Fallback to event_period name if parsing fails
        serviceTime = eventPeriod.attributes.name || 'Unknown Time';
      }
    }
    
    const eventName = event?.attributes.name || 'Unknown Service';
    // IMPORTANT: Each event_period has its own service time (starts_at)
    // This ensures check-ins for different service times (8:00 AM, 11:00 AM, 12:30 PM) 
    // are correctly distinguished and grouped separately
    const serviceName = serviceTime && eventName !== 'Unknown Service'
      ? `${eventName} • ${serviceTime}`
      : eventName;
    
    // Log only if service time is missing (critical for grouping)
    if (!serviceTime && eventPeriod && index < 3) {
      console.warn(`⚠️ CheckIn ${checkIn.id} has event_period but no serviceTime was parsed from ${eventPeriod.attributes.starts_at}`);
    }
    
    // Extract campus name from event name (e.g., "Sunday Services – South Tampa" -> "South Tampa")
    // Split on en dash "–" or regular dash "-"
    let campusName: string | undefined;
    if (eventName) {
      // Try en dash first (most common)
      const parts = eventName.split(' – ');
      if (parts.length > 1) {
        campusName = parts[parts.length - 1].trim();
      } else {
        // Fallback to regular dash with spaces
        const partsRegular = eventName.split(' - ');
        if (partsRegular.length > 1) {
          campusName = partsRegular[partsRegular.length - 1].trim();
        }
      }
    }
    
    // Use location from API if available, otherwise use extracted campus name
    const locationName = location?.attributes.name || campusName;
    
    const result = {
      id: checkIn.id,
      childName: `${firstName} ${lastName}`,
      familyName: lastName,
      securityCode: checkIn.attributes.security_code || '',
      serviceName: serviceName,
      serviceTime: serviceTime,
      locationId: locationId,
      locationName: locationName, // Campus extracted from event name or location API
      checkInTime: checkIn.attributes.created_at,
      medicalNotes: medicalNotes,
      eventId: eventId || 'unknown',
      eventName: eventName,
      isFirstTime: checkIn.attributes.one_time_guest || false,
      hasBirthday: hasBirthdayComingUp(birthdate),
      stationName: station?.attributes?.name, // Check-in device name
      // Extract className from eventLocation
      className: (() => {
        if (!eventLocation) {
          if (index < 5) {
            console.warn(`⚠️ CheckIn ${checkIn.id} (${firstName} ${lastName}): No eventLocation assigned!`, {
              eventLocationId,
              eventPeriodId,
              eventId,
              eventLocationsMapSize: eventLocationsMap.size,
              availableEventLocations: Array.from(eventLocationsMap.entries()).map(([id, el]) => ({
                id,
                name: el.attributes.name,
                label: el.attributes.label
              }))
            });
          }
          return undefined;
        }
        
        const className = eventLocation.attributes.name || 
                         eventLocation.attributes.label || 
                         eventLocation.attributes.classroom ||
                         undefined;
        
        if (className && index < 5) {
          console.log(`✅ CheckIn ${checkIn.id}: Assigned className "${className}" from EventLocation ${eventLocation.id}`);
        } else if (!className && index < 5) {
          console.warn(`⚠️ CheckIn ${checkIn.id}: eventLocation found but no name/label/classroom attribute:`, {
            eventLocationId: eventLocation.id,
            allAttributes: Object.keys(eventLocation.attributes || {}),
            attributeValues: eventLocation.attributes
          });
        }
        
        return className;
      })(),
    };
    
    // Log ALL transformations to catch service time and classroom issues
    console.log(`✅ Transformed CheckIn ${checkIn.id} (${result.childName}):`, {
      campus: result.locationName || '❌ MISSING',
      eventName: result.eventName || '❌ MISSING',
      serviceTime: result.serviceTime || '❌ MISSING',
      className: result.className || '❌ MISSING',
      stationName: result.stationName || 'N/A',
      serviceName: result.serviceName,
      rawEventPeriodStartsAt: eventPeriod?.attributes.starts_at || 'N/A',
      parsedServiceTime: serviceTime || 'N/A',
      rawEventLocationName: eventLocation?.attributes.name || 'N/A',
      securityCode: result.securityCode
    });
    
    return result;
  });
}

/**
 * Test connection to Planning Center API
 * Useful for debugging authentication issues
 * 
 * @returns Boolean indicating if connection is successful
 */
export async function testPCOConnection(): Promise<boolean> {
  try {
    await getLiveCheckIns();
    return true;
  } catch (error) {
    console.error('PCO connection test failed:', error);
    return false;
  }
}

