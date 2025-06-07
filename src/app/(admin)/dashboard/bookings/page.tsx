import { auth } from "@/auth";
import BookingTable from "@/components/admin/bookings/booking.table";
import { BookingService } from "@/services/booking.service";

interface IProps {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

const ManageBookingsPage = async (props: IProps) => {
    const current = Number(props?.searchParams?.current) || 1;
    const pageSize = Number(props?.searchParams?.pageSize) || 10;
    const session = await auth();

    // Extract all search params for filters
    const queryParams: any = {
        current,
        pageSize
    };

    // Add filter params if they exist
    if (props?.searchParams?.status) queryParams.status = props.searchParams.status as string;
    if (props?.searchParams?.paymentStatus) queryParams.payment_status = props.searchParams.paymentStatus as string;
    if (props?.searchParams?.depositStatus) queryParams.deposit_status = props.searchParams.depositStatus as string;
    if (props?.searchParams?.search) queryParams.search = props.searchParams.search as string;
    
    // Date range
    if (props?.searchParams?.startDate && props?.searchParams?.endDate) {
        queryParams.dateRange = `${props.searchParams.startDate},${props.searchParams.endDate}`;
    }

    const res = await BookingService.getBookings(
        queryParams,
        session?.user?.access_token!
    );

    return (
        <div>
            <BookingTable
                bookings={res?.data?.results ?? []}
                meta={res?.data?.meta}
            />
        </div>
    );
};

export default ManageBookingsPage;
