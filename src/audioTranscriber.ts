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

/**
 * Fetches an audio file from the given URL, splits it into chunks, and
 * transcribes each chunk using the Whisper-large-v3-turbo model.
 *
 * @param audioUrl - The URL of the audio file to transcribe.
 * @param env - The Cloudflare Worker environment, including the AI binding.
 * @returns The full transcription text from the model.
 */
export async function transcribeAudio(audioUrl: string, env: Env): Promise<string> {
	const audioChunks: ArrayBuffer[] = await getAudioChunks(audioUrl);
	let transcript = '';
	for (const chunk of audioChunks) {
		let chunkTranscript = '';
		try {
			chunkTranscript = await transcribeChunk(chunk, env);
		} catch (error) {
			chunkTranscript = '[Error transcribing chunk]\n';
		}
		transcript += chunkTranscript;
	}
	return transcript;
}
