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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  token: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  token,
}: SignupEmailProps) => (
  <Html lang="sv" dir="ltr">
    <Head />
    <Preview>Din bekräftelsekod för Bonki: {token}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Välkommen till Bonki</Heading>
        <Text style={text}>
          Tack för att du registrerade dig! Ange koden nedan i appen för att bekräfta din e-postadress ({recipient}).
        </Text>
        <Text style={code}>{token}</Text>
        <Text style={footer}>
          Om du inte skapade ett konto kan du ignorera det här mejlet.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
