import React from 'react';
import PageHeader from '../common/PageHeader';
import { Inbox, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';


interface BasePageLayoutProps {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  showNavBack?: boolean;
  renderControls?: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyLabel?: string;
  emptyIcon?: React.ElementType;
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
  emptyLabel,
  emptyIcon: EmptyIcon = Inbox,
  children
}: BasePageLayoutProps) => {
    const { t } = useTranslation();
  
  return (
    <div className="max-w-7xl mx-auto space-y-8 h-full flex flex-col pb-20">
      <PageHeader 
        title={title} 
        subtitle={subtitle} 
        showNavBack={showNavBack} 
        actions={headerActions} 
      />

      {renderControls && (
        <div className="bg-background-card p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center">
          {renderControls}
        </div>
      )}


      <div className="flex-1 min-h-[400px]">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-text-muted animate-in fade-in">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
            <p className="font-medium">{t('loading_data')}</p>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-64 bg-background-card rounded-3xl border border-dashed border-border animate-in fade-in zoom-in-95">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-4">
              <EmptyIcon className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-text-muted font-medium">{emptyLabel ?? t('forms.no_items_found')}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default BasePageLayout;