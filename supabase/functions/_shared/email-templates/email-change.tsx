/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="sv" dir="ltr">
    <Head />
    <Preview>Bekräfta din nya e-postadress för {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>BONKI</Text>
        <Heading style={h1}>Bekräfta ny e-postadress</Heading>
        <Text style={text}>
          Du har begärt att byta e-postadress för {siteName} från{' '}
          <Link href={`mailto:${email}`} style={link}>{email}</Link>{' '}
          till{' '}
          <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Bekräfta ändring
        </Button>
        <Text style={text}>
          Om du inte begärde detta, vänligen säkra ditt konto omedelbart.
        </Text>
        <Text style={footer}>— {siteName}</Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: "Georgia, 'Times New Roman', serif" }
const container = { padding: '32px 28px' }
const brand = {
  fontSize: '13px',
  fontWeight: 'bold' as const,
  letterSpacing: '3px',
  color: '#E85D2C',
  margin: '0 0 24px',
}
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#1A1A2E',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: '#4A4A5A',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const link = { color: '#1A1A2E', textDecoration: 'underline' }
const button = {
  backgroundColor: '#E85D2C',
  color: '#ffffff',
  fontSize: '15px',
  fontFamily: "Georgia, 'Times New Roman', serif",
  borderRadius: '8px',
  padding: '14px 24px',
  textDecoration: 'none',
  margin: '0 0 24px',
}
const footer = { fontSize: '13px', color: '#999999', margin: '30px 0 0' }
