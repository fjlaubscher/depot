import type { ReactNode } from 'react';
import { useCallback } from 'react';
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
  unavailableMessage?: string;
}

/**
 * Returns a ready-to-use PageHeader/ActionGroup action that shares a URL with native share + clipboard fallback.
 */
export const useShareAction = ({
  title,
  url,
  text,
  ariaLabel = 'Share link',
  testId,
  icon,
  copySuccessMessage = 'Link copied to clipboard.',
  shareSuccessMessage = 'Link shared.',
  unavailableMessage = 'Sharing is not available on this device.'
}: ShareActionOptions): Action => {
  const { settings } = useSettingsContext();
  const { showToast } = useToast();
  const useNativeShare = settings.useNativeShare ?? true;

  const currentPath =
    typeof window !== 'undefined' && typeof window.location !== 'undefined'
      ? window.location.pathname
      : '/';
  const resolvedUrl = url || buildAbsoluteUrl(currentPath);
  const resolvedTitle = title ?? 'Share';

  const share = useCallback(async () => {
    const canUseNativeShare =
      useNativeShare && typeof navigator !== 'undefined' && typeof navigator.share === 'function';

    const copyFallback = async () => {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text ?? resolvedUrl);
        showToast({
          type: 'success',
          title: text ? 'Copied' : 'Link copied',
          message: copySuccessMessage
        });
      } else {
        showToast({ type: 'error', title: 'Error', message: unavailableMessage });
      }
    };

    if (canUseNativeShare) {
      try {
        await navigator.share(
          text ? { title: resolvedTitle, text } : { title: resolvedTitle, url: resolvedUrl }
        );
        showToast({ type: 'success', title: 'Shared', message: shareSuccessMessage });
        return;
      } catch {
        // fall through to clipboard
      }
    }

    await copyFallback();
  }, [
    copySuccessMessage,
    resolvedTitle,
    resolvedUrl,
    shareSuccessMessage,
    showToast,
    text,
    unavailableMessage,
    useNativeShare
  ]);

  const handleClick: Action['onClick'] = () => {
    void share();
  };

  return {
    icon: icon ?? <Share2 size={16} />,
    ariaLabel,
    onClick: handleClick,
    'data-testid': testId
  };
};
