import { sturcturedNotesGeneratorPrompt } from './constants/prompts/structuredNoteGeneratorPrompt';

/**
 * Generates structured notes from raw transcription text.
 *
 * @param {string} text Raw transcription text.
 * @param {Env} env The Cloudflare environment object.
 * @returns {Promise<string>} The generated structured notes.
 * @throws {Error} If there's an error generating the structured notes.
 */
export async function generateStructuredNotes(text: string, env: Env): Promise<string> {
	const prompt = sturcturedNotesGeneratorPrompt(text);
	let structuredNotes = '';
	try {
		const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
			prompt,
		});
		structuredNotes = response.response!; // Assumes the response includes a "response" property.
	} catch (error) {
		throw new Error(`Failed to generate structured notes: ${error}`);
	}
	return structuredNotes;
}
