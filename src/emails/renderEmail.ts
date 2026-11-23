import { createElement } from 'react';
import { render } from '@react-email/render';
import PersonalizedImageEmail, { type PersonalizedImageEmailProps } from './PersonalizedImageEmail';

/** Render the email to HTML (inline styles, table layout, client-safe). */
export function renderPersonalizedEmail(props: PersonalizedImageEmailProps): Promise<string> {
  return render(createElement(PersonalizedImageEmail, props));
}

/** Plain-text alternative for multipart emails. */
export function renderPersonalizedEmailText(props: PersonalizedImageEmailProps): Promise<string> {
  return render(createElement(PersonalizedImageEmail, props), {
    plainText: true,
    // Don't upper-case headings: it would corrupt lowercase ESP merge tags like {{first_name}}.
    htmlToTextOptions: {
      selectors: [
        { selector: 'h1', options: { uppercase: false } },
        { selector: 'img', format: 'skip' },
        { selector: '#__react-email-preview', format: 'skip' }
      ]
    }
  });
}
