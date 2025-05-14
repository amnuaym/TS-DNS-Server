export type QuestionType = {
    name: string;       // Name of the domain being queried
    type: number;       // Type of query (e.g., A, NS, MX)
    class: number;      // Class of query (usually IN for Internet)
};
// Type definition for a DNS question section.
// Represents a single question in the DNS query section.   
