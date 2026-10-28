import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Browser-reported cache footprint. `estimate()` covers everything this origin
 * stores (IndexedDB + Cache Storage), so it is a total, not a per-kind split.
 */
const StorageUsage = () => {
  const { t, i18n } = useTranslation('settings');
  const [estimate, setEstimate] = useState<{ usage: number; quota: number } | null>(null);

  useEffect(() => {
    navigator.storage
      ?.estimate?.()
      .then(({ usage, quota }) => setEstimate({ usage: usage ?? 0, quota: quota ?? 0 }))
      .catch(() => setEstimate(null));
  }, []);

  if (!estimate) {
    return (
      <p
        className="font-mono text-[10px] font-medium uppercase text-hint"
        data-testid="storage-usage"
      >
        {t('storage.unavailable')}
      </p>
    );
  }

  const percent = estimate.quota > 0 ? Math.min(100, (estimate.usage / estimate.quota) * 100) : 0;
  const number = new Intl.NumberFormat(i18n.resolvedLanguage, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });

  return (
    <div data-testid="storage-usage">
      <div
        className="h-1.5 overflow-hidden rounded-xs bg-surface-soft"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('storage.label')}
      >
        <div
          className="h-full bg-accent-600 dark:bg-accent-500"
          style={{ width: `${Math.max(percent, 1)}%` }}
        />
      </div>
      <p className="mt-1.5 font-mono text-[10px] font-medium uppercase text-muted">
        {t(estimate.quota > 0 ? 'storage.quota' : 'storage.used', {
          usage: number.format(estimate.usage / 1024 / 1024),
          quota: number.format(estimate.quota / 1024 / 1024)
        })}
      </p>
    </div>
  );
};

export default StorageUsage;
