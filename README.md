# Isan Transit Hub

แพลตฟอร์มติดตามตารางเวลาการเดินทางสาธารณะแบบ Crowdsourced สำหรับภาคตะวันออกเฉียงเหนือของประเทศไทย

## คุณสมบัติหลัก

- **รองรับ 3 ประเภทยานพาหนะ:**
  - สองแถว (Songthaew) - รถปิคอัปบริการสาธารณะ
  - ทัวร์บัส (Tour Bus) - รถโดยสารระหว่างจังหวัด
  - รถตู้ (Minibus) - รถตู้ระหว่างจังหวัด

- **Snap & Update:** ถ่ายรูปตารางเวลาและอัปเดตข้อมูลด้วย OCR
- **Geolocation:** บันทึกตำแหน่ง GPS อัตโนมัติ
- **ระบบยืนยัน:** ผู้ใช้สามารถโหวตยืนยันความถูกต้องของข้อมูล

## เทคโนโลยีที่ใช้

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS + Shadcn UI
- **Database & Auth:** Supabase
- **Icons:** Lucide React
- **Features:** Tesseract.js (OCR) และ Browser Geolocation API

## การเริ่มต้น

ติดตั้ง dependencies:

```bash
npm install
```

รัน development server:

```bash
npm run dev
# หรือ
yarn dev
# หรือ
pnpm dev
# หรือ
bun dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์เพื่อดูผลลัพธ์

## ตั้งค่า Supabase

1. สร้างโปรเจกต์ใหม่ที่ [supabase.com](https://supabase.com)
2. รัน SQL schema จากไฟล์ `supabase/schema.sql` ใน SQL Editor
3. เพิ่ม environment variables ในไฟล์ `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── page.tsx          # หน้าแรก / Feed
│   ├── upload/page.tsx   # หน้าอัปโหลดรูป
│   └── routes/[id]/page.tsx  # หน้ารายละเอียดเส้นทาง
├── components/
│   └── ui/               # Shadcn UI components
├── data/
│   └── mockData.ts       # ข้อมูลจำลอง
├── types/
│   └── index.ts          # TypeScript types
└── lib/
    └── utils.ts          # Utility functions
```

## การพัฒนาต่อ

- เชื่อมต่อกับ Supabase จริง
- ใช้ Tesseract.js สำหรับ OCR จริง
- เพิ่มระบบ Authentication
- ใช้ Supabase Storage สำหรับเก็บรูปภาพ
