'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Clock, ThumbsUp, Phone, Camera, AlertCircle, X, Download } from 'lucide-react';
import { getVehicleTypeLabel, getStatusColor } from '@/data/mockData';
import { VehicleType } from '@/types';
import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import { useParams } from 'next/navigation';

export default function RouteDetailPage() {
  const { locale, t } = useLocale();
  const params = useParams();
  const scheduleId = params.id as string;
  
  const [allUpdates, setAllUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [phoneImageModalOpen, setPhoneImageModalOpen] = useState(false);
  const [selectedPhoneImage, setSelectedPhoneImage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/schedule-updates')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAllUpdates(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch:', err);
        setLoading(false);
      });
  }, []);

  const latestUpdate = allUpdates.find((u: any) => u.id === scheduleId);
  
  // Get all updates with the same route info for history
  const updates = latestUpdate ? allUpdates.filter((u: any) => 
    u.origin === latestUpdate.origin && 
    u.destination === latestUpdate.destination &&
    u.company_name === latestUpdate.company_name
  ) : [];

  // Use data from the uploaded schedule
  const route = latestUpdate ? {
    id: scheduleId,
    name: latestUpdate.route_name || `${latestUpdate.origin} - ${latestUpdate.destination}`,
    vehicle_type: latestUpdate.vehicle_type || 'tour_bus',
    identifier: latestUpdate.company_name || 'Unknown',
    origin_station: latestUpdate.origin || 'Unknown',
    destination_station: latestUpdate.destination || 'Unknown',
    created_at: latestUpdate.created_at,
    updated_at: latestUpdate.updated_at || latestUpdate.created_at,
  } : null;

  const formatTime = (timeString: string | null) => {
    if (!timeString) return t('feed.frequency_based');
    return new Date(timeString).toLocaleTimeString(locale === 'th' ? 'th-TH' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (timeString: string) => {
    const now = new Date();
    const then = new Date(timeString);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}${t('feed.minutes')} ${t('feed.ago')}`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}${t('feed.hours')} ${t('feed.ago')}`;
    return `${Math.floor(diffMins / 1440)}${t('feed.days')} ${t('feed.ago')}`;
  };

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case 'songthaew':
        return '🚚';
      case 'tour_bus':
        return '🚌';
      case 'minibus':
        return '🚐';
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  const handleDownloadImage = async () => {
    if (!selectedImage) return;
    
    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `schedule-${scheduleId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDownloadPhoneImage = async () => {
    if (!selectedPhoneImage) return;
    
    try {
      const link = document.createElement('a');
      link.href = selectedPhoneImage;
      link.download = `phone-number-${Date.now()}.jpg`;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <Link href={`/${locale}`}>
              <button className="flex items-center gap-2 text-sm hover:underline">
                <ArrowLeft className="h-4 w-4" />
                {t('button.back')}
              </button>
            </Link>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">กำลังโหลด...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <Link href={`/${locale}`}>
              <button className="flex items-center gap-2 text-sm hover:underline">
                <ArrowLeft className="h-4 w-4" />
                {t('button.back')}
              </button>
            </Link>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('route.not_found')}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href={`/${locale}`}>
            <button className="flex items-center gap-2 text-sm hover:underline">
              <ArrowLeft className="h-4 w-4" />
              {t('button.back')}
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Route Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getVehicleIcon(route.vehicle_type)}</span>
                  <Badge variant="outline">{getVehicleTypeLabel(route.vehicle_type, t)}</Badge>
                </div>
                <CardTitle className="text-2xl">{route.name}</CardTitle>
                <CardDescription className="mt-2">
                  <span className="font-medium text-gray-700">{route.identifier}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                {route.origin_station} → {route.destination_station}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Latest Schedule Update */}
        {latestUpdate && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('route.latest_update')}</CardTitle>
              <CardDescription>
                {t('feed.updated')} {getRelativeTime(latestUpdate.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(latestUpdate.status)} text-white`}>
                  {latestUpdate.status === 'available' ? 'มีให้บริการปกติ' : 
                   latestUpdate.status === 'seasonal' ? 'ช่วงเทศกาล' : 
                   t(`status.${latestUpdate.status}`)}
                </Badge>
              </div>

              {latestUpdate.status_note && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span>{latestUpdate.status_note}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{t('feed.departure')}:</span>
                <span>{formatTime(latestUpdate.departure_time)}</span>
              </div>

              {latestUpdate.image_url && (
                <div className="relative cursor-pointer group" onClick={() => handleImageClick(latestUpdate.image_url)}>
                  <img
                    src={latestUpdate.image_url}
                    alt="Schedule proof"
                    className="w-full h-48 object-cover rounded-lg transition-opacity group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                    <span className="text-white bg-black/70 px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      คลิกเพื่อดูภาพเต็ม
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    <Camera className="h-3 w-3 inline mr-1" />
                    {t('route.proof')}
                  </div>
                </div>
              )}

              {latestUpdate.lat && latestUpdate.lng && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {t('upload.location')} {latestUpdate.lat.toFixed(4)}, {latestUpdate.lng.toFixed(4)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{latestUpdate.upvotes}</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Updates History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('route.update_history')}</CardTitle>
            <CardDescription>
              {updates.length} {t('route.updates_recorded')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {updates.map((update: any) => (
                <div
                  key={update.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={`${getStatusColor(update.status)} text-white`} variant="secondary">
                      {update.status === 'available' ? 'มีให้บริการปกติ' : 
                       update.status === 'seasonal' ? 'ช่วงเทศกาล' : 
                       t(`status.${update.status}`)}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{formatTime(update.departure_time)}</p>
                      <p className="text-xs text-gray-500">{getRelativeTime(update.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{update.upvotes}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Driver Contact */}
        {latestUpdate?.phone_numbers && latestUpdate.phone_numbers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('route.driver_contact')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {latestUpdate.phone_numbers.map((phone: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        {phone.number && (
                          <a href={`tel:${phone.number}`} className="font-medium text-blue-600 hover:underline">
                            {phone.number}
                          </a>
                        )}
                        {phone.stops && (
                          <p className="text-sm text-gray-600 mt-1">ผ่าน: {phone.stops}</p>
                        )}
                      </div>
                      {phone.image && (
                        <img 
                          src={phone.image} 
                          alt={`Phone ${idx + 1}`} 
                          className="h-12 w-auto rounded border cursor-pointer hover:opacity-80 transition-opacity" 
                          onClick={() => {
                            setSelectedPhoneImage(phone.image);
                            setPhoneImageModalOpen(true);
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Image Modal */}
      {imageModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-w-6xl max-h-full w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-medium">ตารางเวลา</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadImage();
                  }}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  ดาวน์โหลด
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageModalOpen(false);
                  }}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Image */}
            <div className="flex-1 flex items-center justify-center overflow-auto">
              <img
                src={selectedImage}
                alt="Schedule full view"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}

      {/* Phone Image Modal */}
      {phoneImageModalOpen && selectedPhoneImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPhoneImageModalOpen(false)}
        >
          <div className="relative max-w-4xl w-full">
            <img 
              src={selectedPhoneImage} 
              alt="Phone number" 
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadPhoneImage();
                }}
                className="gap-2 bg-white hover:bg-gray-100"
              >
                <Download className="h-4 w-4" />
                บันทึก
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPhoneImageModalOpen(false)}
                className="bg-white hover:bg-gray-100"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
