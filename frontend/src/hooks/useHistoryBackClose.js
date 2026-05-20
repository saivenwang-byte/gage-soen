import { useEffect, useRef, useCallback } from 'react';

/**
 * 弹层打开时压入 history，用户点浏览器/手机「返回」时先关弹层而不是退出应用。
 */
export function useHistoryBackClose(active, onClose, stateKey = 'modal') {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!active) return undefined;
    window.history.pushState({ [stateKey]: true }, '');
    pushedRef.current = true;

    const onPop = () => {
      pushedRef.current = false;
      onClose();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [active, onClose, stateKey]);

  const requestClose = useCallback(() => {
    if (pushedRef.current) {
      pushedRef.current = false;
      window.history.back();
      return;
    }
    onClose();
  }, [onClose]);

  return { requestClose };
}
