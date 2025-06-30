import React from 'react';

interface ServiceProps {
  id: number;
  name: string;
  duration?: string;
  price?: string;
  isSelected: boolean;
  onSelect: (id: number) => void;
  imageUrl?: string;
  description?: string;
}

const ServiceCard: React.FC<ServiceProps> = ({
  id,
  name,
  duration,
  price,
  isSelected,
  onSelect,
  imageUrl,
  description
}) => {
  return (
    <div
      className={`service-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(id)}
      role="button"
      tabIndex={0}
    >
      {imageUrl && (
        <div className="service-image">
          <img src={imageUrl} alt={name} />
        </div>
      )}
      <div className="service-info">
        <h4 className="service-name">{name}</h4>
        {description && <p className="service-description">{description}</p>}
        <div className="service-details">
          {duration && <span className="duration">{duration}</span>}
          {price && <span className="price">{price}</span>}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard; 