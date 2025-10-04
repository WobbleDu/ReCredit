import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const useRouterActions = () => {
  const router = useRouter();

  const openProfile = useCallback((userId: number | undefined) => {
    if (!userId) return;
    router.push(`/pages/profile/${userId}`);
  }, [router]);

  const openCabinet = useCallback(() => {
    router.push('/pages/lk');
  }, [router]);

  const goLogin = useCallback(() => {
    router.push('/login');
  }, [router]);

  const openNotifications = useCallback(() => {
    router.push('/pages/notifications');
  }, [router]);

  const openHome = useCallback(() => {
    router.push('/pages');
  }, [router]);

  const openSettings = useCallback(() => {
    router.push('/pages/settings');
  }, [router]);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const push = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const replace = useCallback((path: string) => {
    router.replace(path);
  }, [router]);

  return {
    openProfile,
    openCabinet,
    openNotifications,
    openHome,
    openSettings,
    goBack,
    push,
    replace,
    goLogin,
  };
};