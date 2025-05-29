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
            <div className="thumbnail-list">
              {thumbnailImages.map((image, index) => (
                <div className="thumbnail-wrapper" key={index}>
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
                </div>
              ))}
              {hasMoreImages && (
                <div className="thumbnail-wrapper" style={{ width: '100%' }}>
                  <Button 
                    type="default" 
                    block 
                    onClick={handleViewAll}
                    className="view-all-button"
                  >
                    Xem tất cả {images.length} ảnh
                  </Button>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </div>
      
      {/* Image gallery preview */}
      {visible && (
        <Image.PreviewGroup
          preview={{
            visible,
            onVisibleChange: (vis) => setVisible(vis),
            current: currentImage,
            onChange: (idx) => setCurrentImage(idx), // Thêm dòng này để cập nhật currentImage khi chuyển ảnh
            countRender: (current, total) => `${current}/${total}`,
          }}
        >
          {images.map((image, index) => (
            <Image key={index} src={image.url} alt={image.description || `Ảnh ${index + 1}`} />
          ))}
        </Image.PreviewGroup>
      )}

      <style jsx global>{`
        .hotel-gallery-container {
          margin-bottom: 24px;
          overflow: hidden;
        }
        .main-image-container {
          width: 100%;
          aspect-ratio: 16/9;
          overflow: hidden;
          border-radius: 8px;
          cursor: pointer;
          background: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .main-image-container:hover .main-image {
          transform: scale(1.05);
        }
        .thumbnail-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          height: 100%;
          min-height: 360px;
          align-content: flex-start;
        }
        .thumbnail-wrapper {
          flex: 1 1 48%;
          min-width: 48%;
          max-width: 48%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .thumbnail-container {
          width: 100%;
          aspect-ratio: 1/1;
          overflow: hidden;
          border-radius: 8px;
          cursor: pointer;
          background: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .thumbnail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .thumbnail-container:hover .thumbnail-image {
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
            aspect-ratio: 16/10;
            margin-bottom: 8px;
          }
          .thumbnail-list {
            min-height: 0;
            gap: 8px;
          }
          .thumbnail-wrapper {
            min-width: 48%;
            max-width: 48%;
          }
          .thumbnail-container {
            aspect-ratio: 1/1;
          }
        }
      `}</style>
    </>
  );
};

export default HotelGallery;
