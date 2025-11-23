import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TripEvent {
  id: number;
  label: string;
  time: Date;
  timeDiff?: number;
  photoUri?: string;
}

export interface SavedTrip {
  id: string;
  startTime: Date;
  endTime: Date;
  events: TripEvent[];
  summary: string;
  startLocation?: string;
}

const TRIPS_KEY = '@transportation_timer_trips';

export const saveTrip = async (trip: Omit<SavedTrip, 'id'>): Promise<void> => {
  try {
    const trips = await getAllTrips();
    const newTrip: SavedTrip = {
      ...trip,
      id: Date.now().toString(),
    };
    trips.unshift(newTrip);
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  } catch (error) {
    console.error('Error saving trip:', error);
    throw error;
  }
};

export const getAllTrips = async (): Promise<SavedTrip[]> => {
  try {
    const tripsJson = await AsyncStorage.getItem(TRIPS_KEY);
    if (!tripsJson) return [];
    
    const trips = JSON.parse(tripsJson);
    return trips.map((trip: any) => ({
      ...trip,
      startTime: new Date(trip.startTime),
      endTime: new Date(trip.endTime),
      events: trip.events.map((event: any) => ({
        ...event,
        time: new Date(event.time),
      })),
    }));
  } catch (error) {
    console.error('Error loading trips:', error);
    return [];
  }
};

export const deleteTrip = async (tripId: string): Promise<void> => {
  try {
    const trips = await getAllTrips();
    const filteredTrips = trips.filter(trip => trip.id !== tripId);
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(filteredTrips));
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};

export const recalculateTripData = (events: TripEvent[]): { events: TripEvent[], summary: string, startTime: Date, endTime: Date } => {
  if (events.length === 0) {
    throw new Error('Cannot recalculate trip data with no events');
  }

  const recalculatedEvents = events.map((event, index) => {
    if (index === 0) {
      return { ...event, timeDiff: undefined };
    }
    const prevTime = events[index - 1].time;
    const timeDiff = Math.floor((event.time.getTime() - prevTime.getTime()) / 1000);
    return { ...event, timeDiff };
  });

  const formatTimeDiff = (seconds: number): string => {
    if (seconds === 0) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} ث`;
    else if (secs === 0) return `${mins} د`;
    else return `${mins} د و ${secs} ث`;
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  let summary = "ملخص الرحلة:\n\n";
  recalculatedEvents.forEach((event, index) => {
    const timeStr = formatTime(event.time);
    if (index === 0) {
      summary += `${index + 1}- ${event.label} عند ${timeStr}\n`;
    } else {
      const diffStr = formatTimeDiff(event.timeDiff || 0);
      summary += `${index + 1}- ${event.label} عند ${timeStr} (بعد ${diffStr} من الحدث السابق)\n`;
    }
  });

  if (recalculatedEvents.length > 1) {
    const firstTime = recalculatedEvents[0].time.getTime();
    const lastTime = recalculatedEvents[recalculatedEvents.length - 1].time.getTime();
    const totalSeconds = Math.floor((lastTime - firstTime) / 1000);
    summary += `\nإجمالي مدة الرحلة تقريباً: ${formatTimeDiff(totalSeconds)}`;
  }

  return {
    events: recalculatedEvents,
    summary,
    startTime: recalculatedEvents[0].time,
    endTime: recalculatedEvents[recalculatedEvents.length - 1].time,
  };
};

export const updateTrip = async (updatedTrip: SavedTrip): Promise<void> => {
  try {
    const trips = await getAllTrips();
    const index = trips.findIndex(trip => trip.id === updatedTrip.id);
    if (index !== -1) {
      trips[index] = updatedTrip;
      await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
    }
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};
