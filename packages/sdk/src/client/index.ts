import { SdkConfig } from '../types';

export class HqClient {
  constructor(private readonly config: SdkConfig) {}

  getBaseUrl(): string {
    return this.config.baseUrl;
  }
}
