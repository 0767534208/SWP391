import React from 'react';
import './PageSection.css';

interface PageSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const PageSection: React.FC<PageSectionProps> = ({ title, subtitle, children }) => {
  return (
    <div className="page-section">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default PageSection; 