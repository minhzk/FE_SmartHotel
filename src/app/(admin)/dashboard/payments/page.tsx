import { auth } from "@/auth";
import PaymentTable from "@/components/admin/payments/payment.table";
import { PaymentService } from "@/services/payment.service";

interface IProps {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

const ManagePaymentsPage = async (props: IProps) => {
    const current = Number(props?.searchParams?.current) || 1;
    const pageSize = Number(props?.searchParams?.pageSize) || 10;
    const session = await auth();

    const res = await PaymentService.getPayments(
        { current, pageSize },
        session?.user?.access_token!
    );

    return (
        <div>
            <PaymentTable
                payments={res?.data?.results ?? []}
                meta={res?.data?.meta}
            />
        </div>
    );
};

export default ManagePaymentsPage;
