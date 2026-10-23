import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { Share2 } from 'lucide-react';
import type { Action } from '@/components/ui/action-group';
import { useSettingsContext } from '@/contexts/settings/context';
import { useToast } from '@/contexts/toast/context';
import { buildAbsoluteUrl } from '@/utils/paths';

interface ShareActionOptions {
  title?: string;
  url?: string;
  /** Share/copy this text instead of a URL. */
  text?: string;
  ariaLabel?: string;
  testId?: string;
  icon?: ReactNode;
  copySuccessMessage?: string;
  shareSuccessMessage?: string;
  copySuccessKey?: ParseKeys<'common'>;
  shareSuccessKey?: ParseKeys<'common'>;
  unavailableMessage?: string;
}

/**
 * Returns a ready-to-use PageHeader/ActionGroup action that shares a URL with native share + clipboard fallback.
 */
export const useShareAction = ({
  title,
  url,
  text,
  ariaLabel,
  testId,
  icon,
  copySuccessMessage,
  shareSuccessMessage,
  copySuccessKey = 'share.copySuccess',
  shareSuccessKey = 'share.shareSuccess',
  unavailableMessage
}: ShareActionOptions): Action => {
  const { t } = useTranslation('common');
  const { settings } = useSettingsContext();
  const { showToast } = useToast();
  const useNativeShare = settings.useNativeShare ?? true;

  const currentPath =
    typeof window !== 'undefined' && typeof window.location !== 'undefined'
      ? window.location.pathname
      : '/';
  const resolvedUrl = url || buildAbsoluteUrl(currentPath);
  const resolvedTitle = title ?? t('share.title');

  const share = useCallback(async () => {
    const canUseNativeShare =
      useNativeShare && typeof navigator !== 'undefined' && typeof navigator.share === 'function';

    const copyFallback = async () => {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        showToast({
          type: 'error',
          title: t('error.label'),
          message: unavailableMessage ?? t('share.unavailable'),
          translation: {
            title: 'error.label',
            message: unavailableMessage === undefined ? 'share.unavailable' : undefined
          }
        });
        return;
      }
      try {
        await navigator.clipboard.writeText(text ?? resolvedUrl);
        showToast({
          type: 'success',
          title: text ? t('share.copied') : t('share.linkCopied'),
          message: copySuccessMessage ?? t(copySuccessKey),
          translation: {
            title: text ? 'share.copied' : 'share.linkCopied',
            message: copySuccessMessage === undefined ? copySuccessKey : undefined
          }
        });
      } catch {
        showToast({
          type: 'error',
          title: t('share.copyFailed'),
          message: t('share.copyError'),
          translation: { title: 'share.copyFailed', message: 'share.copyError' }
        });
      }
    };

    if (canUseNativeShare) {
      try {
        await navigator.share(
          text ? { title: resolvedTitle, text } : { title: resolvedTitle, url: resolvedUrl }
        );
        showToast({
          type: 'success',
          title: t('share.shared'),
          message: shareSuccessMessage ?? t(shareSuccessKey),
          translation: {
            title: 'share.shared',
            message: shareSuccessMessage === undefined ? shareSuccessKey : undefined
          }
        });
        return;
      } catch {
        // fall through to clipboard
      }
    }

    await copyFallback();
  }, [
    copySuccessMessage,
    copySuccessKey,
    resolvedTitle,
    resolvedUrl,
    shareSuccessMessage,
    shareSuccessKey,
    showToast,
    t,
    text,
    unavailableMessage,
    useNativeShare
  ]);

  const handleClick: Action['onClick'] = () => {
    void share();
  };

  return {
    icon: icon ?? <Share2 size={16} />,
    ariaLabel: ariaLabel ?? t('share.label'),
    onClick: handleClick,
    'data-testid': testId
  };
};
