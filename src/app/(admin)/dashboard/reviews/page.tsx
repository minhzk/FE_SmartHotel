import { auth } from "@/auth";
import ReviewTable from "@/components/admin/reviews/review.table";
import { ReviewService } from "@/services/review.service";

interface IProps {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

const ManageReviewsPage = async (props: IProps) => {
    const current = Number(props?.searchParams?.current) || 1;
    const pageSize = Number(props?.searchParams?.pageSize) || 10;
    const session = await auth();

    const res = await ReviewService.getReviews(
        { current, pageSize },
        session?.user?.access_token!
    );

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
