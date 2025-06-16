'use client';

import { useEffect, useState, useRef } from 'react';
import Card from 'antd/lib/card';
import List from 'antd/lib/list';
import Tag from 'antd/lib/tag';
import Typography from 'antd/lib/typography';
import { 
  HomeOutlined, 
  CalendarOutlined, 
  CreditCardOutlined, 
  QuestionCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import ChatWidget from "@/components/chat/chat-widget";
import { useSession } from 'next-auth/react';

const { Title, Text, Paragraph } = Typography;

const suggestedQuestions = [
  { 
    icon: <HomeOutlined />, 
    category: "Khách sạn",
    questions: [
      "Các khách sạn tốt nhất?",
      "Các khách sạn trong thành phố cụ thể?",
      "Khách sạn có những tiện ích, dịch vụ gì?",
      "Tìm khách sạn theo giá cả..."
    ]
  },
  { 
    icon: <CalendarOutlined />, 
    category: "Đặt phòng",
    questions: [
      "Khách sạn có các loại phòng nào?",
      "Giá cả các loại phòng?",
      "Phòng có còn trống không?",
      "Các khách sạn còn phòng trống trong ngày cụ thể?",
    ]
  },
  { 
    icon: <QuestionCircleOutlined />, 
    category: "Khác",
    questions: [
      "Chính sách của hệ thống?",
      "hệ thống cung cấp những loại phòng nào?",
      "Chính sách hủy phòng?",
      "Chính sách hoàn tiền?",
    ]
  }
];

export default function ChatPage() {
  const { data: session } = useSession();
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const chatWidgetRef = useRef<any>(null);
  
  const handleQuestionClick = (question: string) => {
    setActiveQuestion(question);
    
    if (chatWidgetRef.current && typeof chatWidgetRef.current.sendMessageFromOutside === 'function') {
      chatWidgetRef.current.sendMessageFromOutside(question);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0, marginRight: '12px' }}>Trợ lý AI Smart Hotel</Title>
          <Tag color="blue">24/7</Tag>
        </div>
        
        <Paragraph>
          Chào mừng bạn đến với trợ lý AI của Smart Hotel. Tôi có thể trả lời các câu hỏi về khách sạn, 
          đặt phòng, các dịch vụ và nhiều thông tin khác. Hãy hỏi tôi bất cứ điều gì bạn muốn biết!
        </Paragraph>
        
        <div style={{ marginBottom: '40px' }}>
          <Title level={4} style={{ display: 'flex', alignItems: 'center' }}>
            <InfoCircleOutlined style={{ marginRight: '8px' }} />
            Bạn có thể hỏi về
          </Title>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {suggestedQuestions.map((category, index) => (
              <Card key={index} size="small" title={
                <span>
                  {category.icon} {category.category}
                </span>
              }>
                <List
                  size="small"
                  dataSource={category.questions}
                  renderItem={(question) => (
                    <List.Item 
                      onClick={() => handleQuestionClick(question)}
                      style={{ 
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '4px',
                        backgroundColor: activeQuestion === question ? '#e6f7ff' : 'transparent',
                      }}
                    >
                      <Text>{question}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            ))}
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px', 
          padding: '20px', 
          textAlign: 'center' 
        }}>
          <div style={{ height: '500px', width: '100%' }}>
            <ChatWidget 
              startOpen={true} 
              displayInline={true}
              isGeneralMode={true}
              enableHotelQueries={true}
              enableRoomQueries={true}
              enableBookingAssistance={true}
              systemContext="Trợ lý tổng quát Smart Hotel - có thể trả lời mọi câu hỏi về danh sách khách sạn, thông tin các khách sạn ở các thành phố, các loại phòng, giá cả, và dịch vụ."
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
