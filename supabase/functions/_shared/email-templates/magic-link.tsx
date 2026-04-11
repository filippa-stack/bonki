/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  token: string
}

export const MagicLinkEmail = ({
  siteName,
  token,
}: MagicLinkEmailProps) => (
  <Html lang="sv" dir="ltr">
    <Head />
    <Preview>Din inloggningskod för Bonki: {token}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Din inloggningskod</Heading>
        <Text style={text}>
          Ange koden nedan i appen för att logga in på Bonki.
        </Text>
        <Text style={code}>{token}</Text>
        <Text style={text}>
          Koden gäller i 10 minuter. Använd den inte? Ignorera det här mejlet.
        </Text>
        <Text style={footer}>
          Om du inte begärde den här koden kan du ignorera det här mejlet.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '32px 28px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#1A1A2E',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#6B5E52',
  lineHeight: '1.6',
  margin: '0 0 28px',
}
const code = {
  fontSize: '36px',
  fontWeight: 'bold' as const,
  color: '#1A1A2E',
  letterSpacing: '8px',
  textAlign: 'center' as const,
  padding: '20px 0',
  margin: '0 0 28px',
  backgroundColor: '#F5F0E8',
  borderRadius: '12px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
