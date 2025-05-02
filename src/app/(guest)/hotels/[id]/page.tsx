import { auth } from "@/auth";
import { sendRequest } from "@/utils/api";
import HotelDetail from "@/components/hotels/hotel-detail";
import { notFound } from "next/navigation";

interface IProps {
  params: { id: string }
}

export default async function HotelDetailPage({ params }: IProps) {
  const session = await auth();
  const hotelId = params.id;
  
  try {
    // Fetch hotel data
    const hotelResponse = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/hotels/${hotelId}`,
      method: "GET",
      headers: session?.user?.access_token ? {
        Authorization: `Bearer ${session?.user?.access_token}`,
      } : undefined,
      nextOption: {
        next: { tags: [`hotel-${hotelId}`] }
      }
    });
    
    if (!hotelResponse?.data) {
      return notFound();
    }
    
    // Fetch hotel rooms
    const roomsResponse = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/rooms/hotel/${hotelId}`,
      method: "GET",
      headers: session?.user?.access_token ? {
        Authorization: `Bearer ${session?.user?.access_token}`,
      } : undefined,
      nextOption: {
        next: { tags: [`rooms-hotel-${hotelId}`] }
      }
    });
    
    // Fetch hotel reviews
    const reviewsResponse = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews/hotel/${hotelId}`,
      method: "GET",
      queryParams: {
        pageSize: 5,
        current: 1,
        status: "approved"
      },
      nextOption: {
        next: { tags: [`reviews-hotel-${hotelId}`] }
      }
    });
    
    return (
      <HotelDetail
        hotel={hotelResponse.data}
        rooms={roomsResponse?.data?.results || []}
        reviews={reviewsResponse?.data?.results || []}
        session={session}
      />
    );
  } catch (error) {
    console.error("Error fetching hotel details:", error);
    return notFound();
  }
}
