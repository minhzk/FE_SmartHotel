import { auth } from "@/auth";
import HotelTable from "@/components/admin/hotels/hotel.table";
import { sendRequest } from "@/utils/api";

interface IProps {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

const ManageHotelsPage = async (props: IProps) => {
    const current = props?.searchParams?.current ?? 1;
    const pageSize = props?.searchParams?.pageSize ?? 5;
    const session = await auth();

    const res = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/hotels`,
        method: "GET",
        queryParams: {
            current,
            pageSize
        },
        headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
        },
        nextOption: {
            next: { tags: ['list-hotels'] }
        }
    });

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
