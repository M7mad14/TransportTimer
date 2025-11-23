import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedTrip } from './storage';

const TRIPS_KEY = '@transportation_timer_trips';

export interface BackupData {
  version: string;
  exportDate: string;
  trips: SavedTrip[];
  pin?: string;
}

export const createBackup = async (): Promise<boolean> => {
  try {
    // Get all data
    const tripsJson = await AsyncStorage.getItem(TRIPS_KEY);
    const pin = await AsyncStorage.getItem('@app_pin');
    
    const trips = tripsJson ? JSON.parse(tripsJson) : [];
    
    const backupData: BackupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      trips,
      pin: pin || undefined,
    };
    
    const fileName = `transport_timer_backup_${new Date().getTime()}.json`;
    const fileUri = FileSystem.documentDirectory + fileName;
    
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));
    
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'نسخة احتياطية كاملة',
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error creating backup:', error);
    return false;
  }
};

export const restoreBackup = async (): Promise<{ success: boolean; message: string; tripsCount?: number }> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });
    
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { success: false, message: 'تم إلغاء اختيار الملف' };
    }
    
    const fileUri = result.assets[0].uri;
    const fileContent = await FileSystem.readAsStringAsync(fileUri);
    const backupData: BackupData = JSON.parse(fileContent);
    
    // Validate backup data
    if (!backupData.version || !backupData.trips) {
      return { success: false, message: 'ملف النسخة الاحتياطية غير صالح' };
    }
    
    // Restore trips
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(backupData.trips));
    
    // Optionally restore PIN (only if no PIN exists)
    if (backupData.pin) {
      const existingPin = await AsyncStorage.getItem('@app_pin');
      if (!existingPin) {
        await AsyncStorage.setItem('@app_pin', backupData.pin);
      }
    }
    
    return {
      success: true,
      message: 'تمت استعادة النسخة الاحتياطية بنجاح',
      tripsCount: backupData.trips.length,
    };
  } catch (error) {
    console.error('Error restoring backup:', error);
    return { success: false, message: 'حدث خطأ أثناء استعادة النسخة الاحتياطية' };
  }
};

export const clearAllData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(TRIPS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

