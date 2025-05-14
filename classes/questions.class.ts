import type { QuestionType } from "../types/questions"; // Import QuestionType type
import { encodeDomainName } from "../lib/utils/common.utils"; // Import function to encode domain names

export class DNSQuestion { // DNSQuestion class for constructing DNS question records
    private questionBuffer: Buffer = Buffer.alloc(0); // Buffer to hold the question data
    constructor() {} // Empty constructor

    /**
     * Writes the DNS Question with the provided Buffer Data.
     * @param {QuestionType} question - The question object containing the name, type, and class.
     * @param {Map<string, number>} nameMap - Optional map for domain name compression
     * @returns {number} The new offset after writing the question
     */
    public writeQuestion(
        question: QuestionType, // DNS question data
        nameMap: Map<string, number> = new Map(), // Name compression map
        currentPosition: number // Current offset in the DNS message
    ): number {
        // Use the enhanced encodeDomainName function with compression support
        const { buffer: encodedName, newOffset } = encodeDomainName(
            question.name,
            nameMap,
            currentPosition
        );
        // Allocate buffer: encodedName length + 2 bytes for type + 2 for class
        this.questionBuffer = Buffer.alloc(encodedName.length + 4);
        // Copy the compressed domain name
        encodedName.copy(this.questionBuffer, 0);
        // Write type (2 bytes)
        this.questionBuffer.writeUInt16BE(question.type, encodedName.length);
        // Write class (2 bytes)
        this.questionBuffer.writeUInt16BE(question.class, encodedName.length + 2);
        return this.questionBuffer.length; // Return the new offset after writing the question
    }

    /**
     * Returns the question buffer as a Buffer object.
     * @returns {Buffer} The question buffer.
     */
    public getQuestionBuffer(): Buffer { // Getter for the question buffer
        return this.questionBuffer;
    }
}
