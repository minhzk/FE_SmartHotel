import { auth } from "@/auth";
import HotelListing from "@/components/hotels/hotel-listing";

export default async function HotelsPage() {
  const session = await auth();
  
  return (
    <div>
      <HotelListing session={session} />
    </div>
  );
}
