export const locales = ['th', 'en'] as const;
export const defaultLocale = 'th' as const;

export type Locale = (typeof locales)[number];

export const translations = {
  th: {
    // Header
    'app.title': 'Isan Transit Hub',
    'app.subtitle': 'ระบบติดตามการเดินทางภาคตะวันออกเฉียงเหนือ',
    
    // Vehicle Types
    'vehicle.songthaew': 'สองแถว',
    'vehicle.tour_bus': 'รถทัวร์',
    'vehicle.minibus': 'รถตู้',
    
    // UI Elements
    'button.snap_update': 'ถ่ายรูปและอัปเดต',
    
    // Status
    'status.ontime': 'ตรงเวลา',
    'status.delayed': 'ล่าช้า',
    'status.early': 'เร็วกว่ากำหนด',
    'status.cancelled': 'ยกเลิก',
    
    // Feed
    'feed.no_updates': 'ไม่มีข้อมูลอัปเดตสำหรับประเภทยานพาหนะนี้',
    'feed.departure': 'ออกเดินทาง',
    'feed.frequency_based': 'ตามความถี่',
    'feed.updated': 'อัปเดตเมื่อ',
    'feed.ago': 'ที่แล้ว',
    'feed.minutes': 'นาที',
    'feed.hours': 'ชั่วโมง',
    'feed.days': 'วัน',
    
    // Upload Page
    'upload.title': 'อัปโหลดรูปถ่าย',
    'upload.description': 'แชร์ข้อมูลการเดินทางเพื่อช่วยผู้โดยสารคนอื่น',
    'upload.select_route': 'เลือกเส้นทาง',
    'upload.upload_photo': 'อัปโหลดรูปถ่าย',
    'upload.submit': 'ส่งข้อมูล',
  },
  en: {
    // Header
    'app.title': 'Isan Transit Hub',
    'app.subtitle': 'Northeast Thailand Transit Tracker',
    
    // Vehicle Types
    'vehicle.songthaew': 'Songthaew',
    'vehicle.tour_bus': 'Tour Bus',
    'vehicle.minibus': 'Minibus',
    
    // UI Elements
    'button.snap_update': 'Snap & Update',
    
    // Status
    'status.ontime': 'On Time',
    'status.delayed': 'Delayed',
    'status.early': 'Early',
    'status.cancelled': 'Cancelled',
    
    // Feed
    'feed.no_updates': 'No schedule updates available for this vehicle type.',
    'feed.departure': 'Departure',
    'feed.frequency_based': 'Frequency-based',
    'feed.updated': 'Updated',
    'feed.ago': 'ago',
    'feed.minutes': 'm',
    'feed.hours': 'h',
    'feed.days': 'd',
    
    // Upload Page
    'upload.title': 'Upload Photo',
    'upload.description': 'Share transit info to help other passengers',
    'upload.select_route': 'Select Route',
    'upload.upload_photo': 'Upload Photo',
    'upload.submit': 'Submit',
  },
} as const;

export function t(key: string, locale: Locale = defaultLocale): string {
  return translations[locale][key as keyof typeof translations[typeof locale]] || key;
}
