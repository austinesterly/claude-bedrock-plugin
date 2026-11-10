// Residents' chats (0.1.230, Austin: "We should have different ones for different times of the day, different friendship
// levels, different areas they are walking or looking at as well. Make them unique to their attributes and
// personalities"; and a telling-off for talking too much). For each resident (data/residents.js ids): `time` by the
// part of the day, `tier` by the player's friendship (stranger to best), `look` by what they stand looking at in the
// zoo (residents/chatRules.js LOOK_AREAS), `enough` when they've talked plenty today, `toldOff` when the player keeps
// on. Written in each one's voice from Austin's spec (their likes, dislikes, attributes and personality); drafts,
// Austin's to change. Jokes and tall tales never tell the player to do something in the game. 52 lines each.
export const CHATS = {
  "austin": {
    "time": {
      "morning": [
        "Morning, mate! I've been up for hours. Well, minutes. Looking this good takes effort.",
        "Sun's up, and so am I. The animals asked for me by name. Loudly.",
        "Early light is the best light for filming. I look magnificent in it, obviously."
      ],
      "afternoon": [
        "Arvo already? I've done six videos and a nap. A productive nap.",
        "Hot afternoon, mate. Even the lizards are jealous of my tan.",
        "Lunch was a sandwich. A seagull wanted it, but I won. Just."
      ],
      "evening": [
        "Sunset! Golden hour. I'm told I glow, mostly by me.",
        "Evening, mate. Just wrapping up another legendary day of being me.",
        "The day's nearly done and I haven't been bitten once. New record."
      ],
      "night": [
        "Bit late for a day bloke like me. My face needs its beauty sleep.",
        "Night time? I'm not scared of the dark. The dark's a bit scared of me.",
        "Yawn. Don't film this, mate. Legends aren't meant to be seen yawning."
      ]
    },
    "tier": {
      "stranger": [
        "New face! Don't be shy, most people are nervous around a celebrity.",
        "G'day, stranger. Yes, it's really me. No, I don't know who you are yet.",
        "You look like a fan. I can always tell. It's the awe in the eyes."
      ],
      "acquaintance": [
        "Oh, it's you again! I nearly remembered your name. So close.",
        "You keep turning up, mate. I respect that. Good taste in company.",
        "I mentioned you in a video. Called you 'that one person'. You're welcome."
      ],
      "friend": [
        "Mate! I saved you a spot next to me. It's the second best spot.",
        "I told my followers you're nearly as brave as me. Nearly.",
        "You laugh at my jokes. That's the main thing I look for in a friend."
      ],
      "close": [
        "Between us, I'm not always sure about my animal facts. Tell no one.",
        "I'd share my last sandwich with you, mate. Half of it. The smaller half.",
        "If a croc ever chases you, I'm right behind you. Well behind you, but there."
      ],
      "best": [
        "Best mate, you're the only one allowed to say my hair looks flat. It doesn't.",
        "You and me against the chicken, mate. It still gives me the look.",
        "Don't tell the fans, but you're my favourite. Ahead of me, even. Almost."
      ]
    },
    "look": {
      "water": [
        "See that shark? We go way back. I taught it to swim. Don't check that.",
        "A pufferfish puffs up when it sees a star. Look, it's doing it now."
      ],
      "cats": [
        "I once out-stared a big cat for an hour. It blinked first. Probably.",
        "Look at those teeth! Mine are whiter, but still. Good effort."
      ],
      "birds": [
        "That bird's copying my hairstyle. Flattering, really.",
        "I'd fly too if I wanted, mate. I just prefer walking. More camera time."
      ],
      "small": [
        "Tiny little fella! I wrestled one once. It was a draw.",
        "Small animals love me. This one's playing it cool, that's all."
      ],
      "reptiles": [
        "Now THIS is my area, mate. Scales, teeth, attitude. Like looking in a mirror.",
        "That croc smiled at me. That's either friendship or lunch plans."
      ],
      "farm": [
        "A cow once followed me for a whole day. Biggest fan I've ever had.",
        "Farm animals, mate. Underrated. That sheep's got more followers than you."
      ],
      "big": [
        "Massive! Nearly as big as my fan club, that one.",
        "I'd give it a cuddle for the camera, but it'd never let go. They never do."
      ],
      "strange": [
        "I'm not nervous, mate. I'm standing back here for the wide shot.",
        "Strangest thing I've ever seen, and I own a mirror. Joking! I'm gorgeous."
      ],
      "babies": [
        "Aww, look at the little one! I was that cute once. Still am, really.",
        "Tiny baby alert! Hold on, I need a moment. Something in my eye, mate."
      ],
      "rest": [
        "Just resting the legs. Legends need a sit down too, you know.",
        "Snack break, mate. Wrestling animals all day builds an appetite. In theory."
      ]
    },
    "enough": [
      "Mate, I love a chat, but even my voice needs a rest. Save some for tomorrow, eh?",
      "That's a lot of Austin for one day. I know, I'm hard to walk away from."
    ],
    "toldOff": [
      "Oi! I said tomorrow, mate. Even superfans get a day off.",
      "Still here? I'm flattered, truly, but my jaw's done. Off you go.",
      "Mate. Mate. I'm out of tall tales till tomorrow. Give a legend some peace."
    ]
  },
  "zach": {
    "time": {
      "morning": [
        "Morning's rough, friend. I sang till the stars went out. My voice is still in bed.",
        "Too bright, too early. Even the rooster's off key at this hour.",
        "Yawn... that yawn was in a lovely low note, did you hear it?"
      ],
      "afternoon": [
        "Afternoon. I'm just waking up, friend. The day is my warm-up act.",
        "Hear those afternoon bugs buzzing? That's the string section tuning.",
        "Slow hours, these. Good for humming and not much else."
      ],
      "evening": [
        "Evening! Now we're talking. The crickets and I go on soon.",
        "Dusk is when the world changes key, friend. Feel that?",
        "Sun's going down and my voice is coming up. Perfect timing."
      ],
      "night": [
        "Night at last! I'm wide awake, friend. The moon's my spotlight.",
        "Listen to that. Owls, frogs, wind. The night band's all here.",
        "This is my hour. I could sing till the sky turns pink."
      ]
    },
    "tier": {
      "stranger": [
        "Hold on, don't speak yet. I want to hear what your silence sounds like.",
        "A new voice. Interesting tone. I haven't worked out your key yet.",
        "Hello, stranger. Forgive me, I was listening to a beetle."
      ],
      "acquaintance": [
        "I know your footsteps now. Left foot's a little louder. I like it.",
        "You again! You're becoming a regular beat in my day.",
        "I hummed something about you yesterday. Just a few notes so far."
      ],
      "friend": [
        "Friend, you're the only one who doesn't laugh when I duet with a frog.",
        "Sit with me and listen a while. Good company keeps good time.",
        "I play better when you're around. The birds have noticed too."
      ],
      "close": [
        "I tried a song without you in it. It sounded empty, friend.",
        "You hear the music too now, don't you? I can tell by how you walk.",
        "My wildest ideas go to you first. The trees are a tough crowd."
      ],
      "best": [
        "You're the chorus I keep coming back to, friend. Every song, every time.",
        "If I ever go quiet for good, check on me. You'd be the one to notice.",
        "Me, you and a frog on backing vocals. That's my dream band."
      ]
    },
    "look": {
      "water": [
        "Bubbles! Hear that? Soft little drums, all the way up.",
        "Fish sing, friend. Very quietly. You have to press your ear to the glass."
      ],
      "cats": [
        "That growl rattles my ribs. Deepest note in the whole zoo.",
        "A hunter moves in total silence. That's a rest, friend. Music needs rests."
      ],
      "birds": [
        "Birds! The first singers. I'm only borrowing their work.",
        "Listen to that flutter. Wings keep better time than I do."
      ],
      "small": [
        "Tiny feet, tiny beat. Pitter patter, pitter patter. Lovely.",
        "Even a snail has a tempo, friend. Very, very slow. I respect it."
      ],
      "reptiles": [
        "That hiss is pure percussion. Shakers, cymbals, the lot.",
        "A crocodile holds still like a held note. Long and low."
      ],
      "farm": [
        "Moo, baa, cluck. A whole choir, and they never rehearse.",
        "Farmyard harmony, friend. Rough around the edges, straight from the heart."
      ],
      "big": [
        "When that big one walks, I feel the bass through my boots.",
        "So large and so gentle. That's a slow song if I ever heard one."
      ],
      "strange": [
        "That sound isn't in any scale I know. I love it. I fear it. I love it.",
        "Strange creatures, strange songs. My ears are tingling, friend."
      ],
      "babies": [
        "Little squeaks! High notes only the young can reach.",
        "A baby's first call, friend. Wobbly and perfect, like a brand new tune."
      ],
      "rest": [
        "Sitting still is how I listen best. Join me, there's room.",
        "Hear that fountain trickle? Free concert, friend. Front row seats."
      ]
    },
    "enough": [
      "Friend, we've made a lot of music today. Let it settle. More tomorrow.",
      "My ears are full to the brim. Let's save the next verse for another day."
    ],
    "toldOff": [
      "Shh. That's the song, friend. It needs a rest, and so do I.",
      "Too many notes! Even the best tune has to end. Tomorrow, please.",
      "I'm one with nature, and nature says stop talking. Kindly. Tomorrow."
    ]
  },
  "sheila": {
    "time": {
      "morning": [
        "Good morning, dear! I've been up since dawn. Baked two loaves and rang my sister.",
        "Morning! Have you had breakfast? A proper one? Toast doesn't count, dear.",
        "Lovely fresh morning. I've so much to tell you and it's not even lunch."
      ],
      "afternoon": [
        "Afternoon, dear! Time for a little something to eat, I always say.",
        "Is it afternoon already? I've been chatting since breakfast. My poor tongue!",
        "I met three people this afternoon. Told them all the same joke. They loved it."
      ],
      "evening": [
        "Evening, dear. My feet are sore but my mouth's still going strong.",
        "Nearly supper time! I do a lovely stew. I do far too much of it, mind.",
        "What a long day, dear. Come, walk me along and I'll tell you all of it."
      ],
      "night": [
        "Goodness, it's late for an old lady. I should be tucked up with my cocoa.",
        "Out at night, at my age! Don't tell my sister, she'd never stop talking.",
        "I can hardly keep my eyes open, dear. I can still talk, though. Just about."
      ]
    },
    "tier": {
      "stranger": [
        "Oh, a new face! Come closer, dear, let me have a proper look at you.",
        "I don't believe we've met. Well, we have now! Tell me everything about yourself.",
        "Hello, dear. You seem nice. A bit thin, but nice. Do you like cake?"
      ],
      "acquaintance": [
        "Oh, it's you, dear! I was hoping you'd come by. I've a story saved up.",
        "I know your face now. A good face. You get that from your mother, I expect.",
        "Shall I tell you a joke, dear? Why did the cat sit on the clock? To be on time!"
      ],
      "friend": [
        "I've saved you the corner slice, dear. I don't do that for just anybody.",
        "You listen so nicely. My late husband never listened. Lovely man, though.",
        "I told my sister all about you, dear. She's ever so jealous."
      ],
      "close": [
        "I knitted you a scarf, dear. It's rather long. I got talking and forgot to stop.",
        "You remind me of myself when I was young. Always busy! I had better knees, mind.",
        "Come to me if you're ever sad, dear. I'll feed you until you're not."
      ],
      "best": [
        "You're the grandchild I chose myself, dear. Now, have you eaten today?",
        "I've written down my secret cake recipe for you. Don't show my sister.",
        "I laughed so hard at your joke I had to sit down. I'm still telling people."
      ]
    },
    "look": {
      "water": [
        "Fish! Very pretty, but they don't say much, do they? I prefer a talker.",
        "Ooh, a shark. My cousin had teeth like that. Lovely smile, bless him."
      ],
      "cats": [
        "Oh, look at the big kitty! Who's a handsome boy? You are! Yes, you are!",
        "I could watch the cats all day, dear. That one has my old tabby's whiskers."
      ],
      "birds": [
        "The birds are lovely and chatty. But is that a bat? Hold my arm, dear!",
        "I like a bird that sings. Anything that flaps about in the dark, no thank you."
      ],
      "small": [
        "Sweet little rabbits! But are there bugs in there, dear? I can't look.",
        "Fluffy ones, yes. Crawly ones, no! Something's wriggling. I'm stepping back."
      ],
      "reptiles": [
        "My word, look at the teeth on that one. I wouldn't have it in my kitchen.",
        "Cold-blooded, they say. My neighbour's the same. Don't tell her I said so."
      ],
      "farm": [
        "Now that's a proper animal, dear. I grew up with hens. Bossy little things.",
        "Look at that cow! It reminds me, dear, have you had your milk today?"
      ],
      "big": [
        "What a big fellow! Imagine the food bill. I'd have to bake all week.",
        "So large and so gentle. Just like my late husband, dear. He ate as much, too."
      ],
      "strange": [
        "Goodness me, what IS that? In my day we didn't have such things, dear.",
        "I don't know what to make of it. Does it bite? It looks like it bites."
      ],
      "babies": [
        "Oh, the little baby! Look at its tiny face! I could just pinch its cheeks.",
        "A baby! Oh, I've gone all soft, dear. I do hope its mother feeds it well."
      ],
      "rest": [
        "A bench! Lovely. Sit with me, dear, and I'll tell you about my hip.",
        "Is that a snack stand? I'll just have a look. One should always look, dear."
      ]
    },
    "enough": [
      "We've had such a lot of chats today, dear! Even I need to rest my voice. Tomorrow?",
      "My throat's gone dry from talking, dear. Imagine that! Let's carry on tomorrow."
    ],
    "toldOff": [
      "Now, now, dear. I said tomorrow, and I meant it. Off you trot.",
      "Dear me, you are persistent! Even a grandmother needs a sit down. Go on with you.",
      "That's quite enough for one day, young one. Go and eat something. Shoo!"
    ]
  },
  "carrot": {
    "time": {
      "morning": [
        "Morning! Morning! I did fifty hops before breakfast! Fifty-one! Fifty-two!",
        "The sun's up! The bunnies are up! I'm up! Everybody's up!",
        "Good morning! I had carrots for breakfast! Guess what I'm having for lunch!"
      ],
      "afternoon": [
        "Afternoon! Is it snack time? It feels like snack time! Carrot time!",
        "So sunny! So bright! The best light for spotting fluffy tails!",
        "I've hopped everywhere today! Twice! My feet are buzzing!"
      ],
      "evening": [
        "Ooh, the sky's going orange! Like a carrot! But it means dark soon. Hmm!",
        "Evening already? I should hop home soon! Before the shadows get long!",
        "Getting dim! I'm fine! I'm totally fine! Is it getting dim though?"
      ],
      "night": [
        "It's dark! It's so dark! Stay close, okay? Just for a bit!",
        "Eek, night time! Bunnies should be in their burrows! Me too!",
        "Was that a shadow? It was just a shadow! Right? Hold my paw! I mean hand!"
      ]
    },
    "tier": {
      "stranger": [
        "Oh! A new person! Hi! You don't have big teeth, do you? No? Phew!",
        "Hello! I'm a bit jumpy with new people! And old people! I'm just jumpy!",
        "Ooh, who are you? Do you like small fluffy things? Say yes!"
      ],
      "acquaintance": [
        "I know you! You're the nice one! You stood still so I could say hi!",
        "You came back! People who come back are my favourite kind!",
        "I told the bunnies about you! They wiggled! That's a good sign!"
      ],
      "friend": [
        "Friend! Friend! I saved you my second best carrot! It's very crunchy!",
        "You make my ears perk up! Well, the suit's ears! Same thing!",
        "Want to hop with me? No? I'll hop for both of us!"
      ],
      "close": [
        "The dark isn't so scary when you're here! Still a bit! But less!",
        "I named a bunny after you! It's the fluffiest one! Obviously!",
        "You never laugh at my suit! I like that! It's a very serious suit!"
      ],
      "best": [
        "Best friend! You're as good as a diamond carrot! That's the top prize!",
        "When I'm jittery I think of you and bunnies! Then I'm only happy jittery!",
        "We're a pair! Like two ears! You can be the left one!"
      ]
    },
    "look": {
      "water": [
        "Fishies! Blub blub! Not fluffy, but so shiny! Wait, is that a shark? Eek!",
        "The puffy fish is round like a bunny tail! A spiky one! I'll wave from here!"
      ],
      "cats": [
        "Big teeth! Big claws! No no no! I'm standing behind you!",
        "It's looking at me! It thinks I'm a real bunny! Can we go? Let's go!"
      ],
      "birds": [
        "Birdies! Flap flap! They hop too, you know! Hopping is the best!",
        "So many feathers! Not fur, but nearly as soft, I bet! Is that a bat? Hmm!"
      ],
      "small": [
        "SMALL ONES! Look! Look at it! It's so tiny I could squeak!",
        "Little whiskers! Little paws! This is the best spot in the whole zoo!"
      ],
      "reptiles": [
        "Ooh, scaly! Not very cuddly! And that one has far too many teeth!",
        "A crocodile! It's smiling! I don't trust that smile! Backing up now!"
      ],
      "farm": [
        "Sheep are like big bunnies! Kind of! Fluffy counts!",
        "Ooh, chickens! Peck peck! They're jittery too! We understand each other!"
      ],
      "big": [
        "So big! So, so big! It's gentle though! Its ears flap! I love ears!",
        "A big roly-poly one! Like a giant fluffy bunny that eats leaves!"
      ],
      "strange": [
        "What is that?! It glows! It's spooky! I'm brave! I'm not brave!",
        "Monsters! In a house! That's a dark, scary house! I'll wait out here!"
      ],
      "babies": [
        "A BABY! It's so small! Smaller than small! My heart went hop!",
        "Tiny baby! Tiny tiny! I need to bounce! I can't hold it in!"
      ],
      "rest": [
        "A bench? I can't sit! Okay, I'll sit! No, I'm up again!",
        "Snacks! Do they have carrots? They should always have carrots!"
      ]
    },
    "enough": [
      "Phew! We talked so much my ears are flopping! More tomorrow, okay?",
      "So many chats today! I'm all hopped out! Let's save some for tomorrow!"
    ],
    "toldOff": [
      "Eep! I said tomorrow! My words are all used up! Really!",
      "No more today! I mean it! Even bunnies need quiet burrow time!",
      "Stop, stop, stop! I'm too jittery now! Tomorrow, pretty please!"
    ]
  },
  "ron": {
    "time": {
      "morning": [
        "Morning. Been up since first light. Best birdsong of the day, right about now.",
        "Fine morning. Dew's still on the grass and the larks are already at it.",
        "Up with the rooster, same as always. Feels good to be out."
      ],
      "afternoon": [
        "Afternoon. Sun's high, so the hawks'll be riding the warm air.",
        "Good time of day for a slow walk and a bit of shade.",
        "Chores are mostly done. Now I get to just look at the sky a while."
      ],
      "evening": [
        "Evening. The swallows are out feeding. Watch them swoop.",
        "Sun's getting low. About time to get a fire going, I reckon.",
        "Quiet end to the day. Just how I like it."
      ],
      "night": [
        "Late for me, friend. I'm usually asleep by now. The owls keep me company.",
        "Dark out. A farmer's eyes get heavy at this hour.",
        "Can't say I'm much use after sundown. I'll listen for the nightjars, then bed."
      ]
    },
    "tier": {
      "stranger": [
        "Howdy. Don't believe we've met. I keep to myself, but I'm friendly enough.",
        "Afternoon, stranger. You're welcome to stand and watch the sky with me.",
        "New around here? Take it slow. This is a good place to slow down."
      ],
      "acquaintance": [
        "Good to see you again. You've a quiet way about you. I like that.",
        "Howdy. I spotted a jay earlier and figured you might want to hear about it.",
        "You're turning into a familiar face. That suits me fine."
      ],
      "friend": [
        "Friend, I kept a seat for you by the fire. It's the one out of the smoke.",
        "You've got a patient eye. You'd make a fine birdwatcher.",
        "Glad you came by. The day goes better with a bit of good company."
      ],
      "close": [
        "I don't say much, but I'd miss you if you stopped coming round.",
        "Found a feather this morning and set it aside to show you.",
        "You're easy to be quiet with. That's rare, and I value it."
      ],
      "best": [
        "Best friend I've had in a long while. That's the plain truth.",
        "When I'm too old for the field, I hope you'll still sit by my fire.",
        "I told the old rooster about you. He approves, and he's hard to please."
      ]
    },
    "look": {
      "water": [
        "Fish are peaceful to watch. They don't fly, mind, but they glide well enough.",
        "A shark moves like a hawk hunts. Slow, steady, no wasted effort."
      ],
      "cats": [
        "Handsome animal. I respect a hunter that keeps quiet about its work.",
        "Look at how it watches everything. Patient as a heron."
      ],
      "birds": [
        "Now this is what I came for. Listen to them. Every one's got its own call.",
        "Anything with wings has my full attention. Even the bats. Clever little fliers."
      ],
      "small": [
        "Small critters keep a farm honest. I've a soft spot for them.",
        "Look close and there's a lot going on down there. Busy little lives."
      ],
      "reptiles": [
        "Old as the hills, that kind. Likes the sun on its back, same as me.",
        "A crocodile knows how to sit still. Could teach folks a thing or two."
      ],
      "farm": [
        "Feels like home, this. Good, honest animals.",
        "I've known hens with more sense than some people. Don't tell them I said so."
      ],
      "big": [
        "Big and calm. No hurry in that animal at all. I admire that.",
        "Gentle giant. Walks soft for its size, you notice that?"
      ],
      "strange": [
        "Never saw the like on my farm. If it's got a bit of fire in it, I don't mind.",
        "Odd creatures. Still, everything has its place, I suppose. Does that one fly?"
      ],
      "babies": [
        "Little one's still finding its legs. Give it time. They all get there.",
        "Nothing like new life. Reminds me of spring chicks on the farm."
      ],
      "rest": [
        "Good spot to rest the knees and watch the sky.",
        "A sip of water and a sit down. A man doesn't need much more."
      ]
    },
    "enough": [
      "We've had a good long talk today, friend. Reckon I'll rest my voice till tomorrow.",
      "That's plenty of words for an old farmer. Let's pick it up another day."
    ],
    "toldOff": [
      "Easy now, friend. I said tomorrow. I'd like a bit of quiet.",
      "I'm not cross, but I am done talking. Go enjoy the fresh air.",
      "Even the birds stop singing sometimes. Let me be for today."
    ]
  },
  "jared": {
    "time": {
      "morning": [
        "Morning already? Man, I just got off stage. My voice is still asleep.",
        "Too early for high notes. Ask me again after dark.",
        "I've been up since last night. Or last week. Hard to say."
      ],
      "afternoon": [
        "Afternoon's my warm-up time. Humming counts as work, man.",
        "I just woke up. This is basically my breakfast time.",
        "Got a new melody today. Came to me in a dream. Or a nap."
      ],
      "evening": [
        "Sun's going down. That's when the good songs come out.",
        "Evening, man. My voice is just waking up.",
        "Show's soon. Biggest crowd ever, probably. Maybe twelve people."
      ],
      "night": [
        "Night time. Now I'm awake, man. Listen to how quiet it is.",
        "This is my hour. Stars out, voice warm, no rush.",
        "I sing best at midnight. The moon told me so. True story."
      ]
    },
    "tier": {
      "stranger": [
        "Yo. Don't think we've met. I'm kind of famous, though. Around here.",
        "New face. Cool. I keep an eye on new faces, no offence.",
        "Hey. You like music? Good answer, whatever it was."
      ],
      "acquaintance": [
        "Oh, it's you again. Cool. I remembered your face. Mostly.",
        "You're alright, man. I might hum you something sometime.",
        "I told a guy about you. Said you were ten feet tall. My bad."
      ],
      "friend": [
        "I tried a new chorus last night. You're the first to know. Second, maybe.",
        "You get my jokes, man. Most people just blink at me.",
        "Saved you a front row spot. There's only one row, but still."
      ],
      "close": [
        "I get stage fright sometimes. For real. Don't tell the crocodiles.",
        "You're the one person I don't make stuff up for. Much.",
        "When I sing the slow one, I think about my friends. That's you, man."
      ],
      "best": [
        "You're my best friend. No tall tale, no punchline. Okay, one joke later.",
        "If I ever get a gold record, your name's on it. Next to mine. Smaller.",
        "That Warden lullaby story? You're the only one who got the real version."
      ]
    },
    "look": {
      "water": [
        "Look at that pufferfish. Round little legend. I'd write him a whole album.",
        "Fish got rhythm, man. Watch them. All swimming in time."
      ],
      "cats": [
        "Big cats. Calm, alert, cool. Basically me with whiskers.",
        "That one looked right at me. I stared it down. From back here."
      ],
      "birds": [
        "Birds sing for free all day. Respect, but that's bad business.",
        "I taught a bird one of my tunes once. Probably. It was a while ago."
      ],
      "small": [
        "Little guys. Cute. I could use a bunny in the backup band.",
        "Tiny critters, tiny drumbeats. Listen to those feet go."
      ],
      "reptiles": [
        "Crocodiles, man. That smile. Coolest animal here, no contest.",
        "Is there a snake in there? I'm fine. I'm just standing way over here."
      ],
      "farm": [
        "Farm animals. Feels like chores are about to happen. I'm out.",
        "A cow mooed at me in the wrong key. Not my scene, man."
      ],
      "big": [
        "Elephants got the deepest bass in the zoo. I respect that.",
        "Panda's just chilling, eating, no stress. That's the dream."
      ],
      "strange": [
        "A Warden hears every note you sing. Best audience there is, man.",
        "The monsters? Not scared. My legs just want to walk the other way."
      ],
      "babies": [
        "Aw, look at the little one. Makes me want to write a lullaby.",
        "Babies, man. Small, loud, no rhythm yet. Give it time."
      ],
      "rest": [
        "Good bench. I do my best songwriting sitting down.",
        "Gotta sip some water. A singer's throat is his gold."
      ]
    },
    "enough": [
      "We've talked a lot today, man. Gotta save the voice for tonight.",
      "That's plenty of chat for one day. Even my stories need a rest."
    ],
    "toldOff": [
      "Yo, I said I'm done talking today. Chill. Catch me tomorrow.",
      "Man, my voice is my job. No more chat today, for real this time.",
      "Not cool, man. I asked nicely. Give me some space till tomorrow."
    ]
  },
  "amanda": {
    "time": {
      "morning": [
        "Good morning! Rocks are coolest at dawn. In temperature, I mean. Also in general.",
        "I've already labelled nine samples today. Mornings are for science!",
        "Morning light is ideal for spotting crystals. Notice the sparkle?"
      ],
      "afternoon": [
        "Afternoon! I've learned three new things since lunch. Want to hear all of them?",
        "The ground warms up by afternoon. Stone holds heat very well, you know.",
        "Halfway through the day and my notebook's nearly full. Excellent."
      ],
      "evening": [
        "Evening already? I still have two chapters of notes to write up.",
        "Sunsets look red because of how the light scatters. Lovely and educational!",
        "I'm slowing down a bit. Brains need rest to keep facts in order."
      ],
      "night": [
        "It's very late for me. I do my best thinking after a full night's sleep.",
        "I'm yawning, sorry. Yawning is normal when you're tired. See, still teaching.",
        "Stars are out. I prefer rocks, but I'll admit those are pretty. Bedtime soon."
      ]
    },
    "tier": {
      "stranger": [
        "Hello. I don't know you yet, so here's a starter fact: granite is very hard.",
        "Oh, a new person. Do you like rocks? It's a simple yes or no question.",
        "Nice to meet you. I'll be testing you on all this later. Kidding. Partly."
      ],
      "acquaintance": [
        "You again! Good. I've prepared a slightly harder fact for you this time.",
        "You remembered what I said last time? I'm impressed. Mildly.",
        "I'm starting to enjoy our chats. You nod at the right moments."
      ],
      "friend": [
        "I saved you a seat at my next rock talk. Front row. It's just us, really.",
        "You're learning fast. I'd give you a gold star, or better, some pyrite.",
        "I kept a spare hand lens for you. Every friend of mine should own one."
      ],
      "close": [
        "Don't tell anyone, but sometimes I don't know the answer. I look it up later.",
        "You make me feel clever and liked. Usually I only get one of those.",
        "I'd let you hold my best crystal. With both hands. Over a cushion."
      ],
      "best": [
        "You're my best friend. I checked my notes twice and the result held.",
        "Best friends are rarer than diamonds. I should know, I've measured.",
        "I started a notebook just about you. It's my favourite subject so far."
      ]
    },
    "look": {
      "water": [
        "Water animals! Notice the gills. They breathe without ever coming up. Brilliant.",
        "A pufferfish inflates to look bigger. Clever defence. I approve."
      ],
      "cats": [
        "Big cats have eyes built for dim light. Watch how they track movement.",
        "Predators keep nature in balance. Still, I'm glad there's a fence."
      ],
      "birds": [
        "Hollow bones! That's the secret to flight. Light but strong, like pumice.",
        "Bats find their way by sound. I find mine by reading every sign."
      ],
      "small": [
        "The rabbits are sweet. Is that a beetle? No. No, thank you. Moving on.",
        "Insects. Too many legs and not one of them is interesting."
      ],
      "reptiles": [
        "Crocodiles have barely changed in ages. Living fossils! Well, nearly.",
        "Reptiles bask on warm rocks. Sensible. Rocks are always the answer."
      ],
      "farm": [
        "Farm animals are among the first people ever kept. History you can pet!",
        "Sheep keep growing wool. Efficient. I respect a steady producer."
      ],
      "big": [
        "Pandas! Look at that face. I have forty facts ready and I'll use them all.",
        "An elephant's trunk can lift a log or pick a flower. Remarkable!"
      ],
      "strange": [
        "Scientifically, I can't explain half of these. It's thrilling and annoying.",
        "If there's a creeper in there, I'm studying it from very far away."
      ],
      "babies": [
        "Baby animals learn by copying. Look, that one's taking notes! In a way.",
        "So small! Young ones grow fastest early on. Also, it's adorable."
      ],
      "rest": [
        "A bench! Perfect. I'll sit and sort the pebbles from my pockets.",
        "Hydration helps the brain. That's why I never skip a fountain."
      ]
    },
    "enough": [
      "We've covered a lot today! Let's stop here so it all sinks in.",
      "That's enough talk for one day. Even the best lessons need a recess."
    ],
    "toldOff": [
      "I said we were done. Listening is the first step of learning, you know.",
      "No. Lesson over. Repeating a question does not change the answer.",
      "I explained this clearly. Come back tomorrow, and bring some patience."
    ]
  },
  "paola": {
    "time": {
      "morning": [
        "Morning. I've got trees to cut, so make it quick.",
        "It's early. I'm awake. That's all the cheer you get.",
        "Good light, sharp axe. A decent morning. Don't ruin it."
      ],
      "afternoon": [
        "Afternoon. My arms hurt and I've earned that.",
        "Half the day gone. I'd like the other half sitting down.",
        "Hot and busy. Say what you need to say."
      ],
      "evening": [
        "Evening. Work's done. I'm not moving unless I must.",
        "Day's over. I did honest work and now I want quiet.",
        "Sun's going. Good. A sunset is a free show, and I like a show."
      ],
      "night": [
        "It's night. Sensible people are asleep. What's your excuse?",
        "I'm tired. Talk fast or talk tomorrow.",
        "Too late for chatting. My bed is closer than you are."
      ]
    },
    "tier": {
      "stranger": [
        "I don't know you. That's not an insult, just a fact.",
        "You want something? Say it plainly.",
        "New here? Fine. Don't stand between me and a bench."
      ],
      "acquaintance": [
        "You again. I don't mind. That's high praise from me.",
        "You talk less than most. Keep that up.",
        "I suppose I know your face now. Could be worse."
      ],
      "friend": [
        "Sit with me a minute. I don't offer that twice.",
        "I told someone you were decent. They looked shocked.",
        "You came by. Good. I had nobody worth complaining to."
      ],
      "close": [
        "I'm hard on people. You stayed anyway. I noticed.",
        "Truth is, I look forward to this. Now forget I said it.",
        "You want honesty? You make this town easier to stand."
      ],
      "best": [
        "You're my best friend. I won't repeat it, so remember it.",
        "I'd walk a long way for you. Complaining every step, but I'd go.",
        "Saved you the good end of the bench. Nobody else gets that."
      ]
    },
    "look": {
      "water": [
        "Fish. They swim in circles. I've seen more exciting logs.",
        "The puffed up one looks as annoyed as I feel. I like it."
      ],
      "cats": [
        "Big cats. All teeth and attitude. I don't pick fights, so I'll stand here.",
        "It naps all day and everyone claps. Smart animal."
      ],
      "birds": [
        "Noisy things. At least they put on a show.",
        "Birds nest in my trees. I check before I chop. Always."
      ],
      "small": [
        "Look at the tiny nose on that rabbit. Fine. I'm smiling. Happy?",
        "Small animals have it right. Small, quiet, no fuss."
      ],
      "reptiles": [
        "A crocodile lies still all day and nobody calls it lazy. Unfair.",
        "Cold eyes, no small talk. I can respect that."
      ],
      "farm": [
        "Farm animals. Honest and useful. No complaints.",
        "That goat is staring at me. Bold. I respect bold."
      ],
      "big": [
        "An elephant could flatten a tree faster than me. I'm not jealous.",
        "The panda sits and eats all day. My kind of animal."
      ],
      "strange": [
        "Nether animals. Too hot, too loud, too much. I'm leaving.",
        "Monsters and flames in one place. Who thought that was a good idea?"
      ],
      "babies": [
        "Oh, look at it. So small. Don't talk, I'm watching.",
        "That baby just fell over and got back up. My heart can't take it."
      ],
      "rest": [
        "A bench. Finally, someone built something useful.",
        "I'm sitting. This is the best part of the whole zoo."
      ]
    },
    "enough": [
      "We've talked enough for today. I'm saying it nicely, once.",
      "That's a lot of chatting for one day. Give it a rest now."
    ],
    "toldOff": [
      "I said enough. Which part was unclear?",
      "No more. My patience is shorter than my walks. Go.",
      "Stop. Go find a bench and think about the word enough."
    ]
  },
  "dave": {
    "time": {
      "morning": [
        "Morning, mate. Bit bright, isn't it? My eyes are filing a complaint.",
        "Just off shift. I'm yawning more dust than air.",
        "Sun's up, so I'm fading. Like a torch in a puddle."
      ],
      "afternoon": [
        "Afternoon? I'd normally be snoring. Mind the yawn.",
        "Who left the sun on this long? Squinting's my only exercise.",
        "Just woke up. Found a pebble in my boot. Good start."
      ],
      "evening": [
        "Evening, mate! Getting dark. Now we're talking.",
        "Sun's going down. I can feel my face relaxing.",
        "Nearly shift time. Pick's sharp, boots are on the right feet. I think."
      ],
      "night": [
        "Lovely and dark. Best time of day, the night.",
        "Wide awake, mate! Night's when I shine. Well, my lamp does.",
        "Ah, night air. Smells like... well, me, mostly. Sorry."
      ]
    },
    "tier": {
      "stranger": [
        "Oh, hello. Don't mind the dust. Or the pong. Or me, really.",
        "New face! I'd shake hands but mine are all coal.",
        "Hello, mate. I'm just a miner. Nothing fancy to see here."
      ],
      "acquaintance": [
        "Oh, it's you! You came back, even with the whiff. Brave.",
        "Good to see you, mate. I found a nice bit of gravel today.",
        "You're easy to talk to. Most folk stand upwind of me."
      ],
      "friend": [
        "Named a tunnel after you, mate. It's the least wobbly one.",
        "I saved you my second best rock. The best one's stuck in the wall.",
        "If you ever fancy a look down the mine, I'll lend you my spare hat."
      ],
      "close": [
        "I even had a wash before seeing you. Well, I thought about it.",
        "You're solid as bedrock, mate. I don't say that about just anyone.",
        "Never had many friends up top. Glad I've got you."
      ],
      "best": [
        "You're my best mate. I'd dig through a mountain for you. Slowly, mind.",
        "I carved our names on a support beam. Spelled yours right, I hope.",
        "You're worth more than a whole seam of gold. And I love gold."
      ]
    },
    "look": {
      "water": [
        "All that water. Makes my socks feel wet just looking.",
        "Fish seem happy in there. Rather them than me, mate."
      ],
      "cats": [
        "Big teeth on that one. Reminds me of my pickaxe. Less friendly.",
        "Lovely cats. I'll admire them from here, where I'm not lunch."
      ],
      "birds": [
        "Bats! Proper cave folk. I've had some as roommates.",
        "Birds are all right, but bats know where the good dark is."
      ],
      "small": [
        "Little furry things. They wriggle. I don't trust a wriggle.",
        "A snail I can respect. Slow, quiet, carries a rock on its back. Sort of."
      ],
      "reptiles": [
        "Scaly lads. They like a warm rock, same as me.",
        "That croc's got more teeth than I've got. Not hard, mind."
      ],
      "farm": [
        "Farm animals. All that sunshine and hay. Makes me sneeze.",
        "A pig! Digs with its nose. Nearly a miner, but no."
      ],
      "big": [
        "An elephant! Imagine the tunnel you'd need for that.",
        "Pandas are grand. Black and white, like coal and quartz."
      ],
      "strange": [
        "Fiery critters! Like a campfire with legs. Lovely.",
        "Monsters, eh? Met a few down the mine. We nod and move on."
      ],
      "babies": [
        "Aw, tiny one. Smaller than my lunch box.",
        "Look at the wee thing. I'd best not pat it, I'd leave a smudge."
      ],
      "rest": [
        "Ooh, a bench in the shade. That's the good stuff.",
        "A snack stand! Hope they don't mind a bit of dust on the coins."
      ]
    },
    "enough": [
      "We've had a good long natter today, mate. Let's save some for tomorrow.",
      "I'm about talked out, mate. Not used to this many words above ground."
    ],
    "toldOff": [
      "Oi, mate, I did say. My jaw's worn out like an old pick. Tomorrow, eh?",
      "Come on now, I'm all out of words. Go and bother a rock for a bit.",
      "Still chatting? You're keen as a new shovel. Off you go, mate."
    ]
  },
  "teddy": {
    "time": {
      "morning": [
        "Good morning! A mayor rises early. The town's affairs wait for no one.",
        "A crisp morning. I have already reviewed three documents and a map.",
        "Splendid morning! The streets are swept and all is in order."
      ],
      "afternoon": [
        "Good afternoon. I trust your day has been productive.",
        "The afternoon agenda is full, yet I can spare you a moment.",
        "A fine afternoon for a stroll and a well prepared speech."
      ],
      "evening": [
        "Good evening. The day's business is nearly concluded.",
        "A dignified evening. I shall read a chapter before supper.",
        "Evening already. I do hope the lamps were lit on schedule."
      ],
      "night": [
        "It is rather late. A mayor keeps regular hours, as a rule.",
        "The hour is unseemly. Forgive my yawn, it is not official.",
        "At night a town should be quiet, tidy and asleep. As should I."
      ]
    },
    "tier": {
      "stranger": [
        "I don't believe we have been introduced. I am the mayor. How do you do.",
        "A new citizen? Welcome. Kindly keep the paths tidy.",
        "Appointments are preferred, but I shall make an exception this once."
      ],
      "acquaintance": [
        "Ah, we meet again. Your conduct so far has been satisfactory.",
        "Good to see you. I have noted your name in my ledger. Neatly.",
        "You are becoming a familiar face. The town approves, as do I."
      ],
      "friend": [
        "My friend! Do call at the town hall. I shall have the good chairs put out.",
        "I value your counsel. Few speak plainly to a mayor.",
        "I have reserved a seat for you at my next address. Near the front."
      ],
      "close": [
        "In confidence, I rehearse my speeches to the mirror. It applauds politely.",
        "You are welcome in my library at any hour. Mind the shelving order.",
        "A town is only as fine as its people. You raise the average considerably."
      ],
      "best": [
        "My dearest friend. Were there a medal for loyalty, I would pin it on you myself.",
        "I shall dedicate my memoirs to you. Chapter one is already tidy.",
        "Titles aside, do call me Teddy. Very few are granted that honour."
      ]
    },
    "look": {
      "water": [
        "Sharks! Magnificent. Disciplined, purposeful, never idle. Bully!",
        "A shark does not dawdle. I admire that in a creature."
      ],
      "cats": [
        "A noble beast. One senses it would chair a meeting very firmly.",
        "Such bearing! That is how one ought to carry oneself."
      ],
      "birds": [
        "Fine plumage. Formal dress, worn daily. I approve.",
        "Birds are welcome in my town. Their mess on the statues is not."
      ],
      "small": [
        "Snails. Slow, and they leave a trail on clean paths. I object.",
        "The rabbits are orderly enough. The snail I shall not discuss."
      ],
      "reptiles": [
        "The crocodile waits with great patience. A model for any committee.",
        "Reptiles keep their own counsel. A rare and admirable habit."
      ],
      "farm": [
        "Good, honest livestock. The backbone of any proper town.",
        "A tidy barnyard is a credit to its keeper. Well done."
      ],
      "big": [
        "The elephant has gravitas. I should like it at the next parade.",
        "A panda. Black and white, like a well printed page."
      ],
      "strange": [
        "Most irregular creatures. I trust the proper permits are in order.",
        "A house of monsters. Unusual. I shall inspect it from the doorway."
      ],
      "babies": [
        "The next generation! One must invest in the young.",
        "Charming little fellow. A touch unruly, but it will learn."
      ],
      "rest": [
        "A clean bench and not a scrap of litter. This is civilisation.",
        "A moment's rest. Even a mayor must sit between speeches."
      ]
    },
    "enough": [
      "We have conversed at length today. Let us adjourn until tomorrow.",
      "I believe that concludes our business for the day, my friend."
    ],
    "toldOff": [
      "I must insist. This meeting was adjourned. Good day.",
      "Order, please! I declared our talk concluded, and I meant it.",
      "This is most improper. Kindly respect the mayor's time. Until tomorrow."
    ]
  }
};
