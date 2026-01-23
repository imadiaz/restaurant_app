import { ArrowLeft } from "lucide-react";
import AnatomyText from "../anatomy/AnatomyText";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  
title: String;
subtitle?: String;
actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {

    const navigate = useNavigate();

    return(
         <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <AnatomyText.H1>{title}</AnatomyText.H1>
            {subtitle && <AnatomyText.Body className="text-gray-500 mt-1">{subtitle}</AnatomyText.Body>}
          </div>
        </div>
        <div className="flex gap-3">
          {actions}
        </div>
      </div>
    );
}

export default PageHeader;