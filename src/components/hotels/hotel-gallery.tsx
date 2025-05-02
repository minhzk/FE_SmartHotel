'use client';

import React, { useState } from 'react';
import { Row, Col, Image, Button } from 'antd';
import { LeftOutlined, RightOutlined, PictureOutlined } from '@ant-design/icons';

interface HotelImage {
  url: string;
  description?: string;
  cloudinary_id?: string;
}

interface HotelGalleryProps {
  images: HotelImage[];
}

const HotelGallery: React.FC<HotelGalleryProps> = ({ images }) => {
  const [visible, setVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  
  if (!images || images.length === 0) {
    return (
      <div className="hotel-gallery-placeholder">
        <PictureOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
        <p>Không có hình ảnh</p>
      </div>
    );
  }

  // Chọn ảnh thumbnail: 1 ảnh lớn và 4 ảnh nhỏ
  const mainImage = images[0];
  const thumbnailImages = images.slice(1, 5);
  const hasMoreImages = images.length > 5;
  
  const handleViewAll = () => {
    setVisible(true);
  };
  
  return (
    <>
      <div className="hotel-gallery-container">
        <Row gutter={[8, 8]}>
          <Col xs={24} md={16}>
            <div className="main-image-container">
              <Image
                src={mainImage.url}
                alt={mainImage.description || "Ảnh khách sạn"}
                className="main-image"
                preview={false}
                onClick={() => {
                  setCurrentImage(0);
                  setVisible(true);
                }}
              />
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Row gutter={[8, 8]}>
              {thumbnailImages.map((image, index) => (
                <Col span={12} key={index}>
                  <div className="thumbnail-container">
                    <Image
                      src={image.url}
                      alt={image.description || `Ảnh khách sạn ${index + 1}`}
                      className="thumbnail-image"
                      preview={false}
                      onClick={() => {
                        setCurrentImage(index + 1);
                        setVisible(true);
                      }}
                    />
                  </div>
                </Col>
              ))}
              {hasMoreImages && (
                <Col span={24}>
                  <Button 
                    type="default" 
                    block 
                    onClick={handleViewAll}
                    className="view-all-button"
                  >
                    Xem tất cả {images.length} ảnh
                  </Button>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
      </div>
      
      {/* Image gallery preview */}
      <div style={{ display: 'none' }}>
        <Image.PreviewGroup
          preview={{
            visible,
            onVisibleChange: (vis) => setVisible(vis),
            current: currentImage,
            countRender: (current, total) => `${current}/${total}`,
          }}
        >
          {images.map((image, index) => (
            <Image key={index} src={image.url} alt={image.description || `Ảnh ${index + 1}`} />
          ))}
        </Image.PreviewGroup>
      </div>

      <style jsx global>{`
        .hotel-gallery-container {
          margin-bottom: 24px;
          overflow: hidden;
        }
        
        .main-image-container {
          width: 100%;
          height: 360px;
          overflow: hidden;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .main-image:hover {
          transform: scale(1.05);
        }
        
        .thumbnail-container {
          width: 100%;
          height: 176px;
          overflow: hidden;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .thumbnail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .thumbnail-image:hover {
          transform: scale(1.05);
        }
        
        .view-all-button {
          height: 40px;
          margin-top: 4px;
        }
        
        .hotel-gallery-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 360px;
          background-color: #f0f2f5;
          border-radius: 8px;
        }

        @media (max-width: 768px) {
          .main-image-container {
            height: 240px;
            margin-bottom: 8px;
          }
          
          .thumbnail-container {
            height: 120px;
          }
        }
      `}</style>
    </>
  );
};

export default HotelGallery;
