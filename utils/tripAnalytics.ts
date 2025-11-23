import { SavedTrip } from './storage';

export interface TripStatistics {
  totalTrips: number;
  totalDuration: number; // in seconds
  averageDuration: number; // in seconds
  shortestTrip: { duration: number; date: Date } | null;
  longestTrip: { duration: number; date: Date } | null;
  totalEvents: number;
  averageEventsPerTrip: number;
  mostCommonEvents: { label: string; count: number }[];
  tripsByDayOfWeek: { [key: string]: number };
  tripsByHourOfDay: { [key: number]: number };
  recentTrends: {
    last7Days: number;
    last30Days: number;
  };
}

export const calculateStatistics = (trips: SavedTrip[]): TripStatistics => {
  if (trips.length === 0) {
    return {
      totalTrips: 0,
      totalDuration: 0,
      averageDuration: 0,
      shortestTrip: null,
      longestTrip: null,
      totalEvents: 0,
      averageEventsPerTrip: 0,
      mostCommonEvents: [],
      tripsByDayOfWeek: {},
      tripsByHourOfDay: {},
      recentTrends: {
        last7Days: 0,
        last30Days: 0,
      },
    };
  }

  let totalDuration = 0;
  let shortestTrip: { duration: number; date: Date } | null = null;
  let longestTrip: { duration: number; date: Date } | null = null;
  let totalEvents = 0;
  const eventCounts: { [key: string]: number } = {};
  const tripsByDayOfWeek: { [key: string]: number } = {
    'الأحد': 0,
    'الاثنين': 0,
    'الثلاثاء': 0,
    'الأربعاء': 0,
    'الخميس': 0,
    'الجمعة': 0,
    'السبت': 0,
  };
  const tripsByHourOfDay: { [key: number]: number } = {};
  
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  let last7DaysCount = 0;
  let last30DaysCount = 0;

  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  trips.forEach(trip => {
    const duration = Math.floor((trip.endTime.getTime() - trip.startTime.getTime()) / 1000);
    totalDuration += duration;

    if (!shortestTrip || duration < shortestTrip.duration) {
      shortestTrip = { duration, date: trip.startTime };
    }

    if (!longestTrip || duration > longestTrip.duration) {
      longestTrip = { duration, date: trip.startTime };
    }

    totalEvents += trip.events.length;

    trip.events.forEach(event => {
      if (event.label !== 'بداية الرحلة') {
        eventCounts[event.label] = (eventCounts[event.label] || 0) + 1;
      }
    });

    const dayOfWeek = dayNames[trip.startTime.getDay()];
    tripsByDayOfWeek[dayOfWeek] = (tripsByDayOfWeek[dayOfWeek] || 0) + 1;

    const hour = trip.startTime.getHours();
    tripsByHourOfDay[hour] = (tripsByHourOfDay[hour] || 0) + 1;

    if (trip.startTime >= sevenDaysAgo) {
      last7DaysCount++;
    }
    if (trip.startTime >= thirtyDaysAgo) {
      last30DaysCount++;
    }
  });

  const mostCommonEvents = Object.entries(eventCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalTrips: trips.length,
    totalDuration,
    averageDuration: Math.floor(totalDuration / trips.length),
    shortestTrip,
    longestTrip,
    totalEvents,
    averageEventsPerTrip: Math.floor(totalEvents / trips.length),
    mostCommonEvents,
    tripsByDayOfWeek,
    tripsByHourOfDay,
    recentTrends: {
      last7Days: last7DaysCount,
      last30Days: last30DaysCount,
    },
  };
};

export const formatDuration = (seconds: number): string => {
  if (seconds === 0) return '0 ث';

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} س`);
  if (mins > 0) parts.push(`${mins} د`);
  if (secs > 0) parts.push(`${secs} ث`);

  return parts.join(' و ');
};

