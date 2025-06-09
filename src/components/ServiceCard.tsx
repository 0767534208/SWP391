import React from 'react';

interface ServiceProps {
  id: number;
  name: string;
  duration: string;
  price?: string;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

const ServiceCard: React.FC<ServiceProps> = ({
  id,
  name,
  duration,
  price,
  isSelected,
  onSelect
}) => {
  return (
    <div
      className={`service-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(id)}
      role="button"
      tabIndex={0}
    >
      <div className="service-info">
        <h4 className="service-name">{name}</h4>
        <div className="service-details">
          <span className="duration">{duration}</span>
          {price && <span className="price">{price}</span>}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard; 