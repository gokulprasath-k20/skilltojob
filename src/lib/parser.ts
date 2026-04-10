import { PDFParse } from 'pdf-parse';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({
      data: buffer,
    });
    const result = await parser.getText();
    return result.text;
  } catch (err) {
    console.error('PDF Parse Error:', err);
    throw new Error('Failed to parse PDF file');
  }
}

export function extractJSON(text: string): any {
  try {
    // Try to find the first '{' and last '}'
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    
    if (start !== -1 && end !== -1 && end > start) {
      const jsonStr = text.substring(start, end + 1);
      return JSON.parse(jsonStr);
    }
    
    return JSON.parse(text);
  } catch (err) {
    console.error('JSON Extraction Error:', err, '\nRaw Text:', text);
    throw new Error('Failed to extract valid JSON from AI response');
  }
}
