import { RemixBrowser } from '@remix-run/react';
import { startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import './styles/index.scss';

startTransition(() => {
  hydrateRoot(document, <RemixBrowser />);
});
