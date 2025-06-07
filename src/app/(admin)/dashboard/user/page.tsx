import { auth } from "@/auth";
import UserTable from "@/components/admin/users/user.table"
import { UserService } from "@/services/user.service";

interface IProps {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

const ManageUserPage = async (props: IProps) => {
    const current = Number(props?.searchParams?.current) || 1;
    const pageSize = Number(props?.searchParams?.pageSize) || 10;
    const session = await auth();

    // Extract all search params for filters
    const queryParams: any = {
        current,
        pageSize
    };

    // Add filter params if they exist
    if (props?.searchParams?.role) queryParams.role = props.searchParams.role as string;
    if (props?.searchParams?.isActive) queryParams.isActive = props.searchParams.isActive as string;
    if (props?.searchParams?.search) queryParams.search = props.searchParams.search as string;

    const res = await UserService.getUsers(
        queryParams,
        session?.user?.access_token!
    );

    return (
        <div>
            <UserTable
                users={res?.data?.results ?? []}
                meta={res?.data?.meta}
            />
        </div>
    )
}

export default ManageUserPage