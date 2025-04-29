import { auth } from "@/auth";
import ReviewTable from "@/components/admin/reviews/review.table";
import { sendRequest } from "@/utils/api";

interface IProps {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

const ManageReviewsPage = async (props: IProps) => {
    const current = props?.searchParams?.current ?? 1;
    const pageSize = props?.searchParams?.pageSize ?? 10;
    const session = await auth();

    const res = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews`,
        method: "GET",
        queryParams: {
            current,
            pageSize
        },
        headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
        },
        nextOption: {
            next: { tags: ['list-reviews'] }
        }
    });

    return (
        <div>
            <ReviewTable
                reviews={res?.data?.results ?? []}
                meta={res?.data?.meta}
            />
        </div>
    );
};

export default ManageReviewsPage;
