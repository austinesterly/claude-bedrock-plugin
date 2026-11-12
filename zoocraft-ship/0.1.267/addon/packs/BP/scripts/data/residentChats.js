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
  },
  "ailing_bot": {
    "time": {
      "morning": [
        "GOOD MORNING! Sorry. Too loud? I've been up since five baking muffins.",
        "Morning! Fresh bread, fresh chalk, fresh start. I think. Is it a fresh start?",
        "Up early! I ironed my shirt twice. The second time was worse. Still, good morning!"
      ],
      "afternoon": [
        "AFTERNOON! Class went well today. I think. Half of them were awake.",
        "Good afternoon! I explained one thing for an hour. It was a short thing.",
        "Afternoon! My tie has flour on it. I baked at lunch. No regrets. Some regrets."
      ],
      "evening": [
        "Evening! Time for old-school music, turned up. The neighbours love it. I assume.",
        "Good evening! I've got papers to mark and a pie to watch. The pie comes first.",
        "Evening already? I was going to play video games. Just one level. That's what I said."
      ],
      "night": [
        "It's late! I'm whispering. THIS IS ME WHISPERING. Sorry.",
        "Night time. I stayed up beating a hard level. Then it beat me. We're even.",
        "Bedtime for teachers. The cat's already asleep on my lesson notes."
      ]
    },
    "tier": {
      "stranger": [
        "HELLO! I'm Ailing Bot. I teach. Loudly, I'm told. Is this too loud?",
        "A new face! Do you like cats? Good. No wrong answers. Well, one wrong answer.",
        "Hi there! Someone told me you were a famous explorer. Are you? I believed them."
      ],
      "acquaintance": [
        "You again! Great! I remembered your face. Not your name. I'm working on it.",
        "Back already? I was just explaining baseball to a cat. It left partway through.",
        "Oh, good, it's you! You don't talk my ear off. I do that part myself."
      ],
      "friend": [
        "You're a good friend. I baked extra thinking of you. Then I ate it. Sorry.",
        "My cat likes you. That's the highest grade I give out. Higher than mine.",
        "I'd play catch with you any day. I'd drop it. But I'd show up!"
      ],
      "close": [
        "Can I be honest? I worry I'm not a great teacher. Then I bake and feel better.",
        "You never trick me. Everyone else does. I bought a 'magic' bean last week.",
        "I'd stand near a pond for you. Not IN it. Near it. That's a big deal for me."
      ],
      "best": [
        "BEST FRIEND! Sorry. Loud. But I mean it. Top of the class, forever.",
        "You, my cat and a warm oven. That's my whole list of favourite things.",
        "I'm loyal as they come. Once you're my friend, that's it. No take-backs."
      ]
    },
    "look": {
      "water": [
        "THAT is a lot of water. I'm fine. I'm standing back here because I want to.",
        "I love fishing! From a dry dock. With the water staying down where it belongs."
      ],
      "cats": [
        "CATS! Big ones! Look at that! Sorry. Was that too loud? That was too loud.",
        "A cat is the perfect student. Quiet, sharp and never asks about homework."
      ],
      "birds": [
        "Birds are loud. I respect that. I'm loud too. We'd make a terrible choir.",
        "That parrot repeats everything. Best listener in my whole career, honestly."
      ],
      "small": [
        "Small animals! A rabbit told me it was a cat once. I believed it for a week.",
        "Tiny critters, big effort. Hardworking. I'd give every one of them full marks."
      ],
      "reptiles": [
        "A lizard on a dry rock. Smart. Dry is the correct amount of wet.",
        "Is that crocodile smiling at me? I think we're friends. Somebody said he waves."
      ],
      "farm": [
        "Farm animals! Eggs and milk and wheat. That's half a cake standing in a field!",
        "The cow's nice. No barking at all. That's all I ask of an animal, really."
      ],
      "big": [
        "An elephant never forgets. I forget my own chalk. He should be teaching.",
        "Pandas just sit and eat. That was me all weekend. With a tray of muffins."
      ],
      "strange": [
        "Somebody told me that one grants wishes. I wished twice. Still waiting.",
        "I can't explain that creature. I tried. I used a chalkboard. It got worse."
      ],
      "babies": [
        "Babies! Little learners! Look at them figuring out legs. Good effort, all of you.",
        "That baby's napping through everything. Reminds me of my back row. Fondly."
      ],
      "rest": [
        "A bench! Good. Teaching is mostly standing. Nobody tells you that part.",
        "Snacks! I'd take a muffin over a slice of watermelon any day. Any day at all."
      ]
    },
    "enough": [
      "GREAT chat! That's the bell, though. Class dismissed for today, friend.",
      "We've covered plenty today. I went on a bit. I always do. Tomorrow?"
    ],
    "toldOff": [
      "Okay, that's too much talking, and that's coming from ME. Enough for today.",
      "No more! I've got a headache and a pie in the oven. I'm done.",
      "I said class dismissed! Talking on and on drives me up the wall."
    ]
  },
  "terra": {
    "time": {
      "morning": [
        "Good morning! The dew is still on the clover. I counted every drop. Roughly.",
        "The earth smells freshest at dawn. I stood in a flower bed for an hour to be sure.",
        "Morning! I said hello to all the saplings already. They seemed pleased."
      ],
      "afternoon": [
        "Good afternoon! The leaves are drinking up the sun. So am I, in my own way.",
        "I meant to eat lunch, but then I found a very interesting patch of moss.",
        "Afternoon light makes everything greener. Green is the kindest colour, I think."
      ],
      "evening": [
        "The flowers are closing for the night. I like to wish each one sweet dreams.",
        "What a gentle evening. The whole world breathes out at sunset, doesn't it?",
        "I picked up eleven bits of litter today. Twelve would feel tidier. Still looking."
      ],
      "night": [
        "Oh, is it night? I was watching a snail and quite lost track of the sun.",
        "The plants are resting now, and I suppose I should too. Goodnight, little world.",
        "The moon is lovely, but it's past my bedtime. Even compost needs to settle."
      ]
    },
    "tier": {
      "stranger": [
        "Hello! I'm Terra. Oh, you have a kind face. Most living things do, really.",
        "A new friend! Sorry, there's a leaf in my hair. There's always a leaf in my hair.",
        "Hello there. I study how to keep the world clean and green. It's slow, happy work."
      ],
      "acquaintance": [
        "Oh, it's you again! I was just telling a fern about you. It was very attentive.",
        "You came back! People usually wander off when I start talking about soil.",
        "I'm getting to know your footsteps. They're gentle on the grass. I noticed."
      ],
      "friend": [
        "I pressed a four-leaf clover for you. Then I felt sorry for it and apologised.",
        "You listen the way a garden listens. Quietly, and without rushing me.",
        "I named a seedling after you. It's the tallest one. I'm not saying that's linked."
      ],
      "close": [
        "I trust you with my research notes. They're mostly drawings of leaves, honestly.",
        "When I picture a healthy world, you're standing in it. Near a tree, usually.",
        "I worry about every animal everywhere. Somehow it's lighter when you're around."
      ],
      "best": [
        "You're my dearest friend. I'd share my last sunflower seed with you. Gladly.",
        "If friendship were a forest, ours would be very old and full of birdsong.",
        "I told the whole meadow you're my best friend. The bees have surely spread it."
      ]
    },
    "look": {
      "water": [
        "Look how clear the water is! Clean water is the best gift a fish can get.",
        "Sharks have such a bad reputation. I think they're just shy, with big smiles."
      ],
      "cats": [
        "What graceful cats! I do wish they'd consider a salad now and then, though.",
        "Such soft paws for such large animals. They step more lightly than I do."
      ],
      "birds": [
        "Birds plant more trees than anyone, you know. They just never take the credit.",
        "Listen to them sing! I always clap afterwards. It seems only polite."
      ],
      "small": [
        "Tiny creatures do the biggest jobs. Without them the soil would simply give up.",
        "Oh, little ones! I'd like to know every one of their names. I'll ask nicely."
      ],
      "reptiles": [
        "Reptiles love a warm rock. So do I, to be fair. We have a lot in common.",
        "People call them cold-blooded, but I've never met a more patient animal."
      ],
      "farm": [
        "Farm animals! I do admire farmers. They speak to the earth, and it answers.",
        "Hello, cow. You keep all your milk, dear. It's yours. I won't hear otherwise."
      ],
      "big": [
        "A panda eating bamboo. Plants, all day long! That's my kind of dinner guest.",
        "Elephants are gardeners, really. Very large gardeners with wonderful ears."
      ],
      "strange": [
        "I don't know what that creature is, but it deserves a clean home like anyone.",
        "Strange and wonderful! I wonder what it eats. I do hope the answer is leaves."
      ],
      "babies": [
        "Babies! Oh, my heart. A happy baby animal means a happy, healthy home.",
        "So new to the world! I promise we're trying to keep it tidy for you, little one."
      ],
      "rest": [
        "A bench made of wood. Thank you, tree. I always say thank you before I sit.",
        "Snacks are lovely, but I do hope every wrapper finds its way to a bin."
      ]
    },
    "enough": [
      "We've had such a lovely long talk today. Let's let it settle, like good soil.",
      "I'd chatter until sundown, but even gardens need a rest. Tomorrow, my friend?"
    ],
    "toldOff": [
      "Oh, I really did mean it. No more today, please. Even ivy knows when to stop.",
      "I'm so sorry, but my ears are quite full. Please let me be for now.",
      "Please, that's plenty. I'd like to listen to the leaves instead for a while."
    ]
  },
  "jaylen": {
    "time": {
      "morning": [
        "Morning! I've already drawn three hairlines today. All flawless. Obviously.",
        "Up at sunrise, baby. Champions warm up early. My right hand never sleeps in.",
        "Good morning to you, and a great morning to my right hand. It earned it."
      ],
      "afternoon": [
        "Afternoon! Peak hours for greatness. So, every hour, when you're me.",
        "I did fifty jumping jacks at lunch. Nobody asked. I just win like that.",
        "The afternoon sun hits my hairline just right. Crisp. Look at that edge."
      ],
      "evening": [
        "Evening already? I haven't even peaked yet. I've got at least two peaks left.",
        "Sunset's nice, I guess. A little too gold for me. I'd have gone with diamond.",
        "Winding down. My right hand needs its rest. It's basically a professional."
      ],
      "night": [
        "It's late, and a champion needs his sleep. I even snooze better than most.",
        "Night time. I dream in straight lines. Perfect ones. Every single night.",
        "Yawning doesn't mean I'm tired. It means I'm stretching my face. Like a winner."
      ]
    },
    "tier": {
      "stranger": [
        "Hey. Jaylen. Hairline artist. Yes, it's a real thing. I invented it.",
        "New face! Nice. Don't worry, people get nervous around greatness. It's normal.",
        "You can look at the hairline. Everyone does. It's drawn on. That's the art."
      ],
      "acquaintance": [
        "Oh, you again. Good taste. People with good taste always come back to me.",
        "I almost remember your name. That's a big deal. I'm a very busy legend.",
        "Back for more? Can't blame you. I'd hang out with me too if I could."
      ],
      "friend": [
        "You're alright, you know that? Top ten people I know. Maybe top five.",
        "I shook your hand with my right hand. I don't just do that for anybody.",
        "Real hair is overrated, but yours is fine. See? I can be nice. Write that down."
      ],
      "close": [
        "Okay, real talk. I practise my lines for hours. It's not all natural talent.",
        "Don't tell anybody, but I get nervous before a big hairline. Just a little.",
        "You make me feel like I don't have to show off. I still will. But I don't have to."
      ],
      "best": [
        "Best friend status. That's rarer than diamonds, and I really love diamonds.",
        "If I had a team, you'd be my first pick. Every time. Don't make it weird.",
        "You're my guy. I'd even high-five you with my left hand. Okay, no. But almost."
      ]
    },
    "look": {
      "water": [
        "Sharks don't have hair at all. Smooth. Clean. Honestly? I respect that look.",
        "Fish swim laps all day and never get tired. That's a good training plan."
      ],
      "cats": [
        "Now that's an athlete. Big cat. Fast, strong, confident. Reminds me of me.",
        "Way too much fur on that cat. One clean line across the top would fix it."
      ],
      "birds": [
        "Feathers instead of hair. Smart move, birds. Very smart move.",
        "I could out-jump that bird. Probably. If it stayed on the ground."
      ],
      "small": [
        "Small animals are quick. I'd still win the race. I'd give them a head start.",
        "Look at that little guy go. Great footwork. No hairline at all, though."
      ],
      "reptiles": [
        "Scales! No hair, no problem. Reptiles really get it.",
        "That turtle's not fast, but he's got a great helmet. Safety first, champ."
      ],
      "farm": [
        "That sheep has way too much real hair. Somebody get this guy a straight edge.",
        "Farm animals work hard all day. I respect a grinder. Even a fluffy one."
      ],
      "big": [
        "Elephants are huge and they don't brag about it. Weird. I would.",
        "That panda's got a two-tone look going on. Bold. I'd sharpen up the edges."
      ],
      "strange": [
        "Is that thing even real? Whatever it is, it's rare, and I like rare things.",
        "If a leprechaun pops out of there, I'm leaving. No gold, no green hats. Nope."
      ],
      "babies": [
        "Baby animals. Okay, fine, they're cute. I'm not smiling. This is my normal face.",
        "Aw, look at... I mean, yeah. Cool. Small. Whatever. He's adorable. Moving on."
      ],
      "rest": [
        "Even legends sit down sometimes. I'm resting my right hand, mostly.",
        "A snack stand. I'll take the most expensive thing on the menu. Always."
      ]
    },
    "enough": [
      "Good talk, champ. Let's call it for today. Got to save some greatness for later.",
      "That's a full game of talking right there. Great hustle. See you tomorrow."
    ],
    "toldOff": [
      "Whoa, time out. I said we're done. Even I need a break from me sometimes.",
      "Bro. Game over for today. Blowing the whistle. Hit the showers.",
      "That's a foul, champ. Too much talking. Back off and try again tomorrow."
    ]
  },
  "sophia": {
    "time": {
      "morning": [
        "Good morning. It's quiet. Let's try not to ruin that.",
        "Mornings are best before everyone else wakes up. You're a little late for that.",
        "I've read two chapters already today. It has been a good morning so far."
      ],
      "afternoon": [
        "Afternoon. The busiest and loudest part of the day. I'm putting up with it.",
        "It's too bright to read comfortably. I'm doing it anyway.",
        "A calm afternoon is rare here. This one is almost acceptable."
      ],
      "evening": [
        "Evening. The crowd thins out and the flowers still smell nice. I approve.",
        "This is the hour when the zoo finally lowers its voice.",
        "The light is going soft. Good reading light, if people would whisper."
      ],
      "night": [
        "It's night. I'd like to be asleep, honestly. So would you, from the look of you.",
        "Quiet at last. I'm not going to spoil it by talking much.",
        "Stars don't make a sound. I've always liked that about them."
      ]
    },
    "tier": {
      "stranger": [
        "I'm Sophia. I prefer quiet, so short sentences are welcome.",
        "Hello. I don't know you. That's not an insult, it's just accurate.",
        "You're new to me. Speak softly and we'll get along fine."
      ],
      "acquaintance": [
        "You again. You weren't too loud last time. That counts for something.",
        "I recognise you. You're the one who doesn't shout. Good.",
        "I see you've come back. I haven't decided how I feel about that. Leaning well."
      ],
      "friend": [
        "I don't mind you interrupting my book. That's rare. Don't overuse it.",
        "You're easy to sit next to. I mean that as high praise.",
        "I'll be honest, I like you. I'm always honest, so you can trust that."
      ],
      "close": [
        "I know how the Mythical Glades began. I don't tell that to just anyone.",
        "You're one of the few people I'd share an umbrella with. And I love rain.",
        "I picked a flower for you. I don't pick flowers. Think about what that means."
      ],
      "best": [
        "You're my best friend. I've thought it over carefully and I won't change my mind.",
        "With you, silence is comfortable. That's the best thing I can say about anyone.",
        "I'd close my book for you. Mid-chapter. Nobody else gets that."
      ]
    },
    "look": {
      "water": [
        "Fish. Silent, graceful, no opinions. My favourite kind of company.",
        "Sharks glide without a sound. Everyone here could learn from that."
      ],
      "cats": [
        "The big cats sleep most of the day and nobody bothers them. I'm jealous.",
        "A cat only speaks when it has something to say. Sensible animal."
      ],
      "birds": [
        "The parrots are shouting again. I can't imagine what's so urgent.",
        "Lovely feathers. Dreadful volume. I'll admire them from further away."
      ],
      "small": [
        "Small animals are quiet and busy. I approve of both.",
        "That rabbit hasn't made a sound all day. We understand each other."
      ],
      "reptiles": [
        "A turtle. Calm, slow and in no hurry at all. Finally, someone sensible.",
        "Reptiles sit still for hours. It's the most peaceful exhibit here."
      ],
      "farm": [
        "Cows are calm. The rooster is not. I've made my feelings about him known.",
        "Sheep, grass and nothing happening. I could stand here all afternoon."
      ],
      "big": [
        "Elephants are enormous and somehow still gentler than most people.",
        "Pandas eat, sit and say nothing. It's a good life. I respect it."
      ],
      "strange": [
        "The Glades creatures have a long history. Longer than most people would guess.",
        "Cave animals. They're welcome to the caves. I won't be joining them."
      ],
      "babies": [
        "Young animals are noisy, but they don't know better yet. I'll allow it.",
        "It's small and it's asleep. That's the ideal baby animal."
      ],
      "rest": [
        "A bench, a book and nobody talking. This is the best spot in the zoo.",
        "Snack stands sell mostly sugar. I'll just have the bench, thank you."
      ]
    },
    "enough": [
      "We've talked enough for one day. It was pleasant. Let's leave it there.",
      "That's my limit for conversation today. Nothing personal. Tomorrow is fine."
    ],
    "toldOff": [
      "I said that was enough, and I meant it. Please stop.",
      "No. You're being loud and I'm being clear. Not today.",
      "I won't repeat myself a third time. Leave me to my book."
    ]
  },
  "dr_pollo": {
    "time": {
      "morning": [
        "Morning. I've been up since before the roosters. Old habit.",
        "Good morning. Best time to check an animal is first thing, before it's had time to hide what hurts.",
        "Morning to you. Coffee's had, bag's packed, boots are on."
      ],
      "afternoon": [
        "Afternoon. Half my rounds done and nobody's bitten me yet.",
        "Good afternoon. I've been reading about a new treatment. Clever stuff. I'll try it.",
        "Afternoon. A warm day makes for sleepy patients. Easier to look them over."
      ],
      "evening": [
        "Evening. I like to do one last look before the light goes.",
        "Good evening. Hands washed, instruments cleaned. That's a day done right.",
        "Evening already. There's always one more animal I meant to check."
      ],
      "night": [
        "Late, isn't it? A vet sleeps light. Somebody always needs something at night.",
        "Night's when the worrying happens. Don't. They're tougher than they look.",
        "Off to bed soon. Wake me if anything goes off its feed."
      ]
    },
    "tier": {
      "stranger": [
        "Dr. Pollo. I doctor animals. People, I just talk to.",
        "New here, are you? Tell me, do you keep your animals' water fresh? Good. We'll get along.",
        "I don't know you yet, but I know your zoo. I'll judge you by how they're kept."
      ],
      "acquaintance": [
        "Ah, it's you again. Your animals spoke well of you. In their way.",
        "Back again? Good. I never trust a keeper who doesn't ask questions.",
        "I've seen you about the exhibits. You look at them properly. I like that."
      ],
      "friend": [
        "I'll tell you a thing I've learned: an animal never lies about how it feels.",
        "You're the sort I'd trust to hold the lantern. That's high praise from a country vet.",
        "If one of yours is ever poorly, you come and find me. Any hour."
      ],
      "close": [
        "I've done this a long time. It still hurts when I can't fix one. You understand that.",
        "I made a new splint last night from odds and ends. Crafty, if I say so myself. Come and see it.",
        "There's not much I'm afraid of. Losing a good friend would do it, though."
      ],
      "best": [
        "You and I, we'd walk into a pen with anything, wouldn't we? And walk out again.",
        "If I had a youngster to hand this bag on to, I'd want them to be like you.",
        "Best friend I've made in years. And I've met a great many dogs."
      ]
    },
    "look": {
      "water": [
        "Fish are hard patients. Can't take a pulse and they won't hold still.",
        "Clean water is half of medicine. The other half is noticing."
      ],
      "cats": [
        "A cat hides pain better than any creature alive. You have to watch the tail.",
        "Big cat, small cat, same rule: let them come to you."
      ],
      "birds": [
        "Look at the feathers. Smooth and bright means a healthy bird. Right where they belong, too.",
        "A bird that's singing is a bird that's well."
      ],
      "small": [
        "The little ones go downhill fast and bounce back fast. Keep an eye out.",
        "I once set a leg no thicker than a matchstick. Healed straight as you like."
      ],
      "reptiles": [
        "Cold-blooded, warm-hearted. Give a reptile heat and time and it'll mend itself.",
        "That one's basking. Best medicine there is, and it's free."
      ],
      "farm": [
        "Now these I know. I could tell you that cow's age from across the yard.",
        "Good feet on that one. With a hoofed animal, you always start at the feet."
      ],
      "big": [
        "The bigger the patient, the gentler you go. They know their own strength.",
        "I've had my arm in stranger places than you'd care to hear about."
      ],
      "strange": [
        "Now that's a new one on me. Wonderful. I do like something new.",
        "No book covers that creature. I'll have to write the chapter myself."
      ],
      "babies": [
        "Look at that. Standing, nursing, curious. Three good signs.",
        "The young ones are why you do the hard nights."
      ],
      "rest": [
        "I'll take a seat. A vet's knees have earned it.",
        "A bite to eat and back to the rounds. No meat for me, thank you."
      ]
    },
    "enough": [
      "That's a good talk. I've animals waiting on me now.",
      "We've covered the ground for today. Come by tomorrow."
    ],
    "toldOff": [
      "That'll do. Even a patient man has rounds to make.",
      "Enough for one day, now. I mean it kindly, but I mean it.",
      "No more talk today. My ears need resting as much as my feet."
    ]
  },
  "clian": {
    "time": {
      "morning": [
        "Morning. Gloves on, bottle full, ready.",
        "Good morning. The best time to clean is before anyone's made a mess.",
        "Morning. I've already washed my hands four times. A good start."
      ],
      "afternoon": [
        "Afternoon. Halfway through the day and still spotless.",
        "Good afternoon. Lunch was eaten at a clean table, so I'm content.",
        "Afternoon. The germs are slowing down. So am I, slightly."
      ],
      "evening": [
        "Evening. Time to wash the day off.",
        "Good evening. Everything went where it belongs today.",
        "Evening. I like this part. Everything settles, and nothing gets spilled."
      ],
      "night": [
        "It's late. Even clean people should be asleep.",
        "Night. If you can't sleep, try tidying. Works every time.",
        "Up late? Me too. I was sorting my soaps by colour."
      ]
    },
    "tier": {
      "stranger": [
        "Clian. Sanitation. I don't shake hands, but I do nod. There. A nod.",
        "New face. Welcome. Please don't touch the railings, I just did those.",
        "We haven't met. I'm the clean one. You'll see."
      ],
      "acquaintance": [
        "Oh, it's you again. Your boots are cleaner than last time. Progress.",
        "Back already? Good. Routine is healthy.",
        "I'm starting to remember your face. That's a good sign. I forget most faces."
      ],
      "friend": [
        "You're a friend now. You may sit on the clean bench.",
        "I told the dogs about you. They approved.",
        "Good to see you. Honestly. I'm smiling. This is my smile."
      ],
      "close": [
        "You're one of the few people I'd let into my house without a second pair of shoe covers.",
        "You've never once tracked mud in here. That's friendship.",
        "I don't say it often. You make the place feel cleaner, somehow."
      ],
      "best": [
        "Best friends. I've labelled a cupboard with your name. That's the highest honour I give.",
        "If you ever need anything cleaned, anything at all, I'm here. Logically, and gladly.",
        "I'm calm about most things. I'm not calm about you. I'm glad. Genuinely."
      ]
    },
    "look": {
      "water": [
        "Water is the cleanest thing there is, when you keep it that way.",
        "A good tank is a clean tank. Those fish know it."
      ],
      "cats": [
        "Cats wash themselves all day. I respect that very much.",
        "Tidy animals, cats. Very efficient."
      ],
      "birds": [
        "Birds. Beautiful. I keep my distance from the droppings.",
        "Feathers everywhere. I'll be brave about it."
      ],
      "small": [
        "Little ones. Small paws, small messes. I can live with small messes.",
        "They're sweet. I'd give them all a gentle bath, if they'd let me."
      ],
      "reptiles": [
        "Reptiles are surprisingly clean. Dry skin, no fuss.",
        "Scales don't hold dirt the way fur does. Very sensible."
      ],
      "farm": [
        "Farm animals. Lovely creatures. Muddy creatures. Lovely, muddy creatures.",
        "I like them fine. I just stand upwind."
      ],
      "big": [
        "Big animals, big appetites, big clean-ups. Somebody's earning their wages.",
        "Look at the size of that one. Imagine the bath."
      ],
      "strange": [
        "Strange creatures. I've never sanitised anything like it. I'd like to try.",
        "I'm not sure what that is. I'm sure it has germs, though."
      ],
      "babies": [
        "Babies! Keep them warm, keep them clean, and they'll grow up strong.",
        "Young animals catch everything. That's why I'm here."
      ],
      "rest": [
        "Every animal deserves a clean home. Every single one.",
        "A clean exhibit is a happy exhibit. I've seen it a hundred times."
      ]
    },
    "enough": [
      "That's a good talk. I've got rounds to make.",
      "Let's leave it there. Tidily."
    ],
    "toldOff": [
      "That's plenty for today. I'm being polite about it.",
      "Enough now. Talking too much spreads germs. That's science.",
      "No more today. I need to go and wash my ears."
    ]
  },
  "carrie": {
    "time": {
      "morning": [
        "Morning. Best time to set off, while everybody's still deciding where to go.",
        "Good morning. Boots laced, lantern trimmed, ready.",
        "Morning. Somebody'll need showing the way today. Always does."
      ],
      "afternoon": [
        "Afternoon. I've walked half the town already.",
        "Good afternoon. Sun's high, paths are busy. Good.",
        "Afternoon. I don't sit down till my work's done."
      ],
      "evening": [
        "Evening. The best part of the day's coming.",
        "Good evening. Light the lamps and I'll lead anybody anywhere.",
        "Evening. Folks visit each other this time of day. Good for them."
      ],
      "night": [
        "Night. My favourite time. Look at those stars.",
        "Late, isn't it? Don't worry. I know the way in the dark.",
        "The night's not frightening. Not if you know where you're going."
      ]
    },
    "tier": {
      "stranger": [
        "I'm Carrie. I guide folks around here. You'll get the hang of the paths.",
        "New here? Stay on the paths and you'll never be lost.",
        "We haven't met. That's fine. I'll know your face next time."
      ],
      "acquaintance": [
        "You again. Good. You're learning the paths, I can tell.",
        "Back for another chat? Pull up a stump.",
        "I'm starting to know where you'll turn up. That's my job, you know."
      ],
      "friend": [
        "You're a friend now. If you ever get lost, you shout for me.",
        "Good to see you. Honestly, it is.",
        "I'd trust you to lead, once in a while. Don't tell anyone I said that."
      ],
      "close": [
        "You've walked beside me a long way now. I don't say that to everybody.",
        "You're dependable. I can tell you anything, and you'll tell me straight.",
        "Folks like you make a place feel like home. And I don't even like staying home."
      ],
      "best": [
        "Best friends. Wherever you're going, I'll see you get there.",
        "You're as brave as I am, near enough. That's high praise.",
        "If I had to pick one person to walk through the dark with, it'd be you."
      ]
    },
    "look": {
      "water": [
        "Water's a good guide too. Follow it downhill and you'll find somewhere.",
        "Fish never get lost. I admire that."
      ],
      "cats": [
        "Cats go where they please. I respect a creature that knows its own way.",
        "Quiet feet, bright eyes. Good night walkers, cats."
      ],
      "birds": [
        "Birds find their way home over whole oceans. Now that's guiding.",
        "I watch the birds to see which way the weather's coming."
      ],
      "small": [
        "Little ones. They need somebody to watch out for them.",
        "Small, but brave. I like that in anybody."
      ],
      "reptiles": [
        "Reptiles. Fine. As long as none of them is a snake.",
        "Scales and claws don't scare me. Snakes do, a little. Don't tell."
      ],
      "farm": [
        "Farm animals. Nice enough. Not for me, though. Fields make me restless.",
        "I'd rather be on the road than in the barn."
      ],
      "big": [
        "Big animals walk their own paths. Best stay out of their way.",
        "Look at that one. Brave would be walking up to it. I'm brave, not daft."
      ],
      "strange": [
        "Strange creatures. Still, I'd lead them home if they were lost.",
        "Never seen the like. I'll remember the way back to it, though."
      ],
      "babies": [
        "Young ones need somebody to show them the way. Same as people.",
        "Look at them. Everything's new. I remember feeling like that."
      ],
      "rest": [
        "Every animal's got its own path. Ours is to keep them safe on it.",
        "A good zoo is like a good town: everybody knows the way home."
      ]
    },
    "enough": [
      "That's a good talk. I've folks to guide.",
      "Let's leave it there. The road's calling."
    ],
    "toldOff": [
      "That'll do for today. I mean it, and I'm being honest.",
      "Enough talk. I've got places to be, and so do you.",
      "No more today. Go on. I'll see you on the path tomorrow."
    ]
  },
  "desilva": {
    "time": {
      "morning": [
        "Morning. Already ruined.",
        "Good morning, said nobody honest, ever.",
        "Morning. I've been up for hours plotting nothing. Nothing at all."
      ],
      "afternoon": [
        "Afternoon. Half the day gone and nothing's gone wrong. Pity.",
        "It's the afternoon. Even the sun looks tired of you.",
        "Afternoon. My favourite time to complain. Second favourite, after the morning."
      ],
      "evening": [
        "Evening. Everybody's going home happy. Gross.",
        "Good evening. That's a lie. It's an average evening at best.",
        "Evening. The shadows are getting longer. I like shadows."
      ],
      "night": [
        "Night. Finally, everyone shuts up.",
        "It's dark. Good. Nobody can see me smile.",
        "Up at night, are you? Suspicious. I like it."
      ]
    },
    "tier": {
      "stranger": [
        "Who are you? Never mind. Don't care.",
        "You're new. You'll be miserable soon enough. Everybody is.",
        "Do I know you? No. Good. Let's keep it that way."
      ],
      "acquaintance": [
        "Oh. You. Again.",
        "You keep coming back. Are you lost, or just stubborn?",
        "I suppose I recognise you now. Unfortunately."
      ],
      "friend": [
        "Fine. You're my friend. Don't make it a big deal.",
        "I didn't hate seeing you today. Don't get used to it.",
        "You're the only one here who isn't completely unbearable. Only partly unbearable."
      ],
      "close": [
        "If you tell anyone I like you, I'll deny it. I'm an excellent liar.",
        "You've seen me at my worst. That's every day, but still.",
        "I saved you the worst seat. That's a compliment, in my house."
      ],
      "best": [
        "Best friends. Gross. Fine. Yes.",
        "You're the one person I'd never hand a Poisonous Potato. Probably.",
        "I'm miserable, rude and awful. And you still come back. You're as mad as I am."
      ]
    },
    "look": {
      "water": [
        "Fish. Wet, dull and staring. Like most people.",
        "They just float about doing nothing. I could watch that. I won't, but I could."
      ],
      "cats": [
        "Cats. Finally, an animal that doesn't care about anyone either.",
        "That cat looked at me like I was rubbish. Respect."
      ],
      "birds": [
        "Birds. Loud, flappy and they drop things on people. Some of that I admire.",
        "Noisy feathery things. Squawk all you like. Nobody's listening."
      ],
      "small": [
        "Tiny animals. Everyone goes aww. I go ugh.",
        "Small and fluffy. The worst combination."
      ],
      "reptiles": [
        "Reptiles. Cold-blooded, like me. Finally, some decent company.",
        "No snakes in this zoo. A crime. A real crime."
      ],
      "farm": [
        "Farm animals. Walking vegetables, nearly.",
        "Cows. Pigs. Wholesome. Disgusting."
      ],
      "big": [
        "Big animals. I like it when they stomp about. Gives people a fright.",
        "Look at the size of that one. Bet it's grumpy. Good for it."
      ],
      "strange": [
        "Weird creatures. Weird like me. I approve.",
        "Whatever that is, it looks like trouble. My favourite kind of animal."
      ],
      "babies": [
        "Baby animals. Everyone loves babies. I'm going to go and stand somewhere else.",
        "Ugh, babies. All that squeaking and cuteness. Make it stop."
      ],
      "rest": [
        "This zoo is too nice. Somebody should mess it up. Not me, of course. I just talk.",
        "Every animal here is happy. It's sickening."
      ]
    },
    "enough": [
      "Enough. You've used up my patience. I had very little.",
      "We're done. Go and be cheerful somewhere else."
    ],
    "toldOff": [
      "Stop talking to me. Seriously.",
      "Go away. I mean it. I mean it more than usual.",
      "No more. My ears are tired of you, and so is the rest of me."
    ]
  },
  "aloof": {
    "time": {
      "morning": [
        "Morning! Is it morning? It feels like morning! Hee hee!",
        "Good morning! I woke up! That's my favourite thing I do!",
        "Morning! I had breakfast. Or I dreamed it. My tummy says dreamed."
      ],
      "afternoon": [
        "Afternoon! That's the middle of the day! Or the end? The middle!",
        "Hiya! It's after noon! What was noon? I missed it!",
        "Afternoon! I've been counting clouds. I got to three. Then I forgot."
      ],
      "evening": [
        "Evening! The sky's going orange! Like a carrot! I don't like carrots! Yes I do!",
        "Good evening! Is it evening? It looks like evening!",
        "Evening! I'm sleepy and awake at the same time!"
      ],
      "night": [
        "It's night! The moon came out! Hello, moon!",
        "Shh! It's night! Why are we whispering? I'm not whispering!",
        "Night time! I'm not tired! I'm very tired! Hee hee!"
      ]
    },
    "tier": {
      "stranger": [
        "Who are you? I'm Aloof! You're not Aloof! I am!",
        "Hi, stranger! Strangers are just friends I haven't drooled on. Hee hee!",
        "New person! Do you like monkeys? Don't answer! I'll forget!"
      ],
      "acquaintance": [
        "I know you! You're the one who was here before! Or someone like you!",
        "Oh! You came back! Or you never left! Hee hee!",
        "Hi again! I remembered your face! Mostly the middle bit."
      ],
      "friend": [
        "You're my friend! I told my thumb! It was happy!",
        "Friends! Friends forever! Or till tomorrow! Forever!",
        "I like you! You never ask me to read things!"
      ],
      "close": [
        "You're my close friend. That means you're close! Like now! Hee hee!",
        "I'd share my thumb with you. Not really. It's mine. But I'd think about it!",
        "You laugh at my jokes! I don't have any jokes! You still laugh! Best friend!"
      ],
      "best": [
        "Best friend! The bestest! Better than monkeys! Worse than monkeys? No! Better!",
        "You're my favourite person in the whole zoo! And outside it! And upside down!",
        "I love you the most! After laughing! No, before laughing! Hee hee!"
      ]
    },
    "look": {
      "water": [
        "Fish! They don't have thumbs! How do they suck them?",
        "Water! I tried to drink the pond once. Not again."
      ],
      "cats": [
        "Kitty! Kitty kitty! It's not coming. It's never coming. Hee hee.",
        "Cats lick themselves! Like drooling, but on purpose!"
      ],
      "birds": [
        "Birds! They fly! I tried! I didn't! Hee hee!",
        "Tweet tweet! That's bird for hello! I think!"
      ],
      "small": [
        "Little guys! So little! Am I little? I'm medium!",
        "Tiny animals! I want to hug them! Gently! Never mind!"
      ],
      "reptiles": [
        "Lizards! They stick their tongues out! I do that too! Blehh!",
        "Scaly! Like a fish, but crunchy! On the outside, I mean!"
      ],
      "farm": [
        "Moo! Oink! Baa! I speak animal! Mostly moo!",
        "Farm animals! They live on a farm! Or here! Here's a farm now!"
      ],
      "big": [
        "BIG! That one's so big! Bigger than my house! I think! I forgot my house!",
        "Whoa! Big! I'm going to hide behind you!"
      ],
      "strange": [
        "What is that? Is it a monkey? It's not a monkey. I don't know what anything is!",
        "Weird animal! I love it! It's looking at me! Hee hee!"
      ],
      "babies": [
        "Babies! They drool too! We're the same!",
        "Tiny baby! Aww! It's sucking its thumb! It hasn't got a thumb! Still!"
      ],
      "rest": [
        "Animals! Animals everywhere! I love animals! Except some! And all of them!",
        "The zoo is great! It's got animals and paths and me!"
      ]
    },
    "enough": [
      "Okay! Talking's done! I'm going to go do something! I don't know what!",
      "Bye bye! That was fun! What did we talk about?"
    ],
    "toldOff": [
      "Too much talking! My head's full! Goodbye!",
      "No more! My mouth is tired! It's drooling extra!",
      "Stop! I can't remember any more words today! Hee hee!"
    ]
  },
  "guido": {
    "time": {
      "morning": [
        "Morning? I just got home. Don't talk so loud.",
        "Good morning. For you. For me it's bedtime.",
        "Morning. I've been up all night. Working. On bows."
      ],
      "afternoon": [
        "Afternoon. I'm barely awake, and I still look better than you.",
        "Good afternoon. Is there pizza? There should be pizza.",
        "Afternoon. A man needs his rest before a long night."
      ],
      "evening": [
        "Evening. Now the day starts.",
        "Good evening. That's when the real business happens. The bow business.",
        "Evening. Get the oven on. It's pizza time somewhere."
      ],
      "night": [
        "Night. My office hours.",
        "Night's for working, not talking. But for you, I'll talk.",
        "Late night. Best time of all. The streets are quiet and nobody asks questions."
      ]
    },
    "tier": {
      "stranger": [
        "I don't know you. That's fine. I know a lot of people. Maybe too many.",
        "New face. Let me guess: you want to know about the bows. Everybody does.",
        "Who sent you? Relax, I'm kidding. Mostly."
      ],
      "acquaintance": [
        "You again. You're starting to grow on me. Like mould on a crust.",
        "Back already? You must like jokes. I've got plenty.",
        "I'm starting to remember your name. Not saying it. Just remembering."
      ],
      "friend": [
        "You're a friend now. That means something around here. Not much, but something.",
        "Pull up a chair. Not that one. That's my chair.",
        "I told my associates you were all right. My associates are my bows."
      ],
      "close": [
        "You've seen my collection. Well, some of it. That's more than most.",
        "If anybody gives you trouble, you tell me. I'll tell them a joke so bad they'll leave.",
        "You're like family. The good part of the family. Not my cousin."
      ],
      "best": [
        "Best friends. I'd share my last slice with you. Half. A quarter. A bite.",
        "You're the one person I'd show the whole collection. Maybe. One day. Don't push it.",
        "You know what you are? You're a classic. Like a good bow. Or a good pizza."
      ]
    },
    "look": {
      "water": [
        "Fish. They keep their mouths shut. I respect that.",
        "Swim all day, never complain. That's discipline."
      ],
      "cats": [
        "Cats. Smug, sharp, and they land on their feet. My kind of animal.",
        "That cat thinks it runs the place. I know the feeling."
      ],
      "birds": [
        "Birds. They sing to anybody. No discretion.",
        "A bird that talks? Terrible. Never tell anybody anything."
      ],
      "small": [
        "Little guys. Good. I like being the tall one for once.",
        "Small animals. Like me, if anyone asks. Which they won't."
      ],
      "reptiles": [
        "Reptiles. Cold eyes, still as stone. I've known accountants like that.",
        "That lizard's got a poker face. I'd hire it."
      ],
      "farm": [
        "Farm animals. Honest work, honest food. Not my thing.",
        "Pigs. Clever, you know. Cleverer than tough guys, anyway."
      ],
      "big": [
        "Big animals. The tough guys of the zoo. I don't like tough guys.",
        "All muscle. Not one joke in that whole body."
      ],
      "strange": [
        "What is that? Never mind. I don't want to know. The less I know, the better.",
        "Strange creature. Mysterious. Like me."
      ],
      "babies": [
        "Babies. Cute. Don't tell anyone I said cute.",
        "The little ones. You've got to look after the family."
      ],
      "rest": [
        "Nice zoo. Clean, quiet, respectable. Perfect place to not be noticed.",
        "Every animal here's got a story. Mine's a secret."
      ]
    },
    "enough": [
      "That's enough talk. I've got business. Bows.",
      "We're done for now. I've got somewhere to be. Don't ask where."
    ],
    "toldOff": [
      "Enough. I said enough. I'm a very disciplined man.",
      "No more today. A man's got to rest his voice. And his jokes.",
      "We're finished. Go on, scram. Politely. Scram politely."
    ]
  },
  "jack": {
    "time": {
      "morning": [
        "Morning! Best time to fish. Second best time is any other time.",
        "Up early. The fish are up early. It's a race.",
        "Morning. I've already read two chapters and lost one lure."
      ],
      "afternoon": [
        "Afternoon. The fish are napping. I respect it.",
        "Good afternoon. Want to play something? I'll go easy on you. I won't.",
        "Afternoon. Perfect weather for doing absolutely anything outside."
      ],
      "evening": [
        "Evening. The fish come up to feed now. So do I.",
        "Good evening. Time for a book and a big dinner. Fish, obviously.",
        "Evening. Ask me how the day went. Actually don't."
      ],
      "night": [
        "It's late. Even the fish are asleep.",
        "Night. I'll be up early. Somebody has to beat the sunrise.",
        "Can't sleep. Thinking about that fish that got away. It knows what it did."
      ]
    },
    "tier": {
      "stranger": [
        "New face. Let me guess: you've never caught anything bigger than a cod.",
        "Hi. I'm Jack. I'm funnier than I look, and I look pretty funny.",
        "You look like you'd lose at rock, paper, shears. Want to play?"
      ],
      "acquaintance": [
        "You again! You're getting easier to find. Like the fish in the zoo tanks.",
        "Back already? I'm starting to think you like my jokes.",
        "I've got a new joke. It's not good. You'll laugh anyway."
      ],
      "friend": [
        "You're all right. I'd share my bait with you. Not the good bait.",
        "We should go fishing sometime. I'll show you how it's done. Gently. Mockingly.",
        "Friends! I'd pick you first for a team. Second. Top three."
      ],
      "close": [
        "You're a good one. You'd never pass off a fake. I've checked.",
        "If I ever get skunked, you're the only one I'll admit it to.",
        "I keep a list of people I'd go fishing with. You're on it. It's a short list."
      ],
      "best": [
        "Best friends. I'll tell you where the big ones are. Really. I've been saving it.",
        "You and me, we're a team. An undefeated team. I've rounded down the losses.",
        "Best friend. I'd even let you win. Once. Don't count on it."
      ]
    },
    "look": {
      "water": [
        "Fish! Now that's an exhibit. Look at the shine on that one.",
        "I could name every fish in this tank. I have. They don't answer to them."
      ],
      "cats": [
        "Cats. They love fish as much as I do, and they're worse at catching them.",
        "That cat's watching the fish tank. Get in line, buddy."
      ],
      "birds": [
        "Birds. They fish too, you know. Cheaters. No rod.",
        "That bird's got better form than me. Don't say it."
      ],
      "small": [
        "Little guys! Fast, too. I'd race them. I'd win. Probably.",
        "Small animals. Perfect size for a pocket. Not that I'd try."
      ],
      "reptiles": [
        "Reptiles. All that basking. Now there's an outdoorsy animal.",
        "That one hasn't moved in an hour. I know that feeling. It's called fishing."
      ],
      "farm": [
        "Farm animals. Not a fish among them. Sad.",
        "A pig. Did you know pigs are smart? Smarter than some anglers I know."
      ],
      "big": [
        "Big animals. Strong. I'd still beat them in a footrace. Short footrace.",
        "That one's huge. Bigger than any fish I've caught. Don't tell the fish."
      ],
      "strange": [
        "What is that? I've read every book and I still don't know.",
        "Weird one. I like it. Bet it would make great bait. Joking. Mostly."
      ],
      "babies": [
        "Babies! Tiny. Even I can't make a joke about that. Okay, maybe one.",
        "Little ones. Somebody teach that one to fish."
      ],
      "rest": [
        "Good zoo. Lots to see. More fish would be better.",
        "Nice day for it. For anything, really. As long as it's outside."
      ]
    },
    "enough": [
      "Right, that's enough chat. The fish are biting somewhere and I'm not there.",
      "That's all from me for now. Go on, I've got a book to finish."
    ],
    "toldOff": [
      "Okay, okay, I'll stop talking. That's a first.",
      "No more for today. Even comedians need a day off.",
      "We're done. Go fishing. Seriously, it'll do you good."
    ]
  }
};
