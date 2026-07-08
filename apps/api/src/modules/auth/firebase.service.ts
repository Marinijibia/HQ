import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: admin.app.App | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const serviceAccountPath = this.configService.get<string>(
      'FIREBASE_SERVICE_ACCOUNT_PATH',
    );
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const projectId = this.configService.get<string>(
      'FIREBASE_PROJECT_ID',
      'hq-development-project',
    );

    try {
      if (admin.apps.length === 0) {
        if (serviceAccountPath) {
          this.logger.log(
            `Initializing Firebase Admin using service account path: ${serviceAccountPath}`,
          );
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath),
          });
        } else if (privateKey && clientEmail) {
          this.logger.log(
            'Initializing Firebase Admin using inline credentials...',
          );
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              privateKey: privateKey.replace(/\\n/g, '\n'),
              clientEmail,
            }),
          });
        } else {
          this.logger.warn(
            'Firebase credentials not found. Running in Development Mock Mode for auth services...',
          );
          // In mock mode, we bypass actual API connections to firebase servers
        }
      } else {
        this.firebaseApp = admin.app();
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  async verifyIdToken(token: string): Promise<{
    uid: string;
    email: string;
    role: string;
    companyId: string;
  }> {
    if (!this.firebaseApp) {
      // Mock validation logic for local development if credentials aren't present
      if (token === 'development_mock_token_owner') {
        return {
          uid: 'mock-owner-uid',
          email: 'owner@hq.dev',
          role: 'ORGANIZATION_OWNER',
          companyId: 'mock-company-uuid',
        };
      }
      if (token.startsWith('mock_token_')) {
        const role = token.replace('mock_token_', '').toUpperCase();
        return {
          uid: `mock-uid-${role}`,
          email: `${role.toLowerCase()}@hq.dev`,
          role,
          companyId: 'mock-company-uuid',
        };
      }
      throw new Error('Firebase SDK not initialized and invalid mock token');
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: (decodedToken.role as string) || 'MEMBER',
      companyId: (decodedToken.companyId as string) || '',
    };
  }

  async setCustomUserClaims(
    uid: string,
    claims: { role: string; companyId: string },
  ) {
    if (!this.firebaseApp) {
      this.logger.log(
        `Mock: setting claims for ${uid}: ${JSON.stringify(claims)}`,
      );
      return;
    }
    await admin.auth().setCustomUserClaims(uid, claims);
  }
}
