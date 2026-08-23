import { useCallback } from 'react';
import type { ComponentProps, MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  useNavigate as useRouterNavigate
} from 'react-router-dom';
import type { NavigateFunction, NavigateOptions, To } from 'react-router-dom';

/**
 * Runs `update` inside a View Transition so route swaps cross-fade instead of
 * cutting. React Router only wires its own `viewTransition` option up for data
 * routers, so we drive the API directly; `flushSync` makes React commit inside
 * the transition callback. Unsupported browsers and reduced-motion users get
 * the plain instant update.
 */
const withViewTransition = (update: () => void) => {
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update();
    return;
  }
  document.startViewTransition(() => flushSync(update));
};

/** Clicks the browser would handle itself (new tab, middle click) are left alone. */
const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/** `useNavigate`, wrapped so every programmatic navigation animates. */
export const useNavigate = (): NavigateFunction => {
  const navigate = useRouterNavigate();
  return useCallback(
    ((to: To | number, options?: NavigateOptions) =>
      withViewTransition(() => {
        if (typeof to === 'number') navigate(to);
        else navigate(to, options);
      })) as NavigateFunction,
    [navigate]
  );
};

type AnchorProps = ComponentProps<typeof RouterLink>;
type ClickProps = Pick<AnchorProps, 'to' | 'replace' | 'state' | 'target' | 'onClick'>;

const useAnimatedClick = ({ to, replace, state, target, onClick }: ClickProps) => {
  const navigate = useNavigate();
  return (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || target || !isPlainClick(event)) return;
    event.preventDefault();
    navigate(to, { replace, state });
  };
};

/** Drop-in `<Link>` / `<NavLink>` that animate the route swap. */
export const Link = (props: AnchorProps) => {
  const onClick = useAnimatedClick(props);
  return <RouterLink {...props} onClick={onClick} />;
};

export const NavLink = (props: ComponentProps<typeof RouterNavLink>) => {
  const onClick = useAnimatedClick(props);
  return <RouterNavLink {...props} onClick={onClick} />;
};
