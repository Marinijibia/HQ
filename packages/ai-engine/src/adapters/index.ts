export interface IAdapter<TInput, TOutput> {
  normalize(input: TInput): TOutput;
}
