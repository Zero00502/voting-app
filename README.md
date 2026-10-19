# Interactive Access — QR Ticket Website

A mobile-first 3-question audience experience with one combined end-of-presentation results reveal for the fold-out A4 thesis ticket.

## Access words (IMPORTANT)

Edit `config.js` to match the words printed **beside** folds 1–3 on your handout. Defaults:
- Fold 1: PROVOKING
- Fold 2: PROACTIVE
- Fold 3: IMAGINATIVE

These are placeholders! Change them to your actual words before printing.

## Try it locally

Open `index.html` in a browser. No installation needed. Voting runs in **preview mode** until Supabase is connected. Preview votes are stored only on the device and **cannot** show combined classroom results.

## Enable shared results (Supabase free-tier may be enough for a classroom demo)

1. Create a Supabase project at https://supabase.com/.
2. Open SQL Editor and run all statements in `supabase.sql`.
3. Under Project Settings → API, copy the Project URL and the **publishable/anon** key. Do NOT use a service_role/secret key.
4. Paste these into `supabaseUrl` and `supabaseAnonKey` inside `config.js`.
5. Set your own unique `eventId`. Upload the updated files.
6. Test with **two different phones**: cast a vote on one and check the results on the other. Shared results are refreshed every 4 seconds.

**Important:** This is a low-stakes classroom prototype. The public anonymous-voting policy allows repeated submissions by motivated users, and there is no server-side rate limiting. The browser tries to prevent a repeat vote by remembering an answer locally, but that is not a security guarantee. Do not use it for elections, private data, or high-stakes decisions.

## Put the site online and create a REAL QR code

Use Netlify Drop (https://app.netlify.com/drop) to drag-and-drop the entire folder, or deploy it to GitHub Pages / Vercel. Once you have your actual public URL, generate a QR code that points to it. Replace the mock QR image in Figma — the QR codes in generated ticket mockups are not functional.

For privacy, collect no names or identifying details; this prototype stores question numbers, choices, event ID, a random per-device participant ID and timestamps in Supabase. The participant ID lets the shared poll count each device only once per question. The backend provider may still log standard connection data.

## During the 10-minute presentation

1. Hand out the folded tickets. Participants scan the QR code on the first visible panel.
2. Show them the access word next to FOLD 1. They enter it and answer Q1.
3. Votes are recorded without showing results. Continue presenting, then cue the next fold.
4. Announce FOLD 2. Participants tap NEXT FOLD, enter the new word, answer Q2.
5. Repeat for FOLD 3. After the last vote, tap REVEAL THE RESULTS to see combined totals and percentages for all three questions on each phone. You can read the outcome aloud without a projector.

The fold words control access on the website, but people can physically open the paper early. No projector required.

## Change questions

The three questions and four answer choices each are at the top of `app.js` in the `questions` array. Each question requires four answers in this version.

## Final results reveal

Votes stay hidden until all 3 questions have been answered on a phone. The final screen shows each question, each option’s percentage and vote count, and highlights the viewer’s own response. Results refresh every 4 seconds with Supabase connected. Note: this is a **client-side reveal**, not a global presenter-controlled release; participants who complete early can reveal early. For a strictly presenter-controlled reveal, a database-backed release flag would be required.

## Compatible question update

This version keeps the original four-option multiple-choice interface and Supabase's numeric `choice` format. The third question uses emoji in its labels but is stored exactly like the others. A continuous slider would require changes to the UI and possibly the database schema; it has deliberately not been introduced here.

## Further reading section

A collapsed **Research Behind the Project** section now appears below the voting area. It links four of the project's research papers and does not change voting, fold passwords, or Supabase. Edit its citations and links directly in `index.html`. The default collapsed state is intentional so it does not distract during the live presentation.
