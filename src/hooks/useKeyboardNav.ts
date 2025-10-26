import { useEffect } from 'react';

interface KeyboardNavOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onSpace?: () => void;
  enabled?: boolean;
}

export function useKeyboardNav(options: KeyboardNavOptions) {
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

      switch (e.key) {
        case 'Enter':
          if (options.onEnter && !isInput) {
            e.preventDefault();
            options.onEnter();
          }
          break;

        case 'Escape':
          if (options.onEscape) {
            e.preventDefault();
            options.onEscape();
          }
          break;

        case 'ArrowUp':
          if (options.onArrowUp && !isInput) {
            e.preventDefault();
            options.onArrowUp();
          }
          break;

        case 'ArrowDown':
          if (options.onArrowDown && !isInput) {
            e.preventDefault();
            options.onArrowDown();
          }
          break;

        case 'ArrowLeft':
          if (options.onArrowLeft && !isInput) {
            e.preventDefault();
            options.onArrowLeft();
          }
          break;

        case 'ArrowRight':
          if (options.onArrowRight && !isInput) {
            e.preventDefault();
            options.onArrowRight();
          }
          break;

        case ' ':
          if (options.onSpace && !isInput) {
            e.preventDefault();
            options.onSpace();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, options]);
}
