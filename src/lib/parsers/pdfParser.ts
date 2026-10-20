/**
 * Multi-format Document Parser for Appointmentlyy SDR
 * Supports .pdf, .docx, .md, and plain text extraction.
 */

export interface ParsedDocumentResult {
  text: string;
  wordCount: number;
  metadata: {
    title?: string;
    fileType: 'pdf' | 'docx' | 'md' | 'txt';
    charCount: number;
  };
}

export class DocumentParser {
  /**
   * Extracts clean text content from an ArrayBuffer and file type.
   */
  public static async parseBuffer(
    buffer: ArrayBuffer,
    fileName: string,
    fileTypeHint?: string
  ): Promise<ParsedDocumentResult> {
    const ext = fileName.split('.').pop()?.toLowerCase() || fileTypeHint || 'txt';
    let extractedText = '';
    const resolvedType = (['pdf', 'docx', 'md', 'txt'].includes(ext) ? ext : 'txt') as 'pdf' | 'docx' | 'md' | 'txt';

    if (resolvedType === 'md' || resolvedType === 'txt') {
      const decoder = new TextDecoder('utf-8');
      extractedText = decoder.decode(buffer);
    } else if (resolvedType === 'docx') {
      // For Word documents, extract XML text nodes or decode UTF-8 string fragments
      extractedText = this.extractTextFromDocx(buffer);
    } else if (resolvedType === 'pdf') {
      // Extract text content from raw PDF streams
      extractedText = this.extractTextFromPdf(buffer);
    }

    // Clean up excessive whitespace
    const cleanText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const words = cleanText.length > 0 ? cleanText.split(/\s+/).length : 0;

    return {
      text: cleanText,
      wordCount: words,
      metadata: {
        title: fileName.replace(/\.[^/.]+$/, ''),
        fileType: resolvedType,
        charCount: cleanText.length,
      },
    };
  }

  /**
   * Fast robust text stream scanner for DOCX archives
   */
  private static extractTextFromDocx(buffer: ArrayBuffer): string {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const content = decoder.decode(buffer);
    
    // Scan for Word document XML body text <w:t>...</w:t>
    const matches = content.match(/<w:t(?:\s+[^>]*)?>([\s\S]*?)<\/w:t>/gi);
    if (matches && matches.length > 0) {
      return matches
        .map((m) => m.replace(/<[^>]+>/g, ''))
        .join(' ');
    }

    // Fallback: strip binary non-printable control characters
    return content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
  }

  /**
   * Text scanner for standard PDF stream structures
   */
  private static extractTextFromPdf(buffer: ArrayBuffer): string {
    const decoder = new TextDecoder('latin1');
    const content = decoder.decode(buffer);

    const textChunks: string[] = [];
    // Match standard PDF literal text parenthesized blocks: (Text string) Tj / '
    const tjMatches = content.match(/\(([^()]*)\)\s*(?:Tj|'|")/g);
    if (tjMatches && tjMatches.length > 0) {
      for (const m of tjMatches) {
        const clean = m.replace(/^[^(]*\(/, '').replace(/\)[^)]*$/, '');
        if (clean.length > 1) {
          textChunks.push(clean);
        }
      }
      return textChunks.join(' ');
    }

    // Match text within BT ... ET blocks
    const btMatches = content.match(/BT[\s\S]*?ET/g);
    if (btMatches && btMatches.length > 0) {
      for (const block of btMatches) {
        const literals = block.match(/\((.*?)\)/g);
        if (literals) {
          literals.forEach(l => textChunks.push(l.slice(1, -1)));
        }
      }
      return textChunks.join(' ');
    }

    // Strip unprintable bytes and retain ASCII runs
    return content.replace(/[^\x20-\x7E\t\n\r]/g, ' ');
  }
}
