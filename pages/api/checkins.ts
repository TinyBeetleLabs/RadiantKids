/**
 * API Route: /api/checkins
 * 
 * This endpoint serves check-in data to the frontend dashboard.
 * It switches between mock data and live Planning Center API data
 * based on the USE_MOCK_DATA environment variable.
 * 
 * HOW TO TOGGLE MODES:
 * - Mock Mode: Set USE_MOCK_DATA=true in .env.local
 * - Live Mode: Set USE_MOCK_DATA=false in .env.local
 * 
 * SECURITY:
 * - API credentials are stored server-side in .env.local
 * - Never exposed to the client/browser
 * - All API calls happen on the server
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getMockCheckIns, CheckInData } from '@/lib/mockData';
import { getLiveCheckIns } from '@/lib/pcoApi';

type ApiResponse = {
  success: boolean;
  data?: CheckInData[];
  error?: string;
  mode?: 'mock' | 'live';
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.',
    });
  }

  // Set security headers for API responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  try {
    // Check if mock mode is enabled
    const useMockData = process.env.USE_MOCK_DATA === 'true';

    let checkIns: CheckInData[];
    let mode: 'mock' | 'live';

    if (useMockData) {
      // MOCK MODE: Return sample data for development
      console.log('📋 Using mock data (development mode)');
      checkIns = getMockCheckIns();
      mode = 'mock';
    } else {
      // LIVE MODE: Fetch real data from Planning Center API
      console.log('🌐 Fetching live data from Planning Center API');
      checkIns = await getLiveCheckIns();
      mode = 'live';
    }

    // Sort by check-in time (most recent first)
    checkIns.sort((a, b) => {
      return new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime();
    });

    // Return successful response
    res.status(200).json({
      success: true,
      data: checkIns,
      mode,
    });
  } catch (error) {
    // Handle errors gracefully - DO NOT log sensitive data
    console.error('❌ Error fetching check-ins');

    // Return generic error message (do not expose internal error details)
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'Failed to fetch check-in data. Please try again later.'
      : error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';

    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}

