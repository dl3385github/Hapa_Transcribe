# Hapa Transcribe: Security & Privacy Document

## Overview

This document outlines the security and privacy measures implemented in Hapa Transcribe to protect user data, ensure secure API interactions, and maintain the privacy principles of the Hapa ecosystem.

## Security Architecture

### Authentication & Authorization

1. **DID-Based Authentication**
   - Leverages Hapa's Decentralized Identifier (DID) system
   - No traditional username/password storage
   - Authentication tokens are securely stored and managed

2. **API Key Protection**
   - Standard OpenAI API keys stored only on the server side
   - No API keys exposed to client applications
   - Ephemeral tokens used for client-side authentication

3. **Access Control**
   - Granular permission system for transcript access
   - User-controlled sharing settings
   - Authorization checks on all API endpoints

### Secure Data Flow

1. **Ephemeral Token Flow**
   - Tokens are valid for 1 minute only
   - Server validates user identity before issuing tokens
   - Tokens have limited scope (transcription only)
   - Implementation follows the three-step process:
     ```
     1. Browser requests ephemeral token from Hapa backend
     2. Backend uses standard API key to mint ephemeral token from OpenAI
     3. Ephemeral token returned to browser for direct WebRTC connection
     ```

2. **WebRTC Security**
   - Encrypted media streams using DTLS-SRTP
   - Secure signaling via authenticated channels
   - ICE protocol for secure connection establishment

3. **End-to-End Encryption**
   - Transcripts encrypted before storage
   - User's DID keys used for encryption
   - Decryption only possible with proper authorization

## Privacy Measures

### Data Minimization

1. **Audio Data Handling**
   - No persistent storage of raw audio
   - Audio processed in real-time and immediately discarded
   - Only the resulting transcript is retained

2. **Transcript Storage**
   - Transcripts stored encrypted in Hyperdrive
   - User-controlled retention policies
   - Option for ephemeral transcripts (auto-deletion)

3. **Metadata Limitations**
   - Minimal session metadata collected
   - Session duration and timestamps stored
   - No tracking of individual user behaviors

### User Control

1. **Opt-in Transcription**
   - Transcription never starts automatically
   - Clear visual indicators when transcription is active
   - One-click ability to stop transcription

2. **Data Ownership**
   - Users maintain ownership of all transcription data
   - Export functionality for data portability
   - Complete data deletion option

3. **Sharing Controls**
   - Fine-grained sharing permissions
   - Ability to revoke access to shared transcripts
   - Audit log of access to shared transcripts

## Compliance

### Regulatory Alignment

1. **GDPR Compliance**
   - Right to access personal data
   - Right to be forgotten (data deletion)
   - Data portability through export options
   - Privacy by design principles implemented

2. **CCPA Compliance**
   - Clear disclosure of data practices
   - Opt-out mechanisms
   - Data deletion on request

### OpenAI API Compliance

1. **Terms of Service**
   - Compliance with OpenAI's usage policies
   - Proper attribution where required
   - Adherence to rate limits and quotas

2. **Data Usage**
   - Regular audit of OpenAI's data retention policies
   - Confirmation that data is not used for model training
   - Transparency with users about API data handling

## Security Implementation Details

### Server-Side Security Measures

```javascript
// Example of secure token generation with proper error handling
const generateEphemeralToken = async (userDid) => {
  try {
    // Validate user DID
    const validatedUser = await didRegistry.validate(userDid);
    if (!validatedUser) {
      throw new AuthenticationError('Invalid DID credentials');
    }
    
    // Generate token with proper scope limitation
    const tokenResponse = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-transcribe',
        // Additional security measures:
        // 1. No voice generation capability
        // 2. Transcription intent only
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    // Log token generation (but not the token itself)
    logger.info(`Generated ephemeral token for user ${userDid.slice(0, 8)}...`);
    
    return {
      token: tokenData.client_secret.value,
      expires_at: tokenData.client_secret.expires_at
    };
  } catch (error) {
    logger.error(`Token generation error: ${error.message}`);
    throw error;
  }
};
```

### Transcript Encryption

```javascript
// Example of transcript encryption before storage
const encryptTranscript = async (transcript, userDid) => {
  try {
    // Get user's public key from DID document
    const didDocument = await didRegistry.resolve(userDid);
    const publicKey = didDocument.publicKey.find(key => key.id.includes('encryption'));
    
    if (!publicKey) {
      throw new Error('No encryption key found in DID document');
    }
    
    // Encrypt transcript with user's public key
    const encryptedData = await encryptionService.encrypt(
      JSON.stringify(transcript),
      publicKey.publicKeyBase58
    );
    
    return {
      encryptedContent: encryptedData.ciphertext,
      metadata: {
        encryptionAlgorithm: 'x25519-xsalsa20-poly1305',
        keyId: publicKey.id,
        timestamp: new Date().toISOString(),
      }
    };
  } catch (error) {
    logger.error(`Encryption error: ${error.message}`);
    throw error;
  }
};
```

## Security Monitoring & Response

### Monitoring Systems

1. **Error Tracking**
   - Aggregated error logs (no PII included)
   - Anomaly detection for unusual access patterns
   - Performance monitoring for service degradation

2. **Security Alerts**
   - Automated alerts for authentication failures
   - Rate limiting violations tracking
   - Unusual usage pattern detection

### Incident Response

1. **Security Incident Process**
   - Defined security incident response team
   - Documented escalation procedures
   - Communication templates for user notification

2. **Recovery Procedures**
   - Backup and restoration protocols
   - Service continuity measures
   - Post-incident analysis and improvement

## Security Recommendations for Users

1. **Best Practices**
   - Keep Hapa client updated to the latest version
   - Review transcript sharing permissions regularly
   - Export important transcripts as backup

2. **Environment Security**
   - Use Hapa Transcribe in private settings
   - Be aware of sensitive information being transcribed
   - Consider ambient noise in shared environments

## Ongoing Security Improvements

1. **Regular Security Reviews**
   - Quarterly security assessments
   - Code reviews focused on security aspects
   - Dependency vulnerability scanning

2. **Future Enhancements**
   - Implementation of additional encryption layers
   - Enhanced audit logging for security events
   - Advanced anomaly detection for potential misuse 