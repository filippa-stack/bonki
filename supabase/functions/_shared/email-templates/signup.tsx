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
  confirmationUrl: string
  token?: string
}

export const SignupEmail = ({
  siteName,
  token,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="sv" dir="ltr">
    <Head />
    <Preview>Din verifieringskod för {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Välkommen till BONKI</Heading>
        <Text style={text}>
          Ange koden nedan för att verifiera din e-postadress och komma igång.
        </Text>
        {token ? (
          <Text style={codeStyle}>{token}</Text>
        ) : (
          <Text style={text}>
            <a href={confirmationUrl} style={linkStyle}>Klicka här för att verifiera</a>
          </Text>
        )}
        <Text style={footer}>
          Om du inte skapade ett konto kan du ignorera det här mailet.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif' }
const container = { padding: '32px 28px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#1A1A2E',
  margin: '0 0 20px',
  fontFamily: 'Georgia, serif',
}
const text = {
  fontSize: '15px',
  color: '#555555',
  lineHeight: '1.6',
  margin: '0 0 24px',
  fontFamily: 'Georgia, serif',
}
const codeStyle = {
  fontFamily: 'Georgia, serif',
  fontSize: '32px',
  fontWeight: 'bold' as const,
  color: '#1A1A2E',
  backgroundColor: '#F5F0E8',
  padding: '16px 24px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  letterSpacing: '6px',
  margin: '0 0 28px',
}
const linkStyle = {
  color: '#E85D2C',
  textDecoration: 'underline',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', fontFamily: 'Georgia, serif' }
