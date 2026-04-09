# AuditFlow - AI Artist & Music Monitoring System

## Project Context

A professional dashboard for monitoring Spotify artists, YouTube releases, and automated AI auditing (lyrics/audio).

- **Core Goal**: Automate the workflow from discovery to video processing.
- **Project Root**: `./auditflow-app` (All commands MUST be run here).

## Tech Stack

- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **State/Data**: SWR for data fetching
- **Icons**: Lucide React
- **UI Logic**: Radix UI / Shadcn UI patterns
- **Extendability**: the code should be written in professional design and easy to extend further if new function is needed, and also easy to adjust
- **Standard**: this project will be in enterprise level and should consider high concurrency, user experience, fast loading and interact

## Testing

- every piece of codes must be verified via testing
- don't over and lack of testing
- mock data by yourself and do it professional

## prototype and function breakdown

- ../prototype folder for prototype reference
- each pic means one big part of function
- backend logic for frontend development reference:
  - automatically sync spotify account following list
  - automatically sync artists' youtubeID and use RSS to fetch their latest new music release
  - transcribe the subtitles via whisper model automatically
  - AI reviewer to review the transcript and make necessary adjustment
  - AI auditor to match user's tastes and filter the music via lyrics and music characteristics like BPM, energy, word density
  - the passed music will be translated to Chinese by AI translator (should also provide double check by human, and the passed music will be also added to RAG)
  - AI reviewer will also review the translation and make necessary adjustment such as slang, wordplay, and include context, semantic smooth
  - combine the chinese and english lyrics and videos together
  - able to download and online review
  - two RAG, one for music tastes, one for lyrics translation to help auditor match user tastes and help trasnlator for translation
