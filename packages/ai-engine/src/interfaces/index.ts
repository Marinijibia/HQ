import { AiExecutionOptions, AiExecutionResult } from '../types';

export interface IAiProvider {
  name: string;
  isAvailable(): boolean;
  complete(options: AiExecutionOptions): Promise<AiExecutionResult>;
}

export interface IAiEngineService {
  execute(options: AiExecutionOptions): Promise<AiExecutionResult>;
}
