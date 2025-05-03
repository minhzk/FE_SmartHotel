import { auth } from '@/auth';
import PaymentSelection from '@/components/booking/payment-selection';
import { sendRequest } from '@/utils/api';
import { redirect } from 'next/navigation';

export default async function PaymentPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect('/auth/signin?callbackUrl=' + encodeURIComponent(`/booking/payment/${params.id}`));
  }
  
  // Fetch booking details
  try {
    // Fetch booking information
    const booking = await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/bookings/${params.id}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session?.user?.access_token}`,
      },
    });
    
    if (!booking?.data) {
      redirect('/bookings?error=booking-not-found');
    }
    
    // Fetch hotel information
    const hotel = await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/hotels/${booking.data.hotel_id}`,
      method: 'GET',
    });
    
    // Fetch room information
    const room = await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/rooms/${booking.data.room_id}`,
      method: 'GET',
    });
    
    return (
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <PaymentSelection
          bookingData={booking.data}
          hotelInfo={hotel?.data}
          roomInfo={room?.data}
          session={session}
          bookingId={params.id}
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    redirect('/bookings?error=fetch-failed');
  }
}
