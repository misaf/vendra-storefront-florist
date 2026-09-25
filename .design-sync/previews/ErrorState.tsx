import { Button, ErrorState } from "vendra-storefront-florist";

export const WithRetry = () => (
  <ErrorState
    className="max-w-lg"
    message="We couldn't load the catalogue. Check your connection and try again."
    retryLabel="Try again"
    onRetry={() => {}}
  />
);

export const Retrying = () => (
  <ErrorState
    className="max-w-lg"
    message="We couldn't load the catalogue. Check your connection and try again."
    retryLabel="Try again"
    retryingLabel="Retrying…"
    isRetrying
    onRetry={() => {}}
  />
);

export const WithAction = () => (
  <ErrorState
    className="max-w-lg"
    message="This bouquet is no longer available."
    action={<Button>Browse similar flowers</Button>}
  />
);

export const MessageOnly = () => (
  <ErrorState className="max-w-lg" message="Delivery isn't available to this postcode yet." />
);
