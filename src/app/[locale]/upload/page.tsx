'use client';

import { useState, useRef } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Camera, MapPin, Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
  const { locale, t } = useLocale();
  const [step, setStep] = useState<'camera' | 'processing' | 'verify' | 'success'>('camera');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [ocrData, setOcrData] = useState({ routeName: '', departureTime: '' });
  const [formData, setFormData] = useState({ 
    status: 'available',
    statusNote: '',
    companyName: '',
    vehicleType: 'tour_bus',
    origin: '',
    destination: '',
    phoneNumbers: [{ number: '', hasImage: false, image: null as string | null, stops: '' }]
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const phoneImageInputRef = useRef<HTMLInputElement>(null);
  const [currentPhoneIndex, setCurrentPhoneIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setStep('processing');
        performOCR(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (dataUrl: string, maxWidth: number = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = dataUrl;
    });
  };

  const performOCR = async (imageDataUrl: string) => {
    try {
      // Compress image before sending to server
      const compressedImage = await compressImage(imageDataUrl);
      
      // Convert data URL to blob
      const response = await fetch(compressedImage);
      const blob = await response.blob();
      
      // Create FormData and send to server-side OCR
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      
      const ocrResponse = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });
      
      if (!ocrResponse.ok) {
        throw new Error('OCR request failed');
      }
      
      const result = await ocrResponse.json();
      
      if (result.success) {
        setOcrData(result.data);
        setFormData({
          status: 'available',
          statusNote: '',
          companyName: result.data.companyName || '',
          vehicleType: result.data.vehicleType || 'tour_bus',
          origin: result.data.origin || '',
          destination: result.data.destination || '',
          phoneNumbers: [{ number: '', hasImage: false, image: null, stops: '' }]
        });
      } else {
        // Fallback to manual entry if OCR fails
        setOcrData({ routeName: '', departureTime: '' });
        setFormData({ status: 'available', statusNote: '', companyName: '', vehicleType: 'tour_bus', origin: '', destination: '', phoneNumbers: [{ number: '', hasImage: false, image: null, stops: '' }] });
      }
      
      setStep('verify');
    } catch (error) {
      console.error('OCR failed:', error);
      // Fallback to manual entry if OCR fails
      setOcrData({ routeName: '', departureTime: '' });
      setFormData({ status: 'available', statusNote: '', companyName: '', vehicleType: 'tour_bus', origin: '', destination: '', phoneNumbers: [{ number: '', hasImage: false, image: null, stops: '' }] });
      setStep('verify');
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    getLocation();
    
    console.log('Submitting upload:', formData);
    
    try {
      // Compress main image before sending (more aggressive compression)
      let compressedImage = selectedImage;
      if (selectedImage) {
        try {
          compressedImage = await compressImage(selectedImage, 600); // Smaller size for upload
        } catch (err) {
          console.error('Image compression failed:', err);
          alert('ไม่สามารถประมวลผลรูปภาพได้ กรุณาลองใหม่อีกครั้ง');
          setIsSubmitting(false);
          return;
        }
      }

      // Compress phone images
      const compressedPhoneNumbers = await Promise.all(
        formData.phoneNumbers.map(async (phone) => {
          if (phone.image) {
            try {
              const compressed = await compressImage(phone.image, 400);
              return { ...phone, image: compressed };
            } catch (err) {
              console.error('Phone image compression failed:', err);
              return { ...phone, image: null, hasImage: false };
            }
          }
          return phone;
        })
      );

      // Send data to upload API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: formData.status,
          statusNote: formData.statusNote,
          location: location,
          image: compressedImage,
          companyName: formData.companyName,
          vehicleType: formData.vehicleType,
          origin: formData.origin,
          destination: formData.destination,
          phoneNumbers: compressedPhoneNumbers,
        }),
      });

      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const result = await response.json();
        console.log('Upload error response:', result);
        
        if (response.status === 429) {
          alert('อัพโหลดเกินจำนวนครั้งที่กำหนด กรุณาลองใหม่ภายหลัง');
        } else if (response.status === 413) {
          alert('ไฟล์รูปภาพมีขนาดใหญ่เกินไป กรุณาลองถ่ายรูปใหม่');
        } else {
          alert('อัพโหลดล้มเหลว: ' + (result.error || 'Unknown error') + (result.details ? '\n' + result.details : ''));
        }
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();
      console.log('Upload success response:', result);

      setStep('success');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('อัพโหลดล้มเหลว กรุณาลองใหม่อีกครั้ง\n' + errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedImage(null);
    setStep('camera');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href={`/${locale}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('button.back')}
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {step === 'camera' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('upload.title')}</CardTitle>
              <CardDescription>
                {t('upload.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <Camera className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4 text-center">
                  {t('upload.tap_to_open_camera')}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Camera className="h-5 w-5" />
                  {t('button.open_camera')}
                </Button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>{t('upload.tip')}</strong> {t('upload.tip_message')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'processing' && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                <p className="text-lg font-medium">{t('upload.processing')}</p>
                <p className="text-sm text-gray-500">{t('upload.extracting_info')}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'verify' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('upload.verify_title')}</CardTitle>
              <CardDescription>
                {t('upload.verify_description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedImage && (
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Captured schedule"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetake}
                    className="absolute top-2 right-2 bg-white/90"
                  >
                    {t('button.retake')}
                  </Button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Company Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">ชื่อบริษัททัวร์</label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="เช่น สมบัติทัวร์"
                    required
                  />
                </div>

                {/* Vehicle Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">ประเภทรถ</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'tour_bus', label: 'รถทัวร์' },
                      { value: 'minibus', label: 'รถตู้' },
                      { value: 'songthaew', label: 'รถสองแถว' }
                    ].map((type) => (
                      <Button
                        key={type.value}
                        type="button"
                        variant={formData.vehicleType === type.value ? 'default' : 'outline'}
                        onClick={() => setFormData({ ...formData, vehicleType: type.value })}
                        className="flex-1 text-sm"
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Origin */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">ต้นทาง</label>
                  <Input
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="เช่น ขอนแก่น"
                    required
                  />
                </div>

                {/* Destination */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">ปลายทาง</label>
                  <Input
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="เช่น กรุงเทพ"
                    required
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">สถานะบริการ</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'available', label: 'มีให้บริการปกติ' },
                      { value: 'seasonal', label: 'ช่วงเทศกาล' }
                    ].map((item) => (
                      <Button
                        key={item.value}
                        type="button"
                        variant={formData.status === item.value ? 'default' : 'outline'}
                        onClick={() => setFormData({ ...formData, status: item.value })}
                        className="flex-1"
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Status Note */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">รายละเอียดเพิ่มเติม</label>
                  <Input
                    value={formData.statusNote}
                    onChange={(e) => setFormData({ ...formData, statusNote: e.target.value })}
                    placeholder="เช่น เฉพาะวันเสาร์-อาทิตย์ หรือ ช่วงสงกรานต์"
                  />
                </div>

                {/* Phone Numbers */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">เบอร์โทรติดต่อ</label>
                  {formData.phoneNumbers.map((phone, index) => (
                    <div key={index} className="space-y-2 p-3 border border-gray-200 rounded-lg">
                      <div className="flex gap-2">
                        <Input
                          type="tel"
                          inputMode="tel"
                          pattern="[0-9\-\s]*"
                          value={phone.number}
                          onChange={(e) => {
                            const newPhones = [...formData.phoneNumbers];
                            newPhones[index].number = e.target.value;
                            setFormData({ ...formData, phoneNumbers: newPhones });
                          }}
                          placeholder="เช่น 081-234-5678"
                          className="flex-1"
                        />
                        <Input
                          value={phone.stops}
                          onChange={(e) => {
                            const newPhones = [...formData.phoneNumbers];
                            newPhones[index].stops = e.target.value;
                            setFormData({ ...formData, phoneNumbers: newPhones });
                          }}
                          placeholder="ท่ารถ: ขอนแก่น, ท่าพระ, บ้านไผ่, ..."
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setCurrentPhoneIndex(index);
                            phoneImageInputRef.current?.click();
                          }}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        {formData.phoneNumbers.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newPhones = formData.phoneNumbers.filter((_, i) => i !== index);
                            setFormData({ ...formData, phoneNumbers: newPhones });
                          }}
                        >
                          ✕
                        </Button>
                      )}
                      </div>
                      {phone.image && (
                        <div className="relative">
                          <img src={phone.image} alt={`Phone ${index + 1}`} className="h-20 w-auto rounded" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newPhones = [...formData.phoneNumbers];
                              newPhones[index].image = null;
                              newPhones[index].hasImage = false;
                              setFormData({ ...formData, phoneNumbers: newPhones });
                            }}
                            className="absolute top-0 right-0"
                          >
                            ✕
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        phoneNumbers: [...formData.phoneNumbers, { number: '', hasImage: false, image: null, stops: '' }]
                      });
                    }}
                    className="w-full"
                  >
                    + เพิ่มเบอร์โทร
                  </Button>
                  <input
                    ref={phoneImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const newPhones = [...formData.phoneNumbers];
                          newPhones[currentPhoneIndex].image = reader.result as string;
                          newPhones[currentPhoneIndex].hasImage = true;
                          setFormData({ ...formData, phoneNumbers: newPhones });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <MapPin className="h-4 w-4" />
                  <span>{t('upload.location_captured')}</span>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      กำลังอัพโหลด...
                    </>
                  ) : (
                    t('button.submit_update')
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h3 className="text-2xl font-bold">{t('upload.update_submitted')}</h3>
                <p className="text-gray-500 text-center">
                  {t('upload.thank_you')}
                </p>
                {location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {t('upload.location')} {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </span>
                  </div>
                )}
                <Link href={`/${locale}`}>
                  <Button className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {t('button.back_to_feed')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
