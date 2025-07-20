# v2data-transcriber

A Cloudflare Worker project for transcribing audio data and generate structured notes from transcription.

## Overview

This project uses Cloudflare Workers to transcribe audio data. It leverages the `audioTranscriber` and `structuredNotesGenerator` modules to perform the transcription and generate structured notes.

## Getting Started

To get started with this project, follow these steps:

1. Clone the repository to your local machine.
2. Create a local copy of the environment variables file by running `cp .env.vars.example dev.vars`. Update the `.dev.vars` file with your own values.
3. Install the required dependencies by running `npm install` in the project directory.
4. Login to Wrangler by running `npx wrangler login`. Follow the prompts to authenticate with your Cloudflare account.
5. Start the development server by running `npm run dev`.
6. Test worker at `http://localhost:8787/`.

Here's an example of how you can document the testing scenario in your README.md:

# Testing the Endpoint

To test the endpoint, you can send a POST request to `http://localhost:8787/` with the following requirements:

- `X-API-Key` header with the value of `SECRET_API_KEY` from your `.dev.vars` file
- `Content-Type` header set to `application/json`
- JSON body with the following structure:

```json
{
	"audioUrl": "https://example.com/audio.mp3"
}
```

Replace `https://example.com/audio.mp3` with a valid audio URL.

You can use tools like `curl`, Postman, or Thunder Client to send the request.

Example `curl` command:

```bash
curl -X POST \
  http://localhost:8787/ \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: YOUR_SECRET_API_KEY' \
  -d '{"audioUrl": "https://example.com/audio.mp3"}'
```

## Expected Response

If everything is set up correctly, you should receive a response with a JSON body containing `structuredNotes` and `fullTranscript`:

```json
{
	"structuredNotes": "...",
	"fullTranscript": "..."
}
```

## Deployment

To deploy the worker to Cloudflare, run `npm run deploy`.

## Modules

This project uses the following modules:

- `audioTranscriber`: responsible for transcribing audio data.
- `structuredNotesGenerator`: generates structured notes from the transcribed data.
