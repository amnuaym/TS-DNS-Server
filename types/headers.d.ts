// Response codes for DNS messages as defined by RFCs.
// Each code represents a possible outcome of a DNS query.
enum RCODE {
    NOERROR = 0,    // No error condition
    FORMERR = 1,    // Format error - The name server was unable to interpret the query
    SERVFAIL = 2,   // Server failure - The name server was unable to process this query due to a problem with the name server
    NXDOMAIN = 3,   // Non-Existent Domain - The domain name referenced in the query does not exist
    NOTIMP = 4,     // Not Implemented - The name server does not support the requested kind of query
    REFUSED = 5,    // Refused - The name server refuses to perform the specified operation
    YXDOMAIN = 6,   // Name Exists when it should not
    YXRRSET = 7,    // RR Set Exists when it should not
    NXRRSET = 8,    // RR Set that should exist does not
    NOTAUTH = 9,    // Server Not Authoritative for zone
    NOTZONE = 10,   // Name not contained in zone
    BADVERS = 16,   // Bad OPT Version or TSIG Signature Failure
    BADSIG = 16,    // TSIG Signature Failure (same value as BADVERS)
    BADKEY = 17,    // Key not recognized
    BADTIME = 18,   // Signature out of time window
    BADMODE = 19,   // Bad TKEY Mode
    BADNAME = 20,   // Duplicate key name
    BADALG = 21,    // Algorithm not supported
    BADTRUNC = 22,  // Bad Truncation
    BADCOOKIE = 23, // Bad/missing server cookie
    BADOPT = 24,    // Bad OPT Version
    BADTSIG = 25,   // TSIG Error
    BADTKEY = 26,   // TKEY Error
}

// Operation codes for DNS messages.
// Specifies the kind of query in the message.
enum OPCODE {
    QUERY = 0,      // Standard query
    IQUERY = 1,     // Inverse query (obsolete)
    STATUS = 2,     // Server status request
    NOTIFY = 4,     // Notify (used for zone transfers)
    UPDATE = 5,     // Dynamic update message
    RESERVED = 6,   // Reserved for future use
}

// Query types for DNS questions.
// Specifies the type of resource record being requested.
enum QTYPE {
    A = 1,          // IPv4 address record
    NS = 2,         // Name server record
    MD = 3,         // Mail destination (obsolete)
    MF = 4,         // Mail forwarder (obsolete)
    CNAME = 5,      // Canonical name record
    SOA = 6,        // Start of authority record
    MB = 7,         // Mailbox domain name (experimental)
    MG = 8,         // Mail group member (experimental)
    MR = 9,         // Mail rename domain name (experimental)
    NULL = 10,      // Null RR (experimental)
    WKS = 11,       // Well known service description (obsolete)
    PTR = 12,       // Domain name pointer
    HINFO = 13,     // Host information
    MINFO = 14,     // Mailbox or mail list information
    MX = 15,        // Mail exchange record
    TXT = 16,       // Text record
}

// Type definition for a DNS message header.
// Represents the structure of the DNS header section.
export type DNSHeaderType = {
    pid: number;         // Identifier assigned by the program that generates any kind of query
    qr: boolean;        // Query/Response flag (true if response)
    opcode: OPCODE;     // Kind of query
    aa: boolean;        // Authoritative Answer flag
    tc: boolean;        // Truncation flag
    rd: boolean;        // Recursion Desired flag
    ra: boolean;        // Recursion Available flag
    z: boolean;         // Reserved for future use (must be zero)
    // ad: boolean;        // Authentic Data flag (DNSSEC)
    rcode: RCODE;       // Response code
    qdcount: number;    // Number of entries in the question section
    ancount: number;    // Number of resource records in the answer section
    nscount: number;    // Number of name server resource records in the authority records section
    arcount: number;    // Number of resource records in the additional records section
}