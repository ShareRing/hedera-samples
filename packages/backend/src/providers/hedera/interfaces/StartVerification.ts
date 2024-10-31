export interface StartVerification {
  $startVerification(sessionId: string, attributes: any): Promise<void>;
}
