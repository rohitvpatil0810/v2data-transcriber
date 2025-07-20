import { Buffer } from 'node:buffer';
import { transcribeAudio } from './audioTranscriber';
import { generateStructuredNotes } from './structuredNotesGenerator';

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

				if (!body.audioUrl) {
					return new Response('Missing audioUrl', { status: 400 });
				}

				const audioUrl = body.audioUrl;

				const fullTranscript = await transcribeAudio(audioUrl, env);

				const structuredNotes = await generateStructuredNotes(fullTranscript, env);

				return new Response(JSON.stringify({ structuredNotes, fullTranscript }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				});
			} catch (error) {
				console.log(error);
				return new Response('Internal Server Error', { status: 500 });
			}
		}
		return new Response('Only POST requests are allowed', { status: 405 });
	},
} satisfies ExportedHandler<Env>;
