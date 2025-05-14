import { encodeDomainName } from "../lib/utils/common.utils"; // Import function to encode domain names
import type { DNSAnswerType } from "../types/answers"; // Import DNSAnswerType type

export class DNSAnswer { // DNSAnswer class for constructing DNS answer records
    private answerBuffer: Buffer = Buffer.alloc(0); // Buffer to hold the answer data
    constructor() {} // Empty constructor

    /**
     * Writes the DNS answer with the provided Buffer Data.
     * @param {DNSAnswerType} data - The answer data
     * @param {Map<string, number>} nameMap - Optional map for domain name compression
     * @param {number} currentOffset - Current position in the overall message for compression
     * @returns {number} The new offset after writing the answer
     */
    public writeAnswer(
        data: DNSAnswerType, // DNS answer data
        nameMap: Map<string, number> = new Map(), // Name compression map
        currentOffset: number // Current offset in the DNS message
    ): number {
        const { buffer: name, newOffset } = encodeDomainName( // Encode the domain name with compression
            data.name,
            nameMap,
            currentOffset
        );
        const type = data.type; // Resource record type
        const classType = data.class; // Resource record class
        const ttl = data.ttl; // Time to live
        const rdlength = data.length; // Length of RDATA field
        const rdata = Buffer.from( // Convert data (e.g., IP address) to buffer
            data.data.split(".").map((octet) => parseInt(octet))
        );
        this.answerBuffer = Buffer.alloc(name.length + 10 + rdlength); // Allocate buffer for answer
        name.copy(this.answerBuffer, 0); // Copy encoded name to buffer
        this.answerBuffer.writeUInt16BE(type, name.length); // Write type field
        this.answerBuffer.writeUInt16BE(classType, name.length + 2); // Write class field
        this.answerBuffer.writeUInt32BE(ttl, name.length + 4); // Write TTL field
        this.answerBuffer.writeUInt16BE(rdlength, name.length + 8); // Write RDLENGTH field
        rdata.copy(this.answerBuffer, name.length + 10); // Write RDATA field
        return this.answerBuffer.length; // Return total length of answer buffer
    }

    /**
     * Returns the answer buffer as a Buffer object.
     * @returns {Buffer} The answer buffer.
     */
    public getAnswerBuffer(): Buffer { // Getter for the answer buffer
        return this.answerBuffer;
    }
}

export default DNSAnswer; // Export DNSAnswer class as default