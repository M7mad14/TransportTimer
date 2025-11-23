import { useState, useEffect, useCallback, useMemo } from 'react';
import { TripEvent } from '@/utils/storage';

export const useTripTimer = () => {
  const [tripStarted, setTripStarted] = useState(false);
  const [tripStartTime, setTripStartTime] = useState<Date | null>(null);
  const [events, setEvents] = useState<TripEvent[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!tripStarted || !tripStartTime) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - tripStartTime.getTime()) / 1000);
      setElapsedSeconds(diffInSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [tripStarted, tripStartTime]);

  const formatTime = useCallback((date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }, []);

  const formatTimeDiff = useCallback((seconds: number): string => {
    if (seconds === 0) return '-';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins === 0) {
      return `${secs} ث`;
    } else if (secs === 0) {
      return `${mins} د`;
    } else {
      return `${mins} د و ${secs} ث`;
    }
  }, []);

  const formatElapsedTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const generateSummary = useCallback((eventList: TripEvent[], startLocation?: string): string => {
    if (eventList.length === 0) return '';

    let summaryText = 'ملخص الرحلة:\n\n';
    
    if (startLocation) {
      summaryText += `من: ${startLocation}\n\n`;
    }

    eventList.forEach((event, index) => {
      const timeStr = formatTime(event.time);
      if (index === 0) {
        summaryText += `${index + 1}- ${event.label} عند ${timeStr}\n`;
      } else {
        const diffStr = formatTimeDiff(event.timeDiff || 0);
        summaryText += `${index + 1}- ${event.label} عند ${timeStr} (بعد ${diffStr} من الحدث السابق)\n`;
      }
    });

    if (eventList.length > 1) {
      const firstTime = eventList[0].time.getTime();
      const lastTime = eventList[eventList.length - 1].time.getTime();
      const totalSeconds = Math.floor((lastTime - firstTime) / 1000);
      summaryText += `\nإجمالي مدة الرحلة تقريباً: ${formatTimeDiff(totalSeconds)}`;
    }

    return summaryText;
  }, [formatTime, formatTimeDiff]);

  const addEvent = useCallback((label: string) => {
    const now = new Date();
    let timeDiff = 0;

    if (events.length > 0) {
      const lastEvent = events[events.length - 1];
      timeDiff = Math.floor((now.getTime() - lastEvent.time.getTime()) / 1000);
    }

    const newEvent: TripEvent = {
      id: events.length + 1,
      label,
      time: now,
      timeDiff: events.length > 0 ? timeDiff : undefined,
    };

    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  }, [events]);

  const startTrip = useCallback(() => {
    const now = new Date();
    setTripStartTime(now);
    setTripStarted(true);
    
    const firstEvent: TripEvent = {
      id: 1,
      label: 'بداية الرحلة',
      time: now,
      timeDiff: undefined,
    };
    setEvents([firstEvent]);
    return firstEvent;
  }, []);

  const resetTrip = useCallback(() => {
    setEvents([]);
    setTripStarted(false);
    setTripStartTime(null);
    setElapsedSeconds(0);
  }, []);

  const updateEventPhoto = useCallback((eventId: number, photoUri?: string) => {
    setEvents(prev => prev.map(event =>
      event.id === eventId ? { ...event, photoUri } : event
    ));
  }, []);

  return {
    tripStarted,
    tripStartTime,
    events,
    elapsedSeconds,
    formatTime,
    formatTimeDiff,
    formatElapsedTime,
    generateSummary,
    addEvent,
    startTrip,
    resetTrip,
    updateEventPhoto,
    setEvents,
  };
};

