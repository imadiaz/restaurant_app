import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AnatomyButton from '../anatomy/AnatomyButton';

interface ErrorBoundaryState {
  hasError: boolean;
}

const ErrorFallback = () => {
  const { t } = useTranslation();

  return (
    <main className="grid min-h-dvh place-items-center bg-background p-6 text-text-main">
      <section role="alert" className="w-full max-w-lg rounded-card border border-border bg-background-card p-8 text-center shadow-xl">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-danger-surface text-danger">
          <AlertTriangle aria-hidden="true" className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold">{t('error_boundary.title')}</h1>
        <p className="mt-3 text-sm text-text-muted">{t('error_boundary.description')}</p>
        <AnatomyButton className="mt-6" onClick={() => window.location.reload()}>
          <RefreshCw aria-hidden="true" className="mr-2 h-4 w-4" />
          {t('error_boundary.reload')}
        </AnatomyButton>
      </section>
    </main>
  );
};

class AppErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? <ErrorFallback /> : this.props.children;
  }
}

export default AppErrorBoundary;
