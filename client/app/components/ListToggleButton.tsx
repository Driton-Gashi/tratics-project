'use client';

import { useState, useEffect } from 'react';
import { meApi } from '@/src/lib/api';

type ListToggleButtonProps = {
  listType: 'watchlist' | 'favorite';
  itemType: 'movie' | 'series' | 'episode';
  wpPostId: number;
  wpSlug: string;
  className?: string;
};

export default function ListToggleButton({
  listType,
  itemType,
  wpPostId,
  wpSlug,
  className = '',
}: ListToggleButtonProps) {
  const [isInList, setIsInList] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const status = await meApi.checkListStatus(listType, itemType, wpPostId);
        setIsInList(status);
      } catch (error) {
        // Not authenticated or error - hide button
        setIsInList(false);
      } finally {
        setIsLoading(false);
      }
    }
    checkStatus();
  }, [listType, itemType, wpPostId]);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      if (isInList) {
        await meApi.removeFromList({
          list_type: listType,
          item_type: itemType,
          wp_post_id: wpPostId,
        });
        setIsInList(false);
      } else {
        await meApi.addToList({
          list_type: listType,
          item_type: itemType,
          wp_post_id: wpPostId,
          wp_slug: wpSlug,
        });
        setIsInList(true);
      }
    } catch (error) {
      console.error('Failed to toggle list:', error);
      // Optionally show error toast
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <button
        disabled
        className={`rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 opacity-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 ${className}`}
      >
        Loading...
      </button>
    );
  }

  const label = listType === 'watchlist' ? 'Watchlist' : 'Favorite';
  const icon = isInList ? '✓' : '+';

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
        isInList
          ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800 dark:border-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600'
          : 'border-black/10 bg-white text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
      } ${isToggling ? 'opacity-50' : ''} ${className}`}
    >
      <span>{icon}</span>
      <span>{isInList ? `In ${label}` : `Add to ${label}`}</span>
    </button>
  );
}
