import type { Difficulty, Language } from "./types";

export interface Category {
  id: string;
  name: Record<Language, string>;
  /** Harder to draw (feelings, idioms, two-person scenes). Off unless the host ticks it. */
  hard?: boolean;
  /** [english, indonesian, difficulty] for each word. */
  words: ReadonlyArray<readonly [string, string, Difficulty]>;
}

const LEVELS = { e: "easy", m: "medium", h: "hard" } as const;

/**
 * One "english | indonesian | level" line per word. Levels were judged by hand: how hard the word is
 * to draw and to guess from a quick sketch (e = easy, m = medium, h = hard).
 */
function w(list: string): ReadonlyArray<readonly [string, string, Difficulty]> {
  return list
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [en, id, level] = line.split("|").map((s) => s.trim());
      return [en, id, LEVELS[level as keyof typeof LEVELS]] as const;
    });
}

export const CATEGORIES: readonly Category[] = [
  {
    id: "animals",
    name: { en: "Animals", id: "Hewan" },
    words: w(`
      cat|kucing|e
      dog|anjing|e
      giraffe|jerapah|e
      elephant|gajah|e
      penguin|penguin|e
      snake|ular|e
      rabbit|kelinci|e
      monkey|monyet|e
      lion|singa|e
      tiger|harimau|m
      zebra|zebra|e
      kangaroo|kanguru|m
      owl|burung hantu|e
      frog|katak|e
      turtle|kura-kura|e
      horse|kuda|m
      cow|sapi|e
      pig|babi|e
      chicken|ayam|e
      duck|bebek|e
      bat|kelelawar|m
      camel|unta|m
      snail|siput|e
      spider|laba-laba|e
      butterfly|kupu-kupu|e
      bee|lebah|e
      crocodile|buaya|m
      deer|rusa|m
      goat|kambing|m
      mouse|tikus|e
      orangutan|orangutan|h
      komodo|komodo|h
      peacock|merak|m
      squirrel|tupai|m
      raccoon|rakun|m
      panda|panda|m
      koala|koala|m
      polar bear|beruang kutub|m
      bear|beruang|m
      wolf|serigala|m
      fox|rubah|m
      hippo|kuda nil|m
      rhino|badak|m
      gorilla|gorila|m
      cheetah|cheetah|h
      leopard|macan tutul|h
      sloth|kungkang|m
      hedgehog|landak mini|m
      porcupine|landak|h
      skunk|sigung|m
      otter|berang-berang|h
      ant|semut|e
      ladybug|kepik|e
      dragonfly|capung|m
      mosquito|nyamuk|m
      fly|lalat|m
      caterpillar|ulat|m
      worm|cacing|e
      grasshopper|belalang|m
      scorpion|kalajengking|m
      parrot|burung beo|m
      eagle|elang|m
      flamingo|flamingo|m
      swan|angsa|m
      ostrich|burung unta|m
      pigeon|merpati|m
      toucan|tukan|m
      hornbill|burung enggang|h
      woodpecker|burung pelatuk|h
      chameleon|bunglon|m
      lizard|kadal|m
      gecko|cicak|h
      iguana|iguana|h
      sheep|domba|m
      donkey|keledai|m
      buffalo|kerbau|h
      llama|llama|m
      puppy|anak anjing|m
      kitten|anak kucing|m
      hamster|hamster|m
      guinea pig|marmut|h
      tapir|tapir|h
      pangolin|trenggiling|h
      anteater|pemakan semut|h
      moose|rusa besar|h
      mole|tikus tanah|h
      rooster|ayam jago|m
      chick|anak ayam|m
      cobra|kobra|m
      python|ular piton|h
      firefly|kunang-kunang|m
      cricket|jangkrik|h
      cockroach|kecoak|h
      crow|gagak|m
      bird|burung|e
    `),
  },
  {
    id: "nature",
    name: { en: "Nature & weather", id: "Alam & cuaca" },
    words: w(`
      rainbow|pelangi|e
      volcano|gunung berapi|e
      mountain|gunung|e
      river|sungai|m
      waterfall|air terjun|m
      cloud|awan|e
      rain|hujan|e
      lightning|petir|e
      snow|salju|e
      tornado|tornado|e
      tree|pohon|e
      flower|bunga|e
      leaf|daun|e
      cactus|kaktus|e
      island|pulau|e
      beach|pantai|e
      desert|gurun|m
      forest|hutan|m
      cave|gua|m
      wave|ombak|e
      mushroom|jamur|e
      sunset|matahari terbenam|m
      sunrise|matahari terbit|m
      fog|kabut|h
      lake|danau|m
      rock|batu|e
      palm tree|pohon palem|e
      earthquake|gempa bumi|m
      wind|angin|m
      storm|badai|m
      hail|hujan es|m
      snowflake|kepingan salju|e
      puddle|genangan air|m
      mud|lumpur|m
      sand dune|bukit pasir|h
      cliff|tebing|m
      valley|lembah|h
      glacier|gletser|h
      iceberg|gunung es|m
      canyon|ngarai|h
      hill|bukit|m
      swamp|rawa|h
      jungle|rimba|h
      meadow|padang rumput|h
      grass|rumput|m
      bush|semak|m
      vine|tanaman merambat|m
      moss|lumut|h
      pine tree|pohon cemara|m
      oak tree|pohon ek|h
      acorn|biji ek|m
      pinecone|buah pinus|m
      sunflower|bunga matahari|e
      rose|mawar|e
      tulip|tulip|m
      lotus|teratai|m
      orchid|anggrek|h
      dandelion|dandelion|h
      seed|biji|m
      root|akar|m
      branch|ranting|m
      log|batang kayu|m
      tree stump|tunggul pohon|m
      tsunami|tsunami|h
      flood|banjir|m
      wildfire|kebakaran hutan|h
      smoke|asap|m
      geyser|geiser|h
      hot spring|mata air panas|h
      pebble|kerikil|m
      crystal|kristal|m
      dew|embun|h
      frost|embun beku|h
      avalanche|longsoran salju|h
      landslide|tanah longsor|h
      whirlpool|pusaran air|h
      sea|laut|m
      horizon|cakrawala|h
    `),
  },
  {
    id: "food",
    name: { en: "Food", id: "Makanan" },
    words: w(`
      pizza|pizza|e
      burger|burger|e
      fried rice|nasi goreng|m
      noodles|mi|m
      satay|sate|m
      egg|telur|e
      bread|roti|e
      cheese|keju|e
      sushi|sushi|m
      hot dog|hot dog|e
      french fries|kentang goreng|e
      ice cream|es krim|e
      cake|kue|e
      donut|donat|e
      sandwich|roti lapis|m
      meatball soup|bakso|m
      fried chicken|ayam goreng|m
      popcorn|berondong jagung|e
      pancake|panekuk|m
      shrimp|udang|m
      dumpling|pangsit|h
      spaghetti|spageti|m
      taco|taco|m
      burrito|burito|m
      steak|steik|m
      sausage|sosis|m
      bacon|daging asap|m
      salad|salad|m
      soup|sup|m
      rice|nasi|m
      porridge|bubur|h
      omelette|telur dadar|h
      fried egg|telur mata sapi|e
      boiled egg|telur rebus|m
      toast|roti panggang|m
      croissant|croissant|m
      bagel|bagel|m
      pie|pai|m
      cereal|sereal|m
      yogurt|yoghurt|h
      butter|mentega|h
      honey|madu|m
      jam|selai|m
      peanut butter|selai kacang|h
      ketchup|saus tomat|m
      mayonnaise|mayones|h
      soy sauce|kecap|h
      salt|garam|m
      pepper|merica|h
      sugar|gula|h
      flour|tepung|h
      chicken wings|sayap ayam|m
      drumstick|paha ayam|m
      fish and chips|ikan goreng tepung|h
      grilled fish|ikan bakar|h
      ramen|ramen|m
      kebab|kebab|m
      curry|kari|h
      lasagna|lasagna|h
      nachos|nachos|h
      meatball|bola daging|m
      fried noodles|mi goreng|h
      chicken soup|sup ayam|h
      tofu|tahu|h
      spring roll|lumpia|m
      fried banana|pisang goreng|m
      onigiri|onigiri|m
      kimchi|kimchi|h
      corn dog|corn dog|m
      lunch box|kotak bekal|m
      roast chicken|ayam panggang|m
      cheeseburger|burger keju|m
      fried fish|ikan goreng|m
      chicken nuggets|nugget ayam|m
      mashed potatoes|kentang tumbuk|h
      macaroni|makaroni|h
      dim sum|dim sum|h
    `),
  },
  {
    id: "drinks",
    name: { en: "Drinks & snacks", id: "Minuman & jajanan" },
    words: w(`
      bubble tea|boba|m
      iced tea|es teh|m
      coffee|kopi|e
      milk|susu|e
      juice|jus|m
      lemonade|limun|m
      hot chocolate|cokelat panas|m
      water bottle|botol air|e
      soda|soda|m
      smoothie|smoothie|h
      cookie|kue kering|e
      candy|permen|e
      lollipop|lolipop|e
      chocolate bar|batang cokelat|m
      chips|keripik|m
      crackers|kerupuk|m
      peanuts|kacang|m
      pudding|puding|m
      cupcake|kue mangkuk|e
      waffle|wafel|m
      muffin|muffin|m
      pretzel|pretzel|m
      marshmallow|marshmallow|m
      cotton candy|arbanat|m
      jelly|agar-agar|m
      teapot|teko|e
      straw|sedotan|e
      mug|cangkir|e
      ice cube|es batu|e
      coconut water|es kelapa|m
      milkshake|milkshake|m
      ice pop|es loli|m
      gummy bears|permen jeli|m
      chewing gum|permen karet|m
      caramel|karamel|h
      mint candy|permen mint|h
      orange juice|jus jeruk|m
      tea bag|kantong teh|m
      cappuccino|cappuccino|h
      energy drink|minuman energi|h
      cendol|cendol|h
      iced coffee|es kopi|h
      thermos|termos|h
      juice box|kotak jus|m
      soda can|kaleng soda|e
      vending machine|mesin penjual otomatis|m
      ice cream cone|es krim cone|e
      brownie|brownies|m
      macaron|makaron|h
      churros|churros|m
      candy cane|permen tongkat|e
      glass of water|segelas air|m
      sundae|sundae|m
      banana split|banana split|m
      fruit salad|salad buah|h
      milk carton|kotak susu|m
      jelly beans|permen kacang jeli|h
      rice crackers|rengginang|h
      shaved ice|es serut|h
      hot tea|teh panas|m
    `),
  },
  {
    id: "household",
    name: { en: "Household objects", id: "Barang rumah" },
    words: w(`
      umbrella|payung|e
      chair|kursi|e
      table|meja|e
      lamp|lampu|e
      door|pintu|e
      window|jendela|e
      clock|jam dinding|e
      broom|sapu|e
      bucket|ember|e
      key|kunci|e
      candle|lilin|e
      scissors|gunting|e
      fan|kipas angin|m
      sofa|sofa|e
      ladder|tangga|e
      hanger|gantungan baju|m
      curtain|gorden|m
      carpet|karpet|m
      doormat|keset|h
      doorbell|bel pintu|m
      mailbox|kotak surat|m
      vacuum cleaner|penyedot debu|m
      mop|alat pel|m
      dustpan|pengki|h
      trash can|tempat sampah|m
      washing machine|mesin cuci|m
      iron|setrika|m
      clothesline|jemuran|m
      clothespin|jepitan jemuran|m
      laundry basket|keranjang cucian|h
      bookshelf|rak buku|m
      picture frame|bingkai foto|m
      vase|vas bunga|m
      plant pot|pot tanaman|m
      air conditioner|pendingin ruangan|h
      light switch|sakelar lampu|m
      padlock|gembok|m
      keychain|gantungan kunci|m
      wallet|dompet|m
      fireplace|perapian|m
      chimney|cerobong asap|m
      roof|atap|m
      fence|pagar|m
      gate|gerbang|m
      garage|garasi|m
      balcony|balkon|h
      doorknob|gagang pintu|m
      drawer|laci|m
      shoe rack|rak sepatu|h
      tissue box|kotak tisu|m
      matches|korek api|m
      sewing machine|mesin jahit|h
      needle and thread|jarum dan benang|m
      button|kancing|m
      safety pin|peniti|m
      basket|keranjang|m
      cardboard box|kardus|m
      newspaper|koran|m
      magazine|majalah|h
      piggy bank|celengan|m
      photo album|album foto|h
      wind chime|lonceng angin|h
      rocking chair|kursi goyang|m
      stool|bangku|m
      cushion|bantal sofa|m
      mosquito net|kelambu|h
      mosquito coil|obat nyamuk bakar|h
      bug spray|semprotan serangga|h
      first aid kit|kotak p3k|m
      thermometer|termometer|m
      pendulum clock|jam bandul|m
    `),
  },
  {
    id: "tech",
    name: { en: "Tech & gadgets", id: "Teknologi & gawai" },
    words: w(`
      laptop|laptop|e
      phone|ponsel|e
      camera|kamera|e
      headphones|headphone|e
      keyboard|papan ketik|m
      computer mouse|mouse komputer|m
      television|televisi|e
      robot|robot|e
      drone|drone|m
      battery|baterai|e
      light bulb|bola lampu|e
      remote control|remote|m
      speaker|pengeras suara|m
      printer|printer|m
      game controller|stik game|m
      smartwatch|jam pintar|m
      charger|pengisi daya|m
      radio|radio|m
      flashlight|senter|e
      usb stick|flashdisk|m
      router|router|h
      tablet|tablet|m
      selfie stick|tongsis|m
      vr headset|kacamata vr|m
      plug|colokan|m
      magnet|magnet|e
      antenna|antena|m
      power bank|power bank|h
      earbuds|earphone|m
      webcam|kamera web|h
      monitor|monitor|m
      cable|kabel|m
      wifi|wifi|m
      hard drive|hard disk|h
      floppy disk|disket|m
      cassette|kaset|m
      video game|gim video|m
      arcade machine|mesin arkade|h
      joystick|joystik|m
      scanner|pemindai|h
      projector|proyektor|h
      solar panel|panel surya|m
      wind turbine|turbin angin|m
      circuit board|papan sirkuit|h
      microchip|cip|h
      3d printer|printer 3d|h
      qr code|kode qr|h
      barcode|kode batang|h
      selfie|swafoto|m
      video call|panggilan video|h
      robot vacuum|robot penyedot debu|h
      walkie-talkie|walkie-talkie|m
      telephone|telepon rumah|m
      typewriter|mesin tik|m
      satellite dish|parabola|m
      cctv camera|kamera cctv|h
      atm machine|mesin atm|m
      email|surel|m
      smart speaker|speaker pintar|h
      electric scooter|skuter listrik|m
      gaming chair|kursi gaming|m
    `),
  },
  {
    id: "places",
    name: { en: "Places & buildings", id: "Tempat & bangunan" },
    words: w(`
      hospital|rumah sakit|m
      school|sekolah|m
      house|rumah|e
      castle|istana|e
      lighthouse|mercusuar|m
      bridge|jembatan|e
      airport|bandara|m
      mosque|masjid|m
      church|gereja|m
      temple|kuil|m
      library|perpustakaan|h
      museum|museum|h
      zoo|kebun binatang|m
      market|pasar|m
      stadium|stadion|m
      skyscraper|gedung pencakar langit|m
      playground|taman bermain|m
      cinema|bioskop|m
      prison|penjara|m
      tower|menara|e
      windmill|kincir angin|e
      swimming pool|kolam renang|m
      train station|stasiun|m
      gas station|pom bensin|m
      treehouse|rumah pohon|e
      bakery|toko roti|m
      supermarket|supermarket|m
      mall|mal|h
      restaurant|restoran|m
      hotel|hotel|m
      police station|kantor polisi|m
      fire station|pos pemadam kebakaran|m
      post office|kantor pos|h
      bank|bank|h
      pharmacy|apotek|h
      office|kantor|h
      factory|pabrik|h
      apartment|apartemen|h
      hut|gubuk|m
      parking lot|tempat parkir|h
      bus stop|halte bus|m
      crosswalk|zebra cross|m
      traffic light|lampu lalu lintas|m
      street|jalan|m
      roundabout|bundaran|h
      tunnel|terowongan|m
      park|taman|m
      fountain|air mancur|m
      statue|patung|m
      aquarium|akuarium|h
      amusement park|taman hiburan|m
      theater|teater|h
      gym|pusat kebugaran|h
      hair salon|salon|h
      car wash|cuci mobil|m
      harbor|pelabuhan|m
      dam|bendungan|h
      well|sumur|m
      observatory|observatorium|h
      university|universitas|h
      kindergarten|taman kanak-kanak|h
      classroom|ruang kelas|m
      elevator|lift|m
      escalator|eskalator|m
      ticket booth|loket tiket|h
      toll gate|gerbang tol|h
      highway|jalan tol|h
      city|kota|m
      village|desa|m
      palace|keraton|h
      stairs|anak tangga|m
      basement|ruang bawah tanah|h
      rooftop|atap gedung|h
    `),
  },
  {
    id: "vehicles",
    name: { en: "Vehicles", id: "Kendaraan" },
    words: w(`
      car|mobil|e
      bus|bus|e
      bicycle|sepeda|e
      motorcycle|sepeda motor|m
      train|kereta|e
      airplane|pesawat|e
      helicopter|helikopter|e
      boat|perahu|e
      ship|kapal|e
      submarine|kapal selam|m
      truck|truk|e
      ambulance|ambulans|m
      fire truck|mobil pemadam|m
      police car|mobil polisi|m
      taxi|taksi|m
      scooter|skuter|m
      skateboard|papan luncur|m
      tractor|traktor|m
      hot air balloon|balon udara|e
      pedicab|becak|m
      horse cart|delman|h
      canoe|kano|m
      tank|tank|m
      excavator|ekskavator|m
      cable car|kereta gantung|m
      sailboat|perahu layar|e
      parachute|parasut|m
      wheelchair|kursi roda|m
      minivan|angkot|h
      electric car|mobil listrik|h
      race car|mobil balap|m
      jeep|jip|m
      limousine|limusin|h
      pickup truck|mobil bak terbuka|h
      garbage truck|truk sampah|m
      cement mixer|truk molen|h
      bulldozer|buldoser|m
      tow truck|mobil derek|m
      forklift|forklift|h
      steamroller|mesin gilas|h
      motorboat|perahu motor|m
      jet ski|jet ski|m
      cruise ship|kapal pesiar|m
      ferry|kapal feri|m
      raft|rakit|m
      kayak|kayak|m
      gondola|gondola|h
      rowboat|perahu dayung|m
      jet|jet|m
      fighter jet|jet tempur|m
      airship|kapal udara|h
      monorail|monorel|m
      subway|kereta bawah tanah|h
      high-speed train|kereta cepat|h
      steam train|kereta uap|m
      tram|trem|h
      double-decker bus|bus tingkat|m
      school bus|bus sekolah|m
      unicycle|sepeda roda satu|m
      tandem bike|sepeda tandem|h
      tricycle|sepeda roda tiga|m
      roller skates|sepatu roda|m
      sled|kereta luncur|m
      bajaj|bajaj|h
      golf cart|mobil golf|h
      camper van|mobil karavan|m
      delivery van|mobil boks|h
      seaplane|pesawat amfibi|h
      crane truck|truk crane|m
    `),
  },
  {
    id: "jobs",
    name: { en: "Jobs", id: "Pekerjaan" },
    words: w(`
      doctor|dokter|m
      nurse|perawat|m
      teacher|guru|m
      firefighter|pemadam kebakaran|e
      police officer|polisi|e
      chef|koki|e
      farmer|petani|m
      pilot|pilot|e
      astronaut|astronaut|e
      artist|seniman|m
      singer|penyanyi|m
      dentist|dokter gigi|m
      builder|tukang bangunan|m
      fisherman|nelayan|m
      mail carrier|tukang pos|m
      scientist|ilmuwan|m
      photographer|fotografer|m
      barber|tukang cukur|m
      mechanic|montir|m
      judge|hakim|m
      soldier|tentara|m
      detective|detektif|m
      programmer|programmer|h
      waiter|pelayan|m
      lifeguard|penjaga pantai|m
      street vendor|pedagang kaki lima|h
      vet|dokter hewan|h
      pharmacist|apoteker|h
      lawyer|pengacara|h
      plumber|tukang ledeng|m
      electrician|tukang listrik|h
      carpenter|tukang kayu|h
      house painter|tukang cat|m
      tailor|penjahit|h
      baker|tukang roti|m
      butcher|tukang daging|h
      cashier|kasir|h
      security guard|satpam|m
      driver|sopir|m
      flight attendant|pramugari|h
      sailor|pelaut|m
      referee|wasit|m
      coach|pelatih|h
      dancer|penari|m
      actor|aktor|h
      film director|sutradara|h
      news anchor|pembaca berita|h
      reporter|wartawan|h
      writer|penulis|h
      librarian|pustakawan|h
      gardener|tukang kebun|m
      cleaner|petugas kebersihan|h
      zookeeper|penjaga kebun binatang|m
      beekeeper|peternak lebah|m
      florist|penjual bunga|h
      architect|arsitek|h
      surgeon|ahli bedah|m
      miner|penambang|m
      lumberjack|penebang pohon|m
      cowboy|koboi|e
      youtuber|youtuber|m
      delivery rider|kurir|m
      babysitter|pengasuh anak|h
      hairdresser|penata rambut|m
      makeup artist|perias|h
      model|model|h
      tour guide|pemandu wisata|h
      parking attendant|tukang parkir|h
      blacksmith|pandai besi|m
      shepherd|penggembala|m
      window cleaner|pembersih kaca gedung|m
      painter|pelukis|m
    `),
  },
  {
    id: "sports",
    name: { en: "Sports", id: "Olahraga" },
    words: w(`
      football|sepak bola|e
      basketball|bola basket|e
      badminton|bulu tangkis|m
      tennis|tenis|e
      volleyball|bola voli|m
      swimming|renang|e
      boxing|tinju|m
      golf|golf|m
      surfing|selancar|m
      skiing|ski|m
      bowling|boling|e
      baseball|bisbol|m
      archery|panahan|m
      karate|karate|m
      cycling|bersepeda|m
      running|lari|m
      table tennis|tenis meja|m
      sepak takraw|sepak takraw|h
      diving|menyelam|m
      fishing|memancing|m
      rock climbing|panjat tebing|m
      horse riding|berkuda|m
      chess|catur|m
      gymnastics|senam|h
      weightlifting|angkat besi|m
      trophy|piala|e
      medal|medali|e
      whistle|peluit|e
      goal|gawang|m
      ice skating|seluncur es|m
      rugby|rugbi|h
      hockey|hoki|m
      judo|judo|h
      taekwondo|taekwondo|h
      pencak silat|pencak silat|h
      wrestling|gulat|h
      fencing|anggar|h
      sumo|sumo|m
      yoga|yoga|m
      marathon|maraton|h
      high jump|lompat tinggi|m
      long jump|lompat jauh|h
      pole vault|lompat galah|h
      hurdles|lari gawang|h
      javelin|lempar lembing|h
      shot put|tolak peluru|h
      relay race|lari estafet|h
      rowing|dayung|h
      water polo|polo air|h
      snorkeling|snorkeling|m
      snowboarding|seluncur salju|h
      bungee jumping|bungee jumping|h
      skydiving|terjun payung|m
      paragliding|paralayang|h
      darts|dart|m
      billiards|biliar|m
      sit-ups|sit-up|h
      push-ups|push-up|m
      dumbbell|dumbel|m
      treadmill|treadmill|m
      boxing gloves|sarung tinju|m
      racket|raket|m
      shuttlecock|kok|m
      baseball bat|tongkat bisbol|m
      golf club|stik golf|m
      scoreboard|papan skor|m
      finish line|garis finis|m
      podium|podium|m
      stopwatch|stopwatch|m
      jersey|jersey|m
      penalty kick|tendangan penalti|h
      slam dunk|slam dunk|h
      cheerleader|pemandu sorak|h
    `),
  },
  {
    id: "actions",
    name: { en: "Actions", id: "Kegiatan" },
    words: w(`
      sleeping|tidur|e
      eating|makan|e
      dancing|menari|m
      crying|menangis|e
      laughing|tertawa|m
      jumping|melompat|e
      singing|bernyanyi|m
      reading|membaca|e
      writing|menulis|m
      cooking|memasak|m
      painting|melukis|m
      sneezing|bersin|m
      yawning|menguap|m
      flying|terbang|m
      climbing|memanjat|m
      waving|melambai|e
      thinking|berpikir|m
      shouting|berteriak|m
      sweeping|menyapu|m
      praying|berdoa|m
      shopping|belanja|m
      clapping|bertepuk tangan|m
      kicking|menendang|m
      whistling|bersiul|h
      sweating|berkeringat|m
      falling|jatuh|m
      walking|berjalan|m
      crawling|merangkak|m
      sitting|duduk|e
      kneeling|berlutut|m
      stretching|peregangan|h
      brushing teeth|menyikat gigi|m
      washing hands|mencuci tangan|h
      taking a shower|mandi|m
      combing hair|menyisir rambut|m
      drinking|minum|e
      chewing|mengunyah|h
      licking|menjilat|h
      blowing bubbles|meniup gelembung|m
      blowing out candles|meniup lilin|m
      sniffing|mengendus|h
      coughing|batuk|h
      hiccups|cegukan|h
      snoring|mendengkur|m
      dreaming|bermimpi|h
      waking up|bangun tidur|h
      texting|mengirim pesan|m
      taking a selfie|berswafoto|m
      calling on the phone|menelepon|m
      typing|mengetik|m
      drawing|menggambar|m
      knitting|merajut|h
      sewing|menjahit|h
      gardening|berkebun|h
      watering plants|menyiram tanaman|m
      digging|menggali|m
      hammering|memalu|m
      sawing|menggergaji|m
      tiptoeing|berjinjit|h
      sliding|meluncur|m
      spinning|berputar|h
      rolling|berguling|h
      slipping|terpeleset|h
      tripping|tersandung|h
      hiding|bersembunyi|m
      peeking|mengintip|m
      pointing|menunjuk|m
      carrying|membawa|h
      pushing|mendorong|m
      pulling|menarik|h
      lifting|mengangkat|m
      throwing|melempar|m
      catching|menangkap|m
      driving|menyetir|m
      listening to music|mendengarkan musik|m
      studying|belajar|h
      counting|menghitung|h
      measuring|mengukur|h
      ironing|menyetrika|m
      folding clothes|melipat baju|h
      washing dishes|mencuci piring|m
      mopping|mengepel|m
      vacuuming|menyedot debu|h
      cutting|memotong|m
      peeling|mengupas|h
      stirring|mengaduk|h
      pouring|menuang|m
      frying|menggoreng|m
      baking|memanggang|h
      tasting|mencicipi|h
    `),
  },
  {
    id: "body",
    name: { en: "Body & clothing", id: "Tubuh & pakaian" },
    words: w(`
      eye|mata|e
      nose|hidung|e
      mouth|mulut|e
      ear|telinga|e
      hand|tangan|e
      foot|kaki|e
      tooth|gigi|e
      hair|rambut|e
      heart|jantung|e
      skeleton|kerangka|m
      hat|topi|e
      glasses|kacamata|e
      shirt|kemeja|m
      dress|gaun|e
      pants|celana|m
      sneakers|sepatu|m
      sandals|sandal|m
      sock|kaus kaki|e
      scarf|syal|m
      glove|sarung tangan|m
      tie|dasi|e
      watch|jam tangan|m
      ring|cincin|e
      crown|mahkota|e
      mustache|kumis|m
      beard|jenggot|m
      sarong|sarung|h
      helmet|helm|m
      raincoat|jas hujan|m
      finger|jari|m
      thumb|jempol|m
      elbow|siku|h
      knee|lutut|h
      shoulder|bahu|h
      neck|leher|h
      tongue|lidah|m
      lips|bibir|m
      eyebrow|alis|m
      eyelashes|bulu mata|h
      cheek|pipi|h
      chin|dagu|h
      forehead|dahi|h
      belly button|pusar|m
      belly|perut|h
      back|punggung|h
      leg|tungkai|m
      arm|lengan|m
      fist|kepalan tangan|m
      toe|jari kaki|m
      fingernail|kuku|h
      brain|otak|m
      lungs|paru-paru|h
      bone|tulang|m
      muscle|otot|m
      footprint|jejak kaki|m
      fingerprint|sidik jari|h
      braces|kawat gigi|h
      t-shirt|kaus|e
      jacket|jaket|m
      hoodie|hoodie|m
      sweater|sweter|m
      skirt|rok|m
      shorts|celana pendek|m
      jeans|jeans|m
      belt|ikat pinggang|m
      boots|sepatu bot|m
      high heels|sepatu hak tinggi|m
      flip-flops|sandal jepit|m
      baseball cap|topi bisbol|m
      beanie|kupluk|h
      hijab|hijab|h
      bow tie|dasi kupu-kupu|m
      suit|jas|h
      uniform|seragam|h
      swimsuit|baju renang|m
      earrings|anting|m
      necklace|kalung|m
      bracelet|gelang|h
      sunglasses|kacamata hitam|m
      handbag|tas tangan|m
      zipper|ritsleting|m
      pocket|saku|h
      wig|rambut palsu|h
      tattoo|tato|m
    `),
  },
  {
    id: "music",
    name: { en: "Music & instruments", id: "Musik & alat musik" },
    words: w(`
      guitar|gitar|e
      piano|piano|e
      drum|drum|e
      violin|biola|m
      trumpet|terompet|e
      flute|seruling|m
      saxophone|saksofon|m
      harp|harpa|m
      microphone|mikrofon|e
      music note|not balok|e
      concert|konser|m
      band|band|m
      choir|paduan suara|h
      conductor|dirigen|h
      accordion|akordeon|m
      tambourine|rebana|m
      xylophone|gambang|m
      harmonica|harmonika|m
      ukulele|ukulele|m
      bell|lonceng|e
      dj|dj|m
      karaoke|karaoke|m
      record player|pemutar piringan hitam|m
      metronome|metronom|h
      cello|selo|m
      triangle|triangel|m
      electric guitar|gitar listrik|m
      bass guitar|gitar bas|h
      drumsticks|stik drum|m
      organ|organ|h
      trombone|trombon|h
      tuba|tuba|h
      clarinet|klarinet|h
      bagpipes|bagpipe|h
      banjo|banjo|h
      maracas|marakas|m
      cymbals|simbal|m
      gong|gong|m
      bongo|bongo|h
      recorder|rekorder|h
      double bass|kontrabas|h
      music box|kotak musik|m
      jukebox|jukebox|m
      vinyl record|piringan hitam|m
      stage|panggung|m
      spotlight|lampu sorot|m
      sheet music|partitur|h
      treble clef|kunci g|m
      rock star|bintang rock|m
      opera singer|penyanyi opera|h
      rapper|rapper|m
      amplifier|ampli|h
      guitar pick|pick gitar|h
      tuning fork|garpu tala|h
      music festival|festival musik|h
      marching band|drum band|h
      orchestra|orkestra|h
      disco ball|bola disko|m
      grand piano|piano besar|m
      street musician|pengamen|h
      music video|video musik|h
    `),
  },
  {
    id: "school",
    name: { en: "School & office", id: "Sekolah & kantor" },
    words: w(`
      pencil|pensil|e
      eraser|penghapus|m
      ruler|penggaris|e
      book|buku|e
      notebook|buku tulis|m
      backpack|tas sekolah|e
      blackboard|papan tulis|m
      chalk|kapur|m
      glue|lem|m
      stapler|stapler|m
      paper clip|penjepit kertas|m
      globe|globe|e
      map|peta|m
      calculator|kalkulator|m
      microscope|mikroskop|m
      desk|meja belajar|m
      envelope|amplop|m
      calendar|kalender|m
      folder|map|h
      pen|pulpen|e
      crayon|krayon|e
      paintbrush|kuas|m
      diploma|ijazah|h
      homework|pekerjaan rumah|h
      school bell|bel sekolah|m
      exam|ujian|h
      sharpener|rautan|m
      highlighter|stabilo|h
      computer|komputer|m
      pencil case|kotak pensil|m
      protractor|busur derajat|h
      drawing compass|jangka|h
      test tube|tabung reaksi|m
      magnifying glass|kaca pembesar|m
      whiteboard|papan putih|m
      marker|spidol|m
      sticky note|kertas tempel|m
      tape|selotip|m
      hole punch|pelubang kertas|h
      clipboard|papan klip|m
      filing cabinet|lemari arsip|h
      office chair|kursi kantor|h
      briefcase|tas kerja|h
      name tag|tanda pengenal|h
      rubber stamp|stempel|h
      report card|rapor|h
      graduation cap|topi wisuda|m
      locker|loker|m
      flag ceremony|upacara bendera|h
      abacus|sempoa|h
      dictionary|kamus|h
      paper airplane|pesawat kertas|m
      meeting|rapat|h
      presentation|presentasi|h
      shredder|penghancur kertas|h
      photocopier|mesin fotokopi|h
      desk lamp|lampu meja|m
      student|murid|m
      lab coat|jas lab|h
      school uniform|seragam sekolah|h
      sketchbook|buku sketsa|h
      ink bottle|botol tinta|h
    `),
  },
  {
    id: "fantasy",
    name: { en: "Fantasy", id: "Fantasi" },
    words: w(`
      dragon|naga|e
      unicorn|unicorn|e
      wizard|penyihir|m
      mermaid|putri duyung|m
      fairy|peri|m
      giant|raksasa|m
      magic wand|tongkat sihir|e
      crystal ball|bola kristal|m
      potion|ramuan|m
      sword|pedang|e
      shield|perisai|e
      knight|kesatria|m
      princess|putri|m
      monster|monster|m
      phoenix|burung api|h
      troll|troll|m
      genie|jin|m
      flying carpet|karpet terbang|m
      king|raja|m
      queen|ratu|m
      prince|pangeran|m
      throne|takhta|m
      dwarf|kurcaci|h
      elf|elf|h
      centaur|centaur|h
      pegasus|pegasus|m
      griffin|griffin|h
      cyclops|cyclops|h
      minotaur|minotaur|h
      goblin|goblin|h
      spell book|buku mantra|m
      magic mirror|cermin ajaib|m
      enchanted forest|hutan ajaib|h
      magic beanstalk|pohon kacang ajaib|m
      glass slipper|sepatu kaca|m
      pumpkin carriage|kereta labu|h
      frog prince|pangeran kodok|m
      magic lamp|lampu ajaib|m
      dragon egg|telur naga|m
      wishing well|sumur permohonan|m
      tooth fairy|peri gigi|m
      talking tree|pohon bicara|h
      golden goose|angsa emas|h
      portal|portal|h
      time machine|mesin waktu|m
      invisibility cloak|jubah tak terlihat|h
      yeti|yeti|m
      angel|malaikat|m
      cupid|cupid|m
      spell|mantra|h
      fairy wings|sayap peri|m
      suit of armor|baju zirah|m
      drawbridge|jembatan angkat|m
      moat|parit kastil|h
      gingerbread house|rumah permen|m
      golden egg|telur emas|m
      magic key|kunci ajaib|h
      fortune teller|peramal|h
      wizard tower|menara penyihir|h
      sea serpent|ular laut raksasa|h
      castle dungeon|penjara bawah tanah|h
    `),
  },
  {
    id: "space",
    name: { en: "Space", id: "Luar angkasa" },
    words: w(`
      rocket|roket|e
      planet|planet|e
      star|bintang|e
      moon|bulan|e
      sun|matahari|e
      alien|alien|e
      ufo|piring terbang|e
      comet|komet|m
      meteor|meteor|m
      black hole|lubang hitam|m
      galaxy|galaksi|h
      satellite|satelit|m
      telescope|teleskop|m
      space station|stasiun luar angkasa|m
      saturn|saturnus|m
      earth|bumi|m
      mars|mars|h
      crater|kawah|m
      spacesuit|baju astronaut|m
      constellation|rasi bintang|h
      eclipse|gerhana|m
      shooting star|bintang jatuh|m
      asteroid|asteroid|m
      moon landing|pendaratan di bulan|h
      jupiter|jupiter|h
      venus|venus|h
      mercury|merkurius|h
      neptune|neptunus|h
      uranus|uranus|h
      pluto|pluto|h
      space shuttle|pesawat ulang-alik|m
      mars rover|kendaraan penjelajah mars|m
      launch pad|landasan peluncuran|m
      countdown|hitung mundur|h
      zero gravity|tanpa gravitasi|h
      space helmet|helm astronaut|m
      oxygen tank|tabung oksigen|h
      orbit|orbit|h
      solar system|tata surya|h
      milky way|bima sakti|h
      nebula|nebula|h
      supernova|supernova|h
      crescent moon|bulan sabit|m
      full moon|bulan purnama|m
      flag on the moon|bendera di bulan|m
      big dipper|bintang biduk|h
      northern lights|aurora|h
      meteor shower|hujan meteor|h
      spacewalk|berjalan di luar angkasa|h
      mission control|pusat kendali misi|h
      space probe|wahana antariksa|h
      space capsule|kapsul luar angkasa|h
      alien abduction|penculikan alien|h
      jetpack|jetpack|m
      stargazing|mengamati bintang|h
      planetarium|planetarium|h
      space food|makanan astronaut|h
      robot arm|lengan robot|m
    `),
  },
  {
    id: "holidays",
    name: { en: "Holidays & celebrations", id: "Hari raya & perayaan" },
    words: w(`
      birthday cake|kue ulang tahun|e
      balloon|balon|e
      gift|kado|e
      fireworks|kembang api|m
      party hat|topi pesta|e
      christmas tree|pohon natal|e
      snowman|manusia salju|e
      ketupat|ketupat|m
      lantern|lentera|m
      firecracker|petasan|m
      wedding|pernikahan|m
      confetti|konfeti|m
      costume|kostum|m
      mask|topeng|m
      parade|pawai|m
      flag|bendera|e
      easter egg|telur paskah|m
      red envelope|angpao|m
      dragon dance|barongsai|m
      sack race|balap karung|m
      cracker eating contest|lomba makan kerupuk|h
      greeting card|kartu ucapan|m
      piñata|pinata|m
      santa claus|sinterklas|m
      reindeer|rusa kutub|m
      sleigh|kereta salju|m
      christmas stocking|kaus kaki natal|m
      gingerbread man|kue jahe|m
      christmas wreath|karangan bunga natal|m
      christmas ornament|hiasan natal|m
      christmas lights|lampu natal|m
      new year|tahun baru|h
      party horn|terompet tahun baru|m
      graduation|wisuda|h
      valentine|valentine|h
      love letter|surat cinta|m
      bouquet|buket bunga|m
      bride|pengantin wanita|m
      groom|pengantin pria|m
      wedding cake|kue pengantin|m
      eid|lebaran|h
      homecoming trip|mudik|h
      breaking the fast|buka puasa|h
      chinese new year|imlek|h
      mooncake|kue bulan|m
      independence day|hari kemerdekaan|h
      tug of war|tarik tambang|m
      marble spoon race|lomba kelereng|h
      roast turkey|kalkun panggang|h
      picnic|piknik|m
      birthday party|pesta ulang tahun|m
      surprise party|pesta kejutan|h
      barbecue|barbeku|m
      sparkler|kembang api lidi|m
      wrapping paper|kertas kado|h
      party invitation|undangan pesta|h
      hampers|parsel|h
    `),
  },
  {
    id: "toys",
    name: { en: "Toys & games", id: "Mainan & permainan" },
    words: w(`
      kite|layang-layang|e
      yo-yo|yoyo|e
      teddy bear|boneka beruang|e
      doll|boneka|m
      ball|bola|e
      jigsaw puzzle|puzzle|m
      dice|dadu|e
      playing cards|kartu remi|m
      marbles|kelereng|m
      spinning top|gasing|m
      toy car|mobil-mobilan|e
      swing|ayunan|e
      slide|perosotan|e
      seesaw|jungkat-jungkit|m
      jump rope|lompat tali|m
      building blocks|balok mainan|m
      water gun|pistol air|m
      rubber duck|bebek karet|e
      hula hoop|simpai|m
      robot toy|robot mainan|m
      board game|permainan papan|m
      hide and seek|petak umpet|h
      rocking horse|kuda goyang|m
      bubble wand|gelembung sabun|m
      trampoline|trampolin|m
      rubik cube|kubus rubik|m
      action figure|figur aksi|h
      hand puppet|boneka tangan|m
      toy train|kereta mainan|m
      toy soldier|tentara mainan|m
      jack in the box|kotak kejutan|m
      slinky|per mainan|h
      kaleidoscope|kaleidoskop|h
      sandbox|bak pasir|m
      sandcastle|istana pasir|m
      frisbee|frisbee|m
      boomerang|bumerang|m
      slingshot|ketapel|m
      dollhouse|rumah boneka|m
      remote control car|mobil remote|m
      pinwheel|kincir kertas|m
      play dough|lilin mainan|h
      coloring book|buku mewarnai|m
      sticker|stiker|m
      tic-tac-toe|tic-tac-toe|m
      hopscotch|engklek|h
      playing tag|main kejar-kejaran|h
      musical chairs|rebutan kursi|h
      dominoes|domino|m
      checkers|dam|h
      snakes and ladders|ular tangga|m
      pogo stick|tongkat pogo|m
      stilts|egrang|m
      water balloon|balon air|m
      claw machine|mesin capit|m
      toy box|kotak mainan|m
      paper boat|perahu kertas|m
      origami|origami|m
      fidget spinner|fidget spinner|m
      toy drum|drum mainan|m
    `),
  },
  {
    id: "ocean",
    name: { en: "Ocean life", id: "Kehidupan laut" },
    words: w(`
      octopus|gurita|e
      shark|hiu|e
      whale|paus|e
      dolphin|lumba-lumba|e
      jellyfish|ubur-ubur|e
      starfish|bintang laut|e
      crab|kepiting|e
      seahorse|kuda laut|m
      clownfish|ikan badut|m
      sea turtle|penyu|m
      coral|terumbu karang|m
      seaweed|rumput laut|m
      seashell|kerang|e
      lobster|lobster|m
      squid|cumi-cumi|m
      stingray|ikan pari|m
      pufferfish|ikan buntal|m
      scuba diver|penyelam|m
      pearl|mutiara|m
      seal|anjing laut|m
      sea urchin|bulu babi|h
      swordfish|ikan todak|m
      walrus|walrus|m
      sea lion|singa laut|h
      orca|paus pembunuh|m
      manta ray|pari manta|h
      eel|belut|m
      hermit crab|kelomang|m
      giant clam|kima|h
      oyster|tiram|h
      sea cucumber|teripang|h
      sea anemone|anemon laut|h
      narwhal|narwhal|m
      hammerhead shark|hiu martil|m
      whale shark|hiu paus|h
      flying fish|ikan terbang|h
      tuna|tuna|h
      salmon|salmon|h
      sardine|sardin|h
      goldfish|ikan mas koki|m
      fishing net|jaring ikan|m
      fishing boat|kapal nelayan|m
      buoy|pelampung|m
      life jacket|jaket pelampung|m
      snorkel|snorkel|m
      diving mask|masker selam|m
      flippers|kaki katak|m
      seagull|burung camar|m
      pelican|pelikan|m
      surfboard|papan selancar|m
      barracuda|barakuda|h
      school of fish|kawanan ikan|m
      beluga|beluga|h
      dugong|duyung|h
      sea snake|ular laut|h
      blue whale|paus biru|m
    `),
  },
  {
    id: "indonesia",
    name: { en: "Indonesian culture", id: "Budaya Indonesia" },
    words: w(`
      batik|batik|m
      shadow puppet|wayang|m
      kris|keris|m
      rice field|sawah|m
      tempeh|tempe|m
      garuda|garuda|m
      peci|peci|m
      kebaya|kebaya|m
      reog|reog|h
      rendang|rendang|m
      coconut tree|pohon kelapa|e
      traditional house|rumah adat|m
      boat race|pacu jalur|m
      climbing pole contest|panjat pinang|m
      sambal|sambal|m
      bamboo|bambu|e
      mortar and pestle|cobek|m
      coffee shop|warung kopi|m
      motorbike taxi|ojek|m
      angklung|angklung|m
      gamelan|gamelan|m
      kendang|kendang|m
      sasando|sasando|h
      gado-gado|gado-gado|h
      soto|soto|h
      martabak|martabak|m
      padang rice|nasi padang|h
      tumpeng|tumpeng|m
      klepon|klepon|h
      jamu|jamu|h
      corpse flower|bunga bangkai|h
      jasmine|melati|m
      songket|songket|h
      blangkon|blangkon|h
      ulos|ulos|h
      kecak dance|tari kecak|h
      saman dance|tari saman|h
      barong|barong|h
      ondel-ondel|ondel-ondel|m
      kuda lumping|kuda lumping|h
      congklak|congklak|h
      night market|pasar malam|m
      satay cart|gerobak sate|m
      bedug|bedug|m
      kentongan|kentongan|h
      lontong|lontong|h
      pempek|pempek|h
      rujak|rujak|h
      siomay|siomay|h
      kerak telor|kerak telor|h
      onde-onde|onde-onde|h
      traditional market|pasar tradisional|h
      batik pen|canting|h
      bamboo cannon|meriam bambu|h
      torch parade|pawai obor|m
      chicken noodles|mie ayam|m
      layered cake|kue lapis|h
      serabi|serabi|h
      ginger drink|wedang jahe|h
      es teler|es teler|h
      wayang golek|wayang golek|h
      becak driver|tukang becak|m
    `),
  },
  {
    id: "fruitveg",
    name: { en: "Fruits & vegetables", id: "Buah & sayur" },
    words: w(`
      banana|pisang|e
      apple|apel|e
      watermelon|semangka|e
      pineapple|nanas|e
      durian|durian|m
      mango|mangga|m
      grapes|anggur|e
      carrot|wortel|e
      corn|jagung|e
      chili|cabai|m
      tomato|tomat|e
      avocado|alpukat|m
      strawberry|stroberi|e
      coconut|kelapa|e
      orange|jeruk|e
      lemon|lemon|e
      lime|jeruk nipis|m
      cherry|ceri|e
      peach|persik|m
      pear|pir|e
      plum|plum|h
      kiwi|kiwi|m
      papaya|pepaya|m
      guava|jambu biji|h
      rambutan|rambutan|m
      mangosteen|manggis|m
      snake fruit|salak|m
      jackfruit|nangka|m
      dragon fruit|buah naga|m
      starfruit|belimbing|m
      blueberry|bluberi|m
      raspberry|raspberi|m
      pomegranate|delima|m
      melon|melon|m
      dates|kurma|h
      lychee|leci|h
      longan|kelengkeng|h
      passion fruit|markisa|h
      soursop|sirsak|h
      potato|kentang|m
      sweet potato|ubi|m
      cassava|singkong|h
      onion|bawang bombai|m
      garlic|bawang putih|m
      shallot|bawang merah|h
      cabbage|kubis|m
      lettuce|selada|m
      broccoli|brokoli|m
      cauliflower|kembang kol|m
      spinach|bayam|h
      cucumber|mentimun|m
      eggplant|terong|m
      pumpkin|labu|m
      peas|kacang polong|m
      green beans|buncis|m
      bean sprouts|tauge|h
      ginger|jahe|h
      celery|seledri|h
      radish|lobak|h
      beetroot|bit|h
      bell pepper|paprika|m
      asparagus|asparagus|h
      zucchini|zukini|h
      spring onion|daun bawang|m
      olive|zaitun|m
      almond|almon|m
      walnut|kenari|m
      okra|okra|h
      bitter melon|pare|h
      water spinach|kangkung|h
      long beans|kacang panjang|m
      fruit basket|keranjang buah|m
      banana peel|kulit pisang|m
      pickle|acar|h
      sugarcane|tebu|m
      tamarind|asam jawa|h
      lemongrass|serai|h
      chestnut|kastanye|h
      apricot|aprikot|h
      grapefruit|jeruk bali|h
      cranberry|kranberi|h
    `),
  },
  {
    id: "kitchen",
    name: { en: "Kitchen & cooking", id: "Dapur & memasak" },
    words: w(`
      frying pan|wajan|m
      stove|kompor|m
      spoon|sendok|e
      fork|garpu|e
      plate|piring|e
      refrigerator|kulkas|m
      knife|pisau|e
      chopsticks|sumpit|m
      bowl|mangkuk|e
      drinking glass|gelas|m
      cooking pot|panci|m
      kettle|ketel|m
      rice cooker|penanak nasi|m
      oven|oven|m
      microwave|microwave|m
      toaster|pemanggang roti|m
      blender|blender|m
      mixer|mixer|h
      whisk|pengocok telur|m
      rolling pin|penggiling adonan|m
      spatula|spatula|m
      ladle|sendok sayur|m
      cutting board|talenan|m
      grater|parutan|h
      peeler|pengupas|h
      can opener|pembuka kaleng|h
      bottle opener|pembuka botol|h
      colander|saringan|h
      measuring cup|gelas ukur|h
      kitchen scale|timbangan dapur|h
      oven mitt|sarung tangan oven|m
      apron|celemek|m
      chef hat|topi koki|e
      kitchen sink|bak cuci piring|m
      dish rack|rak piring|h
      dish soap|sabun cuci piring|h
      sponge|spons|m
      cupboard|lemari dapur|m
      freezer|lemari pembeku|h
      dishwasher|mesin cuci piring|h
      salt shaker|tempat garam|m
      jar|toples|m
      pot lid|tutup panci|m
      steamer|kukusan|h
      barbecue grill|panggangan|m
      skewer|tusuk sate|m
      tongs|penjepit makanan|h
      kitchen timer|pengatur waktu dapur|h
      recipe book|buku resep|m
      ice cube tray|cetakan es|h
      cooking oil|minyak goreng|h
      dough|adonan|m
      cake pan|cetakan kue|h
      cookie cutter|cetakan kue kering|m
      pressure cooker|panci presto|h
      napkin|serbet|h
      tablecloth|taplak meja|h
      tray|nampan|m
      jug|kendi|h
      gas canister|tabung gas|h
      wooden spoon|sendok kayu|m
      teacup|cangkir teh|m
      saucepan|panci kecil|h
      food cover|tudung saji|h
    `),
  },
  {
    id: "tools",
    name: { en: "Tools & DIY", id: "Perkakas & pertukangan" },
    words: w(`
      hammer|palu|e
      screw|sekrup|m
      screwdriver|obeng|m
      wrench|kunci inggris|m
      pliers|tang|m
      saw|gergaji|e
      drill|bor|m
      tape measure|meteran|m
      toolbox|kotak perkakas|m
      paint roller|rol cat|m
      paint can|kaleng cat|m
      shovel|sekop|e
      axe|kapak|e
      pickaxe|beliung|m
      chisel|pahat|h
      sandpaper|amplas|h
      glue gun|lem tembak|h
      duct tape|lakban|h
      rope|tali|e
      chain|rantai|m
      nut and bolt|mur dan baut|m
      workbench|meja kerja|h
      safety goggles|kacamata pelindung|m
      hard hat|helm proyek|m
      wheelbarrow|gerobak dorong|m
      crowbar|linggis|h
      sledgehammer|palu godam|m
      mallet|palu kayu|m
      clamp|penjepit|h
      tool belt|sabuk perkakas|h
      cement|semen|h
      brick|batu bata|e
      trowel|sendok semen|h
      funnel|corong|m
      oil can|kaleng oli|h
      car jack|dongkrak|h
      tire|ban|e
      air pump|pompa|m
      welding mask|topeng las|h
      chainsaw|gergaji mesin|m
      pocket knife|pisau lipat|m
      zip tie|kabel tis|h
      spirit level|waterpass|h
      wooden plank|papan kayu|h
      sawdust|serbuk gergaji|h
      allen key|kunci l|h
      scaffolding|perancah|h
      spray paint|cat semprot|m
      blueprint|cetak biru|h
      birdhouse|rumah burung|m
      staple gun|staples tembak|h
      soldering iron|solder|h
      wire|kawat|h
      drill bit|mata bor|h
      anvil|landasan tempa|m
      workshop|bengkel|h
      metal nail|paku|m
      wood glue|lem kayu|h
      paint tray|nampan cat|h
      stepladder|tangga lipat|m
      tool shed|gudang perkakas|h
      pipe wrench|kunci pipa|h
    `),
  },
  {
    id: "farm",
    name: { en: "Farm & garden", id: "Peternakan & kebun" },
    words: w(`
      farm|peternakan|m
      barn|lumbung|e
      scarecrow|orang-orangan sawah|e
      haystack|tumpukan jerami|m
      pitchfork|garpu rumput|m
      watering can|gembor|m
      garden hose|selang air|m
      rake|garu|m
      hoe|cangkul|h
      lawn mower|mesin pemotong rumput|m
      greenhouse|rumah kaca|m
      sprout|tunas|m
      vegetable garden|kebun sayur|m
      orchard|kebun buah|h
      beehive|sarang lebah|m
      chicken coop|kandang ayam|m
      pigsty|kandang babi|h
      stable|kandang kuda|h
      silo|silo|m
      milking a cow|memerah susu|m
      egg basket|keranjang telur|m
      bird nest|sarang burung|m
      horseshoe|tapal kuda|m
      saddle|pelana|m
      corn field|ladang jagung|m
      wheat|gandum|m
      rice plant|padi|h
      harvest|panen|m
      sickle|arit|h
      plow|bajak|h
      fertilizer|pupuk|h
      compost|kompos|h
      garden gnome|kurcaci taman|m
      sprinkler|penyiram otomatis|m
      flower bed|petak bunga|m
      hedge|pagar tanaman|h
      apple tree|pohon apel|e
      pond|kolam|m
      lamb|anak domba|m
      piglet|anak babi|m
      calf|anak sapi|m
      seed packet|bungkus benih|h
      bonsai|bonsai|m
      gardening gloves|sarung tangan berkebun|h
      garden shed|gudang kebun|h
      rabbit hutch|kandang kelinci|m
      dog house|rumah anjing|m
      feeding chickens|memberi makan ayam|m
      weathervane|penunjuk arah angin|h
      sack of rice|karung beras|m
      tractor ride|naik traktor|m
      hay bale|bal jerami|m
      farm gate|gerbang peternakan|h
      cow bell|kalung lonceng sapi|h
      fishpond|empang|h
      water buffalo plow|bajak kerbau|h
      sunflower field|ladang bunga matahari|m
      vegetable stall|lapak sayur|h
      fruit picking|memetik buah|h
    `),
  },
  {
    id: "home",
    name: { en: "Bedroom & bathroom", id: "Kamar tidur & kamar mandi" },
    words: w(`
      bed|kasur|e
      pillow|bantal|e
      blanket|selimut|m
      mirror|cermin|e
      toothbrush|sikat gigi|e
      toothpaste|pasta gigi|m
      soap|sabun|m
      towel|handuk|m
      bathtub|bak mandi|e
      shower|pancuran|m
      toilet|kloset|e
      toilet paper|tisu toilet|m
      bathroom sink|wastafel|m
      shampoo|sampo|m
      comb|sisir|e
      hairbrush|sikat rambut|m
      hair dryer|pengering rambut|m
      razor|pisau cukur|m
      bathrobe|jubah mandi|h
      slippers|sandal kamar|m
      shower cap|topi mandi|m
      bathroom scale|timbangan badan|h
      plunger|penyedot kloset|h
      alarm clock|jam weker|m
      bedside table|nakas|h
      wardrobe|lemari pakaian|m
      bunk bed|ranjang susun|m
      crib|boks bayi|m
      night light|lampu tidur|m
      pajamas|piyama|m
      dream catcher|penangkap mimpi|m
      poster|poster|m
      diaper|popok|m
      baby bottle|dot bayi|m
      pacifier|empeng|m
      bed sheet|seprai|h
      mattress|kasur busa|h
      sleep mask|penutup mata tidur|m
      nail clipper|gunting kuku|h
      tweezers|pinset|h
      cotton bud|cotton bud|h
      lipstick|lipstik|m
      perfume|parfum|m
      deodorant|deodoran|h
      face mask|masker wajah|h
      bath mat|keset kamar mandi|h
      mouthwash|obat kumur|h
      dental floss|benang gigi|h
      water dipper|gayung|m
      squat toilet|wc jongkok|h
      shower curtain|tirai kamar mandi|h
      hair clip|jepit rambut|m
      hair tie|ikat rambut|h
      bean bag|bean bag|m
      pillowcase|sarung bantal|h
      bubble bath|mandi busa|m
      rubber slippers|sandal karet|m
      hand mirror|cermin tangan|m
      makeup bag|tas kosmetik|h
      hot water bottle|kantong air panas|h
    `),
  },
  {
    id: "dinosaurs",
    name: { en: "Dinosaurs & prehistoric", id: "Dinosaurus & prasejarah" },
    words: w(`
      t-rex|t-rex|e
      triceratops|triceratops|m
      stegosaurus|stegosaurus|m
      brontosaurus|brontosaurus|m
      pterodactyl|pterodaktil|m
      velociraptor|velociraptor|h
      ankylosaurus|ankylosaurus|h
      spinosaurus|spinosaurus|h
      diplodocus|diplodocus|h
      iguanodon|iguanodon|h
      plesiosaurus|plesiosaurus|h
      mosasaurus|mosasaurus|h
      megalodon|megalodon|h
      dinosaur egg|telur dinosaurus|e
      dinosaur footprint|jejak dinosaurus|m
      dinosaur skeleton|kerangka dinosaurus|m
      dinosaur nest|sarang dinosaurus|m
      dinosaur tooth|gigi dinosaurus|m
      baby dinosaur|bayi dinosaurus|m
      hatching egg|telur menetas|m
      fossil|fosil|m
      amber|ambar|h
      mammoth|mamut|m
      saber-toothed tiger|harimau gigi pedang|m
      giant sloth|kungkang raksasa|h
      cave bear|beruang gua|h
      dodo|dodo|h
      caveman|manusia gua|m
      cave painting|lukisan gua|m
      stone axe|kapak batu|m
      spear|tombak|m
      stone tools|alat batu|h
      stone wheel|roda batu|h
      making fire|membuat api|m
      hunting|berburu|h
      animal skin clothes|baju kulit binatang|h
      archaeologist|arkeolog|h
      ice age|zaman es|h
      fern|pakis|h
      lava|lava|m
      meteor strike|hantaman meteor|m
      dinosaur park|taman dinosaurus|h
      trilobite|trilobita|h
      dinosaur bones dig|penggalian tulang dinosaurus|h
      stone hut|gubuk batu|h
      cave entrance|mulut gua|h
    `),
  },
  {
    id: "pirates",
    name: { en: "Pirates", id: "Bajak laut" },
    words: w(`
      pirate|bajak laut|e
      pirate ship|kapal bajak laut|m
      treasure chest|peti harta karun|e
      treasure map|peta harta karun|m
      eye patch|penutup mata bajak laut|m
      hook hand|tangan kait|m
      wooden leg|kaki kayu|m
      skull and crossbones|tengkorak dan tulang silang|m
      pirate flag|bendera bajak laut|m
      cannon|meriam|m
      cannonball|peluru meriam|m
      gold coins|koin emas|m
      spyglass|teropong|m
      compass|kompas|m
      anchor|jangkar|e
      ship wheel|kemudi kapal|m
      walking the plank|berjalan di papan|m
      captain|kapten|m
      tricorn hat|topi segitiga|h
      sail|layar|m
      mast|tiang kapal|h
      crow nest|tiang pengintai|h
      treasure island|pulau harta karun|m
      message in a bottle|pesan dalam botol|m
      shipwreck|kapal karam|m
      kraken|kraken|h
      barrel|tong|m
      x marks the spot|tanda silang harta|m
      jewels|permata|m
      sword fight|duel pedang|m
      porthole|jendela kapal|h
      lifeboat|sekoci|h
      dagger|belati|m
      bandana|bandana|m
      pirate parrot|burung beo bajak laut|m
      buried treasure|harta karun terkubur|h
      ship in a storm|kapal diterjang badai|h
      rope ladder|tangga tali|h
      pirate captain|kapten bajak laut|h
      deserted island|pulau terpencil|h
      ship cabin|kabin kapal|h
    `),
  },
  {
    id: "camping",
    name: { en: "Camping & outdoors", id: "Berkemah & alam terbuka" },
    words: w(`
      tent|tenda|e
      campfire|api unggun|e
      sleeping bag|kantong tidur|m
      hiking backpack|tas gunung|m
      roasting marshmallows|memanggang marshmallow|m
      binoculars|teropong binokular|m
      hiking|mendaki|m
      hiking boots|sepatu gunung|m
      log cabin|kabin kayu|m
      fishing rod|joran pancing|m
      hammock|tempat tidur gantung|m
      firewood|kayu bakar|m
      sunscreen|tabir surya|h
      trail sign|papan petunjuk jalan|m
      tent pegs|pasak tenda|h
      zipline|flying fox|m
      rafting|arung jeram|m
      ghost story|cerita hantu|h
      scout|pramuka|m
      knot|simpul tali|m
      smoke signal|sinyal asap|h
      walking stick|tongkat jalan|m
      bird watching|mengamati burung|h
      mosquito bite|gigitan nyamuk|m
      cooler box|kotak pendingin|h
      camping stove|kompor portabel|h
      canned food|makanan kaleng|h
      mountain bike|sepeda gunung|m
      folding chair|kursi lipat|m
      camp lantern|lampu kemah|m
      water canteen|botol air minum|h
      mountain summit|puncak gunung|m
      waterfall swim|berenang di air terjun|h
      fishing by the lake|memancing di danau|m
      picnic blanket|tikar piknik|m
    `),
  },
  {
    id: "circus",
    name: { en: "Circus & fair", id: "Sirkus & pasar malam" },
    words: w(`
      circus tent|tenda sirkus|m
      clown|badut|e
      magician|pesulap|m
      juggler|pemain juggling|m
      acrobat|akrobat|m
      tightrope walker|pemain tali|m
      trapeze|trapeze|m
      lion tamer|pawang singa|m
      ringmaster|pemimpin sirkus|h
      human cannonball|manusia meriam|m
      fire breather|penyembur api|m
      strongman|orang kuat|m
      ferris wheel|bianglala|e
      roller coaster|roller coaster|m
      carousel|komidi putar|m
      bumper cars|bom-bom car|m
      face painting|lukis wajah|m
      ticket|tiket|m
      ring toss|lempar gelang|h
      balloon animal|balon binatang|m
      rabbit in a hat|kelinci dalam topi|m
      card trick|trik kartu|h
      teacup ride|cangkir putar|h
      clown nose|hidung badut|m
      clown shoes|sepatu badut|m
      mime|pantomim|h
      puppet show|pertunjukan boneka|h
      stilt walker|pemain egrang|m
      ball balancing seal|anjing laut main bola|m
      elephant on a ball|gajah di atas bola|m
      prize stand|stan hadiah|h
      drop tower|wahana jatuh bebas|h
      swing ride|wahana ayunan|h
      ghost train|kereta hantu|h
      fun house mirror|cermin lucu|h
      magic show|pertunjukan sulap|m
      sawing in half|sulap potong badan|h
      clown car|mobil badut|m
      big top|tenda besar sirkus|m
      knife thrower|pelempar pisau|h
    `),
  },
  {
    id: "spooky",
    name: { en: "Spooky & Halloween", id: "Seram & Halloween" },
    words: w(`
      ghost|hantu|e
      witch|nenek sihir|m
      vampire|vampir|m
      zombie|zombi|m
      mummy|mumi|m
      werewolf|manusia serigala|m
      haunted house|rumah hantu|m
      skull|tengkorak|e
      halloween pumpkin|labu halloween|m
      black cat|kucing hitam|m
      broomstick|sapu terbang|m
      cauldron|kuali sihir|m
      spider web|sarang laba-laba|e
      graveyard|kuburan|m
      tombstone|batu nisan|m
      coffin|peti mati|m
      pocong|pocong|m
      kuntilanak|kuntilanak|h
      tuyul|tuyul|h
      frankenstein monster|monster frankenstein|m
      creepy doll|boneka seram|m
      ghost ship|kapal hantu|m
      grim reaper|malaikat maut|m
      eyeball|bola mata|m
      slime|lendir|m
      witch hat|topi nenek sihir|m
      claw|cakar|m
      fangs|taring|m
      monster under the bed|monster di bawah kasur|h
      shadow|bayangan|h
      ghost hunter|pemburu hantu|h
      pumpkin carving|mengukir labu|h
      trick or treat|minta permen halloween|h
      haunted mirror|cermin berhantu|h
      bat wings|sayap kelelawar|m
      candy bucket|ember permen|m
      creaky door|pintu berderit|h
      zombie hand|tangan zombi|m
      ghost in a sheet|hantu kain putih|m
      spooky forest|hutan angker|h
      genderuwo|genderuwo|h
      haunted well|sumur angker|h
    `),
  },
  {
    id: "heroes",
    name: { en: "Superheroes & powers", id: "Pahlawan super & kekuatan" },
    words: w(`
      superhero|pahlawan super|e
      cape|jubah|m
      hero mask|topeng pahlawan|m
      super strength|kekuatan super|m
      invisibility|tak terlihat|h
      x-ray vision|penglihatan sinar-x|m
      laser eyes|mata laser|m
      super speed|kecepatan super|m
      shrinking|mengecil|h
      teleporting|teleportasi|h
      mind reading|membaca pikiran|h
      force field|medan pelindung|h
      ice powers|kekuatan es|m
      fire powers|kekuatan api|m
      shapeshifter|pengubah wujud|h
      villain|penjahat|m
      sidekick|rekan pahlawan|h
      secret lair|markas rahasia|h
      hero landing|pendaratan pahlawan|m
      utility belt|sabuk peralatan|m
      robot suit|baju robot|m
      signal in the sky|sinyal di langit|h
      rescue|penyelamatan|m
      saving a cat from a tree|menyelamatkan kucing di pohon|m
      giant robot|robot raksasa|m
      alien invasion|invasi alien|m
      hero pose|pose pahlawan|m
      stretchy arms|lengan karet|m
      talking to animals|bicara dengan hewan|h
      freezing time|menghentikan waktu|h
      healing powers|kekuatan penyembuh|h
      super jump|lompatan super|m
      flying hero|pahlawan terbang|m
      secret identity|identitas rahasia|h
      hero costume change|ganti kostum pahlawan|h
      lightning powers|kekuatan petir|m
      wall crawling|merayap di dinding|h
      underwater breathing|bernapas di air|h
      catching a falling car|menangkap mobil jatuh|m
      giant monster attack|serangan monster raksasa|m
      hero team|tim pahlawan|h
      superhero logo|lambang pahlawan|m
      mad scientist|ilmuwan gila|m
    `),
  },
  {
    id: "landmarks",
    name: { en: "Famous landmarks", id: "Tempat terkenal" },
    words: w(`
      eiffel tower|menara eiffel|e
      pyramids|piramida|m
      sphinx|sphinx|m
      great wall of china|tembok besar china|m
      statue of liberty|patung liberty|m
      big ben|big ben|m
      leaning tower of pisa|menara miring pisa|m
      colosseum|colosseum|m
      taj mahal|taj mahal|m
      sydney opera house|gedung opera sydney|m
      mount fuji|gunung fuji|m
      christ the redeemer|patung kristus penebus|m
      stonehenge|stonehenge|m
      machu picchu|machu picchu|h
      golden gate bridge|jembatan golden gate|m
      mount everest|gunung everest|m
      niagara falls|air terjun niagara|m
      grand canyon|grand canyon|h
      burj khalifa|burj khalifa|m
      petronas towers|menara kembar petronas|m
      kaaba|kabah|m
      borobudur|borobudur|m
      prambanan|prambanan|h
      monas|monas|m
      mount bromo|gunung bromo|h
      lake toba|danau toba|h
      tanah lot|tanah lot|h
      raja ampat|raja ampat|h
      komodo island|pulau komodo|h
      merlion|merlion|h
      angkor wat|angkor wat|h
      moai statues|patung moai|m
      mount rushmore|gunung rushmore|h
      hollywood sign|tulisan hollywood|m
      white house|gedung putih|m
      parthenon|parthenon|h
      london eye|london eye|m
      tokyo tower|menara tokyo|m
      uluru|uluru|h
      kremlin|kremlin|h
      arc de triomphe|arc de triomphe|h
      tower bridge|tower bridge|h
      mount kilimanjaro|gunung kilimanjaro|h
      jam gadang|jam gadang|h
      gedung sate|gedung sate|h
      suramadu bridge|jembatan suramadu|h
      tower of london|menara london|h
      great barrier reef|great barrier reef|h
    `),
  },
  {
    id: "world",
    name: { en: "Around the world", id: "Keliling dunia" },
    words: w(`
      kimono|kimono|m
      sombrero|sombrero|m
      igloo|iglo|e
      kilt|kilt|m
      beret|baret|m
      baguette|roti baguette|m
      wooden shoes|sepatu kayu|m
      totem pole|totem|m
      teepee|tipi|m
      didgeridoo|didgeridoo|h
      matryoshka doll|boneka matryoshka|h
      samurai|samurai|m
      ninja|ninja|m
      oasis|oasis|m
      safari|safari|m
      tuk-tuk|tuk-tuk|h
      viking|viking|m
      gladiator|gladiator|m
      viking ship|kapal viking|m
      pharaoh|firaun|m
      flamenco dancer|penari flamenco|h
      hula dancer|penari hula|m
      flower necklace|kalung bunga|m
      poncho|ponco|h
      red phone booth|kotak telepon merah|m
      sari|sari|h
      turban|sorban|h
      dragon boat|perahu naga|m
      cherry blossom|bunga sakura|m
      cuckoo clock|jam kukuk|h
      lederhosen|lederhosen|h
      fez|topi fez|h
      belly dancer|penari perut|h
      passport|paspor|m
      suitcase|koper|m
      postcard|kartu pos|m
      souvenir|oleh-oleh|h
      tourist|turis|m
      cowboy hat|topi koboi|m
      rice hat|caping|m
      matador|matador|h
      gondolier|pendayung gondola|h
      camel caravan|kafilah unta|m
      desert tent|tenda gurun|h
      paper lantern|lampion|m
      pagoda|pagoda|m
      mosaic|mozaik|h
      tulip field|ladang tulip|h
      airplane ticket|tiket pesawat|m
      world map|peta dunia|m
    `),
  },
  {
    id: "emotions",
    name: { en: "Emotions & faces", id: "Perasaan & ekspresi" },
    hard: true,
    words: w(`
      happy|senang|e
      sad|sedih|e
      angry|marah|e
      scared|takut|m
      surprised|terkejut|m
      bored|bosan|h
      sleepy|mengantuk|m
      confused|bingung|h
      in love|jatuh cinta|m
      shy|malu|h
      proud|bangga|h
      jealous|cemburu|h
      nervous|gugup|h
      excited|bersemangat|h
      disgusted|jijik|h
      tired|lelah|m
      sick|sakit|m
      hungry|lapar|m
      thirsty|haus|h
      freezing cold|kedinginan|m
      too hot|kepanasan|m
      dizzy|pusing|m
      lonely|kesepian|h
      grumpy|cemberut|h
      silly face|wajah konyol|m
      winking|mengedipkan mata|m
      smirking|menyeringai|h
      crying with laughter|tertawa sampai menangis|m
      blushing|tersipu|h
      mind blown|takjub|m
      facepalm|tepuk jidat|h
      eye roll|memutar bola mata|h
      pouting|manyun|h
      shocked|kaget|m
      worried|khawatir|h
      relieved|lega|h
      guilty|merasa bersalah|h
      brave|berani|h
      curious|penasaran|h
      embarrassed|merasa malu|h
      evil laugh|tawa jahat|h
      smiling|tersenyum|m
      frowning|mengerutkan dahi|h
      sticking out tongue|menjulurkan lidah|m
      poker face|wajah datar|h
      heartbroken|patah hati|m
      starstruck|terpesona|h
      sneaky|licik|h
      calm|tenang|h
      stressed|stres|h
    `),
  },
  {
    id: "idioms",
    name: { en: "Phrases & idioms", id: "Ungkapan & peribahasa" },
    hard: true,
    words: w(`
      crocodile tears|air mata buaya|m
      two-faced|bermuka dua|m
      green light|lampu hijau|m
      blue blood|darah biru|h
      big-headed|besar kepala|h
      scapegoat|kambing hitam|h
      couch potato|kaum rebahan|m
      easy as turning your hand|membalik telapak tangan|h
      two birds with one stone|sekali dayung dua pulau terlampaui|h
      spilled milk|nasi sudah menjadi bubur|h
      frog in a well|katak dalam tempurung|h
      empty can rattles loudest|tong kosong nyaring bunyinya|h
      two peas in a pod|bagai pinang dibelah dua|h
      something fishy|ada udang di balik batu|h
      iron fist|tangan besi|h
      right-hand man|tangan kanan|h
      stubborn as a rock|kepala batu|h
      shrimp brain|otak udang|h
      teacher pet|anak emas|h
      window shopping|cuci mata|h
      break the ice|mencairkan suasana|h
      show your cards|buka kartu|h
      heart of gold|berhati emas|h
      work to the bone|banting tulang|h
      on cloud nine|di atas awan|h
      bolt from the blue|petir di siang bolong|h
      apple of my eye|biji mata|h
      sticky fingers|panjang tangan|h
      partner in crime|kaki tangan|h
      time is money|waktu adalah uang|m
      walls have ears|dinding punya telinga|h
      money does not grow on trees|uang tidak tumbuh di pohon|h
      big fish in a small pond|jago kandang|h
      night owl|begadang|m
      snake in the grass|musuh dalam selimut|h
      fish out of water|seperti ikan di darat|m
      rising star|naik daun|m
      getting fresh air|makan angin|h
      eyes bigger than stomach|lapar mata|h
      helping hand|ringan tangan|h
      fuel to the fire|menyiram minyak ke api|h
      under the weather|masuk angin|h
      cat and mouse|kucing-kucingan|h
      long face|muka masam|h
      cold shoulder|buang muka|h
      busy as a bee|serajin semut|h
    `),
  },
  {
    id: "duo",
    name: { en: "Two-person actions", id: "Aksi berdua" },
    hard: true,
    words: w(`
      high five|tos|e
      hugging|berpelukan|e
      piggyback ride|gendong di punggung|m
      handshake|berjabat tangan|e
      arm wrestling|panco|m
      waltz|berdansa|h
      pillow fight|perang bantal|m
      tickling|menggelitik|m
      whispering|berbisik|m
      fist bump|tos kepalan|m
      leapfrog|lompat kodok|m
      rock paper scissors|suit|m
      thumb war|adu jempol|m
      staring contest|adu tatap|h
      three-legged race|lari tiga kaki|m
      playing catch|main lempar tangkap|m
      giving a gift|memberi hadiah|m
      proposing|melamar|m
      haircut|potong rambut|m
      feeding someone|menyuapi|m
      teaching|mengajar|h
      arguing|bertengkar|h
      chasing|mengejar|m
      racing|balapan|m
      pushing a swing|mendorong ayunan|m
      helping someone up|membantu berdiri|h
      hand kiss greeting|salim|h
      massage|memijat|m
      doctor checkup|periksa dokter|m
      interview|wawancara|h
      carrying a sofa together|mengangkat sofa bersama|h
      sharing food|berbagi makanan|h
      dance battle|adu dansa|m
      secret handshake|salaman rahasia|h
      holding hands|bergandengan tangan|m
      back to back|saling memunggungi|h
      teasing|mengejek|h
      taking a photo of someone|memotret teman|m
      cheek pinch|cubit pipi|m
    `),
  },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

/** The categories a room plays when the host hasn't picked any: everything except the hard ones. */
export const DEFAULT_CATEGORY_IDS = CATEGORIES.filter((c) => !c.hard).map((c) => c.id);

export function categoryName(id: string, lang: Language): string {
  if (id === "custom") return lang === "id" ? "Kata buatan" : "Custom words";
  return CATEGORIES.find((c) => c.id === id)?.name[lang] ?? id;
}
