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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="sv" dir="ltr">
    <Head />
    <Preview>Du har blivit inbjuden till {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>BONKI</Text>
        <Heading style={h1}>Du har blivit inbjuden</Heading>
        <Text style={text}>
          Du har blivit inbjuden att gå med i {siteName}. Klicka på knappen nedan
          för att acceptera inbjudan och skapa ditt konto.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Acceptera inbjudan
        </Button>
        <Text style={text}>
          Om du inte förväntade dig den här inbjudan kan du ignorera det här mailet.
        </Text>
        <Text style={footer}>— {siteName}</Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

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
