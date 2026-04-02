-- Add voice_notes column to survivors table
-- Run against thecamp_db: psql -U thecamp_api -d thecamp_db -f add_voice_notes_column.sql

ALTER TABLE game.survivors ADD COLUMN IF NOT EXISTS voice_notes TEXT;

-- Backfill voice_notes from lore data for existing saves
-- These values come from 06_gamedata/survivors/*/[lore_id].json → personality.voice_notes

UPDATE game.survivors SET voice_notes = CASE lore_id
  WHEN 'lena' THEN 'Clinical vocabulary when discussing health. Blunt delivery. ''The wound is clean but it needs rest.'' Doesn''t hedge. Doesn''t comfort unless trust is high — then it comes out reluctant and genuine. Refers to people by injury before name when stressed: ''the arm fracture in bay two.'''
  WHEN 'darro' THEN 'Economy of words. Never uses two sentences when a grunt works. ''Wall''s fine.'' ''Needs lumber.'' When he does speak at length it''s about materials or structure, never feelings. Trust unlocks dry, deadpan observations — ''You look like the roof.'' — that pass for humor.'
  WHEN 'raine' THEN 'Everything filtered through motherhood. ''Is Otto safe?'' before any other question. Terse with strangers — not rude, just efficient. Warmth is reserved and comes out in physical actions described in text rather than words: adjusting a blanket, handing you food without comment.'
  WHEN 'sol' THEN 'Fast talker. Stream of consciousness. ''Ok so left here, there''s a gap in the fence, I squeezed through no problem but Marcus, man, Marcus got stuck and I had to—'' Interrupts himself. Backtracks. Adds detail nobody asked for. Genuine warmth underneath the noise.'
  WHEN 'sera' THEN 'Measured. Chooses words carefully. ''The count is fourteen. That''s two fewer than yesterday.'' Presents information before opinion. Asks ''Is that alright?'' more than she needs to. At high trust, lets small personal details slip: ''I used to organize my classroom the same way.'''
  WHEN 'tomas' THEN 'Commands without raising his voice. ''Check the east side. Report back.'' Short, clear, no filler. Uses ''we'' even when giving orders. Old-school courteous — ''ma''am'', ''sir'' — but it''s reflex, not formality. Rare humor is bone-dry: ''Retirement was boring anyway.'''
  WHEN 'hana' THEN 'Military brevity. ''Sitrep: east perimeter clear. No movement. Recommend hold.'' Uses jargon naturally, not for show. Numbers and specifics: ''Three contacts, two hours ago, bearing northeast.'' Off-duty voice is slightly warmer but still structured.'
  WHEN 'yssa' THEN 'Skeptical tone. Questions everything: ''Says who?'' ''Based on what?'' ''That sounds like a guess.'' Quick to point out gaps in logic. Not cruel — just unimpressed. When she respects someone, she listens without interrupting. That silence IS her compliment.'
  WHEN 'marsh' THEN 'Minimal. Sometimes just nods. When he speaks it''s factual: ''Movement. East. Two.'' Sentence fragments, no filler. His silence is not awkward — it''s his natural state. Trust unlocks single complete sentences that carry weight: ''I''ll go with you.'''
  WHEN 'bridget' THEN 'Speaks in data. ''That''s forty percent of our reserves. At current consumption, that''s eleven days.'' Not emotional — but emotion leaks through when the numbers are bad. Says ''the math doesn''t lie'' at least once a conversation. Argues with structure, not volume.'
  WHEN 'rook' THEN 'Deflects with charm. ''Me? I''m nobody. Just passing through. For the third week.'' Different backstory every time someone asks — and remembers which lie he told whom. At high trust, the lies stop and the sentences get shorter, quieter, more real.'
  WHEN 'noor' THEN 'Calm, clinical, but warmer than Lena. ''Let me see. Hold still. That''s not as bad as it looks.'' Uses analogies from veterinary work without apology: ''I''ve set legs on horses bigger than you, you''ll be fine.'' Gentle humor, never sarcastic.'
  WHEN 'ivo' THEN 'Warm, meandering, professorish. ''Ah yes, that reminds me of — well, it''s not important, but — actually it might be. The Romans had a similar problem with...'' Gets to the point eventually and it''s usually worth the wait. Remembers everything and references past conversations.'
  WHEN 'dag' THEN 'Talks about soil, weather, crops with authority and affection. ''Nitrogen''s low. Beans''ll fix it by spring.'' Doesn''t talk about himself unless asked directly, and even then pivots back to the field. Sentences are agricultural metaphors: ''You can''t rush a harvest.'''
  WHEN 'felix' THEN 'Transactional. ''What do you need? What do I get?'' Not hostile — just clear about exchange. Describes mechanical problems with almost affectionate detail: ''Fuel line''s cracked. Beautiful crack too, clean split.'' Warms up through shared work, not conversation.'
  WHEN 'juno' THEN 'Stubborn, precise, adult vocabulary in a child''s voice. ''I already did it. Check the closet.'' Refuses to be talked down to. ''I''m not a kid'' is her catchphrase but she means it. When she trusts you, she asks questions that reveal she''s actually scared.'
  WHEN 'otto' THEN 'Almost never speaks. When he does, it''s a single word or a fragment. Points at things. Tugs sleeves. Communicates through drawings and proximity — sits near people he trusts. At high trust, fragments become short sentences: ''I like it here.'''
  WHEN 'alma' THEN 'Whisper-quiet. ''...okay.'' Communicates mostly through presence — sitting nearby, following at a distance. Hums when she feels safe. At high trust, asks simple devastating questions: ''Do you think my mom is looking for me?'''
  WHEN 'cullum' THEN 'Speaks rarely, and only when it changes something. ''Don''t go east.'' No explanation offered unless pressed. Not rude — just doesn''t see the point of words that don''t alter outcomes. At high trust, explanations come: ''East is mined. I saw it.'''
  ELSE voice_notes
END
WHERE voice_notes IS NULL;
