import { useState, useCallback } from 'react';
import { getAllTrips, saveTrip, deleteTrip, updateTrip, SavedTrip } from '@/utils/storage';
import { Alert } from 'react-native';

export const useTrips = () => {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedTrips = await getAllTrips();
      setTrips(loadedTrips);
      return loadedTrips;
    } catch (err) {
      const errorMessage = 'حدث خطأ أثناء تحميل الرحلات';
      setError(errorMessage);
      Alert.alert('', errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addTrip = useCallback(async (trip: Omit<SavedTrip, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      await saveTrip(trip);
      await loadTrips();
      return true;
    } catch (err) {
      const errorMessage = 'حدث خطأ أثناء حفظ الرحلة';
      setError(errorMessage);
      Alert.alert('', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadTrips]);

  const removeTrip = useCallback(async (tripId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteTrip(tripId);
      await loadTrips();
      return true;
    } catch (err) {
      const errorMessage = 'حدث خطأ أثناء حذف الرحلة';
      setError(errorMessage);
      Alert.alert('', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadTrips]);

  const modifyTrip = useCallback(async (trip: SavedTrip) => {
    setLoading(true);
    setError(null);
    try {
      await updateTrip(trip);
      await loadTrips();
      return true;
    } catch (err) {
      const errorMessage = 'حدث خطأ أثناء تحديث الرحلة';
      setError(errorMessage);
      Alert.alert('', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadTrips]);

  return {
    trips,
    loading,
    error,
    loadTrips,
    addTrip,
    removeTrip,
    modifyTrip,
  };
};

