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
  confirmationUrl: string
  token: string
}

export const MagicLinkEmail = ({
  siteName,
  token,
}: MagicLinkEmailProps) => (
  <Html lang="sv" dir="ltr">
    <Head />
    <Preview>Din inloggningskod för {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Din inloggningskod</Heading>
        <Text style={text}>
          Ange koden nedan för att logga in på {siteName}:
        </Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={text}>Koden är giltig i 15 minuter.</Text>
        <Text style={footer}>
          Om du inte begärde den här koden kan du ignorera det här mailet.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif' }
const container = { padding: '20px 25px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#1A1A2E',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#1A1A2E',
  backgroundColor: '#F5F0E8',
  padding: '12px 20px',
  borderRadius: '8px',
  display: 'inline-block' as const,
  margin: '0 0 25px',
  letterSpacing: '4px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
