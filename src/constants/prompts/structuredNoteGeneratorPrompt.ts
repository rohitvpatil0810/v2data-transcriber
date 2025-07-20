export const sturcturedNotesGeneratorPrompt = (text: string) => `
You are given the raw transcription of an audio conversation, lecture, or meeting. Your task is to convert this unstructured text into clean, organized, and easy-to-read structured notes.

Guidelines:
1. Summarize key points clearly and concisely.
2. Group related information under relevant headings or bullet points.
3. Maintain the original meaning and tone of the transcription.
4. If the content contains action items, decisions, or follow-ups, highlight them clearly.
5. Do not include filler words, disfluencies (e.g., "um", "you know"), or irrelevant tangents.

Output Format:
* Use headings, subheadings, and bullet points.
* Ensure it's skimmable and usable for reference.

Input:
"${text}"

Output:
{Structured notes}
`;
