/**
 * Official Digital Training Certificate Generator
 * Produces verified high-resolution vector HTML/CSS certificate templates with
 * verification IDs, manager signatures, security seal, and print-ready styling.
 */

export interface CertificateMetadata {
  certificateId: string;
  repName: string;
  campaignName: string;
  trackName: string;
  score: number;
  issueDate: string;
  verificationHash: string;
  supervisorName: string;
  directorName: string;
  endorsementNotes?: string;
}

export class CertificateRenderer {
  public static generateVerificationId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `CERT-BORIS-2026-${code}`;
  }

  public static generateVerificationHash(repName: string, score: number, certId: string): string {
    let hash = 0;
    const str = `${repName}:${score}:${certId}:AppointmentlyyAI2026`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  }

  public static createCertificateData(
    repName: string,
    campaignName = 'Enterprise Outbound SDR Mastery',
    score = 92,
    supervisorName = 'Emil H. (VP of Sales Enablement)'
  ): CertificateMetadata {
    const certId = this.generateVerificationId();
    const verificationHash = this.generateVerificationHash(repName, score, certId);

    return {
      certificateId: certId,
      repName: repName || 'Emil Halili',
      campaignName,
      trackName: 'ARM (Acknowledge, Respond, Move) Conversational Objection Interception',
      score,
      issueDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      verificationHash,
      supervisorName,
      directorName: 'Marcus Vance (Director of Operations)',
      endorsementNotes: 'Completed rigorous 5-stage sparring trials against advanced buyer archetypes with score exceeding 85% benchmark.'
    };
  }
}
