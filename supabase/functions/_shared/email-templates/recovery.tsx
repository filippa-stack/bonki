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
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="sv" dir="ltr">
    <Head />
    <Preview>Återställ ditt lösenord för BONKI</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Återställ lösenord</Heading>
        <Text style={text}>
          Vi fick en begäran om att återställa ditt lösenord. Klicka på knappen nedan för att välja ett nytt lösenord.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Återställ lösenord
        </Button>
        <Text style={text}>
          Om du inte begärde detta kan du ignorera meddelandet. Ditt lösenord ändras inte.
        </Text>
        <Text style={footer}>© BONKI</Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, "Times New Roman", serif' }
const container = { padding: '32px 28px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#1A1A2E',
  margin: '0 0 24px',
  fontFamily: 'Georgia, "Times New Roman", serif',
}
const text = {
  fontSize: '15px',
  color: '#55575d',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const button = {
  backgroundColor: '#E85D2C',
  color: '#ffffff',
  fontSize: '15px',
  fontFamily: 'Georgia, "Times New Roman", serif',
  borderRadius: '8px',
  padding: '14px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
