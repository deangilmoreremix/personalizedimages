import { Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text } from '@react-email/components';

export interface PersonalizedImageEmailProps {
  preview?: string;
  heading: string;
  body: string;
  /** Hosted image URL, or an ESP merge tag such as {{IMAGE_URL}}. Email clients block data: URLs. */
  imageUrl: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  accent?: string;
  footer?: string;
}

/** Responsive, client-safe email with a personalized hero image. */
export default function PersonalizedImageEmail({
  preview,
  heading,
  body,
  imageUrl,
  imageAlt = '',
  ctaLabel,
  ctaUrl,
  accent = '#7c3aed',
  footer
}: PersonalizedImageEmailProps) {
  return (
    <Html lang="en">
      <Head />
      {preview ? <Preview>{preview}</Preview> : null}
      <Body style={{ backgroundColor: '#f4f4f5', margin: 0, padding: '24px 0', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', maxWidth: 600, width: '100%', margin: '0 auto', borderRadius: 12, overflow: 'hidden' }}>
          <Img src={imageUrl} alt={imageAlt} width="600" style={{ width: '100%', maxWidth: 600, height: 'auto', display: 'block' }} />
          <Section style={{ padding: '24px 32px' }}>
            <Heading as="h1" style={{ margin: '0 0 12px', fontSize: 24, lineHeight: '32px', color: '#111827' }}>
              {heading}
            </Heading>
            <Text style={{ margin: '0 0 20px', fontSize: 16, lineHeight: '24px', color: '#374151', whiteSpace: 'pre-line' }}>{body}</Text>
            {ctaLabel && ctaUrl ? (
              <Button href={ctaUrl} style={{ backgroundColor: accent, color: '#ffffff', padding: '12px 24px', borderRadius: 8, fontSize: 16, fontWeight: 600, textDecoration: 'none' }}>
                {ctaLabel}
              </Button>
            ) : null}
          </Section>
          {footer ? (
            <Section style={{ padding: '0 32px 24px' }}>
              <Text style={{ margin: 0, fontSize: 12, lineHeight: '18px', color: '#9ca3af' }}>{footer}</Text>
            </Section>
          ) : null}
        </Container>
      </Body>
    </Html>
  );
}
