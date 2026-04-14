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
  token?: string
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
        <Heading style={h1}>Logga in på BONKI</Heading>
        <Text style={text}>
          Ange koden nedan för att logga in:
        </Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={text}>
          Koden är giltig i några minuter. Om du inte begärde detta kan du ignorera meddelandet.
        </Text>
        <Text style={footer}>© BONKI</Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

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
const codeStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '32px',
  fontWeight: 'bold' as const,
  color: '#1A1A2E',
  letterSpacing: '6px',
  margin: '8px 0 28px',
  padding: '16px 24px',
  backgroundColor: '#F5F0E8',
  borderRadius: '8px',
  textAlign: 'center' as const,
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
