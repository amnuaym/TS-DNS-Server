// ───────────────────── Package Imports ─────────────────────
import * as dgram from "dgram"; // Import Node.js UDP datagram module

// ───────────────────── Custom Imports ─────────────────────
import type { DNSHeaderType } from "../types/headers"; // Type for DNS header
import type { DNSAnswerType } from "../types/answers"; // Type for DNS answer
import type { QuestionType } from "../types/questions"; // Type for DNS question
import { DNSHeader } from "../classes/headers.class"; // DNS header class
import { DNSQuestion } from "../classes/questions.class"; // DNS question class
import { DNSAnswer } from "../classes/answers.class"; // DNS answer class
import { parseDNSHeader } from "../lib/utils/headers.utils"; // Function to parse DNS header
import { parseDNSQuestion } from "../lib/utils/questions.utils"; // Function to parse DNS question

// ───────────────────── Server Setup ─────────────────────
const udpSocket = dgram.createSocket("udp4"); // Create UDP socket for IPv4
const PORT = 2053; // Port to listen on
const HOST = "127.0.0.1"; // Host address (localhost)
udpSocket.bind(PORT, HOST, () => { // Bind UDP socket to port and host
    console.log(`DNS server running at ${HOST}:${PORT}`); // Log server start
});

// ───────────────────── Message Handler ─────────────────────
udpSocket.on("message", (data: Buffer, remote: dgram.RemoteInfo) => { // Listen for incoming UDP messages
    try {
        console.log(`\nReceived DNS query from ${remote.address}:${remote.port}`); // Log incoming query

        // ───── Step 1: Parse Header ─────
        const parsedHeader: DNSHeaderType = parseDNSHeader(data); // Parse DNS header from message
        let offset = 12; // DNS header is always 12 bytes
        const questions: QuestionType[] = []; // Array to hold parsed questions

        // ───── Step 2: Parse All Questions ─────
        for (let i = 0; i < parsedHeader.qdcount; i++) { // Loop through all questions in the query
            // Use the enhanced parsing function with compression support
            const {
                name,
                type,
                class: qClass,
                bytesUsed,
            } = parseDNSQuestion(data, offset); // Parse question at current offset
            questions.push({ name, type, class: qClass }); // Add parsed question to array
            offset += bytesUsed; // Move offset forward by bytes used for this question
        }

        // ───── Step 3: Construct the Response Message with Compression ─────
        // Create a compression context (nameMap) for the response message
        const nameMap = new Map<string, number>(); // Map to track name positions for compression

        // ───── Step 4: Construct Header for Response ─────
        const responseHeader = new DNSHeader(); // Create DNSHeader instance for response
        responseHeader.writeHeader({
            ...parsedHeader, // Copy fields from parsed header
            qr: 1, // Response flag (1 = response)
            rcode: 0, // No error
            ancount: questions.length, // Number of answers equals number of questions
        });
        const headerBuffer = responseHeader.getHeaderBuffer(); // Get header as Buffer

        // Start of the message, position after header
        let currentPosition = headerBuffer.length; // Track current buffer position

        // ───── Step 5: Encode Questions with Compression ─────
        const questionBuffers = questions.map((q) => { // Encode each question
            const question = new DNSQuestion(); // Create DNSQuestion instance
            // Pass the nameMap and current position to enable compression
            const bytesWritten = question.writeQuestion(q, nameMap, currentPosition); // Write question with compression
            const qBuffer = question.getQuestionBuffer(); // Get question as Buffer
            currentPosition += bytesWritten; // Update position
            return qBuffer; // Return buffer for this question
        });

        // ───── Step 6: Create Fake Answer(s) with Compression ─────
        const answers: DNSAnswerType[] = questions.map((q) => ({ // Create a fake answer for each question
            name: q.name, // Use question name
            type: 1, // A record
            class: 1, // IN (Internet)
            ttl: 60, // Time to live (seconds)
            length: 4, // Data length (IPv4 address = 4 bytes)
            data: "8.8.8.8", // Fake IP address (Google DNS)
        }));

        // ───── Step 7: Encode Answer Section with Compression ─────
        const answerBuffers = answers.map((ans) => { // Encode each answer
            const answer = new DNSAnswer(); // Create DNSAnswer instance
            // Pass the nameMap to enable compression
            const bytesWritten = answer.writeAnswer(ans, nameMap, currentPosition); // Write answer with compression
            const aBuffer = answer.getAnswerBuffer(); // Get answer as Buffer
            currentPosition += bytesWritten; // Update position
            return aBuffer; // Return buffer for this answer
        });

        // ───── Step 8: Send the Compressed Response ─────
        const response = Buffer.concat([ // Concatenate all buffers to form the response
            headerBuffer,
            ...questionBuffers,
            ...answerBuffers,
        ]);
        udpSocket.send(response, remote.port, remote.address); // Send response to client

        // ───── Logs ─────
        console.log("nameMap contents:", [...nameMap.entries()]); // Log nameMap for compression
        console.log("Parsed Questions:", questions); // Log parsed questions
        console.log("Sent Response with", answers.length, "Answer(s)"); // Log number of answers sent
        console.log("Response Buffer Length:", response.length); // Log response buffer length
        console.log(
            "Compression Savings:",
            `${Math.round(
                (1 -
                    response.length /
                        (headerBuffer.length +
                            questions.reduce(
                                (acc, _, i) =>
                                    acc + questionBuffers[i].length + answerBuffers[i].length,
                                0
                            ))) *
                    100
            )}%`
        ); // Log compression savings percentage
    } catch (err) {
        console.error("Error processing DNS query:", err); // Log any errors
    }
});