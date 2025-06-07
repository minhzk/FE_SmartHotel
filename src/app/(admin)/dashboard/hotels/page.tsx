import { auth } from "@/auth";
import HotelTable from "@/components/admin/hotels/hotel.table";
import { HotelService } from "@/services/hotel.service";

interface IProps {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

const ManageHotelsPage = async (props: IProps) => {
    const current = Number(props?.searchParams?.current) || 1;
    const pageSize = Number(props?.searchParams?.pageSize) || 5;
    const session = await auth();

    const res = await HotelService.getHotels(
        { current, pageSize },
        session?.user?.access_token!
    );

    return (
        <div>
            <HotelTable
                hotels={res?.data?.results ?? []}
                meta={res?.data?.meta}
            />
        </div>
    );
};

export default ManageHotelsPage;
