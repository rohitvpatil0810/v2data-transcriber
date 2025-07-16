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

				const audioBlob = await audioResponse.arrayBuffer();

				const inputs = {
					audio: [...new Uint8Array(audioBlob)],
				};

				const response = await env.AI.run('@cf/openai/whisper', inputs);

				return Response.json({ text: response.text });
			} catch (error) {
				console.log(error);
				return new Response('Internal Server Error', { status: 500 });
			}
		}
		return new Response('Only POST requests are allowed', { status: 405 });
	},
} satisfies ExportedHandler<Env>;
