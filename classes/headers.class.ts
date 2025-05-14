import type { DNSHeaderType } from "../types/headers"; // Import DNSHeaderType type

export class DNSHeader { // DNSHeader class for constructing DNS header records
    private headerBuffer: Uint16Array = new Uint16Array(6); // Buffer to hold the header data (6 fields, 2 bytes each)
    constructor() {} // Empty constructor

    /**
     * Writes the DNS header with the provided Buffer Data.
     * @param {DNSHeaderType}
     * @returns {void}
     */
    public writeHeader(data: DNSHeaderType): void { // Method to write header fields into buffer
        const flags =
            (data.qr << 15) | // Set QR flag (1 bit)
            (data.opcode << 11) | // Set OPCODE (4 bits)
            (data.aa << 10) | // Set AA flag (1 bit)
            (data.tc << 9) | // Set TC flag (1 bit)
            (data.rd << 8) | // Set RD flag (1 bit)
            (data.ra << 7) | // Set RA flag (1 bit)
            (data.z << 4) | // Set Z flag (3 bits, must be zero)
            data.rcode; // Set RCODE (4 bits)
        this.headerBuffer.set([
            data.pid, // Transaction ID
            flags, // Flags field
            data.qdcount, // Number of questions
            data.ancount, // Number of answers
            data.nscount, // Number of authority records
            data.arcount, // Number of additional records
        ]);
    }

    /**
     * Returns the header buffer as a Buffer object.
     * @returns {Buffer} The header buffer.
     */
    public getHeaderBuffer(): Buffer { // Method to get the header buffer as a Node.js Buffer
        const buffer = Buffer.alloc(12); // Allocate 12 bytes for DNS header
        this.headerBuffer.forEach((value, index) => { // Write each 16-bit value to buffer
            buffer.writeUInt16BE(value, index * 2); // Write value in big-endian order
        });
        return buffer; // Return the buffer
    }
}
