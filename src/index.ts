import { Buffer } from 'node:buffer';

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

/**
 * Fetches the audio file from the provided URL and splits it into chunks.
 * This function explicitly follows redirects.
 *
 * @param audioUrl - The URL of the audio file.
 * @returns An array of ArrayBuffers, each representing a chunk of the audio.
 */
async function getAudioChunks(audioUrl: string): Promise<ArrayBuffer[]> {
	const response = await fetch(audioUrl, { redirect: 'follow' });
	if (!response.ok) {
		throw new Error(`Failed to fetch audio: ${response.status}`);
	}
	const arrayBuffer = await response.arrayBuffer();

	// Example: Split the audio into 1MB chunks.
	const chunkSize = 1024 * 1024; // 1MB
	const chunks: ArrayBuffer[] = [];
	for (let i = 0; i < arrayBuffer.byteLength; i += chunkSize) {
		const chunk = arrayBuffer.slice(i, i + chunkSize);
		chunks.push(chunk);
	}
	return chunks;
}

/**
 * Transcribes a single audio chunk using the Whisper‑large‑v3‑turbo model.
 * The function converts the audio chunk to a Base64-encoded string and
 * sends it to the model via the AI binding.
 *
 * @param chunkBuffer - The audio chunk as an ArrayBuffer.
 * @param env - The Cloudflare Worker environment, including the AI binding.
 * @returns The transcription text from the model.
 */
async function transcribeChunk(chunkBuffer: ArrayBuffer, env: Env): Promise<string> {
	const base64 = Buffer.from(chunkBuffer).toString('base64');
	const res = await env.AI.run('@cf/openai/whisper-large-v3-turbo', {
		audio: base64,
		// Optional parameters (uncomment and set if needed):
		// task: "transcribe",   // or "translate"
		// language: "en",
		// vad_filter: "false",
		// initial_prompt: "Provide context if needed.",
		// prefix: "Transcription:",
	});
	return res.text; // Assumes the transcription result includes a "text" property.
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (request.method === 'POST') {
			try {
				// require API Key to access
				const apiKey = request.headers.get('X-API-Key');
				if (!apiKey || apiKey !== env.SECRET_API_KEY) {
					return new Response('Unauthorized Access', { status: 401 });
				}

				const contentType = request.headers.get('Content-Type');

				if (contentType !== 'application/json') {
					return new Response('Unsupported Content-Type', { status: 400 });
				}

				const body: { audioUrl: string } = await request.json();

				console.log(body);

				const audioUrl = body.audioUrl;

				if (!audioUrl) {
					return new Response("Missing 'audioUrl' in request body", { status: 400 });
				}

				const audioResponse = await fetch(audioUrl);

				if (!audioResponse.ok) {
					return new Response('Failed to fetch audio', { status: 502 });
				}

				// Get the audio chunks.
				const audioChunks: ArrayBuffer[] = await getAudioChunks(audioUrl);
				let fullTranscript = '';

				// Process each chunk and build the full transcript.
				for (const chunk of audioChunks) {
					try {
						const transcript = await transcribeChunk(chunk, env);
						fullTranscript += transcript + '\n';
					} catch (error) {
						fullTranscript += '[Error transcribing chunk]\n';
					}
				}

				return new Response(fullTranscript, {
					headers: { 'Content-Type': 'text/plain' },
				});
			} catch (error) {
				console.log(error);
				return new Response('Internal Server Error', { status: 500 });
			}
		}
		return new Response('Only POST requests are allowed', { status: 405 });
	},
} satisfies ExportedHandler<Env>;
