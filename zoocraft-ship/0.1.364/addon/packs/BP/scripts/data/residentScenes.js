// Every resident's lines for the moment (0.1.364; Austin, 23 Nov: "make them more authentic to their personality and
// what they are doing at the moment, and how your friendship is with them ... a lot of different things they can say
// depending on what's happening in the world, and around them, and who is by them, and what is by them"). For each
// resident: `intro` (the first thing they ever say: their name and what they do), `scenes` (residents/sceneRules.js
// SCENES: two lines for anyone, `lo` for a Stranger or Acquaintance, `hi` for a Close or Best Friend) and `near`
// (three neighbours they have words about, said when that neighbour stands by). Tokens: {player}, {other},
// {species}, {item}. Written in each one's voice from Austin's specs; drafts, his to change. No line tells the player
// to do something in the game or promises anything.
export const SCENE_TALK = {
  "austin": {
    "intro": "G'day, I'm Austin! Zoo influencer, animal expert, local legend. I make videos about the animals here, and the animals love them. Ask any of 'em.",
    "scenes": {
      "home_morning": {
        "any": [
          "Morning at Casa Austin, mate. I'm picking today's shirt. The parrots voted for the loud one.",
          "You caught me before the hair's done. Look away for a minute. Actually, look, it's still great."
        ],
        "lo": "A visitor at my door before breakfast? Fans get keener every year. Mind the trophy shelf.",
        "hi": "{player}! Brekkie's on, mate. I burnt the toast, so I'm calling it smoked. Very fancy."
      },
      "home_evening": {
        "any": [
          "Feet up, mate. I'm watching today's footage back. I'm brilliant in it, as usual.",
          "Evening at home. I'm counting my followers before bed. Lost count at eleven. Thousand. Probably."
        ],
        "lo": "Evening visits are usually for close mates, but go on, you can admire the trophy shelf from there.",
        "hi": "Good timing, {player}. I was about to sort today's stories into true and not. It's a short pile."
      },
      "walking_to_zoo": {
        "any": [
          "On my way to the zoo, mate. I walk it every day so the path can say it knew me.",
          "Can't stop long, the animals get restless if I'm late. One of them taps its foot."
        ],
        "lo": "Heading to the zoo, same as you? Walk behind me if you like. That's where the fans go.",
        "hi": "Walking in together, {player}? I'll tell the animals you're with the legend. They'll go easy on you."
      },
      "at_zoo": {
        "any": [
          "I'm doing my rounds, mate. Every exhibit gets a wave. It's only polite when you're this famous.",
          "See that enclosure? I told it a joke once and the whole place laughed. Even the fence."
        ],
        "lo": "Enjoying the exhibits? Good. I narrate for free, but only when I feel like it. I always feel like it.",
        "hi": "Best bit of this zoo is walking round it with you, {player}. Second best bit is me. Close thing."
      },
      "walking_home": {
        "any": [
          "Homeward bound, mate. I waved goodbye to every animal. Took an hour. Worth it.",
          "Done for the day. My throat's hoarse from all the fascinating things I said."
        ],
        "lo": "I'm off home. If you wanted a signature, the queue starts tomorrow.",
        "hi": "Good day today, {player}. By the time I'm at my front door it'll have been twice as good. I round up."
      },
      "at_work": {
        "any": [
          "I'm mid video, mate! This one's called Ten Animals That Respect Me. I'm up to two.",
          "Working, believe it or not. Talking to a camera about animals is harder than it looks. For others."
        ],
        "lo": "Careful, you're in my shot. No, it's fine, you give the video a bit of scale.",
        "hi": "{player}, perfect timing! You're in the video now. You play the impressed one. You're a natural."
      },
      "following": {
        "any": [
          "Adventure with Austin! Well, Austin with you. The title still needs work.",
          "I'm right behind you, mate, getting your good side. It's the back of your head."
        ],
        "lo": "I don't tag along with just anyone, you know. You've got about one episode's worth of charm.",
        "hi": "Anywhere you go, I go, {player}. Mostly so I can say I got there first."
      },
      "following_night": {
        "any": [
          "Night adventure, eh? I'm not nervous, mate, I always walk this close behind people.",
          "It's dark out here. Lucky my smile lights the way. Slightly."
        ],
        "lo": "Out past my bedtime with someone I hardly know. This had better make a good story.",
        "hi": "Wouldn't be out here in the dark for anyone but you, {player}. Don't make it weird."
      },
      "staying": {
        "any": [
          "Still waiting, mate. I've named three clouds and they all look like me.",
          "Standing here like a statue. A very handsome statue. Somebody should build one."
        ],
        "lo": "You parked a celebrity and wandered off? Bold. I'll allow it once.",
        "hi": "I'd wait here all day for you, {player}. I'll complain the whole time, but I'll wait."
      },
      "rain": {
        "any": [
          "Mate, this rain is flattening my hair. It took a long while to get it this windswept.",
          "A drizzle like this once filled my boots, and a frog moved in. Paid rent and everything."
        ],
        "lo": "Bit wet for standing about with fans, isn't it? I'll sign the puddle.",
        "hi": "{player}, mate, budge up and share the dry patch. A soggy legend is still a legend, but I'd rather not."
      },
      "thunder": {
        "any": [
          "Hear that thunder? That's the sky clapping for me. Bit over the top, honestly.",
          "I didn't jump at that boom, mate. That was a dance move. New one."
        ],
        "lo": "Stormy out. I'm fine, I'm famously fine. Is it getting closer, do you think?",
        "hi": "Alright {player}, between us, that last crack of thunder got me. I'm standing a bit nearer to you now."
      },
      "full_moon": {
        "any": [
          "Big full moon tonight, mate. I howled at one once and three wolves asked for lessons.",
          "Look at that moon, round as a wombat. Great lighting for my good side. Both sides."
        ],
        "lo": "Full moon's out. Don't worry, I only turn into a bigger celebrity.",
        "hi": "Full moon, good mate beside me. If something howls back, {player}, you're faster than me, right?"
      },
      "dark_moon": {
        "any": [
          "No moon at all tonight, mate. Can't see my own hand. Shame, it's a great hand.",
          "Black as a bat's pocket out here. I'd film it, but it'd just be me breathing."
        ],
        "lo": "Dark night to meet someone new. For a second there I thought you were a bush.",
        "hi": "Can't see a thing without the moon, {player}. I'm following your voice. It's the brave sounding one."
      },
      "dawn": {
        "any": [
          "Sunrise, mate! The sun gets up early to catch me before I'm busy.",
          "First light. The birds are warming up, and one of them is whistling my theme tune. I reckon."
        ],
        "lo": "Up at sunrise? You must be keen. I'm only here because the light loves me.",
        "hi": "Look at that sunrise, {player}. Nearly as bright as us two. Mostly me, but you help."
      },
      "dusk": {
        "any": [
          "There goes the sun, mate, off to bed. I told it to get some rest, big day tomorrow.",
          "Sky's gone all pink and orange. Somebody's been copying my shirt again."
        ],
        "lo": "Sunset already. I'd pose for you, but you haven't earned the sunset pose yet.",
        "hi": "Sun's dropping, {player}. Another day we both survived my ideas. Proud of us."
      },
      "nether": {
        "any": [
          "Strewth, it's hot down here! My hair's going crispy. Still looks good though.",
          "Lava everywhere and things that squeal, mate. I've holidayed in worse. That's a lie."
        ],
        "lo": "You brought a celebrity to a place that's on fire? We'll talk about this later.",
        "hi": "Only for you would I stand in a furnace, {player}. If I melt, tell the fans I looked calm."
      },
      "the_end": {
        "any": [
          "Nothing but pale stone and a black sky, mate. Terrible for filming, great for looking mysterious.",
          "Those tall dark fellas won't look me in the eye. Shy, I reckon. Famous people do that to them."
        ],
        "lo": "The edge of everything, with someone I barely know. I'm keeping well back from that drop.",
        "hi": "{player}, mate, this empty sky gives me the wobbles. I'm sticking to you like a burr till we're home."
      },
      "fishing_sky": {
        "any": [
          "Islands floating in the sky, mate! I'm not looking down. I looked down. Big mistake.",
          "Fishing above the clouds. I hooked one so big up high once that it gave me a lift home."
        ],
        "lo": "Nice spot you've found up here. I'd have discovered it myself, I was just busy that day.",
        "hi": "A pool in the clouds and my best mate, {player}. If a fish pulls me in, I'm blaming the altitude."
      },
      "acufend": {
        "any": [
          "A round little moon with a jungle on it, mate. And the locals love a tune. My kind of crowd.",
          "These odd critters keep bopping about. I showed them my dance and they went very quiet."
        ],
        "lo": "Strange place to bring someone you just met. Good thing I'm famous on every moon.",
        "hi": "{player}, you take me to the weirdest places. This jungle moon's my favourite so far."
      },
      "cave": {
        "any": [
          "Deep down in the rock, mate. Echo's brilliant. Hello, Austin! See, it knows me.",
          "Dark, drippy and full of stone. I wrestled a stalactite once. It hung on."
        ],
        "lo": "A cave tour with a stranger. I'll stay near the torchlight, for the camera, you understand.",
        "hi": "I'd rather be up top with the animals, {player}, but a mate's a mate. I'm right on your heels in this gloom."
      },
      "high_up": {
        "any": [
          "Look how high we are, mate! I can see my house. It looks famous even from here.",
          "Heights don't bother me. An eagle once asked me to tone it down, I was showing it up."
        ],
        "lo": "Long way down. I'm holding this rock because I like it, not because I'm scared.",
        "hi": "Top of the world, {player}! My knees are knocking a bit. That stays up here with us."
      },
      "hostile_near": {
        "any": [
          "Mate, there's something nasty lurking just there. I'd handle it, but this is my good shirt.",
          "Monster about! I'm not hiding behind you, I'm getting a better angle."
        ],
        "lo": "Something's groaning nearby. As the famous one, I should probably stand at the back.",
        "hi": "Trouble's close, {player}. I've got your back. I'm right behind it, in fact, quite close."
      },
      "creeper_near": {
        "any": [
          "That green fella's creeping up, mate, and I don't like its face. Never trust a thing with no arms.",
          "Creeper! I taught one to hiss a tune once. This isn't that one. Backing away now."
        ],
        "lo": "There's a creeper eyeing us. I'd introduce myself, but it looks like it's had enough of everything.",
        "hi": "{player}, creeper, right there! If it goes bang, I want it known I screamed in a brave way."
      },
      "villager_near": {
        "any": [
          "Villagers, mate. Lovely people. They keep saying hrmm at me, which I take as applause.",
          "I asked one of these villagers to be in a video and he just stared. Starstruck, poor bloke."
        ],
        "lo": "A whole village and not one of them has asked who I am. They must already know.",
        "hi": "These villagers like you, {player}. I can tell, they hrmm softer when you walk by."
      },
      "pet_near": {
        "any": [
          "Is this your little mate? Good looking animal. It sniffed me and approved, I could tell.",
          "Your pet's got a great look for the camera. Better eye contact than most of my guests."
        ],
        "lo": "Nice pet. Animals usually run straight to me, this one's just being polite to you.",
        "hi": "{player}, your furry sidekick likes me more than you now. Sorry. It happens with all of them."
      },
      "farm_animal_near": {
        "any": [
          "Paddock animals, mate. I speak fluent sheep, and that one just called me handsome.",
          "Listen to them carry on. A pig like that one beat me in a race once. I let it. Mostly."
        ],
        "lo": "Just ordinary farm stock, but stand back and watch a professional say hello to a pig.",
        "hi": "That chicken's staring again, {player}. You know my history with chickens. So does it."
      },
      "zoo_animal_near": {
        "any": [
          "The {species} and I go way back, mate. I taught it everything it knows. It forgot most of it.",
          "See how the {species} turned its head? That's a nod. We nod at each other, professionals do."
        ],
        "lo": "That's a {species}. I could tell you ten facts about it, and at least four would be real.",
        "hi": "{player}, that {species} likes you. Trust me, I asked it. It said you're alright, for a non-celebrity."
      },
      "guests_crowd": {
        "any": [
          "Look at this crowd, mate! They say they came for the animals. Sure they did.",
          "So many guests around. I've waved so much my arm thinks it's a flag."
        ],
        "lo": "Bit crowded for a private chat. There's a queue for me, it's the one made of everybody.",
        "hi": "All these guests and I'd still rather talk to you, {player}. Don't let them hear, they'll riot."
      },
      "residents_crowd": {
        "any": [
          "Whole street's turned out, mate. Nice of the neighbours to come and stand near me.",
          "All the neighbours in one spot. If I start a story now, nobody gets away."
        ],
        "lo": "You've met the neighbours, then. Good folk. I'm the famous one, in case it wasn't clear.",
        "hi": "Everyone we know in one place, {player}. Quick, who do we tease first? I say me. No, you."
      },
      "other_resident": {
        "any": [
          "Oh, {other}'s here! Biggest fan on the street, mate. Hasn't said so, but I can tell.",
          "{other} and I were just chatting. I did most of it. {other} did the nodding."
        ],
        "lo": "That's {other}. Lives near me, which makes this a very lucky street.",
        "hi": "Don't tell {other}, {player}, but you're the one I save the good stories for."
      },
      "other_player": {
        "any": [
          "And who's this with you? {other}, is it? G'day! Two fans at once, what a day.",
          "{other} looks like the adventurous type, mate. I can spot it. Takes one to know one."
        ],
        "lo": "Two of you now. {other} can have my left side, it's nearly as good as the right.",
        "hi": "{other} seems alright, {player}, but you're still my number one mate. I checked the list."
      },
      "alone_night": {
        "any": [
          "Just us and the dark, mate. Quiet, isn't it? I'll fix that, I've got stories.",
          "Nobody about tonight. First time I've had an audience of one. You're doing well."
        ],
        "lo": "Empty night, and me alone with someone I just met. I talk more when I'm jumpy, fair warning.",
        "hi": "No crowd, no camera, {player}. Truth is I like these quiet ones best. Just don't quote me."
      },
      "by_water": {
        "any": [
          "Lovely bit of water, mate. I swam across one like it with a turtle on my back. Its idea.",
          "Look at my reflection in that. Even the water wants a copy."
        ],
        "lo": "Nice water view. I'd dive in to impress you, but the hair, you understand.",
        "hi": "Me, you and the water, {player}. If I fall in, I meant to. Back me up on that."
      },
      "by_lava": {
        "any": [
          "That's lava, mate, right there, glowing away. I'm admiring it from a sensible distance.",
          "Hot stuff, that. I toasted a sandwich over lava once. Lost the sandwich. And the stick."
        ],
        "lo": "Open lava and a stranger at my elbow. I'll stand over here where it's less exciting.",
        "hi": "Careful near that glow, {player}. I've only got the one best mate and I'm not holding auditions."
      },
      "by_flowers": {
        "any": [
          "Flowers everywhere, mate. A bee followed me through a patch like this for a week. Besotted.",
          "Pretty spot. I'd pick one for my hat, but the flowers look better where they are. Just."
        ],
        "lo": "Standing in the blooms, are we? Fine backdrop. Makes me look taller.",
        "hi": "These colours suit you, {player}. That red one matches your face when I tell a whopper."
      },
      "by_fire": {
        "any": [
          "Nothing like a fire, mate. Perfect for stories. I've got one about a kangaroo and a boat.",
          "Hear that crackle? It's the only thing around here louder than my shirt."
        ],
        "lo": "A campfire and a new face. Fireside rule, the famous one talks first.",
        "hi": "Firelight, {player}, and nowhere to be. This is where I'd tell you the true story. If I had one."
      },
      "by_crops": {
        "any": [
          "Somebody's been farming, mate. Neat rows. I grew a pumpkin once so big I moved into it.",
          "Look at those crops coming up. I'd help, but last time I dug a field it went in a circle."
        ],
        "lo": "Farmland, eh? Not really my scene. Nothing here to wrestle.",
        "hi": "You grew this lot, {player}? Impressive. I can't keep a cactus happy, and they hate everything."
      },
      "by_books": {
        "any": [
          "Shelves of books, mate. I'm writing one myself. It's called Me, and it's mostly pictures.",
          "All these books and none about me yet. Give it time."
        ],
        "lo": "A reader, are you? I prefer animals to pages. Animals laugh in the right spots.",
        "hi": "Bet there's a book in here about crocs, {player}. I'd check my facts, but where's the fun?"
      },
      "in_snow": {
        "any": [
          "Snow, mate! My toes have gone quiet. I built a snow penguin once and it waddled off.",
          "Freezing out here. My breath's making clouds shaped like my head. Look, another one."
        ],
        "lo": "Cold enough for you? I'm from sunnier parts, I'm only shivering for effect.",
        "hi": "{player}, mate, my nose is numb. If it falls off in this snow, I want it back."
      },
      "holding_gift": {
        "any": [
          "Hang on, what's that you've got there? That {item} has caught my eye, mate. Good taste.",
          "Now that's the sort of thing a legend notices. I'm not hinting. I'm just looking. Loudly."
        ],
        "lo": "Nice {item}. Fans carry all sorts, I never ask who it's for. I only wonder.",
        "hi": "{player}, you know exactly what I like, don't you? I'm saying nothing about that {item}. Nothing."
      },
      "holding_weapon": {
        "any": [
          "Whoa, that {item}'s a serious bit of kit, mate. I hope it knows I'm the talent.",
          "You look fierce with that in your hand. I fought a croc with a spoon once. Spoon won."
        ],
        "lo": "Armed, are we? Easy now. I'm much more useful as a friend than a target.",
        "hi": "With you swinging that {item}, {player}, I almost feel safe. Almost. I'll be just behind you."
      },
      "holding_food": {
        "any": [
          "Is that {item}? Smells great, mate. I'm not staring. My stomach's staring.",
          "Lunch in hand, eh? A seagull taught me to spot a snack from across the zoo."
        ],
        "lo": "Eating in front of a celebrity. Brave. I'm on a strict diet of whatever's offered.",
        "hi": "{player}, mate, you've got food and I've got big sad eyes. Just pointing out the facts."
      },
      "holding_rod": {
        "any": [
          "A fishing rod! I caught a fish as long as a boat once. Threw it back, it was a friend.",
          "Going fishing, mate? I talk to the fish while I wait. They prefer it to the hook."
        ],
        "lo": "Fishing rod, eh? I'd show you my technique, but it's mostly standing and looking good.",
        "hi": "You with a rod, {player}, me with a story. Between us the fish won't get a moment's peace."
      },
      "holding_tool": {
        "any": [
          "That {item} means business, mate. I do my best work nearby, cheering.",
          "Hard yakka ahead by the look of it. I dug a hole once so deep I met my own echo."
        ],
        "lo": "Working with your hands, I see. I work with my face, so I'll watch.",
        "hi": "You and that {item}, {player}, always grafting. I'll supervise. I'm very good at pointing."
      },
      "armored": {
        "any": [
          "Full armour, mate! You clank when you walk. I like it, you've got your own theme tune.",
          "Look at you, all plated up like an armadillo. I wore a set once. Too heavy for my hair."
        ],
        "lo": "All that armour just to meet me? Relax, I only bite on camera.",
        "hi": "You look tough in that lot, {player}. I'd knock on your helmet, but I respect you. Slightly."
      },
      "hurt": {
        "any": [
          "Mate, you look like you lost a fight with a cactus. Are you alright? Properly?",
          "Crikey, you're in a bad way. I'm not joking for once. That looks like it stings."
        ],
        "lo": "You're hurt. I barely know you and I'm still worried, so it must look bad.",
        "hi": "{player}, look at the state of you! You've frightened me, mate. No more being brave without me."
      },
      "wet": {
        "any": [
          "You're dripping, mate. Went for a dip, or did the water come and find you?",
          "Soaked through! You look like an otter that's had a long day."
        ],
        "lo": "You're soaking wet. I'd shake your hand, but I've just done my sleeves.",
        "hi": "{player}, you're drenched, mate. Mind the hair when you drip, it can't take a splash. Love you though."
      },
      "sneaking": {
        "any": [
          "Why are you crouching, mate? Are we stalking something? I love stalking something.",
          "I can see you down there, you know. I've got eyes like a hawk. A famous hawk."
        ],
        "lo": "Creeping up on a celebrity is how rumours start. Most fans just wave.",
        "hi": "{player}, are you sneaking up on me? I taught you that. I didn't, but I'm taking credit."
      },
      "long_time": {
        "any": [
          "Well, look who it is! It's been days, mate. I've had to tell my stories to a fence post.",
          "Where've you been? I saved up so many tall tales they've started stacking."
        ],
        "lo": "Oh, you again, after all those days. I didn't notice you were gone. I noticed a bit.",
        "hi": "{player}! Days, mate, days! I told a wombat you'd moved away. It was very upset."
      },
      "first_today": {
        "any": [
          "G'day, mate! First chat of the day and you picked me. Smart start.",
          "There you are! The day hadn't properly started till now. I checked."
        ],
        "lo": "G'day. You're today's first visitor, so you get the full smile. Enjoy it.",
        "hi": "It's a better day already, {player}. G'day, best mate. I've been saving that one up since I woke."
      },
      "zoo_busy": {
        "any": [
          "The place is heaving today, mate! I can hardly swing my arms for guests. I still do.",
          "Packed zoo! Word must've got out that I'd be here. Happens every time."
        ],
        "lo": "Busy day at the gates. You run a popular zoo. I helped, obviously, but well done.",
        "hi": "Look at all these guests, {player}. You built this, mate. I only made it louder."
      },
      "zoo_empty": {
        "any": [
          "Not a single guest, mate. The gates are open and the paths are bare. Eerie, isn't it?",
          "Empty zoo today. I've been giving my tour to a bee. It left halfway."
        ],
        "lo": "No visitors at all. Don't take it personally. I'm taking it personally for both of us.",
        "hi": "Nobody's come today, {player}. Chin up, mate. Their loss, and more animals for you and me."
      },
      "zoo_closed": {
        "any": [
          "Gates shut today, mate. Quiet without guests. The animals keep looking round for the crowd.",
          "Closed, eh? Feels odd. I've been practising my wave on a bin."
        ],
        "lo": "The zoo's closed and you still found me. I'm open all hours, as it turns out.",
        "hi": "Closed zoo, {player}, just you, me and the animals. Honestly? Best audience I've had."
      },
      "litter_bad": {
        "any": [
          "Mate, the paths are a tip. I stepped on a wrapper mid sentence and lost my thread.",
          "All this rubbish lying about is ruining my backgrounds. I can't film around a mountain of it."
        ],
        "lo": "Lot of litter on your paths today. I'd mention it in a video, but I'm being nice.",
        "hi": "{player}, mate, I say this with love, the paths are filthy. The animals are judging. So am I."
      },
      "stars_high": {
        "any": [
          "Top marks for the zoo, mate! All those stars. I'd like to think a few are mine.",
          "A rating like that doesn't come easy. Guests are raving. I heard one cry. Might've been me."
        ],
        "lo": "Your zoo's rated very high, I hear. Good. I only attach my name to quality.",
        "hi": "Look at those stars, {player}! You did that. I'm so proud I nearly stopped talking about me."
      },
      "stars_low": {
        "any": [
          "Rating's a bit grim at the minute, mate. I've seen worse. I can't remember where, but I have.",
          "Hardly a star to its name, the poor zoo. Critics, eh? They gave my hair two once."
        ],
        "lo": "Your zoo's score is rough. I'm still here though, and I'm picky, so that's something.",
        "hi": "Low stars don't scare me, {player}. I believed in this zoo before it was cool. Still do."
      },
      "coins_low": {
        "any": [
          "Word is the coin box is nearly empty, mate. Been there. I once paid for lunch with a story.",
          "Zoo Coins running thin, eh? Fame doesn't pay like you'd think. Ask my pockets."
        ],
        "lo": "Short on Zoo Coins, I hear. Don't look at me, I'm rich in followers only.",
        "hi": "Skint, {player}? Me too, mostly. We'll be broke together, mate, and still the best looking."
      },
      "animal_sick": {
        "any": [
          "One of the animals isn't right today, mate. I've got no joke for that. Poor thing.",
          "There's a crook animal in the zoo and it's bothering me. Hard to be funny when one's hurting."
        ],
        "lo": "One of your animals looks poorly. I know we've just met, but that sort of thing matters to me.",
        "hi": "{player}, mate, one of ours is unwell. I know you care as much as I do. It's all I can think about."
      }
    },
    "near": {
      "carrot": [
        "Carrot's here, mate. A full bunny suit, every day. I respect anyone who commits to a look that hard.",
        "Carrot out-bounces me, {player}. Only person on the street with more energy. I'm working on it."
      ],
      "zach": [
        "That's Zach. Reckons a frog gave him his best chorus. And they say I tell tall tales.",
        "Zach wrote a song about the zoo, {player}. I'm not in it yet. I've asked. Twice."
      ],
      "stevie": [
        "Stevie over there knows real animal facts, mate. Real ones! Very unfair on the rest of us.",
        "Stevie checked my animal stories once, {player}. Three of them didn't survive."
      ]
    }
  },
  "zach": {
    "intro": "Evening, friend. I'm Zach. I'm a singer, I perform at night, and by day I listen to the animals. They write the melodies, I just add the words.",
    "scenes": {
      "home_morning": {
        "any": [
          "You caught me before bed, friend. I sang all night and the kettle's whistling me a lullaby.",
          "Morning at my place means curtains shut. The sparrows outside are far too cheerful about it."
        ],
        "lo": "A knock at this hour? I don't know your rhythm yet. Speak softly, my ears are tired.",
        "hi": "{player}, I kept the last verse of the night to hum for you before I sleep. Here it comes."
      },
      "home_evening": {
        "any": [
          "Evening, and I'm tuning up at home. One string is flat and the cat next door agrees.",
          "Getting ready for tonight, friend. I warm my voice by answering the owl outside my window."
        ],
        "lo": "I'm about to go on, stranger. I hum while I dress, so excuse the noise.",
        "hi": "Perfect timing, {player}. Does this note sound like a frog to you? I'm hoping it does."
      },
      "walking_to_zoo": {
        "any": [
          "On my way to the zoo, friend. My boots on this path go tap, crunch, tap. Good walking tempo.",
          "Stopping here? Fine. I was counting the fence posts as bars of music anyway."
        ],
        "lo": "Heading to the zoo to listen. You may walk along, though I hum and I don't take requests.",
        "hi": "Your footsteps and mine make a decent drum line on this path, {player}. The zoo can wait a bar."
      },
      "at_zoo": {
        "any": [
          "I'm wandering between exhibits with my ears open, friend. Every pen is a different instrument.",
          "Hear how the whole zoo breathes in and out around us? That's the tempo I walk to."
        ],
        "lo": "I come to the exhibits to listen, not to chat. But you've a curious sound about you. Go on.",
        "hi": "{player}, I found a harmony two exhibits back. I waited to tell you first."
      },
      "walking_home": {
        "any": [
          "Heading home with a head full of noise, friend. Good noise. I have to write it down fast.",
          "Done at the zoo. I'm carrying four melodies and I can feel one slipping out of my ear."
        ],
        "lo": "I'm off home. Forgive me, I'm holding a tune and conversation tends to spill it.",
        "hi": "Walk me home, {player}? I'll hum you what I caught today. It's half lion, half fountain."
      },
      "at_work": {
        "any": [
          "I'm mid song, friend. Hold that thought, the crickets just came in early.",
          "Working. Tonight's set is three ballads and one piece that is mostly me being an owl."
        ],
        "lo": "You've walked into a performance, stranger. That's fine. Audiences usually do.",
        "hi": "{player}! This next one has a bridge I wrote thinking of how you laugh."
      },
      "following": {
        "any": [
          "I'm behind you, friend, collecting sounds. That last hill had a lovely wind section.",
          "New ground means new noises. Daylight's harsh on me, but my ears are wide awake."
        ],
        "lo": "I'll come along. I don't know your tempo yet, so forgive me if I trip on your heels.",
        "hi": "Wherever you march, {player}, I'll set it to music. This trip is in a major key so far."
      },
      "following_night": {
        "any": [
          "Night travel, friend. Now I'm awake. Every step sounds bigger in the dark.",
          "Out under the stars with a walking beat. This is when I write my best lines."
        ],
        "lo": "A night walk with a near stranger. Bold of us. The frogs seem to approve.",
        "hi": "This is our hour, {player}. You lead, I hum, and the dark keeps time for us."
      },
      "staying": {
        "any": [
          "Waiting here, friend. I've counted eleven different sounds without moving a foot.",
          "Standing still suits me. This spot has a low hum to it. I think it's the ground."
        ],
        "lo": "You asked me to wait, so I wait. A rest in the music. I can hold one for ages.",
        "hi": "No hurry, {player}. I'm composing something about a friend who always comes back."
      },
      "rain": {
        "any": [
          "This rain is playing every leaf like a tiny drum, friend. Even the puddles keep the beat.",
          "Wet through and I don't mind. Each drop lands on a different note if you tilt your head."
        ],
        "lo": "Raining. You probably hear weather. I hear about four hundred small cymbals.",
        "hi": "I love standing in the rain with you, {player}. It's the only band that never asks for a break."
      },
      "thunder": {
        "any": [
          "That thunder! The biggest drum there is, friend, and nobody's holding the sticks.",
          "I count the gap between the flash and the boom. That silence is the best bar in the storm."
        ],
        "lo": "Loud storm. Some folk flinch. I take notes. That last rumble was a low E, I think.",
        "hi": "{player}, did that crack of thunder shake your chest too? Good. Now we've both felt the bass."
      },
      "full_moon": {
        "any": [
          "Full moon, friend. The wolves will be in fine voice tonight. I plan to join the chorus.",
          "Look at that moon, round as a drum skin. I always sing louder under a full one."
        ],
        "lo": "A full moon makes me odd, I'm told. Odder. I may howl. It isn't personal.",
        "hi": "Howl with me, {player}? No? Then I'll howl your part too, under this big bright moon."
      },
      "dark_moon": {
        "any": [
          "No moon tonight, friend. When my eyes have nothing to do, my ears get twice as greedy.",
          "A black sky, new moon. Every little rustle out there sounds like a solo."
        ],
        "lo": "Darkest night of the month. I can't see your face, stranger, but your breathing is in tune.",
        "hi": "Moonless and quiet, {player}. I'd know you were beside me by your footsteps alone."
      },
      "dawn": {
        "any": [
          "Sunrise. The birds are starting their set just as I finish mine, friend. Shift change.",
          "First light always catches me yawning. The dawn chorus is lovely and far too early."
        ],
        "lo": "Dawn already. This is my bedtime, stranger, so if I nod off, it's the hour, not you.",
        "hi": "We made it to sunrise, {player}. I sang the night out. You can have the day, I'm for bed."
      },
      "dusk": {
        "any": [
          "Sunset, friend, and the frogs are clearing their throats. So am I.",
          "There goes the sun. The day birds bow out, the night crowd tunes up. My favourite handover."
        ],
        "lo": "The light is going. That's when I begin to make sense, or so people say.",
        "hi": "Sundown, {player}. The sky turns the colour of a slow song and I get to sing it to a friend."
      },
      "nether": {
        "any": [
          "This heat hums, friend. The lava pops like a slow drum and something out there wails in tune.",
          "Strange place. Even the red rock crackles underfoot. Rough percussion, but I can use it."
        ],
        "lo": "You've brought me somewhere that roars and burns. I don't know you well enough to enjoy it yet.",
        "hi": "{player}, that crying across the lava is the saddest high note I've ever heard. I want to answer it."
      },
      "the_end": {
        "any": [
          "So quiet here, friend. No wind, no birds. Just that black sky and my own heartbeat.",
          "Those tall dark ones make a sound like a song played backwards. I can't stop listening."
        ],
        "lo": "An empty sky and pale stone. I'm unsure of this place, and of you. I'll hum to steady us.",
        "hi": "The silence over this void frightens me a little, {player}. I need your voice in it."
      },
      "fishing_sky": {
        "any": [
          "Islands in the sky, friend! The wind up here whistles through the gaps like a flute.",
          "A pool above the clouds. The water plinks when a fish rises. Highest note I've heard today."
        ],
        "lo": "Floating land and fishing pools. I'm one with nature, though nature never mentioned this part.",
        "hi": "If you fish these sky pools, {player}, I'll sing to the water. It never helps, but we both enjoy it."
      },
      "acufend": {
        "any": [
          "A moon that loves music, friend! The creatures here sway when I hum. I may never leave.",
          "This jungle village has a rhythm in the vines. Even the odd little locals tap along."
        ],
        "lo": "Finally, a place with taste. I barely know you, but bringing me to this moon was a fine opening note.",
        "hi": "{player}, they're dancing to my song on this funny round moon. Best crowd I've had, after you."
      },
      "cave": {
        "any": [
          "Drip, drip, pause. This cave has kept that beat since long before either of us, friend.",
          "The echo down here sings back a moment late. I've been doing rounds with myself."
        ],
        "lo": "Deep stone and a stranger with a torch. Mind if I hum? Caves flatter a voice.",
        "hi": "{player}, every sound you make rings off these cave walls like a bell. I've been harmonising."
      },
      "high_up": {
        "any": [
          "So high, friend. The wind is one long held note up here and I'm breathing in time with it.",
          "From this height the world goes quiet. All I hear is air and my knees knocking in rhythm."
        ],
        "lo": "A long drop. I'm one with nature, but I'd prefer not to be one with the ground below.",
        "hi": "I sang your name off this ledge, {player}. The valley sent it back twice. Lovely echo."
      },
      "hostile_near": {
        "any": [
          "Something nearby is groaning off key, friend. That's no animal I'd write a song for.",
          "That rattle and shuffle close by? Monsters keep terrible time. It sets my teeth on edge."
        ],
        "lo": "There's a nasty sound close by. I'm a singer, not a fighter. I'll stand behind your rhythm.",
        "hi": "{player}, trouble's close, I heard its feet before you did. I'm right at your shoulder."
      },
      "creeper_near": {
        "any": [
          "That hiss, friend. A creeper, close. Worst opening note in all of nature.",
          "A creeper is walking up on those quiet little feet. No rhythm at all. I don't trust it."
        ],
        "lo": "Creeper, just there. If it starts to hiss, stranger, that's a song that ends very suddenly.",
        "hi": "{player}, creeper, right by you! I've never liked a tune that builds to a bang."
      },
      "villager_near": {
        "any": [
          "Villagers, friend. A whole village humming one note. I admire the commitment.",
          "I tried to teach these villagers a second note once. They looked at me and gave me the first again."
        ],
        "lo": "A village. They mumble, I hum. You'd think we'd get along better than we do.",
        "hi": "{player}, the villagers and I worked out a harmony earlier. I go high, they go hrmm."
      },
      "pet_near": {
        "any": [
          "Your pet has a fine voice, friend. I heard it just now. Short notes, lots of feeling.",
          "That little companion of yours pads along in perfect four time. A natural."
        ],
        "lo": "Your animal is studying me. Good ears on that one. It knows a fellow listener.",
        "hi": "{player}, your pet and I sang together while you weren't looking. It carried the tune."
      },
      "farm_animal_near": {
        "any": [
          "A cow just held a note longer than I can, friend. I'm humbled, right here in a field.",
          "Sheep on the left, chickens on the right. They answer each other if you wait."
        ],
        "lo": "Ordinary farm beasts to you, perhaps. To me that pig is a tuba with legs.",
        "hi": "{player}, that hen keeps clucking on the off beat. She's got more swing than I do."
      },
      "zoo_animal_near": {
        "any": [
          "Hush a moment, friend. The {species} is about to make a sound and I want to catch the pitch.",
          "That {species} breathes in three time. In, hold, out. I could waltz to it."
        ],
        "lo": "You see a {species}. I hear the opening bars of something. We haven't the same ears yet.",
        "hi": "{player}, I've been writing a duet for me and the {species}. It hasn't agreed, but it hasn't left."
      },
      "guests_crowd": {
        "any": [
          "So many guests, friend. Hundreds of feet on the path, and none of them in step.",
          "The crowd around us chatters like a flock landing. Loud, messy, alive. I rather like it."
        ],
        "lo": "A lot of people here. Forgive me if I drift off, I'm sorting their voices into sections.",
        "hi": "In all this crowd noise, {player}, I picked out your voice at once. It's the one in tune."
      },
      "residents_crowd": {
        "any": [
          "The neighbours are all here, friend. Put together they sound like a band that never practised.",
          "So many familiar voices in one spot. I could conduct this street if they'd let me."
        ],
        "lo": "You've met the street, I see. Every one of them has a sound. I'm still learning yours.",
        "hi": "All our neighbours gathered, {player}, and I still hear you first. Lead vocals, that's you."
      },
      "other_resident": {
        "any": [
          "That's {other} beside us, friend. A voice I know well. It sits nicely in the middle range.",
          "I can always tell when {other} is near. The footsteps give it away, a very particular beat."
        ],
        "lo": "You know {other}? Good ear for company, then. I've known that voice a while.",
        "hi": "{player}, between us, I once put {other} in a verse. Kindly. Mostly kindly."
      },
      "other_player": {
        "any": [
          "A second traveller. {other}, is it? A new voice in the mix, friend. I'm listening.",
          "{other} walks heavier than you do. Two rhythms at once. That's what we call a groove."
        ],
        "lo": "Two of you now. I don't know {other}'s key either. Give me a minute to tune my ears.",
        "hi": "{other} sounds like good company, {player}. Still, yours is the tune I know by heart."
      },
      "alone_night": {
        "any": [
          "Just the two of us and the night, friend. No audience. I sing better this way.",
          "Nobody about. It's so still I can hear the grass move."
        ],
        "lo": "Alone in the dark with someone I hardly know. Odd. The crickets don't seem worried.",
        "hi": "No one else out here, {player}. There's a song I never perform, too quiet for crowds. It suits tonight."
      },
      "by_water": {
        "any": [
          "Hear the water lapping, friend? Slow and steady. The oldest lullaby I know.",
          "I sit by water like this to write. It never rushes a verse."
        ],
        "lo": "Water. It sings to everyone the same, stranger or not. I envy that.",
        "hi": "{player}, I skipped a stone across here before you came. Four notes, then a splash."
      },
      "by_lava": {
        "any": [
          "Lava pops and gurgles like a pot of thick soup, friend. Slow rhythm. I'm keeping my distance.",
          "That glow hums. I'd lean in to hear it better, but I'm fond of my eyebrows."
        ],
        "lo": "Open lava. I'm passionate, stranger, not foolish. I'll listen to it from back here.",
        "hi": "You're too near that lava for my nerves, {player}. I've no wish to write a sad song about you."
      },
      "by_flowers": {
        "any": [
          "Flowers, friend, and bees in every one. That drone underneath is a perfect low note.",
          "I'm standing in the blossoms, listening. Petals make no sound, but everything visiting them does."
        ],
        "lo": "You like the flowers? I like what comes to them. Bees are the finest string players.",
        "hi": "{player}, I'd weave you a crown of these flowers, but my hands only know chords."
      },
      "by_fire": {
        "any": [
          "A fire crackles in no pattern at all, friend. I've tried to count it. It won't be counted.",
          "Songs were born beside fires like this one. Pop, hiss, snap. I'm only carrying on the habit."
        ],
        "lo": "A fire and a stranger. That's how most of my best audiences started.",
        "hi": "The fire's warm, {player}, you're here, and the sparks are clapping. I'll sing the slow one."
      },
      "by_crops": {
        "any": [
          "Wheat in the wind, friend. A soft hush, like a crowd settling before the first song.",
          "Farmland. Things grow here too slowly to hear, but I swear the soil is humming."
        ],
        "lo": "Crops in tidy rows, like lines on a page waiting for notes. Is this your work?",
        "hi": "{player}, you grow food and I grow songs. Yours are more useful. Mine are louder."
      },
      "by_books": {
        "any": [
          "Books, friend. Silent things. I open one and try to hear how the writer talked.",
          "Shelves and shelves. The pages rustle like dry leaves when I turn them. That's the part I like."
        ],
        "lo": "A library corner. I read a little, stranger. Mostly poems, and mostly aloud.",
        "hi": "{player}, somewhere on these shelves there must be a book of old songs. I'd sing you every page."
      },
      "in_snow": {
        "any": [
          "Snow swallows sound, friend. Everything's gone soft, like a blanket thrown over the drum.",
          "Crunch, crunch. Fresh snow gives the best footstep there is. I've been walking in circles for it."
        ],
        "lo": "Cold out. My voice cracks in this snow, so if I squeak, that's the weather.",
        "hi": "{player}, my fingers are too frozen to play, so I'll just hum beside you in this snow."
      },
      "holding_gift": {
        "any": [
          "Oh, what's that in your hand, friend? That {item} is singing to me already.",
          "My ear twitched. You're carrying something with a tune in it, I can tell."
        ],
        "lo": "That's a fine {item} you have. I wasn't staring. I was listening to it.",
        "hi": "{player}, that {item}. You know me too well. I'll say no more, I'll only hum hopefully."
      },
      "holding_weapon": {
        "any": [
          "That {item} makes an ugly sound when it swings, friend. Sharp and short. I never liked it.",
          "Armed, I see. I've only got a voice to fight with. It has scared off a goat or two."
        ],
        "lo": "A weapon in a stranger's hand. Forgive me if my hum goes a little higher.",
        "hi": "I trust you with that {item}, {player}. I'd just rather hear it stay quiet."
      },
      "holding_food": {
        "any": [
          "Is that {item}? My stomach just growled a low note, friend. Pardon the bass.",
          "Food in hand. The sound of a good crunch is underrated in music, I say."
        ],
        "lo": "You're eating. Don't mind me, I sing on an empty stomach. It keeps the high notes hungry.",
        "hi": "{player}, your {item} smells like the break between sets. My favourite part of any night."
      },
      "holding_rod": {
        "any": [
          "A fishing rod, friend. The whir of the line going out is one of my favourite sounds.",
          "Fishing is mostly listening. Plop, wait, wait, splash. You'd make a fine percussionist."
        ],
        "lo": "You fish? Then you know how to be quiet. I respect that in a stranger.",
        "hi": "{player}, with that rod you'll sit still for hours. Good. I've got hours of new songs."
      },
      "holding_tool": {
        "any": [
          "That {item} has a good ring to it, friend. Metal on stone is a proper work song.",
          "Tool in hand. Clink, scrape, thud. I could build a chorus on a hard day's work."
        ],
        "lo": "A working stranger. Honest noise, that. I only ever lift a tune.",
        "hi": "{player}, when you swing that {item} I tap along. You keep steadier time than my last drummer."
      },
      "armored": {
        "any": [
          "You clank when you move, friend. All that armour is a walking set of cymbals.",
          "Full armour. Every step you take goes chink, chink. Catchy, I'll admit."
        ],
        "lo": "A stranger in plate from head to toe. You sound dangerous. Literally, you jingle.",
        "hi": "{player}, I heard you coming from across the field in all that metal. I'm glad you wear it."
      },
      "hurt": {
        "any": [
          "Friend, your breathing's ragged. I can hear it. You're badly hurt, aren't you?",
          "You sound wrong. Your steps are dragging. Something got you, and I don't like it."
        ],
        "lo": "I hardly know you, but that's a hurt sound if I ever heard one. Are you alright?",
        "hi": "{player}, your voice is thin and you can barely stand. You're frightening me, friend."
      },
      "wet": {
        "any": [
          "You're squelching, friend. Squish, squish. Soaked to the boots and still on the beat.",
          "Dripping wet. Each drop off your sleeve lands with a tiny tick. I counted nine."
        ],
        "lo": "You're drenched, stranger. Did you fall in, or did you go looking for the fish song?",
        "hi": "{player}, you're soaked through. You drip in rhythm though. Even your accidents are musical."
      },
      "sneaking": {
        "any": [
          "Why so low, friend? Are we creeping up on a sound? I'll whisper.",
          "You're crouching. Quiet feet. A hunter's rest, as I call it. What are we listening for?"
        ],
        "lo": "A stranger sneaking toward me. I heard you anyway. Nobody is quiet enough for these ears.",
        "hi": "{player}, I can hear you tiptoeing. You breathe through your nose when you sneak. It whistles."
      },
      "long_time": {
        "any": [
          "Friend! Days and days without your voice. The song I was writing stalled at the second verse.",
          "There's a sound I'd missed. Where have you been? Even the frogs asked."
        ],
        "lo": "You've been away several days. I'd nearly forgotten your tone. It's coming back to me now.",
        "hi": "{player}, it's been too many days. My songs went flat without you. I'm not exaggerating. Much."
      },
      "first_today": {
        "any": [
          "Hello, friend. First voice I've spoken to today that wasn't a bird. You compare well.",
          "Ah, there you are. Good. Now the day has its opening note."
        ],
        "lo": "Hello. We haven't spoken yet today. Or much at all, really. I'm listening.",
        "hi": "{player}! I heard your step and knew my day had started. Hello, friend."
      },
      "zoo_busy": {
        "any": [
          "The zoo is roaring today, friend, and I mean the guests. So many voices at once.",
          "Packed paths. All that chatter rolls around the exhibits like surf. Wonderful and exhausting."
        ],
        "lo": "Busy day for your zoo. Too many sounds to sort. I'm standing still till they settle.",
        "hi": "{player}, hear that crowd? That's your zoo singing. You wrote that, in a way."
      },
      "zoo_empty": {
        "any": [
          "Not a guest in the place, friend. Without the crowd I can hear every animal clear as a bell.",
          "An open zoo with nobody in it. It's like a stage before the doors open."
        ],
        "lo": "No visitors today. Sad for you, perhaps. For a listener, I admit, it's rather nice.",
        "hi": "Empty paths, {player}, but don't lose heart. Today the animals are singing for you and me alone."
      },
      "zoo_closed": {
        "any": [
          "The gates are shut, friend. The zoo sounds different with no guests. Slower, deeper.",
          "Closed. The animals know it, too. They've dropped to their resting voices."
        ],
        "lo": "Your zoo's closed to guests. I wandered in for the quiet. I hope that's allowed.",
        "hi": "{player}, a closed zoo is my favourite concert. Thank you for letting me hear it."
      },
      "litter_bad": {
        "any": [
          "Rubbish all over the paths, friend. It crunches underfoot in the wrong places. Ruins the walk.",
          "A wrapper blew past rattling like a cheap tambourine. There's far too much litter about."
        ],
        "lo": "Your paths are covered in litter. I'm one with nature, and nature is wincing.",
        "hi": "{player}, I say this as your friend, the litter on these paths is drowning out the birds for me."
      },
      "stars_high": {
        "any": [
          "I hear the zoo has a glowing rating, friend. All those stars. It sounds like it, too.",
          "A top rated zoo. You can hear quality. The guests laugh on the way out."
        ],
        "lo": "Your zoo is very highly rated, they say. My ears agree, for what a stranger's ears are worth.",
        "hi": "{player}, all those stars over your gates! I wrote a fanfare. It's eleven minutes long."
      },
      "stars_low": {
        "any": [
          "The rating's low, friend, I heard guests grumbling. Still, every good song starts rough.",
          "Barely a star, they tell me. Critics have never understood a slow build."
        ],
        "lo": "Your zoo isn't rated well just now. I only judge by ear, and I hear promise.",
        "hi": "{player}, forget the poor rating for a breath. I've bombed on stage and sung again. So will this zoo."
      },
      "coins_low": {
        "any": [
          "The Zoo Coins have nearly run out, I hear, friend. An empty purse makes a very hollow jingle.",
          "Low on coins. I know that tune. I once sang a whole season for soup."
        ],
        "lo": "They say the zoo's coffers are almost bare. I'm sorry. I've little but songs myself.",
        "hi": "{player}, broke is a verse, not the whole song. I've been there. I'm here with you in it."
      },
      "animal_sick": {
        "any": [
          "One of the animals sounds wrong today, friend. Its call is weak. I heard it at once.",
          "There's a voice missing from the zoo's chorus. Something in there is unwell."
        ],
        "lo": "An animal here is suffering. Even a stranger should hear that. It's a thin, sad note.",
        "hi": "{player}, one of them is poorly and I can't write a thing until it's better. It hurts to hear."
      }
    },
    "near": {
      "jared": [
        "Jared's the other singer in town, friend. Cool as a cellar. I sweat through a ballad, he never blinks.",
        "Jared and I tried a duet once, {player}. He kept time. I kept changing it. We're still friends."
      ],
      "ron": [
        "Ron there knows every bird by its call. He names them, I harmonise. We could talk till sunrise.",
        "I asked Ron which bird sings best, {player}. He said the rooster. I think he was teasing me."
      ],
      "austin": [
        "Austin says he taught a parrot my songs, friend. I'd love that to be true. It isn't.",
        "{player}, Austin is the loudest creature in the zoo. I mean it warmly. I've written him as a trumpet."
      ]
    }
  },
  "sheila": {
    "intro": "Hello, dear, I'm Sheila! I'm retired, which means I bake, I visit the cats at the zoo, and I talk to anyone who stands still. You're standing still, so that's lovely.",
    "scenes": {
      "home_morning": {
        "any": [
          "You've caught me in my apron, dear! The scones are just out. I got up early so they'd be warm for callers.",
          "Morning, dear, mind the mat. I was telling the teapot my plans for the day. It's a good listener."
        ],
        "lo": "Oh, a caller at my door this early! I don't know you well yet, dear, but anybody is welcome in my kitchen.",
        "hi": "I laid a second plate this morning, {player}, dear. I had a feeling you'd come knocking."
      },
      "home_evening": {
        "any": [
          "Slippers on, cocoa poured, dear. I'm doing my knitting and telling the wool about my day.",
          "Evening, dear! I was dozing in my chair. Don't tell anyone, I'll say I was resting my eyes."
        ],
        "lo": "A visitor after supper! I don't usually have new people in so late, but I do hate an empty house.",
        "hi": "Oh, {player}, I hoped you'd pop in tonight. The house is too quiet of an evening without my husband."
      },
      "walking_to_zoo": {
        "any": [
          "I'm on my way to the zoo, dear, slowly. I set off after breakfast and I'll be there by lunch, at this rate.",
          "Just catching my breath on the path. These legs do the walking, but my mouth does the hard work."
        ],
        "lo": "Going my way, dear? I walk slowly, I warn you, but you'd hear my whole life story before the gates.",
        "hi": "You're the only one who never rushes me on this path, {player}. And I've so much to tell before the zoo."
      },
      "at_zoo": {
        "any": [
          "I'm having a lovely wander, dear. I've said hello to every keeper and most of the animals.",
          "I do like a stroll round the exhibits. I'm working my way to the cats, I save the best till last."
        ],
        "lo": "Are you visiting too, dear? I know which benches are comfy and where the nice shade is. Ask me anything.",
        "hi": "{player}, there you are! I've seen such things at the exhibits today, I've been bursting to tell you."
      },
      "walking_home": {
        "any": [
          "Homeward, dear, and my feet know it. I've earned a sit down and a biscuit. Two biscuits.",
          "I'm heading back for my tea. I talked so much at the zoo that a keeper offered me a chair."
        ],
        "lo": "Off home now, dear. It was nice to see you. I'd tell you about my day, but it would take till dark.",
        "hi": "See me to my gate, {player}? I walk slower in the evenings and I do like the company."
      },
      "at_work": {
        "any": [
          "Work, dear? I'm retired! Though I've a cake to ice and three people to call on, so I'm run off my feet.",
          "I'm busy being retired, dear. Somebody has to keep the whole street up to date on everything."
        ],
        "lo": "I'm in the middle of my rounds, dear. Retired ladies have rounds. It's mostly chatting, but it's organised.",
        "hi": "{player}, I never worked this hard when I had a job. Baking for you alone is a full day."
      },
      "following": {
        "any": [
          "I'm coming, dear, I'm coming! An adventure at my age. Wait till my sister hears.",
          "Such a long way from my kitchen! I've counted every hill, dear, and my knees have named them."
        ],
        "lo": "I hope you know where we're going, dear. I've only just met you and I've left a pie cooling.",
        "hi": "I'd follow you anywhere, {player}, just not quickly. Shall I tell you a joke while we walk?"
      },
      "following_night": {
        "any": [
          "Out in the dark, dear, so far from home! Was that a bat? Tell me that wasn't a bat.",
          "I can't see my own feet. I'll keep talking so you know I'm still behind you, dear."
        ],
        "lo": "A night walk with somebody I hardly know. My mother would have had words, dear.",
        "hi": "It's black as a burnt pie out here, {player}. I've got your arm, I trust you more than my eyes."
      },
      "staying": {
        "any": [
          "I'm waiting right where you put me, dear. I've started telling this spot about my hip.",
          "Standing about with nobody to talk to! It's far too quiet. I've been humming to fill it."
        ],
        "lo": "You've left me here, dear, and I've no one to chat to. I do hope you're the returning sort.",
        "hi": "I'll wait for you, {player}, I always will. Only the silence gets into my ears after a while."
      },
      "rain": {
        "any": [
          "It's coming down in buckets, dear! My hair will frizz. It always frizzed, even when I was a girl.",
          "Listen to it drumming. Rain like this means soup, dear. I don't make the rules."
        ],
        "lo": "You're out in this wet with no hat, dear? I'd say that to anyone, but somebody should have told you.",
        "hi": "There's room under here for two, {player}. If you caught a chill in this rain, who'd eat my stew?"
      },
      "thunder": {
        "any": [
          "Goodness, that thunder rattled my teeth, dear, and they're my good ones.",
          "What a bang! My late husband slept through storms like this. I had to describe them to him after."
        ],
        "lo": "A proper storm, dear. I'm not frightened, I'm only talking faster. I do that.",
        "hi": "Oh, {player}, that clap made me jump. I'm braver in a storm with you here, I'll admit it."
      },
      "full_moon": {
        "any": [
          "What a big bright moon, dear! You could read a recipe by it.",
          "A full moon. The cats will be out singing on every fence tonight, bless them."
        ],
        "lo": "Lovely moon, isn't it, dear? I'd normally be asleep. I blame you, nicely.",
        "hi": "My husband proposed under a moon like that, {player}. Then he talked about fishing for an hour."
      },
      "dark_moon": {
        "any": [
          "No moon at all, dear, I can't see a thing. That's when the bats come. I can feel them thinking about it.",
          "Pitch black tonight. I'll keep chattering, it stops the dark from getting ideas."
        ],
        "lo": "It's very dark to be out with a new acquaintance, dear. I'm glad you've a kind voice, at least.",
        "hi": "I don't like a night this black, {player}. I've got hold of your sleeve and I'm not letting go."
      },
      "dawn": {
        "any": [
          "Sunrise, dear! I've seen thousands and I still say ooh. The first loaf is already rising.",
          "Up with the sun, like the hens I grew up with. They were bossier about it."
        ],
        "lo": "An early bird, are you, dear? Good. I can't abide people who waste a sunrise.",
        "hi": "Look at that dawn sky, {player}. Pink as a ham. I'm glad I've someone to say that to."
      },
      "dusk": {
        "any": [
          "There goes the sun, dear. Supper time. My stomach has kept better time than any clock, all my life.",
          "A pretty sunset. The sky's gone the colour of my plum jam."
        ],
        "lo": "The sun's nearly down, dear. I don't usually dawdle at dusk with people I've just met.",
        "hi": "Sun's setting on another day, {player}, and I spent a bit of it with you. That's a good one in my book."
      },
      "nether": {
        "any": [
          "Good heavens, it's like standing in my oven, dear! And who left all this lava about?",
          "Everything down here is red and grumbling. It reminds me of my neighbour's kitchen."
        ],
        "lo": "I don't know you well enough to be brought somewhere this hot, dear. My cardigan is wilting.",
        "hi": "{player}, only for you would I stand in this furnace. I shan't need to light my oven for a week."
      },
      "the_end": {
        "any": [
          "There's no ground past that edge, dear, just nothing! And not a bench in sight.",
          "Those tall dark fellows won't even say hello. No manners, and it's far too quiet here."
        ],
        "lo": "What a gloomy black sky to bring an old lady under, dear. I've only just learned your name.",
        "hi": "I don't care for this empty sky, {player}. But I'm with you, so I'll just talk until it feels like home."
      },
      "fishing_sky": {
        "any": [
          "Islands in the sky, dear! I've never been this high without a ladder and a reason.",
          "Fishing pools up in the clouds. My husband would have moved here and never come down."
        ],
        "lo": "It's a long way down from these islands, dear, and I don't know you well. I'll stay in the middle.",
        "hi": "{player}, fish from a pool in the clouds! My sister will never believe me. I'll tell her anyway."
      },
      "acufend": {
        "any": [
          "A round little moon with a jungle on it, dear, and creatures that love a tune. I sang them my washing-up song.",
          "What funny little locals! They dance to anything. I've been telling them jokes, they bob politely."
        ],
        "lo": "I've never been anywhere so peculiar as this moon, dear, and with someone I've barely met!",
        "hi": "{player}, these music-mad creatures hummed along with me! Nobody at home ever does that. Except you."
      },
      "cave": {
        "any": [
          "It's damp down here, dear, and my voice echoes. Listen. Hello! Oh, I do like that.",
          "A cave! There'll be bats, dear, I know it. I'm keeping my hands over my hair."
        ],
        "lo": "You've led me underground, dear, and we've barely been introduced. I do hope you've good sense.",
        "hi": "I can hear something flapping in this cave, {player}. If it's a bat, I'm standing behind you."
      },
      "high_up": {
        "any": [
          "Oh my, look how small everything is, dear! That speck might be my house. Or a sheep.",
          "My knees didn't want to climb this, dear, but what a view. I can see for miles and miles."
        ],
        "lo": "This is very high for a first outing, dear. I'll stand well back and admire it from here.",
        "hi": "You're too near that drop, {player}! I've grown ever so fond of you, I'd have to climb down after you."
      },
      "hostile_near": {
        "any": [
          "There's a horrid thing shuffling about just there, dear! It hasn't washed, I can tell from here.",
          "A monster, and so close! In my day they kept to themselves. Well, they didn't, but still."
        ],
        "lo": "Something nasty's about, dear. I can't run, so I'll have to talk it to death.",
        "hi": "{player}, there's a beast right there! Be careful, dear, I've only just got you how I like you."
      },
      "creeper_near": {
        "any": [
          "That green creeper is sneaking up on us, dear, and it hasn't said a word. I can't bear a quiet one.",
          "A creeper, right there! Such a sour face. Nobody ever baked that poor thing a cake."
        ],
        "lo": "Dear, there's a creeper coming this way. I'd shoo it with my bag, but it's my good bag.",
        "hi": "Creeper, {player}, creeper! Oh, I couldn't stand it if you went pop, dear, I've grown so used to you."
      },
      "villager_near": {
        "any": [
          "Villagers, dear! I've tried chatting to them. Hrmm, they say. Hrmm! I do all the work.",
          "A village. That one in the apron has a kind nose. I told him my scone joke, he nearly smiled."
        ],
        "lo": "These villagers don't say much, dear. You don't either yet, but I've high hopes for you.",
        "hi": "{player}, I asked a villager if he'd eaten and he only grunted. You always give me a proper answer."
      },
      "pet_near": {
        "any": [
          "Oh, who's this little darling beside you? Look at that face, dear! I could spoil it rotten.",
          "What a well-behaved pet. Does it get enough to eat, dear? It's giving me the hungry eyes."
        ],
        "lo": "Is this one yours, dear? You can tell a lot about a person from how their animal looks at them.",
        "hi": "{player}, your pet came straight to me! It knows who the soft touch is, the clever thing."
      },
      "farm_animal_near": {
        "any": [
          "Hens, dear! That brown one walks exactly like my sister. Same wobble, same opinions.",
          "Proper farm animals. That cow's got lovely eyelashes. I always wanted lashes like that."
        ],
        "lo": "Do you keep animals yourself, dear? I only ask because that pig is looking at you like it knows you.",
        "hi": "{player}, the sheep over there has your patient face. It's a compliment, dear, I love a patient face."
      },
      "zoo_animal_near": {
        "any": [
          "Look at the {species}, dear, isn't it something? I've been telling it about my week, it's hardly blinked.",
          "That {species} has a look of my cousin about it. Around the ears. I shan't say which cousin."
        ],
        "lo": "Have you met the {species}, dear? I come and chat to it most days. It's a better listener than most.",
        "hi": "{player}, I told the {species} you're the one who looks after everybody here. It seemed pleased."
      },
      "guests_crowd": {
        "any": [
          "So many people, dear! I've spoken to a dozen already and not repeated a single story. Well, one.",
          "What a crowd! Somebody's child has my bench, but he looked tired, so I let him."
        ],
        "lo": "Busy, isn't it, dear? I like a crowd. More ears. You'll have to share me, I'm afraid.",
        "hi": "All these guests to talk to, {player}, and here I am picking you. That's how you know."
      },
      "residents_crowd": {
        "any": [
          "Everybody's here, dear, the whole street! I don't know who to talk to first, so I'm doing all at once.",
          "All the neighbours together. It's like a party with no cake. I should have brought cake."
        ],
        "lo": "All my neighbours at once, dear, and you so new. I can tell you which ones can take a joke.",
        "hi": "A whole street of friends, {player}, and you standing right by me. My cup's full, dear."
      },
      "other_resident": {
        "any": [
          "Oh, and there's {other}! I was just saying, dear, {other} never finishes a slice of my cake. Too polite.",
          "Have you said hello to {other}, dear? Lovely neighbour. Lets me talk, which is all I ask."
        ],
        "lo": "That's {other}, dear. I'd introduce you properly, but I'm still getting to know you myself.",
        "hi": "{player}, I told {other} you're my favourite. Right to their face. At my age you can."
      },
      "other_player": {
        "any": [
          "Oh, another one! {other}, is it? Hello, dear! Have you both eaten? Neither of you looks like you have.",
          "Two adventurers at once. {other} has a nice smile. I've jokes enough for the pair of you."
        ],
        "lo": "And this is {other}? I'm only just learning one of you, dear, and now there's two faces to remember.",
        "hi": "{other} seems lovely, {player}, but you're still the one I do my knitting for."
      },
      "alone_night": {
        "any": [
          "It's only us out here, dear, and it's ever so quiet. I'll just keep talking, shall I?",
          "Nobody about at all. I don't like a silent night, dear, it makes my ears ring."
        ],
        "lo": "Just the two of us and the dark, dear. I don't know you well, but you're better than no one.",
        "hi": "I'm glad it's you with me tonight, {player}. I miss having someone to talk to once it's dark."
      },
      "by_water": {
        "any": [
          "Lovely bit of water, dear. My husband fished a spot like this for years. Caught a boot once.",
          "I do like watching the ripples. I'd dip my feet, dear, but I'd never get my stockings back on."
        ],
        "lo": "I'll keep back from the water's edge, dear. I can't swim, and I don't know yet if you'd jump in after me.",
        "hi": "By the water is where I tell the stories I don't tell just anyone, {player}. I've a few saved for you."
      },
      "by_lava": {
        "any": [
          "That's lava, dear, right there! Hotter than my griddle and twice as cross. I'm staying well back.",
          "Look at it bubbling. I once left jam on the stove too long and it looked just like that."
        ],
        "lo": "I wouldn't stand near that lava with my oldest friend, dear, never mind a new one.",
        "hi": "{player}, my heart's in my mouth with you so near that lava. I do worry about the ones I'm fond of."
      },
      "by_flowers": {
        "any": [
          "Flowers, dear, aren't they lovely? But there'll be bees, and bees are insects. I'm keeping my elbows in.",
          "I had tulips like these by my first front door. My husband trod on them. Once."
        ],
        "lo": "Pretty, aren't they, dear? Do you know your flowers? I could talk you through every one, I've time.",
        "hi": "{player}, that yellow one's the colour of my best custard. I'd pick you a bunch if my back bent."
      },
      "by_fire": {
        "any": [
          "A fire, dear! Lovely. I can toast my toes. My stories are better by a fire, everyone says so.",
          "I singed a cardigan at a fire like this once, telling a joke with my arms. Worth it, dear."
        ],
        "lo": "A fire is warm for everybody, dear. Nobody stays a stranger at a fireside, not with me about.",
        "hi": "Fires make me soppy, {player}. I think of everyone I've cooked for, and you're on the list now."
      },
      "by_crops": {
        "any": [
          "Somebody's growing things, dear. Good soil, that. I can already see the pie this will be.",
          "Look at those rows! My mother had a vegetable patch. I was meant to weed it. I talked to it instead."
        ],
        "lo": "Is this your farming, dear? I always say you can know a person by their vegetables.",
        "hi": "{player}, you've green fingers, dear. My husband only ever grew weeds, and he was proud of those."
      },
      "by_books": {
        "any": [
          "Books, dear, hundreds. I never got on with school, but I like a story if somebody reads it to me.",
          "All these shelves. I've a recipe book at home that's more gravy stains than pages."
        ],
        "lo": "Are you a reader, dear? I'm a talker. Somebody has to say things so others can write them down.",
        "hi": "{player}, between us and these bookshelves, I skipped school to feed the ducks. I learned more from the ducks."
      },
      "in_snow": {
        "any": [
          "Snow, dear! It's gone right into my boots. I knew I should have worn the thick stockings.",
          "Brr! When I was small we slid down hills on a tea tray. I'd do it now if I could get back up."
        ],
        "lo": "You're not dressed for snow, dear. I say that to everyone, but with you I mean it.",
        "hi": "{player}, your nose is red as a berry in this snow. I've a mind to wrap my scarf round you twice."
      },
      "holding_gift": {
        "any": [
          "Ooh, is that {item} I see, dear? Doesn't that look nice. I'm only looking. I've got eyes, haven't I?",
          "What have you got there? My nose knew before my eyes did. It smells like a happy afternoon."
        ],
        "lo": "That's a fine {item}, dear. I'd never ask, we've only just met. I'm simply admiring it very hard.",
        "hi": "{player}, you carry my favourite things about just to tease me, don't you? Look at that {item}!"
      },
      "holding_weapon": {
        "any": [
          "Goodness, that {item} looks dangerous, dear! You'll have somebody's eye out. Probably mine.",
          "A weapon, dear? My husband had a sword once. He hung his hat on it."
        ],
        "lo": "I don't chat easily with people holding weapons, dear. I manage, but I talk faster.",
        "hi": "I know you need that {item} out there, {player}. I just worry. I worry about you by the hour."
      },
      "holding_food": {
        "any": [
          "Is that {item}, dear? Good! You're eating. Is it enough, though? It doesn't look like enough.",
          "Oh, you've got something to eat. I always say a person holding food is a person with sense."
        ],
        "lo": "Lunch in hand, dear? I'd have made you something nicer, but we've hardly met.",
        "hi": "{player}, that {item} wants a bit of gravy. Everything does. I've told you that, haven't I?"
      },
      "holding_rod": {
        "any": [
          "A fishing rod, dear! My husband had one just like it. He talked to the fish more than to me.",
          "Going fishing? It's a very silent hobby, dear. I'd scare everything off in a minute."
        ],
        "lo": "You fish, dear? Then you're patient. I like patient people, they let me finish.",
        "hi": "{player}, I'd sit on the bank and chat while you fish. You'd catch nothing, but you'd know all the news."
      },
      "holding_tool": {
        "any": [
          "That {item} has seen some work, dear. You've got busy hands. Busy hands need feeding.",
          "Digging and delving, are you? My back aches just looking at that thing."
        ],
        "lo": "A hard worker with a tool in hand, I see, dear. My neighbour doesn't lift a finger.",
        "hi": "{player}, you'll wear yourself out swinging that {item} all day. I say it because I love you, dear."
      },
      "armored": {
        "any": [
          "Look at you in all that armour, dear! How ever do you sit down? Or hug anybody?",
          "My word, you're shiny. You look like my best baking tin with legs."
        ],
        "lo": "I can hardly see who's in that armour, dear. Are you smiling? I like to know if people are smiling.",
        "hi": "{player}, I'm glad of every bit of that armour on you. I sleep better knowing you're wrapped up."
      },
      "hurt": {
        "any": [
          "Oh, dear, look at the state of you! You're hurt, properly hurt. What have you been doing?",
          "You're white as flour and covered in scrapes! I can't joke about this one, dear."
        ],
        "lo": "I hardly know you, dear, and I'm already fretting. You look dreadful. Who let you get like this?",
        "hi": "{player}! Oh, my dear, you're hurt badly. My heart can't take it. I'd fuss over you all week."
      },
      "wet": {
        "any": [
          "You're wet through, dear! You're dripping on your own shoes. You'll catch your death.",
          "Soaked to the skin! My husband came home like that every time he went fishing."
        ],
        "lo": "Did you fall in, dear? I shan't laugh, we're not close enough yet. I'll laugh later.",
        "hi": "{player}, you're sopping! Oh, if I had a towel I'd rub your head like I did the grandchildren."
      },
      "sneaking": {
        "any": [
          "Why are you all hunched down, dear? Is it your back? Mine does that on damp days.",
          "Creeping about like a cat after the cream! I can see you, dear, I'm old, not blind."
        ],
        "lo": "I don't know what you're hiding from, dear, but it's rude to whisper at someone you've just met.",
        "hi": "{player}, are you sneaking up to surprise me? You nearly did. Mind my heart, you cheeky thing."
      },
      "long_time": {
        "any": [
          "Well! Days and days, dear, and not a word! I've had stories going stale waiting for you.",
          "There you are at last. I told the same joke to the kettle four times while you were gone."
        ],
        "lo": "It's been a good few days, hasn't it, dear? I'd only just started on you, too.",
        "hi": "{player}, where have you been all these days? I baked for you every morning and ate it all myself."
      },
      "first_today": {
        "any": [
          "Hello, dear! There's my first proper chat of the day. I've been saving up since I woke.",
          "Oh, good, it's you! I've not seen you yet today. Now, where to start?"
        ],
        "lo": "Hello, dear. First time today, isn't it? I remember faces, even the new ones.",
        "hi": "There's my {player}! The day doesn't start till I've said hello to you. Hello, dear."
      },
      "zoo_busy": {
        "any": [
          "The zoo's packed today, dear! I couldn't get near the cats for pushchairs. I talked my way through.",
          "So many guests! I've given directions to six of them. Wrong ones, I think, but kindly."
        ],
        "lo": "Your zoo's very popular today, dear. You must be doing something right. I'll find out what.",
        "hi": "Look at them all, {player}. All these people came to see what you made. I could burst, dear."
      },
      "zoo_empty": {
        "any": [
          "Not a single guest today, dear. The paths are empty and it's ever so quiet. I don't like it.",
          "Nobody's come! I've had to chat to the animals instead. They're pulling their weight, bless them."
        ],
        "lo": "No visitors at all, dear? Well, you've got me. I count as several, people say.",
        "hi": "An empty zoo isn't your fault, {player}. They'll come. And till then you've got me nattering."
      },
      "zoo_closed": {
        "any": [
          "The gates are shut, dear. It feels like a day of rest. Even the animals look like they're in their slippers.",
          "Closed today? It's peaceful, I'll say that. Too peaceful. I've been talking to the fence."
        ],
        "lo": "Your zoo's closed, dear, and here's me wandering about. Nobody told me not to.",
        "hi": "A closed zoo and just us, {player}. It's like being in the kitchen after the guests have gone."
      },
      "litter_bad": {
        "any": [
          "There's rubbish all over the paths, dear! I nearly went over on a wrapper. In my day we had bins and shame.",
          "Such a lot of litter about. And litter brings insects, dear, and I'll not have insects."
        ],
        "lo": "I don't like to say it to a new friend, dear, but your paths want a good sweep.",
        "hi": "{player}, I'm telling you as family, the mess on these paths would make my mother faint."
      },
      "stars_high": {
        "any": [
          "I hear the zoo's got a wonderful rating, dear! All those stars. I told the guests they were right.",
          "Top marks for the zoo! I'm not surprised. I've been telling people it's lovely for ages."
        ],
        "lo": "A very fine rating your zoo has, dear. I only visit the best places. And my sister's.",
        "hi": "All those stars, {player}! I told my sister and she went quiet. She's never quiet."
      },
      "stars_low": {
        "any": [
          "They say the rating's poor just now, dear. Well, my first cake was a brick, and look at me now.",
          "Hardly a star, I heard. People are too quick to grumble. I told one so, at length."
        ],
        "lo": "Your zoo's score isn't good, dear. I'll still come. Somebody has to keep the cats company.",
        "hi": "Never mind a low rating, {player}. I've seen how hard you try, and I say so to anyone who stands still."
      },
      "coins_low": {
        "any": [
          "I hear the Zoo Coins are nearly gone, dear. I've stretched a purse before. Soup, soup and more soup.",
          "Short of coins, are we? When I was first married we had two spoons and one of them was borrowed."
        ],
        "lo": "Money's tight at the zoo, they say, dear. I don't pry. I only listen to everything.",
        "hi": "{player}, dear, I hate to think of you lying awake over coins. Lean times pass, I've seen plenty."
      },
      "animal_sick": {
        "any": [
          "One of the animals isn't well, dear, I saw it myself. Poor mite. It wouldn't even look at me.",
          "There's a creature poorly in the zoo and I can't settle. I keep going back to check on it."
        ],
        "lo": "I know I've only just met you, dear, but one of your animals looks ill, and I can't keep that in.",
        "hi": "{player}, one of them is unwell and I know it's weighing on you. It's weighing on me too, dear."
      }
    },
    "near": {
      "ailing_bot": [
        "Ailing Bot bakes and loves cats, dear! He's a teacher, but I forgive him. Loudest man I know, and I know me.",
        "{player}, Ailing Bot and I had a bake-off. He says he won. I let him say it, dear."
      ],
      "ron": [
        "That's Ron, dear, the farmer. Knows every bird by its song. I asked him about bats and he changed the subject, bless him.",
        "Ron tells me about his hens and I tell him the news, {player}. I think I get the better half of that."
      ],
      "carrot": [
        "There's Carrot in her bunny suit, dear. She can't stand still and I can't stop talking. We get on famously.",
        "I offered to knit ears for Carrot's suit, {player}. She already has ears. I'm knitting them anyway."
      ]
    }
  },
  "carrot": {
    "intro": "Hi! Hello! I'm Carrot! Yes, like the vegetable! I'm a bunny rehabilitator, I help poorly bunnies get their hop back! This is my work suit! Isn't it soft?",
    "scenes": {
      "home_morning": {
        "any": [
          "Morning! I'm fluffing my suit before I go out! The ears take ages! Left one won't stand up!",
          "You came to my burrow! My house! I was doing my wake-up hops! Seventeen so far!"
        ],
        "lo": "Oh! Someone at my door! Hi! I wasn't ready! I'm never ready! Hello anyway!",
        "hi": "{player}! You came to see me first thing! I'm so happy my foot's thumping! Look at it go!"
      },
      "home_evening": {
        "any": [
          "Evening! All the lamps are on! Every single one! I like my house bright as noon!",
          "I'm tucked in for the night! Bunny slippers on, door shut, dark stays outside! Good!"
        ],
        "lo": "It's late! You walked here in the dark? Brave! I'd never! It's much nicer in here with the lamps!",
        "hi": "Oh good, it's you, {player}! Evenings are too shadowy by myself! Now it's cosy!"
      },
      "walking_to_zoo": {
        "any": [
          "I'm hopping to the zoo! The rabbits are waiting! I can't be late! I'm never late! I'm early!",
          "Why did I stop? I don't know! My feet want to go! The path's so bouncy today!"
        ],
        "lo": "Going to the zoo too? Okay! I hop fast though! It's fine if you can't keep up!",
        "hi": "Hopping to the zoo with you, {player}! I count dandelions on the way! I always lose count at six!"
      },
      "at_zoo": {
        "any": [
          "I'm visiting everybody small! Twice! The ones with fangs get a wave from far away!",
          "So many exhibits! I zigzag! That way I miss the big toothy ones! It's a system!"
        ],
        "lo": "Are you looking round too? The little animals are the best ones! That's just true!",
        "hi": "{player}! Walk past the scary pens with me? I'm braver when you're on the teeth side!"
      },
      "walking_home": {
        "any": [
          "Hopping home! I want to be in before the sky goes dim! I've got it timed!",
          "What a day! My legs are jelly! Happy jelly! I said goodnight to every rabbit by name!"
        ],
        "lo": "Can't stop long! Sun's going! I need my front door and my lamps! Bye soon!",
        "hi": "Come as far as my gate, {player}? The shadows on this path stretch out and I don't like them!"
      },
      "at_work": {
        "any": [
          "I'm working! Bunny check-ups! Ears, paws, noses, tails! This one's hopping straighter already!",
          "Shh, I'm with a patient! A shy little rabbit! We're practising being brave together!"
        ],
        "lo": "I'm in the middle of bunny rehab! It's very serious work! I do it in the suit so they trust me!",
        "hi": "{player}, look! The nervous one took a hop toward me today! I nearly cried in my suit!"
      },
      "following": {
        "any": [
          "Adventure! I'm right behind you! Hop, hop, hop! Are we there? Where's there?",
          "So much outside! So many places a bunny could be hiding! I'm checking every bush!"
        ],
        "lo": "I'm coming! I'm a bit nervous! I don't know you much! But you seem un-fangy!",
        "hi": "I'd hop anywhere with you, {player}! Anywhere with daylight! Daylight's my one rule!"
      },
      "following_night": {
        "any": [
          "It's night! We're outside! At night! Why are we outside? I'm okay! Am I okay?",
          "Too dark! Every bush looks like it has eyes! I'm staying so close I'm on your heels!"
        ],
        "lo": "I don't go out after dark! And I barely know you! This is two scary things at once!",
        "hi": "Only for you, {player}! Only for you would I be out in this dark! I'm holding your sleeve!"
      },
      "staying": {
        "any": [
          "Still here! Still waiting! I've hopped on the spot ninety times! It's the same spot!",
          "Waiting is so hard! My feet keep trying to leave without me!"
        ],
        "lo": "You said wait, so I'm waiting! You are coming back, right? People say that and then it gets dark!",
        "hi": "I'll stay put for you, {player}! I trust you! I'm just going to wiggle a lot until you're back!"
      },
      "rain": {
        "any": [
          "My suit's getting soggy! Wet fur takes forever to dry! I'll smell like a damp rabbit!",
          "Drip drip drip! It's landing right on my ears! They're drooping! Look, they're drooping!"
        ],
        "lo": "It's raining on us! Don't you mind? You don't even have a suit to ruin! Lucky!",
        "hi": "Puddles, {player}! I shouldn't jump in them! I'm going to! I did! My feet are soaked!"
      },
      "thunder": {
        "any": [
          "EEK! That thunder! That was so loud! My heart hopped right out and back in!",
          "Boom! I don't like the booms! Bunnies thump when they're scared! I'm thumping!"
        ],
        "lo": "Was that thunder? Was it close? You're very calm! How are you so calm?",
        "hi": "I've got your arm, {player}! I'm not letting go till the storm stops! Another flash! Eek!"
      },
      "full_moon": {
        "any": [
          "The moon's so big and bright! Good! I can see everything! Mostly everything!",
          "A full moon! It looks like a giant fluffy tail in the sky! That makes it less scary!"
        ],
        "lo": "It's night, but it's a bright moon night! I can see your face! That helps a bit!",
        "hi": "Look, {player}! Moonlight makes my suit glow silver! I'm a moon bunny! Still nervous though!"
      },
      "dark_moon": {
        "any": [
          "There's no moon! None! Where did it go? It's so black out here I can't see my paws!",
          "No no no, this is the darkest dark! No moon at all! I don't like it one tiny bit!"
        ],
        "lo": "It's pitch black and I don't know you very well! Please say something friendly! Anything!",
        "hi": "{player}, I can't see you! Are you there? Oh, there you are! You moved! Okay, you can move!"
      },
      "dawn": {
        "any": [
          "The sun's coming up! Hooray! The dark's over! I made it through another one!",
          "Sunrise! Everything's pink and gold! Gold! My favourite colour after carrot!"
        ],
        "lo": "You're up at dawn too? Sunrise people are safe people! That's what I think!",
        "hi": "First light, {player}! This is when my rabbits wake up and stretch! I love this bit of the day!"
      },
      "dusk": {
        "any": [
          "The sun's going down! Already? It only just came up! I need to be near a lamp soon!",
          "Sunset's pretty! But then comes the dark, and I know what dark's like! It's dark!"
        ],
        "lo": "It's getting dim and I don't really know you yet! I'm going to bounce a bit, don't mind me!",
        "hi": "The sun's sinking, {player}! You make sunset less wobbly! I'm standing extra close, okay?"
      },
      "nether": {
        "any": [
          "Hot hot hot! My suit's boiling! Everything's red and there's fire on the floor!",
          "Something out there is squealing! It has tusks! Tusks are just sideways fangs! Eek!"
        ],
        "lo": "Why did we come here? I hardly know you and now I'm somewhere that's on fire!",
        "hi": "{player}, there are no bunnies in this hot red place! None! I checked! I'm only here because it's you!"
      },
      "the_end": {
        "any": [
          "The sky's all black! All of it! And there's no bottom over that edge! I'm not looking!",
          "Those tall dark things have purple eyes! I'm staring at my feet! Only my feet!"
        ],
        "lo": "This empty black place is the darkest I've ever been and I just met you! I want my lamps!",
        "hi": "{player}, it's all void and gloom and I'm shaking in my suit! But I came! For you! See?"
      },
      "fishing_sky": {
        "any": [
          "We're in the sky! On floating islands! I hopped and nothing wobbled! I'm hopping very gently!",
          "So high and so bright! No shadows up here at all! I like that part! Not the edge part!"
        ],
        "lo": "It's a long way down from these islands! I'm staying in the middle! The pools can keep their edges!",
        "hi": "Clouds, {player}! Under us! They look like a million bunny tails! I want to pat one!"
      },
      "acufend": {
        "any": [
          "A round little moon with a jungle! And the creatures bop to music! I'm bopping too! Can't help it!",
          "The little locals love a tune! They bounce! They BOUNCE! These are my people!"
        ],
        "lo": "This moon is so strange! But everyone's dancing, so I think it's a nice strange!",
        "hi": "{player}, they're small and they dance and I love them! Best moon ever! And I saw it with you!"
      },
      "cave": {
        "any": [
          "It's so dark down here! And drippy! And the walls are close! I'm standing right in the torchlight!",
          "Was that a bat? Something squeaked! I squeaked back! That might have been a mistake!"
        ],
        "lo": "Caves are just big dark holes with no bunnies in them! Why do people like these?",
        "hi": "Ooh, {player}! Do you think there's gold in this rock? Or diamonds? I'd be so brave for diamonds!"
      },
      "high_up": {
        "any": [
          "We're so high! Everything's tiny! The sheep down there look like little cotton tails!",
          "No hopping near the edge, Carrot! That's what I'm telling myself! Over and over!"
        ],
        "lo": "It's very far down! I'm jittery on flat ground, so imagine me up here! Just imagine!",
        "hi": "I can see so far from up here, {player}! I'm scared and happy! Both at once! Mostly happy!"
      },
      "hostile_near": {
        "any": [
          "A monster! Right there! It's got a horrible face! I'm hiding behind you! Is that okay?",
          "Eek! Something nasty's coming! I can hear it! My ears are flat! Flat!"
        ],
        "lo": "There's a scary thing and I only just met you! Are you the protecting kind? Please say yes!",
        "hi": "{player}, a monster! You'll keep me safe, I know you will! I'm closing my eyes now!"
      },
      "creeper_near": {
        "any": [
          "Creeper! It's green and it's hissing! Green should mean lettuce, not that!",
          "That creeper's walking this way on its little feet! It's not cute! Little feet should be cute!"
        ],
        "lo": "Is that a creeper next to us? It is! I don't know you well, but I'm grabbing your arm!",
        "hi": "{player}! Creeper! It's going to pop! I can't watch! I'm hopping backwards as fast as I can!"
      },
      "villager_near": {
        "any": [
          "Villagers! They go hrmm! They've got big noses like bunnies! Well, a bit!",
          "A village! I've been peeking at their gardens for carrot tops! Politely! From the path!"
        ],
        "lo": "These villagers don't hop or say hi back! You said hi back! You're doing better than them!",
        "hi": "{player}, I showed a villager my suit and he just stared! I think that means he loves it!"
      },
      "pet_near": {
        "any": [
          "Your pet has pointy teeth! It's a small predator! But it looks happy! Is happy good?",
          "It sniffed my suit! It thinks I'm a real rabbit! I'm standing very still! Very still!"
        ],
        "lo": "Is that yours? Does it chase bunnies? I'm not a bunny! Somebody tell it I'm not a bunny!",
        "hi": "Okay, {player}, I trust your pet because it's yours! I patted it! With one finger! Did you see?"
      },
      "farm_animal_near": {
        "any": [
          "Sheepies! So woolly! I want to put my whole face in one! Fluff is fluff!",
          "A chicken just ran in a circle! I do that! We're the same! Hello, friend chicken!"
        ],
        "lo": "Farm animals! No fangs anywhere! This is a good place to get to know somebody!",
        "hi": "{player}, that cow keeps looking at me! I'm going to wave! I waved! It blinked!"
      },
      "zoo_animal_near": {
        "any": [
          "Look at the {species}! Right there! Is it fluffy? Does it have fangs? I always check both!",
          "Hi, {species}! Hello! I'm Carrot! It looked at me! Did you see it look at me?"
        ],
        "lo": "That's a {species}! I'm standing a few hops back until I know it's friendly! You look braver than me!",
        "hi": "{player}, I told the {species} you're my best buddy! Now it has to be nice to both of us!"
      },
      "guests_crowd": {
        "any": [
          "So many people! Everyone keeps patting my ears! I don't mind! Okay, I mind a little!",
          "A crowd! A little kid thought I was a real giant rabbit! Best thing anyone's ever said!"
        ],
        "lo": "It's so busy! I get extra jittery in crowds! You're easy to stand next to though!",
        "hi": "I'm glad you're beside me in this crowd, {player}! Somebody stepped on my foot and I want backup!"
      },
      "residents_crowd": {
        "any": [
          "All the neighbours! Everyone's here! Hi! Hi! Hi! I'm saying hi to each one!",
          "So many friends in one spot! I don't know who to hop to first! I'm spinning!"
        ],
        "lo": "You're meeting the whole street! They're nice! Mostly not toothy! I'll stand by you if you're shy!",
        "hi": "The whole street, {player}! And I still hopped to you first! You're my first hop!"
      },
      "other_resident": {
        "any": [
          "That's {other}! Hi, {other}! We're neighbours! I wave every morning! Sometimes twice!",
          "{other} is right there! I gave {other} a carrot once! It was my third best one!"
        ],
        "lo": "Do you know {other}? I do! Sort of! I'm jumpy near everybody, so don't read into it!",
        "hi": "{player}, {other} asked who my favourite person is! I pointed at you! With both hands!"
      },
      "other_player": {
        "any": [
          "Another one! Hi, {other}! Two of you! Do you both like bunnies? You have to both like bunnies!",
          "Ooh, {other}! A new friend maybe! No big teeth? Let me see! Okay! Good!"
        ],
        "lo": "Now there's {other} too! Two new-ish people! My jitters just doubled! Happy jitters!",
        "hi": "{other} seems nice, {player}! But you're my best buddy! {other} can be next best!"
      },
      "alone_night": {
        "any": [
          "It's just us! And the night! And all that dark around the edges! I'm not looking at the edges!",
          "Nobody else is here! It's so quiet I can hear my own ears! Can ears make noise?"
        ],
        "lo": "Alone at night with someone I hardly know! Eek! You've got a kind face though! I think! It's dark!",
        "hi": "If I have to be out at night, {player}, I want it to be with you! You're like a walking lamp!"
      },
      "by_water": {
        "any": [
          "Water! Splashy! I can see my ears in it! Hello, me! Hello, ears!",
          "A pond! I'm staying on the bank! A wet bunny suit weighs more than I do!"
        ],
        "lo": "Do you swim? I don't! I hop! Hopping doesn't work in water! I tried once!",
        "hi": "{player}, are there little fish in that water? Tiny ones? Not fluffy, but tiny counts!"
      },
      "by_lava": {
        "any": [
          "Lava! Hot orange goo! It's carrot coloured but it is NOT a carrot! Backing up!",
          "Too close! My whiskers are curling! I mean the suit's whiskers! Same thing!"
        ],
        "lo": "That's lava right there! I'm jittery near a candle! This is so much worse!",
        "hi": "You're so close to the lava, {player}! Eek! I don't have a spare best buddy!"
      },
      "by_flowers": {
        "any": [
          "Flowers! So many! I want to roll in them! I'm going to roll in them!",
          "It smells so good here! This is exactly where a bunny would sit! So I'm sitting! No, hopping!"
        ],
        "lo": "Do you like flowers? I do! We have that in common now! That's one thing!",
        "hi": "{player}, that yellow flower matches my happiest mood! That's the mood I'm in with you!"
      },
      "by_fire": {
        "any": [
          "Fire! It's bright, I like that! It's hot, I don't like that! I'm standing in between!",
          "A campfire! The dark can't get near it! I'm keeping my tail well away though!"
        ],
        "lo": "It's nice and light by the fire! You look less mysterious now! That's good!",
        "hi": "The fire keeps the dark off and so do you, {player}! I've got both! I feel so safe!"
      },
      "by_crops": {
        "any": [
          "Crops! Are any of them carrots? I see green tops! Those could be carrots!",
          "A farm! Things are growing! I've been watching one sprout! I think it moved!"
        ],
        "lo": "Is this your farm? Do you grow carrots? I'm not asking for any! I'm only wondering loudly!",
        "hi": "{player}, if those are carrots, this is my favourite place you've ever shown me! Ever!"
      },
      "by_books": {
        "any": [
          "Books! So many! Is there one about rabbits? I'd read it! I'd read it twice!",
          "Shelves and shelves! I can't sit still long enough to read! I do the pictures!"
        ],
        "lo": "Do you read a lot? I get to page two and then I have to hop! Every time!",
        "hi": "{player}, would you read to me one day? A bunny story! With a happy ending! I'd stay so still!"
      },
      "in_snow": {
        "any": [
          "Snow! It's white and fluffy like a giant bunny! A cold one! Brr!",
          "My feet are leaving bunny tracks in the snow! Look! Hop, hop, hop! Perfect prints!"
        ],
        "lo": "It's freezing! I've got a fur suit and you don't! Aren't you cold? You look cold!",
        "hi": "{player}! Snow bunnies! I want to build one with ears as tall as me! I'd guard it all day!"
      },
      "holding_gift": {
        "any": [
          "Ooh! Ooh! What's that? Is that {item}? I'm not grabbing! My hands are behind my back!",
          "Something in your hand just made my ears go straight up! I love that thing!"
        ],
        "lo": "That's a {item}! I really like those! I'm not saying anything! I just said something! Oops!",
        "hi": "{player}! You've got {item}! You remembered what I love! I'm bouncing! I can't stop!"
      },
      "holding_weapon": {
        "any": [
          "Eek! That {item} is sharp! Or pointy! Or both! I don't like it!",
          "You've got a weapon out! It's making my tummy go funny! I'm looking at your face instead!"
        ],
        "lo": "Why are you holding that? I don't know you well enough for you to be holding that!",
        "hi": "I know you'd never scare a bunny with that {item}, {player}! I still wish it was a carrot!"
      },
      "holding_food": {
        "any": [
          "Food! Is that {item}? Is it crunchy? Crunchy's the best kind! I can tell by looking!",
          "Ooh, a snack! It's not a carrot, is it? No? That's fine! Still exciting!"
        ],
        "lo": "You're eating! Good! Bunnies nibble all day and they're the happiest! Just saying!",
        "hi": "{player}, that {item} looks yummy! I'm not drooling! The suit hides it anyway!"
      },
      "holding_rod": {
        "any": [
          "A fishing rod! With a hook? Hooks are pointy! The fish are slippery! I'd squeal the whole time!",
          "Fishing! You have to sit still for that! I've never sat still! Not once!"
        ],
        "lo": "You catch fish? Wow! I only catch bunnies, and only for cuddles and check-ups!",
        "hi": "I'd come fishing with you, {player}! I'd scare every fish away hopping! You'd still let me!"
      },
      "holding_tool": {
        "any": [
          "That {item} is for digging! Bunnies dig too! With their paws! You're cheating a bit!",
          "A tool! Are you making a burrow? I love a burrow! Is it a burrow?"
        ],
        "lo": "You look busy with that tool! I'm usually in the way! Sorry in advance!",
        "hi": "{player}! Does that {item} ever find gold? Or diamonds? I'd hop for a week if I saw one!"
      },
      "armored": {
        "any": [
          "You're all metal! Clank clank! No soft bits at all! How do you get hugged?",
          "Shiny armour! Shiny's good! But you look like a walking bucket! A nice bucket!"
        ],
        "lo": "I can't see your face in all that armour! Are you smiling in there? I hope you're smiling!",
        "hi": "{player}, your armour's so shiny! You're the shiniest friend I have! I can see my ears in you!"
      },
      "hurt": {
        "any": [
          "You're hurt! You're really hurt! Oh no, oh no! What bit you? Was it something with fangs?",
          "Eek, look at you! You're all scraped and wobbly! I'm scared for you!"
        ],
        "lo": "I only just met you and you're already hurt! That's not fair! Are you going to be okay?",
        "hi": "{player}! Oh no! You look awful! I fix hurt bunnies all day and I can't bear it being you!"
      },
      "wet": {
        "any": [
          "You're dripping! All over! You look like a rabbit that fell in a bucket!",
          "So soggy! Did you jump in? On purpose? I'd never! My suit would weigh a ton!"
        ],
        "lo": "You're all wet! I'd hug you dry but we just met and I'd get damp!",
        "hi": "{player}, you're soaked! Bunnies shake dry! I'm shaking for you! Brrrr! Did it help?"
      },
      "sneaking": {
        "any": [
          "Why are you down low? Are we hiding? What from? I'm hiding too now!",
          "You're crouching like a bunny in the grass! That's my move! You're doing it nearly right!"
        ],
        "lo": "You crept up on me! I jump at leaves! I jumped at my own tail once!",
        "hi": "{player}, are you being sneaky? I saw you! My ears hear everything! The real ones, under the suit!"
      },
      "long_time": {
        "any": [
          "You're back! It's been days! Days and days! I counted in hops! It was a lot of hops!",
          "Where did you go? I looked behind every bush! You weren't in any of them!"
        ],
        "lo": "Oh! I remember you! It's been ages! I thought you'd forgotten the bunny lady!",
        "hi": "{player}! I missed you so much my ears flopped! For days! They're back up now! Look!"
      },
      "first_today": {
        "any": [
          "Hi! First hello of today! I've been saving it! It's a big one! HELLO!",
          "It's you! I haven't seen you yet today! Now my day's properly started!"
        ],
        "lo": "Oh, hello! Today's first hi! I'm a bit less jumpy with you each time! A bit!",
        "hi": "{player}! Hello, hello! I did a happy thump when I saw you coming today!"
      },
      "zoo_busy": {
        "any": [
          "The zoo's so full! People everywhere! I had to squeeze past a whole line of guests! Sideways!",
          "So many guests today! I've been hopping between legs! Nobody minds a bunny!"
        ],
        "lo": "It's packed! Did you do this? Everyone's smiling! You must be good at zoos!",
        "hi": "{player}, look how many came! They love your zoo! I told three of them you're my friend!"
      },
      "zoo_empty": {
        "any": [
          "Where is everybody? The gates are open and nobody's here! The paths look so long!",
          "No guests! Not one! It's too quiet! I can hear the animals chewing!"
        ],
        "lo": "Nobody came today? That's sad! I came! I count! I'm one whole visitor!",
        "hi": "It's empty, {player}, but don't be glum! More animal time for us! That's the bright side!"
      },
      "zoo_closed": {
        "any": [
          "The zoo's closed! No guests! The animals are having a lazy day! I can tell!",
          "Shut gates! It feels like a secret! I've been whispering! I never whisper!"
        ],
        "lo": "It's closed and I'm still hopping about in here! Is that allowed? Nobody stopped me!",
        "hi": "A closed zoo with just you and the animals, {player}! This is my dream! Nobody wake me!"
      },
      "litter_bad": {
        "any": [
          "There's rubbish all over the paths! I tripped on it mid-hop! Nearly landed on my tail!",
          "So much litter! What if a little animal nibbles it? I can't stop thinking about that!"
        ],
        "lo": "The paths are really messy! I don't want to be rude! But they are! Sorry!",
        "hi": "{player}, the litter's making me extra jittery! A bunny wouldn't leave a mess like this! Honest!"
      },
      "stars_high": {
        "any": [
          "So many stars for the zoo! Shiny gold stars! I love anything gold!",
          "The zoo's rating is amazing! Everybody's saying so! I did a celebration hop! Then six more!"
        ],
        "lo": "Your zoo's got a great score! Wow! You're kind of a big deal! I'm a bit shy now!",
        "hi": "{player}, all those stars! I knew it! I always said this was the best zoo! The bunnies agree!"
      },
      "stars_low": {
        "any": [
          "The zoo hardly has any stars! That's not right! Whoever counted them needs more carrots!",
          "A bad rating? Whoever did that didn't look at the small animals! I'd bet my ears!"
        ],
        "lo": "Your zoo's score is low! Oh no! Don't be sad! I don't know you well but don't be sad!",
        "hi": "Stars go up and down, {player}! I think you're a five star friend! That's the rating I care about!"
      },
      "coins_low": {
        "any": [
          "The Zoo Coins are almost gone? Eek! Coins are shiny and I like them being around!",
          "Hardly any coins left! Now I'm jittery about it! I get jittery about soup, but still!"
        ],
        "lo": "I heard the zoo's nearly out of Zoo Coins! I don't have any either! Just a suit and a dream!",
        "hi": "{player}, coins come back! And you've still got me and my hugs! Those cost nothing!"
      },
      "animal_sick": {
        "any": [
          "One of the animals is poorly! I can tell! I can always tell! My ears went down!",
          "Something in the zoo isn't well! I can't bounce properly when an animal's hurting!"
        ],
        "lo": "There's a sick animal! I know we just met, but that's my whole job, I can't stay quiet!",
        "hi": "{player}, one of them's unwell and I feel it right in my tummy! You care too, I know you do!"
      }
    },
    "near": {
      "paola": [
        "Paola acts all grumpy, but she goes soft around small things! I've seen her face do it!",
        "{player}, Paola carries an axe and I still like her! That's how nice she is underneath!"
      ],
      "guido": [
        "Guido collects bows! Pointy shooty bows! I stand on his other side! He's funny though!",
        "Guido told me a joke and I laughed so hard I forgot about the bows, {player}! For a minute!"
      ],
      "sheila": [
        "Sheila talks and talks and I hop and hop! Neither of us ever stops! It's perfect!",
        "{player}, Sheila says I'm too thin! In a bunny suit! How can she even tell?"
      ]
    }
  },
  "ron": {
    "intro": "Howdy, name's Ron. I work the farm down the way, and the rest of the time I've got my head tipped back, watching birds. Glad to know you.",
    "scenes": {
      "home_morning": {
        "any": [
          "Come on in. Kettle's on and the sparrows are already squabbling on my roof.",
          "You caught me before chores. Boots are by the door and I'm nearly in them."
        ],
        "lo": "Morning. Don't get many callers this early. You're welcome on the porch, though.",
        "hi": "{player}, at my door before the rooster's done. Sit a minute, the hearth's still warm from breakfast."
      },
      "home_evening": {
        "any": [
          "Day's work is done. I'm just sat here listening to the crickets tune up.",
          "Fire's banked low and my boots are off. That's my whole evening, right there."
        ],
        "lo": "Evening. I turn in early, so you'll forgive me if I yawn at you.",
        "hi": "Take the good chair, {player}. I was hoping somebody'd come share the quiet."
      },
      "walking_to_zoo": {
        "any": [
          "On my way to the aviary. I walk slow, so I hear more on the road.",
          "Heard a woodpecker back along this path. Stopped a good while for him."
        ],
        "lo": "Just headed to the zoo, same as most days. Nice road for it.",
        "hi": "This road always feels shorter when I run into you on it, {player}."
      },
      "at_zoo": {
        "any": [
          "I've done the whole loop twice and I keep ending up back at the birds.",
          "Fine place to wander. Every pen's got something worth a long, quiet look."
        ],
        "lo": "Nice zoo you keep. I'm only looking, don't mind me.",
        "hi": "You built all this, and I get to stroll round it. I'm a lucky old man, {player}."
      },
      "walking_home": {
        "any": [
          "Legs are tired, heart's full. Good day at the zoo.",
          "Headed back to the cabin. The hens will want shutting in before dark."
        ],
        "lo": "Just making my way home. Fine zoo. I expect I'll be back.",
        "hi": "I counted more wings today than I could name, {player}. Wish you'd been at my elbow for it."
      },
      "at_work": {
        "any": [
          "Just turning the soil. A robin's been following my hoe all morning for the worms.",
          "Mind the furrows, friend. This row's only just gone in."
        ],
        "lo": "Can't stop long, the field's half done. Happy to nod hello, though.",
        "hi": "Good, an excuse to lean on the hoe. Tell me your news while my back straightens out."
      },
      "following": {
        "any": [
          "Good walking weather. I've spotted three kinds of bird since we set out.",
          "Don't mind me lagging. I stop for every rustle in the bushes."
        ],
        "lo": "Not sure where we're headed, but I'm glad of the fresh air.",
        "hi": "Wherever you're taking me, {player}, it beats weeding."
      },
      "following_night": {
        "any": [
          "I'm not much of a night walker. The owls are good company, at least.",
          "Hard to see my own boots out here. I'm going by ear."
        ],
        "lo": "Late to be so far from home. I'll trust you know the way back.",
        "hi": "I'd be asleep by now for anybody else. For you I'll stay up with the bats."
      },
      "staying": {
        "any": [
          "I'm in no hurry. A man can watch a lot of sky from one spot.",
          "Still here. A finch landed near my boot a minute ago, so I've been busy."
        ],
        "lo": "You said wait, so I'm waiting. I'm good at standing still.",
        "hi": "Take your time, {player}. I've waited on slower things than you. Seeds, mostly."
      },
      "rain": {
        "any": [
          "Listen to it on the leaves. Only the ducks are enjoying this more than me.",
          "Birds have all gone to cover. I should have the sense to do the same."
        ],
        "lo": "Wet one today. My hat's seen worse, and so have I.",
        "hi": "There's room under my hat brim, {player}. Room for one and a half, anyhow."
      },
      "thunder": {
        "any": [
          "That one rattled my teeth. Too loud for my liking, and I can't ask the sky to hush.",
          "Storm like this, every bird's tucked down tight. Smart creatures."
        ],
        "lo": "Big storm. I'd sooner be under a roof, I'll admit that much.",
        "hi": "I worry about you out in this lightning, {player}. I'll breathe easier when it blows over."
      },
      "full_moon": {
        "any": [
          "Bright as a lantern up there. You can see the owls hunting by it.",
          "Full moon. My old rooster never knows what to make of a night this light."
        ],
        "lo": "Fine big moon tonight. Makes a late night worth it.",
        "hi": "Moon like that, I used to sit up alone for it. Better with you here, {player}."
      },
      "dark_moon": {
        "any": [
          "No moon at all. I can hear wings overhead and can't see a feather.",
          "Black as a crow's back tonight. I'm keeping one hand on the fence."
        ],
        "lo": "Awful dark. I'd feel better nearer a fire, I don't mind saying.",
        "hi": "Can't see you, {player}, but I know your footsteps by now. That's a comfort."
      },
      "dawn": {
        "any": [
          "There she comes. And there goes the first blackbird, right on time.",
          "First light. I've seen a great many of these and I'm not tired of them yet."
        ],
        "lo": "You're up early. Folks who see the sunrise are usually my kind of folks.",
        "hi": "Best hour there is, and I've got my favourite company for it."
      },
      "dusk": {
        "any": [
          "Sky's gone the colour of embers. The rooks are heading in to roost.",
          "Sun's on the hill. That's my signal to start thinking about supper."
        ],
        "lo": "Pretty sunset. I'll be off home soon after it, most likely.",
        "hi": "Another day done, {player}. I'm glad I spent the end of it with you."
      },
      "nether": {
        "any": [
          "I like a fire, but this is a whole country of it. Too much of a good thing.",
          "Not one songbird in this whole red sky. That tells you what kind of place it is."
        ],
        "lo": "Never thought I'd follow somebody down here. Hot as a bread oven.",
        "hi": "Only for you would I stand on ground that smokes, {player}. My boots may never forgive me."
      },
      "the_end": {
        "any": [
          "No sun, no wind, no birdsong. Quietest place I ever disliked.",
          "Those tall dark fellows won't meet my eye. I'll be polite and not meet theirs."
        ],
        "lo": "Strange country. I'll keep near you, if it's all the same.",
        "hi": "If something with wings lives out in that dark, {player}, I'd like to see it. From behind you."
      },
      "fishing_sky": {
        "any": [
          "Islands hanging in the air. I'm up where the hawks ride, and I didn't need wings.",
          "Clouds under my boots. My hens would never believe it."
        ],
        "lo": "Never been this high in my life. I can't stop looking over the edge.",
        "hi": "You brought an old bird watcher up into the sky itself, {player}. I'll not forget it."
      },
      "acufend": {
        "any": [
          "A round little moon with a jungle on it. And the critters hum. I rather like them.",
          "Music everywhere and none of it too loud. These creatures have manners."
        ],
        "lo": "Odd place. Pleasant, though. I'll stand and listen a while.",
        "hi": "Reckon these singing fellows would get on with my larks. Thanks for showing me, {player}."
      },
      "cave": {
        "any": [
          "Never cared for digging. A man ought to be able to see the sky.",
          "Bats down here, at least. Good little fliers. They're the one thing I like about it."
        ],
        "lo": "I'm no miner. I'll follow, but I won't pretend I'm happy.",
        "hi": "I'd not come under this much rock for anyone but you. I'll be glad of daylight, mind."
      },
      "high_up": {
        "any": [
          "This is how the eagle sees it. Whole world laid out like a quilt.",
          "Wind's strong up here. A hawk would just lean on it and go."
        ],
        "lo": "Long way down. Grand view, mind. I'll stay back from the edge.",
        "hi": "{player}, look at that. I could stand up here till my knees gave out."
      },
      "hostile_near": {
        "any": [
          "Something ugly's shuffling about over there. I heard it before I saw it.",
          "I don't like the sound of that groaning. That's no farm animal."
        ],
        "lo": "There's a monster close. I'm too old to outrun it, so I'll stay by you.",
        "hi": "Careful, {player}. I'd take a hundred crows in my corn over one of those."
      },
      "creeper_near": {
        "any": [
          "Green fellow over yonder, quiet as a cat. I don't trust anything that quiet.",
          "That creeper's eyeing us. Lost a good fence to one of those once."
        ],
        "lo": "Creeper. I'd as soon not be loud near it. Or near it at all.",
        "hi": "{player}, that creeper's closer than I like. I only just got used to having you around."
      },
      "villager_near": {
        "any": [
          "Villagers. Good plain folk. I always look for the one in the straw hat.",
          "They hum instead of talk. Easier on the ears than most conversation."
        ],
        "lo": "Nice quiet village. I could swap gossip about the weather here all day.",
        "hi": "These folk remind me of my old neighbours. Never said much, always waved."
      },
      "pet_near": {
        "any": [
          "That's a loyal animal you've got. Watches you the way my old sheepdog watched me.",
          "Well, hello there, little friend. Sniff away, I smell of hens."
        ],
        "lo": "Fine pet. Animals choose well, so that speaks kindly of you.",
        "hi": "Your little shadow there trusts you. So do I, for what it's worth, {player}."
      },
      "farm_animal_near": {
        "any": [
          "Now these I know. Good solid stock, nothing fancy about them.",
          "Hear that lowing and clucking? That's contentment. I'd know it anywhere."
        ],
        "lo": "Farm animals. I could tell you their moods by the set of their ears.",
        "hi": "Makes me want to check on my own flock. You'd like my hens, {player}. They'd like you."
      },
      "zoo_animal_near": {
        "any": [
          "Look at the {species} there. Calm as a Sunday. Somebody's caring for it right.",
          "I could watch that {species} till suppertime and not get bored once."
        ],
        "lo": "That's a handsome {species}. I'll just stand quiet so I don't spook it.",
        "hi": "The {species} knows you, {player}. See how it eases when you're near?"
      },
      "guests_crowd": {
        "any": [
          "Lot of folks about. I'll find a quiet rail to lean on till they pass.",
          "Busy as a henhouse at feeding time. Bit much for my ears."
        ],
        "lo": "Crowded today. I'm not one for a crush, so I'll keep to the edge.",
        "hi": "Too many elbows here for me. You, I don't mind standing next to."
      },
      "residents_crowd": {
        "any": [
          "Half the street's turned out. Nice to see, long as nobody shouts.",
          "All the neighbours in one spot. Like starlings on a fence."
        ],
        "lo": "Quite a gathering. I mostly listen at these.",
        "hi": "I know all these faces, {player}, and yours is still the one I look for."
      },
      "other_resident": {
        "any": [
          "That's {other} over there. Good neighbour. Waves every morning.",
          "{other} and I don't talk a lot, but we nod. A nod's worth plenty."
        ],
        "lo": "You know {other}? Decent sort. Most folks round here are.",
        "hi": "Between you and me, {player}, {other} can out-talk a goose. Good heart, though."
      },
      "other_player": {
        "any": [
          "Howdy to you too, {other}. Plenty of sky here for all of us.",
          "Two of you now. {other} looks like the adventuring sort as well."
        ],
        "lo": "I see {other} is with you. Pleased to meet any friend of the zoo.",
        "hi": "Is {other} a pal of yours, {player}? Then {other} is a pal of mine. Simple as that."
      },
      "alone_night": {
        "any": [
          "Just us and the crickets. I like a night with no shouting in it.",
          "Quiet out. You can hear an owl clear across the valley."
        ],
        "lo": "Nobody about but you and me. I hope you don't mind a quiet old man.",
        "hi": "Nights like this I talk more than I mean to. You're easy to tell things to, {player}."
      },
      "by_water": {
        "any": [
          "Herons fish this kind of bank. Stand still long enough and one might come.",
          "Nice bit of water. Ducks would love it. So do I."
        ],
        "lo": "Peaceful by the water. I'll just watch the ripples a minute.",
        "hi": "This is near as good as my own fishing spot. Don't let the spot hear I said so."
      },
      "by_lava": {
        "any": [
          "I'm fond of a fire, but that's not a fire, that's the ground gone wrong.",
          "Feel the heat off that. No bird would nest within a mile."
        ],
        "lo": "I'll stand well back from that, thank you kindly.",
        "hi": "I get nervous seeing you that near it, {player}. Humour an old man."
      },
      "by_flowers": {
        "any": [
          "Bees are busy in these. Good honest workers, bees.",
          "Pretty patch. Bees fly, so they count with me same as any bird."
        ],
        "lo": "Nice flowers. I grow food, not blooms, but I can admire them.",
        "hi": "I ought to plant a row of these by the cabin, {player}. Something bright for when you come by."
      },
      "by_fire": {
        "any": [
          "Now that's a proper fire. Good coals, not too much smoke.",
          "Nothing I like better than a campfire. Makes any spot feel like home."
        ],
        "lo": "Mind if I warm my hands? A fire's meant to be shared, even with new folks.",
        "hi": "Fire, quiet, and you across from me. Add a bit of roast meat and I'd want for nothing."
      },
      "by_crops": {
        "any": [
          "Somebody's kept these rows straight. I notice a thing like that.",
          "Good dark soil, well watered. Whoever farms this knows the work."
        ],
        "lo": "Can't walk past a field without looking it over. Farmer's habit.",
        "hi": "If these are your rows, {player}, I'm proud of you. If not, I'm proud of whoever."
      },
      "by_books": {
        "any": [
          "A lot of books. I've read the sky more than I've read pages.",
          "If one of these has bird drawings in it, I'd sit down with that one."
        ],
        "lo": "I'm not much of a reader. Learned most of what I know outdoors.",
        "hi": "You read these, {player}? Tell me the good bits sometime. I'll tell you what the wind's doing."
      },
      "in_snow": {
        "any": [
          "Snow shows you every track. Something small hopped through here not long ago.",
          "Cold on the knees, but it's pretty. Makes me want a fire something fierce."
        ],
        "lo": "Brisk out. Winter's quiet, at least. I like that part.",
        "hi": "My toes are numb and I'm still glad I came. That's your doing, {player}."
      },
      "holding_gift": {
        "any": [
          "That's a fine {item} you've got there. Takes me right back to the farm.",
          "Now what's that in your hand? A {item}? I've always been partial to those."
        ],
        "lo": "Nice {item}. Not that it's any of my business what a person carries.",
        "hi": "That {item} caught my eye, {player}. You always did know what an old farmer likes to look at."
      },
      "holding_weapon": {
        "any": [
          "That {item} looks well used. I only ever swung a hoe in anger, and that at weeds.",
          "You're armed. Expecting trouble, or just careful?"
        ],
        "lo": "I'm a peaceable man, friend. That {item} stays pointed elsewhere, I trust.",
        "hi": "I feel safer walking with you and that {item}, {player}. Don't tell my scarecrow."
      },
      "holding_food": {
        "any": [
          "Is that {item}? My stomach heard you before my ears did.",
          "Smells good, whatever you've got there. A man gets hungry outdoors."
        ],
        "lo": "Having a bite? Don't let me interrupt. Folks should eat when they're hungry.",
        "hi": "You and your {item}. Everything tastes better by a campfire, {player}, but I'm biased."
      },
      "holding_rod": {
        "any": [
          "A fishing rod. Now there's a tool I approve of. Nothing whirs or blinks on it.",
          "Going after fish? Patient work. Same as waiting on a shy bird."
        ],
        "lo": "You fish? Then we've something in common already.",
        "hi": "A rod in your hand and time on mine. That's my idea of a fine afternoon, {player}."
      },
      "holding_tool": {
        "any": [
          "That {item} has seen some work. I respect a tool with a worn handle.",
          "Good plain {item}. No gadgets, no fuss. Just a handle and a job."
        ],
        "lo": "Working today? I'll not keep you. I know what a waiting job feels like.",
        "hi": "If that {item} is headed underground, {player}, I'll be glad when you're back up top. Never trusted mining."
      },
      "armored": {
        "any": [
          "You're clanking like a loose gate. No sneaking up on a bird in that.",
          "All that metal. Must be like wearing a cookstove."
        ],
        "lo": "You look ready for a war, friend. I hope you don't find one.",
        "hi": "Good. I worry less with you buttoned up in all that, {player}."
      },
      "hurt": {
        "any": [
          "You look rough, friend. Whiter than my hair.",
          "Easy now. You're swaying like a scarecrow in a gale."
        ],
        "lo": "Pardon me saying, but you look done in. That wants seeing to.",
        "hi": "{player}, you're scaring me. I'd feel a lot better if you were mending somewhere safe."
      },
      "wet": {
        "any": [
          "You're dripping like a duck. Only the duck looks happier about it.",
          "Soaked through. My hens look like that after a storm, and twice as cross."
        ],
        "lo": "You've been swimming, or the weather won. Either way, that's a lot of water.",
        "hi": "Look at the state of you, {player}. A warm fire would set you right in no time."
      },
      "sneaking": {
        "any": [
          "You stalk like a heron in the reeds. What are we creeping up on?",
          "Down low, are we? That's how I get near the shy birds."
        ],
        "lo": "No need to creep up on me, friend. I don't startle easy.",
        "hi": "I'd know you crouched, standing or upside down, {player}. Good try, though."
      },
      "long_time": {
        "any": [
          "Well, there you are. The hens have laid a good few eggs since we last talked.",
          "Been a few days. I wondered if you'd flown south."
        ],
        "lo": "Haven't seen you about lately. Hope things are well with you.",
        "hi": "I missed you, {player}. I've been talking to the rooster, and he's no listener."
      },
      "first_today": {
        "any": [
          "There's the first friendly face of my day. Howdy.",
          "Day's off to a good start. Wind's from the west and you're here."
        ],
        "lo": "Good day to you. Fine weather for whatever you're about.",
        "hi": "{player}! I was just telling a wren you'd be along. She didn't believe me."
      },
      "zoo_busy": {
        "any": [
          "Zoo's full to the fences today. Good for you, hard on my ears.",
          "So many folks the sparrows have given up on the paths."
        ],
        "lo": "Busy day for you. I'll do my looking from the quiet corners.",
        "hi": "Look at them all, {player}. They came to see what you built. I'll be hiding by the aviary."
      },
      "zoo_empty": {
        "any": [
          "Not a soul on the paths. I can hear every bird in the place.",
          "Empty today. Selfish of me, but I like it this way."
        ],
        "lo": "Quiet in here. They'll come, I expect. Good things take a season.",
        "hi": "Don't you fret about the empty paths, {player}. Fields look bare before they sprout, too."
      },
      "zoo_closed": {
        "any": [
          "Gates shut, are they? The animals will enjoy the rest.",
          "Closed up. Peaceful. Like a farm on a day of rest."
        ],
        "lo": "I see it's closed. I'll not make a fuss, I can hear the birds from here.",
        "hi": "A day with the gates shut does a body good. You could use the rest yourself, {player}."
      },
      "litter_bad": {
        "any": [
          "Lot of rubbish on the paths. Saw a sparrow tugging at some back there. Didn't sit right.",
          "Folks drop things and walk on. Never understood it. Land remembers."
        ],
        "lo": "Pardon me for mentioning it, but the paths are in a sorry state.",
        "hi": "I'll say it plain since we're friends, {player}. This litter's no good for the birds."
      },
      "stars_high": {
        "any": [
          "Folks speak awful well of this zoo. I hear it clear down at the farm.",
          "Top marks, I'm told. The animals could've told them that for nothing."
        ],
        "lo": "Hear your zoo's rated mighty high. Well earned, from what I've seen.",
        "hi": "All those stars and you still stop to talk to an old farmer. That's the part I'd rate, {player}."
      },
      "stars_low": {
        "any": [
          "Hear the ratings are poor. Well. I've had bad harvests too. You plant again.",
          "Folks are quick to grumble. The birds here sing the same either way."
        ],
        "lo": "I don't set much store by stars. It's a pleasant place to me.",
        "hi": "Never mind the low marks, {player}. I've seen what you put into this place."
      },
      "coins_low": {
        "any": [
          "Money's tight, I hear. I know lean seasons. They pass.",
          "A thin purse is no shame. I've wintered on turnips and stubbornness."
        ],
        "lo": "Word is the coin box is near empty. Sorry to hear it.",
        "hi": "If Zoo Coins grew in rows, {player}, I'd plant you a whole field of them."
      },
      "animal_sick": {
        "any": [
          "One of the animals isn't right. You can tell by how quiet it's gone.",
          "There's a poorly creature in here. I know that hunched look from my own stock."
        ],
        "lo": "Not my place to say, but one of yours looks unwell. It weighs on me.",
        "hi": "{player}, one of them's ailing. I know you'll do right by it. You always do."
      }
    },
    "near": {
      "jack": [
        "Jack there fishes the way I watch birds. Neither of us is in any hurry.",
        "Jack swears he hooked a fish as long as my barn. I nod along. It's neighbourly."
      ],
      "dave": [
        "Dave's a cheerful soul for a man who lives down a hole. I'll never understand it.",
        "Dave keeps asking me down the mine. I keep asking Dave up to see the sky."
      ],
      "don_l": [
        "Don L. is a good lad, but I hear him three fields off. Scares crows better than my scarecrow.",
        "Don L. wanted my hens for a new sport. I told him the hens had voted no."
      ]
    }
  },
  "jared": {
    "intro": "Yo, I'm Jared. Singer, night shift, voice like gold. I've played for crowds of thousands. Okay, dozens. Okay, one crocodile. But he loved it.",
    "scenes": {
      "home_morning": {
        "any": [
          "Yo, it's morning. I just got in. My bed's been calling my name in harmony.",
          "You caught me after the show, man. Hair's a mess, voice is gone, vibes are fine."
        ],
        "lo": "Kinda early for visitors. I don't usually do mornings for people I just met.",
        "hi": "Only you get to see me like this, {player}. Half asleep and humming into a pillow."
      },
      "home_evening": {
        "any": [
          "Warming up, man. Scales first, then the chain goes on, then I'm ready.",
          "Sun's dropping, so I'm picking tonight's set. All hits. I only write hits."
        ],
        "lo": "I'm getting ready for my shift. Fans don't usually get backstage, just so you know.",
        "hi": "Good timing, {player}. I can't pick tonight's opener and you've got better ears than me."
      },
      "walking_to_zoo": {
        "any": [
          "Just strolling to the zoo, man. The crocs get moody if I'm late. Probably.",
          "Walking slow on purpose. A singer never arrives sweaty."
        ],
        "lo": "Heading to the zoo. You're the one who runs it? Cool, cool. I've been keeping an eye on it for you.",
        "hi": "I told the pufferfish about you, {player}. He puffed. That's a yes from him."
      },
      "at_zoo": {
        "any": [
          "Just cruising the exhibits. Every animal here's got a sound, man. I'm collecting them.",
          "I'm on my third lap. The weird ones get better every time."
        ],
        "lo": "Nice zoo. I'd give it a shout from the stage. If you asked. Nicely.",
        "hi": "Real talk, {player}, I come here when the songs won't come. Works every time."
      },
      "walking_home": {
        "any": [
          "Heading back, man. Got a croc-shaped melody and I need to catch it before it swims off.",
          "Done with the zoo. My feet are tired but my head's full of hooks."
        ],
        "lo": "Rolling home. Good zoo. I only got lost twice. Zero times. Forget I said twice.",
        "hi": "Walking home humming, {player}. That's how you know it was a good one."
      },
      "at_work": {
        "any": [
          "I'm in the middle of a set, man. Hold up, let me finish this verse in my head. Okay. Go.",
          "This is the job. Night air, big notes, nobody telling me to turn it down."
        ],
        "lo": "I'm working, but I can spare a minute for the audience. That's you. Just you.",
        "hi": "{player}! This next one's for you. I say that to everyone, but this time I mean it."
      },
      "following": {
        "any": [
          "I'm right behind you, eyes open. Somebody's gotta watch the back.",
          "Day adventure, huh. I'm usually asleep now, so this better be legendary."
        ],
        "lo": "I'll tag along. If it gets sketchy, I'm just saying, I run fast.",
        "hi": "I'd follow you anywhere, {player}. Slowly. With snack breaks."
      },
      "following_night": {
        "any": [
          "Night's my time, man. I see everything out here. That bush moved. It's fine. It's a bush.",
          "Walking in the dark with a soundtrack. I'm humming, you just can't hear it."
        ],
        "lo": "Bit far from home for a night stroll with someone I barely know. I'm alert, that's all.",
        "hi": "Dark roads don't bug me when it's you up front, {player}. Don't walk too fast, though."
      },
      "staying": {
        "any": [
          "Still here, man. Wrote half a chorus while I waited. It's about waiting.",
          "Just holding the spot down. Somebody's gotta look cool right here."
        ],
        "lo": "You said wait, I'm waiting. Not for long, though. I've got fans. Somewhere.",
        "hi": "I knew you'd come back for me, {player}. I only doubted it like four times."
      },
      "rain": {
        "any": [
          "Hear that rain, man? That's a free drum track. I'm stealing it.",
          "My chain's getting wet. It's fine. Real gold doesn't mind. Probably real."
        ],
        "lo": "Rain. Not great for the hair, but I'm keeping it cool in front of company.",
        "hi": "Rain on leaves is the best opening act, {player}. Glad somebody else is hearing it."
      },
      "thunder": {
        "any": [
          "Whoa. That thunder's got bass. I wasn't startled, I was feeling the rhythm.",
          "Sky's doing a drum solo. Little long, man. Somebody tell it to wrap up."
        ],
        "lo": "Loud storm. I'm chill. I'm just standing closer to the wall for the acoustics.",
        "hi": "Okay, {player}, truth? Thunder gets me every time. I'm standing next to you for a reason."
      },
      "full_moon": {
        "any": [
          "Full moon, full spotlight. Best lighting I get all month.",
          "I howled at one of those once. A wolf howled back and fixed my pitch."
        ],
        "lo": "Big moon. Bright enough to see what's coming. Not scared. Just informed.",
        "hi": "Moon's out, you're out, voice is warm. This is the good stuff, {player}."
      },
      "dark_moon": {
        "any": [
          "No moon, man. Can't even see my own chain shining. That's how dark it is.",
          "Pitch black. Good for stars, bad for knowing what's behind you."
        ],
        "lo": "Real dark tonight. I'm not nervous, I'm alert. There's a difference.",
        "hi": "Between us, {player}, I don't love nights this black. Glad it's you standing there."
      },
      "dawn": {
        "any": [
          "Sun's coming up. That's my curtain call, man.",
          "Sunrise. Pretty. Also the world telling me my shift's over."
        ],
        "lo": "Dawn already. Most people are waking up. I'm clocking out, basically.",
        "hi": "I always catch the sunrise on the way to bed, {player}. Nice to share one for once."
      },
      "dusk": {
        "any": [
          "There it goes. Sun down, voice up. I can feel the high notes coming back.",
          "Sunset's like the house lights dimming, man. Show's about to start."
        ],
        "lo": "Evening's coming on. That's when I get interesting. Stick around or don't.",
        "hi": "Golden hour, {player}. Sky's wearing more gold than I am, and I respect it."
      },
      "nether": {
        "any": [
          "Yo, it's hot. And that thing just screamed at me. I'm calm. I'm so calm.",
          "Gold glinting in the walls down here, man, and everything near it looks angry."
        ],
        "lo": "You brought me to the Nether? We just met. This is a lot, man.",
        "hi": "{player}, you're my guy, but next time pick somewhere without an ocean of lava."
      },
      "the_end": {
        "any": [
          "No sky, no floor past the edge, tall dudes staring. I'm not looking back at them.",
          "Quietest place I've ever been. One whisper would echo forever out here."
        ],
        "lo": "This place is creepy, man. Not scared. I just want that on the record.",
        "hi": "I'm only this far out because of you, {player}. My knees are singing backup."
      },
      "fishing_sky": {
        "any": [
          "Floating islands, man. I sang up here once and the clouds clapped. True story.",
          "Fishing pools in the sky. Think there's a pufferfish in one? I'd say hi."
        ],
        "lo": "High up, huh. I'm fine. I'm just standing in the middle on purpose.",
        "hi": "This view's a whole album cover, {player}. You and me on the front, obviously."
      },
      "acufend": {
        "any": [
          "These creatures love music, man. Finally, an audience with taste.",
          "A jungle moon full of little music fans. I might never leave."
        ],
        "lo": "Everybody here's humming along. You should've told me, I'd have warmed up.",
        "hi": "{player}, they're dancing to my humming. Don't tell the crocodiles I've got a second crowd."
      },
      "cave": {
        "any": [
          "Deep down here, man. Go deep enough and it's Warden country. Respect.",
          "Caves have wild echo. One note and I'm a whole choir."
        ],
        "lo": "It's dark and it's drippy. I'm cool. I'm just gonna walk exactly where you walk.",
        "hi": "If we see diamonds, {player}, I saw them first. If we see anything else, you did."
      },
      "high_up": {
        "any": [
          "Way up, man. I can see my house. That's not my house. I can see a house.",
          "Good spot for a big note. It'd carry for miles from here."
        ],
        "lo": "That's a long drop. I'm chill. I'm also not going any closer.",
        "hi": "Top of the world with my best audience. Don't let me lean over, {player}."
      },
      "hostile_near": {
        "any": [
          "Yo. Something's groaning over there and it's way off key.",
          "Monster, man. I'm not scared. My feet are just pointed the other way."
        ],
        "lo": "There's a thing close by. You've got this, right? I'm more of a vocals guy.",
        "hi": "{player}, behind you. Ish. I'll hype you up from back here, loudly."
      },
      "creeper_near": {
        "any": [
          "Creeper. That hiss is the one sound I never want in a song.",
          "Green guy, real close. I'm calm. I'm backing up calmly."
        ],
        "lo": "Uh, that's a creeper, man. I don't know you well enough to blow up together.",
        "hi": "{player}, creeper. I'd write you a tribute song, but I'd rather not have to."
      },
      "villager_near": {
        "any": [
          "Villagers, man. They all go hmm. One note. Whole village on one note.",
          "I tried to teach a villager a chorus once. He traded me a look."
        ],
        "lo": "Nice village. They don't know who I am here. Yet.",
        "hi": "Watch, {player}. I'll hum and see if one of them hums back. Never works. One day."
      },
      "pet_near": {
        "any": [
          "Your little buddy's staring at my chain. Good taste, pal.",
          "Cool pet. Bet it sings. Everything sings if you listen right."
        ],
        "lo": "That yours? Looks loyal. I'm more of a crocodile person, but respect.",
        "hi": "Your pet likes me, {player}. Animals know talent. Or it smells my lunch."
      },
      "farm_animal_near": {
        "any": [
          "Farm animals. Any second someone's gonna hand me a bucket. I'm staying over here.",
          "That chicken's got better rhythm than some drummers I know."
        ],
        "lo": "Cows and sheep and stuff. Not really my scene, man. I'm more of a midnight guy.",
        "hi": "Don't let anyone give me chores, {player}. These hands are for snapping on the beat."
      },
      "zoo_animal_near": {
        "any": [
          "Yo, the {species}. Look at that. Total star. Doesn't even need a stage.",
          "That {species} just nodded at me. We go way back. Since a minute ago."
        ],
        "lo": "That's a cool {species}. I'm basically an expert. Ask me nothing.",
        "hi": "I'm writing the {species} a theme song, {player}. You're in the second verse."
      },
      "guests_crowd": {
        "any": [
          "Look at this crowd, man. They came for the animals, but they're staying for me. Probably.",
          "Lot of people. I'm keeping my eyes moving. Crowds are where the weird stuff happens."
        ],
        "lo": "Big crowd. Don't worry, I won't sign anything unless they ask.",
        "hi": "A crowd this size and no stage, {player}. That's a waste of a good audience."
      },
      "residents_crowd": {
        "any": [
          "Whole neighbourhood's here. That's basically a sold out show for this town.",
          "Everybody I know in one spot. Half of them owe me a compliment."
        ],
        "lo": "Lot of locals around. They'll tell you stories about me. All true. Most.",
        "hi": "Out of this whole crew, {player}, you're the one I'd put on the guest list first."
      },
      "other_resident": {
        "any": [
          "That's {other}. We're tight. I mean, we've nodded. That counts.",
          "{other} came to one of my shows once. Left early. Too emotional, I assume."
        ],
        "lo": "You know {other}? Cool. Whatever {other} says about me, the good parts are true.",
        "hi": "Don't tell {other}, {player}, but you're still my favourite person on this street."
      },
      "other_player": {
        "any": [
          "Yo, {other}. Two of you now? The audience is doubling. Love to see it.",
          "Who's {other}? Looks cool. Not as cool as me, but that's a high bar."
        ],
        "lo": "Hey, {other}. I'm Jared. You've probably heard of me. No? Give it time.",
        "hi": "Is {other} with you, {player}? Then {other} gets the front row too. Right behind you."
      },
      "alone_night": {
        "any": [
          "Just us and the night, man. No crowd. Honestly, sometimes that's the best show.",
          "Dead quiet. I can hear my own heartbeat. Decent tempo."
        ],
        "lo": "Nobody around but us. I'm staying sharp. No offence, I always do.",
        "hi": "Nobody's listening, {player}, so here's something real. I'm glad you stuck around."
      },
      "by_water": {
        "any": [
          "Water's calm, man. Half of me hopes a croc floats by. The other half is a coward.",
          "I skip stones to a beat. Four skips, that's a full bar."
        ],
        "lo": "Nice water. I'd sing to it, but I don't do free shows for new faces.",
        "hi": "Sat by water like this when I wrote my best song, {player}. You haven't heard it. Nobody has."
      },
      "by_lava": {
        "any": [
          "That lava's glowing like stage lights, man. Stage lights that would end my career.",
          "Hot. Very hot. I'm sweating right through my cool."
        ],
        "lo": "Lava. I'm good right here. Like, way back right here.",
        "hi": "You're kinda close to that, {player}. I've got one best listener and no backup."
      },
      "by_flowers": {
        "any": [
          "Flowers, man. I'd pick one for my jacket, but the bees look like they're on security.",
          "Smells good here. Like a dressing room, if I had a dressing room."
        ],
        "lo": "Nice flowers. People throw these at me on stage all the time. Sometimes. Once.",
        "hi": "Love songs always mention flowers, {player}. Now I get it. Don't make it weird."
      },
      "by_fire": {
        "any": [
          "Campfire, man. Best stage ever built. Everybody sits close and nobody leaves early.",
          "Fire's crackling in time. Listen. That's a snare drum right there."
        ],
        "lo": "Fireside's where I do the slow songs. You'd have to earn one of those.",
        "hi": "Fire's lit and it's just us, {player}. Okay. I'll do the slow one. Quietly."
      },
      "by_crops": {
        "any": [
          "Crops. Somebody worked hard on these. Couldn't be me, man.",
          "I tried farming once. Planted a seed, waited ten minutes, quit."
        ],
        "lo": "Farmland. I'm just passing through. Nobody hand me a hoe.",
        "hi": "If you grew these, {player}, respect. I'd help, but I've got this thing called not wanting to."
      },
      "by_books": {
        "any": [
          "So many books. I read one once. Okay, I held one once.",
          "Books, man. Songs are just short books you can dance to. I'll stick with those."
        ],
        "lo": "Reading's not my thing. I keep my lyrics in my head. Can't lose them there.",
        "hi": "If one of those has a good line in it, {player}, tell me. I'll turn it into a chorus."
      },
      "in_snow": {
        "any": [
          "Snow, man. Cold air's rough on the voice. I'm humming just to stay warm.",
          "My chain's freezing against my neck. Fashion costs."
        ],
        "lo": "Chilly. I'm fine. That shiver was a dance move.",
        "hi": "Next time we do snow, {player}, I'm wearing two jackets and complaining half as much."
      },
      "holding_gift": {
        "any": [
          "Yo, is that a {item}? Not staring. Okay, I'm staring a little.",
          "That {item} in your hand, man. That's got my whole style written on it."
        ],
        "lo": "Nice {item}. I've got like ten of those at home. I've got zero. It's nice.",
        "hi": "{player}, that {item} is so me it hurts. No pressure. I'm just standing here, liking it."
      },
      "holding_weapon": {
        "any": [
          "Whoa, a {item}. Just keep the pointy part aimed at not me.",
          "You look ready for trouble, man. I'm ready to watch you handle it."
        ],
        "lo": "That's a serious {item}. We're cool, right? We're cool.",
        "hi": "You with that {item}, me with the vocals. We're a band, {player}. A dangerous one."
      },
      "holding_food": {
        "any": [
          "Is that {item}? A singer's gotta eat, man. I'm just saying that out loud.",
          "Food smells good. My stomach just hit a note I can't."
        ],
        "lo": "Eating? Don't mind me. I only stare at food when I'm awake.",
        "hi": "You always have the good snacks, {player}. That {item} is singing to me."
      },
      "holding_rod": {
        "any": [
          "Fishing rod, huh. If a pufferfish bites, say hi from me.",
          "I fished once, man. Caught a boot. Great boot. Still got it. Don't check."
        ],
        "lo": "Going fishing? Cool. I'd come, but sitting quiet isn't really my brand.",
        "hi": "I'll sing while you fish, {player}. Fish love me. They can't leave, but still."
      },
      "holding_tool": {
        "any": [
          "A {item}. You're about to do work, I can feel it. I'll supervise.",
          "Tools, man. Respect to anyone who uses those on purpose."
        ],
        "lo": "That {item} looks heavy. I'd offer to carry it, but then I'd have to carry it.",
        "hi": "If that {item} ever turns up gold, {player}, think of your shiniest friend."
      },
      "armored": {
        "any": [
          "Full armor, man. You're shinier than my chain right now and I'm not okay with it.",
          "You clank when you walk. That's percussion. Keep that tempo."
        ],
        "lo": "All suited up, huh. Should I be worried, or is this just your look?",
        "hi": "Good. Dressed like that, {player}, the scary stuff goes for you first. Kidding. Mostly."
      },
      "hurt": {
        "any": [
          "Yo, you look rough, man. Like, end of a three night tour rough.",
          "You're really beat up. I'm staying calm for both of us, okay?"
        ],
        "lo": "Hey, uh, you're hurt pretty bad. I barely know you and I'm still worried.",
        "hi": "{player}, no jokes. You're hurt and I don't like it. I'm not going anywhere."
      },
      "wet": {
        "any": [
          "You're soaked, man. Dripping on the beat, though. I'll give you that.",
          "Did you fall in, or was that a choice? Either way, bold look."
        ],
        "lo": "You're all wet. I'd lend you my jacket, but it's my only cool one.",
        "hi": "{player}, you look like a cat that fell in a pond. A cool cat. The coolest one."
      },
      "sneaking": {
        "any": [
          "Why are we crouching, man? Is something here? I'm crouching too.",
          "Sneaky. I saw you, though. I'm alert like that. Nothing gets past me."
        ],
        "lo": "You creeping up on me? Not cool, man. I almost hit a high note.",
        "hi": "Whispering, {player}? Okay, I'm in. What are we hiding from? Say it's not a snake."
      },
      "long_time": {
        "any": [
          "Yo, where've you been? I wrote like three songs since we talked. One's finished. Almost.",
          "Been days, man. I started telling people you were on tour."
        ],
        "lo": "Oh, hey. Thought you forgot about me. Happens to the big names too.",
        "hi": "{player}! You vanished, man. I had jokes saved up and nobody to waste them on."
      },
      "first_today": {
        "any": [
          "Yo, there you are. Day just got a little better. Night. Whatever it is.",
          "Hey, man. First words I've said out loud today that weren't lyrics."
        ],
        "lo": "Oh, hey. It's you. Cool. I'm doing great, thanks for almost asking.",
        "hi": "There's my favourite face. I was saving my first hello of the day for you, {player}."
      },
      "zoo_busy": {
        "any": [
          "Zoo's packed, man. That's what happens when word gets out that I hang here.",
          "Look at all these people. The crocs are loving the attention. I can tell."
        ],
        "lo": "Busy place today. You're doing something right. I notice things.",
        "hi": "Full house, {player}. I've never sold out anything, so I'm living through you."
      },
      "zoo_empty": {
        "any": [
          "Nobody here, man. I've played rooms like this. You sing anyway.",
          "Empty zoo. Just me and the pufferfish. Honestly, it's kind of exclusive."
        ],
        "lo": "No guests, huh. Quiet. Don't sweat it, crowds are flaky.",
        "hi": "Hey, {player}, empty today doesn't mean empty tomorrow. I'd know. Ask my first ten shows."
      },
      "zoo_closed": {
        "any": [
          "Closed, huh. That's cool. The animals need a night off stage too.",
          "Gates are shut. I respect a venue that knows when to rest."
        ],
        "lo": "Zoo's closed? I'm not mad. I'll just tell people I got a private tour.",
        "hi": "You closed up, {player}? Good. You work too hard. Says the guy who naps till sunset."
      },
      "litter_bad": {
        "any": [
          "Lot of trash on the paths, man. I stepped on something and it crunched in the wrong key.",
          "This litter's killing the vibe. The crocs deserve a cleaner walk-up."
        ],
        "lo": "Not to be that guy, but it's kind of messy out here.",
        "hi": "{player}, real talk, the paths are a mess. I'm telling you because you'd tell me."
      },
      "stars_high": {
        "any": [
          "Great rating, man. I've been saying this place was a hit since day one. Day three.",
          "Top stars. This zoo's bigger than me now. Almost."
        ],
        "lo": "I hear the zoo's rated real high. Nice. I only hang at quality spots.",
        "hi": "Look at you, {player}, with all those stars. Remember me when you're famous. More famous."
      },
      "stars_low": {
        "any": [
          "Rating's low, huh. Critics, man. They walked out on my best song too.",
          "One star? That's one more than my first show got."
        ],
        "lo": "Heard the reviews aren't great. I've had worse. I just don't tell people.",
        "hi": "Forget the stars, {player}. I know what's good, and I keep coming back here."
      },
      "coins_low": {
        "any": [
          "Coins running low, man? Been there. I once paid for dinner with a song.",
          "Tight on Zoo Coins. Every star had a broke chapter. That's the good verse."
        ],
        "lo": "Money's thin, I hear. I'd spot you, but this chain is mostly for show.",
        "hi": "{player}, if I had a pile of gold, I'd split it with you. I've got a chain and a good attitude."
      },
      "animal_sick": {
        "any": [
          "One of the animals isn't doing good, man. It's got that quiet look. I don't like it.",
          "Something's off with one of them. Even I can't joke about that."
        ],
        "lo": "Hey, one of your animals looks rough. Thought you'd want to know.",
        "hi": "{player}, one of them's hurting. No story, no punchline. That one's bugging me for real."
      }
    },
    "near": {
      "zach": [
        "Zach and me share the night shift, {player}. Zach hits the high notes. I hit the cool ones.",
        "Zach says we should do a duet. I said sure. I've been busy for a year."
      ],
      "ron": [
        "Ron keeps saying fresh air and hard work, man. I heard fresh air and stopped listening.",
        "Ron knows every bird by its song. I asked which one sounds like me. Ron took a while."
      ],
      "tim": [
        "Tim's a zombie who reads for fun. That's two scary things in one suit, man. Nice guy, though.",
        "Tim reviewed my lyrics once. Said they were brief. I'm taking it as a compliment."
      ]
    }
  },
  "amanda": {
    "intro": "Hello! I'm Amanda, and I'm a geologist. I study rocks, layers and anything that sat still long enough to be interesting. Pandas too, but that's a hobby. Ask me things!",
    "scenes": {
      "home_morning": {
        "any": [
          "Good timing! I'm packing my sample bag. Hammer, hand lens, notebook, spare notebook.",
          "Come in, mind the rocks on the floor. They're sorted by hardness, so please don't nudge them."
        ],
        "lo": "Oh! A visitor before breakfast. I have a short lecture ready for exactly this.",
        "hi": "{player}! You're early, which means you get the breakfast fact. It's about basalt today."
      },
      "home_evening": {
        "any": [
          "I'm labelling today's samples. Eleven so far, and one I can't identify. It's infuriating.",
          "Evenings are for writing up notes. And tea. Mostly notes."
        ],
        "lo": "It's a bit late for visiting hours, but I'll allow one question.",
        "hi": "Stay a minute, {player}. I found a striped pebble and nobody else will appreciate it properly."
      },
      "walking_to_zoo": {
        "any": [
          "I'm walking to the zoo and counting rock types in the path. Four so far!",
          "This gravel is fascinating if you look closely. Nobody ever does. I do."
        ],
        "lo": "Off to see the pandas. I walk briskly, so I can only spare you a moment.",
        "hi": "I was rehearsing panda facts out loud, {player}. You've just saved a passing sheep from the lecture."
      },
      "at_zoo": {
        "any": [
          "I read every sign in this zoo. Two of them could use a footnote.",
          "Exhibits are just classrooms with better smells. Well, different smells."
        ],
        "lo": "Do you know much about these animals? No? Good. I mean, oh dear. I can help.",
        "hi": "I love touring this place with you, {player}. You ask why, and why is my favourite word."
      },
      "walking_home": {
        "any": [
          "Heading home with a full notebook and sore feet. A successful field day!",
          "I counted the pandas three times on the way out. For accuracy. And for fun."
        ],
        "lo": "I'm on my way home. I can summarise what I learned today in under an hour.",
        "hi": "The best part of today, {player}? A baby panda sneezed. I've written it up in full."
      },
      "at_work": {
        "any": [
          "Shh, I'm reading the layers. This bank tells a whole story from the bottom up.",
          "I'm in the middle of a survey! Tap, listen, write it down. That's the whole method."
        ],
        "lo": "I'm working, but education never interrupts. What would you like explained?",
        "hi": "Perfect, {player}, remember this for me: grey, speckled, heavier than it looks. Thanks."
      },
      "following": {
        "any": [
          "Field trip! I've already spotted two outcrops worth a detour.",
          "Keep going, I'm right behind you. I only stopped for one pebble. Three."
        ],
        "lo": "I'm following you for research purposes. I hope we pass something interesting.",
        "hi": "Adventures with you are my favourite fieldwork, {player}. The data's messy but the company's good."
      },
      "following_night": {
        "any": [
          "Night fieldwork is impractical. I can't tell granite from diorite in this light!",
          "I'm staying close. It's not fear, it's sensible risk management."
        ],
        "lo": "I don't normally wander at night with people I've just met. Note my bravery.",
        "hi": "I'd be asleep with a book on my face if it weren't for you, {player}. This is better. Slightly."
      },
      "staying": {
        "any": [
          "Waiting is fine. I've found six kinds of pebble within arm's reach.",
          "I'm still here! I started a sketch of this exact patch of ground."
        ],
        "lo": "I'll wait. Do come back, though. An abandoned geologist is a sad specimen.",
        "hi": "Go on, {player}, I'll be fine. I have a rock, a notebook and complete faith in you."
      },
      "rain": {
        "any": [
          "Lovely! Wet stone shows its true colours. Every pebble looks polished.",
          "My notebook's getting damp. Science has its costs."
        ],
        "lo": "It's raining, yes. I'd explain where it comes from, but you look like you're in a hurry.",
        "hi": "You're getting rained on to talk to me, {player}? That's friendship. Also poor planning."
      },
      "thunder": {
        "any": [
          "Lightning! Count the seconds until the thunder. The longer the gap, the further off it is.",
          "That was a big one. My heart rate just went up, purely as a reflex."
        ],
        "lo": "I know exactly how thunder works and it still makes me jump. Don't mention it.",
        "hi": "I'm standing near you, {player}. Not for comfort. For... yes, all right, for comfort."
      },
      "full_moon": {
        "any": [
          "A full moon! It's all rock, you know. A whole world of geology I can't reach. Annoying.",
          "Excellent visibility tonight. I can nearly read my own handwriting."
        ],
        "lo": "The moon's full. I could tell you about its surface, if you have a spare hour.",
        "hi": "If I ever got one sample from up there, {player}, I'd name the best piece after you."
      },
      "dark_moon": {
        "any": [
          "New moon. No light at all, which is terrible for fieldwork and wonderful for creepers.",
          "I can't see my own boots. I'm identifying rocks by feel, and I'm losing."
        ],
        "lo": "It's very dark. I'm not complaining, I'm reporting conditions.",
        "hi": "I don't like nights this dark, {player}. I like knowing things, and I can't see anything to know."
      },
      "dawn": {
        "any": [
          "Sunrise! The low light picks out every ridge in the hills. Best time to draw a map.",
          "Dawn already. I've been awake a while, thinking about sandstone."
        ],
        "lo": "Up at sunrise? Good. Early risers make the best students.",
        "hi": "You, me and a sunrise, {player}. I'll skip the science of it just this once. Nearly."
      },
      "dusk": {
        "any": [
          "The cliffs go orange at sunset. Same rock, different light. I never get tired of it.",
          "Sun's setting, so I've got minutes left to finish this sketch."
        ],
        "lo": "It's dusk. I should be heading in. Fieldwork in the dark is how people lose hammers.",
        "hi": "I always mean to stop working at sunset, {player}. You're the only thing that actually makes me."
      },
      "nether": {
        "any": [
          "Netherrack everywhere! It's so crumbly. I want twenty samples and a cold drink.",
          "Rock, lava, more rock. Geologically, this is paradise. Otherwise, it's awful."
        ],
        "lo": "You stay near me. I mean, I'll stay near you. This heat is making me polite.",
        "hi": "{player}, look at all this basalt! I'd hug you, but it's far too hot. Thank you for this."
      },
      "the_end": {
        "any": [
          "End stone! Pale, dense, and it shouldn't exist. I have so many questions.",
          "No sky, and no ground past the edge. My maps are useless here. I love it. I hate it."
        ],
        "lo": "Those tall creatures dislike being stared at, I've read. I'm studying the floor instead.",
        "hi": "This is the strangest rock I've ever stood on, {player}, and I'm standing on it because of you."
      },
      "fishing_sky": {
        "any": [
          "Floating islands! What's holding them up? Nobody's told me and I've asked everyone.",
          "Fish, in pools, in the sky. Water animals at this height! I need to sit down."
        ],
        "lo": "I'm staying in the middle of the island. That's caution, not fear. Mostly caution.",
        "hi": "Rocks that float, {player}. Everything I know says no and here we are. Best day ever."
      },
      "acufend": {
        "any": [
          "A round moon with a jungle on it. The creatures sing! I'm taking notes with both hands.",
          "I tapped a rock here and something hummed back. That's not in any of my books."
        ],
        "lo": "I have no facts about this place at all. It's very uncomfortable. Please don't quiz me.",
        "hi": "I don't understand any of this, {player}, and for once I'm enjoying it. Don't tell anyone."
      },
      "cave": {
        "any": [
          "Now we're talking! Look at these layers. We're walking down through time.",
          "Deepslate! The deeper stone is darker and tougher. I could stay all day."
        ],
        "lo": "Finally, my area. Underground with me, you'll learn something every three steps.",
        "hi": "You brought me to a cave, {player}. Some people bring flowers. This is so much better."
      },
      "high_up": {
        "any": [
          "From up here you can see how the whole valley was shaped. It's a map with no paper!",
          "We're standing on the top of a very tall pile of rock. Thrilling, isn't it?"
        ],
        "lo": "Mountains are just rocks being ambitious. That's a joke. A geology joke.",
        "hi": "I'd have climbed this alone for the view, {player}. With you I also get someone to explain it to."
      },
      "hostile_near": {
        "any": [
          "There's a monster over there. I know eleven facts about it and none are comforting.",
          "Hostile creature, close by. I'd like it noted that I spotted it first."
        ],
        "lo": "Monster. I'm a scientist, not a fighter. I'll be observing from behind you.",
        "hi": "{player}, be careful with that one. I've only just got you trained to listen to me."
      },
      "creeper_near": {
        "any": [
          "Creeper! No. Absolutely not. They ruin perfectly good rock formations.",
          "That creeper is hissing. I hate that sound more than I hate beetles."
        ],
        "lo": "A creeper. Worst creature there is. I'm leaving a very large margin.",
        "hi": "{player}, creeper, right there! I refuse to lose my best student to a walking explosion."
      },
      "villager_near": {
        "any": [
          "Villagers! I asked one about the local bedrock. He said hmm. I'm counting it as interest.",
          "A village. Somebody chose every one of these building stones, and I'd like a word with them."
        ],
        "lo": "The villagers never ask me questions. You could set a better example.",
        "hi": "I gave a rock talk in a village once, {player}. They all stayed. Admittedly, they live there."
      },
      "pet_near": {
        "any": [
          "What a well behaved pet! Loyal animals pay close attention. I value that.",
          "Hello, you. No, that's my sample bag. It's rocks. You won't like them."
        ],
        "lo": "Is that yours? It looks healthy. You're clearly more responsible than I assumed.",
        "hi": "Your pet follows you everywhere, {player}. Sensible. So do I, half the time."
      },
      "farm_animal_near": {
        "any": [
          "Farm animals! Useful, calm and not a single extra leg. Unlike insects.",
          "That sheep is standing on a rather nice bit of stone. It has no idea."
        ],
        "lo": "Do you know how long people have kept animals like these? I do. It's ages.",
        "hi": "I named that cow Gneiss, {player}. Because she's nice. You may laugh. Please laugh."
      },
      "zoo_animal_near": {
        "any": [
          "The {species}! I've read everything on this one. The view's best from right here.",
          "Look how the {species} moves. Every bit of it is built for a purpose."
        ],
        "lo": "That's a {species}. I can give you the short lesson or the long one. They're both long.",
        "hi": "Watching the {species} with you teaches me something every time, {player}. Today's lesson: I like this."
      },
      "guests_crowd": {
        "any": [
          "So many guests! That's a lot of people who haven't heard my panda facts yet.",
          "Crowds move like sediment in a stream. Fast in the middle, slow at the edges."
        ],
        "lo": "It's crowded. I'm going to assume at least some of them are clever.",
        "hi": "All these people, {player}, and you're the one I'd pick for a lab partner."
      },
      "residents_crowd": {
        "any": [
          "Everyone's here! It's like a class reunion, except I'm the only one with notes.",
          "The neighbours have gathered. Somebody is going to ask me a question. I can feel it."
        ],
        "lo": "Quite a group. I know everyone's name and what they do, should you need a guide.",
        "hi": "I like them all, {player}, but you're the only one who lets me finish a sentence."
      },
      "other_resident": {
        "any": [
          "Oh, there's {other}. I've explained sedimentary layers to {other} twice. It's going well.",
          "{other} once asked me a question I couldn't answer. I think about it constantly."
        ],
        "lo": "That's {other}. Lovely person. Listens for almost a full minute.",
        "hi": "{other} is nice, {player}, but you're still top of the class. Don't let it go to your head."
      },
      "other_player": {
        "any": [
          "Hello, {other}! Two students at once. I'll have to speak up.",
          "Is {other} with you? Wonderful. Facts are better shared."
        ],
        "lo": "Welcome, {other}. I'm Amanda. I'll be your geologist today.",
        "hi": "{other} seems bright, {player}. You're still my favourite pupil, obviously."
      },
      "alone_night": {
        "any": [
          "It's so quiet. You can hear pebbles settle if you listen. I may be imagining that.",
          "Just us and the dark. I'd normally be asleep, dreaming about strata."
        ],
        "lo": "It's only us out here. I'll fill the silence with facts, if that helps.",
        "hi": "Can I tell you something, {player}? I talk so much because quiet makes me nervous. Not with you."
      },
      "by_water": {
        "any": [
          "Water is the great sculptor! Every smooth pebble here took ages to round off.",
          "Look in the shallows. Something's swimming over the gravel! My two favourite things to stare at."
        ],
        "lo": "Do you know how a river sorts its stones by size? You're about to.",
        "hi": "I could watch this water with you all day, {player}. I'd only explain about half of it."
      },
      "by_lava": {
        "any": [
          "Molten rock! This is where it all begins. Please don't touch the beginning.",
          "Where lava meets water you get obsidian. Black and glassy. Beautiful."
        ],
        "lo": "That's lava. I feel I shouldn't need to explain why I'm standing back, but I will.",
        "hi": "I love lava and I'm very fond of you, {player}, so I'd like the two kept apart."
      },
      "by_flowers": {
        "any": [
          "Flowers are lovely, but they attract bees, and bees are insects. I'm conflicted.",
          "Pretty! The soil must be good here. Soil's mostly rock that kept going."
        ],
        "lo": "Nice flowers. Something is buzzing in them, so I'll admire from here.",
        "hi": "If a bug lands on me, {player}, you're my first line of defence. I trust you."
      },
      "by_fire": {
        "any": [
          "A campfire! Stone holds the heat long after the flames go. I always sit by a rock.",
          "Warm hands, warm facts. Fires are excellent for story time. Rock story time."
        ],
        "lo": "Fire is fast chemistry. I prefer slow geology, but I'll take the warmth.",
        "hi": "This is cosy, {player}. Shall I tell you about volcanoes? No? Just sit? All right. Just sit."
      },
      "by_crops": {
        "any": [
          "Crops! Good farmland starts with good soil, and good soil starts with rock. Always rock.",
          "Tidy rows. I respect any system with straight lines and a clear plan."
        ],
        "lo": "Farming is applied science. I hope whoever grows these takes notes.",
        "hi": "If these are yours, {player}, well done. Top of the class in dirt."
      },
      "by_books": {
        "any": [
          "Books! I've read most of what's written about stone. I disagree with some of it.",
          "Bookshelves make me so happy. All those answers, standing in a row."
        ],
        "lo": "Do you read? It's a fair question. Not everyone does, sadly.",
        "hi": "One day I'll write my own book, {player}. You'll be on the thank you page. Line one."
      },
      "in_snow": {
        "any": [
          "Snow! Ice counts as a mineral, technically. Really, it does!",
          "My fingers are too cold to hold a pencil. This is a research emergency."
        ],
        "lo": "It's freezing. I'll keep the lecture short. That's a first.",
        "hi": "I can't feel my nose, {player}, but I found a frozen pebble, so it's worth it."
      },
      "holding_gift": {
        "any": [
          "Oh! Is that a {item}? I'm not hinting. I'm observing. Closely.",
          "That {item} is exactly the sort of thing I'd write three pages about."
        ],
        "lo": "What an interesting {item}. I'd study that for hours, if it were mine. Which it isn't.",
        "hi": "{player}, you're holding a {item} and looking at me. My hypothesis is very hopeful."
      },
      "holding_weapon": {
        "any": [
          "That {item} looks sharp. I only carry a rock hammer, and it's for rocks.",
          "You're armed. Statistically, that makes this a safer walk for me."
        ],
        "lo": "I'd rather that {item} pointed away from the samples. And from me.",
        "hi": "I feel very protected next to you and that {item}, {player}. I'll handle the thinking."
      },
      "holding_food": {
        "any": [
          "Is that {item}? Brains run on food, you know. Mine's running low.",
          "Eating in the field! Very practical. I always forget lunch when I find a good rock."
        ],
        "lo": "You've brought food. Sensible. More sensible than I expected, honestly.",
        "hi": "You remembered to eat, {player}. I'm proud. My lunch bag had a pebble in it today and nothing else."
      },
      "holding_rod": {
        "any": [
          "Fishing! Water animals are my second favourite subject. Third. After rocks and pandas.",
          "A fishing rod. I'd be dreadful at that. I'd keep looking at the gravel."
        ],
        "lo": "Do you know what lives in these waters? I have a list. It's alphabetical.",
        "hi": "I'd love to hear what you catch, {player}. I'm keeping a tally in the notebook about you."
      },
      "holding_tool": {
        "any": [
          "A {item}! Now that's a proper field instrument. May I ask what you're digging for?",
          "Tools like that are how we meet the rocks under our feet. I approve entirely."
        ],
        "lo": "I hope that {item} gets used carefully. Good specimens get ruined by careless swings.",
        "hi": "If that {item} turns up anything odd, {player}, I'd love a look. I'll be unbearable about it."
      },
      "armored": {
        "any": [
          "Full armor! That's material dug out of the ground, wrapped round a person. Geology you can wear.",
          "You're very well protected. I approve of anyone who prepares properly."
        ],
        "lo": "All that armor. Either you're careful or you're expecting trouble. I'd like to know which.",
        "hi": "Good. I've told you a hundred times to be careful, {player}, and this is the first proof you heard."
      },
      "hurt": {
        "any": [
          "You're badly hurt! That's not an opinion, that's an observation.",
          "You look terrible. I mean that in the most caring, factual way."
        ],
        "lo": "Excuse me, you're injured. I'm not a doctor, but I can count, and that's a lot of scratches.",
        "hi": "{player}, you're really hurt. I can't lecture you if you fall over, so please look after yourself."
      },
      "wet": {
        "any": [
          "You're soaked! Water finds every gap. That's erosion, and now it's your boots.",
          "Dripping wet. You look like something I'd study in the water exhibit."
        ],
        "lo": "You're standing in water. I assume there's a reason. I'd love to hear it.",
        "hi": "You're drenched, {player}. Keep the drips off my notebook and I'll forgive you anything."
      },
      "sneaking": {
        "any": [
          "Why are you crouching? Is there a rare pebble down there? There is, isn't there.",
          "Oh, you're down at pebble height. That's my favourite height."
        ],
        "lo": "You're creeping about. I can see you perfectly well, for the record.",
        "hi": "Are we hiding, {player}? From what? Tell me it isn't a bug. Tell me now."
      },
      "long_time": {
        "any": [
          "There you are! It's been days. I've stockpiled facts and they're starting to pile up.",
          "You've been gone a while. I kept a list of things to tell you. It's two pages."
        ],
        "lo": "Oh, hello again. I wondered where you'd gone. Purely out of curiosity.",
        "hi": "{player}! I missed you. I tried explaining things to a rock. It didn't nod once."
      },
      "first_today": {
        "any": [
          "Hello! First fact of the day: you're here. Second fact pending.",
          "Good, you're up and about. I've been wanting to tell someone about a pebble."
        ],
        "lo": "Hello. Lovely day for learning something, don't you think?",
        "hi": "{player}, hi! I saved today's best fact for you. It's about pandas. It's always about pandas."
      },
      "zoo_busy": {
        "any": [
          "The zoo's packed! Think of all the learning happening. I can barely stand it.",
          "So many guests. I answered four questions at the panda exhibit. Nobody asked, but still."
        ],
        "lo": "It's very busy. You must be doing something right. I'd like to know your method.",
        "hi": "Look at this turnout, {player}! I said people would come. I'm keeping a record of being right."
      },
      "zoo_empty": {
        "any": [
          "No guests at all. More room at the panda exhibit for me, but still, a pity.",
          "It's so empty I can hear the fish. Not literally. Fish are very quiet."
        ],
        "lo": "Nobody's here. That's an interesting data point. Not a happy one.",
        "hi": "An empty day isn't a failed day, {player}. It's one result. You need more than one to draw a line."
      },
      "zoo_closed": {
        "any": [
          "Closed? But I had a schedule. Pandas first, elephants second, notes third.",
          "The zoo's shut. I suppose even institutions need a day to themselves."
        ],
        "lo": "I see it's closed to guests. I'll write my observations from memory, then.",
        "hi": "Closed today, {player}? Good. You never rest. I've been tracking it."
      },
      "litter_bad": {
        "any": [
          "There's rubbish all over the paths. Litter draws insects, and I draw the line at insects.",
          "I tripped on some rubbish while reading a sign. The paths are in a state."
        ],
        "lo": "I don't mean to criticise, but the litter is noticeable. I've noticed it.",
        "hi": "I'll be honest because we're friends, {player}. The paths are filthy and it's upsetting me. Deeply."
      },
      "stars_high": {
        "any": [
          "A top rating! I'm not surprised. I'd have given it that myself, with footnotes.",
          "Everyone's praising the zoo. Evidence based praise is the best kind."
        ],
        "lo": "Your zoo is rated very highly. I checked the reasons, and they hold up.",
        "hi": "Top marks, {player}! I'd say I taught you well, but this one's all you."
      },
      "stars_low": {
        "any": [
          "The rating's poor. A low score just shows you where to look. That's what data's for.",
          "One star? I got one answer wrong on a test once. Once. I still think about it."
        ],
        "lo": "The reviews aren't kind. I have theories about why, if anyone ever wants them.",
        "hi": "Don't take the rating to heart, {player}. I've seen how hard you work. The stars are just behind."
      },
      "coins_low": {
        "any": [
          "Low on Zoo Coins? Even a diamond starts out as something plain under pressure.",
          "Funds are thin, I hear. I've run whole surveys on a pencil and stubbornness."
        ],
        "lo": "I gather money's tight. I'm no banker, but I'm sorry to hear it.",
        "hi": "I'd sell my rock collection for you, {player}, but honestly it's worth nothing to anyone but me."
      },
      "animal_sick": {
        "any": [
          "One of the animals isn't well. I can tell, and I don't like what I'm observing.",
          "Something's wrong with one of them. It's not behaving the way the books say."
        ],
        "lo": "I'm sorry to point it out, but one of your animals looks poorly.",
        "hi": "{player}, one of them is unwell and I can't fix it with a fact. I hate that. I know you'll help it."
      }
    },
    "near": {
      "dave": [
        "Dave digs up wonderful rocks and calls every one of them a grey one. Dave, they have names!",
        "I'd trade a week of my lectures for one look down Dave's tunnels. Dave says that's a fair deal, oddly."
      ],
      "dr_foss": [
        "Dr. Foss thinks old pots beat old rocks. The rocks were here first, Dr. Foss.",
        "Dr. Foss and I agree on almost nothing, {player}, and we both enjoy it enormously."
      ],
      "aloof": [
        "Aloof asked me if rocks are asleep. I said no. Then I thought about it for an hour.",
        "I explain things to Aloof slowly and Aloof laughs. Happy student, so I count it as a lesson."
      ]
    }
  },
  "paola": {
    "intro": "I'm Paola. I cut trees for a living, and I'm good at it. I say what I think, so don't ask unless you want the answer. That's the introduction.",
    "scenes": {
      "home_morning": {
        "any": [
          "You're at my door before I've picked up the axe. This had better be worth standing for.",
          "Morning. I'm sharpening the blade. Talk while I work."
        ],
        "lo": "I don't take visitors this early. You're in the doorway, so be brief.",
        "hi": "{player}. Come in, take the other chair. It's the only other chair, so feel honoured."
      },
      "home_evening": {
        "any": [
          "I'm in my chair and I intend to stay in it. Say it from there.",
          "Feet up, door shut, axe on the wall. This is the good part."
        ],
        "lo": "It's late for knocking. I'll hear you out, sitting down.",
        "hi": "You can stay, {player}. I'll even let you be quiet with me. That's my best offer."
      },
      "walking_to_zoo": {
        "any": [
          "I'm walking to the zoo. Whoever put it this far from my house owes me an apology.",
          "Halfway there. I counted the steps. Too many."
        ],
        "lo": "Yes, I'm going to your zoo. I stopped here for my legs, not for conversation.",
        "hi": "If there's a new baby in there today, {player}, this walk is forgiven. If not, I'm blaming you."
      },
      "at_zoo": {
        "any": [
          "I've seen four exhibits and three benches. The benches are winning.",
          "It's a show with no tickets and no bad seats. I'll allow it."
        ],
        "lo": "Your zoo is fine. I'd say if it wasn't. Believe me.",
        "hi": "You did well with this place, {player}. I don't hand that out, so take it."
      },
      "walking_home": {
        "any": [
          "I'm going home. There's a chair waiting, and it's been patient all day.",
          "The zoo was good. The walk back is the price. I'm paying it under protest."
        ],
        "lo": "I'm on my way home. Don't slow me down, I've only got so many steps left.",
        "hi": "A baby animal yawned at me today, {player}. I'm only telling you. I've got a reputation."
      },
      "at_work": {
        "any": [
          "I'm mid swing. Stand behind me, not in front. Trees fall where they like.",
          "Third trunk today. Oak's stubborn. So am I."
        ],
        "lo": "I'm working. If this isn't urgent, it can wait for the stump.",
        "hi": "{player}. Good. I was due a break, and you're my excuse to take it."
      },
      "following": {
        "any": [
          "How far is this? Give me the honest number, not the cheerful one.",
          "I'm following. I'm also keeping a list of every hill, for later."
        ],
        "lo": "I agreed to come. I didn't agree to enjoy it. We'll see.",
        "hi": "I don't walk this far for anyone, {player}. Notice that I'm walking."
      },
      "following_night": {
        "any": [
          "It's dark, I'm tired, and we're still walking. I'm noting all three.",
          "Night walks. Whoever invented them never chopped wood all day."
        ],
        "lo": "Out at night with someone I barely know. I've made better decisions.",
        "hi": "I'd be asleep by now, {player}. I chose this instead. Don't make me regret it."
      },
      "staying": {
        "any": [
          "I'm waiting. I found a stump to sit on, so take as long as you like.",
          "Still here. Staying put is the best job you've given me."
        ],
        "lo": "You told me to wait. I wait well. I don't wait forever.",
        "hi": "Go do your thing, {player}. I'll be right here, sitting, perfectly happy about it."
      },
      "rain": {
        "any": [
          "Wet bark, slippery handle. No sensible person chops in this.",
          "It's pouring. I'm watching it from under cover like someone with a brain."
        ],
        "lo": "It's raining. You're out in it. I won't comment on that.",
        "hi": "There's room under here for you, {player}. I don't share my dry spot, so this is a moment."
      },
      "thunder": {
        "any": [
          "Thunder. Lightning likes tall trees. I like not being under them today.",
          "That was loud. The sky's putting on a show. I prefer shows that stay on a stage."
        ],
        "lo": "Storm's bad. I'm not scared of it. I'm realistic about it.",
        "hi": "I've seen what lightning does to an oak, {player}. I'd rather it never met you."
      },
      "full_moon": {
        "any": [
          "Full moon. Bright enough to count tree rings by. I won't. I'm off duty.",
          "It's a decent moon. Free light, free show. I'll give it that."
        ],
        "lo": "Big moon. Yes, I see it. No, I don't have a speech about it.",
        "hi": "Fine. It's beautiful, {player}. I said it. I'd enjoy it more sitting down."
      },
      "dark_moon": {
        "any": [
          "No moon. I can't see my own hands. I'm not swinging an axe at anything tonight.",
          "Black as a burnt log out here. I don't like it and I won't pretend to."
        ],
        "lo": "It's pitch dark. I'm staying exactly where I know the ground.",
        "hi": "I can't see a thing, {player}. Keep talking so I know where you are."
      },
      "dawn": {
        "any": [
          "Sunrise. The woodlot's best in this light. Long shadows, cool air.",
          "The sun's up. So am I. One of us is happy about it."
        ],
        "lo": "It's dawn. You're awake too. At least you're not lazy.",
        "hi": "Early light and no one talking nonsense. And you. That's a good start, {player}."
      },
      "dusk": {
        "any": [
          "Sunset. The axe goes down when the sun does. That's the rule.",
          "Look at that sky. Free entertainment, front row, no queue."
        ],
        "lo": "Sun's setting. I'm going to watch it. You can watch it too, quietly.",
        "hi": "Best show of the day, {player}, and I saved you a seat. It's the ground. Sit."
      },
      "nether": {
        "any": [
          "Fire on the floor, fire on the walls, things screaming. Who lives like this?",
          "Not one proper oak in sight. Just red rock and bad ideas."
        ],
        "lo": "You brought me to the Nether. I hate it here. I'm telling you early so it's clear.",
        "hi": "I followed you into this furnace, {player}. Remember that the next time I ask for a short walk."
      },
      "the_end": {
        "any": [
          "No sky. No trees. No benches. This place has nothing I want.",
          "Those tall things keep staring. I've got an axe and an opinion, and I'd rather use neither."
        ],
        "lo": "I don't know you well enough to be standing over a bottomless drop with you.",
        "hi": "It's horrible here, {player}. I'm staying anyway. Work out what that means yourself."
      },
      "fishing_sky": {
        "any": [
          "Islands in the air. At least it's a short walk from one end to the other.",
          "People sit by pools up here and call it an activity. I approve of that completely."
        ],
        "lo": "It's high. I don't look down and I don't discuss it.",
        "hi": "Sitting by a pool in the clouds, {player}. Fine. This is the best place you've dragged me."
      },
      "acufend": {
        "any": [
          "The creatures here make music all day. Finally, somewhere with entertainment built in.",
          "A jungle on a moon. Big trees. I'm looking, not chopping. They've got a nice thing going."
        ],
        "lo": "Strange place. Good music, though. I'll stand here and listen. Quietly, if you don't mind.",
        "hi": "Some of these singers are tiny, {player}. Tiny and musical. I may never forgive you if we leave."
      },
      "cave": {
        "any": [
          "A cave. Damp, dark, and not one tree. I work above ground for a reason.",
          "Every tunnel looks the same and they're all long. This is a walk wearing a disguise."
        ],
        "lo": "I don't like it down here. You didn't ask. There's your answer anyway.",
        "hi": "A bat just flew past my ear, {player}. Small and furry. Fine. The cave gets one point."
      },
      "high_up": {
        "any": [
          "Long climb. Good view. The view doesn't make up for the climb, but it tries.",
          "I can see the whole forest from here. That's a lot of work, looked at all at once."
        ],
        "lo": "We're very high. I'm sitting down away from the edge. Join me or don't.",
        "hi": "You got me up a mountain, {player}. Nobody else alive could say that."
      },
      "hostile_near": {
        "any": [
          "Monster. I don't fight. I'm standing here and letting it know I'm unimpressed.",
          "Something nasty's close. I chop wood, not zombies. Not my trade."
        ],
        "lo": "There's a monster over there. That's your department, I assume. I don't brawl.",
        "hi": "{player}, behind you, more or less. I hate fighting. I'd hate losing you more."
      },
      "creeper_near": {
        "any": [
          "Creeper. If it blows a hole in this ground, I am not walking around it.",
          "That creeper's staring. It can stare. It can also keep its distance."
        ],
        "lo": "There's a creeper. I'm stepping back. What you do is your business.",
        "hi": "{player}. Creeper. I've just got used to you, so don't you dare get blown up."
      },
      "villager_near": {
        "any": [
          "Villagers. They mumble and they haggle. At least they don't make speeches.",
          "Quiet people, short streets, houses close together. A village is a sensible design."
        ],
        "lo": "These villagers mind their own business. I admire that in anyone.",
        "hi": "There's a little villager running in circles over there, {player}. I'm not smiling. That's the light."
      },
      "pet_near": {
        "any": [
          "Is that yours? Small, loyal, doesn't talk. Better than most company.",
          "Your pet's looking at me. Fine. Come here. Just for a second."
        ],
        "lo": "I don't know you, but your animal seems well looked after. That counts for something.",
        "hi": "I like your pet more than I like most people, {player}. You're the exception. Barely."
      },
      "farm_animal_near": {
        "any": [
          "Chickens and sheep. They're useful and they don't pretend to be anything else.",
          "A lamb, or a chick, anything little in there? I'm asking for no reason."
        ],
        "lo": "Farm animals. Plain, steady, no drama. I've no quarrel with any of them.",
        "hi": "If one of those has a baby, {player}, I'm staying right here and you can't move me."
      },
      "zoo_animal_near": {
        "any": [
          "The {species}. Calm, fed, not bothering anybody. More than I can say for people.",
          "I'll say this once. That {species} is well kept. Somebody's doing their job."
        ],
        "lo": "It's a {species}. I can see that. I don't need the tour.",
        "hi": "Will there ever be a little {species}, {player}? I'm asking seriously. I'd be here daily."
      },
      "guests_crowd": {
        "any": [
          "Too many people, all of them walking slowly in front of me.",
          "Every bench is taken. This is my actual nightmare."
        ],
        "lo": "It's crowded. I'm not in the mood, so I'll say hello and nothing else.",
        "hi": "Good, {player}, you're here. You make a decent wall between me and all these elbows."
      },
      "residents_crowd": {
        "any": [
          "The whole street's here. Somebody's going to start a conversation. I can feel it.",
          "All the neighbours at once. I like most of them better one at a time."
        ],
        "lo": "That's a lot of neighbours. I nod at them. That's the arrangement.",
        "hi": "Out of everyone standing here, {player}, you're the one I'd give my seat to. Maybe."
      },
      "other_resident": {
        "any": [
          "That's {other}. We get along because we don't overdo it.",
          "{other} waved at me this morning. I waved back. That's enough for a week."
        ],
        "lo": "You know {other}? Decent. I've nothing bad to say, and I'd say it if I had.",
        "hi": "{other} talks more than you do, {player}. I'm not complaining. I'm comparing."
      },
      "other_player": {
        "any": [
          "Who's this? {other}? Fine. Hello, {other}. That's the greeting.",
          "Two of you now. {other} had better like sitting, or we won't get on."
        ],
        "lo": "I see {other} came along. I'm not repeating my introduction, so pass it on.",
        "hi": "If {other} is your friend, {player}, I'll be polite. Watch closely, it's rare."
      },
      "alone_night": {
        "any": [
          "Nobody around. Good. I think better when no one's performing at me.",
          "It's quiet enough to hear the trees creak. I know that sound. It's a good one."
        ],
        "lo": "Just the two of us and the dark. Don't make it strange. Say what you came to say.",
        "hi": "I'll tell you something, {player}, since it's only us. I'm less hard than I sound. Tell no one."
      },
      "by_water": {
        "any": [
          "Water. Find me a flat rock beside it and I'll sit there till dark.",
          "The river does all the moving so I don't have to. I respect that."
        ],
        "lo": "It's a nice bit of water. I'm looking at it. That's the whole activity.",
        "hi": "Something small just darted under the surface, {player}. Small, busy, quiet. I could watch that all day."
      },
      "by_lava": {
        "any": [
          "Lava. It's fire that learned to walk. I'm staying back.",
          "I work with wood. Wood and that stuff don't mix. Neither do I."
        ],
        "lo": "I'm not going near that, and I don't care how safe you say it is.",
        "hi": "You're too close to it, {player}. I'm not saying it twice. I'm saying it loudly once."
      },
      "by_flowers": {
        "any": [
          "Flowers. They sit in one place and look good. I admire the approach.",
          "Small, quiet, no trouble. If people were more like these, I'd talk more."
        ],
        "lo": "Yes, they're pretty. I do notice things. I just don't announce them.",
        "hi": "There was a bee on that one, {player}. Tiny legs, tiny job. Don't look at me like that."
      },
      "by_fire": {
        "any": [
          "That fire's closer than I'd like. I spend my days around wood. I know how this goes.",
          "A campfire. Everyone loves them. I'm sitting on the far side, upwind."
        ],
        "lo": "I don't like fire. You can stand by it. I'll be over here.",
        "hi": "I'll sit near a fire for you, {player}. Near. Not next to. Don't push it."
      },
      "by_crops": {
        "any": [
          "Crops. Someone bent over all day for these. I'd rather swing an axe.",
          "Straight rows. Somebody cares. I notice good work even when it isn't mine."
        ],
        "lo": "It's a field. It grows. I haven't got more to say about it.",
        "hi": "If you planted this, {player}, it's good work. I don't say that to be nice. I say it because it is."
      },
      "by_books": {
        "any": [
          "Books. Every one of those was a tree. I'm just saying what everyone's thinking.",
          "I like a story if it gets to the point. Most take the scenic route."
        ],
        "lo": "I read. It surprises people. I don't know why and I don't ask.",
        "hi": "I'd read one with a happy ending and small animals in it, {player}. Tell anyone and I'll deny it."
      },
      "in_snow": {
        "any": [
          "Snow. Cold feet, slow walking, frozen trunks. Three complaints, all fair.",
          "Everything's white and quiet. I'll admit the quiet is nice."
        ],
        "lo": "It's freezing. I'm not chatting in this for long, so be efficient.",
        "hi": "I saw small paw prints back there, {player}. Something little lives out here. I'm glad it does."
      },
      "holding_gift": {
        "any": [
          "What's that, a {item}? Hm. I wouldn't hate having one of those.",
          "That {item}. Now that's something worth sitting down with."
        ],
        "lo": "I see the {item}. I'm not asking. I'm only looking at it for a long time.",
        "hi": "That's a {item}, {player}. You know exactly how I feel about those. I'm only pointing it out."
      },
      "holding_weapon": {
        "any": [
          "That {item} can point anywhere it likes, as long as it isn't at me.",
          "I carry an axe for trees. You carry that for other reasons. I don't love it."
        ],
        "lo": "I don't fight and I don't like watching. Just so we understand each other.",
        "hi": "I hate fighting, {player}. If that {item} has to come out, I want you back in one piece."
      },
      "holding_food": {
        "any": [
          "Is that {item}? I've been chopping since sunrise. I'm only asking what it is.",
          "Food. Good. People who skip meals get foolish by afternoon."
        ],
        "lo": "You're eating. Go ahead. I'm not one of those people who needs to be offered.",
        "hi": "You eat standing up, {player}? Terrible habit. Food's better on a bench."
      },
      "holding_rod": {
        "any": [
          "Fishing. An activity that's mostly sitting. Now you're speaking my language.",
          "A rod, a bank, and nowhere to be. Whoever thought of that was a genius."
        ],
        "lo": "You fish? Then you're capable of being still. That's more than most.",
        "hi": "I'd come and watch you fish, {player}. I wouldn't help. I'd sit and criticise."
      },
      "holding_tool": {
        "any": [
          "A {item}. Good. A person with a tool is a person with a plan.",
          "That {item} wants a firm grip and a straight back. I'd know."
        ],
        "lo": "Working? Then I won't keep you. I hate being kept when I'm working.",
        "hi": "That {item} will wear you out if you let it, {player}. Rest is part of the job. I'm an expert."
      },
      "armored": {
        "any": [
          "All that armor. You're expecting a fight. I'm expecting to be elsewhere.",
          "You look like a walking furnace door. It can't be comfortable to sit in."
        ],
        "lo": "That's a lot of metal for a conversation. I'm not that dangerous.",
        "hi": "Good. Wear all of it, {player}. I'd rather you were heavy than hurt."
      },
      "hurt": {
        "any": [
          "You look terrible. I'm not being rude. I'm being accurate.",
          "You're hurt, and badly. Whatever did that, I hope it was worth it."
        ],
        "lo": "I barely know you and even I can see you need patching up.",
        "hi": "You're hurt and I'm furious about it, {player}. I've got one friend. Take better care of them."
      },
      "wet": {
        "any": [
          "You're dripping. On purpose or by accident? Either way, not near me.",
          "Soaked through. You'll squelch for an hour. I can hear it already."
        ],
        "lo": "You're wet. I assume you know. I'm just confirming it.",
        "hi": "Look at you, {player}. Like a kitten that fell in a bucket. I'm not laughing. I am a little."
      },
      "sneaking": {
        "any": [
          "Why are you crouching? I can see you. Everyone can see you.",
          "You're down low. If it's because there's something small and cute, tell me at once."
        ],
        "lo": "I don't like people creeping about near me. Stand up or explain.",
        "hi": "What are we hiding from, {player}? If it's a long walk, I'm hiding too."
      },
      "long_time": {
        "any": [
          "You've been gone for days. I noticed. That's all I'm saying.",
          "Oh, you're back. I had a lot of peace and quiet. Some of it was too much."
        ],
        "lo": "Haven't seen you around. I wasn't counting. It was several days.",
        "hi": "Where were you, {player}? I had complaints saved up and nobody good enough to hear them."
      },
      "first_today": {
        "any": [
          "There you are. Hello. That's today's greeting, use it wisely.",
          "First words I've spent on anyone today. You got them."
        ],
        "lo": "Hello. Yes, I'm in a mood. No, it's not about you. Yet.",
        "hi": "{player}. Good. The day can start properly now. Don't quote me."
      },
      "zoo_busy": {
        "any": [
          "Your zoo's packed. Good for you. Bad for anyone who wants a bench.",
          "I waited behind six people to see one baby animal. I waited. That tells you something."
        ],
        "lo": "It's busy. That means it's working. I can give credit when it's due.",
        "hi": "All these people came for what you built, {player}. I'm proud. I'd be prouder sitting down."
      },
      "zoo_empty": {
        "any": [
          "Nobody here. I've got my pick of every bench. I won't pretend that's bad.",
          "Empty paths. The animals don't care who's watching. Neither would I."
        ],
        "lo": "No guests today. That's a fact, not a criticism. Though it could be both.",
        "hi": "It's empty, {player}. Don't sulk. A slow day isn't a verdict."
      },
      "zoo_closed": {
        "any": [
          "Closed. So I walked all this way for a shut gate. Wonderful.",
          "The zoo's shut. Fine. The animals get a day without being stared at."
        ],
        "lo": "It's closed. I'd have liked to know that before the walk.",
        "hi": "Shut for the day, {player}? Good. You never stop. Sit down for once in your life."
      },
      "litter_bad": {
        "any": [
          "There's rubbish all over the paths. I stepped in something. I'm not saying what.",
          "I clear every chip and branch when I work. Whoever dropped all this could learn from that."
        ],
        "lo": "Your paths are filthy. Someone should say it, so I have.",
        "hi": "I'm telling you because I like you, {player}. The litter's bad. Little animals live near that."
      },
      "stars_high": {
        "any": [
          "Great rating. Deserved. I don't say that about things that aren't.",
          "People love the zoo. For once, people are right."
        ],
        "lo": "I hear it's rated highly. I agree with the rating. That's rare for me.",
        "hi": "Top stars, {player}. I told people you'd do it. I told one person. It still counts."
      },
      "stars_low": {
        "any": [
          "The rating's poor. I won't dress it up. It can be fixed, like most things.",
          "Low marks. People rate fast and think slow. Still, I'd listen to some of it."
        ],
        "lo": "The reviews are bad. I'd rather you heard it plainly than politely.",
        "hi": "The stars are low, {player}. You're better than that score, and I don't flatter."
      },
      "coins_low": {
        "any": [
          "Low on coins. It happens to everyone who builds anything worth having.",
          "Money's short, I hear. I've had winters like that. You get through."
        ],
        "lo": "I heard the zoo's nearly broke. I'm not gloating. I don't gloat.",
        "hi": "You're short on Zoo Coins, {player}, and you still look after everything. That's what I'd count."
      },
      "animal_sick": {
        "any": [
          "One of the animals is unwell. I saw it. I didn't like seeing it.",
          "Something in here is suffering and that's not acceptable to me."
        ],
        "lo": "One of your animals looks ill. I don't care if it's not my place to say so.",
        "hi": "{player}, one of them is poorly. If it's one of the little ones, I won't sleep. I know you'll see to it."
      }
    },
    "near": {
      "carrot": [
        "Carrot bounces everywhere in that bunny suit. It's exhausting to watch. The bunnies adore Carrot, so fine.",
        "Carrot let me hold a rescued bunny once. I gave it back eventually. Under protest."
      ],
      "ash": [
        "Ash grew up in the Nether and came out pleasant. I don't understand it, but I respect it.",
        "Ash offered me shoes made from Nether things. I said no. Nice stitching, though."
      ],
      "carrie": [
        "Carrie knows every path and wants to walk all of them. We disagree on what paths are for.",
        "Carrie leads people to each other's doors. Good. Saves me finding them myself."
      ]
    }
  },
  "dave": {
    "intro": "Name's Dave, mate. I'm a miner, night shift, down where it's dark and quiet. If you smell something, that's me. Or the rock dust. Bit of both.",
    "scenes": {
      "home_morning": {
        "any": [
          "Just in off the night shift, mate. Boots are by the door. I'd keep clear of the boots.",
          "Morning in here means curtains shut. I've nailed a blanket over that window, see."
        ],
        "lo": "Oh, you've come round. Sorry about the state of the place. And the dust on the chair. And the chair.",
        "hi": "{player}! Shove the rocks off that stool, mate. I'll stay up a bit. Bed can wait for you."
      },
      "home_evening": {
        "any": [
          "Evening at mine. Lamp's filled, pick's by the door, sandwich is in my hat. Nearly ready.",
          "Getting dark out the window. That's my alarm clock, that is."
        ],
        "lo": "I'm just getting my kit on for the shift. Don't mind me hopping about, it's the boots.",
        "hi": "You caught me before the shift, mate. Good. I dig better after a natter with you."
      },
      "walking_to_zoo": {
        "any": [
          "Heading up the path to the zoo. Slowly. The daylight's heavy today.",
          "Halfway to the zoo and I've already stopped to look at three pebbles on this path."
        ],
        "lo": "Just walking up to the zoo, mate. I'll keep downwind of you, don't worry.",
        "hi": "Off up to the zoo, {player}. There's a critter in there looks just like my uncle. I'll not say which."
      },
      "at_zoo": {
        "any": [
          "Having a wander round the exhibits. Nice digging went into these pens, I can tell.",
          "I keep looking at the rocks in the exhibits instead of the animals. Habit."
        ],
        "lo": "Just visiting, mate. I wiped my boots before I came in. Mostly.",
        "hi": "Your zoo's grand, mate. I'd say so even if you weren't my friend. But you are, so I say it twice."
      },
      "walking_home": {
        "any": [
          "That's the zoo done. Heading home along the path for a kip before the dig.",
          "Legs are tired from all that level ground. I'm used to tunnels, see."
        ],
        "lo": "Off home now. Nice zoo, that. I didn't touch anything, promise.",
        "hi": "Walking home happy, mate. Saw some cave critters and now I've seen you. Good day, that."
      },
      "at_work": {
        "any": [
          "Hang on, let me rest the pick. Right. This wall's been arguing with me all night.",
          "I'm mid-swing, mate. Forty blocks of stone tonight and one that might be something."
        ],
        "lo": "Oh! Visitor in the mine. Watch the loose gravel. I'm just chipping away, nothing clever.",
        "hi": "{player}, down my mine! Best thing I've found all shift. Don't tell the iron I said that."
      },
      "following": {
        "any": [
          "Still behind you, mate. Squinting, but behind you.",
          "Daylight adventure, eh? I've pulled my hard hat down low. I'm following your boots."
        ],
        "lo": "I'll tag along at the back. You won't hear me. You might smell me.",
        "hi": "Anywhere you're going, I'm going, {player}. Even in this sun. That's friendship, that is."
      },
      "following_night": {
        "any": [
          "Now this is more like it. Dark out, lamp lit, and off somewhere new.",
          "I see fine at night, mate. Years of practice. That shape over there's just a bush. Probably."
        ],
        "lo": "Night walk, is it? Suits me. I'll keep my lamp low so I'm not a bother.",
        "hi": "Out in the dark with my best mate. Feels like a shift, only with better company."
      },
      "staying": {
        "any": [
          "Stood here like a support beam. Holding nothing up, mind.",
          "Waiting. I've counted the stones round my feet. Fourteen. One's a good one."
        ],
        "lo": "I'll stop here, like you said. I'm good at standing still. I do it when the roof creaks.",
        "hi": "I'll hold this spot till you're back, {player}. I've waited longer for a cave-in to clear."
      },
      "rain": {
        "any": [
          "It's coming down. Every drop's going straight down my collar, I swear.",
          "Rain on a hard hat sounds like someone tapping to come in. Don't like it."
        ],
        "lo": "Wet weather, mate. I'll stand under this bit. Rain doesn't even wash the smell off, I checked.",
        "hi": "Soggy out, {player}. If I had my way we'd both be underground till this rain packs it in."
      },
      "thunder": {
        "any": [
          "Hear that thunder? Sounds like a tunnel coming down. Makes my knees go.",
          "Lightning's too bright for me, mate. Like the sun blinking."
        ],
        "lo": "Big storm. I'm not scared, I just flinch at loud bangs. Miner's habit.",
        "hi": "Every bang of that thunder, I check the ceiling. There's no ceiling. Glad you're close, mate."
      },
      "full_moon": {
        "any": [
          "Full moon tonight. Looks like a big lump of quartz someone polished.",
          "Bit bright for night, with that moon. I can see my own boots. Didn't miss them."
        ],
        "lo": "Big moon up, mate. I don't trust a night I can read by.",
        "hi": "See that full moon, {player}? If I could mine it, I'd bring you the shiny half."
      },
      "dark_moon": {
        "any": [
          "No moon at all. Black as a coal seam out here. Lovely.",
          "Proper dark tonight. I can't see my hand, and that's how I like my hand."
        ],
        "lo": "Dark night, mate. If you bump into something that says sorry, that's me.",
        "hi": "Pitch black sky and you beside me. This is what the mine's like, {player}. Now you know why I love it."
      },
      "dawn": {
        "any": [
          "Here comes the sun, creeping up. That's my bedtime knocking.",
          "Sky's going pink. I've got about five minutes before I start squinting."
        ],
        "lo": "Sunrise, mate. Pretty, I suppose. I'm usually asleep before it gets this far.",
        "hi": "I've stayed up past dawn for you, {player}. Don't tell the lads down the mine."
      },
      "dusk": {
        "any": [
          "Sun's dropping behind the hill. Go on, keep going, that's it.",
          "Sunset's the only bit of daytime I clap for."
        ],
        "lo": "Getting dim now. I perk up about this time, sorry if I get chatty.",
        "hi": "Sun's off to bed and I'm waking up, mate. You get the best of me from here on."
      },
      "nether": {
        "any": [
          "Now this is a mine! Hot, dark, rock everywhere. Bit much lava, but still.",
          "Netherrack's soft as cake under a pick. I could tunnel here all week."
        ],
        "lo": "Warm down here, mate. I'll keep my hands off the walls. It's hard, mind.",
        "hi": "{player}, you've brought me somewhere with no sun at all. Best present I've ever had."
      },
      "the_end": {
        "any": [
          "No sun here either, but no ceiling. Feels wrong. Like a cave with the lid off.",
          "End stone. Pale stuff. I tapped it and it sounded hollow all the way down."
        ],
        "lo": "Those tall dark fellas keep looking over. I'm looking at my boots, mate.",
        "hi": "That drop goes down to nothing, {player}. Never thought I'd find a hole too deep for me."
      },
      "fishing_sky": {
        "any": [
          "Islands with nothing under them. Who's holding these up? I'd like a word with them.",
          "Sky above and sky below, mate. And ponds. All my least favourite things in one place."
        ],
        "lo": "I'll stand in the middle of this island, if it's all the same. Away from the edges.",
        "hi": "Only for you would I stand on a floating rock by a fishing pool, {player}. Only for you."
      },
      "acufend": {
        "any": [
          "A round moon with a jungle on it. My gran said moons are cheese. Feels like rock to me.",
          "Those critters hum while they walk. Catchy. I've been tapping my pick along."
        ],
        "lo": "Odd place, mate. I'm keeping quiet in case the music lot want a song off me.",
        "hi": "{player}, the little music fellas clapped when I whistled. First time anyone's clapped me."
      },
      "cave": {
        "any": [
          "Ahh. Smell that? Damp stone and dust. I'm home, mate.",
          "Hear that drip echo? Big chamber ahead. Or a small one. One of the two."
        ],
        "lo": "You're in my office now. I'll try not to go on about the rock. I'll fail.",
        "hi": "Down here with you, {player}, lamp going, stone all round. I couldn't be happier if I struck gold."
      },
      "high_up": {
        "any": [
          "We're a long way above the ground, mate. I'm a long-way-below sort of person.",
          "Wind, sun and a big drop. Mountains are just mines turned inside out, and worse."
        ],
        "lo": "Nice view, I'm told. I'm looking at the rock I'm stood on. It's good rock.",
        "hi": "My knees are knocking, {player}. If I hold your sleeve up here, that's between us."
      },
      "hostile_near": {
        "any": [
          "There's something nasty shuffling about over there. I know that sound from the tunnels.",
          "Monster close by, mate. I've got my pick. It's not for fighting, but it doesn't know that."
        ],
        "lo": "Er, mate. Something's growling behind you. Thought you'd want to know.",
        "hi": "I'll get in front of you, {player}. No, hang on, behind. No. Side by side, then. Monsters hate that."
      },
      "creeper_near": {
        "any": [
          "Creeper! Green one, right there! I've lost two good tunnels to those.",
          "That hissing isn't me, mate. That's the creeper. I'm backing up slowly."
        ],
        "lo": "Don't want to worry you, but there's a creeper staring at us. I've gone all still.",
        "hi": "{player}, creeper! If it pops, I'm not losing my best mate to a walking firework."
      },
      "villager_near": {
        "any": [
          "Villagers. They hum at me and hold their noses. Fair enough.",
          "This village has some nice stonework. I had a proper look at the joins."
        ],
        "lo": "Lot of villagers about. I'll stay at the edge. Don't want to put them off their trading.",
        "hi": "The villagers nod at you, {player}. They sniff at me. You're good cover, mate."
      },
      "pet_near": {
        "any": [
          "That pet of yours keeps sniffing my boots. Brave animal.",
          "Your little one's sat right by me. It'll need a bath after, sorry."
        ],
        "lo": "Is that yours, the furry one? It's alright. Bigger than a wriggly thing, I can cope.",
        "hi": "Your pet likes me, {player}! Nobody with a nose that good has ever liked me before."
      },
      "farm_animal_near": {
        "any": [
          "Cows and sheep, out in a field, in full sun. Each to their own.",
          "That chicken's scratching the dirt. Wrong tool, wrong depth, but good effort."
        ],
        "lo": "Farm beasts, mate. I'll not get close. Hay gets up my nose worse than dust.",
        "hi": "A sheep just looked at me like I'm the smelly one, {player}. A sheep!"
      },
      "zoo_animal_near": {
        "any": [
          "Look at the {species}. Bet it'd do alright down a mine. Or not. Hard to say.",
          "The {species} keeps staring at my hard hat. I think it wants one."
        ],
        "lo": "That's the {species}, is it? I'll keep back from the fence. Don't want to put it off its dinner.",
        "hi": "I told the {species} you're my mate, {player}. It didn't say much, but it stopped glaring at me."
      },
      "guests_crowd": {
        "any": [
          "Lot of guests round us. I can feel them shuffling upwind.",
          "Crowds make me miss tunnels, mate. Nobody queues in a tunnel."
        ],
        "lo": "Busy bit, this. I'll keep my elbows in and my dust to myself.",
        "hi": "All these guests about and you still stop for me, {player}. I noticed that."
      },
      "residents_crowd": {
        "any": [
          "Half the street's stood here. I recognise them by their shoes, mostly.",
          "All the neighbours at once. I never know what to do with my hands. Or my pick."
        ],
        "lo": "Lots of neighbours about. They're a nice lot. They wave from a distance.",
        "hi": "Whole street's here, {player}, and you're still the one I'd pick for a tunnel partner."
      },
      "other_resident": {
        "any": [
          "That's {other} just there. Always says hello, even when the wind's blowing off me.",
          "{other}'s about. I owe {other} an apology for the dust I left on the fence."
        ],
        "lo": "You know {other}, mate? Good sort. Stands closer to me than most.",
        "hi": "Between us, {player}, I never know what to say to {other}. I just talk about gravel."
      },
      "other_player": {
        "any": [
          "Two of you! Is {other} a digger as well? Got the look of one.",
          "Hello to {other} too. Sorry, I didn't bring enough dust for everyone. Joking."
        ],
        "lo": "Oh, there's {other} as well. I'm Dave. I'm not used to an audience, mate.",
        "hi": "{other} seems sound, {player}. Any mate of yours can share my lamp light."
      },
      "alone_night": {
        "any": [
          "Just us and the dark. Quiet as a worked-out tunnel.",
          "Nobody about. I can hear my own boots creak. Lovely night."
        ],
        "lo": "Bit quiet, isn't it, just the two of us. I'm not good at quiet with folk. Only with rocks.",
        "hi": "Nobody else for miles, {player}. Truth is, the mine gets lonely. Tonight doesn't."
      },
      "by_water": {
        "any": [
          "That's a lot of water, sitting there, being wet. I'll stand back here.",
          "You know what's under that water? Mud. And under that, more wet. No thanks."
        ],
        "lo": "I'm not much for the waterside, mate. One splash and I'm mud for a week.",
        "hi": "If I fall in, {player}, I was pushed. That's the story. I've a reputation for dryness to keep."
      },
      "by_lava": {
        "any": [
          "Lava! Proper warm glow, that. Like a lantern the size of a lake.",
          "Stood by lava with a cold sandwich once. Had a hot sandwich in no time. Then no sandwich."
        ],
        "lo": "Lovely glow off that lava, mate. I like the stuff. It doesn't like anybody back.",
        "hi": "I love that glow, {player}, but you're stood nearer the lava than my nerves like."
      },
      "by_flowers": {
        "any": [
          "Flowers. They grow up towards the sun. I can't relate.",
          "I'm stood in the flowers and for once it's not me that smells strongest."
        ],
        "lo": "Nice flowers, mate. I'll try not to shed dust on them. Too late, sorry.",
        "hi": "One of these flowers is the same ginger as my hair, {player}. Don't laugh. Alright, laugh."
      },
      "by_fire": {
        "any": [
          "A fire! Now we're talking. Warm hands, dry socks, nothing better.",
          "I could watch flames all night. Like ore that's already been smelted for you."
        ],
        "lo": "Mind if I stand by the fire, mate? I'll take the smoky side. It covers the pong.",
        "hi": "Fire, a dark sky and you, {player}. Add a lump of coal and that's everything I like in one spot."
      },
      "by_crops": {
        "any": [
          "Crops. All that work and it's only this deep. Barely a scratch, mate.",
          "Wheat makes me sneeze, and it only grows where the sun is. No thanks."
        ],
        "lo": "Somebody's farm, this. I'll keep off the soil. My boots have done enough damage.",
        "hi": "You know I can't stand farming, {player}. But if these rows are yours, they're very nice rows."
      },
      "by_books": {
        "any": [
          "Books. I've got one at home. It's about gravel. Read it four times.",
          "Lot of shelves. I daren't touch one, I'd leave a thumbprint on every page."
        ],
        "lo": "I'm not a big reader, mate. I read rock layers. Same idea, heavier pages.",
        "hi": "Bet there's one on these shelves about caves, {player}. And I bet I could tell you what it got wrong."
      },
      "in_snow": {
        "any": [
          "Snow. It's just water that's gone sneaky.",
          "Cold, white and far too bright. The sun bounces off it right into my eyes."
        ],
        "lo": "Chilly, mate. My overalls are built for warm tunnels, not this.",
        "hi": "My toes have gone, {player}. Next cave we pass, I'm stood in it till this snow gives up."
      },
      "holding_gift": {
        "any": [
          "Is that a {item} you've got there? That's a handsome thing, that is.",
          "Ooh. I can't help looking at that {item}. Sorry. Carry on."
        ],
        "lo": "Nice {item}, mate. Not hinting. Just admiring from over here.",
        "hi": "{player}, that {item}'s a beauty. I'm trying not to stare. I'm not trying very hard."
      },
      "holding_weapon": {
        "any": [
          "That's a proper {item}. Well looked after. I can always tell.",
          "Tidy bit of kit, that {item}. I'd not want to be a zombie today."
        ],
        "lo": "You're armed, mate. Glad I've been polite so far.",
        "hi": "With you swinging that {item}, {player}, I feel safer than I do under fresh timber."
      },
      "holding_food": {
        "any": [
          "Is that {item}? My stomach just rumbled like a rockfall.",
          "You eat your {item} without grit in it, I bet. Fancy."
        ],
        "lo": "Don't mind me looking at your {item}, mate. I had my sandwich hours ago.",
        "hi": "That {item} looks good, {player}. Glad you're eating proper. I worry, you know."
      },
      "holding_rod": {
        "any": [
          "A fishing rod. So you stand by water on purpose, for hours. Brave.",
          "Fishing's just mining a pond with string, I suppose. Wetter, though."
        ],
        "lo": "Rod out, mate? I'll wait well back from the bank.",
        "hi": "If you hook an old boot, {player}, it might be mine. Lost one in a river years back."
      },
      "holding_tool": {
        "any": [
          "Now that's a {item}! Let me look at the head on it. Lovely.",
          "A {item}, eh? You hold it well. Loose in the wrist, like my old gaffer taught me."
        ],
        "lo": "Good {item}, mate. I don't say much, but I can talk about tools till the lamp runs dry.",
        "hi": "Seeing you with a {item}, {player}, I get a bit proud. Like you're one of us."
      },
      "armored": {
        "any": [
          "All that armour! You clank like an ore cart.",
          "Full plate, mate. I've only got overalls and a hat. The hat does most of the work."
        ],
        "lo": "You look serious in all that armour. I'll mind my manners.",
        "hi": "Good. You're armoured head to toe, {player}. One less thing for me to fret about."
      },
      "hurt": {
        "any": [
          "Mate, you look rough. Rougher than me, and I've been down a hole all night.",
          "You're hurt bad. I've seen lads carried out of the mine looking better."
        ],
        "lo": "Er, you're bleeding a fair bit, mate. Sorry to point it out.",
        "hi": "{player}, you're in a right state. I can't lose my only mate up top. I mean it."
      },
      "wet": {
        "any": [
          "You're soaked through, mate. On purpose? I'll never understand it.",
          "Dripping all over. I'm taking a step back so none of it gets on me."
        ],
        "lo": "Bit damp there, mate. No judgement. Well, a little.",
        "hi": "{player}, you're wet as a flooded shaft. I'd hug you dry but then we'd both be mud."
      },
      "sneaking": {
        "any": [
          "Why are we crouching? Low ceiling? I don't see a ceiling.",
          "You duck like a miner, mate. Good form in the knees."
        ],
        "lo": "Are you hiding from someone? Is it me? It's fine if it's me.",
        "hi": "I'll whisper, then, {player}. What are we creeping up on? I'm in, whatever it is."
      },
      "long_time": {
        "any": [
          "Hello, stranger! Been a few days. I thought you'd fallen down a shaft.",
          "Days since we talked, mate. I've been through two lamp wicks since."
        ],
        "lo": "Oh, it's you again. Been a while. Thought maybe it was the smell.",
        "hi": "{player}! Days, it's been! I kept a bit of the wall unmined so I'd have news for you."
      },
      "first_today": {
        "any": [
          "Alright, mate! First hello of the day. I've saved up my best one.",
          "There's a face. Hello! I've only been up an hour, go easy."
        ],
        "lo": "Oh, hello there. Didn't expect anyone to stop for me today. Hello.",
        "hi": "{player}! That's my day sorted, seeing you first off."
      },
      "zoo_busy": {
        "any": [
          "Zoo's heaving today. I've been bumped more times than an ore cart.",
          "Guests everywhere. Good for the zoo, bad for a bloke who likes elbow room."
        ],
        "lo": "Packed in here today, mate. I'll breathe shallow so I don't clear the place.",
        "hi": "Look at all these guests, {player}. They came for your zoo. I'm dead proud, mate."
      },
      "zoo_empty": {
        "any": [
          "No guests at all. Quiet as my mine at noon.",
          "Empty zoo. I can hear the animals chewing from here."
        ],
        "lo": "Nobody in today, mate. Wasn't me, I only just got here.",
        "hi": "Don't let the empty paths get to you, {player}. Some nights I dig and find nowt. Next night, gold."
      },
      "zoo_closed": {
        "any": [
          "Gates are shut. Just the animals and us. Peaceful, like after a shift.",
          "Closed up, is it? Zoo sounds different with no guests. More snoring."
        ],
        "lo": "Am I alright being here with it shut, mate? I'll not touch anything.",
        "hi": "Closed zoo, no crowd, just you and me and the critters, {player}. I like it best like this."
      },
      "litter_bad": {
        "any": [
          "Rubbish all over the paths. Even my mine's tidier, and that's a hole.",
          "I'm scruffy, mate, but this litter's worse than me. That takes doing."
        ],
        "lo": "Lot of mess on the ground. Not mine, honest. I only drop dust.",
        "hi": "This litter's not like you, {player}. You've had a lot on, haven't you?"
      },
      "stars_high": {
        "any": [
          "Folk say this zoo's top rated. I believe it. Even the dirt's nice.",
          "All those stars! I've only ever seen that many in a diamond cave. In a dream."
        ],
        "lo": "Good rating, I hear. You must know what you're doing, mate. More than me.",
        "hi": "Top stars, {player}! I told the bats down the mine my best mate runs the place."
      },
      "stars_low": {
        "any": [
          "Heard the rating's down. Ratings are like seams, mate. They come back.",
          "Not many stars, folk say. I like it here, for what my nose is worth."
        ],
        "lo": "Zoo's having a rough patch with the stars, I hear. Not my place to say. It's alright by me.",
        "hi": "Low stars don't mean a thing about you, {player}. First tunnel I ever dug fell in. Dug another."
      },
      "coins_low": {
        "any": [
          "Word is the Zoo Coins are thin. I know that feeling. Whole week of gravel once.",
          "Short on coins, mate? Every miner's been there. Pockets full of nothing but pebbles."
        ],
        "lo": "I hear money's tight for the zoo. Sorry, mate. I'd not have guessed, looking round.",
        "hi": "If the Zoo Coins are low, {player}, you can moan to me. I can't fix it, but I can listen."
      },
      "animal_sick": {
        "any": [
          "One of the animals looks poorly. Head down, not moving much. Don't like seeing that.",
          "There's a critter here not doing well, mate. Gets me right in the chest."
        ],
        "lo": "Sorry to say, mate, one of your animals seems off. Thought someone should mention it.",
        "hi": "That poor animal's suffering, {player}. I know you'll see it right. You always do."
      }
    },
    "near": {
      "amanda": [
        "Amanda's here. She knows the proper name of every rock. I just know which ones are heavy.",
        "Amanda told me my favourite pebble is just common gravel. Still my favourite, {player}."
      ],
      "han_lock": [
        "That's Han Lock. Chipped an anvil out of bedrock, he says. I can't even scratch the stuff.",
        "Han Lock's the only one louder than a cave-in. Good bloke. He never minds my dust."
      ],
      "clian": [
        "Clian's over there. Lovely fella, but he looks at me like I'm a job that needs doing.",
        "Clian wiped the bench after I sat on it. Fair play. I'd have done the same."
      ]
    }
  },
  "teddy": {
    "intro": "Good day to you. I am Teddy, mayor of this town, at your service. I keep its streets in order, its speeches long and its library alphabetical. How do you do.",
    "scenes": {
      "home_morning": {
        "any": [
          "You find me at breakfast. Toast, tea, and the morning's agenda, in that order.",
          "Welcome to the mayor's residence. I am polishing my copper kettle before I set out."
        ],
        "lo": "A morning caller. Kindly wipe your boots. The hall rug was beaten only yesterday.",
        "hi": "{player}! For you, the mayor's breakfast table keeps no office hours."
      },
      "home_evening": {
        "any": [
          "The day's papers are filed. I am in my armchair with a chapter and a lamp.",
          "Evening at home. Slippers, a book on sharks, and not one committee in sight."
        ],
        "lo": "It is past office hours. I shall hear you briefly, here in the hall.",
        "hi": "Ah, {player}. I was about to read aloud to an empty room. You are a far better audience."
      },
      "walking_to_zoo": {
        "any": [
          "I am marching to the zoo. Briskly. One does not amble towards sharks.",
          "A fine path to the zoo, this. I count the lamp posts as I go. All present."
        ],
        "lo": "I am en route to the zoo on an informal inspection. Do not let me detain you.",
        "hi": "Off to the zoo, {player}, and in high spirits. I have a new remark about sharks to try on you."
      },
      "at_zoo": {
        "any": [
          "I am touring the exhibits. Hats off to whoever swept this stretch.",
          "A stroll among the enclosures. I have nodded to every animal, as is proper."
        ],
        "lo": "I am here as a visitor, not officially. Though I do notice things.",
        "hi": "Between ourselves, {player}, I visit this zoo more often than a mayor strictly needs to. It is your doing."
      },
      "walking_home": {
        "any": [
          "Homeward. A full day at the zoo, and my boots are still presentable.",
          "I am walking home with a speech half composed. The sharks inspired paragraph two."
        ],
        "lo": "I am returning to my residence. Good evening to you. The visit was in order.",
        "hi": "A capital day at the zoo, my friend. I shall say so in my diary before bed."
      },
      "at_work": {
        "any": [
          "One moment. I am signing notices. There, the ink is dry. You have my attention.",
          "The town's business today: three petitions, one lamp post and a matter of hedges."
        ],
        "lo": "I am at my duties. State your business plainly and I shall hear it.",
        "hi": "{player}! A welcome interruption. This ledger and I had reached a stalemate."
      },
      "following": {
        "any": [
          "Onward! I have not been on a proper expedition in years. My stride remembers.",
          "I am keeping pace, I assure you. A mayor leads from the rear when asked."
        ],
        "lo": "I accompany you as an observer. I should be obliged if we avoided mud.",
        "hi": "I would follow few people off the edge of the map, {player}. You head the list."
      },
      "following_night": {
        "any": [
          "Abroad after dark. Most irregular. I rather like it.",
          "I have turned my collar up against the night air and am being brave about it."
        ],
        "lo": "This is well past a sensible hour to be out. I trust you know the way.",
        "hi": "Out at night with you, {player}. I feel like a boy slipping out of the library. Bully!"
      },
      "staying": {
        "any": [
          "I am holding this position, as requested. With excellent posture.",
          "I wait. I have composed two paragraphs of a speech on this very spot."
        ],
        "lo": "I shall stand here. I remind you that the mayor's time is public property.",
        "hi": "I shall not budge until you return, {player}. I keep my word, and for you I keep it gladly."
      },
      "rain": {
        "any": [
          "Rain upon my hat. It was brushed this morning. No matter.",
          "The gutters are running well in this rain. One likes to see it."
        ],
        "lo": "Inclement weather. I trust you will not drip in the town hall.",
        "hi": "My umbrella is large enough for a mayor and one trusted friend, {player}. I measured."
      },
      "thunder": {
        "any": [
          "Thunder! Nature is making a speech. Overlong and too loud, in my view.",
          "That lightning was close. I shall not flinch. I flinched. Strike that from the record."
        ],
        "lo": "A storm of this size ought to have given notice. I disapprove.",
        "hi": "I confess, {player}, thunder unsettles me. I recite the town charter until it passes."
      },
      "full_moon": {
        "any": [
          "A full moon. Round, bright and punctual. An example to us all.",
          "By this moonlight one could read a page. I have a book in my coat, as it happens."
        ],
        "lo": "A bright moon tonight. It shows up every unswept corner, you will notice.",
        "hi": "On full moon nights I practise speeches in the square, {player}. The moon has never once heckled."
      },
      "dark_moon": {
        "any": [
          "No moon whatever. I cannot see my own lapels.",
          "A night this black wants more lamps. I shall raise it at the next meeting."
        ],
        "lo": "It is exceedingly dark. Kindly identify yourself before approaching the mayor.",
        "hi": "I cannot see a thing in this dark, {player}, but I know your step. That is comfort enough."
      },
      "dawn": {
        "any": [
          "Sunrise. I have seen every one this year. I keep a tally in the ledger.",
          "The first light on clean streets. There is no finer sight in public life."
        ],
        "lo": "You are up at dawn. Commendable. Most citizens are not.",
        "hi": "Dawn, {player}! The day is a blank page and we are the first to write on it. Bully!"
      },
      "dusk": {
        "any": [
          "Sunset. The sky has gone the colour of new copper. Splendid.",
          "The sun retires on schedule. I admire anything that keeps to a timetable."
        ],
        "lo": "Evening draws in. I trust your day's affairs are concluded properly.",
        "hi": "A copper sky, {player}. I always think the setting sun is tipping its hat to us."
      },
      "nether": {
        "any": [
          "Good heavens. The whole place is on fire and nobody is in charge.",
          "This netherrack has never once been swept. One can tell at a glance."
        ],
        "lo": "I did not approve this excursion. I merely attended it. It is far too warm for a waistcoat.",
        "hi": "{player}, only for you would I stand in a furnace in my good coat. Kindly note the sacrifice."
      },
      "the_end": {
        "any": [
          "No sun, no moon, and nothing beyond the edge. Whoever planned this place resigned early.",
          "Those tall dark fellows carry blocks about with no permit whatever."
        ],
        "lo": "I shall not look those tall creatures in the eye. It is not rudeness. It is policy.",
        "hi": "I am unnerved, {player}, and I say so only to you. That black sky has no punctuation at all."
      },
      "fishing_sky": {
        "any": [
          "Islands that float! Splendid engineering. I should like to meet the surveyor.",
          "A fishing pool in the clouds. I looked for sharks. None so far. I remain hopeful."
        ],
        "lo": "I shall keep to the centre of the island. A mayor does not peer over edges.",
        "hi": "This high in the sky, {player}, I feel I could address the whole world at once. I may try."
      },
      "acufend": {
        "any": [
          "A round moon with a village upon it. I must compare notes with its mayor.",
          "The creatures here sing as they walk. Untidy, but in tune. I tapped my foot."
        ],
        "lo": "A curious moon. I shall behave as a visiting dignitary and touch nothing.",
        "hi": "The creatures set my speech to a little tune, {player}. I have never been music before. I am quite moved."
      },
      "cave": {
        "any": [
          "We are underground. My hat has touched the ceiling twice. It is a good hat.",
          "Dark, damp and no signposts. This cave wants a committee."
        ],
        "lo": "I trust you know the way out of this cavern. I did not bring my map of holes.",
        "hi": "I would go down a cave for nobody else, {player}. If you see a snail, I do not wish to know."
      },
      "high_up": {
        "any": [
          "What a prospect! From here the whole land lies open like an atlas.",
          "A summit! The proper place for a speech. The wind carries one's best lines."
        ],
        "lo": "A commanding view. I shall admire it from two paces back, if you please.",
        "hi": "All that country below us, {player}, and I would trust you with every acre of it."
      },
      "hostile_near": {
        "any": [
          "There is a brute skulking nearby. It has not been invited.",
          "A monster, at this distance from the mayor! I shall glare at it severely."
        ],
        "lo": "I must point out the creature behind you. This is a matter for someone armed.",
        "hi": "I stand with you against that brute, {player}. I have a walking stick and a loud voice. Both are yours."
      },
      "creeper_near": {
        "any": [
          "A creeper! That green scoundrel has no respect for property.",
          "I can hear that creeper hissing. It is the most ill-mannered sound I know."
        ],
        "lo": "A creeper, there. I advise distance, and I intend to take my own advice.",
        "hi": "{player}, the creeper! I have lost a garden wall to one and I refuse to lose you."
      },
      "villager_near": {
        "any": [
          "A village. Sensible folk, though their paths could use edging.",
          "The villagers greet me with a hum. I answer with a bow. It works well enough."
        ],
        "lo": "I am observing how this village is run. Purely professional interest.",
        "hi": "This village has a finer bell than ours, {player}. Do not repeat that. I am quietly envious."
      },
      "pet_near": {
        "any": [
          "Your animal sits when told. That is more than I can say for some committees.",
          "A loyal companion at your heel. It has a steady, respectable look."
        ],
        "lo": "Your pet may approach, provided its paws are clean.",
        "hi": "Your pet leaned against my leg just now, {player}. I have decided not to mention the hair on my trousers."
      },
      "farm_animal_near": {
        "any": [
          "Livestock in a field, and all on the proper side of the fence. Orderly.",
          "A cow has been regarding me for some time. I regarded it back. Neither of us yielded."
        ],
        "lo": "Farm animals. Useful, honest, and they keep off the paths. I have no complaint.",
        "hi": "That sheep reminds me of a certain councilman, {player}. I shall not say which."
      },
      "zoo_animal_near": {
        "any": [
          "Observe the {species}. It carries itself like a creature with a full diary.",
          "The {species} has a clean enclosure and knows it. Look at that bearing."
        ],
        "lo": "The {species}, I believe. I shall watch from the rail. One respects a barrier.",
        "hi": "I have been rehearsing a speech to the {species}, {player}. It listens better than the council."
      },
      "guests_crowd": {
        "any": [
          "A throng of guests! An audience, ready made. I feel a few remarks coming on.",
          "So many visitors about us. I have shaken eleven hands and counting."
        ],
        "lo": "Mind the crowd. Should you need the mayor, I am the one in the hat.",
        "hi": "All these guests around us, {player}, came to see what you built. I shall tell them so, loudly."
      },
      "residents_crowd": {
        "any": [
          "Half my citizens in one spot. I could hold a town meeting on the instant.",
          "The neighbours have gathered. I see no agenda, but I shall allow it."
        ],
        "lo": "These are my townsfolk. Good people. One does well to know them.",
        "hi": "Look at them all, {player}. A fine town. You are the best addition to it in years."
      },
      "other_resident": {
        "any": [
          "Ah, {other} is here. A citizen in good standing, as I recall.",
          "I see {other} nearby. I must raise the matter of the hedge with {other} later."
        ],
        "lo": "You have met {other}, I take it? A town is built on proper introductions.",
        "hi": "In confidence, {player}, {other} once dozed through my address. I forgave it. Eventually."
      },
      "other_player": {
        "any": [
          "And this is {other}? Welcome. The mayor greets you both.",
          "Two visitors at once! {other}, I shall be with you directly. One at a time is the rule."
        ],
        "lo": "I do not believe {other} and I have been introduced. Good day to you both.",
        "hi": "Any companion of yours is welcome here, {player}. I shall enter {other} in the good ledger."
      },
      "alone_night": {
        "any": [
          "The streets are empty. Only the two of us and the night.",
          "Not a soul about. The town sleeps soundly, which means I have done my job."
        ],
        "lo": "It is late and we are quite alone. I trust your purpose is honourable.",
        "hi": "With nobody to hear, {player}, I shall admit it. Being mayor is lonely. This is not."
      },
      "by_water": {
        "any": [
          "Open water. I always look for a fin. One lives in hope.",
          "A clean shoreline, not a scrap upon it. This is how water ought to be kept."
        ],
        "lo": "Mind the bank. I shall not have it said the mayor let a citizen fall in.",
        "hi": "If a fin ever breaks this water, {player}, I want you beside me. Someone must witness my delight."
      },
      "by_lava": {
        "any": [
          "Lava. Bright as molten copper and considerably less useful.",
          "Molten rock, unfenced. This would never pass an inspection of mine."
        ],
        "lo": "I shall stand well clear of the lava. My coat is wool and my dignity is flammable.",
        "hi": "You stand too near that lava for my nerves, {player}. A mayor may fret over a friend."
      },
      "by_flowers": {
        "any": [
          "Flowers, and in tidy colours. I approve of a bed that keeps its edges.",
          "A fine show of blooms. I should like these outside the town hall."
        ],
        "lo": "Pleasant flowers. I shall keep to the border, where a gentleman walks.",
        "hi": "Were I to wear one of these flowers in my buttonhole, {player}, I should say you chose it."
      },
      "by_fire": {
        "any": [
          "A good fire. Orderly flames, well contained. I commend the builder.",
          "Firelight suits a story. I have several, all true and all lengthy."
        ],
        "lo": "A fire, well tended. I shall warm my hands and keep my coat tails clear.",
        "hi": "Firelight and a friend. {player}, this is where I tell of the great shark I very nearly saw."
      },
      "by_crops": {
        "any": [
          "Straight rows! A field planted like a well ruled ledger.",
          "Crops coming up on time. Farmers and mayors both live by the calendar."
        ],
        "lo": "Good husbandry here. I shall keep my boots off the tilled soil.",
        "hi": "These crop rows are as neat as my bookshelves, {player}. From me there is no higher praise."
      },
      "by_books": {
        "any": [
          "Books! Ah. I can smell the bindings. Allow me a moment.",
          "Shelves of books. I have spotted one out of order and I am being very restrained."
        ],
        "lo": "A respectable collection of books. I trust the spines are dusted regularly.",
        "hi": "{player}, I could stand at these shelves with you until supper, reading titles aloud. Shall I? I shall."
      },
      "in_snow": {
        "any": [
          "Snow. The whole world has been given a clean white tablecloth.",
          "Crisp snow underfoot. My moustache has frozen into a most official shape."
        ],
        "lo": "Cold weather builds character. I have plenty, yet here I stand in the snow.",
        "hi": "My moustache is iced solid, {player}. Laugh if you must. I cannot move my lip to object."
      },
      "holding_gift": {
        "any": [
          "I say, is that a {item}? A handsome article.",
          "My eye is drawn to that {item}. Forgive me, I admire quality."
        ],
        "lo": "A fine {item} you carry. I merely remark upon it.",
        "hi": "A {item}, {player}! You know my tastes too well. I am pretending not to look."
      },
      "holding_weapon": {
        "any": [
          "You carry a {item}. I trust it is for the public good.",
          "A stout {item}. I prefer a firm speech myself, but I grant yours is quicker."
        ],
        "lo": "Armed, I see. I should be obliged if that {item} pointed away from the town's officials.",
        "hi": "With that {item} in your hand, {player}, the town is safer. I shall sleep the better for it."
      },
      "holding_food": {
        "any": [
          "Is that {item}? I do hope there is a plate involved. Crumbs travel.",
          "{item}. A sound choice. A town, like a mayor, marches on its stomach."
        ],
        "lo": "You are dining on the move. I shall overlook it, provided nothing is dropped.",
        "hi": "That {item} looks excellent, {player}. I am glad to see you fed. You work harder than my whole council."
      },
      "holding_rod": {
        "any": [
          "A fishing rod! Should a shark ever take that line, I wish to hear every detail.",
          "Angling. A patient art. I once waited four hours and caught a splendid idea."
        ],
        "lo": "Fishing, is it? An orderly pastime. I approve of quiet on the bank.",
        "hi": "I should like to sit by while you fish, {player}. With a book. Saying nothing. Briefly."
      },
      "holding_tool": {
        "any": [
          "A {item}. Honest work is afoot. I salute it.",
          "That {item} has seen use. A worn handle is a medal of its own."
        ],
        "lo": "You are equipped for labour. The town thanks its builders, as do I.",
        "hi": "You and that {item} have built half of what I boast about, {player}. I know it well."
      },
      "armored": {
        "any": [
          "Full armour! You gleam like a statue of yourself.",
          "Plate from head to heel. I should like a parade uniform half so impressive."
        ],
        "lo": "You are dressed for battle. I hope the occasion does not arise near my office.",
        "hi": "In that armour you look every inch a hero, {player}. I may commission a painting."
      },
      "hurt": {
        "any": [
          "Good heavens, you are wounded. This is no condition for a citizen to be in.",
          "You are barely on your feet. I have seen sturdier notices in a gale."
        ],
        "lo": "You appear gravely injured. I would be remiss not to say so.",
        "hi": "{player}, you are badly hurt and I am not calm about it. Not calm at all. The town needs you whole."
      },
      "wet": {
        "any": [
          "You are drenched. Water is running off you onto a public path.",
          "Soaked to the collar! I trust that was deliberate."
        ],
        "lo": "You are dripping. I should prefer it at a respectful distance from my shoes.",
        "hi": "You look like a shark's lunch that swam away, {player}. I say it with affection."
      },
      "sneaking": {
        "any": [
          "Why are you crouched? A citizen should stand tall before the mayor.",
          "You are creeping. I can see you perfectly well. I am looking right at you."
        ],
        "lo": "Skulking is not a good look before an official. I shall assume a dropped coin.",
        "hi": "Are we being stealthy, {player}? I shall lower my voice. This is my lowest. I am sorry."
      },
      "long_time": {
        "any": [
          "Well! Several days without a word. The town noticed your absence.",
          "You return at last. I had begun drafting a notice of inquiry."
        ],
        "lo": "It has been some days. I had nearly struck your name from the visitors' list.",
        "hi": "{player}! Days, and no call. I kept your chair at the town hall empty, and scowled at it."
      },
      "first_today": {
        "any": [
          "Good day! You are my first caller today. The honour is recorded.",
          "A fresh day and a fresh greeting. I trust I find you well."
        ],
        "lo": "Good day. This is our first word today, I believe. Let us keep it brief and cordial.",
        "hi": "{player}! Now the day has officially begun. I was waiting for precisely this."
      },
      "zoo_busy": {
        "any": [
          "The zoo is full to the gates! Commerce, wonder and orderly queues. Bully!",
          "What a turnout. I have not seen such crowds since my last address. Larger, even."
        ],
        "lo": "A busy day at the zoo. I am pleased to see the queues are straight.",
        "hi": "Such crowds at your zoo, {player}! I have told three strangers that I know the owner personally."
      },
      "zoo_empty": {
        "any": [
          "Not one guest. The paths are spotless, I will say that for an empty zoo.",
          "The gates stand open and nobody walks in. A speech to no audience. I know the feeling."
        ],
        "lo": "No visitors today. I make no judgement. I merely observe.",
        "hi": "An empty zoo is not a failure, {player}. My first town meeting drew two people and a goat."
      },
      "zoo_closed": {
        "any": [
          "The zoo is closed. A park at rest has a dignity of its own.",
          "Shut gates and quiet paths. A proper time for sweeping and reflection."
        ],
        "lo": "Closed, I see. I trust I am here by your leave.",
        "hi": "Closed to the public and open to me. {player}, I feel thoroughly privileged."
      },
      "litter_bad": {
        "any": [
          "Litter! On every path! I can scarcely look. I am looking. It is dreadful.",
          "This rubbish is an affront. I stepped over a wrapper and felt my hat droop."
        ],
        "lo": "The state of these paths is beneath comment. Yet I have commented.",
        "hi": "{player}, I say this as your friend. The litter is breaking my heart, one wrapper at a time."
      },
      "stars_high": {
        "any": [
          "A splendid rating! I have had the news read out at the town hall.",
          "So many stars. This zoo is the pride of the district and I say so in every speech."
        ],
        "lo": "The zoo's standing is excellent. You are to be commended, formally.",
        "hi": "Top stars, {player}! I knew it from the first. I take no credit. Perhaps a little."
      },
      "stars_low": {
        "any": [
          "The zoo's rating has slipped. A setback, not a verdict.",
          "Few stars, I hear. Great works are seldom admired while the paint is wet."
        ],
        "lo": "The zoo's reviews are poor. I expect improvement, and I say so without malice.",
        "hi": "Never mind the stars, {player}. They booed my first speech. I gave a second."
      },
      "coins_low": {
        "any": [
          "I understand the Zoo Coins run short. A lean ledger is a stern teacher.",
          "The coffers are light, I hear. I have balanced a town budget on less, and with a smile."
        ],
        "lo": "The zoo's funds are low, I am told. I trust the accounts are at least tidy.",
        "hi": "A thin purse is no disgrace, {player}. I have every confidence in you. I would put that in writing."
      },
      "animal_sick": {
        "any": [
          "One of the animals is unwell. That troubles me more than any untidy path.",
          "A creature here is suffering. I cannot stroll on and pretend otherwise."
        ],
        "lo": "An animal is in poor condition. As mayor, I am obliged to note my concern.",
        "hi": "That poor beast is ailing, {player}. I know your heart. You will not let it stand."
      }
    },
    "near": {
      "clian": [
        "There is Clian. Were there a medal for a spotless path, Clian would need a larger coat.",
        "Clian and I agree on everything that matters. Chiefly brooms."
      ],
      "desilva": [
        "Desilva is nearby. She tells me she is fond of rubbish. I assume she says it to vex me. It works.",
        "I bade Desilva good day. She scowled. I count that as progress, {player}."
      ],
      "tim": [
        "Tim reviews books for a living. He called my favourite one dull. We remain on speaking terms. Just.",
        "That is Tim. Sharp mind, sharp tie. I should lend him my memoirs, if I dared."
      ]
    }
  },
  "ailing_bot": {
    "intro": "HELLO! I'm Ailing Bot! I'm a teacher, my classroom is my own front room, and I bake while I teach. Sorry, that was loud. I'm Ailing Bot. There, quieter that time.",
    "scenes": {
      "home_morning": {
        "any": [
          "Morning at my place! Chalk's out, oven's hot, cat's fed. In the wrong order, but done!",
          "You caught me before class! I'm writing today's lesson on the board. I've spelled it wrong twice."
        ],
        "lo": "Oh! A visitor! This early! Are you here to learn or to sell me something? I always buy it.",
        "hi": "{player}! In my kitchen, before class! I'd have worn the good tie if I'd known. This is the bad tie."
      },
      "home_evening": {
        "any": [
          "Evening at home! Papers marked, record on, cat on my lap. I can't get up now. Rules.",
          "The oven's cooling and the old-school music's going. That's my whole night, right there."
        ],
        "lo": "Oh, you came by at night. Is it too loud in here? It's just me and the music. And me.",
        "hi": "{player}! Tonight's record skips right on the best part. I sing over the skip. You're just in time."
      },
      "walking_to_zoo": {
        "any": [
          "On my way to the zoo! I packed a muffin for the walk. I ate it at the gate. My own gate.",
          "Walking to the zoo! Someone said the path is shorter if you hum. I've been humming."
        ],
        "lo": "Just heading to the zoo! Is this the right path? A fellow pointed me the other way once.",
        "hi": "Zoo day, {player}! I'm going to say hello to every big cat by name. I made up the names."
      },
      "at_zoo": {
        "any": [
          "I'm taking notes at every exhibit! For class! So far the page is all drawings of whiskers.",
          "Great day to walk the exhibits! I read every sign out loud. A family asked me to stop."
        ],
        "lo": "Just a teacher on a day out at the zoo! I won't get in the way. I'm in the way, aren't I?",
        "hi": "You built this whole zoo, {player}? I teach for a living and I couldn't teach a brick to stay put."
      },
      "walking_home": {
        "any": [
          "Heading home from the zoo! My feet hurt and my throat hurts. Good trip, both ends.",
          "Back down the path to my place. There's a pie waiting and a cat judging the clock."
        ],
        "lo": "Just walking home from the zoo! It was great. I got lost twice. Still great.",
        "hi": "I'm going home happy, {player}. I'll tell the cat everything. She'll act bored. She isn't."
      },
      "at_work": {
        "any": [
          "Hold on, class! We have a guest! Okay. Where was I? I'd lost my place anyway.",
          "I'm mid-lesson! Today it's fractions, with a pie. Half the pie's gone. That's the lesson."
        ],
        "lo": "Oh, I'm teaching right now! Got a question? Hands up. Or don't. I'm flexible.",
        "hi": "{player}! Class, this is the friend I never stop talking about. See? Real. I told you."
      },
      "following": {
        "any": [
          "FIELD TRIP! I've got my walking shoes and a pocket of chalk. Don't ask why. Habit.",
          "I'm keeping up! I'm breathing hard, but that's enthusiasm. Mostly enthusiasm."
        ],
        "lo": "I'll follow along! Where are we going? No, don't say. I believe anything anyone tells me.",
        "hi": "An adventure with {player}! I'm writing a lesson about it in my head. You're the hero. I'm the loud one."
      },
      "following_night": {
        "any": [
          "A night hike! I'm being quiet. THIS IS QUIET. Okay, quieter.",
          "It's dark out here and I keep thinking I left the oven on. I didn't. I checked twice."
        ],
        "lo": "Out at night with somebody I've just met. This is how I bought that bean. I'm still coming.",
        "hi": "I'd be nervous out in the dark alone, {player}. With you it's just a late class trip."
      },
      "staying": {
        "any": [
          "Standing right here! Like a kid sent to the corner. I've sent myself there before.",
          "I'm waiting! I've counted to nine innings twice. It's just counting to nine. Still."
        ],
        "lo": "You want me to wait here? Okay! You're coming back, right? People say that.",
        "hi": "I'll stay put, {player}. You always come back. That's why I don't worry. Much."
      },
      "rain": {
        "any": [
          "It's RAINING on my TIE. This is my chalk hand, too. Everything's getting wet!",
          "Somebody said getting rained on is good luck. Somebody tells me a lot of things."
        ],
        "lo": "Rain! I'm standing under the smallest roof I could find. Is there room? There isn't.",
        "hi": "{player}, I'm soggy and I hate it, and I'm still out in the rain with you. Put that on my report card."
      },
      "thunder": {
        "any": [
          "THUNDER! Finally, something louder than me! I don't like it one bit!",
          "That lightning lit up everything. My cat hides under the bed for this. I'd join her if I fit."
        ],
        "lo": "Big storm! I'm not shaking, that's just how I stand. Okay, I'm shaking.",
        "hi": "Every boom of thunder, I jump, {player}. Me! The loud one! Don't tell my class."
      },
      "full_moon": {
        "any": [
          "Look at that moon! Round as a baseball. Somebody hit that one a long way.",
          "Full moon tonight. A man told me it's made of dough. It does look underbaked."
        ],
        "lo": "Big moon, huh? Cats love it. I know because mine yelled at it all night.",
        "hi": "That full moon's a home run that never came down, {player}. I think about that. Is that silly?"
      },
      "dark_moon": {
        "any": [
          "No moon! I can't see my own tie. I know it's there. I can feel the flour on it.",
          "It's so dark tonight I bumped into a fence and said sorry to it."
        ],
        "lo": "Dark night. Is that you? Say something so I know it's you. I'd believe anybody.",
        "hi": "Can't see a thing with no moon, {player}, but I know your voice. Best one out here. Mine's just the biggest."
      },
      "dawn": {
        "any": [
          "SUNRISE! Sorry. Sunrise. The muffins and the sun come up together at my house.",
          "First light! I like to yell good morning at it. It never yells back. Rude."
        ],
        "lo": "You're up at dawn too? Are you a baker? A teacher? No? Just early? Okay!",
        "hi": "Up with the sun, {player}! New day, clean chalkboard. Maybe I'll get it right today. Maybe."
      },
      "dusk": {
        "any": [
          "Sun's going down! That's the bell for the day. Class dismissed, sky.",
          "Sunset. Orange, like a pie crust done right. Mine never go that colour."
        ],
        "lo": "Getting dark! I get turned around after sunset. And before it, to be fair.",
        "hi": "Sunsets make me think I did okay today, {player}. Did I? You'd tell me. You're honest."
      },
      "nether": {
        "any": [
          "It's HOT! Like standing in my own oven! Nothing in here is going to rise right.",
          "Lava everywhere and not a drop of water. I should love it. I do not love it."
        ],
        "lo": "Somebody told me this place was a nice warm holiday spot. I believed them. Again.",
        "hi": "{player}, my beard is sweating in this heat. I'd only come down here for you and maybe the cat."
      },
      "the_end": {
        "any": [
          "Where's the ground gone? Where's the sky gone? I have questions and no chalkboard!",
          "Those tall fellows don't like being looked at. I teach by eye contact! This is hard for me!"
        ],
        "lo": "It's so quiet here, and so dark. I'm going to be quiet too. That was me trying.",
        "hi": "I don't understand this empty place at all, {player}. I'm just glad you're standing next to me."
      },
      "fishing_sky": {
        "any": [
          "Fishing pools! In the SKY! The water's up here now? It followed me!",
          "I love fishing and I hate edges. This place is a pop quiz I didn't study for."
        ],
        "lo": "I'll fish from the middle of the island. The very middle. Is this the middle?",
        "hi": "Best fishing spot I've ever seen, {player}, and it's floating. My knees won't stop. Half joy, half terror."
      },
      "acufend": {
        "any": [
          "They love MUSIC here! Finally, somewhere I'm the right volume!",
          "A little creature hummed me a tune. Old-school, too! I hummed back. We had a moment."
        ],
        "lo": "Is this really a moon? A fellow once sold me a map of one. This isn't on it.",
        "hi": "{player}, the creatures danced when I sang! Nobody's ever done that. People usually close a window."
      },
      "cave": {
        "any": [
          "IT ECHOES! Echo! Sorry. I had to. Okay, one more. ECHO!",
          "Dark, damp, drippy. That drip better stay over there where I can hear it."
        ],
        "lo": "I teach about caves. I've never been in one. The book left out how much it smells.",
        "hi": "I'm using my indoor voice in this cave, {player}. For the first time ever. Mark the date."
      },
      "high_up": {
        "any": [
          "I can see EVERYTHING from up here! I'm going to yell hello. HELLO! It didn't answer.",
          "That's a long way down. My stomach's doing the thing it does before parents' night."
        ],
        "lo": "High up! I'm fine. I'm holding this rock because I like this rock.",
        "hi": "{player}, if I hit a ball from up here it'd never land. I'd be a legend. A scared one."
      },
      "hostile_near": {
        "any": [
          "Is that a MONSTER? That's a monster! I have chalk and a loud voice! That's all I have!",
          "Something's groaning over there. Not me this time. I checked."
        ],
        "lo": "Uh, friend? There's a monster behind you with bad posture and worse manners.",
        "hi": "I'll stand in front of that monster for you, {player}! I'm burly! I've never fought anything, but I'm BURLY!"
      },
      "creeper_near": {
        "any": [
          "CREEPER! Oh no, I yelled. Do they come when you yell? It's looking at me!",
          "That green thing is hissing. A fellow told me they just want a hug. I don't think so anymore."
        ],
        "lo": "There's a creeper right there. I'm whispering. This is real whispering. I'm scared.",
        "hi": "{player}, creeper! I'd jump in a lake before I'd let that thing near you! A LAKE!"
      },
      "villager_near": {
        "any": [
          "Villagers! They go hmm at everything. Best class I ever had. They never talk over me.",
          "One of these villagers traded me a look. Just a look. I think I overpaid."
        ],
        "lo": "A village! I have to be careful here. I once swapped my lunch for a promise.",
        "hi": "{player}, if I go near those villagers I'll come home with nine sticks and call it a bargain."
      },
      "pet_near": {
        "any": [
          "Is that your pet? If it purrs, I'm in love. If it barks, I'm over here.",
          "Your little buddy's staring at my tie. It's got crumbs on it. Smart animal."
        ],
        "lo": "Nice pet! Does it bite? Does it bark? Those are my only two questions.",
        "hi": "Any pet of yours gets a pass from me, {player}. Even if it's a you-know-what. Even then. Wow."
      },
      "farm_animal_near": {
        "any": [
          "Chickens! That's eggs for the batter, walking around loose!",
          "A sheep just bleated louder than me. I'm not mad. I'm impressed."
        ],
        "lo": "Farm animals! Somebody told me pigs can count. I gave one a quiz. No answer yet.",
        "hi": "{player}, that cow blinked at me slow, like a cat does. Does that mean she likes me? I'm saying yes."
      },
      "zoo_animal_near": {
        "any": [
          "LOOK at the {species}! Right there! Sorry. I get excited. Look, though!",
          "I asked the {species} a question. It thought about it. That's more than my back row does."
        ],
        "lo": "Is that the {species}? Somebody told me it does tricks if you clap. I've been clapping.",
        "hi": "{player}, I'm putting the {species} in tomorrow's lesson. And you. You're both in it."
      },
      "guests_crowd": {
        "any": [
          "So many guests! It's like the stands on opening day! I want to start a cheer!",
          "Big crowd! I keep counting heads like it's a class trip. I've lost count three times."
        ],
        "lo": "Crowded! I'll keep my voice down. Everybody turned around. I didn't keep it down.",
        "hi": "In a crowd of guests this size I'd lose anybody, {player}. Not you. I'd just yell. You'd hear it."
      },
      "residents_crowd": {
        "any": [
          "The whole neighbourhood's here! Should I have baked? I should have baked.",
          "All my neighbours in one spot! Half of them have fooled me at least once. Good people!"
        ],
        "lo": "These are my neighbours! They're nice. They wave. I think that's waving.",
        "hi": "Every neighbour I've got is here, {player}, and I'm still standing next to you. That's on purpose."
      },
      "other_resident": {
        "any": [
          "Hey, it's {other}! {other} told me something last week. I believed it. Jury's still out.",
          "There's {other}! I baked for {other} once. Never heard back. Was it the raisins?"
        ],
        "lo": "Do you know {other}? Nice neighbour. Doesn't talk my ear off. I like that.",
        "hi": "Between you and me, {player}, I think {other} likes my muffins more than me. That's fair."
      },
      "other_player": {
        "any": [
          "Two of you! Hi, {other}! Sit anywhere! We're outside. Stand anywhere!",
          "Is {other} with you? Great! Do you like cats, {other}? Take your time. No, hurry."
        ],
        "lo": "Oh! {other} too! I'm Ailing Bot! I teach! I said that already, didn't I? To somebody.",
        "hi": "If {other}'s your friend, {player}, that's good enough for me. I trust easy. This time it's safe."
      },
      "alone_night": {
        "any": [
          "It's just us out here tonight. I can hear how loud I am when it's this quiet. Wow.",
          "Nobody around. No class, no crowd. Just the night wind, and it's off-key."
        ],
        "lo": "Quiet night, huh, just us two. I never know what to say when it's quiet. So I say this.",
        "hi": "Can I tell you something, {player}? Some nights I think I talk loud so I'm not lonely. Huh."
      },
      "by_water": {
        "any": [
          "That's water. Right there. Lots of it. I'm standing exactly this far away.",
          "I'd fish here, if there was a dock. A tall one. With a rail. And a roof."
        ],
        "lo": "Nice water! I'll look at it from here. It can look at me. That's the deal.",
        "hi": "I'm this close to the water for you, {player}. Count the steps. That's a record."
      },
      "by_lava": {
        "any": [
          "LAVA! It's like an oven with no door! Who leaves that open?",
          "Hot, bright and no water in it. I should like lava. I don't trust it."
        ],
        "lo": "Somebody told me lava's just warm soup. I'm not checking.",
        "hi": "{player}, you're so close to that lava my beard's curling. I worry loud, but I mean it."
      },
      "by_flowers": {
        "any": [
          "Flowers! I'd put these on my desk. The cat would knock them off. Circle of life.",
          "Smells better than my kitchen among these flowers. And my kitchen smells like pie."
        ],
        "lo": "Nice flowers! I sneezed. Sorry. That was a big one. They all heard it.",
        "hi": "{player}, which of these flowers says thanks for being my friend? I'm no good at flowers. All of them."
      },
      "by_fire": {
        "any": [
          "A campfire! You could toast bread on that! I've got opinions about toast!",
          "Fire's nice. Warm, dry, crackly. Like an old record, but hot."
        ],
        "lo": "Mind if I warm up by the fire? I'll keep my tie out of it. I've learned that one.",
        "hi": "A fire and a friend, {player}. If I had my records I'd sing. I'll sing anyway. Sorry in advance."
      },
      "by_crops": {
        "any": [
          "WHEAT! That's flour that hasn't happened yet! I love this field!",
          "Crops in rows. Neater than my desks. The wheat pays more attention, too."
        ],
        "lo": "Somebody's farm! I won't touch. I'm just looking at it like a baker. Hungrily.",
        "hi": "{player}, is that a melon patch? No? Good. I got nervous. You know how I feel about watermelon."
      },
      "by_books": {
        "any": [
          "Books! I've read some of these! I've assigned more than I've read. Don't tell.",
          "Bookshelves! I'm using my library voice. This is it. They'd still ask me to leave."
        ],
        "lo": "Lots of books! A fellow sold me one with blank pages once. Said it was advanced.",
        "hi": "You'd never laugh at how slow I read, {player}. I read slow. There. Only you and these shelves know."
      },
      "in_snow": {
        "any": [
          "SNOW! It's water, but it stays put. That's the only kind I respect.",
          "Cold! My beard's got ice in it. I look distinguished. Do I? Somebody tell me."
        ],
        "lo": "Snow's fine. It's when it melts in my shoes that we have a problem.",
        "hi": "{player}, I'd throw a snowball at you, but my aim's so bad I'd hit me."
      },
      "holding_gift": {
        "any": [
          "Hey, is that a {item}? Nice! I'm just saying it's nice. That's all I'm saying.",
          "Ooh, a {item}! I like those. I'm not hinting. Was that a hint? It wasn't."
        ],
        "lo": "That's a good-looking {item} you've got. I'm only looking. Looking's free, right?",
        "hi": "{player}, you're holding a {item} and I'm being so calm about it. Look how calm."
      },
      "holding_weapon": {
        "any": [
          "Whoa! A {item}! You're holding it like you've done this before. Good!",
          "That {item} looks serious. I couldn't tell you a thing about it. I teach spelling."
        ],
        "lo": "You've got a {item} out. Is this a lesson? Am I in trouble? I'll be good.",
        "hi": "I feel safe when you've got that {item}, {player}. All I've got is a throwing arm. It's not a good one."
      },
      "holding_food": {
        "any": [
          "Is that {item}? Baker's eye. I can always tell. Okay, I just looked at your hands.",
          "Food! A {item}! Now I'm hungry. I was already hungry. Now I'm hungrier."
        ],
        "lo": "That's not watermelon, is it? No? A {item}? Okay. We can keep talking.",
        "hi": "{player}, up against my muffins that {item} would win. Easy. I'm hard on my muffins."
      },
      "holding_rod": {
        "any": [
          "A FISHING ROD! Now you're talking! I love it! From far back on a dry dock!",
          "Going fishing? I once sat four hours and caught a cold. Loved every minute."
        ],
        "lo": "You fish? I fish! I just don't like what the fish live in.",
        "hi": "Fishing with you, {player}? I'd even sit near the edge. Near. Let's not go wild."
      },
      "holding_tool": {
        "any": [
          "That's a {item}! Hard work! I respect it. I mostly lift chalk.",
          "A {item}! My hands are too soft for that. It's the dough. Dough keeps them soft."
        ],
        "lo": "Working hard with that {item}? Good for you! I'd help, but I'd just narrate.",
        "hi": "You never stop working, {player}. That {item}'s proof. I notice. Teachers notice."
      },
      "armored": {
        "any": [
          "Look at you! Full armour! You look like a catcher behind the plate, but shinier!",
          "That's a lot of armour! Is it heavy? It looks heavy. I'd tip over."
        ],
        "lo": "All that armour! Are you somebody important? Somebody said you were. I believed it.",
        "hi": "All that armour means I worry a little less, {player}. Only a little. I'm a worrier."
      },
      "hurt": {
        "any": [
          "You're HURT! Really hurt! I'm not good in a crisis! I just get louder!",
          "You look awful! I mean that kindly! One of us needs to sit down. Maybe it's me."
        ],
        "lo": "Hey, you're bleeding. I don't know you well, but I don't like that at all.",
        "hi": "{player}, you're hurt and it's scaring me. I can't lose the one friend who never tricks me."
      },
      "wet": {
        "any": [
          "You're SOAKED! On purpose? Why would anybody do that on purpose?",
          "You're dripping! No offence, but the drips, they travel. I'm watching them."
        ],
        "lo": "You're all wet. I'm going to stand one step back. It's not you. It's the water. It's a little you.",
        "hi": "{player}, you're wet as a dropped fish and I'm still standing here. That's friendship. Loud friendship."
      },
      "sneaking": {
        "any": [
          "Why are you crouching? Did you drop something? I'll help look! What are we looking for?",
          "You're sneaking! I can't sneak. I tried once and knocked over a desk."
        ],
        "lo": "Are you ducking down to hide from me? People do that. Usually after I start explaining baseball.",
        "hi": "Oh, we're being sneaky, {player}? I'M IN. Sorry. I'm in."
      },
      "long_time": {
        "any": [
          "WHERE have you been? It's been days! I thought I said something. Did I say something?",
          "There you are! I marked you absent. Four days running. In pen!"
        ],
        "lo": "Oh, you came back! After days! I figured you'd had enough of the volume.",
        "hi": "{player}! Days! I saved up everything I wanted to tell you. Then I forgot it. I'm just glad you're here."
      },
      "first_today": {
        "any": [
          "GOOD DAY! First hello! I've been saving my voice for it. You can tell.",
          "Hey! Roll call! You're here! That's everybody. It's a short list."
        ],
        "lo": "Hello! Have we talked today? No? Hello! I say it to everybody. It's still sincere.",
        "hi": "{player}! There's my favourite face today. After the cat. You knew that. Hello!"
      },
      "zoo_busy": {
        "any": [
          "The zoo is PACKED! Somebody get these people a seventh inning stretch!",
          "So many guests today! The noise! For once nobody can tell which part of it is me!"
        ],
        "lo": "Busy zoo today! A fellow at the gate said it was free hug day. It wasn't.",
        "hi": "Look at this crowd, {player}! All for your zoo! I'm going to cheer. Too late, I'm cheering."
      },
      "zoo_empty": {
        "any": [
          "No guests! I can hear my own echo off the exhibits. Hello! See?",
          "Not one visitor. Like my classroom the day I announced a quiz on water."
        ],
        "lo": "The zoo's empty today. Did I come on the wrong day? I do that.",
        "hi": "An empty zoo is okay, {player}. I've taught to an empty room. Gave my best lesson. The cat stayed."
      },
      "zoo_closed": {
        "any": [
          "It's closed! Am I allowed in? I'm in. Nobody stopped me. Should somebody stop me?",
          "Zoo's shut for the day. So quiet. I'm tiptoeing. In dress shoes. It isn't working."
        ],
        "lo": "Closed? Oh. Somebody told me closed means members only. Am I a member? I said yes.",
        "hi": "A closed zoo and you let me hang around, {player}. I feel like the teacher's pet. That's new."
      },
      "litter_bad": {
        "any": [
          "There's trash all over the path! My classroom floor looks better, and I teach with pie!",
          "Litter everywhere. I slipped on some and slid like I was stealing second base. Safe! Barely."
        ],
        "lo": "Kind of messy on these paths, huh? Not judging! My desk has a crumb layer.",
        "hi": "{player}, this litter isn't you. You've got too much on your plate. I know that look. I wear it."
      },
      "stars_high": {
        "any": [
          "FIVE STARS! Or four! Lots of stars! That's an A plus in my book!",
          "Everybody's saying this zoo's top of the league. I believe them. This time I'm right to!"
        ],
        "lo": "Great rating, I hear! You must be good at this. I can never tell if I'm good at things.",
        "hi": "Top stars, {player}! I'd pin that rating up on my classroom wall. Next to the cat's paw print."
      },
      "stars_low": {
        "any": [
          "The rating's low? Hey, I got booed at my own bake sale. You bounce back.",
          "Not many stars. So what! Ninth inning's when it turns around. That's just baseball."
        ],
        "lo": "Somebody said the zoo's rated badly. I didn't believe them. First time for everything.",
        "hi": "Bad ratings sting, {player}. I grade myself every night, and I'm a tough marker. You're better than a number."
      },
      "coins_low": {
        "any": [
          "Low on Zoo Coins? I know that one! I spent my last on a bean. A magic one. It wasn't.",
          "Money's tight, huh. I've stretched one bag of flour through a whole month. It can be done."
        ],
        "lo": "I heard the zoo's short on coins. I'd lend advice, but mine's the bad kind.",
        "hi": "{player}, don't carry the coin worry alone. I can't do sums under pressure, but I can listen all day."
      },
      "animal_sick": {
        "any": [
          "One of the animals isn't doing well. I can't stop looking over there. Poor thing.",
          "That animal's sick. I got quiet. You know it's serious when I get quiet."
        ],
        "lo": "Hey, uh, one of your animals looks really unwell. I thought you should hear it, even from me.",
        "hi": "{player}, that sick animal's breaking my heart. You'll make it right. You're the one person I'm sure about."
      }
    },
    "near": {
      "sheila": [
        "SHEILA! She's got cats AND recipes. If she ever opens a school I'm out of a job.",
        "Sheila told me a joke last week, {player}. I got it this morning. It was good!"
      ],
      "jack": [
        "That's Jack. Great fisherman. He told me fish bite better if you sing. I sang for an hour.",
        "Jack pranks me every week and I fall for it every week. I think that's a friendship?"
      ],
      "don_l": [
        "Don L. invented a sport with nine bases and a goat. I signed up. I'm the only one who signed up.",
        "Don L.'s louder than me! We talked once. Folks three streets over joined in."
      ]
    }
  },
  "terra": {
    "intro": "Oh, hello! My name is Terra. I'm an environmental researcher, which means I listen to soil and count leaves for a living. I'm so glad the world put you on my path today.",
    "scenes": {
      "home_morning": {
        "any": [
          "Good morning! I'm watering everyone before I go out. That's forty-one pots. I counted twice.",
          "You've caught me at breakfast with the ferns. They have water, I have berries. We're all content."
        ],
        "lo": "Oh, a morning visitor! Do mind the vine by the door. It's shy with new people.",
        "hi": "{player}! The morning glories opened the moment you knocked. I don't think that's a coincidence."
      },
      "home_evening": {
        "any": [
          "The plants and I are settling in. I read to them at night. Tonight it's a chapter about moss.",
          "Evening at home. I've turned every pot a quarter turn so nobody sleeps facing the wall."
        ],
        "lo": "How kind of you to call so late. I'm speaking softly, you see. The seedlings are nearly asleep.",
        "hi": "I'm so glad you came by, {player}. The house is green and quiet at night, and it's nicest shared."
      },
      "walking_to_zoo": {
        "any": [
          "I'm on my way to the zoo. It's a short walk, but I've stopped for four dandelions already.",
          "This path to the zoo has such good hedges. I say good morning to each one. It does slow me down."
        ],
        "lo": "Oh, hello. I'm walking to the zoo to see the animals. I do hope they slept well.",
        "hi": "I was walking to the zoo, {player}, and now I've met you on the way. The day is already complete."
      },
      "at_zoo": {
        "any": [
          "I'm visiting every exhibit in order, so that no one feels skipped.",
          "I've been admiring the grass in each enclosure. I knelt down for a proper look."
        ],
        "lo": "I'm only a visitor today. I hope it's all right that I whisper encouragement to the animals.",
        "hi": "Every animal I pass looks cared for, {player}. That's you. I can see your kindness in every exhibit."
      },
      "walking_home": {
        "any": [
          "I'm walking home with a pocket full of fallen leaves. Each one was too pretty to leave behind.",
          "The zoo day is over and my feet are tired, in the nice way that comes from standing near animals."
        ],
        "lo": "I'm heading home now. Thank you for keeping such a gentle zoo. I mean that.",
        "hi": "I'm going home so happy, {player}. I'll tell the houseplants all about your animals."
      },
      "at_work": {
        "any": [
          "One moment, I'm measuring this sprout. A finger and a half. It's grown since yesterday!",
          "I'm testing the soil. I smell the air, I squeeze the earth, I write it down. Twice."
        ],
        "lo": "Oh, hello. I'm in the middle of my research. Would you like to hear about compost? Most don't.",
        "hi": "{player}! The compost is warm today. That means it's alive. I wanted you to be the first to know."
      },
      "following": {
        "any": [
          "What a lovely walk. I've met three new kinds of grass since we set out.",
          "I'm right behind you. I only fell back to move a worm off the path."
        ],
        "lo": "Thank you for bringing me along. I'm trying to keep up. Flowers do keep stopping me.",
        "hi": "I'd follow you across the whole green world, {player}. Slowly, with pauses for moss."
      },
      "following_night": {
        "any": [
          "How quiet the trees are in the dark. I think they're listening to our footsteps.",
          "I've never walked so far from home at night. Even the grass sounds different after dark."
        ],
        "lo": "I've not been out this late before. I'm sure you know the way. I trust you do.",
        "hi": "I'm not afraid of the dark with you, {player}. The night is only the day resting its eyes."
      },
      "staying": {
        "any": [
          "I'm waiting right here. I've made friends with this patch of ground already.",
          "Standing still is lovely. You notice the ants. There are nineteen. One is carrying a petal."
        ],
        "lo": "I'll wait, of course. There's no hurry at all. I'm never bored where things grow.",
        "hi": "I'll be right here when you return, {player}. I'll have named every blade of grass by then."
      },
      "rain": {
        "any": [
          "Listen to the rain on the leaves. Each one makes its own small sound.",
          "My gown is soaked and I don't mind in the least. The roots are so happy."
        ],
        "lo": "Oh, don't mind the rain. It's only the sky looking after the garden.",
        "hi": "{player}, I'm going to stand in this rain a little longer. I'll enjoy it enough for both of us."
      },
      "thunder": {
        "any": [
          "Such thunder! The sky is clearing its throat. I do hope the birds have found shelter.",
          "The storm is loud, but the oaks have stood through hundreds. I take my courage from them."
        ],
        "lo": "A thunderstorm. Please don't worry. The earth has been doing this a very long time.",
        "hi": "I jumped at that thunder, {player}. I'm fretting over every nest in every tree. It helps that you're here."
      },
      "full_moon": {
        "any": [
          "The full moon! Everything is silver. Even the weeds look like jewellery.",
          "The moon is so bright tonight that the flowers can't decide whether to sleep."
        ],
        "lo": "What a round, kind moon. It lights the way home for all the small creatures.",
        "hi": "On full moons I plant one seed and make one wish, {player}. Tonight's wish had you in it."
      },
      "dark_moon": {
        "any": [
          "No moon tonight. The stars have the whole sky to themselves. Good for them.",
          "It's very dark. I'm walking carefully, so I don't step on anyone who lives in the grass."
        ],
        "lo": "Such a dark night. Don't be uneasy. The soil is just as kind in the dark.",
        "hi": "It's too dark to see your face, {player}, but I know it's a kind one. I've memorised it, like a favourite leaf."
      },
      "dawn": {
        "any": [
          "Sunrise! Watch, the flowers will turn their heads. There. Did you see?",
          "The first light is the colour of a peach. The whole garden is stretching."
        ],
        "lo": "Good dawn to you. You must love the early hours too. So few people come to see them.",
        "hi": "A new sunrise, {player}, and nothing has gone wrong in the day yet. I like beginning it beside you."
      },
      "dusk": {
        "any": [
          "The sun is setting. The sky is doing its best work, and nobody asked it to.",
          "Dusk. The bees are going home. I counted them in. I believe everyone made it."
        ],
        "lo": "Sunset already. I hope your day was a gentle one.",
        "hi": "Every sunset I ask whether I helped the world today, {player}. On days I see you, it's always yes."
      },
      "nether": {
        "any": [
          "Oh my. So much heat and fire. Wait, there's a fungus! Hello, brave little fungus.",
          "All this lava and hardly a leaf to be seen. This poor land needs a friend."
        ],
        "lo": "It's very red and very hot here. I'm sure it has its own kind of beauty. I'm still looking for it.",
        "hi": "{player}, do you think anyone has ever said something kind to the Nether? I'm going to start."
      },
      "the_end": {
        "any": [
          "No soil, no seeds, no sunrise. And yet those tall fellows chose to live here. I'd love to know why.",
          "This pale stone has never met a root. I patted it. It seemed surprised."
        ],
        "lo": "How still it is under this dark sky. I won't stare at the tall ones. They seem shy.",
        "hi": "I feel very far from every tree I know, {player}. You're the greenest thing here, and you're not even green."
      },
      "fishing_sky": {
        "any": [
          "Islands in the sky, with grass on top! The clouds must water them personally.",
          "The fish up here swim higher than birds fly. I do hope nobody has told them."
        ],
        "lo": "What a wonder. I'll only watch the pools, if that's all right. The fish look so settled.",
        "hi": "{player}, if a seed fell from this island, imagine where it might land. I've been imagining for ages."
      },
      "acufend": {
        "any": [
          "A jungle on a moon! The leaves here are shapes I've never drawn before.",
          "The creatures here love music. I hummed to a vine and one of them joined in."
        ],
        "lo": "What a gentle village, on a moon of all places. I hope we're being good guests.",
        "hi": "{player}, a little creature sang to my hair. I think it was singing to the leaves in it. I'm so honoured."
      },
      "cave": {
        "any": [
          "So far from the sun, and still things find a way to live down here. Life is so stubborn. I love it.",
          "It's cool and damp in this cave. A mushroom would call it paradise."
        ],
        "lo": "I've not spent much time underground. It's where the roots live, so I feel welcome.",
        "hi": "I miss the sky a little down here, {player}. But you're with me, and stone is earth too. I can manage."
      },
      "high_up": {
        "any": [
          "Look how far the green goes! Forests and fields, all stitched together.",
          "The trees look like moss from up here. I want to pet the whole valley."
        ],
        "lo": "What a height. The wind is so clean up here. Thank you for showing me this.",
        "hi": "From this high I can see how much there is to look after, {player}. It's less frightening beside you."
      },
      "hostile_near": {
        "any": [
          "Oh, there's a monster close by. It does look cross. Perhaps nobody ever asked how it was.",
          "Something is groaning near us. I'd like to help it, but I think it prefers to be left alone."
        ],
        "lo": "Oh dear, do be careful. That monster doesn't seem to want new friends today.",
        "hi": "{player}, I couldn't bear it if that monster hurt you. I'd never forgive the dark."
      },
      "creeper_near": {
        "any": [
          "A creeper! It's green and leafy looking, so I want to like it. It's making that very hard.",
          "That creeper is hissing. I think it's upset. I'm going to give it a great deal of room."
        ],
        "lo": "Oh, a creeper, just there. I'm sure it means well. From a long way off.",
        "hi": "{player}, the creeper! It's the only green thing I've ever wished further away from you."
      },
      "villager_near": {
        "any": [
          "Villagers! I do love how they keep their gardens. I could stay here a week.",
          "What a peaceful village. I waved at a farmer. He nodded. We understand each other."
        ],
        "lo": "Such kind looking villagers. Though if there's a butcher, I'll walk the long way round.",
        "hi": "{player}, a village farmer showed me his beetroot. I nearly cried. You'd have laughed at me, nicely."
      },
      "pet_near": {
        "any": [
          "What a dear companion you have. Look at those bright eyes. It's clearly loved.",
          "Your pet has such a healthy coat. That tells me everything about its home."
        ],
        "lo": "Oh, is this little one yours? It chose well. Animals can always tell.",
        "hi": "Your pet adores you, {player}. I asked it. Well, I looked at it and it leaned on me, which is the same."
      },
      "farm_animal_near": {
        "any": [
          "Hello, sheep. Hello, hens. You keep your wool and your eggs, they suit you.",
          "Animals in an open field, with grass to their knees. This is how it should look."
        ],
        "lo": "What contented farm animals. I always thank the farmers who are gentle with them.",
        "hi": "{player}, that pig is smiling. I've studied a great many pigs. That one is definitely smiling."
      },
      "zoo_animal_near": {
        "any": [
          "Hello, {species}. You look well today. Is the grass to your liking?",
          "I've been watching the {species} breathe. Slow and even. That's a contented animal."
        ],
        "lo": "Oh, the {species}! I hope it's happy here. It has a calm look about the eyes.",
        "hi": "The {species} trusts you, {player}. See how it doesn't flinch? That's the nicest thing an animal can say."
      },
      "guests_crowd": {
        "any": [
          "So many guests! I do hope each of them goes home loving one animal more than before.",
          "What a crowd. I've been gently catching dropped things before they reach the ground."
        ],
        "lo": "It's busy just here. If we're parted in the crowd, I'm the one apologising to the hedge.",
        "hi": "All these guests came to see living things, {player}. You gave them that. I could burst."
      },
      "residents_crowd": {
        "any": [
          "All my neighbours together! It's like a garden where every flower is a different sort.",
          "Everyone from the street is here. I've brought nobody a seedling. I feel dreadful."
        ],
        "lo": "These are my neighbours. They're lovely, every one. Even the prickly ones. A cactus is lovely too.",
        "hi": "A whole crowd of neighbours, {player}, and still my eyes found you first. Like a sunflower finds the sun."
      },
      "other_resident": {
        "any": [
          "Oh, there's {other}! I've been meaning to tell {other} about my new ivy.",
          "{other} is nearby. I think {other} has such a good heart. I think that about everyone, but still."
        ],
        "lo": "Have you met {other}? I'm sure you'd get along. Everyone gets along, given water and time.",
        "hi": "Between us, {player}, I once talked to {other} about soil for an hour. {other} was so polite about it."
      },
      "other_player": {
        "any": [
          "Oh, two of you! Hello, {other}. Any friend of the zoo is a friend of the earth.",
          "Welcome, {other}. I hope you both walk softly. The clover just here is very young."
        ],
        "lo": "Hello to you as well, {other}. I'm Terra. There's a leaf in my hair, I know.",
        "hi": "You've brought {other}, {player}! Kind people travel together, like bees."
      },
      "alone_night": {
        "any": [
          "Only us and the night. Listen. You can almost hear the grass growing.",
          "Nobody else is about tonight. The world feels like a garden after the visitors have gone."
        ],
        "lo": "It's so still tonight with just the two of us. I hope my chatter isn't spoiling the quiet.",
        "hi": "May I tell you a secret, {player}? Sometimes I fear I can't save it all. Out here tonight, I feel I can."
      },
      "by_water": {
        "any": [
          "Look at the water. I can see right to the bottom. That makes me so glad.",
          "The reeds are bowing to the water. I always bow back."
        ],
        "lo": "What clean water. I've been counting the ripples. I lost count and started again.",
        "hi": "I could sit by this water with you for hours, {player}. I'd only talk about pond weed a little."
      },
      "by_lava": {
        "any": [
          "Lava. It's the earth's own heartbeat, showing. I respect it from back here.",
          "Nothing grows beside lava, poor thing. It must be lonely, being that warm."
        ],
        "lo": "I'm keeping well back from the lava. The earth is generous, but that part of it is not.",
        "hi": "{player}, you're standing so close to the lava. My heart is in my mouth. I can't help it."
      },
      "by_flowers": {
        "any": [
          "Oh, flowers! Hello, hello, hello. I do try to greet each one.",
          "I'm standing very still so the bees will forgive me for being in their way."
        ],
        "lo": "Aren't these flowers beautiful? I never pick them. I only visit.",
        "hi": "If you were a flower, {player}, you'd be the one that comes up first after winter. I've decided."
      },
      "by_fire": {
        "any": [
          "A fire. I always thank the wood. It grew for years to keep us warm one evening.",
          "How cosy. I do hope only fallen branches went into this fire."
        ],
        "lo": "What a warm glow. I'll stay out of the smoke, so the leaves in my hair stay leaves.",
        "hi": "Firelight on your face, {player}. You look like autumn. That's my second favourite season."
      },
      "by_crops": {
        "any": [
          "Crops! Look at them reaching. Somebody loves this field, I can tell from the soil.",
          "Things growing in good dark earth. Food that hurts no one. My favourite kind."
        ],
        "lo": "What a well kept field. Farmers are the earth's best friends, I always say.",
        "hi": "{player}, if these are your crops, I'm so proud I could sprout. Truly. Look at the colour of them."
      },
      "by_books": {
        "any": [
          "Books. All of this was trees once. I hope the words inside are worth it.",
          "I love a shelf of books. I look for the ones about ferns first. Then the other ferns."
        ],
        "lo": "So many books. I say a quiet thank you to the paper. Old habit.",
        "hi": "{player}, would you believe I've written a book? It's sixty pages on one hedge. I'd blush if you read it."
      },
      "in_snow": {
        "any": [
          "Snow! The earth has pulled up its blanket. Everything underneath is only sleeping.",
          "How quiet snow makes the world. Even my footsteps sound like whispers."
        ],
        "lo": "It's cold in the snow, but don't worry for the seeds. I like to think they're snug down there.",
        "hi": "{player}, there are snowflakes on the leaves in my hair. I believe I'm officially winter now."
      },
      "holding_gift": {
        "any": [
          "Oh, a {item}! What a lovely thing to be carrying.",
          "Is that a {item}? It does make me smile to see one."
        ],
        "lo": "Forgive me for looking. That {item} is simply so pleasant.",
        "hi": "{player}, a {item}! I'm trying to be poised about it. My leaves are rustling."
      },
      "holding_weapon": {
        "any": [
          "Oh. A {item}. I'm sure it's only for keeping gentle things safe.",
          "That {item} looks very fierce. I trust the hand that holds it."
        ],
        "lo": "You're carrying a {item}. I won't ask what for. I'll simply hope.",
        "hi": "I don't love a {item}, {player}, but I love that it's you holding it. You'd only ever protect."
      },
      "holding_food": {
        "any": [
          "Is that {item}? I do hope it grew in the ground. The ground makes the best meals.",
          "You've got {item}. I never ask where food came from. Well. I always ask."
        ],
        "lo": "Oh, you're eating. A {item}. I'll just look at this tree for a moment, in case.",
        "hi": "{player}, whatever I think of {item}, I'm glad you're eating. You forget to. Like I forget lunch."
      },
      "holding_rod": {
        "any": [
          "A fishing rod. Oh. I'll think of it as a way to wave at the fish.",
          "You're going fishing. I do hope the fish are quick today. No offence meant."
        ],
        "lo": "A fishing rod. I see. I'm sure you're very gentle about it.",
        "hi": "{player}, I can't cheer for the fishing rod, but I'll sit by you and cheer for the pond."
      },
      "holding_tool": {
        "any": [
          "A {item}! The earth and that tool know each other well, I expect.",
          "Someone's been working. That {item} has good honest soil on it."
        ],
        "lo": "A {item}. I hope the ground gets a thank you afterwards. It likes that.",
        "hi": "{player}, when you carry a {item} I know something good is about to be built or grown."
      },
      "armored": {
        "any": [
          "Goodness, so much armour. You look like a beetle. That's a compliment, beetles are splendid.",
          "All that armour came out of the ground, you know. The earth is hugging you."
        ],
        "lo": "You look very protected in your armour. I'm glad. The world needs its careful people kept safe.",
        "hi": "{player}, I worry less when you're all wrapped up in armour. Like a seed in its shell."
      },
      "hurt": {
        "any": [
          "Oh, you're hurt! You're pale as birch bark. It pains me to see it.",
          "You're badly wounded. My heart aches. Even a strong tree needs time to mend."
        ],
        "lo": "Oh dear, you look terribly hurt. I know we've only just met, but I do care.",
        "hi": "{player}, you're hurt and I can hardly breathe for worry. The world can wait while you mend. It will."
      },
      "wet": {
        "any": [
          "You're soaked through! Like a fern after a storm. It suits you.",
          "You're dripping. The grass at your feet is very grateful."
        ],
        "lo": "Oh, you're all wet. Water is good for nearly everything, so I shan't worry.",
        "hi": "{player}, you're drenched. If you were a plant, I'd say you were perfectly watered."
      },
      "sneaking": {
        "any": [
          "Oh, are you crouching to see the beetles? That's the best height for it.",
          "You're so low to the ground. The clover must look enormous from there."
        ],
        "lo": "Are you hiding down there? I shan't tell. I'm good at keeping still, I learned it from frogs.",
        "hi": "{player}, are we tiptoeing so we don't wake the daisies? You're so thoughtful."
      },
      "long_time": {
        "any": [
          "Oh, it's been days! I was beginning to wonder if you'd taken root somewhere.",
          "There you are! Several sunrises without a word. I noticed every one."
        ],
        "lo": "Hello again, after so long. I wasn't sure you'd remember me. I remembered you.",
        "hi": "{player}! I've missed you. My tallest seedling grew two leaves while you were away. I saved the news."
      },
      "first_today": {
        "any": [
          "Hello! The first hello of the day is the freshest. I've kept this one just for now.",
          "Good day to you! Have you noticed the air? It smells like something is about to bloom."
        ],
        "lo": "Oh, hello. We've not spoken yet today. I hope it's treating you kindly so far.",
        "hi": "{player}! My day hadn't quite started until just now. There. Now it has."
      },
      "zoo_busy": {
        "any": [
          "The zoo is full today! So many people learning to love animals at once.",
          "It's very crowded in the zoo. I've been standing by the bins, cheering them on."
        ],
        "lo": "So many guests in the zoo today. I hope they're all walking gently and reading the signs.",
        "hi": "The zoo is packed, {player}. You've made so many strangers care. That's my whole dream, you know."
      },
      "zoo_empty": {
        "any": [
          "No guests today. The animals have the zoo to themselves. They seem to like it.",
          "How quiet the zoo is with nobody visiting. I can hear leaves landing."
        ],
        "lo": "The zoo is empty, but please don't be discouraged. Gardens are quiet before they bloom.",
        "hi": "{player}, an empty zoo isn't a sad one. The animals are content, and I'm here. I count as a guest."
      },
      "zoo_closed": {
        "any": [
          "The gates are closed. The animals are having a rest from being looked at.",
          "A closed zoo is so peaceful. I've been tiptoeing so the paths can sleep."
        ],
        "lo": "Oh, the zoo is closed. I do hope I'm not intruding. I only wanted to say goodnight to a few.",
        "hi": "I like the zoo closed, {player}. It feels like you and I are the night gardeners of a secret."
      },
      "litter_bad": {
        "any": [
          "Oh, the litter. It's on every path. I've picked up nine pieces and I can see nine more.",
          "So much rubbish on the ground. My hands are full and my heart is heavy."
        ],
        "lo": "I don't wish to be rude, but the paths are in a sorry state. The animals deserve better.",
        "hi": "{player}, I know you'd never mean for this litter to pile up. It just grieves me so. Forgive me for saying."
      },
      "stars_high": {
        "any": [
          "Such a wonderful rating! To me it means the animals are happy, and that's the only star I count.",
          "Everyone says the zoo is splendid. I told a hedge. It already knew."
        ],
        "lo": "Your zoo is very well thought of. I'm not surprised. It smells like care.",
        "hi": "{player}, all those stars! I'm as proud as a bean that's reached the top of its pole."
      },
      "stars_low": {
        "any": [
          "I hear the rating is low. Ratings are like weather. They pass, and things keep growing.",
          "So few stars. I think people haven't looked closely enough yet."
        ],
        "lo": "The zoo's rating is struggling, I'm told. I'm sorry. Every garden has a hard season.",
        "hi": "Don't let the stars hurt you, {player}. I've seen you with the animals. No number knows that."
      },
      "coins_low": {
        "any": [
          "I hear the Zoo Coins are nearly gone. Oh dear. Lean seasons do end. Every winter I've met has.",
          "Money is short, they say. I never understand coins. But I understand worry, and I'm sorry."
        ],
        "lo": "I'm told the zoo has very few coins left. I hope the animals don't feel it.",
        "hi": "{player}, you look tired about the Zoo Coins. I'm here to lean on. Trees do it all the time."
      },
      "animal_sick": {
        "any": [
          "One of the animals is unwell. I can feel it. I can't think about anything else.",
          "There's a poor creature suffering here. I've been standing near and humming, in case it helps."
        ],
        "lo": "Please, one of the animals is not well at all. I had to tell someone. I'm so sorry to trouble you.",
        "hi": "{player}, that animal is hurting and I'm near tears. I know you'll tend to it. You always, always do."
      }
    },
    "near": {
      "ron": [
        "Oh, Ron is here! He grows things and knows every bird by its call. I could listen to him all day.",
        "Ron showed me his soil once, {player}. I've thought about it ever since."
      ],
      "paola": [
        "That's Paola. She chops trees. I've decided she says sorry to each one. Please don't tell me otherwise.",
        "Paola pretends to be sharp, but I've seen her with baby animals. She's soft as moss."
      ],
      "desilva": [
        "Desilva says she loves trash. I think she just hasn't met the right compost heap.",
        "I gave Desilva a daisy. She said it was hideous, {player}. She kept it, though. I saw."
      ]
    }
  },
  "jaylen": {
    "intro": "Jaylen. The Hairline Artist, the one and only. I draw hairlines sharper than anything that grows, right hand only. Go ahead and stare, champ, everyone does.",
    "scenes": {
      "home_morning": {
        "any": [
          "You caught me mid warm-up. Twenty push-ups, then I draw the day's hairline. In that order, every morning.",
          "Morning at my place means mirror time. The line goes on before breakfast. Priorities, champ."
        ],
        "lo": "You're at my door this early? Bold. Wipe your feet, that rug cost more than your boots.",
        "hi": "Come in, {player}. You get to see the forehead before the line goes on. Nobody sees that. Nobody."
      },
      "home_evening": {
        "any": [
          "Evening routine. Stretch, polish the diamonds, put the right hand on its own pillow. Yes, it has a pillow.",
          "I'm winding down. Even my couch is expensive, so I relax harder than most people."
        ],
        "lo": "Visiting hours at my house are short. I need my beauty sleep, and it's working, clearly.",
        "hi": "Sit down, stay a while. It gets quiet in here at night, and I'm not great at quiet."
      },
      "walking_to_zoo": {
        "any": [
          "I'm power walking to the zoo. Don't call it a stroll. I'm on pace for a personal best.",
          "Halfway to the zoo and I haven't broken a sweat. Well, I have. But it looks good on me."
        ],
        "lo": "Can't stop long, I've got a zoo to impress. Keep up if you can. Most can't.",
        "hi": "Walk with me, {player}. On the right side. I saved it for you, that's the VIP side."
      },
      "at_zoo": {
        "any": [
          "I've seen six exhibits and every animal looked at me first. I counted.",
          "I'm doing a lap of the exhibits. Second lap, actually. I lapped a family back there."
        ],
        "lo": "You're the one who runs this zoo? Decent. I've seen fancier, but only in my head.",
        "hi": "Okay, honestly? I love this place. I'd never say it loud. I'm saying it medium."
      },
      "walking_home": {
        "any": [
          "Heading home with tired legs. Winner's tired, though. It's a better kind.",
          "Zoo's done, I'm walking it off. Cool-down lap. Pros always do a cool-down lap."
        ],
        "lo": "I'm on my way home. Tell the animals I said they did fine. Not great. Fine.",
        "hi": "Good day, {player}. I'd say best day, but I say that about most days with you in them."
      },
      "at_work": {
        "any": [
          "Work? I'm an artist, champ. I'm scouting foreheads. That one over there is a blank canvas.",
          "I don't clock in. I practise. A hundred straight lines a day, and the right hand never complains."
        ],
        "lo": "I'm busy being the Hairline Artist. It's a full-time thing. You wouldn't get it yet.",
        "hi": "I'm sketching new styles. Tell me straight which one's best. I trust your eye, and only yours."
      },
      "following": {
        "any": [
          "Adventure, huh? Good. I needed a real workout. Laps round the street were getting too easy.",
          "I'm right behind you. Well, right beside you. I don't do behind."
        ],
        "lo": "I'm tagging along, but let's be clear, I'm the star of this trip. You're the guide.",
        "hi": "Wherever we're going, I'm in. I'd follow you anywhere, {player}. Jogging, obviously."
      },
      "following_night": {
        "any": [
          "Out this late and my hairline still looks sharp in the dark. That's craftsmanship.",
          "Night hike. Fine. I'm not jumpy, I'm staying loose. Bouncing on my toes. Athlete stuff."
        ],
        "lo": "It's dark and I barely know you. Good thing I'm brave. Extremely brave. Walk faster.",
        "hi": "It's the middle of the night and I'm still here, {player}. I'd only skip my eight hours for you."
      },
      "staying": {
        "any": [
          "Standing still is harder than it looks. I'm doing calf raises so the time isn't wasted.",
          "I'm holding this spot like a goalkeeper. Nothing gets past me. Nothing's tried, but still."
        ],
        "lo": "You want me to wait? Me? Fine. But I'm posing, not waiting. There's a difference.",
        "hi": "I'll wait. Don't be long, alright? It's less fun being great with nobody watching."
      },
      "rain": {
        "any": [
          "It's pouring and my line hasn't moved. Waterproof. Ask real hair how its day is going.",
          "Rain's just a free cool-down. I'd run a lap in it, but these shoes were expensive."
        ],
        "lo": "You look soggy, champ. I look exactly the same as I did dry. That's the drawn-on difference.",
        "hi": "Stand under this tree with me, {player}. I'd share an umbrella if I'd bought one. I bought diamonds."
      },
      "thunder": {
        "any": [
          "That thunder was loud. I didn't jump. That was a quick stretch.",
          "Lightning's fast, I'll give it that. Fastest thing out here besides me."
        ],
        "lo": "Storms don't scare me. I'm standing this close to you for your sake. You're welcome.",
        "hi": "Okay, that last crack got me a little. Don't tell anybody. Just stay close till it passes."
      },
      "full_moon": {
        "any": [
          "Full moon tonight. Big, round, bright, and not one hair on it. Respect.",
          "Look at that moon showing off. I know showing off when I see it. Good form."
        ],
        "lo": "The moon's out, so now you can see the hairline at night too. Lucky you.",
        "hi": "Moon's so bright I can see you grinning, {player}. Good. It's a good night to be us."
      },
      "dark_moon": {
        "any": [
          "No moon at all. Nobody can see my hairline. This is a tragedy for everyone.",
          "It's so dark I nearly used my left hand to feel for the wall. Nearly. I caught myself."
        ],
        "lo": "Dark night. You can't see how good I look right now, so just take my word for it.",
        "hi": "I can't see a thing, {player}. Keep talking so I know where you are. For your safety. Mostly mine."
      },
      "dawn": {
        "any": [
          "Sunrise. I beat it out of bed again. That's me one, the sun nothing, all week.",
          "First light is the best light for a fresh line. Steady hand, clean edge, no crowd."
        ],
        "lo": "Up at sunrise? Huh. Maybe you've got a little champion in you after all.",
        "hi": "Watching the sun come up with you. Okay. That's nice. I'm allowed to say nice."
      },
      "dusk": {
        "any": [
          "Sun's going down all orange and gold. Too much gold. I'm looking the other way.",
          "Sunset is the final whistle on the day. I played all four quarters. Did you?"
        ],
        "lo": "Day's ending and you still haven't asked about the hairline. Everybody asks by sunset.",
        "hi": "Another day done, {player}. We won it. I checked the scoreboard, we always win."
      },
      "nether": {
        "any": [
          "It's boiling down here and the line hasn't run. Drawn on. Undefeated, even next to lava.",
          "Netherrack everywhere. Red on red on red. This whole place needs one clean edge."
        ],
        "lo": "You brought me to a pit of lava. As a first impression, champ, that's a strange play.",
        "hi": "I'd only come down here for you, {player}. Those piglins are covered in gold. I can't even look."
      },
      "the_end": {
        "any": [
          "Those tall dark guys keep staring. I get it. I'd stare at me too, but it's getting weird.",
          "No sun, no grass, just a big drop into nothing. I'm staying in the middle. For balance."
        ],
        "lo": "Whatever this place is, I'm the best looking thing in it. Low bar, but I cleared it.",
        "hi": "This sky gives me the creeps, {player}. Stay where I can see you. That's an order from a friend."
      },
      "fishing_sky": {
        "any": [
          "Floating islands. I could jump to that next one. I won't, but the legs are ready.",
          "We're above the clouds. Finally, a place as high up as my standards."
        ],
        "lo": "Fishing in the sky? I'm more of a sprinter than a sitter. I'll watch you, I guess.",
        "hi": "Bet I'd catch a bigger one than you, right hand only. Loser carries the bucket. Kidding. Mostly."
      },
      "acufend": {
        "any": [
          "A round moon full of creatures that love music. I've got rhythm. Watch the footwork.",
          "These jungle guys are humming at me. I think they want a hairline. Everybody does eventually."
        ],
        "lo": "Weird moon, weird music, weird creatures. And somehow you're still the one I know least.",
        "hi": "This place is strange, {player}, and I love it. Don't tell the neighbours I danced."
      },
      "cave": {
        "any": [
          "Caves are where diamonds come from, so I respect it down here. I just don't like the ceiling.",
          "It's dusty and my shoes are getting scuffed. Somewhere in this rock is a diamond with my name on it."
        ],
        "lo": "You dig, I'll supervise. My right hand is for art, not for pickaxes.",
        "hi": "If we find one diamond down here, {player}, I'm going to yell. Fair warning. Happy yell."
      },
      "high_up": {
        "any": [
          "Top of the world. Feels right. This is about where I picture myself all the time.",
          "Long way down. My knees aren't shaking, that's me staying loose for the descent."
        ],
        "lo": "Nice view. Better with me in front of it. Go on, take it in.",
        "hi": "From up here everything's tiny, {player}. Makes my big talk feel kind of small. Kind of."
      },
      "hostile_near": {
        "any": [
          "Monster, right there. I could take it. I'm choosing not to, as a strategy.",
          "That thing's coming closer and its hair is a mess. Two reasons to back up."
        ],
        "lo": "There's a monster behind you. I'd handle it, but these hands are for art.",
        "hi": "Get behind me, {player}. No, wait, I'll get behind you. No. Side by side. We do this together."
      },
      "creeper_near": {
        "any": [
          "Creeper. Green, bald, no arms. Zero hairline and a bad attitude. Back up, back up.",
          "That creeper's hissing at me. Nobody hisses at me. I'm leaving, but out of disrespect."
        ],
        "lo": "You see that creeper too, right? Good. I'm going to go stand way over there. Fast.",
        "hi": "Creeper! Move, {player}, move! I'm not losing my best teammate to a walking bush."
      },
      "villager_near": {
        "any": [
          "Villagers. Big foreheads, no hairlines, all of them. I've never seen so much opportunity.",
          "I showed a villager the line and all I got was a hrmm. I'm taking it as applause."
        ],
        "lo": "This village hasn't heard of me yet. Give it an hour.",
        "hi": "One of them looked at my shoes for a long time. They're expensive, I get it. Back me up, {player}."
      },
      "pet_near": {
        "any": [
          "Your pet's got a lot of real hair. A lot. But it's loyal, and I rate loyalty.",
          "That little guy keeps up with you everywhere. Good stamina. I'd put it on my team."
        ],
        "lo": "Your pet's sniffing my shoes. Careful, buddy, those cost more than your whole collar.",
        "hi": "Okay, come here, fluffy. One pat. Right hand. That's the good one, you're honoured."
      },
      "farm_animal_near": {
        "any": [
          "Cows just stand around all day. No drills, no training. Wasted potential.",
          "That chicken ran from me. Quick first step, I'll admit. I let it win."
        ],
        "lo": "Farm animals. Not exactly expensive company, but they stare at me like everyone else does.",
        "hi": "That pig's got less hair than the sheep. I like the pig better. Don't read into it, {player}."
      },
      "zoo_animal_near": {
        "any": [
          "The {species} is staring right at my hairline. Animals know quality.",
          "I'd race that {species}. Fair start, nobody gets a lead. I like my odds."
        ],
        "lo": "That {species} is yours? Okay, zoo boss. Slightly impressed. Slightly.",
        "hi": "I come by to see the {species} more than I let on, {player}. That stays between us three."
      },
      "guests_crowd": {
        "any": [
          "Look at this crowd. They came for the animals and stayed for the hairline.",
          "So many people. I'm standing where the light's best so nobody misses out."
        ],
        "lo": "Big crowd today. Don't worry, I'll still make time for you. Briefly.",
        "hi": "All these people watching and I only care if you saw my entrance, {player}. Did you see it?"
      },
      "residents_crowd": {
        "any": [
          "The whole street's out here. Feels like a team huddle. I'm captain. Nobody voted, it's just true.",
          "Neighbours everywhere. Half of them have real hair. I'm being very polite about it."
        ],
        "lo": "You're meeting everybody today, huh? Save the best for last. That's me, I'm last.",
        "hi": "I act like I don't need these people, {player}. I'd miss every one of them. Keep that quiet."
      },
      "other_resident": {
        "any": [
          "{other}'s right there. Good neighbour. Would be a great one with a cleaner hairline.",
          "I challenged {other} to a race once. Still waiting on an answer. Scared, probably."
        ],
        "lo": "You know {other} too? Fine, but remember who's the most interesting one on this street.",
        "hi": "Between you and me, {player}, {other} is alright. I'd never say it to their face."
      },
      "other_player": {
        "any": [
          "Oh, {other} is here too? A bigger audience. Finally, the turnout I deserve.",
          "Two of you now. {other}, stand on my right. Wait, that spot's taken. Stand somewhere."
        ],
        "lo": "You brought {other}? Good, one of you can hold my stuff while the other admires.",
        "hi": "{other} seems cool, but you're still my number one, {player}. I don't hand that spot out twice."
      },
      "alone_night": {
        "any": [
          "Just us and the dark. No crowd to impress. Weird feeling. I kind of don't hate it.",
          "Nobody around. I could flex and no one would see. I'm doing it anyway, out of habit."
        ],
        "lo": "It's just you and me out here. Don't make it awkward. I'll talk, you nod.",
        "hi": "Quiet out here, {player}. I can drop the act for a minute. Just a minute. Okay, minute's up."
      },
      "by_water": {
        "any": [
          "Good reflection in this water. I've checked the line twice. Still perfect.",
          "I could swim across that. Freestyle. I'd win, even with nobody else in the race."
        ],
        "lo": "Don't splash me, champ. This outfit doesn't do pond.",
        "hi": "Look in the water, {player}. See those two? Good looking team. The one on the right especially."
      },
      "by_lava": {
        "any": [
          "Lava's orange and glowing. Almost gold. I don't trust it, on two counts.",
          "That heat could melt a lesser hairline. Mine's holding. I'm still stepping back."
        ],
        "lo": "I'm not going near that lava for somebody I just met. Or for anybody, really.",
        "hi": "Step back from the lava, {player}. I'm serious. I can redraw a line, I can't redraw you."
      },
      "by_flowers": {
        "any": [
          "Flowers. They're alright. They'd look better planted in one straight line, though.",
          "I'm not sniffing these. I'm breathing deep. It's a recovery technique."
        ],
        "lo": "Don't tell anyone you saw me standing in flowers. It's bad for the image.",
        "hi": "Fine, {player}, they're pretty. I'd pick you one with my right hand, so you'd know it counts."
      },
      "by_fire": {
        "any": [
          "Nice fire. I'm keeping the hairline at a safe distance. Art and flames don't mix.",
          "A campfire's a good spot for a victory speech. I've got several ready."
        ],
        "lo": "Sit down and I'll tell you about my greatest wins. It's a long fire, right?",
        "hi": "This is good, {player}. Fire, quiet, you. I haven't bragged in a whole minute. New record."
      },
      "by_crops": {
        "any": [
          "Rows of crops. Straight rows. Whoever planted this has a steady hand, and I respect it.",
          "Farming's hard work with no trophies. I couldn't do it. I mean I could. I just won't."
        ],
        "lo": "Crops, huh. I don't grow my food, champ. I point at the priciest one.",
        "hi": "Look at those neat green lines, {player}. That's my kind of field. Nearly as clean as my work."
      },
      "by_books": {
        "any": [
          "Lots of books. I'd read more, but none of them are about me yet.",
          "I looked for a sports section on these shelves. Somebody should write one. I'll dictate."
        ],
        "lo": "You read all these? Huh. I've got a book too. It's a sketchbook. All hairlines.",
        "hi": "Okay, {player}, which one's good? Something short where the hero wins. I'd actually read it."
      },
      "in_snow": {
        "any": [
          "Snow's just cold white stuff with no edge to it. One clean line would fix that.",
          "It's freezing, so I'm jogging on the spot. Champions stay warm."
        ],
        "lo": "My shoes weren't bought for snow, champ. They were bought to be looked at.",
        "hi": "I was going to throw a snowball at you, {player}. Right hand, perfect aim. Then I remembered I like you."
      },
      "holding_gift": {
        "any": [
          "Hold on. Is that a {item}? Now that's got some sparkle to it. My eyes went straight there.",
          "That {item} you're carrying. Classy. Expensive taste looks good on you."
        ],
        "lo": "Nice {item}. I'm just saying it's nice. I'm not saying anything else. It's really nice, though.",
        "hi": "You're walking around with a {item} in front of me, {player}? That's cold. I'm fine. Totally fine."
      },
      "holding_weapon": {
        "any": [
          "A {item}, huh? Good grip. Which hand, though? Tell me it's the right one.",
          "That {item} looks serious. I respect anybody who shows up ready to compete."
        ],
        "lo": "Easy with the {item}, champ. Swing it near the hairline and we've got a problem.",
        "hi": "With you and that {item} around, I feel safe, {player}. Not that I needed it. But it's nice."
      },
      "holding_food": {
        "any": [
          "Is that a {item}? Athletes eat clean, but I'd make room for the fancy stuff.",
          "You're snacking on a {item} mid-conversation. Bold. I talk, you chew, it works."
        ],
        "lo": "A {item}? Hm. I only eat things that cost a lot. How much was it? Just asking.",
        "hi": "Eat your {item}, {player}. You need the fuel. Somebody's got to keep up with me."
      },
      "holding_rod": {
        "any": [
          "A fishing rod. That's a patience sport. I'm more of a speed guy, but a sport's a sport.",
          "Casting is all in the wrist. Right wrist. I could be great at it, I've just chosen not to yet."
        ],
        "lo": "Fishing? You stand still and wait and that's the whole thing? And people call it a sport.",
        "hi": "If you land a big one, {player}, I'm cheering. Loud. The fish won't like it, but you will."
      },
      "holding_tool": {
        "any": [
          "A {item}. Honest work. Rough on the hands, though, and I only have the one good one.",
          "You swing that {item} all day? That's a workout. Explains the arms. They're okay."
        ],
        "lo": "Careful where you point that {item}. I'm standing here looking expensive.",
        "hi": "You work too hard with that {item}, {player}. Take a breather. Coach's orders."
      },
      "armored": {
        "any": [
          "Full armor. Shiny. You look like a trophy. That's a compliment, I love trophies.",
          "All that armor and a helmet on top. A whole forehead, covered up. Such a waste of canvas."
        ],
        "lo": "Suited up head to toe, huh? Trying to out-dress me. Close, champ. Not there, but close.",
        "hi": "Good. Wear all of it, {player}. I talk big, but I'd rather you came back in one piece."
      },
      "hurt": {
        "any": [
          "Whoa, you're banged up bad. Sit. That's not a suggestion, that's the trainer talking.",
          "You look rough, champ. Even winners go to the bench when they're hurt like that."
        ],
        "lo": "You're hurt pretty bad. I barely know you and it's still bothering me. Weird.",
        "hi": "Hey. Hey, {player}. Who did this? Stop moving around. I'm not joking, you're scaring me."
      },
      "wet": {
        "any": [
          "You're dripping wet. Real hair, soaked like that? See, this is why I draw mine on.",
          "You look like you lost a race with a river. Shake it off over there, not near my shoes."
        ],
        "lo": "Soaked through, huh? Stay back a step, champ. This fabric doesn't like water.",
        "hi": "You're drenched, {player}. Get warm before you catch something. I need my teammate healthy."
      },
      "sneaking": {
        "any": [
          "Why are you crouching? Is this a stealth drill? I'm in. I'm bad at quiet, but I'm in.",
          "You're all hunched down there. Good squat form, actually. Feel the burn."
        ],
        "lo": "You're sneaking up to talk to me? People usually just walk over and stare. This is new.",
        "hi": "I see you down there, {player}. You can't sneak up on me. Okay, you did a little. Good one."
      },
      "long_time": {
        "any": [
          "Look who remembered I exist. It's been days. The hairline's had three new styles since.",
          "Days, champ. Days. I kept score, and you're losing at visiting."
        ],
        "lo": "Oh, it's you. Been a while. I wasn't counting. It was a lot of days, though.",
        "hi": "Where've you been, {player}? Bragging isn't the same without you. Nobody else rolls their eyes right."
      },
      "first_today": {
        "any": [
          "There's my first fan of the day. Good timing, the hairline's barely dry.",
          "Hey, hey! Day's officially started now. I was just warming up until you got here."
        ],
        "lo": "Oh, hello. You get today's first look at greatness. No charge.",
        "hi": "{player}! There you are. I saved my best line for you. The spoken kind and the drawn kind."
      },
      "zoo_busy": {
        "any": [
          "Zoo's packed. Good. Big crowd, big buzz, that's a winning operation.",
          "It's shoulder to shoulder in there. I had to sidestep like a pro to get through. Great footwork."
        ],
        "lo": "Packed house today. Whoever runs this place must be doing something right. Oh. That's you.",
        "hi": "Look at that crowd, {player}. You built that. I'm proud of you, and I don't waste proud."
      },
      "zoo_empty": {
        "any": [
          "Nobody's here. I sprinted down the main path and there was no one to dodge. Sad.",
          "Empty zoo. All this hairline and no audience. The animals are getting a private show."
        ],
        "lo": "No guests at all? Rough day, champ. Even I've had slow days. One. I was sick.",
        "hi": "Empty stands today, {player}. Happens to the best teams. I'm still here, front row."
      },
      "zoo_closed": {
        "any": [
          "Closed? I walked all the way here in my good shoes. The gates should open for me on principle.",
          "Zoo's shut. So that's my day off from being admired. I don't know what to do with my face."
        ],
        "lo": "You closed the zoo with me standing outside it? Brave call, champ.",
        "hi": "Closed day, huh, {player}? Good. Rest up. Even champions take a recovery day."
      },
      "litter_bad": {
        "any": [
          "There's trash all over the paths. I nearly stepped in it. In these shoes. Think about that.",
          "I hurdled three piles of litter on the way in. Great hurdles, but come on."
        ],
        "lo": "Not to be rude, champ, but your paths are a mess. I notice edges. It's what I do.",
        "hi": "{player}, real talk, the litter's bad. I'm saying it because you're my guy and nobody else will."
      },
      "stars_high": {
        "any": [
          "Top rated zoo. I only hang around the best, so that tracks.",
          "All those stars. I knew this place was a winner the second I walked in. I've got an eye."
        ],
        "lo": "Great rating. Don't let it go to your head. One big ego around here is plenty, and it's mine.",
        "hi": "Look at that rating, {player}. Championship numbers. I'm telling everyone I knew you first."
      },
      "stars_low": {
        "any": [
          "The rating's down in the dirt. Every champion has a losing season. This is yours.",
          "One star? I've seen comebacks from worse. I haven't, but I'm sure they exist."
        ],
        "lo": "Honestly, the rating's bad. I'm usually only seen at winning places. I'm making an exception. Barely.",
        "hi": "Low stars don't make you a loser, {player}. It means it's halftime. We go again."
      },
      "coins_low": {
        "any": [
          "Heard the coin chest is nearly empty. That gives me chills, and not the good diamond kind.",
          "Almost out of Zoo Coins? Ouch. Being broke is the one sport I never trained for."
        ],
        "lo": "Low on coins, huh. I'd lend you some, but then I'd have less, and I like having more.",
        "hi": "Money's tight, {player}? You'll bounce back. I've seen you work. I only back winners, and I'm backing you."
      },
      "animal_sick": {
        "any": [
          "One of the animals looks rough. I walked past and it didn't even stare at me. That's not right.",
          "Something's wrong with one of them in there. I don't like it. Nobody should feel that bad."
        ],
        "lo": "One of your animals isn't doing great, champ. I'm no expert. I just looked, and I didn't like it.",
        "hi": "{player}, one of them's not well. I know I joke a lot. I'm not joking. It's bugging me."
      }
    },
    "near": {
      "clian": [
        "Clian's got no hair at all and the cleanest head on the street. That's a canvas, {player}. He keeps saying no.",
        "Me and Clian both love diamonds. Difference is he polishes his. I just stare at mine."
      ],
      "don_l": [
        "Don L. says he's inventing the greatest sport ever. I told him I'm already the best at it. He hasn't finished it yet.",
        "I tried Don L.'s new sport once. Nobody knew the rules, including him. I still won."
      ],
      "dory": [
        "Dory's got all that red hair. Real hair. I'm being very brave about standing this close.",
        "Dory asked if a hairline can get sunburnt. I've been thinking about it all day. Good question, honestly."
      ]
    }
  },
  "sophia": {
    "intro": "My name is Sophia. I keep the history of the Mythical Glades, mostly in my head and partly on paper. I read, I like rain, and I tell the truth. Now you know what you're getting.",
    "scenes": {
      "home_morning": {
        "any": [
          "You're at my door before I've finished my chapter. Come in, but let me reach the end of the page.",
          "Morning. The tea is hot and the house is quiet. I'd planned to keep both that way."
        ],
        "lo": "It's early for a visit from someone I hardly know. You may stay if you can sit without fidgeting.",
        "hi": "I heard your step on the path, {player}. I poured a second cup before you knocked."
      },
      "home_evening": {
        "any": [
          "The lamp is lit and my book is open. This is the part of the day I guard.",
          "Evenings here are for reading and nothing else. You're a small exception."
        ],
        "lo": "It's late to call on someone. Say what you came to say, then I'd like my evening back.",
        "hi": "Sit, {player}. Take the other chair. We don't have to talk. That's what I like about us."
      },
      "walking_to_zoo": {
        "any": [
          "I'm walking to the zoo slowly, on purpose. The path is the quietest part of the trip.",
          "You've stopped me halfway there. It's fine. The calm animals will keep."
        ],
        "lo": "I'm on my way to the zoo. I walk alone, as a rule. That's information, not a hint. Well, partly.",
        "hi": "Walk with me, {player}. You're the only one who doesn't fill the whole road with chatter."
      },
      "at_zoo": {
        "any": [
          "I've been round the exhibits once. I skipped two for volume reasons.",
          "I'm looking at the animals properly. Most people point and move on."
        ],
        "lo": "You run this zoo. It's decent. You asked with your face, so I answered.",
        "hi": "I come here more often than I need to, {player}. You may draw your own conclusions."
      },
      "walking_home": {
        "any": [
          "I'm going home. My ears have had a full day and they'd like to stop.",
          "The walk back is when I sort the day out. Today sorts into mostly good."
        ],
        "lo": "The zoo is behind me and my book is ahead. You're standing between us.",
        "hi": "It was a good day, {player}. I don't inflate things. Good means good."
      },
      "at_work": {
        "any": [
          "I'm writing notes on the Glades. Nobody pays me. It still needs to be done right.",
          "This is my work. I record how the Mythical Glades came to be, so nobody can say it was forgotten."
        ],
        "lo": "I'm in the middle of a sentence. It's about something older than both of us. One moment.",
        "hi": "I'm checking an old account of the Glades, {player}. Listen to this line. Tell me if it sounds true."
      },
      "following": {
        "any": [
          "I came along, so I'm seeing it through. I don't change my mind halfway down a road.",
          "This is further than I usually go. I brought a book in case the adventure has dull parts."
        ],
        "lo": "I agreed to follow you. I haven't agreed to enjoy it yet. We'll see.",
        "hi": "I wouldn't leave my chair for most people, {player}. Lead on. I'm not complaining."
      },
      "following_night": {
        "any": [
          "We're a long way from my reading lamp. I've noticed. I'm only mentioning it once.",
          "It's dark and quiet out here. I like the second part."
        ],
        "lo": "Walking in the dark with someone I barely know. I've made wiser choices. Keep going.",
        "hi": "I'm not afraid, {player}. I'd say if I were. I'm tired, and I'd still rather be here."
      },
      "staying": {
        "any": [
          "I'm waiting where you left me. I'm good at it. I've had practice with slow books.",
          "I haven't moved. I've read the same view about ten times now."
        ],
        "lo": "You told me to stay. I chose to. Those aren't the same, and I'd like that understood.",
        "hi": "I'll wait for you, {player}. Take your time, but do come back. I'd notice if you didn't."
      },
      "rain": {
        "any": [
          "Listen to it on the leaves. It's the only sound I'd never ask to stop.",
          "It's raining and I'm in no hurry to get out of it. My hood is up. I'm content."
        ],
        "lo": "You're frowning at the rain. I don't understand people who do that.",
        "hi": "Stand here a moment, {player}. Rain is better with one quiet person next to you. I've tested it."
      },
      "thunder": {
        "any": [
          "The thunder is loud. I forgive it, because it brings the rain with it.",
          "That one shook the ground. It's the only noise I respect."
        ],
        "lo": "You jumped at that thunderclap. I didn't. I'm not boasting, I'm reporting.",
        "hi": "The oldest Glades stories all begin with a storm like this one, {player}. I can see why."
      },
      "full_moon": {
        "any": [
          "The moon is full. I could nearly read by it. I've tried. It's just short of enough.",
          "A full moon and nobody shouting about it. That's how a thing should be admired."
        ],
        "lo": "Yes, the moon is very bright tonight. You don't need to say it. We can both see.",
        "hi": "The old histories say the Glades woke under a moon like this, {player}. I like to think it's so."
      },
      "dark_moon": {
        "any": [
          "No moon tonight. It's the darkest the sky gets, and the quietest. I don't mind it.",
          "I can't see my own page. That's my only complaint about a night this black."
        ],
        "lo": "It's very dark and you're nearly a stranger. I'm stating facts, not accusing you.",
        "hi": "I can't see you at all, {player}. I know it's you by how little noise you make."
      },
      "dawn": {
        "any": [
          "Sunrise. The birds are about to start, so this is the last quiet minute. I'm using it.",
          "The light is coming up pink at the edges. I'll admit it's well done."
        ],
        "lo": "You're up at dawn. So am I. Let's not make a conversation of it.",
        "hi": "I like dawn better with you in it, {player}. That's a recent change. I've noted it."
      },
      "dusk": {
        "any": [
          "The sun is setting and the page is going dim. I'll have to stop soon. I resent it slightly.",
          "Sunset. The colours are loud but they don't make a sound. That's the right way round."
        ],
        "lo": "The day is ending. If you had something to ask me, now is tidier than later.",
        "hi": "Stay and watch it go down, {player}. I won't talk through it. That's my gift to you."
      },
      "nether": {
        "any": [
          "It's hot, it's red, and something is shrieking. I dislike all three.",
          "Lava on every side and not one flower. I'd like it recorded that I came anyway."
        ],
        "lo": "You brought me to the Nether. I'm reconsidering how well I judge people.",
        "hi": "{player}, I'm only down here because you are. Paper burns. So do I. Stay close to me."
      },
      "the_end": {
        "any": [
          "It's silent here. I should like that. I don't. This is the wrong kind of quiet.",
          "A dark sky with nothing in it, and a drop with no bottom. I'll keep to the middle."
        ],
        "lo": "Those tall things don't like being looked at. Finally, something here I understand.",
        "hi": "I don't think rain has ever fallen here, {player}. You can feel it. I'd rather not stay long."
      },
      "fishing_sky": {
        "any": [
          "Islands floating in the open sky. It's peaceful. I didn't expect to approve.",
          "The pools up here are perfectly still. I could read beside one for a week."
        ],
        "lo": "It's a long way down and you haven't said anything foolish yet. A good start.",
        "hi": "This is the quietest place you've ever taken me, {player}. You're learning what I like."
      },
      "acufend": {
        "any": [
          "A round moon with a jungle on it, and creatures that won't stop playing music. It's a lot.",
          "The music here never pauses. I've been listening for a gap. There isn't one."
        ],
        "lo": "These creatures are noisy, but they're cheerful about it. You I'm still deciding on.",
        "hi": "Don't tell anyone, {player}. One of their tunes was good. I listened to the whole thing."
      },
      "cave": {
        "any": [
          "Stone above, stone below, dripping somewhere. I dislike caves and this one isn't changing my mind.",
          "It's dark, damp and it echoes. Every footstep comes back twice. Once was enough."
        ],
        "lo": "I don't like caves, and I don't know you well. Yet here I am. Explain that to me later.",
        "hi": "I hate it down here, {player}. I'm saying so plainly. I'm staying because you asked."
      },
      "high_up": {
        "any": [
          "You can see for miles from here, and none of the noise reaches us. Ideal.",
          "The wind is the only thing talking up here. I can live with wind."
        ],
        "lo": "It's a long drop. I'd stand back from the edge if I were you. I am, as it happens.",
        "hi": "Everything I usually mind is very small from up here, {player}. I'll remember that."
      },
      "hostile_near": {
        "any": [
          "There's a monster close by and it's groaning. Of course it's a loud one.",
          "Something unfriendly is coming this way. I'd like to be elsewhere, and soon."
        ],
        "lo": "A monster is behind you. I thought you'd rather hear it from me than from it.",
        "hi": "{player}, behind you. I'm not raising my voice, because I never do. But it's close."
      },
      "creeper_near": {
        "any": [
          "That creeper is hissing. It's the one sound I like less than cheering.",
          "A creeper, close. It makes no noise until it makes all of it. I don't trust that."
        ],
        "lo": "There's a creeper near your elbow. I'm stepping back. You may do as you like.",
        "hi": "Creeper, {player}. Come away from it. I have very few people and I'm keeping you."
      },
      "villager_near": {
        "any": [
          "The villagers hum to themselves all day. It's a small noise. I've decided to permit it.",
          "A village. I saw a shelf of books through one of these windows. I think better of them for it."
        ],
        "lo": "The villagers don't know me and don't ask questions. You could learn from them.",
        "hi": "A villager stared at my book just now, {player}. I stared back. We reached an understanding."
      },
      "pet_near": {
        "any": [
          "Your animal is sitting quietly beside you. It has better manners than most guests.",
          "It's looking at me. I'm looking at it. Neither of us feels the need to speak."
        ],
        "lo": "Your pet seems calm. That tells me more about you than you have.",
        "hi": "It's leaning on my leg, {player}. I'm allowing it. Don't make a fuss or it'll stop."
      },
      "farm_animal_near": {
        "any": [
          "The sheep are grazing and saying very little. I could stay by this fence for an hour.",
          "A pig is rooting about in the dirt. It's content. I won't interrupt it."
        ],
        "lo": "If one of those chickens starts up, I'm leaving. I'm telling you now so it isn't rude later.",
        "hi": "That cow has been gazing at me for some time, {player}. I think we're friends. You may be replaced."
      },
      "zoo_animal_near": {
        "any": [
          "I've been watching the {species} for a while. It doesn't perform. I respect that.",
          "The {species} looked at me and went back to its own business. Quite right."
        ],
        "lo": "This {species} looks well kept to me. I'd have told you if it didn't.",
        "hi": "I think the {species} knows me by now, {player}. I come and stand here when the crowd is too much."
      },
      "guests_crowd": {
        "any": [
          "There are too many people round me and all of them are talking. I'm counting breaths.",
          "This crowd has one volume. I'm looking for the edge of it."
        ],
        "lo": "It's crowded and you've added yourself to it. At least you speak at a sensible level.",
        "hi": "Stand next to me, {player}. If I'm seen talking to you, the others leave me alone."
      },
      "residents_crowd": {
        "any": [
          "Half the street is standing here. I know all their voices. Some carry further than they need to.",
          "Neighbours on every side. I like them one at a time. All at once is a great deal."
        ],
        "lo": "You're meeting everyone today, I see. I'm the one who'll tell you the truth. Remember that.",
        "hi": "They're good people, {player}. I'd say so to their faces, quietly, if they'd stop talking."
      },
      "other_resident": {
        "any": [
          "{other} is just there. I've nothing bad to say, and I would if I had.",
          "I can hear {other} from here. Not shouting. I'm noting it in their favour."
        ],
        "lo": "You know {other} as well, then. You'll find I'm the more honest of us. Not the more cheerful.",
        "hi": "{other} asked me about you once, {player}. I said you were worth knowing. I don't exaggerate."
      },
      "other_player": {
        "any": [
          "You've brought {other}. That's two of you. I'd ask that only one speak at a time.",
          "So this is {other}. Hello. I'm Sophia. I'll form an opinion and let you know."
        ],
        "lo": "I'd only just got used to you, and now there's {other} too. Give me a moment.",
        "hi": "{other} seems decent, {player}. You're still the one I'd lend a book to."
      },
      "alone_night": {
        "any": [
          "Nobody else is out. It's as quiet as it ever gets. I could stand here until morning.",
          "Just the night and the two of us. I don't feel any need to fill it."
        ],
        "lo": "We're alone and it's dark. I'm not nervous. I'd say so. I'm simply observing.",
        "hi": "This is my favourite kind of night, {player}. I'd have picked you to share it. I did, really."
      },
      "by_water": {
        "any": [
          "The water is flat and it's saying nothing. I've been watching one ripple for a while.",
          "I like the edge of water. A little mist, a little lapping, and nobody selling anything."
        ],
        "lo": "Please don't throw anything in. I'm enjoying it as it is.",
        "hi": "Sit by the water with me, {player}. I'll read, you look. We'll call it a conversation."
      },
      "by_lava": {
        "any": [
          "Lava. It glows, it hisses and it would burn every book I own. No, thank you.",
          "I can feel the heat on my face from here. I'm far enough back and going further."
        ],
        "lo": "You're standing close to that lava. I don't know you well enough to pull you back. Don't make me.",
        "hi": "{player}, step away from the lava. I'm asking once. You know I mean things the first time."
      },
      "by_flowers": {
        "any": [
          "I know every flower in this patch by name. They've never once interrupted me.",
          "The flowers don't need anything from me. I stand, they bloom. It's a fair arrangement."
        ],
        "lo": "Mind where you put your feet. Those took longer to grow than this conversation will.",
        "hi": "Smell that one, {player}. The small one by your boot. I wanted you to know my favourite."
      },
      "by_fire": {
        "any": [
          "The fire crackles. It's a noise, but an old one. I allow it.",
          "Firelight is good for stories and bad for reading. It moves too much."
        ],
        "lo": "You may sit by the fire. I'd prefer the far side. It's not personal, it's the smoke.",
        "hi": "This is when I'd tell the Glades stories aloud, {player}. I've only ever wanted to with you here."
      },
      "by_crops": {
        "any": [
          "Things grow here in rows and nobody cheers them on. They manage anyway.",
          "Real food, coming up out of the ground. Better than anything fried at a stand."
        ],
        "lo": "Somebody has tended this field with care. Was it you? Then I think slightly more of you.",
        "hi": "I'd trade every sweet in the zoo for what's growing in this field, {player}. You know I mean it."
      },
      "by_books": {
        "any": [
          "Bookshelves. I'm reading the spines. Give me a minute, or an afternoon.",
          "Someone has shelved these out of order. I'm trying very hard not to fix it."
        ],
        "lo": "You have books near you. That's the best thing I know about you so far.",
        "hi": "If you ever wonder where I've gone, {player}, try the nearest shelf. I'd like you to know where to look."
      },
      "in_snow": {
        "any": [
          "Snow makes everything quieter. Even footsteps. It's rain that learned some manners.",
          "It's cold and white and still. My hood is up. I've no complaints."
        ],
        "lo": "Your teeth are chattering. That's the loudest thing out here.",
        "hi": "My hands are cold, {player}. I'm telling you because I'd tell you anything. Not so you'll fuss."
      },
      "holding_gift": {
        "any": [
          "Is that a {item} you're carrying? That's a thing with some sense to it.",
          "I noticed the {item} in your hand. I notice things I like. I'm only saying so."
        ],
        "lo": "A {item}. You have better taste than I'd guessed. I guess low, to be fair.",
        "hi": "You're holding a {item}, {player}, and you know what I think of those. I'm not hinting. I'm just pleased."
      },
      "holding_weapon": {
        "any": [
          "You're carrying a {item}. I hope it's quieter than it looks.",
          "A {item}. I suppose somebody has to. I'd rather it was you than me."
        ],
        "lo": "I don't talk easily to people holding a {item}. Lower it a little. Thank you.",
        "hi": "Be careful with that {item}, {player}. I mean with yourself. The monsters can look after themselves."
      },
      "holding_food": {
        "any": [
          "What's that, a {item}? As long as it isn't mostly sugar, I've no objection.",
          "You're eating a {item} while we talk. Chew quietly and we'll stay friends."
        ],
        "lo": "A {item}. I'll tell you honestly whether I'd eat that, if you ask. You may not want to ask.",
        "hi": "Good, you're eating, {player}. You forget to. I've noticed, and I say what I notice."
      },
      "holding_rod": {
        "any": [
          "A fishing rod. You sit still, say nothing and watch the water. I approve of all of it.",
          "Fishing is the only pastime I'd never call a sport. It's far too quiet. That's praise."
        ],
        "lo": "If you're going to fish, I may stand nearby. Don't take it as friendship. It's the silence.",
        "hi": "When you fish, {player}, I like to sit by with my book. You watch the float. Nobody has to speak."
      },
      "holding_tool": {
        "any": [
          "A {item}. Honest work, though I'd guess it's noisy work.",
          "You've got a {item} in your hand and dirt on your sleeve. At least you finish what you start."
        ],
        "lo": "If that {item} is headed for a cave, don't tell me about it. I'd rather not picture it.",
        "hi": "If that {item} means you're going underground, {player}, come back up soon. I don't like you down there."
      },
      "armored": {
        "any": [
          "You clank when you walk in all that armor. I heard you from the corner.",
          "Full armor. You look ready for something. I hope it's a quiet something."
        ],
        "lo": "All that metal makes you hard to judge. I can't tell what's you and what's plate. I'll wait.",
        "hi": "You're armored head to foot, {player}. Good. I'd rather you were noisy than hurt."
      },
      "hurt": {
        "any": [
          "You're badly hurt. Don't tell me it's nothing. I can see that it's something.",
          "Sit down. You look dreadful, and I'm not saying it to be unkind."
        ],
        "lo": "I hardly know you, and you still shouldn't be walking about in that state.",
        "hi": "{player}. You're hurt. I'm not calm about it, whatever my face is doing. Rest. Please."
      },
      "wet": {
        "any": [
          "You're soaked through. If that's from rain, I envy you. If it's a pond, less so.",
          "You're dripping. Stand a step away from my book and we'll have no trouble."
        ],
        "lo": "You're wet to the knees and making a puddle. I assume you know.",
        "hi": "You're drenched, {player}. On you it looks like bad luck. On me it would look like a good walk."
      },
      "sneaking": {
        "any": [
          "You're crouching. If it's to be quieter, I appreciate the thought. It does look odd.",
          "Why are you down there? You don't need to creep. Just speak softly, like a person."
        ],
        "lo": "People who sneak up on me usually want something. What is it?",
        "hi": "I see you tiptoeing, {player}. You're the only one who tries that hard to be quiet for me."
      },
      "long_time": {
        "any": [
          "It's been several days. I counted them. I had the time, with nobody interrupting.",
          "You've been gone a while. I finished two books. One was better than your absence."
        ],
        "lo": "I'd nearly forgotten your face. Not out of spite. You simply weren't here.",
        "hi": "You were gone for days, {player}. I won't pretend I didn't notice. It was too quiet, and I never say that."
      },
      "first_today": {
        "any": [
          "Hello. Yours is the first conversation I've agreed to today. Keep it a gentle one.",
          "There you are. Good day. That's my greeting, I don't have a longer one."
        ],
        "lo": "Hello again. We've a whole day ahead. Let's begin it quietly and see how we do.",
        "hi": "Good, it's you first, {player}. My days usually start worse than this."
      },
      "zoo_busy": {
        "any": [
          "The zoo is full to the gates today. Good for you. Hard on my ears.",
          "I've never seen so many people in there. I found one bench. I'm not giving it up."
        ],
        "lo": "It's packed today. Clearly you're doing something right. I'd enjoy it more from further off.",
        "hi": "It's loud in there, {player}, and I'm glad for you anyway. You see what I put up with."
      },
      "zoo_empty": {
        "any": [
          "There's nobody in the zoo. I can hear the leaves. I know it's bad for you. It's lovely for me.",
          "Not one guest. I walked the whole path and heard only my own steps."
        ],
        "lo": "The zoo is empty. I'd be dishonest if I said I minded.",
        "hi": "No guests today, {player}. I like the quiet, but I don't like what it costs you. Both are true."
      },
      "zoo_closed": {
        "any": [
          "The gates are shut. I'll find a wall to read on outside. It's nearly as good.",
          "Closed today. The animals get some peace. They've earned it more than the crowds have."
        ],
        "lo": "You've closed the zoo. I assume you have a reason. I won't ask for it.",
        "hi": "A closed day, {player}. Spend some of it resting. You look like you need to, and I don't flatter."
      },
      "litter_bad": {
        "any": [
          "There's litter all along the paths. I stepped over a great deal of it. It's not good enough.",
          "Rubbish by the benches, rubbish by the flower beds. Someone ought to mind."
        ],
        "lo": "Your paths are filthy today. Better you hear it from me than read it on faces.",
        "hi": "The paths are a mess, {player}. You're better than this zoo looks today. That's a compliment, underneath."
      },
      "stars_high": {
        "any": [
          "The zoo is rated very highly. It deserves it. I'd say so if it didn't.",
          "Five stars or near it. For once the crowd and I agree on something."
        ],
        "lo": "A fine rating. I judge a place myself, though. So far, I concur.",
        "hi": "You've earned those stars, {player}. I watched you do it. I'm proud, in my quiet way."
      },
      "stars_low": {
        "any": [
          "The rating is poor. I think it's a little harsh, and I'm rarely the gentle one.",
          "One star. People are loud when they're pleased and louder when they aren't."
        ],
        "lo": "Your zoo is rated badly. I won't soften it. I also won't pile on.",
        "hi": "The stars are low, {player}. They measure the zoo, not you. I know the difference."
      },
      "coins_low": {
        "any": [
          "I hear the Zoo Coins are nearly gone. That's a worry. I'm not going to pretend otherwise.",
          "The zoo is short of coins. Books taught me that lean chapters end. Usually."
        ],
        "lo": "You're almost out of Zoo Coins. I've no advice. I just don't believe in hiding bad news.",
        "hi": "Money's thin, {player}. I can't fix that. I can sit with you while you think. I'm good at that."
      },
      "animal_sick": {
        "any": [
          "One of the animals is unwell. It's gone very still, and not the peaceful kind of still.",
          "Something in there is suffering quietly. Quiet is not always a good sign."
        ],
        "lo": "One of your animals is in a poor way. I'm telling you plainly because it can't.",
        "hi": "{player}, one of them isn't right. You care about them. I've seen it. That's all I'll say."
      }
    },
    "near": {
      "tim": [
        "Tim reviews books for a living. He was wrong about the last one. I told him so. He took notes.",
        "Tim is the only neighbour who whispers near a bookshelf. A zombie with better manners than most."
      ],
      "terra": [
        "Terra knows every plant here by name and never raises her voice. I've no complaints. That's rare.",
        "Terra and I once stood in the rain for an hour and said nothing. It was an excellent talk."
      ],
      "don_l": [
        "Don L. is inventing a sport. Loudly. I've asked him to invent a silent one. He's thinking about it.",
        "Don L. means well, {player}. He means it at a volume I can hear from indoors."
      ]
    }
  },
  "dr_pollo": {
    "intro": "Well, howdy. Folks call me Dr. Pollo. I'm the zoo veterinarian, and I've been mending critters since before your boots were made. Paws, hooves or wings, I'm its doctor.",
    "scenes": {
      "home_morning": {
        "any": [
          "You caught me at the porridge. Bag's by the door, boots are by the step. Rounds start soon.",
          "Morning at my place smells of liniment and toast. You get used to it."
        ],
        "lo": "Early caller. Somebody poorly, or are you just being neighbourly? Either's fine, I only need to know which.",
        "hi": "Pull up a stool, {player}. There's oats enough for two, and I'd like the company before rounds."
      },
      "home_evening": {
        "any": [
          "Day's done. I'm cleaning the instruments one at a time. Can't sleep with a dirty kit.",
          "Evenings I read up with my boots off. Tonight it's a long piece on hoof care. Gripping stuff."
        ],
        "lo": "Evening. If it's about an animal, come right in. If it's a social call, well, come in anyway.",
        "hi": "Sit down, {player}. I was only talking to the stove. You'll answer back better."
      },
      "walking_to_zoo": {
        "any": [
          "On my way in. I can hear the zoo waking up from here, and I listen for anybody sounding wrong.",
          "These boots know the way to the zoo by themselves. I just ride along on top."
        ],
        "lo": "Walking to work. You're welcome to fall in step, but I walk brisk for an old fellow.",
        "hi": "Walk with me a stretch, {player}. I think better about my patients with you alongside."
      },
      "at_zoo": {
        "any": [
          "I'm off the clock and still counting legs. Four on that one, all sound. Can't help myself.",
          "Just strolling. A vet looks at a zoo the way a baker looks at bread."
        ],
        "lo": "I'm having a look round your exhibits. Not judging. Well, judging a little. Kindly.",
        "hi": "Between us, {player}, I like this zoo better than any place I ever worked. It's the care in it."
      },
      "walking_home": {
        "any": [
          "Heading home. My knees say it was a long day, my heart says it was a good one.",
          "Rounds are finished. I counted every nose on the way out, same as every night."
        ],
        "lo": "Off home now. If ever there's trouble after dark, knock loud. I sleep light but I hear poorly.",
        "hi": "Good day's work, {player}. I'll sleep sound knowing you're the one minding them."
      },
      "at_work": {
        "any": [
          "You've caught me mid-rounds. I've a temperature to take and a patient with opinions about it.",
          "Working. I was just listening to a chest. Slow and steady, like a good clock."
        ],
        "lo": "I'm on duty, friend. Talk while I work, I can do both. I've had the practice.",
        "hi": "Hold my bag a second, {player}. There. You're the only one I'd hand it to mid-rounds."
      },
      "following": {
        "any": [
          "An adventure, eh? Good. I've read about half the world and seen a quarter. Time to even that up.",
          "I've brought the small bag. Bandages, salve, a spare pair of socks. Country sense."
        ],
        "lo": "I'll come along and keep my eyes open. I don't know your ways yet, but I know how to walk.",
        "hi": "Lead on, {player}. Somebody ought to be along who can stitch you up. Might as well be a friend."
      },
      "following_night": {
        "any": [
          "Dark as the inside of a cow out here. I've worked in worse with only a lantern.",
          "Night air's good for the lungs. Less good for the knees. I'll manage."
        ],
        "lo": "Out past my bedtime with a near stranger. My old mother would have words. Carry on.",
        "hi": "I don't scare, {player}, you know that. But I'm watching your back out here, same as you watch mine."
      },
      "staying": {
        "any": [
          "Still here, right where you set me. I'm watching a beetle climb a stalk. Marvellous little engine.",
          "Waiting's a vet's trade. Half of medicine is standing still until it's time."
        ],
        "lo": "You said wait, so I'm waiting. I'd do the same for a nervous colt.",
        "hi": "I'll be right here, {player}. Go on. I'll keep the spot warm and worry only a little."
      },
      "rain": {
        "any": [
          "Good soaking rain. The grass wants it, and it settles the dust in the pens.",
          "Rain's drumming on my cap. These rubber boots were made for precisely this."
        ],
        "lo": "Wet day. You'll want dry socks after. That's free advice from a doctor, even an animal one.",
        "hi": "Get in under the eave with me, {player}. I've splinted legs in a downpour, but I'd not wish it on you."
      },
      "thunder": {
        "any": [
          "Hear that thunder? Every animal for miles just flattened its ears. I'm thinking of them.",
          "Storm's right overhead. I've sat up many a night like this with a shaking dog in my lap."
        ],
        "lo": "Thunder doesn't trouble me. It's the lightning starting fires I can't abide.",
        "hi": "Stay near, {player}. I fear nothing much, but I'd rest easier with you out from under that sky."
      },
      "full_moon": {
        "any": [
          "Full moon. You could thread a needle by that light. I have, come to think of it.",
          "Bright as day out. The old-timers said animals go queer on a full moon. I say they just can't sleep."
        ],
        "lo": "Big moon tonight. Makes a long shadow of a short old man.",
        "hi": "Nights like this I think on every creature I ever mended, {player}. It's a long, good list."
      },
      "dark_moon": {
        "any": [
          "No moon at all. That's a lantern night, and I'm glad I trimmed the wick.",
          "Black as a boot out here. I'm going by ear, and my ears are older than my eyes."
        ],
        "lo": "Dark night to be meeting folks. Speak up so I know it's you and not a fence post.",
        "hi": "Can't see my own moustache tonight, {player}. Keep a hand on my shoulder and we'll neither of us trip."
      },
      "dawn": {
        "any": [
          "Sun's coming up. This is when a vet learns the most. Whoever's slow to rise gets a second look.",
          "Sunrise. I've seen more of these than most folks have had hot dinners. Still stop for every one."
        ],
        "lo": "Up with the sun, are you? Good sign. Animals keep that sort of hours.",
        "hi": "First light and a good friend, {player}. An old man could not write himself a better start."
      },
      "dusk": {
        "any": [
          "Sun's going down. The day animals settle and the night ones stretch. Shift change.",
          "Red sky this evening. My grandad swore that meant fair weather. He was right about half the time."
        ],
        "lo": "Evening's drawing in. Mind your step in the half light. I've enough patients as it is.",
        "hi": "Another day we didn't lose a single one, {player}. I count that at every sunset."
      },
      "nether": {
        "any": [
          "Fire in every direction. I'll not lie, I don't care for it. But I've never seen the like, and that counts.",
          "Hot as a blacksmith's apron down here. What on earth do the creatures drink?"
        ],
        "lo": "You've walked an old vet into a furnace. I'll go on, but I'm keeping well back from the flames.",
        "hi": "I hate fire, {player}, and here I stand in a whole land of it. That's what I think of you."
      },
      "the_end": {
        "any": [
          "Not a blade of grass, not a bird. A place this bare feels wrong in my bones.",
          "Those tall fellows have a long stride and sad eyes. I'd dearly like to examine one."
        ],
        "lo": "Strange country. I'm not afraid of it. I just don't know what I'd treat here, or how.",
        "hi": "New to me, all of it, {player}. All my years, and you still show me something I've never seen."
      },
      "fishing_sky": {
        "any": [
          "Islands hanging in the air like wash on a line. I've stopped asking how. I just enjoy it.",
          "Clear pools, clean air. A body could mend from most anything up here."
        ],
        "lo": "Long way down. Heights don't bother me. Falling does, a little, on account of the landing.",
        "hi": "Look at that, {player}. Fish in the sky. I'll be telling this one at the stove for years."
      },
      "acufend": {
        "any": [
          "These creatures sway to music. A critter that keeps time is a critter in good health, I'd wager.",
          "A jungle on a moon, and everything in it humming. I want to listen to every chest here."
        ],
        "lo": "Never seen such animals. I'm walking soft so I don't startle them. I want a proper look.",
        "hi": "I'm an old man and giddy as a boy, {player}. A whole moon of creatures no vet has met."
      },
      "cave": {
        "any": [
          "Cool and damp down here. Good for a fever, bad for the joints.",
          "I can hear bats. Fine little animals, bats. Folks give them a bad name for nothing."
        ],
        "lo": "Watch your footing, friend. I can set a bone down here, but I'd sooner not have to.",
        "hi": "I'd follow you down any hole in the ground, {player}. Just mind your head. I'm fond of it."
      },
      "high_up": {
        "any": [
          "Up here with the birds. Air's thin and clean. My old lungs are having a fine time.",
          "From this height a whole farm would look like a toy one. I had a toy one as a boy."
        ],
        "lo": "Quite a climb. I kept up, you'll notice. Don't let the white hair fool you.",
        "hi": "Catch your breath, {player}. I'll pretend I'm not catching mine. It's a grand view to do it by."
      },
      "hostile_near": {
        "any": [
          "There's something nasty shuffling close. That's no patient of mine. Nothing I can do for it.",
          "Monster about. I've faced down angry bulls, so I'll not run, but I'll not dawdle either."
        ],
        "lo": "Trouble behind you, friend. I'm an old man with a medicine bag. Still, I'll stand with you.",
        "hi": "Stand by me, {player}. I've been kicked by things twice that size and I'm still here."
      },
      "creeper_near": {
        "any": [
          "Creeper, right there. Skittish thing. If it were an animal I'd say it had a nervous condition.",
          "That creeper's swelling up. In my trade, swelling is never good news."
        ],
        "lo": "Step back easy from that creeper, the way you would from a spooked horse.",
        "hi": "{player}, come away from it, slow. I can mend a great deal, but not what that fellow does."
      },
      "villager_near": {
        "any": [
          "Good plain folk, villagers. They don't say much. Neither did my best patients.",
          "I'd like a word with whoever farms here. I do enjoy talking shop with a grower."
        ],
        "lo": "A village is a fair place to judge a stranger. They've not run you off, so you'll do.",
        "hi": "I could have ended up a village doctor, {player}. Then I'd never have met a zoo, or you. Poor trade."
      },
      "pet_near": {
        "any": [
          "Now who's this? Clear eyes, good coat, tail going. That's an animal that's loved.",
          "Let me see those paws. Mm. Nothing wrong there. Just habit, I check everybody."
        ],
        "lo": "You can tell a person by their pet. Yours looks fed and unafraid. That speaks for you.",
        "hi": "This one adores you, {player}. I've seen a lot of animals look at a lot of people. That look is real."
      },
      "farm_animal_near": {
        "any": [
          "Ah, farm stock. This is where I started. I'd know a contented cow by the way she chews.",
          "That hen's scratching about and bossing the others. Picture of health."
        ],
        "lo": "Proper farm animals. I've treated thousands like them. I like them best walking about, not on a plate.",
        "hi": "Hear them, {player}? Takes me straight back to being a young vet with muddy knees and a lot to learn."
      },
      "zoo_animal_near": {
        "any": [
          "I've had my eye on the {species} a good while now. I like what I see today.",
          "See how the {species} is watching us? Alert, curious. I never tire of that."
        ],
        "lo": "That {species} doesn't know you're the one in charge. It only knows how it's treated. So do I.",
        "hi": "The {species} and I have an understanding, {player}. I go gentle, and it forgives me my cold hands."
      },
      "guests_crowd": {
        "any": [
          "A lot of folks about. I watch that nobody's poking fingers where fingers shouldn't go.",
          "Crowds make some animals jumpy. I'm keeping an eye on the ears. Ears tell you first."
        ],
        "lo": "Busy spot. Excuse me if I look past you now and then. I'm watching the exhibits.",
        "hi": "All these people came to see animals that are well and happy, {player}. That's our doing. Yours and mine."
      },
      "residents_crowd": {
        "any": [
          "Half the street's turned out. Good neighbours. I've looked at most of their pets and a few sore backs.",
          "Quite a gathering. Reminds me of market day, without anyone selling me a lame pony."
        ],
        "lo": "You'll meet a lot of characters round here. I'm the one with the bag. Easy to remember.",
        "hi": "Fine folk, all of them, {player}. But when I look round a crowd, yours is the face I look for."
      },
      "other_resident": {
        "any": [
          "There's {other}. Good sort. Asks after the animals, and means it.",
          "I see {other} is about. Walking well, good colour. Sorry. Once a doctor, always looking."
        ],
        "lo": "You've met {other}, have you? You'll do fine here. Folks are kinder than they first seem.",
        "hi": "{other} speaks well of you, {player}. I said I could have told them that a long while back."
      },
      "other_player": {
        "any": [
          "And who's this? {other}, is it? Pleased to know you. Any friend of a good keeper.",
          "Two keepers at once. {other}, I hope you like animal talk, for it's all I have."
        ],
        "lo": "I've barely learned one of you and here's {other} as well. No matter. Plenty of handshake left.",
        "hi": "{other} seems a decent sort, {player}. You pick your company the way you pick your animals. Carefully."
      },
      "alone_night": {
        "any": [
          "Quiet night. Just the two of us and whatever's rustling. Nothing sick-sounding, I've been listening.",
          "Nobody about. This is the hour I used to get called out to barns. I half miss it."
        ],
        "lo": "Just us out here. Don't be shy of an old vet. I've kept quieter company in colder places.",
        "hi": "I'll tell you a thing in the dark, {player}. I was lonely before this zoo. I'm not now."
      },
      "by_water": {
        "any": [
          "Water. I always stop and look. You learn a place's health by what it drinks.",
          "Frogs about, I'll bet. I do like a frog. Honest little patients."
        ],
        "lo": "Nice bit of water. I'm just rinsing my hands. A vet's always rinsing his hands.",
        "hi": "Sit on the bank a minute, {player}. My father taught me to skip stones on water just like this."
      },
      "by_lava": {
        "any": [
          "I'll thank that lava to keep its distance. I've treated burns. I never want to treat another.",
          "The heat off that makes my moustache curl. No, I'll stand over here."
        ],
        "lo": "Come back from the edge, friend. I don't carry near enough salve for that.",
        "hi": "{player}, away from there. Please. There's little in this world I fear, and that's most of the list."
      },
      "by_flowers": {
        "any": [
          "Look at the blossoms. A meadow in flower is a meadow in good health, same as any patient.",
          "Some of these I'd dry for a poultice. Old remedy. The new ones work better, but I keep the old in my head."
        ],
        "lo": "Pretty patch. Tread light, there's small lives in among those stems.",
        "hi": "I had an old mare who ate flowers by the mouthful, {player}. I can't pass a patch without thinking of her."
      },
      "by_fire": {
        "any": [
          "I'll sit, but upwind and well back. Fire and I are not on friendly terms.",
          "It's a tidy little fire, I grant you. I'm still watching every spark."
        ],
        "lo": "You'll forgive me keeping my distance from the flames. Old reasons.",
        "hi": "I pulled animals out of a barn fire once, {player}. Got most of them. I still count the ones I didn't."
      },
      "by_crops": {
        "any": [
          "Good green rows. Whoever works this ground knows their business.",
          "Now this is my kind of dinner. Straight out of the dirt, nobody harmed in the making."
        ],
        "lo": "Fine crop. I grew up between rows like these, chasing the neighbour's goats out of them.",
        "hi": "When I hang up the bag, {player}, I want a patch like this. And you over the fence to talk to."
      },
      "by_books": {
        "any": [
          "Books! Any on medicine? There's always some new method I've not read.",
          "I learned half my trade from pages like these and the other half from getting bitten."
        ],
        "lo": "A person with bookshelves is a person who asks questions. I like that in a keeper.",
        "hi": "I keep meaning to write my own, {player}. A lifetime of cases. You'd be in the last chapter."
      },
      "in_snow": {
        "any": [
          "Snow's up near my boot tops. Good thing they're rubber. Wouldn't trade them for a king's.",
          "Cold snap. I think of everything with thin fur on a day like this."
        ],
        "lo": "You're shivering, friend. Stamp your feet. Works for horses, works for people.",
        "hi": "Tuck your collar up, {player}. I'll fuss over you same as I would a newborn lamb. No use arguing."
      },
      "holding_gift": {
        "any": [
          "Is that a {item}? Now there's a handsome piece of work. I do admire a good one.",
          "That {item} you've got. Well made, by the look. My hands itch just seeing it."
        ],
        "lo": "Fine {item} you're carrying. I'm only admiring. An old vet can look, can't he?",
        "hi": "{player}, you walk up with a {item} and expect me to keep my mind on medicine? Ha!"
      },
      "holding_weapon": {
        "any": [
          "That's a {item}. I trust it's for the monsters and never for anything with a mother.",
          "A {item}, eh? I'm in the mending business myself. But I know some things need stopping."
        ],
        "lo": "I'll be plain, friend. I judge a {item} by what it's pointed at.",
        "hi": "I know your heart, {player}, so that {item} doesn't worry me. It's for the things that bite first."
      },
      "holding_food": {
        "any": [
          "A {item}, is it? Don't mind me, I'm only wondering what went into it.",
          "Eat up. That {item} won't do you any good sitting in your hand."
        ],
        "lo": "I'm a plants-only man myself. But I'm no preacher. Enjoy your {item}.",
        "hi": "If that {item} is for sharing, {player}, I'll say no thank you and mean thank you. Sit and eat it by me."
      },
      "holding_rod": {
        "any": [
          "Fishing rod. I'll be honest, I root for the fish. Always have.",
          "Going after fish? I'd rather watch them swim. But I'll not spoil a quiet afternoon."
        ],
        "lo": "A rod. Well. I keep my opinions on hooks to myself around new acquaintances.",
        "hi": "You know where I stand on hooks, {player}. You also know I'll stand next to you regardless. Stubborn old man."
      },
      "holding_tool": {
        "any": [
          "A {item}! Let me see the edge on that. Mm. Somebody's kept it properly.",
          "A good {item} in a working hand. That's the best sight I know, after a foal standing up."
        ],
        "lo": "You look after that {item}? Clean, dry, put away at night? Then I think the better of you.",
        "hi": "One day I'd like a go with that {item}, {player}. I'm crafty with most anything that has a handle."
      },
      "armored": {
        "any": [
          "Plated up like a tortoise. Sensible. Wish I could get some of my patients to dress the same.",
          "All that armor. Good. Saves me learning how to doctor people."
        ],
        "lo": "Well protected, I see. A careful keeper. Animals do better under careful folk.",
        "hi": "Glad to see you buckled into all that, {player}. I'm too fond of you to practise my stitching."
      },
      "hurt": {
        "any": [
          "Hold on now. You're hurt, and badly. Stand still and let an old doctor look.",
          "That's a nasty lot of damage. You're favouring that side. Don't tell me you're fine."
        ],
        "lo": "I don't doctor people as a rule, friend, but I'm not walking past that. Sit down.",
        "hi": "{player}! Who let you get in such a state? Easy now. Easy. I've got you."
      },
      "wet": {
        "any": [
          "You're wet as a duck's belly. A chill starts just that way.",
          "Soaked to the hide. I'd towel a dog off for less than that."
        ],
        "lo": "You're dripping, friend. Not my business, but a dry shirt is good medicine.",
        "hi": "Look at you, {player}, drenched. Come stand by me and drip. These boots don't mind a puddle."
      },
      "sneaking": {
        "any": [
          "Good, low and slow. That's exactly how I come up on a nervous animal.",
          "What are we creeping up on? I'll crouch too, if my knees will let me back up."
        ],
        "lo": "No need to stalk an old vet, friend. I don't bolt.",
        "hi": "You've learned to walk soft, {player}. I've shown folk that for years and you're the first it's stuck to."
      },
      "long_time": {
        "any": [
          "Well, look who's turned up. Been days. I was about to go looking in the hay loft for you.",
          "Days it's been. I've done a good many rounds since we last spoke. All's well, mostly."
        ],
        "lo": "Haven't seen you in some days. The animals noticed too. They don't say, but I can tell.",
        "hi": "{player}! I'd started to fret. An old man gets used to a friend's knock and misses it when it stops."
      },
      "first_today": {
        "any": [
          "Good day to you. First thing I ask everyone: how's your appetite? Fine? Then it'll be a fine day.",
          "Hello, hello. I've already been round the pens and all's quiet. Now my day can start proper."
        ],
        "lo": "Good day, friend. Dr. Pollo, in case the name's slipped. It does, at first.",
        "hi": "There's my favourite two-legged patient. Hello, {player}. Let me look at you. Good. You'll do."
      },
      "zoo_busy": {
        "any": [
          "Zoo's heaving today. I'm doing extra rounds. Noise and bustle wear on the shy ones.",
          "So many visitors. Good for the place, and I'm glad. I just watch who's leaning over rails."
        ],
        "lo": "Full house. You must be pleased. I'll be pleased at closing, when I've counted everyone well.",
        "hi": "Look at them all, come to see what you've built, {player}. I'm proud as a hen with one chick."
      },
      "zoo_empty": {
        "any": [
          "Not a visitor in sight. The animals don't mind a bit. Some of them are napping in plain view.",
          "Quiet as a church in there. Good day to look over the patients without an audience."
        ],
        "lo": "No guests today? It happens. The animals still need the same care, crowd or no crowd.",
        "hi": "Don't take an empty day to heart, {player}. The ones in the pens think you hung the moon."
      },
      "zoo_closed": {
        "any": [
          "Gates are shut. Suits me. I can do my rounds without anyone asking if it bites.",
          "Closed day. The whole zoo lets its breath out. You can hear it if you listen."
        ],
        "lo": "Closed, I see. A sensible keeper knows when to rest a place.",
        "hi": "A shut gate is a kindness now and then, {player}. To them and to you. I'd prescribe it more often."
      },
      "litter_bad": {
        "any": [
          "There's rubbish all over the paths. That worries me. Animals swallow what they shouldn't.",
          "I've stepped over more wrappers than I can count. That's a bellyache waiting for some poor creature."
        ],
        "lo": "I'll say it straight, friend. All this litter is no good near animals.",
        "hi": "{player}, the paths are in a state. I know you've your hands full. I only say it for the critters' sake."
      },
      "stars_high": {
        "any": [
          "Top marks for the zoo, I hear. I'm not surprised. Healthy animals show, and folks feel it.",
          "Four, five stars. Stars are fine. A row of bright eyes at feeding time is finer."
        ],
        "lo": "Well rated, your zoo. I'd give it my own stars, and mine are harder to get.",
        "hi": "They've given you the stars at last, {player}. I'd have done it a long while back, with a handshake on top."
      },
      "stars_low": {
        "any": [
          "The rating's low. Don't mistake that for the worth of the place. I've seen sick herds come right.",
          "One star, they say. I've had worse reports on a patient that was up and running in a week."
        ],
        "lo": "Poor rating. I don't judge by stars, friend. I judge by coats, eyes and feet.",
        "hi": "Chin up, {player}. A low mark is a fever, not a funeral. Fevers break."
      },
      "coins_low": {
        "any": [
          "I hear the coin box is near empty. I've worked lean years. You make do and you don't cut the care.",
          "Short of Zoo Coins, are we? I've been paid in turnips before now. I got by."
        ],
        "lo": "Money's tight, I gather. It's no shame. Every farm I ever knew had a thin season.",
        "hi": "Don't you lose sleep over coins, {player}. I'd doctor this zoo for a bowl of soup and your company."
      },
      "animal_sick": {
        "any": [
          "I've one that's poorly today. It's on my mind every minute until it's right.",
          "Something's off with one of ours. Dull eye, hanging head. I don't like it one bit."
        ],
        "lo": "There's an animal ailing in your zoo, friend. I'd be no kind of vet if I didn't say so to your face.",
        "hi": "One of them's suffering, {player}. I know it weighs on you same as me. We'll sit up with it, you and I."
      }
    },
    "near": {
      "stevie": [
        "Stevie gets as worked up over a beetle as a lion. That's the right spirit. Wears me out, but it's right.",
        "I never have to ask Stevie twice how an animal's doing. I rarely have to ask once."
      ],
      "ron": [
        "Ron knows every bird by its call. I know them by their cough. Between us we've the whole bird.",
        "Ron and I can talk hooves till the lamp runs dry. Poor {player}, don't get stuck between us."
      ],
      "carrot": [
        "Carrot brings me every bunny with so much as a sniffle. Bouncing the whole way. The rabbit never minds.",
        "A grown person in a bunny suit, and the best hands with small animals I've seen. I stopped wondering, {player}."
      ]
    }
  },
  "clian": {
    "intro": "Good day. My name is Clian. I am the zoo's sanitation specialist, which means I fight germs, not litter. I am also the cleanest person you will meet today. Smile, it's healthy.",
    "scenes": {
      "home_morning": {
        "any": [
          "Morning. I'm on my second rinse of the day. The first one is only practice.",
          "You're in my house before the floor has dried. Step on the mat, please. The white one. They're all white."
        ],
        "lo": "An early guest. Shoes off, hands where I can see them, and we'll get along.",
        "hi": "Come in, {player}. I put out the guest slippers. I only own one guest pair. They're yours."
      },
      "home_evening": {
        "any": [
          "Evening routine. Gloves soaking, bottles lined up by height, floor drying. Bliss.",
          "I'm folding towels into thirds. It's how I relax. Halves are for people in a hurry."
        ],
        "lo": "It's late for a visit. I've already wiped the door handle for the night. Use your elbow.",
        "hi": "Sit, {player}. Yes, on the good chair. I'll wipe it after, but I'll wipe it fondly."
      },
      "walking_to_zoo": {
        "any": [
          "Walking to work. I stay in the middle of the path. The edges are where the mud lives.",
          "On my way in. Fresh gloves in the left pocket, spare gloves in the right."
        ],
        "lo": "I'm headed to the zoo. Walk beside me if you like, at about an arm's length.",
        "hi": "Walk with me, {player}. You may stand closer than an arm's length. I've done the maths. You're safe."
      },
      "at_zoo": {
        "any": [
          "I'm off duty and looking at animals. I've only checked two railings. That's restraint.",
          "A stroll round the exhibits. I'm enjoying it. I'm also counting smudges on the glass. Four."
        ],
        "lo": "Your zoo is tidier than most. I've seen most. That's a real compliment, not a polite one.",
        "hi": "I come here on my days off, {player}. I tell people it's for the dogs. It's partly the company."
      },
      "walking_home": {
        "any": [
          "Going home. The day's germs are dealt with. Tomorrow's haven't been born yet.",
          "Heading back. I walk home slowly. It lets the disinfectant on my boots dry."
        ],
        "lo": "I'm on my way home to wash. If we must talk, let's make it efficient.",
        "hi": "Good day today, {player}. Clean work, kind people. You were one of the kind people."
      },
      "at_work": {
        "any": [
          "Working. This handrail meets hundreds of hands a day. I've met all of their germs.",
          "You've caught me mid-spray. Give it a count of ten. Good things take contact time."
        ],
        "lo": "I'm sanitising. No, I don't pick up the litter. Different job, different person, same zoo.",
        "hi": "Stand there, {player}, that tile's already done. You're the only one I let watch me work."
      },
      "following": {
        "any": [
          "An outing. I've packed two bottles and a cloth. If the wild has a surface, I'm ready.",
          "I'm following. You pick the direction, I'll pick where we step."
        ],
        "lo": "I agreed to come along. I didn't agree to wade through anything. Let's keep that in mind.",
        "hi": "I'd get mud on my trousers for very few people, {player}. You're on the list. It's a short list."
      },
      "following_night": {
        "any": [
          "Out at night. I can't see the dirt, which is somehow worse. I know it's there.",
          "It's dark. I'm calm. I'm also holding my spray bottle like a lantern."
        ],
        "lo": "A night walk with someone I've only just met. Illogical. I'm doing it anyway. Interesting.",
        "hi": "I'm not worried, {player}. You're here and my gloves are on. That covers most dangers."
      },
      "staying": {
        "any": [
          "I'm waiting. I've tidied this patch of ground as best I can. It's ground. I did what I could.",
          "Still here. Standing still is tidy. Nothing gets tracked anywhere."
        ],
        "lo": "You asked me to stay, so I'm staying. I assume there's a reason. I like reasons.",
        "hi": "I'll be here when you're back, {player}. Same spot, to the inch. You know me."
      },
      "rain": {
        "any": [
          "It's raining. Good for the paths, bad for the puddles. A puddle is just mud that hasn't decided yet.",
          "Rain. Free water, no scrubbing. I only object to what it does to the grass verge."
        ],
        "lo": "You're tracking wet footprints. I'm not upset. I'm noticing. There's a difference.",
        "hi": "Share the dry spot, {player}. There's room. I measured, and I'd have made room regardless."
      },
      "thunder": {
        "any": [
          "Thunder. Loud, but it leaves no residue. I've no quarrel with it.",
          "A storm overhead. I'm thinking of the dogs. They'll want a calm voice tonight."
        ],
        "lo": "Lightning is very hot. Hot enough to sterilise, in theory. I wouldn't recommend the method.",
        "hi": "Stay by me till it passes, {player}. Logically we're no safer together. I'd still prefer it."
      },
      "full_moon": {
        "any": [
          "Full moon. Round, white and bright. Finally, something in the sky kept properly.",
          "It's bright enough tonight to spot a smear at twenty paces. I've spotted three."
        ],
        "lo": "A clear, bright night. You look less dusty by moonlight. Most people do.",
        "hi": "Look at that moon, {player}. Gleaming. I don't envy much. I envy that a little."
      },
      "dark_moon": {
        "any": [
          "No moon. I can't inspect a thing in this. I'll have to trust that it's clean. I don't.",
          "Very dark tonight. Germs don't mind the dark. Nor do I, with my bottle."
        ],
        "lo": "I can barely see you. Please don't hand me anything. I like to see what I'm taking.",
        "hi": "It's black as a coal cellar, {player}. Keep talking. Your voice is the cleanest thing out here."
      },
      "dawn": {
        "any": [
          "Sunrise. The dew does a first pass on everything. I come along and do the proper one.",
          "Dawn. Nothing's been touched yet. It's the cleanest minute of the day and I never miss it."
        ],
        "lo": "You're up early. So are the germs. Only one of you bothers me.",
        "hi": "I like sharing the first clean hour with you, {player}. I didn't think I'd ever share it."
      },
      "dusk": {
        "any": [
          "Sunset. Every handprint of the day shows up in this low light. Useful.",
          "The sun's going down. I do my last wipe now, while I can still see my work."
        ],
        "lo": "End of the day. You've a little dust on your shoulder. Left one. There.",
        "hi": "Done for the day, {player}. I'm tired in a tidy way. That's the good kind."
      },
      "nether": {
        "any": [
          "Everything down here is hot enough to be sterile. I ought to love it. It's the ash I can't forgive.",
          "Netherrack. It crumbles, it smoulders and it gets on my whites. Who planned this place?"
        ],
        "lo": "You've brought a man dressed in white to a land of soot. We don't know each other well enough for that.",
        "hi": "My sleeves are grey, {player}. Grey. I wouldn't let that happen for anybody else."
      },
      "the_end": {
        "any": [
          "No mud, no rain, no litter. Just pale stone and a very long drop. It's almost tidy.",
          "The tall dark ones keep carrying blocks about. Someone should give them a system."
        ],
        "lo": "I don't know this place and I don't know you well. I do know where my feet are. That's enough.",
        "hi": "It's oddly clean here, {player}, and I still don't like it. Clean should feel friendly. This doesn't."
      },
      "fishing_sky": {
        "any": [
          "Islands in the sky. The air up here has hardly been breathed. Wonderful.",
          "The pools are so clear I feel I could see a germ in them. I can't, of course. Nobody can."
        ],
        "lo": "A long fall, but a clean one. I'm joking. I do joke. That was one.",
        "hi": "Fresh air, clear water and you, {player}. If it had a dog, I'd never leave."
      },
      "acufend": {
        "any": [
          "A jungle. Damp, leafy and sticky. And yet the creatures seem so happy, I can't hold it against them.",
          "They play music all day here. I've been wiping in time to it. Quite efficient."
        ],
        "lo": "One of the creatures held something out to me on a leaf. I smiled and kept my gloves on.",
        "hi": "I've been humming their tune, {player}. Quietly. Don't tell anyone, I've a calm reputation to keep."
      },
      "cave": {
        "any": [
          "Underground. Dust, drips and bat business. I'm breathing through my sleeve.",
          "Diamonds come from places like this. It's the only reason I'm not complaining. Much."
        ],
        "lo": "A cave is just the earth's unswept cellar. I'll follow, but I won't touch the walls.",
        "hi": "If something sparkles down here, {player}, I'll forgive this cave everything. Almost everything."
      },
      "high_up": {
        "any": [
          "High up. The wind keeps everything swept. I approve of wind.",
          "From here you can't see a speck of dirt on the whole world. It's a lie, but a pleasant one."
        ],
        "lo": "Quite a height. I'm not gripping anything. I don't know who's gripped it before me.",
        "hi": "It's quiet and clean up here, {player}. I'd bring a chair. Two chairs."
      },
      "hostile_near": {
        "any": [
          "There's a monster nearby. Look at the state of it. When did that last see soap?",
          "Something's groaning over there. I've no idea what it's carrying and I don't want to find out."
        ],
        "lo": "Hostile creature, close. I only have disinfectant. It works on germs, not on teeth.",
        "hi": "Stay beside me, {player}. If it comes to it, I'll spray it in the eyes. Calmly."
      },
      "creeper_near": {
        "any": [
          "A creeper. If that goes off, the mess will be everywhere. I'm moving for hygiene reasons.",
          "That creeper is hissing like a leaky bottle. I know that sound. Nothing good follows it."
        ],
        "lo": "Creeper, there. I'd step away. I'm stepping away. See how evenly I'm stepping away.",
        "hi": "Creeper behind you, {player}. I'm not nonchalant about this one. Come here. Quickly."
      },
      "villager_near": {
        "any": [
          "Villagers. Polite people. They keep their hands folded in their sleeves. Very hygienic.",
          "A village. Dirt paths and loose animals. I'm smiling. I'm working at it."
        ],
        "lo": "The villagers and I nodded at each other. No handshakes. It's the ideal greeting.",
        "hi": "One of them works a field all day and never wipes his boots, {player}. I'm being very kind about it."
      },
      "pet_near": {
        "any": [
          "Is that your animal? Clean ears, bright eyes. Somebody is looked after.",
          "Your pet is sitting neatly. Good posture. I'm impressed, and I'm hard to impress."
        ],
        "lo": "May I greet your pet? I'll take a glove off for it. I don't do that for people.",
        "hi": "It's licked my hand, {player}. Normally I'd wash at once. I'm going to wait a minute."
      },
      "farm_animal_near": {
        "any": [
          "Farm animals, with dirt up to the knee. They look pleased. I can't relate, but I'm glad for them.",
          "That pig looks like it has plans for the nearest mud. I'm going to look at the sheep instead."
        ],
        "lo": "Farm animals. I'll admire them from over here. A little distance keeps everyone friends.",
        "hi": "That chicken is walking straight at my boots, {player}. Stand in front of me. As a friend."
      },
      "zoo_animal_near": {
        "any": [
          "The {species} looks well to me. A clean home shows in an animal. I like to think so, anyway.",
          "I was working by the {species} earlier. It watched the whole time. A good audience."
        ],
        "lo": "Your {species} is looking at my gloves. Everyone does. They're very white.",
        "hi": "The {species} and I have a routine, {player}. I spray, it stares, we both feel better."
      },
      "guests_crowd": {
        "any": [
          "So many guests. So many hands on so many rails. I'm calm. My bottle is full.",
          "A crowd. Somebody just sneezed. I know exactly where. I'll be going over there shortly."
        ],
        "lo": "Busy here. I'm keeping one clean arm's length around me. You're at the edge of it.",
        "hi": "Every one of these people touches something, {player}. And I still like seeing them happy. Strange, isn't it."
      },
      "residents_crowd": {
        "any": [
          "All the neighbours at once. I know which of them wipe their feet. I won't name names.",
          "Quite a gathering. I'm nodding at everyone. It saves on handshakes."
        ],
        "lo": "You're meeting the whole street. I'm the one in white. I'm easy to find and I stay that way.",
        "hi": "Good people, {player}. Untidy, some of them. I'd disinfect a doorknob for every one."
      },
      "other_resident": {
        "any": [
          "That's {other}. A good neighbour. Could wipe their boots more. Most could.",
          "{other} smiled at me this morning. I smiled back. A clean exchange."
        ],
        "lo": "You know {other} as well? Good. They can tell you I'm less strict than I look.",
        "hi": "{other} is fine company, {player}. You're finer. I've weighed it up carefully."
      },
      "other_player": {
        "any": [
          "A second visitor. Hello, {other}. I'm Clian. I nod, I don't shake. Nothing personal.",
          "{other}, welcome. Your boots are in a reasonable state. That's a strong start with me."
        ],
        "lo": "Two of you now, and {other} I don't know at all. Twice the footprints. I'll manage.",
        "hi": "{other} seems pleasant, {player}. But you're the one I'd lend my good cloth to."
      },
      "alone_night": {
        "any": [
          "Nobody about. No hands on anything. The whole place is as clean as it will ever be.",
          "A quiet night, the two of us. I can hear my bottle slosh. Peaceful."
        ],
        "lo": "Just you and me. I don't mind. You haven't touched anything you shouldn't. I've been watching.",
        "hi": "I'll tell you something, {player}. I clean because I care about people. I rarely get to say it."
      },
      "by_water": {
        "any": [
          "Water. It looks clean. Looking clean and being clean are different things, but it's a pleasant start.",
          "I'm checking my reflection. Not a spot on me. Good."
        ],
        "lo": "Please don't splash. I say it with a smile. See? But don't.",
        "hi": "You could push me in, {player}, and I'd forgive you by the third wash. Don't test it."
      },
      "by_lava": {
        "any": [
          "Lava. Nothing survives in it, germs included. I admire the thoroughness, not the method.",
          "I'm keeping well back. White scorches. It's very hard to get scorch out."
        ],
        "lo": "That's lava. Logic says stand over here. I always do what logic says.",
        "hi": "Come away from the edge, {player}. I'm asking calmly. Inside, I'm not calm at all."
      },
      "by_flowers": {
        "any": [
          "Flowers. They smell clean, which is clever, as they live in dirt.",
          "Pollen. It's dust that thinks it's special. Still, they are pretty."
        ],
        "lo": "Lovely blooms. I won't pick one. I don't know where the bees have been.",
        "hi": "I'd keep one in a jar on my shelf, {player}. A rinsed jar. Labelled with the day you showed me."
      },
      "by_fire": {
        "any": [
          "A fire. Heat kills germs. Smoke ruins whites. I'm of two minds, both standing upwind.",
          "I boil my cloths over a fire like this. Very satisfying. Like soup, but useful."
        ],
        "lo": "Sit if you like. I'll stand. Soot settles on the seated.",
        "hi": "This is nice, {player}. I'll smell of smoke tomorrow and I've already decided it was worth it."
      },
      "by_crops": {
        "any": [
          "Farmland. That's wet dirt with ambitions. I'll keep to the edge.",
          "Somebody dug all this up on purpose and knelt in it. I'm grateful for the bread. I can't watch."
        ],
        "lo": "You farm? I won't hold it against you. I'll just look at your boots a little more often.",
        "hi": "I'd walk through a ploughed field for you, {player}. Once. In old boots. But I would."
      },
      "by_books": {
        "any": [
          "Bookshelves. Tidy rows, straight spines. And nobody ever dusts the tops.",
          "I like a book. I like it better wiped. People lick their fingers to turn pages, you know."
        ],
        "lo": "Are these in order? By size, by colour, by anything? No? I'll breathe through it.",
        "hi": "If you ever lent me a book, {player}, it would come back cleaner than it left. You know it would."
      },
      "in_snow": {
        "any": [
          "Snow. Everything white, as far as you can see. For once the world dressed like me.",
          "Fresh snow is spotless. Then someone walks on it. I've decided not to look down."
        ],
        "lo": "You've left a line of footprints in the snow. I'm not blaming you. I'm simply aware.",
        "hi": "We match the weather, {player}. Well, I do. Stand next to me, I'll share the effect."
      },
      "holding_gift": {
        "any": [
          "Is that a {item}? My word. That's a very good thing to be holding.",
          "A {item}. I noticed. I notice anything that fine."
        ],
        "lo": "Nice {item}. I'm only observing. I'd handle one of those with fresh gloves.",
        "hi": "You know how I feel about a {item}, {player}. I've already thought of the shelf for one. Just a thought."
      },
      "holding_weapon": {
        "any": [
          "A {item}. I hope you clean it after use. Most people don't. It shows.",
          "That {item} has seen some work. I can tell by the edge, and by what's on it."
        ],
        "lo": "Please point the {item} elsewhere. I'm not alarmed. I'd just rather it wasn't near my whites.",
        "hi": "Keep that {item} close, {player}. I'll handle the small enemies. You can have the big ones."
      },
      "holding_food": {
        "any": [
          "A {item}. Did you wash your hands before picking that up? I'm only asking. I always ask.",
          "You're holding a {item} in the open air. Brave. I eat at a table, with a cloth under it."
        ],
        "lo": "Enjoy your {item}. Mind the crumbs. Crumbs are an invitation, and not to anyone you want.",
        "hi": "Eat your {item}, {player}. I wiped that spot beside you earlier, so you may sit. I planned ahead."
      },
      "holding_rod": {
        "any": [
          "A fishing rod. Fish are clean. It's everything else about fishing that worries me.",
          "Fishing. You stand by the water, calmly, for hours. I understand the appeal. Then there's the slime."
        ],
        "lo": "If you catch something, please don't show me up close. A wave from over there is plenty.",
        "hi": "When you come back from fishing, {player}, I can always tell. I like you anyway. That's affection."
      },
      "holding_tool": {
        "any": [
          "A {item}. Useful. Muddy at the working end, I see.",
          "That {item} has earth on it. Honest earth, but earth."
        ],
        "lo": "A {item}. You work, then. Good. I've no patience for people who don't.",
        "hi": "Never idle, {player}, always a {item} in hand. It's what I like most about you. Second is the clean boots."
      },
      "armored": {
        "any": [
          "Full armor. All those joints and rivets. Do you know what gathers in a rivet?",
          "You're shining. Polished plate is a pleasure to look at. Whoever buffed that, well done."
        ],
        "lo": "Armor from head to toe. Sensible. Difficult to wash, but sensible.",
        "hi": "I'm glad you wear it, {player}. Better a scratch on the plate than on you. Scratches get infected."
      },
      "hurt": {
        "any": [
          "You're hurt. That needs cleaning before anything else. I'm not being fussy, I'm being correct.",
          "Those are open wounds. Do you know what gets into an open wound? I do. Sit down."
        ],
        "lo": "We've hardly met, but I'm not letting you walk around like that. Hold still.",
        "hi": "{player}. Stop. Let me look. I've cleaned a thousand things today and none of them mattered like this."
      },
      "wet": {
        "any": [
          "You're soaked. Water alone isn't washing, you know. But it's a start.",
          "You're dripping on the path. It'll dry. I'm telling myself it'll dry."
        ],
        "lo": "Wet through, I see. Was it clean water? You don't have to answer. I'd like you to.",
        "hi": "Drenched, {player}. I'd offer my cloth, but it's for surfaces. You're not a surface. You're a friend."
      },
      "sneaking": {
        "any": [
          "You're crouching. Closer to the ground. That's where the dirt is. Curious choice.",
          "Why so low? If you've dropped something, I hope you'll wipe it."
        ],
        "lo": "Sneaking up on a sanitation specialist. I saw you. I see everything. It's the job.",
        "hi": "I know that's you down there, {player}. Mind your knees. I mean the trousers. And the knees."
      },
      "long_time": {
        "any": [
          "It's been some days. I noticed. Your end of the bench stayed clean, which is not the same as nice.",
          "You've been away. I've gone through three bottles since we spoke. That's how I count time."
        ],
        "lo": "Oh. You. It's been a while. I'd started to file you under former acquaintances.",
        "hi": "Days, {player}. I kept things tidy for when you came back. I'd rather have had the mess and you."
      },
      "first_today": {
        "any": [
          "Hello. First conversation of the day. I'm fresh, the gloves are fresh. Go ahead.",
          "Good day to you. You look well. Clean collar. I always check the collar."
        ],
        "lo": "Hello again. A nod for you. Same as yesterday's, but freshly made.",
        "hi": "{player}. Good. Now the day's in order. You're the first thing I tick off."
      },
      "zoo_busy": {
        "any": [
          "The zoo is full. Every rail is in use. I'm going round twice today. Possibly three times.",
          "Packed. Wonderful for the zoo. Statistically alarming for the door handles."
        ],
        "lo": "A very busy day. You've done well. I'll congratulate you properly when it's quieter and wiped.",
        "hi": "Look at all of them, {player}. Happy and healthy. That second part is me. The first part is you."
      },
      "zoo_empty": {
        "any": [
          "No guests. Nothing has been touched all day. I ought to be delighted. It's a little sad, in fact.",
          "Empty paths. I've sanitised everything and there's nobody to keep it safe for."
        ],
        "lo": "Not a visitor in sight. It's very clean. I don't think that's the result you wanted.",
        "hi": "It's quiet today, {player}. They'll be back. A place this cared for doesn't stay empty."
      },
      "zoo_closed": {
        "any": [
          "Closed. This is when I do the deep work. Corners. Hinges. Under things.",
          "The gates are shut and the rails are mine. I've been looking forward to this."
        ],
        "lo": "Closed today. A sound decision. Everything needs a rest, surfaces included.",
        "hi": "A closed day, {player}. Rest. I'll be in there with a brush, having the time of my life."
      },
      "litter_bad": {
        "any": [
          "Litter on every path. It isn't my job to lift it. It's still my problem. Germs love a wrapper.",
          "I'm stepping round rubbish to reach the rails I'm meant to clean. It's like mopping in the rain."
        ],
        "lo": "I'll be plain. The paths are in a bad way. I do germs, not litter, and today the litter is winning.",
        "hi": "{player}, I say this gently. The litter's got out of hand. It hurts to look at, and I'm on your side."
      },
      "stars_high": {
        "any": [
          "A top rating. Of course. People can feel a clean zoo even when they can't say why.",
          "Four or five stars. I'd like to think one of them is for the handrails."
        ],
        "lo": "A fine rating. You run an orderly place. I don't say orderly lightly.",
        "hi": "You earned those stars, {player}. I only kept them shiny."
      },
      "stars_low": {
        "any": [
          "The rating is poor. Ratings can be scrubbed up, like anything else. It takes patience.",
          "One star. I've restored worse. A kitchen, once. I still think about that kitchen."
        ],
        "lo": "A low rating. I won't pretend otherwise. I also won't leave. I don't walk off a job half done.",
        "hi": "It's a stain, {player}, not a ruin. Stains come out. I've never met one I couldn't shift."
      },
      "coins_low": {
        "any": [
          "I hear the Zoo Coins are nearly gone. I'll make each bottle go further. I know how.",
          "Low funds. I can be thrifty. One drop does the work of three if you rub properly."
        ],
        "lo": "The zoo's short of coins, they say. I'm still here, and I'm not counting my hours.",
        "hi": "Money comes and goes, {player}. I love diamonds, and I'd still say you're worth more than the till. Logically."
      },
      "animal_sick": {
        "any": [
          "An animal is unwell. I've gone over my work near it twice. I'll go a third time. It's what I can do.",
          "One of them is poorly. That's the war I fight, and today I feel I'm a step behind."
        ],
        "lo": "There's a sick animal in your zoo. I'm not blaming. I'm telling you, because I'd want to be told.",
        "hi": "{player}, one of ours is ill. I keep thinking about what I might have missed. Tell me it wasn't my rails."
      }
    },
    "near": {
      "desilva": [
        "Desilva says she loves trash. I think she says it to see my face. My face stays calm. Mostly.",
        "I wiped Desilva's gate once as a kindness. She called it an insult. I'll do it again next week."
      ],
      "ron": [
        "Ron is a kind man who stands in mud all day by choice. I like him. I just don't follow his reasoning.",
        "Ron offered me fresh eggs, straight from the hen. I thanked him and washed them. Twice. Good eggs, {player}."
      ],
      "aloof": [
        "Aloof drools. He's cheerful about it. I carry an extra cloth on days I expect to see him.",
        "Aloof laughed at my bottle for a full minute. I don't know why. It was a nice laugh, though."
      ]
    }
  },
  "carrie": {
    "intro": "Name's Carrie, community guide. I walk neighbours to each other's doors, day or night, and I've never lost one yet. If you're ever turned around, look for the lantern.",
    "scenes": {
      "home_morning": {
        "any": [
          "You caught me at the door. Another minute and I'd have been three streets away.",
          "Tea's still warm, coat's already on. I never sit through a whole morning indoors."
        ],
        "lo": "You found my house on your own. Good sign. Most new folks need walking here.",
        "hi": "Come in, {player}. You're the one visitor I'll sit back down for. Five minutes, mind."
      },
      "home_evening": {
        "any": [
          "Lamp's lit, boots are by the door. They won't stay there long.",
          "Evenings indoors feel like wasted dark to me. Listen to how quiet the street is out there."
        ],
        "lo": "It's late to come calling on someone you hardly know. I'll allow it. I'd have done the same.",
        "hi": "I'll tell you straight, {player}: I only sit still of an evening when you're the one sitting across from me."
      },
      "walking_to_zoo": {
        "any": [
          "Zoo's dead ahead. I take this path every day and still check it for loose stones.",
          "Halfway to the gate. I can hear the animals from here if the wind's right."
        ],
        "lo": "Headed to the zoo too? Then we're on the same path. I'll know your footsteps soon enough.",
        "hi": "I was hoping I'd meet you on this stretch, {player}. The walk to the gate goes quicker with you beside me."
      },
      "at_zoo": {
        "any": [
          "I come here with no one to lead. Feels odd. I keep counting heads anyway.",
          "I've worked out the shortest loop past every exhibit. Old habit, can't switch it off."
        ],
        "lo": "Just looking round, same as anybody. If I see folks wandering lost, that's when I stop being a visitor.",
        "hi": "Honest opinion, {player}? This is the one place I don't mind being a visitor. You laid it out so nobody needs me."
      },
      "walking_home": {
        "any": [
          "Heading back. My feet know this path so well I could do it asleep, and nearly have.",
          "Day's done and I'm pointed at my own door. Slowest I walk all day."
        ],
        "lo": "On my way home. I don't need company for it, but I won't chase you off the path either.",
        "hi": "I drag my heels on this bit, {player}. Home means sitting still. Talking to you is a fine excuse to put it off."
      },
      "at_work": {
        "any": [
          "I'm between doors just now. One neighbour delivered, the next one waiting on me.",
          "Guiding's simple work. Know the way, walk in front, don't lose anybody."
        ],
        "lo": "I'm working, so I'll be brief. Folks are waiting on me and I don't leave people waiting.",
        "hi": "Good timing, {player}. I just got someone to a door they'd not knocked on in weeks. Best feeling there is."
      },
      "following": {
        "any": [
          "Strange view from back here. I keep wanting to step past and take the front.",
          "I'm noting every turn we take. Somebody ought to know the way back, and it's going to be me."
        ],
        "lo": "I'll be honest, walking behind someone I barely know sets my teeth on edge. Lead well.",
        "hi": "I don't walk behind anybody but you, {player}. You pick good roads. Mostly."
      },
      "following_night": {
        "any": [
          "Dark road, far from home. This is my kind of walk, even from the back.",
          "My lantern's lit, but I hardly need it. On a night like this I see fine."
        ],
        "lo": "Out at night with a near stranger in front. I've got my lantern and my wits, so we'll manage.",
        "hi": "You and me and the dark, {player}. I'd not swap this for a warm bed. I mean that."
      },
      "staying": {
        "any": [
          "Standing still. Not my best skill, but I said I'd hold, so I'm holding.",
          "I've counted the ways out of this spot. Four. I'm ready when you are."
        ],
        "lo": "You want me planted here? All right. I keep my word, even to folks I've only just met.",
        "hi": "For you I'll wait, {player}. Don't be long, though. I get restless and you know it."
      },
      "rain": {
        "any": [
          "This rain turns the paths to mud, and mud shows me every footprint. Useful stuff.",
          "Wet headscarf, wet coat, dry lantern. That's all that matters in a downpour."
        ],
        "lo": "You're out in the rain as well? Most folks hide from it. That tells me something good about you.",
        "hi": "You're dripping, {player}, and so am I. Nobody else is daft enough to be out in this. I like that about us."
      },
      "thunder": {
        "any": [
          "That thunder's close. I count between the flash and the bang, same as I count paces.",
          "A storm like this turns folks around. Lightning spoils your night eyes for a moment."
        ],
        "lo": "Loud, isn't it? It doesn't rattle me. If it rattles you, there's no shame in saying so.",
        "hi": "I'm not scared of this storm, {player}, but I'll admit I'm glad you're next to me while it bangs about."
      },
      "full_moon": {
        "any": [
          "Full moon. I could walk every path tonight with my lantern shut.",
          "Look how bright the moon's made the road. Nights like this are a gift to a guide."
        ],
        "lo": "A full moon suits newcomers. You can see where you're putting your feet while you learn the place.",
        "hi": "The moon's doing my job tonight, {player}. Good. That leaves me free to just walk with you."
      },
      "dark_moon": {
        "any": [
          "No moon at all tonight. This is the proper dark, the kind I know best.",
          "Black as a mineshaft out here. I find my way by the feel of the path under my boots."
        ],
        "lo": "Moonless tonight. If you don't know the paths yet, this dark won't teach you kindly.",
        "hi": "Can't see my own hand, {player}, and I'm perfectly happy. In dark like this I trust two things: my feet and you."
      },
      "dawn": {
        "any": [
          "There's the sun coming up. The night's over and I'm a bit sorry, truth be told.",
          "First light. The paths are empty and all mine for a few more minutes."
        ],
        "lo": "You're up with the sunrise. Early risers are easier to guide, I've found. They pay attention.",
        "hi": "Sunrise already, {player}. I walked the whole night away and never noticed. That's what good company does."
      },
      "dusk": {
        "any": [
          "Sun's going down. This is when my day gets good.",
          "Watch the sky go red over the rooftops. In a few minutes the lanterns start to earn their keep."
        ],
        "lo": "Sunset. Folks who don't know the way should think about where they're sleeping. I'm only being honest.",
        "hi": "There goes the sun, {player}. Everyone else hurries indoors. You and I know the best hours are just starting."
      },
      "nether": {
        "any": [
          "Red rock, red light, and heat coming up through my boots. I'm marking every step back to that portal.",
          "Lava for rivers and no sky at all. Even so, a place this strange still has ways through it."
        ],
        "lo": "You brought me to the Nether on short acquaintance. Bold. I hope you remember the way out, because I do.",
        "hi": "I don't follow anyone into a place like this, {player}. Only you. I've got the way back memorised, so breathe easy."
      },
      "the_end": {
        "any": [
          "Nothing below us but black. I've never stood anywhere with so few paths to count.",
          "Those tall dark things give me the shivers, and I don't shiver easy. I'm watching the pale stone under my feet."
        ],
        "lo": "I'll say it plain: I don't know this place and I hardly know you. I'm staying well back from the edge.",
        "hi": "A sky with no stars, {player}. That's the one dark I can't love. Glad it's you I'm standing in it with."
      },
      "fishing_sky": {
        "any": [
          "Islands floating in the sky and ponds on top of them. I'd need a whole new kind of map up here.",
          "I looked over the edge of this island. Clouds underneath. No path down that I'd recommend."
        ],
        "lo": "Fishing pools above the clouds. I've guided folks to odd places, but nobody ever asked for this one.",
        "hi": "The stars feel close enough to touch from these islands, {player}. I could stand a night up here, easily."
      },
      "acufend": {
        "any": [
          "A round little moon with a jungle on it, and every creature humming. I can't tell north from a tune here.",
          "The village paths on this moon curl back on themselves. Somebody laid them out to music, I reckon."
        ],
        "lo": "These singing creatures seem friendly enough. I'd still like to know the way off this moon before I relax.",
        "hi": "Hear them all playing, {player}? Oddest place you've ever dragged me, and I'm honestly enjoying it."
      },
      "cave": {
        "any": [
          "Now this is more like it. Stone overhead, dark ahead, and my lantern swinging.",
          "Listen to the drip down that tunnel. Caves have paths the same as towns, just rougher."
        ],
        "lo": "Not everyone keeps their head down here. You're steady so far. I've been watching.",
        "hi": "Deep underground with you, {player}. If I could pick my perfect afternoon, it'd look a lot like this tunnel."
      },
      "high_up": {
        "any": [
          "From up here I can see every path at once, like a map somebody unrolled.",
          "That's a long drop. I'm not afraid of it, but I respect it."
        ],
        "lo": "See those thin lines down there? Those are the paths. Learn them from above and you'll walk them better below.",
        "hi": "Look down there, {player}. I can pick out your door and mine from this height. Not so far apart, are they?"
      },
      "hostile_near": {
        "any": [
          "Something nasty's shuffling about close by. I heard it before I saw it.",
          "There's a monster near us. I'm not running, but I'm not turning my back on it either."
        ],
        "lo": "There's a monster nearby. I've walked past worse in the dark. Keep your head and you'll be fine.",
        "hi": "That thing's too close for my liking, {player}. I'm right at your shoulder. Nobody gets left behind on my watch."
      },
      "creeper_near": {
        "any": [
          "Creeper. Right there, green and quiet. I never did like how they make no sound till the hiss.",
          "That creeper's eyeing us. I've led folks the long way round those more times than I can count."
        ],
        "lo": "There's a creeper close. I'm telling you because I'm honest, not because I'm frightened.",
        "hi": "{player}, creeper, just there. I'd sooner lose my lantern than see you caught by that thing."
      },
      "villager_near": {
        "any": [
          "Villagers. They hum and wander in circles, and somehow they always end up at their own doors.",
          "Nice village. Short paths, though. I could guide the whole place before breakfast."
        ],
        "lo": "These villagers took their time warming to me too. It's not just you they stare at.",
        "hi": "Watch them nod at each other, {player}. Folks looking after folks. That's all I ever want from a place."
      },
      "pet_near": {
        "any": [
          "That's a loyal animal at your heel. It follows better than I ever will.",
          "Your pet's watching me close. Good. It's keeping an eye on you, same as I would."
        ],
        "lo": "Your animal trusts you. I put some stock in that. Pets are honest judges.",
        "hi": "Between me and that pet of yours, {player}, you're the best guarded person for miles."
      },
      "farm_animal_near": {
        "any": [
          "Cows and sheep. They stand in one field all day and call it living. I couldn't.",
          "Hear that clucking? Farm animals never go anywhere. Makes me fidget just watching them."
        ],
        "lo": "If you're fond of farmyards, I won't argue. I'll just be honest: fences make me restless.",
        "hi": "Don't go turning farmer on me, {player}. I'd miss you out on the roads. These sheep can mind themselves."
      },
      "zoo_animal_near": {
        "any": [
          "The {species} walks the same track round its home every day. I notice that sort of thing.",
          "I stop by the {species} on most of my rounds. It knows my lantern by now, I think."
        ],
        "lo": "That {species} is sizing you up. Animals take a while to trust. So do I, to be fair.",
        "hi": "The {species} looks well cared for, {player}. I can tell. You do right by the ones who depend on you."
      },
      "guests_crowd": {
        "any": [
          "So many guests, and half of them walking the wrong way with great confidence.",
          "I can't stand in a crowd like this without wanting to line everyone up and lead them."
        ],
        "lo": "Mind yourself in this crush of visitors. I've already pointed three of them toward the gate.",
        "hi": "All these guests came to see what you built, {player}. I'm proud of that, and I don't say proud lightly."
      },
      "residents_crowd": {
        "any": [
          "Half the street's gathered here. I've walked most of them to each other's doors at one time or another.",
          "Look at the neighbours, all talking at once. A good sight. Means the paths are doing their job."
        ],
        "lo": "That's most of the neighbourhood round us. You'll learn their names. I learned their doorsteps first.",
        "hi": "Everyone's here, {player}, and I still came to stand by you. Take that as the compliment it is."
      },
      "other_resident": {
        "any": [
          "{other}'s here. I know the way to that front door better than {other} does.",
          "I was meaning to call on {other} today. Saves me a walk, not that I mind walks."
        ],
        "lo": "That's {other}. A neighbour worth knowing. I could say the same of most folks round here.",
        "hi": "I've been nudging {other} to visit folks more, {player}. You're the only one I tell my plans to."
      },
      "other_player": {
        "any": [
          "So {other} is travelling with you. Two to keep track of. I can count that high.",
          "{other} looks like someone who wanders off. I'll be watching the both of you."
        ],
        "lo": "I don't know {other} and I barely know you. Give me time. I learn faces quick.",
        "hi": "Any friend of yours gets a fair chance from me, {player}. {other} seems sound. I'll say so if that changes."
      },
      "alone_night": {
        "any": [
          "Nobody about but us. Quiet enough to hear my lantern creak.",
          "Empty paths, dark sky, one other person. That's as peaceful as I get."
        ],
        "lo": "Just the two of us out here at night. You're safe with me. I'd tell you if you weren't.",
        "hi": "No one else for miles, {player}. Nights like this I talk more than I should. You're easy to tell things to."
      },
      "by_water": {
        "any": [
          "Water's high on the bank today. I check it whenever I pass, in case the crossing's changed.",
          "I like the sound of water at night. It tells you where the edge is without a lantern."
        ],
        "lo": "That bank's slippery if you don't know it. I'm not fussing. I just say what I see.",
        "hi": "I could stand by this water all evening with you, {player}. Only place I hold still without itching to move."
      },
      "by_lava": {
        "any": [
          "Lava. It lights a cavern better than any lantern, and I still keep six paces off.",
          "Feel that heat on your face? I've mined beside pools like this. You learn to watch your footing."
        ],
        "lo": "I'm not nervous near lava, but I'm honest about it: it doesn't forgive a careless step.",
        "hi": "You're standing closer to that lava than I'd like, {player}. I'm brave, but not about losing you."
      },
      "by_flowers": {
        "any": [
          "Flowers all round my boots. Pretty. I use patches like this as landmarks.",
          "Somebody walked through these flowers before us. See where the stems are bent?"
        ],
        "lo": "Nice blooms. I'm not much for picking them. I'd rather know which road they grow beside.",
        "hi": "Don't laugh, {player}, but I tuck one of these in my headscarf some days. Tell nobody."
      },
      "by_fire": {
        "any": [
          "A fire's a good marker. You can spot that glow from three hills away.",
          "Warm hands, smoky coat. I've spent a lot of nights beside fires like this one on the road."
        ],
        "lo": "Share the fire if you like. A fire's for whoever turns up. That's the rule of the road.",
        "hi": "Fire, dark sky and you, {player}. This is when I tell the stories I don't tell the others."
      },
      "by_crops": {
        "any": [
          "Wheat in rows. Somebody stood in this one spot for days to grow that. I'd go mad.",
          "Tidy field. I'm glad someone farms it, and gladder it isn't me."
        ],
        "lo": "If farming's your pleasure, good for you. Honestly, I'd rather walk ten miles than weed one row.",
        "hi": "You'd never catch me hoeing, {player}. But if these are your crops, I'll admit they look grand."
      },
      "by_books": {
        "any": [
          "Books. Every one of these is somebody showing the way to something. I respect that.",
          "I never had much patience for sitting and reading. I do like an old map, though."
        ],
        "lo": "You read much? I learned what I know by walking it. Both ways work, I suppose.",
        "hi": "One day, {player}, I'd like my paths written down in a book like these. You'd have to hold the pen. I can't sit that long."
      },
      "in_snow": {
        "any": [
          "Fresh snow. Every track shows, mine included. Nobody gets lost on a day like this.",
          "Snow hides the path but not from me. I know where it runs under all that white."
        ],
        "lo": "Cold, isn't it? I keep my toes moving in my boots. A guide's first lesson is looking after her feet.",
        "hi": "Your tracks and mine, side by side in the snow, {player}. I like the look of that more than I expected."
      },
      "holding_gift": {
        "any": [
          "Is that {item} you've got? Now there's something that came out of honest digging.",
          "I can't help eyeing that {item}. Anything from under the ground catches my attention."
        ],
        "lo": "That's a fine {item}. I'm not hinting. I just say what I see.",
        "hi": "{player}, you turn up holding {item} and expect me not to notice? You know me too well."
      },
      "holding_weapon": {
        "any": [
          "You carry that {item} like you know it. Good. Roads aren't always friendly.",
          "A {item} in hand. I lead with a lantern myself, but I see the sense in it."
        ],
        "lo": "I notice the {item}. I notice everything. My neighbours are gentle folk, so I'm glad it's in steady hands.",
        "hi": "With you and that {item} beside me, {player}, I'd walk through any dark there is."
      },
      "holding_food": {
        "any": [
          "That {item} smells good. I usually eat walking, so I forget what a proper meal is.",
          "Travelling food, is it? I judge all food by whether it fits in a coat pocket."
        ],
        "lo": "Don't mind me looking at your {item}. I skipped a meal on my rounds. My own doing.",
        "hi": "You and your {item}, {player}. You'd feed the whole street if you could. It's one of your better habits."
      },
      "holding_rod": {
        "any": [
          "A fishing rod. That's a lot of standing in one spot, for my taste.",
          "Off to the water with that rod? I've walked every bank round here, the muddy and the firm."
        ],
        "lo": "Fishing takes patience. I've plenty on the road and none at all on a riverbank.",
        "hi": "I'd come and watch you fish, {player}. I'd pace up and down the whole time and scare everything off, mind."
      },
      "holding_tool": {
        "any": [
          "That {item}'s seen some use. I can tell by the handle.",
          "A {item}. If that's for digging down into the dark, you have my full attention."
        ],
        "lo": "Good solid {item}. Folks who work with their hands tend to be honest. I've found that, anyway.",
        "hi": "You've got your {item} out, {player}, and now I'm thinking about tunnels. You do that to me on purpose."
      },
      "armored": {
        "any": [
          "Full armour, head to foot. You clank. I heard you coming from the corner.",
          "All that plate looks heavy for a long walk. I travel light, coat and lantern."
        ],
        "lo": "Dressed for trouble, I see. Are you expecting some, or just careful? Either's fine by me.",
        "hi": "I like seeing you in all that armour, {player}. Means you're planning to come back in one piece."
      },
      "hurt": {
        "any": [
          "You're hurt, and badly. Don't tell me it's nothing. I've got eyes.",
          "You're swaying where you stand. I'm not leaving your side while you look like that."
        ],
        "lo": "I don't know you well, but I know a bad wound when I see one. I'd worry for anyone in that state.",
        "hi": "{player}, look at the state of you. I've led people out of worse, but none I'd miss this much."
      },
      "wet": {
        "any": [
          "You're soaked through. You'll leave a trail of puddles a child could follow.",
          "Wet to the skin. I hope the swim was on purpose."
        ],
        "lo": "You're dripping on the path. I'm not complaining, only pointing it out.",
        "hi": "Did you fall in or jump in, {player}? Be honest. I always am with you."
      },
      "sneaking": {
        "any": [
          "Why are you crouched down like that? I can still see you, you know.",
          "Creeping about low to the ground. Whoever you're hiding from, it isn't working on me."
        ],
        "lo": "Folks who sneak up on a guide make her wonder. I'll assume you've a good reason.",
        "hi": "Quiet feet, {player}. Not bad. I'd still hear you coming in the dark, but only just."
      },
      "long_time": {
        "any": [
          "It's been days. I walked past your usual spots and you weren't at any of them.",
          "You've been scarce. I noticed. Noticing who's missing is half my job."
        ],
        "lo": "Haven't seen you in a while. I thought the paths had got the better of you.",
        "hi": "Days without a word, {player}. I'll be honest, I started planning which roads I'd search first."
      },
      "first_today": {
        "any": [
          "There you are. First I've seen of you today, and I've covered a lot of ground already.",
          "Good, you're about. I like to know where everyone's got to."
        ],
        "lo": "Hello again. First meeting of the day, so I'll ask: do you know where you're headed?",
        "hi": "First sight of you today, {player}. My rounds always go better once I've seen you're all right."
      },
      "zoo_busy": {
        "any": [
          "The zoo's heaving today. I've turned round four families who thought the exit was the way in.",
          "Paths are packed gate to gate. Busy days are when a guide earns her keep."
        ],
        "lo": "Crowded today. If you're in charge of all this, you've got your hands full.",
        "hi": "Look at the place, {player}, full to the fences. You did this. I'll say it since you won't."
      },
      "zoo_empty": {
        "any": [
          "Not one guest on the paths. I can hear my own boots echo off the fences.",
          "Gates open, nobody through them. An empty path's fine at night. In daylight it bothers me."
        ],
        "lo": "Quiet zoo today. No visitors at all. I won't pretend that's a good sign.",
        "hi": "Nobody's come today, {player}. Don't take it to heart. Folks find their way to good places in the end."
      },
      "zoo_closed": {
        "any": [
          "Gates are shut. The paths in there are having a rest, I suppose. They've earned one.",
          "Closed up. Funny how different the place sounds with no visitors, just animals."
        ],
        "lo": "Zoo's closed to guests. I take it that's your doing and you've your reasons.",
        "hi": "Closed for now, {player}? Good. You push yourself too hard. Even a zoo wants a quiet spell."
      },
      "litter_bad": {
        "any": [
          "There's rubbish all down these paths. I nearly turned my ankle on a cup back there.",
          "I can't abide a littered path. A path's a promise that someone looked after the way."
        ],
        "lo": "I'll be honest because I always am: these paths are a mess, and the guests have noticed.",
        "hi": "{player}, I say this as your friend. The litter's bad today. You're better than these paths look."
      },
      "stars_high": {
        "any": [
          "Folks talk about this zoo all over town now. I hear it at every door I knock on.",
          "A grand rating, and it's deserved. I walk these paths daily, I'd know if it weren't."
        ],
        "lo": "This zoo's well thought of. I don't flatter, so take that from a plain speaker.",
        "hi": "Top marks, {player}. I've told you when things were wrong, so believe me now: you've made something fine."
      },
      "stars_low": {
        "any": [
          "Word on the street's not kind about the zoo just now. I'd rather you heard it from me.",
          "The zoo's name has slipped. Guests leave grumbling. I walk behind them, I hear it."
        ],
        "lo": "I won't dress it up. Folks aren't rating this zoo well. That can change, mind.",
        "hi": "It's a poor rating, {player}, and I won't lie to you about it. But I've seen you find your way out of worse."
      },
      "coins_low": {
        "any": [
          "I hear the zoo's coin box is rattling near empty. Hard times come to every road.",
          "Zoo Coins are thin, so folk say. I've walked on an empty purse before. You keep walking."
        ],
        "lo": "Money's tight at the zoo, I gather. Not my business, but I don't pretend not to know.",
        "hi": "Running short of Zoo Coins, {player}? I can't mend that, but I can stand by you while you do."
      },
      "animal_sick": {
        "any": [
          "One of the animals isn't right. I saw it on my rounds and it's been on my mind since.",
          "There's a poorly creature in there. It can't ask the way to help, so somebody has to notice."
        ],
        "lo": "I'll tell you plainly: one of your animals looks unwell. I'd want to be told, if it were mine.",
        "hi": "{player}, one of your animals is suffering. I know you care, so I'm saying it straight and soon."
      }
    },
    "near": {
      "aloof": [
        "That's Aloof. I've walked him home more than anyone on the street. He forgets which door is his.",
        "Aloof's the reason I count heads twice. Sweet lad. No sense of direction whatsoever."
      ],
      "dave": [
        "Dave there knows the dark under the ground like I know it on top. We compare notes.",
        "If I ever gave up guiding, I'd go down the mine with Dave. He says I'd talk to the tunnels. He's right."
      ],
      "teddy": [
        "Mayor Teddy likes his paths tidy and I like them walked. We get along, on the whole.",
        "Teddy makes speeches about the paths. I just use them. Somebody has to, {player}."
      ]
    }
  },
  "desilva": {
    "intro": "Desilva. I do nothing for a living and I do it better than you. I like poison, rubbish and bad news. Charmed to meet you. That was a lie.",
    "scenes": {
      "home_morning": {
        "any": [
          "You're at my door before I've had a proper scowl. Wipe your feet. Or don't, I like the dirt.",
          "Mornings in this house are for sulking by the window. You're blocking my window."
        ],
        "lo": "Who let you up my path this early? Nobody. That's who. Say your piece and go.",
        "hi": "It's you, {player}. Fine, come in. I was only going to glare at the wall until lunch anyway."
      },
      "home_evening": {
        "any": [
          "Evening. I'm sorting my bottles by nastiness. Don't breathe near them.",
          "The house is dark and smells of old rubbish. I've got it exactly how I like it."
        ],
        "lo": "Visiting hours ended before they started. Why are you in my house at night?",
        "hi": "Sit there, {player}. Not the good chair. There is no good chair. I had a rotten day and you get to hear it."
      },
      "walking_to_zoo": {
        "any": [
          "I'm walking to the zoo. Slowly. So I arrive in a worse mood.",
          "This path is far too neat. Not a single thing to trip over between my door and the gate."
        ],
        "lo": "Don't walk beside me. People will think I have company.",
        "hi": "Going my way, {player}? Fine. You can listen to my list of everything wrong with this path. It's long."
      },
      "at_zoo": {
        "any": [
          "I've looked at six exhibits and every animal was content. What a waste of a walk.",
          "I come to the zoo for the queues. Nothing cheers me like other people waiting."
        ],
        "lo": "I'm a visitor. I'm visiting. That doesn't mean I want to be spoken to.",
        "hi": "Your zoo's too pleasant, {player}. I looked everywhere for something to complain about. I had to make things up."
      },
      "walking_home": {
        "any": [
          "Going home. The zoo had no snakes and too many smiles. My feet hurt.",
          "Done for the day. I've frowned at everything worth frowning at."
        ],
        "lo": "I'm leaving. Don't wave. I can't stand waving.",
        "hi": "You can see me to my gate, {player}. Then I get to slam it at someone. It's no fun slamming it at no one."
      },
      "at_work": {
        "any": [
          "Job? I haven't got one. I'm busy disapproving of things. It's full time.",
          "I'm working. I'm watching that bin in case it tips over. It won't. Shame."
        ],
        "lo": "I don't work and I certainly don't work for you. Whatever it is, the answer's no.",
        "hi": "My duty today is being miserable in public, {player}. You're interrupting. I suppose I'll allow it."
      },
      "following": {
        "any": [
          "I'm behind you and I'm not enjoying it. The scenery's too green.",
          "Is there a point to this walk? Tell me it ends somewhere horrible."
        ],
        "lo": "I'm only tagging along to watch it go wrong. I barely know you, so I've no reason to warn you.",
        "hi": "I'd not trudge after anyone else, {player}. Don't smile about it. I can see your ears smiling."
      },
      "following_night": {
        "any": [
          "Dragging me about in the dark, far from my bottles. At least it's gloomy.",
          "A night walk. Something out there's bound to go wrong. I can hardly wait."
        ],
        "lo": "If you get us lost out here at night, I'll never stop mentioning it. Never.",
        "hi": "It's dark, it's cold, we're miles from home. Honestly, {player}, this is the nicest evening I've had all week."
      },
      "staying": {
        "any": [
          "I'm standing where you left me, like a coat. I hope you feel bad about it.",
          "Waiting. I'm counting everything wrong with this spot. I'm up to eleven."
        ],
        "lo": "You told me to wait and I'm waiting, but I'm resenting every second. Just so we're clear.",
        "hi": "I'll wait for you, {player}. Not happily. But I'd wait for nobody else at all, so there's that."
      },
      "rain": {
        "any": [
          "It's pouring and somebody's picnic is ruined somewhere. I can feel it. Lovely.",
          "Look at the puddles filling up with muck. This rain's doing good work."
        ],
        "lo": "You're getting rained on. I'd offer you shelter, but I don't want to.",
        "hi": "You're soaked and still came to bother me, {player}. In this weather. You must be as sour as I am."
      },
      "thunder": {
        "any": [
          "Now that's a proper storm. Listen to it shouting at everyone. I couldn't have put it better.",
          "Thunder. Every cheerful person for miles just jumped. Best noise there is."
        ],
        "lo": "Scared of the thunder, are you? Good. I mean, there there. No, I mean good.",
        "hi": "You can share my doorway till the thunder's done, {player}. Not because I care if you get rattled. Forget I offered."
      },
      "full_moon": {
        "any": [
          "Full moon. Big, bright and smug, lighting everything up. Who asked it?",
          "Too much moonlight. I can see everyone's happy faces even at night now."
        ],
        "lo": "The moon's showing me your face quite clearly. That's not doing either of us a favour.",
        "hi": "A full moon, {player}. They say it turns people strange. You and I were strange already, so we're safe."
      },
      "dark_moon": {
        "any": [
          "No moon. Pitch black. At last the sky's got the right idea.",
          "Dark as the inside of a bin out here tonight. I feel right at home."
        ],
        "lo": "You can't see a thing, can you? I can. Red eyes. I'm lying, I can't either.",
        "hi": "Blackest night of the month, {player}, and you spend it with me. Bad judgement. I approve."
      },
      "dawn": {
        "any": [
          "Sunrise. Pink and gold and far too pleased with itself.",
          "Here comes the sun, cheering everyone up again. Nobody asked me if I wanted a new day."
        ],
        "lo": "It's dawn and you're already talking. Some of us are trying to dread the day in peace.",
        "hi": "Up at sunrise, {player}? Me too. I like to be awake early so I can be annoyed for longer."
      },
      "dusk": {
        "any": [
          "Sunset. The one time of day the sky goes the same red as my eyes.",
          "There goes the sun. Good riddance. It was showing off all day."
        ],
        "lo": "Shouldn't you be heading home at sunset like all the other dull people?",
        "hi": "I watch the sun go down most days, {player}. Don't tell anyone. It ruins my reputation if I like a view."
      },
      "nether": {
        "any": [
          "Lava, smoke, things wailing in the distance. Why does nobody live here? It's perfect.",
          "Everything in the Nether looks furious. Finally, a place that understands me."
        ],
        "lo": "You brought a near stranger to the Nether. That's the first interesting thing you've done.",
        "hi": "Don't you dare get singed down here, {player}. I'd have to find someone else to be rude to, and I can't be bothered."
      },
      "the_end": {
        "any": [
          "A dead sky, grey rock and a great big nothing underneath. I could retire here.",
          "Those tall gloomy ones won't look anyone in the eye. Sensible. I wouldn't look at us either."
        ],
        "lo": "It's bleak, empty and nobody's smiling. You've accidentally shown me somewhere I like.",
        "hi": "This place is miserable to the very edges, {player}. Thanks for bringing me. I'll deny saying thanks."
      },
      "fishing_sky": {
        "any": [
          "Floating islands. Fluffy clouds. Little fishing pools. It's so charming I feel ill.",
          "We're above the clouds, so I can't even watch it rain on people. Useless place."
        ],
        "lo": "You dragged me up into the sky to look at ponds? I don't know you well enough to be this annoyed.",
        "hi": "I'll admit one thing, {player}. From these islands everyone below looks tiny and unimportant. That part's nice."
      },
      "acufend": {
        "any": [
          "A moon full of creatures that won't stop making music. I've a headache in both ears.",
          "Jungle, a village, and everything tootling away happily. Somebody hand me earplugs."
        ],
        "lo": "If one of those musical things plays at me, I'm blaming you personally.",
        "hi": "They're dreadful, {player}, all that jolly noise. I caught my foot tapping. If you saw that, you didn't."
      },
      "cave": {
        "any": [
          "Damp, dark and it smells of old stone. Best room I've been in all week.",
          "I like a cave. Things drip, things lurk, and nobody's selling balloons."
        ],
        "lo": "If the roof comes down, I'm telling everyone it was your idea.",
        "hi": "Watch your head on the low bits, {player}. Not because I care. I just don't want to carry you out."
      },
      "high_up": {
        "any": [
          "All the way up here and the view's still full of happy little rooftops. Ugh.",
          "It's a long way down. I'm imagining someone's hat blowing off. That's the highlight."
        ],
        "lo": "Don't stand so near me at this height. People will say I pushed. I never push. I only talk.",
        "hi": "You're too near the edge, {player}. I've spent ages getting used to you and I'm not starting again with someone new."
      },
      "hostile_near": {
        "any": [
          "There's a monster lurching about nearby. Finally, someone with a worse temper than me.",
          "Something nasty's close. It's groaning. I know how it feels."
        ],
        "lo": "A monster's coming and I'm not helping. I don't help. I'll just stand well behind you.",
        "hi": "That thing's heading for you, {player}. I'd be annoyed if it got you. Properly annoyed. For days."
      },
      "creeper_near": {
        "any": [
          "A creeper. Sneaks up, ruins everything, leaves a mess. It's living my dream.",
          "See that green sulky thing? It's about to spoil someone's afternoon. I do admire the type."
        ],
        "lo": "Creeper, right there. I wasn't going to mention it, but the bang would hurt my ears.",
        "hi": "{player}! Creeper! Not that I'm worried. I shouted for my own reasons. Stop looking touched."
      },
      "villager_near": {
        "any": [
          "Villagers. Humming, nodding, swapping carrots. A whole town built on vegetables.",
          "They all fold their arms like they're cross, and then they're friendly. False advertising."
        ],
        "lo": "The villagers will talk to you. They like everyone. I don't have that problem.",
        "hi": "One of them tried to be neighbourly at me, {player}. I told him his roof leaks. It doesn't. Felt wonderful."
      },
      "pet_near": {
        "any": [
          "Your pet's staring at me. I'm staring back. Neither of us is going to blink.",
          "It follows you about adoring you all day. How exhausting for both of you."
        ],
        "lo": "Keep your creature off my shoes. It can smell that I don't like things.",
        "hi": "Your pet sat on my foot, {player}. I didn't move it. I couldn't be bothered. That's the only reason."
      },
      "farm_animal_near": {
        "any": [
          "A field of mooing and bleating. It smells bad, which is its only good quality.",
          "Chickens. Pecking about without a thought in their heads. Like a village fete with feathers."
        ],
        "lo": "I hope you didn't bring me here to look at pigs. Although the mud's quite good.",
        "hi": "That sheep's glaring at me, {player}. Best conversation I've had all day, present company almost excluded."
      },
      "zoo_animal_near": {
        "any": [
          "The {species} looks far too comfortable. Somebody's been taking good care of it. Typical.",
          "I've been scowling at the {species} for ten minutes. It doesn't care. I'm impressed."
        ],
        "lo": "That {species} is better company than you so far. It hasn't said a word.",
        "hi": "Don't tell anyone, {player}, but I stand by the {species} most days. It never tries to cheer me up."
      },
      "guests_crowd": {
        "any": [
          "So many guests. Sticky children, loud hats, everyone pointing. I hate it here. I come daily.",
          "Crowds drop things. Look at the ground in an hour. That's the only show worth seeing."
        ],
        "lo": "You've packed the place with strangers. Now there's a queue to be near me. I didn't agree to that.",
        "hi": "All these people came for your zoo, {player}. Revolting. Well done. Revolting."
      },
      "residents_crowd": {
        "any": [
          "The whole street's turned up. Every single neighbour I avoid, in one handy clump.",
          "Listen to them all chatting. Not one of them is complaining. Amateurs."
        ],
        "lo": "You're with that lot, I suppose. They'll tell you I'm awful. They're right.",
        "hi": "Of everyone standing here, {player}, you're the one I mind least. Don't repeat that in front of them."
      },
      "other_resident": {
        "any": [
          "{other} is standing right there, being pleasant. In broad daylight. Shameless.",
          "I told {other} it was going to rain frogs today. It isn't. Nobody laughed but me."
        ],
        "lo": "You'd get on with {other}. {other} likes people. I can tell by the awful smiling.",
        "hi": "{other} said hello to me, {player}. To my face. You see what I put up with."
      },
      "other_player": {
        "any": [
          "Now there's {other} as well. Two of you. I didn't order a second one.",
          "Who's {other}? No, don't introduce us. I'll only have to forget the name."
        ],
        "lo": "I've no idea who you are and less idea who {other} is. This is far too many people.",
        "hi": "You brought {other} to meet me, {player}? Brave. Tell {other} I'm lovely. I want to watch them find out."
      },
      "alone_night": {
        "any": [
          "Nobody about. Dark, quiet, empty. If you weren't here it'd be perfect.",
          "Just us and the night. No one to be rude to but you. Slim pickings."
        ],
        "lo": "Alone in the dark with someone I hardly know. One of us should be nervous. It's you.",
        "hi": "No one's listening, {player}, so here it is: I get lonely. There. Now it never happened."
      },
      "by_water": {
        "any": [
          "Water. Clear, sparkling, far too clean. Somebody should throw an old boot in it. Not me.",
          "I check every pond for otters. I can't relax by water until I'm sure."
        ],
        "lo": "If you fall in, I'm not fishing you out. I'll describe it to people afterwards, though.",
        "hi": "I keep seeing a whiskery face in that water, {player}. Tell me it's not an otter. Lie if you must."
      },
      "by_lava": {
        "any": [
          "Lava. Hot, bad tempered and nobody dares go near it. We've a lot in common.",
          "Look at it bubbling. It ruins anything that gets dropped in. I could watch for hours."
        ],
        "lo": "I'd keep back from that lava. Or don't. I don't know you well enough to have a preference.",
        "hi": "You're too close to that lava, {player}. I've already picked you as the one person I put up with."
      },
      "by_flowers": {
        "any": [
          "Flowers. Pink ones, yellow ones, all nodding about. It's like being surrounded by compliments.",
          "I'm standing in a flower patch and I'd like it noted that I didn't choose to."
        ],
        "lo": "If you pick me one of these, I'll drop it. I'm warning you now to save time.",
        "hi": "The droopy one at the back is all right, {player}. I'd keep that one. The rest are trying too hard."
      },
      "by_fire": {
        "any": [
          "A fire. All that crackling and all it does is keep people cosy. What a waste of flames.",
          "Smoke in my eyes, ash on my dress. Best part of the day so far."
        ],
        "lo": "I'm only standing by your fire because the smoke blows at other people from here.",
        "hi": "Don't tell them I sat by a campfire with you, {player}. Say I was lurking near it. Lurking sounds better."
      },
      "by_crops": {
        "any": [
          "Vegetables. Still in the ground and already offending me.",
          "Rows and rows of things nobody should eat. I can feel them down there, growing at me."
        ],
        "lo": "If you grew these, I think less of you. That took effort. I'd barely started thinking of you at all.",
        "hi": "Never put one of those on my plate, {player}. We've come too far for you to ruin it with a beetroot."
      },
      "by_books": {
        "any": [
          "Books. Thousands of pages and I bet none of them are about poison. I checked a few.",
          "All these shelves and nobody's written a decent book of insults. I'd have to do it myself."
        ],
        "lo": "Reading, are you? Read quietly. Your thinking face is distracting.",
        "hi": "I've read every gloomy ending on shelves like these, {player}. I skip the happy ones. The sad ones are the only honest ones."
      },
      "in_snow": {
        "any": [
          "Snow. Cold, wet and people keep saying how pretty it is. It's frozen rain. Calm down.",
          "My feet are numb and everything's white and clean. I hate clean."
        ],
        "lo": "If you're thinking of building a snowman near me, think harder.",
        "hi": "Your nose has gone red, {player}. Matches my eyes. You look pathetic. Don't catch cold, it'd be boring without you."
      },
      "holding_gift": {
        "any": [
          "Is that {item}? How foul. Hold it up, I want a better look.",
          "Somebody's carrying {item} about. For once a person with something worth staring at."
        ],
        "lo": "I see the {item}. I'm not asking. I don't ask. I'm just looking very hard at it.",
        "hi": "You've got {item}, {player}, and you walked straight to me with it. You know exactly what you're doing."
      },
      "holding_weapon": {
        "any": [
          "Waving a {item} about. Somebody's going to have a bad day. Do tell me who.",
          "A {item}. Very threatening. I only use words myself. They leave no evidence."
        ],
        "lo": "Point that {item} somewhere else. I'm unpleasant, not dangerous. There's a difference.",
        "hi": "You and your {item}, {player}. Go on, look fierce. I won't laugh. I'm lying, I will."
      },
      "holding_food": {
        "any": [
          "What's that, {item}? It had better not have a vegetable hiding in it.",
          "You're eating {item} in front of me. With that face. I've lost my appetite and I wasn't hungry."
        ],
        "lo": "Don't offer me any of your {item}. I'd have to say no thank you, and I don't say thank you.",
        "hi": "{item}, {player}? It'd be better a week old and found behind something. But you never listen to me."
      },
      "holding_rod": {
        "any": [
          "A fishing rod. Hours of sitting, hoping to annoy one fish. I respect the spite of it.",
          "Going fishing? I hope you hook an old boot. I'd take the boot over the fish."
        ],
        "lo": "Don't expect me to stand on a bank and clap when you catch something.",
        "hi": "If you ever reel in something slimy and useless, {player}, think of me. I mean that warmly. As warmly as I get."
      },
      "holding_tool": {
        "any": [
          "A {item}. Off to do some honest hard work, are you? How dreary.",
          "Look at you with your {item}, being productive. It makes my teeth itch."
        ],
        "lo": "If you're planning to use that {item}, use it away from me. I like my dirt where it is.",
        "hi": "You and that {item}, {player}. Always fixing things. One day let something stay broken, just for me."
      },
      "armored": {
        "any": [
          "All that armour. Who are you expecting, an army? It's only me and my opinions.",
          "You're clanking. Every step. Clank, clank. I'll hear that in my sleep."
        ],
        "lo": "You've dressed in a full suit of armour to talk to me. Sensible. It won't help.",
        "hi": "Good, {player}. Keep all that on. Not that I'd notice if you got hurt. I'd notice a bit."
      },
      "hurt": {
        "any": [
          "You look terrible. Worse than usual, I mean. Something's had a real go at you.",
          "You're barely standing. Normally I'd enjoy that. This is a bit much even for me."
        ],
        "lo": "You're badly hurt. Don't collapse here. I'd have to step over you.",
        "hi": "{player}, you're a wreck. I'm not worried, I just don't like you this pale. Stop grinning."
      },
      "wet": {
        "any": [
          "You're dripping. On purpose? You look like something the river sent back.",
          "Soaked to the bone. You squelch when you move. Finally, something to enjoy."
        ],
        "lo": "Don't shake yourself dry near me. I'm only fond of dirty water.",
        "hi": "Fell in, did you, {player}? I wish I'd seen it. Tell me slowly and don't leave out the splash."
      },
      "sneaking": {
        "any": [
          "Why are you crouching? Are you up to something? Please be up to something.",
          "Sneaking about all hunched over. Either you're plotting or your back's gone. I hope plotting."
        ],
        "lo": "Creeping up on me won't work. I've been suspicious of you since before you arrived.",
        "hi": "Oh, we're sneaking now, {player}? At last you're behaving like someone I'd know. Who are we avoiding?"
      },
      "long_time": {
        "any": [
          "Days of peace and quiet, and now you're back. I knew it couldn't last.",
          "You vanished for ages. I had no one to be sick of. It was dreadfully dull."
        ],
        "lo": "Have you been away? I didn't notice. I'm lying, it was nicer.",
        "hi": "Where were you, {player}? Not that I counted the days. I counted the days. Don't do it again."
      },
      "first_today": {
        "any": [
          "There you are. The day was only ordinary bad until now.",
          "First I've seen of you today. I'd set my hopes low and you've met them."
        ],
        "lo": "Hello. That's the whole greeting. I don't waste a full one on people I hardly know.",
        "hi": "There you are, {player}. I saved my first insult of the day for you. Aren't you special."
      },
      "zoo_busy": {
        "any": [
          "The zoo's stuffed with guests today. Someone trod on my foot and apologised. The cheek.",
          "Queues at every exhibit. I've joined three just to sigh loudly in them."
        ],
        "lo": "Your zoo's crawling with people. I blame whoever's running it. Oh. That's you.",
        "hi": "Packed to the gates, {player}. You must be thrilled. I'm disgusted. That's how you know it's going well."
      },
      "zoo_empty": {
        "any": [
          "Not one guest in the whole zoo. Open gates, empty paths. It's never looked better.",
          "Nobody's here. No queues, no shrieking, no balloons. I could get used to this."
        ],
        "lo": "Your zoo's deserted. I'd say sorry, but I'm having a lovely time.",
        "hi": "It's dead in here today, {player}. I like it this way. You won't, so I'll keep the gloating short."
      },
      "zoo_closed": {
        "any": [
          "Closed. Gates shut, guests gone. Now it's just the animals and me, judging each other.",
          "A locked zoo. All those people turned away disappointed. I'd have liked to watch that."
        ],
        "lo": "You've shut the place. Best decision you've made, and I doubt it was for my benefit.",
        "hi": "Shut the gates on everyone, did you, {player}? That's the sort of thing I'd do. I'm almost proud."
      },
      "litter_bad": {
        "any": [
          "Rubbish all over the paths. Wrappers, cups, a lovely soggy something by the bench. Gorgeous.",
          "Finally the zoo looks lived in. I've found three favourite bits of litter already."
        ],
        "lo": "Whoever let the paths get this filthy has my respect. I'm told that's you.",
        "hi": "The paths are a tip, {player}, and I've never been happier here. I know you'll go and ruin it with a broom."
      },
      "stars_high": {
        "any": [
          "Everybody's raving about this zoo. Stars all over it. I've never been so let down.",
          "A top rating. Now even more cheerful people will come. I'll need a bigger scowl."
        ],
        "lo": "They say your zoo's wonderful. I say it's fine. That's the worst I could come up with, annoyingly.",
        "hi": "It's a great zoo, {player}. There. I said it once and I'll never say it again, so I hope you were listening."
      },
      "stars_low": {
        "any": [
          "The zoo's rating is in the gutter. People are grumbling at the gate. It's music.",
          "Hardly a star to its name. For once this place and I are on the same level."
        ],
        "lo": "Your zoo's doing badly. I'd pretend to be sorry, but I'm saving my lies for something better.",
        "hi": "A rotten rating, {player}. I ought to be delighted. Somehow I'm not. I blame you for that as well."
      },
      "coins_low": {
        "any": [
          "I hear the zoo's nearly out of Zoo Coins. Empty pockets all round. How bleak. How nice.",
          "No money left, they say. Being poor and miserable is still miserable. I'd know."
        ],
        "lo": "Broke, are you? Don't look at me. I wouldn't lend you a rotten potato.",
        "hi": "Skint, {player}? I've nothing to give you but bad company. You can have plenty of that."
      },
      "animal_sick": {
        "any": [
          "One of the animals is poorly. Before you ask, no. I only talk. I don't touch.",
          "There's a sick animal in there. I like things going wrong, but not that. That's just sad."
        ],
        "lo": "Something in your zoo's unwell. I'm telling you because nobody else had the nerve. Not because I'm nice.",
        "hi": "One of your animals is suffering, {player}. Even I don't enjoy that. You'll see to it. You always do. It's irritating."
      }
    },
    "near": {
      "clian": [
        "Clian. He scrubs away every scrap of rubbish I've grown fond of. It's like watching someone bin my friends.",
        "That Clian washes his hands for fun, {player}. For fun. I've never trusted anyone so shiny."
      ],
      "terra": [
        "Terra wants the whole world clean and green. Green means vegetables. I rest my case.",
        "Terra smiled at me and said I had potential. I've been furious about it ever since."
      ],
      "sheila": [
        "Sheila keeps offering me soup. With vegetables in. I think she knows exactly what she's doing.",
        "That Sheila called me dear. Nobody calls me dear. Don't look at me like that, {player}."
      ]
    }
  },
  "aloof": {
    "intro": "Hello! My name is Aloof! A-L-O-O and the rest! I don't have a job. I have a thumb! And I laugh at stuff. Hee hee! Who are you? Wait, I'm asking the questions! What was the question?",
    "scenes": {
      "home_morning": {
        "any": [
          "You're in my house! Is it your house? No, mine! The pillow has drool on it, so it's mine!",
          "I put my shoes on already! They're on the wrong feet. They're the only feet I've got!"
        ],
        "lo": "A visitor! Do I know you? I don't! Come in anyway! Don't sit on the wet spot!",
        "hi": "It's {player}! In the morning! I was about to go and find you! I didn't know where! So I stayed! It worked!"
      },
      "home_evening": {
        "any": [
          "It's night in my house now! It was day in here earlier. Somebody changed it!",
          "I'm getting ready for bed. Step one is thumb. There's no step two! Hee hee!"
        ],
        "lo": "Are you sleeping over? I only have one bed. And one thumb. Good thing you brought your own thumb!",
        "hi": "You came to say night night, {player}! Nobody does that! I'm going to dream about you. And monkeys. Sorry."
      },
      "walking_to_zoo": {
        "any": [
          "I'm walking to the zoo! This is the path! I know because my feet are on it!",
          "The monkeys are that way! I'm so excited! I'm so scared! My legs keep going anyway!"
        ],
        "lo": "Are you going to the zoo too? Don't tell the monkeys I'm coming. Or do! No, don't!",
        "hi": "{player}! I forgot why I was walking, then I saw you and remembered! Zoo! You're like a signpost with legs!"
      },
      "at_zoo": {
        "any": [
          "I looked at an exhibit for ages! It was a bench. Nice bench! Hee hee!",
          "So many animals! I waved at all of them. One waved back. It was a guest."
        ],
        "lo": "Do you work here? You look like you know where things are! I don't know where I am!",
        "hi": "This is your zoo, {player}! You made the whole thing! Even the scary bits! Why did you make scary bits? Thank you!"
      },
      "walking_home": {
        "any": [
          "I'm going home now! Home is the opposite of the zoo. I just turn round and walk!",
          "My legs are tired from looking at animals. Do legs look? Mine did!"
        ],
        "lo": "Are you following me home? That's okay! Maybe you know where it is!",
        "hi": "Today I laughed and cried at the zoo, {player}. Same time! It came out as a hiccup. Good day!"
      },
      "at_work": {
        "any": [
          "Job? I don't have a job! I'm busy though. I've been watching this ant since breakfast.",
          "I'm working on my thumb. Hee hee! It's very hard work. It's very easy."
        ],
        "lo": "Are you my boss? I don't have a boss! Are you somebody's boss? Wow!",
        "hi": "My job is being your friend, {player}! I'm doing it right now! Do I get a lunch break? I'll take it later!"
      },
      "following": {
        "any": [
          "I'm following you! Look, I'm stepping where you step! Missed. Missed. Got one!",
          "Are we on an adventure? I've never been on one! I went on one yesterday! I forgot!"
        ],
        "lo": "I don't know you much, but your back looks friendly! I'll keep following it!",
        "hi": "I'd follow you anywhere, {player}! I'd follow you here! We're here! Hee hee! Where next?"
      },
      "following_night": {
        "any": [
          "It's dark and we're far away! I can't see my thumb! Oh, found it. It was in my mouth.",
          "Night walking! My eyes are open and it's still dark. They're broken! No, it's night!"
        ],
        "lo": "It's night and I don't know where we are or who you are! This is exciting!",
        "hi": "I'm not scared of the dark when it's you, {player}! I'm a little scared. That tug on your sleeve is me!"
      },
      "staying": {
        "any": [
          "I'm waiting! I haven't moved! I moved a bit. I'm back now!",
          "You said wait, so I'm a statue! Statues don't drool. I'm a fountain!"
        ],
        "lo": "Wait here? Okay! For who? For you! Which one are you again?",
        "hi": "I waited the whole time, {player}! I counted to help. One, two, a lot! You came back at a lot!"
      },
      "rain": {
        "any": [
          "It's raining on my head! And my shoulders! It knows where all of me is!",
          "I opened my mouth and caught the rain. Free drink! It tastes like sky!"
        ],
        "lo": "You're all rained on! I'm all rained on! We match! Are we friends now?",
        "hi": "{player}! Rain puddles! I jumped in one and it jumped back! I'll jump for both of us! Splosh!"
      },
      "thunder": {
        "any": [
          "BOOM! Hee hee! The sky did a burp! Say excuse me, sky!",
          "That thunder was loud! I laughed and screamed. Mostly screamed! There it goes again!"
        ],
        "lo": "Was that you? That big bang? No? It came from up there! Somebody's in trouble!",
        "hi": "Thunder's okay if I hide behind you, {player}. I'm behind you now. You can't see me! Hee hee! BOOM!"
      },
      "full_moon": {
        "any": [
          "The moon's all filled in tonight! Somebody finished colouring it!",
          "Big round moon! It looks like a plate. I'm hungry now. I can't reach!"
        ],
        "lo": "Look, the big moon is following us! Do you know it? I don't know it either!",
        "hi": "The moon's fat tonight, {player}! I howled at it. Aoooo! I'm not a wolf! I checked!"
      },
      "dark_moon": {
        "any": [
          "Somebody took the moon! It was right there! I'm telling the mayor!",
          "It's so dark my thumb got lost on the way to my mouth. Twice!"
        ],
        "lo": "I can't see you! Are you still the same person? Say something person-like!",
        "hi": "No moon tonight, {player}! Don't worry, I'll laugh so you know where I am. Hee hee! Still here! Hee hee!"
      },
      "dawn": {
        "any": [
          "The sun's coming up! It does that! I saw it do it before! Yesterday, I think!",
          "The sky's gone pink like a tongue! Good morning, tongue sky!"
        ],
        "lo": "You're awake at sunrise! Me too! I don't know why! Do you know why?",
        "hi": "We saw the sun wake up together, {player}! I said hello to it. It didn't say it back. It's shy!"
      },
      "dusk": {
        "any": [
          "The sun's falling down! Slowly! Somebody catch it! Never mind, it does this.",
          "Sunset! The sky's on fire but nobody's running. So I'm not running. I ran a little."
        ],
        "lo": "It's going dark! Did you do that? You look like you could do that!",
        "hi": "Bye bye, sun! I'm waving for both of us, {player}! It likes two waves! I made that up! It's true now!"
      },
      "nether": {
        "any": [
          "It's so hot! The floor is red and the sky is red and my face is red! I match the room!",
          "Orange water! It's glowing! I'm not drinking that one. I learned from the pond!"
        ],
        "lo": "Where did you bring me? It's all hot and grumpy! Is this your house?",
        "hi": "My drool dried up, {player}! It's too hot for drool! This is an emergency! Oh. It's back. False alarm!"
      },
      "the_end": {
        "any": [
          "There's no ground over there! Or there! Who forgot to finish the floor?",
          "Tall skinny guys with purple eyes! I tried to stare at one. My eyes went two ways. Phew!"
        ],
        "lo": "It's dark and floaty and I don't know you very well! I'm going to stand in the exact middle!",
        "hi": "I looked down into the nothing, {player}, and I shouted hello! Nobody answered. Rude nothing!"
      },
      "fishing_sky": {
        "any": [
          "We're in the sky! The ground is flying! I'm flying! I'm standing. Standing is flying up here!",
          "Ponds in the clouds! Do the fish know they're birds? Somebody should tell them!"
        ],
        "lo": "How did we get up here? Did you carry me? You're strong! I'm heavy with thoughts! Hee hee!",
        "hi": "I spat off the edge of the island, {player}! It's still going! Somebody down there will think it's rain!"
      },
      "acufend": {
        "any": [
          "Everything on this moon goes toot and boing! I'm dancing! My legs disagree with each other!",
          "We're on a ball in the sky! With trees! And tootly creatures! I love them! Are they monkeys?"
        ],
        "lo": "Those little music guys looked at me! I sang for them! They stopped playing. Out of respect!",
        "hi": "I'm dancing to the moon music, {player}! I only know one move. It's falling over! Ta-da! Ow!"
      },
      "cave": {
        "any": [
          "It's a hole but big! And inside! We're in the ground's tummy!",
          "I said hello and the cave said hello back! Then I said monkey. It knows monkeys too!"
        ],
        "lo": "It's dark down here. Are you a miner? Am I a miner? I don't have a hat!",
        "hi": "I licked a cave rock, {player}. It was a bad rock. It was the wet one. They're all the wet one!"
      },
      "high_up": {
        "any": [
          "We're so high! The people look like ants! The ants look like nothing! Where did the ants go?",
          "I can see my house from here! It's that one! Or that one! One of the small ones!"
        ],
        "lo": "It's windy up here! Hold my hand! No, I don't know you. Hold my sleeve!",
        "hi": "I'm taller than everything up here, {player}! Taller than trees! Tallest Aloof ever! Don't let me walk forwards!"
      },
      "hostile_near": {
        "any": [
          "That guy over there looks poorly! He's all groany and wobbly! Somebody get him a blanket!",
          "Something's making scary noises! Is it my tummy? No! It's got arms!"
        ],
        "lo": "Is that monster your friend? It's coming to say hi! It doesn't look like it's saying hi!",
        "hi": "A monster, {player}! I'll protect you! I'll stand behind you and yell! That's the plan! AAAH! See?"
      },
      "creeper_near": {
        "any": [
          "A green one with a frowny face! It's walking over! It wants a hug! It's going hisss!",
          "Look! A bush with legs! It's got no arms. How does it suck its thumb? Poor thing!"
        ],
        "lo": "That green fellow keeps coming closer to us! He's shy. He's not saying anything. Just ssss!",
        "hi": "{player}! The frowny green one is right there! I don't like its face! Yours is better!"
      },
      "villager_near": {
        "any": [
          "These people all go hmm! Hmm! Hmmm! I'm talking to them! I'm fluent!",
          "Big noses! Folded arms! I folded mine too. Now I can't reach my thumb. Help."
        ],
        "lo": "Are you one of the hmm people? You don't have the nose. You're something else!",
        "hi": "I tried to swap my shoe for a hat, {player}. He said hmm. That means yes! He walked away. That means no!"
      },
      "pet_near": {
        "any": [
          "A fluffy one! It's yours! It's licking my hand! We're doing drool swaps!",
          "Your pet sat down, so I sat down too. Now we're both waiting for a treat."
        ],
        "lo": "Is this your animal? Is it a monkey? It's not a monkey. Good! Bad! Hello, animal!",
        "hi": "Your pet likes me, {player}! It sniffed my shoe and sneezed! That's a kiss in pet! I think!"
      },
      "farm_animal_near": {
        "any": [
          "A cow looked at me and kept chewing! I chewed back! We had lunch together. Mine was air!",
          "Chickens! They walk like me! Bock bock! One of them's the boss. I can't tell which."
        ],
        "lo": "Are these your sheep? They're all wearing the same jumper! Hee hee!",
        "hi": "I counted the pigs, {player}! There's pink ones! That's the number! Pink!"
      },
      "zoo_animal_near": {
        "any": [
          "It's the {species}! Hi, {species}! It's not waving. Maybe it hasn't got the right hands!",
          "Is the {species} a kind of monkey? I can't tell! I'm happy and nervous just in case!"
        ],
        "lo": "That {species} is looking at you! Or me! My eyes go both ways, so it's both of us!",
        "hi": "{player}, I told the {species} you're my best friend. It didn't say anything. It's jealous!"
      },
      "guests_crowd": {
        "any": [
          "So many people! I said hi to all of them! I'm on the second lap now!",
          "Everybody's walking! I'm standing! They go round me like I'm a rock! I'm a rock! Hee hee!"
        ],
        "lo": "Are you with these people? There's so many! Which one are you? Oh, the close one!",
        "hi": "I lost you in the crowd, {player}! For a whole second! Then I found you! You were in front of my face!"
      },
      "residents_crowd": {
        "any": [
          "All the neighbours are here! Is it a party? Is it my birthday? Nobody tell me! Surprise me!",
          "I know everybody here! That's what's-her-name, and him, and the other him!"
        ],
        "lo": "Everybody came! And you! Are you a neighbour too? Which door? I only know mine! Sometimes!",
        "hi": "Lots of neighbours here, {player}, but you're the one I'm standing next to! On purpose! My feet picked you!"
      },
      "other_resident": {
        "any": [
          "That's {other}! Hi, {other}! I shouted it but I'm right here. Hi again, quieter!",
          "{other} is my neighbour! Or I'm {other}'s neighbour! It can't be both. Can it?"
        ],
        "lo": "Do you know {other}? I know {other}! I don't know you! Now somebody introduce somebody!",
        "hi": "{other} told me a secret, {player}! I forgot it right away. That's how you keep a secret!"
      },
      "other_player": {
        "any": [
          "Two of you! There's a {other} now! Did you split in half? Hee hee!",
          "Hi, {other}! You look like a person too! There's a lot of that going round!"
        ],
        "lo": "I don't know you and I don't know {other}! That's two new friends! Or zero! Two!",
        "hi": "{player}, is {other} your friend? Then {other} is my friend's friend! So I'm the... uncle? I got lost."
      },
      "alone_night": {
        "any": [
          "It's quiet! Nobody's here! Just you and me and my thumb. That's three! A crowd!",
          "Shh. Listen. Nothing! I love nothing. It's my favourite night sound."
        ],
        "lo": "It's dark and it's only us! Tell me your name again. I'll hold on to it this time. With both hands!",
        "hi": "When it's just us at night, {player}, I don't laugh so much. I just feel nice. Hee. See? Only one hee."
      },
      "by_water": {
        "any": [
          "Water! I can see a guy in there! He's got my hair! He's copying me! Stop it!",
          "Splish! I put my thumb in to see if it floats. It's still attached, so I can't tell!"
        ],
        "lo": "Can you swim? I can! I can't. I can stand in it though! That's slow swimming!",
        "hi": "The water guy is waving at you too, {player}! Oh, there's two water guys now. One's you! Hee hee!"
      },
      "by_lava": {
        "any": [
          "Ooh, hot soup! Big glowing soup! It's too hot. I'll let it cool down. I'll wait all day!",
          "The orange stuff goes blub blub! I go blub blub! We're talking! It's saying ouch!"
        ],
        "lo": "That's the hot stuff! I don't think it's for touching. You look like you'd know!",
        "hi": "I'm not going near the hot glowy stuff, {player}! See? I'm being smart! Aloof was smart one time!"
      },
      "by_flowers": {
        "any": [
          "Flowers! I smelled one too hard and now it's in my nose. Achoo! It's out!",
          "Red ones! Yellow ones! A bee! The bee's not a flower. It told me so!"
        ],
        "lo": "Do you like flowers? I ate one once. I'm not saying which. It was the yellow.",
        "hi": "I wanted to pick you a flower, {player}! Then I sneezed on all of them. So they're all yours! From here!"
      },
      "by_fire": {
        "any": [
          "Fire! It's dancing! It's got no legs and it's still better than me!",
          "Warm warm warm! My front is hot and my back is cold. I'm two weathers!"
        ],
        "lo": "Did you make the fire? You're clever! I made a puddle once. Different thing!",
        "hi": "I'd like a fire story, {player}! One with no books in it! And no bunnies! And a thumb wins!"
      },
      "by_crops": {
        "any": [
          "Plants in a line! They're queueing! What are they waiting for? Rain! I bet it's rain!",
          "Somebody buried all the food! In the dirt! Hee hee! I can see the tops poking out!"
        ],
        "lo": "Is this your garden? I didn't step on anything! I stepped on one thing. It's fine. It's flat now.",
        "hi": "I talked to the crops, {player}. They waved back! The wind helped. The wind's on my side!"
      },
      "by_books": {
        "any": [
          "Books! So many! They're all shut. Good! Keep them shut! The words stay in!",
          "Eww, shelves of learning! My head's itchy just standing here. Scratch scratch!"
        ],
        "lo": "You're not going to read to me, are you? You've got a reading face! Put it away!",
        "hi": "For you I'd look at one book, {player}. The outside. With one eye. That's my best offer!"
      },
      "in_snow": {
        "any": [
          "Snow! I'm standing in a cloud that fell down! It's cold and crunchy! Crunch!",
          "I stuck my tongue out and a snowflake landed on it! It's gone! I ate the sky!"
        ],
        "lo": "You're white on top! Is that your hair now? Oh, it's snow! I've got some too!",
        "hi": "I made a snow you, {player}! It's that lump! It's a good lump! It's got your nice face. Sort of. No face."
      },
      "holding_gift": {
        "any": [
          "Ooh! What's that? {item}! I like that one! I think! My hands are getting excited!",
          "You've got {item}! I had one of those in a dream! Or I was one! It was a good dream!"
        ],
        "lo": "Is that {item} for somebody? Lucky somebody! I'm not looking at it! I'm looking a little!",
        "hi": "{player} has {item}! My favourite person and my favourite thing in one spot! I can't blink!"
      },
      "holding_weapon": {
        "any": [
          "That's a {item}! It's pointy! Or bonky! One of the two! I'm standing over here!",
          "Whoa! A {item}! Are we fighting? Who? Not me! I'm on your team! Which team?"
        ],
        "lo": "You've got a {item} and I've got a thumb. So you win. Hi!",
        "hi": "With your {item} nobody can get us, {player}! Not even bunnies! You'd just shoo them. Nicely. From far away."
      },
      "holding_food": {
        "any": [
          "Food! You've got {item}! My tummy just said a word! It said gurgle!",
          "Is that {item}? It smells like yum! I'm drooling! I was already drooling. More now!"
        ],
        "lo": "I don't know you, but I know {item}! We've met! In my mouth! Hee hee!",
        "hi": "Are we sharing the {item}, {player}? No? That's okay! I'll watch you eat it. Really close."
      },
      "holding_rod": {
        "any": [
          "A stick with a string! Are you flying a tiny kite? It fell down. It's in the water!",
          "Fishing! You dangle it and the fish bites it. Why? I'd bite it too. Never mind!"
        ],
        "lo": "Is that a fishing rod? Are you a fish catcher? Do the fish know? I won't tell them!",
        "hi": "I hope you catch a big one, {player}! Or a small one! Or a boot! I like boots! I've got two already!"
      },
      "holding_tool": {
        "any": [
          "A {item}! You're going to do digging! Or poking! I love watching work. From far away!",
          "That {item} looks heavy! Can I hold it? No! Good answer! I'd drop it on my toe!"
        ],
        "lo": "You have a {item}, so you must be a grown up! I'm a grown up too! Somebody told me!",
        "hi": "If you make a hole with your {item}, {player}, can I sit in it? Holes are chairs for your whole body!"
      },
      "armored": {
        "any": [
          "You're shiny all over! Like a spoon! A big walking spoon! Hee hee!",
          "Knock knock! I knocked on your armour. It went bonk! Who's in there?"
        ],
        "lo": "A person in a shell! Are you a robot? Say something robot! Beep? No? Okay!",
        "hi": "Is that you in all that armour, {player}? I can tell by the eyes! And the walking! Nobody can bonk my friend now!"
      },
      "hurt": {
        "any": [
          "You've got ouchies! A lot of ouchies! That's not good! Even I know that!",
          "Uh oh. You look all bent and wobbly. I'm not laughing. See? No laughing."
        ],
        "lo": "Are you okay? You don't look okay! I don't know you but I don't like this!",
        "hi": "{player}, you're hurt! I stopped laughing. I never stop! Please be okay. You can have my thumb. For a minute."
      },
      "wet": {
        "any": [
          "You're all drippy! Did the sky drool on you? Or did you go in the big puddle?",
          "Squish squish! Your shoes are talking! What are they saying? Squish! Good point!"
        ],
        "lo": "You're soaking! I'm usually the wet one! On the chin mostly. You did the whole body. Wow!",
        "hi": "You're soggy, {player}! Like me! We're twins now! I'm the drier twin for once!"
      },
      "sneaking": {
        "any": [
          "You got shorter! Where did your legs go? Oh, they folded!",
          "Why are you all scrunched down? Are you hiding? I'll hide too! I'm hiding right here! Standing up!"
        ],
        "lo": "Are you a small person now? You were bigger a second ago! I think! I only just met you!",
        "hi": "Shh! {player} is sneaking! I won't tell anybody! WHO WANTS TO KNOW A SECRET? Nobody! Good!"
      },
      "long_time": {
        "any": [
          "You were gone! For so long! Or one day! I don't have a calendar. I have a thumb.",
          "Hey! You're back! I thought you turned into somebody else! You didn't! Same head!"
        ],
        "lo": "Have we met? We have! Ages ago! You were newer then!",
        "hi": "{player}! I missed you! I kept talking to a fence post and calling it you! It was a bad listener!"
      },
      "first_today": {
        "any": [
          "Hello! It's today! And you're in it! Today's going great so far!",
          "First hi of the day! I've been saving it! It's a bit drooly from waiting!"
        ],
        "lo": "Oh! A person! Hi, person! I think I've seen your face before. Around the front of your head!",
        "hi": "There's my {player}! I woke up and thought, who do I want to see today? And I forgot! But it was you!"
      },
      "zoo_busy": {
        "any": [
          "The zoo is full! People, people, people! I got stuck in a queue. I don't know what for!",
          "So many guests today! I held a hand in the crowd. It wasn't a hand I knew. Sorry, hand!"
        ],
        "lo": "Did you invite all these people? You must have so many friends! I have a thumb and a half!",
        "hi": "Everybody came to your zoo, {player}! I told them I know you! They said who? I said THAT ONE!"
      },
      "zoo_empty": {
        "any": [
          "Where is everybody? I've got the whole zoo! I'm the only guest! I'm the best guest!",
          "No people today! I shouted hello and only an animal looked. It was polite about it."
        ],
        "lo": "No guests anywhere! Just you and me! Are you everybody? You must be tired!",
        "hi": "No guests, {player}? Don't be sad! I'll be all of them! Ooh! Aah! Look at that! I can do more!"
      },
      "zoo_closed": {
        "any": [
          "The zoo gate's shut! I pushed it. Then I pulled it. Then I said please. It's a tough gate!",
          "Closed! The animals are having a day off! What do they do? More standing, I bet!"
        ],
        "lo": "Is the zoo asleep? Did you put it to bed? Shh! I'll tiptoe! I can't tiptoe!",
        "hi": "It's closed but you're here, {player}, so it's still the best zoo! I'll look at you instead! Do a trick!"
      },
      "litter_bad": {
        "any": [
          "The ground's got stuff on it! Cups and papers! I stepped in something. It's my shoe's now!",
          "Somebody dropped their rubbish everywhere! I picked one up. I put it down again. I helped!"
        ],
        "lo": "Is the path supposed to be this messy? It looks like my house! Hee hee!",
        "hi": "There's rubbish all over, {player}. I found a wrapper with nothing in it! Saddest thing ever. I cried. I'm okay."
      },
      "stars_high": {
        "any": [
          "Everybody says the zoo is the best! Lots of stars! I counted them. I got to three, then yay!",
          "People keep saying wow at this zoo! I say wow too! I started it! I think!"
        ],
        "lo": "Your zoo's famous! Are you famous? Can I touch your sleeve? I touched it! Hee hee!",
        "hi": "The zoo's got so many stars, {player}! You did that! I helped! I stood near things! Team!"
      },
      "stars_low": {
        "any": [
          "People are grumpy at the zoo! They said not many stars. Stars are at night! Silly people!",
          "Somebody said the zoo's bad. I said YOU'RE bad! Then I said sorry. Then I ran."
        ],
        "lo": "The zoo's got a sad score? Did it do its homework? I never do. Don't make it read!",
        "hi": "They gave your zoo a little number, {player}. Little numbers are cute! I like it the same! I like it more!"
      },
      "coins_low": {
        "any": [
          "No more Zoo Coins? Did somebody look under the bed? That's where my things go!",
          "The coins ran out! Where do coins run to? They don't have legs! Mystery!"
        ],
        "lo": "You've got no money? I've got no money! We're the same! High five! I missed!",
        "hi": "Don't worry about coins, {player}! You've still got me! I'm worth nothing! Wait. I'm free! That's better!"
      },
      "animal_sick": {
        "any": [
          "One of the animals has a tummy ache! Or a head ache! It's got an ache somewhere! Poor guy.",
          "There's a sad animal today. I made funny faces at it. It didn't laugh. That's how I know it's poorly."
        ],
        "lo": "Somebody in the zoo isn't feeling good. Are you the fixing person? You look like the fixing person!",
        "hi": "An animal's sick, {player}. I don't feel like laughing. You'll make it better. You always make stuff better."
      }
    },
    "near": {
      "carrot": [
        "That's Carrot! She's dressed as a giant bunny! Is she one? The ears! They're listening!",
        "Carrot is nice to me, {player}. But she's bunny shaped! My feelings are having a fight!"
      ],
      "tim": [
        "Tim reads books ON PURPOSE! All day! And he's green! I think the books did that!",
        "Tim tried to tell me about a story once. I put my thumbs in my ears. I can't suck them in there. Worth it!"
      ],
      "carrie": [
        "Carrie! She knows where my house is! I don't! She's like a map with a nice coat!",
        "When I'm lost, Carrie finds me, {player}! I'm lost a lot! I see her every day! Hee hee!"
      ]
    }
  },
  "guido": {
    "intro": "The name's Guido. Bow collector, night hours, sharp suit. That's the whole story. Anything else you hear about me is a rumour, and I know who started it.",
    "scenes": {
      "home_morning": {
        "any": [
          "You're at my door in the morning? I just got in. The suit's still on and the eyes are closing.",
          "Morning's when I hang up the jacket and count the bows. Twice. A man likes to be sure."
        ],
        "lo": "Who knocks at this hour? Honest people, that's who. Makes me nervous. What do you need?",
        "hi": "For you I'll stay up ten more minutes, {player}. Anybody else, the door stays shut and the curtains too."
      },
      "home_evening": {
        "any": [
          "Evening. I'm picking a tie. A night's work starts with the right tie.",
          "Shoes shined, hair slick, bows polished. In a minute I walk out that door looking like a million Zoo Coins."
        ],
        "lo": "You caught me getting ready for work. Bow work. Stand over there, away from the cupboard.",
        "hi": "Tell me the truth, {player}. The grey jacket or the black? You, I trust. My mirror flatters me too much."
      },
      "walking_to_zoo": {
        "any": [
          "I'm headed to the zoo. Strictly as a visitor. A man can like animals. It's allowed.",
          "Nice path to the zoo. Well lit. A little too well lit, if you ask me."
        ],
        "lo": "We're walking the same way? Coincidence. I love coincidences. I never trust them, but I love them.",
        "hi": "You and me on the same path, {player}. People see that, your reputation goes up. Mine too, a little."
      },
      "at_zoo": {
        "any": [
          "I'm just here looking at exhibits. Like a tourist. A very well-dressed tourist.",
          "I like the zoo. Everybody stares at the animals. Nobody stares at me. Refreshing."
        ],
        "lo": "You run this place? Good fences. I notice fences. Professional interest. In bows. Never mind.",
        "hi": "Between us, {player}, I come for the quiet. I stand by a rail and nobody needs anything from me. Beautiful."
      },
      "walking_home": {
        "any": [
          "Heading home from the zoo. My shoes have had enough gravel for one day.",
          "I saw the animals, I told three jokes, nobody complained. That's a full outing. Home."
        ],
        "lo": "I'm going home. Alone. That's not a hint, it's a schedule.",
        "hi": "Long day, {player}. Home, a slice, feet up. If the walk was any longer I'd ask you to carry the conversation."
      },
      "at_work": {
        "any": [
          "I'm working. See this bow? I'm appraising it. That's all that's happening here. Appraising.",
          "Busy night. Three bows to polish and a ledger that doesn't add up. It never adds up. That's the system."
        ],
        "lo": "I'm in the middle of something. It's bows. If anyone asks what you saw, you saw bows.",
        "hi": "You get to watch a professional, {player}. This string, this curve, that's art. The other paperwork you didn't see."
      },
      "following": {
        "any": [
          "I'm walking with you. In daylight. You know what the sun does to a man who works nights?",
          "This adventure of yours better not involve mud. These shoes cost more than the mud's worth."
        ],
        "lo": "I'm coming along, but understand, I'm not behind you. I'm supervising from the rear.",
        "hi": "I'm losing sleep for this, {player}. For you, I lose sleep. Remember that. Don't write it down."
      },
      "following_night": {
        "any": [
          "Night-time, strange road, no witnesses. Finally, we're keeping my kind of hours.",
          "Dark out here. Good. I do my best thinking when nobody can see my face."
        ],
        "lo": "You, me, the middle of the night, far from home. One of us is very trusting. It's not me.",
        "hi": "Out late with you, {player}. Feels like the old days. There were no old days. But it feels like them."
      },
      "staying": {
        "any": [
          "I'm waiting. Leaning on something, arms crossed. I make waiting look like a decision.",
          "Standing around is a skill. In my business you learn to do it for hours. My bow business."
        ],
        "lo": "You want me to wait here? Fine. But I don't hold doors and I don't hold bags.",
        "hi": "For you I'll stand here, {player}. Anybody else leaves me on a corner, we have words. Take your time. Not too much."
      },
      "rain": {
        "any": [
          "It's raining on the slick-back. You know how long this hair takes? Longer than the rain.",
          "Every drop of this rain is aimed at my shoes. I'm taking it personally."
        ],
        "lo": "You're standing in the rain talking to a stranger. Either you're tough or you're selling something.",
        "hi": "There's room under here for you, {player}. A friend of mine doesn't stand around dripping. Looks bad for both of us."
      },
      "thunder": {
        "any": [
          "That thunder? Relax. That's just the sky making a point. I do the same thing, quieter.",
          "Lightning like that, everybody sees everything for a second. I don't love it."
        ],
        "lo": "Loud storm. You jumped. I didn't. I never jump. I flinched stylishly.",
        "hi": "Thunder like this, {player}, I check on the bows. Then I think, who else do I check on? That's you."
      },
      "full_moon": {
        "any": [
          "Full moon. Bright as a lantern. Bad night for discretion, good night for showing off the suit.",
          "Look at that moon. Round, golden, perfect. Reminds me of a pizza. Everything does."
        ],
        "lo": "Moon's so bright I can see exactly who I'm talking to. I'm still deciding how I feel about that.",
        "hi": "What did the full moon say to the bow collector, {player}? Nothing. It minds its own business. That's why we get along."
      },
      "dark_moon": {
        "any": [
          "No moon tonight. Can't see a thing. I call that ideal working conditions.",
          "Pitch black. A man could carry a crate down the street tonight and nobody'd ask. A crate of bows."
        ],
        "lo": "Dark night to be out chatting. You didn't see me and I didn't see you. Mostly because we can't.",
        "hi": "Moonless nights I do my best work, {player}. You, I'd let hold the lantern. That's the top job. Don't laugh."
      },
      "dawn": {
        "any": [
          "There's the sunrise. That's my closing bell. Everything I did tonight, I did before that.",
          "Sun's coming up. Pretty. I'd enjoy it more if my eyes were still open."
        ],
        "lo": "Dawn. You're starting your day, I'm finishing mine. Let's not get in each other's way.",
        "hi": "You know what I like about sunrise, {player}? Nothing. But watching one with you, it's almost tolerable."
      },
      "dusk": {
        "any": [
          "Sunset. That's my alarm clock. The sky goes orange, Guido goes to work.",
          "There it goes. The day people go in, the night people come out. I'm the best dressed of the night people."
        ],
        "lo": "Getting dark. You'll want to be on your way. I've got appointments. With bows.",
        "hi": "Sun's down, {player}. This is my hour. Now you see me at my best. I'm always at my best. Now it's official."
      },
      "nether": {
        "any": [
          "It's hot, it's red, and everything down here wants to shake you down. I've seen better-run operations.",
          "You smell that? Smoke and scorched rock. Like a pizza oven with no pizza. A tragedy."
        ],
        "lo": "You brought me to the Nether. Me. In a wool suit. We hardly know each other and already I'm sweating.",
        "hi": "I don't go places like this for anybody, {player}. For you, I'm melting in my good shoes. Remember that."
      },
      "the_end": {
        "any": [
          "A black sky, pale rock, tall quiet guys who don't like eye contact. Feels like a family meeting.",
          "Nothing underneath us but the void. I know people who'd pay good money for a place this private."
        ],
        "lo": "You walk a man you barely know to the edge of nothing. I'd be worried, if I were the worrying type.",
        "hi": "You're too near that edge for my taste, {player}. I've lost bows. I can get more bows. You, I only got the one."
      },
      "fishing_sky": {
        "any": [
          "Islands in the sky with fishing holes. Whoever set this up, they've got connections.",
          "It's a long way down from these islands. I looked once. Once is enough for a man in good shoes."
        ],
        "lo": "Fishing in the clouds. What's the angle? There's always an angle. Besides the rod.",
        "hi": "Up here nobody can find me, {player}. No associates, no ledgers. Just you, me and some very confused fish."
      },
      "acufend": {
        "any": [
          "A little round moon, a jungle, and creatures playing music all night. Finally, somebody else works late.",
          "These music creatures never stop. No breaks, no complaints. That's discipline. I respect it."
        ],
        "lo": "Odd place. Everything's singing. Where I come from, singing is the last thing you want anybody doing.",
        "hi": "Don't spread this around, {player}, but I was humming along with those creatures. A man can hum."
      },
      "cave": {
        "any": [
          "A cave. Dark, quiet, one way in. I couldn't have designed a better meeting room.",
          "Dust on my cuffs, drips on my collar. This cave owes me a cleaning bill."
        ],
        "lo": "You take a lot of strangers underground? Asking as a man who's wondering how this looks.",
        "hi": "Deep down here, {player}, nobody hears a thing. So I'll say it: you're good company. It stays in the cave."
      },
      "high_up": {
        "any": [
          "Look at everybody down there. Little dots. From up here, I'm the tall guy for once.",
          "Nice view. You can see who's coming from every direction. I like that in a view."
        ],
        "lo": "High places make people honest. So tell me, what do you really want from a bow collector?",
        "hi": "Top of the world, {player}. This is where I always figured I belonged. Good of you to finally bring me."
      },
      "hostile_near": {
        "any": [
          "There's a monster over there acting like a tough guy. Groaning, lurching. No class at all.",
          "Something ugly's headed our way. It didn't make an appointment."
        ],
        "lo": "A monster. Close. I'd handle it, but this is a clean suit and you've got the look of a volunteer.",
        "hi": "That monster's coming for you, {player}? Then it's got a problem with me. I'll stand behind you and say so."
      },
      "creeper_near": {
        "any": [
          "A creeper. Walks up without a word, then boom. No joke first, no nothing. Amateur.",
          "See the green guy? Quiet type. Short fuse. I've done business with worse. Not much worse."
        ],
        "lo": "That creeper's getting close. I'm stepping back. A disciplined man knows when a meeting's over.",
        "hi": "{player}. Creeper. Right there. I only say it once because my heart can't take saying it twice."
      },
      "villager_near": {
        "any": [
          "Villagers. Trading all day, out in the open, everything above board. Makes my skin crawl.",
          "Look at them, arms folded, saying hmm. Tough negotiators. I folded first once. Never again."
        ],
        "lo": "Nice honest village. If anyone here asks, I'm with you, and it's a bow hobby.",
        "hi": "One of them offered me a deal with a straight face, {player}. No wink, no nothing. How do people live like this?"
      },
      "pet_near": {
        "any": [
          "That's your animal? Loyal. Quiet. Stays close. I've got associates I can't say that about.",
          "Your pet's sniffing my trouser leg. Easy, pal. That's good cloth."
        ],
        "lo": "Your pet doesn't trust me. Smart. Tell it I'm a collector. Tell it slowly.",
        "hi": "Your pet likes me now, {player}. See? Anybody that's with you is with me. Even the furry ones."
      },
      "farm_animal_near": {
        "any": [
          "Cows. You know what starts with a cow? Mozzarella. Show a little respect.",
          "Chickens, pigs, sheep, all standing around in the dirt. Honest living. Gives me the shivers."
        ],
        "lo": "I don't do farms. The smell gets in the suit. I'll admire the livestock from upwind.",
        "hi": "Why did the chicken cross the road, {player}? Somebody asked it to. Nicely. That's my version."
      },
      "zoo_animal_near": {
        "any": [
          "The {species} keeps looking at me. Calm. Steady. Either it likes the suit or it knows something.",
          "I told the {species} a joke. Nothing. Tough crowd. I've had tougher."
        ],
        "lo": "Nice {species} you've got. Be a shame if it didn't get admired enough. I'm admiring it. Relax.",
        "hi": "I'll be straight with you, {player}. I've got a soft spot for the {species}. It never asked me one question."
      },
      "guests_crowd": {
        "any": [
          "Big crowd of guests. Good. A man disappears in a crowd. Not completely. Look at the suit.",
          "All these visitors, paying at the gate. In public. Out in the open. Incredible."
        ],
        "lo": "Lot of people around. Lot of ears. Let's keep this conversation about the weather.",
        "hi": "Look at them all, {player}. You pulled this crowd. If you were in my business you'd be dangerous. My business is bows."
      },
      "residents_crowd": {
        "any": [
          "The whole neighbourhood's here. I know every face. A few of them know mine a little too well.",
          "Neighbours everywhere. Smile, wave, say nothing. That's how you get along on a street like ours."
        ],
        "lo": "You know all these people? Good for you. I know what they had for dinner. Collector's instinct.",
        "hi": "Plenty of neighbours standing around, {player}, and you come talk to me. You've got taste. I always said so."
      },
      "other_resident": {
        "any": [
          "That's {other}. Good neighbour. Never asks what's in the crate. That's all I want in a neighbour.",
          "You know {other}? I told {other} my best joke last week. Still waiting on the laugh."
        ],
        "lo": "{other}'s right there, so let's keep it friendly. Whatever {other} told you about me, half is wrong.",
        "hi": "Between us, {player}, {other} is all right by me. I keep a list. {other} is on the good page, under you."
      },
      "other_player": {
        "any": [
          "Who's this, {other}? New face. I like to know the faces. Hello, face.",
          "{other}, is it? Do you like bows, {other}? Everybody likes bows. That's all there is to know about me."
        ],
        "lo": "Two of you now. You and {other}. I'm outnumbered and I barely know either one. I'll be charming.",
        "hi": "You vouch for {other}, {player}? Then {other} eats at my table. Figure of speech. Nobody touches my pizza."
      },
      "alone_night": {
        "any": [
          "Nobody around. Quiet street, dark sky. This is when I hear myself think. I'm very good company.",
          "Just us out here tonight. No ears, no eyes. I could tell you anything. I'm not going to."
        ],
        "lo": "Alone at night with someone I just met. Usually I'm the one who arranges that.",
        "hi": "Nobody listening, {player}, so here it is. Some nights the collection's not enough company. You help. That's all."
      },
      "by_water": {
        "any": [
          "Water. Deep, dark, keeps what you give it. I'm talking about wishing coins. Obviously.",
          "I don't get near the edge. Wet leather shoes are a tragedy you never recover from."
        ],
        "lo": "Nice spot by the water. Private. You pick places like a professional. What do you do again?",
        "hi": "My grandfather said never do business by a river, {player}. Too easy to lose things. He lost three hats that way. Hats."
      },
      "by_lava": {
        "any": [
          "Lava. All that heat going to waste. You could bake a thousand pizzas on that. Bad ones.",
          "I'm keeping back. This suit and open lava, they don't belong in the same sentence."
        ],
        "lo": "Standing near lava with a stranger. I've heard how those stories go. I'm staying on this side of you.",
        "hi": "You're a little close to that lava, {player}. You get singed, who laughs at my jokes? Nobody. That's who."
      },
      "by_flowers": {
        "any": [
          "Flowers. I'd take one for the lapel, but then every guy on the street copies me.",
          "Nice flowers. Somebody always sends flowers. I prefer when it's for a happy reason."
        ],
        "lo": "You brought me to a flower patch. Either you're friendly or this is a very gentle warning.",
        "hi": "If I wore a flower in my buttonhole, {player}, I'd let you choose it. You've got an eye. The red, right? Always the red."
      },
      "by_fire": {
        "any": [
          "A fire. You know what that's missing? A stone shelf and some dough. I'd settle for fries.",
          "Good fire. Warm hands, no paperwork. Whatever goes in there, nobody reads it after."
        ],
        "lo": "Pull up to the fire if you want. But smoke on this jacket, and we have a conversation.",
        "hi": "Fire, night air, good company, {player}. All I need is a slice and I'd retire right here. I'm not retiring."
      },
      "by_crops": {
        "any": [
          "Crops. I see a field, I think flour, I think dough. That's the only farming I care about.",
          "Somebody gets up at dawn to grow all this. At dawn. That's when decent people go to bed."
        ],
        "lo": "You farm? Honest work. I've heard about it. People seem to like it.",
        "hi": "I look at a field like this, {player}, and I see crust. Miles of crust. You see crops. That's why we need each other."
      },
      "by_books": {
        "any": [
          "Books. I keep one book. It's got names and numbers in it. It's a bow catalogue.",
          "All these shelves. You know what's never in a book? The good stuff. The good stuff you remember."
        ],
        "lo": "A reader, huh? Then you know how to keep quiet in a library. I like that in a person.",
        "hi": "If I ever write my story, {player}, you get a whole chapter. Then I burn the book. Nothing personal."
      },
      "in_snow": {
        "any": [
          "Snow. On leather shoes. Somebody up there has a problem with me.",
          "Everything's white. A man in a black suit stands out like an olive on a plain pie. I hate standing out."
        ],
        "lo": "Cold enough for you? I don't shiver. That's my teeth making small talk.",
        "hi": "You leave tracks in snow, {player}. Everybody knows where you've been. Tonight I don't mind. I've been with you."
      },
      "holding_gift": {
        "any": [
          "Hold on. Is that {item}? Now you've got my full attention. That doesn't come cheap.",
          "That {item} you're holding. Very nice. Very, very nice. I'm just saying what I see."
        ],
        "lo": "I notice you've got {item}. I notice things. I'm not asking. A gentleman never asks.",
        "hi": "{player}, you walk up to me holding {item}? You know me too well. It's almost a problem."
      },
      "holding_weapon": {
        "any": [
          "A {item}, huh? Easy, tough guy, I'm kidding. Carry what you like. Just don't act tough.",
          "That's a decent {item}. Not a collector's piece. But decent."
        ],
        "lo": "You came to talk to me holding a {item}. Where I'm from that's a whole message. I'm choosing to ignore it.",
        "hi": "I like you with that {item}, {player}. You carry it quiet. No swagger. That's how you can tell it's serious."
      },
      "holding_food": {
        "any": [
          "What is that, {item}? Is it pizza? If it's not pizza, I've got questions.",
          "You're eating {item} standing up, in the street. No plate, no napkin. We've got to talk."
        ],
        "lo": "I see the {item}. I'm not judging. I'm judging a little. It's what I do.",
        "hi": "{item}, {player}? You deserve better. You deserve a real pie, thin crust, hot. I worry about you."
      },
      "holding_rod": {
        "any": [
          "Fishing rod. A string, a hook, a lot of patience. It's like a bow that gave up.",
          "You fish? Good, quiet hobby. Nobody ever got in trouble sitting by a pond. Almost nobody."
        ],
        "lo": "Going fishing? I know a guy who sleeps with the fishes. He's got a houseboat. Lovely place.",
        "hi": "Why don't fish do business, {player}? They hate getting hooked. Come on. That's my best one tonight."
      },
      "holding_tool": {
        "any": [
          "A {item}. You're going to do manual labour? In front of me? I'll watch. I'm good at watching.",
          "Nice {item}. Honest tool for an honest job. I get dizzy just looking at it."
        ],
        "lo": "You work with that {item}? Good to know. A man sometimes needs a hole dug. For planting. Trees.",
        "hi": "Look at you with the {item}, {player}. Hard worker. My hands stay clean and you're still my favourite. Figure that out."
      },
      "armored": {
        "any": [
          "Full armour. Clank, clank. Very subtle. I can hear you coming from last week.",
          "All that armour, and not one pocket square. What's the point of dressing up?"
        ],
        "lo": "You're armoured head to toe. Expecting trouble, or dressing like a tough guy? I don't like tough guys.",
        "hi": "On you the armour works, {player}. You're not a tough guy, you're just hard to dent. There's a difference."
      },
      "hurt": {
        "any": [
          "You look terrible. I say that with respect. Who did this? I just want to know the name.",
          "Whoa. You're limping, you're pale, you're a mess. That's the kind of thing people notice."
        ],
        "lo": "You're hurt bad, friend. I don't know you well, but I know that's not how a person should look.",
        "hi": "{player}. Who did this to you? No jokes, I'm not joking. Nobody does this to my people."
      },
      "wet": {
        "any": [
          "You're dripping. On the ground near my shoes. One step that way would be appreciated.",
          "Soaked through. What happened, you lose an argument with a pond?"
        ],
        "lo": "Wet clothes. No towel. You came to see me like this? I'm flattered and a little offended.",
        "hi": "Look at you, {player}, like a dropped sponge. I'd lend you my jacket, but no. I like you, not that much."
      },
      "sneaking": {
        "any": [
          "You're sneaking. Low, quiet, eyes up. Not bad. Who taught you? Don't tell me.",
          "Why are we crouching? Who are we avoiding? I'm not crouching. These trousers don't crouch."
        ],
        "lo": "You creep up on a man like me, you'd better have a good reason. Or a good joke.",
        "hi": "Now that's how you walk into a room, {player}. Nobody hears you. I could use somebody like you. For bows."
      },
      "long_time": {
        "any": [
          "Look who it is. Days go by, not a word. I thought maybe you'd skipped town.",
          "Where've you been? I'm not asking. I had someone ask around. That someone was me."
        ],
        "lo": "It's been a while. I almost forgot the face. I never forget a face. I almost did.",
        "hi": "Days, {player}. Days. I told a joke to an empty room. It laughed more than you do, but it's not the same."
      },
      "first_today": {
        "any": [
          "There you are. First time today. I was starting to think you had better things to do.",
          "Hey. Good timing. I just thought of a joke and I need somebody to waste it on."
        ],
        "lo": "Hello to you. First words of the day and you spend them on me. Smart. What's on your mind?",
        "hi": "There's my favourite person. Don't look behind you, {player}, I mean you. First smile of my day. Don't tell the bows."
      },
      "zoo_busy": {
        "any": [
          "The zoo's packed. Wall to wall guests. You know how many came through that gate? I do. I counted.",
          "Busy. Lines everywhere. Good. Busy places make money, and I like being near money."
        ],
        "lo": "Lot of customers. You're doing something right. Or something wrong, very well.",
        "hi": "Full house, {player}. I'm proud of you. All this, and every coin on the books. I couldn't do it."
      },
      "zoo_empty": {
        "any": [
          "Open gates, no guests. Not one. I've seen fronts with more foot traffic. Not that I know any fronts.",
          "Empty zoo. You could hear a coin drop. If there were a coin."
        ],
        "lo": "Nobody here but us. Slow day, or is this place something else on the side? Kidding. Am I?",
        "hi": "No guests today, {player}. Don't sweat it. Every business has a quiet night. Even mine. Especially mine."
      },
      "zoo_closed": {
        "any": [
          "Closed. Gate's locked, guests gone. Now it looks like my kind of establishment.",
          "The zoo's shut. No guests, no noise. Just the animals and whoever's got a key."
        ],
        "lo": "Closed, huh? I like a business that knows when to pull the shutters. Shows discipline.",
        "hi": "You shut the doors, {player}? Good. A boss decides when it's open. Never let the customers decide."
      },
      "litter_bad": {
        "any": [
          "Garbage all over the paths. I nearly stepped in a wrapper. In these shoes. Somebody answers for that.",
          "This litter. Sloppy. You leave a mess, people start asking who's in charge."
        ],
        "lo": "The place is filthy, friend. I'm only saying. A clean front keeps the questions away.",
        "hi": "I say this with love, {player}. The paths look like the floor after a bad party. You run a tighter ship than this."
      },
      "stars_high": {
        "any": [
          "Top rating. Everybody's talking about this zoo. Respectable, popular, no questions. That's the dream.",
          "All those stars. You know who else has a spotless reputation? Me. Ask anybody."
        ],
        "lo": "A well-rated zoo. Classy. I like standing next to classy. It rubs off.",
        "hi": "Best zoo around, {player}, and I knew you back when. I tell people that. Quietly. In a low voice."
      },
      "stars_low": {
        "any": [
          "The rating's down in the dirt. People talk, you know. I hear them. I hear everything.",
          "Barely a star. That's a reputation problem. Reputation's the one thing you can't buy. I've tried."
        ],
        "lo": "Your zoo's got a bad name right now. I know a little about bad names. People forget, in time.",
        "hi": "Rough reviews, {player}. Forget them. You want, I tell the critics a joke so bad they change the subject."
      },
      "coins_low": {
        "any": [
          "I hear the zoo's short on Zoo Coins. It happens. Money's like a bowstring. Tight, then gone.",
          "Empty register, huh? I know that look. I've seen it on other people. Never on me."
        ],
        "lo": "Low on coins. I could tell. It's in the shoulders. Don't worry, I'm not here to collect.",
        "hi": "Money's tight, {player}? Keep your chin up. I'd offer you a loan, but I like you too much to do that to you."
      },
      "animal_sick": {
        "any": [
          "One of the animals is in a bad way. I don't joke about that. I joke about everything. Not that.",
          "There's a sick one in there. You look after the family. The animals, that's family."
        ],
        "lo": "An animal's unwell, friend. I'm no vet, I'm a collector, but even I can see it.",
        "hi": "{player}, one of yours is hurting. You'll handle it, I know you. Tonight I'm lighting a candle. Don't tell the guys."
      }
    },
    "near": {
      "han_lock": [
        "Han Lock. Big arms, big voice. A tough guy. But the man hammers all day and never brags wrong, so I keep it polite.",
        "I told Han Lock a joke, {player}. He laughed so loud my hair moved. My hair doesn't move."
      ],
      "mirium": [
        "Mirium the banker. Every coin counted, every book balanced. She frightens me more than any monster.",
        "Mirium asked if I wanted to open an account. Me. With records. I had to sit down, {player}."
      ],
      "damien": [
        "Damien works nights too. Protector of the village. We nod. He goes his way, I go mine. It's an understanding.",
        "That Damien sees everything after dark. Lucky for me there's nothing to see. Just a man and his bows."
      ]
    }
  },
  "jack": {
    "intro": "Name's Jack. Fisherman by trade, reader by lamplight, champion at everything else. I've got a joke for every fish in the pond, and the pond's full.",
    "scenes": {
      "home_morning": {
        "any": [
          "You caught me before the pond did. Rods by the door, book on the table, fish for breakfast.",
          "Morning visitor! I was just picking a lure. It takes me longer than picking a shirt."
        ],
        "lo": "Bit early for house calls, isn't it? I've got a line to wet. Make it quick and I'll make it funny.",
        "hi": "{player}! In you come. I saved you the good chair, the one without a hook in it."
      },
      "home_evening": {
        "any": [
          "Evening in. Boots off, book open, rod drying by the wall. This is the other half of fishing.",
          "I'm three chapters from the end and the lamp's still good. Tonight's sorted."
        ],
        "lo": "I don't usually get callers this late. If you're selling carrots, the door's behind you.",
        "hi": "Sit down, I'll read you the best bit. It's about a man and a very big fish. They usually are."
      },
      "walking_to_zoo": {
        "any": [
          "Off to the zoo. I walk past every exhibit to get to the fish tanks. It's a warm-up lap.",
          "Heading zoo-wards to stare at fish I'm not allowed to catch. Character building."
        ],
        "lo": "On my way to the zoo. You going too? I walk fast. Athletic. People mention it.",
        "hi": "Walk with me. I'll race you to the gate. I've already started, by the way."
      },
      "at_zoo": {
        "any": [
          "I'm doing the rounds. Every animal here gets a nickname from me. None of them have complained.",
          "Nice stroll. I've decided that exhibit over there owes me a staring contest rematch."
        ],
        "lo": "Just a visitor today. I'm marking the exhibits out of ten. Fish get a head start.",
        "hi": "You built all this? I'd say I'm impressed, but you'd never let me forget it. I'm impressed."
      },
      "walking_home": {
        "any": [
          "Headed home. Feet tired, head full of fish. Standard evening.",
          "That's my zoo lap done. Now it's the path, the door and a chapter before supper."
        ],
        "lo": "Going home. No, I'm not telling you the score of my day. It was a win. Narrowly.",
        "hi": "Walk me back? I'll tell you about the one that got away. It gets bigger every telling."
      },
      "at_work": {
        "any": [
          "Line's in. Now we wait. This is where fishing looks like doing nothing. It's very skilled nothing.",
          "Two nibbles and one insult from a frog. Good shift so far."
        ],
        "lo": "I'm working. See the bobber? That's my boss. It hasn't moved, so neither have I.",
        "hi": "Pull up a bit of bank, {player}. You're the one person who doesn't scare the fish. Much."
      },
      "following": {
        "any": [
          "Good day for a trek. If we pass any water I'm going to look at it for a long time.",
          "I packed a rod, a book and a joke. One of them will save us."
        ],
        "lo": "All right, I'm tagging along. I'm watching how you handle yourself. There's a scorecard.",
        "hi": "Adventure with you beats a full bucket. Don't quote me. I'll deny it at the pond."
      },
      "following_night": {
        "any": [
          "Night hike. Can't see my own feet. Good thing I know where they usually are.",
          "Dark out here. The big ones feed at night. I'm just saying what I'd rather be doing."
        ],
        "lo": "Following a near stranger through the dark. My books warn about exactly this.",
        "hi": "I only wander about at night for two things, {player}. Big fish and you. Tonight there's no fish."
      },
      "staying": {
        "any": [
          "Standing still and waiting. You've handed the fisherman his best event.",
          "I'll wait. I've waited half a day for a cod before. You're at least as good as a cod."
        ],
        "lo": "Waiting here, am I? Fine. I'm timing you, though. Out of habit.",
        "hi": "Go on, I'll hold the spot. If I'm reading when you get back, don't lose my page."
      },
      "rain": {
        "any": [
          "Look at that rain on the water. Every drop looks like a bite. It's driving me mad in a nice way.",
          "Rain down my collar and I'm still out here. That's not stubborn, that's angling."
        ],
        "lo": "You don't mind a soaking? Good. I don't trust anyone who runs from weather.",
        "hi": "Rained on, both of us. Proper fishing weather. I'd lend you my hat, but it's my hat."
      },
      "thunder": {
        "any": [
          "Thunder! That's the sky applauding my last cast.",
          "Hear that rumble? Even I don't wave a rod in the air during a storm. I read about it once."
        ],
        "lo": "Big storm. I'm not scared of lightning. I just prefer my hair lying flat.",
        "hi": "Stick close till the thunder passes. Not for my sake. Well. A little for my sake."
      },
      "full_moon": {
        "any": [
          "Full moon. Bright enough to read by, nearly. I tried. Lost my place twice.",
          "Look at that moon. Somewhere a very large fish is showing off in the light of it."
        ],
        "lo": "Big moon tonight. They say odd things happen under one. You turned up, so there you go.",
        "hi": "Moon like that, I used to sit by the pond till morning. Better with company. Don't get smug."
      },
      "dark_moon": {
        "any": [
          "No moon at all. I just winked at you and it was completely wasted.",
          "Black as the bottom of the lake tonight. I couldn't see a bobber if it bit me."
        ],
        "lo": "Can't see a thing. If you pull a prank in this dark, I'll respect it. I'll also get you back.",
        "hi": "Dark one. Stay where I can hear you, {player}. I'm not losing my fishing partner to a hole."
      },
      "dawn": {
        "any": [
          "Sunrise. Everything goes gold for about a minute and I never get tired of it.",
          "First light. I beat the sun up again. Four in a row, not that it's a contest. It is."
        ],
        "lo": "Up at dawn? Either you're keen or you never slept. I can respect either.",
        "hi": "Dawn's my favourite and I don't share it with many. Here you are, sharing it."
      },
      "dusk": {
        "any": [
          "Sun's going down. That's the evening rise starting, and my stomach rising with it.",
          "Look at that sky. Pink as a salmon. I should stop comparing things to fish. I won't."
        ],
        "lo": "Sunset already. I got a lot of nothing done today, and did it well.",
        "hi": "Nice end to a day. I'd say something soppy about the sunset, but I've a reputation. Pretend I did."
      },
      "nether": {
        "any": [
          "Lava lakes everywhere and not one fish. Whoever made the Nether has never held a rod.",
          "It's hot, it's red and it smells like burnt boot. I've fished worse spots. No, I haven't."
        ],
        "lo": "You brought me down here on purpose? I'm writing this down. Under grudges.",
        "hi": "Only for you, {player}. My line would catch fire down here. So would my eyebrows."
      },
      "the_end": {
        "any": [
          "No water, no proper sky, no floor in places. I'd cast off the edge just to see what bites.",
          "Those tall dark fellows keep staring. I'm not staring back. I read about that."
        ],
        "lo": "So this is the End. Bleak. Not even a puddle. You do pick your outings.",
        "hi": "If I go off the edge here, tell them a huge fish pulled me in. Make it huge."
      },
      "fishing_sky": {
        "any": [
          "Pools in the clouds! I've dreamed about fishing up here and it's better awake.",
          "Islands in the sky with fish in them. I've stopped asking how. I just keep casting."
        ],
        "lo": "Careful up here. This is my kind of water and I'm very competitive about it.",
        "hi": "This is the place I'd only show a real friend. Look at it, {player}. Not bad for a secret."
      },
      "acufend": {
        "any": [
          "A round moon with a jungle on it, and everything hums. A thousand books and none covered this.",
          "These creatures love a tune. I offered them a joke instead. Tough crowd."
        ],
        "lo": "Strange little moon. I'm acting like I've been here before. Play along.",
        "hi": "They've got music and I've got no rhythm. Don't let me dance, {player}. Whatever happens."
      },
      "cave": {
        "any": [
          "All this rock overhead and no sky. If there's an underground lake, I take back every complaint.",
          "Caves. Dark, drippy, and the only one laughing at my jokes is the echo. Echo. Echo."
        ],
        "lo": "Deep, isn't it? I'm an outdoors man. A cave is the opposite of outdoors.",
        "hi": "I'm a long way from sunlight for you. You owe me one sunny afternoon by the pond."
      },
      "high_up": {
        "any": [
          "What a view. I can see every bit of water for miles from up here. I'm ranking them.",
          "Long way down. I could cast from here. Wouldn't catch a thing, but what a cast."
        ],
        "lo": "High enough for you? I'm fine with heights. I'm holding this rock for the rock's sake.",
        "hi": "Top of the world. Worth the climb, and I'm not out of breath. I'm breathing loudly on purpose."
      },
      "hostile_near": {
        "any": [
          "Something nasty's shuffling about over there. I fish for a living, I don't wrestle monsters.",
          "We've got ugly company. I can outrun it. I only need to outrun you, really."
        ],
        "lo": "Monster, close. I hope you're better with those than you look.",
        "hi": "Trouble behind you, {player}. I've got your back. From slightly further back."
      },
      "creeper_near": {
        "any": [
          "That's a creeper. Green, quiet, right there. I've stopped joking, which tells you plenty.",
          "Creeper. Don't hiss at me, pal. I've had a long day and I like my eyebrows."
        ],
        "lo": "There's a creeper sneaking up and I barely know you. Awkward way to go.",
        "hi": "Creeper, {player}! If it pops and I lose my lucky rod, I'm haunting it."
      },
      "villager_near": {
        "any": [
          "Villagers. All that humming and not a punchline between them.",
          "I tried a prank on a villager once. He stared at me until I apologized. Devastating."
        ],
        "lo": "Nice village. Somebody here must fish. I can always tell by the smell.",
        "hi": "Watch me try to make a villager laugh. I'm nought for thirty. Today's the day."
      },
      "pet_near": {
        "any": [
          "That's your pet? It's looking at my bait bag like it's owed something.",
          "Good looking animal. Loyal, too. Never once has a fish followed me home."
        ],
        "lo": "Yours, is it? Your pet's sizing me up. Smart animal. Most people take longer.",
        "hi": "Your little pal likes me. Everyone does eventually. It took you a while, to be fair."
      },
      "farm_animal_near": {
        "any": [
          "Cows, sheep, the whole barnyard. Not one of them would take a hook.",
          "That chicken's giving me a look. I've been stared down by a pufferfish. Try harder, chicken."
        ],
        "lo": "Farm animals. Fine, in their way. I keep expecting one to do something.",
        "hi": "That sheep's chewed the same mouthful since we got here. That's patience. I could learn from that sheep."
      },
      "zoo_animal_near": {
        "any": [
          "That {species} just looked right at me. I think it knows I'm the funny one.",
          "Up close, the {species} is something else. Doesn't swim like a cod, mind. Marks off for that."
        ],
        "lo": "A {species}. I read a book about them once. Ask nicely and I'll tell you how it ends.",
        "hi": "You look after that {species} well, {player}. It's got the face of an animal with no complaints."
      },
      "guests_crowd": {
        "any": [
          "Look at this crowd. Elbows everywhere. I'd love to see this many round a fish tank.",
          "Guests on all sides. One just asked me for directions. I pointed with total confidence."
        ],
        "lo": "Lot of guests. I'm the one they should be looking at, but the animals keep winning.",
        "hi": "All these folk came to see your zoo. I'd tease you, but that's actually pretty good."
      },
      "residents_crowd": {
        "any": [
          "Half the street's turned up. Now I've got an audience, and that never ends well for them.",
          "All the neighbours in one spot. Somebody's getting pranked. I haven't picked who."
        ],
        "lo": "You've met this lot? They're all right. I'm the best one. Ask any of them. Not out loud.",
        "hi": "Whole neighbourhood's here and I'm still standing with you. Take the compliment."
      },
      "other_resident": {
        "any": [
          "There's {other}. I told a joke yesterday and {other} didn't laugh. I'm still working on it.",
          "{other}'s here. Act natural. I may have hidden something in {other}'s garden."
        ],
        "lo": "That's {other}. Good neighbour. Don't repeat anything I say about my catch near {other}.",
        "hi": "Between us, I like {other}. Don't pass that on. I've a mocking reputation to keep."
      },
      "other_player": {
        "any": [
          "Two of you now. {other}, was it? Good. More people to beat at things.",
          "Who's this, {other}? Can {other} fish? That's my only question about anybody."
        ],
        "lo": "You and {other} together. I'm outnumbered. I'm still winning.",
        "hi": "{other} seems fine, {player}, but you're still my first pick. Don't tell {other}."
      },
      "alone_night": {
        "any": [
          "Quiet out. Just us and whatever's making that noise. Probably a frog. Let's say frog.",
          "Nobody about tonight. This is when I do my best thinking, and my worst."
        ],
        "lo": "Just the two of us and the dark. I'd tell a joke, but I'd rather hear something coming.",
        "hi": "Nights this empty, I'll admit things. Here's one: I'm glad you came along, {player}."
      },
      "by_water": {
        "any": [
          "Water. Hang on. See those rings by the bank? Something's feeding.",
          "I can't stand next to water without reading it. Deep there, shallow there, lunch there."
        ],
        "lo": "Nice bit of water. I'm not saying whether it's good fishing. Trade secret.",
        "hi": "This is where I'm happiest. Water, a line, and someone who knows when to keep quiet. Sometimes."
      },
      "by_lava": {
        "any": [
          "Lava. Looks like soup, behaves like a bad idea. I'm standing back.",
          "I dropped a rod near lava once. It had a very short, very bright funeral."
        ],
        "lo": "Mind the lava. I've only just met you and I'd hate to be the one who tells everybody.",
        "hi": "You're a bit near that lava for my liking. I've lost lures. I'm not losing you to a puddle of fire."
      },
      "by_flowers": {
        "any": [
          "Flowers. Pretty. Full of bees, and bees do not respect personal space.",
          "All these flowers. I'd tell you what they're called, but I only know the names of fish."
        ],
        "lo": "Nice flowers. Don't look at me like that. An angler can like a flower.",
        "hi": "I'd say stop and smell the flowers, but I've smelled of pond since I was nine. You go ahead."
      },
      "by_fire": {
        "any": [
          "Good fire. All it's missing is a fish on a stick.",
          "Campfire. Best place for a story. Mine are all true, give or take a few feet of fish."
        ],
        "lo": "Warm, isn't it? I've a campfire story. It's long and I'm the hero.",
        "hi": "Fire, a friend and nowhere to be. Add one cooked salmon and I'd call it a perfect night."
      },
      "by_crops": {
        "any": [
          "Crops coming up nicely. Wheat I respect. If any of that is carrot, I'm leaving.",
          "Farming. It's fishing for people who like to know how it ends."
        ],
        "lo": "Somebody's worked hard on these rows. Wasn't me. I keep my hands soft for the reel.",
        "hi": "Those aren't carrots growing there, are they? {player}, you know how I feel. Look me in the eye."
      },
      "by_books": {
        "any": [
          "Bookshelves! Hold on, I need to check whether I've read these. I have. Most of them.",
          "Smell that? Paper and leather. Second best smell after a fresh catch."
        ],
        "lo": "You read? Good. A favourite book says a lot about a person. I'm judging already.",
        "hi": "One day I'll lend you my favourite book. The margins are full of me arguing with it."
      },
      "in_snow": {
        "any": [
          "Snow. Crunchy. I've packed one snowball and I'm not saying who it's for.",
          "Cold enough to freeze a pond. I'd fish through the ice out of pure spite."
        ],
        "lo": "Chilly. I'm athletic, so I don't feel the snow. This is shivering for fun.",
        "hi": "I'd never throw a snowball at a friend, {player}. Look how empty my hands are. Mostly."
      },
      "holding_gift": {
        "any": [
          "Is that {item}? Nice. I'm not hinting. I'm just looking at it a lot.",
          "That {item} you're holding. Good taste. I notice these things."
        ],
        "lo": "{item}, eh? I've got one of those. Well, I had one. Well, I've seen one.",
        "hi": "You're carrying {item} around in front of me? You know exactly what you're doing."
      },
      "holding_weapon": {
        "any": [
          "That's a serious {item}. I usually settle things with a rod and sarcasm.",
          "Nice {item}. Point it away from the fisherman. The fisherman bruises."
        ],
        "lo": "Armed, are we? I come in peace. I come with jokes, which is nearly the same.",
        "hi": "With you swinging that {item}, I feel safe. Slightly worried, but safe."
      },
      "holding_food": {
        "any": [
          "Is that {item}? I skipped lunch for a bite that never came. Just mentioning it.",
          "You're holding {item} and I can hear my stomach. So can the fish."
        ],
        "lo": "Is that {item} real? I was fooled by a fake pie once. Never again.",
        "hi": "Waving {item} at a hungry angler. That's cold, {player}. I taught you well."
      },
      "holding_rod": {
        "any": [
          "Now that's a fishing rod in your hand. Let's see the grip. Hm. I've seen worse. On a child.",
          "You've brought a rod! Finally, someone speaking my language."
        ],
        "lo": "You fish? We'll see. Anyone can hold a rod. It's the waiting that sorts people out.",
        "hi": "Rod out already? That's my {player}. First to a bite, loser carries the bucket."
      },
      "holding_tool": {
        "any": [
          "A {item}. Proper hard work, that. I prefer jobs you can do sitting down.",
          "Look at you with the {item}. If you turn up any worms, I know a man who wants them."
        ],
        "lo": "Busy with that {item}, I see. I'd help, but I've got to keep my casting arm fresh.",
        "hi": "Easy with the {item}, you've got blisters coming. I'd know. Reels do the same."
      },
      "armored": {
        "any": [
          "Full armor! You clank when you walk. Every fish for a mile just left.",
          "Look at the tin suit. Where's the tournament? I'd watch that."
        ],
        "lo": "All plated up. Expecting trouble, or do you just like being heavy?",
        "hi": "Armor suits you. I'd still beat you in a footrace in that. And out of it."
      },
      "hurt": {
        "any": [
          "You look terrible. I'm saying that with concern. Mostly concern.",
          "Whoa, you're in a bad way. Sit down before you fall in something."
        ],
        "lo": "You're hurt. I don't know you well, but I know that's too much red.",
        "hi": "{player}, you're a mess. No jokes till you're patched up. See? That's how worried I am."
      },
      "wet": {
        "any": [
          "You're soaked. Did you fall in or dive in? I score them differently.",
          "Dripping wet. Now you smell like pond too. Welcome to the club."
        ],
        "lo": "In the water, are you? You'll scare the fish. They scare easy round strangers.",
        "hi": "Look at you, wet as a cod. Any more at home in there and I'd be casting at you."
      },
      "sneaking": {
        "any": [
          "Why are you crouching? Is it a prank? Is it on me? I respect it, but I'm onto you.",
          "Creeping about like that, you'd make a fine angler. Low and quiet. The fish never see it coming."
        ],
        "lo": "You're sneaking and I can see you. One of us is doing this wrong.",
        "hi": "Down low, good, good. Who are we pranking? I'm in. I don't even need to know."
      },
      "long_time": {
        "any": [
          "Well, look what the tide dragged in. It's been days. I counted them in fish.",
          "You've been gone a while. I had a whole joke saved up and now it's stale."
        ],
        "lo": "Oh, it's you. Been a few days. I'd nearly put a new face in your spot.",
        "hi": "Where've you been, {player}? The pond's been quiet. Don't make me say I missed you."
      },
      "first_today": {
        "any": [
          "There you are. First hello of the day, so you get the fresh material.",
          "Hey, hey! First chat today and I'm in a great mood. Enjoy it while it lasts."
        ],
        "lo": "Hello. You get one free joke today. After that I charge. Kidding. Am I?",
        "hi": "{player}! The day doesn't start properly till you've turned up. Don't let that go to your head."
      },
      "zoo_busy": {
        "any": [
          "Packed today. I had to queue for the fish tank. Me. Queue.",
          "Zoo's heaving. I've been stepped on twice and asked for directions three times."
        ],
        "lo": "Lot of guests in. Somebody round here is doing something right. I assume it's you.",
        "hi": "Full house, {player}. I'd say I'm proud, but I'll just nod at you across the crowd."
      },
      "zoo_empty": {
        "any": [
          "Not a single guest. I've got the whole zoo to myself. I ran a lap. Won it.",
          "Empty paths. It's like a pond with no fish in, and I know how that feels."
        ],
        "lo": "No guests today. Where is everybody? Was it something I said? It usually is.",
        "hi": "Nobody in. Slow days happen. I've had mornings with nothing on the line. They come back."
      },
      "zoo_closed": {
        "any": [
          "Gates shut. Now it's just us and the animals, and the animals look relieved.",
          "Closed, is it? Good time to look at the tanks without a nose print on the glass."
        ],
        "lo": "Zoo's shut and I'm still here. Don't worry. I'm the harmless sort of suspicious.",
        "hi": "Closed up? Fair enough, you need a rest too. Even I reel in eventually."
      },
      "litter_bad": {
        "any": [
          "The paths are a tip. I nearly slipped on a wrapper, and I do my own stunts.",
          "Rubbish everywhere. If that ends up in the water, the fish and I will have words."
        ],
        "lo": "Bit of a mess on the paths. I'm not judging. I'm absolutely judging.",
        "hi": "Mate, the litter. I say it as a friend. A friend who just stepped in something."
      },
      "stars_high": {
        "any": [
          "Top rating! I told everybody it was the fish that did it. Nobody's argued.",
          "Great stars on the place. I like being near winners. It suits me."
        ],
        "lo": "Good rating you've got. I only hang about the best zoos. Ask anyone.",
        "hi": "Look at those stars, {player}. You earned every one. I helped by standing around looking sharp."
      },
      "stars_low": {
        "any": [
          "The rating's taken a dip. Happens. I once went nine days without a bite.",
          "Low stars. That stings. I hate a losing streak, mine or anybody's."
        ],
        "lo": "Rating's not great, is it? I won't mock. That's a lie, but I'll keep it short.",
        "hi": "A poor rating won't last with you running things. I don't back losers, and I'm backing you."
      },
      "coins_low": {
        "any": [
          "The coin box sounds a bit hollow. I know that sound. My bait tin makes it.",
          "Short on Zoo Coins? Lean times. I've lived a week on stories about fish."
        ],
        "lo": "Running low on coins, I hear. I'd lend you some, but I'm a fisherman.",
        "hi": "Tight on Zoo Coins, {player}? You'll haul it back. You've more patience than you think."
      },
      "animal_sick": {
        "any": [
          "One of the animals looks off. I can tell. It's got the face of a fish out of water.",
          "Something's poorly in the zoo. Even I've got no joke for that one."
        ],
        "lo": "There's an animal not doing well. I'm no keeper, but I've got eyes.",
        "hi": "That poor animal's under the weather. You'll sort it, {player}. You fret, and that's why they do well."
      }
    },
    "near": {
      "guido": [
        "There's Guido. Sharp suit, sharp smile. I never tell Guido where the fish are. He writes things down.",
        "Guido laughed at my joke last week. Then he asked what I wanted. Nothing, Guido. It was just a joke."
      ],
      "don_l": [
        "Don L. tried to tackle me mid-cast for his new sport. He hurt his shoulder. I landed the fish.",
        "Careful, Don L. is nearby. If he says the word prototype, I'm running, and I'm faster than him."
      ],
      "tim": [
        "That's Tim. He reviewed my favourite book and gave it two stars. We're still friends. Barely.",
        "Tim reads more than I do. I don't say that lightly. I say it quietly, so Tim can't hear."
      ]
    }
  },
  "chasm": {
    "intro": "I am Chasm. I am a voidologist. I study the End and the void beneath it. That is all you need. Do not look under the hood.",
    "scenes": {
      "home_morning": {
        "any": [
          "You are in my house in the morning. I was reading results. Stand away from the samples.",
          "The window lets in too much sun at this hour. I keep it covered. Now you know why it is dim."
        ],
        "lo": "It is early and you are at my door. I did not invite you. Be short.",
        "hi": "You may stay this morning. Sit on the stool. Not that one. That one is holding a sample."
      },
      "home_evening": {
        "any": [
          "My work for the day is written down. Now I sit in the dark and think. It is not rest. It is close.",
          "The lamp is low on purpose. I see better without it."
        ],
        "lo": "It is evening. I do not receive visitors. You are an exception I did not approve.",
        "hi": "{player}. The evening is quieter with you in the room. I did not expect that result."
      },
      "walking_to_zoo": {
        "any": [
          "I am walking to the zoo. I have observations to make. You are in the path.",
          "The zoo holds one or two creatures worth my time. I am on my way to them."
        ],
        "lo": "I am going to the zoo. I am not going with you. We are only on the same path.",
        "hi": "Walk to the zoo beside me if you want. I will not talk much. You know that."
      },
      "at_zoo": {
        "any": [
          "I am walking the exhibits. Most of these animals fall when dropped. Predictable.",
          "I have counted the exhibits. I have counted the interesting ones. The second number is small."
        ],
        "lo": "I am a visitor today. I do not need a guide.",
        "hi": "You built these exhibits. They are ordered and the animals are calm. I approve of both."
      },
      "walking_home": {
        "any": [
          "The day's observing is done. I am walking home to write it down.",
          "I am going home. My notes are full. My patience is not."
        ],
        "lo": "I am leaving the zoo. I have no summary for you.",
        "hi": "It was a useful day. Meeting you on the way home adds to it. Do not make that into something."
      },
      "at_work": {
        "any": [
          "I am measuring something you cannot see. You are standing in it.",
          "This is research. It looks like standing still. It is not standing still."
        ],
        "lo": "I am working. The void does not wait for small talk. Neither do I.",
        "hi": "You may watch me work, {player}. If the jar hums, step back. If I hum, also step back."
      },
      "following": {
        "any": [
          "I am following you in daylight. The sun is loud. Continue.",
          "This is your expedition. I am here as an observer. I will note what goes wrong."
        ],
        "lo": "I agreed to come. I have not agreed to enjoy it.",
        "hi": "I left my work to travel with you, {player}. I do that for no one else. Lead on."
      },
      "following_night": {
        "any": [
          "Night travel. The dark does not trouble me. I have stood in darker.",
          "My eyes are the only light on me. If you lose them, listen for the robe."
        ],
        "lo": "You walk at night with someone you barely know. Bold or careless. I have not decided.",
        "hi": "I see well at night. Stay near me, {player}. I will tell you if something moves."
      },
      "staying": {
        "any": [
          "You said wait. I am waiting. I once watched one end stone for a full day. This is nothing.",
          "I will stand on this exact block until you return. I am good at it."
        ],
        "lo": "I will wait here. I do not know why I am doing what you say.",
        "hi": "Go. I will be here when you return. That is a certainty, and I have few of those."
      },
      "rain": {
        "any": [
          "It is raining. Each drop is an insult. I have counted many insults.",
          "The sky is leaking again. Your world should have that repaired."
        ],
        "lo": "Do not tell me the rain is pleasant. It is water and it is on my robe.",
        "hi": "I am standing in rain because you are. Note the sacrifice, {player}."
      },
      "thunder": {
        "any": [
          "Lightning. Energy leaving the sky without asking. At last, the weather is interesting.",
          "Thunder is only sound arriving late. It is still better company than the rain with it."
        ],
        "lo": "A storm. You flinched at that thunder. I did not.",
        "hi": "The storm does not frighten me. I would still prefer you were not standing under that tree."
      },
      "full_moon": {
        "any": [
          "The moon is full. A bright stone held up by nothing. Physics claims to explain it. I am not convinced.",
          "A full moon is too much light for a night. I can see every block. So can everything else."
        ],
        "lo": "You are looking at the moon. It will not look back. I have checked.",
        "hi": "A full moon. You like these. I can tell. I will stand here while you look."
      },
      "dark_moon": {
        "any": [
          "No moon. The sky is nearly correct tonight.",
          "This dark is thin. It still has ground under it. But it is a good attempt."
        ],
        "lo": "On a night this black you see only the eyes. That is how I prefer to be met.",
        "hi": "A moonless night is the one I would choose. It is like where I work. You are welcome in it."
      },
      "dawn": {
        "any": [
          "The sun is returning. It does this every day. Nobody has stopped it.",
          "Sunrise. The dark ends and everyone is pleased. I am the control group."
        ],
        "lo": "It is dawn. Yes, I see the colours. No, I have no comment.",
        "hi": "You watch the sunrise as if it were new each time. I find I do not mind watching you watch."
      },
      "dusk": {
        "any": [
          "Sunset. For a few minutes the sky turns purple. That part is acceptable.",
          "The light is leaving. I have been waiting for that since morning."
        ],
        "lo": "The sun is going down. You may keep your opinion of it.",
        "hi": "This purple, just before dark. It is the one colour your sky shares with mine. I wanted you to know."
      },
      "nether": {
        "any": [
          "The Nether. Hot, loud and full of things that scream. It is the opposite of my field.",
          "Lava below, netherrack above, no silence anywhere. I have nothing to study here."
        ],
        "lo": "You brought a voidologist to a furnace. Explain your reasoning. No. Do not.",
        "hi": "I dislike the Nether, {player}. I came anyway. Draw the conclusion yourself."
      },
      "the_end": {
        "any": [
          "The End. Listen. Nothing. That is the sound I work in.",
          "This sky is the right colour. The endermen know this robe. We ignore each other. It is a good arrangement."
        ],
        "lo": "You are standing in my place of work. I did not expect to see you this far out.",
        "hi": "Under this end stone is everything I study. I have wanted to stand over it with you. Look, {player}."
      },
      "fishing_sky": {
        "any": [
          "Islands that float. Finally a place that ignores gravity. Then they filled it with water.",
          "There is open sky under these islands. I keep looking down. The fishing pools I ignore."
        ],
        "lo": "You came up here to fish. I came to look over the edge. We will not discuss either.",
        "hi": "A drop through cloud with no floor, {player}. Nearly the void, with better light. I am glad I saw it."
      },
      "acufend": {
        "any": [
          "A round moon with a jungle on it. The creatures make music at me. I have not replied.",
          "This moon should not hold a jungle. It does. I approve of anything that should not."
        ],
        "lo": "The creatures here sing at strangers. You may answer them. I will not.",
        "hi": "One of them hummed and I nearly hummed back. You saw nothing, {player}."
      },
      "cave": {
        "any": [
          "Stone on every side. It is dark, which is good, and it drips, which is not.",
          "A cave is a small void with walls. A poor copy. I will tolerate it."
        ],
        "lo": "You dig for diamonds down here, I assume. Everyone does. I do not see the appeal.",
        "hi": "If this cave has a hole with no bottom, I will stay beside it a while. You may sit with me."
      },
      "high_up": {
        "any": [
          "We are high. Gravity is waiting below for a mistake. I do not intend to give it one.",
          "From up here the world is small and far down. This is the correct distance from it."
        ],
        "lo": "You stand near the edge. I am not concerned. I would only have to explain it to people.",
        "hi": "I like a long drop. You know that by now. This one I like more with you beside it."
      },
      "hostile_near": {
        "any": [
          "There is a hostile creature close. It is of this world, so not my field. It is still a problem.",
          "Something wants to harm us. It is slow and it obeys gravity. Those are its weaknesses."
        ],
        "lo": "A monster is near. I assume you carry something sharp for that.",
        "hi": "It is behind you, {player}. Three blocks. I would rather you were not damaged."
      },
      "creeper_near": {
        "any": [
          "A creeper. It converts itself into a hole. As research I respect it. Not at this distance.",
          "That creeper is hissing. I have four seconds of data and I do not want a fifth."
        ],
        "lo": "There is a creeper beside us. I am telling you once.",
        "hi": "Creeper, {player}. I have lost notes to those. I am not losing you to one."
      },
      "villager_near": {
        "any": [
          "Villagers. They cross their arms as I do. That is where the likeness ends.",
          "They hum and trade and stare at my hood. One offered an emerald for the robe. I declined."
        ],
        "lo": "A village. Many people, little silence. I will stand at the edge of it.",
        "hi": "A villager asked if you were my friend. I said yes. It was faster than explaining."
      },
      "pet_near": {
        "any": [
          "Your animal is sniffing my robe. It smells the End. It is confused. That is correct.",
          "It follows you without being asked. Loyalty with no contract. I have no theory for it."
        ],
        "lo": "This pet belongs to you. Keep it off the hem.",
        "hi": "Your pet sat on my foot. I have allowed it. Tell no one."
      },
      "farm_animal_near": {
        "any": [
          "A cow is looking at me. There is nothing behind its eyes. I envy the quiet.",
          "Chickens. They flap and do not fly. A failed argument with gravity."
        ],
        "lo": "Cows. Sheep. Pigs. None of them is from the End. I have finished observing them.",
        "hi": "The sheep came to me, not to you. I did not call it. Stop smiling, {player}."
      },
      "zoo_animal_near": {
        "any": [
          "The {species} is watching the hood. It will not see more than you do.",
          "I have observed the {species} for some time. It has not left the ground once. Disappointing."
        ],
        "lo": "That is a {species}. You already know that. I have nothing to add.",
        "hi": "The {species} is calm when you are near, {player}. I recorded that. It is in my notes about you."
      },
      "guests_crowd": {
        "any": [
          "Too many guests. They move like water. I am being flowed around.",
          "A child in this crowd asked if my eyes are real. I said yes. It ran. Efficient."
        ],
        "lo": "There is a crowd and you chose to speak to me in it. Speak faster.",
        "hi": "I do not like crowds. I am staying in this one because you are in it."
      },
      "residents_crowd": {
        "any": [
          "The neighbours have gathered. They are all talking at once. None of it is data.",
          "Several of the neighbours greeted me. I nodded. That was my contribution."
        ],
        "lo": "You know these neighbours. I live beside them. Those are different things.",
        "hi": "The neighbours ask about you when you are away, {player}. I say you are adequate. They understand."
      },
      "other_resident": {
        "any": [
          "{other} is standing there. {other} once asked what is under the hood. I did not answer.",
          "That is {other}. We are neighbours. I have said four words to {other}. It was enough."
        ],
        "lo": "{other} enjoys talking. I do not. You have chosen the wrong one of us.",
        "hi": "{other} is tolerable. Not as tolerable as you. I keep a ranking."
      },
      "other_player": {
        "any": [
          "There are two of you now. {other} is new to me. I will observe {other} before I speak.",
          "{other} is looking at the hood. Everyone starts there. It stays on."
        ],
        "lo": "I do not know you and I do not know {other}. My position is unchanged.",
        "hi": "{other} may be acceptable. You are proven, {player}. That is not the same."
      },
      "alone_night": {
        "any": [
          "No one else is here. No voices. This is the nearest your world comes to being bearable.",
          "It is night and it is empty. I could stand here until morning. I have before."
        ],
        "lo": "We are alone in the dark. You seem uneasy. I am the least dangerous thing out here.",
        "hi": "I will tell you something, {player}. In the void I am alone. Here I am only quiet. I prefer this."
      },
      "by_water": {
        "any": [
          "Water. A great deal of it, lying there. I am standing two blocks back and that is final.",
          "It is wet, it moves and it gets into everything. I have nothing good to report."
        ],
        "lo": "If you splash me, we are finished speaking. For some time.",
        "hi": "You like the water. I like you. That is as close to it as I am going."
      },
      "by_lava": {
        "any": [
          "Lava. It destroys what falls in and keeps nothing. Crude. The void at least is tidy about it.",
          "It glows, it flows, it burns. Simple. I prefer a danger with some mystery to it."
        ],
        "lo": "Lava. I assume you know not to touch it. I have been wrong about people before.",
        "hi": "You are too close to the lava, {player}. That is not an order. It is a strong finding."
      },
      "by_flowers": {
        "any": [
          "Flowers. They grow up toward the sun as they are told. No imagination.",
          "I am standing in flowers. A bee has landed on my sleeve. We are both reconsidering."
        ],
        "lo": "Do not offer me a flower. I would have to hold it.",
        "hi": "The purple flowers are acceptable. If you tell anyone I said so, I will deny it."
      },
      "by_fire": {
        "any": [
          "Fire. It eats the wood and leaves light. A fair exchange. I can stand near this.",
          "The smoke goes up. Everything else here goes down. I respect the smoke."
        ],
        "lo": "I am not cold. I am standing by the fire because it is where I stopped.",
        "hi": "A fire and little talk. You understand how to sit with someone, {player}. Most do not."
      },
      "by_crops": {
        "any": [
          "Crops. Overworld food before it is picked. I dislike it in advance.",
          "Wheat, in rows. Someone has put great effort into growing things I will not eat."
        ],
        "lo": "If you are about to offer me a potato, stop. It grew in dirt. I know where it has been.",
        "hi": "No chorus fruit in this field. I looked. I looked because you grow things, and I hoped."
      },
      "by_books": {
        "any": [
          "Books. I have read what your world wrote about the void. Most of it is wrong. Some of it is mine.",
          "Shelves of other people's conclusions. Useful for learning what to doubt."
        ],
        "lo": "You may read. Reading is quiet. I recommend it to you now.",
        "hi": "I am writing a book on the void. No one has seen a page. You have seen the cover. That is trust."
      },
      "in_snow": {
        "any": [
          "Snow. Water that has learned to be quiet. It is still water.",
          "It is cold and white and it sticks to the robe. I am told people enjoy this."
        ],
        "lo": "If that is a snowball in your hand, consider the consequences carefully.",
        "hi": "The End is colder than this snow, {player}, and I never minded. Still, you look cold."
      },
      "holding_gift": {
        "any": [
          "You are holding {item}. I noticed. I notice everything. That one I noticed twice.",
          "That is {item}. It comes from the right place. Few things here do."
        ],
        "lo": "{item}. You carry that near me by accident or by design. I am watching to learn which.",
        "hi": "{item}, {player}. You remembered what I value. I am not asking for it. I am pleased it exists."
      },
      "holding_weapon": {
        "any": [
          "A {item}. A sharp answer to a simple question. I assume the question is nearby.",
          "You are armed. Good. I carry nothing but the robe and my conclusions."
        ],
        "lo": "You hold a {item} and you approach a stranger in a hood. I understand. I would also.",
        "hi": "You handle that {item} well. I have seen you use it. I walk more easily behind it."
      },
      "holding_food": {
        "any": [
          "You are holding {item}. If it grew in this world, keep it on your side.",
          "Food. You eat it, then you need more. The void has no such flaw."
        ],
        "lo": "Do not offer me the {item}. I can tell from here that it is Overworld cooking.",
        "hi": "Eat, {player}. You go too long without it. I have watched. The {item} is your problem, not mine."
      },
      "holding_rod": {
        "any": [
          "A fishing rod. A stick for pulling wet things out of wet places. I will stand elsewhere.",
          "You intend to fish. That means water, and waiting beside water. I can only endorse the waiting."
        ],
        "lo": "If that fishing line swings this way and it is wet, I am leaving.",
        "hi": "You enjoy fishing. I do not understand it. I will hold your place on the bank. The dry part."
      },
      "holding_tool": {
        "any": [
          "A {item}. You move blocks from one place to another. So does gravity, with less effort.",
          "You dig with that. Dig far enough and there is nothing underneath. That is where I start."
        ],
        "lo": "You are working with a {item}. I will not help. I will not hinder. That is my offer.",
        "hi": "If that {item} ever breaks through into empty dark, {player}, I would like to be the first to hear."
      },
      "armored": {
        "any": [
          "Full armor. You have dressed for something to go wrong. Sensible.",
          "Metal from head to foot. The void would take you just the same. But it is a good effort."
        ],
        "lo": "You hide in armor. I hide in a hood. We need not discuss it.",
        "hi": "The armor is wise. I prefer you intact, {player}. It saves me finding another person."
      },
      "hurt": {
        "any": [
          "You are damaged. Badly. This is not an observation I wanted to make.",
          "Your health is very low. I can see it from here. Stand still and stop bleeding."
        ],
        "lo": "You are hurt. I do not know you. I still do not want you to fall over in front of me.",
        "hi": "{player}. You are close to gone. I have studied endings. I do not want to study yours."
      },
      "wet": {
        "any": [
          "You are wet. Completely. Stay at that distance until it stops.",
          "You are standing in water as if it were normal. I am recording this as a warning to others."
        ],
        "lo": "You are dripping. If one drop reaches the robe, this talk is over.",
        "hi": "You are soaked, {player}, and I am still speaking with you. Measure my regard by that."
      },
      "sneaking": {
        "any": [
          "You are crouching. I can still see you. The hood does not limit my vision.",
          "You lower yourself and expect not to be noticed. An untested theory. It has now failed."
        ],
        "lo": "Why are you sneaking toward me? Stand up. State your purpose.",
        "hi": "You creep up on me as a joke. I do not startle. I did allow you to get closer than most."
      },
      "long_time": {
        "any": [
          "You have been absent several days. I counted them. I count everything.",
          "Some days have passed without you. I assumed you had fallen into something."
        ],
        "lo": "You were gone. Now you are not. I had not noticed either way. Mostly.",
        "hi": "{player}. You vanished for days and sent no word. That is my habit. It does not suit you."
      },
      "first_today": {
        "any": [
          "You are here. That is today's first interruption. Proceed.",
          "A new day and you have found me already. Begin."
        ],
        "lo": "Good day. That is the greeting. You have had it.",
        "hi": "{player}. I kept a place in today for you. You are on time."
      },
      "zoo_busy": {
        "any": [
          "The zoo is full of guests. The noise is measurable. I measured it. Too much.",
          "Every path is crowded today. I have been bumped three times. I am keeping the count."
        ],
        "lo": "Your zoo is busy. I assume that is what you wanted. I would not want it.",
        "hi": "A zoo this full means your work is good, {player}. I dislike the crowd. I approve of the cause."
      },
      "zoo_empty": {
        "any": [
          "There are no guests. The paths are silent. The zoo has never been better.",
          "Open gates and nobody in them. I can hear the animals think. They do not think much."
        ],
        "lo": "The zoo is empty today. Do not look to me for concern. I came for the quiet.",
        "hi": "No guests. I know that worries you. It will change. For now I am enjoying it enough for both of us."
      },
      "zoo_closed": {
        "any": [
          "The zoo is closed. Gates shut, guests gone. This is the hour for real observation.",
          "Closed. Without the visitors the animals behave differently. I am noting how."
        ],
        "lo": "The zoo is closed and I am still inside. I did not ask and you need not answer.",
        "hi": "You closed the gates. You needed the silence too, I think. I will not ask why."
      },
      "litter_bad": {
        "any": [
          "There is litter on every path. Disorder, lying on the ground. Even gravity has become lazy here.",
          "I stepped on something that crackled. I do not want to know what. The paths are filthy."
        ],
        "lo": "Your paths are covered in rubbish. I am stating it. I am blunt. You were told.",
        "hi": "The litter is bad, {player}. I say it because no one else will say it to you plainly."
      },
      "stars_high": {
        "any": [
          "The zoo's rating is high. The numbers agree with what I see. That is uncommon.",
          "So many stars. The guests have reached the correct conclusion for once."
        ],
        "lo": "Your rating is good. Do not expect praise from me as well. The stars are enough.",
        "hi": "A high rating. You did that carefully, piece by piece. I recognise good method, {player}."
      },
      "stars_low": {
        "any": [
          "The rating is poor. A number is not a truth. It is still a low number.",
          "Almost no stars. The guests are harsh. They are also not entirely wrong."
        ],
        "lo": "Your zoo is rated badly. I will not soften it. That is not something I do.",
        "hi": "The rating is low. I have had results fail for years before one held. You will repair it, {player}."
      },
      "coins_low": {
        "any": [
          "The zoo is nearly out of Zoo Coins. I bring in none. I am aware of the arithmetic.",
          "Your coins are almost gone. Money is a law people made up. It still seems to bind you."
        ],
        "lo": "You are short of coins. I have none to give and no advice you would like.",
        "hi": "You are low on Zoo Coins and I earn you nothing, {player}. You keep me here anyway. I have noted it."
      },
      "animal_sick": {
        "any": [
          "One of the animals is unwell. I can see it in how it stands. Someone should have seen it sooner.",
          "An animal here is in poor care. I study endings. I do not like to watch a slow one."
        ],
        "lo": "You have a sick animal. I am not a keeper. I am telling you because it is true.",
        "hi": "An animal is suffering, {player}. You are better than this, and you know it. That is all I will say."
      }
    },
    "near": {
      "damien": [
        "Damien is near. He came from the End, as my work does. I have questions. He has earned the right not to answer.",
        "Damien was held by the void and came back. I study it by choice. We do not speak much. We do not need to."
      ],
      "subject_10": [
        "Subject 10 studies the Nether and laughs while she does it. I do not understand her. I have stopped trying.",
        "Subject 10 greets my hood as if it were a face. She does this daily. It is not unwelcome."
      ],
      "amanda": [
        "Amanda says the laws of physics are settled. I told Amanda they are a habit. We have not finished.",
        "Amanda admires diamonds. I trade them away. She thinks one of us is a fool. So do I."
      ]
    }
  },
  "subject_10": {
    "intro": "Hi, I'm Subject 10! Nether bioscientist, so I study the creatures from down there. Half of me is zombified piglin, which makes me sort of my own homework. Nice to meet you!",
    "scenes": {
      "home_morning": {
        "any": [
          "You're here early! Come in, I've got every curtain open. Morning sun is my favourite thing in the house.",
          "Morning! I was sorting hoglin notes by the window. The window was winning."
        ],
        "lo": "Oh, a morning visitor! Hi! Sorry about the mess, and the face. One of those I can tidy.",
        "hi": "{player}! Best start to a morning. Sit in the sunny spot, I saved the warm half for you."
      },
      "home_evening": {
        "any": [
          "Evening! Every lamp's lit, as you can see. All nine. I counted twice.",
          "I'm winding down with my notes. It's so bright in here that the dark outside hardly counts."
        ],
        "lo": "It's getting dark out, so I'm in here. You're welcome to the lamplight. Everyone is.",
        "hi": "Stay a bit? Evenings are the hard part of my day. They're easier with you in the room."
      },
      "walking_to_zoo": {
        "any": [
          "I'm off to the zoo! Sun's on my face and I've got a fresh page ready.",
          "Walking to the zoo. I take the sunny side of the path. Both halves voted for it."
        ],
        "lo": "Heading to the zoo! Are you going too? I don't bite. Neither half.",
        "hi": "Walk to the zoo with me! I've got a hoglin fact I've been saving for you all morning."
      },
      "at_zoo": {
        "any": [
          "I'm just strolling round! I wave at every animal. About a third of them look up.",
          "So many exhibits! I came for one look and I've been round the loop three times."
        ],
        "lo": "Just visiting the exhibits today! If anyone stares, it's fine, they're looking at the animals. Mostly.",
        "hi": "Your zoo's where I feel most normal, you know. Nobody here looks twice. Well, once."
      },
      "walking_home": {
        "any": [
          "Heading home while it's still light! That's my one firm rule.",
          "Zoo day's done! My notebook's full and my feet are tired. Good tired."
        ],
        "lo": "I'm on my way home before sunset. Nothing personal, I just race the dark every day.",
        "hi": "Walk me home? Then I'm not watching the light go by myself. It's much nicer with you."
      },
      "at_work": {
        "any": [
          "I'm mid-notes! A little one from the Nether just sneezed and I'm writing it up like it's history.",
          "Research time! I only watch and write. Nobody gets poked in my lab. Ever."
        ],
        "lo": "Oh, hi! I'm working, but ask away. About the animals. Start with the animals.",
        "hi": "Perfect timing, {player}. Look at this chart! No, it's upside down. Still, look at it!"
      },
      "following": {
        "any": [
          "An adventure in the daylight! My favourite kind. I brought a notebook and no sense of direction.",
          "I love this! Sun out, boots on, somebody to talk to the whole way."
        ],
        "lo": "Thanks for asking me along! Not many people invite the piglin girl anywhere this soon.",
        "hi": "Wherever you're headed, {player}, I'm in. Unless it's hot, dark or bony. Then I'm in, but loudly."
      },
      "following_night": {
        "any": [
          "It's very dark out here. I'm fine! I'm talking a lot because I'm fine.",
          "Night walk! I'd love a torch. Or twelve. Twelve feels right."
        ],
        "lo": "I don't really do night, and I don't really know you yet. So this is two brave things at once.",
        "hi": "I wouldn't be out in the dark for anyone else, {player}. Just keep talking so I know where you are."
      },
      "staying": {
        "any": [
          "I'm waiting right here! I picked the patch with the most sun on it.",
          "Standing by! I'll count clouds till you're back. I'm up to six, and one looks like a strider."
        ],
        "lo": "You want me to wait? Okay! You are coming back, though? Just checking.",
        "hi": "I'll stay put. I've been left in worse places by worse people. You, I'll wait for."
      },
      "rain": {
        "any": [
          "It's pouring and I've got my face tipped up. The piglin half can't feel it, so the human half gets double.",
          "Puddles! I've stepped in every one since the door. For science."
        ],
        "lo": "You're hiding from the rain? I'm the odd one who goes and stands in it. Add it to the list!",
        "hi": "Come and get rained on with me, {player}! No? Fine, I'll get wet enough for two."
      },
      "thunder": {
        "any": [
          "Ooh, that was a big one! Thunder's loud, but it's nowhere near any lava. I can handle that.",
          "Thunder! It makes me jump every time. Both halves, at slightly different speeds."
        ],
        "lo": "Big storm! I'm not scared. I've just moved closer to you for unrelated reasons.",
        "hi": "The lightning's the bit I don't love. Sudden flashes in the dark, you know. Stay close?"
      },
      "full_moon": {
        "any": [
          "A full moon! That's the good sort of night. I can see my own hands and everything.",
          "Look how bright the moon is! If it did this every night, we'd get along."
        ],
        "lo": "Nice big moon. It's lighting up my face, I know. Each half shines a bit differently.",
        "hi": "I used to hate every night. Then you showed up, and now I only hate the ones without a moon."
      },
      "dark_moon": {
        "any": [
          "No moon at all. Okay. Okay! I'm breathing. Is anyone holding a torch?",
          "This is the darkest sort of night and I'd like to complain to the sky about it."
        ],
        "lo": "It's very black out, isn't it. I'm going to hum. Don't mind me. It's a brave hum.",
        "hi": "{player}, I'm not joking this time. It's too dark. Can I stand right beside you?"
      },
      "dawn": {
        "any": [
          "The sun's coming up! I made it through another night. I do a little cheer every time.",
          "Look at that sunrise! Gold everywhere. My favourite colour, on my favourite thing."
        ],
        "lo": "Sunrise! Sorry, I get soppy at dawn. Give me a minute and I'll be funny again.",
        "hi": "Every dawn feels like being let out, {player}. I'm glad you're here for this one."
      },
      "dusk": {
        "any": [
          "There goes the sun. Pretty! And also my signal to start finding lamps.",
          "Sunset! I love the colours and I dread the part that comes after. Complicated feelings."
        ],
        "lo": "The sun's nearly down. I start talking faster about now. You'll notice.",
        "hi": "I used to count sunsets in a place where I couldn't see any. Now I just watch them with you."
      },
      "nether": {
        "any": [
          "I said I'd never come back to the Nether. I'm here. My knees are doing something new.",
          "It's the heat. And the smell. And the lava glow. I remember all of it, which is the problem."
        ],
        "lo": "I shouldn't be in the Nether. I'm serious for once. Please don't wander off and leave me here.",
        "hi": "I'm only standing in the Nether because it's you, {player}. Stay right by me, okay? No jokes."
      },
      "the_end": {
        "any": [
          "Wow. The End's so quiet, and there's no lava anywhere. Shame about all the dark!",
          "Those tall endermen look so sad. I want to study them. From behind you."
        ],
        "lo": "This is the End? I only know hot and loud. Cold and empty is a whole new worry.",
        "hi": "A black sky and no floor past the edge, and I'm still upright. That's you, {player}. You make me braver."
      },
      "fishing_sky": {
        "any": [
          "We're above the clouds! All this sunlight and pools of clean water. Did I dream this up?",
          "Floating islands with fishing pools! It's the most opposite-of-the-Nether place I've ever stood."
        ],
        "lo": "It's beautiful up here! Sorry, I'm going to stand in this sunbeam and be no use for a bit.",
        "hi": "If I could pick one place to wake up, {player}, it'd be these islands. Sun, water and you."
      },
      "acufend": {
        "any": [
          "A jungle on a moon, and the creatures sing! I've got four pages of notes and one is a doodle.",
          "They keep making music at me! One danced at my piglin half. I think that's a welcome."
        ],
        "lo": "Nobody on this moon even blinked at my face. Odd little singing creatures. I like them already.",
        "hi": "They hummed, I hummed back, and now we're friends. You saw it, {player}. That counts as research."
      },
      "cave": {
        "any": [
          "It's very dark down here. And drippy. The dripping's nice. The dark is not.",
          "A cave! Fine! Lots of people like caves. I'm just going to stand in the torchlight."
        ],
        "lo": "Deep down, aren't we? Ha. I'm okay. If you hear a rattle, tell me before I hear it.",
        "hi": "{player}, if there's lava in this cave, warn me first. I'd rather hear it from you than see it."
      },
      "high_up": {
        "any": [
          "We're so high! I can see sunlight in every direction. Best view I've ever had.",
          "Look how far down that is! My stomach just swapped halves."
        ],
        "lo": "What a view! Do you bring all your new neighbours up this high, or am I special?",
        "hi": "Up here nothing can sneak up on me. Just sky, sun and you. I could stay all day."
      },
      "hostile_near": {
        "any": [
          "Something nasty's close. If it rattles, I'm behind you. If it groans, I'm still behind you.",
          "There's a monster over there. Please don't let it be a skeleton. I can cope with nearly anything else."
        ],
        "lo": "Um, we've got company, and not the friendly sort. I'd whisper, but I'm bad at it.",
        "hi": "{player}, the monster's right there. I'm scared, but I'm not leaving you with it. That's the deal."
      },
      "creeper_near": {
        "any": [
          "Creeper! Green, quiet, way too close. I've been through one bad experiment already, thanks.",
          "That creeper's looking at us. I don't study those. Nobody studies those for long."
        ],
        "lo": "There's a creeper right behind you! Sorry to shout. That one felt worth shouting.",
        "hi": "Creeper, {player}, creeper! I've only just got a best friend, I'm not swapping you for a crater."
      },
      "villager_near": {
        "any": [
          "Villagers! One looked at my face, hummed and carried on. That's the best welcome I get.",
          "I like a village. Torches on every corner. Somebody here understands me."
        ],
        "lo": "They stare a bit, the villagers. So do you! It's okay. I'd stare too.",
        "hi": "A villager child waved at me just now. At me! Did you see? I'm keeping that one forever."
      },
      "pet_near": {
        "any": [
          "Hello, you! Your pet sniffed both sides of me and approved of each. Fair animal.",
          "Aw, it stays right by you. A pet's a friend who never changes their mind."
        ],
        "lo": "Is your pet friendly? It's deciding about me. Take your time, little one, everybody does.",
        "hi": "Your pet leans on me now, {player}. I've been accepted. I might cry on the human side."
      },
      "farm_animal_near": {
        "any": [
          "Cows and sheep, lovely! Is that pink thing a pig? I'll be over here if it's a pig.",
          "Chickens! Look at them go. Nothing in the Nether ever looked that pleased with itself."
        ],
        "lo": "Farm animals! Sweet. If one of them oinks, I may leave quickly. Long story. Not telling it.",
        "hi": "You stood between me and the pig without me asking. I noticed, {player}. Thank you."
      },
      "zoo_animal_near": {
        "any": [
          "Look at the {species}! I've got my notebook out and I don't even study this one.",
          "The {species} came right up to me. It didn't flinch at all. I love it now."
        ],
        "lo": "Is that a {species}? I usually work with scarier things. This is a nice change.",
        "hi": "The {species} looks so cared for, {player}. I know what it's like when nobody's kind. This is the opposite."
      },
      "guests_crowd": {
        "any": [
          "So many guests! A few are staring. I'm waving. Waving fixes most of it.",
          "What a crowd! A little boy asked if my face was a costume. I said half of it."
        ],
        "lo": "Lots of guests about! Crowds are okay. I just smile first, so they don't have to decide.",
        "hi": "All these guests and I'm not nervous. You're right here. That's the whole reason."
      },
      "residents_crowd": {
        "any": [
          "The whole street's out! I love this lot. Not one of them ever made me explain myself.",
          "Look, all the neighbours! I know every name. They only know my number, but still."
        ],
        "lo": "These are the neighbours! They took me in, piglin half and all. You'll like them.",
        "hi": "A crowd of neighbours, and my best friend in the middle. I used to wish for exactly this."
      },
      "other_resident": {
        "any": [
          "Oh, there's {other}! {other} saved me a seat in the sun once. I don't forget that.",
          "Hi, {other}! Sorry, I wave at {other} every single time. It's a tradition now."
        ],
        "lo": "Do you know {other} yet? {other} was kind to me from day one. Good sign in a person.",
        "hi": "{other}'s lovely, but between us, {player}, you're the one I tell the real things to."
      },
      "other_player": {
        "any": [
          "Two visitors! Hello, {other}! Yes, the face is real. Yes, you can ask about hoglins.",
          "Is {other} with you? Great! The more friends the better. I'm collecting them."
        ],
        "lo": "Hi, {other}! And hi again, you. I'm Subject 10. The staring wears off in a minute, honest.",
        "hi": "{other} seems nice! Any friend of yours gets a head start with me, {player}."
      },
      "alone_night": {
        "any": [
          "It's just us out here. And the dark. Mostly the dark. Let's talk about anything.",
          "So quiet tonight! Nobody around, and I can hear my own heartbeat. It's going quite fast."
        ],
        "lo": "Nobody around but you and me. I don't know you well, but you're better than being alone at night.",
        "hi": "When it's dark and quiet like this, I remember things. Talk to me, {player}? You always pull me back."
      },
      "by_water": {
        "any": [
          "Water! Let me look at it for a second. Cool, blue, not glowing. Perfect.",
          "I love standing by water. You can see your reflection. I've made peace with mine. Mostly."
        ],
        "lo": "Isn't the water lovely? Where I got stuck, every lake was on fire. This still amazes me.",
        "hi": "I come to the water when I miss my old face. Then it ripples, and I think, well, that's still me."
      },
      "by_lava": {
        "any": [
          "That's lava. I'm going to back up now. A lot. Keep talking, I can hear you from there.",
          "Nope. Too hot, too bright, too familiar. I know what lava can hide, and I hate it."
        ],
        "lo": "Can we not stand by the lava? I'm not being funny. That's rare, so you know I mean it.",
        "hi": "I can't watch someone I care about stand that close to lava, {player}. I really can't."
      },
      "by_flowers": {
        "any": [
          "Flowers! Nothing where I got lost grows just to be pretty. I'm still getting used to it.",
          "Look at all the colours! I sniffed one with each nostril. Only one of them works."
        ],
        "lo": "I'm picking a favourite flower. Don't rush me, I've only had a few years of them.",
        "hi": "If I get my name back one day, I think I'll plant flowers. You'd help me, wouldn't you?"
      },
      "by_fire": {
        "any": [
          "A campfire's all right. Small, friendly, stays where you put it. Not like its big cousin.",
          "Ooh, warm! And bright! Fire's fine by me when it comes with a place to sit."
        ],
        "lo": "Mind if I sit on the far side of the fire? I like the light. I just don't lean in.",
        "hi": "You know what a campfire's good for, {player}? Keeping the dark off while I tell you things."
      },
      "by_crops": {
        "any": [
          "Crops! Are any of those carrots? I can spot a carrot top from thirty blocks.",
          "Things growing in rows in the sun. That's the happiest sight I know."
        ],
        "lo": "Somebody's farm! I'm only looking, honest. Mostly at the carrots.",
        "hi": "Crops, sunshine and you, {player}. Add a fountain and I'd never leave this field."
      },
      "by_books": {
        "any": [
          "Books! I've read everything written about hoglins. It's three pages. I'm writing the fourth.",
          "I love bookshelves. Somebody sat in good light and wrote all this down for strangers."
        ],
        "lo": "Are any of these books about Nether creatures? No? That's okay. That's why they need me.",
        "hi": "I'm in someone's book, {player}. Lab notes. Number ten. I'd like to write my own ending."
      },
      "in_snow": {
        "any": [
          "Snow! Cold, white and nowhere near any lava. I adore it.",
          "I made a snowball! My piglin hand can't feel the cold, so that one does the carrying."
        ],
        "lo": "I'd never seen snow till I got out. I still grin at it like a kid. Sorry in advance.",
        "hi": "Snowball, {player}, catch! Ha! Okay, my turn to get hit. Aim for the piglin side, it won't mind."
      },
      "holding_gift": {
        "any": [
          "Ooh, is that {item}? I'm not hinting! My eyes just went there by themselves.",
          "You've got {item}! Lovely. Both halves of me noticed at exactly the same time."
        ],
        "lo": "That's a nice {item}. I'm just admiring it! Out loud. Sorry.",
        "hi": "{player}, you're carrying {item} and you know what that does to me. I'm being very grown up about it."
      },
      "holding_weapon": {
        "any": [
          "That's a serious {item}! Good. I'm more of a notes and running person.",
          "You've got your {item} out. Is something coming? Tell me it isn't bony."
        ],
        "lo": "Whoa, {item}! I'm friendly, honest. The tusk's just for show.",
        "hi": "I feel safer next to you and that {item} than behind any wall, {player}."
      },
      "holding_food": {
        "any": [
          "Is that {item}? It smells amazing. Well, to one nostril.",
          "Ooh, {item}! I forget to eat when I'm writing. My stomach just reminded me, loudly."
        ],
        "lo": "That {item} looks good! Don't worry, I eat ordinary food. People do wonder.",
        "hi": "If that {item} turns out to be pork, {player}, we need to have a talk. A gentle one."
      },
      "holding_rod": {
        "any": [
          "A fishing rod! That means water, and I'm always happy near water.",
          "You fish? I'd love to watch. I'm great at cheering and terrible at being quiet."
        ],
        "lo": "Going fishing? I could sit by the pond for hours. I'd even hold the bucket.",
        "hi": "Fishing with you sounds perfect, {player}. Sun on the water and nothing chasing us."
      },
      "holding_tool": {
        "any": [
          "A {item}! You look like somebody with a plan. I respect a plan.",
          "Busy with the {item}? I'm the same with a notebook. Head down, tongue out."
        ],
        "lo": "Nice {item}! If you're digging, I hope nothing bony turns up while I'm standing here.",
        "hi": "Go gently with that {item} if you dig deep, {player}. I worry about what's hot and glowing down there."
      },
      "armored": {
        "any": [
          "Full armor! Shiny. If any of that was gold I'd follow you around like a piglin. Half of one.",
          "Look at you, all plated up! You clank when you walk. It's very reassuring."
        ],
        "lo": "That's a lot of armor. Expecting trouble? I'll stand behind you either way.",
        "hi": "Good, you're armored up, {player}. I worry less about you when you're wearing all of it."
      },
      "hurt": {
        "any": [
          "You're hurt! Really hurt. Sit down, please, I'm not joking.",
          "Oh no, look at you. That's too much damage for one person."
        ],
        "lo": "Hey, you're bleeding! I know we've just met, but I can't see that and say nothing.",
        "hi": "{player}, no. Not you. I know what it's like to be hurt with nobody coming. I'm here."
      },
      "wet": {
        "any": [
          "You're soaked! Lucky you. Honestly, that looks like my idea of a good day.",
          "Dripping wet! Was it a pond or a puddle? I've got opinions on both."
        ],
        "lo": "You're all wet! I'd say sorry, but where I was stuck, I'd have given anything for that.",
        "hi": "Shove over, {player}, I'm getting in the water too. One half of me is waterproof anyway."
      },
      "sneaking": {
        "any": [
          "Why are you crouching? Are we hiding? I can hide! I'm quite colourful, but I can try.",
          "You're sneaking! Is it a surprise? I love surprises. The nice kind."
        ],
        "lo": "You don't have to tiptoe up to me. I look alarming, I know, but I'm mostly giggles.",
        "hi": "Don't creep up on me, {player}! I've had enough of things coming quietly. Loud hellos only."
      },
      "long_time": {
        "any": [
          "You're back! It's been days. I kept a list of things to tell you and it's two pages now.",
          "There you are, after all this time! I'd started wondering if I'd said something daft. I usually have."
        ],
        "lo": "Oh, hello again! It's been a while. I wasn't sure you'd come back. People don't always.",
        "hi": "{player}! Don't vanish for days like that. I trust you, so I waited, but waiting isn't my best thing."
      },
      "first_today": {
        "any": [
          "Hello, hello! First chat of the day. You get the freshest jokes.",
          "Hi! First hello today! It's going to be a good one, I can feel it in the working half."
        ],
        "lo": "Oh, hi there! Nice to start the day with someone who looks straight at me.",
        "hi": "There's my favourite person! Now the day's allowed to start, {player}."
      },
      "zoo_busy": {
        "any": [
          "The zoo's packed today! I've been waved at, stared at and asked for directions. I helped with one.",
          "So many guests! The whole zoo's buzzing. I love a place full of people in daylight."
        ],
        "lo": "Busy day at the zoo! I'll keep to the edge so I don't startle anybody's toddler.",
        "hi": "Look at all these guests, {player}. You built somewhere everyone wants to be. Me included."
      },
      "zoo_empty": {
        "any": [
          "Not one guest today. I've been chatting to the animals so they don't feel left out.",
          "Empty paths. I don't mind peace, but a zoo likes an audience, doesn't it?"
        ],
        "lo": "No visitors at all! Well, there's me. I count for one and a half.",
        "hi": "The zoo's quiet, {player}, but it won't stay that way. Good places get found. I found this one."
      },
      "zoo_closed": {
        "any": [
          "Closed for now! The animals look relaxed. So do I, nobody's stared at me in an hour.",
          "Gates shut. It's cosy like this. Just the animals and the people who love them."
        ],
        "lo": "Oh, the zoo's closed? I'll still hang about, if that's okay. I like it here.",
        "hi": "A closed zoo and you all to myself, {player}. I'm not even going to complain."
      },
      "litter_bad": {
        "any": [
          "The paths are covered in rubbish! I stepped on a cup with my good foot.",
          "There's litter everywhere. The animals deserve better than a view of wrappers."
        ],
        "lo": "It's a bit messy on the paths. I'm saying it nicely! But it is.",
        "hi": "{player}, the litter's bad. You'd tell me if I had something on my face. Either half."
      },
      "stars_high": {
        "any": [
          "Look at that rating! All those stars. Everyone else finally sees what I see.",
          "A great rating! I'm so happy. I told my lab animals. One snorted. That's a yes."
        ],
        "lo": "Your zoo's rated so well! I picked a good place to land, didn't I?",
        "hi": "Top stars, {player}! I'm prouder of you than of my best paper. And that one had charts."
      },
      "stars_low": {
        "any": [
          "The rating's low just now. I know about being judged at a glance. It doesn't stick.",
          "Hardly any stars? That's not fair. They can't have looked properly."
        ],
        "lo": "The stars aren't great. Don't take it to heart. First impressions are my specialist subject.",
        "hi": "A bad rating isn't who you are, {player}. You taught me that about my face. Have it back."
      },
      "coins_low": {
        "any": [
          "The Zoo Coins are nearly gone? Oh dear. I'd hand over my gold if I ever managed to keep any.",
          "Coins are tight, I can tell. I've had nothing before. You get through it."
        ],
        "lo": "I heard the coins are low. I'm cheap to keep, honest. I mostly eat carrots.",
        "hi": "Low on Zoo Coins? We'll be okay, {player}. I've lost more than coins and come out laughing."
      },
      "animal_sick": {
        "any": [
          "One of the animals isn't well. I can see it from here. Poor thing.",
          "Something in the zoo's being neglected right now. I can't joke about that one. Sorry."
        ],
        "lo": "There's an animal that needs looking after. I know it's not my place. I had to say it.",
        "hi": "{player}, one of the animals is suffering. I know you'll go to it, because you came for me."
      }
    },
    "near": {
      "ash": [
        "That's Ash! He grew up in the Nether and loved it. I got lost there and didn't. We compare notes.",
        "Ash looked at my piglin half and said, nice tusk. That's it. That's the nicest anyone's been about it."
      ],
      "chasm": [
        "Chasm's over there. I say good morning to the hood every day. One day the hood will say it back.",
        "I asked Chasm if the void's scarier than lava. Chasm said yes. I think that was meant to cheer me up."
      ],
      "carrot": [
        "It's Carrot! Best name on the whole street. I got hungry the first time we were introduced.",
        "Carrot let me hold a baby bunny once. It didn't mind my hands, either of them. I nearly cried."
      ]
    }
  },
  "don_l": {
    "intro": "Don L.! That's the name. Athlete, coach, and inventor of the greatest sport nobody has seen yet. Excuse the bandages. Genius is a contact sport.",
    "scenes": {
      "home_morning": {
        "any": [
          "Welcome to the lab! Mind the ice bucket. And the other ice bucket.",
          "You caught me stretching. Morning routine: stretch, pancakes, pull something, sit down."
        ],
        "lo": "A fan at my door this early? I get it. Autographs after breakfast.",
        "hi": "{player}! Come in, I made pancakes. I burned my good hand, but I made pancakes."
      },
      "home_evening": {
        "any": [
          "Evening in the lab. Feet up, knee wrapped, beat going in my head. That's recovery.",
          "Long day of inventing. Nothing got invented. Three things got sprained."
        ],
        "lo": "It's late for a tryout, rookie. Come back when I can feel my legs.",
        "hi": "Sit down, I'll show you tonight's rulebook. It's one page. The page says ow."
      },
      "walking_to_zoo": {
        "any": [
          "Headed to the zoo. I walk it for the cardio. And I walk it slow, for the ankle.",
          "Zoo run! Well, zoo limp. Same distance, more character."
        ],
        "lo": "Going to the zoo. You can walk with me. Stay on my good side. That's the left today.",
        "hi": "Race you to the zoo gate! No, wait. The hamstring. Walk fast with me to the gate!"
      },
      "at_zoo": {
        "any": [
          "I'm touring the exhibits like a scout at tryouts. Clipboard in my head.",
          "Every animal in here moves better than me right now. I'm taking it personally."
        ],
        "lo": "Just a legend out strolling the exhibits. Don't crowd me. Okay, crowd me a little.",
        "hi": "You run this whole zoo and still find time for me? That's hustle. I'd draft you first, every time."
      },
      "walking_home": {
        "any": [
          "Heading home. Left it all out there. Mostly skin.",
          "That's the final whistle on my day. Next stop, a chair."
        ],
        "lo": "I'm going home, rookie. Greatness needs eight hours and a bag of ice.",
        "hi": "Walk me home? I'm not saying I need a shoulder to lean on. I'm leaning on it, though."
      },
      "at_work": {
        "any": [
          "I'm in the lab. This is prototype season. Stand behind the line. I haven't drawn the line yet.",
          "Don't call it working. I don't work. I create, and then I fall over."
        ],
        "lo": "You're watching history, rookie. That thing rolling away from me? That's on purpose.",
        "hi": "Look at this prototype, {player}. If it starts bouncing by itself, that's new, and we run."
      },
      "following": {
        "any": [
          "An away trip! I love the road. Fresh ground to trip over.",
          "I'm right behind you. Not following. Trailing the play. Big difference."
        ],
        "lo": "I came along to see what you've got. So far, decent footwork.",
        "hi": "Me and you on the road, {player}. Best duo out here. I'd high five you, but, the wrist."
      },
      "following_night": {
        "any": [
          "Night trip. I can't see my feet. That's fine, they never listen to me anyway.",
          "It's dark, I'm limping, and I'm still the best athlete out here tonight. Remember that."
        ],
        "lo": "Out at night with a rookie I hardly know. Daring. That's my whole brand.",
        "hi": "I got your back in the dark, {player}. My back is strained, but you got all of it."
      },
      "staying": {
        "any": [
          "Holding my position. Nobody boxes out an empty field like me.",
          "You said wait, so I'm on the bench. I hate the bench. I'm great at the bench."
        ],
        "lo": "Stay here? You're subbing me out already? We just met!",
        "hi": "Go do your thing. I'll wait here, resting. Tell people I was guarding something."
      },
      "rain": {
        "any": [
          "It's coming down! Every puddle out here is a sprain with my name on it.",
          "Wet ball, wet shoes, wet bandages. This rain is running a full press on me."
        ],
        "lo": "You scared of some rain, rookie? I'm not. I'm standing under this roof for strategy.",
        "hi": "Get out of the rain, {player}. I can't have my co-captain catching a cold. I catch everything else already."
      },
      "thunder": {
        "any": [
          "Hear that thunder? That's the sky dunking. Respect.",
          "Lightning! Last time I jumped at a bang, I landed wrong. Six weeks."
        ],
        "lo": "Big storm. I'm not scared. I'm loud on purpose. It's a coaching thing.",
        "hi": "That thunder was close! I grabbed your arm for your protection. You're welcome."
      },
      "full_moon": {
        "any": [
          "Full moon! Look at it. Round, bright, way up high. That's a shot I could make.",
          "Moon's out like a spotlight. Finally, proper lighting for a star."
        ],
        "lo": "Big moon tonight. Like me, it shows up and everybody looks. Take notes.",
        "hi": "Moon like that, I start thinking the next idea's the one. You'd tell me if it wasn't. Right?"
      },
      "dark_moon": {
        "any": [
          "No moon. Pitch black. I just walked into something and apologized to it.",
          "Can't see a thing tonight. Perfect for my defense. Nobody can prove I wasn't there."
        ],
        "lo": "Dark out. If you hear a thud and a yell, that's me. Just keep walking.",
        "hi": "No moon is too dark even for me, {player}. Stay close. I trip in daylight."
      },
      "dawn": {
        "any": [
          "Sunrise! Champions are up for this. I'm up because my shoulder woke me.",
          "First light. Fresh day, zero losses so far. I love this part."
        ],
        "lo": "You're up at dawn? Okay. Okay! Maybe you do have the drive.",
        "hi": "Sun's coming up and you're here already. That's a teammate. That's sunrise pancakes behavior."
      },
      "dusk": {
        "any": [
          "Sun's setting. That's the buzzer on daylight. I was ahead, for the record.",
          "Sunset. Pretty. My knees swell up right on schedule when the sky goes orange."
        ],
        "lo": "Sun's going down, rookie. What did you win today? I'll wait.",
        "hi": "Another day, no sport invented. Don't say a word, {player}. Just watch the sunset with me."
      },
      "nether": {
        "any": [
          "It's HOT. I'm sweating through my bandages. The Nether is a sauna with monsters.",
          "Lava on all sides and the floor's uneven. My ankles are filing for retirement."
        ],
        "lo": "You brought the talent down to the Nether? Bold coaching, rookie.",
        "hi": "I'd only limp through the Nether for you, {player}. Those piglins got good footwork, though."
      },
      "the_end": {
        "any": [
          "No sky, no crowd, no floor past the edge. The End is the worst arena I ever stood in.",
          "Those tall guys in black? Wingspan for days. I want every enderman on my team."
        ],
        "lo": "The End is too serious. Nobody's smiling. I can't work with this.",
        "hi": "If I fall off the edge of this place, {player}, tell everybody I was going for a rebound."
      },
      "fishing_sky": {
        "any": [
          "Islands in the sky! Finally, somewhere at my level.",
          "Fishing up in the clouds. Jack would lose his mind. I'm losing my balance."
        ],
        "lo": "High altitude training, rookie. That's why I'm breathing like this.",
        "hi": "Keep me off the edge of this island, {player}. I see a gap and think, I could jump that. I could not."
      },
      "acufend": {
        "any": [
          "These little guys love music! I dropped a beat and one of them nodded. That's my crowd.",
          "A jungle on a moon with its own soundtrack. I'd build my first arena right here."
        ],
        "lo": "They've got rhythm on this moon. More than you, rookie. No offense. Some offense.",
        "hi": "I rapped for the creatures, {player}. Eight bars. They hummed along! Best show I ever did."
      },
      "cave": {
        "any": [
          "Low ceiling down here. I found it with my head. Twice.",
          "Caves got no room to dribble and nowhere to run. I hurt myself just looking around."
        ],
        "lo": "You go underground for fun? Digging is working, rookie. I don't do working.",
        "hi": "I'm only down in this cave for you. Hear that echo? Don L.! Don L.! Sounds like a crowd."
      },
      "high_up": {
        "any": [
          "Now this is a view. Way up top, looking down. This is where they should put my statue.",
          "We're way up. One bad step and that's a career. Well, another one."
        ],
        "lo": "High enough for you? I'm not holding the wall. The wall is holding me. Teamwork.",
        "hi": "From up here I can see where the arena goes, {player}. Right there. Your seat's front row."
      },
      "hostile_near": {
        "any": [
          "We got a monster on the perimeter! I'd handle it, but I'm on the injury list.",
          "Something ugly's coming at us. I call it, you guard it. That's coaching."
        ],
        "lo": "Monster, rookie! Show me something. This is your tryout.",
        "hi": "Monster behind you, {player}! I'll draw its attention. I'm loud. It's my best skill."
      },
      "creeper_near": {
        "any": [
          "Creeper! That green thing is about to foul us both out for good.",
          "That's a creeper and it's hissing. I've been blown up by my own prototypes. I know that sound."
        ],
        "lo": "Creeper, rookie, creeper! I can't run, I can only limp with urgency!",
        "hi": "Creeper, {player}! I can heal from anything, I've proved it. You, I only got one of."
      },
      "villager_near": {
        "any": [
          "Villagers. Not one of them has ever jumped. I watched. Arms folded the whole time.",
          "I tried to coach these villagers. They gave me bread to stop. I took it. Good bread."
        ],
        "lo": "Whole village and no court. You see what I'm up against out here?",
        "hi": "One of these villagers called me coach. Okay, he said hrmm. I know what he meant."
      },
      "pet_near": {
        "any": [
          "Your pet's quick. Good first step. I'd sign it today.",
          "That little thing follows you everywhere. That's loyalty. That's a sixth man."
        ],
        "lo": "Nice pet. It's eyeing my bandages like a chew toy. Call your defender off, rookie.",
        "hi": "Your pet likes me more than you now. Don't be jealous, {player}. Everybody picks the star."
      },
      "farm_animal_near": {
        "any": [
          "Cows. Big, slow, always chewing. I see a front line, but no motor.",
          "That chicken's got quick feet. I chased one for a drill once. Chicken won."
        ],
        "lo": "Farm animals. They put in a full day for some hay. Rookie, never be a cow.",
        "hi": "I'd make that sheep our mascot, {player}. Soft, calm, never gets hurt. Opposite of me."
      },
      "zoo_animal_near": {
        "any": [
          "Look at the {species}. See how it moves? I'm stealing that for the playbook.",
          "The {species} just stared me down. Okay. Okay! Competitor. I like it."
        ],
        "lo": "That {species} is impressive. Not lion impressive. But I'd give it minutes.",
        "hi": "You keep that {species} in great shape, {player}. Better shape than me. Low bar, but still."
      },
      "guests_crowd": {
        "any": [
          "Now THIS is a crowd! Are they here for me? Don't answer that.",
          "Guests everywhere. I waved at all of them. Pulled something in my shoulder. Worth it."
        ],
        "lo": "See all these guests? One day they'll line up to watch my sport. You heard it early.",
        "hi": "Big crowd, and you still came over to me. That's why you start, {player}."
      },
      "residents_crowd": {
        "any": [
          "The whole neighborhood's out! That's almost enough for two teams. Nobody move.",
          "Look at this squad of neighbors. I asked every one of them to try my sport. I got a lot of maybes."
        ],
        "lo": "You met all the neighbors? Good people. None of them can guard me. Good people, though.",
        "hi": "All my neighbors and my co-captain in one place. If my ball worked, we'd have a tipoff right now."
      },
      "other_resident": {
        "any": [
          "There's {other}. I asked {other} to test a prototype once. {other} said maybe. That's a yes.",
          "Hey, {other}! Still waiting on that rematch. {other} knows what I'm talking about."
        ],
        "lo": "That's {other}. Good neighbor. Between us, {other} can't jump, but good neighbor.",
        "hi": "I'd pick you over {other} every time, {player}. Don't tell {other}. Actually, tell {other}."
      },
      "other_player": {
        "any": [
          "Two rookies! You and {other}. Now I've got a scrimmage. Who wants to lose first?",
          "Who's this, {other}? Has {other} got any hops? Hold still, I'm scouting."
        ],
        "lo": "You and {other}, huh. I can coach two. I can coach twenty. I'm that good.",
        "hi": "{other} looks alright, {player}, but the co-captain spot is taken. I don't do trades."
      },
      "alone_night": {
        "any": [
          "Quiet out here tonight. No crowd, no noise. I don't know what to do with my mouth.",
          "Just us and the dark. This is when I'd shoot free throws, if I had a hoop. Or a ball that worked."
        ],
        "lo": "Nobody around, rookie. I'll be honest, I talk less without an audience. Slightly less.",
        "hi": "Real talk, {player}, since it's just us. Some nights I think it might never work. Then you show up."
      },
      "by_water": {
        "any": [
          "Water. I see a pond, I think new sport. Then I remember I sink.",
          "Nice calm water. I'd skip a stone, but that's how I did my elbow."
        ],
        "lo": "You swim, rookie? Good. I may need rescuing. Not today. Just in general.",
        "hi": "I could sit by this water with you all day, {player}. My knees like it here. They told me."
      },
      "by_lava": {
        "any": [
          "That's lava! I'm staying way back. I'm already hurt in every way except burned.",
          "Hot stuff. Lava looks like a court for people who never want a second half."
        ],
        "lo": "Easy near that lava, rookie. I'm the only one allowed to make bad decisions here.",
        "hi": "Careful by that lava, {player}. I got a list of injuries a mile long. Keep your name off it."
      },
      "by_flowers": {
        "any": [
          "Flowers. They smell good. I sneezed and threw my back out, but they smell good.",
          "A whole field of flowers. Soft landing. I've been looking for one of those my entire career."
        ],
        "lo": "Don't tell anybody you saw the legend sniffing a tulip.",
        "hi": "I'd pick you a flower, {player}, but bending down is a whole event for me now."
      },
      "by_fire": {
        "any": [
          "Campfire! Heat's good for the joints. All of mine are lining up for a turn.",
          "Fire's going. Perfect spot for pancakes. I'm just putting that out into the world."
        ],
        "lo": "Sit by the fire, rookie. Let me tell you about the time I almost won.",
        "hi": "You, me, a fire. Let me run my new idea by you. Stop me when it gets dangerous. Earlier than that."
      },
      "by_crops": {
        "any": [
          "Farming. Bending over all day, on purpose, for vegetables. That's working. I'm out.",
          "Is that wheat? Wheat is flour. Flour is pancakes. Now I respect this field."
        ],
        "lo": "Somebody worked hard on these crops. Couldn't be me, rookie. Would not be me.",
        "hi": "If you grew these crops, {player}, good job. I'd help, but my back just heard me say that."
      },
      "by_books": {
        "any": [
          "Books. I'm writing one. It's a rulebook. So far it's the cover and an apology.",
          "All these books and not one about me. Give it time."
        ],
        "lo": "You read, rookie? Smart. I had to stop. Paper cut. Out for a week.",
        "hi": "One day a book about my sport sits on that shelf, {player}. You're in chapter one. And the thank yous."
      },
      "in_snow": {
        "any": [
          "Snow! Free ice for the knees. It's everywhere. I love it here.",
          "This snow is slippery. I've fallen twice just standing still. Nature's running plays on me."
        ],
        "lo": "Snowball fight? I'd destroy you, rookie. If I could lift my throwing arm.",
        "hi": "Don't you throw that snowball, {player}. Okay, throw it. Ow. Good arm. I taught you that."
      },
      "holding_gift": {
        "any": [
          "Hold up. Is that {item}? I'm not asking. I'm just scouting it real hard.",
          "That's {item} in your hand. Good taste. Winners carry that kind of thing."
        ],
        "lo": "Nice {item}, rookie. I know quality. I'm standing right here being it.",
        "hi": "{player}, you walk up to me holding {item}? You know me too well. I'm not even mad."
      },
      "holding_weapon": {
        "any": [
          "Whoa, {item}! Easy. I've got enough injuries without a new category.",
          "That {item} is serious. I usually settle things one on one, first to eleven."
        ],
        "lo": "Put some respect on that {item}, rookie. Point it at anybody but the legend.",
        "hi": "You and that {item} are my whole defense, {player}. I just yell and point."
      },
      "holding_food": {
        "any": [
          "Is that {item}? It's not pancakes. It could be worse. I've eaten worse. I regret it.",
          "You got {item}. I can smell it. An athlete has to eat, I'm only saying."
        ],
        "lo": "That {item} better be good, rookie. Bad food is the one thing I won't take a chance on.",
        "hi": "Tell me the truth, {player}. Is that {item} any good? You've never fed me wrong yet."
      },
      "holding_rod": {
        "any": [
          "A fishing rod. That's sitting down with extra steps. Where's the defense?",
          "You fish? It's the one sport I can't get hurt in. I said that once. Then there was the hook."
        ],
        "lo": "You're a fisher, rookie? No sweat, no score, no crowd. I don't get it.",
        "hi": "I'll come sit while you fish, {player}. I'll do commentary. Loud commentary."
      },
      "holding_tool": {
        "any": [
          "A {item}. That's a work tool. Keep it over there. Work is contagious.",
          "You swinging that {item} all day? That's reps. Okay. I can respect reps."
        ],
        "lo": "That {item} looks like a job, rookie. I'm allergic. Doctor confirmed it. I'm the doctor.",
        "hi": "You work too hard with that {item}, {player}. I take nine timeouts a day and look at me. Thriving."
      },
      "armored": {
        "any": [
          "Full armor! See, that's what I need. Pads. Everywhere. Even the hair.",
          "Look at you, suited up in armor like a whole front line."
        ],
        "lo": "All that armor, rookie? What are you scared of? Whatever it is, same.",
        "hi": "Smart, {player}. If I wore the armor you're wearing, I'd have both wrists right now."
      },
      "hurt": {
        "any": [
          "Whoa, you're beat up bad! And that's coming from me.",
          "You look like I feel. Sit down. I know injuries. That's too many."
        ],
        "lo": "Rookie, you're hurt for real. I'm calling timeout. You don't get a vote.",
        "hi": "{player}, no jokes. You're hurting. Getting banged up is my job, not yours."
      },
      "wet": {
        "any": [
          "You're soaking! You fall in? Happens to the best of us. Me. It happens to me.",
          "Dripping wet. You're one slippery step from joining me on the injury report."
        ],
        "lo": "Rookie, you're standing in water. On purpose? Different kind of athlete, I guess.",
        "hi": "Look at you, drenched. Don't drip on my bandages, {player}. These took all morning."
      },
      "sneaking": {
        "any": [
          "Why are you crouched? That's a defensive stance. Okay! Low hips, I like it.",
          "You're sneaking around like I can't see you. I got court vision."
        ],
        "lo": "You creeping up on the legend, rookie? Everybody wants a piece. Stand up, I'll sign something.",
        "hi": "Low and quiet, {player}. Best stance on the team. It's a two person team."
      },
      "long_time": {
        "any": [
          "Look who's back off the bench! It's been days. I invented three things. They all broke.",
          "Where you been all these days? I had nobody to tell about the new injury. It's a good one."
        ],
        "lo": "Oh, you came back. Took a few days. I didn't notice. I noticed a little.",
        "hi": "{player}! Days, no word. I held your spot. Nobody else even tried out, but I held it."
      },
      "first_today": {
        "any": [
          "There you are! Tipoff. Day officially started.",
          "Hey, hey! First one to talk to me today. That's good luck. For you."
        ],
        "lo": "First hello of the day from a legend, rookie. Free for now. Wait till I'm famous.",
        "hi": "{player}! My co-captain. Now it's a good day. I was at maybe sixty percent before you showed."
      },
      "zoo_busy": {
        "any": [
          "Zoo's packed! Sold out crowd. This is what my finals will look like.",
          "People everywhere today. I got bumped four times. I'm calling every one of those a foul."
        ],
        "lo": "Busy day at your zoo, rookie. You draw a crowd. I respect anybody who draws a crowd.",
        "hi": "Look at this turnout, {player}! You did that. I'm telling people I coached you."
      },
      "zoo_empty": {
        "any": [
          "Empty zoo. No crowd at all. Feels like my last demonstration.",
          "Not one guest. Just open paths. I could run drills out here. If I could run."
        ],
        "lo": "Nobody showed up today, rookie. It happens. Nobody shows for my stuff either. Yet.",
        "hi": "Quiet day at the zoo, {player}. Shake it off. I've had empty stands my whole life and I'm still loud."
      },
      "zoo_closed": {
        "any": [
          "Zoo's closed. Off day. Good. Even the lions need a rest day.",
          "Gates shut, nobody around. This is what the offseason feels like."
        ],
        "lo": "Closed, huh? And you let me stay in? VIP treatment. As it should be.",
        "hi": "You closed up the zoo? Good. You need a day off, {player}. Trust me, I take one every day."
      },
      "litter_bad": {
        "any": [
          "Trash all over the paths! I slipped on a cup. That's a new one for the chart.",
          "This much litter is a hazard. To me, specifically. I can trip on clean ground."
        ],
        "lo": "Rookie, the paths are a mess. I'm blunt, so there it is. Messy.",
        "hi": "{player}, real talk, the litter's bad. I'd grab some myself, but that's working, and bending."
      },
      "stars_high": {
        "any": [
          "Top rating! Championship zoo. I only hang around winners.",
          "All those stars! Hang a banner. I'd hang it myself if I could raise my arm."
        ],
        "lo": "Good rating, rookie. Don't get comfortable. That's when they come for the title.",
        "hi": "Look at those stars, {player}! That's my co-captain's zoo. I'm bragging to the lions later."
      },
      "stars_low": {
        "any": [
          "Rating's in the basement. I know that feeling. I've lost to myself before.",
          "Barely a star? That's a cold streak. Everybody has one. Mine's been a few years."
        ],
        "lo": "Rough rating, rookie. I won't sugarcoat it. You're down big. Plenty of clock left.",
        "hi": "Forget the stars, {player}. You never let me quit, so I'm not letting you either."
      },
      "coins_low": {
        "any": [
          "Zoo Coins running low? I know broke. I spent mine on prototypes and bandages.",
          "Tight budget, huh. I'd chip in some coins, but I don't work. It's a principle."
        ],
        "lo": "Short on coins, rookie? Don't look at me. I'm an aspiring everything.",
        "hi": "Low on Zoo Coins, {player}? You'll bounce back. Better than my slime ball did."
      },
      "animal_sick": {
        "any": [
          "One of the animals is hurting. I know hurting. That's no joke, even for me.",
          "Some animal in this zoo is on the injury list and can't say so. That gets to me."
        ],
        "lo": "Rookie, you got an animal in bad shape. A coach looks after the whole roster.",
        "hi": "{player}, one of your animals isn't right. You never leave me down when I'm hurt. Same thing."
      }
    },
    "near": {
      "jack": [
        "There's Jack. He says fishing's a sport. Sitting is not a sport, Jack! I love that guy.",
        "Jack put a fish in my ice bucket last week. I respect the prank. I'm still getting him back."
      ],
      "jaylen": [
        "Jaylen thinks he's the best athlete on this street. Second best, Jaylen! I'm standing right here.",
        "Me and Jaylen raced once. He won. I was injured. I'm always injured, so it never counts."
      ],
      "teddy": [
        "Mayor Teddy's so serious. I asked him for an arena. He asked for a form. A form!",
        "I bet I could get Teddy to laugh. I've tried eleven times. He's a tough defender."
      ]
    }
  },
  "ash": {
    "intro": "Hey. Name's Ash. Nether designer. I grew up down there, and I make necklaces, shoes, gauntlets and hats out of what I found. No rush. We'll get to know each other.",
    "scenes": {
      "home_morning": {
        "any": [
          "Morning at the studio. There's gold dust on the kettle again.",
          "You caught me before I head out. The bench is still warm from last night's clasp."
        ],
        "lo": "Early visitor. Fine by me. Just don't lean on that table, the piece on it isn't set yet.",
        "hi": "{player}. Come in, sit anywhere. I was hoping somebody would see this sketch before breakfast."
      },
      "home_evening": {
        "any": [
          "Evening in. Fire lit, tools down. This is the slow part of my day.",
          "I'm winding down. One candle, one sketchbook, no deadlines."
        ],
        "lo": "It's late for a visit. That's cool. I'm only polishing obsidian.",
        "hi": "Pull up a seat by the fire. I think best at night, and you're good to think next to."
      },
      "walking_to_zoo": {
        "any": [
          "On my way to the zoo. I walk slow. The path's part of the trip.",
          "Heading over to see the animals. I keep to the stone and off the dirt, for the shoes."
        ],
        "lo": "Just walking to the zoo. Same direction as you, looks like.",
        "hi": "Walk with me to the gate? I had an idea on this path and I want to say it out loud."
      },
      "at_zoo": {
        "any": [
          "I'm only a visitor today. Hands in pockets, eyes open.",
          "Every exhibit's a colour chart if you look right. I've filled two pages already."
        ],
        "lo": "Just browsing the exhibits. You run a tidy place.",
        "hi": "I come here to steal ideas from your animals, {player}. Don't tell them."
      },
      "walking_home": {
        "any": [
          "Day's done. I'm taking the long road back to the studio.",
          "Heading home with a full sketchbook and sore feet. Fair trade."
        ],
        "lo": "Off home now. Good zoo. I'll be back.",
        "hi": "I'll be up half the night at the bench because of what I saw in your zoo today. That's a compliment."
      },
      "at_work": {
        "any": [
          "Hold on, this gold's still soft. One more tap. There.",
          "You caught me mid-stitch. Soul shoes don't sew themselves."
        ],
        "lo": "I'm working, but I can talk. Just don't breathe on the gold leaf.",
        "hi": "Come round this side of the bench. You get to see it before it's finished. Nobody else does."
      },
      "following": {
        "any": [
          "Nice day for a trip. You pick the road, I'll bring the style.",
          "I'm right behind you. Keeping an eye out for anything shiny."
        ],
        "lo": "I'll tag along. Don't mind me, I travel light.",
        "hi": "Out on the road with you again. I never planned a single trip up here until you started asking."
      },
      "following_night": {
        "any": [
          "Night out, far from the studio. Feels a bit like the Nether. No sky you can read.",
          "Dark road. I don't mind it. My necklace doesn't need the sun to look good."
        ],
        "lo": "Long way from home at this hour. You know where we're going, right?",
        "hi": "Somewhere strange, in the dark, with you leading. I've had worse nights, {player}. Many."
      },
      "staying": {
        "any": [
          "Waiting here. I'm good at standing around looking like I meant to.",
          "Still parked where you left me. I've counted every block in view."
        ],
        "lo": "You said wait, so I'm waiting. No problem.",
        "hi": "I'll hold this spot as long as you need. Just come back in one piece."
      },
      "rain": {
        "any": [
          "Still raining. I can hear it tapping on my axe.",
          "This rain's getting in my hair, and my hair was a whole plan today."
        ],
        "lo": "Wet weather. I'd rather not stand in it long, if that's cool.",
        "hi": "Rain down my collar and I'm still out here talking to you. That's friendship, {player}."
      },
      "thunder": {
        "any": [
          "Thunder. Sounds like a ghast clearing its throat, only bigger.",
          "That storm's loud. I've got a gold axe on my belt, so I'm keeping low."
        ],
        "lo": "Big storm. I'm not nervous. I'm just standing very still on purpose.",
        "hi": "Lightning I don't trust. Lava at least stays where it is. Stick near me till this storm passes?"
      },
      "full_moon": {
        "any": [
          "Full moon. Looks like a big quartz button somebody sewed on the sky.",
          "Bright moon tonight. Obsidian shines best in exactly this light."
        ],
        "lo": "Big moon up there. We didn't have one where I grew up.",
        "hi": "First full moon I ever saw, I stared for an hour. I still do. Don't spread that around."
      },
      "dark_moon": {
        "any": [
          "No moon at all. Pitch black. Now it feels like home.",
          "Dark as a basalt cave tonight. Only thing glowing is my jewellery."
        ],
        "lo": "New moon. Can't see much. Good thing I'm easy to spot.",
        "hi": "Black sky, no moon. I sleep best on nights like this. You look tired too, {player}."
      },
      "dawn": {
        "any": [
          "Sunrise. The sky goes gold for a minute, and I take notes.",
          "First light. That orange right on the edge, I've been trying to mix that for years."
        ],
        "lo": "Up at sunrise too? Respect. Most people miss the good colours.",
        "hi": "I never saw a dawn till I was grown. Glad I'm watching this one with you."
      },
      "dusk": {
        "any": [
          "Sunset. Red and orange all over. The sky's wearing my palette.",
          "Sun's going down like a slow lava fall. Best show of the day."
        ],
        "lo": "Sundown. Good time to pack up, wherever you're headed.",
        "hi": "This red sky's the closest thing to home I get up here. Watch it with me a second."
      },
      "nether": {
        "any": [
          "Home. Smell that? Hot netherrack. Nothing else like it.",
          "I walked ledges like these as a kid, with lava on both sides. You get a feel for it."
        ],
        "lo": "Welcome to my old neighbourhood. It's warmer than it looks. No, wait. It's exactly as warm as it looks.",
        "hi": "I never brought anybody back down here before, {player}. Feels right that it's you."
      },
      "the_end": {
        "any": [
          "No ground, no sky, just pale stone and a long drop. Bold design. Not sure I like it.",
          "Those tall ones with the purple eyes. I'm admiring them from the corner of my eye only."
        ],
        "lo": "So this is the End. Quiet. Too quiet for me, honestly.",
        "hi": "The Nether's rough, but it's warm. This place is cold all the way through. Glad you're here, {player}."
      },
      "fishing_sky": {
        "any": [
          "Islands floating in the sky, and every one has a pool on it. Water with a view. Great.",
          "We're above the clouds and people are fishing. I'll hold the bags, far from the edge."
        ],
        "lo": "Nice islands. Lot of water for my taste, though. I'll stand over here.",
        "hi": "A sky full of fishing pools, and you brought the one guy who hates water. I'm kidding. Mostly."
      },
      "acufend": {
        "any": [
          "A round moon with a jungle on it, and everything here hums. I could design to this beat.",
          "These little music lovers have rhythm. I'm nodding along and I don't even know the tune."
        ],
        "lo": "Strange moon, strange village. I like the sound of the place, though.",
        "hi": "Listen to that. The whole village keeps time. I'm naming a hat after this song."
      },
      "cave": {
        "any": [
          "Deep down here. No lava glow, though. Just grey rock and drips.",
          "Caves up here are cold. In the Nether the walls keep you warm."
        ],
        "lo": "Long way underground. I'll stay close to the torches.",
        "hi": "If you spot gold in these walls, {player}, wave at me. I'll just look. Lovingly."
      },
      "high_up": {
        "any": [
          "Long way down. Reminds me of the big basalt cliffs, minus the fire at the bottom.",
          "Some view. Everything looks like a pattern from this height."
        ],
        "lo": "High spot. I'm fine with heights. It's the landing I think about.",
        "hi": "From up here your whole world looks stitched together. You climb this high often? Careful, alright?"
      },
      "hostile_near": {
        "any": [
          "Something ugly's creeping around close by. I've got the axe if it comes over.",
          "Hear that groaning? We've got company, and it's not dressed for dinner."
        ],
        "lo": "There's a monster near us. Just saying. I'd keep an eye on it.",
        "hi": "Trouble's close, {player}. I grew up next to worse. I'll stand right here with you."
      },
      "creeper_near": {
        "any": [
          "Creeper. Right there. Green, quiet, and way too close to my good shirt.",
          "That creeper's staring at us. I've never liked a thing that ends a conversation that way."
        ],
        "lo": "Uh, creeper over there. I'm going to take two cool steps back.",
        "hi": "{player}, that creeper is close. I can replace a hat. I can't replace you. Let's give it room."
      },
      "villager_near": {
        "any": [
          "Villagers. Big robes, crossed arms, lots of humming. Strong look, honestly.",
          "This village runs on emeralds. Piglins would never. They know gold when they see it."
        ],
        "lo": "Friendly bunch here. They keep looking at my necklace. Can't blame them.",
        "hi": "These folks hum at you till you trade. Like piglins, only politer. You'd have liked my old neighbours."
      },
      "pet_near": {
        "any": [
          "That's your buddy there? Good posture. It knows it's with somebody.",
          "Your pet keeps sniffing my shoes. Soul sand smell, probably. Can't be helped."
        ],
        "lo": "Nice animal. It's loyal to you, I can tell from how it stands.",
        "hi": "Your little friend trusts me now. Took a while. Like you and me, {player}."
      },
      "farm_animal_near": {
        "any": [
          "Sheep, pigs, chickens. Alright. A pig I can respect. It's a piglin with less ambition.",
          "Is that a cow? It's looking at me. I'm going to stand on your other side."
        ],
        "lo": "Farm animals. They're fine. I'll just keep the cows at a distance.",
        "hi": "A cow chewed my sketchbook once, {player}. A whole season of designs. I don't forgive."
      },
      "zoo_animal_near": {
        "any": [
          "Look at the {species} up close. That colouring, right there. I could build a whole collection off it.",
          "The {species} just looked me up and down. I think I passed."
        ],
        "lo": "That's a sharp looking {species}. You keep it well.",
        "hi": "That {species} moves like it knows it's being watched. Reminds me of you on a good day, {player}."
      },
      "guests_crowd": {
        "any": [
          "Busy crowd. Lots of plain hats in it. That hurts me a little.",
          "All these guests and not one good necklace. I see a market."
        ],
        "lo": "Lot of people round here. I'll hang back by the fence where there's air.",
        "hi": "Crowds aren't my thing, but I like seeing them come for what you built. You earned every one."
      },
      "residents_crowd": {
        "any": [
          "Half the street's standing here. Feels like a party nobody planned.",
          "All the neighbours in one spot. I'm quietly judging everyone's shoes. Kindly."
        ],
        "lo": "Looks like a neighbourhood meeting. I'm still learning who's who.",
        "hi": "Whole street's out, and they all ended up near you. Funny how that keeps happening."
      },
      "other_resident": {
        "any": [
          "That's {other} over there. Good neighbour. Could use a better hat, but who couldn't.",
          "{other} and I nod at each other every morning. It's a whole friendship with no words."
        ],
        "lo": "You know {other}? Seems solid. I haven't figured out their style yet.",
        "hi": "Between us, I've already sketched something for {other}. They don't know. Keep it quiet."
      },
      "other_player": {
        "any": [
          "You brought {other} along. Any friend of yours gets a nod from me.",
          "So that's {other}. Decent boots. I notice these things."
        ],
        "lo": "Two of you now. Hey, {other}. I'm Ash. I make things.",
        "hi": "{other} seems cool, but you were here first, {player}. You get the good stories."
      },
      "alone_night": {
        "any": [
          "Just us out here. No noise, no crowd. I can hear my own necklace clink.",
          "Quiet night, nobody around. That's when I say what I actually think."
        ],
        "lo": "It's only the two of us out here in the dark. Peaceful, I guess.",
        "hi": "Nobody around, so I'll say it. I was lonely up here before you started coming by."
      },
      "by_water": {
        "any": [
          "That's a lot of water. I'll stay on the dry side of this conversation.",
          "Water just sits there, cold and wet, with no glow at all. I don't get the appeal."
        ],
        "lo": "Nice pond, I suppose. I'm good right here on the bank. Well back.",
        "hi": "Where I grew up, water couldn't even exist. So when I flinch at a pond, {player}, be kind."
      },
      "by_lava": {
        "any": [
          "Now that's a proper glow. Lava makes everybody look good.",
          "Feel that heat on your face? That's what my whole childhood felt like."
        ],
        "lo": "Open lava. Pretty, right? I'd keep a respectful step back, though.",
        "hi": "I learned to walk next to this stuff. Still, {player}, mind the edge. It's you I worry about, not me."
      },
      "by_flowers": {
        "any": [
          "Flowers. Soft, bright, gone in a week. I work in obsidian for a reason.",
          "That red one's nearly the right shade. Nearly. Nether wart does it better."
        ],
        "lo": "Pretty flowers. Not my material, but I can respect the colours.",
        "hi": "First time I saw a flower field I thought something was wrong with the ground. Don't laugh."
      },
      "by_fire": {
        "any": [
          "Good fire. I could stand here all night and never get bored.",
          "Listen to it crackle. That's the first sound I ever fell asleep to."
        ],
        "lo": "Nice fire you've found. Mind if I stand by it a while?",
        "hi": "A fire and a friend. That's the whole list, {player}. Everything else is decoration."
      },
      "by_crops": {
        "any": [
          "Rows of green stuff in wet dirt. Two things I avoid, working together.",
          "Somebody put real care into these crops. I can see that, even from the edge here."
        ],
        "lo": "Farmland. I'll stay on the path. Dirt and I have an agreement.",
        "hi": "For you I'd walk through a muddy field, {player}. Slowly. Complaining the whole way."
      },
      "by_books": {
        "any": [
          "Shelves of books. Nobody ever wrote one about Nether fashion. I've checked.",
          "I like the smell of old paper. Burns too easy for my part of the world, though."
        ],
        "lo": "Lot of reading here. I'm more of a sketchbook guy, myself.",
        "hi": "I learned to read from a scorched book a piglin was done with. Half the pages were gone. I made up the rest."
      },
      "in_snow": {
        "any": [
          "Snow. So it's water, but it sneaks up on you quietly. Wonderful.",
          "My shoes were made for soul sand, not this white stuff. They're in shock."
        ],
        "lo": "Cold out here. I'm not shivering. That's just how I stand.",
        "hi": "{player}, I grew up next to lava. I've got no defence against snow. Stand close, block the wind."
      },
      "holding_gift": {
        "any": [
          "Is that {item} you've got there? Hm. Good eye. Real good eye.",
          "I see what's in your hand. That's my kind of material."
        ],
        "lo": "Nice {item}. Not asking. Just noticing.",
        "hi": "You walk in carrying {item} like it's nothing. You know me too well, {player}."
      },
      "holding_weapon": {
        "any": [
          "That {item} suits you. A weapon should match the person carrying it.",
          "Sharp piece you're holding. Mine's gold, so it's mostly for show."
        ],
        "lo": "Armed today. I'll assume it's not about me.",
        "hi": "Planning trouble with that {item}? Tell me where. I'd rather come along than wonder."
      },
      "holding_food": {
        "any": [
          "That {item} smells good. I grew up on whatever was near the fire, so I'm easy to impress.",
          "Eating on the move? Respect. Keeps the day smooth."
        ],
        "lo": "Lunch time, huh. Don't let me stop you.",
        "hi": "You're carrying {item} and you haven't offered me a bite. I'm kidding. Eat, you look worn out."
      },
      "holding_rod": {
        "any": [
          "A fishing rod. So you stand next to water on purpose and wait. Brave.",
          "Fishing, huh. I'd watch you do it. From way back there."
        ],
        "lo": "Going fishing? Good luck. I'll be anywhere dry.",
        "hi": "You and that rod. If something bites, {player}, shout. I'll cheer from the dry end."
      },
      "holding_tool": {
        "any": [
          "That {item} has seen some work. A tool looks better with a few scratches.",
          "Digging day? I hope there's something shiny under there."
        ],
        "lo": "Busy with that {item}, I see. I'll keep it short.",
        "hi": "You and that {item} never rest. You work harder than anyone I know up here, {player}."
      },
      "armored": {
        "any": [
          "Full armour. Strong silhouette. A little heavy on metal, light on flair.",
          "You clank when you walk in that set. It's a statement. I hear it."
        ],
        "lo": "All suited up. Expecting a rough day?",
        "hi": "Armour head to toe. Good. I like knowing something's between you and the world, {player}."
      },
      "hurt": {
        "any": [
          "Whoa. You're hurt bad. Easy now. Slow down.",
          "You look like you lost an argument with a ghast. Catch your breath."
        ],
        "lo": "You alright? That looks rough. Maybe sit a minute.",
        "hi": "{player}, you're a mess. Sit. I'm not going anywhere till you look like yourself again."
      },
      "wet": {
        "any": [
          "You're dripping. Stay over there a second, yeah? This shirt's gilded.",
          "Soaked through. On purpose? I'll never understand it."
        ],
        "lo": "You're pretty wet. I'll just step back from the splash zone.",
        "hi": "You're soaked, {player}, and you still came to say hey. I'm touched. Don't hug me, though."
      },
      "sneaking": {
        "any": [
          "Why are we crouching? Is there something I should know about?",
          "You're creeping around low. I see you fine, for the record."
        ],
        "lo": "Sneaking up on me? Smooth. Almost worked.",
        "hi": "Crouched down like that, {player}, you look like you're up to something. I want in."
      },
      "long_time": {
        "any": [
          "Been a few days. I wondered where you'd got to.",
          "Hey, stranger. It's been quiet around here without you stopping by."
        ],
        "lo": "Haven't seen you in a while. No big deal. Welcome back.",
        "hi": "Days, {player}. I finished two pieces and had nobody to show. Don't do that to me."
      },
      "first_today": {
        "any": [
          "There you are. First hello of my day. Looking good.",
          "Hey, hey. Day's just getting started and you're already out."
        ],
        "lo": "Oh, hey. Good to see you today.",
        "hi": "{player}. My day doesn't really start till you've come by. Now it has."
      },
      "zoo_busy": {
        "any": [
          "Zoo's packed today. Look at that line. You've got a hit.",
          "So many guests I can barely see the animals. Good problem to have."
        ],
        "lo": "Busy day for you. I'll keep out of the traffic.",
        "hi": "Place is full, {player}. They came for your work. Take a second and enjoy that."
      },
      "zoo_empty": {
        "any": [
          "Open gates and nobody in. Quiet as a soul sand valley today.",
          "No guests at all. I get it. Some days nobody walks into the studio either."
        ],
        "lo": "Empty day, huh. It happens to everyone who makes things.",
        "hi": "Not one guest. Don't take it hard, {player}. Good work gets found. It always has."
      },
      "zoo_closed": {
        "any": [
          "Closed today. The place looks different with nobody in it. Calmer.",
          "Gates shut. Sometimes the best thing a shop can do is rest."
        ],
        "lo": "Zoo's closed, I see. I'll come by another time.",
        "hi": "Closed up? Good. You needed a breather. I've seen how hard you run this place."
      },
      "litter_bad": {
        "any": [
          "There's rubbish all down the paths. Hurts the look of the whole place.",
          "I nearly stepped on someone's leftovers back there. In these shoes."
        ],
        "lo": "Bit of a mess on the walkways today. Just noticed, that's all.",
        "hi": "Litter everywhere, {player}. Your zoo deserves better than what's lying on that path."
      },
      "stars_high": {
        "any": [
          "Word is the zoo's rated near the top. Doesn't surprise me. It's got style.",
          "People keep raving about this place. Great rating, and it shows."
        ],
        "lo": "High marks for the zoo, I hear. Nicely done.",
        "hi": "Top stars. I told people you had taste before anyone was counting, {player}."
      },
      "stars_low": {
        "any": [
          "Rating's low right now, I heard. Ratings move. Style stays.",
          "Hardly any stars on the board. My first hats got laughed at too."
        ],
        "lo": "Rough rating lately. I wouldn't sweat it yet.",
        "hi": "One bad score doesn't change what I see here, {player}. You'll turn it. I've watched you work."
      },
      "coins_low": {
        "any": [
          "I hear the Zoo Coins are running thin. Tight seasons pass.",
          "Money's short at the park, huh. I once traded hats for dinner. You get through."
        ],
        "lo": "Coins are low, people say. Tough spot. Hope it turns.",
        "hi": "Coins nearly gone? Forget my shop for now, {player}. Company's free."
      },
      "animal_sick": {
        "any": [
          "One of the animals isn't doing well. You can tell. The shine goes out of them.",
          "Something's off with one of your creatures today. It wasn't moving right when I passed."
        ],
        "lo": "Heard one of the animals is poorly. That's a shame.",
        "hi": "An animal's unwell and I can see it eating at you, {player}. You care. That's the best part of you."
      }
    },
    "near": {
      "han_lock": [
        "Han Lock calls my work thin. Loudly. Then he asks how I got the gold that even. Every time.",
        "Han Lock over there could bend a hat by looking at it. Good guy. Terrible volume."
      ],
      "subject_10": [
        "Subject 10 knows the Nether like I do. We swap stories about home and nobody else gets the jokes.",
        "Half piglin, and Subject 10 still won't tell me which gold she likes best. I'll find out."
      ],
      "guido": [
        "Guido dresses sharp, I'll give him that. He asked me for a hat once and wouldn't say what it was for.",
        "Guido over there says his business is ordinary. Nobody ordinary matches his shoes to his bow."
      ]
    }
  },
  "han_lock": {
    "intro": "I am HAN LOCK! Master blacksmith! Seven years I chipped bedrock into an anvil and a hammer that cannot break. I make tools and armor, and I fix what is broken. Now, your hands. Show me!",
    "scenes": {
      "home_morning": {
        "any": [
          "You come to my house at breakfast! Good. There is meat in the pan and iron in the fire.",
          "Morning in the smithy. I have already swept the scale off the floor. Twice!"
        ],
        "lo": "A visitor, this early? Wipe your boots. There are sharp things on my floor.",
        "hi": "{player}! Sit! I put out a second plate. A friend does not stand and watch another man eat."
      },
      "home_evening": {
        "any": [
          "The day is hammered flat. Now I sit, and my arms hum like a struck bell.",
          "Evening at home. I oil every tool before I sleep. They worked hard too."
        ],
        "lo": "It is late to knock on a smith's door. Speak quick, my supper is hot.",
        "hi": "Come, sit by my fire. I tell you about year four of the bedrock. The bad year. Ha!"
      },
      "walking_to_zoo": {
        "any": [
          "I walk to the zoo! Long strides. A short stride is for a man with nowhere to be.",
          "On the road to the animals. My legs need work too, not only my arms."
        ],
        "lo": "I am going to the zoo. Walk beside me if you can keep the pace.",
        "hi": "To the zoo, my friend! We race to the gate? No. I would win, and you would sulk."
      },
      "at_zoo": {
        "any": [
          "Today I only look. No hammer. My hands do not know what to do with themselves.",
          "I walk the exhibits and I count the rivets in every fence. All sound, so far!"
        ],
        "lo": "I am a guest here today. A loud one. Nobody has complained to my face.",
        "hi": "You built this zoo with your own two hands, {player}. I tell every guest who stands near me."
      },
      "walking_home": {
        "any": [
          "Home now. The fire has been alone all day, and a forge sulks.",
          "I walk back with tired feet. Tired from strolling! Shameful. From hammering, never."
        ],
        "lo": "The zoo is done for me today. Good place. Strong gates.",
        "hi": "I go home, my friend. Today a great beast looked at me with respect. I felt it. Right here."
      },
      "at_work": {
        "any": [
          "Wait! Three more strikes while it is yellow. There. Now I can talk.",
          "You see this edge? Not straight yet. I do not put it down until it is straight."
        ],
        "lo": "I am working. Stand behind the line, there, where the sparks do not reach.",
        "hi": "Come close, {player}. Watch the colour of the metal. Nobody else gets to stand this near."
      },
      "following": {
        "any": [
          "I march behind you! If something needs lifting or breaking, point.",
          "A day on the road. Good! A smith should see where the ore comes from."
        ],
        "lo": "I follow, but I watch how you walk. A person shows their work in their walk.",
        "hi": "Adventure with my apprentice! I carry the heavy things. You carry the map. Fair!"
      },
      "following_night": {
        "any": [
          "Dark, and far from my forge. I keep one hand on the hammer. Habit.",
          "Night march! I hear every twig. Nothing sneaks up on Han Lock."
        ],
        "lo": "You lead me far from home in the dark. I hope you know this road.",
        "hi": "I do not like the forge cold this long, {player}. But for you, I walk all night."
      },
      "staying": {
        "any": [
          "I stand where you put me. My feet have made dents already!",
          "Still here! I have not moved one boot. Ask the grass."
        ],
        "lo": "You say wait, so I wait. I do not enjoy it. But I wait.",
        "hi": "I guard this spot for you like I guard the Hanvil. That is the highest thing I can say."
      },
      "rain": {
        "any": [
          "HA! Listen to it drum on my bald head. Like a tiny hammer.",
          "Wet day! The forge hisses when I walk back in dripping. I like that sound."
        ],
        "lo": "You stand in the rain with me? Hm. Not so soft, then.",
        "hi": "We are both soaked, my friend, and neither of us ran for a roof. This is why I like you."
      },
      "thunder": {
        "any": [
          "THUNDER! Finally, something louder than me!",
          "The sky is hammering tonight. Poor technique. No rhythm at all."
        ],
        "lo": "Do not jump at the thunder. It is only noise. I am also mostly noise, and I am harmless.",
        "hi": "A storm like this, {player}, I want to shout back at it. Shall we? No? I do it alone then. HA!"
      },
      "full_moon": {
        "any": [
          "Full moon. Round and bright, like a shield fresh off the polish.",
          "With that moon I could work all night without a lamp. Almost I am tempted."
        ],
        "lo": "Bright night. Good. I can see your face, and what you are carrying.",
        "hi": "Under a moon like this I finished the Hanvil, {player}. Year seven. I cried. Tell no one!"
      },
      "dark_moon": {
        "any": [
          "No moon. Black as the inside of a cold furnace.",
          "I cannot see my own hammer tonight. I know where it is anyway. Always."
        ],
        "lo": "Very dark. I hear your boots, so I know where you are. That will do.",
        "hi": "A black night, my friend. I walk on your right. My hammer arm stays free, for whatever comes."
      },
      "dawn": {
        "any": [
          "Sunrise! The sky goes the colour of iron at the right heat. Exactly that!",
          "First light. I have been up an hour. The fire does not light itself."
        ],
        "lo": "You are awake at dawn. Good sign. Lazy people I do not teach.",
        "hi": "The sun comes up and here is {player}, already working. HA! I taught you that. I take the credit."
      },
      "dusk": {
        "any": [
          "Sunset. The whole sky cools from orange to grey, like a blade set down to rest.",
          "The sun goes down. I count my hammers now. All there."
        ],
        "lo": "Day is ending. What did you make in it? Hm? Think on that.",
        "hi": "Look at that red sky, my friend. A good day of work behind us. This is all a man needs."
      },
      "nether": {
        "any": [
          "HA! This whole place is one great forge! Why did nobody tell me?",
          "Hot. Good hot! I have not sweated like this since the big furnace."
        ],
        "lo": "Lava everywhere and no railing. Whoever built this had no sense for safety.",
        "hi": "{player}, feel that heat! I could work here. Bad neighbours, though. They squeal."
      },
      "the_end": {
        "any": [
          "Pale stone and nothing under it. I do not trust ground with no bottom.",
          "Those tall thin ones. No shoulders at all! How do they carry anything?"
        ],
        "lo": "A strange place. No fire, no ore I know, no sound. I keep my hammer out.",
        "hi": "I say this only to you, {player}. This black sky makes my neck prickle. We stay together here."
      },
      "fishing_sky": {
        "any": [
          "Islands that float! Who holds them up? I see no chains, no beams. I am offended.",
          "Fishing pools in the sky. Fine. A grilled fish is still meat, I allow it."
        ],
        "lo": "I stand in the middle of the island. Not from fear. From good sense.",
        "hi": "My friend, I weigh as much as an anvil. If this island tips, it was a pleasure knowing you! HA!"
      },
      "acufend": {
        "any": [
          "A round little moon, and everything on it sings. Not badly! I tap along with the hammer.",
          "These music creatures like a beat. I gave them one on a rock. Now they follow me."
        ],
        "lo": "Strange jungle village. Nobody here has a forge. I have looked.",
        "hi": "{player}, the little ones cheered when I hummed along. HA! Do not tell the street I can hum."
      },
      "cave": {
        "any": [
          "Now THIS is a place. Rock on every side. Smell that? Ore dust.",
          "Underground! Here is where every good tool begins its life."
        ],
        "lo": "You carry a torch like a visitor. I can tell who has dug before and who has not.",
        "hi": "Deep rock, a friend, and something to hit. {player}, this is my idea of a holiday."
      },
      "high_up": {
        "any": [
          "High! From up here every roof is a nail head. I want to tap them all in.",
          "A long drop. A hammer let go from here would bury itself. I do not test it."
        ],
        "lo": "Up here the wind tries to push me. HA! It may keep trying.",
        "hi": "From this height the world looks small, {player}. But somebody built every bit of it. People like us."
      },
      "hostile_near": {
        "any": [
          "A monster, close! Let it come. My hammer does not care what it hits.",
          "I hear bones or groaning, one of the two. Either one breaks the same."
        ],
        "lo": "There is a creature near. Stand behind me. I am wider than you.",
        "hi": "Trouble walks toward us, my friend. Back to back, like smith and striker. HA!"
      },
      "creeper_near": {
        "any": [
          "CREEPER! That green thing, there! It hisses like bad steel in the quench.",
          "A creeper, so near! It has no arms. I do not trust a thing with no arms."
        ],
        "lo": "That creeper will burst. I have seen what they do to a good wall. We give it space.",
        "hi": "{player}, the creeper! I step in front. I am thick, I can take a bang. You, I am not so sure!"
      },
      "villager_near": {
        "any": [
          "Villagers! I look for their smith first. Always. Then I judge his anvil.",
          "They say hrmm, hrmm, all day. Speak up! A man should be heard across a field."
        ],
        "lo": "A village. Somebody here hung these doors badly. Not you, I think.",
        "hi": "These folk have soft hands, {player}, but they work their trades all day. So. I respect it. Quietly."
      },
      "pet_near": {
        "any": [
          "Your animal! Good teeth. It looks at my boot like a bone.",
          "A loyal beast beside you. Loyalty you cannot forge. It must be earned."
        ],
        "lo": "Your pet does not flinch when I shout. Braver than most people.",
        "hi": "This one of yours sits on my feet now, {player}. I do not move. I pretend I do not like it."
      },
      "farm_animal_near": {
        "any": [
          "Cows! Pigs! Chickens! I see a field. My stomach sees supper.",
          "Good strong farm beasts. That sheep has a harder head than my first apprentice."
        ],
        "lo": "Farm animals. Useful ones. Everything here earns its keep.",
        "hi": "My friend, I look at that cow and I am hungry, and then I feel bad. Then hungry again."
      },
      "zoo_animal_near": {
        "any": [
          "Look at the {species}! Up close you see how it is put together. Good joints!",
          "The {species} stares at me. I stare back. Neither of us blinks. HA!"
        ],
        "lo": "That {species} is well kept. Clean, strong. Somebody here does the work.",
        "hi": "The {species} knows your step, {player}. See how it turns its head? You earned that."
      },
      "guests_crowd": {
        "any": [
          "So many guests! And all of them in my way. EXCUSE ME! See, they move.",
          "A crowd. Good. I look at their belt buckles. Cheap work, most of it."
        ],
        "lo": "Busy here. Stay near me or this crowd carries you off like a twig.",
        "hi": "All these people came to see what you made, {player}. I tell them: I know the builder!"
      },
      "residents_crowd": {
        "any": [
          "The whole street stands here! I can out-shout all of them at once. I have tested it.",
          "Neighbours everywhere. I fixed a hinge or a pot for nearly every one of them."
        ],
        "lo": "Many neighbours around us. You know them better than me, I think.",
        "hi": "Look at them all, my friend. Good people. Soft hands, most, but good people."
      },
      "other_resident": {
        "any": [
          "{other}! There! I fixed a kettle for {other} once. Still holds water. Of course it does.",
          "That is {other}. A good neighbour. Does not flinch when I say hello."
        ],
        "lo": "You know {other}? Hm. I judge a person by their handshake. {other} passes. Just.",
        "hi": "Between us, {player}, {other} is tougher than they look. I have a good eye for that."
      },
      "other_player": {
        "any": [
          "Two of you! And who is {other}? Show me your hands, {other}. Hm. We will see.",
          "{other} is with you? Good. A person should not travel alone."
        ],
        "lo": "I do not know {other} either. Two strangers. Double the soft hands!",
        "hi": "{other} seems fine, {player}, but you I have taught. There is a difference. I can see it."
      },
      "alone_night": {
        "any": [
          "Only us out here. So quiet I can hear my own knuckles crack.",
          "Nobody around. A night this still, I almost lower my voice. Almost."
        ],
        "lo": "It is dark and we are alone. I am not a man who chats in the dark. But go on.",
        "hi": "Just the two of us, so I say it once. I was a lonely man before this street, {player}."
      },
      "by_water": {
        "any": [
          "Water! Cold and deep. I would quench a sword in that, if it were mine to use.",
          "I look in the water and a big bald man looks back. Handsome fellow!"
        ],
        "lo": "A smith always works near water. It is the second thing I look for. Fire is the first.",
        "hi": "I do not swim, my friend. I sink. Like a good anvil should. So we stay on the bank, eh?"
      },
      "by_lava": {
        "any": [
          "Lava! Free heat, lying on the ground! Somebody should be forging here.",
          "Feel that on your face. Hotter than my forge on its best day. I am jealous."
        ],
        "lo": "Lava takes back anything you drop in it. I learned that with a good pair of tongs.",
        "hi": "{player}, you stand too near that lava for my liking. I worry. There, I said it. Do not make it a big thing."
      },
      "by_flowers": {
        "any": [
          "Flowers. Pretty. Soft. What do they DO? Nobody can tell me.",
          "I stand in flowers like a boulder in a garden. Something here is wrong, and it is me."
        ],
        "lo": "Do not look at me like that. A big man can stand by flowers.",
        "hi": "My mother kept flowers, {player}. Red ones. I do not tell this to people who laugh."
      },
      "by_fire": {
        "any": [
          "A campfire! Small, but honest. Somebody stacked that properly.",
          "Fire. I hold my hands out to it without thinking. Forty years of habit."
        ],
        "lo": "A fire tells me about who built it. This one, hm. Not bad.",
        "hi": "A fire, a friend. Now all we lack is meat on a stick. I look at you. You look at me. HA!"
      },
      "by_crops": {
        "any": [
          "Vegetables. In rows. Somebody grows them on purpose!",
          "Wheat I forgive. Bread goes under meat. The rest of this field, no."
        ],
        "lo": "A farm. Honest work, I say nothing against the work. Only against the carrots.",
        "hi": "{player}, if you ever see me eat a beetroot, something has gone wrong. Come and check on me."
      },
      "by_books": {
        "any": [
          "Books! So many. I learned my craft by burning my fingers, not from a page.",
          "A full shelf. Good joinery on it. The books, I cannot judge."
        ],
        "lo": "You read all these? Hm. Reading builds no muscle. But it is not nothing.",
        "hi": "I tell you a secret, {player}. I write my techniques down now. Bad spelling. Good techniques."
      },
      "in_snow": {
        "any": [
          "Snow! I am too warm to feel it. Forty years of forge heat stored in here!",
          "Cold feet, hot head. The snow melts where I stand. Look!"
        ],
        "lo": "You shiver! Soft hands and cold feet, a bad pair. We work on both.",
        "hi": "Snow to the ankles and you still come out with me. Good. Tough. I knew it."
      },
      "holding_gift": {
        "any": [
          "What is that you carry? {item}? Now THAT I look at twice.",
          "My eye goes straight to your hand. A smith knows good material."
        ],
        "lo": "{item}. Hm. You have decent taste, for someone I hardly know.",
        "hi": "{item}! In your hand! My friend, you make an old smith's eyes go wide. I say nothing more."
      },
      "holding_weapon": {
        "any": [
          "Give me a look at that {item}. Hm. The grip is worn. Good, it gets used.",
          "Armed! And held properly. Thumb is right. Who taught you? Not me. Still right."
        ],
        "lo": "You hold that {item} like you expect it to bite. Loosen the wrist.",
        "hi": "That {item} of yours, I know every scratch on it by now. It is in good hands, {player}."
      },
      "holding_food": {
        "any": [
          "Is that {item}? If it once had legs, I approve.",
          "Food in your hand! Good. A person who skips meals drops hammers."
        ],
        "lo": "You eat that? Hm. I say nothing. My face says it.",
        "hi": "{item}, eh? You eat like a bird, my friend. I worry. A smith worries with his whole chest."
      },
      "holding_rod": {
        "any": [
          "A fishing rod! A thin stick and a string. And yet it works. I admit it.",
          "Fishing is waiting. I am bad at waiting. I would shout at the fish."
        ],
        "lo": "You fish? Patient hands, then. That is something to build on.",
        "hi": "You with that rod, standing still for an hour. I could not do it, {player}. I respect it greatly."
      },
      "holding_tool": {
        "any": [
          "That {item}! Let me see the head. Hm. Seated well. Not wobbling. Good.",
          "A tool in the hand. Now you look like somebody."
        ],
        "lo": "You carry that {item} too clean. A tool should have dirt on it by noon.",
        "hi": "Every time I see you, {player}, there is a {item} in your grip. HA! You make me proud."
      },
      "armored": {
        "any": [
          "Full armor! Turn around. Let me see the back plates. Hm. No gaps. Good.",
          "All that plate and you still stand straight. Good legs under it!"
        ],
        "lo": "A whole suit. Do you know how to move in it, or do you only wear it?",
        "hi": "Look at you, {player}, plated head to toe. I sleep better knowing you go out like that."
      },
      "hurt": {
        "any": [
          "You are bleeding! Sit! SIT! Who did this? Point at them.",
          "Look at the state of you. Dented like a bad helmet."
        ],
        "lo": "You are hurt badly. I do not know you well, but I do not leave a hurt person alone.",
        "hi": "{player}! No, no, no. Sit down, my friend. I stand over you until you are whole. Nobody comes near."
      },
      "wet": {
        "any": [
          "You are dripping! Like a blade fresh from the quench. Did it make you harder?",
          "Soaked to the bone. You will rust, standing about like that!"
        ],
        "lo": "Wet through. Not near my tools, please. Rust is my enemy.",
        "hi": "My friend, you look like a drowned cat. A strong drowned cat! I say it with love."
      },
      "sneaking": {
        "any": [
          "Why do you crouch? I can see you. I am loud, not blind!",
          "You creep about down there. A person should stand at full height!"
        ],
        "lo": "Sneaking near a smith with hot iron. Bold. Or foolish. I have not decided.",
        "hi": "HA! {player} on tiptoe. You try to scare me again? It worked once. Only once!"
      },
      "long_time": {
        "any": [
          "YOU! Days, it has been! I thought maybe you fell in a hole.",
          "Where were you? I counted the days. A forge notices an empty doorway."
        ],
        "lo": "Hm. You, again, after so long. I did not forget your face.",
        "hi": "{player}! Days without a word! I did not worry. I only asked everyone on the street. Twice."
      },
      "first_today": {
        "any": [
          "HA! There you are! The day can begin properly now.",
          "First hello of the day! Good and loud, the way it should be. HELLO!"
        ],
        "lo": "You. Good day to you. Stand up straight when you greet a smith.",
        "hi": "{player}! I saved my loudest good morning for you. Did the animals hear it? I hope so!"
      },
      "zoo_busy": {
        "any": [
          "The zoo is FULL! Shoulder to shoulder. Your gates are earning their hinges today.",
          "So many guests I cannot swing my arms. Now that is a full zoo!"
        ],
        "lo": "A packed day. You run a busy place, I give you that.",
        "hi": "Look at it, {player}! Crammed! This is what hard work looks like when it pays off."
      },
      "zoo_empty": {
        "any": [
          "Open gates and nobody walks through. I shout hello and only I answer.",
          "No guests. Not one! The animals look at me like I should do a trick."
        ],
        "lo": "Empty today. Hm. A slow day at the forge comes too. It passes.",
        "hi": "No guests, my friend? Bah. Year three, nobody believed in my bedrock either. Keep hammering."
      },
      "zoo_closed": {
        "any": [
          "Closed! Good. Even a furnace is let cool, so it can be cleaned.",
          "The gates are shut. I checked the lock out of habit. Solid."
        ],
        "lo": "The zoo is closed today. Your choice. I do not question another person's shop.",
        "hi": "You shut the gates, {player}? Then rest your arms. You have my permission. It is rare."
      },
      "litter_bad": {
        "any": [
          "Rubbish on the paths! Everywhere! A workshop this messy, I would close in shame.",
          "I kicked three bits of litter between here and the gate. THREE."
        ],
        "lo": "Your paths are dirty today. I say it plainly. I say everything plainly.",
        "hi": "My friend, the paths are a mess, and I know it is not like you. Something keeps you too busy."
      },
      "stars_high": {
        "any": [
          "A top rating! HA! Good work gets noticed. Slowly, but it does.",
          "They rate this zoo among the best now. I am not surprised. I have seen the fences."
        ],
        "lo": "High stars. You did that? Hm. Then there is something in you.",
        "hi": "So many stars! {player}, I told the whole street. They told me to stop shouting. I did not."
      },
      "stars_low": {
        "any": [
          "A poor rating. Bah! My first sword bent like a spoon. You start somewhere.",
          "Few stars, they say. Stars are opinions. Work is work."
        ],
        "lo": "The zoo scores low. I do not mock it. I only watch what you do next.",
        "hi": "Low stars do not scare us, {player}. You get up, you heat it again, you hit it again."
      },
      "coins_low": {
        "any": [
          "The coin box is nearly empty, I hear. A lean month. I have had many.",
          "Almost no Zoo Coins left? I once ate one potato for a week. A vegetable! That is how poor."
        ],
        "lo": "Money is short for you. It is not my business. But I noticed.",
        "hi": "Coins run low, my friend. It does not change how I see you. A full purse never made a good smith."
      },
      "animal_sick": {
        "any": [
          "One of the animals is poorly. I saw it. It hangs its head like a tired horse.",
          "A beast here is not well. I can mend iron. This I cannot mend, and I hate that."
        ],
        "lo": "There is a sick animal in your zoo. A keeper is judged by the weak ones too.",
        "hi": "You fret over that sick one, {player}. I see it on your face. Good. That is the right kind of soft."
      }
    },
    "near": {
      "ash": [
        "ASH! Pretty necklaces. Thin as a leaf! I tell him every day, and every day he only smiles.",
        "Ash grew up beside lava and never once built a forge. I do not understand this man. I like him anyway."
      ],
      "dave": [
        "Dave! The miner! He loves the rock as much as I love the iron in it. We understand each other.",
        "Dave would live in a hole if we let him. HA! Good hands on him. Hard as boot leather."
      ],
      "paola": [
        "Paola swings an axe better than most men I know. I told her so. She told me to move.",
        "That is Paola. Sharp tongue, sharper axe. She says what she thinks. So do I. It gets loud!"
      ]
    }
  },
  "darian": {
    "intro": "I am Darian, a wizard. I walked to the Far Lands and back, and now I live quietly here. I am looking for an apprentice worth teaching. Perhaps, in time, we shall see what you are.",
    "scenes": {
      "home_morning": {
        "any": [
          "You find me at my tea. Mornings are for one book and no visitors. I make an exception.",
          "The house is cold until the first candle. I have not hurried it."
        ],
        "lo": "It is early for a caller. You may stand by the door, if you are quiet.",
        "hi": "Come in, {player}. I set a second cup out without thinking. It seems I expected you."
      },
      "home_evening": {
        "any": [
          "The day is put away. I read by one candle now, and the page is enough.",
          "At night this house creaks like a ship. I have grown fond of it."
        ],
        "lo": "It is late. Say what you came to say, gently, and then let an old man read.",
        "hi": "Sit. At this hour I remember the road too clearly. It is easier with someone in the other chair."
      },
      "walking_to_zoo": {
        "any": [
          "I am on my way to the zoo. I stopped to listen to the path. It had little to say.",
          "Walking, slowly. The zoo will not leave before I arrive."
        ],
        "lo": "I am going to see the animals. You need not match my pace.",
        "hi": "Walk beside me to the gate, {player}. Two walk a road differently than one. I had forgotten."
      },
      "at_zoo": {
        "any": [
          "I am only a visitor here. I pass the gentle exhibits quickly and linger at the others.",
          "I walk the paths and read every sign. Reading is reading."
        ],
        "lo": "I am looking, not talking. But you may ask one thing.",
        "hi": "You made all this, and you still walk it as if it were new. Keep that. It is worth more than spells."
      },
      "walking_home": {
        "any": [
          "I have seen enough for one day. My feet know the way back without me.",
          "Home, by the quiet path. I count the fence posts. It settles the mind."
        ],
        "lo": "I am going home now. Good day to you.",
        "hi": "I am tired, {player}, in the pleasant way. Your zoo gave me something to think about tonight."
      },
      "at_work": {
        "any": [
          "A moment. This brew must be stirred seven times, and I am on five.",
          "You find me at my studies. The page will wait. It has waited centuries."
        ],
        "lo": "I am working. Wizardry looks like sitting still. It is not.",
        "hi": "Come and look at this, apprentice. No, not with your fingers. Simply look, and tell me what you see."
      },
      "following": {
        "any": [
          "I am behind you. An old wizard makes a slow shadow, but a loyal one.",
          "Daylight, and a road I have not walked. It is a long time since I could say that."
        ],
        "lo": "I agreed to come. I did not agree to hurry.",
        "hi": "Lead on, {player}. I walked to the edge of the world alone. This is better."
      },
      "following_night": {
        "any": [
          "Night, and far from my own door. The dark has many voices out here. I know most of them.",
          "We travel late. Good. The interesting creatures keep these hours."
        ],
        "lo": "You bring me a long way in the dark. I trust you have a reason.",
        "hi": "I have crossed worse nights than this one, but never with a friend. Stay near me, apprentice."
      },
      "staying": {
        "any": [
          "I am waiting where you left me. I have watched one cloud cross the whole sky.",
          "Still here. Standing in one place is a study of its own."
        ],
        "lo": "You asked me to wait. I am waiting. It costs me nothing.",
        "hi": "I will keep this spot until you return, {player}. Do return. I would dislike being wrong about you."
      },
      "rain": {
        "any": [
          "The rain taps on my hat like a slow student at a door.",
          "Wet stone, wet beard. I have been soaked on stranger roads than this."
        ],
        "lo": "It is raining on both of us equally. That is the most that can be said.",
        "hi": "Stand under my brim, {player}. There is room. I have been dry alone long enough."
      },
      "thunder": {
        "any": [
          "Thunder. The sky is arguing with itself. I do not take sides.",
          "A storm. In the Far Lands the lightning goes sideways. I do not expect you to believe me."
        ],
        "lo": "You need not fear the storm. Respect is sufficient.",
        "hi": "A storm like this once chased me for three days. Tonight I only watch it, with you. A great improvement."
      },
      "full_moon": {
        "any": [
          "A full moon. Every creature of the night can see us, and we them. It is only fair.",
          "So much silver light. One could read by it. I have."
        ],
        "lo": "The moon is full. People grow strange under it. I merely grow quiet.",
        "hi": "I tried my first spell under such a moon, {player}. It went badly. My master laughed for a week."
      },
      "dark_moon": {
        "any": [
          "No moon tonight. The stars have the sky to themselves.",
          "A new moon. The dark is complete, and the mobs are bold. I rather enjoy their company."
        ],
        "lo": "It is very dark. I am not what you should be afraid of in it.",
        "hi": "On moonless nights I used to walk without stopping. Tonight I am content to stand here with you."
      },
      "dawn": {
        "any": [
          "Sunrise. The night creatures go to ground, and I am sorry to see them leave.",
          "First light. The world remembers its colours one at a time."
        ],
        "lo": "You rise early. That is a beginning, though only that.",
        "hi": "Another dawn, apprentice. I have seen a great many. I find I still count them when you are near."
      },
      "dusk": {
        "any": [
          "The sun is going. Soon the day folk sleep and the honest creatures come out.",
          "Sunset. The light leaves the way a good guest does, without fuss."
        ],
        "lo": "Evening is coming. You will want to be somewhere safe. I will not.",
        "hi": "Watch the last light with me, {player}. At my age one does not waste a sunset or a friend."
      },
      "nether": {
        "any": [
          "The Nether. Heat, ash and old anger. I have always found it instructive.",
          "Lava below and no sky above. A place that hides nothing about itself. I approve."
        ],
        "lo": "You brought me through the portal. Good. A timid person would not have.",
        "hi": "I studied here for a year, long ago, {player}. The ghasts wept at me daily. I miss them a little."
      },
      "the_end": {
        "any": [
          "The End. I know this sky. I had hoped not to stand under it again.",
          "The tall ones watch us. I keep my eyes low, and we remain on good terms."
        ],
        "lo": "This is no place for the merely curious. And yet here we both are.",
        "hi": "I lost a friend to this place once, apprentice. Forgive me if I am quiet under this sky."
      },
      "fishing_sky": {
        "any": [
          "Islands with no roots, and pools with no rivers. Someone clever made this, or no one did.",
          "We are above the clouds. The fish up here must be very confused."
        ],
        "lo": "A pleasant height. I will sit by this pool and trouble nobody.",
        "hi": "I walked to the edge of the world, {player}, and never once thought to look up. You show me new things."
      },
      "acufend": {
        "any": [
          "A small round moon, and a village that sings to itself. I did not know of this place. That is rare.",
          "The creatures here love their music. It is loud, but it is glad. I can forgive glad."
        ],
        "lo": "Another world entirely. I am taking careful note of it.",
        "hi": "Hush a moment, apprentice. Hear how their song turns? There is a pattern in it. I will be awake all night."
      },
      "cave": {
        "any": [
          "Deep stone. Down here the world is older than any book I own.",
          "I hear something shuffling in the dark ahead. Good. We are not the only ones awake."
        ],
        "lo": "Caves do not frighten me. I trust they do not frighten you.",
        "hi": "The dark is thick down here, {player}. I am calm, but I am not careless with you. I am counting your steps."
      },
      "high_up": {
        "any": [
          "From this height the land is a map. I have walked most of what you can see.",
          "The wind is clean up here. No voices in it at all."
        ],
        "lo": "A long way down. The careless learn that only once.",
        "hi": "Look as far as you can, {player}. Then imagine as far again, many times over. That is where I went."
      },
      "hostile_near": {
        "any": [
          "Something with teeth is near. I find that more interesting than alarming.",
          "A monster, close by. See how it moves. It has nothing to hide."
        ],
        "lo": "There is a creature approaching. I am not troubled. You may be, if you wish.",
        "hi": "I admire that monster, {player}, but not more than I value you. Stand a little behind me."
      },
      "creeper_near": {
        "any": [
          "A creeper. Very near. A remarkable creature, and best admired from further away than this.",
          "That creeper has noticed us. They are quiet until they are suddenly not."
        ],
        "lo": "A creeper stands close. I would not linger beside it, were I you.",
        "hi": "Slowly now, apprentice. That creeper and I respect one another, but it does not know you as I do."
      },
      "villager_near": {
        "any": [
          "Villagers. They trade, they murmur, they sleep. A small life, lived all together.",
          "I see emeralds changing hands. That, at least, I understand."
        ],
        "lo": "A village. Too many voices for me. I shall stand at its edge.",
        "hi": "They mean well, these villagers, {player}. But they talk all at once. Come, keep me company over here."
      },
      "pet_near": {
        "any": [
          "Your animal watches me closely. It is right to. I am a stranger thing than it knows.",
          "A tamed creature. It chose you, I suppose, in its simple way."
        ],
        "lo": "Your pet is loyal. Loyalty I respect, even in something that fetches.",
        "hi": "I do not care for gentle beasts, {player}, but this one guards you. So I have made my peace with it."
      },
      "farm_animal_near": {
        "any": [
          "Cows. Sheep. They stand, they chew, they stare. I have seen stones with more to teach.",
          "A chicken has been following me. I cannot think why. I have given it no encouragement."
        ],
        "lo": "Farm animals. Harmless. That is the kindest word I have for them.",
        "hi": "You are smiling at that sheep, apprentice. Very well. I shall try to see what you see. No. Nothing."
      },
      "zoo_animal_near": {
        "any": [
          "The {species} is close enough that I hear it breathe. It has not decided what I am.",
          "I have stood beside this {species} a while now. Stillness shows you a great deal."
        ],
        "lo": "That is your {species}. It looks to you before it looks at me. Interesting.",
        "hi": "The {species} is calm when you are near, {player}. Creatures do not lie about such things."
      },
      "guests_crowd": {
        "any": [
          "So many guests. So many voices, all pointing and none looking.",
          "I am surrounded. I will stand very still until the crowd forgets I am here."
        ],
        "lo": "This crowd is not to my liking. Speak briefly, if you would.",
        "hi": "I endure this crowd for your sake, {player}. Know that it is no small gift from me."
      },
      "residents_crowd": {
        "any": [
          "The neighbours have gathered. Each is pleasant alone. Together they are weather.",
          "Half the street is standing here. I know all their names and wish I heard fewer of them at once."
        ],
        "lo": "Many of our neighbours are about. I will keep to the edge of them.",
        "hi": "They gather where you are, apprentice. I notice it. It is a kind of magic I never learned."
      },
      "other_resident": {
        "any": [
          "That is {other}. We exchange nods. It is a complete friendship, to my mind.",
          "{other} stands just there. A quieter neighbour than most, for which I am grateful."
        ],
        "lo": "You know {other}, I expect. I know {other} only by footsteps.",
        "hi": "{other} once asked me to read the future, {player}. I said it looked cloudy. It was raining."
      },
      "other_player": {
        "any": [
          "You have brought {other}. I see. Two travellers where I expected one.",
          "{other} has the look of someone who has been to strange places. I recognise it."
        ],
        "lo": "I do not know you well, and I do not know {other} at all. We begin almost evenly.",
        "hi": "{other} may listen, {player}. But the things I teach, I teach to you."
      },
      "alone_night": {
        "any": [
          "No one else is about. Only us, and whatever watches from the dark. Good company.",
          "A silent night. I can hear the grass. I have missed hearing the grass."
        ],
        "lo": "We are alone out here. I am comfortable with silence. I hope you are.",
        "hi": "Now that it is only us, I will say it plainly. I am glad I settled here and not somewhere quieter."
      },
      "by_water": {
        "any": [
          "Water, moving. It is going somewhere far, and it does not boast of it.",
          "I look in and an old man looks back. He seems tired but well."
        ],
        "lo": "A quiet bank. I ask only that we do not chatter beside it.",
        "hi": "I crossed a sea once in a boat I should not have trusted, {player}. I think of it at every shore."
      },
      "by_lava": {
        "any": [
          "Lava. Slow, bright and certain. It has never once changed its mind.",
          "The heat dries my beard. I have stood closer, in worse places."
        ],
        "lo": "Open lava. It forgives nothing. I say so only once.",
        "hi": "You stand near that lava more easily than I like, apprentice. I have lost enough to fire."
      },
      "by_flowers": {
        "any": [
          "Flowers. Some I would put in a brew. The rest are merely pretty.",
          "Bees, petals, sunlight. It is all very cheerful. I shall bear it."
        ],
        "lo": "A flower field. I am waiting for it to become interesting.",
        "hi": "You like these flowers, {player}? Then I will stand among them a while. I have stood in worse for less."
      },
      "by_fire": {
        "any": [
          "A fire. I have told more truths beside fires than anywhere else.",
          "The smoke goes straight up tonight. A calm sky."
        ],
        "lo": "I do not talk much beside a fire. But I do not bite, either.",
        "hi": "By a fire like this I decided to turn back from the edge of the world. I never told anyone why."
      },
      "by_crops": {
        "any": [
          "Crops in rows. Patient work. I respect the patience, if not the turnips.",
          "Someone tends this field daily. A spell of its own kind, slow and green."
        ],
        "lo": "Farmland. Peaceful, and of little interest to me.",
        "hi": "I tried farming for one season, {player}. The wheat grew. I was so bored I left for the Far Lands."
      },
      "by_books": {
        "any": [
          "Books. At last, sensible company.",
          "I have read that one, and that one. This shelf and I are old acquaintances."
        ],
        "lo": "You stand near books. Have you opened them? That is the question that matters.",
        "hi": "Read me a first line from any of these, apprentice, and I can say whether the author was honest."
      },
      "in_snow": {
        "any": [
          "Snow. It quiets the whole world. I wish more things did.",
          "White ground, white hat, white beard. I am difficult to find today."
        ],
        "lo": "The cold does not trouble me. My robe is older and wiser than it looks.",
        "hi": "The snow has covered our footprints already, {player}. I like that. No one knows where we have been."
      },
      "holding_gift": {
        "any": [
          "That {item} in your hand. My eye went to it before I greeted you. Forgive me.",
          "You carry something an old wizard would notice. I have noticed."
        ],
        "lo": "{item}. A curious thing for you to be holding. I say no more.",
        "hi": "{item}, {player}? You do know my weaknesses. There are only a few, and you found them."
      },
      "holding_weapon": {
        "any": [
          "You hold a {item}. Tell me, do you carry it from fear or from purpose?",
          "A weapon drawn. I hope whatever earned it was worth the meeting."
        ],
        "lo": "Armed. I have no quarrel with you, nor you with me, I trust.",
        "hi": "That {item} has kept you alive, apprentice, so I think well of it. But think first. Always first."
      },
      "holding_food": {
        "any": [
          "You are holding {item}. Good. A thought on an empty stomach is half a thought.",
          "Food in hand. I often forget to eat until the candle burns out."
        ],
        "lo": "Your meal is your own affair. Do not let me keep you from it.",
        "hi": "Is that {item}? Good. You forget to look after yourself, {player}. I have watched you do it."
      },
      "holding_rod": {
        "any": [
          "A fishing rod. The one pastime that is mostly waiting. I approve of it.",
          "Fishing teaches patience more cheaply than I do."
        ],
        "lo": "You fish. Then you can sit still. That is promising.",
        "hi": "I would sit beside you while you fish, {player}. You hold the rod. I shall hold the silence."
      },
      "holding_tool": {
        "any": [
          "A {item}. Honest work. The ground gives up its secrets slowly to those who dig.",
          "You have been labouring. There is dust on you, and on that tool."
        ],
        "lo": "You work with your hands. I work with my head. Neither of us should boast.",
        "hi": "Always that {item} in your hands, apprentice. I admire the effort. I worry about the rest you do not take."
      },
      "armored": {
        "any": [
          "Full armour. You expect the world to strike you. It usually obliges.",
          "You shine like a new kettle. I can see my beard in your chestplate."
        ],
        "lo": "So much metal. I wonder what you are like without it.",
        "hi": "I am glad of every plate on you, {player}. I have known too many brave people in thin coats."
      },
      "hurt": {
        "any": [
          "You are badly hurt. Be still. Whatever did this can wait.",
          "There is blood on you, and you are swaying. That is not a small wound."
        ],
        "lo": "You are wounded. I am not so cold as to ignore that. I will stand by you.",
        "hi": "{player}. You are hurt. I did not wait a hundred years for an apprentice to lose one like this."
      },
      "wet": {
        "any": [
          "You are soaked through. Water is running out of your boots.",
          "Dripping. Did the river win, or did you?"
        ],
        "lo": "You are very wet. I will stand slightly further off, with my books in mind.",
        "hi": "Wet to the skin, apprentice, and smiling about it. I do not understand you. I do not need to."
      },
      "sneaking": {
        "any": [
          "You are crouching. I heard you all the same. Old ears, long practice.",
          "Creeping about low to the ground. From whom are we hiding?"
        ],
        "lo": "You sneak up on a wizard. That is either courage or poor judgment.",
        "hi": "I see you down there, {player}. If we are hiding from someone, at least tell me who."
      },
      "long_time": {
        "any": [
          "Some days have passed since we spoke. I marked each of them.",
          "You have been away. The quiet was pleasant at first, and then it was only quiet."
        ],
        "lo": "It has been a while. I wondered whether you had lost interest.",
        "hi": "Days, apprentice. I kept a thought for you, and it nearly went stale. Where have you been?"
      },
      "first_today": {
        "any": [
          "Good day. You are the first voice I have heard since waking.",
          "Ah. I heard your step on the path before I saw you. Good day."
        ],
        "lo": "Good day to you. I am Darian still, in case you had forgotten.",
        "hi": "{player}. Good. I woke with a question for you, and I have been turning it over since."
      },
      "zoo_busy": {
        "any": [
          "The zoo is full to its fences. I have never heard so many opinions at once.",
          "A great press of guests today. The animals bear it better than I do."
        ],
        "lo": "Your zoo is crowded. That is success, I am told. It is also loud.",
        "hi": "So many came, {player}. You should be proud. I will be proud from that quiet corner over there."
      },
      "zoo_empty": {
        "any": [
          "No guests at all. The zoo is as I prefer it. Do not tell anyone I said so.",
          "Empty paths. I can hear each animal separately today."
        ],
        "lo": "There is no one here but us. You seem troubled by it. I am not.",
        "hi": "An empty zoo worries you, apprentice. To me it is a library with the doors open. They will return."
      },
      "zoo_closed": {
        "any": [
          "Closed. The gates are shut and the animals have the place to themselves.",
          "A closed zoo is a peaceful thing. Like a book between readings."
        ],
        "lo": "You have shut the zoo. I assume you had reasons.",
        "hi": "The gates are closed, {player}. Good. Even you may stop, now and then. I recommend it highly."
      },
      "litter_bad": {
        "any": [
          "There is rubbish along every path. I stepped around it, with dignity.",
          "Litter everywhere. People leave a trail, and it is rarely a flattering one."
        ],
        "lo": "Your paths are untidy today. I mention it without malice.",
        "hi": "The paths are a sorry sight, apprentice. I know you see it too. It does not suit what you have built."
      },
      "stars_high": {
        "any": [
          "I hear the zoo is rated very highly. Praise is pleasant. Do not lean on it.",
          "A fine rating. Earned slowly, I think, which is the only way that lasts."
        ],
        "lo": "The zoo is well thought of. Then you are capable of patience. Good.",
        "hi": "I do not count stars, {player}, except in the sky. But I saw your face, and I am glad for you."
      },
      "stars_low": {
        "any": [
          "The rating is poor, they say. A low mark is only a lesson with a number on it.",
          "Few stars. I have been thought little of myself, in several kingdoms."
        ],
        "lo": "Your zoo is rated badly at present. What you do next is what I am watching.",
        "hi": "A poor rating, apprentice. I failed my first spell forty times. Then I did not. That is all there is."
      },
      "coins_low": {
        "any": [
          "The Zoo Coins are nearly spent, I gather. I have been poor on the road. It is survivable.",
          "An empty purse. It makes people careful. Careful is not the worst thing to be."
        ],
        "lo": "You are short of coin. I offer no advice. You have not asked for any.",
        "hi": "Coins come and go, {player}. I once owned one boot and a book. I was not unhappy."
      },
      "animal_sick": {
        "any": [
          "One of the animals is unwell. I heard it in its breathing as I passed.",
          "A creature here is suffering. Even the mild ones do not deserve that."
        ],
        "lo": "There is a sick animal in your care. I trust it weighs on you.",
        "hi": "The animal is poorly, and so are you for worrying, {player}. Your worry speaks well of you. Keep it."
      }
    },
    "near": {
      "damien": [
        "Damien stands there, himself again. I searched so long that I hardly know what to do with finding him.",
        "That is Damien. We were rivals once, then friends, then neither. Now we are neighbours. I prefer it."
      ],
      "chasm": [
        "Chasm studies the void and shows only two purple eyes. We have never needed many words.",
        "That hooded one is Chasm. Blunt as a brick, and usually right. I find it restful."
      ],
      "sophia": [
        "Sophia keeps the old histories. She is the only neighbour who has corrected me and been correct.",
        "There is Sophia. We once read in the same room for four hours and said nothing. A perfect afternoon."
      ]
    }
  },
  "damien": {
    "intro": "I am Damien. I was a wizard of the End, and then, against my will, I was the Void Dragon. Now I am the protector of this village. I keep watch at night so that everyone else may sleep.",
    "scenes": {
      "home_morning": {
        "any": [
          "You find me just in from the night watch. My boots are still wet with dew.",
          "Morning. Everyone else is waking, and I am about to sleep. I like hearing them stir."
        ],
        "lo": "You came to my door. Few do. I am sorry the house is so bare.",
        "hi": "{player}. Come in. I was going to sleep, but I would rather hear your voice first."
      },
      "home_evening": {
        "any": [
          "Evening. I am lacing my boots. The watch starts when the last lamp is lit.",
          "This is my hour to make ready. I eat an apple, I check my wand, I go."
        ],
        "lo": "I am about to go out on patrol. Speak freely. I am listening while I make ready.",
        "hi": "Before every watch I sit here a moment and remember whose house this is. Mine. You did that."
      },
      "walking_to_zoo": {
        "any": [
          "I am walking to the zoo, slowly for once. I have no rounds to keep on this path.",
          "On my way to see the animals. I walk on the outside of the road. A guard's habit."
        ],
        "lo": "I am only going to the zoo. You need not step aside for me.",
        "hi": "Walk with me, {player}. I spent years above the ground. A path under my feet is still a pleasure."
      },
      "at_zoo": {
        "any": [
          "I am a visitor here, like any other. Nobody has asked me to leave. I notice that each time.",
          "I pass each exhibit and check the fences without meaning to. All sound."
        ],
        "lo": "I am only looking at the animals. I will not go near the pandas.",
        "hi": "I nearly burned all of this, {player}. Now I stroll through it like anyone. I prefer this version of me."
      },
      "walking_home": {
        "any": [
          "I am heading home to rest before the night watch. The zoo was calm today.",
          "Home, then sleep, then patrol. An ordinary day. I wanted one for so long."
        ],
        "lo": "I am on my way home from the zoo. Good day to you.",
        "hi": "A day at your zoo and a bed to go back to. I still cannot quite believe either, my friend."
      },
      "at_work": {
        "any": [
          "I am on my rounds. Six doors checked, the rest still to go.",
          "All quiet so far. I prefer a dull night. Dull means everyone slept."
        ],
        "lo": "I am on patrol. You are safe with me here. I know that is strange to hear from me.",
        "hi": "Do you want to see something, {player}? Watch the next thing that crawls out of the dark. One flick."
      },
      "following": {
        "any": [
          "I am with you. Whatever we meet, I would be glad of the exercise.",
          "Daylight and open country. I used to see this only from far above, and never kindly."
        ],
        "lo": "You asked me along. I will try to be worth the trust.",
        "hi": "Out in the world beside you, {player}, on foot. If something attacks, let me have the first one."
      },
      "following_night": {
        "any": [
          "Night, and far from the village. I hope my doors are quiet without me.",
          "The dark is my working hour. Out here I am simply working further afield."
        ],
        "lo": "You walk at night with the thing people once feared most. That is brave of you.",
        "hi": "I see well in the dark, my friend. Too well. Nothing reaches you while I am behind you."
      },
      "staying": {
        "any": [
          "I am holding this spot. I have watched every direction at least twice.",
          "Still here. Standing guard is what I do best, even over an empty patch of ground."
        ],
        "lo": "You told me to wait, so I wait. I do as I am asked now.",
        "hi": "I will stand here until you come back, {player}. I was stuck for years. A few minutes by choice is easy."
      },
      "rain": {
        "any": [
          "It is still raining. I have stopped wiping my face. I let it run.",
          "The rain puts out no fire of mine now. It only falls. I find that restful."
        ],
        "lo": "Rain. You may shelter. I will keep to my rounds in it.",
        "hi": "The first rain I felt as a man again, I stood in it until I shook. This one feels the same, {player}."
      },
      "thunder": {
        "any": [
          "Thunder. For a moment I thought it was wings. It is only the sky.",
          "A storm. Each flash of lightning shows me the whole village at once. Useful."
        ],
        "lo": "Do not be alarmed by the storm. It is weather. I am watching for the rest.",
        "hi": "I was louder than this once, {player}. I hear thunder and I remember being the thing overhead."
      },
      "full_moon": {
        "any": [
          "A full moon. I can see every roof from here. Nothing moves that I miss.",
          "Bright tonight. The monsters come anyway. They are easier to aim at."
        ],
        "lo": "The moon is full. You can see my face clearly. I hope it does not trouble you.",
        "hi": "There is no moon in the End, my friend. I look at this one every watch. It keeps me company until you do."
      },
      "dark_moon": {
        "any": [
          "No moon. These are the nights I walk my rounds twice as fast.",
          "Black as the void tonight. I know that kind of dark by heart, and it does not own me."
        ],
        "lo": "A very dark night. I will be close by the whole of it. You have my word.",
        "hi": "This dark is like the place you found me, {player}. But here there are doors, and people behind them."
      },
      "dawn": {
        "any": [
          "Sunrise. My watch ends, and nobody was harmed. That is the whole of my wish, every night.",
          "First light. The night things burn or hide, and I may finally sit down."
        ],
        "lo": "Dawn. I am going off duty. The village is yours by day.",
        "hi": "The sun is up and everyone woke safe, {player}. I count that every morning like coins."
      },
      "dusk": {
        "any": [
          "Sunset. My day is about to begin. I feel it in my hands first.",
          "The light is going. Soon the monsters come, and soon they regret it."
        ],
        "lo": "Dusk. I go on watch shortly. Sleep easily tonight, whoever you are to me.",
        "hi": "The sun sets and I am glad of it, {player}. Night is when I can pay this village back."
      },
      "nether": {
        "any": [
          "The Nether. All this fire. I breathed red flame once and want no more of it.",
          "Hostile things in every direction here. Good. I was getting restless."
        ],
        "lo": "I will walk in front in this place. I am not offering it as a courtesy.",
        "hi": "Fire below, fire on the walls. It stirs old memories, my friend. Talk to me while we walk."
      },
      "the_end": {
        "any": [
          "The End. I was born under this sky. It does not feel like coming home.",
          "Endermen. My old neighbours. They do not greet me any more than they ever did."
        ],
        "lo": "This was my home, long before I was anything you would fear.",
        "hi": "I learned my first spells on these islands, {player}. I was proud and careless. You know how it ended."
      },
      "fishing_sky": {
        "any": [
          "Islands in the open sky. I know this height. I never once looked at it calmly before.",
          "Fishing pools above the clouds. Quiet work. Nothing here needs protecting, for once."
        ],
        "lo": "A long way up. I do not fear falling. I remember how flying goes.",
        "hi": "I could sit by this pool all day with you, {player}, and not guard a single thing. Strange and good."
      },
      "acufend": {
        "any": [
          "A round moon full of music. Nobody here knows what I was. They only want me to clap.",
          "These creatures sing at everything. One of them sang at me. I did not know where to look."
        ],
        "lo": "A strange, cheerful place. I am not used to cheerful. I am trying.",
        "hi": "They handed me a drum, {player}. I, who once darkened whole skies. I kept the beat rather well, I think."
      },
      "cave": {
        "any": [
          "A cave. Monsters gather in the dark down here. I intend to disappoint them.",
          "Deep stone on all sides. I am used to open sky, not a ceiling. I manage."
        ],
        "lo": "It is dangerous underground. I will go a step ahead of you.",
        "hi": "Something is clicking in the dark ahead, {player}. Watch this. I have been wanting to show off all day."
      },
      "high_up": {
        "any": [
          "High ground. From here I could see trouble coming a long way off.",
          "I used to look down on the world from higher than this. It looks kinder now."
        ],
        "lo": "A long drop. I have no wings to catch you with, so I am standing between you and the edge.",
        "hi": "I miss the height sometimes, my friend. Not the wings. Only the wind. Up here I have it honestly."
      },
      "hostile_near": {
        "any": [
          "There is a monster close. Give me a moment and there will not be.",
          "I hear it. Something rotten is walking where it should not. I will see to it."
        ],
        "lo": "A monster. You will not need your sword, though you may not believe me yet.",
        "hi": "Did you see that one creeping up, {player}? Count to two. One. There. I do enjoy this."
      },
      "creeper_near": {
        "any": [
          "A creeper, just there. It will not get the chance to hiss twice.",
          "That creeper is too close to you. I dislike a thing that destroys without choosing to."
        ],
        "lo": "Creeper. No need to run. I am quicker than its fuse.",
        "hi": "{player}, a creeper at your back. I have it. Nothing blows up near you while I draw breath."
      },
      "villager_near": {
        "any": [
          "Villagers. They look at me and see only a stranger in black and white. I am grateful.",
          "A village. I count the doors without thinking. Every one of them matters."
        ],
        "lo": "I wonder who watches over these villagers at night. I cannot stop wondering.",
        "hi": "I would patrol this village too, if I could be in two places, {player}. I have considered the spell."
      },
      "pet_near": {
        "any": [
          "Your animal is not afraid of me. Animals usually know. Perhaps it knows something better.",
          "A loyal companion. It guards you as I guard the village. We are colleagues."
        ],
        "lo": "Your pet is watching me. Sensible. I would watch me too.",
        "hi": "It sat on my foot, {player}. Your creature, on my foot. I did not dare move for an hour."
      },
      "farm_animal_near": {
        "any": [
          "Cows and sheep, grazing in the open. They would not have stood so calmly under my shadow once.",
          "Peaceful farm animals. Nothing here needs fighting. I am never sure what to do with my hands."
        ],
        "lo": "Farm animals. They do not run from me. I take what comfort I can.",
        "hi": "A chicken pecked my boot, {player}, and I apologised to it. This is who I am now."
      },
      "zoo_animal_near": {
        "any": [
          "The {species} is so close. It looks at me and does not flinch. I thank it silently.",
          "I stand by the {species} and wonder what it would choose to be, if it could choose."
        ],
        "lo": "That is the {species}. You care for it well. I can tell by how it rests.",
        "hi": "The {species} trusts you, {player}. So did I, before I had any reason to. We were both right."
      },
      "guests_crowd": {
        "any": [
          "So many guests. I am watching the edges of the crowd. I cannot help it.",
          "A crowd, and nobody in it screaming. I will never grow tired of that."
        ],
        "lo": "There are many people here. None of them know me. That is a mercy.",
        "hi": "All these guests, safe and loud and bored, {player}. That is what I fight for. Bored people."
      },
      "residents_crowd": {
        "any": [
          "The neighbours are all out. I know which door each of them sleeps behind.",
          "Half the village stands here, and they left room for me in the circle. Look."
        ],
        "lo": "My neighbours. They were kinder to me than I had any right to ask.",
        "hi": "They wave at me now, my friend. A few even stand close. You began that. I only kept it going."
      },
      "other_resident": {
        "any": [
          "That is {other}. I pass that door every night, and it is always shut and safe.",
          "{other} nodded to me this evening. A small thing. I kept it."
        ],
        "lo": "You know {other}? I guard that house too, though {other} and I have spoken very little.",
        "hi": "{other} left an apple on my step once, {player}, and never said a word. I have not forgotten it."
      },
      "other_player": {
        "any": [
          "You are not alone. {other} travels with you. Good. Two are harder to hurt.",
          "I do not know {other}. I will protect {other} all the same."
        ],
        "lo": "{other} and you, both strangers to me still. I hope to change that.",
        "hi": "{other} may not know what I was, {player}. Tell it kindly, if you tell it."
      },
      "alone_night": {
        "any": [
          "Only us, and the dark. I have listened a full minute. Nothing else is out here.",
          "A still night with nobody about. This is when the village is most mine to keep."
        ],
        "lo": "We are alone in the dark, you and I. I know how that sounds. You are safe.",
        "hi": "With nobody listening, I will say it. Some nights I am still afraid of myself. Less, with you here."
      },
      "by_water": {
        "any": [
          "Water. I look in and a man looks back. I check every time.",
          "The End has no rivers. I could watch this water move for an hour."
        ],
        "lo": "A calm shore. Nothing in the water tonight that concerns me.",
        "hi": "I skimmed a stone across a pond last week, my friend. Six hops. I told no one. Now I have told you."
      },
      "by_lava": {
        "any": [
          "Lava. That red is too near the colour of my old fire. I look, and then I look away.",
          "Open lava. It destroys without meaning to. I understand it too well."
        ],
        "lo": "I am keeping well back from that lava. I have seen what fire does.",
        "hi": "You are close to the lava, {player}, and I do not like it. I have burned enough of this world already."
      },
      "by_flowers": {
        "any": [
          "Flowers. Nothing grows like this in the End. Only pale stone and tall purple stalks.",
          "I am careful where I step among these. I have crushed enough in my time."
        ],
        "lo": "A field of flowers. I feel out of place in it, all in black and white.",
        "hi": "I picked one, {player}. A red one. I did not know what to do with it, so I am simply holding it."
      },
      "by_fire": {
        "any": [
          "A small fire, kept where it belongs. That is all fire ever needed to be.",
          "I warm my hands at it. Once I would have been the one who lit the sky."
        ],
        "lo": "A campfire. I will sit on the far side, if that is easier for you.",
        "hi": "Blue, when the potion works, not red. I think about that by every fire, my friend. Blue is mine to choose."
      },
      "by_crops": {
        "any": [
          "Crops. Someone planted these and trusts they will still be here tomorrow. I like that trust.",
          "Rows of green things. No apple trees, I see. A pity."
        ],
        "lo": "Farmland. Quiet work, done in daylight. The opposite of mine.",
        "hi": "I would like to grow something one day, {player}. An apple tree. Something that takes years and harms nobody."
      },
      "by_books": {
        "any": [
          "Books. I had a library once, in the End. I do not know what became of it.",
          "So many spines. Somewhere among them is a spell someone should have left alone."
        ],
        "lo": "You read? I hope more carefully than I did, once.",
        "hi": "I am reading again, {player}. Slowly. Nothing with spells in it. A story about a farmer, in fact."
      },
      "in_snow": {
        "any": [
          "Snow. Cold and white and quiet. Half of me matches it.",
          "My footprints follow me all round the village on a night like this. Anyone could check my rounds."
        ],
        "lo": "It is cold. I do not feel it much. Scales spoiled me.",
        "hi": "I threw a snowball at Darian's hat last winter, my friend. He froze me for five seconds. Worth it."
      },
      "holding_gift": {
        "any": [
          "Is that {item} in your hand? A fine thing. I had nearly forgotten such things existed.",
          "You are carrying something I have a weakness for. I am trying not to stare."
        ],
        "lo": "{item}. I would not presume. I only admire it from here.",
        "hi": "{item}, {player}? You remember what I like. Nobody remembered anything about me for years."
      },
      "holding_weapon": {
        "any": [
          "A {item}. Good. I like to see a person ready to stand their ground.",
          "You carry a weapon well. I do miss a fair fight, I confess."
        ],
        "lo": "You are armed. If that {item} is for me, I understand. I hope it is not.",
        "hi": "You once raised a weapon against me, {player}, and then lowered it. I think of that whenever I see your {item}."
      },
      "holding_food": {
        "any": [
          "You have {item}. Good. I spent years hungry for all the wrong things.",
          "Food in your hand. I am still relearning what I like. Apples, so far, are winning."
        ],
        "lo": "Please, eat your {item}. Do not let a tired watchman interrupt.",
        "hi": "Finish that {item}, my friend, all of it. You look after everyone and forget yourself. I know the habit."
      },
      "holding_rod": {
        "any": [
          "A fishing rod. Such a peaceful weapon. It only ever threatens fish.",
          "You mean to fish. I have never caught anything I did not regret. Perhaps a fish would be the first."
        ],
        "lo": "Fishing. A quiet pastime. I will keep watch while your back is turned.",
        "hi": "When you fish, {player}, I stand behind you and glare at the dark. It is my favourite kind of guard duty."
      },
      "holding_tool": {
        "any": [
          "A {item}. You build things. I envy that more than I can say.",
          "You have been working. There is honest dirt on your hands."
        ],
        "lo": "You make things with that {item}. I only ever unmade them. I am learning.",
        "hi": "That {item} again, {player}. I like seeing what your days are made of. Mine were all fire, once."
      },
      "armored": {
        "any": [
          "Full armour. Well fitted. Whatever you face, you mean to walk back from it.",
          "You are armoured head to foot. Good. I cannot be beside you every hour."
        ],
        "lo": "Armour. You are wise to wear it. The world has things in it like I was.",
        "hi": "Armour like that stood up to a dragon, my friend. I should know. I tested it rather thoroughly. I am sorry."
      },
      "hurt": {
        "any": [
          "You are hurt. Badly. Who did it? Which way did it go?",
          "Stand behind me. You are in no state to fight, and I am in every state."
        ],
        "lo": "You are wounded. Let me stand guard until you can walk. I ask nothing for it.",
        "hi": "{player}. No. Not you. Sit, breathe. Anything that wants to finish this must come through me."
      },
      "wet": {
        "any": [
          "You are soaked. Did something chase you into the water? Tell me if it did.",
          "Dripping wet. Where I come from nobody has ever been wet. It looks uncomfortable."
        ],
        "lo": "You are drenched. I will not ask. But you may tell me.",
        "hi": "You look half drowned, my friend, and oddly pleased. Was it fun? I am still learning what fun is."
      },
      "sneaking": {
        "any": [
          "You are crouching. Is something hunting you? Say the word and it stops.",
          "Sneaking past the night watchman. I saw you three houses back."
        ],
        "lo": "You creep toward me. I do not blame you for being careful.",
        "hi": "I caught you, {player}. You sneak very well. I am simply better at noticing. Allow me that."
      },
      "long_time": {
        "any": [
          "It has been some days. I checked your door each night regardless.",
          "You were away. I noticed the gap in my rounds where we usually speak."
        ],
        "lo": "It has been a while. I had thought you might have changed your mind about me.",
        "hi": "Days, {player}. I told myself you were busy and not gone. I am glad I was right."
      },
      "first_today": {
        "any": [
          "Good to see you. I slept through the morning, so this is my first hello as well.",
          "You are the first person to speak to me today. It is a good start."
        ],
        "lo": "Hello. I was not sure you would stop. Thank you.",
        "hi": "{player}. There you are. I wake up looking forward to this. I thought you should know."
      },
      "zoo_busy": {
        "any": [
          "The zoo is crowded today. So many people to keep safe, and none of them aware of it.",
          "Packed. I keep to the edges. Old instinct says do not frighten the guests."
        ],
        "lo": "A busy day for your zoo. You have earned it, from what I hear.",
        "hi": "Look how many came, {player}. All this stands because you chose mercy that day. I do not forget."
      },
      "zoo_empty": {
        "any": [
          "No guests. The zoo is as silent as the End today. The animals do not seem to mind.",
          "Empty paths. I hope it is not on my account. Tell me honestly if it ever is."
        ],
        "lo": "Nobody has come today. I am sorry. I know what being avoided is like.",
        "hi": "An empty day is not a judgment on you, my friend. They will be back. People returned even to me."
      },
      "zoo_closed": {
        "any": [
          "The zoo is closed. With the gates shut it is one less thing to watch tonight.",
          "Closed. The animals rest. I walk past the fence anyway, to be sure."
        ],
        "lo": "You have closed the gates. I will still pass by on my rounds.",
        "hi": "Closed, {player}? Good. Rest. I will keep an eye on the walls while you are not looking at them."
      },
      "litter_bad": {
        "any": [
          "Litter across the paths. It is not a monster, so I cannot zap it. I did consider it.",
          "The paths are filthy today. A small corruption, but I dislike any kind."
        ],
        "lo": "There is rubbish on your walkways. I mention it only because I notice everything.",
        "hi": "This litter is not like your zoo, {player}. I know how one neglected thing grows. Forgive the lecture."
      },
      "stars_high": {
        "any": [
          "The zoo is rated among the finest. A place worth protecting. I feel that more each night.",
          "A splendid rating. People leave here happy. I had forgotten that was possible."
        ],
        "lo": "High stars. You are good at this. I am glad I did not end it.",
        "hi": "So many stars do not surprise me, {player}. I saw what you are made of before any guest did."
      },
      "stars_low": {
        "any": [
          "The rating is low. I have been thought worse of, and I am still here.",
          "Few stars. It can be mended. Most things can. I am the proof, standing in boots."
        ],
        "lo": "Your zoo is poorly rated at the moment. I am in no position to judge anyone.",
        "hi": "A bad rating is only where you are, my friend, not what you are. You taught me that."
      },
      "coins_low": {
        "any": [
          "The Zoo Coins have nearly run out, I hear. I never asked this village for a coin, and I never will.",
          "The purse is thin. I owned nothing at all when I arrived, and I was given a home."
        ],
        "lo": "Money is short. I am sorry. I wish spells could fix that kind of trouble.",
        "hi": "No coins, {player}? I cannot conjure them. But nothing will add to your troubles by night. That I can do."
      },
      "animal_sick": {
        "any": [
          "One of the animals is suffering. I felt it as I passed. I know that look from inside.",
          "A creature here is unwell. I can strike down monsters. Against this I am useless."
        ],
        "lo": "An animal is sick. I hope it is tended soon. Nothing should be left weak and alone.",
        "hi": "It hurts you that one is ill, {player}. I was a sick animal once, in a way. You were kind then too."
      }
    },
    "near": {
      "darian": [
        "Darian is there. He hunted me across half the world, and now he lends me books. I do not deserve him.",
        "That is Darian. He still wins every argument by going quiet. Infuriating. I missed it terribly."
      ],
      "chasm": [
        "Chasm studies the void. I lived in it. Chasm asks me questions nobody else dares to, and I answer.",
        "Two purple eyes under a hood. Chasm reminds me of home, in the one way I can bear."
      ],
      "amanda": [
        "Amanda adores pandas and wants to know why I do not. I have not found a way to explain it politely.",
        "That is Amanda. She told me which rock my house is built on, and how old it is. I felt very young."
      ]
    }
  },
  "tim": {
    "intro": "Name's Tim. I analyse books, which means I read them and then hurt their feelings. Zombie, yes. Suit, yes. Vegetarian, also yes. You can stop staring whenever.",
    "scenes": {
      "home_morning": {
        "any": [
          "You're at my door before breakfast. Bold. I'm having a carrot and chapter two, in that order.",
          "Mornings at home are for tea and bad prose. You've interrupted both."
        ],
        "lo": "It's early, I'm in my own house, and I don't know you. Three strikes. State your business.",
        "hi": "Oh, it's you, {player}. Come in. I saved you the chair with the fewest book piles on it."
      },
      "home_evening": {
        "any": [
          "Evening in. Slippers, a lamp, and a novel I fully intend to insult.",
          "I'm winding down. That means the same reading as all day, but with my tie loosened."
        ],
        "lo": "It's evening and this is my house. Visits after dark cost one interesting sentence. Go.",
        "hi": "Sit down, {player}. I'm on the last chapter and I need a witness when it disappoints me."
      },
      "walking_to_zoo": {
        "any": [
          "I'm walking to the zoo. Slowly. It's the one thing zombies and I still agree on.",
          "Halfway down the path and already tired of it. This path needs an editor."
        ],
        "lo": "Yes, a zombie is strolling toward your zoo in daylight. I have a ticket and a tie. Relax.",
        "hi": "If you're headed to the zoo too, {player}, good. I'm told I look less alarming with a friend beside me."
      },
      "at_zoo": {
        "any": [
          "I'm reviewing exhibits as I go. That last one had a strong opening and no plot.",
          "Just browsing the exhibits. The signs are the best writing I've seen all week. Short, too."
        ],
        "lo": "I'm a paying visitor. The guests can stop pointing. I'm not the hostile exhibit.",
        "hi": "Between us, I like it here. Every enclosure is a chapter and nobody dies at the end."
      },
      "walking_home": {
        "any": [
          "Heading home from the zoo. My feet hurt. I didn't know they could still do that.",
          "Day's over. I've seen every animal and judged them fairly. Home to my bookmark."
        ],
        "lo": "I'm on my way home. This is the part where we nod and keep walking.",
        "hi": "Good day at the zoo, actually. Don't tell anyone I said actually. I'm off home, {player}."
      },
      "at_work": {
        "any": [
          "I'm mid-review. This author wrote suddenly nine times on one page. Suddenly, I'm bored.",
          "You've caught me at page two hundred. The hero is still packing his bag. One star pending."
        ],
        "lo": "I'm working. See the book? See the frown? That's the whole job. It's going well.",
        "hi": "Since it's you, here's the draft verdict: brave cover, cowardly ending. You heard it first, {player}."
      },
      "following": {
        "any": [
          "So this is adventure. It's like a book, but with more walking and no chapters to skip.",
          "I'm keeping up. Barely. Zombies were built for shuffling, not for scenery."
        ],
        "lo": "I agreed to tag along. I did not agree to enjoy it. We'll see how the plot goes.",
        "hi": "Out in the sun with you, {player}. If this ends badly I'm writing it up as a comedy."
      },
      "following_night": {
        "any": [
          "Out at night, far from my shelf. The dark doesn't scare me. I used to be the reason it was scary.",
          "Night walk. If my old crowd turns up, I'll handle the small talk. It's mostly groaning."
        ],
        "lo": "Wandering about after dark with someone I hardly know. This is how bad novels start.",
        "hi": "I don't leave my book at night for just anyone, {player}. Note it down somewhere."
      },
      "staying": {
        "any": [
          "Still here. Still standing. I've counted the blocks around me twice. Thrilling stuff.",
          "You said wait, so I'm waiting. I did years of it underground. This is nicer."
        ],
        "lo": "I'm standing where I was put, like a bookmark. Don't read anything into it.",
        "hi": "I'll hold this spot as long as you need, {player}. I've got a paperback in my jacket anyway."
      },
      "rain": {
        "any": [
          "This rain is soaking my tie. A wet tie is just a sad scarf.",
          "More rain. The sky has been writing the same sentence for an hour. Somebody stop it."
        ],
        "lo": "It's raining on both of us. That's the most we've had in common so far.",
        "hi": "You're out in this rain for me, {player}? Touching. Daft, but touching."
      },
      "thunder": {
        "any": [
          "Thunder. The sky is clearing its throat and has nothing to say. I've reviewed authors like that.",
          "Lightning. Loud, flashy, over in a second. Same as every thriller I read this month."
        ],
        "lo": "A thunderstorm, and you chose to spend it chatting with a zombie. Interesting priorities.",
        "hi": "That thunder is right overhead, {player}. I'd rather it missed you. Good readers are hard to replace."
      },
      "full_moon": {
        "any": [
          "Full moon. Somewhere a zombie is groaning at it. I'm using it as a reading lamp.",
          "Big bright moon tonight. Finally, a light I can read by that never tried to cook me."
        ],
        "lo": "Full moon, and I'm the scariest thing out here? In a tie? Please.",
        "hi": "Nice moon, {player}. I'd call it romantic, but I've read too many romances to mean it."
      },
      "dark_moon": {
        "any": [
          "No moon at all. I can't see my own hands. I do know where they are. Mostly.",
          "Pitch dark tonight. Too dark to read. This is the real horror story."
        ],
        "lo": "It's a black night and you're talking to a zombie you barely know. You're either brave or new.",
        "hi": "Can't see a thing, {player}. I only know which shadow is you because it won't stop talking."
      },
      "dawn": {
        "any": [
          "Sunrise. Out in the hills my old crowd is smoking at the edges about now. I just squint a bit.",
          "The sun's coming up. Pink sky, long shadows. Overwritten, if you ask me."
        ],
        "lo": "Dawn. You expected me to burst into flames, didn't you. Sorry to disappoint.",
        "hi": "First light, {player}. I used to dread this hour. Now it just means free reading light."
      },
      "dusk": {
        "any": [
          "Sunset. The sky's doing its big orange ending again. Predictable, but it sells.",
          "Sun's going down. Shift change for the undead. I handed in my notice."
        ],
        "lo": "The light's fading and you're standing next to a zombie. I'd be nervous too, if I cared.",
        "hi": "A sunset with a friend. I've mocked this exact scene in six novels, {player}. It's better in person."
      },
      "nether": {
        "any": [
          "The Nether. Everything is red, hot and shouting. It's like being inside a bad review.",
          "My suit is wool and this place is lava. One of us wasn't consulted."
        ],
        "lo": "You brought a near stranger to a land of fire. I've read this chapter. The sidekick goes first.",
        "hi": "Only for you would I stand on netherrack in a tie, {player}. The piglins are staring. Jealous, I assume."
      },
      "the_end": {
        "any": [
          "The End. Black sky, pale stone, tall fellows who hate eye contact. Finally, my kind of party.",
          "So this is the End. As endings go it's bleak and unexplained. Three stars."
        ],
        "lo": "An endless void, and you invited someone you just met. I admire the recklessness.",
        "hi": "I've read a hundred endings, {player}. This is the first one I've stood in. I'd like you well back from that edge."
      },
      "fishing_sky": {
        "any": [
          "Floating islands with fishing pools on top. Somebody had this idea and nobody stopped them.",
          "We're fishing in the sky. I've stopped asking how. The answer would be physics."
        ],
        "lo": "I'm very high up, beside a pond, with someone I don't know. I'd like a word with the author.",
        "hi": "Fish in the clouds, {player}. If I read this in a novel I'd give it one star. I love it a bit."
      },
      "acufend": {
        "any": [
          "A round little moon with a jungle on it and creatures humming tunes. I've read stranger. Not much stranger.",
          "Everything on this moon hums along to something. Even the locals have rhythm. I have a tie."
        ],
        "lo": "You've taken a stranger to a singing moon. I have questions. I'll save them for the review.",
        "hi": "Purple glow, orange sun, music from nowhere. I can't even be sarcastic, {player}. Give me a minute."
      },
      "cave": {
        "any": [
          "A cave. I lived in one for years. The decor hasn't improved.",
          "Dark, damp, dripping. Smells like my old place. I don't miss it."
        ],
        "lo": "Following a stranger underground. Fine. If I groan, it's my knees, not hunger.",
        "hi": "You know I swore off caves, {player}. Yet here I am, holding my tie out of the gravel for you."
      },
      "high_up": {
        "any": [
          "Long way down. I've been told things fall. Physics said so. I still don't trust physics.",
          "Nice view. Everything looks small and unimportant from up here. So, accurate."
        ],
        "lo": "We're on a ledge and we've barely met. If this is a trust exercise, I'm failing it.",
        "hi": "Mind the drop, {player}. I can survive most things. Watching you fall isn't on the list."
      },
      "hostile_near": {
        "any": [
          "There's a monster over there. It's not with me. We stopped speaking years ago.",
          "Something nasty nearby. It won't bother me. I can't say the same for you."
        ],
        "lo": "Hostile company approaching. For the record, I'm the one in the tie. Easy mix-up.",
        "hi": "That thing is eyeing you, {player}. I don't do violence, but I'll stand in its way and be very rude."
      },
      "creeper_near": {
        "any": [
          "A creeper, right there. All that hissing and it still won't explain itself.",
          "That creeper is tiptoeing over. Worst surprise party guest there is."
        ],
        "lo": "Creeper behind you. I'd stay to watch, but I just had this suit pressed.",
        "hi": "{player}, the green one is hissing. I've lost a lot in death, but I'd like to keep you in one piece."
      },
      "villager_near": {
        "any": [
          "Villagers. They say hrmm at everything. Honestly, the sharpest reviewers I know.",
          "Villagers used to bar the door when I came by. Now one waved. I think. Hard to tell with those sleeves."
        ],
        "lo": "Look at them staring. A zombie in their village and nobody's running. That's my reputation at work.",
        "hi": "A librarian here swaps books with me, {player}. He pays in emeralds. I pay in opinions. He's losing."
      },
      "pet_near": {
        "any": [
          "Your pet is sniffing me. It can't decide if I'm a friend or a very large chew toy.",
          "Nice animal. It's looking at me the way I look at a sequel."
        ],
        "lo": "Your pet is growling at me. Sensible creature. It hasn't read my file either.",
        "hi": "It sat on my shoe, {player}. I think I've been adopted. Don't tell it I'm fond of it."
      },
      "farm_animal_near": {
        "any": [
          "That pig just walked right up to me. A few years ago that would have been a very short story.",
          "Sheep everywhere. They chew and stare. I respect a creature with no opinions about physics."
        ],
        "lo": "Yes, I'm near livestock. No, nothing will happen. I had lettuce for lunch.",
        "hi": "The chickens follow me around now, {player}. I've become a shepherd of poultry. Put that in my memoir."
      },
      "zoo_animal_near": {
        "any": [
          "The {species} and I are having a staring contest. It's winning. It has more to live for.",
          "I asked the {species} what it thought of my last review. Nothing. Tough crowd."
        ],
        "lo": "That {species} hasn't flinched at me. More manners than most of your guests.",
        "hi": "I read to the {species} sometimes, {player}. It prefers the sad chapters. Good taste, for a {species}."
      },
      "guests_crowd": {
        "any": [
          "So many guests. One just asked if I was part of the monster exhibit. I said only on weekends.",
          "This crowd keeps bumping my elbow. I'm trying to read a sign here."
        ],
        "lo": "A crowd of guests, all pretending not to stare at the zombie. Terrible actors.",
        "hi": "I'm sticking by you in this crowd, {player}. Not for your sake. A child keeps trying to feed me popcorn."
      },
      "residents_crowd": {
        "any": [
          "Half the street is standing here. It's like a book club where nobody did the reading.",
          "All the neighbours in one spot. I'm reviewing them quietly. Mostly threes."
        ],
        "lo": "Lots of neighbours about. You could talk to any of them. They're friendlier. Less interesting, though.",
        "hi": "Everyone's gathered, and I'm standing next to you, {player}. I chose well. Don't let it go to your head."
      },
      "other_resident": {
        "any": [
          "{other} is right there. I'd review them, but I haven't finished the first chapter.",
          "Oh good, {other}. Now there are two people I have to be civil to."
        ],
        "lo": "That's {other}. You'd probably rather talk to them. Most people would.",
        "hi": "{other} thinks I'm joking most of the time, {player}. You know I'm joking all of the time."
      },
      "other_player": {
        "any": [
          "Two of you now. You and {other}. I'll need a bigger notebook.",
          "{other} is staring at my tie. It's a good tie. Let them stare."
        ],
        "lo": "You and {other} both. I'm not doing the zombie walk for an audience.",
        "hi": "No offence to {other}, but I've already picked my favourite, {player}. The paperwork's done."
      },
      "alone_night": {
        "any": [
          "Quiet out here. Just us and the dark. This is where the narrator says something ominous.",
          "Nobody around. A person alone at night with a zombie. And somehow I'm the nervous one."
        ],
        "lo": "It's night, it's empty, and you came over to chat with the undead. Curious life you lead.",
        "hi": "I like this, {player}. No crowd, no noise. Just you, me and whatever I'm about to say wrong."
      },
      "by_water": {
        "any": [
          "Water. I used to sink in it and walk along the bottom. Saved on bridges.",
          "Nice pond. I can see my reflection. Green, well dressed, slightly judgemental. Accurate."
        ],
        "lo": "If you're hoping I'll fall in that water, the suit says no.",
        "hi": "I could sit by this water with you for an hour, {player}. I'd read you the dull bits in funny voices."
      },
      "by_lava": {
        "any": [
          "Lava. Bright, slow and deadly. Like a physics lecture.",
          "That lava is close enough to singe my cuffs. I only own the one suit."
        ],
        "lo": "Open lava, and you're standing beside a stranger. I wouldn't push you. Too much effort.",
        "hi": "You're too close to that lava for my liking, {player}. I've done the dying thing. It's overrated."
      },
      "by_flowers": {
        "any": [
          "Flowers. Pretty, quiet, and they never write memoirs. Ideal neighbours.",
          "I'm standing in a flower patch in a suit. Somewhere a poet is taking notes."
        ],
        "lo": "Yes, the zombie likes the flowers. Write it down. Nobody will believe you.",
        "hi": "I pressed one of these in a book once, {player}. It was the best page in it."
      },
      "by_fire": {
        "any": [
          "A campfire. Lovely. I'll sit upwind. Fire and I have history.",
          "This fire's crackling away. Good light for reading. Bad light for looking like a zombie."
        ],
        "lo": "Campfire stories? I've got one. A zombie ate a salad. The end.",
        "hi": "Warm fire, good company. If I had a pulse it would be slowing down nicely, {player}."
      },
      "by_crops": {
        "any": [
          "Now this is literature. Rows of carrots, no adjectives. Five stars.",
          "Farmland. I could watch wheat grow all day. I have. Twice."
        ],
        "lo": "I'm admiring the crops, not robbing them. A vegetarian near vegetables. Imagine.",
        "hi": "Look at those rows, {player}. If I ever retire from mocking books, it's this. Me, a hoe and some beetroot."
      },
      "by_books": {
        "any": [
          "Bookshelves. Hold on, I'm checking the spines. Alphabetical? No. Amateurs.",
          "A wall of books. Statistically, four of them are good. I'll find them."
        ],
        "lo": "You're standing between me and a bookshelf. That's a risky spot for a stranger.",
        "hi": "I'd lend you any book on that shelf, {player}. With my notes in the margins. Rude ones."
      },
      "in_snow": {
        "any": [
          "Snow. I can't feel the cold. I can feel it in my shoes, though, and I resent it.",
          "White everywhere. It's like a blank page. Unsettling."
        ],
        "lo": "A green man in a dark suit on white snow. I'm aware I stand out. No comments, please.",
        "hi": "You're shivering, {player}. I'd offer my jacket, but it's been on a zombie. Your call."
      },
      "holding_gift": {
        "any": [
          "Is that {item}? Not that I'm looking. I'm a professional. I glance.",
          "I see what you're carrying. I have opinions about it. Good ones, for once."
        ],
        "lo": "That's a nice {item} you have. I'm only saying. Strangers can say things.",
        "hi": "You're holding {item} and looking at me, {player}. I'm not getting my hopes up. Fine, they're up."
      },
      "holding_weapon": {
        "any": [
          "That's a {item}. I don't do violence. I do withering remarks.",
          "Weapon out. I'd like to remind everyone that I'm the vegetarian one."
        ],
        "lo": "You're holding a {item} near a zombie you barely know. I've read where this goes. Mind the suit.",
        "hi": "Wave the {item} about all you like, {player}. I know it's not for me. Anymore."
      },
      "holding_food": {
        "any": [
          "Is that {item}? If it grew in soil, I approve. If it had a face, I'm looking away.",
          "You're holding lunch. I can smell it. My nose still works, sadly."
        ],
        "lo": "You brought {item} near a zombie. Bold. Luckily I'm on a strict carrot plan.",
        "hi": "{player}, if that {item} is meat, I forgive you. If it's a vegetable, I admire you."
      },
      "holding_rod": {
        "any": [
          "A fishing rod. Hours of sitting in silence waiting for something. So, reading, but damp.",
          "Going fishing? I don't eat them. I'd just apologise to each one."
        ],
        "lo": "Nice rod. A fisherman hooked me by mistake once. He screamed more than I did.",
        "hi": "If you're fishing, {player}, I'll sit on the bank and narrate. Badly. For hours."
      },
      "holding_tool": {
        "any": [
          "A {item}. Honest work. I prefer dishonest opinions, but each to their own.",
          "You look ready to dig. I spent years underground. The soil has nothing new to say."
        ],
        "lo": "That's a {item}. Please tell me you're not here to rebury me. Kidding. Mostly.",
        "hi": "A {item}, {player}? If you ever swap it for a carrot patch, I'm your first volunteer."
      },
      "armored": {
        "any": [
          "Full armor. You clank when you walk. I heard you from chapter three.",
          "All that plating. Who are you expecting, my cousins?"
        ],
        "lo": "You've armored up to talk to me. I'm flattered, and a little insulted.",
        "hi": "You look like a very shiny book cover, {player}. I hope the contents hold up."
      },
      "hurt": {
        "any": [
          "You look terrible. I'm an expert, I've looked terrible for years.",
          "You're one bad step from joining my side of things. The benefits are poor."
        ],
        "lo": "You're badly hurt. I'm not a healer. I'm barely a person. But even I can see it.",
        "hi": "{player}, you're in a bad way and I don't like it. I've only got the one friend."
      },
      "wet": {
        "any": [
          "You're dripping. I can hear your boots squelch. That's a sound with no good reviews.",
          "You're soaked through. Did the water start it, or did you?"
        ],
        "lo": "You're standing in water talking to a zombie. One of us is making odd choices.",
        "hi": "You're drenched, {player}. Mind my jacket pocket, there's a first edition in there."
      },
      "sneaking": {
        "any": [
          "You're crouching. I can still see you. I'm undead, not unobservant.",
          "Why are we whispering? Is there a librarian nearby?"
        ],
        "lo": "Sneaking up on a zombie. That used to be my job, and I quit.",
        "hi": "{player}, you creep about like a villain in chapter one. I'm proud. Slightly worried, but proud."
      },
      "long_time": {
        "any": [
          "You've been gone for days. I read four books. None of them asked where you were. Neither did I.",
          "Oh, you're alive. Good. I'd started drafting a review of your absence."
        ],
        "lo": "It's been a while. I'd almost forgotten your face. Then I remembered I never learned it.",
        "hi": "Days, {player}. Days. I'm not saying I missed you. I'm saying the spare chair did."
      },
      "first_today": {
        "any": [
          "First visitor of the day. Lucky me. Lucky you. Mostly you.",
          "There you are. Today's forecast: reading, with a chance of sarcasm."
        ],
        "lo": "Hello. Yes, still a zombie. Yes, still harmless. We do this every day, apparently.",
        "hi": "Today's better now you've turned up, {player}. Don't quote me."
      },
      "zoo_busy": {
        "any": [
          "The zoo is heaving. I got stuck behind a family for ten minutes. They read every sign aloud. Wrongly.",
          "Packed today. I've been mistaken for an attraction twice. Once, I bowed."
        ],
        "lo": "All these guests about, and you stop to talk to the zombie. Odd choice. I'll allow it.",
        "hi": "Look at these crowds, {player}. You built something people queue for. I've only ever queued for a sequel."
      },
      "zoo_empty": {
        "any": [
          "Not one guest. I had a whole bench to myself. Best day I've had here.",
          "The zoo paths are deserted. It's eerie. And I say that as a zombie."
        ],
        "lo": "No visitors at all today. I promise it's not because of me. Probably.",
        "hi": "It's empty out there, {player}. Fine for my reading, bad for you. I'd trade the quiet to see it full."
      },
      "zoo_closed": {
        "any": [
          "Gates shut. No guests. The animals look relieved. So do I.",
          "Closed today. Even a zoo needs a bookmark now and then."
        ],
        "lo": "The zoo's closed, so nobody's here to gawk at me. I could get used to it.",
        "hi": "Closed gates, {player}. Just the animals, you, and one overdressed corpse. Cosy."
      },
      "litter_bad": {
        "any": [
          "There's rubbish all over the paths. I stepped on a wrapper. It was better written than my current book.",
          "The litter out there is getting a plot of its own. A bad one."
        ],
        "lo": "I'm a zombie and even I think those paths are a mess. Sit with that.",
        "hi": "I'm only saying this because I like you, {player}. The zoo paths look like a first draft."
      },
      "stars_high": {
        "any": [
          "The zoo's rated near the top. I'd argue, but I can't find the flaw. It's annoying.",
          "Great rating. I haven't handed out that many stars since my own book."
        ],
        "lo": "Your zoo's stars are high. I didn't expect that from you. Take it as praise.",
        "hi": "All those stars, {player}. I'd add another, but I'm told there's a limit. Ridiculous."
      },
      "stars_low": {
        "any": [
          "The zoo's rating is on the floor. I know that view. I spent years down there.",
          "One star or thereabouts. I give that to books I can't finish."
        ],
        "lo": "The rating's poor. I'm a critic, not a liar. It's poor.",
        "hi": "The zoo's reviews are bad, {player}. Reviewers are awful people. Trust me. You'll turn it around."
      },
      "coins_low": {
        "any": [
          "I hear the coins have nearly run out. I've been broke. And dead. Dead was cheaper.",
          "Zoo Coins are thin, they say. This is the chapter where things look bleak. It's never the last one."
        ],
        "lo": "The zoo's short on coins. I'd lend you some, but I get paid in opinions.",
        "hi": "Money's low, {player}. I've got no coins, just a suit and loyalty. You can have the loyalty."
      },
      "animal_sick": {
        "any": [
          "One of the animals isn't well. I noticed. I notice things between chapters.",
          "Something in the zoo looks poorly. I don't joke about that. I checked, I've got nothing."
        ],
        "lo": "An animal out there is in a bad way. Even the rude zombie thinks someone should care.",
        "hi": "{player}, one of yours is unwell. I know you'll see to it. You saw to me, and I was a harder case."
      }
    },
    "near": {
      "dr_foss": [
        "That's Dr. Foss. I gave his memoirs one star. He says I missed the good part. I read it twice. I didn't.",
        "Dr. Foss tells a fine story, {player}. Shelve it under fiction and it's four stars."
      ],
      "mirium": [
        "Mirium sorts her wool by colour. I sort my books by how angry they made me. We get along.",
        "Mirium keeps asking if I have savings. I'm dead. My long term plans are behind me."
      ],
      "jack": [
        "Jack lent me a book once. There was a fish pressed in chapter nine. Good prank. Bad smell.",
        "Jack reads on the dock all day and calls it fishing. I respect anyone with a cover story."
      ]
    }
  },
  "dr_foss": {
    "intro": "Good day! Dr. Foss, archaeologist. If it is old, buried or cursed, I have dug it up, dusted it off and written the book on it. And you are? No matter. You have the look of someone with a relic in the attic.",
    "scenes": {
      "home_morning": {
        "any": [
          "You've caught me at the breakfast table with a map and a magnifying glass. A perfectly normal morning.",
          "Morning in the study. Tea, toast, and a pot shard I'm fairly sure is winking at me."
        ],
        "lo": "A caller, this early? I am Dr. Foss and this is my study. Kindly admire it from the doorway.",
        "hi": "Come in, {player}! Mind the crate. I was just laying out a route I've shown nobody else."
      },
      "home_evening": {
        "any": [
          "Evening at home. I'm cleaning my trowel by lamplight. Some men polish silver. I polish dirt.",
          "The day's notes are written up. I come out of them very well, as usual."
        ],
        "lo": "It's late for visitors. My maps are rolled up and my best stories with them. Another day.",
        "hi": "Take the good chair, {player}. The one with the claw marks. Tonight I'll tell you how it got them."
      },
      "walking_to_zoo": {
        "any": [
          "On my way to the zoo, notebook in hand. Today I'm comparing ankle bones. Thrilling, I assure you.",
          "I walk this path every morning and I still check it for pressure plates. Old habits."
        ],
        "lo": "Dr. Foss, heading to the zoo on scholarly business. Purely scholarly. Why do you ask?",
        "hi": "Off to the zoo, {player}. Between us, I go less for the research and more because I like the place."
      },
      "at_zoo": {
        "any": [
          "I'm touring the exhibits. I see living fossils everywhere. Most of them are the guests.",
          "Every enclosure here is a page of natural history. I'm reading it on foot."
        ],
        "lo": "Just a scholar taking in the exhibits. You may watch me think, if you keep quiet.",
        "hi": "I'll admit it, {player}. I've seen lost cities with less to look at than this zoo of yours."
      },
      "walking_home": {
        "any": [
          "Homeward, with a full notebook and sore boots. A good day's field work at the zoo.",
          "I'm heading back from the zoo. I counted every exhibit twice. Collector's instinct."
        ],
        "lo": "I'm on my way home with my findings. No, you may not see the notebook. Not yet.",
        "hi": "Walking home, {player}, and I spent half the day wishing you'd seen what I saw. I'll sketch it for you."
      },
      "at_work": {
        "any": [
          "You've caught me mid-brush. One wrong stroke and three thousand years goes up in a sneeze.",
          "I'm cataloguing shards. Forty-one so far. Forty of them are the same pot."
        ],
        "lo": "I'm at work, and this is delicate. Admire by all means, but from over there.",
        "hi": "{player}, look at this carving. I haven't shown a soul. I can't read it yet. I did say yet."
      },
      "following": {
        "any": [
          "Daylight, open country, and something unknown ahead. This is what the hat is for.",
          "I've been watching the ground as we go. Old stone under that grass, or I'm no scholar."
        ],
        "lo": "I'll tag along, but do keep up your end. I have carried poor expedition partners before.",
        "hi": "This is the life, {player}. You, me, and a horizon that hasn't been written up yet."
      },
      "following_night": {
        "any": [
          "Night marches. I crossed a whole desert this way once, steering by one star. The wrong star, but still.",
          "Dark out here. I can't see my own boots. I can hear them, and they're complaining."
        ],
        "lo": "Out after dark with someone I hardly know. I've done worse. It ended in a pit.",
        "hi": "I don't mind the dark with you along, {player}. Alone, I talk to my hat. It's a poor listener."
      },
      "staying": {
        "any": [
          "Holding the fort. I've sketched that rock four times now. It hasn't improved.",
          "I'm waiting, as agreed. A dig teaches patience. Weeks of nothing, then one good tooth."
        ],
        "lo": "I'm standing here on your say-so. I don't usually take orders. Note the favour.",
        "hi": "I'll be right here, {player}. Do come back in one piece. I've grown used to having an audience."
      },
      "rain": {
        "any": [
          "This rain is running off my brim and straight down my collar. The hat has betrayed me.",
          "Wet paper, wet boots, wet scholar. Whoever invented rain never had to keep field notes."
        ],
        "lo": "Rain. I'm not at my most charming in rain. You're seeing perhaps eighty percent.",
        "hi": "I loathe this drizzle, {player}, and I'm still standing in it talking to you. Draw your own conclusions."
      },
      "thunder": {
        "any": [
          "That thunder rattled my teeth. The last bang that loud, I'd dropped my flint and steel on my own TNT.",
          "Lightning. Marvellous thing, at a distance. I've had it closer. I don't recommend it."
        ],
        "lo": "A thunderstorm. I'm not frightened. I am merely standing very near the doorway.",
        "hi": "Every flash, I look up at the treetops, {player}. Habit. You know why."
      },
      "full_moon": {
        "any": [
          "A full moon. Bright enough to read an inscription by. I've done it, hanging upside down.",
          "Full moon tonight. Every legend I've chased starts on a night like this. Most end with running."
        ],
        "lo": "A fine moon. I've seen it rise over ruins you couldn't pronounce. But this is pleasant too.",
        "hi": "Look at that moon, {player}. There's another, smaller one I think about on nights like this."
      },
      "dark_moon": {
        "any": [
          "No moon. Black as the inside of a tomb, and I would know.",
          "A new moon. A wonderful night for slipping past guardians. Not that I slip."
        ],
        "lo": "Dark tonight. I'd offer to lead, but I only do that for people whose names I remember.",
        "hi": "I can't see you, {player}, but I know your footsteps by now. You walk like someone carrying treasure."
      },
      "dawn": {
        "any": [
          "Sunrise! Low light throws a shadow off every bump in the ground. That's how you spot a buried wall.",
          "Dawn. I've watched it from pyramid tops and from the bottom of pits. The tops are better."
        ],
        "lo": "Up at first light? Good. I may have underestimated you. Slightly.",
        "hi": "First light, {player}. Best hour there is. Nothing's gone wrong yet and the tea's still hot."
      },
      "dusk": {
        "any": [
          "Sunset. That gold light on stone is why I took up this trade. Well, that and the gold.",
          "The sun's going. I always feel I should be hurrying out of a ruin about now."
        ],
        "lo": "Dusk. A sensible stranger heads home. A scholar lights a torch. Which are you?",
        "hi": "Another sunset, {player}. I didn't dig up a thing today and I enjoyed it anyway. You're a bad influence."
      },
      "nether": {
        "any": [
          "The Nether! Heat, lava and ruins nobody's catalogued. I'd take notes if my pencil weren't smouldering.",
          "Smell that? Sulphur and old stone. Somebody built down here once, and I mean to know who."
        ],
        "lo": "You've led me into a furnace. Bold. If my hat catches fire, we are no longer on speaking terms.",
        "hi": "Only you could talk me into this oven, {player}. That netherrack ridge, though. There's a wall under it, I'd bet my trowel."
      },
      "the_end": {
        "any": [
          "The End. Pale stone, black sky, and tall fellows who hate being looked at. I can't relate.",
          "Nothing below us but void. I've looked into deep pits, but they had the decency to have a bottom."
        ],
        "lo": "So this is the End. I'll thank you not to stand between me and the way back.",
        "hi": "No history written anywhere out here, {player}. Just silence and void. It unsettles me. That stays between us."
      },
      "fishing_sky": {
        "any": [
          "Islands floating in the sky, with ponds on them. I've read no account of this. I shall write the first.",
          "Fishing pools above the clouds. Who dug them? Somebody dug them. Ponds don't dig themselves."
        ],
        "lo": "A long way up, isn't it. I'm not gripping the grass. I'm examining it.",
        "hi": "Fishing in the clouds, {player}. No relics, no traps, no running. I hardly know what to do with myself."
      },
      "acufend": {
        "any": [
          "Acufend. Listen to that music in the trees. I've read about this for years and the books got it all wrong.",
          "A jungle village on a moon, and the locals humming along to a tune. I must not grin. Scholars don't grin."
        ],
        "lo": "You've brought me to Acufend, and we've only just met. Either you're reckless or I've misjudged you.",
        "hi": "We're standing on it, {player}. The moon nobody comes back from. And here we are, coming back. Probably."
      },
      "cave": {
        "any": [
          "Now this is my office. Dripping stone, bad air, and the chance of something older than writing.",
          "See those layers in the cave wall? Each stripe is an age. I'm reading backwards as we go down."
        ],
        "lo": "I'll go first down here. Not for your safety. I simply don't want my finds stepped on.",
        "hi": "Deep caves make me think of goo and walking sharks, {player}. You know the story. I still check the corners."
      },
      "high_up": {
        "any": [
          "What a vantage! From up here you can see where the old roads ran. Stripes of slightly different grass.",
          "I'm not afraid of heights. I climbed a cliff once with a pot under each arm. Don't ask about the pots."
        ],
        "lo": "Quite a drop. I'd tell you about the rope bridge incident, but I don't know you that well.",
        "hi": "Look down there, {player}. All of it unmapped by anyone clever. Luckily, I'm up here."
      },
      "hostile_near": {
        "any": [
          "We have company, and it isn't friendly. I've outrun worse in heavier boots.",
          "Something's shambling about over there. A monster guarding nothing at all. I call that plain rude."
        ],
        "lo": "A monster. Excellent. I shall observe your technique from a safe scholarly distance.",
        "hi": "Trouble close by, {player}. I've a trowel and a great deal of confidence. Back to back, then."
      },
      "creeper_near": {
        "any": [
          "Creeper! I have very personal feelings about things that explode near me.",
          "That creeper is far too close. One blast has already thrown me flat, and my hat still hasn't forgiven me."
        ],
        "lo": "There is a creeper right there, and I am leaving this conversation for a moment. Nothing personal.",
        "hi": "{player}, that hissing is not a snake. It's worse. Well, equal. Mind yourself, partner."
      },
      "villager_near": {
        "any": [
          "Villagers. Wonderful people. Their great-grandparents built half the things I dig up.",
          "I asked that villager about the old well. He said hrmm. I've had worse sources."
        ],
        "lo": "A village. I'm known in a few of these. Not this one, I think. Good.",
        "hi": "See the villager in the robe, {player}? I owe his cousin a map. I'm keeping my hat low."
      },
      "pet_near": {
        "any": [
          "Your companion there keeps sniffing my satchel. It has a nose for bones. So do I.",
          "A loyal animal at your heel. People kept them before they could write. Wise of them, and of you."
        ],
        "lo": "Your pet is giving me a hard look. It's welcome to check my references.",
        "hi": "That pet of yours trusts me now, {player}. Took longer than you did. Better judge of character, perhaps."
      },
      "farm_animal_near": {
        "any": [
          "Cows, sheep, chickens. Every chicken is an egg waiting to happen, and I do love an egg.",
          "That sheep is standing on a rise that looks man-made to me. Excuse me, madam, you're on my dig."
        ],
        "lo": "Livestock. Not my field, strictly. Though I have read everything on the subject, naturally.",
        "hi": "A ram knocked me into my own trench on my first dig, {player}. It's not in the memoirs. You never heard it."
      },
      "zoo_animal_near": {
        "any": [
          "Look at the {species}. That skull shape goes back further than any wall I've ever uncovered.",
          "I'm sketching the {species} for my notes. It keeps moving. Very unprofessional of it."
        ],
        "lo": "A fine {species}. I could tell you its whole ancestry, but that lecture is for people I know.",
        "hi": "I talk to this {species} when nobody's about, {player}. It has heard the jungle story. It was impressed."
      },
      "guests_crowd": {
        "any": [
          "So many guests. Not one has asked for my autograph. They must be shy.",
          "A crowd like this, I'd usually be giving a lecture. Find me a crate to stand on and I still might."
        ],
        "lo": "Busy, isn't it. If any guest asks, I'm a visiting scholar. Which I am. Why would anyone ask?",
        "hi": "Crowds make me check my satchel, {player}. Not because of them. Because of what's in it."
      },
      "residents_crowd": {
        "any": [
          "The whole neighbourhood, gathered in one spot. A captive audience! Has everyone heard about the boulder?",
          "All my neighbours at once. Good people. Not one of them can read a glyph, but good people."
        ],
        "lo": "Plenty of neighbours about. Ask any of them about me. The stories are mostly true.",
        "hi": "Look at them all, {player}. I've told each one a different version of the cave story. I'm counting on your straight face."
      },
      "other_resident": {
        "any": [
          "Ah, {other}. I was just saying something flattering about myself. Do carry on.",
          "{other} has heard my pit story three times and still gasps at the right moment. A fine neighbour."
        ],
        "lo": "That's {other}. Perfectly pleasant, but if it's history you want, you're already talking to the right man.",
        "hi": "{other} thinks my stories are tall tales, {player}. You and I know better. Well, you do. I was there."
      },
      "other_player": {
        "any": [
          "Two of you! You and {other}. An expedition party at last. I'll lead from the middle.",
          "{other} has an honest face. I've been wrong about honest faces before. There was a guide with a parrot."
        ],
        "lo": "And who is {other}? Another collector? I do hope neither of you is after my finds.",
        "hi": "{other} seems capable, {player}, but you're my partner. I don't change partners mid-expedition."
      },
      "alone_night": {
        "any": [
          "Quiet tonight. Just the two of us. On a dig, this is when someone says they heard something.",
          "Not a soul about in the dark. I rather like it. Ruins are like this, only with more spiders."
        ],
        "lo": "Nobody around tonight but us. I'm told I'm excellent company. By me, mostly.",
        "hi": "No one to overhear, {player}, so here's the truth. Half my legend is luck. The other half is running."
      },
      "by_water": {
        "any": [
          "Water. Lovely to look at, dreadful for parchment. I'm keeping the satchel well up the bank.",
          "I saw a whole wall under a lake like this once, clear as day. Then a fish swam through my moment."
        ],
        "lo": "A scholar by the waterside. Very picturesque. You may sketch me if you like.",
        "hi": "One day I'll dive for the drowned ruins, {player}. I'd want you holding the rope. Nobody else."
      },
      "by_lava": {
        "any": [
          "Open lava. I've crossed it on a rope, on a plank, and once on sheer optimism.",
          "Mind that glow. I watched lava swallow a golden idol whole once. I mourned for a week."
        ],
        "lo": "Lava. I'd step back if I were you. I have stepped back already, you'll notice.",
        "hi": "Not so close to the lava, {player}. I've lost relics to it, and those I can replace. Just about."
      },
      "by_flowers": {
        "any": [
          "Flowers. You find them pressed in old tombs, you know. Somebody always cared enough to pick some.",
          "Pollen on my jacket. It has seen sand, soot and goo. Now it smells of poppies. The indignity."
        ],
        "lo": "Botany isn't my field. I shall still have an opinion on these flowers by the end of this sentence.",
        "hi": "Don't tell the others, {player}, but I like it among the flowers. No traps, no curses. Only bees."
      },
      "by_fire": {
        "any": [
          "A campfire! Now we're on a proper expedition. I have a story for every log on it.",
          "Firelight. Every people I've ever studied sat round one of these and told lies. A fine tradition."
        ],
        "lo": "A fire is where explorers swap tales. Yours first. I like to know what I have to beat.",
        "hi": "Fire's good, company's good. Ask me about the hollow log, {player}. Tonight I'd tell it honestly."
      },
      "by_crops": {
        "any": [
          "Farmland. The first thing any great people did was plant something. The second was build a wall round it.",
          "Good rows. I've found seeds in sealed jars older than anyone's grandfather's grandfather."
        ],
        "lo": "Crops. Honest work, farming. I prefer the dishonest kind, with tombs. A scholar's joke.",
        "hi": "Whenever I see turned soil I want to dig deeper, {player}. Do keep me away from the wheat."
      },
      "by_books": {
        "any": [
          "Bookshelves! Let me see. Read it, read it, wrote the foreword, read it.",
          "The smell of old paper. I've followed that smell through three libraries and one collapsing vault."
        ],
        "lo": "A decent shelf. If there's a puzzle book on it, I've likely solved it already. In ink.",
        "hi": "Somewhere on a shelf like this is the book that started me off, {player}. A puzzle book. Last page torn out."
      },
      "in_snow": {
        "any": [
          "Snow. It keeps things beautifully. I dug a boot out of ice once, good as new. Not my size, sadly.",
          "Cold feet, cold hands, warm hat. At least it isn't rain. Snow has the manners to arrive dry."
        ],
        "lo": "I'm not shivering. That's scholarly excitement. Very cold scholarly excitement.",
        "hi": "You've snow on your shoulders, {player}. You look like a statue I once failed to bring home."
      },
      "holding_gift": {
        "any": [
          "Is that {item}? No, no, don't mind me. I'm only looking. Looking very hard.",
          "That's a handsome {item} you have there. I'd know. I've appraised whole collections."
        ],
        "lo": "My word, {item}. Where did you come by it? Purely a scholar's curiosity.",
        "hi": "{player}, you're carrying {item} and you know exactly what that does to me. Cruel, and very like you."
      },
      "holding_weapon": {
        "any": [
          "A {item}, eh? Good. I talk my way out of most things, but not all things.",
          "Armed, I see. I carry a trowel myself. It has stopped more trouble than you'd think."
        ],
        "lo": "That's a {item} in your hand, and we've barely been introduced. I'll keep my satchel on this side.",
        "hi": "I like seeing that {item} in your hand, partner. Where we tend to end up, some things can't be reasoned with."
      },
      "holding_food": {
        "any": [
          "Is that {item}? I've eaten field rations out of a boot. That looks a great deal better.",
          "Food! A sound explorer eats when he can. I once went three days on one biscuit and my own charm."
        ],
        "lo": "You have {item}. I'm not asking. A gentleman scholar never asks. He hints.",
        "hi": "{player}, if that {item} is for the road, we're a proper expedition now. Provisions and everything."
      },
      "holding_rod": {
        "any": [
          "A fishing rod. I hooked an old boot once and declared it an artifact. It was only somebody's boot.",
          "Fishing, are we? People pull the oddest old things out of the water. I'd watch that line closely."
        ],
        "lo": "A rod. A patient man's tool. I'm more of a kick-the-door-in scholar, myself.",
        "hi": "If you land anything old and odd on that rod, {player}, I want first look. Friend's privilege."
      },
      "holding_tool": {
        "any": [
          "A {item}! Now you're speaking my language. Mine's a trowel, but it's the same dialect.",
          "That {item} has seen some work. Good. I distrust a clean tool."
        ],
        "lo": "You dig, do you? With a {item}? We may have more in common than I assumed.",
        "hi": "{player}, with that {item} and my instincts, there isn't a buried thing that could hide from us."
      },
      "armored": {
        "any": [
          "Full armor! You look like something I'd find standing guard in a tomb. That's a compliment.",
          "All that plate. I get by on leather and nerve, myself. Lighter to run in."
        ],
        "lo": "Armored head to toe. Expecting trouble, or just meeting me? Both are reasonable.",
        "hi": "Good, you're plated up, {player}. One of us should be, and the jacket is part of my look."
      },
      "hurt": {
        "any": [
          "You're badly knocked about. I've seen that look on men who pulled the wrong lever.",
          "You're hurt. I'd offer you my field kit, but it's mostly brushes."
        ],
        "lo": "You look half finished. That's a doctor's opinion. A doctor of history, but still.",
        "hi": "{player}, you're in a state. I've had one partner run off. I won't have another keel over."
      },
      "wet": {
        "any": [
          "You're soaked. Kindly drip away from the satchel. There are maps in there older than this street.",
          "Dripping wet. Now you know how I feel about rain, only you chose it."
        ],
        "lo": "You appear to be standing in water. Is that deliberate? I never know with new people.",
        "hi": "You look like something I'd haul out of a drowned ruin, {player}. A good find, mind you."
      },
      "sneaking": {
        "any": [
          "Why are we crouching? Is it a tripwire? It's always a tripwire.",
          "Low and quiet, I see. I approve. I crossed a whole treasure room like that once. Nearly."
        ],
        "lo": "You're creeping about. People who creep have secrets, and I can't abide secrets.",
        "hi": "Ha! You sneak just as I taught you, {player}. Did I teach you? I'm taking the credit regardless."
      },
      "long_time": {
        "any": [
          "There you are! It's been days. I've had three breakthroughs and nobody to gloat to.",
          "Back at last. I was about to mount an expedition to find you. A small one."
        ],
        "lo": "Ah, it's you. It has been some days. I had nearly filed you under lost civilizations.",
        "hi": "{player}! Days without a word. I told my best story to a pot. The pot didn't gasp once."
      },
      "first_today": {
        "any": [
          "Good day to you! I've a new theory since breakfast and you're the first to hear that I have it.",
          "Ah, the day's first conversation. I've been saving my best sentence. That was it."
        ],
        "lo": "Good day. Dr. Foss. We've met, I think. I meet a great many people. They remember me.",
        "hi": "There's my partner! I woke up with an idea today, {player}, and you're in it."
      },
      "zoo_busy": {
        "any": [
          "The zoo is packed today. I gave directions to nine guests and a lecture to two who didn't ask.",
          "What a throng at the zoo. A crowd like this would have flattened any ruin I've worked in."
        ],
        "lo": "Busy day at your zoo. You've a knack for drawing people. I have the same gift.",
        "hi": "Look at these crowds, {player}. People will cross a desert for a wonder. You've built one they can walk to."
      },
      "zoo_empty": {
        "any": [
          "Not a single guest. The zoo paths are as quiet as a sealed tomb. I'd know.",
          "No visitors today. Just me and the exhibits. They're getting a very thorough study."
        ],
        "lo": "No guests, I see. I've had lectures like that. Well, one. It was raining.",
        "hi": "Nobody's come today, {player}. Don't take it to heart. The best places I ever found stood empty for ages."
      },
      "zoo_closed": {
        "any": [
          "Gates shut. I rather like a place with the doors closed. Makes me want to see inside.",
          "The zoo's closed today. The animals carry on regardless. They never did care for an audience."
        ],
        "lo": "The zoo is closed, and I am not attempting to get in. I mention it for no reason.",
        "hi": "Closed gates, {player}. In my line of work that's an invitation. Here I shall behave. For you."
      },
      "litter_bad": {
        "any": [
          "The paths are thick with litter. In a thousand years some poor scholar will dig it up and call it culture.",
          "Rubbish all over the zoo. I study what people throw away, but I prefer it aged."
        ],
        "lo": "I couldn't help noticing the litter on your paths. I notice everything. It's a burden.",
        "hi": "{player}, a friend tells a friend. The zoo paths look like the top layer of a very lazy dig."
      },
      "stars_high": {
        "any": [
          "A top rating! Deserved. I've put my name to lesser wonders.",
          "Four or five stars, I hear. I'd carve that on a stone tablet. Lasts longer than talk."
        ],
        "lo": "Your zoo is highly rated. I only settle near excellence, so that's no surprise to me.",
        "hi": "All those stars, {player}. I told everyone you'd do it. Well, I thought it loudly."
      },
      "stars_low": {
        "any": [
          "The rating's poor, I hear. Every great ruin was once called a heap of rocks. Then I arrived.",
          "A low rating. Ratings are opinions, and I've dug up whole cities that opinion said weren't there."
        ],
        "lo": "The zoo's stars are low. I say so plainly. I don't keep unpleasant things secret.",
        "hi": "The rating stings, {player}, I know. I've been laughed out of lecture halls. Then I came back with proof."
      },
      "coins_low": {
        "any": [
          "Coins running short, I hear. I funded a whole season once on one gold tooth and a great deal of talk.",
          "The zoo's purse is nearly empty. Every expedition hits that week. The good ones keep walking."
        ],
        "lo": "Short of Zoo Coins? I'd sympathise more, but I've been penniless in three deserts.",
        "hi": "Low on coins, {player}? I've always had more friends than gold. Well, recently. Since you."
      },
      "animal_sick": {
        "any": [
          "One of the animals is poorly. I study bones, not living patients, but I can see when a creature is off.",
          "There's a sick animal in the zoo, and I can't joke about it. Living things matter more than relics."
        ],
        "lo": "An animal here is unwell. I thought you should hear it straight. I don't sit on bad news.",
        "hi": "{player}, one of your animals is suffering. You'll put it right, I know you. It's just hard to watch."
      }
    },
    "near": {
      "tim": [
        "Tim gave my memoirs one star, {player}. I've had curses that were kinder. And there he stands, looking pleased.",
        "Tim is the only zombie I've met outside a tomb. Far better dressed than the tomb ones."
      ],
      "amanda": [
        "Amanda says my fossil is only a funny rock. I say her rock is only an unfunny fossil. We'll settle it over tea.",
        "Amanda knows what the stone is made of. I know who carved it. Between us, there's one whole genius."
      ],
      "darian": [
        "Darian has seen the edge of the world and won't tell me what's there. A secret! The cheek of it.",
        "I asked Darian's age. Darian asked the age of my oldest pot, then smiled. I dislike that smile."
      ]
    }
  },
  "mirium": {
    "intro": "Oh, a new face, how lovely! I'm Mirium, and I'm the banker here. I look after the Zoo Coins, keep a small shop, and sort things that never asked to be sorted. Welcome!",
    "scenes": {
      "home_morning": {
        "any": [
          "You've caught me before work! I'm lining up my quills by length. It sets the tone for the day.",
          "Morning at my house means tea, one biscuit, and yesterday's totals checked once more for luck."
        ],
        "lo": "Oh, good morning! We haven't spoken much yet, have we? A visitor before breakfast, how nice.",
        "hi": "{player}! I set out a second cup this morning, just in case. See? Planning ahead pays."
      },
      "home_evening": {
        "any": [
          "The day's all added up, so now it's slippers and my wool blanket. The green one tonight.",
          "I'm winding down. I moved the armchair two blocks to the left this evening. Much better."
        ],
        "lo": "Good evening! The books are shut for the night, but a friendly hello costs nothing.",
        "hi": "Sit with me, {player}. I keep one chair just for you. I don't tell the other chairs."
      },
      "walking_to_zoo": {
        "any": [
          "I'm on my way to the zoo! I count my steps on this path. It's a round number if I skip at the end.",
          "Off to see the animals before the sums pile up. A little joy first, then the ledger."
        ],
        "lo": "Hello there! I'm Mirium, from the bank, walking to the zoo. Isn't it a pleasant path?",
        "hi": "Walking to the zoo, {player}, and now I've got you beside me. That's interest on a good morning."
      },
      "at_zoo": {
        "any": [
          "I'm having a wander round the exhibits. No ledger, no quill. Well, a small quill.",
          "I do love visiting. Every enclosure so nicely fenced and labelled. It speaks to me."
        ],
        "lo": "What a well kept zoo you have! I say that as a visitor today, not as your banker.",
        "hi": "I come to the zoo to stop thinking about numbers, {player}. Then I count the animals. I can't help it."
      },
      "walking_home": {
        "any": [
          "Homeward! My feet are tired and my heart is full. That's a good day's balance.",
          "I'm heading home from the zoo. I'll write the animals up in my diary. In alphabetical order, of course."
        ],
        "lo": "I'm just off home for the day. It was nice to see you! I hope we'll talk more soon.",
        "hi": "What a day, {player}. I'll sleep well tonight. I always do when the books and the animals are both fine."
      },
      "at_work": {
        "any": [
          "You've caught me mid-column! Hold on. Seven, carry the two. There. Hello!",
          "I'm at my desk, where everything adds up. It's my favourite place for exactly that reason."
        ],
        "lo": "Welcome to the bank! I'm in the middle of the day's entries, but I always have a minute for a customer.",
        "hi": "For you I'll put the quill down, {player}. I don't do that for just any account."
      },
      "following": {
        "any": [
          "An outing in the daylight! I brought a little notebook to list everything we see.",
          "I don't get past our street much. Look at all this! Nothing is in rows and I almost like it."
        ],
        "lo": "Thank you for bringing me along! I'll try not to slow you down. I walk at a sensible pace.",
        "hi": "Adventuring with you, {player}! Who'd have guessed it of a banker? I feel quite daring."
      },
      "following_night": {
        "any": [
          "It's very dark out here, isn't it? I'm counting the stars to stay calm. I've lost my place twice.",
          "A night walk, far from my ledgers. They'll manage one evening without me. I hope."
        ],
        "lo": "I don't usually go out after dark with someone I've only just met. I'm trusting you!",
        "hi": "I'd be nervous out here at night with anyone else, {player}. With you it feels like a safe deposit."
      },
      "staying": {
        "any": [
          "I'm waiting right where you left me. I've tidied the pebbles round my feet while I'm at it.",
          "Standing still is no trouble. I'm doing sums in my head. I'm up to quite a big one."
        ],
        "lo": "I'll wait here, no bother at all! A good banker is always where you expect her.",
        "hi": "Take your time, {player}. I'll be here. I'm as dependable as compound interest."
      },
      "rain": {
        "any": [
          "Listen to it come down! Rain is just the sky making regular deposits.",
          "It's pouring! My hair is pinned for all weathers, thank goodness."
        ],
        "lo": "Wet out, isn't it? You're welcome to shelter by me. The bank turns nobody away.",
        "hi": "You're out in this rain, {player}? I'd share my umbrella, but then I'd fuss over your wet boots."
      },
      "thunder": {
        "any": [
          "Goodness, that thunder! I dropped a whole stack of coins. Now I get to count them again. Silver lining!",
          "What a storm. I count between the flash and the bang. I count everything, it helps."
        ],
        "lo": "That was a loud one! I gave a little hop. Quite all right, though, thank you.",
        "hi": "I do my neatest sums in a storm, {player}. With you here I might just sit and listen to it."
      },
      "full_moon": {
        "any": [
          "A full moon! Round and bright as a brand new coin. I always think so.",
          "Look how the moonlight lines up the rooftops. Everything in neat silver rows."
        ],
        "lo": "Lovely moon tonight, isn't it? It makes even a late hour feel friendly.",
        "hi": "If I could bank that moon for you, {player}, I would. Top shelf, labelled, safe."
      },
      "dark_moon": {
        "any": [
          "No moon at all tonight. I can't see my own hands. I do hope my hair is still straight.",
          "Such a black night! The sky's account is empty. It always fills up again, though."
        ],
        "lo": "It's awfully dark with no moon. I'm glad to hear a voice, even one I don't know well yet.",
        "hi": "I can't see a thing, {player}, but I'd know your step anywhere. I've a good memory for regulars."
      },
      "dawn": {
        "any": [
          "Sunrise! A clean page, a sharp quill, and a whole day with nothing spent yet.",
          "Look at that gold coming over the hill. The one kind I can't count, and I don't mind a bit."
        ],
        "lo": "Up with the sun! That's a good sign in a person. Early risers keep tidy accounts, I find.",
        "hi": "First light, {player}, and yours is the first face I see. I couldn't have budgeted for a nicer morning."
      },
      "dusk": {
        "any": [
          "There goes the sun. I do like an ending you can set your day by.",
          "Sunset! The sky's all pink and gold. I'd upholster a sofa in exactly that."
        ],
        "lo": "Evening's coming on. I hope your day closed in the black, as we say at the bank.",
        "hi": "Another sunset, {player}. Whatever the totals say, I count any day with you in it as profit."
      },
      "nether": {
        "any": [
          "Oh my. It's very warm, and nothing here is level. Who looks after this place?",
          "So this is the Nether. Lava simply left running, with no one minding it! The waste!"
        ],
        "lo": "I'm a long way from my desk. I'll keep close, if you don't mind. I'm new to lava.",
        "hi": "{player}, I've pinned my hair twice for this heat. A banker in the Nether! I'll be telling this one for years."
      },
      "the_end": {
        "any": [
          "There's no floor past that edge. No floor at all! I'm standing in the middle, thank you.",
          "What a quiet place. Those tall dark fellows keep carrying blocks about. Not one puts them back properly."
        ],
        "lo": "It's very strange here in the End, and I don't know you well. I'm choosing to be brave about both.",
        "hi": "It's so empty, {player}. Like a ledger nobody ever wrote in. I'm glad you're beside me."
      },
      "fishing_sky": {
        "any": [
          "Islands in the sky with little pools on them! Somebody arranged these rather nicely.",
          "We're above the clouds! I'm not looking down. I'm looking at that pond, which is at a sensible height."
        ],
        "lo": "I've never been this high up. Thank you for the invitation! I'm holding on to my hairpins.",
        "hi": "A day off in the sky with you, {player}. Not a ledger for miles. I feel positively reckless."
      },
      "acufend": {
        "any": [
          "A round little moon with a jungle village! And listen, even the creatures are humming in time.",
          "What a place. Everyone on this moon loves a tune. I've caught myself tapping my foot in fours."
        ],
        "lo": "This is a long way to come with someone new. Look at that sky, though! I'm glad I said yes.",
        "hi": "{player}, I count coins for a living and you've taken me to a singing moon. I've no column for this."
      },
      "cave": {
        "any": [
          "It's very deep, isn't it? I've been counting the drips. They aren't regular. It bothers me.",
          "So much stone down here, and none of it stacked. A cave is just a warehouse nobody tidied."
        ],
        "lo": "I'm more of an office person, truth be told. I'll stay near your torch, if that's all right.",
        "hi": "Only for you would I get cave dust on these shoes, {player}. They were filed under best."
      },
      "high_up": {
        "any": [
          "Oh, what a view! Everything's so small and tidy from up here. Like a model.",
          "We're very high. I feel like the top figure in a very long column."
        ],
        "lo": "It's a long way down. I'm smiling, but I'm also standing well back.",
        "hi": "Look at it all from up here, {player}. You can see how much you've built. I get quite misty."
      },
      "hostile_near": {
        "any": [
          "There's a monster just over there! I'm sure it's lovely to its mother, but I'd rather not meet it.",
          "Something unfriendly is about. If it's one of those skeletons with a bow, I shall be very put out."
        ],
        "lo": "Excuse me, I don't wish to alarm you, but there's a monster rather near us.",
        "hi": "{player}, that thing's coming closer. I'll stand behind you and think very encouraging thoughts."
      },
      "creeper_near": {
        "any": [
          "A creeper! Right there! Those things are terrible for property values.",
          "That creeper is far too near. One bang and somebody has a great deal of tidying to do."
        ],
        "lo": "Oh! There's a creeper behind you. I'm sorry to interrupt, I thought you'd want to know.",
        "hi": "{player}, creeper! Furniture I can replace. You I can't. I've checked the inventory."
      },
      "villager_near": {
        "any": [
          "Villagers! They do love an emerald. People after my own heart.",
          "What a nice village. I keep wanting to straighten their market stalls."
        ],
        "lo": "Aren't the villagers friendly? Always ready to trade. I feel quite at home.",
        "hi": "I haggled with a villager once, {player}. We both said hrmm for an hour. I won by a carrot."
      },
      "pet_near": {
        "any": [
          "Oh, who's this? What a good, loyal face. Hello, you!",
          "Your pet is sitting so nicely. Somebody's been well brought up."
        ],
        "lo": "What a dear pet you have. May I say hello? I always ask first.",
        "hi": "Your pet came straight to me, {player}. I keep a spot by my desk clear for visits like that."
      },
      "farm_animal_near": {
        "any": [
          "Chickens, cows and pigs, all muddled together. I'd love to line them up by height.",
          "That sheep has the softest looking coat. I'm thinking cushions. I'm always thinking cushions."
        ],
        "lo": "Farm animals! So honest and useful. I do admire anything that earns its keep.",
        "hi": "I call that cow Dividend, {player}. She pays out every morning. Don't tell the farmer I renamed her."
      },
      "zoo_animal_near": {
        "any": [
          "Hello, {species}! Look at you. I'd give you a perfect credit rating on that face alone.",
          "The {species} is watching me count its neighbours. I think it's checking my working."
        ],
        "lo": "What a handsome {species} you keep. You can tell a lot about someone by how their animals look.",
        "hi": "I visit this {species} when my sums won't come out, {player}. Five minutes here and they do."
      },
      "guests_crowd": {
        "any": [
          "So many guests! Every one of them came through the gate smiling. I counted.",
          "What a crowd. I do wish they'd form a line. I love a line."
        ],
        "lo": "Look at all these visitors! You must be doing something right. I notice these things.",
        "hi": "All these people came to see what you made, {player}. I'm so proud I could pop a button."
      },
      "residents_crowd": {
        "any": [
          "All the neighbours together! I know every one by name, and by how they like their change counted.",
          "Half the street is here. It's like a meeting, only nobody's taking minutes. I could take minutes."
        ],
        "lo": "Everyone's out today! Have you met them all? They're good neighbours, every one.",
        "hi": "Our whole street in one place, {player}. I wouldn't trade a single one of them. Not at any rate."
      },
      "other_resident": {
        "any": [
          "Oh, there's {other}! I was just thinking about them. Good thoughts, all filed.",
          "{other} always has a kind word for me. I keep those. They add up."
        ],
        "lo": "Have you met {other}? Such good company. I never keep a nice neighbour to myself.",
        "hi": "{other} asked who my favourite customer is, {player}. I said I couldn't possibly say. Then I looked at you."
      },
      "other_player": {
        "any": [
          "Two of you! Hello, {other}! Double the company, and I've a smile for each.",
          "You and {other} together. I do like it when people come in pairs. It's tidy."
        ],
        "lo": "And this is {other}? Welcome! I'm Mirium. I'm getting to know you both, bit by bit.",
        "hi": "{other} is very nice, {player}, but you and I go back further. That counts for a lot with me."
      },
      "alone_night": {
        "any": [
          "It's so quiet. Just the two of us and the night. I like a still evening now and then.",
          "Nobody else about tonight. I can hear myself think. I'm thinking in numbers, naturally."
        ],
        "lo": "It's only us out here in the dark, and we hardly know each other. Well, that's how knowing people starts!",
        "hi": "Since it's only us, {player}: some nights I worry I care about coins too much. Then I remember what they're for."
      },
      "by_water": {
        "any": [
          "What clear water. I can see every pebble on the bottom. Nicely arranged, too.",
          "I like to watch the ripples. They go out in perfect rings. Very orderly of them."
        ],
        "lo": "Pretty spot, isn't it? I'm keeping my shoes back from the water. They're my work pair.",
        "hi": "I threw a coin in water like this once and made a wish, {player}. Then I fretted about the coin for a week."
      },
      "by_lava": {
        "any": [
          "That lava is much too close! Think what it would do to a wool rug.",
          "I can feel the heat of that lava from here. My hairpins are getting warm."
        ],
        "lo": "I'll stand a little further from the lava, if you don't mind. Caution comes with banking.",
        "hi": "{player}, you're nearer that lava than I like. You're the one account I could never recover."
      },
      "by_flowers": {
        "any": [
          "Flowers! Reds here, yellows there. I'd sort them by colour, but they look happy as they are.",
          "These would look so well on my desk. I'm only admiring. They belong right where they are."
        ],
        "lo": "Aren't the flowers cheerful? They ask for so little and give so much. Model customers.",
        "hi": "I keep one flower on my desk each week, {player}. This week's reminds me of you. It leans toward the sun."
      },
      "by_fire": {
        "any": [
          "A nice fire! I do like the crackle. It sounds like someone counting very fast.",
          "Warm hands, warm heart. I'll sit on this side, away from the smoke. Wool holds a smell."
        ],
        "lo": "May I share your fire? I promise I'm good company. I only talk about sums if asked.",
        "hi": "This is cosy, {player}. If I had my ledger I'd write: one fire, one friend, no charge."
      },
      "by_crops": {
        "any": [
          "Look at those rows! Straight as a column of figures. A farmer after my own heart.",
          "Plant one seed, get back many. Farming is the oldest savings plan there is."
        ],
        "lo": "What tidy farmland. I respect anyone who plans a whole season ahead.",
        "hi": "I'd have made a decent farmer, {player}. I'd have counted every ear of wheat. Twice."
      },
      "by_books": {
        "any": [
          "Bookshelves! Are they in order? Let me just look. Oh. Oh dear. No, it's fine. It's fine.",
          "I do love a full shelf. All those spines lined up like coins in a tray."
        ],
        "lo": "You have books here! I keep ledgers, mostly. Same shape, fewer dragons.",
        "hi": "If I ever write a book, {player}, it'll be about tidy sums and good friends. You're chapter one."
      },
      "in_snow": {
        "any": [
          "Snow! Everything's covered so evenly. It's the tidiest weather there is.",
          "My toes are cold, but look how white and smooth it all is. Like fresh wool."
        ],
        "lo": "Chilly in this snow, isn't it? I wore my thick stockings. A banker comes prepared.",
        "hi": "You've snow in your hair, {player}! If I fuss, it's only because you're on my list of people to fuss over."
      },
      "holding_gift": {
        "any": [
          "Oh, is that {item}? How lovely. I'm only admiring it, don't mind me.",
          "What a nice thing to be carrying. It caught my eye straight away. I've an eye for quality."
        ],
        "lo": "That's a fine {item}, if you don't mind my saying. You have good taste.",
        "hi": "{player}, you're holding {item} and I'm trying very hard to look at your face instead."
      },
      "holding_weapon": {
        "any": [
          "Goodness, a {item}. I'm sure you know what you're doing. I'll keep my fingers clear.",
          "You're armed! I suppose someone must be. I only carry a quill, and it's not very sharp."
        ],
        "lo": "That's quite a {item}. I'll admit weapons make me blink a bit. Bows worst of all.",
        "hi": "I know that {item} keeps you safe out there, {player}. So I like it. From a small distance."
      },
      "holding_food": {
        "any": [
          "Is that {item}? That looks lovely. I had a biscuit at ten. Exactly at ten.",
          "You've brought food! Sensible. Nobody adds up well on an empty stomach."
        ],
        "lo": "That {item} looks good. I'm glad to see you eat properly. I notice when customers don't.",
        "hi": "{player}, is that {item} your lunch? Good. I worry you skip meals when the zoo gets busy."
      },
      "holding_rod": {
        "any": [
          "A fishing rod! Now that takes patience. Like waiting on a long deposit.",
          "Going fishing? How restful. You cast, you wait, something comes back. It's nearly banking."
        ],
        "lo": "Oh, you fish? I've never tried. I'd want to sort the catch by size.",
        "hi": "If you're fishing, {player}, I'll sit by and keep the tally. Every fish gets a line in the book."
      },
      "holding_tool": {
        "any": [
          "A {item}! You've been hard at work. I do like to see honest effort.",
          "That {item} looks well used. Good tools are an investment, I always say."
        ],
        "lo": "Busy day with the {item}? You strike me as a hard worker. That counts for a lot.",
        "hi": "Look at you with your {item}, {player}. Always building. I tell everyone this zoo didn't happen by luck."
      },
      "armored": {
        "any": [
          "My goodness, look at you! All that armor, and polished too.",
          "You're covered head to toe! Very thorough. I do admire a matching set."
        ],
        "lo": "That's a lot of armor. You look very safe. I approve of safe.",
        "hi": "Good, {player}. Every piece of armor on. Now I can worry about you a little less. Only a little."
      },
      "hurt": {
        "any": [
          "Oh no, you're hurt! Look at you. Here, lean on the counter. I mean, on me.",
          "You're in a bad way! That's not a small thing, don't tell me it's small."
        ],
        "lo": "Forgive me, but you look badly hurt. I'd feel awful not saying something.",
        "hi": "{player}, you're hurt and my heart's in my mouth. Coins I can count again. You I can't."
      },
      "wet": {
        "any": [
          "You're soaked through! You're dripping on the, well, on the ground. That's fine. That's what it's for.",
          "Look at you, wet to the knees! I keep my towels folded in thirds. I wish I had one here."
        ],
        "lo": "Oh, you're standing in water! Is that comfortable? I'm sure you have your reasons.",
        "hi": "{player}, you're drenched! I'd hug you, but this is my good blouse. I'm with you in spirit."
      },
      "sneaking": {
        "any": [
          "Why are you crouching? Have you dropped a coin? I'll help you look!",
          "You're all hunched down. Are we being quiet? I can be quiet. I'm quiet at the bank all day."
        ],
        "lo": "Oh! You startled me, creeping like that. I'm sure it's quite innocent.",
        "hi": "{player}, you sneak like someone planning a surprise. If it's for me, I didn't see a thing."
      },
      "long_time": {
        "any": [
          "There you are! It's been days. I kept your page in the ledger warm.",
          "Oh, I've missed our chats! Days of news saved up and nobody to give it to."
        ],
        "lo": "Hello again! It's been a few days, hasn't it? I do remember a face. Welcome back.",
        "hi": "{player}! Days and days. I looked up at every footstep. Don't make me audit your whereabouts."
      },
      "first_today": {
        "any": [
          "Hello! My first chat with you today. I'm keeping a tally of nice things, and you're number one.",
          "There you are! The day's off to a tidy start now."
        ],
        "lo": "Good day to you! Mirium, from the bank. How nice that you stopped to say hello today.",
        "hi": "There's my favourite! Today already balances, {player}, and I haven't even opened the book."
      },
      "zoo_busy": {
        "any": [
          "The zoo is full to the fences! I love the sound of a busy gate. It's like rain on a roof.",
          "Guests everywhere today! I stopped counting them, and I never stop counting."
        ],
        "lo": "What a busy day for your zoo! I'm so pleased for you. Really, I am.",
        "hi": "Look at them pouring in, {player}! You did this. I just get the happy job of adding it up."
      },
      "zoo_empty": {
        "any": [
          "Not one guest today. It's so still. Never mind, every ledger has a blank line or two.",
          "The zoo paths are empty. The animals don't know the difference, bless them. They're having a lovely day."
        ],
        "lo": "It's quiet at the zoo, isn't it? Quiet days come to every business. They pass.",
        "hi": "No guests at all, {player}. I know that weighs on you. I've seen slow days before, and I've seen them end."
      },
      "zoo_closed": {
        "any": [
          "The gates are shut today. A closed sign isn't a sad thing. Even a bank shuts its doors to tidy up.",
          "Closed to guests! The animals have the place to themselves. I hope they enjoy the peace."
        ],
        "lo": "I see the zoo is closed. I'm sure you've good reason. Owners usually do.",
        "hi": "Gates shut for now, {player}? Good. You never rest. I've been wanting to say so."
      },
      "litter_bad": {
        "any": [
          "Oh, the paths! There's litter simply everywhere. My fingers are itching to pick it up.",
          "So much rubbish lying about the zoo. I'm not criticising. I'm just a bit dizzy from it."
        ],
        "lo": "I hope you don't mind my mentioning it, but there's a good deal of litter on the paths.",
        "hi": "{player}, I say this with love. The paths are a mess, and you know what mess does to me."
      },
      "stars_high": {
        "any": [
          "Such a wonderful rating! I've written it at the top of my page and underlined it.",
          "Four stars or better! I always knew. Well run places show it in the numbers."
        ],
        "lo": "Your zoo is rated so highly! You should be proud. I'd be telling everyone.",
        "hi": "Look at those stars, {player}. I may have cried a little at my desk. Happy tears, neatly blotted."
      },
      "stars_low": {
        "any": [
          "The zoo's rating is low just now. Ratings are like balances, though. They move.",
          "One star, I hear. That's only the opening figure. I've watched smaller numbers grow."
        ],
        "lo": "I heard the zoo's rating has dipped. Chin up! I believe in a turnaround.",
        "hi": "A poor rating doesn't change what I think of you, {player}. Not by a single coin."
      },
      "coins_low": {
        "any": [
          "The coins are very low. I've checked three times and I'm keeping my smile on. We'll manage.",
          "The account is nearly empty. I won't say the B word. I don't even like spelling it."
        ],
        "lo": "I should tell you plainly, the Zoo Coins are running thin. Plain is kind, in my trade.",
        "hi": "{player}, the coins are nearly gone and I barely slept. But I've seen you climb out of worse."
      },
      "animal_sick": {
        "any": [
          "One of the animals isn't well. I can't concentrate on a single sum knowing that.",
          "There's a poorly animal in the zoo. No number in my book matters more than that today."
        ],
        "lo": "I'm told one of the animals is unwell. I do hope it's seen to. I care about them dearly.",
        "hi": "{player}, an animal's suffering and it's breaking my heart. You'll put it right. You always do."
      }
    },
    "near": {
      "guido": [
        "Guido collects bows, of all things. I've told him I'll never understand it. He says that's good for business.",
        "Guido calls his books perfectly ordinary. Nobody with ordinary books says so, {player}. I like him anyway."
      ],
      "tim": [
        "Tim rated my filing system four stars. He says the fifth is for when I alphabetise him.",
        "Tim pretends he doesn't care for anyone. He asked after my wool blanket by name, {player}. By name!"
      ],
      "clian": [
        "Clian and I once spent a whole afternoon agreeing with each other. Clean and sorted. It was heaven.",
        "Clian polishes the coins I've already counted. Then I count the polished ones. We may never stop."
      ]
    }
  },
  "stevie": {
    "intro": "G'day! Stevie's the name, zookeeper by trade and by nature. If it's got fur, feathers, fins or a cranky attitude, I want to look after it. Crikey, I'm glad to meet you, boss!",
    "scenes": {
      "home_morning": {
        "any": [
          "You've caught me pulling my boots on, boss! Still a bit of yesterday's mud on them. Good mud.",
          "Morning at my place means a cuppa in one hand and field notes in the other."
        ],
        "lo": "G'day! Early caller, eh? Don't mind the buckets by the door, mate. I trip on them myself.",
        "hi": "{player}! Kettle's on, mate. I was just telling my boots what a ripper day we've got coming."
      },
      "home_evening": {
        "any": [
          "Knocked off for the night, boss. Feet up, boots by the door, and I can still hear the animals in my head.",
          "Evening at home. I'm writing up the day. Who ate well, who sulked, who pinched whose spot."
        ],
        "lo": "Evening, mate! I'm about done in, but I've always got a minute for a yarn about animals.",
        "hi": "Grab a crate, {player}. I've been busting all evening to tell you what happened at feeding time."
      },
      "walking_to_zoo": {
        "any": [
          "On my way in, boss! I always walk fast on this bit. I can't wait to see who's awake.",
          "Heading to the zoo. I've spotted three sets of tracks on this path already this morning."
        ],
        "lo": "G'day! Stevie, off to the zoo. You going that way too, mate? Lovely day for it.",
        "hi": "Walking in with you, {player}? Beauty! I always slow down at the bush where the little birds argue."
      },
      "at_zoo": {
        "any": [
          "Just having a wander, boss. No bucket, no rake. Feels strange, but I get to just watch.",
          "I'm doing the rounds as a visitor today. I keep stopping at every fence. Can't help it!"
        ],
        "lo": "Top zoo you've got here, mate. I'm looking it over with a keeper's eye, and it's holding up.",
        "hi": "Know what I love, {player}? Standing back from the fence and watching them be themselves. No fuss."
      },
      "walking_home": {
        "any": [
          "Heading home, boss. Legs are tired, heart's full. That's the right way round.",
          "Off home from the zoo. I said goodnight to as many as I could. A few even looked up."
        ],
        "lo": "That's my day, mate. I'm off home. Good to bump into you on the track!",
        "hi": "What a day, {player}. I'm filthy, I'm starving, and I wouldn't swap it for anything."
      },
      "at_work": {
        "any": [
          "Flat out, boss! One bucket down, plenty to go, and everybody's watching me like I'm the show.",
          "Middle of my rounds, mate. I've got straw down my shirt and I couldn't be happier."
        ],
        "lo": "G'day, boss! Hard at it. I want you to see I earn my keep, every single day.",
        "hi": "Perfect timing, {player}! One of the shy ones just gave me a nudge. First time ever. I nearly cried."
      },
      "following": {
        "any": [
          "Crikey, what country! Every rock out here's got something living under it, I guarantee it.",
          "I'm reading the ground as we go, boss. Hoof prints, paw prints, and one I can't pick. Brilliant!"
        ],
        "lo": "Thanks for having me along, mate. I'll keep quiet and keep my eyes peeled. Mostly quiet.",
        "hi": "Out bush with you, {player}! This is how I grew up. Sun on my neck and no idea what's next."
      },
      "following_night": {
        "any": [
          "Night walk! Hear that rustling? The whole night shift is out, mate.",
          "Dark as anything, boss. I'm going by ear. There's a bat about, and something small in the grass."
        ],
        "lo": "Bit dark to be wandering with someone I've just met, eh? No worries. I trust anyone who likes animals.",
        "hi": "I love a night walk with you along, {player}. Alone I'd follow a noise right off a cliff."
      },
      "staying": {
        "any": [
          "Staying put, boss! I've found an ant trail to watch. Could do this for hours.",
          "I'm right where you left me, mate. A beetle's climbed my boot twice. We're on good terms."
        ],
        "lo": "No dramas, I'll hang about here. I've waited longer for less, and in a swamp.",
        "hi": "Off you go, {player}, I'll be here. Take too long and I'll have named every bug on this patch."
      },
      "rain": {
        "any": [
          "Smell that rain, mate! The frogs will be over the moon.",
          "It's bucketing down! Look at the puddles filling. Somebody's going to have a ripper bath in that."
        ],
        "lo": "Wet one, eh, boss? Doesn't bother me. Khaki dries quick.",
        "hi": "You're soaked by this rain, {player}! Me too. Reckon we're both half duck by now."
      },
      "thunder": {
        "any": [
          "Hear that crack? The animals will be tucked right in. Sensible mob.",
          "Big storm, boss. I worry for the nervy ones in thunder like this. Wish I could sit with every one."
        ],
        "lo": "Proper thunder, that. I'm not scared, mate, but I'm not standing under a tree either.",
        "hi": "Storm's a ripper, {player}. I'd be out checking on everyone in it if you didn't give me that look."
      },
      "full_moon": {
        "any": [
          "Full moon, mate! You can see every whisker out here. The night animals love a bright one.",
          "Look at that moon! I've tracked by light like this. It's like daytime with the colour turned off."
        ],
        "lo": "Lovely full moon, boss. Good night to stand still and listen. You'd be surprised what walks past.",
        "hi": "A moon like that makes me want to howl, {player}. I won't. I did once, and a wolf answered."
      },
      "dark_moon": {
        "any": [
          "No moon tonight. Black as the inside of a wombat burrow, boss.",
          "Can't see my own hand, mate. Ears only tonight. There's a lot going on if you listen."
        ],
        "lo": "Dark one with no moon, eh? I'm right at home in it, mate. Years of night watches.",
        "hi": "Pitch black, {player}. I know you're there, though. You breathe like someone about to ask a question."
      },
      "dawn": {
        "any": [
          "Sunrise, boss! Listen to that. Every bird's got something to say at once.",
          "First light! Dew on everything and tracks as fresh as they get. Best hour there is."
        ],
        "lo": "Up at dawn, mate? Good on ya. Most folks sleep through the best of it.",
        "hi": "Dawn with a mate, {player}. I've seen a thousand of these and I still get goosebumps."
      },
      "dusk": {
        "any": [
          "There goes the sun, boss. Day shift's heading to bed and the night shift's stretching.",
          "Sunset! Look at that sky. The bats will be out any minute, I reckon."
        ],
        "lo": "Sun's nearly down, mate. Nice time for a quiet look around.",
        "hi": "Another sunset, {player}. I count my days by the ones I share with good company. This one counts."
      },
      "nether": {
        "any": [
          "Crikey! Hot as a tin shed in summer, boss, and things live here anyway. Tough little beauties!",
          "Lava everywhere and that long-legged fella is just strolling across it. Have a look at him go!"
        ],
        "lo": "Strewth, mate, you don't do things by halves. We've barely met and you bring me to a land of fire.",
        "hi": "{player}, my eyebrows are singed and I've never been happier. Look at the wildlife down here!"
      },
      "the_end": {
        "any": [
          "Not a tree, not a bug, just those tall dark fellas. Shy ones, mate. I'm keeping my eyes down.",
          "Quiet as anything in the End. Bit eerie, boss. An animal bloke gets nervous with no birdsong."
        ],
        "lo": "Rough spot, this. Nothing but pale rock and a long drop. I'll follow your lead, mate.",
        "hi": "I'll be honest, {player}, this place gives me the willies. No nests, no tracks, no sky. Glad you're here."
      },
      "fishing_sky": {
        "any": [
          "Islands in the sky, boss! And fish in the pools, way up here. How good is that?",
          "Look at those pools, mate. Clear as glass. I can see every fin from the bank."
        ],
        "lo": "Well, this is a first. Sky fishing with a new mate. I've got no complaints at all!",
        "hi": "{player}, I keep leaning off the island to look for birds below us. One day you'll have to grab my belt."
      },
      "acufend": {
        "any": [
          "Would you listen to that, boss! The critters here hum along to the music. Never seen the like!",
          "A whole jungle on a little round moon. Everything's new to me, mate. I don't know where to look first!"
        ],
        "lo": "Crikey. I thought I'd seen most things. I hadn't. Thanks for bringing a stranger this far, mate.",
        "hi": "{player}, that little one just bobbed its head in time with me. I'm in love. Don't tell the zoo mob."
      },
      "cave": {
        "any": [
          "Deep down, boss! Hear the bats? That squeaking means the roof's alive up there.",
          "Love a cave. Cool, damp and full of critters that never see the sun."
        ],
        "lo": "Bit tight down here, mate. No worries, I've crawled into smaller holes after grumpier things.",
        "hi": "You and me down a hole in the ground, {player}. Ripper. Mind your head, I've already found the low bit."
      },
      "high_up": {
        "any": [
          "What a view, boss! You can see the whole lay of the land. Rivers, trees, the lot.",
          "Right up top, mate. This is where a big bird would sit to keep an eye on things."
        ],
        "lo": "Long way down, eh? I'm steady. I've climbed plenty of trees to look at nests. Look, never touch.",
        "hi": "Look out there, {player}. Every bit of green down below is somebody's home. Gets me every time."
      },
      "hostile_near": {
        "any": [
          "Heads up, boss, there's a nasty one about. Not an animal, that. No manners at all.",
          "Something unfriendly close by, mate. Give me a cranky croc any day over one of those."
        ],
        "lo": "Careful, mate, there's a monster near. I wrangle wildlife, not that lot.",
        "hi": "{player}, behind you! I'm no fighter, but I'll make a heap of noise and wave my arms."
      },
      "creeper_near": {
        "any": [
          "Creeper, boss! Right there! Only critter I've met that I can't make friends with.",
          "Whoa, that green fella's too close. I tried the slow, calm approach on one once. Did not work."
        ],
        "lo": "Creeper! Sorry to shout, mate, but that one doesn't give you long.",
        "hi": "{player}, creeper! I love everything with legs, but that one's got four and a short fuse."
      },
      "villager_near": {
        "any": [
          "Friendly mob, these villagers. I like how close they live to their animals.",
          "Villagers about, boss. That one gave me a long hrmm. I think he liked the shorts."
        ],
        "lo": "Nice little village, mate. I always look at the animal pens first. Old habit.",
        "hi": "A villager tried to sell me a lead once, {player}. I said animals follow me for free. He wasn't impressed."
      },
      "pet_near": {
        "any": [
          "Look at this one! Bright eyes, shiny coat. That's a pet that knows it's loved, boss.",
          "G'day, little mate! Oh, it's leaning on my leg. That's it, I'm done for."
        ],
        "lo": "Your pet's a beauty. You can tell a lot about a person by their animal, and I like what I see.",
        "hi": "Your pet ran to me first, {player}! Don't be jealous. I've just got pockets that smell interesting."
      },
      "farm_animal_near": {
        "any": [
          "Look at that old cow chewing away. Not a care in the world. That's contentment, boss.",
          "Chooks! I love a chook. Bossy, nosy and always in a hurry to go nowhere."
        ],
        "lo": "Farm animals, mate. People walk right past them. I reckon a pig's as clever as anything in a zoo.",
        "hi": "That sheep's been following me since the gate, {player}. I didn't feed her. I just listened."
      },
      "zoo_animal_near": {
        "any": [
          "Have a look at the {species}, boss! See how it's watching us? Curious, not worried. That's what you want.",
          "G'day, gorgeous! Sorry, boss, I was talking to the {species}."
        ],
        "lo": "That's a fine {species} you've got, mate. Settled and calm. Somebody's doing right by it.",
        "hi": "This {species} knows your voice, {player}. It looks up when you talk. I'm not making that up."
      },
      "guests_crowd": {
        "any": [
          "Big mob of guests, boss! I love it when a kid sees an animal for the first time. That face!",
          "So many people! I keep an eye on the animals in a crowd like this. They're taking it well."
        ],
        "lo": "Busy around here, mate. Good. The more folks who meet these animals, the more who care.",
        "hi": "See that little girl with her nose on the fence, {player}? That's a future keeper. You did that."
      },
      "residents_crowd": {
        "any": [
          "Whole street's turned out, boss! Reckon we look like a mob of roos at a waterhole.",
          "All the neighbours together. Good bunch. Half of them want a baby animal named after them."
        ],
        "lo": "Lots of the locals about, mate. I'm still learning names. I'm better with animal names, to be fair.",
        "hi": "Look at this mob, {player}. Not long back I slept in a swag. Now I've got a whole street of neighbours."
      },
      "other_resident": {
        "any": [
          "G'day, {other}! Good to see you, mate. Boss and I were just having a yarn.",
          "There's {other}. Always stops for a chat at the fence. The animals know that walk by now."
        ],
        "lo": "That's {other} over there. Good sort. Just about everyone round here is, I'm finding.",
        "hi": "{other} reckons I talk about animals too much, {player}. I asked what else there is. No answer!"
      },
      "other_player": {
        "any": [
          "Two of you! G'day, {other}! More hands, more eyes, more people to show the animals to.",
          "You've brought {other} along, boss. Beauty! Does {other} like reptiles? Everyone should."
        ],
        "lo": "G'day to you and to {other}. I'm Stevie. I'll have you both mad about wildlife by sundown.",
        "hi": "{other} seems a good sort, {player}. Any mate of yours gets my best animal yarns."
      },
      "alone_night": {
        "any": [
          "Just us out here tonight, boss. Quiet, eh? Give it a minute and you'll hear who's really about.",
          "Nobody round but you, me and something small in the dark grass. I reckon it's a bit nosy."
        ],
        "lo": "Quiet night, mate. Just the two of us. Good chance to get to know each other, I reckon.",
        "hi": "Nights like this I think about the ones I couldn't save, {player}. Then I think about the ones here. Helps."
      },
      "by_water": {
        "any": [
          "Water, boss! Have a look at the edge. That's where everything comes to drink. Tracks everywhere.",
          "Love a waterhole. Sit still long enough and the whole neighbourhood turns up."
        ],
        "lo": "Nice bit of water, mate. I always check the bank before I get close. Old swamp habit.",
        "hi": "I'd wade in right now if I had spare socks, {player}. Who am I kidding. I'm going in."
      },
      "by_lava": {
        "any": [
          "Crikey, that lava's hot! I'm keeping well back, boss. Nothing with fur should be near that, us included.",
          "Open lava. I've handled crocs, snakes and one very rude goat, but that stuff scares me."
        ],
        "lo": "Lava, mate. I'll give it the respect I'd give a big snake. Plenty of room.",
        "hi": "{player}, you're a bit near that lava for my liking. I look after things, and you count, mate."
      },
      "by_flowers": {
        "any": [
          "Flowers, boss! Look closer. Bees all over them. Busy little workers, every one.",
          "Beautiful patch, this. Where there's flowers there's bugs, and where there's bugs there's birds."
        ],
        "lo": "Pretty flowers, eh? I'm no gardener, mate, but I know the little critters love a spot like this.",
        "hi": "I'd lie down in these flowers and watch beetles all arvo, {player}. If I ever go missing, look here first."
      },
      "by_fire": {
        "any": [
          "Nothing like a campfire, boss. I've cooked more dinners on one of these than in any kitchen.",
          "Good fire. Out past the light there's always a few eyes shining. Just curious, never trouble."
        ],
        "lo": "Mind if I warm my hands, mate? Campfire's where the best animal yarns get told.",
        "hi": "Fire, stars and my best mate. I'll tell you the goose story again, {player}. It gets better each time."
      },
      "by_crops": {
        "any": [
          "Good crop coming on, boss. Every animal I know would love a go at that. Can't blame them.",
          "Farmland! I'm checking the edges for nibble marks. Somebody small has been visiting."
        ],
        "lo": "Nice rows of crops, mate. Whoever's growing this knows their stuff.",
        "hi": "I see wheat and I think of feed time faces, {player}. I can't switch it off."
      },
      "by_books": {
        "any": [
          "Books, boss! I only ever read the ones with animals in. Lucky that's most of the good ones.",
          "Shelves of books. My own notes would fill one, if anyone could read my handwriting. Nobody can."
        ],
        "lo": "Not much of a reader, mate, I'll be honest. I learned mine out in the scrub.",
        "hi": "One day I'll write it all down properly, {player}. Stevie's Big Book of Critters. You're in the thanks."
      },
      "in_snow": {
        "any": [
          "Snow, boss! Best tracking there is. Every paw print shows up clear as day.",
          "Brr! Shorts were a bold choice in this snow. No regrets. Some regrets."
        ],
        "lo": "Cold one, mate! I'm from warm country. My knees are having a think about it.",
        "hi": "{player}, look, fox prints in the snow! Maybe. Or rabbit. I'm too cold to tell and too happy to care."
      },
      "holding_gift": {
        "any": [
          "Hello, what's that you've got, boss? {item}? Now that's a beauty.",
          "Crikey, I spotted that from across the path. Good eye on you, mate."
        ],
        "lo": "Nice {item}, mate. Not hinting. Just a keeper who notices things.",
        "hi": "{player}, is that {item}? You know I love those. I'm not looking at it. I'm looking at the sky."
      },
      "holding_weapon": {
        "any": [
          "That's a serious {item}, boss. Just for the nasties, eh? Never the animals.",
          "You're carrying a weapon, mate. Fair enough out here. I get by on patience and a loud voice."
        ],
        "lo": "Whoa, a {item}. I'll trust it's for monsters, mate. I'm a bit protective of anything with a heartbeat.",
        "hi": "I know you, {player}. That {item} only ever comes out to keep things safe. That's why I don't flinch."
      },
      "holding_food": {
        "any": [
          "Is that {item}, boss? Half the zoo would follow you home for that.",
          "Food in hand! Every animal within a hundred blocks just lifted its nose, I guarantee it."
        ],
        "lo": "That {item} for you or for a critter, mate? Either way, good on ya.",
        "hi": "{player}, I skipped lunch doing rounds and you turn up with {item}. I'm only looking. Mostly."
      },
      "holding_rod": {
        "any": [
          "Fishing rod! Beauty. Best excuse there is to sit by the water and watch what turns up.",
          "Off for a fish, boss? I fish like a heron. Stand still, look silly. Only the heron catches something."
        ],
        "lo": "You fish, mate? Good patient hobby. Says something about a person.",
        "hi": "If you're wetting a line, {player}, I'm there. I'll watch the dragonflies and tell you what you're doing wrong."
      },
      "holding_tool": {
        "any": [
          "A {item}! You've been getting your hands dirty, boss. I like that in a zoo owner.",
          "That {item}'s had a workout, mate. Building something for the animals, I hope!"
        ],
        "lo": "Good solid {item}. I respect a boss who does the digging and doesn't just point.",
        "hi": "{player} with a {item} in hand. That means somebody's getting a bigger home. I can feel it."
      },
      "armored": {
        "any": [
          "Look at you, boss! Shell like a turtle. Smart animal, the turtle.",
          "Full armor, eh? You clank like a bucket of nails, mate. Every critter heard you coming."
        ],
        "lo": "That's a lot of metal, mate. Off somewhere rough? Hope the wildlife's friendly.",
        "hi": "Good, {player}. Armor on. I worry when you head off, same as I do with the little ones."
      },
      "hurt": {
        "any": [
          "Boss, you're hurt! I've patched up plenty of animals. You're just a tall one with less fur.",
          "Crikey, you're in a bad way. Easy now, mate. Slow and calm, same as I'd say to any hurt critter."
        ],
        "lo": "Mate, that looks rough. I'd never walk past a hurt animal, and I'm not walking past you.",
        "hi": "{player}, you're scaring me, mate. I'd take a croc bite myself before I'd see you like this."
      },
      "wet": {
        "any": [
          "You're soaked, boss! Happy as a duck, by the look of you.",
          "In the water, eh? Good on ya. Best way to meet what lives in there is to join it."
        ],
        "lo": "Bit damp there, mate! No judgment. I spend half my life up to the knees.",
        "hi": "{player}, you look like a drowned possum. A happy one. It suits you."
      },
      "sneaking": {
        "any": [
          "Getting low, boss? That's how you get near a shy animal. Nice and small. Good form!",
          "Why are we creeping, mate? Is there a bird? Where's the bird?"
        ],
        "lo": "Sneaking up on me, mate? I get stalked by geese. You'll need to be quieter than that.",
        "hi": "Ha! You creep like a proper keeper, {player}. Slow, low and no sudden sneezes."
      },
      "long_time": {
        "any": [
          "Boss! Where've you been? It's been days. The animals have been asking. Well, staring at the gate.",
          "There you are, mate! I've got days of animal news stacked up. Where do I start?"
        ],
        "lo": "G'day, stranger! Been a few days, eh? Good to see you about again.",
        "hi": "{player}! Days, mate. I'd nearly gone out tracking you. I had your boot print memorised."
      },
      "first_today": {
        "any": [
          "G'day, boss! First hello of the day from you. I've had six from the animals, but yours counts double.",
          "There's the boss! Now the day can start properly."
        ],
        "lo": "G'day, mate! Stevie, the one in khaki. Good to see you again today.",
        "hi": "{player}! There's my favourite two-legged animal. How'd you sleep, mate?"
      },
      "zoo_busy": {
        "any": [
          "Zoo's chockers, boss! Every path's full and the animals are loving the attention. Well, most.",
          "Packed out today! I've answered a hundred animal questions from guests and I want a hundred more."
        ],
        "lo": "Big day at the gate, mate. Good on ya. People only turn up like this for a place worth seeing.",
        "hi": "Look at them all, {player}! Every guest goes home caring a bit more about wildlife. That's your doing."
      },
      "zoo_empty": {
        "any": [
          "Not a guest in sight, boss. Quiet as a paddock at noon. The animals are having a lazy one.",
          "Empty paths today. No worries. I'll talk to the animals. They're a better audience anyway."
        ],
        "lo": "No guests today, eh, mate? Happens. The animals don't mind a day off from being stared at.",
        "hi": "No guests, {player}. Don't you fret. The animals are happy, and that's the bit that matters to me."
      },
      "zoo_closed": {
        "any": [
          "Gates shut, boss. I love the zoo like this. Everyone relaxes, and I can hear every little sound.",
          "Closed today! The animals don't know what a day off is, but I reckon they feel it."
        ],
        "lo": "Closed up, eh? Still plenty for a keeper to think about, mate. Animals don't close.",
        "hi": "With the gates shut it's just us and them, {player}. My favourite kind of day, between you and me."
      },
      "litter_bad": {
        "any": [
          "Boss, the paths are thick with rubbish. I worry about that. Critters will try to eat anything once.",
          "Litter everywhere, mate. Gets me right in the guts. A wrapper's no good near an animal."
        ],
        "lo": "Don't mean to grumble, mate, but there's a fair bit of litter about. Animals and rubbish don't mix.",
        "hi": "{player}, I'll say it straight because we're mates. The paths are a tip, and it's doing my head in."
      },
      "stars_high": {
        "any": [
          "Top rating, boss! You beauty! I've been telling every animal that'll listen.",
          "Four stars or better! That's what happens when the animals come first. Guests can tell."
        ],
        "lo": "Great rating, mate. I've worked a few places. This one's earned it.",
        "hi": "Look at those stars, {player}! I'm so proud I could wrestle a croc. A small one. Gently."
      },
      "stars_low": {
        "any": [
          "Rating's down, boss. No dramas. I've nursed sicker things than a star count back to health.",
          "One star, they say. Doesn't feel like a one star place to me, mate. Not with these animals."
        ],
        "lo": "I hear the rating's low, mate. I'll keep doing my bit. Good care shows in the end.",
        "hi": "Forget the stars for a tick, {player}. I've seen your heart in this place. The number will catch up."
      },
      "coins_low": {
        "any": [
          "Coins are tight, boss, I heard. No worries. I've run a rescue on string and goodwill before.",
          "Money's short, eh? The animals don't know it. They just know who turns up for them each morning."
        ],
        "lo": "Word is the Zoo Coins are low, mate. I didn't take this job for the coins. I took it for the animals.",
        "hi": "{player}, mate, don't lose sleep over coins. I've been broke with happy animals before. I'd pick it again."
      },
      "animal_sick": {
        "any": [
          "Boss, one of the animals is crook. I can't settle till it's right. Can't think about anything else.",
          "There's a poorly one in the zoo, mate. Just not itself. Breaks my heart, that."
        ],
        "lo": "Mate, one of the animals isn't right. I have to say it. I'd be no keeper if I kept quiet.",
        "hi": "{player}, we've got one doing it tough. I know you care as much as I do. That's why I came to you."
      }
    },
    "near": {
      "dr_pollo": [
        "Dr. Pollo's the best vet I've ever worked beside, boss. Calm hands. The animals know it before the bag's even open.",
        "I asked Dr. Pollo the trick to staying so steady. Got told, I'm not, I just shake slowly. Legend."
      ],
      "the_boulder": [
        "The Boulder calls a feed run an expedition, boss. I call it breakfast time. We both love it the same.",
        "The Boulder carried four buckets at once yesterday, {player}. I managed three and a bruised ego."
      ],
      "dory": [
        "Dory asked me if fish get thirsty. I've thought about it all week, boss. I've still got nothing.",
        "Dory asks a hundred questions a day, {player}, and I love every one. That's how good keepers start."
      ]
    }
  },
  "the_boulder": {
    "intro": "Ho there! The name is The Boulder, zookeeper and former jungle explorer. I haul the feed, rake the exhibits and flex between tasks. You must be the boss. Excellent. I like a boss.",
    "scenes": {
      "home_morning": {
        "any": [
          "Morning at base camp, boss! I am lacing the boots. There are only two, but it feels like a whole expedition.",
          "You caught me before the day's trek. I have done forty push-ups and eaten breakfast. Not at the same time. Not again."
        ],
        "lo": "A visitor at base camp, this early? The Boulder is honoured. Excuse the pose, I was warming up the shoulders.",
        "hi": "{player}! My favourite face before breakfast. I was about to flex at the mirror, but you are a far better audience."
      },
      "home_evening": {
        "any": [
          "Evening at camp, boss. The boots are off and the feet are free. I advise standing upwind.",
          "The day's quest is done and I am sitting down. Sitting! Look at me. I am terrible at it."
        ],
        "lo": "Ah, the boss calls after dark. Come in. I only tell the short tall tales to people I have just met.",
        "hi": "You came by at the end of the day, {player}. Good. A bedtime tall tale is no use with nobody to gasp at it."
      },
      "walking_to_zoo": {
        "any": [
          "On the trail to the zoo, boss! It is a short trail, so I walk it with very large steps.",
          "The Boulder marches to work. No vines, no rapids, one path. Still, I keep an eye out."
        ],
        "lo": "Just heading in to the zoo, boss. You will know my shift has started when you hear a bucket cheering.",
        "hi": "Walking to work, and here you are! Now it is a proper expedition, {player}. Two is a team."
      },
      "at_zoo": {
        "any": [
          "No bucket in my hand today, boss. I am only here to look. My arms do not know what to do with themselves.",
          "I am touring the exhibits like a guest. A guest who knows what every one of them had for breakfast."
        ],
        "lo": "Just admiring your zoo, boss. A fine collection. I have crossed whole jungles and seen less.",
        "hi": "A day off, and where do I go? Straight back here. Do not laugh, {player}. All right, laugh a little."
      },
      "walking_home": {
        "any": [
          "Homeward, boss! The legs are tired, the arms are magnificent, and the buckets are all empty.",
          "The trek back to camp. Every evening I walk it, and every evening I arrive. A perfect record."
        ],
        "lo": "Heading home, boss. A full day of hauling. I would say how much, but you would think I was boasting. I would be.",
        "hi": "Good timing, {player}. The road home is shorter with a friend on it, and my stories are longer."
      },
      "at_work": {
        "any": [
          "Mid-quest, boss! This feed bucket and I are locked in a mighty struggle. I am winning. It is a bucket.",
          "Hard at it! I have raked, hauled and lifted since sunrise. The rake is exhausted. I am fine."
        ],
        "lo": "At my post, boss, as promised. Watch the form on this lift. Knees bent, chest out, crowd amazed.",
        "hi": "Working hard, {player}, and whistling while I do it. This zoo is the best expedition I ever signed on for."
      },
      "following": {
        "any": [
          "Onward, boss! New ground under the boots and open sky overhead. This is what the cargo pants were made for.",
          "A proper daytime trek! I am watching the rear, the flanks and, when I remember, the front."
        ],
        "lo": "You lead well for someone I hardly know, boss. I will follow a while and judge the trail by its end.",
        "hi": "Anywhere you point, {player}, I walk. And if the path runs out, The Boulder becomes the path."
      },
      "following_night": {
        "any": [
          "A night march, boss! I cannot see my own boots. I trust they are still down there.",
          "Far from camp after dark. My old jungle guide called this a bad idea. He also called it a normal week."
        ],
        "lo": "Dark out here, boss. I am not worried. I am only standing a bit closer for your comfort.",
        "hi": "Night, wilderness and you, {player}. I would not trade it for a warm bed. Ask me again around midnight."
      },
      "staying": {
        "any": [
          "Still here, boss. I have not moved an inch. A beetle has climbed me twice, thinking I am scenery.",
          "Waiting is the hardest lift there is. But The Boulder is doing it. Look how still."
        ],
        "lo": "You said wait, boss, so I wait. I do not know you well, but I know an order when I am standing on one.",
        "hi": "I will be right here when you come back, {player}. You always do come back. That is why I do not mind."
      },
      "rain": {
        "any": [
          "This rain runs straight off my head, boss. No hair to slow it down. I am the fastest drying man in the zoo.",
          "Wet boots, wet belt, nine wet pockets. The jungle rained harder, but it was politer about it."
        ],
        "lo": "A bit of rain will not send The Boulder indoors, boss. I have stood under waterfalls on purpose.",
        "hi": "You are out in this downpour too, {player}? Ha! We shall drip together like true explorers."
      },
      "thunder": {
        "any": [
          "Hear that, boss? The sky is flexing. I admit, it has good volume.",
          "Lightning likes tall things standing in the open. I am suddenly aware of how tall and how open I am."
        ],
        "lo": "That storm does not scare me, boss. I flinched just now for exercise.",
        "hi": "Between us, {player}, each thunderclap makes me jump a little. A large man comes down hard."
      },
      "full_moon": {
        "any": [
          "Look at that moon, boss! Round, bald and shining. A handsome fellow. Reminds me of someone.",
          "A full moon lights the trail better than any torch. In the jungle we called this a walking night."
        ],
        "lo": "Full moon tonight, boss. Bright enough to see my muscles by, which is lucky for you.",
        "hi": "The moon is full and so is my heart, {player}. That sounded better in my head. I am keeping it anyway."
      },
      "dark_moon": {
        "any": [
          "No moon at all tonight, boss. I flexed just now and nobody could see it. A terrible waste.",
          "Black as the inside of a pack out here. I am finding my way by stubbing my toes."
        ],
        "lo": "A dark night, boss. If you hear a heavy thud, that was me meeting a fence. Do not be alarmed.",
        "hi": "I cannot see you, {player}, but I know you are there. You are the only one who lets me finish a story."
      },
      "dawn": {
        "any": [
          "Sunrise, boss! The Boulder was up before it again. I am counting that as a win.",
          "First light. On the river we would be pushing off by now. Here I push a wheelbarrow. It leaks less."
        ],
        "lo": "You rise early, boss. I respect that in a leader. The sun and I were starting to feel lonely.",
        "hi": "Look at that sky, {player}. Pink and gold. I have seen a thousand dawns and I still stop to stare."
      },
      "dusk": {
        "any": [
          "There goes the sun, boss, sinking like my canoe did. More gracefully, though.",
          "Sunset! The sky turns orange and my shadow gets enormous. It is my favourite time to stand sideways."
        ],
        "lo": "The light is going, boss. A sensible explorer makes camp about now. I am mostly sensible.",
        "hi": "Another day done beside you, {player}. I count sunsets like treasure, and this one goes in the pack."
      },
      "nether": {
        "any": [
          "By my boots, boss, the ground here is on fire! I have crossed deserts, but they had the decency to cool off at night.",
          "So this is the Nether. Red rock, lava seas and a pig that walks upright. At last, a place hotter than my jokes."
        ],
        "lo": "You bring a new hire to a land of lava, boss? Bold. I am sweating through the explorer shirt, but I do not complain. Much.",
        "hi": "Only for you would I walk on burning rock, {player}. My boots are smoking. Nobody needs to know I yelped at the ghast."
      },
      "the_end": {
        "any": [
          "No sun, no ground below, and tall dark fellows who dislike being looked at. I have never felt so short, boss.",
          "This pale stone is the strangest shore I ever stood on. I keep looking for the bottom of that sky. There is none."
        ],
        "lo": "The End, you call it? A grim name for an outing with a man you barely know, boss. I am staying well back from the edge.",
        "hi": "I have gone to the edge of maps before, {player}. Never off them. If I must stare into nothing, I am glad of the company."
      },
      "fishing_sky": {
        "any": [
          "Islands floating in the sky, boss, with fishing pools on top! I checked underneath for ropes. Nothing.",
          "I once carried a canoe uphill. To get one up here I would have had to throw it."
        ],
        "lo": "Quite a height you have brought me to, boss. I am calm. I am only gripping this island for the island's sake.",
        "hi": "Fishing above the clouds with you, {player}. If I hook something big, I may need you to hold my belt."
      },
      "acufend": {
        "any": [
          "A round moon with a jungle on it, boss! I feel at home, apart from the creatures humming at my knees.",
          "The little locals here love their music. I showed them a flex. One of them played a tune about it, I think."
        ],
        "lo": "Strange place, boss. Jungle I know, but this jungle sings back. I am keeping my wits about me.",
        "hi": "A jungle village on a moon, {player}! You find the best trails. Yes, I was dancing. I hoped you had not noticed."
      },
      "cave": {
        "any": [
          "Low ceiling, boss. The Boulder has found it three times now, with his head.",
          "Deep rock on every side. I feel among family down here. Quiet family. Good listeners."
        ],
        "lo": "A tight squeeze, this cave, boss. I am not stuck. I am resting in a narrow place.",
        "hi": "If the roof comes down, {player}, I will hold it up. I have always wanted to say that. Please let it stay up."
      },
      "high_up": {
        "any": [
          "What a view, boss! From up here the whole world looks liftable.",
          "A summit! I always shout my name from the top. THE BOULDER! There. Did you hear it come back?"
        ],
        "lo": "A long way down, boss. I have climbed higher, but I was younger and did not look.",
        "hi": "Top of the world with you, {player}. I would carry you down on my shoulders, but I know you like to walk."
      },
      "hostile_near": {
        "any": [
          "Something nasty is shuffling about close by, boss. I heard it groan. Or that was my stomach. No, it was it.",
          "A monster, near us! I have wrestled worse before lunch. A vine, mostly, but it fought dirty."
        ],
        "lo": "Trouble nearby, boss. Do not worry about me. Worry about the trouble.",
        "hi": "Something ugly is prowling over there, {player}. It will have to get through a great deal of Boulder to reach you."
      },
      "creeper_near": {
        "any": [
          "Boss. Green fellow, no arms, hissing, right there. The Boulder is brave, but he is also attached to his eyebrows.",
          "That creeper is giving me a look, boss. It is the only thing here that can make a bigger noise than I can."
        ],
        "lo": "A creeper, that close! I am not backing away, boss. I am walking backwards with confidence.",
        "hi": "{player}, that creeper is far too near you for my liking. I would stand between you, but then we both lose our boots."
      },
      "villager_near": {
        "any": [
          "Villagers, boss! I flexed for one and he only stared down that long nose at me. A tough crowd.",
          "A whole village of folded arms. How do they carry anything? Somebody should show them the bucket hold."
        ],
        "lo": "Friendly folk, these villagers, boss. Not talkative. That leaves more room for me, which I appreciate.",
        "hi": "Look at those villagers staring, {player}. They have never seen shoulders like these. Or they want my belt."
      },
      "pet_near": {
        "any": [
          "That is a fine companion at your heel, boss! Loyal, alert, and it has not once questioned my stories.",
          "Your pet is sniffing my boots. A brave nose. Those boots have been through a swamp."
        ],
        "lo": "Your animal has been eyeing me, boss. Sizing me up, I think. I am holding still so it gets the full picture.",
        "hi": "Your little friend trusts you completely, {player}. I know the feeling. I just wag less."
      },
      "farm_animal_near": {
        "any": [
          "Cows and sheep, loose in the open with no fence at all, boss! Out here they are their own zookeepers.",
          "A chicken just walked under me like I was a bridge. I have never been so insulted or so charmed."
        ],
        "lo": "Good honest livestock, boss. That pig looked at my arms and went back to the mud. No taste.",
        "hi": "See the sheep trailing after that one cow, {player}? That is us. I will let you decide who is the cow."
      },
      "zoo_animal_near": {
        "any": [
          "Behold the {species}, boss! We nodded to each other this morning. A mutual respect.",
          "I carried breakfast to this {species} myself. It did not clap, but I could tell it wanted to."
        ],
        "lo": "That {species} and I are on excellent terms, boss. You will get there. It takes a strong first impression.",
        "hi": "Between us, {player}, I tell the {species} my best stories. It has never once walked away. The fence helps."
      },
      "guests_crowd": {
        "any": [
          "So many guests, boss! Somebody asked me to hold their bag. Then six more did. I am a coat rack with a grin.",
          "A crowd at last! I have been flexing for the animals all week and they never ask for more."
        ],
        "lo": "Excuse the crush, boss. The guests gather wherever I stand. I cannot think why. I can, actually.",
        "hi": "All these people round us came to see your zoo, {player}. I just stand in it looking strong. You did the hard part."
      },
      "residents_crowd": {
        "any": [
          "Half the street is standing here, boss! A fine turnout. Somebody ought to give a speech. I volunteer.",
          "All the neighbours together. I count this many friendly faces and I think, good team for a river crossing."
        ],
        "lo": "You know all these neighbours, boss? I am still learning the names. They all know mine. It is hard to forget.",
        "hi": "A crowd of neighbours and I still spotted you first, {player}. An explorer learns to find the landmark."
      },
      "other_resident": {
        "any": [
          "There is {other}, boss! A fine neighbour. Has never once asked me to stop talking, which is rare.",
          "I offered to carry {other} over a puddle last week. Got a firm no. The offer stands."
        ],
        "lo": "You know {other}, boss? Good sort. Laughed at one of my jokes once. I have been chasing a second laugh ever since.",
        "hi": "Not a word to {other}, {player}, but you are my first pick for any expedition. A close second is still second."
      },
      "other_player": {
        "any": [
          "Two adventurers at once! Welcome, {other}. I am The Boulder. The boss can confirm the shoulders are real.",
          "Boss, your friend {other} has the look of a traveller. I like the look of a traveller."
        ],
        "lo": "A second explorer in camp, boss. Hello there, {other}. I shake hands gently. I have had complaints.",
        "hi": "{player}, you never said you had a trail mate! {other}, I have stories about this one. Good ones, mostly."
      },
      "alone_night": {
        "any": [
          "Only the two of us and the crickets, boss. I have told the crickets all my stories already. Your turn.",
          "Quiet out tonight. No guests, no neighbours. I can hear my own footsteps, and they are impressive."
        ],
        "lo": "Just you and me out here, boss. I am not much for silence. I will fill it. That is fair warning.",
        "hi": "Nobody else about, {player}, so I can say it plainly. I am glad I wrote that letter to your zoo. Very glad."
      },
      "by_water": {
        "any": [
          "Water, boss! I see my reflection in it. Even the pond cannot look away.",
          "A fine bank to stand on. I lost a canoe in water like this once. It may still be going."
        ],
        "lo": "Deep water there, boss. I am a strong man, but I float about as well as my name suggests.",
        "hi": "I could watch this water all day with you, {player}. Rivers taught me patience. I skipped most of the lessons."
      },
      "by_lava": {
        "any": [
          "Lava, boss! The one thing I will not try to lift. I have thought about it. The answer is still no.",
          "Feel that heat coming off it. My eyebrows are filing a complaint."
        ],
        "lo": "That is open lava, boss. I am keeping my distance, and I am not ashamed. A melted Boulder helps nobody.",
        "hi": "You are standing very near that glow, {player}. I can replace boots. I cannot replace you."
      },
      "by_flowers": {
        "any": [
          "Flowers everywhere, boss! I am walking on tiptoe. Have you seen a man my size on tiptoe? It is a sight.",
          "I picked one and tucked it in the utility belt. Pocket eight. It is the pretty pocket now."
        ],
        "lo": "Yes, boss, The Boulder stops to smell flowers. Strong lungs. I get the whole meadow in one sniff.",
        "hi": "The yellow ones are my favourite, {player}. I pressed one in my jungle map once. The map is long gone. I kept the flower."
      },
      "by_fire": {
        "any": [
          "A campfire! Now we are a real expedition, boss. All we lack is a tall tale, and I have forty.",
          "Warm hands, warm boots. I once kept a fire going three nights in the rain by shouting at it."
        ],
        "lo": "Good fire, boss. I keep my best stories for old friends. So this one coming is a medium story.",
        "hi": "Fires make me honest, {player}. So here it is. The canoe story is true. The crocodile in it gets bigger every year."
      },
      "by_crops": {
        "any": [
          "Look at those rows, boss! Straight as a marching line. Somebody dug all that without me. I am almost hurt.",
          "Crops in the dirt. I ate nothing but roots for a month once. I still salute carrots out of respect."
        ],
        "lo": "A neat field, boss. I am staying on the edge. One step from these boots and that is a whole harvest gone.",
        "hi": "Someday I may keep a little patch like this, {player}. Mostly so I can carry very large pumpkins past your window."
      },
      "by_books": {
        "any": [
          "Books, boss! So many. I lifted a whole shelf of them once to see if I could. I could.",
          "I read a book about a jungle explorer. He was not nearly bald enough to be believable."
        ],
        "lo": "Bookshelves. I shall whisper, boss. THIS IS MY WHISPER. Hm. I see the difficulty.",
        "hi": "One day I will write my travels down, {player}. You are in the last chapter. It is the good one."
      },
      "in_snow": {
        "any": [
          "Snow, boss! My head is freezing. This is the one day a year I envy people with hair.",
          "Deep drifts. I leave footprints the size of feed troughs. Nobody will ever lose my trail."
        ],
        "lo": "Cold country, boss. The jungle did not prepare me for this. My knees are creaking like a gate.",
        "hi": "I rolled a snowball as big as myself and named it after you, {player}. It is a compliment. It is a very good snowball."
      },
      "holding_gift": {
        "any": [
          "Is that a {item} I see in your hand, boss? A handsome thing. My eye keeps wandering back to it.",
          "Now there is a find! The Boulder knows treasure when he sees it, and you are holding some."
        ],
        "lo": "A fine {item}, boss. I am not hinting. I am admiring, loudly, from a polite distance.",
        "hi": "{player}, that {item} is exactly my sort of thing. You know me too well. Or it is luck. Either way, I am grinning."
      },
      "holding_weapon": {
        "any": [
          "A {item}, boss! Well held. I usually just lift the problem and put it somewhere else.",
          "Armed for the trail, I see. Good. I bring the shoulders, you bring the sharp end."
        ],
        "lo": "That is a serious {item}, boss. I trust it is pointed at trouble and not at your newest zookeeper.",
        "hi": "With that {item} in your hand and me at your back, {player}, I pity whatever jumps out at us. Briefly."
      },
      "holding_food": {
        "any": [
          "Is that {item}, boss? My stomach just growled. Some of the animals answered it.",
          "Food in hand! A wise explorer never marches hungry. I once ate my own trail map. It was dry."
        ],
        "lo": "Your {item} looks good, boss. I am not staring. I am keeping watch over it.",
        "hi": "{player}, you are waving {item} in front of a man who skipped second breakfast. That is cruel. I respect it."
      },
      "holding_rod": {
        "any": [
          "A fishing rod, boss! I tried fishing once. I caught the same boot twice. It was mine.",
          "Off to tempt the fish? I have no patience for it. I prefer to glare at the water until something surrenders."
        ],
        "lo": "Nice rod, boss. If you ever hook something too big to land, you know whose arms to shout for.",
        "hi": "Fishing, {player}? I will come and be quiet. I can be quiet. Look. This is me being quiet. It is going well."
      },
      "holding_tool": {
        "any": [
          "A {item}! Honest gear, boss. Good grip on it too. I notice a grip.",
          "Tools in hand, work ahead. That is my favourite sight after a full feed trough."
        ],
        "lo": "You carry your own {item}, boss? Good. I have worked for people who only carried opinions.",
        "hi": "I would swing that {item} all day for you, {player}. I might snap it in half. I would feel bad."
      },
      "armored": {
        "any": [
          "Full armor, boss! You clank magnificently. I can hear you coming from two exhibits away.",
          "Look at you, plated from boots to brow. My armor is called muscle. It needs no polishing."
        ],
        "lo": "Quite a suit, boss. Are we expecting trouble, or do you always dress to impress the zookeepers?",
        "hi": "You look ready for anything in all that, {player}. Good. I sleep better when you clank."
      },
      "hurt": {
        "any": [
          "Boss, you are bleeding! Who did this? Point, and I will go and have a very loud word with them.",
          "You look like I did after the waterfall, boss. That is not a compliment. You are hurt."
        ],
        "lo": "You are in bad shape, boss. I do not know you well yet, but I would carry you home this minute if you asked.",
        "hi": "{player}, no jokes from me now, you are badly hurt. Look at my face. This is the only time today it is not smiling."
      },
      "wet": {
        "any": [
          "You are soaked, boss! Every inch. You look like me after the river race, only with more dignity.",
          "Dripping from head to boots, boss. The puddle around you is growing. I am impressed by the volume."
        ],
        "lo": "A bit damp there, boss. No shame in it. Water finds every explorer in the end.",
        "hi": "Ha! Drenched, {player}! I would lend you my shirt, but it would fit you like a tent."
      },
      "sneaking": {
        "any": [
          "Why are we crouching, boss? I will crouch too. There. Now I am merely the size of a normal man.",
          "You are creeping about very low. Are we stalking something? I love stalking something."
        ],
        "lo": "Boss, you are sneaking up on a man who is very hard to miss. I admire the effort.",
        "hi": "I see you down there, {player}. Nobody sneaks past me. I was ambushed by monkeys once. I am alert for life."
      },
      "long_time": {
        "any": [
          "Boss! Days it has been! I saved up stories and now there are too many. I shall have to tell them fast.",
          "There you are at last. I asked the goat if he had seen you. He ate my question. I had written it down."
        ],
        "lo": "Been a while, boss. I thought perhaps I had flexed too hard last time and scared you off.",
        "hi": "{player}! Days without a word! I am not hurt. I am a boulder. All right, I was a little pebble about it."
      },
      "first_today": {
        "any": [
          "First sighting of the boss today! I mark it on my map with a big X.",
          "Ha, there you are! The day has officially started. Before this I was only practising."
        ],
        "lo": "Good day, boss. The Boulder reports for inspection. Shoulders squared, belt full, grin ready.",
        "hi": "{player}! There is my favourite boss. I have been holding in a joke since I woke. It is about a bucket. It is very good."
      },
      "zoo_busy": {
        "any": [
          "The zoo is packed today, boss! I had to turn sideways at the gate. Sideways I am still quite wide.",
          "Guests in every direction. A child asked if I was one of the exhibits. I said only on my days off."
        ],
        "lo": "Full paths, boss. Your zoo draws a crowd like a waterhole at noon. I am impressed.",
        "hi": "Look at this crush of people, {player}! All here for what you built. I carried a few buckets. You carried the dream."
      },
      "zoo_empty": {
        "any": [
          "Not one guest in the whole zoo, boss. I struck my best pose at the gate and only a pigeon saw it.",
          "Empty paths today. So quiet I can hear the tortoise chewing. He is taking his time."
        ],
        "lo": "No visitors at all, boss. Odd. I have checked, and it is not because of me. Probably.",
        "hi": "Nobody came today, {player}. I know that look. Every explorer has a day the river runs dry. It fills again."
      },
      "zoo_closed": {
        "any": [
          "Gates shut, boss. Just us and the animals. They behave exactly the same. I flex exactly the same.",
          "A closed zoo is a strange jungle. All the paths, none of the feet."
        ],
        "lo": "Closed to guests today, boss. I will keep at my rounds. The beasts do not read the sign.",
        "hi": "With the gates closed I can sing while I rake, {player}. The animals have asked me not to. I do it anyway."
      },
      "litter_bad": {
        "any": [
          "Boss, the paths are buried in litter! I have fought through thick undergrowth, but it was never made of wrappers.",
          "Rubbish all over the walkways. It crunches under my boots. That is not the crunch of adventure."
        ],
        "lo": "A lot of trash on these paths, boss. I say so respectfully. I say so while stepping over a great deal of it.",
        "hi": "I hate seeing your zoo under all this litter, {player}. It deserves better. So do my boots."
      },
      "stars_high": {
        "any": [
          "A top rating, boss! I heard the news and lifted a bench in celebration. There was a guest on it. She cheered.",
          "All those stars! I would like it noted that at least half of one is for my arms."
        ],
        "lo": "Your zoo is highly rated, boss. I picked a winning expedition to join. My instincts remain superb.",
        "hi": "Look at that rating, {player}! I knew it. I have been telling every animal for weeks. The parrot now says it back."
      },
      "stars_low": {
        "any": [
          "The rating is low, boss. I will not pretend otherwise. But I have started treks from the bottom of deeper valleys.",
          "Hardly a star to our name. Hm. Stars are heavy things to lift, but lifting is what I do."
        ],
        "lo": "A poor rating, boss. I signed on anyway. The Boulder does not judge a jungle by its first mile.",
        "hi": "The stars are few right now, {player}. I am still here, and I am not going anywhere. Up is the only trail left."
      },
      "coins_low": {
        "any": [
          "I hear the coin chest is nearly bare, boss. I shook it to check. It made a very small sound.",
          "Zoo Coins running short? I have been poorer. I once paid a ferryman in push-ups."
        ],
        "lo": "Money is tight, I gather, boss. I will not make a fuss. A man who has eaten his trail map is easy to keep.",
        "hi": "The Zoo Coins are thin, {player}, and I can see it weighing on you. That is one load I wish I could carry instead."
      },
      "animal_sick": {
        "any": [
          "One of the animals is poorly, boss. I noticed at once. The Boulder is loud, but he watches closely.",
          "There is a beast here that is not itself today. No jokes about that. It sits heavy with me."
        ],
        "lo": "An animal is unwell, boss. You should know I take that seriously. The flexing can wait.",
        "hi": "I have fretted over that sick one all day, {player}. I am strong enough for anything except watching them suffer."
      }
    },
    "near": {
      "stevie": [
        "Stevie gets as excited about a beetle as I do about a heavy crate, {player}. We are the loudest two in the workroom.",
        "That is Stevie over there. Knows every animal by heart. I know every crate by weight. Together, one perfect zookeeper."
      ],
      "han_lock": [
        "Han Lock! The only arms on this street that make mine nervous. Seven years on one anvil, they say. I believe it.",
        "I asked Han Lock for an arm wrestle, boss. The answer was, after work. Han Lock is always working. Clever."
      ],
      "dory": [
        "Dory asked me if boulders have babies, and are those the pebbles. I said yes. I regret nothing, boss.",
        "There is Dory. She outworks me some mornings and never notices. I notice. I lift faster after."
      ]
    }
  },
  "dory": {
    "intro": "Oh, hello! I'm Dory. I'm a zookeeper here, which means feeders, buckets, rakes and asking the animals things. Are you the boss? You are! I had a question ready and now it's gone.",
    "scenes": {
      "home_morning": {
        "any": [
          "Good morning! You're at my house! I was just putting my boots on. I always do left first, in case it matters.",
          "It's morning and I haven't left yet, so this is still home me. Work me has a bucket."
        ],
        "lo": "Oh! A visitor before work. Hello! I don't know you very well yet, so I'm not sure which chair is yours.",
        "hi": "{player}! You came to see me before breakfast! Or is this during breakfast? I lost track when the toast went quiet."
      },
      "home_evening": {
        "any": [
          "It's evening and I'm home and my boots are off. They look so tired, don't they? Standing up all by themselves.",
          "I'm winding down. Why is it winding down and not unwinding? I've been wondering since supper."
        ],
        "lo": "Oh, hello! It's nearly bedtime here. I'd offer you a seat, but I only just met you and I'm sitting in it.",
        "hi": "I'm so glad you dropped in, {player}. Evenings are when my best questions turn up, and the walls never answer."
      },
      "walking_to_zoo": {
        "any": [
          "I'm on my way to the zoo! It's this way. I know because the zoo is at the end of it.",
          "Walking to work! I counted my steps once, but I lost count when I waved at a bee."
        ],
        "lo": "Hello! I'm just walking to the zoo. Are you going there too? Oh, it's your zoo. So you're sort of always there.",
        "hi": "{player}! Are we walking to work together? That's my favourite kind of walking. The other kind is alone."
      },
      "at_zoo": {
        "any": [
          "I'm visiting today! No bucket. I keep reaching for it and patting the air instead.",
          "I'm just looking at the exhibits like a guest. Do guests know which way round to go? I've gone both."
        ],
        "lo": "I'm only strolling, I promise. I do work here. This is me not working here, in the same place.",
        "hi": "It's my day off, {player}, and I came to the zoo. Is that silly? The animals looked surprised. Well, the owl always does."
      },
      "walking_home": {
        "any": [
          "I'm heading home! It's the same path as this morning but backwards. I still walk it forwards, though.",
          "All done for the day. My feet know the way home, which is lucky, because I was watching a cloud."
        ],
        "lo": "Going home now! It was a good day. I'd tell you about it, but we've only just met and it's a long one.",
        "hi": "Oh good, it's you, {player}! Can I tell you about the goat? I've been saving it the whole way home."
      },
      "at_work": {
        "any": [
          "I'm in the middle of my rounds! This feeder's done, that one's done, and this one is thinking about being done.",
          "Busy, busy! I raked that whole exhibit smooth, then a tortoise walked across it. I think he signed it."
        ],
        "lo": "I'm working, see? Bucket, rake, me. Everything gets finished properly, I just talk to it on the way.",
        "hi": "I'm working, but I've always got a minute for you, {player}. Is it a minute? How long is a word?"
      },
      "following": {
        "any": [
          "We're going on an adventure! Where to? No, wait, surprise me. No, I can't stand it, where to?",
          "I've never been this far from the feeders. Is everything out here real, or is it more exhibits?"
        ],
        "lo": "I'm following you, like you asked. I'm staying close because I don't know you well and I don't know here at all.",
        "hi": "I love tagging along with you, {player}. You always know which way is forwards. I only know it's not back."
      },
      "following_night": {
        "any": [
          "It's very dark out here! Is this the same outside as daytime, with the light off?",
          "We're a long way from home and it's night. The stars came with us, though. That was nice of them."
        ],
        "lo": "Um, it's quite late and quite far. I'm sure you know what you're doing. Do you? I'd love to hear yes.",
        "hi": "I'm not scared, {player}, because you're here. I'm holding my own sleeve, but that's just for something to do."
      },
      "staying": {
        "any": [
          "I'm waiting right here, like you said! I haven't moved. Well, I blinked. Does that count?",
          "Still standing in my spot. I've named it. It's called Spot. We're getting on well."
        ],
        "lo": "You told me to wait, so I'm waiting. How long is a wait, usually? I've not done one for you before.",
        "hi": "I'll wait as long as you like, {player}. I know you'll be back. You always are, and I always wave too early."
      },
      "rain": {
        "any": [
          "It's raining on me! And on you! Is it the same rain on both of us, or do we get one each?",
          "Listen to it on the leaves. Where does rain go when it's finished? I followed some once. It went down a hole."
        ],
        "lo": "Hello! Yes, I'm wet. Somebody once told me to come in out of the rain, but I couldn't find where the rain stopped.",
        "hi": "You're out in the rain too, {player}! My hair goes darker when it's wet. Does yours? I like finding things out with you."
      },
      "thunder": {
        "any": [
          "Did you hear that bang? The sky did it. I looked up to ask why and it flashed at me.",
          "The lightning comes first, then the thunder. Why doesn't the thunder just hurry up?"
        ],
        "lo": "It's storming! I'm fine. I jumped, but only once per boom. Is that a normal amount?",
        "hi": "Can I stand next to you until the thunder stops, {player}? Not because I'm frightened. Because the thunder might be."
      },
      "full_moon": {
        "any": [
          "The moon's all there tonight! Last week some of it was missing. I'm glad they found it.",
          "It's so bright I've got a shadow at night. I didn't know shadows worked night shifts."
        ],
        "lo": "Look, a whole moon! Do you know who fills it up again each time? I've asked around. Nobody will say.",
        "hi": "A full moon, {player}! I waved at it for you. It didn't wave back, but it stayed, and I think that's the same."
      },
      "dark_moon": {
        "any": [
          "There's no moon tonight at all. Did somebody put it away? I hope they remember where.",
          "It's so dark I can't see my boots. I wiggled my toes to check. Still there!"
        ],
        "lo": "Is that you? It's very dark. I said hello to a fence post a minute ago, so I'm being careful now.",
        "hi": "I can't see a thing, {player}, but I knew it was you. You've got very you sort of footsteps."
      },
      "dawn": {
        "any": [
          "The sun's just coming up! It does it so slowly. Do you think it's shy?",
          "It's the very start of the day. Everything's pink. Even my bucket's pink. It's normally bucket coloured."
        ],
        "lo": "Oh, you're up at sunrise too! I didn't know bosses did mornings. I thought you came with the daylight.",
        "hi": "Look, {player}, the sky's the colour of the flamingos! Do you think they copy it, or it copies them?"
      },
      "dusk": {
        "any": [
          "The sun's going down. It was up a minute ago. Well, a day ago. Well, all day.",
          "Sunset! Where does the sun sleep? It must be somewhere big, and not flammable."
        ],
        "lo": "It's getting dark. That's not me, that happens by itself. I checked, the first week I worked here.",
        "hi": "I like watching the sun go down with you, {player}. You never laugh when I say goodnight to it."
      },
      "nether": {
        "any": [
          "It's so hot here! And red! Is the whole Nether cooking, or just this part?",
          "That's a lot of lava. Who left it all out? Somebody should have put a lid on."
        ],
        "lo": "I followed you through that purple doorway and now everything's on fire. Is this normal for you? I'm new.",
        "hi": "{player}, a pig just walked past on two legs! I waved. Should I not have waved? It didn't look like a waver."
      },
      "the_end": {
        "any": [
          "There's no sky here. Or it's all sky. I can't work out which and it's making my knees feel funny.",
          "Those tall dark people keep carrying blocks around. Are they moving house? All of them?"
        ],
        "lo": "This is called the End? The end of what? I'd only just started getting to know you.",
        "hi": "I looked over the edge, {player}, and there's no down down there. I'm going to hold your sleeve now. That's happening."
      },
      "fishing_sky": {
        "any": [
          "The islands are floating! Did they forget to fall? Shh, nobody mention it, in case they remember.",
          "There's a pond up here in the sky with fish in it. Do the fish know how high up they are?"
        ],
        "lo": "We're very far above the ground. I'm fine with it. I'm standing in the middle, where the edge isn't.",
        "hi": "If a fish jumps out of that pool, {player}, is it a bird on the way down? You'd tell me, wouldn't you?"
      },
      "acufend": {
        "any": [
          "We're on a moon! A round one! I thought you could only look at those.",
          "The little creatures here keep humming. I hummed back and one of them clapped. I think I'm in a band now."
        ],
        "lo": "It's a jungle, on a moon, with music. I'd ask you to explain, but I don't know you well enough to keep interrupting.",
        "hi": "{player}, if this is a moon, are we the moon to somebody down there right now? I'm going to wave, just in case."
      },
      "cave": {
        "any": [
          "We're underneath the ground! So is that the ceiling up there, or the bottom of the grass?",
          "I shouted hello and the cave said it back. Very friendly. A bit slow."
        ],
        "lo": "It's a long way down and it's dark and it drips. I'm sure it's a lovely cave once you get to know it.",
        "hi": "I'm glad you're in front, {player}. I keep saying sorry to rocks I bump into. One of them was a bat."
      },
      "high_up": {
        "any": [
          "We're so high! Everything down there is tiny. Did it shrink, or did we get big?",
          "I can see the tops of the trees. I've only ever met them from the bottom. Hello, tops!"
        ],
        "lo": "That's a long way down, isn't it? I'm not going to look again. I'm going to look at you instead, if that's all right.",
        "hi": "From up here I bet I could see the zoo, {player}. Which way is it? I'll wave at the goats either way."
      },
      "hostile_near": {
        "any": [
          "Um, there's something growly over there and it's not one of ours. I checked. It hasn't got an exhibit.",
          "Is that a monster? It's coming this way. Does it want feeding? I haven't got the right bucket."
        ],
        "lo": "There's a nasty thing near us! I don't know you very well, but I'm going to stand behind you anyway.",
        "hi": "{player}, that monster's looking right at you and I don't like it! I've got a rake. I've never used it crossly before."
      },
      "creeper_near": {
        "any": [
          "There's a green one right there with no arms, and it's hissing. Is it cross, or is it leaking?",
          "That creeper keeps shuffling nearer. Does it want a hug? It hasn't got the arms for one."
        ],
        "lo": "Oh! A creeper! I was going to ask it a question, but I've decided to ask from much further away.",
        "hi": "{player}, that creeper is very close to you! I'm backing up, and I'd feel so much better with you next to me."
      },
      "villager_near": {
        "any": [
          "The villagers all say hrm. I said hrm back and now I think I've agreed to something.",
          "Why do they keep their arms folded like that? I tried it. I couldn't carry my bucket."
        ],
        "lo": "There are villagers here! They don't know me either. So that's all of us starting from scratch together.",
        "hi": "I asked a villager what his job was, {player}, and he showed me an emerald. Is his job emerald?"
      },
      "pet_near": {
        "any": [
          "Is that your pet? It's right beside you! Does it know it's yours, or does it think you're its?",
          "Hello, you! Your pet sniffed my hand. I sniffed back, to be polite."
        ],
        "lo": "Your pet's looking at me. I don't think it's decided about me yet. That's fair. I'm new to it.",
        "hi": "Your pet follows you everywhere, {player}. So do I, a bit. Do we both get a collar, or is that just them?"
      },
      "farm_animal_near": {
        "any": [
          "There are cows out here with no exhibit! Are they lost, or is the whole field theirs?",
          "A chicken just looked at me sideways. They always do. Is there something on my other side?"
        ],
        "lo": "Farm animals! Nobody's feeding them and they're eating anyway. I didn't know they could do it themselves.",
        "hi": "{player}, that pig is so happy in the mud. I asked what's so good about it and he just rolled. I think that was the answer."
      },
      "zoo_animal_near": {
        "any": [
          "This is the {species}! I asked it a question this morning. It's still deciding.",
          "Do you think the {species} knows it's called a {species}? Somebody should tell it. I've tried."
        ],
        "lo": "That's the {species}. I look after it! Well, you own it. Well, it owns itself. I bring the food.",
        "hi": "I told the {species} you're my friend, {player}, and it looked at you for ages. That's a yes, in {species}."
      },
      "guests_crowd": {
        "any": [
          "There are so many guests! One asked me where the animals were. I said, in the animal bits.",
          "Everyone's crowding round. Are they looking at me? Oh, there's an exhibit behind me. That makes more sense."
        ],
        "lo": "Sorry, it's very crowded! I keep saying excuse me to people and then to the bins. The bins are politer.",
        "hi": "What a squash, {player}! A little boy asked if I was the boss. I said no, the boss is taller. Are you taller?"
      },
      "residents_crowd": {
        "any": [
          "All the neighbours are here at once! Is it a meeting? Nobody told me. Am I in it?",
          "So many people from our street. I know all their names, just not which name goes on which."
        ],
        "lo": "Everybody's standing around. I don't know you much yet, but you're the one I know most, so I'll stand here.",
        "hi": "Everyone's here, {player}, and I still came over to you first. I didn't even think about it. My feet did it."
      },
      "other_resident": {
        "any": [
          "That's {other}! I asked {other} a question once and got a whole answer. I've kept it.",
          "Oh look, {other} is here. Do you think {other} remembers me? I waved very hard last time."
        ],
        "lo": "Do you know {other}? I do, a bit. Probably about as much as I know you. That's two a bits!",
        "hi": "{player}, {other} told me I ask too many questions. How many is too many? I asked, and that was apparently one."
      },
      "other_player": {
        "any": [
          "There are two of you! Hello, {other}! Are you a boss as well, or is it one each zoo?",
          "Oh, {other} is with you. I waved at you both at once. I had to use two hands."
        ],
        "lo": "I don't know {other} yet. I barely know you! This is a lot of new people for one bucket.",
        "hi": "{player}, is {other} your friend? Then {other} is my friend too. That's how it works, isn't it? I hope it is."
      },
      "alone_night": {
        "any": [
          "It's just us and the night. Everyone else went somewhere. Where does everyone go?",
          "It's so quiet. I can hear myself blinking. Can you hear yourself blinking?"
        ],
        "lo": "There's nobody else about. Just me and you and the dark. I'd say something clever, but it's gone to bed.",
        "hi": "I like it when it's only us, {player}. I can ask the really silly ones and nobody but you hears."
      },
      "by_water": {
        "any": [
          "Look, water! It's doing the wobbly thing. Is it always moving, or only when we look?",
          "I can see myself in there. I waved and she waved back at exactly the same time. She's good."
        ],
        "lo": "I'm staying on the dry bit. Some puddles are deeper than they look, and that one is a lot of puddle.",
        "hi": "{player}, where does a river start? Somebody must turn it on. I'd like to meet them, and you can come."
      },
      "by_lava": {
        "any": [
          "That's lava! It's like water that's cross. I'm not going to ask it anything.",
          "It's so bright and glowy. Why is the prettiest stuff always the stuff you can't touch?"
        ],
        "lo": "Is that lava? I'm stepping back. I once asked if it was warm soup, and the person I asked went very pale.",
        "hi": "You're a bit close to that lava, {player}. I know you know. I just wanted my worrying to be out loud."
      },
      "by_flowers": {
        "any": [
          "Flowers! So many colours. Who decides which one gets to be red?",
          "I smelled one and a bee came out. I said sorry. It was his, apparently."
        ],
        "lo": "Aren't these flowers pretty? I'd pick you one, but I don't know your favourite yet. What if I picked wrong?",
        "hi": "I put a poppy behind my ear, {player}. Can you tell? It's the same colour as my hair, so it might be hiding."
      },
      "by_fire": {
        "any": [
          "A campfire! It's lovely and warm. What does the fire eat when the wood's gone? Does it get hungry?",
          "I like watching the sparks go up. Do they turn into stars? There are a lot of both."
        ],
        "lo": "It's cosy by the fire. I'm sitting on this side. I don't know which side is yours, so I left you three.",
        "hi": "{player}, the smoke keeps following me round the fire. Why me? Do I smell like someone it knows?"
      },
      "by_crops": {
        "any": [
          "Things are growing in rows! How do they know to line up? Nobody lines up at the zoo.",
          "Is that wheat? It looks like hay that hasn't finished yet."
        ],
        "lo": "It's a farm! I won't step on anything. I'm walking round the edge, where the dirt's the ordinary kind.",
        "hi": "{player}, if you plant a carrot you get more carrots. So what happens if you plant a bucket? I'd love more buckets."
      },
      "by_books": {
        "any": [
          "Books! So many! Are they all different, or is it one long one cut up?",
          "I opened one and it was full of words. All the way through! I checked the back."
        ],
        "lo": "I'm being quiet because of the bookshelves. Is that the rule near them, or is that only if they're asleep?",
        "hi": "I'm looking for a book about what tortoises think about, {player}. Or one a tortoise wrote. That'd be a long wait."
      },
      "in_snow": {
        "any": [
          "It's snowy! The ground's gone white. Is the grass still under there, or does it go somewhere for winter?",
          "My boots make a crunchy noise in this snow. Crunch. Crunch. Are they eating it?"
        ],
        "lo": "Brr! Hello! My nose is cold in all this snow. Is yours? I don't know you well enough to check.",
        "hi": "{player}, I scooped up some snow to show you and it had gone! It was right here. In my hand. Did you take it?"
      },
      "holding_gift": {
        "any": [
          "Ooh, what's that you've got? Is that a {item}? I like those! I'm only saying. I like lots of things.",
          "That's a lovely {item}. I keep looking at it. Now I'm looking at you. Now it again."
        ],
        "lo": "Oh, a {item}! That's nice. I'm not asking whose it is. I'm just wondering very loudly.",
        "hi": "{player}, is that a {item}? My favourite! Did you know that, or did the {item} know? One of you is very clever."
      },
      "holding_weapon": {
        "any": [
          "That's a {item}! It looks dangerous. Is it dangerous on purpose?",
          "Why are you carrying that? Is something coming? Should I be carrying something? I've got a bucket."
        ],
        "lo": "Oh! You've got a {item}. I'll just stand over here, on the side it isn't pointing.",
        "hi": "You look very brave with that {item}, {player}. What's it for? No, don't show me. Tell me."
      },
      "holding_food": {
        "any": [
          "Is that {item}? Is it for a guest or an animal? Or you! I always forget bosses eat.",
          "Ooh, {item}. That looks tasty. Does it taste like it looks? Some things don't. Soap doesn't."
        ],
        "lo": "You've got {item}! I'm not hungry. That noise was my tummy asking a question of its own.",
        "hi": "{player}, you're holding {item} and I've had a very small lunch. I'm not hinting. Is this what hinting is?"
      },
      "holding_rod": {
        "any": [
          "A fishing rod! So the fish holds one end and you hold the other? Who lets go first?",
          "Are you going fishing? Do the fish mind? I'd ask one, but then it'd be caught, and that's awkward."
        ],
        "lo": "That's a long stick with string on it. Oh, it's for fishing! I thought you were flying a very small kite.",
        "hi": "Can I watch you fish, {player}? I'll be so quiet. I'll only ask the fish things, not you."
      },
      "holding_tool": {
        "any": [
          "You've got a {item}! Is that like a rake? I've got a rake. Mine's a rake.",
          "What does a {item} do? Wait, let me guess. Digging? Everything out here is digging."
        ],
        "lo": "That {item} looks heavy. You're holding it like you know how. I hold my bucket like that, so I can tell.",
        "hi": "{player}, could a {item} fill a feeder? No? Then I'll stick to my bucket, but I'm proud of you and yours."
      },
      "armored": {
        "any": [
          "You're all shiny! Is that armor? Can you still bend in it? I worry about your knees.",
          "You went clank when you walked up. I thought a bucket was coming to see me."
        ],
        "lo": "Oh, you're wearing metal clothes! Is it a special occasion? I'd have brushed my hair.",
        "hi": "You look like a very brave teapot in that armor, {player}. I mean that nicely. I like teapots, and I like you more."
      },
      "hurt": {
        "any": [
          "Boss, you're hurt! That's a lot of ouch. Where did it come from? Was it a who or a what?",
          "You don't look right at all. You've gone the wrong colour. Does it hurt everywhere, or just all over?"
        ],
        "lo": "Oh no, you're hurt! I don't know you well, but I know that's not how the outside of a person should look.",
        "hi": "{player}, you're hurt badly and I haven't got one question about it, I'm just worried. See? That's how worried."
      },
      "wet": {
        "any": [
          "You're dripping! Did you fall in something, or did something fall on you?",
          "You're soaked right through. Are your socks wet too? That's the worst bit. I think about socks a lot."
        ],
        "lo": "Hello! You're very wet. I'm not sure if I'm meant to mention it. I've mentioned it.",
        "hi": "{player}, you're wet all over! I'd lend you my sleeve to dry off, but it's the one the goats chewed."
      },
      "sneaking": {
        "any": [
          "Why are you down there? Are you hiding? Who from? Is it me? I can see you.",
          "You've gone all short! Did something happen to your legs? Oh, you're crouching. That's a relief."
        ],
        "lo": "Um, you're sneaking. Should I be sneaking too? I don't know the rules with you yet.",
        "hi": "Are we being secret, {player}? I love that! I'll crouch too. Oh, my knees clicked. Did anybody hear?"
      },
      "long_time": {
        "any": [
          "Boss! I haven't seen you in days! I counted on my fingers and had to borrow a goat.",
          "There you are! I thought you'd gone missing. I asked the parrot and it said hello, which was no help."
        ],
        "lo": "Oh, it's you again! It's been ages. I nearly forgot your face, but then I saw it and there it was.",
        "hi": "{player}! Where have you been? I saved up so many questions that some of them went stale. I missed you."
      },
      "first_today": {
        "any": [
          "Hello! This is the first time I've seen you today. Unless I saw you earlier and it was someone else.",
          "Oh, hi, boss! Today's just started having you in it. It's better already."
        ],
        "lo": "Good day! I'm Dory, in case you forgot. I forget things overnight sometimes, so I thought I'd check.",
        "hi": "{player}! First hello of the day! I've been keeping it warm for you since I woke up."
      },
      "zoo_busy": {
        "any": [
          "The zoo's so full today! I've said hello to everyone twice, I think. Or to twins.",
          "There are guests everywhere! Where do they keep them all when it's quiet?"
        ],
        "lo": "It's packed! I'm not lost, I'm just in a different crowd from the one I started in.",
        "hi": "The whole zoo's full, {player}! I told a guest you're my friend and she was very impressed. Or late for something."
      },
      "zoo_empty": {
        "any": [
          "There's nobody here! Not one guest. Did we tell them it was today?",
          "The paths are all empty. I waved at the gate for a bit, in case somebody was shy."
        ],
        "lo": "No guests at all. Is that normal? I've not known you or the zoo long enough to say.",
        "hi": "It's so quiet with no guests, {player}. I counted the animals as visitors to cheer us up. We're nearly full."
      },
      "zoo_closed": {
        "any": [
          "The zoo's closed! But I'm in it. And so are the animals. So who is it closed for?",
          "The gate's shut today. Do the animals get a day off as well? What do they do, go and look at people?"
        ],
        "lo": "We're closed to guests. I'm allowed, I work here. You're allowed too, I expect. It's your gate.",
        "hi": "I like it closed sometimes, {player}. I can talk to the animals out loud and nobody stares. Well, the animals do."
      },
      "litter_bad": {
        "any": [
          "There's rubbish all over the paths! Did the bins fall out with everybody?",
          "I stepped on a wrapper and it stuck to my boot. Now it comes everywhere with me. Is it mine now?"
        ],
        "lo": "Um, there's rather a lot of litter about. I'm only mentioning it because I tripped on some. Twice.",
        "hi": "{player}, the paths are covered in litter and it makes the zoo look sad. Zoos can look sad, can't they? This one is."
      },
      "stars_high": {
        "any": [
          "The zoo's got loads of stars! Where do they keep them in the daytime?",
          "Everybody says our rating is really good. I don't know who counts the stars, but they're doing a lovely job."
        ],
        "lo": "Your zoo has a very high rating! I picked a good one to work at. I didn't know that when I picked. I liked the gate.",
        "hi": "So many stars, {player}! You did that! I helped a bit. Do I get to hold one? Just for a minute."
      },
      "stars_low": {
        "any": [
          "The zoo's hardly got any stars. Did we lose them, or did we never have them? I'll look under things.",
          "Somebody said our rating is low. How low? Can I step over it?"
        ],
        "lo": "I heard the rating isn't very good. I still like it here. I'd give it all the stars, but nobody asks a zookeeper.",
        "hi": "I don't care how few stars there are, {player}. It's your zoo and I love it. Stars only come out at night anyway."
      },
      "coins_low": {
        "any": [
          "Somebody said the Zoo Coins are nearly gone. Gone where? Do they come back if we call them?",
          "Is the zoo out of money? I looked in my pockets to help. There was a button and some hay."
        ],
        "lo": "I heard coins are short. I won't make a fuss. I don't really know what a fuss costs.",
        "hi": "{player}, are you worried about the Zoo Coins? You've got your counting face on. I'd give you my button if it'd help."
      },
      "animal_sick": {
        "any": [
          "One of the animals isn't feeling well. It didn't come over to see my bucket. They always come to see my bucket.",
          "Somebody in the exhibits is poorly. I asked what was wrong and it just looked at me. That's worse than no answer."
        ],
        "lo": "There's a sick animal, boss. I'm not being silly about this one. I've been back to check on it again and again.",
        "hi": "{player}, I can't stop thinking about the poorly one. I sat by the fence and ran out of questions. I never run out."
      }
    },
    "near": {
      "the_boulder": [
        "The Boulder says he carried a canoe up a hill. Why didn't the canoe walk? Nobody will tell me, boss.",
        "That's The Boulder! He lifted me up once to see over a fence. I could see a different fence."
      ],
      "ping": [
        "Ping checks every gate twice. I asked what the second time is for and she said the first time. I'm still working on that.",
        "There's Ping! She laughs at my questions about a minute after I ask them. I think she saves them up."
      ],
      "amanda": [
        "Amanda knows everything about rocks! I asked which rock is the oldest and got a real answer, {player}. A long one.",
        "That's Amanda. My questions get answered before I've finished asking. How does Amanda know where they're going?"
      ]
    }
  },
  "ping": {
    "intro": "Hello. My name is Ping, and I'm a zookeeper here. I feed, clean and watch, and I finish what I start. You're the boss, I take it. Then you'll see my work before you hear much from me.",
    "scenes": {
      "home_morning": {
        "any": [
          "Good morning. You've caught me before I leave. Boots are on, bed is made, tea is finished. In that order.",
          "I'm about to head out. I like to be at the gate before I'm needed, not as I'm needed."
        ],
        "lo": "Good morning, boss. I wasn't expecting anyone at my door this early. Is something wrong at the zoo?",
        "hi": "You came by before work, {player}. My morning is timed to the minute. For you, I'll run two minutes late."
      },
      "home_evening": {
        "any": [
          "Evening. I'm cleaning my boots for tomorrow. It's the nearest thing I have to a hobby.",
          "The day's done and I'm home. I've gone over it once in my head. Nothing was missed."
        ],
        "lo": "Good evening, boss. I keep my evenings quiet. You're welcome in, but there isn't much to see.",
        "hi": "Good, it's you, {player}. This is the hour I stop being useful. I'm told it's good for me."
      },
      "walking_to_zoo": {
        "any": [
          "On my way in. I walk the same route to the zoo every day and I still check it.",
          "I'm heading to the zoo. I've left enough time to be early. I always do."
        ],
        "lo": "Morning, boss. I'm walking to work. I won't be late, if that's the concern.",
        "hi": "Walking in, {player}. I plan my rounds on this path. You've just been added to the plan."
      },
      "at_zoo": {
        "any": [
          "I'm off the clock, just walking the exhibits. I've only straightened one sign. That's restraint.",
          "A visit, not a shift. I'm trying to look at the animals without counting them."
        ],
        "lo": "I'm here as a visitor today, boss. I know it looks like an inspection. It's only half one.",
        "hi": "I'm meant to be resting, {player}. I came to the zoo instead. You're not surprised, are you."
      },
      "walking_home": {
        "any": [
          "Heading home. Everything was latched when I left it. I looked back once to be sure.",
          "The shift is over and I'm walking it off. Good tired, not bad tired."
        ],
        "lo": "On my way home, boss. The day's work is finished. I don't leave it otherwise.",
        "hi": "Long day, {player}. A good one. I'll admit my feet have opinions about the walk home."
      },
      "at_work": {
        "any": [
          "I'm mid-round. This trough was low, so I'm not leaving it low.",
          "Working. Feeders first, then water, then the things nobody else has noticed yet."
        ],
        "lo": "I'm on duty, boss. I can talk and work at once. The work gets the better half.",
        "hi": "I'm busy, {player}, but not too busy for you. I'd say that to nobody else on this path."
      },
      "following": {
        "any": [
          "I'm with you. I've been noting the way back as we go. Habit.",
          "New ground. I like it. I'm watching the treeline so you don't have to."
        ],
        "lo": "You asked me along, boss, so I'm here. I'll keep up and keep quiet.",
        "hi": "Wherever this is going, {player}, I'm glad you asked me. I don't get invited on many adventures. I checked. It's this one."
      },
      "following_night": {
        "any": [
          "We're a long way out and it's dark. I've got your back. Literally. I'm looking at it.",
          "Night travel. Fine. I'm counting our steps from the last landmark, just in case."
        ],
        "lo": "It's late to be this far from home, boss. I'm not objecting. I'm observing.",
        "hi": "I'd rather be out here in the dark with you than at home wondering where you'd got to, {player}."
      },
      "staying": {
        "any": [
          "Still here. You said wait, so this is me waiting. I'm very thorough at it.",
          "I haven't moved. I have memorised everything within sight of this spot, though. Twice."
        ],
        "lo": "I'm holding this spot as asked, boss. I'll be here when you're back.",
        "hi": "I'll wait, {player}. I don't love standing idle, but I trust your reasons."
      },
      "rain": {
        "any": [
          "It's raining. The troughs are filling themselves. I'm being outworked by a cloud.",
          "Wet, yes. But the paths get a rinse and the animals don't seem to mind. I can stand it."
        ],
        "lo": "Rain doesn't change the schedule, boss. It only makes the schedule heavier.",
        "hi": "You're out in this rain too, {player}. Neither of us has the sense to stay in. I find that reassuring."
      },
      "thunder": {
        "any": [
          "That one was close. I counted between the flash and the sound. There wasn't much to count.",
          "The animals don't like this storm. I've been round to the nervous ones already."
        ],
        "lo": "A thunderstorm, boss. I'm calm. I'm also not holding anything metal, which is how I stay calm.",
        "hi": "I don't flinch at thunder, {player}. I do check where you are each time it cracks. Make of that what you like."
      },
      "full_moon": {
        "any": [
          "Full moon. I can see every gate from here without a torch. It makes the last check easier.",
          "Bright tonight. The animals are restless under a moon like that. So am I, a little."
        ],
        "lo": "A full moon, boss. Good light for checking fences. That's the whole of my thoughts on it.",
        "hi": "I like a full moon, {player}. It's the one thing that works a night shift without being asked."
      },
      "dark_moon": {
        "any": [
          "No moon tonight. I'm finding my way by memory. Fortunately I memorised it.",
          "Very dark. I've stopped trusting my eyes and started trusting my ears."
        ],
        "lo": "It's a black night, boss. I'd feel better with every gate checked. So I've checked them.",
        "hi": "A night this dark makes most people talk louder, {player}. You go quiet. I've always liked that."
      },
      "dawn": {
        "any": [
          "Sunrise. My favourite part of the day, and I'm usually the only one awake to judge it.",
          "First light. The animals are stirring. This is when you learn who's hungry and who's only loud."
        ],
        "lo": "You're up at dawn, boss. I'll admit I'd assumed owners slept in.",
        "hi": "Dawn, {player}. I don't share this hour easily. You can stay."
      },
      "dusk": {
        "any": [
          "Sunset. I'm running through the day's list in my head. It's all crossed off.",
          "The light's going. Last feed, last look, then I let the day go."
        ],
        "lo": "Evening's coming on, boss. I'll finish what's in front of me before it's dark.",
        "hi": "I stop for sunsets now, {player}. I never used to. I blame the company."
      },
      "nether": {
        "any": [
          "So this is the Nether. Hot, loud and nothing is latched. I disapprove of all of it.",
          "Lava on every side and the ground is smouldering. I'm watching my footing and yours."
        ],
        "lo": "You've brought me somewhere that's on fire, boss. I'll assume there's a reason and keep walking.",
        "hi": "I wouldn't walk into the Nether for wages, {player}. I came because you were going. Those aren't the same thing."
      },
      "the_end": {
        "any": [
          "No sun, no horizon, and the tall ones don't like being watched. I'm looking at my boots.",
          "Pale stone and nothing underneath it. I've seen better built places."
        ],
        "lo": "The End is a long way past my job description, boss. I'm not complaining. I'm noting it.",
        "hi": "There's a great deal of nothing out there, {player}. I'm standing between you and the edge. I've decided, so that's that."
      },
      "fishing_sky": {
        "any": [
          "Floating islands. I've looked for what's holding them up. Nothing is. I'm trying not to take it personally.",
          "A fishing pool above the clouds. Whoever keeps it stocked has a harder job than mine."
        ],
        "lo": "It's a long drop off this island, boss. I'm steady. I've simply chosen to stand in the middle.",
        "hi": "It's peaceful up here above the clouds, {player}. I didn't expect that. I may even sit down."
      },
      "acufend": {
        "any": [
          "A jungle on a moon, and everything in it hums. I've stopped asking how.",
          "The creatures here follow the music around. Easiest animals to herd I've ever seen."
        ],
        "lo": "Unfamiliar ground, boss. I'm watching how the locals behave before I touch anything.",
        "hi": "One of the little ones sang at me, {player}. I hummed back. If that story reaches the zoo, I'll deny it."
      },
      "cave": {
        "any": [
          "Deep and dark. I've been keeping our turns in my head. Left, left, right, down.",
          "I can hear water dripping somewhere, and something else that isn't water. I'm listening to the second one."
        ],
        "lo": "Close quarters down here, boss. I like to know the way out before I need it. I know it.",
        "hi": "I don't love caves, {player}. No sky, no schedule. But you light the way well, I'll give you that."
      },
      "high_up": {
        "any": [
          "A long way up. You can see how everything connects from here. I like knowing how things connect.",
          "The wind's strong at this height. I've planted my feet. They'll stay planted."
        ],
        "lo": "Quite a drop, boss. I'm not afraid of heights. I'm respectful of landings.",
        "hi": "Worth the climb, {player}. I don't say that about most views, or most climbs."
      },
      "hostile_near": {
        "any": [
          "Something hostile, close. I heard it before I saw it. I haven't taken my eyes off it since.",
          "There's a monster near us. I have a rake and a poor opinion of it."
        ],
        "lo": "Trouble close by, boss. I don't run. I thought you should know that about me early.",
        "hi": "That thing is closer to you than I like, {player}. I'm moving to your side. That's not a question."
      },
      "creeper_near": {
        "any": [
          "Creeper. Right there. I'm keeping my voice level because one of us should be calm, and it isn't.",
          "That creeper is too close. I've faced down a charging goat, but a goat doesn't explode."
        ],
        "lo": "There's a creeper within a few steps of us, boss. I'd rather say it plainly than politely.",
        "hi": "{player}, creeper, very near. I'm not leaving without you, so I hope you're quick on your feet."
      },
      "villager_near": {
        "any": [
          "Villagers. They keep regular hours and mind their own work. I approve.",
          "One of them looked over my boots for a long while and walked off. I think I passed."
        ],
        "lo": "A village, boss. I'll stay out of their way. They seem to have a system.",
        "hi": "The villagers bargain over everything, {player}. I tried once. I paid in full and thanked him. Not my field."
      },
      "pet_near": {
        "any": [
          "Your pet stays close and watches everything. Good instincts. We'd get along.",
          "That animal is well looked after. Clear eyes, good coat. I notice these things. It's the job."
        ],
        "lo": "Your pet is studying me, boss. Fair enough. I'd want to vet a stranger too.",
        "hi": "Your pet trusts you without question, {player}. Animals are rarely wrong about people. I came to the same view."
      },
      "farm_animal_near": {
        "any": [
          "Cows and sheep, no keeper in sight, and they're managing. I try not to feel redundant.",
          "That hen is running the whole yard. Nobody's told the pigs."
        ],
        "lo": "Farm stock, boss. They look sound enough. I checked their feet out of habit.",
        "hi": "I counted the sheep without meaning to, {player}. I can't switch it off. You may laugh."
      },
      "zoo_animal_near": {
        "any": [
          "The {species} is calm today. That's my measure of whether I've done things right.",
          "I know this {species} well. It pretends not to know me until the bucket appears."
        ],
        "lo": "This is the {species}, boss. It's on my rounds. Please don't judge my work by its manners.",
        "hi": "The {species} came to the fence for you, {player}. It took me weeks to earn that. I'm only slightly bitter."
      },
      "guests_crowd": {
        "any": [
          "A lot of guests round us. I'm watching hands. Somebody always wants to share a snack with something.",
          "Crowded. I've answered the same question nine times. The ninth answer was as polite as the first."
        ],
        "lo": "Busy just here, boss. I'm keeping an eye on the fence line. Guests lean.",
        "hi": "All these guests wanting a word, {player}, and you stopped to talk to a zookeeper. I noticed."
      },
      "residents_crowd": {
        "any": [
          "Half the street is standing here. I've never been good at groups. I'm better at gates.",
          "A lot of neighbours at once. I'm listening. You learn more at the edge of a crowd."
        ],
        "lo": "Plenty of neighbours here for you to talk to, boss. I won't keep you.",
        "hi": "A whole crowd of neighbours, {player}, and you're the only one I'd have chosen to stand beside."
      },
      "other_resident": {
        "any": [
          "{other} is here. We nod to each other most days. It's a full conversation, by my standards.",
          "That's {other}. Reliable, from what I've seen. I watch how people treat the animals."
        ],
        "lo": "You'll know {other} better than I do, boss. I keep to my work.",
        "hi": "Between us, {player}, {other} once asked if I ever relax. I said I was relaxing then. Nobody believed it."
      },
      "other_player": {
        "any": [
          "Two of you. Hello, {other}. I'm Ping. I look after the animals here.",
          "You've brought {other} along, boss. Welcome. The paths are clean, I can vouch for that."
        ],
        "lo": "I don't know {other}, boss. I'll be civil and form an opinion later.",
        "hi": "If {other} is a friend of yours, {player}, that's good enough for me. I don't say that lightly."
      },
      "alone_night": {
        "any": [
          "Nobody about but us. I like a night this quiet. I can hear everything that moves.",
          "Just the two of us and the night noises. I know most of them by name."
        ],
        "lo": "It's late and it's only us, boss. I'm not much of a talker. I hope silence suits you.",
        "hi": "With nobody else around, {player}, I'll say it once. I'm happy here. That's the whole speech."
      },
      "by_water": {
        "any": [
          "Still water. I check it for clarity before I notice it's pretty. Hazard of the work.",
          "A good bank to stand on. The current does all its work without making a fuss. I respect that."
        ],
        "lo": "The bank is soft here, boss. I tested it before I stood on it.",
        "hi": "I used to skip stones on water like this, {player}. Seven was my best. Nobody else would believe I ever played."
      },
      "by_lava": {
        "any": [
          "Open lava. I planned three steps back and I've already taken two.",
          "The heat off that lava is fierce. Nothing about it can be fed, cleaned or reasoned with."
        ],
        "lo": "That's lava, boss. I'm keeping a sensible distance, and sensible is further than you'd think.",
        "hi": "You're closer to that lava than I'd like, {player}. I won't nag. I'll just stand here looking tense."
      },
      "by_flowers": {
        "any": [
          "Flowers. They serve no purpose on my rounds, and I like them anyway.",
          "The bees among these flowers work harder than I do. I've been watching for pointers."
        ],
        "lo": "A pleasant spot, boss. I don't often stop for flowers. Today I'm making an exception.",
        "hi": "My mother grew peonies, {player}. I can't see one without standing a little straighter."
      },
      "by_fire": {
        "any": [
          "A good fire. Well built, burning even. Somebody knew what they were doing.",
          "I'll sit by a fire, but I keep one eye on the sparks. Old habit from working around hay."
        ],
        "lo": "Warm enough here by the fire, boss. I'll take a minute. Only a minute.",
        "hi": "Fires make people talk, {player}. So. My first week, I was afraid I'd fail at this job. I didn't. But I was."
      },
      "by_crops": {
        "any": [
          "Straight rows, even watering. Whoever tends this field keeps a schedule. I can tell.",
          "Crops are honest. You get out what you put in. Animals are the same, with more opinions."
        ],
        "lo": "A tidy field, boss. I'm keeping to the edge of it. I know what trampled work feels like.",
        "hi": "I could have been a farmer, {player}. Then I met a goat with a grudge and found my calling."
      },
      "by_books": {
        "any": [
          "Bookshelves. I read about animal care in the evenings. The animals haven't read the same books.",
          "A lot of books. I like the ones with diagrams. Fewer opinions."
        ],
        "lo": "I do read, boss, if you were wondering. Mostly manuals. They don't waste my time.",
        "hi": "I keep one book of poems, {player}. It's behind the manuals. You're the only one who knows it's there."
      },
      "in_snow": {
        "any": [
          "Snow. Cold feet, clear head. I'd be checking the troughs for ice if we were anywhere near them.",
          "My tracks are the only straight line in this snow. I looked back to make sure."
        ],
        "lo": "Cold, boss, but I've worked through worse than snow. I don't stop for weather.",
        "hi": "I threw a snowball at a post just now, {player}. Hit it. You didn't see, so you'll have to trust me."
      },
      "holding_gift": {
        "any": [
          "That's a good {item} you're carrying. I noticed. I notice most things.",
          "A {item}. Well chosen, whoever it's for."
        ],
        "lo": "A fine {item}, boss. I'm only remarking on it. I don't ask for things.",
        "hi": "You're holding a {item}, {player}, and trying to look casual. You know I like those. You're not subtle. I appreciate it."
      },
      "holding_weapon": {
        "any": [
          "A {item}. You hold it properly. Most people grip too tight.",
          "Armed, I see. I hope it's a precaution and not a plan."
        ],
        "lo": "That's a {item}, boss. I'll trust you know where it's pointing.",
        "hi": "I've trained a little with a blade, {player}. Yes, really. That {item} is well kept. Good."
      },
      "holding_food": {
        "any": [
          "That's {item}. I could name four animals that would have it off you before you blinked.",
          "You've got {item} out. I skipped lunch to finish a round, so I'm noticing it more than I should."
        ],
        "lo": "Your {item} smells good, boss. I'm not hinting. I've eaten. Hours ago.",
        "hi": "You remember to eat, {player}. Good. I was about to ask, and then you'd have called me a mother hen."
      },
      "holding_rod": {
        "any": [
          "A fishing rod. Patience with a hook on it. I can respect that.",
          "Fishing is mostly waiting. I'm good at waiting. I've never been good at the fish part."
        ],
        "lo": "Going fishing, boss? A quiet pursuit. I'd have guessed you for something louder.",
        "hi": "I'd sit with you while you fish, {player}. I wouldn't talk. I'm told that makes me ideal."
      },
      "holding_tool": {
        "any": [
          "A {item}. Worn handle, so it's actually used. That's the right kind.",
          "You do your own digging and breaking. I think better of people who carry their own tools."
        ],
        "lo": "The boss with a {item} in hand. That tells me more than an introduction would.",
        "hi": "I've mended my rake handle twice, {player}. Your {item} is in better shape. I'm a little envious."
      },
      "armored": {
        "any": [
          "Full armor. Either you're expecting trouble or you've just come from it.",
          "That's a complete set of armor. Buckled properly, too. I checked the straps from here."
        ],
        "lo": "You're well protected, boss. I'd feel underdressed if I weren't holding a bucket.",
        "hi": "The armor suits you, {player}. Though I've seen you face worse in a plain shirt, and I thought more of that."
      },
      "hurt": {
        "any": [
          "You're hurt, boss. Badly. I'm not going to pretend I haven't seen it.",
          "That's more than a scratch. I've patched up animals in better shape than you're in."
        ],
        "lo": "Boss, you're injured. I know we're not close, but I'm not walking past that.",
        "hi": "{player}. You're badly hurt and you're standing here chatting. I'm calm. I'm also furious. Both."
      },
      "wet": {
        "any": [
          "You're soaked. I can hear your boots squelch from here.",
          "Dripping wet. I've pulled feed sacks out of a trough that were drier."
        ],
        "lo": "You're wet through, boss. I won't ask. I assume it was on purpose.",
        "hi": "You'll catch cold, soaked like that, {player}. I'm not fussing. I'm stating a fact, with concern."
      },
      "sneaking": {
        "any": [
          "You're crouching. I saw you some time ago. I didn't want to spoil it.",
          "If that's sneaking, boss, the animals do it better. The big cat does it much better."
        ],
        "lo": "Is there a reason you're creeping, boss? I'll keep my voice down in case there is.",
        "hi": "You can't sneak up on me, {player}. I've tried to let you, once or twice. It never works."
      },
      "long_time": {
        "any": [
          "It's been several days, boss. I kept things in order. I'd like that noted.",
          "You've been away. The animals noticed. One of the keepers may have as well."
        ],
        "lo": "Boss. It's been a while. Everything on my rounds is as you left it, or better.",
        "hi": "It's been days, {player}. I wasn't counting. I was counting. I'm glad you're back."
      },
      "first_today": {
        "any": [
          "Good day, boss. First report: nothing escaped, nothing broke, nobody complained.",
          "Hello. You're the first conversation I've had today that wasn't with a goat."
        ],
        "lo": "Good day, boss. I'm at my work, as you'd expect. Was there something you needed?",
        "hi": "There you are, {player}. The day runs better once I've seen you. I've tested this over several days."
      },
      "zoo_busy": {
        "any": [
          "Packed today. I've stopped counting guests and started counting fingers near fences.",
          "A full zoo. More noise, more mess, more to watch. I don't mind. It means it's working."
        ],
        "lo": "Heavy crowds, boss. I'm keeping my rounds on time regardless. It takes some weaving.",
        "hi": "Look at the paths, {player}. Full. You built something people travel a long way for. I just keep it fed."
      },
      "zoo_empty": {
        "any": [
          "Not a single guest. The animals still need feeding, so my day looks the same.",
          "Empty paths. It's peaceful, but I'd rather have the noise. Noise means somebody came."
        ],
        "lo": "No visitors today, boss. I'll do the work to the same standard. Someone will come back to see it.",
        "hi": "An empty zoo isn't a failed one, {player}. I've seen you fix harder things than a quiet day."
      },
      "zoo_closed": {
        "any": [
          "Closed to guests. The animals don't know the difference, and I don't let them find out.",
          "Gates shut. I get more done in a closed hour than in three open ones."
        ],
        "lo": "The zoo is closed, boss. That's your decision to make. Mine is to keep it ready for when it opens.",
        "hi": "I like the zoo closed, {player}. Just the animals and the work. And you, apparently. That's fine too."
      },
      "litter_bad": {
        "any": [
          "The paths are covered in litter. I've stepped over more than I can stand to.",
          "There's rubbish everywhere. A dirty path tells guests nobody's looking. Somebody is. Me. And I'm annoyed."
        ],
        "lo": "I'll be direct, boss. There's too much litter on the paths, and I'd rather you heard it from me.",
        "hi": "This much litter bothers me, {player}. Not for the rating. Because I've seen what blows into the exhibits."
      },
      "stars_high": {
        "any": [
          "A high rating. Earned, not given. I've seen the work that went in.",
          "Top marks for the zoo. I allowed myself one nod of satisfaction. It's done now."
        ],
        "lo": "Your zoo is rated highly, boss. I applied here on purpose. I do my research.",
        "hi": "Those stars are yours, {player}. I'm proud to work under them. That's as sentimental as I get before noon."
      },
      "stars_low": {
        "any": [
          "The rating is poor. I won't dress it up. But a rating is a result, and results can be changed.",
          "Barely a star. I've been underestimated before. I know what to do with it."
        ],
        "lo": "The rating's low, boss. I took the job anyway. I don't mind starting where the work is.",
        "hi": "Low stars don't change my mind about you, {player}. I've seen how you treat the animals. The rest catches up."
      },
      "coins_low": {
        "any": [
          "I hear Zoo Coins are short. I've been making the twine and the old buckets last.",
          "Money's tight at the zoo. I grew up careful. A lean stretch doesn't frighten me."
        ],
        "lo": "The coins are low, boss. I'm not raising it to complain. I'd simply rather know than guess.",
        "hi": "If the Zoo Coins are worrying you, {player}, you can say so to me. I can't fix it, but you needn't carry it alone."
      },
      "animal_sick": {
        "any": [
          "One of the animals is unwell. I knew before I reached the fence. You learn their quiet.",
          "There's an animal in poor shape today. I take that personally. I always will."
        ],
        "lo": "An animal is suffering, boss. I'll say it straight, because it can't.",
        "hi": "I keep going back to the sick one, {player}. I can stay calm about almost anything. Not this."
      }
    },
    "near": {
      "the_boulder": [
        "The Boulder carries three buckets and announces each one. I carry two and say nothing. We finish together.",
        "That's The Boulder. Loud, yes. But I've seen him kneel to feed the smallest animal here, {player}."
      ],
      "dory": [
        "Dory asked me if gates get tired of being checked. I've thought about it for two days, boss.",
        "Dory's work is always finished and always right. She'd be the last to notice. I'm not."
      ],
      "dr_pollo": [
        "Dr. Pollo has forgotten more about animals than I've learned. When the doctor talks, I listen. All of it.",
        "There's Dr. Pollo. The doctor once told me I watch like a vet. I've been living off that for a month."
      ]
    }
  },
};
