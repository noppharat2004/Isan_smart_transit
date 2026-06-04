'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockRoutes, getVehicleTypeLabel, getStatusColor } from '@/data/mockData';
import { VehicleType } from '@/types';
import { Camera, MapPin, ThumbsUp, Clock, Bus, Truck, Van, AlertCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';

export default function Home() {
  const { locale, t } = useLocale();
  const [selectedType, setSelectedType] = useState<VehicleType>('songthaew');
  const [scheduleUpdates, setScheduleUpdates] = useState<any[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDestination, setSearchDestination] = useState('');

  // Fetch schedule updates from API
  useEffect(() => {
    console.log('Fetching schedule updates...');
    fetch('/api/schedule-updates')
      .then(res => {
        console.log('Schedule updates response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Schedule updates response:', data);
        if (data.success) {
          console.log('Setting schedule updates:', data.data);
          setScheduleUpdates(data.data);
          console.log('Set schedule updates:', data.data);
        } else {
          console.error('Failed to fetch updates:', data.error);
        }
      })
      .catch(err => {
        console.error('Failed to fetch schedule updates:', err);
      });
  }, []);

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case 'songthaew':
        return <Truck className="h-4 w-4" />;
      case 'tour_bus':
        return <Bus className="h-4 w-4" />;
      case 'minibus':
        return <Van className="h-4 w-4" />;
    }
  };

  const filteredUpdates = scheduleUpdates.filter(update => {
    // Use vehicle_type from upload data, fallback to mock route if needed
    const vehicleType = update.vehicle_type || mockRoutes.find(r => r.id === update.route_id)?.vehicle_type;
    
    // Filter by vehicle type
    if (vehicleType !== selectedType) return false;
    
    // Filter by origin and destination search
    if (searchOrigin && !update.origin?.toLowerCase().includes(searchOrigin.toLowerCase())) {
      return false;
    }
    if (searchDestination && !update.destination?.toLowerCase().includes(searchDestination.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleSwapLocations = () => {
    const temp = searchOrigin;
    setSearchOrigin(searchDestination);
    setSearchDestination(temp);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('app.title')}</h1>
              <p className="text-sm text-gray-500">{t('app.subtitle')}</p>
            </div>
            <Link href={`/${locale}/upload`}>
              <Button size="sm" className="gap-2">
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">{t('button.snap_update')}</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Search Box */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">ต้นทาง</label>
                <Input
                  type="text"
                  placeholder="กรอกต้นทาง เช่น ขอนแก่น"
                  value={searchOrigin}
                  onChange={(e) => setSearchOrigin(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <button
                onClick={handleSwapLocations}
                className="mt-5 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="สลับต้นทาง-ปลายทาง"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
              </button>
              
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">ปลายทาง</label>
                <Input
                  type="text"
                  placeholder="กรอกปลายทาง เช่น กรุงเทพ"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            {(searchOrigin || searchDestination) && (
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  พบ {filteredUpdates.length} เส้นทาง
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchOrigin('');
                    setSearchDestination('');
                  }}
                  className="text-blue-600"
                >
                  ล้างการค้นหา
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Type Tabs */}
        <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as VehicleType)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="songthaew" className="gap-2">
              <Truck className="h-4 w-4" />
              {t('vehicle.songthaew')}
            </TabsTrigger>
            <TabsTrigger value="tour_bus" className="gap-2">
              <Bus className="h-4 w-4" />
              {t('vehicle.tour_bus')}
            </TabsTrigger>
            <TabsTrigger value="minibus" className="gap-2">
              <Van className="h-4 w-4" />
              {t('vehicle.minibus')}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Feed */}
        <div className="space-y-4">
          {filteredUpdates.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                {t('feed.no_updates')}
              </CardContent>
            </Card>
          ) : (
            filteredUpdates.map((update) => {
              // Use data from upload directly
              const displayName = update.route_name || `${update.origin} - ${update.destination}` || 'Unknown Route';
              
              // Map vehicle type to Thai label
              const vehicleTypeLabels: Record<string, string> = {
                'tour_bus': 'รถทัวร์',
                'minibus': 'รถตู้',
                'songthaew': 'รถสองแถว'
              };
              
              // Map status to Thai label
              const statusLabels: Record<string, string> = {
                'available': 'มีให้บริการปกติ',
                'seasonal': 'ช่วงเทศกาล'
              };
              
              const vehicleType = update.vehicle_type || 'tour_bus';
              const statusLabel = statusLabels[update.status] || update.status;

              return (
                <Link key={update.id} href={`/${locale}/routes/${update.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{displayName}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          {getVehicleIcon(vehicleType as VehicleType)}
                          <span>{vehicleTypeLabels[vehicleType] || vehicleType}</span>
                          {update.company_name && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-gray-700">{update.company_name}</span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(update.status)} text-white shrink-0`}>
                        {statusLabel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {update.status_note && (
                      <div className="flex items-start gap-2 text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                        <span>{update.status_note}</span>
                      </div>
                    )}
                    
                    {/* Phone Numbers with Stops */}
                    {update.phone_numbers && update.phone_numbers.length > 0 && (
                      <div className="space-y-2">
                        {update.phone_numbers.map((phone: any, idx: number) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                              {phone.number && (
                                <span 
                                  className="text-blue-600 hover:underline font-medium cursor-pointer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.location.href = `tel:${phone.number}`;
                                  }}
                                >
                                  {phone.number}
                                </span>
                              )}
                              {phone.image && (
                                <img 
                                  src={phone.image} 
                                  alt={`Phone ${idx + 1}`} 
                                  className="h-8 w-auto rounded border ml-2 cursor-pointer hover:opacity-80 transition-opacity" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setModalImage(phone.image);
                                  }}
                                />
                              )}
                            </div>
                            {phone.stops && (
                              <div className="text-xs text-gray-500 mt-2 pl-6 leading-relaxed">
                                <span className="font-medium">ผ่าน:</span> {phone.stops}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 pt-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="font-medium">อัปเดตเมื่อ:</span>
                      <span>{getRelativeTime(update.created_at)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="gap-1 text-gray-600">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{update.upvotes}</span>
                        </Button>
                      </div>
                      <span className="text-xs text-gray-400">
                        {update.origin && update.destination ? `${update.origin} → ${update.destination}` : ''}
                      </span>
                    </div>
                  </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </main>

      {/* Image Modal */}
      {modalImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <img 
              src={modalImage} 
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
                  const link = document.createElement('a');
                  link.href = modalImage;
                  link.download = `phone-number-${Date.now()}.jpg`;
                  link.click();
                }}
                className="gap-2 bg-white hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                บันทึก
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setModalImage(null)}
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
