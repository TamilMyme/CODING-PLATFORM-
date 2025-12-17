export default function formatSegment(segment: string): string {
  return segment
    .replace(/[-_]/g, " ") // replace dashes/underscores with space
    .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize first letter of each word
}