// Type definition for a DNS answer (resource record).
// Represents a single answer in the DNS response section.
export type DNSAnswerType = {
    name: string;       // Name of the resource record
    type: number;       // Type of the resource record (e.g., A, NS, MX)
    class: number;      // Class of the resource record (usually IN for Internet)
    ttl: number;        // Time to live (TTL) in seconds
    dataLength: number; // Length of the data field
    data: string;       // Data associated with the resource record (e.g., IP address)
}