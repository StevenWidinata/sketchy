import type { Language } from "./types";

export interface Category {
  id: string;
  name: Record<Language, string>;
  /** [english, indonesian] pairs. */
  words: ReadonlyArray<readonly [string, string]>;
}

export const CATEGORIES: readonly Category[] = [
  {
    id: "animals",
    name: { en: "Animals", id: "Hewan" },
    words: [
      ["cat", "kucing"], ["dog", "anjing"], ["giraffe", "jerapah"], ["elephant", "gajah"], ["penguin", "penguin"],
      ["snake", "ular"], ["rabbit", "kelinci"], ["monkey", "monyet"], ["lion", "singa"], ["tiger", "harimau"],
      ["zebra", "zebra"], ["kangaroo", "kanguru"], ["owl", "burung hantu"], ["frog", "katak"], ["turtle", "kura-kura"],
      ["horse", "kuda"], ["cow", "sapi"], ["pig", "babi"], ["chicken", "ayam"], ["duck", "bebek"],
      ["bat", "kelelawar"], ["camel", "unta"], ["snail", "siput"], ["spider", "laba-laba"], ["butterfly", "kupu-kupu"],
      ["bee", "lebah"], ["crocodile", "buaya"], ["deer", "rusa"], ["goat", "kambing"], ["mouse", "tikus"],
      ["orangutan", "orangutan"], ["komodo", "komodo"], ["peacock", "merak"], ["squirrel", "tupai"], ["raccoon", "rakun"],
    ],
  },
  {
    id: "nature",
    name: { en: "Nature & weather", id: "Alam & cuaca" },
    words: [
      ["rainbow", "pelangi"], ["volcano", "gunung berapi"], ["mountain", "gunung"], ["river", "sungai"], ["waterfall", "air terjun"],
      ["cloud", "awan"], ["rain", "hujan"], ["lightning", "petir"], ["snow", "salju"], ["tornado", "tornado"],
      ["sun", "matahari"], ["moon", "bulan"], ["tree", "pohon"], ["flower", "bunga"], ["leaf", "daun"],
      ["cactus", "kaktus"], ["island", "pulau"], ["beach", "pantai"], ["desert", "gurun"], ["forest", "hutan"],
      ["cave", "gua"], ["wave", "ombak"], ["mushroom", "jamur"], ["sunset", "matahari terbenam"], ["fog", "kabut"],
      ["lake", "danau"], ["rock", "batu"], ["palm tree", "pohon kelapa"], ["earthquake", "gempa bumi"], ["wind", "angin"],
    ],
  },
  {
    id: "food",
    name: { en: "Food", id: "Makanan" },
    words: [
      ["pizza", "pizza"], ["burger", "burger"], ["fried rice", "nasi goreng"], ["noodles", "mi"], ["satay", "sate"],
      ["egg", "telur"], ["bread", "roti"], ["cheese", "keju"], ["banana", "pisang"], ["apple", "apel"],
      ["watermelon", "semangka"], ["pineapple", "nanas"], ["durian", "durian"], ["mango", "mangga"], ["grapes", "anggur"],
      ["carrot", "wortel"], ["corn", "jagung"], ["chili", "cabai"], ["sushi", "sushi"], ["hot dog", "hot dog"],
      ["french fries", "kentang goreng"], ["ice cream", "es krim"], ["cake", "kue"], ["donut", "donat"], ["sandwich", "roti lapis"],
      ["meatball soup", "bakso"], ["fried chicken", "ayam goreng"], ["coconut", "kelapa"], ["strawberry", "stroberi"], ["tomato", "tomat"],
      ["popcorn", "berondong jagung"], ["pancake", "panekuk"], ["shrimp", "udang"], ["avocado", "alpukat"], ["dumpling", "pangsit"],
    ],
  },
  {
    id: "drinks",
    name: { en: "Drinks & snacks", id: "Minuman & jajanan" },
    words: [
      ["bubble tea", "boba"], ["iced tea", "es teh"], ["coffee", "kopi"], ["milk", "susu"], ["juice", "jus"],
      ["lemonade", "limun"], ["hot chocolate", "cokelat panas"], ["water bottle", "botol air"], ["soda", "soda"], ["smoothie", "smoothie"],
      ["cookie", "kue kering"], ["candy", "permen"], ["lollipop", "lolipop"], ["chocolate bar", "batang cokelat"], ["chips", "keripik"],
      ["crackers", "kerupuk"], ["peanuts", "kacang"], ["pudding", "puding"], ["cupcake", "kue mangkuk"], ["waffle", "wafel"],
      ["muffin", "muffin"], ["pretzel", "pretzel"], ["marshmallow", "marshmallow"], ["cotton candy", "arbanat"], ["jelly", "agar-agar"],
      ["teapot", "teko"], ["straw", "sedotan"], ["mug", "cangkir"], ["ice cube", "es batu"], ["coconut water", "es kelapa"],
    ],
  },
  {
    id: "household",
    name: { en: "Household objects", id: "Barang rumah" },
    words: [
      ["umbrella", "payung"], ["chair", "kursi"], ["table", "meja"], ["bed", "kasur"], ["lamp", "lampu"],
      ["door", "pintu"], ["window", "jendela"], ["clock", "jam dinding"], ["mirror", "cermin"], ["pillow", "bantal"],
      ["blanket", "selimut"], ["broom", "sapu"], ["bucket", "ember"], ["key", "kunci"], ["candle", "lilin"],
      ["toothbrush", "sikat gigi"], ["soap", "sabun"], ["towel", "handuk"], ["scissors", "gunting"], ["fan", "kipas angin"],
      ["refrigerator", "kulkas"], ["stove", "kompor"], ["spoon", "sendok"], ["fork", "garpu"], ["plate", "piring"],
      ["frying pan", "wajan"], ["sofa", "sofa"], ["bathtub", "bak mandi"], ["ladder", "tangga"], ["hanger", "gantungan baju"],
    ],
  },
  {
    id: "tech",
    name: { en: "Tech & gadgets", id: "Teknologi & gawai" },
    words: [
      ["laptop", "laptop"], ["phone", "ponsel"], ["camera", "kamera"], ["headphones", "headphone"], ["keyboard", "papan ketik"],
      ["computer mouse", "mouse komputer"], ["television", "televisi"], ["robot", "robot"], ["drone", "drone"], ["battery", "baterai"],
      ["light bulb", "bola lampu"], ["remote control", "remote"], ["microphone", "mikrofon"], ["speaker", "pengeras suara"], ["printer", "printer"],
      ["game controller", "stik game"], ["smartwatch", "jam pintar"], ["charger", "pengisi daya"], ["satellite", "satelit"], ["calculator", "kalkulator"],
      ["radio", "radio"], ["flashlight", "senter"], ["usb stick", "flashdisk"], ["router", "router"], ["tablet", "tablet"],
      ["selfie stick", "tongsis"], ["vr headset", "kacamata vr"], ["plug", "colokan"], ["magnet", "magnet"], ["antenna", "antena"],
    ],
  },
  {
    id: "places",
    name: { en: "Places & buildings", id: "Tempat & bangunan" },
    words: [
      ["hospital", "rumah sakit"], ["school", "sekolah"], ["house", "rumah"], ["castle", "istana"], ["lighthouse", "mercusuar"],
      ["bridge", "jembatan"], ["airport", "bandara"], ["mosque", "masjid"], ["church", "gereja"], ["temple", "candi"],
      ["library", "perpustakaan"], ["museum", "museum"], ["zoo", "kebun binatang"], ["market", "pasar"], ["stadium", "stadion"],
      ["tent", "tenda"], ["igloo", "iglo"], ["pyramid", "piramida"], ["skyscraper", "gedung pencakar langit"], ["farm", "peternakan"],
      ["playground", "taman bermain"], ["cinema", "bioskop"], ["prison", "penjara"], ["tower", "menara"], ["windmill", "kincir angin"],
      ["swimming pool", "kolam renang"], ["train station", "stasiun"], ["gas station", "pom bensin"], ["treehouse", "rumah pohon"], ["bakery", "toko roti"],
    ],
  },
  {
    id: "vehicles",
    name: { en: "Vehicles", id: "Kendaraan" },
    words: [
      ["car", "mobil"], ["bus", "bus"], ["bicycle", "sepeda"], ["motorcycle", "sepeda motor"], ["train", "kereta"],
      ["airplane", "pesawat"], ["helicopter", "helikopter"], ["boat", "perahu"], ["ship", "kapal"], ["submarine", "kapal selam"],
      ["rocket", "roket"], ["truck", "truk"], ["ambulance", "ambulans"], ["fire truck", "mobil pemadam"], ["police car", "mobil polisi"],
      ["taxi", "taksi"], ["scooter", "skuter"], ["skateboard", "papan luncur"], ["tractor", "traktor"], ["hot air balloon", "balon udara"],
      ["pedicab", "becak"], ["horse cart", "delman"], ["canoe", "kano"], ["tank", "tank"], ["excavator", "ekskavator"],
      ["cable car", "kereta gantung"], ["sailboat", "perahu layar"], ["parachute", "parasut"], ["wheelchair", "kursi roda"], ["minivan", "angkot"],
    ],
  },
  {
    id: "jobs",
    name: { en: "Jobs", id: "Pekerjaan" },
    words: [
      ["doctor", "dokter"], ["nurse", "perawat"], ["teacher", "guru"], ["firefighter", "pemadam kebakaran"], ["police officer", "polisi"],
      ["chef", "koki"], ["farmer", "petani"], ["pilot", "pilot"], ["astronaut", "astronaut"], ["artist", "seniman"],
      ["singer", "penyanyi"], ["dentist", "dokter gigi"], ["builder", "tukang bangunan"], ["fisherman", "nelayan"], ["mail carrier", "tukang pos"],
      ["scientist", "ilmuwan"], ["photographer", "fotografer"], ["barber", "tukang cukur"], ["magician", "pesulap"], ["clown", "badut"],
      ["mechanic", "montir"], ["judge", "hakim"], ["soldier", "tentara"], ["detective", "detektif"], ["programmer", "programmer"],
      ["waiter", "pelayan"], ["lifeguard", "penjaga pantai"], ["pirate", "bajak laut"], ["king", "raja"], ["street vendor", "pedagang kaki lima"],
    ],
  },
  {
    id: "sports",
    name: { en: "Sports", id: "Olahraga" },
    words: [
      ["football", "sepak bola"], ["basketball", "bola basket"], ["badminton", "bulu tangkis"], ["tennis", "tenis"], ["volleyball", "bola voli"],
      ["swimming", "renang"], ["boxing", "tinju"], ["golf", "golf"], ["surfing", "selancar"], ["skiing", "ski"],
      ["bowling", "boling"], ["baseball", "bisbol"], ["archery", "panahan"], ["karate", "karate"], ["cycling", "bersepeda"],
      ["running", "lari"], ["table tennis", "tenis meja"], ["sepak takraw", "sepak takraw"], ["diving", "menyelam"], ["fishing", "memancing"],
      ["climbing", "panjat tebing"], ["horse riding", "berkuda"], ["chess", "catur"], ["gymnastics", "senam"], ["weightlifting", "angkat besi"],
      ["trophy", "piala"], ["medal", "medali"], ["whistle", "peluit"], ["goal", "gawang"], ["skating", "seluncur"],
    ],
  },
  {
    id: "actions",
    name: { en: "Actions", id: "Kegiatan" },
    words: [
      ["sleeping", "tidur"], ["eating", "makan"], ["dancing", "menari"], ["crying", "menangis"], ["laughing", "tertawa"],
      ["running", "berlari"], ["jumping", "melompat"], ["swimming", "berenang"], ["singing", "bernyanyi"], ["reading", "membaca"],
      ["writing", "menulis"], ["cooking", "memasak"], ["painting", "melukis"], ["sneezing", "bersin"], ["yawning", "menguap"],
      ["fishing", "memancing"], ["flying", "terbang"], ["climbing", "memanjat"], ["hugging", "berpelukan"], ["waving", "melambai"],
      ["thinking", "berpikir"], ["shouting", "berteriak"], ["sweeping", "menyapu"], ["praying", "berdoa"], ["shopping", "belanja"],
      ["clapping", "bertepuk tangan"], ["kicking", "menendang"], ["whistling", "bersiul"], ["sweating", "berkeringat"], ["falling", "jatuh"],
    ],
  },
  {
    id: "body",
    name: { en: "Body & clothing", id: "Tubuh & pakaian" },
    words: [
      ["eye", "mata"], ["nose", "hidung"], ["mouth", "mulut"], ["ear", "telinga"], ["hand", "tangan"],
      ["foot", "kaki"], ["tooth", "gigi"], ["hair", "rambut"], ["heart", "jantung"], ["skeleton", "kerangka"],
      ["hat", "topi"], ["glasses", "kacamata"], ["shirt", "kemeja"], ["dress", "gaun"], ["pants", "celana"],
      ["sneakers", "sepatu"], ["sandals", "sandal"], ["sock", "kaus kaki"], ["scarf", "syal"], ["glove", "sarung tangan"],
      ["tie", "dasi"], ["backpack", "ransel"], ["watch", "jam tangan"], ["ring", "cincin"], ["crown", "mahkota"],
      ["mustache", "kumis"], ["beard", "jenggot"], ["sarong", "sarung"], ["helmet", "helm"], ["raincoat", "jas hujan"],
    ],
  },
  {
    id: "music",
    name: { en: "Music & instruments", id: "Musik & alat musik" },
    words: [
      ["guitar", "gitar"], ["piano", "piano"], ["drum", "drum"], ["violin", "biola"], ["trumpet", "terompet"],
      ["flute", "seruling"], ["saxophone", "saksofon"], ["harp", "harpa"], ["angklung", "angklung"], ["gamelan", "gamelan"],
      ["microphone", "mikrofon"], ["headphones", "headphone"], ["music note", "not balok"], ["concert", "konser"], ["band", "band"],
      ["choir", "paduan suara"], ["conductor", "dirigen"], ["accordion", "akordeon"], ["tambourine", "rebana"], ["xylophone", "gambang"],
      ["harmonica", "harmonika"], ["ukulele", "ukulele"], ["bell", "lonceng"], ["radio", "radio"], ["dj", "dj"],
      ["karaoke", "karaoke"], ["record player", "pemutar piringan hitam"], ["metronome", "metronom"], ["cello", "selo"], ["triangle", "triangel"],
    ],
  },
  {
    id: "school",
    name: { en: "School & office", id: "Sekolah & kantor" },
    words: [
      ["pencil", "pensil"], ["eraser", "penghapus"], ["ruler", "penggaris"], ["book", "buku"], ["notebook", "buku tulis"],
      ["backpack", "tas sekolah"], ["blackboard", "papan tulis"], ["chalk", "kapur"], ["glue", "lem"], ["stapler", "stapler"],
      ["paper clip", "penjepit kertas"], ["globe", "globe"], ["map", "peta"], ["calculator", "kalkulator"], ["microscope", "mikroskop"],
      ["desk", "meja belajar"], ["envelope", "amplop"], ["calendar", "kalender"], ["folder", "map"], ["pen", "pulpen"],
      ["crayon", "krayon"], ["paintbrush", "kuas"], ["diploma", "ijazah"], ["school bus", "bus sekolah"], ["homework", "pekerjaan rumah"],
      ["bell", "bel"], ["exam", "ujian"], ["sharpener", "rautan"], ["highlighter", "stabilo"], ["computer", "komputer"],
    ],
  },
  {
    id: "fantasy",
    name: { en: "Fantasy", id: "Fantasi" },
    words: [
      ["dragon", "naga"], ["unicorn", "unicorn"], ["wizard", "penyihir"], ["witch", "nenek sihir"], ["ghost", "hantu"],
      ["vampire", "vampir"], ["mermaid", "putri duyung"], ["fairy", "peri"], ["giant", "raksasa"], ["zombie", "zombi"],
      ["magic wand", "tongkat sihir"], ["treasure chest", "peti harta karun"], ["crystal ball", "bola kristal"], ["potion", "ramuan"], ["sword", "pedang"],
      ["shield", "perisai"], ["knight", "kesatria"], ["princess", "putri"], ["monster", "monster"], ["alien", "alien"],
      ["phoenix", "burung api"], ["troll", "troll"], ["genie", "jin"], ["flying carpet", "karpet terbang"], ["haunted house", "rumah hantu"],
      ["skeleton", "tengkorak"], ["mummy", "mumi"], ["werewolf", "manusia serigala"], ["robot", "robot"], ["superhero", "pahlawan super"],
    ],
  },
  {
    id: "space",
    name: { en: "Space", id: "Luar angkasa" },
    words: [
      ["rocket", "roket"], ["planet", "planet"], ["star", "bintang"], ["moon", "bulan"], ["sun", "matahari"],
      ["astronaut", "astronaut"], ["alien", "alien"], ["ufo", "piring terbang"], ["comet", "komet"], ["meteor", "meteor"],
      ["black hole", "lubang hitam"], ["galaxy", "galaksi"], ["satellite", "satelit"], ["telescope", "teleskop"], ["space station", "stasiun luar angkasa"],
      ["saturn", "saturnus"], ["earth", "bumi"], ["mars", "mars"], ["crater", "kawah"], ["spacesuit", "baju astronaut"],
      ["constellation", "rasi bintang"], ["eclipse", "gerhana"], ["shooting star", "bintang jatuh"], ["asteroid", "asteroid"], ["moon landing", "pendaratan di bulan"],
    ],
  },
  {
    id: "holidays",
    name: { en: "Holidays & celebrations", id: "Hari raya & perayaan" },
    words: [
      ["birthday cake", "kue ulang tahun"], ["balloon", "balon"], ["gift", "kado"], ["fireworks", "kembang api"], ["candle", "lilin"],
      ["party hat", "topi pesta"], ["christmas tree", "pohon natal"], ["snowman", "manusia salju"], ["ketupat", "ketupat"], ["lantern", "lentera"],
      ["firecracker", "petasan"], ["wedding", "pernikahan"], ["confetti", "konfeti"], ["pumpkin", "labu"], ["costume", "kostum"],
      ["mask", "topeng"], ["parade", "pawai"], ["flag", "bendera"], ["easter egg", "telur paskah"], ["red envelope", "angpao"],
      ["dragon dance", "barongsai"], ["sack race", "balap karung"], ["cracker eating contest", "lomba makan kerupuk"], ["greeting card", "kartu ucapan"], ["piñata", "pinata"],
    ],
  },
  {
    id: "toys",
    name: { en: "Toys & games", id: "Mainan & permainan" },
    words: [
      ["kite", "layang-layang"], ["yo-yo", "yoyo"], ["teddy bear", "boneka beruang"], ["doll", "boneka"], ["ball", "bola"],
      ["puzzle", "teka-teki"], ["dice", "dadu"], ["playing cards", "kartu remi"], ["marbles", "kelereng"], ["spinning top", "gasing"],
      ["toy car", "mobil-mobilan"], ["swing", "ayunan"], ["slide", "perosotan"], ["seesaw", "jungkat-jungkit"], ["jump rope", "lompat tali"],
      ["building blocks", "balok mainan"], ["water gun", "pistol air"], ["rubber duck", "bebek karet"], ["hula hoop", "simpai"], ["robot toy", "robot mainan"],
      ["board game", "permainan papan"], ["hide and seek", "petak umpet"], ["rocking horse", "kuda goyang"], ["bubble wand", "gelembung sabun"], ["trampoline", "trampolin"],
    ],
  },
  {
    id: "ocean",
    name: { en: "Ocean life", id: "Kehidupan laut" },
    words: [
      ["octopus", "gurita"], ["shark", "hiu"], ["whale", "paus"], ["dolphin", "lumba-lumba"], ["jellyfish", "ubur-ubur"],
      ["starfish", "bintang laut"], ["crab", "kepiting"], ["seahorse", "kuda laut"], ["clownfish", "ikan badut"], ["sea turtle", "penyu"],
      ["coral", "terumbu karang"], ["seaweed", "rumput laut"], ["shell", "kerang"], ["lobster", "lobster"], ["squid", "cumi-cumi"],
      ["stingray", "ikan pari"], ["pufferfish", "ikan buntal"], ["anchor", "jangkar"], ["submarine", "kapal selam"], ["scuba diver", "penyelam"],
      ["pearl", "mutiara"], ["seal", "anjing laut"], ["shipwreck", "kapal karam"], ["sea urchin", "bulu babi"], ["swordfish", "ikan todak"],
    ],
  },
  {
    id: "indonesia",
    name: { en: "Indonesian culture", id: "Budaya Indonesia" },
    words: [
      ["batik", "batik"], ["shadow puppet", "wayang"], ["kris", "keris"], ["angklung", "angklung"], ["gamelan", "gamelan"],
      ["borobudur", "borobudur"], ["rice field", "sawah"], ["satay", "sate"], ["fried rice", "nasi goreng"], ["tempeh", "tempe"],
      ["pedicab", "becak"], ["kite", "layang-layang"], ["komodo", "komodo"], ["orangutan", "orangutan"], ["garuda", "garuda"],
      ["peci", "peci"], ["kebaya", "kebaya"], ["reog", "reog"], ["rendang", "rendang"], ["coconut tree", "pohon kelapa"],
      ["volcano", "gunung berapi"], ["traditional house", "rumah adat"], ["boat race", "pacu jalur"], ["climbing pole contest", "panjat pinang"], ["sambal", "sambal"],
      ["spinning top", "gasing"], ["bamboo", "bambu"], ["mortar and pestle", "cobek"], ["coffee shop", "warung kopi"], ["motorbike taxi", "ojek"],
    ],
  },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export function categoryName(id: string, lang: Language): string {
  if (id === "custom") return lang === "id" ? "Kata buatan" : "Custom words";
  return CATEGORIES.find((c) => c.id === id)?.name[lang] ?? id;
}
