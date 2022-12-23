import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { IconButton, useToast } from '@fjlaubscher/matter';
import { FaShareAlt } from 'react-icons/fa';

interface Props {
  title: string;
}

const ShareButton = ({ title }: Props) => {
  const { pathname } = useLocation();
  const toast = useToast();

  const handleShare = useCallback(async () => {
    try {
      const shareLink = `${window.location.origin}${pathname}`;
      const shareData: ShareData = {
        title: 'depot',
        text: title,
        url: shareLink
      };

      if (!navigator.canShare || !navigator.canShare(shareData)) {
        await navigator.clipboard.writeText(shareLink);
        toast({
          variant: 'success',
          text: 'Link copied to your clipboard'
        });
      } else {
        await navigator.share(shareData);
        toast({
          variant: 'success',
          text: 'Shared'
        });
      }
    } catch (ex: any) {
      toast({
        variant: 'error',
        text: ex.message || 'Unable to share'
      });
    }
  }, [pathname, toast, title]);

  return (
    <IconButton onClick={handleShare}>
      <FaShareAlt />
    </IconButton>
  );
};

export default ShareButton;
