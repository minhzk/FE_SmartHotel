import { auth } from "@/auth";
import { HotelService } from "@/services/hotel.service";
import { RoomService } from "@/services/room.service";
import { ReviewService } from "@/services/review.service";
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
    const hotelResponse = await HotelService.getHotelByIdPublic(hotelId, session?.user?.access_token);
    
    if (!hotelResponse?.data) {
      return notFound();
    }
    
    // Fetch hotel rooms
    const roomsResponse = await RoomService.getRoomsByHotelId(hotelId, session?.user?.access_token);
    
    // Fetch hotel reviews
    const reviewsResponse = await ReviewService.getReviewsByHotelId(hotelId, {
      pageSize: 5,
      current: 1
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
