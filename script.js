const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const micButton = document.getElementById("mic-button");
const cameraButton = document.getElementById("camera-button");
const uploadButton = document.getElementById("upload-button");
const attachInput = document.getElementById("attach-input");
const scrollButton = document.getElementById("scroll-button");
const cameraPanel = document.getElementById("camera-panel");
const cameraVideo = document.getElementById("camera-video");
const captureButton = document.getElementById("capture-button");
const closeCameraButton = document.getElementById("close-camera");
const rateUsStars = document.getElementById("rate-us-stars");

const chatHistory = [];
let activeQuiz = null;
let pendingQuiz = false;
let recorder = null;
let recordedChunks = [];
let cameraStream = null;

const grammarDB = {
  noun: {
    name: "Noun",
    level: "A1",
    emoji: "📘",
    definition: "A word that names a person, place, thing, or idea.",
    rules: "Nouns are subjects or objects in sentences. They can be countable (cat, cats) or uncountable (water, information).",
    examples: ["The teacher is kind.", "My phone is on the table.", "Friendship is important."],
    commonMistakes: ["❌ informations → ✓ information (uncountable)", "❌ peoples → ✓ people", "❌ advices → ✓ advice"],
    tip: "Remember: Countable nouns take 'a/an' or can be plural. Uncountable nouns are singular.",
    keywords: ["noun", "nouns", "person", "place", "thing", "idea", "naming word", "what is a noun", "define noun", "countable", "uncountable"]
  },
  verb: {
    name: "Verb",
    level: "A1",
    emoji: "🏃",
    definition: "A word that describes an action, state, or occurrence.",
    rules: "Verbs change form based on subject (I go, he goes) and tense (go, went, will go).",
    examples: ["I run every morning.", "She plays the piano.", "They have finished their homework."],
    commonMistakes: ["❌ he go → ✓ he goes", "❌ i am go → ✓ i am going", "❌ she dont know → ✓ she doesn't know"],
    tip: "For present simple: add -s/-es for he/she/it. For past: regular verbs add -ed; irregular verbs change form.",
    keywords: ["verb", "verbs", "run", "play", "do", "action word", "doing word", "what is a verb"]
  },
  adjective: {
    name: "Adjective",
    level: "A1",
    emoji: "✨",
    definition: "A word that describes or modifies a noun.",
    rules: "Adjectives usually come before the noun (big house) or after 'be' (The house is big). Order matters: size, age, color.",
    examples: ["The blue sky is beautiful.", "She has three red apples.", "The weather is cold and wet."],
    commonMistakes: ["❌ house big → ✓ a big house", "❌ the weather is beautifuls → ✓ the weather is beautiful"],
    tip: "Adjectives are not affected by singular/plural nouns: one big dog, three big dogs.",
    keywords: ["adjective", "adjectives", "describing word", "what describes", "color", "size", "beautiful", "big"]
  },
  gerund: {
    name: "Gerund",
    level: "A2",
    emoji: "🎯",
    definition: "A verb form ending in -ing that acts as a noun.",
    rules: "Use gerunds after verbs like: like, enjoy, hate, love, prefer, stop. Also after prepositions.",
    examples: ["I enjoy playing tennis.", "She is interested in learning Spanish.", "Swimming is good for your health."],
    commonMistakes: ["❌ I like to play tennis (possible but gerund is better)", "❌ I enjoy to swim → ✓ I enjoy swimming"],
    tip: "Gerunds are verbs acting as nouns. Use them after: enjoy, like, hate, practice, suggest, avoid.",
    keywords: ["gerund", "gerunds", "ing form", "-ing", "playing", "swimming", "running", "verb noun"]
  },
  infinitive: {
    name: "Infinitive",
    level: "A2",
    emoji: "🔵",
    definition: "The base form of a verb, usually preceded by 'to' (to go, to eat, to sleep).",
    rules: "Use infinitives after: want, would like, need, hope, plan, decide, promise, try. Also after adjectives.",
    examples: ["I want to travel the world.", "She needs to study for the exam.", "It is difficult to learn French."],
    commonMistakes: ["❌ I want go → ✓ I want to go", "❌ I try to not fail → ✓ I try not to fail"],
    tip: "Infinitive vs Gerund: 'I like to swim' (one-time) vs 'I like swimming' (general habit).",
    keywords: ["infinitive", "to go", "to eat", "to be", "base form", "to-infinitive", "why use to"]
  },
  "phrasal verb": {
    name: "Phrasal Verb",
    level: "A2",
    emoji: "⚡",
    definition: "A combination of a verb + adverb/preposition with a meaning different from individual words.",
    rules: "Some are separable (put on/put off): 'put on a shirt' or 'put a shirt on'. Others are not (look after): 'look after children' (not 'look children after').",
    examples: ["Wake up! (get out of bed)", "Turn off the light. (stop it)", "Look after my dog. (care for)", "I'm looking for my keys. (searching)"],
    commonMistakes: ["❌ wake the up → ✓ wake up", "❌ turn the off light → ✓ turn off the light (for non-separable)"],
    tip: "Phrasal verbs are VERY common in English! Common ones: turn on/off, put on/off, get up, go out, look after, look for, run out of.",
    keywords: ["phrasal verb", "phrasal verbs", "verb particle", "turn on", "turn off", "put on", "get up", "look after", "wake up"]
  },
  "relative clause": {
    name: "Relative Clause",
    level: "B1",
    emoji: "🔗",
    definition: "A clause that describes or gives more information about a noun, starting with who/which/that/where.",
    rules: "Use 'who' for people, 'which' for things, 'that' for both. Use 'where' for places. Put the clause after the noun it describes.",
    examples: ["The student who won the prize is happy.", "The book which I read was excellent.", "I like people that are honest.", "The café where we met is closed."],
    commonMistakes: ["❌ The person that I met him → ✓ The person that I met", "❌ The girl who she is my friend → ✓ The girl who is my friend"],
    tip: "Do not repeat the noun after the relative pronoun. Choose: who (people), which (things), that (both), where (places).",
    keywords: ["relative clause", "who", "which", "that", "where", "describing clause", "subordinate clause"]
  },
  conjunction: {
    name: "Conjunction",
    level: "A2",
    emoji: "🔀",
    definition: "A word that connects two words, phrases, or clauses (and, but, or, because, although, while).",
    rules: "Coordinating conjunctions (and, but, or) connect equal things. Subordinating conjunctions (because, although, if) connect main and dependent clauses.",
    examples: ["I like tea and coffee.", "She is rich but unhappy.", "We stayed because it was raining.", "Although she was tired, she kept working."],
    commonMistakes: ["❌ I like tea and also coffee (redundant)", "❌ Because it was raining, so we stayed (wrong structure)"],
    tip: "Common conjunctions: and, but, or (coordinating); because, although, while, if, when (subordinating). Don't use both 'because' and 'so' together.",
    keywords: ["conjunction", "conjunctions", "and", "but", "or", "because", "although", "connecting word"]
  },
  "question tag": {
    name: "Question Tag",
    level: "B1",
    emoji: "❓",
    definition: "A short question at the end of a statement to confirm or check information (isn't it?, do you?, won't they?).",
    rules: "If statement is positive, tag is negative (and vice versa). Use the same auxiliary verb as the statement.",
    examples: ["You're tired, aren't you?", "She doesn't like fish, does she?", "They will come, won't they?", "It's beautiful, isn't it?"],
    commonMistakes: ["❌ You are happy, are you? → ✓ You are happy, aren't you?", "❌ She goes, doesn't he? → ✓ She goes, doesn't she?"],
    tip: "Match the auxiliary verb and keep the opposite polarity. Present: are/aren't, does/doesn't. Past: was/wasn't, did/didn't.",
    keywords: ["question tag", "tag question", "isn't it", "won't they", "do you", "auxiliary verb", "confirmation"]
  },
  preposition: {
    name: "Preposition",
    level: "A1",
    emoji: "📍",
    definition: "A word showing the relationship between a noun and other words (in, on, at, under, between, during, after).",
    rules: "Prepositions of place: in, on, at, under, beside, between, inside. Prepositions of time: at, on, in, during, after, before.",
    examples: ["The book is on the table.", "She arrives at 8 AM.", "We met during the conference.", "Put the ball under the bed."],
    commonMistakes: ["❌ on the morning → ✓ in the morning", "❌ at Monday → ✓ on Monday", "❌ the key of the door → ✓ the key to the door"],
    tip: "Time: 'at 5 o'clock', 'on Monday', 'in July'. Place: 'at home', 'on the table', 'in the box'.",
    keywords: ["preposition", "prepositions", "in", "on", "at", "under", "between", "during", "location", "time"]
  },
  pronoun: {
    name: "Pronoun",
    level: "A1",
    emoji: "👤",
    definition: "A word that replaces a noun to avoid repetition (I, you, he, she, it, we, they, me, him, her).",
    rules: "Subject pronouns: I, you, he, she, it, we, they. Object pronouns: me, you, him, her, it, us, them. Possessive: my, your, his, her, its, our, their.",
    examples: ["I am happy. You are happy too.", "He gave her the book. She thanked him.", "We met them yesterday. They helped us."],
    commonMistakes: ["❌ Him and me are friends → ✓ He and I are friends", "❌ Give the book to I → ✓ Give the book to me"],
    tip: "Use subject pronouns (I, he, she) as the subject of a sentence. Use object pronouns (me, him, her) after verbs or prepositions.",
    keywords: ["pronoun", "pronouns", "he", "she", "it", "they", "me", "you", "subject pronoun", "object pronoun"]
  },
  "present simple": {
    name: "Present Simple",
    level: "A1",
    emoji: "⏱️",
    definition: "The tense for habits, facts, routines, and permanent states.",
    rules: "For I/you/we/they: use base verb. For he/she/it: add -s or -es. Questions: 'Do you go?' Negatives: 'I don't go.'",
    examples: ["I go to school every day.", "She plays tennis on Saturdays.", "Water boils at 100°C.", "They don't like coffee."],
    commonMistakes: ["❌ he go → ✓ he goes", "❌ she play tennis → ✓ she plays tennis", "❌ do he like it? → ✓ does he like it?"],
    tip: "Remember: he/she/it adds -s. 'He go' is WRONG. Use present simple for facts, habits, and routines.",
    keywords: ["present simple", "simple present", "do", "does", "every day", "always", "habit", "fact"]
  },
  "present continuous": {
    name: "Present Continuous",
    level: "A1",
    emoji: "🎬",
    definition: "The tense for actions happening RIGHT NOW or currently in progress.",
    rules: "Form: am/is/are + verb-ing. Questions: 'Are you studying?' Negatives: 'I'm not studying.'",
    examples: ["I am learning English right now.", "They are playing football.", "She is reading a book.", "We aren't watching TV."],
    commonMistakes: ["❌ I am study → ✓ I am studying", "❌ she is go → ✓ she is going"],
    tip: "Use NOW, AT THIS MOMENT with present continuous. Use present simple for habits. 'I play tennis' (usually) vs 'I am playing' (now).",
    keywords: ["present continuous", "present progressive", "ing", "now", "right now", "at this moment", "currently"]
  },
  "past simple": {
    name: "Past Simple",
    level: "A1",
    emoji: "📚",
    definition: "The tense for completed actions in the past. It's finished and we're not doing it anymore.",
    rules: "Regular verbs: add -ed (played, studied). Irregular: change form (went, saw, ate). Questions: 'Did you go?' Negatives: 'I didn't go.'",
    examples: ["I visited my aunt yesterday.", "She went to the market.", "They didn't watch the movie.", "Where did you go last week?"],
    commonMistakes: ["❌ I go to Paris last year → ✓ I went to Paris last year", "❌ she didn't saw him → ✓ she didn't see him"],
    tip: "Past simple is for finished actions. Use 'did' to form questions and negatives (don't add -ed to the main verb).",
    keywords: ["past simple", "yesterday", "last week", "ago", "did", "irregular verbs", "completed action"]
  },
  "future forms": {
    name: "Future Forms",
    level: "A2",
    emoji: "🚀",
    definition: "Different ways to talk about the future: 'will', 'be going to', and present continuous for arrangements.",
    rules: "'Will' for predictions/decisions (I will call). 'Going to' for plans (I'm going to study). Present continuous for fixed arrangements (We are meeting tomorrow).",
    examples: ["I will call you later.", "She is going to study tonight.", "We are meeting at 7 PM tomorrow.", "It will rain tomorrow."],
    commonMistakes: ["❌ I will going to study → ✓ I will study OR I am going to study", "❌ he will goes → ✓ he will go"],
    tip: "'Will' = instant decision or prediction. 'Going to' = plan you already made. Present continuous = fixed appointment.",
    keywords: ["future", "will", "going to", "be going to", "tomorrow", "next week", "shall", "future tense"]
  },
  conditional: {
    name: "Conditional",
    level: "B1",
    emoji: "🔄",
    definition: "Sentences with 'if' showing cause and effect, or imaginary situations.",
    rules: "1st: 'If + present, will + verb' (possible). 2nd: 'If + past, would + verb' (imaginary). 3rd: 'If + had, would have' (impossible - past).",
    examples: ["If it rains, I will stay home.", "If I were rich, I would travel the world.", "If they had left earlier, they would have arrived on time."],
    commonMistakes: ["❌ If I will go, I will be happy → ✓ If I go, I will be happy", "❌ If I was rich → ✓ If I were rich (formal)"],
    tip: "First conditional (real future) vs Second conditional (unreal now) vs Third conditional (impossible past).",
    keywords: ["conditional", "if", "first conditional", "second conditional", "third conditional", "would", "could"]
  },
  auxiliary: {
    name: "Auxiliary Verbs",
    level: "A1",
    emoji: "🔧",
    definition: "Helping verbs used with main verbs to form tenses, questions, negatives, and passives (am/is/are/do/does/did/have/has).",
    rules: "Use 'do/does/did' for questions and negatives in simple tenses. Use be/have as auxiliaries for continuous/perfect tenses and passive constructions.",
    examples: ["Do you like coffee?", "She is reading a book.", "They have finished."],
    commonMistakes: ["❌ He don't like → ✓ He doesn't like", "❌ I am go → ✓ I am going"],
    tip: "Remember: 'do' for questions in present simple, 'did' for past simple. 'Be' and 'have' change with tense and subject.",
    keywords: ["auxiliary", "auxiliaries", "do", "does", "did", "have", "has", "am", "is", "are"]
  },
  "present perfect": {
    name: "Present Perfect",
    level: "A2",
    emoji: "⏳",
    definition: "Uses 'have/has' + past participle to link past actions to the present.",
    rules: "Use for experiences, past actions with present relevance, and actions that started in the past and continue. Form: have/has + past participle.",
    examples: ["I have visited London.", "She has just finished her homework.", "We have lived here for five years."],
    commonMistakes: ["❌ I have went → ✓ I have gone", "❌ I have 2010 → ✓ I went in 2010 (use past simple for finished past time)"],
    tip: "Use present perfect for 'ever/never/already/just/yet' contexts.",
    keywords: ["present perfect", "have done", "has done", "have/has + past participle", "have you ever"]
  },
  "past perfect": {
    name: "Past Perfect",
    level: "B1",
    emoji: "⏮️",
    definition: "Uses 'had' + past participle to show an action completed before another past action.",
    rules: "Use past perfect for the earlier of two past actions. Form: had + past participle.",
    examples: ["She had left before I arrived.", "They had finished the work when he called."],
    commonMistakes: ["❌ I had went → ✓ I had gone"],
    tip: "If you mention a clear past time (yesterday, in 2010), prefer past simple unless ordering must be explicit.",
    keywords: ["past perfect", "had gone", "had + past participle", "before", "already"]
  },
  imperative: {
    name: "Imperative",
    level: "A1",
    emoji: "⚠️",
    definition: "Commands, instructions, or requests using the base verb (Sit down!, Don't move!).",
    rules: "Use base verb for positive commands. Use 'don't' + base verb for negatives. Use 'please' for politeness.",
    examples: ["Sit down!", "Don't talk during the lesson.", "Please pass the salt."],
    commonMistakes: ["❌ You sit down! → ✓ Sit down!"],
    tip: "Imperatives often omit the subject 'you'. Tone changes politeness.",
    keywords: ["imperative", "command", "order", "sit down", "don't", "please"]
  },
  "passive voice": {
    name: "Passive Voice",
    level: "B1",
    emoji: "🔁",
    definition: "The subject receives the action: form is 'be' + past participle (The cake was eaten).",
    rules: "Use passive when the doer is unknown or unimportant. Tenses: am/is/are/was/were + past participle; perfect and modals combine with 'been'.",
    examples: ["The letter was written by John.", "The room is cleaned every day.", "The project has been completed."],
    commonMistakes: ["❌ The cake eaten by John → ✓ The cake was eaten by John"],
    tip: "Passive focuses on the action or receiver, not the actor.",
    keywords: ["passive", "passive voice", "was written", "is cleaned", "been"]
  },
  "reported speech": {
    name: "Reported Speech",
    level: "B1",
    emoji: "💬",
    definition: "Also called indirect speech: report what someone said, often shifting tenses back.",
    rules: "Backshift tenses when reporting past statements (present → past, past → past perfect). Use 'said (that)' or reporting verbs like 'told', 'asked'.",
    examples: ["He said (that) he was tired.", "She told me she would come later."],
    commonMistakes: ["❌ He says he went → ✓ He said he had gone (if original was past)"],
    tip: "When reporting questions, we often use 'if/whether' and change word order to statement form.",
    keywords: ["reported speech", "indirect speech", "said", "told", "reported" ]
  },
  adverb: {
    name: "Adverb",
    level: "A2",
    emoji: "🕒",
    definition: "Words that modify verbs, adjectives, or other adverbs: time, manner, frequency, degree.",
    rules: "Place adverbs of manner after the verb or before the main verb depending on type. Frequency adverbs usually before the main verb but after 'be'.",
    examples: ["She runs quickly.", "He often visits.", "They arrived yesterday."],
    commonMistakes: ["❌ He speaks quick → ✓ He speaks quickly"],
    tip: "Time (yesterday/now), manner (quickly), frequency (always/sometimes). Positioning differs by adverb type.",
    keywords: ["adverb", "adverbs", "quickly", "always", "sometimes", "yesterday", "now"]
  },
  "sentence types": {
    name: "Sentence Types",
    level: "A1",
    emoji: "🔤",
    definition: "Different forms: statements, questions, negatives, exclamations.",
    rules: ["Statement: subject + verb + object.", "Question: auxiliary + subject + verb.", "Negative: add not after auxiliary.", "Exclamation: use ! and strong intonation."],
    examples: ["She likes apples.", "Do you like apples?", "I do not like apples.", "What a beautiful day!"],
    commonMistakes: ["❌ You like? → ✓ Do you like?"],
    tip: "Recognise sentence type by word order and punctuation.",
    keywords: ["statement", "question", "negative", "exclamation", "sentence types"]
  },
  "question types": {
    name: "Question Types",
    level: "A1",
    emoji: "❓",
    definition: "WH questions, yes/no questions, and indirect questions.",
    rules: "WH questions use question words and invert auxiliary + subject. Yes/No questions invert auxiliary and subject. Indirect questions use reporting verbs + question word + statement order.",
    examples: ["Where do you live?", "Did you go?", "Can you tell me where he lives?"],
    commonMistakes: ["❌ Where he lives? → ✓ Where does he live?"],
    tip: "Use auxiliaries (do/does/did) for simple tenses in questions.",
    keywords: ["wh questions", "yes/no questions", "indirect questions", "where", "why", "how"]
  },
  articles: {
    name: "Articles",
    level: "A2",
    emoji: "📝",
    definition: "Use of 'a', 'an', 'the' and zero article in English.",
    rules: "Use 'a/an' for non-specific singular nouns; 'the' for specific nouns; zero article for uncountable or plural when general.",
    examples: ["I saw a dog.", "The dog you saw was mine.", "Water is essential."],
    commonMistakes: ["❌ I saw the dog (when introducing new info) → ✓ I saw a dog"],
    tip: "Choose 'a' before consonant sounds, 'an' before vowel sounds. Use 'the' when the listener knows the referent.",
    keywords: ["a an the", "articles", "zero article", "specific", "general"]
  },
  "prepositions advanced": {
    name: "Prepositions (Advanced)",
    level: "A2",
    emoji: "📍",
    definition: "Prepositions showing time, place, movement and common collocations.",
    rules: "Distinguish prepositions of time (at/on/in), place (in/on/at), and movement (to/into/onto). Learn common collocations (interested in, good at).",
    examples: ["She arrived at 5 pm.", "He walked into the room.", "I'm good at tennis."],
    commonMistakes: ["❌ at Monday → ✓ on Monday", "❌ in the bus → ✓ on the bus (depends on variety)"],
    tip: "Memorise common collocations and note regional variations (on the weekend vs at the weekend).",
    keywords: ["preposition", "movement", "collocation", "on the bus", "in the car", "arrive at"]
  },
  "pronoun types": {
    name: "Pronoun Types",
    level: "A1",
    emoji: "👥",
    definition: "Subject, object, possessive and reflexive pronouns and their uses.",
    rules: "Subject: I/you/he... Object: me/you/him... Possessive adjectives: my/your... Possessive pronouns: mine/yours. Reflexive: myself/yourself.",
    examples: ["She gave it to me.", "That book is mine.", "He hurt himself."],
    commonMistakes: ["❌ Give the book to I → ✓ Give the book to me"],
    tip: "Use reflexive pronouns only when subject and object are same.",
    keywords: ["subject pronoun", "object pronoun", "possessive", "reflexive", "my mine yourself"]
  },
  "confusing words": {
    name: "Common Confusing Words",
    level: "A2",
    emoji: "⚖️",
    definition: "Pairs and sets of words often mixed up (its/it's, there/their/they're, much/many).",
    rules: "Learn meaning and usage: 'its' = possessive, 'it's' = it is. 'There' = place, 'their' = possessive, 'they're' = they are.",
    examples: ["It's time to go.", "Their house is big.", "How many apples? How much water?"],
    commonMistakes: ["❌ Its raining → ✓ It's raining", "❌ Their going home → ✓ They're going home"],
    tip: "When in doubt, expand contractions: 'it's' = 'it is'. Check if possession is needed for 'its'.",
    keywords: ["its vs it's", "there their they're", "much vs many", "do vs make", "say vs tell"]
  },
  modals: {
    name: "Modal Verbs",
    level: "A2",
    emoji: "🔔",
    definition: "Verbs that express ability, permission, obligation, possibility or advice (can, could, may, might, must, should, would).",
    rules: "Modals are followed by base verb. 'Must' expresses strong obligation; 'should' gives advice; 'may/might' express possibility.",
    examples: ["You must stop.", "You should study.", "She might come later."],
    commonMistakes: ["❌ You mustn't to go → ✓ You mustn't go"],
    tip: "Modals do not change form for different subjects and are followed by the base verb.",
    keywords: ["must", "mustn't", "should", "shouldn't", "may", "might", "could", "would", "can", "cannot"]
  },
  punctuation: {
    name: "Punctuation Rules",
    level: "A1",
    emoji: "✍️",
    definition: "Basic rules for full stops, commas, question marks, and apostrophes.",
    rules: "Use full stop to end statements. Commas separate items or clauses. Question marks end questions. Apostrophes show possession or contractions.",
    examples: ["She said, 'Hello.'", "I can't go.", "John's book is here."],
    commonMistakes: ["❌ Its a cat → ✓ It's a cat (contraction)", "❌ Johns book → ✓ John's book (possession)"],
    tip: "Practice punctuation by reading sentences aloud to hear natural pauses.",
    keywords: ["period", "comma", "question mark", "apostrophe", "punctuation"]
  }
};
const additionalGrammarDB = {
  "singular and plural nouns": {
    name: "Singular and Plural Nouns",
    level: "A1",
    emoji: "📚",
    definition: "Nouns that refer to one person, animal, place, or thing (singular) or more than one (plural).",
    rules: "Most nouns form plurals by adding -s. Nouns ending in -s, -sh, -ch, -x, or -z usually take -es. Some nouns have irregular plurals, such as child → children.",
    examples: ["One cat, two cats.", "One box, three boxes.", "One child, two children."],
    commonMistakes: ["❌ two childs → ✓ two children", "❌ three box → ✓ three boxes"],
    tip: "Learn the spelling rules and remember common irregular plurals.",
    keywords: ["singular", "plural", "nouns", "cats", "children", "boxes"]
  },

  "proper and common nouns": {
    name: "Proper and Common Nouns",
    level: "A1",
    emoji: "🏷️",
    definition: "Common nouns name general people, places, or things. Proper nouns name specific people, places, or things.",
    rules: "Common nouns usually begin with lowercase letters. Proper nouns begin with capital letters.",
    examples: ["The girl is reading.", "Sara lives in Pakistan.", "I visited London."],
    commonMistakes: ["❌ i live in pakistan → ✓ I live in Pakistan", "❌ my friend ali → ✓ My friend Ali"],
    tip: "Use capital letters for names of people, countries, cities, and specific places.",
    keywords: ["proper noun", "common noun", "capital letters", "names"]
  },

  "possessive nouns": {
    name: "Possessive Nouns",
    level: "A1",
    emoji: "🔑",
    definition: "Nouns that show ownership or possession.",
    rules: "Add 's to most singular nouns. Add an apostrophe to regular plural nouns ending in -s. For irregular plurals, add 's.",
    examples: ["This is Sarah's book.", "The girls' classroom is clean.", "The children's toys are colourful."],
    commonMistakes: ["❌ Sarahs book → ✓ Sarah's book", "❌ girls's bags → ✓ girls' bags"],
    tip: "Use an apostrophe to show ownership.",
    keywords: ["possessive nouns", "apostrophe", "ownership", "Sarah's", "girls'"]
  },

  "subject-verb agreement": {
    name: "Subject-Verb Agreement",
    level: "A1",
    emoji: "🤝",
    definition: "The rule that a verb must agree with its subject in number and person.",
    rules: "In the present simple, add -s or -es to most verbs with he, she, and it. Use the base form with I, you, we, and they.",
    examples: ["She likes apples.", "They play football.", "The dog barks loudly."],
    commonMistakes: ["❌ She like tea → ✓ She likes tea", "❌ They plays football → ✓ They play football"],
    tip: "Find the subject first, then choose the correct verb.",
    keywords: ["subject verb agreement", "singular subject", "plural subject", "verb forms"]
  },

  "adverbs of frequency": {
    name: "Adverbs of Frequency",
    level: "A1",
    emoji: "🕒",
    definition: "Words that tell us how often something happens.",
    rules: "Common adverbs include always, usually, often, sometimes, rarely, and never. They usually come before the main verb but after the verb 'be'.",
    examples: ["I always brush my teeth.", "She is usually happy.", "They sometimes play outside."],
    commonMistakes: ["❌ She goes always to school → ✓ She always goes to school"],
    tip: "Remember the usual order: subject + frequency adverb + main verb.",
    keywords: ["adverbs of frequency", "always", "usually", "often", "sometimes", "never"]
  },

  "comparatives and superlatives": {
    name: "Comparatives and Superlatives",
    level: "A1-A2",
    emoji: "📏",
    definition: "Comparatives compare two things, while superlatives identify the highest or lowest degree among three or more.",
    rules: "Short adjectives usually take -er and -est. Longer adjectives often use more and most. Some forms are irregular, such as good, better, best.",
    examples: ["Ali is taller than Ahmed.", "This is the tallest building.", "This book is more interesting than that one."],
    commonMistakes: ["❌ more taller → ✓ taller", "❌ the most tallest → ✓ the tallest"],
    tip: "Use 'than' with comparatives and usually 'the' with superlatives.",
    keywords: ["comparative", "superlative", "taller", "tallest", "more", "most"]
  },

  "past continuous": {
    name: "Past Continuous",
    level: "A2",
    emoji: "⏳",
    definition: "A tense used for actions that were in progress at a particular time in the past.",
    rules: "Form: was/were + verb-ing. Use it for an ongoing past action or an action interrupted by another event.",
    examples: ["I was reading at 8 pm.", "They were playing when it started raining.", "She was cooking while he was studying."],
    commonMistakes: ["❌ I were sleeping → ✓ I was sleeping", "❌ They was playing → ✓ They were playing"],
    tip: "Use 'was' with I, he, she, and it. Use 'were' with you, we, and they.",
    keywords: ["past continuous", "past progressive", "was", "were", "verb ing"]
  },

  "present perfect continuous": {
    name: "Present Perfect Continuous",
    level: "B1",
    emoji: "⌛",
    definition: "A tense used for actions that started in the past and continue into the present or have recently stopped.",
    rules: "Form: have/has + been + verb-ing. Use 'for' to express duration and 'since' to express a starting point.",
    examples: ["I have been studying for two hours.", "She has been working since morning.", "It has been raining all day."],
    commonMistakes: ["❌ She have been working → ✓ She has been working", "❌ I have been study → ✓ I have been studying"],
    tip: "Use this tense to emphasise the duration or ongoing nature of an activity.",
    keywords: ["present perfect continuous", "have been", "has been", "for", "since"]
  },

  "future continuous": {
    name: "Future Continuous",
    level: "B1",
    emoji: "🔮",
    definition: "A tense used for actions that will be in progress at a particular time in the future.",
    rules: "Form: will be + verb-ing.",
    examples: ["I will be studying at 8 pm.", "She will be travelling tomorrow.", "They will be waiting for us."],
    commonMistakes: ["❌ I will studying → ✓ I will be studying", "❌ She will be study → ✓ She will be studying"],
    tip: "Use 'will be + -ing' to describe an ongoing future action.",
    keywords: ["future continuous", "will be", "future progressive"]
  },

  "future perfect": {
    name: "Future Perfect",
    level: "B2",
    emoji: "🏁",
    definition: "A tense used for actions that will be completed before a particular time in the future.",
    rules: "Form: will have + past participle. It is often used with 'by' and a future time expression.",
    examples: ["I will have finished by Friday.", "She will have graduated by next year.", "They will have arrived by noon."],
    commonMistakes: ["❌ I will have finish → ✓ I will have finished", "❌ She will has completed → ✓ She will have completed"],
    tip: "Use 'will have + past participle' to describe something completed before a future deadline.",
    keywords: ["future perfect", "will have", "by tomorrow", "by then"]
  },

  "past perfect continuous": {
    name: "Past Perfect Continuous",
    level: "B2",
    emoji: "⏮️",
    definition: "A tense used to describe an action that continued for some time before another past event.",
    rules: "Form: had been + verb-ing. It often emphasises the duration of an earlier past activity.",
    examples: ["She had been studying for hours before the exam.", "They had been waiting for an hour when the bus arrived.", "He was tired because he had been running."],
    commonMistakes: ["❌ She had been study → ✓ She had been studying", "❌ They have been waiting before he arrived → ✓ They had been waiting before he arrived"],
    tip: "Use this tense to emphasise how long an activity continued before a past event.",
    keywords: ["past perfect continuous", "had been", "duration", "before"]
  },

  "zero conditional": {
    name: "Zero Conditional",
    level: "B1",
    emoji: "🔄",
    definition: "A sentence structure used to express general truths, facts, and things that always happen under certain conditions.",
    rules: "Form: If + present simple, present simple. You can also use 'when' instead of 'if' for general truths.",
    examples: ["If you heat ice, it melts.", "If it rains, the ground gets wet.", "When water reaches 100°C, it boils."],
    commonMistakes: ["❌ If you heat ice, it will melts → ✓ If you heat ice, it melts"],
    tip: "Use the zero conditional for facts and predictable results.",
    keywords: ["zero conditional", "if", "general truth", "facts"]
  },

  "mixed conditionals": {
    name: "Mixed Conditionals",
    level: "B2",
    emoji: "🔀",
    definition: "Conditional sentences that combine different times, usually connecting a past situation with a present result.",
    rules: "A common form is: If + past perfect, would + base verb. Another form is: If + past simple, would have + past participle.",
    examples: ["If I had studied medicine, I would be a doctor now.", "If she were more organised, she wouldn't have missed the appointment."],
    commonMistakes: ["❌ If I had studied, I will be a doctor now → ✓ If I had studied, I would be a doctor now"],
    tip: "Mixed conditionals connect different time periods. Check whether the condition and result refer to the past or present.",
    keywords: ["mixed conditionals", "past perfect", "would", "imaginary situations"]
  },

  "relative pronouns": {
    name: "Relative Pronouns",
    level: "B1",
    emoji: "🔗",
    definition: "Words such as who, whom, whose, which, and that used to introduce relative clauses.",
    rules: "Use 'who' for people, 'whom' for the object of a verb or preposition, 'whose' for possession, and 'which' for things. 'That' can refer to people or things in defining clauses.",
    examples: ["The girl who won is my friend.", "The man whom I met was kind.", "The student whose bag was lost is upset.", "The book that I bought is interesting."],
    commonMistakes: ["❌ The girl which won → ✓ The girl who won", "❌ The boy who's bag is red → ✓ The boy whose bag is red"],
    tip: "Choose the relative pronoun according to the noun it refers to and its role in the clause.",
    keywords: ["relative pronouns", "who", "whom", "whose", "which", "that"]
  },

  "determiners": {
    name: "Determiners",
    level: "A2",
    emoji: "📝",
    definition: "Words placed before nouns to specify quantity, ownership, or which person or thing is meant.",
    rules: "Common determiners include some, any, much, many, each, every, and enough. Use 'many' with countable nouns and 'much' with uncountable nouns.",
    examples: ["I have some books.", "Do you have any water?", "There aren't many apples.", "We don't have much time."],
    commonMistakes: ["❌ much apples → ✓ many apples", "❌ many water → ✓ much water"],
    tip: "Check whether a noun is countable or uncountable before choosing a quantity determiner.",
    keywords: ["determiners", "some", "any", "much", "many", "each", "every", "enough"]
  },

  "quantifiers": {
    name: "Quantifiers",
    level: "A2",
    emoji: "🔢",
    definition: "Words or phrases that express the quantity or amount of something.",
    rules: "Use 'few' and 'a few' with plural countable nouns. Use 'little' and 'a little' with uncountable nouns. 'Several' is used with plural countable nouns.",
    examples: ["I have a few friends.", "There is a little milk left.", "Several students were absent."],
    commonMistakes: ["❌ a few milk → ✓ a little milk", "❌ a little books → ✓ a few books"],
    tip: "'Few' and 'little' suggest a small or insufficient amount; 'a few' and 'a little' suggest some.",
    keywords: ["quantifiers", "few", "a few", "little", "a little", "several"]
  },

  "demonstratives": {
    name: "Demonstratives",
    level: "A1",
    emoji: "👉",
    definition: "Words used to point to specific people or things: this, that, these, and those.",
    rules: "Use 'this' and 'these' for things near you. Use 'that' and 'those' for things farther away. 'This' and 'that' are singular; 'these' and 'those' are plural.",
    examples: ["This is my pen.", "That is your bag.", "These are my books.", "Those are beautiful flowers."],
    commonMistakes: ["❌ These is my books → ✓ These are my books", "❌ This are my shoes → ✓ These are my shoes"],
    tip: "Remember: this/that are singular, while these/those are plural.",
    keywords: ["demonstratives", "this", "that", "these", "those"]
  },

  "possessive adjectives": {
    name: "Possessive Adjectives",
    level: "A1",
    emoji: "👤",
    definition: "Words that show ownership and come before nouns.",
    rules: "The possessive adjectives are my, your, his, her, its, our, and their. They are always followed by a noun or noun phrase.",
    examples: ["This is my book.", "Their house is beautiful.", "She loves her cat."],
    commonMistakes: ["❌ This is mine book → ✓ This is my book", "❌ He loves he's dog → ✓ He loves his dog"],
    tip: "Use possessive adjectives before nouns and possessive pronouns without nouns.",
    keywords: ["possessive adjectives", "my", "your", "his", "her", "its", "our", "their"]
  },

  "reflexive pronouns": {
    name: "Reflexive Pronouns",
    level: "A2",
    emoji: "🪞",
    definition: "Pronouns ending in -self or -selves that refer back to the subject.",
    rules: "Use myself, yourself, himself, herself, itself, ourselves, yourselves, and themselves when the subject and object refer to the same person or thing.",
    examples: ["I taught myself to swim.", "She looked at herself in the mirror.", "They prepared themselves for the exam."],
    commonMistakes: ["❌ She hurt hisself → ✓ She hurt herself", "❌ I did it by me → ✓ I did it by myself"],
    tip: "Use a reflexive pronoun when the subject and object are the same.",
    keywords: ["reflexive pronouns", "myself", "yourself", "himself", "herself", "themselves"]
  },

  "subject and object questions": {
    name: "Subject and Object Questions",
    level: "A2",
    emoji: "❓",
    definition: "Questions that ask who or what performs an action or receives it.",
    rules: "Subject questions ask who or what performs the action and usually do not need do, does, or did. Object questions usually require an auxiliary verb.",
    examples: ["Who called you? (subject)", "Who did you call? (object)", "What happened? (subject)", "What did you buy? (object)"],
    commonMistakes: ["❌ Who did call you? → ✓ Who called you?", "❌ Who you met? → ✓ Who did you meet?"],
    tip: "If the question word is the subject, you usually do not need 'do', 'does', or 'did'.",
    keywords: ["subject questions", "object questions", "who", "what", "did"]
  },

  "indirect questions": {
    name: "Indirect Questions",
    level: "B1",
    emoji: "💬",
    definition: "Polite or less direct questions embedded within another sentence.",
    rules: "Use statement word order after the question word or if/whether. Do not use do, does, or did in the embedded question.",
    examples: ["Could you tell me where he lives?", "Do you know what time it is?", "Can you tell me if she is coming?"],
    commonMistakes: ["❌ Can you tell me where does he live? → ✓ Can you tell me where he lives?"],
    tip: "Indirect questions use statement word order, even though the whole sentence is a question.",
    keywords: ["indirect questions", "polite questions", "statement word order", "if", "whether"]
  },

  "causative verbs": {
    name: "Causative Verbs",
    level: "B2",
    emoji: "🛠️",
    definition: "Structures used when someone arranges for another person to do something for them.",
    rules: "Use 'have/get + object + past participle' when arranging a service. Use 'have + person + base verb' when asking someone to do something.",
    examples: ["I had my hair cut.", "She got her phone repaired.", "The teacher had the students complete the task."],
    commonMistakes: ["❌ I had cut my hair (when someone else cut it) → ✓ I had my hair cut"],
    tip: "Use 'have/get something done' when someone else performs the action for you.",
    keywords: ["causative verbs", "have something done", "get something done", "have", "get"]
  },

  "advanced gerunds and infinitives": {
    name: "Gerunds and Infinitives (Advanced)",
    level: "B1",
    emoji: "🎯",
    definition: "Verb forms used after particular verbs, adjectives, and prepositions.",
    rules: "Some verbs take a gerund, such as avoid and suggest. Others take an infinitive, such as decide and promise. Some verbs can take both, sometimes with a change in meaning.",
    examples: ["She avoided answering the question.", "He decided to leave.", "I stopped smoking.", "I stopped to answer the phone."],
    commonMistakes: ["❌ She suggested to go → ✓ She suggested going", "❌ He avoided to speak → ✓ He avoided speaking"],
    tip: "Learn which verbs take gerunds, infinitives, or both. The meaning can change with some verbs.",
    keywords: ["gerunds", "infinitives", "verb patterns", "stop", "remember", "regret"]
  },

  "participle clauses": {
    name: "Participle Clauses",
    level: "B2",
    emoji: "🔗",
    definition: "Clauses using present or past participles to provide additional information in a shorter sentence.",
    rules: "Use present participles (-ing) for active meanings and past participles (-ed or irregular forms) for passive meanings. The understood subject should normally match the main clause's subject.",
    examples: ["Walking home, she saw her friend.", "Built in 1900, the house is very old.", "Having finished her work, she went home."],
    commonMistakes: ["❌ Walking home, the rain started → ✓ Walking home, she got caught in the rain."],
    tip: "Make sure the participle clause clearly refers to the subject of the main clause.",
    keywords: ["participle clauses", "present participle", "past participle", "having"]
  },

  "inversion": {
    name: "Inversion",
    level: "C1",
    emoji: "🔄",
    definition: "A change in normal word order, often used for emphasis or in formal English.",
    rules: "After certain negative or restrictive expressions, place an auxiliary verb before the subject. Examples include 'Never have I...' and 'Rarely do we...'.",
    examples: ["Never have I seen such a beautiful place.", "Rarely does she complain.", "Not only did he apologise, but he also offered help."],
    commonMistakes: ["❌ Never I have seen this → ✓ Never have I seen this"],
    tip: "In formal inversion, the auxiliary verb usually comes before the subject.",
    keywords: ["inversion", "negative adverbials", "never", "rarely", "not only"]
  },

  "subjunctive": {
    name: "Subjunctive",
    level: "B2",
    emoji: "📖",
    definition: "A verb form used in certain formal expressions, suggestions, demands, and hypothetical situations.",
    rules: "In formal suggestions and demands, use the base form of the verb after expressions such as 'recommend that' and 'insist that'. The verb 'be' is also used in some hypothetical expressions.",
    examples: ["I suggest that he study harder.", "They demanded that she be present.", "If I were you, I would apologise."],
    commonMistakes: ["❌ They insisted that he is present → ✓ They insisted that he be present (formal subjunctive)"],
    tip: "The subjunctive is especially common in formal English and fixed expressions.",
    keywords: ["subjunctive", "base form", "if I were", "suggest", "demand"]
  },

  "ellipsis and substitution": {
    name: "Ellipsis and Substitution",
    level: "B2",
    emoji: "✂️",
    definition: "Ways of avoiding unnecessary repetition by omitting words or replacing them with other words.",
    rules: "Ellipsis leaves out words that are understood. Substitution replaces repeated words or phrases with words such as one, ones, do, and so.",
    examples: ["I can play the guitar, and my sister can too.", "Would you like the red one?", "She said she would help, and she did."],
    commonMistakes: ["❌ I like the red one and the blue one (when unnecessary repetition can be avoided)"],
    tip: "Use ellipsis and substitution to make your English more natural and concise.",
    keywords: ["ellipsis", "substitution", "one", "ones", "do", "so"]
  },

  "word order": {
    name: "Word Order",
    level: "A1",
    emoji: "🔤",
    definition: "The arrangement of words in a sentence.",
    rules: "The usual English sentence order is subject + verb + object. Adjectives usually come before nouns, and questions often require auxiliary verbs before the subject.",
    examples: ["She reads books.", "The little boy is happy.", "Where do you live?"],
    commonMistakes: ["❌ Reads she books → ✓ She reads books", "❌ A red beautiful dress → ✓ A beautiful red dress"],
    tip: "Start with the subject, then the verb, and then the object when forming basic statements.",
    keywords: ["word order", "sentence structure", "subject", "verb", "object"]
  },

  "contractions": {
    name: "Contractions",
    level: "A1",
    emoji: "✍️",
    definition: "Shortened forms of words in which letters are omitted and replaced by an apostrophe.",
    rules: "Common contractions include I'm (I am), don't (do not), isn't (is not), and they've (they have).",
    examples: ["I'm happy.", "She doesn't like coffee.", "We've finished our homework."],
    commonMistakes: ["❌ Dont worry → ✓ Don't worry", "❌ Its raining → ✓ It's raining"],
    tip: "Use an apostrophe to show where letters have been omitted.",
    keywords: ["contractions", "apostrophe", "I'm", "don't", "isn't", "they've"]
  },

  "direct speech": {
    name: "Direct Speech",
    level: "A2",
    emoji: "🗣️",
    definition: "The exact words spoken by a person, usually written inside quotation marks.",
    rules: "Use quotation marks around the speaker's exact words. Begin direct speech with a capital letter and use appropriate punctuation.",
    examples: ["She said, \"I am tired.\"", "\"Where are you going?\" he asked.", "Ali said, \"I love reading.\""],
    commonMistakes: ["❌ She said I am tired. → ✓ She said, \"I am tired.\""],
    tip: "Use quotation marks to show the exact words spoken.",
    keywords: ["direct speech", "quotation marks", "speech marks", "dialogue"]
  },

  "linking words": {
    name: "Linking Words",
    level: "A2",
    emoji: "🔗",
    definition: "Words and phrases that connect ideas and show relationships between sentences or clauses.",
    rules: "Use linking words such as because, however, therefore, although, and furthermore to show cause, contrast, result, or addition.",
    examples: ["It was raining; therefore, we stayed inside.", "She was tired. However, she continued working.", "I stayed home because I was ill."],
    commonMistakes: ["❌ Although it was late, but we continued → ✓ Although it was late, we continued."],
    tip: "Choose a linking word that clearly shows the relationship between your ideas.",
    keywords: ["linking words", "connectors", "however", "therefore", "although", "because"]
  },

  "sentence structure": {
    name: "Sentence Structure",
    level: "A1",
    emoji: "🧱",
    definition: "The way words and phrases are arranged to form meaningful sentences.",
    rules: "Basic sentences usually contain a subject and a verb. Some also include an object, a complement, or additional information.",
    examples: ["Birds fly.", "She is a teacher.", "The children play football."],
    commonMistakes: ["❌ The children playing outside. → ✓ The children are playing outside."],
    tip: "A complete sentence normally needs a subject and a finite verb.",
    keywords: ["sentence structure", "subject", "predicate", "object", "complement"]
  },

  "simple compound complex sentences": {
    name: "Simple, Compound and Complex Sentences",
    level: "A2",
    emoji: "🧩",
    definition: "Three sentence structures based on the number and types of clauses they contain.",
    rules: "A simple sentence has one independent clause. A compound sentence joins two independent clauses. A complex sentence contains an independent clause and at least one dependent clause.",
    examples: ["She smiled.", "She smiled, and he laughed.", "She smiled because she was happy."],
    commonMistakes: ["❌ I was tired, I went to bed. → ✓ I was tired, so I went to bed."],
    tip: "Identify the clauses to determine whether a sentence is simple, compound, or complex.",
    keywords: ["simple sentence", "compound sentence", "complex sentence", "clauses"]
  },

  "clauses": {
    name: "Independent and Dependent Clauses",
    level: "B1",
    emoji: "🔗",
    definition: "Groups of words containing a subject and a verb. Independent clauses express complete thoughts, while dependent clauses need additional information.",
    rules: "An independent clause can stand alone. A dependent clause cannot usually stand alone as a complete sentence.",
    examples: ["I went home. (independent)", "Because I was tired (dependent)", "Because I was tired, I went home."],
    commonMistakes: ["❌ Because I was tired. (as a complete sentence) → ✓ Because I was tired, I went home."],
    tip: "Check whether the clause expresses a complete thought.",
    keywords: ["clauses", "independent clause", "dependent clause", "subordinate clause"]
  },

  "there is there are": {
    name: "There Is / There Are",
    level: "A1",
    emoji: "📍",
    definition: "Structures used to say that something exists or is present.",
    rules: "Use 'there is' with singular nouns and uncountable nouns. Use 'there are' with plural nouns.",
    examples: ["There is a book on the table.", "There are three apples.", "There is some milk in the fridge."],
    commonMistakes: ["❌ There is three students → ✓ There are three students"],
    tip: "Look at the noun that follows 'there is' or 'there are'.",
    keywords: ["there is", "there are", "existence", "singular", "plural"]
  },

  "used to and would": {
    name: "Used To / Would",
    level: "B1",
    emoji: "🕰️",
    definition: "Structures used to talk about past habits or situations that are no longer true.",
    rules: "'Used to' describes past habits and states. 'Would' can describe repeated past actions but is not normally used for past states.",
    examples: ["I used to live in London.", "We would visit our grandparents every summer.", "She used to have long hair."],
    commonMistakes: ["❌ I would live in London when I was young. (for a past state) → ✓ I used to live in London."],
    tip: "Use 'used to' for past states and habits. Use 'would' for repeated past actions.",
    keywords: ["used to", "would", "past habits", "past states"]
  },

  "be used to and get used to": {
    name: "Be Used To / Get Used To",
    level: "B2",
    emoji: "🔄",
    definition: "Expressions used to describe being familiar with something or becoming accustomed to it.",
    rules: "'Be used to' means to be accustomed to something. 'Get used to' means to become accustomed to something. Both are followed by a noun or gerund.",
    examples: ["I am used to waking up early.", "She is getting used to her new school.", "They got used to living in the city."],
    commonMistakes: ["❌ I am used to wake up early → ✓ I am used to waking up early"],
    tip: "In these expressions, 'to' is a preposition, so follow it with a noun or -ing form.",
    keywords: ["be used to", "get used to", "accustomed to", "gerund"]
  },

  "wish and if only": {
    name: "Wish and If Only",
    level: "B2",
    emoji: "💭",
    definition: "Expressions used to talk about regrets, unreal situations, or things we want to be different.",
    rules: "Use 'wish + past simple' for present situations you want to change. Use 'wish + past perfect' for past regrets. Use 'wish + would' for things you want to change.",
    examples: ["I wish I had more time.", "She wishes she had studied harder.", "I wish it would stop raining."],
    commonMistakes: ["❌ I wish I have more time → ✓ I wish I had more time"],
    tip: "Use past forms after 'wish' to describe unreal present situations or regrets.",
    keywords: ["wish", "if only", "regrets", "unreal situations", "would"]
  },

  "question formation": {
    name: "Question Formation",
    level: "A1",
    emoji: "❓",
    definition: "The rules for forming questions in English.",
    rules: "Use an auxiliary verb before the subject in most yes/no questions. Use question words such as who, what, where, when, why, and how for information questions.",
    examples: ["Do you like music?", "Where does she live?", "Are they coming?"],
    commonMistakes: ["❌ You are happy? (in standard neutral question form) → ✓ Are you happy?", "❌ Where she works? → ✓ Where does she work?"],
    tip: "Remember to use the correct auxiliary verb and word order.",
    keywords: ["question formation", "yes/no questions", "wh questions", "auxiliary verbs"]
  },

  "advanced conjunctions": {
    name: "Conjunctions (Advanced)",
    level: "B1",
    emoji: "🔀",
    definition: "Words and phrases that connect ideas and show complex relationships between clauses.",
    rules: "Advanced conjunctions include whereas, while, unless, provided that, as long as, even though, and in case. Choose them according to the relationship between the ideas.",
    examples: ["You can go out provided that you finish your work.", "Whereas I enjoy reading, my brother prefers sports.", "Unless you hurry, you will miss the bus."],
    commonMistakes: ["❌ Unless you don't hurry, you'll be late. → ✓ Unless you hurry, you'll be late."],
    tip: "Learn the meaning and grammatical structure of each conjunction.",
    keywords: ["advanced conjunctions", "whereas", "unless", "provided that", "as long as", "even though"]
  },

  "advanced determiners and articles": {
    name: "Determiners and Articles (Advanced)",
    level: "B1",
    emoji: "📖",
    definition: "More complex rules for using articles and determiners to specify nouns.",
    rules: "Use articles according to whether nouns are specific, general, countable, or uncountable. Other determiners include all, both, either, neither, each, and every.",
    examples: ["Both students passed the exam.", "Neither answer is correct.", "All the children received certificates.", "Each student has a notebook."],
    commonMistakes: ["❌ Both of students → ✓ Both students / Both of the students", "❌ Every students → ✓ Every student"],
    tip: "Remember that 'each' and 'every' take singular nouns and singular verbs.",
    keywords: ["advanced determiners", "articles", "both", "either", "neither", "each", "every", "all"]
  }
};
Object.assign(grammarDB, additionalGrammarDB);
const grammarDBModern = {
  // ============================================================
  // A1 — BEGINNER
  // ============================================================

  common_nouns: {
    level: "A1",
    category: "Nouns",
    title: "Common Nouns",
    definition: "A common noun names a general person, place, animal, thing, or idea.",
    rules: [
      "Common nouns are usually not capitalised.",
      "They can be singular or plural.",
      "They can sometimes be countable or uncountable."
    ],
    examples: ["teacher", "city", "book", "dog", "school"],
    commonMistakes: [
      "Writing ordinary common nouns with capital letters."
    ],
    tips: ["Ask: Is this a general name rather than a specific name?"],
    keywords: ["common noun", "general noun"]
  },

  proper_nouns: {
    level: "A1",
    category: "Nouns",
    title: "Proper Nouns",
    definition: "A proper noun is the specific name of a person, place, organisation, day, month, or other named thing.",
    rules: [
      "Proper nouns begin with capital letters."
    ],
    examples: ["Ali", "Pakistan", "Monday", "London", "Ramadan"],
    commonMistakes: ["writing pakistan instead of Pakistan"],
    tips: ["Specific names normally begin with a capital letter."],
    keywords: ["proper noun", "specific name", "capital letter"]
  },

  singular_plural_nouns: {
    level: "A1",
    category: "Nouns",
    title: "Singular and Plural Nouns",
    definition: "Singular means one; plural means more than one.",
    rules: [
      "Most nouns form the plural with -s.",
      "Some nouns take -es.",
      "Some nouns have irregular plurals."
    ],
    examples: ["book → books", "box → boxes", "child → children"],
    commonMistakes: ["childs instead of children"],
    tips: ["Learn irregular plurals individually."],
    keywords: ["singular", "plural", "plural nouns"]
  },

  countable_uncountable_nouns: {
    level: "A1",
    category: "Nouns",
    title: "Countable and Uncountable Nouns",
    definition: "Countable nouns can be counted individually; uncountable nouns are treated as substances, materials, concepts, or quantities.",
    rules: [
      "Countable nouns can have singular and plural forms.",
      "Uncountable nouns normally do not have ordinary plural forms.",
      "Use much with uncountable nouns and many with countable nouns."
    ],
    examples: ["one apple / two apples", "some water", "much information"],
    commonMistakes: ["informations", "advices"],
    tips: ["Use a piece of information/advice when a countable unit is needed."],
    keywords: ["countable", "uncountable", "much", "many"]
  },

  concrete_abstract_nouns: {
    level: "A1",
    category: "Nouns",
    title: "Concrete and Abstract Nouns",
    definition: "Concrete nouns refer to things that can be experienced physically; abstract nouns refer to ideas, feelings, qualities, or concepts.",
    rules: [
      "Concrete nouns include physical objects.",
      "Abstract nouns include ideas and qualities."
    ],
    examples: ["table", "apple", "happiness", "honesty", "freedom"],
    commonMistakes: [],
    tips: ["Ask whether the noun refers to a physical thing or an idea."],
    keywords: ["concrete noun", "abstract noun"]
  },

  collective_nouns: {
    level: "A1",
    category: "Nouns",
    title: "Collective Nouns",
    definition: "A collective noun refers to a group considered as one unit.",
    rules: [
      "Collective nouns can refer to groups of people, animals, or things."
    ],
    examples: ["team", "family", "class", "group", "crowd"],
    commonMistakes: [],
    tips: ["Think of the noun as naming a group."],
    keywords: ["collective noun", "group noun"]
  },

  compound_nouns: {
    level: "A1",
    category: "Nouns",
    title: "Compound Nouns",
    definition: "A compound noun is formed from two or more words functioning together as a noun.",
    rules: [
      "Compound nouns may be written as one word, two words, or hyphenated words."
    ],
    examples: ["toothbrush", "school bus", "mother-in-law"],
    commonMistakes: [],
    tips: ["Learn common compounds as vocabulary units."],
    keywords: ["compound noun"]
  },

  possessive_nouns: {
    level: "A1",
    category: "Nouns",
    title: "Possessive Nouns",
    definition: "Possessive nouns show ownership, relationship, or association.",
    rules: [
      "Singular nouns usually take 's.",
      "Plural nouns ending in s usually take only an apostrophe."
    ],
    examples: ["Sara's book", "the boys' bags", "James's car"],
    commonMistakes: ["Confusing possessive its with contraction it's."],
    tips: ["Ask: belonging to whom?"],
    keywords: ["possessive", "apostrophe", "ownership"]
  },

  noun_gender: {
    level: "A1",
    category: "Nouns",
    title: "Noun Gender",
    definition: "Some nouns distinguish between male, female, and gender-neutral references.",
    rules: [
      "Modern English often prefers gender-neutral terms when gender is not relevant."
    ],
    examples: ["actor", "actress", "police officer", "parent"],
    commonMistakes: [],
    tips: ["Use neutral terms when gender does not matter."],
    keywords: ["noun gender", "gender-neutral nouns"]
  },

  noun_phrases: {
    level: "A1",
    category: "Nouns",
    title: "Noun Phrases",
    definition: "A noun phrase is a noun together with words that modify or determine it.",
    rules: [
      "A noun phrase can contain determiners, adjectives, modifiers, and the noun."
    ],
    examples: ["the red car", "my new English book", "three small children"],
    commonMistakes: [],
    tips: ["Find the main noun and identify the words describing or determining it."],
    keywords: ["noun phrase", "noun group"]
  },

  subject_pronouns: {
    level: "A1",
    category: "Pronouns",
    title: "Subject Pronouns",
    definition: "Subject pronouns replace nouns functioning as subjects.",
    rules: [
      "Common subject pronouns are I, you, he, she, it, we, and they."
    ],
    examples: ["She runs.", "They study.", "We are ready."],
    commonMistakes: ["Me and Ali went home."],
    tips: ["Use subject pronouns before the main verb."],
    keywords: ["subject pronoun"]
  },

  object_pronouns: {
    level: "A1",
    category: "Pronouns",
    title: "Object Pronouns",
    definition: "Object pronouns replace nouns functioning as objects.",
    rules: [
      "Common object pronouns include me, you, him, her, it, us, and them."
    ],
    examples: ["She helped me.", "I called him.", "They invited us."],
    commonMistakes: ["She helped I."],
    tips: ["Use object pronouns after verbs and prepositions."],
    keywords: ["object pronoun"]
  },

  possessive_pronouns: {
    level: "A1",
    category: "Pronouns",
    title: "Possessive Pronouns",
    definition: "Possessive pronouns show possession without directly naming the noun.",
    rules: [
      "Possessive pronouns include mine, yours, his, hers, ours, and theirs."
    ],
    examples: ["The book is mine.", "That bag is hers."],
    commonMistakes: ["This is mine book."],
    tips: ["Do not put a noun directly after a possessive pronoun."],
    keywords: ["possessive pronoun"]
  },

  demonstratives: {
    level: "A1",
    category: "Pronouns and Determiners",
    title: "Demonstratives",
    definition: "This, that, these, and those identify particular people or things.",
    rules: [
      "This/these usually refer to things considered near.",
      "That/those usually refer to things considered farther away."
    ],
    examples: ["this book", "these shoes", "that house", "those cars"],
    commonMistakes: [],
    tips: ["This/that are singular; these/those are plural."],
    keywords: ["this", "that", "these", "those"]
  },

  personal_pronouns: {
    level: "A1",
    category: "Pronouns",
    title: "Personal Pronouns",
    definition: "Personal pronouns refer to people, animals, or things.",
    rules: [
      "Pronoun form depends on grammatical role."
    ],
    examples: ["I", "me", "she", "her", "they", "them"],
    commonMistakes: [],
    tips: ["Choose the form according to whether it is subject or object."],
    keywords: ["personal pronouns"]
  },

  reflexive_pronouns: {
    level: "A1",
    category: "Pronouns",
    title: "Reflexive Pronouns",
    definition: "Reflexive pronouns refer back to the subject.",
    rules: [
      "Forms include myself, yourself, himself, herself, itself, ourselves, yourselves, and themselves."
    ],
    examples: ["I hurt myself.", "They introduced themselves."],
    commonMistakes: ["Myself went to school."],
    tips: ["The reflexive pronoun normally refers back to the subject."],
    keywords: ["reflexive pronoun"]
  },

  articles: {
    level: "A1",
    category: "Articles",
    title: "A, An and The",
    definition: "Articles help identify whether a noun is general or specific.",
    rules: [
      "Use a before a consonant sound.",
      "Use an before a vowel sound.",
      "Use the for specific or previously identified nouns."
    ],
    examples: ["a book", "an apple", "the book on the table"],
    commonMistakes: ["an university"],
    tips: ["Focus on sound, not just spelling."],
    keywords: ["a", "an", "the", "articles"]
  },

  zero_article: {
    level: "A1",
    category: "Articles",
    title: "Zero Article",
    definition: "The zero article means no article is used before a noun.",
    rules: [
      "Plural and uncountable nouns can sometimes be used generally without an article."
    ],
    examples: ["Books are useful.", "Water is essential."],
    commonMistakes: ["The books are useful when talking about books generally."],
    tips: ["Ask whether you mean a specific group or the idea generally."],
    keywords: ["zero article", "no article"]
  },

  determiners: {
    level: "A1",
    category: "Determiners",
    title: "Basic Determiners",
    definition: "Determiners come before nouns to identify or limit them.",
    rules: [
      "Common determiners include a, the, this, my, some, and many."
    ],
    examples: ["my book", "some water", "those students"],
    commonMistakes: [],
    tips: ["A determiner usually comes before an adjective + noun."],
    keywords: ["determiner"]
  },

  some_any: {
    level: "A1",
    category: "Quantifiers",
    title: "Some and Any",
    definition: "Some and any refer to an unspecified quantity or number.",
    rules: [
      "Some is common in affirmative statements.",
      "Any is common in negatives and questions."
    ],
    examples: ["I have some money.", "I don't have any money.", "Do you have any questions?"],
    commonMistakes: [],
    tips: ["Remember that questions offering or requesting something can use some."],
    keywords: ["some", "any"]
  },

  be_verb: {
    level: "A1",
    category: "Verbs",
    title: "The Verb Be",
    definition: "Be is an auxiliary and main verb with forms am, is, are, was, and were.",
    rules: [
      "Use am with I.",
      "Use is with he, she, and it.",
      "Use are with you, we, and they."
    ],
    examples: ["I am ready.", "She is happy.", "They are students."],
    commonMistakes: ["I is happy."],
    tips: ["Match the form of be to the subject."],
    keywords: ["be", "am", "is", "are"]
  },

  have_has: {
    level: "A1",
    category: "Verbs",
    title: "Have and Has",
    definition: "Have and has can express possession and can also function as auxiliaries.",
    rules: [
      "Has is used with third-person singular subjects in the present simple.",
      "Have is used with I, you, we, and they."
    ],
    examples: ["She has a car.", "They have a house."],
    commonMistakes: ["She have a car."],
    tips: ["Check the subject before choosing have or has."],
    keywords: ["have", "has"]
  },

  do_does: {
    level: "A1",
    category: "Verbs",
    title: "Do and Does",
    definition: "Do and does can function as main verbs or auxiliaries.",
    rules: [
      "Does is used with third-person singular subjects.",
      "Do is used with I, you, we, and they."
    ],
    examples: ["Do you work?", "Does she study?", "They do their homework."],
    commonMistakes: ["Does she studies?"],
    tips: ["After does in a question, use the base verb."],
    keywords: ["do", "does", "auxiliary"]
  },

  imperative: {
    level: "A1",
    category: "Verbs",
    title: "Imperative Verbs",
    definition: "Imperatives are used for commands, instructions, warnings, and requests.",
    rules: [
      "Use the base form of the verb.",
      "Negative imperatives normally use don't."
    ],
    examples: ["Open the door.", "Please sit down.", "Don't touch that."],
    commonMistakes: ["To open the door."],
    tips: ["Commands normally begin directly with the base verb."],
    keywords: ["imperative", "command", "instruction"]
  },

  there_is_are: {
    level: "A1",
    category: "Sentence Structure",
    title: "There Is and There Are",
    definition: "There is and there are introduce the existence or presence of something.",
    rules: [
      "Use there is with singular nouns and uncountable nouns.",
      "Use there are with plural nouns."
    ],
    examples: ["There is a book.", "There are three books."],
    commonMistakes: ["There is three books."],
    tips: ["Look at the noun that follows the structure."],
    keywords: ["there is", "there are"]
  },

  present_simple: {
    level: "A1",
    category: "Tenses",
    title: "Present Simple",
    definition: "The present simple describes habits, routines, facts, and regular events.",
    rules: [
      "Use the base verb with I, you, we, and they.",
      "Add -s or -es with third-person singular subjects."
    ],
    examples: ["I study every day.", "She works at a school."],
    commonMistakes: ["She work every day."],
    tips: ["Look for routines, habits, and general truths."],
    keywords: ["present simple", "simple present"]
  },

  present_continuous: {
    level: "A1",
    category: "Tenses",
    title: "Present Continuous",
    definition: "The present continuous describes actions happening now or around the present time.",
    rules: [
      "Use am/is/are + present participle."
    ],
    examples: ["I am studying.", "They are playing."],
    commonMistakes: ["She is study."],
    tips: ["Use be + -ing."],
    keywords: ["present continuous", "present progressive"]
  },

  past_simple: {
    level: "A1",
    category: "Tenses",
    title: "Past Simple",
    definition: "The past simple describes completed past actions and events.",
    rules: [
      "Regular verbs normally take -ed.",
      "Irregular verbs have individual past forms."
    ],
    examples: ["I visited Lahore.", "She went home."],
    commonMistakes: ["I goed home."],
    tips: ["Learn common irregular past forms."],
    keywords: ["past simple", "simple past"]
  },

  future_will: {
    level: "A1",
    category: "Future",
    title: "Future with Will",
    definition: "Will is used for predictions, spontaneous decisions, promises, and offers.",
    rules: [
      "Use will + base verb."
    ],
    examples: ["I will help you.", "It will rain."],
    commonMistakes: ["I will to go."],
    tips: ["Do not use to after will."],
    keywords: ["will", "future"]
  },

  going_to: {
    level: "A1",
    category: "Future",
    title: "Be Going To",
    definition: "Be going to is used for plans and predictions based on present evidence.",
    rules: [
      "Use be + going to + base verb."
    ],
    examples: ["I am going to study.", "Look at those clouds. It is going to rain."],
    commonMistakes: ["I going to study."],
    tips: ["Do not forget the form of be."],
    keywords: ["going to", "future plan"]
  },

  adjectives_basic: {
    level: "A1",
    category: "Adjectives",
    title: "Basic Adjectives",
    definition: "Adjectives describe or give information about nouns and pronouns.",
    rules: [
      "Adjectives commonly appear before nouns or after linking verbs."
    ],
    examples: ["a big house", "The house is big."],
    commonMistakes: [],
    tips: ["Ask: What is the noun like?"],
    keywords: ["adjective", "description"]
  },

  adverbs_manner: {
    level: "A1",
    category: "Adverbs",
    title: "Adverbs of Manner",
    definition: "Adverbs of manner describe how an action happens.",
    rules: [
      "Many adverbs of manner are formed with -ly."
    ],
    examples: ["She spoke quietly.", "He ran quickly."],
    commonMistakes: ["He runs quick."],
    tips: ["Ask: How?"],
    keywords: ["adverb of manner"]
  },

  adverbs_frequency: {
    level: "A1",
    category: "Adverbs",
    title: "Adverbs of Frequency",
    definition: "Adverbs of frequency describe how often something happens.",
    rules: [
      "Common examples include always, usually, often, sometimes, rarely, and never.",
      "They normally come before the main verb but after be."
    ],
    examples: ["I usually walk.", "She is always late."],
    commonMistakes: ["I always am tired."],
    tips: ["Position depends partly on whether the verb is be."],
    keywords: ["always", "usually", "often", "never"]
  },

  basic_prepositions: {
    level: "A1",
    category: "Prepositions",
    title: "Basic Prepositions",
    definition: "Prepositions express relationships such as place, time, movement, and direction.",
    rules: [
      "Common prepositions include in, on, at, to, from, under, and beside."
    ],
    examples: ["on the table", "at school", "from Pakistan"],
    commonMistakes: [],
    tips: ["Learn common preposition + noun combinations."],
    keywords: ["preposition", "place", "time"]
  },

  basic_conjunctions: {
    level: "A1",
    category: "Conjunctions",
    title: "Basic Conjunctions",
    definition: "Conjunctions connect words, phrases, or clauses.",
    rules: [
      "And adds information.",
      "But shows contrast.",
      "Or gives a choice.",
      "Because gives a reason.",
      "So gives a result."
    ],
    examples: ["I was tired, but I worked.", "I stayed home because it rained."],
    commonMistakes: [],
    tips: ["Choose the conjunction according to the relationship between ideas."],
    keywords: ["and", "but", "or", "because", "so"]
  },

  // ============================================================
  // A2 — ELEMENTARY
  // ============================================================

  irregular_plurals: {
    level: "A2",
    category: "Nouns",
    title: "Irregular Plurals",
    definition: "Irregular plurals do not follow the usual plural spelling rules.",
    rules: [
      "Some nouns change internally.",
      "Some nouns have completely different forms."
    ],
    examples: ["man → men", "woman → women", "mouse → mice", "child → children"],
    commonMistakes: ["mans", "childs"],
    tips: ["Memorise common irregular plurals."],
    keywords: ["irregular plural"]
  },

  indefinite_pronouns: {
    level: "A2",
    category: "Pronouns",
    title: "Indefinite Pronouns",
    definition: "Indefinite pronouns refer to people or things without identifying them specifically.",
    rules: [
      "Examples include someone, anyone, everyone, nobody, something, and nothing."
    ],
    examples: ["Someone called.", "Everyone is ready.", "Nothing happened."],
    commonMistakes: ["Everyone are ready."],
    tips: ["Many indefinite pronouns are grammatically singular."],
    keywords: ["indefinite pronouns", "someone", "everyone"]
  },

  reciprocal_pronouns: {
    level: "A2",
    category: "Pronouns",
    title: "Reciprocal Pronouns",
    definition: "Each other and one another describe actions or feelings shared between people.",
    rules: [
      "They show a mutual relationship."
    ],
    examples: ["They helped each other.", "The teams congratulated one another."],
    commonMistakes: [],
    tips: ["Think: A does something to B and B does something to A."],
    keywords: ["each other", "one another"]
  },

  one_ones: {
    level: "A2",
    category: "Pronouns",
    title: "One and Ones",
    definition: "One and ones can replace a previously mentioned countable noun.",
    rules: [
      "One is singular.",
      "Ones is plural."
    ],
    examples: ["I like the red one.", "I prefer the small ones."],
    commonMistakes: [],
    tips: ["Use them to avoid repeating a noun."],
    keywords: ["one", "ones"]
  },

  quantifiers_a_lot: {
    level: "A2",
    category: "Quantifiers",
    title: "A Lot Of and Lots Of",
    definition: "A lot of and lots of express a large quantity or number.",
    rules: [
      "They can be used with countable and uncountable nouns."
    ],
    examples: ["a lot of books", "lots of water"],
    commonMistakes: [],
    tips: ["They are common in everyday English."],
    keywords: ["a lot of", "lots of"]
  },

  few_little: {
    level: "A2",
    category: "Quantifiers",
    title: "Few, A Few, Little and A Little",
    definition: "These expressions describe small quantities.",
    rules: [
      "Few/a few are used with countable nouns.",
      "Little/a little are used with uncountable nouns.",
      "The article can change the meaning from insufficient to some."
    ],
    examples: ["few students", "a few students", "little time", "a little time"],
    commonMistakes: ["a few water"],
    tips: ["Countable → few; uncountable → little."],
    keywords: ["few", "a few", "little", "a little"]
  },

  enough: {
    level: "A2",
    category: "Quantifiers",
    title: "Enough",
    definition: "Enough means as much or as many as necessary.",
    rules: [
      "Enough comes before nouns.",
      "Enough usually comes after adjectives and adverbs."
    ],
    examples: ["enough money", "old enough", "quickly enough"],
    commonMistakes: ["enough old"],
    tips: ["Noun before enough; adjective/adverb before enough."],
    keywords: ["enough"]
  },

  too_much_many: {
    level: "A2",
    category: "Quantifiers",
    title: "Too Much and Too Many",
    definition: "Too much and too many indicate an excessive quantity or number.",
    rules: [
      "Too much is used with uncountable nouns.",
      "Too many is used with plural countable nouns."
    ],
    examples: ["too much water", "too many books"],
    commonMistakes: ["too much books"],
    tips: ["Much → uncountable; many → plural countable."],
    keywords: ["too much", "too many"]
  },

  each_every: {
    level: "A2",
    category: "Determiners",
    title: "Each and Every",
    definition: "Each and every refer to members of a group individually.",
    rules: [
      "They normally take singular countable nouns.",
      "Each can emphasise individuals; every often describes the group as a whole."
    ],
    examples: ["Each student has a book.", "Every child needs care."],
    commonMistakes: ["Every students"],
    tips: ["Use a singular noun after each/every."],
    keywords: ["each", "every"]
  },

  both_either_neither: {
    level: "A2",
    category: "Determiners",
    title: "Both, Either and Neither",
    definition: "These words refer to two people or things.",
    rules: [
      "Both means the two.",
      "Either means one of the two.",
      "Neither means not one and not the other."
    ],
    examples: ["Both answers are correct.", "Either option is fine.", "Neither answer is correct."],
    commonMistakes: [],
    tips: ["Remember: both = 2, either = 1 of 2, neither = 0 of 2."],
    keywords: ["both", "either", "neither"]
  },

  another_other: {
    level: "A2",
    category: "Determiners",
    title: "Another and Other",
    definition: "Another refers to an additional or different one; other refers to additional or different people or things.",
    rules: [
      "Another is normally used with singular countable nouns.",
      "Other can be used with plural or uncountable nouns."
    ],
    examples: ["another book", "other books", "other information"],
    commonMistakes: ["another books"],
    tips: ["Another + singular countable noun."],
    keywords: ["another", "other"]
  },

  present_perfect: {
    level: "A2",
    category: "Tenses",
    title: "Present Perfect Simple",
    definition: "The present perfect connects past events to the present.",
    rules: [
      "Use have/has + past participle.",
      "It can describe experiences, recent events, or situations continuing to the present."
    ],
    examples: ["I have visited Lahore.", "She has finished her work."],
    commonMistakes: ["I have went."],
    tips: ["Use the past participle after have/has."],
    keywords: ["present perfect", "have", "has", "past participle"]
  },

  present_perfect_ever_never: {
    level: "A2",
    category: "Tenses",
    title: "Present Perfect with Ever and Never",
    definition: "Ever and never are commonly used to talk about experiences up to the present.",
    rules: [
      "Ever is common in questions.",
      "Never means at no time up to the present."
    ],
    examples: ["Have you ever been there?", "I have never tried it."],
    commonMistakes: ["I haven't never been there."],
    tips: ["Avoid double negatives."],
    keywords: ["ever", "never", "present perfect"]
  },

  present_perfect_just_already_yet: {
    level: "A2",
    category: "Tenses",
    title: "Just, Already and Yet",
    definition: "These words commonly describe recent events or whether an expected event has happened.",
    rules: [
      "Just means very recently.",
      "Already means sooner than expected.",
      "Yet is common in questions and negatives."
    ],
    examples: ["I have just arrived.", "She has already eaten.", "Have you finished yet?"],
    commonMistakes: [],
    tips: ["Yet normally comes near the end of a question or negative sentence."],
    keywords: ["just", "already", "yet"]
  },

  present_perfect_for_since: {
    level: "A2",
    category: "Tenses",
    title: "For and Since",
    definition: "For expresses duration; since identifies the starting point.",
    rules: [
      "For + period of time.",
      "Since + starting point."
    ],
    examples: ["for three years", "since 2023"],
    commonMistakes: ["since three years"],
    tips: ["For = how long; since = when it started."],
    keywords: ["for", "since"]
  },

  future_arrangements: {
    level: "A2",
    category: "Future",
    title: "Present Continuous for Future Arrangements",
    definition: "The present continuous can describe definite future arrangements.",
    rules: [
      "It is commonly used when an arrangement has been made."
    ],
    examples: ["I am meeting Ali tomorrow.", "We are travelling next week."],
    commonMistakes: [],
    tips: ["Often used with a future time expression."],
    keywords: ["present continuous", "future arrangement"]
  },

  can_could: {
    level: "A2",
    category: "Modals",
    title: "Can and Could",
    definition: "Can and could express ability, permission, requests, and possibility in different contexts.",
    rules: [
      "Can often describes present ability.",
      "Could can describe past ability or polite requests."
    ],
    examples: ["I can swim.", "Could you help me?", "She could read at four."],
    commonMistakes: ["I can to swim."],
    tips: ["Use the base verb after can/could."],
    keywords: ["can", "could", "modal"]
  },

  must_have_to: {
    level: "A2",
    category: "Modals",
    title: "Must and Have To",
    definition: "Must and have to express obligation, though their meanings can differ depending on context.",
    rules: [
      "Must is a modal and is followed by the base verb.",
      "Have to changes according to tense and subject."
    ],
    examples: ["You must listen.", "She has to leave."],
    commonMistakes: ["She musts go."],
    tips: ["Must never takes -s."],
    keywords: ["must", "have to", "obligation"]
  },

  should: {
    level: "A2",
    category: "Modals",
    title: "Should and Shouldn't",
    definition: "Should and shouldn't commonly express advice, expectation, or mild obligation.",
    rules: [
      "Use should + base verb."
    ],
    examples: ["You should rest.", "You shouldn't worry."],
    commonMistakes: ["You should to rest."],
    tips: ["Never use to after should."],
    keywords: ["should", "advice"]
  },

  may_might: {
    level: "A2",
    category: "Modals",
    title: "May and Might",
    definition: "May and might can express possibility.",
    rules: [
      "Use may/might + base verb."
    ],
    examples: ["It may rain.", "She might come."],
    commonMistakes: ["She might to come."],
    tips: ["Use the base verb after the modal."],
    keywords: ["may", "might", "possibility"]
  },

  would_like: {
    level: "A2",
    category: "Modals",
    title: "Would Like",
    definition: "Would like is a polite way to express wants or requests.",
    rules: [
      "Would like + noun.",
      "Would like + to-infinitive."
    ],
    examples: ["I'd like some tea.", "I'd like to leave."],
    commonMistakes: ["I'd like go."],
    tips: ["Use to before a verb."],
    keywords: ["would like", "polite request"]
  },

  comparatives: {
    level: "A2",
    category: "Adjectives",
    title: "Comparatives",
    definition: "Comparatives compare two people, things, or situations.",
    rules: [
      "Short adjectives often take -er.",
      "Longer adjectives commonly use more."
    ],
    examples: ["taller", "more interesting", "better"],
    commonMistakes: ["more better"],
    tips: ["Learn irregular forms such as good → better."],
    keywords: ["comparative", "more", "er"]
  },

  superlatives: {
    level: "A2",
    category: "Adjectives",
    title: "Superlatives",
    definition: "Superlatives describe the highest or lowest degree within a group.",
    rules: [
      "Short adjectives often take -est.",
      "Longer adjectives commonly use most."
    ],
    examples: ["the tallest", "the most interesting", "the best"],
    commonMistakes: ["the most best"],
    tips: ["Superlatives commonly use the."],
    keywords: ["superlative", "most", "est"]
  },

  as_as: {
    level: "A2",
    category: "Comparisons",
    title: "As ... As",
    definition: "As ... as compares two things as having the same degree of a quality.",
    rules: [
      "Use adjective/adverb between the two as expressions."
    ],
    examples: ["She is as tall as her sister.", "He runs as quickly as me."],
    commonMistakes: ["as taller as"],
    tips: ["Do not use a comparative adjective inside as ... as."],
    keywords: ["as ... as", "comparison"]
  },

  too: {
    level: "A2",
    category: "Adverbs",
    title: "Too",
    definition: "Too can mean more than is desirable or necessary.",
    rules: [
      "Too + adjective/adverb.",
      "Too much + uncountable noun.",
      "Too many + plural countable noun."
    ],
    examples: ["too expensive", "too quickly", "too much sugar"],
    commonMistakes: [],
    tips: ["Too often suggests excess."],
    keywords: ["too", "excess"]
  },

  basic_relative_clauses: {
    level: "A2",
    category: "Clauses",
    title: "Basic Relative Clauses",
    definition: "Relative clauses give additional information about a noun.",
    rules: [
      "Who commonly refers to people.",
      "Which commonly refers to things.",
      "That can refer to people or things in defining clauses."
    ],
    examples: ["The girl who won is happy.", "The book that I bought is useful."],
    commonMistakes: [],
    tips: ["Identify the noun being described."],
    keywords: ["relative clause", "who", "which", "that"]
  },

  zero_conditional: {
    level: "A2",
    category: "Conditionals",
    title: "Zero Conditional",
    definition: "The zero conditional describes general truths, facts, and predictable results.",
    rules: [
      "If + present simple, present simple."
    ],
    examples: ["If you heat ice, it melts."],
    commonMistakes: ["If you will heat ice, it melts."],
    tips: ["Use present simple in both clauses for general truths."],
    keywords: ["zero conditional", "if"]
  },

  first_conditional: {
    level: "A2",
    category: "Conditionals",
    title: "First Conditional",
    definition: "The first conditional describes real or possible future situations and their results.",
    rules: [
      "If + present simple, will + base verb."
    ],
    examples: ["If it rains, we will stay home."],
    commonMistakes: ["If it will rain, we will stay home."],
    tips: ["Do not normally use will directly after if in the standard first conditional."],
    keywords: ["first conditional"]
  },

  basic_passive: {
    level: "A2",
    category: "Passive Voice",
    title: "Basic Passive Voice",
    definition: "The passive focuses on the receiver of an action rather than the person or thing performing it.",
    rules: [
      "Use be + past participle.",
      "The tense is shown through the form of be."
    ],
    examples: ["The window was broken.", "English is spoken here."],
    commonMistakes: ["The window was broke."],
    tips: ["Use the past participle after be."],
    keywords: ["passive voice", "be", "past participle"]
  },

  basic_reported_speech: {
    level: "A2",
    category: "Reported Speech",
    title: "Basic Reported Speech",
    definition: "Reported speech communicates what someone said without quoting the exact words.",
    rules: [
      "Pronouns and time expressions may change.",
      "Tenses may shift backwards when reporting past speech."
    ],
    examples: ["She said that she was tired."],
    commonMistakes: [],
    tips: ["Check pronouns, tense, and time expressions."],
    keywords: ["reported speech", "indirect speech"]
  },

  gerunds_infinitives_basic: {
    level: "A2",
    category: "Verb Patterns",
    title: "Basic Gerunds and Infinitives",
    definition: "Gerunds use -ing forms as nouns; infinitives commonly use to + base verb.",
    rules: [
      "Some verbs are followed by gerunds.",
      "Some verbs are followed by infinitives."
    ],
    examples: ["I enjoy reading.", "I want to read."],
    commonMistakes: ["I enjoy to read."],
    tips: ["Learn common verb + pattern combinations."],
    keywords: ["gerund", "infinitive"]
  },

  // ============================================================
  // B1 — INTERMEDIATE
  // ============================================================

  past_continuous: {
    level: "B1",
    category: "Tenses",
    title: "Past Continuous",
    definition: "The past continuous describes an action that was in progress at a particular time in the past.",
    rules: [
      "Use was/were + present participle."
    ],
    examples: ["I was studying at eight.", "They were playing football."],
    commonMistakes: ["I was study."],
    tips: ["Use was/were + -ing."],
    keywords: ["past continuous"]
  },

  present_perfect_continuous: {
    level: "B1",
    category: "Tenses",
    title: "Present Perfect Continuous",
    definition: "The present perfect continuous describes an activity that began in the past and continues to or has recently affected the present.",
    rules: [
      "Use have/has been + present participle."
    ],
    examples: ["I have been studying for two hours."],
    commonMistakes: ["I have been study."],
    tips: ["Use it when duration or ongoing activity is important."],
    keywords: ["present perfect continuous"]
  },

  past_perfect: {
    level: "B1",
    category: "Tenses",
    title: "Past Perfect",
    definition: "The past perfect describes an earlier past event in relation to another past event.",
    rules: [
      "Use had + past participle."
    ],
    examples: ["She had left before I arrived."],
    commonMistakes: ["She had went."],
    tips: ["Think: earlier past."],
    keywords: ["past perfect"]
  },

  future_continuous: {
    level: "B1",
    category: "Future",
    title: "Future Continuous",
    definition: "The future continuous describes an action that will be in progress at a particular future time.",
    rules: [
      "Use will be + present participle."
    ],
    examples: ["I will be studying at eight."],
    commonMistakes: ["I will studying."],
    tips: ["Use will be + -ing."],
    keywords: ["future continuous"]
  },

  future_perfect: {
    level: "B1",
    category: "Future",
    title: "Future Perfect",
    definition: "The future perfect describes something that will be completed before a future time.",
    rules: [
      "Use will have + past participle."
    ],
    examples: ["I will have finished by Friday."],
    commonMistakes: ["I will have finish."],
    tips: ["Use the past participle after have."],
    keywords: ["future perfect"]
  },

  second_conditional: {
    level: "B1",
    category: "Conditionals",
    title: "Second Conditional",
    definition: "The second conditional describes hypothetical or unlikely present or future situations.",
    rules: [
      "If + past simple, would + base verb."
    ],
    examples: ["If I had more time, I would travel."],
    commonMistakes: ["If I would have more time..."],
    tips: ["The if-clause normally uses past simple."],
    keywords: ["second conditional", "hypothetical"]
  },

  third_conditional: {
    level: "B1",
    category: "Conditionals",
    title: "Third Conditional",
    definition: "The third conditional describes hypothetical past situations and their imagined results.",
    rules: [
      "If + past perfect, would have + past participle."
    ],
    examples: ["If I had studied, I would have passed."],
    commonMistakes: ["If I would have studied..."],
    tips: ["Both clauses refer to an unreal past."],
    keywords: ["third conditional"]
  },

  unless: {
    level: "B1",
    category: "Conditionals",
    title: "Unless",
    definition: "Unless means if not.",
    rules: [
      "Unless introduces a condition that must not occur for the result to happen."
    ],
    examples: ["I won't go unless you come."],
    commonMistakes: ["Unless you don't come..."],
    tips: ["Avoid unnecessary double negatives."],
    keywords: ["unless", "condition"]
  },

  as_long_as: {
    level: "B1",
    category: "Conditionals",
    title: "As Long As and Provided That",
    definition: "These expressions introduce conditions.",
    rules: [
      "They can mean on the condition that."
    ],
    examples: ["You can go as long as you finish your work.", "You can stay provided that you are quiet."],
    commonMistakes: [],
    tips: ["They are useful alternatives to if."],
    keywords: ["as long as", "provided that"]
  },

  subject_object_questions: {
    level: "B1",
    category: "Questions",
    title: "Subject and Object Questions",
    definition: "Subject questions ask who or what performs an action; object questions ask who or what receives it.",
    rules: [
      "Subject questions often do not use do/does/did."
    ],
    examples: ["Who called you?", "Who did you call?"],
    commonMistakes: [],
    tips: ["Ask whether the question word is the subject or object."],
    keywords: ["subject question", "object question"]
  },

  indirect_questions: {
    level: "B1",
    category: "Questions",
    title: "Indirect Questions",
    definition: "Indirect questions are more polite or less direct ways of asking for information.",
    rules: [
      "Embedded questions use statement word order."
    ],
    examples: ["Could you tell me where the station is?"],
    commonMistakes: ["Could you tell me where is the station?"],
    tips: ["Do not invert the embedded question."],
    keywords: ["indirect question", "embedded question"]
  },

  question_tags: {
    level: "B1",
    category: "Questions",
    title: "Question Tags",
    definition: "Question tags are short questions added to statements.",
    rules: [
      "Positive statements normally take negative tags.",
      "Negative statements normally take positive tags."
    ],
    examples: ["You're coming, aren't you?", "She isn't late, is she?"],
    commonMistakes: [],
    tips: ["Use the auxiliary from the main clause when possible."],
    keywords: ["question tag", "tag question"]
  },

  used_to: {
    level: "B1",
    category: "Structures",
    title: "Used To",
    definition: "Used to describes past habits or states that are no longer true.",
    rules: [
      "Used to + base verb."
    ],
    examples: ["I used to live here.", "She used to play tennis."],
    commonMistakes: ["I use to live here."],
    tips: ["The affirmative form contains used."],
    keywords: ["used to", "past habit"]
  },

  would_past_habits: {
    level: "B1",
    category: "Structures",
    title: "Would for Past Habits",
    definition: "Would can describe repeated past actions.",
    rules: [
      "Would is commonly used for repeated actions, not permanent past states."
    ],
    examples: ["Every summer, we would visit our grandparents."],
    commonMistakes: ["I would live in Lahore."],
    tips: ["Used to works more broadly for past states."],
    keywords: ["would", "past habit"]
  },

  be_used_to: {
    level: "B1",
    category: "Structures",
    title: "Be Used To",
    definition: "Be used to means to be accustomed to something.",
    rules: [
      "Be used to + noun or gerund."
    ],
    examples: ["I am used to waking early."],
    commonMistakes: ["I am used to wake early."],
    tips: ["To here is a preposition, so use a noun or -ing form."],
    keywords: ["be used to", "accustomed"]
  },

  get_used_to: {
    level: "B1",
    category: "Structures",
    title: "Get Used To",
    definition: "Get used to means gradually becoming accustomed to something.",
    rules: [
      "Get used to + noun or gerund."
    ],
    examples: ["She is getting used to working here."],
    commonMistakes: ["She is getting used to work here."],
    tips: ["Use -ing after to in this structure."],
    keywords: ["get used to", "adapt"]
  },

  wish_if_only: {
    level: "B1",
    category: "Hypotheticals",
    title: "Wish and If Only",
    definition: "Wish and if only express unreal or regretted situations.",
    rules: [
      "Past forms can describe wishes about the present.",
      "Past perfect can describe regret about the past."
    ],
    examples: ["I wish I had more time.", "If only I had studied."],
    commonMistakes: [],
    tips: ["The tense does not necessarily refer to real past time."],
    keywords: ["wish", "if only"]
  },

  causative_make_let_get: {
    level: "B1",
    category: "Causatives",
    title: "Make, Let and Get",
    definition: "These structures describe causing or allowing another person to do something.",
    rules: [
      "Make + object + base verb.",
      "Let + object + base verb.",
      "Get + object + to-infinitive."
    ],
    examples: ["She made me laugh.", "They let us leave.", "I got him to help."],
    commonMistakes: ["She made me to laugh."],
    tips: ["Make and let take the bare infinitive."],
    keywords: ["make", "let", "get", "causative"]
  },

  stative_dynamic_verbs: {
    level: "B1",
    category: "Verbs",
    title: "Stative and Dynamic Verbs",
    definition: "Stative verbs describe states; dynamic verbs describe actions or processes.",
    rules: [
      "Many stative verbs are not normally used in continuous forms."
    ],
    examples: ["I know the answer.", "She is running."],
    commonMistakes: ["I am knowing the answer."],
    tips: ["Common stative verbs include know, believe, understand, and own."],
    keywords: ["stative verb", "dynamic verb"]
  },

  transitive_intransitive: {
    level: "B1",
    category: "Verbs",
    title: "Transitive and Intransitive Verbs",
    definition: "A transitive verb takes a direct object; an intransitive verb does not.",
    rules: [
      "Some verbs can be both transitive and intransitive depending on meaning."
    ],
    examples: ["She opened the door.", "The door opened."],
    commonMistakes: [],
    tips: ["Ask whether the verb directly acts on an object."],
    keywords: ["transitive", "intransitive"]
  },

  linking_verbs: {
    level: "B1",
    category: "Verbs",
    title: "Linking Verbs",
    definition: "Linking verbs connect the subject to a complement describing or identifying it.",
    rules: [
      "Common linking verbs include be, seem, become, feel, look, and remain."
    ],
    examples: ["She is happy.", "He became angry.", "The soup tastes good."],
    commonMistakes: [],
    tips: ["The complement describes or identifies the subject."],
    keywords: ["linking verb", "subject complement"]
  },

  finite_nonfinite: {
    level: "B1",
    category: "Verbs",
    title: "Finite and Non-Finite Verbs",
    definition: "Finite verbs show tense or agreement; non-finite verbs do not function as the main tensed verb.",
    rules: [
      "Infinitives, gerunds, and participles are non-finite forms."
    ],
    examples: ["She works.", "She wants to work.", "Working hard helps."],
    commonMistakes: [],
    tips: ["Find the verb carrying tense in the clause."],
    keywords: ["finite", "non-finite", "infinitive", "participle"]
  },

  passive_modal: {
    level: "B1",
    category: "Passive Voice",
    title: "Passive with Modal Verbs",
    definition: "Modal verbs can be combined with passive voice.",
    rules: [
      "Modal + be + past participle."
    ],
    examples: ["The work must be finished.", "It can be repaired."],
    commonMistakes: ["It must finished."],
    tips: ["Put be after the modal."],
    keywords: ["modal passive"]
  },

  passive_two_objects: {
    level: "B1",
    category: "Passive Voice",
    title: "Passive with Two Objects",
    definition: "Some verbs can have two objects, either of which may become the passive subject.",
    rules: [
      "Common verbs include give, send, offer, and show."
    ],
    examples: ["She was given a prize.", "A prize was given to her."],
    commonMistakes: [],
    tips: ["Consider which object you want to emphasise."],
    keywords: ["passive", "two objects"]
  },

  reported_questions: {
    level: "B1",
    category: "Reported Speech",
    title: "Reported Questions",
    definition: "Reported questions communicate questions indirectly.",
    rules: [
      "Use statement word order in reported questions.",
      "Yes/no questions commonly use if or whether."
    ],
    examples: ["She asked where I lived.", "He asked if I was ready."],
    commonMistakes: ["She asked where did I live."],
    tips: ["Do not use question inversion inside the reported clause."],
    keywords: ["reported questions"]
  },

  reported_commands: {
    level: "B1",
    category: "Reported Speech",
    title: "Reported Commands and Requests",
    definition: "Commands and requests can be reported using structures such as tell/ask + object + to-infinitive.",
    rules: [
      "Negative commands use not to."
    ],
    examples: ["She told me to wait.", "He asked us not to leave."],
    commonMistakes: [],
    tips: ["Choose the reporting verb according to the original meaning."],
    keywords: ["reported command", "reported request"]
  },

  time_clauses: {
    level: "B1",
    category: "Clauses",
    title: "Time Clauses",
    definition: "Time clauses show when an event happens.",
    rules: [
      "Common conjunctions include when, while, before, after, until, and as soon as."
    ],
    examples: ["Call me when you arrive.", "Wait until I return."],
    commonMistakes: ["When you will arrive, call me."],
    tips: ["Future time clauses commonly use present forms instead of will."],
    keywords: ["time clause", "when", "while", "until"]
  },

  reason_clauses: {
    level: "B1",
    category: "Clauses",
    title: "Reason Clauses",
    definition: "Reason clauses explain why something happens.",
    rules: [
      "Common conjunctions include because, since, and as."
    ],
    examples: ["We stayed home because it rained."],
    commonMistakes: [],
    tips: ["Use a reason conjunction to connect cause and result."],
    keywords: ["reason clause", "because", "since", "as"]
  },

  purpose_clauses: {
    level: "B1",
    category: "Clauses",
    title: "Purpose Clauses",
    definition: "Purpose clauses explain the intended reason for an action.",
    rules: [
      "Common forms include to, in order to, so that, and in order that."
    ],
    examples: ["I studied to pass the exam.", "She spoke quietly so that the baby wouldn't wake."],
    commonMistakes: [],
    tips: ["Choose the structure according to the subject and intended meaning."],
    keywords: ["purpose clause", "in order to", "so that"]
  },

  result_clauses: {
    level: "B1",
    category: "Clauses",
    title: "Result Clauses",
    definition: "Result clauses show the consequence of an action or situation.",
    rules: [
      "Common structures include so, such ... that, and so ... that."
    ],
    examples: ["It was so cold that we stayed inside.", "It was such a good film that I watched it twice."],
    commonMistakes: [],
    tips: ["So usually modifies an adjective/adverb; such usually modifies a noun phrase."],
    keywords: ["result clause", "so", "such"]
  },

  concession_clauses: {
    level: "B1",
    category: "Clauses",
    title: "Concession Clauses",
    definition: "Concession clauses show contrast or an unexpected result.",
    rules: [
      "Common conjunctions include although, even though, and though."
    ],
    examples: ["Although it was raining, we went out."],
    commonMistakes: ["Although it was raining, but we went out."],
    tips: ["Do not normally use although and but together."],
    keywords: ["although", "even though", "concession"]
  },

  phrasal_verbs: {
    level: "B1",
    category: "Multi-word Verbs",
    title: "Phrasal Verbs",
    definition: "Phrasal verbs combine a verb with one or more particles to create a particular meaning.",
    rules: [
      "Some phrasal verbs are separable.",
      "Some are inseparable."
    ],
    examples: ["turn off", "look after", "give up"],
    commonMistakes: [],
    tips: ["Learn phrasal verbs as complete expressions."],
    keywords: ["phrasal verb", "multi-word verb"]
  },

  prepositional_verbs: {
    level: "B1",
    category: "Multi-word Verbs",
    title: "Prepositional Verbs",
    definition: "Prepositional verbs consist of a verb followed by a specific preposition.",
    rules: [
      "The preposition is part of the verb expression."
    ],
    examples: ["listen to", "depend on", "belong to"],
    commonMistakes: ["listen music"],
    tips: ["Learn the verb together with its required preposition."],
    keywords: ["prepositional verb"]
  },

  // ============================================================
  // B2 — UPPER-INTERMEDIATE
  // ============================================================

  past_perfect_continuous: {
    level: "B2",
    category: "Tenses",
    title: "Past Perfect Continuous",
    definition: "The past perfect continuous describes an activity that had been continuing before another past event.",
    rules: [
      "Use had been + present participle."
    ],
    examples: ["She had been studying for hours before the test."],
    commonMistakes: ["She had been study."],
    tips: ["Use it to emphasise duration before a past reference point."],
    keywords: ["past perfect continuous"]
  },

  future_perfect_continuous: {
    level: "B2",
    category: "Tenses",
    title: "Future Perfect Continuous",
    definition: "The future perfect continuous describes an activity that will have continued for a period up to a future time.",
    rules: [
      "Use will have been + present participle."
    ],
    examples: ["By June, I will have been working here for five years."],
    commonMistakes: [],
    tips: ["It emphasises duration up to a future point."],
    keywords: ["future perfect continuous"]
  },

  future_in_past: {
    level: "B2",
    category: "Tenses",
    title: "Future in the Past",
    definition: "Future in the past describes something that was future from a past viewpoint.",
    rules: [
      "Common forms include would and was/were going to."
    ],
    examples: ["She said she would call.", "I knew they were going to leave."],
    commonMistakes: [],
    tips: ["Imagine looking forward from a point in the past."],
    keywords: ["future in the past", "would"]
  },

  narrative_tenses: {
    level: "B2",
    category: "Tenses",
    title: "Narrative Tenses",
    definition: "Narrative tenses are used together to organise events and background information in stories.",
    rules: [
      "Past simple often gives main events.",
      "Past continuous gives background.",
      "Past perfect shows earlier events."
    ],
    examples: ["I was walking home when I saw him. He had already left."],
    commonMistakes: [],
    tips: ["Choose the tense according to the time relationship between events."],
    keywords: ["narrative tenses"]
  },

  perfect_infinitive: {
    level: "B2",
    category: "Infinitives",
    title: "Perfect Infinitive",
    definition: "The perfect infinitive refers to an earlier event.",
    rules: [
      "Use to have + past participle."
    ],
    examples: ["She seems to have forgotten."],
    commonMistakes: ["She seems to have forgot."],
    tips: ["Use the past participle after have."],
    keywords: ["perfect infinitive"]
  },

  passive_infinitive: {
    level: "B2",
    category: "Infinitives",
    title: "Passive Infinitive",
    definition: "The passive infinitive focuses on the receiver of an action.",
    rules: [
      "Use to be + past participle."
    ],
    examples: ["The work needs to be completed."],
    commonMistakes: ["The work needs to completed."],
    tips: ["Passive infinitive = to be + past participle."],
    keywords: ["passive infinitive"]
  },

  perfect_gerund: {
    level: "B2",
    category: "Gerunds",
    title: "Perfect Gerund",
    definition: "A perfect gerund refers to an earlier action.",
    rules: [
      "Use having + past participle."
    ],
    examples: ["She apologised for having arrived late."],
    commonMistakes: [],
    tips: ["Use it when the gerund action happened before another action."],
    keywords: ["perfect gerund", "having"]
  },

  passive_gerund: {
    level: "B2",
    category: "Gerunds",
    title: "Passive Gerund",
    definition: "A passive gerund focuses on an action being done to someone or something.",
    rules: [
      "Use being + past participle."
    ],
    examples: ["He dislikes being ignored."],
    commonMistakes: [],
    tips: ["Being + past participle creates the passive -ing form."],
    keywords: ["passive gerund"]
  },

  have_get_something_done: {
    level: "B2",
    category: "Causatives",
    title: "Have/Get Something Done",
    definition: "This causative structure describes arranging for another person to perform a service.",
    rules: [
      "Have + object + past participle.",
      "Get + object + past participle."
    ],
    examples: ["I had my car repaired.", "She got her hair cut."],
    commonMistakes: ["I had repaired my car when meaning someone else repaired it."],
    tips: ["The structure emphasises arranging a service."],
    keywords: ["have something done", "get something done"]
  },

  modal_perfects: {
    level: "B2",
    category: "Modals",
    title: "Modal Perfects",
    definition: "Modal perfect structures express possibility, deduction, regret, criticism, or hypothetical past meanings.",
    rules: [
      "Use modal + have + past participle."
    ],
    examples: ["She might have forgotten.", "You should have called."],
    commonMistakes: ["She might has forgotten."],
    tips: ["The modal is followed by have, not has."],
    keywords: ["modal perfect", "should have", "might have"]
  },

  mixed_conditionals: {
    level: "B2",
    category: "Conditionals",
    title: "Mixed Conditionals",
    definition: "Mixed conditionals combine different time references between condition and result.",
    rules: [
      "Common patterns connect an unreal past condition with a present result, or vice versa."
    ],
    examples: ["If I had studied medicine, I would be a doctor now."],
    commonMistakes: [],
    tips: ["Identify the time of both the condition and result."],
    keywords: ["mixed conditional"]
  },

  conditional_inversion: {
    level: "B2",
    category: "Conditionals",
    title: "Conditional Inversion",
    definition: "Conditional inversion creates formal conditional structures without if.",
    rules: [
      "Common forms include Had..., Were..., and Should...."
    ],
    examples: ["Had I known, I would have helped.", "Should you need help, call me."],
    commonMistakes: [],
    tips: ["These forms are especially common in formal writing."],
    keywords: ["conditional inversion", "had I", "were I", "should you"]
  },

  participle_clauses: {
    level: "B2",
    category: "Clauses",
    title: "Participle Clauses",
    definition: "Participle clauses use participles to create shorter structures related to another clause.",
    rules: [
      "Present participles can show simultaneous or related actions.",
      "Past participles can create passive meanings."
    ],
    examples: ["Walking home, I saw Ali.", "Built in 1900, the house is historic."],
    commonMistakes: [],
    tips: ["The understood subject should normally match the main clause subject."],
    keywords: ["participle clause", "present participle", "past participle"]
  },

  reduced_relative_clauses: {
    level: "B2",
    category: "Relative Clauses",
    title: "Reduced Relative Clauses",
    definition: "Reduced relative clauses shorten certain relative clauses.",
    rules: [
      "Active clauses can often use an -ing form.",
      "Passive clauses can often use a past participle."
    ],
    examples: ["The man standing there is my teacher.", "The books written by Orwell are famous."],
    commonMistakes: [],
    tips: ["Check whether the noun performs or receives the action."],
    keywords: ["reduced relative clause"]
  },

  cleft_sentences: {
    level: "B2",
    category: "Emphasis",
    title: "Cleft Sentences",
    definition: "Cleft sentences divide information into parts to emphasise one element.",
    rules: [
      "Common patterns include It is/was ... that/who ... and What ... is ..."
    ],
    examples: ["It was Sara who called.", "What I need is some rest."],
    commonMistakes: [],
    tips: ["Use clefts when focus or contrast is important."],
    keywords: ["cleft sentence", "it-cleft", "what-cleft"]
  },

  emphasis_do: {
    level: "B2",
    category: "Emphasis",
    title: "Emphatic Do",
    definition: "Do, does, or did can be used to add emphasis to an affirmative statement.",
    rules: [
      "Use do/does/did + base verb."
    ],
    examples: ["I do understand.", "She did call you."],
    commonMistakes: ["She did called."],
    tips: ["Use the base verb after emphatic do."],
    keywords: ["emphatic do"]
  },

  ellipsis: {
    level: "B2",
    category: "Sentence Structure",
    title: "Ellipsis",
    definition: "Ellipsis omits words that can be understood from context.",
    rules: [
      "English commonly omits repeated words in coordinated or comparative structures."
    ],
    examples: ["I can play the guitar, and my sister can too."],
    commonMistakes: [],
    tips: ["The omitted information should remain clear from context."],
    keywords: ["ellipsis", "omission"]
  },

  substitution: {
    level: "B2",
    category: "Sentence Structure",
    title: "Substitution",
    definition: "Substitution uses words such as one, ones, do, and so to avoid repetition.",
    rules: [
      "The substitute must match the grammatical function of the omitted material."
    ],
    examples: ["I need a pen. Do you have one?", "I think so."],
    commonMistakes: [],
    tips: ["Use substitution to make language less repetitive."],
    keywords: ["substitution", "one", "ones", "do so"]
  },

  fronting: {
    level: "B2",
    category: "Word Order",
    title: "Fronting",
    definition: "Fronting moves an element to the beginning of a sentence for emphasis or organisation.",
    rules: [
      "The fronted element receives greater discourse focus."
    ],
    examples: ["This book, I really enjoyed."],
    commonMistakes: [],
    tips: ["Use fronting deliberately for emphasis."],
    keywords: ["fronting", "emphasis"]
  },

  negative_inversion: {
    level: "B2",
    category: "Inversion",
    title: "Negative Inversion",
    definition: "Negative or restrictive expressions can trigger auxiliary-subject inversion.",
    rules: [
      "Structures include never, rarely, seldom, hardly, and not only when placed initially."
    ],
    examples: ["Never have I seen such a view.", "Rarely does she complain."],
    commonMistakes: ["Never I have seen..."],
    tips: ["Put the auxiliary before the subject."],
    keywords: ["negative inversion", "inversion"]
  },

  advanced_articles: {
    level: "B2",
    category: "Articles",
    title: "Advanced Article Use",
    definition: "Advanced article use depends on whether a noun is generic, specific, known, unique, or institutionally understood.",
    rules: [
      "Article choice depends on meaning and context.",
      "Some institutions and geographical names follow special patterns."
    ],
    examples: ["the internet", "at school", "the United Kingdom"],
    commonMistakes: [],
    tips: ["Do not rely only on whether a noun is singular or plural."],
    keywords: ["advanced articles", "generic reference"]
  },

  hedging: {
    level: "B2",
    category: "Discourse",
    title: "Hedging",
    definition: "Hedging uses language that makes statements less absolute or more cautious.",
    rules: [
      "Common devices include may, might, seem, appear, generally, and perhaps."
    ],
    examples: ["This may suggest that...", "The results seem to indicate..."],
    commonMistakes: [],
    tips: ["Hedging is common in academic and formal writing."],
    keywords: ["hedging", "cautious language"]
  },

  nominalisation: {
    level: "B2",
    category: "Word Formation",
    title: "Nominalisation",
    definition: "Nominalisation turns verbs or adjectives into nouns.",
    rules: [
      "Suffixes such as -tion, -ment, -ness, and -ity often form nouns."
    ],
    examples: ["decide → decision", "develop → development", "happy → happiness"],
    commonMistakes: [],
    tips: ["Nominalisation is common in formal and academic writing."],
    keywords: ["nominalisation", "noun formation"]
  },

  adjective_order: {
    level: "B2",
    category: "Adjectives",
    title: "Adjective Order",
    definition: "Multiple adjectives usually follow a conventional order before a noun.",
    rules: [
      "A common sequence is opinion, size, age, shape, colour, origin, material, purpose, noun."
    ],
    examples: ["a beautiful small old wooden box"],
    commonMistakes: ["random adjective order"],
    tips: ["Do not overload a noun with unnecessary adjectives."],
    keywords: ["adjective order"]
  },

  advanced_prepositions: {
    level: "B2",
    category: "Prepositions",
    title: "Advanced Prepositions",
    definition: "Advanced preposition use includes complex prepositional phrases and fixed combinations.",
    rules: [
      "Many verbs, adjectives, and nouns select particular prepositions."
    ],
    examples: ["responsible for", "interested in", "in addition to"],
    commonMistakes: [],
    tips: ["Learn prepositions together with the words that select them."],
    keywords: ["preposition", "prepositional phrase"]
  },

  // ============================================================
  // C1 — ADVANCED
  // ============================================================

  subjunctive: {
    level: "C1",
    category: "Mood",
    title: "Subjunctive Mood",
    definition: "The subjunctive is used in certain formal structures expressing demands, recommendations, requirements, or hypothetical situations.",
    rules: [
      "The mandative subjunctive commonly uses the base form after certain verbs and expressions."
    ],
    examples: ["They recommended that he be informed.", "It is essential that she arrive on time."],
    commonMistakes: ["They recommended that he is informed in contexts requiring the subjunctive."],
    tips: ["It is particularly common in formal English."],
    keywords: ["subjunctive", "mandative subjunctive"]
  },

  absolute_constructions: {
    level: "C1",
    category: "Clauses",
    title: "Absolute Constructions",
    definition: "An absolute construction is a non-finite structure that provides additional information about a situation.",
    rules: [
      "It commonly contains a noun/pronoun plus a participle or adjective."
    ],
    examples: ["The work completed, we went home.", "Weather permitting, we will leave tomorrow."],
    commonMistakes: [],
    tips: ["Use carefully because the relationship between the absolute construction and main clause is implied."],
    keywords: ["absolute construction"]
  },

  nominal_relative_clauses: {
    level: "C1",
    category: "Clauses",
    title: "Nominal Relative Clauses",
    definition: "Nominal relative clauses function as noun phrases.",
    rules: [
      "Common forms include what, whatever, whoever, and wherever."
    ],
    examples: ["Take whatever you need.", "Whoever arrives first can choose."],
    commonMistakes: [],
    tips: ["These clauses can function as subjects, objects, or complements."],
    keywords: ["nominal relative", "free relative"]
  },

  free_relative_clauses: {
    level: "C1",
    category: "Clauses",
    title: "Free Relative Clauses",
    definition: "A free relative clause has no explicit antecedent and functions as a noun phrase.",
    rules: [
      "Common markers include what, whoever, whatever, and wherever."
    ],
    examples: ["What she said surprised me.", "Whoever wins will receive a prize."],
    commonMistakes: [],
    tips: ["The whole clause acts like a noun phrase."],
    keywords: ["free relative clause"]
  },

  advanced_inversion: {
    level: "C1",
    category: "Inversion",
    title: "Advanced Inversion",
    definition: "Advanced inversion changes normal subject-auxiliary order for emphasis, formality, or special structures.",
    rules: [
      "Inversion occurs after certain negative, restrictive, and limiting expressions."
    ],
    examples: [
      "Not only did she win, but she also broke the record.",
      "Only then did I understand."
    ],
    commonMistakes: [],
    tips: ["Look for fronted negative or restrictive expressions."],
    keywords: ["inversion", "advanced inversion"]
  },

  only_inversion: {
    level: "C1",
    category: "Inversion",
    title: "Inversion with Only",
    definition: "Only + fronted expression can trigger subject-auxiliary inversion.",
    rules: [
      "The auxiliary comes before the subject in the main clause."
    ],
    examples: ["Only later did I realise the truth.", "Only then did she speak."],
    commonMistakes: ["Only then I realised..."],
    tips: ["Check for the auxiliary before the subject."],
    keywords: ["only", "inversion"]
  },

  hardly_scarcely_no_sooner: {
    level: "C1",
    category: "Inversion",
    title: "Hardly, Scarcely and No Sooner",
    definition: "These structures describe events that happen immediately before another event.",
    rules: [
      "Formal patterns commonly use inversion.",
      "No sooner is commonly followed by than; hardly/scarcely by when."
    ],
    examples: [
      "Hardly had I arrived when it started raining.",
      "No sooner had she left than he arrived."
    ],
    commonMistakes: [],
    tips: ["These are formal structures and are often used in writing."],
    keywords: ["hardly", "scarcely", "no sooner", "inversion"]
  },

  only_if_inversion: {
    level: "C1",
    category: "Conditionals",
    title: "Only If Inversion",
    definition: "Only if at the beginning of a sentence can cause inversion in the main clause.",
    rules: [
      "The inversion occurs in the main clause, not inside the only-if clause."
    ],
    examples: ["Only if you study hard will you pass."],
    commonMistakes: [],
    tips: ["Do not invert inside the if-clause."],
    keywords: ["only if", "conditional inversion"]
  },

  advanced_causatives: {
    level: "C1",
    category: "Causatives",
    title: "Advanced Causative Structures",
    definition: "Advanced causatives express arranging, forcing, persuading, or allowing actions.",
    rules: [
      "Different causative verbs select different complements."
    ],
    examples: ["She persuaded him to leave.", "They had the machine repaired."],
    commonMistakes: [],
    tips: ["Learn each causative verb with its complement pattern."],
    keywords: ["causative", "persuade", "have", "get"]
  },

  advanced_modals: {
    level: "C1",
    category: "Modals",
    title: "Advanced Modal Meanings",
    definition: "Modal verbs can express subtle meanings such as logical deduction, criticism, expectation, probability, and obligation.",
    rules: [
      "Meaning depends heavily on context and tense."
    ],
    examples: ["She must be tired.", "He can't have forgotten.", "You needn't have waited."],
    commonMistakes: [],
    tips: ["Do not translate modal verbs mechanically; examine the context."],
    keywords: ["advanced modals", "deduction", "probability"]
  },

  stance_markers: {
    level: "C1",
    category: "Discourse",
    title: "Stance Markers",
    definition: "Stance markers show the writer's or speaker's attitude, certainty, evaluation, or position.",
    rules: [
      "They can express certainty, uncertainty, evaluation, or personal position."
    ],
    examples: ["Clearly, the evidence is limited.", "Arguably, this approach is effective."],
    commonMistakes: [],
    tips: ["Use stance markers appropriately for the level of certainty intended."],
    keywords: ["stance", "stance marker"]
  },

  cohesion_coherence: {
    level: "C1",
    category: "Discourse",
    title: "Cohesion and Coherence",
    definition: "Cohesion connects parts of a text grammatically and lexically; coherence makes the overall meaning logical and understandable.",
    rules: [
      "Use pronouns, substitution, conjunctions, repetition, and linking devices to create cohesion.",
      "Organise ideas logically to create coherence."
    ],
    examples: ["However", "therefore", "this", "such", "the former"],
    commonMistakes: ["Using linking words without a logical relationship."],
    tips: ["A text can have many linking words and still lack coherence."],
    keywords: ["cohesion", "coherence", "discourse"]
  },

  theme_rheme: {
    level: "C1",
    category: "Information Structure",
    title: "Theme and Rheme",
    definition: "Theme is what a clause is organised around; rheme provides the remaining information.",
    rules: [
      "Changing the opening of a clause can change information focus."
    ],
    examples: ["This problem, we need to solve today."],
    commonMistakes: [],
    tips: ["Useful for understanding emphasis and information flow."],
    keywords: ["theme", "rheme", "information structure"]
  },

  formal_informal_grammar: {
    level: "C1",
    category: "Register",
    title: "Formal and Informal Grammar",
    definition: "English grammar varies according to context, audience, purpose, and register.",
    rules: [
      "Formal writing may use more explicit structures.",
      "Informal speech commonly uses contractions, ellipsis, and conversational structures."
    ],
    examples: ["I would like to inform you... / I'll let you know..."],
    commonMistakes: [],
    tips: ["Choose grammar according to audience and purpose."],
    keywords: ["formal", "informal", "register"]
  },

  // ============================================================
  // C2 — PROFICIENCY
  // ============================================================

  advanced_aspect: {
    level: "C2",
    category: "Tenses",
    title: "Advanced Tense and Aspect",
    definition: "Advanced tense and aspect choices express subtle relationships involving completion, duration, repetition, viewpoint, and discourse.",
    rules: [
      "Choice depends on both grammatical form and intended viewpoint."
    ],
    examples: [
      "I have lived here for years.",
      "I have been living here for years.",
      "I had lived there before moving."
    ],
    commonMistakes: [],
    tips: ["Focus on why the speaker chose one aspect rather than another."],
    keywords: ["aspect", "tense", "viewpoint"]
  },

  advanced_verb_complementation: {
    level: "C2",
    category: "Verb Patterns",
    title: "Advanced Verb Complementation",
    definition: "Verb complementation describes the grammatical structures that can follow particular verbs.",
    rules: [
      "Different verbs select different complements.",
      "Some verbs allow more than one pattern with different meanings."
    ],
    examples: [
      "I remember meeting him.",
      "I remembered to call him.",
      "She persuaded him to leave."
    ],
    commonMistakes: [],
    tips: ["Learn difficult verbs with their complete patterns."],
    keywords: ["verb complementation", "verb pattern"]
  },

  complex_embedding: {
    level: "C2",
    category: "Sentence Structure",
    title: "Complex Clause Embedding",
    definition: "Clause embedding places one clause inside another clause or phrase.",
    rules: [
      "English can contain several layers of subordinate structures."
    ],
    examples: [
      "She explained that she believed that the plan would work."
    ],
    commonMistakes: [],
    tips: ["Track each clause and identify its grammatical role."],
    keywords: ["embedding", "embedded clause"]
  },

  grammatical_ambiguity: {
    level: "C2",
    category: "Advanced Grammar",
    title: "Grammatical Ambiguity",
    definition: "Grammatical ambiguity occurs when a sentence can reasonably have more than one structural interpretation.",
    rules: [
      "Context often resolves ambiguity.",
      "Writers can sometimes restructure sentences to remove ambiguity."
    ],
    examples: [
      "I saw the man with the telescope."
    ],
    commonMistakes: [],
    tips: ["Consider more than one possible grammatical attachment."],
    keywords: ["ambiguity", "syntactic ambiguity"]
  },

  academic_grammar: {
    level: "C2",
    category: "Academic English",
    title: "Academic Grammar",
    definition: "Academic grammar uses structures suited to formal, precise, evidence-based writing.",
    rules: [
      "Common features include cautious claims, complex noun phrases, passive structures, and precise logical connections."
    ],
    examples: [
      "The findings suggest that further research may be required."
    ],
    commonMistakes: [],
    tips: ["Prioritise clarity and precision over unnecessary complexity."],
    keywords: ["academic grammar", "academic writing"]
  },

  literary_grammar: {
    level: "C2",
    category: "Style",
    title: "Literary Grammar",
    definition: "Literary texts may deliberately use unusual grammatical structures for rhythm, emphasis, voice, or stylistic effect.",
    rules: [
      "Authors may manipulate normal word order or omit expected structures."
    ],
    examples: [
      "Long had she waited."
    ],
    commonMistakes: [],
    tips: ["Analyse unusual grammar in relation to style and context."],
    keywords: ["literary grammar", "literary style"]
  },

  spoken_grammar: {
    level: "C2",
    category: "Spoken English",
    title: "Spoken Grammar",
    definition: "Spoken English often uses structures that differ from formal written English.",
    rules: [
      "Speech commonly uses ellipsis, contractions, discourse markers, and unfinished structures."
    ],
    examples: [
      "You coming?",
      "Sounds good.",
      "Well, I don't know..."
    ],
    commonMistakes: [],
    tips: ["Do not automatically treat every spoken structure as appropriate for formal writing."],
    keywords: ["spoken grammar", "conversation"]
  },

  // ============================================================
  // CROSS-LEVEL GRAMMAR
  // ============================================================

  parts_of_speech: {
    level: "A1-C2",
    category: "Fundamentals",
    title: "Parts of Speech",
    definition: "Parts of speech classify words according to their grammatical roles.",
    rules: [
      "Major categories include nouns, pronouns, verbs, adjectives, adverbs, prepositions, conjunctions, determiners, and interjections."
    ],
    examples: ["noun: book", "verb: run", "adjective: happy", "adverb: quickly"],
    commonMistakes: [],
    tips: ["A word can sometimes belong to different categories depending on context."],
    keywords: ["parts of speech", "word classes"]
  },

  verb_classification: {
    level: "A1-C2",
    category: "Verbs",
    title: "Verb Classification",
    definition: "Verbs can be classified according to their grammatical function and meaning.",
    rules: [
      "Important classifications include main, auxiliary, modal, linking, transitive, intransitive, stative, and dynamic verbs."
    ],
    examples: ["be", "have", "can", "seem", "run", "know"],
    commonMistakes: [],
    tips: ["Classify a verb according to how it functions in the sentence."],
    keywords: ["verb classification"]
  },

  verb_forms: {
    level: "A1-C2",
    category: "Verbs",
    title: "Verb Forms",
    definition: "English verbs have several forms used in different grammatical structures.",
    rules: [
      "Important forms include base form, third-person singular, past, past participle, and present participle."
    ],
    examples: ["go → goes → went → gone → going"],
    commonMistakes: ["using went after have"],
    tips: ["Learn irregular verbs as complete sets of forms."],
    keywords: ["verb forms", "base", "past", "participle"]
  },

  sentence_types: {
    level: "A1-C2",
    category: "Sentence Structure",
    title: "Sentence Types",
    definition: "Sentences can be classified by purpose and by structural complexity.",
    rules: [
      "Purpose types include declarative, interrogative, imperative, and exclamatory.",
      "Structural types include simple, compound, complex, and compound-complex."
    ],
    examples: [
      "She studies. — declarative",
      "Does she study? — interrogative",
      "Study hard. — imperative"
    ],
    commonMistakes: [],
    tips: ["Separate purpose from structural complexity."],
    keywords: ["sentence types", "simple", "compound", "complex"]
  },

  simple_compound_complex: {
    level: "A1-C2",
    category: "Sentence Structure",
    title: "Simple, Compound and Complex Sentences",
    definition: "Sentence structures differ according to the number and relationship of clauses.",
    rules: [
      "A simple sentence has one independent clause.",
      "A compound sentence has multiple independent clauses.",
      "A complex sentence has an independent clause and at least one dependent clause."
    ],
    examples: [
      "I studied.",
      "I studied, and I passed.",
      "I passed because I studied."
    ],
    commonMistakes: [],
    tips: ["Count clauses and identify whether each is independent or dependent."],
    keywords: ["simple sentence", "compound sentence", "complex sentence"]
  },

  sentence_fragments: {
    level: "A1-C2",
    category: "Sentence Structure",
    title: "Sentence Fragments",
    definition: "A sentence fragment is an incomplete sentence presented as though it were complete.",
    rules: [
      "Formal writing usually requires complete clauses where a full sentence is intended."
    ],
    examples: ["Because I was tired. → fragment"],
    commonMistakes: ["Using dependent clauses as complete sentences."],
    tips: ["Check whether the sentence contains a complete independent clause."],
    keywords: ["sentence fragment"]
  },

  run_on_sentences: {
    level: "A1-C2",
    category: "Sentence Structure",
    title: "Run-on Sentences",
    definition: "A run-on sentence incorrectly joins independent clauses without appropriate punctuation or conjunction.",
    rules: [
      "Use a full stop, semicolon, or suitable conjunction to separate independent clauses."
    ],
    examples: ["I was tired, so I went home."],
    commonMistakes: ["I was tired I went home."],
    tips: ["Check whether two complete sentences have been incorrectly joined."],
    keywords: ["run-on sentence"]
  },

  parallel_structure: {
    level: "B1-C2",
    category: "Sentence Structure",
    title: "Parallel Structure",
    definition: "Parallel structure uses matching grammatical forms for items in a series or comparison.",
    rules: [
      "Coordinate equivalent ideas using equivalent grammatical structures."
    ],
    examples: ["She likes reading, writing, and painting."],
    commonMistakes: ["She likes reading, writing, and to paint."],
    tips: ["Keep items in a list grammatically balanced."],
    keywords: ["parallelism", "parallel structure"]
  },

  punctuation: {
    level: "A1-C2",
    category: "Punctuation",
    title: "Punctuation",
    definition: "Punctuation marks organise written language and clarify meaning.",
    rules: [
      "Important marks include full stops, commas, semicolons, colons, apostrophes, quotation marks, question marks, and exclamation marks."
    ],
    examples: ["I came, I saw, and I learned.", "She said, \"Hello.\""],
    commonMistakes: ["Comma splices", "missing apostrophes"],
    tips: ["Use punctuation to show grammatical relationships, not just pauses."],
    keywords: ["punctuation", "comma", "semicolon", "colon"]
  },

  comma_rules: {
    level: "A2-C2",
    category: "Punctuation",
    title: "Comma Rules",
    definition: "Commas separate and organise certain sentence elements.",
    rules: [
      "Use commas in lists.",
      "Use commas after many introductory elements.",
      "Use commas around non-essential information."
    ],
    examples: ["After lunch, we left.", "My brother, who lives abroad, called me."],
    commonMistakes: ["Using a comma between a subject and its verb."],
    tips: ["Do not insert commas simply wherever you would pause when speaking."],
    keywords: ["comma", "comma rules"]
  },

  apostrophes: {
    level: "A1-C2",
    category: "Punctuation",
    title: "Apostrophes",
    definition: "Apostrophes are commonly used for possession and contractions.",
    rules: [
      "Use apostrophes in contractions.",
      "Use apostrophes in possessive forms."
    ],
    examples: ["don't", "Sara's book", "the students' books"],
    commonMistakes: ["it's when meaning possession"],
    tips: ["Its is possessive; it's means it is or it has."],
    keywords: ["apostrophe", "possession", "contraction"]
  },

  contractions: {
    level: "A1-C2",
    category: "Grammar",
    title: "Contractions",
    definition: "Contractions combine words into shorter forms, especially in speech and informal writing.",
    rules: [
      "Common contractions include I'm, you're, don't, can't, won't, and they've."
    ],
    examples: ["I am → I'm", "do not → don't"],
    commonMistakes: ["Confusing you're and your."],
    tips: ["Avoid contractions when a very formal style requires expanded forms."],
    keywords: ["contraction"]
  },

  spelling_rules: {
    level: "A1-C2",
    category: "Spelling",
    title: "English Spelling Rules",
    definition: "English spelling follows many patterns, although there are numerous exceptions.",
    rules: [
      "Important patterns include plural endings, -ed, -ing, comparative endings, and consonant doubling."
    ],
    examples: ["stop → stopped", "make → making", "happy → happier"],
    commonMistakes: [],
    tips: ["Learn common spelling patterns alongside exceptions."],
    keywords: ["spelling", "word endings"]
  },

  prefixes_suffixes: {
    level: "A1-C2",
    category: "Word Formation",
    title: "Prefixes and Suffixes",
    definition: "Prefixes and suffixes are added to words to change meaning or grammatical category.",
    rules: [
      "Prefixes usually change meaning.",
      "Suffixes can change meaning or word class."
    ],
    examples: ["unhappy", "rewrite", "happiness", "careful"],
    commonMistakes: [],
    tips: ["Learn common affixes and their meanings."],
    keywords: ["prefix", "suffix", "word formation"]
  },

  commonly_confused_words: {
    level: "A1-C2",
    category: "Usage",
    title: "Commonly Confused Words",
    definition: "Some English words have similar forms or meanings but different grammatical uses.",
    rules: [
      "Context and grammatical function determine the correct word."
    ],
    examples: [
      "your / you're",
      "their / there / they're",
      "its / it's",
      "affect / effect",
      "who / whom"
    ],
    commonMistakes: ["Confusing homophones and near-synonyms."],
    tips: ["Study confusing pairs together."],
    keywords: ["confusing words", "common mistakes"]
  },

  agreement: {
    level: "A1-C2",
    category: "Agreement",
    title: "Subject-Verb Agreement",
    definition: "Subject-verb agreement means that the verb form matches the grammatical subject.",
    rules: [
      "Present simple third-person singular subjects normally take -s.",
      "Plural subjects normally take plural verb forms."
    ],
    examples: ["She works.", "They work."],
    commonMistakes: ["She work.", "They works."],
    tips: ["Ignore intervening phrases and identify the real subject."],
    keywords: ["subject-verb agreement", "agreement"]
  },

  proximity_agreement: {
    level: "C1",
    category: "Agreement",
    title: "Proximity Agreement",
    definition: "Proximity agreement occurs when agreement is influenced by a nearby noun rather than the grammatical head.",
    rules: [
      "It can occur in certain complex constructions, especially in informal usage."
    ],
    examples: ["A list of changes is required. — formal agreement with list."],
    commonMistakes: [],
    tips: ["In formal writing, identify the grammatical head of the subject."],
    keywords: ["proximity agreement"]
  },

  collective_agreement: {
    level: "B1-C2",
    category: "Agreement",
    title: "Agreement with Collective Nouns",
    definition: "Collective nouns can take singular or plural agreement depending on variety of English and whether the group is viewed as a unit or individuals.",
    rules: [
      "American English commonly uses singular agreement.",
      "British English can use singular or plural agreement depending on meaning."
    ],
    examples: ["The team is winning.", "The team are wearing their new kits."],
    commonMistakes: [],
    tips: ["Consider both the variety of English and intended meaning."],
    keywords: ["collective noun", "agreement"]
  },

  misplaced_modifiers: {
    level: "B2-C2",
    category: "Modifiers",
    title: "Misplaced Modifiers",
    definition: "A misplaced modifier is positioned so that it appears to modify the wrong word or phrase.",
    rules: [
      "Place modifiers close to the words they logically modify."
    ],
    examples: ["She almost drove the car for two hours. → potentially ambiguous"],
    commonMistakes: [],
    tips: ["Check exactly what the modifier describes."],
    keywords: ["misplaced modifier"]
  },

  dangling_modifiers: {
    level: "B2-C2",
    category: "Modifiers",
    title: "Dangling Modifiers",
    definition: "A dangling modifier lacks a clear grammatical subject that can logically perform the modified action.",
    rules: [
      "The understood subject of an introductory participle phrase should normally match the main clause subject."
    ],
    examples: ["Walking home, the rain started. → dangling"],
    commonMistakes: [],
    tips: ["Ask: Who is performing the action in the modifier?"],
    keywords: ["dangling modifier"]
  },

  negative_structures: {
    level: "B1-C2",
    category: "Negation",
    title: "Negative Structures",
    definition: "English uses several grammatical structures to express negation.",
    rules: [
      "Common negative markers include not, never, no, nobody, nothing, and neither."
    ],
    examples: ["I don't know.", "Nobody came.", "She never complains."],
    commonMistakes: ["Unintended double negatives in standard formal English."],
    tips: ["Check whether more than one negative element changes the intended meaning."],
    keywords: ["negation", "negative"]
  },

  linking_words: {
    level: "B1-C2",
    category: "Discourse",
    title: "Linking Words",
    definition: "Linking words connect ideas and show relationships such as contrast, cause, result, addition, and sequence.",
    rules: [
      "Choose a linker according to the logical relationship between ideas."
    ],
    examples: ["however", "therefore", "moreover", "although", "consequently"],
    commonMistakes: [],
    tips: ["Do not choose linkers only because they sound formal."],
    keywords: ["linking words", "connectors", "discourse markers"]
  },

  discourse_markers: {
    level: "B2-C2",
    category: "Discourse",
    title: "Discourse Markers",
    definition: "Discourse markers organise speech or writing and show relationships between ideas.",
    rules: [
      "They can signal contrast, addition, topic change, conclusion, or attitude."
    ],
    examples: ["however", "well", "anyway", "in addition", "on the other hand"],
    commonMistakes: [],
    tips: ["Use markers naturally rather than adding them to every sentence."],
    keywords: ["discourse marker"]
  },

  complex_prepositions: {
    level: "B2-C2",
    category: "Prepositions",
    title: "Complex Prepositions",
    definition: "Complex prepositions consist of multiple words functioning as a preposition.",
    rules: [
      "Common examples include in front of, because of, in addition to, and with regard to."
    ],
    examples: ["because of the rain", "in addition to English"],
    commonMistakes: [],
    tips: ["Treat common multi-word prepositions as fixed expressions."],
    keywords: ["complex preposition", "multi-word preposition"]
  },

  adjective_preposition: {
    level: "A2-C2",
    category: "Adjectives",
    title: "Adjective + Preposition",
    definition: "Some adjectives are conventionally followed by particular prepositions.",
    rules: [
      "The required preposition depends on the adjective."
    ],
    examples: ["interested in", "good at", "afraid of", "responsible for"],
    commonMistakes: ["interested on"],
    tips: ["Learn adjective + preposition combinations together."],
    keywords: ["adjective preposition", "collocation"]
  },

  adverb_position: {
    level: "A2-C2",
    category: "Adverbs",
    title: "Adverb Position",
    definition: "The position of an adverb depends on its type, grammatical function, and intended emphasis.",
    rules: [
      "Frequency adverbs commonly occur before the main verb.",
      "Manner adverbs often occur after the verb or object."
    ],
    examples: ["She often studies.", "He completed the work quickly."],
    commonMistakes: [],
    tips: ["Moving an adverb can change emphasis or sometimes meaning."],
    keywords: ["adverb position"]
  },

  verb_patterns: {
    level: "B1-C2",
    category: "Verb Patterns",
    title: "Verb Patterns",
    definition: "Verb patterns describe the grammatical forms that follow particular verbs.",
    rules: [
      "Patterns include verb + gerund, verb + infinitive, verb + object + infinitive, and verb + preposition."
    ],
    examples: ["enjoy reading", "want to leave", "tell him to wait"],
    commonMistakes: [],
    tips: ["Learn difficult verbs together with their required pattern."],
    keywords: ["verb pattern", "complementation"]
  },

  noun_countability_advanced: {
    level: "B2-C2",
    category: "Nouns",
    title: "Advanced Countability",
    definition: "Some nouns can be countable or uncountable depending on meaning.",
    rules: [
      "Changing countability can change meaning."
    ],
    examples: [
      "chicken = food / a chicken = an animal",
      "experience = knowledge / experiences = events"
    ],
    commonMistakes: [],
    tips: ["Check whether the noun refers to a substance, concept, instance, or individual item."],
    keywords: ["countability", "countable", "uncountable"]
  },

  appositives: {
    level: "B2-C2",
    category: "Noun Phrases",
    title: "Appositives",
    definition: "An appositive is a noun or noun phrase placed beside another noun phrase to rename or explain it.",
    rules: [
      "Non-essential appositives are often set off with commas."
    ],
    examples: ["My sister, a doctor, lives nearby."],
    commonMistakes: [],
    tips: ["Ask whether the second noun phrase identifies or explains the first."],
    keywords: ["appositive", "apposition"]
  },

  participle_phrases: {
    level: "B2-C2",
    category: "Phrases",
    title: "Participle Phrases",
    definition: "Participle phrases contain participles and modifiers and function as descriptive phrases.",
    rules: [
      "Present participle phrases often have active meanings.",
      "Past participle phrases often have passive meanings."
    ],
    examples: ["Running down the road, he waved.", "Built in 1920, the house is historic."],
    commonMistakes: [],
    tips: ["Make sure the phrase clearly modifies the intended noun."],
    keywords: ["participle phrase"]
  },

  word_order: {
    level: "A1-C2",
    category: "Word Order",
    title: "English Word Order",
    definition: "English generally follows a relatively fixed order of subjects, verbs, objects, complements, and modifiers.",
    rules: [
      "Basic declarative order is commonly Subject + Verb + Object.",
      "Adverb placement varies according to type and meaning."
    ],
    examples: ["She reads books.", "They carefully completed the task."],
    commonMistakes: [],
    tips: ["Identify the core sentence before adding modifiers."],
    keywords: ["word order", "syntax"]
  },

  question_formation: {
    level: "A1-C2",
    category: "Questions",
    title: "Question Formation",
    definition: "English questions use different structures depending on the auxiliary, tense, and whether the question word is the subject.",
    rules: [
      "Many questions require auxiliary-subject inversion.",
      "Do/does/did are used with many main verbs in simple tenses."
    ],
    examples: ["Do you work?", "Where did she go?", "Who called?"],
    commonMistakes: ["Where she went?"],
    tips: ["Identify the tense and auxiliary first."],
    keywords: ["question formation"]
  },

  advanced_conjunctions: {
    level: "B2-C2",
    category: "Conjunctions",
    title: "Advanced Conjunctions",
    definition: "Advanced conjunctions express nuanced relationships between clauses.",
    rules: [
      "Examples include whereas, while, notwithstanding, provided that, inasmuch as, and albeit."
    ],
    examples: ["Whereas he agreed, she objected.", "Albeit difficult, the task was completed."],
    commonMistakes: [],
    tips: ["Choose conjunctions according to exact meaning and register."],
    keywords: ["advanced conjunctions"]
  },

  formal_subordinate_clause_reduction: {
    level: "C1-C2",
    category: "Clauses",
    title: "Subordinate Clause Reduction",
    definition: "Some subordinate clauses can be shortened into participial or non-finite structures.",
    rules: [
      "Reduction is possible when the relationship between the clauses is clear.",
      "The understood subject must be logically appropriate."
    ],
    examples: ["When she was walking home, she called me. → While walking home, she called me."],
    commonMistakes: [],
    tips: ["Avoid reductions that create dangling modifiers."],
    keywords: ["clause reduction", "reduced clause"]
  },

  academic_linking: {
    level: "B2-C2",
    category: "Academic English",
    title: "Academic Linking Expressions",
    definition: "Academic linking expressions show precise relationships between claims and evidence.",
    rules: [
      "Use expressions for contrast, cause, consequence, qualification, and addition."
    ],
    examples: [
      "Furthermore",
      "Nevertheless",
      "Consequently",
      "In contrast",
      "To some extent"
    ],
    commonMistakes: [],
    tips: ["Choose the connector based on logic, not formality alone."],
    keywords: ["academic linking", "connectors"]
  },

  register: {
    level: "B2-C2",
    category: "Style",
    title: "Register",
    definition: "Register is the level and style of language appropriate to a particular situation, audience, and purpose.",
    rules: [
      "Grammar, vocabulary, contractions, and sentence structure can vary by register."
    ],
    examples: ["formal", "neutral", "informal", "academic", "spoken"],
    commonMistakes: [],
    tips: ["Match your grammar to the audience and purpose."],
    keywords: ["register", "formal", "informal"]
  }
};

sendButton.addEventListener("click", handleSend);
userInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSend();
  }
});
micButton.addEventListener("click", toggleRecording);
uploadButton.addEventListener("click", () => attachInput.click());
attachInput.addEventListener("change", handleAttachment);
cameraButton.addEventListener("click", openCamera);
captureButton.addEventListener("click", takePhoto);
closeCameraButton.addEventListener("click", closeCamera);
chatWindow.addEventListener("scroll", handleScroll);
scrollButton.addEventListener("click", () => {
  chatWindow.scrollTop = chatWindow.scrollHeight;
  scrollButton.classList.remove("visible");
});
rateUsStars.addEventListener("click", handleRateUsStar);

function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;

  userInput.value = "";
  addMessage("user", text);
  addMessage("ai", "AI is thinking…", { status: "typing" });

  requestAIResponse(text);
}

function addMessage(role, content, meta = {}) {
  const message = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    status: meta.status || "normal",
    timestamp: new Date().toISOString(),
    attachmentType: meta.attachmentType || null,
    attachmentURL: meta.attachmentURL || null,
    attachmentName: meta.attachmentName || null
  };

  chatHistory.push(message);
  renderChat();
  return message;
}

function updateMessage(id, patch) {
  const index = chatHistory.findIndex(message => message.id === id);
  if (index === -1) return;

  chatHistory[index] = { ...chatHistory[index], ...patch };
  renderChat();
}

function renderChat() {
  chatWindow.innerHTML = chatHistory
    .map(message => {
      const isUser = message.role === "user";
      const classes = `message ${isUser ? "user" : "ai"}`;

      if (message.status === "typing") {
        return `
          <div class="${classes}">
            <div class="typing-indicator">
              <span class="label">AI</span>
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
        `;
      }

      const attachmentHtml = renderAttachment(message);

      return `
        <article class="${classes}">
          <div class="label">${isUser ? "You" : "AI"}</div>
          <p>${escapeHtml(message.content).replace(/\n/g, "<br>")}</p>
          ${attachmentHtml}
        </article>
      `;
    })
    .join("");

  scrollToBottom();
}

function renderAttachment(message) {
  if (!message.attachmentType || !message.attachmentURL) return "";

  if (message.attachmentType === "image") {
    return `<img class="attachment-image" src="${message.attachmentURL}" alt="${escapeHtml(message.attachmentName || "Image")}" />`;
  }

  if (message.attachmentType === "video") {
    return `<video class="attachment-video" controls src="${message.attachmentURL}"></video>`;
  }

  if (message.attachmentType === "audio") {
    return `<audio class="attachment-audio" controls src="${message.attachmentURL}"></audio>`;
  }

  return `<div class="attachment-file">File: ${escapeHtml(message.attachmentName || "Attachment")}</div>`;
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatWindow.scrollTop = chatWindow.scrollHeight;
    const chatBox = document.getElementById('chat-box');
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  });
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function requestAIResponse(prompt) {
  const typingIndex = chatHistory.findIndex(message => message.status === "typing" && message.role === "ai");
  const typingMessage = chatHistory[typingIndex];

  showLoading(true);

  try {
    const aiText = await callAI(prompt);

    if (typingMessage) {
      updateMessage(typingMessage.id, {
        content: aiText,
        status: "normal"
      });
    } else {
      addMessage("ai", aiText);
    }
  } catch (error) {
    console.error(error);
    if (typingMessage) {
      updateMessage(typingMessage.id, {
        content: "Sorry, something went wrong. Try again.",
        status: "normal"
      });
    }
  } finally {
    showLoading(false);
  }
}

function callAI(message) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(englishAI(message, getConversationContext(message)));
    }, 700);
  });
}

function getConversationContext(currentInput) {
  const messages = chatHistory.filter(message => message.status !== "typing");
  const currentUserIndex = messages.findLastIndex(message => message.role === "user");
  const previousMessages = currentUserIndex === -1 ? messages : messages.slice(0, currentUserIndex);
  const previousUsers = previousMessages.filter(message => message.role === "user");
  const previousAssistant = previousMessages.filter(message => message.role === "ai").at(-1);
  const topicKey = detectTopic(currentInput) || [...previousUsers]
    .reverse()
    .map(message => detectTopic(message.content))
    .find(Boolean) || null;

  return {
    topicKey,
    previousUserMessage: previousUsers.at(-1)?.content || "",
    previousAssistantMessage: previousAssistant?.content || ""
  };
}

function detectTopic(input) {
  const normalized = ` ${normalizeMessage(input)} `;
  const genericKeywords = new Set([
    "about", "all", "am", "an", "and", "are", "be", "can", "do", "does", "dont", "for", "from", "had", "has", "have", "he", "her", "him", "how", "i", "in", "is", "it", "like", "me", "my", "of", "on", "or", "our", "please", "practice", "question", "questions", "quiz", "she", "that", "the", "their", "them", "there", "they", "this", "to", "try", "type", "types", "us", "was", "we", "what", "when", "where", "which", "who", "why", "will", "with", "would", "you", "your"
  ]);

  // Collect all keyword matches with their lengths
  const matches = [];
  
  for (const topicKey of Object.keys(grammarDB)) {
    const topic = grammarDB[topicKey];
    for (const keyword of topic.keywords) {
      const normalizedKeyword = normalizeMessage(keyword);
      if (normalizedKeyword.length > 2 && !genericKeywords.has(normalizedKeyword) && normalized.includes(` ${normalizedKeyword} `)) {
        matches.push({ topicKey, keyword, length: keyword.length });
      }
    }
  }

  // If we have matches, return the one with the longest keyword (most specific)
  if (matches.length > 0) {
    matches.sort((a, b) => b.length - a.length);
    return matches[0].topicKey;
  }

  // Fallback: check if topic key itself is in the input
  for (const topicKey of Object.keys(grammarDB)) {
    const normalizedTopicKey = normalizeMessage(topicKey);
    if (normalizedTopicKey && normalized.includes(` ${normalizedTopicKey} `)) {
      return topicKey;
    }
  }

  return null;
}

function detectIntent(input) {
  const s = input.toLowerCase();
  if (/check|correct|grammar check|fix my|what's wrong|is this correct|error/.test(s)) return 'grammar_check';
  if (/rewrite|paraphrase|improve|edit|make it better|rephrase|fix this sentence/.test(s)) return 'rewrite';
  if (/write an essay|essay about|compose an essay|generate an essay|write about/.test(s)) return 'essay';
  if (/chat|talk|conversation|have a chat|practice speaking|speak with me/.test(s)) return 'conversation';
  if (/suggest|advice|how to improve|writing coach|feedback on my/.test(s)) return 'coach';
  return null;
}

const previousReplies = new Map();

function normalizeMessage(input) {
  return input
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function detectConversationIntent(input) {
  const text = normalizeMessage(input);

  if (/\b(youre not helping|this is so confusing|im frustrated|this makes no sense|so annoying)\b/.test(text)) return "frustrated";
  if (/\b(i dont understand|i dont get it|confused|huh|what do you mean|im lost)\b/.test(text)) return "confused";
  if (/\b(explain that again|say that again|repeat that|one more time|simpler|in simpler words)\b/.test(text)) return "explain_again";
  if (/^(thanks|thank you|thanks a lot|thank you so much|youre the best|thx|ty)$/.test(text)) return "thanks";
  if (/^(bye|goodbye|see you|see ya|good night|gotta go)$/.test(text)) return "goodbye";
  if (/^(good morning|good afternoon|good evening|hi|hi there|hello|hello there|hey|hey there|yo|whats up|wsp|sup|sup chat)$/.test(text)) return "greeting";
  if (/^(how are you|hows it going|how are you doing)$/.test(text)) return "how_are_you";
  if (/^(why|how)$/.test(text)) return text === "why" ? "followup_why" : "followup_how";
  if (/^(lol|lmao|haha|hehe|😂+)$/.test(text)) return "playful";
  if (/\b(tell me a joke|make me laugh|got a joke)\b/.test(text)) return "joke";
  if (/^(bro|dude|wyd|what you doing)$/.test(text)) return "casual_chat";
  if (/^(yes|yeah|yep|no|nope|okay|ok|sure|hmm|maybe)$/.test(text)) return "short_reply";
  if (/^(can you help me|help me|i need help|teach me english)$/.test(text) || /\b(can you help me|i need help with)\b/.test(text)) return "need_help";
  if (/^(what is grammar|whats grammar|define grammar)$/.test(text)) return "grammar_definition";

  return null;
}

function variedReply(intent, options) {
  const previous = previousReplies.get(intent);
  const choices = options.filter(reply => reply !== previous);
  const reply = choices[Math.floor(Math.random() * choices.length)] || options[0];
  previousReplies.set(intent, reply);
  return reply;
}

function getTopicTitle(topic) {
  return topic.name || topic.title || "this topic";
}

function startGrammarQuiz(topicKey) {
  const topic = grammarDB[topicKey];
  const question = topic.commonMistakes?.find(entry => entry.includes("→"));
  if (!question) return `I don't have a database-backed quiz item for ${getTopicTitle(topic)} yet. Try another grammar topic.`;

  const [incorrect, correct] = question.split("→").map(option => option.replace(/[❌✓]/g, "").trim());
  activeQuiz = { topicKey, correctAnswer: "b", explanation: question };
  return `Quick ${getTopicTitle(topic)} check:\n\nWhich form is correct?\nA) ${incorrect}\nB) ${correct}\n\nReply A or B, and I'll explain why.`;
}

function checkGrammarQuizAnswer(input) {
  const answer = normalizeMessage(input);
  if (!activeQuiz || !/^(a|b|option a|option b)$/.test(answer)) return null;

  const selected = answer.endsWith("a") ? "a" : "b";
  const quiz = activeQuiz;
  activeQuiz = null;
  return selected === quiz.correctAnswer
    ? `That's right. The database correction is: ${quiz.explanation}`
    : `Not quite. The correct choice is B. ${quiz.explanation}`;
}

function respondToConversation(intent, input, context) {
  const topic = context.topicKey ? grammarDB[context.topicKey] : null;
  const casual = /\b(bro|dude|yo|wyd|wym)\b/i.test(input);

  if (intent === "greeting") {
    return variedReply(intent, [
      "Hey! What's up? What can I help you with?",
      "Yo! What are we working on today?",
      "Hey there! How can I help?",
      "Hi! What would you like to figure out today?"
    ]);
  }
  if (intent === "how_are_you") return variedReply(intent, ["I'm doing well, thanks! What can I help you with?", "All good here. What are you working on?"]);
  if (intent === "thanks") return variedReply(intent, ["You're welcome!", "Anytime. Happy to help.", "Of course! Let me know what else you need."]);
  if (intent === "goodbye") return variedReply(intent, ["See you later! Good luck with your learning.", "Goodbye! Come back whenever you need a hand.", "Good night! Take care."]);
  if (intent === "playful") return variedReply(intent, ["Haha. What should we tackle next?", "Glad that made you smile. Need help with anything?", "😄 What's next?"]);
  if (intent === "joke") return variedReply(intent, ["Why did the comma break up with the sentence? It needed a little space. Want another one?", "Why was the grammar book so calm? It knew how to handle its clauses. Want another?"]);
  if (intent === "casual_chat") return variedReply(intent, ["Hey! What's up? What can I help you with?", "Not much, just here to help. What are you working on?", "Hey, what can I help you figure out?"]);
  if (intent === "frustrated") return casual
    ? "I hear you, bro. Let's slow it down and tackle one part at a time. Which part is giving you trouble?"
    : "I hear you. Let's slow down and work through one part at a time. Which part is giving you trouble?";
  if (intent === "confused" || intent === "explain_again") {
    if (!topic) return "No worries. Which part should I explain again? You can paste the sentence or tell me the topic.";
    return `No worries${casual ? ", bro" : ""}. ${getTopicTitle(topic)}: ${topic.definition} ${Array.isArray(topic.rules) ? topic.rules[0] : topic.rules} Would an example help?`;
  }
  if (intent === "short_reply") {
    const affirmative = /^(yes|yeah|yep|okay|ok|sure)$/.test(normalizeMessage(input));
    if (affirmative && topic && /practice question|quiz/i.test(context.previousAssistantMessage)) return startGrammarQuiz(context.topicKey);
    if (affirmative && topic && /example/i.test(context.previousAssistantMessage)) {
      return `Here's another example of ${getTopicTitle(topic)}: ${topic.examples[0]} Would you like to try one yourself?`;
    }
    if (/^(no|nope)$/.test(normalizeMessage(input))) return "No problem. What would you like to do instead?";
    if (topic) return `Got it. Would you like another example of ${getTopicTitle(topic)}, or a quick practice question?`;
    return "Got it. Tell me a little more about what you'd like help with.";
  }
  if (intent === "followup_why" || intent === "followup_how") {
    if (!topic) return "Which part are you asking about? I can explain the reason or walk through it step by step.";
    const rule = Array.isArray(topic.rules) ? topic.rules[0] : topic.rules;
    return intent === "followup_why"
      ? `For ${getTopicTitle(topic)}, the key idea is: ${rule} Which part would you like me to unpack?`
      : `For ${getTopicTitle(topic)}, start here: ${rule} For example, ${topic.examples[0]}`;
  }
  if (intent === "need_help") return "Of course! Would you like help with grammar, vocabulary, speaking, writing, or something else?";
  if (intent === "grammar_definition") return "Grammar is the set of patterns and rules we use to build clear sentences, such as word order, verb forms, and punctuation. Is there a part you'd like to explore?";

  return null;
}

function buildErrorsMap() {
  const map = new Map();
  for (const topicKey of Object.keys(grammarDB)) {
    const topic = grammarDB[topicKey];
    if (!topic.commonMistakes) continue;
    for (const entry of topic.commonMistakes) {
      const parts = entry.split('→');
      if (parts.length === 2) {
        const wrong = parts[0].replace(/[^a-zA-Z0-9\s']/g, '').trim().toLowerCase();
        const correct = parts[1].replace(/[^a-zA-Z0-9\s']/g, '').trim();
        if (wrong) map.set(wrong, correct);
      }
    }
  }
  // Add a few explicit common confusions
  map.set("its raining", "It's raining");
  map.set("its a cat", "It's a cat");
  map.set("their going", "they're going");
  return map;
}

function grammarCheck(text) {
  const normalized = text.toLowerCase();
  const errors = [];
  const map = buildErrorsMap();
  for (const [wrong, correct] of map.entries()) {
    const pattern = new RegExp('\\b' + wrong.replace(/\s+/g, '\\s+') + '\\b', 'i');
    if (pattern.test(normalized)) {
      errors.push({ wrong, correct });
    }
  }

  // Simple subject-verb agreement quick checks
  if (/\b(he|she|it)\s+\w+\b/i.test(text)) {
    const m = text.match(/\b(he|she|it)\s+(\w+)\b/i);
    const verb = m?.[2].toLowerCase();
    const alreadyThirdPerson = /^(am|is|are|was|were|has|have|had|do|does|did|can|could|may|might|must|shall|should|will|would|\w+s)$/.test(verb || "");
    if (m && !alreadyThirdPerson) {
      const correctedVerb = { be: "is", do: "does", go: "goes", have: "has" }[verb]
        || (/[^aeiou]y$/.test(verb) ? `${verb.slice(0, -1)}ies` : /(s|sh|ch|x|z|o)$/.test(verb) ? `${verb}es` : `${verb}s`);
      errors.push({ wrong: `${m[1]} ${m[2]}`, correct: `${m[1]} ${correctedVerb}` });
    }
  }

  return errors;
}

function rewriteImproved(text) {
  let out = text.trim();
  const map = buildErrorsMap();
  for (const [wrong, correct] of map.entries()) {
    const pattern = new RegExp('\\b' + wrong.replace(/\s+/g, '\\s+') + '\\b', 'ig');
    out = out.replace(pattern, correct);
  }
  out = out.charAt(0).toUpperCase() + out.slice(1);
  if (!/[.!?]$/.test(out)) out += '.';
  return out;
}

function generateEssay(topicText) {
  const title = topicText.replace(/write an essay about|write about|essay about/i, '').trim() || 'the topic';
  return `Title: ${title}\n\n` +
    `Introduction:\nA short introduction to ${title}, explaining why it matters and setting the context.\n\n` +
    `Body:\nParagraph 1 — Explain the main idea and give an example.\nParagraph 2 — Provide details, reasons, or evidence.\n\n` +
    `Conclusion:\nSummarise the main points and provide a closing thought or suggestion.\n`;
}

function englishAI(input, context = { topicKey: null }) {
  const quizResult = checkGrammarQuizAnswer(input);
  if (quizResult) return quizResult;

  const detectedTopic = detectTopic(input);
  if (pendingQuiz && detectedTopic) {
    pendingQuiz = false;
    return startGrammarQuiz(detectedTopic);
  }

  const intent = detectIntent(input);

  if (intent === 'grammar_check') {
    const errors = grammarCheck(input);
    if (errors.length === 0) {
      return "✅ No obvious errors found. Suggestions: keep sentences clear, check punctuation, and watch common confusions like its/it's.";
    }

    let out = "🔎 Grammar Check Results:\n\n";
    for (const e of errors) {
      out += `• Found: "${e.wrong}" → Suggest: "${e.correct}"\n`;
    }
    out += "\n✍️ Suggestions: Apply the suggested corrections and re-run the check. For more help, ask 'Explain corrections'.";
    return out;
  }

  if (intent === 'rewrite') {
    const text = input.replace(/^(rewrite|paraphrase|rephrase|improve)[:\s]*/i, '').trim();
    if (!text) {
      return "Send the sentence or paragraph you'd like me to rewrite.";
    }
    const improved = rewriteImproved(text);
    return `✏️ Improved version:\n\n${improved}\n\n💡 Tip: If you want a more formal or shorter version, say 'Make it formal' or 'Shorten it'.`;
  }

  if (intent === 'essay') {
    return generateEssay(input);
  }

  const conversationIntent = detectConversationIntent(input);
  if (conversationIntent) {
    return respondToConversation(conversationIntent, input, context);
  }

  if (/\b(quiz|test me|practice question|exercise)\b/i.test(input)) {
    const topicKey = detectedTopic || context.topicKey;
    if (topicKey) return startGrammarQuiz(topicKey);
    pendingQuiz = true;
    return "Sure. Which grammar topic would you like a quick practice question about?";
  }

  if (/\b(examples?|give me examples|show me examples)\b/i.test(input)) {
    const topicKey = detectedTopic || context.topicKey;
    if (topicKey) {
      const topic = grammarDB[topicKey];
      return `Examples of ${getTopicTitle(topic)}:\n${topic.examples.slice(0, 4).map(example => `• ${example}`).join("\n")}\n\nWould you like to try a practice question?`;
    }
    return "Sure. Which grammar topic would you like examples for?";
  }

  if (/\b(explain|describe|what does that mean|what is that)\b/i.test(input) && !detectedTopic && context.topicKey) {
    const topic = grammarDB[context.topicKey];
    const rule = Array.isArray(topic.rules) ? topic.rules[0] : topic.rules;
    return `${getTopicTitle(topic)}: ${topic.definition} ${rule} For example: ${topic.examples[0]}`;
  }

  if (intent === 'conversation' || intent === 'coach') {
    return "Sure — let's practice. What's your goal today? (e.g., improve grammar, practice speaking, write an essay)";
  }

  // Default: topic explanation
  const topicKey = detectedTopic;
  if (!topicKey) {
    return "I'm not quite sure what you mean. Are you looking for a grammar explanation, examples, a correction, or something else?";
  }

  const topic = grammarDB[topicKey];
  const examples = topic.examples.map(example => `• ${example}`).join("\n");
  const mistakes = topic.commonMistakes ? topic.commonMistakes.map(m => `  ${m}`).join("\n") : "";

  let response = `${topic.emoji} ${topic.name.toUpperCase()} [${topic.level}]\n`;
  response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  response += `📚 Definition:\n${topic.definition}\n\n`;
  response += `📋 Rules:\n${topic.rules}\n\n`;
  response += `💡 Examples:\n${examples}\n\n`;
  
  if (mistakes) {
    response += `⚠️ Common Mistakes:\n${mistakes}\n\n`;
  }
  
  response += `🎯 Tip:\n${topic.tip}`;

  return response;
}

function showLoading(isLoading) {
  sendButton.disabled = isLoading;
  if (isLoading) {
    sendButton.textContent = "Sending…";
  } else {
    sendButton.textContent = "Send";
  }
}

function toggleRecording() {
  if (recorder) {
    recorder.stop();
    micButton.textContent = "🎤";
    return;
  }

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(stream => {
      recorder = new MediaRecorder(stream);
      recordedChunks = [];

      recorder.addEventListener("dataavailable", event => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      });

      recorder.addEventListener("stop", () => {
        const blob = new Blob(recordedChunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        addMessage("user", "Voice recording attached.", {
          attachmentType: "audio",
          attachmentURL: url,
          attachmentName: "voice-recording.webm"
        });
        stream.getTracks().forEach(track => track.stop());
        recorder = null;
      });

      recorder.start();
      micButton.textContent = "⏹️";
    })
    .catch(() => {
      addMessage("ai", "Microphone access was denied or is unavailable.");
    });
}

function handleAttachment(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  let type = "file";

  if (file.type.startsWith("image/")) type = "image";
  if (file.type.startsWith("video/")) type = "video";
  if (file.type.startsWith("audio/")) type = "audio";

  addMessage("user", `Uploaded ${file.name}`, {
    attachmentType: type,
    attachmentURL: url,
    attachmentName: file.name
  });
  attachInput.value = "";
}

async function openCamera() {
  cameraPanel.classList.add("open");

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraVideo.srcObject = cameraStream;
  } catch (error) {
    addMessage("ai", "Camera access was denied or is unavailable.");
    closeCamera();
  }
}

function takePhoto() {
  if (!cameraVideo.videoWidth) return;

  const canvas = document.createElement("canvas");
  canvas.width = cameraVideo.videoWidth;
  canvas.height = cameraVideo.videoHeight;
  const context = canvas.getContext("2d");
  context.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/png");

  addMessage("user", "Captured photo.", {
    attachmentType: "image",
    attachmentURL: dataUrl,
    attachmentName: "camera-photo.png"
  });

  closeCamera();
}

function closeCamera() {
  cameraPanel.classList.remove("open");
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
}

function handleScroll() {
  const shouldShow = chatWindow.scrollTop + chatWindow.clientHeight < chatWindow.scrollHeight - 20;
  scrollButton.classList.toggle("visible", shouldShow);
}

function handleRateUsStar(event) {
  const star = event.target.closest(".rate-star");
  if (!star) return;

  const rating = Number(star.dataset.rating);
  
  // Update all stars up to the clicked one
  rateUsStars.querySelectorAll(".rate-star").forEach(s => {
    s.classList.toggle("active", Number(s.dataset.rating) <= rating);
  });

  // Reset after a brief delay for visual feedback
  setTimeout(() => {
    rateUsStars.querySelectorAll(".rate-star").forEach(s => s.classList.remove("active"));
  }, 300);
}

renderChat();
