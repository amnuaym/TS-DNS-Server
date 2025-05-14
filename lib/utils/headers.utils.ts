import type { DNSHeaderType } from "../../types/headers"; // Import DNSHeaderType type

//Get the header buffer from the DNS packet
export const parseDNSHeader = (buffer: Buffer): DNSHeaderType => { // Function to parse DNS header from buffer
    const parsedHeaderData: DNSHeaderType = { // Create parsed header object
        pid: buffer.readUInt16BE(0), // Read transaction ID (2 bytes)
        qr: (buffer.readUInt16BE(2) >> 15) & 0x1, // Extract QR flag (1 bit)
        opcode: (buffer.readUInt16BE(2) >> 11) & 0b00001111, // Extract OPCODE (4 bits)
        aa: (buffer.readUInt16BE(2) >> 10) & 0x1, // Extract AA flag (1 bit)
        tc: (buffer.readUInt16BE(2) >> 9) & 0x1, // Extract TC flag (1 bit)
        rd: (buffer.readUInt16BE(2) >> 8) & 0x1, // Extract RD flag (1 bit)
        ra: (buffer.readUInt16BE(2) >> 7) & 0x1, // Extract RA flag (1 bit)
        z: (buffer.readUInt16BE(2) >> 4) & 0b00000111, // Extract Z flag (3 bits)
        // ad: (buffer.readUInt16BE(2) >> 3) & 0x1, // Extract AD flag (1 bit)
        // Note: The AD flag is not used in this context, but it's included for completeness    
        rcode: buffer.readUInt16BE(2) & 0b00001111, // Extract RCODE (4 bits)
        qdcount: buffer.readUInt16BE(4), // Read QDCOUNT (number of questions)
        ancount: buffer.readUInt16BE(6), // Read ANCOUNT (number of answers)
        nscount: buffer.readUInt16BE(8), // Read NSCOUNT (number of authority records)
        arcount: buffer.readUInt16BE(10), // Read ARCOUNT (number of additional records)
    }; // End of parsedHeaderData object
    return parsedHeaderData; // Return parsed header object
}; // End of parseDNSHeader function

export const parseDNSHeaderSelective = (buffer: Buffer): DNSHeaderType => { // Function to parse DNS header with selective/default values
    const pid = buffer.readUInt16BE(0); // Read transaction ID
    const qr = 1; // Set QR flag to 1 (response)
    const opcode = (buffer.readUInt16BE(2) >> 11) & 0b00001111; // Extract OPCODE
    const aa = 0; // Set AA flag to 0
    const tc = 0; // Set TC flag to 0
    const rd = (buffer.readUInt16BE(2) >> 8) & 0x1; // Extract RD flag
    const ra = 0; // Set RA flag to 0
    const z = 0; // Set Z flag to 0
    // const ad = 0; // Set AD flag to 0
    const rcode = opcode === 0 ? 0 : 4; // Set RCODE (0 if standard query, else 4)
    const qdcount = 1; // Set QDCOUNT to 1
    const ancount = 1; // Set ANCOUNT to 1
    const nscount = 0; // Set NSCOUNT to 0
    const arcount = 0; // Set ARCOUNT to 0
    const parsedHeaderData: DNSHeaderType = { // Create parsed header object
        pid, // Corrected from id to pid
        qr, // QR flag
        opcode, // OPCODE
        aa, // AA flag
        tc, // TC flag
        rd, // RD flag
        ra, // RA flag
        z, // Z flag
        // ad, // AD flag
        rcode, // RCODE
        qdcount, // QDCOUNT
        ancount, // ANCOUNT
        nscount, // NSCOUNT
        arcount, // ARCOUNT
    }; // End of parsedHeaderData object
    return parsedHeaderData; // Return parsed header object
}; // End of parseDNSHeaderSelective function
