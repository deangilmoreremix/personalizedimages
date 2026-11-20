import { describe, it, expect } from 'vitest';
import { renderPersonalizedEmail, renderPersonalizedEmailText } from '../renderEmail';

const props = {
  preview: 'Your personalized image',
  heading: 'Hi {{FIRSTNAME}}, this one is for you',
  body: 'Line one\nLine two',
  imageUrl: '{{IMAGE_URL}}',
  imageAlt: 'Personalized for you',
  ctaLabel: 'View it',
  ctaUrl: 'https://example.com/view'
};

describe('PersonalizedImageEmail', () => {
  it('renders client-safe HTML with merge tags preserved', async () => {
    const html = await renderPersonalizedEmail(props);
    expect(html).toContain('<!DOCTYPE html');
    expect(html).toContain('Hi {{FIRSTNAME}}, this one is for you');
    expect(html).toContain('src="{{IMAGE_URL}}"');
    expect(html).toContain('href="https://example.com/view"');
    expect(html).toContain('Your personalized image'); // preheader
    expect(html).toContain('style='); // inline styles
    expect(html).not.toContain('<script');
  });

  it('omits the button when no CTA is given and escapes user text', async () => {
    const html = await renderPersonalizedEmail({ ...props, ctaLabel: undefined, heading: '<b>x</b> & y' });
    expect(html).not.toContain('View it');
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;');
  });

  it('renders a plain-text alternative', async () => {
    const text = await renderPersonalizedEmailText({ ...props, heading: 'Hi {{first_name}}, this one is for you' });
    expect(text).toContain('Hi {{first_name}}, this one is for you'); // merge tag case preserved
    expect(text).not.toContain('<');
  });
});
