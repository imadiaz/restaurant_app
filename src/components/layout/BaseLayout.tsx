import React from 'react';
import PageHeader from '../common/PageHeader';
import { Inbox, Loader2 } from 'lucide-react';


interface BasePageLayoutProps {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  showNavBack?: boolean;
  renderControls?: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyLabel?: string;
  emptyIcon?: React.ElementType; // Allows passing a custom icon component
  children: React.ReactNode;
}

const BasePageLayout = ({
  title,
  subtitle,
  headerActions,
  showNavBack = false,
  renderControls,
  isLoading,
  isEmpty,
  emptyLabel = "No items found.",
  emptyIcon: EmptyIcon = Inbox, // Defaults to an Inbox icon
  children
}: BasePageLayoutProps) => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 h-full flex flex-col pb-20">
      
      {/* HEADER */}
      <PageHeader 
        title={title} 
        subtitle={subtitle} 
        showNavBack={showNavBack} 
        actions={headerActions} 
      />

      {/* CONTROLS */}
      {renderControls && (
        <div className="bg-background-card p-4 rounded-3xl shadow-sm border border-border flex flex-col md:flex-row gap-4 items-center">
          {renderControls}
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="flex-1 min-h-[400px]">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-text-muted animate-in fade-in">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
            <p className="font-medium">Loading data...</p>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-64 bg-background-card rounded-3xl border border-dashed border-border animate-in fade-in zoom-in-95">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-4">
              <EmptyIcon className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-text-muted font-medium">{emptyLabel}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default BasePageLayout;