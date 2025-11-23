import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SavedTrip } from './storage';

export const exportTripsToJSON = async (trips: SavedTrip[]): Promise<boolean> => {
  try {
    const jsonData = JSON.stringify(trips, null, 2);
    const fileName = `trips_export_${new Date().getTime()}.json`;
    const fileUri = FileSystem.documentDirectory + fileName;
    
    await FileSystem.writeAsStringAsync(fileUri, jsonData);
    
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'تصدير الرحلات (JSON)',
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    return false;
  }
};

export const exportTripsToCSV = async (trips: SavedTrip[]): Promise<boolean> => {
  try {
    let csvContent = 'التاريخ,وقت البدء,وقت الانتهاء,المدة (ثانية),عدد الأحداث,نقطة البداية,الملخص\n';
    
    trips.forEach(trip => {
      const startDate = trip.startTime.toLocaleDateString('ar-SA');
      const startTime = trip.startTime.toLocaleTimeString('ar-SA');
      const endTime = trip.endTime.toLocaleTimeString('ar-SA');
      const duration = Math.floor((trip.endTime.getTime() - trip.startTime.getTime()) / 1000);
      const eventsCount = trip.events.length;
      const location = trip.startLocation || '-';
      const summary = trip.summary.replace(/\n/g, ' ').replace(/,/g, '،');
      
      csvContent += `"${startDate}","${startTime}","${endTime}",${duration},${eventsCount},"${location}","${summary}"\n`;
    });
    
    const fileName = `trips_export_${new Date().getTime()}.csv`;
    const fileUri = FileSystem.documentDirectory + fileName;
    
    await FileSystem.writeAsStringAsync(fileUri, csvContent);
    
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'تصدير الرحلات (CSV)',
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return false;
  }
};

export const exportTripsToText = async (trips: SavedTrip[]): Promise<boolean> => {
  try {
    let textContent = '=== تقرير الرحلات ===\n\n';
    textContent += `إجمالي عدد الرحلات: ${trips.length}\n`;
    textContent += `تاريخ التصدير: ${new Date().toLocaleString('ar-SA')}\n\n`;
    textContent += '='  .repeat(50) + '\n\n';
    
    trips.forEach((trip, index) => {
      textContent += `الرحلة رقم ${index + 1}\n`;
      textContent += `التاريخ: ${trip.startTime.toLocaleDateString('ar-SA')}\n`;
      textContent += `${trip.summary}\n`;
      textContent += '\n' + '-'.repeat(50) + '\n\n';
    });
    
    const fileName = `trips_export_${new Date().getTime()}.txt`;
    const fileUri = FileSystem.documentDirectory + fileName;
    
    await FileSystem.writeAsStringAsync(fileUri, textContent);
    
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'تصدير الرحلات (نص)',
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error exporting to text:', error);
    return false;
  }
};

