-- ============================================================
-- WordPal: Seed data
--
-- GENERATED FILE — do not edit by hand.
-- Regenerate with: node scripts/generate-seed.mjs
-- Source of truth: src/data/learning-path.ts, src/data/placement-challenges.ts
--
-- Idempotent via legacy_id: safe to run multiple times against the
-- same database (e.g. after `supabase db reset`).
-- ============================================================

insert into public.learning_paths
  (legacy_id, title, description, target_level, difficulty, estimated_duration, xp_reward, status)
values
  ('path-core', 'English Sentence Building', 'Core grammar path: subject-verb-object basics through advanced rhetorical structures.', 'B1', 'Beginner', 600, 700, 'published')
on conflict (legacy_id) do update set
  title = excluded.title, description = excluded.description, target_level = excluded.target_level,
  difficulty = excluded.difficulty, estimated_duration = excluded.estimated_duration,
  xp_reward = excluded.xp_reward, status = excluded.status;

insert into public.units (learning_path_id, legacy_id, title, description, position)
select id, 'unit-beginner', 'Syntax Foundations', '', 1
  from public.learning_paths where legacy_id = 'path-core'
on conflict (legacy_id) do update set title = excluded.title, position = excluded.position;

insert into public.units (learning_path_id, legacy_id, title, description, position)
select id, 'unit-intermediate', 'Tone & Nuance', '', 2
  from public.learning_paths where legacy_id = 'path-core'
on conflict (legacy_id) do update set title = excluded.title, position = excluded.position;

insert into public.units (learning_path_id, legacy_id, title, description, position)
select id, 'unit-advanced', 'Rhetorical Structure', '', 3
  from public.learning_paths where legacy_id = 'path-core'
on conflict (legacy_id) do update set title = excluded.title, position = excluded.position;

insert into public.lessons
  (unit_id, legacy_id, title, description, icon, path_level, cefr_level, difficulty, status, position)
select u.id, 'lesson-1', 'Simple Sentences', 'Subject + Verb + Object basics',
       '🌱', 'beginner', 'B1', 1, 'published', 1
  from public.units u where u.legacy_id = 'unit-beginner'
on conflict (legacy_id) do update set
  title = excluded.title, description = excluded.description, icon = excluded.icon,
  path_level = excluded.path_level, position = excluded.position;

insert into public.exercises
  (lesson_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select l.id, 'l1-e1', 'drag-and-drop', 1, 'published',
       'Subject + Verb (the simplest sentence)', 'En inglés, el orden básico es Sujeto → Verbo. - "The cat" es el sujeto (quién). - "sleeps" es el verbo (qué hace). - "The cat sleep" sería incorrecto porque "cat" es singular - en inglés se agrega -s al verbo para sujetos singulares (he/she/it): The cat sleepS. - The dogs sleep (sin -s para plural).', '{"targetSentence":"The cat sleeps","blocks":[{"id":"l1-e1-1","label":"The cat","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"l1-e1-2","label":"sleeps","category":"verb","isDistractor":false,"sourceOrder":2},{"id":"l1-e1-3","label":"runs","category":"verb","isDistractor":true,"sourceOrder":3}]}'::jsonb
  from public.lessons l where l.legacy_id = 'lesson-1'
on conflict (legacy_id) do update set
  hint = excluded.hint, tutor_explanation = excluded.tutor_explanation,
  content = excluded.content, position = excluded.position;

insert into public.exercises
  (lesson_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select l.id, 'l1-e2', 'drag-and-drop', 2, 'published',
       'Subject + Verb + Object', 'Sujeto → Verbo → Objeto es el patrón básico del inglés. - "She" (sujeto) hace la acción. - "reads" (verbo) es lo que hace. - "books" (objeto) es lo que lee. - El verbo lleva -s porque "she" es tercera persona singular. - "swims" no tiene sentido con "books" - no puedes nadar libros.', '{"targetSentence":"She reads books","blocks":[{"id":"l1-e2-1","label":"She","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"l1-e2-2","label":"reads","category":"verb","isDistractor":false,"sourceOrder":2},{"id":"l1-e2-3","label":"books","category":"object","isDistractor":false,"sourceOrder":3},{"id":"l1-e2-4","label":"swims","category":"verb","isDistractor":true,"sourceOrder":4}]}'::jsonb
  from public.lessons l where l.legacy_id = 'lesson-1'
on conflict (legacy_id) do update set
  hint = excluded.hint, tutor_explanation = excluded.tutor_explanation,
  content = excluded.content, position = excluded.position;

insert into public.exercises
  (lesson_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select l.id, 'l1-e3', 'drag-and-drop', 3, 'published',
       'Subject + Verb + Object', '"They" es plural, así que el verbo queda como "play" (sin -s). - "playing" no funciona aquí porque necesitas la forma base del verbo, no el gerundio. - El orden importa: primero Sujeto, luego Verbo, luego Objeto. - "Soccer play they" sería incorrecto en inglés (¡aunque en otros idiomas sí funciona!).', '{"targetSentence":"They play soccer","blocks":[{"id":"l1-e3-1","label":"They","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"l1-e3-2","label":"play","category":"verb","isDistractor":false,"sourceOrder":2},{"id":"l1-e3-3","label":"soccer","category":"object","isDistractor":false,"sourceOrder":3},{"id":"l1-e3-4","label":"playing","category":"verb","isDistractor":true,"sourceOrder":4}]}'::jsonb
  from public.lessons l where l.legacy_id = 'lesson-1'
on conflict (legacy_id) do update set
  hint = excluded.hint, tutor_explanation = excluded.tutor_explanation,
  content = excluded.content, position = excluded.position;

insert into public.lessons
  (unit_id, legacy_id, title, description, icon, path_level, cefr_level, difficulty, status, position)
select u.id, 'lesson-2', 'Adding Places', 'Where things happen',
       '📍', 'beginner', 'B1', 1, 'published', 2
  from public.units u where u.legacy_id = 'unit-beginner'
on conflict (legacy_id) do update set
  title = excluded.title, description = excluded.description, icon = excluded.icon,
  path_level = excluded.path_level, position = excluded.position;

insert into public.exercises
  (lesson_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select l.id, 'l2-e1', 'drag-and-drop', 1, 'published',
       'Subject + Verb + Place', 'Las expresiones de lugar van DESPUÉS del verbo en inglés. - "On the sofa" nos dice DÓNDE duerme el gato. - Patrón: Sujeto + Verbo + Lugar. - No se puede decir "On the sofa the cat sleeps" en inglés estándar - sonaría poético o anticuado.', '{"targetSentence":"The cat sleeps on the sofa","blocks":[{"id":"l2-e1-1","label":"The cat","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"l2-e1-2","label":"sleeps","category":"verb","isDistractor":false,"sourceOrder":2},{"id":"l2-e1-3","label":"on the sofa","category":"place","isDistractor":false,"sourceOrder":3},{"id":"l2-e1-4","label":"yesterday","category":"time","isDistractor":true,"sourceOrder":4}]}'::jsonb
  from public.lessons l where l.legacy_id = 'lesson-2'
on conflict (legacy_id) do update set
  hint = excluded.hint, tutor_explanation = excluded.tutor_explanation,
  content = excluded.content, position = excluded.position;

insert into public.exercises
  (lesson_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select l.id, 'l2-e2', 'drag-and-drop', 2, 'published',
       'Subject + Verb + Object + Place', 'Cuando tienes Objeto y Lugar, el orden es: Sujeto + Verbo + Objeto + Lugar. - El Objeto ("soccer") va justo después del verbo. - El Lugar ("in the park") dice dónde. - "swimming" es un gerundio y no funciona como verbo principal aquí.', '{"targetSentence":"They play soccer in the park","blocks":[{"id":"l2-e2-1","label":"They","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"l2-e2-2","label":"play","category":"verb","isDistractor":false,"sourceOrder":2},{"id":"l2-e2-3","label":"soccer","category":"object","isDistractor":false,"sourceOrder":3},{"id":"l2-e2-4","label":"in the park","category":"place","isDistractor":false,"sourceOrder":4},{"id":"l2-e2-5","label":"swimming","category":"verb","isDistractor":true,"sourceOrder":5}]}'::jsonb
  from public.lessons l where l.legacy_id = 'lesson-2'
on conflict (legacy_id) do update set
  hint = excluded.hint, tutor_explanation = excluded.tutor_explanation,
  content = excluded.content, position = excluded.position;

insert into public.exercises
  (lesson_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select l.id, 'l2-e3', 'drag-and-drop', 3, 'published',
       'Subject + Verb + Object + Place', 'Mismo patrón: Sujeto ("My brother") + Verbo ("eats") + Objeto ("breakfast") + Lugar ("at home"). - "sleeping" no funciona aquí porque es un gerundio (-ing), y necesitamos la forma simple del verbo. - La -s en "eats" es porque "my brother" = he (singular).', '{"targetSentence":"My brother eats breakfast at home","blocks":[{"id":"l2-e3-1","label":"My brother","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"l2-e3-2","label":"eats","category":"verb","isDistractor":false,"sourceOrder":2},{"id":"l2-e3-3","label":"breakfast","category":"object","isDistractor":false,"sourceOrder":3},{"id":"l2-e3-4","label":"at home","category":"place","isDistractor":false,"sourceOrder":4},{"id":"l2-e3-5","label":"sleeping","category":"verb","isDistractor":true,"sourceOrder":5}]}'::jsonb
  from public.lessons l where l.legacy_id = 'lesson-2'
on conflict (legacy_id) do update set
  hint = excluded.hint, tutor_explanation = excluded.tutor_explanation,
  content = excluded.content, position = excluded.position;

insert into public.lessons
  (unit_id, legacy_id, title, description, icon, path_level, cefr_level, difficulty, status, position)
select u.id, 'lesson-3', 'Adding Time', 'When things happen',
       '⏰', 'beginner', 'B1', 1, 'published', 3
  from public.units u where u.legacy_id = 'unit-beginner'
on conflict (legacy_id) do update set
  title = excluded.title, description = excluded.description, icon = excluded.icon,
  path_level = excluded.path_level, position = excluded.position;

insert into public.exercises
  (lesson_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select l.id, 'l3-e1', 'drag-and-drop', 1, 'published',
       'Subject + Verb + Object + Time', 'Las expresiones de tiempo generalmente van al FINAL de la oración en inglés. - "Every morning" nos dice CUÁNDO lee. - Patrón: Sujeto + Verbo + Objeto + Tiempo. - Poner el tiempo al inicio ("Every morning she reads books") también es posible para dar énfasis, pero la posición final es lo normal.', '{"targetSentence":"She reads books every morning","blocks":[{"id":"l3-e1-1","label":"She","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"l3-e1-2","label":"reads","category":"verb","isDistractor":false,"sourceOrder":2},{"id":"l3-e1-3","label":"books","category":"object","isDistractor":false,"sourceOrder":3},{"id":"l3-e1-4","label":"every morning","category":"time","isDistractor":false,"sourceOrder":4},{"id":"l3-e1-5","label":"never","category":"time","isDistractor":true,"sourceOrder":5}]}'::jsonb
  from public.lessons l where l.legacy_id = 'lesson-3'
on conflict (legacy_id) do update set
  hint = excluded.hint, tutor_explanation = excluded.tutor_explanation,
  content = excluded.content, position = excluded.position;

insert into public.exercises
  (lesson_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select l.id, 'l3-e2', 'drag-and-drop', 2, 'published',
       'Subject + Verb + Modifier + Time', 'Los adverbios de manera (CÓMO: "fast") van justo después del verbo, antes del tiempo. - "The dog runs fast every day" = QUIÉN + QUÉ HACE + CÓMO + CUÁNDO. - "Slowly" es un distractor - cambia el significado por completo.', '{"targetSentence":"The dog runs fast every day","blocks":[{"id":"l3-e2-1","label":"The dog","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"l3-e2-2","label":"runs","category":"verb","isDistractor":false,"sourceOrder":2},{"id":"l3-e2-3","label":"fast","category":"modifier","isDistractor":false,"sourceOrder":3},{"id":"l3-e2-4","label":"every day","category":"time","isDistractor":false,"sourceOrder":4},{"id":"l3-e2-5","label":"slowly","category":"modifier","isDistractor":true,"sourceOrder":5}]}'::jsonb
  from public.lessons l where l.legacy_id = 'lesson-3'
on conflict (legacy_id) do update set
  hint = excluded.hint, tutor_explanation = excluded.tutor_explanation,
  content = excluded.content, position = excluded.position;

insert into public.exercises
  (lesson_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select l.id, 'l3-e3', 'drag-and-drop', 3, 'published',
       'Subject + Verb + Object + Time', '"Watched" es pasado - nos dice que esto ya sucedió. - "Yesterday" confirma el tiempo. - En pasado, el verbo cambia de forma (watch → watched) pero NO agrega -s para singular. - "Today" es un distractor porque entra en conflicto con el verbo en pasado.', '{"targetSentence":"We watched a movie yesterday","blocks":[{"id":"l3-e3-1","label":"We","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"l3-e3-2","label":"watched","category":"verb","isDistractor":false,"sourceOrder":2},{"id":"l3-e3-3","label":"a movie","category":"object","isDistractor":false,"sourceOrder":3},{"id":"l3-e3-4","label":"yesterday","category":"time","isDistractor":false,"sourceOrder":4},{"id":"l3-e3-5","label":"today","category":"time","isDistractor":true,"sourceOrder":5}]}'::jsonb
  from public.lessons l where l.legacy_id = 'lesson-3'
on conflict (legacy_id) do update set
  hint = excluded.hint, tutor_explanation = excluded.tutor_explanation,
  content = excluded.content, position = excluded.position;

insert into public.lessons
  (unit_id, legacy_id, title, description, icon, path_level, cefr_level, difficulty, status, position)
select u.id, 'lesson-4', 'Tone with Adverbs', 'How adverbs change meaning',
       '🎨', 'intermediate', 'B1', 1, 'published', 4
  from public.units u where u.legacy_id = 'unit-intermediate'
on conflict (legacy_id) do update set
  title = excluded.title, description = excluded.description, icon = excluded.icon,
  path_level = excluded.path_level, position = excluded.position;

insert into public.exercises
  (lesson_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select l.id, 'l4-e1', 'drag-and-drop', 1, 'published',
       'Subject + Modifier + Verb + Object (adverb changes tone)', 'Adverbs of manner can go BEFORE the verb to emphasize HOW the action was done. "She QUIETLY finished" tells us about her demeanor — she was calm and discreet. Compare: "She LOUDLY finished" — completely different tone! The adverb position before the verb creates a specific rhetorical effect: it colors the entire action.', '{"targetSentence":"She quietly finished her work","blocks":[{"id":"l4-e1-1","label":"She","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"l4-e1-2","label":"quietly","category":"modifier","isDistractor":false,"sourceOrder":2},{"id":"l4-e1-3","label":"finished","category":"verb","isDistractor":false,"sourceOrder":3},{"id":"l4-e1-4","label":"her work","category":"object","isDistractor":false,"sourceOrder":4},{"id":"l4-e1-5","label":"loudly","category":"modifier","isDistractor":true,"sourceOrder":5},{"id":"l4-e1-6","label":"started","category":"verb","isDistractor":true,"sourceOrder":6}]}'::jsonb
  from public.lessons l where l.legacy_id = 'lesson-4'
on conflict (legacy_id) do update set
  hint = excluded.hint, tutor_explanation = excluded.tutor_explanation,
  content = excluded.content, position = excluded.position;

insert into public.exercises
  (lesson_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select l.id, 'l4-e2', 'drag-and-drop', 2, 'published',
       'Subject + Modifier + Verb + Object', '"Nervously" before the verb creates tension — we feel his anxiety before we even know what he was doing. This adverb placement is used to SET THE EMOTIONAL TONE of the sentence. "He waited nervously for the results" is also correct, but puts less emphasis on the nervousness.', '{"targetSentence":"He nervously waited for the results","blocks":[{"id":"l4-e2-1","label":"He","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"l4-e2-2","label":"nervously","category":"modifier","isDistractor":false,"sourceOrder":2},{"id":"l4-e2-3","label":"waited for","category":"verb","isDistractor":false,"sourceOrder":3},{"id":"l4-e2-4","label":"the results","category":"object","isDistractor":false,"sourceOrder":4},{"id":"l4-e2-5","label":"confidently","category":"modifier","isDistractor":true,"sourceOrder":5}]}'::jsonb
  from public.lessons l where l.legacy_id = 'lesson-4'
on conflict (legacy_id) do update set
  hint = excluded.hint, tutor_explanation = excluded.tutor_explanation,
  content = excluded.content, position = excluded.position;

insert into public.exercises
  (lesson_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select l.id, 'l4-e3', 'drag-and-drop', 3, 'published',
       'Subject + Modifier + Verb + Object', '"Enthusiastically" sets a joyful, energetic tone before we even hear "celebrated." The long adverb before the verb builds anticipation. "Reluctantly celebrated" would mean the opposite — they didn''t want to celebrate. Word choice in adverbs completely changes the emotional meaning while keeping the same grammatical structure.', '{"targetSentence":"The team enthusiastically celebrated their victory","blocks":[{"id":"l4-e3-1","label":"The team","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"l4-e3-2","label":"enthusiastically","category":"modifier","isDistractor":false,"sourceOrder":2},{"id":"l4-e3-3","label":"celebrated","category":"verb","isDistractor":false,"sourceOrder":3},{"id":"l4-e3-4","label":"their victory","category":"object","isDistractor":false,"sourceOrder":4},{"id":"l4-e3-5","label":"reluctantly","category":"modifier","isDistractor":true,"sourceOrder":5},{"id":"l4-e3-6","label":"ignored","category":"verb","isDistractor":true,"sourceOrder":6}]}'::jsonb
  from public.lessons l where l.legacy_id = 'lesson-4'
on conflict (legacy_id) do update set
  hint = excluded.hint, tutor_explanation = excluded.tutor_explanation,
  content = excluded.content, position = excluded.position;

insert into public.lessons
  (unit_id, legacy_id, title, description, icon, path_level, cefr_level, difficulty, status, position)
select u.id, 'lesson-5', 'Tone in Context', 'Adverbs with time and place',
       '🗣️', 'intermediate', 'B1', 1, 'published', 5
  from public.units u where u.legacy_id = 'unit-intermediate'
on conflict (legacy_id) do update set
  title = excluded.title, description = excluded.description, icon = excluded.icon,
  path_level = excluded.path_level, position = excluded.position;

insert into public.exercises
  (lesson_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select l.id, 'l5-e1', 'drag-and-drop', 1, 'published',
       'Subject + Modifier + Verb + Object + Time', 'This combines tone (adverb) with time. The order is: WHO + HOW + DID WHAT + WHAT + WHEN. "Before the deadline" adds context — she wasn''t just quiet, she was efficient too. The adverb "quietly" modifies the verb, while "before the deadline" modifies the entire action.', '{"targetSentence":"She quietly finished her work before the deadline","blocks":[{"id":"l5-e1-1","label":"She","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"l5-e1-2","label":"quietly","category":"modifier","isDistractor":false,"sourceOrder":2},{"id":"l5-e1-3","label":"finished","category":"verb","isDistractor":false,"sourceOrder":3},{"id":"l5-e1-4","label":"her work","category":"object","isDistractor":false,"sourceOrder":4},{"id":"l5-e1-5","label":"before the deadline","category":"time","isDistractor":false,"sourceOrder":5},{"id":"l5-e1-6","label":"loudly","category":"modifier","isDistractor":true,"sourceOrder":6},{"id":"l5-e1-7","label":"at the office","category":"place","isDistractor":true,"sourceOrder":7}]}'::jsonb
  from public.lessons l where l.legacy_id = 'lesson-5'
on conflict (legacy_id) do update set
  hint = excluded.hint, tutor_explanation = excluded.tutor_explanation,
  content = excluded.content, position = excluded.position;

insert into public.exercises
  (lesson_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select l.id, 'l5-e2', 'drag-and-drop', 2, 'published',
       'Subject + Modifier + Verb + Object + Place', '"Carefully" before "prepared" emphasizes their diligence. The place ("at the library") goes at the end. Full pattern: WHO + HOW + DID WHAT + WHAT + WHERE. "Quickly" would change the tone entirely — suggesting they rushed rather than being thorough.', '{"targetSentence":"The students carefully prepared their presentation at the library","blocks":[{"id":"l5-e2-1","label":"The students","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"l5-e2-2","label":"carefully","category":"modifier","isDistractor":false,"sourceOrder":2},{"id":"l5-e2-3","label":"prepared","category":"verb","isDistractor":false,"sourceOrder":3},{"id":"l5-e2-4","label":"their presentation","category":"object","isDistractor":false,"sourceOrder":4},{"id":"l5-e2-5","label":"at the library","category":"place","isDistractor":false,"sourceOrder":5},{"id":"l5-e2-6","label":"quickly","category":"modifier","isDistractor":true,"sourceOrder":6},{"id":"l5-e2-7","label":"yesterday","category":"time","isDistractor":true,"sourceOrder":7}]}'::jsonb
  from public.lessons l where l.legacy_id = 'lesson-5'
on conflict (legacy_id) do update set
  hint = excluded.hint, tutor_explanation = excluded.tutor_explanation,
  content = excluded.content, position = excluded.position;

insert into public.lessons
  (unit_id, legacy_id, title, description, icon, path_level, cefr_level, difficulty, status, position)
select u.id, 'lesson-6', 'Contrast & Concession', 'Despite, although — unexpected outcomes',
       '⚡', 'advanced', 'B1', 1, 'published', 6
  from public.units u where u.legacy_id = 'unit-advanced'
on conflict (legacy_id) do update set
  title = excluded.title, description = excluded.description, icon = excluded.icon,
  path_level = excluded.path_level, position = excluded.position;

insert into public.exercises
  (lesson_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select l.id, 'l6-e1', 'drag-and-drop', 1, 'published',
       'Contrast clause + Subject + Verb + Object (fronting for emphasis)', '"Despite" introduces a CONCESSION — something that makes the main action surprising. By putting "Despite the rain" FIRST (fronting), we create dramatic tension: the reader expects failure, then gets success. This rhetorical device is called "fronted adverbial for contrast." "Because of" would change the logic entirely — it would mean the rain CAUSED the action.', '{"targetSentence":"Despite the rain the athletes completed the marathon","blocks":[{"id":"l6-e1-1","label":"Despite the rain","category":"contrast","isDistractor":false,"sourceOrder":1},{"id":"l6-e1-2","label":"the athletes","category":"subject","isDistractor":false,"sourceOrder":2},{"id":"l6-e1-3","label":"completed","category":"verb","isDistractor":false,"sourceOrder":3},{"id":"l6-e1-4","label":"the marathon","category":"object","isDistractor":false,"sourceOrder":4},{"id":"l6-e1-5","label":"Because of","category":"contrast","isDistractor":true,"sourceOrder":5},{"id":"l6-e1-6","label":"abandoned","category":"verb","isDistractor":true,"sourceOrder":6}]}'::jsonb
  from public.lessons l where l.legacy_id = 'lesson-6'
on conflict (legacy_id) do update set
  hint = excluded.hint, tutor_explanation = excluded.tutor_explanation,
  content = excluded.content, position = excluded.position;

insert into public.exercises
  (lesson_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select l.id, 'l6-e2', 'drag-and-drop', 2, 'published',
       'Contrast clause + Subject + Verb + Object + Time', '"Although" is a subordinating conjunction that introduces a concession clause. It signals: "this thing is true, BUT the main action happened anyway." The contrast clause MUST come before the main clause to create the surprise effect. "Because she rested" would imply a cause-and-effect relationship instead of contrast.', '{"targetSentence":"Although she was tired she finished the project on time","blocks":[{"id":"l6-e2-1","label":"Although she was tired","category":"contrast","isDistractor":false,"sourceOrder":1},{"id":"l6-e2-2","label":"she","category":"subject","isDistractor":false,"sourceOrder":2},{"id":"l6-e2-3","label":"finished","category":"verb","isDistractor":false,"sourceOrder":3},{"id":"l6-e2-4","label":"the project","category":"object","isDistractor":false,"sourceOrder":4},{"id":"l6-e2-5","label":"on time","category":"time","isDistractor":false,"sourceOrder":5},{"id":"l6-e2-6","label":"Because she rested","category":"contrast","isDistractor":true,"sourceOrder":6},{"id":"l6-e2-7","label":"started","category":"verb","isDistractor":true,"sourceOrder":7}]}'::jsonb
  from public.lessons l where l.legacy_id = 'lesson-6'
on conflict (legacy_id) do update set
  hint = excluded.hint, tutor_explanation = excluded.tutor_explanation,
  content = excluded.content, position = excluded.position;

insert into public.lessons
  (unit_id, legacy_id, title, description, icon, path_level, cefr_level, difficulty, status, position)
select u.id, 'lesson-7', 'Complex Structures', 'Participial phrases & parallel construction',
       '🏗️', 'advanced', 'B1', 1, 'published', 7
  from public.units u where u.legacy_id = 'unit-advanced'
on conflict (legacy_id) do update set
  title = excluded.title, description = excluded.description, icon = excluded.icon,
  path_level = excluded.path_level, position = excluded.position;

insert into public.exercises
  (lesson_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select l.id, 'l7-e1', 'drag-and-drop', 1, 'published',
       'Participial phrase + Subject + Modifier + Verb + Object', '"Having studied abroad" is a PARTICIPIAL PHRASE — it provides background information before the main clause. It tells us WHY she was confident without using "because." This is an advanced sentence-opening technique. The participial phrase must share the same subject as the main clause (she studied abroad AND she presented). A "dangling participle" error would occur if the subjects didn''t match.', '{"targetSentence":"Having studied abroad she confidently presented her research","blocks":[{"id":"l7-e1-1","label":"Having studied abroad","category":"modifier","isDistractor":false,"sourceOrder":1},{"id":"l7-e1-2","label":"she","category":"subject","isDistractor":false,"sourceOrder":2},{"id":"l7-e1-3","label":"confidently","category":"modifier","isDistractor":false,"sourceOrder":3},{"id":"l7-e1-4","label":"presented","category":"verb","isDistractor":false,"sourceOrder":4},{"id":"l7-e1-5","label":"her research","category":"object","isDistractor":false,"sourceOrder":5},{"id":"l7-e1-6","label":"nervously","category":"modifier","isDistractor":true,"sourceOrder":6},{"id":"l7-e1-7","label":"ignored","category":"verb","isDistractor":true,"sourceOrder":7}]}'::jsonb
  from public.lessons l where l.legacy_id = 'lesson-7'
on conflict (legacy_id) do update set
  hint = excluded.hint, tutor_explanation = excluded.tutor_explanation,
  content = excluded.content, position = excluded.position;

insert into public.exercises
  (lesson_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select l.id, 'l7-e2', 'drag-and-drop', 2, 'published',
       'Correlative conjunction: Not only... but also (parallel structure)', '"Not only... but also" is a CORRELATIVE CONJUNCTION that creates parallel structure. The two parts must be grammatically balanced: "did she excel" parallels "she also led." This structure emphasizes BOTH achievements equally. Note the subject-verb inversion after "Not only" — "did she" instead of "she did" — this is required for dramatic effect.', '{"targetSentence":"Not only did she excel academically but she also led the team","blocks":[{"id":"l7-e2-1","label":"Not only did she","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"l7-e2-2","label":"excel","category":"verb","isDistractor":false,"sourceOrder":2},{"id":"l7-e2-3","label":"academically","category":"modifier","isDistractor":false,"sourceOrder":3},{"id":"l7-e2-4","label":"but she also","category":"subject","isDistractor":false,"sourceOrder":4},{"id":"l7-e2-5","label":"led","category":"verb","isDistractor":false,"sourceOrder":5},{"id":"l7-e2-6","label":"the team","category":"object","isDistractor":false,"sourceOrder":6},{"id":"l7-e2-7","label":"failed","category":"verb","isDistractor":true,"sourceOrder":7},{"id":"l7-e2-8","label":"last year","category":"time","isDistractor":true,"sourceOrder":8}]}'::jsonb
  from public.lessons l where l.legacy_id = 'lesson-7'
on conflict (legacy_id) do update set
  hint = excluded.hint, tutor_explanation = excluded.tutor_explanation,
  content = excluded.content, position = excluded.position;

insert into public.placement_challenges
  (legacy_id, title, description, target_level, from_level, to_level, required_correct, status)
values
  ('challenge-beginner-to-intermediate', 'Beginner → Intermediate', 'Prove you''ve mastered basic sentence structure. Get 3 out of 4 correct to unlock Intermediate.',
   'A2', 'beginner',
   'intermediate', 3, 'published')
on conflict (legacy_id) do update set
  title = excluded.title, description = excluded.description, required_correct = excluded.required_correct;

insert into public.exercises
  (challenge_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select c.id, 'ch1-e1', 'drag-and-drop', 1, 'published',
       'Subject + Verb + Place + Time — combine everything you learned!', '', '{"targetSentence":"My sister works at the hospital every day","blocks":[{"id":"ch1-e1-1","label":"My sister","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"ch1-e1-2","label":"works","category":"verb","isDistractor":false,"sourceOrder":2},{"id":"ch1-e1-3","label":"at the hospital","category":"place","isDistractor":false,"sourceOrder":3},{"id":"ch1-e1-4","label":"every day","category":"time","isDistractor":false,"sourceOrder":4},{"id":"ch1-e1-5","label":"My brother","category":"subject","isDistractor":true,"sourceOrder":5},{"id":"ch1-e1-6","label":"last week","category":"time","isDistractor":true,"sourceOrder":6}]}'::jsonb
  from public.placement_challenges c where c.legacy_id = 'challenge-beginner-to-intermediate'
on conflict (legacy_id) do update set
  hint = excluded.hint, content = excluded.content, position = excluded.position;

insert into public.exercises
  (challenge_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select c.id, 'ch1-e2', 'drag-and-drop', 2, 'published',
       'Subject + Verb + Object + Place + Time', '', '{"targetSentence":"The children played games in the garden yesterday","blocks":[{"id":"ch1-e2-1","label":"The children","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"ch1-e2-2","label":"played","category":"verb","isDistractor":false,"sourceOrder":2},{"id":"ch1-e2-3","label":"games","category":"object","isDistractor":false,"sourceOrder":3},{"id":"ch1-e2-4","label":"in the garden","category":"place","isDistractor":false,"sourceOrder":4},{"id":"ch1-e2-5","label":"yesterday","category":"time","isDistractor":false,"sourceOrder":5},{"id":"ch1-e2-6","label":"watches","category":"verb","isDistractor":true,"sourceOrder":6},{"id":"ch1-e2-7","label":"tomorrow","category":"time","isDistractor":true,"sourceOrder":7}]}'::jsonb
  from public.placement_challenges c where c.legacy_id = 'challenge-beginner-to-intermediate'
on conflict (legacy_id) do update set
  hint = excluded.hint, content = excluded.content, position = excluded.position;

insert into public.exercises
  (challenge_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select c.id, 'ch1-e3', 'drag-and-drop', 3, 'published',
       'Subject + Verb + Object + Place + Time', '', '{"targetSentence":"He drinks coffee at the office every morning","blocks":[{"id":"ch1-e3-1","label":"He","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"ch1-e3-2","label":"drinks","category":"verb","isDistractor":false,"sourceOrder":2},{"id":"ch1-e3-3","label":"coffee","category":"object","isDistractor":false,"sourceOrder":3},{"id":"ch1-e3-4","label":"at the office","category":"place","isDistractor":false,"sourceOrder":4},{"id":"ch1-e3-5","label":"every morning","category":"time","isDistractor":false,"sourceOrder":5},{"id":"ch1-e3-6","label":"eats","category":"verb","isDistractor":true,"sourceOrder":6}]}'::jsonb
  from public.placement_challenges c where c.legacy_id = 'challenge-beginner-to-intermediate'
on conflict (legacy_id) do update set
  hint = excluded.hint, content = excluded.content, position = excluded.position;

insert into public.exercises
  (challenge_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select c.id, 'ch1-e4', 'drag-and-drop', 4, 'published',
       'Subject + Verb + Object + Place + Time', '', '{"targetSentence":"The students study English at school every afternoon","blocks":[{"id":"ch1-e4-1","label":"The students","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"ch1-e4-2","label":"study","category":"verb","isDistractor":false,"sourceOrder":2},{"id":"ch1-e4-3","label":"English","category":"object","isDistractor":false,"sourceOrder":3},{"id":"ch1-e4-4","label":"at school","category":"place","isDistractor":false,"sourceOrder":4},{"id":"ch1-e4-5","label":"every afternoon","category":"time","isDistractor":false,"sourceOrder":5},{"id":"ch1-e4-6","label":"teaches","category":"verb","isDistractor":true,"sourceOrder":6},{"id":"ch1-e4-7","label":"at night","category":"time","isDistractor":true,"sourceOrder":7}]}'::jsonb
  from public.placement_challenges c where c.legacy_id = 'challenge-beginner-to-intermediate'
on conflict (legacy_id) do update set
  hint = excluded.hint, content = excluded.content, position = excluded.position;

insert into public.placement_challenges
  (legacy_id, title, description, target_level, from_level, to_level, required_correct, status)
values
  ('challenge-intermediate-to-advanced', 'Intermediate → Advanced', 'Show you understand tone and adverb placement. Get 3 out of 4 correct to unlock Advanced.',
   'B2', 'intermediate',
   'advanced', 3, 'published')
on conflict (legacy_id) do update set
  title = excluded.title, description = excluded.description, required_correct = excluded.required_correct;

insert into public.exercises
  (challenge_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select c.id, 'ch2-e1', 'drag-and-drop', 1, 'published',
       'Subject + Modifier + Verb + Object + Place', '', '{"targetSentence":"She patiently explained the concept to her students at the university","blocks":[{"id":"ch2-e1-1","label":"She","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"ch2-e1-2","label":"patiently","category":"modifier","isDistractor":false,"sourceOrder":2},{"id":"ch2-e1-3","label":"explained","category":"verb","isDistractor":false,"sourceOrder":3},{"id":"ch2-e1-4","label":"the concept","category":"object","isDistractor":false,"sourceOrder":4},{"id":"ch2-e1-5","label":"to her students","category":"object","isDistractor":false,"sourceOrder":5},{"id":"ch2-e1-6","label":"at the university","category":"place","isDistractor":false,"sourceOrder":6},{"id":"ch2-e1-7","label":"hastily","category":"modifier","isDistractor":true,"sourceOrder":7},{"id":"ch2-e1-8","label":"ignored","category":"verb","isDistractor":true,"sourceOrder":8}]}'::jsonb
  from public.placement_challenges c where c.legacy_id = 'challenge-intermediate-to-advanced'
on conflict (legacy_id) do update set
  hint = excluded.hint, content = excluded.content, position = excluded.position;

insert into public.exercises
  (challenge_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select c.id, 'ch2-e2', 'drag-and-drop', 2, 'published',
       'Subject + Modifier + Verb + Object + Time', '', '{"targetSentence":"The manager carefully reviewed the reports before the meeting","blocks":[{"id":"ch2-e2-1","label":"The manager","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"ch2-e2-2","label":"carefully","category":"modifier","isDistractor":false,"sourceOrder":2},{"id":"ch2-e2-3","label":"reviewed","category":"verb","isDistractor":false,"sourceOrder":3},{"id":"ch2-e2-4","label":"the reports","category":"object","isDistractor":false,"sourceOrder":4},{"id":"ch2-e2-5","label":"before the meeting","category":"time","isDistractor":false,"sourceOrder":5},{"id":"ch2-e2-6","label":"carelessly","category":"modifier","isDistractor":true,"sourceOrder":6},{"id":"ch2-e2-7","label":"after lunch","category":"time","isDistractor":true,"sourceOrder":7}]}'::jsonb
  from public.placement_challenges c where c.legacy_id = 'challenge-intermediate-to-advanced'
on conflict (legacy_id) do update set
  hint = excluded.hint, content = excluded.content, position = excluded.position;

insert into public.exercises
  (challenge_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select c.id, 'ch2-e3', 'drag-and-drop', 3, 'published',
       'Subject + Modifier + Verb + Object + Place', '', '{"targetSentence":"They eagerly accepted the invitation to the conference","blocks":[{"id":"ch2-e3-1","label":"They","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"ch2-e3-2","label":"eagerly","category":"modifier","isDistractor":false,"sourceOrder":2},{"id":"ch2-e3-3","label":"accepted","category":"verb","isDistractor":false,"sourceOrder":3},{"id":"ch2-e3-4","label":"the invitation","category":"object","isDistractor":false,"sourceOrder":4},{"id":"ch2-e3-5","label":"to the conference","category":"place","isDistractor":false,"sourceOrder":5},{"id":"ch2-e3-6","label":"reluctantly","category":"modifier","isDistractor":true,"sourceOrder":6}]}'::jsonb
  from public.placement_challenges c where c.legacy_id = 'challenge-intermediate-to-advanced'
on conflict (legacy_id) do update set
  hint = excluded.hint, content = excluded.content, position = excluded.position;

insert into public.exercises
  (challenge_id, legacy_id, type, position, status, hint, tutor_explanation, content)
select c.id, 'ch2-e4', 'drag-and-drop', 4, 'published',
       'Subject + Modifier + Verb + Object + Place + Time', '', '{"targetSentence":"He silently observed the situation from the corner all evening","blocks":[{"id":"ch2-e4-1","label":"He","category":"subject","isDistractor":false,"sourceOrder":1},{"id":"ch2-e4-2","label":"silently","category":"modifier","isDistractor":false,"sourceOrder":2},{"id":"ch2-e4-3","label":"observed","category":"verb","isDistractor":false,"sourceOrder":3},{"id":"ch2-e4-4","label":"the situation","category":"object","isDistractor":false,"sourceOrder":4},{"id":"ch2-e4-5","label":"from the corner","category":"place","isDistractor":false,"sourceOrder":5},{"id":"ch2-e4-6","label":"all evening","category":"time","isDistractor":false,"sourceOrder":6},{"id":"ch2-e4-7","label":"loudly","category":"modifier","isDistractor":true,"sourceOrder":7},{"id":"ch2-e4-8","label":"created","category":"verb","isDistractor":true,"sourceOrder":8}]}'::jsonb
  from public.placement_challenges c where c.legacy_id = 'challenge-intermediate-to-advanced'
on conflict (legacy_id) do update set
  hint = excluded.hint, content = excluded.content, position = excluded.position;

insert into public.achievements
  (legacy_id, title, description, badge_icon, xp_reward, trigger_criteria, threshold_value)
values
  ('ach-first-lesson', 'First Lesson Complete', 'Complete your first lesson', '🏆', 20, 'lessons_completed', 1)
on conflict (legacy_id) do update set
  title = excluded.title, description = excluded.description, xp_reward = excluded.xp_reward;

insert into public.achievements
  (legacy_id, title, description, badge_icon, xp_reward, trigger_criteria, threshold_value)
values
  ('ach-streak-7', '7-Day Streak', 'Practice 7 days in a row', '🔥', 50, 'streak_days', 7)
on conflict (legacy_id) do update set
  title = excluded.title, description = excluded.description, xp_reward = excluded.xp_reward;

insert into public.achievements
  (legacy_id, title, description, badge_icon, xp_reward, trigger_criteria, threshold_value)
values
  ('ach-grammar-80', 'Grammar Score 80+', 'Reach an average grammar score of 80', '⭐', 75, 'grammar_score', 80)
on conflict (legacy_id) do update set
  title = excluded.title, description = excluded.description, xp_reward = excluded.xp_reward;

insert into public.achievements
  (legacy_id, title, description, badge_icon, xp_reward, trigger_criteria, threshold_value)
values
  ('ach-exercises-50', '50 Exercises Done', 'Complete 50 exercises', '💪', 100, 'exercises_completed', 50)
on conflict (legacy_id) do update set
  title = excluded.title, description = excluded.description, xp_reward = excluded.xp_reward;

insert into public.achievements
  (legacy_id, title, description, badge_icon, xp_reward, trigger_criteria, threshold_value)
values
  ('ach-challenge-1', 'Challenge Passed', 'Pass your first placement challenge', '🎯', 60, 'challenge_passed', 1)
on conflict (legacy_id) do update set
  title = excluded.title, description = excluded.description, xp_reward = excluded.xp_reward;

