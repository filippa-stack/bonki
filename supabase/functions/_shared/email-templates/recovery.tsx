/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="sv" dir="ltr">
    <Head />
    <Preview>Återställ ditt lösenord för {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>BONKI</Text>
        <Heading style={h1}>Återställ ditt lösenord</Heading>
        <Text style={text}>
          Vi fick en förfrågan om att återställa lösenordet för ditt konto på {siteName}.
          Klicka på knappen nedan för att välja ett nytt lösenord.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Återställ lösenord
        </Button>
        <Text style={text}>
          Om du inte begärde detta kan du ignorera det här mailet. Ditt lösenord ändras inte.
        </Text>
        <Text style={footer}>— {siteName}</Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
