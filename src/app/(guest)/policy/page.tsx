'use client';

import { Typography, Divider } from 'antd';

const { Title, Paragraph } = Typography;

export default function PolicyPage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', padding: 32, borderRadius: 8 }}>
      <Title level={2}>Chính Sách Smart Hotel</Title>
      <Divider />
      <Title level={4}>1. Chính sách dành cho người dùng</Title>
      <Paragraph>
        <b>Đặt phòng:</b> Người dùng có thể đặt phòng trực tuyến tại các khách sạn đối tác của Smart Hotel. Để đảm bảo giữ phòng, người dùng cần đặt cọc 25% giá trị đơn đặt phòng.
      </Paragraph>
      <Paragraph>
        <b>Thanh toán:</b> Hỗ trợ nhiều phương thức thanh toán: thẻ tín dụng, chuyển khoản, ví điện tử, tiền mặt tại khách sạn (nếu được hỗ trợ).
      </Paragraph>
      <Paragraph>
        <b>Hủy phòng & Hoàn tiền:</b> 
        <ul>
          <li>Hủy miễn phí trước 2 ngày so với ngày nhận phòng (check-in).</li>
          <li>Hoàn lại 100% tiền đặt cọc nếu hủy đúng hạn.</li>
          <li>Hủy sau thời hạn trên hoặc không đến nhận phòng sẽ không được hoàn tiền đặt cọc.</li>
        </ul>
      </Paragraph>
      <Paragraph>
        <b>Thời gian nhận/trả phòng:</b> Nhận phòng từ 14:00, trả phòng trước 12:00 ngày trả phòng.
      </Paragraph>
      <Paragraph>
        <b>Bảo mật thông tin:</b> Smart Hotel cam kết bảo mật thông tin cá nhân của khách hàng và không chia sẻ cho bên thứ ba ngoài các đối tác liên quan đến việc đặt phòng.
      </Paragraph>
      <Divider />
      <Title level={4}>2. Chính sách dành cho khách sạn đối tác</Title>
      <Paragraph>
        <b>Đăng ký hợp tác:</b> Khách sạn có thể đăng ký trở thành đối tác của Smart Hotel để tiếp cận thêm khách hàng và quản lý đặt phòng hiệu quả.
      </Paragraph>
      <Paragraph>
        <b>Quản lý phòng & giá:</b> Đối tác có thể cập nhật thông tin phòng, giá, tình trạng phòng trống và các chương trình khuyến mãi trực tiếp trên hệ thống.
      </Paragraph>
      <Paragraph>
        <b>Chính sách đặt cọc & hủy phòng:</b>
        <ul>
          <li>Khách sạn cần tuân thủ chính sách đặt cọc và hủy phòng chung của hệ thống hoặc có thể đăng ký chính sách riêng (nếu được duyệt).</li>
          <li>Khách sạn có trách nhiệm hoàn trả tiền đặt cọc cho khách đúng quy định khi khách hủy phòng hợp lệ.</li>
        </ul>
      </Paragraph>
      <Paragraph>
        <b>Thanh toán & đối soát:</b> Smart Hotel sẽ tổng hợp và chuyển khoản doanh thu đặt phòng định kỳ cho khách sạn đối tác theo thỏa thuận hợp tác.
      </Paragraph>
      <Paragraph>
        <b>Hỗ trợ & giải quyết khiếu nại:</b> Đội ngũ Smart Hotel luôn sẵn sàng hỗ trợ đối tác trong việc xử lý các vấn đề phát sinh liên quan đến đặt phòng, thanh toán, khiếu nại của khách hàng.
      </Paragraph>
      <Divider />
      <Title level={4}>3. Chính sách về hành vi đặt/hủy phòng bất thường</Title>
      <Paragraph>
        <b>Phát hiện hành vi phá hoại:</b> Nếu hệ thống phát hiện người dùng cố ý đặt phòng và hủy quá nhiều lần với mục đích phá hoại hoặc gây ảnh hưởng xấu đến hoạt động của Smart Hotel, tài khoản có thể bị tạm khóa hoặc hạn chế quyền đặt phòng.
      </Paragraph>
      <Paragraph>
        <b>Xử lý vi phạm:</b> Các trường hợp nghi ngờ gian lận, phá hoại sẽ được xem xét và xử lý theo quy định của Smart Hotel. Người dùng vi phạm có thể bị từ chối cung cấp dịch vụ hoặc bị yêu cầu xác minh thông tin trước khi tiếp tục sử dụng hệ thống.
      </Paragraph>
      <Paragraph>
        <b>Hỗ trợ giải quyết:</b> Nếu bạn cho rằng tài khoản bị hạn chế do nhầm lẫn, vui lòng liên hệ bộ phận CSKH để được hỗ trợ kiểm tra và xử lý.
      </Paragraph>
      <Paragraph type="danger" style={{ color: 'red' }}>
        <b>Cảnh báo pháp lý:</b> Mọi hành vi cố ý phá hoại, gây rối, tấn công hệ thống hoặc thực hiện các hành động gây thiệt hại cho Smart Hotel đều có thể bị xử lý theo quy định của pháp luật hiện hành. Người vi phạm có thể phải chịu trách nhiệm dân sự, hành chính hoặc hình sự tùy theo mức độ vi phạm.
      </Paragraph>
      <Divider />
      <Title level={4}>4. Liên hệ hỗ trợ</Title>
      <Paragraph>
        Nếu bạn có bất kỳ thắc mắc hoặc cần hỗ trợ, vui lòng liên hệ bộ phận CSKH của Smart Hotel qua email <a href="mailto:support@smarthotel.vn">support@smarthotel.vn</a> hoặc hotline <a href="tel:19001234">1900 1234</a>.
      </Paragraph>
    </div>
  );
}
