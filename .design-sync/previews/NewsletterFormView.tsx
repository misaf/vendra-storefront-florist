import { NewsletterFormView } from "vendra-storefront-florist";

const noSubmit = (e: { preventDefault: () => void }) => e.preventDefault();

export const Idle = () => (
  <div className="max-w-xl">
    <NewsletterFormView onSubmit={noSubmit} />
  </div>
);

export const InvalidEmail = () => (
  <div className="max-w-xl">
    <NewsletterFormView
      onSubmit={noSubmit}
      inputProps={{ defaultValue: "rose@" }}
      fieldError="Please enter a valid email address."
    />
  </div>
);

export const Submitting = () => (
  <div className="max-w-xl">
    <NewsletterFormView status="submitting" onSubmit={noSubmit} />
  </div>
);

export const Submitted = () => (
  <div className="max-w-xl">
    <NewsletterFormView status="submitted" onSubmit={noSubmit} />
  </div>
);
