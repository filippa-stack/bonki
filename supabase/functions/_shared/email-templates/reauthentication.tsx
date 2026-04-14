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

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="sv" dir="ltr">
    <Head />
    <Preview>Din verifieringskod</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>BONKI</Text>
        <Heading style={h1}>Bekräfta din identitet</Heading>
        <Text style={text}>Ange koden nedan för att verifiera dig:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={text}>
          Koden är giltig en kort stund. Om du inte begärde detta kan du
          ignorera det här mailet.
        </Text>
        <Text style={footer}>— bonki</Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: '32px',
  fontWeight: 'bold' as const,
  letterSpacing: '6px',
  color: '#1A1A2E',
  backgroundColor: '#F5F0E8',
  padding: '16px 24px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  margin: '8px 0 28px',
}
const footer = { fontSize: '13px', color: '#999999', margin: '30px 0 0' }
