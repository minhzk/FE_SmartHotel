import { auth } from "@/auth";
import RoomTable from "@/components/admin/rooms/room.table";
import { RoomService } from "@/services/room.service";

interface IProps {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

const ManageRoomsPage = async (props: IProps) => {
    const current = Number(props?.searchParams?.current) || 1;
    const pageSize = Number(props?.searchParams?.pageSize) || 5;
    const session = await auth();

    const res = await RoomService.getRooms(
        { current, pageSize },
        session?.user?.access_token!
    );

    return (
        <div>
            <RoomTable
                rooms={res?.data?.results ?? []}
                meta={res?.data?.meta}
            />
        </div>
    );
};

export default ManageRoomsPage;
