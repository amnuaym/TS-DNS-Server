//
// This file contains utility functions to parse DNS answers from a buffer.
// This code support only mockup answer with A record type and point to Google DNS IP 8.8.8.8 only.
//


import type { DNSAnswerType } from "../../types/answers"; // Import DNSAnswerType type
import { parseDomainNameFromBuffer } from "./common.utils"; // Import function to parse domain names from buffer

export const parseDNSAnswer = ( // Exported function to parse a DNS answer from a buffer
    buffer: Buffer, // Buffer containing DNS message
    offset: number, // Offset in the buffer where the answer starts
    name?: string // Optional name for the answer
): DNSAnswerType => {
    const answer: DNSAnswerType = { // Initialize answer object with default values
        name: name || "", // Use provided name or empty string
        type: 1, // Default type (A record)
        class: 1, // Default class (IN)
        ttl: 60, // Default TTL
        length: 4, // Default data length (IPv4 address)
        data: "8.8.8.8", // Default data (Google DNS IP)
    };
    // answer.name = parseDomainNameFromBuffer(buffer).parsedName; // Parse domain name from buffer (commented out)
    // answer.type = buffer.readUint16BE(offset); // Read type from buffer (commented out)
    // answer.class = buffer.readUint16BE(offset + 2); // Read class from buffer (commented out)
    // answer.ttl = buffer.readUInt32BE(offset + 4); // Read TTL from buffer (commented out)
    // answer.length = buffer.readUInt16BE(offset + 8); // Read data length from buffer (commented out)
    /**
     * For answer.data => It can vary based on the type of answer
     * To parse the data, we need to check the type of answer
     * For example, 
     * 
     * if the type is A, we need to parse the data as an IP address
     * If the type is CNAME, we need to parse the data as a domain name
     * If the type is MX, we need to parse the data as a mail exchange
     * If the type is NS, we need to parse the data as a name server
     * If the type is TXT, we need to parse the data as a text record
     * If the type is AAAA, we need to parse the data as an IPv6 address
     * To do this, in future, we can create a function that takes the type of answer as an input and then in that function we can parse the answer data based on the type provided (possibly using a switch case)
     * For now, we will just convert the data to a string (A record)
     */
    return answer; // Return the parsed answer object
};
