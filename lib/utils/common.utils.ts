/**
 * DNS Compression Utilities
 *
 * These functions implement DNS message compression according to RFC 1035,
 * with fixes for common compression pointer issues.
 */
// Constants for DNS compression
const POINTER_MASK = 0b1100_0000; // 1100 0000 in binary - indicates compression pointer
const isPointer = (byte: number): boolean => { // Function to check if a byte is a pointer
    return (byte & POINTER_MASK) === POINTER_MASK;
};
const extractPointer = ( // Function to extract pointer offset from two bytes
    byte: number,
    buffer: Buffer,
    offset: number
): number => {
    return ((byte & ~POINTER_MASK) << 8) | buffer.readUInt8(offset);
};
/**
 * Encodes a domain name with compression support
 * @param name The domain name to encode
 * @param nameMap map of already encoded names for compression
 * @returns Buffer containing the encoded domain name
 */
export const encodeDomainName = ( // Exported function to encode a domain name with compression
    name: string,
    nameMap: Map<string, number>,
    currentOffset: number
): { buffer: Buffer; newOffset: number } => {
    const labels: string[] = name.split("."); // Split domain name into labels
    const bytes: number[] = []; // Array to hold encoded bytes
    let currentPosition: number = currentOffset; // Track current position in message
    // Store the starting position of this domain name
    const startPosition: number = currentPosition;
    let i = 0;
    while (i < labels.length) { // Loop through each label
        // Check if we can use compression for the remaining part of the name
        const remainingName = labels.slice(i).join(".");
        if (
            nameMap.has(remainingName) &&
            nameMap.get(remainingName) !== startPosition
        ) {
            // Use a compression pointer, but never point to ourselves
            const pointer = nameMap.get(remainingName)!;
            // Pointers must be at least 12 bytes into the message to be valid
            // (after the DNS header) and must not point to the current position
            if (pointer >= 12 && pointer < startPosition) {
                bytes.push(POINTER_MASK | ((pointer >> 8) & 0x3f)); // High byte with compression bits
                bytes.push(pointer & 0xff); // Low byte
                return {
                    buffer: Buffer.from(bytes),
                    newOffset: currentPosition + 2, // pointer is 2 bytes
                };
            }
        }
        // No valid compression point found, encode this label normally
        const label = labels[i];
        // Store this position in the map for future compression
        if (!nameMap.has(remainingName)) {
            nameMap.set(remainingName, currentPosition);
        }
        // Add this label's length byte
        bytes.push(label.length);
        currentPosition++;
        // Add each character in the label
        for (const char of label) {
            bytes.push(char.charCodeAt(0));
            currentPosition++;
        }
        i++;
    }
    // Null byte to terminate the name
    bytes.push(0);
    currentPosition++;
    return {
        buffer: Buffer.from(bytes),
        newOffset: currentPosition,
    };
};
/**
 * Parses a domain name from a buffer with compression support
 * @param buffer The buffer containing the domain name
 * @param startOffset starting offset in the buffer
 * @returns The parsed domain name and the new offset
 */
export const parseDomainNameFromBuffer = ( // Exported function to parse a domain name from a buffer
    buffer: Buffer,
    startOffset: number
): { parsedName: string; offset: number } => {
    const labels: string[] = []; // Array to hold parsed labels
    let offset = startOffset; // Current offset in buffer
    let jumps = 0; // Track number of pointer jumps
    const MAX_JUMPS = 10; // Protection against infinite loops from circular references
    while (offset < buffer.length) { // Loop until end of buffer
        // Read the label length/pointer byte
        const labelByte = buffer.readUInt8(offset);
        // Check if this is a pointer (compression)
        if (isPointer(labelByte)) {
            if (jumps >= MAX_JUMPS) {
                throw new Error(
                    "Too many compression jumps, possible circular reference"
                );
            }
            // This is a pointer - extract the offset
            if (offset + 1 >= buffer.length) {
                throw new Error("Invalid compression pointer");
            }
            // Extract the 14-bit pointer value
            const pointerOffset = extractPointer(labelByte, buffer, offset + 1);
            // Validate pointer offset - must be at least 12 bytes into the message
            if (pointerOffset < 12 || pointerOffset >= buffer.length) {
                throw new Error(`Invalid compression pointer offset: ${pointerOffset}`);
            }
            // If this is the first pointer jump, remember the next position
            const nextOffset = offset + 2;
            // Jump to the new location in the original buffer
            offset = pointerOffset;
            jumps++;
            // Continue parsing from the new location using Recursion
            const result = parseDomainNameFromBuffer(buffer, pointerOffset);
            // Add the parsed name from the jump target
            if (result.parsedName) {
                labels.push(...result.parsedName.split("."));
            }
            // Return with the offset after the pointer
            return { parsedName: labels.join("."), offset: nextOffset };
        }
        // If we reach a zero length, we're at the end of the name
        if (labelByte === 0) {
            offset++;
            break;
        }
        // Regular label - read the characters
        offset++;
        console.log("Label Byte: ", labelByte); // Debug log for label byte
        console.log("Offset: ", offset); // Debug log for offset
        if (offset + labelByte > buffer.length) {
            throw new Error("Label extends beyond buffer");
        }
        const label = buffer.subarray(offset, offset + labelByte).toString("utf-8"); // Read label string
        labels.push(label); // Add label to array
        offset += labelByte; // Move offset forward
    }
    return { parsedName: labels.join("."), offset }; // Return parsed name and new offset
};