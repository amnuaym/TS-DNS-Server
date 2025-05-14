// questions.utils.ts - with compression support // File description
import { parseDomainNameFromBuffer } from "./common.utils"; // Import domain name parser
import type { QuestionType } from "../../types/questions"; // Import QuestionType type
import { start } from "repl"; // Import start from repl (not used)
/**
 * Parses a DNS Question section from a buffer with compression support // JSDoc description
 * @param {Buffer} buffer - The buffer containing the question // JSDoc param
 * @param {Buffer} originalBuffer - Original message buffer for compression references // JSDoc param
 * @returns An object with parsed question and bytes used // JSDoc return
 */
export function parseDNSQuestion( // Exported function to parse DNS question
    buffer: Buffer, // Buffer containing the question
    startOffset: number // Offset to start parsing
): { // Return type annotation
    name: string; // Domain name
    type: number; // Question type
    class: number; // Question class
    bytesUsed: number; // Bytes used in parsing
} {
    // Parse the domain name with compression support
    const { parsedName, offset } = parseDomainNameFromBuffer(buffer, startOffset); // Parse domain name and get new offset
    // Read question type (2 bytes)
    const type = buffer.readUInt16BE(offset); // Read type from buffer
    // Read question class (2 bytes)
    const qClass = buffer.readUInt16BE(offset + 2); // Read class from buffer
    // Total bytes used = domain name + 2 bytes type + 2 bytes class
    return { // Return parsed question object
        name: parsedName, // Parsed domain name
        type, // Parsed type
        class: qClass, // Parsed class
        bytesUsed: offset + 4, // Total bytes used
    };
}