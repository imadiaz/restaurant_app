import { ArrowLeft } from "lucide-react";
import AnatomyText from "../anatomy/AnatomyText";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  
title: string;
showNavBack?: boolean;
subtitle?: string;
actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, showNavBack = true }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        
        {/* Back Button */}
        {showNavBack && (
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-full transition-colors border border-transparent 
              hover:bg-background-card hover:shadow-sm hover:border-border
              text-text-muted hover:text-text-main"
            title="Go Back"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Title & Subtitle */}
        <div className="min-w-0">
          <AnatomyText.H1>{title}</AnatomyText.H1>
          {subtitle && (
            <AnatomyText.Body className="text-text-muted mt-1">
              {subtitle}
            </AnatomyText.Body>
          )}
        </div>
      </div>

      {/* Actions (Buttons, etc) */}
      <div className="flex flex-wrap items-center gap-3">
        {actions}
      </div>
    </div>
  );
};

export default PageHeader;
