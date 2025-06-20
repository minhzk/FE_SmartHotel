'use client';

import { Typography, Divider } from 'antd';

const { Title, Paragraph } = Typography;

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', padding: 32, borderRadius: 8 }}>
      <Title level={2}>Giới Thiệu Về Smart Hotel</Title>
      <Divider />
      <Paragraph>
        <b>Smart Hotel</b> là nền tảng đặt phòng khách sạn trực tuyến hiện đại, giúp kết nối khách hàng với hàng trăm khách sạn đối tác trên khắp Việt Nam. Chúng tôi mang đến trải nghiệm đặt phòng nhanh chóng, minh bạch và an toàn cho mọi khách hàng.
      </Paragraph>
      <Paragraph>
        <b>Sứ mệnh:</b> Đơn giản hóa quá trình tìm kiếm và đặt phòng khách sạn, đồng thời hỗ trợ các khách sạn đối tác tối ưu hóa hoạt động kinh doanh và tiếp cận nhiều khách hàng hơn.
      </Paragraph>
      <Paragraph>
        <b>Điểm nổi bật của Smart Hotel:</b>
        <ul>
          <li>Đặt phòng trực tuyến 24/7, xác nhận nhanh chóng.</li>
          <li>So sánh giá, tiện ích và đánh giá khách sạn minh bạch.</li>
          <li>Hỗ trợ nhiều phương thức thanh toán: thẻ tín dụng, chuyển khoản, ví điện tử, tiền mặt tại khách sạn.</li>
          <li>Chính sách đặt cọc, hủy phòng linh hoạt, hoàn tiền minh bạch.</li>
          <li>Đội ngũ chăm sóc khách hàng tận tâm, hỗ trợ 24/7.</li>
          <li>Hệ thống chatbot AI thông minh, hỗ trợ giải đáp thắc mắc và tư vấn đặt phòng tự động.</li>
        </ul>
      </Paragraph>
      <Paragraph>
        <b>Đối tác khách sạn:</b> Smart Hotel luôn chào đón các khách sạn trên toàn quốc tham gia hệ sinh thái, cùng phát triển và nâng cao chất lượng dịch vụ lưu trú cho khách hàng.
      </Paragraph>
      <Paragraph>
        <b>Tầm nhìn:</b> Trở thành nền tảng đặt phòng khách sạn hàng đầu tại Việt Nam, ứng dụng công nghệ để nâng cao trải nghiệm người dùng và tối ưu hóa hiệu quả cho đối tác.
      </Paragraph>
      <Divider />
      <Title level={4}>Liên hệ</Title>
      <Paragraph>
        Địa chỉ: 123 Đường Số 1, Quận 1, TP. Hồ Chí Minh<br />
        Email: <a href="mailto:support@smarthotel.vn">support@smarthotel.vn</a><br />
        Hotline: <a href="tel:19001234">1900 1234</a>
      </Paragraph>
    </div>
  );
}
