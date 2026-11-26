import type { Language } from "./types";

export interface Category {
  id: string;
  name: Record<Language, string>;
  /** Harder to draw (feelings, idioms, two-person scenes). Off unless the host ticks it. */
  hard?: boolean;
  /** [english, indonesian] pairs. */
  words: ReadonlyArray<readonly [string, string]>;
}

/** One "english | indonesian" pair per line. */
function w(list: string): ReadonlyArray<readonly [string, string]> {
  return list
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [en, id] = line.split("|").map((s) => s.trim());
      return [en, id] as const;
    });
}

export const CATEGORIES: readonly Category[] = [
  {
    id: "animals",
    name: { en: "Animals", id: "Hewan" },
    words: w(`
      cat|kucing
      dog|anjing
      giraffe|jerapah
      elephant|gajah
      penguin|penguin
      snake|ular
      rabbit|kelinci
      monkey|monyet
      lion|singa
      tiger|harimau
      zebra|zebra
      kangaroo|kanguru
      owl|burung hantu
      frog|katak
      turtle|kura-kura
      horse|kuda
      cow|sapi
      pig|babi
      chicken|ayam
      duck|bebek
      bat|kelelawar
      camel|unta
      snail|siput
      spider|laba-laba
      butterfly|kupu-kupu
      bee|lebah
      crocodile|buaya
      deer|rusa
      goat|kambing
      mouse|tikus
      orangutan|orangutan
      komodo|komodo
      peacock|merak
      squirrel|tupai
      raccoon|rakun
      panda|panda
      koala|koala
      polar bear|beruang kutub
      bear|beruang
      wolf|serigala
      fox|rubah
      hippo|kuda nil
      rhino|badak
      gorilla|gorila
      cheetah|cheetah
      leopard|macan tutul
      sloth|kungkang
      hedgehog|landak mini
      porcupine|landak
      skunk|sigung
      otter|berang-berang
      ant|semut
      ladybug|kepik
      dragonfly|capung
      mosquito|nyamuk
      fly|lalat
      caterpillar|ulat
      worm|cacing
      grasshopper|belalang
      scorpion|kalajengking
      parrot|burung beo
      eagle|elang
      flamingo|flamingo
      swan|angsa
      ostrich|burung unta
      pigeon|merpati
      toucan|tukan
      hornbill|burung enggang
      woodpecker|burung pelatuk
      chameleon|bunglon
      lizard|kadal
      gecko|cicak
      iguana|iguana
      sheep|domba
      donkey|keledai
      buffalo|kerbau
      llama|llama
      puppy|anak anjing
      kitten|anak kucing
      hamster|hamster
      guinea pig|marmut
      tapir|tapir
      pangolin|trenggiling
      anteater|pemakan semut
      moose|rusa besar
      mole|tikus tanah
      rooster|ayam jago
      chick|anak ayam
      cobra|kobra
      python|ular piton
      firefly|kunang-kunang
      cricket|jangkrik
      cockroach|kecoak
      crow|gagak
      bird|burung
    `),
  },
  {
    id: "nature",
    name: { en: "Nature & weather", id: "Alam & cuaca" },
    words: w(`
      rainbow|pelangi
      volcano|gunung berapi
      mountain|gunung
      river|sungai
      waterfall|air terjun
      cloud|awan
      rain|hujan
      lightning|petir
      snow|salju
      tornado|tornado
      tree|pohon
      flower|bunga
      leaf|daun
      cactus|kaktus
      island|pulau
      beach|pantai
      desert|gurun
      forest|hutan
      cave|gua
      wave|ombak
      mushroom|jamur
      sunset|matahari terbenam
      sunrise|matahari terbit
      fog|kabut
      lake|danau
      rock|batu
      palm tree|pohon palem
      earthquake|gempa bumi
      wind|angin
      storm|badai
      hail|hujan es
      snowflake|kepingan salju
      puddle|genangan air
      mud|lumpur
      sand dune|bukit pasir
      cliff|tebing
      valley|lembah
      glacier|gletser
      iceberg|gunung es
      canyon|ngarai
      hill|bukit
      swamp|rawa
      jungle|rimba
      meadow|padang rumput
      grass|rumput
      bush|semak
      vine|tanaman merambat
      moss|lumut
      pine tree|pohon cemara
      oak tree|pohon ek
      acorn|biji ek
      pinecone|buah pinus
      sunflower|bunga matahari
      rose|mawar
      tulip|tulip
      lotus|teratai
      orchid|anggrek
      dandelion|dandelion
      seed|biji
      root|akar
      branch|ranting
      log|batang kayu
      tree stump|tunggul pohon
      tsunami|tsunami
      flood|banjir
      wildfire|kebakaran hutan
      smoke|asap
      geyser|geiser
      hot spring|mata air panas
      pebble|kerikil
      crystal|kristal
      dew|embun
      frost|embun beku
      avalanche|longsoran salju
      landslide|tanah longsor
      whirlpool|pusaran air
      sea|laut
      horizon|cakrawala
    `),
  },
  {
    id: "food",
    name: { en: "Food", id: "Makanan" },
    words: w(`
      pizza|pizza
      burger|burger
      fried rice|nasi goreng
      noodles|mi
      satay|sate
      egg|telur
      bread|roti
      cheese|keju
      sushi|sushi
      hot dog|hot dog
      french fries|kentang goreng
      ice cream|es krim
      cake|kue
      donut|donat
      sandwich|roti lapis
      meatball soup|bakso
      fried chicken|ayam goreng
      popcorn|berondong jagung
      pancake|panekuk
      shrimp|udang
      dumpling|pangsit
      spaghetti|spageti
      taco|taco
      burrito|burito
      steak|steik
      sausage|sosis
      bacon|daging asap
      salad|salad
      soup|sup
      rice|nasi
      porridge|bubur
      omelette|telur dadar
      fried egg|telur mata sapi
      boiled egg|telur rebus
      toast|roti panggang
      croissant|croissant
      bagel|bagel
      pie|pai
      cereal|sereal
      yogurt|yoghurt
      butter|mentega
      honey|madu
      jam|selai
      peanut butter|selai kacang
      ketchup|saus tomat
      mayonnaise|mayones
      soy sauce|kecap
      salt|garam
      pepper|merica
      sugar|gula
      flour|tepung
      chicken wings|sayap ayam
      drumstick|paha ayam
      fish and chips|ikan goreng tepung
      grilled fish|ikan bakar
      ramen|ramen
      kebab|kebab
      curry|kari
      lasagna|lasagna
      nachos|nachos
      meatball|bola daging
      fried noodles|mi goreng
      chicken soup|sup ayam
      tofu|tahu
      spring roll|lumpia
      fried banana|pisang goreng
      onigiri|onigiri
      kimchi|kimchi
      corn dog|corn dog
      lunch box|kotak bekal
      roast chicken|ayam panggang
      cheeseburger|burger keju
      fried fish|ikan goreng
      chicken nuggets|nugget ayam
      mashed potatoes|kentang tumbuk
      macaroni|makaroni
      dim sum|dim sum
    `),
  },
  {
    id: "drinks",
    name: { en: "Drinks & snacks", id: "Minuman & jajanan" },
    words: w(`
      bubble tea|boba
      iced tea|es teh
      coffee|kopi
      milk|susu
      juice|jus
      lemonade|limun
      hot chocolate|cokelat panas
      water bottle|botol air
      soda|soda
      smoothie|smoothie
      cookie|kue kering
      candy|permen
      lollipop|lolipop
      chocolate bar|batang cokelat
      chips|keripik
      crackers|kerupuk
      peanuts|kacang
      pudding|puding
      cupcake|kue mangkuk
      waffle|wafel
      muffin|muffin
      pretzel|pretzel
      marshmallow|marshmallow
      cotton candy|arbanat
      jelly|agar-agar
      teapot|teko
      straw|sedotan
      mug|cangkir
      ice cube|es batu
      coconut water|es kelapa
      milkshake|milkshake
      ice pop|es loli
      gummy bears|permen jeli
      chewing gum|permen karet
      caramel|karamel
      mint candy|permen mint
      orange juice|jus jeruk
      tea bag|kantong teh
      cappuccino|cappuccino
      energy drink|minuman energi
      cendol|cendol
      iced coffee|es kopi
      thermos|termos
      juice box|kotak jus
      soda can|kaleng soda
      vending machine|mesin penjual otomatis
      ice cream cone|es krim cone
      brownie|brownies
      macaron|makaron
      churros|churros
      candy cane|permen tongkat
      glass of water|segelas air
      sundae|sundae
      banana split|banana split
      fruit salad|salad buah
      milk carton|kotak susu
      jelly beans|permen kacang jeli
      rice crackers|rengginang
      shaved ice|es serut
      hot tea|teh panas
    `),
  },
  {
    id: "household",
    name: { en: "Household objects", id: "Barang rumah" },
    words: w(`
      umbrella|payung
      chair|kursi
      table|meja
      lamp|lampu
      door|pintu
      window|jendela
      clock|jam dinding
      broom|sapu
      bucket|ember
      key|kunci
      candle|lilin
      scissors|gunting
      fan|kipas angin
      sofa|sofa
      ladder|tangga
      hanger|gantungan baju
      curtain|gorden
      carpet|karpet
      doormat|keset
      doorbell|bel pintu
      mailbox|kotak surat
      vacuum cleaner|penyedot debu
      mop|alat pel
      dustpan|pengki
      trash can|tempat sampah
      washing machine|mesin cuci
      iron|setrika
      clothesline|jemuran
      clothespin|jepitan jemuran
      laundry basket|keranjang cucian
      bookshelf|rak buku
      picture frame|bingkai foto
      vase|vas bunga
      plant pot|pot tanaman
      air conditioner|pendingin ruangan
      light switch|sakelar lampu
      padlock|gembok
      keychain|gantungan kunci
      wallet|dompet
      fireplace|perapian
      chimney|cerobong asap
      roof|atap
      fence|pagar
      gate|gerbang
      garage|garasi
      balcony|balkon
      doorknob|gagang pintu
      drawer|laci
      shoe rack|rak sepatu
      tissue box|kotak tisu
      matches|korek api
      sewing machine|mesin jahit
      needle and thread|jarum dan benang
      button|kancing
      safety pin|peniti
      basket|keranjang
      cardboard box|kardus
      newspaper|koran
      magazine|majalah
      piggy bank|celengan
      photo album|album foto
      wind chime|lonceng angin
      rocking chair|kursi goyang
      stool|bangku
      cushion|bantal sofa
      mosquito net|kelambu
      mosquito coil|obat nyamuk bakar
      bug spray|semprotan serangga
      first aid kit|kotak p3k
      thermometer|termometer
      pendulum clock|jam bandul
    `),
  },
  {
    id: "tech",
    name: { en: "Tech & gadgets", id: "Teknologi & gawai" },
    words: w(`
      laptop|laptop
      phone|ponsel
      camera|kamera
      headphones|headphone
      keyboard|papan ketik
      computer mouse|mouse komputer
      television|televisi
      robot|robot
      drone|drone
      battery|baterai
      light bulb|bola lampu
      remote control|remote
      speaker|pengeras suara
      printer|printer
      game controller|stik game
      smartwatch|jam pintar
      charger|pengisi daya
      radio|radio
      flashlight|senter
      usb stick|flashdisk
      router|router
      tablet|tablet
      selfie stick|tongsis
      vr headset|kacamata vr
      plug|colokan
      magnet|magnet
      antenna|antena
      power bank|power bank
      earbuds|earphone
      webcam|kamera web
      monitor|monitor
      cable|kabel
      wifi|wifi
      hard drive|hard disk
      floppy disk|disket
      cassette|kaset
      video game|gim video
      arcade machine|mesin arkade
      joystick|joystik
      scanner|pemindai
      projector|proyektor
      solar panel|panel surya
      wind turbine|turbin angin
      circuit board|papan sirkuit
      microchip|cip
      3d printer|printer 3d
      qr code|kode qr
      barcode|kode batang
      selfie|swafoto
      video call|panggilan video
      robot vacuum|robot penyedot debu
      walkie-talkie|walkie-talkie
      telephone|telepon rumah
      typewriter|mesin tik
      satellite dish|parabola
      cctv camera|kamera cctv
      atm machine|mesin atm
      email|surel
      smart speaker|speaker pintar
      electric scooter|skuter listrik
      gaming chair|kursi gaming
    `),
  },
  {
    id: "places",
    name: { en: "Places & buildings", id: "Tempat & bangunan" },
    words: w(`
      hospital|rumah sakit
      school|sekolah
      house|rumah
      castle|istana
      lighthouse|mercusuar
      bridge|jembatan
      airport|bandara
      mosque|masjid
      church|gereja
      temple|kuil
      library|perpustakaan
      museum|museum
      zoo|kebun binatang
      market|pasar
      stadium|stadion
      skyscraper|gedung pencakar langit
      playground|taman bermain
      cinema|bioskop
      prison|penjara
      tower|menara
      windmill|kincir angin
      swimming pool|kolam renang
      train station|stasiun
      gas station|pom bensin
      treehouse|rumah pohon
      bakery|toko roti
      supermarket|supermarket
      mall|mal
      restaurant|restoran
      hotel|hotel
      police station|kantor polisi
      fire station|pos pemadam kebakaran
      post office|kantor pos
      bank|bank
      pharmacy|apotek
      office|kantor
      factory|pabrik
      apartment|apartemen
      hut|gubuk
      parking lot|tempat parkir
      bus stop|halte bus
      crosswalk|zebra cross
      traffic light|lampu lalu lintas
      street|jalan
      roundabout|bundaran
      tunnel|terowongan
      park|taman
      fountain|air mancur
      statue|patung
      aquarium|akuarium
      amusement park|taman hiburan
      theater|teater
      gym|pusat kebugaran
      hair salon|salon
      car wash|cuci mobil
      harbor|pelabuhan
      dam|bendungan
      well|sumur
      observatory|observatorium
      university|universitas
      kindergarten|taman kanak-kanak
      classroom|ruang kelas
      elevator|lift
      escalator|eskalator
      ticket booth|loket tiket
      toll gate|gerbang tol
      highway|jalan tol
      city|kota
      village|desa
      palace|keraton
      stairs|anak tangga
      basement|ruang bawah tanah
      rooftop|atap gedung
    `),
  },
  {
    id: "vehicles",
    name: { en: "Vehicles", id: "Kendaraan" },
    words: w(`
      car|mobil
      bus|bus
      bicycle|sepeda
      motorcycle|sepeda motor
      train|kereta
      airplane|pesawat
      helicopter|helikopter
      boat|perahu
      ship|kapal
      submarine|kapal selam
      truck|truk
      ambulance|ambulans
      fire truck|mobil pemadam
      police car|mobil polisi
      taxi|taksi
      scooter|skuter
      skateboard|papan luncur
      tractor|traktor
      hot air balloon|balon udara
      pedicab|becak
      horse cart|delman
      canoe|kano
      tank|tank
      excavator|ekskavator
      cable car|kereta gantung
      sailboat|perahu layar
      parachute|parasut
      wheelchair|kursi roda
      minivan|angkot
      electric car|mobil listrik
      race car|mobil balap
      jeep|jip
      limousine|limusin
      pickup truck|mobil bak terbuka
      garbage truck|truk sampah
      cement mixer|truk molen
      bulldozer|buldoser
      tow truck|mobil derek
      forklift|forklift
      steamroller|mesin gilas
      motorboat|perahu motor
      jet ski|jet ski
      cruise ship|kapal pesiar
      ferry|kapal feri
      raft|rakit
      kayak|kayak
      gondola|gondola
      rowboat|perahu dayung
      jet|jet
      fighter jet|jet tempur
      airship|kapal udara
      monorail|monorel
      subway|kereta bawah tanah
      high-speed train|kereta cepat
      steam train|kereta uap
      tram|trem
      double-decker bus|bus tingkat
      school bus|bus sekolah
      unicycle|sepeda roda satu
      tandem bike|sepeda tandem
      tricycle|sepeda roda tiga
      roller skates|sepatu roda
      sled|kereta luncur
      bajaj|bajaj
      golf cart|mobil golf
      camper van|mobil karavan
      delivery van|mobil boks
      seaplane|pesawat amfibi
      crane truck|truk crane
    `),
  },
  {
    id: "jobs",
    name: { en: "Jobs", id: "Pekerjaan" },
    words: w(`
      doctor|dokter
      nurse|perawat
      teacher|guru
      firefighter|pemadam kebakaran
      police officer|polisi
      chef|koki
      farmer|petani
      pilot|pilot
      astronaut|astronaut
      artist|seniman
      singer|penyanyi
      dentist|dokter gigi
      builder|tukang bangunan
      fisherman|nelayan
      mail carrier|tukang pos
      scientist|ilmuwan
      photographer|fotografer
      barber|tukang cukur
      mechanic|montir
      judge|hakim
      soldier|tentara
      detective|detektif
      programmer|programmer
      waiter|pelayan
      lifeguard|penjaga pantai
      street vendor|pedagang kaki lima
      vet|dokter hewan
      pharmacist|apoteker
      lawyer|pengacara
      plumber|tukang ledeng
      electrician|tukang listrik
      carpenter|tukang kayu
      house painter|tukang cat
      tailor|penjahit
      baker|tukang roti
      butcher|tukang daging
      cashier|kasir
      security guard|satpam
      driver|sopir
      flight attendant|pramugari
      sailor|pelaut
      referee|wasit
      coach|pelatih
      dancer|penari
      actor|aktor
      film director|sutradara
      news anchor|pembaca berita
      reporter|wartawan
      writer|penulis
      librarian|pustakawan
      gardener|tukang kebun
      cleaner|petugas kebersihan
      zookeeper|penjaga kebun binatang
      beekeeper|peternak lebah
      florist|penjual bunga
      architect|arsitek
      surgeon|ahli bedah
      miner|penambang
      lumberjack|penebang pohon
      cowboy|koboi
      youtuber|youtuber
      delivery rider|kurir
      babysitter|pengasuh anak
      hairdresser|penata rambut
      makeup artist|perias
      model|model
      tour guide|pemandu wisata
      parking attendant|tukang parkir
      blacksmith|pandai besi
      shepherd|penggembala
      window cleaner|pembersih kaca gedung
      painter|pelukis
    `),
  },
  {
    id: "sports",
    name: { en: "Sports", id: "Olahraga" },
    words: w(`
      football|sepak bola
      basketball|bola basket
      badminton|bulu tangkis
      tennis|tenis
      volleyball|bola voli
      swimming|renang
      boxing|tinju
      golf|golf
      surfing|selancar
      skiing|ski
      bowling|boling
      baseball|bisbol
      archery|panahan
      karate|karate
      cycling|bersepeda
      running|lari
      table tennis|tenis meja
      sepak takraw|sepak takraw
      diving|menyelam
      fishing|memancing
      rock climbing|panjat tebing
      horse riding|berkuda
      chess|catur
      gymnastics|senam
      weightlifting|angkat besi
      trophy|piala
      medal|medali
      whistle|peluit
      goal|gawang
      ice skating|seluncur es
      rugby|rugbi
      hockey|hoki
      judo|judo
      taekwondo|taekwondo
      pencak silat|pencak silat
      wrestling|gulat
      fencing|anggar
      sumo|sumo
      yoga|yoga
      marathon|maraton
      high jump|lompat tinggi
      long jump|lompat jauh
      pole vault|lompat galah
      hurdles|lari gawang
      javelin|lempar lembing
      shot put|tolak peluru
      relay race|lari estafet
      rowing|dayung
      water polo|polo air
      snorkeling|snorkeling
      snowboarding|seluncur salju
      bungee jumping|bungee jumping
      skydiving|terjun payung
      paragliding|paralayang
      darts|dart
      billiards|biliar
      sit-ups|sit-up
      push-ups|push-up
      dumbbell|dumbel
      treadmill|treadmill
      boxing gloves|sarung tinju
      racket|raket
      shuttlecock|kok
      baseball bat|tongkat bisbol
      golf club|stik golf
      scoreboard|papan skor
      finish line|garis finis
      podium|podium
      stopwatch|stopwatch
      jersey|jersey
      penalty kick|tendangan penalti
      slam dunk|slam dunk
      cheerleader|pemandu sorak
    `),
  },
  {
    id: "actions",
    name: { en: "Actions", id: "Kegiatan" },
    words: w(`
      sleeping|tidur
      eating|makan
      dancing|menari
      crying|menangis
      laughing|tertawa
      jumping|melompat
      singing|bernyanyi
      reading|membaca
      writing|menulis
      cooking|memasak
      painting|melukis
      sneezing|bersin
      yawning|menguap
      flying|terbang
      climbing|memanjat
      waving|melambai
      thinking|berpikir
      shouting|berteriak
      sweeping|menyapu
      praying|berdoa
      shopping|belanja
      clapping|bertepuk tangan
      kicking|menendang
      whistling|bersiul
      sweating|berkeringat
      falling|jatuh
      walking|berjalan
      crawling|merangkak
      sitting|duduk
      kneeling|berlutut
      stretching|peregangan
      brushing teeth|menyikat gigi
      washing hands|mencuci tangan
      taking a shower|mandi
      combing hair|menyisir rambut
      drinking|minum
      chewing|mengunyah
      licking|menjilat
      blowing bubbles|meniup gelembung
      blowing out candles|meniup lilin
      sniffing|mengendus
      coughing|batuk
      hiccups|cegukan
      snoring|mendengkur
      dreaming|bermimpi
      waking up|bangun tidur
      texting|mengirim pesan
      taking a selfie|berswafoto
      calling on the phone|menelepon
      typing|mengetik
      drawing|menggambar
      knitting|merajut
      sewing|menjahit
      gardening|berkebun
      watering plants|menyiram tanaman
      digging|menggali
      hammering|memalu
      sawing|menggergaji
      tiptoeing|berjinjit
      sliding|meluncur
      spinning|berputar
      rolling|berguling
      slipping|terpeleset
      tripping|tersandung
      hiding|bersembunyi
      peeking|mengintip
      pointing|menunjuk
      carrying|membawa
      pushing|mendorong
      pulling|menarik
      lifting|mengangkat
      throwing|melempar
      catching|menangkap
      driving|menyetir
      listening to music|mendengarkan musik
      studying|belajar
      counting|menghitung
      measuring|mengukur
      ironing|menyetrika
      folding clothes|melipat baju
      washing dishes|mencuci piring
      mopping|mengepel
      vacuuming|menyedot debu
      cutting|memotong
      peeling|mengupas
      stirring|mengaduk
      pouring|menuang
      frying|menggoreng
      baking|memanggang
      tasting|mencicipi
    `),
  },
  {
    id: "body",
    name: { en: "Body & clothing", id: "Tubuh & pakaian" },
    words: w(`
      eye|mata
      nose|hidung
      mouth|mulut
      ear|telinga
      hand|tangan
      foot|kaki
      tooth|gigi
      hair|rambut
      heart|jantung
      skeleton|kerangka
      hat|topi
      glasses|kacamata
      shirt|kemeja
      dress|gaun
      pants|celana
      sneakers|sepatu
      sandals|sandal
      sock|kaus kaki
      scarf|syal
      glove|sarung tangan
      tie|dasi
      watch|jam tangan
      ring|cincin
      crown|mahkota
      mustache|kumis
      beard|jenggot
      sarong|sarung
      helmet|helm
      raincoat|jas hujan
      finger|jari
      thumb|jempol
      elbow|siku
      knee|lutut
      shoulder|bahu
      neck|leher
      tongue|lidah
      lips|bibir
      eyebrow|alis
      eyelashes|bulu mata
      cheek|pipi
      chin|dagu
      forehead|dahi
      belly button|pusar
      belly|perut
      back|punggung
      leg|tungkai
      arm|lengan
      fist|kepalan tangan
      toe|jari kaki
      fingernail|kuku
      brain|otak
      lungs|paru-paru
      bone|tulang
      muscle|otot
      footprint|jejak kaki
      fingerprint|sidik jari
      braces|kawat gigi
      t-shirt|kaus
      jacket|jaket
      hoodie|hoodie
      sweater|sweter
      skirt|rok
      shorts|celana pendek
      jeans|jeans
      belt|ikat pinggang
      boots|sepatu bot
      high heels|sepatu hak tinggi
      flip-flops|sandal jepit
      baseball cap|topi bisbol
      beanie|kupluk
      hijab|hijab
      bow tie|dasi kupu-kupu
      suit|jas
      uniform|seragam
      swimsuit|baju renang
      earrings|anting
      necklace|kalung
      bracelet|gelang
      sunglasses|kacamata hitam
      handbag|tas tangan
      zipper|ritsleting
      pocket|saku
      wig|rambut palsu
      tattoo|tato
    `),
  },
  {
    id: "music",
    name: { en: "Music & instruments", id: "Musik & alat musik" },
    words: w(`
      guitar|gitar
      piano|piano
      drum|drum
      violin|biola
      trumpet|terompet
      flute|seruling
      saxophone|saksofon
      harp|harpa
      microphone|mikrofon
      music note|not balok
      concert|konser
      band|band
      choir|paduan suara
      conductor|dirigen
      accordion|akordeon
      tambourine|rebana
      xylophone|gambang
      harmonica|harmonika
      ukulele|ukulele
      bell|lonceng
      dj|dj
      karaoke|karaoke
      record player|pemutar piringan hitam
      metronome|metronom
      cello|selo
      triangle|triangel
      electric guitar|gitar listrik
      bass guitar|gitar bas
      drumsticks|stik drum
      organ|organ
      trombone|trombon
      tuba|tuba
      clarinet|klarinet
      bagpipes|bagpipe
      banjo|banjo
      maracas|marakas
      cymbals|simbal
      gong|gong
      bongo|bongo
      recorder|rekorder
      double bass|kontrabas
      music box|kotak musik
      jukebox|jukebox
      vinyl record|piringan hitam
      stage|panggung
      spotlight|lampu sorot
      sheet music|partitur
      treble clef|kunci g
      rock star|bintang rock
      opera singer|penyanyi opera
      rapper|rapper
      amplifier|ampli
      guitar pick|pick gitar
      tuning fork|garpu tala
      music festival|festival musik
      marching band|drum band
      orchestra|orkestra
      disco ball|bola disko
      grand piano|piano besar
      street musician|pengamen
      music video|video musik
    `),
  },
  {
    id: "school",
    name: { en: "School & office", id: "Sekolah & kantor" },
    words: w(`
      pencil|pensil
      eraser|penghapus
      ruler|penggaris
      book|buku
      notebook|buku tulis
      backpack|tas sekolah
      blackboard|papan tulis
      chalk|kapur
      glue|lem
      stapler|stapler
      paper clip|penjepit kertas
      globe|globe
      map|peta
      calculator|kalkulator
      microscope|mikroskop
      desk|meja belajar
      envelope|amplop
      calendar|kalender
      folder|map
      pen|pulpen
      crayon|krayon
      paintbrush|kuas
      diploma|ijazah
      homework|pekerjaan rumah
      school bell|bel sekolah
      exam|ujian
      sharpener|rautan
      highlighter|stabilo
      computer|komputer
      pencil case|kotak pensil
      protractor|busur derajat
      drawing compass|jangka
      test tube|tabung reaksi
      magnifying glass|kaca pembesar
      whiteboard|papan putih
      marker|spidol
      sticky note|kertas tempel
      tape|selotip
      hole punch|pelubang kertas
      clipboard|papan klip
      filing cabinet|lemari arsip
      office chair|kursi kantor
      briefcase|tas kerja
      name tag|tanda pengenal
      rubber stamp|stempel
      report card|rapor
      graduation cap|topi wisuda
      locker|loker
      flag ceremony|upacara bendera
      abacus|sempoa
      dictionary|kamus
      paper airplane|pesawat kertas
      meeting|rapat
      presentation|presentasi
      shredder|penghancur kertas
      photocopier|mesin fotokopi
      desk lamp|lampu meja
      student|murid
      lab coat|jas lab
      school uniform|seragam sekolah
      sketchbook|buku sketsa
      ink bottle|botol tinta
    `),
  },
  {
    id: "fantasy",
    name: { en: "Fantasy", id: "Fantasi" },
    words: w(`
      dragon|naga
      unicorn|unicorn
      wizard|penyihir
      mermaid|putri duyung
      fairy|peri
      giant|raksasa
      magic wand|tongkat sihir
      crystal ball|bola kristal
      potion|ramuan
      sword|pedang
      shield|perisai
      knight|kesatria
      princess|putri
      monster|monster
      phoenix|burung api
      troll|troll
      genie|jin
      flying carpet|karpet terbang
      king|raja
      queen|ratu
      prince|pangeran
      throne|takhta
      dwarf|kurcaci
      elf|elf
      centaur|centaur
      pegasus|pegasus
      griffin|griffin
      cyclops|cyclops
      minotaur|minotaur
      goblin|goblin
      spell book|buku mantra
      magic mirror|cermin ajaib
      enchanted forest|hutan ajaib
      magic beanstalk|pohon kacang ajaib
      glass slipper|sepatu kaca
      pumpkin carriage|kereta labu
      frog prince|pangeran kodok
      magic lamp|lampu ajaib
      dragon egg|telur naga
      wishing well|sumur permohonan
      tooth fairy|peri gigi
      talking tree|pohon bicara
      golden goose|angsa emas
      portal|portal
      time machine|mesin waktu
      invisibility cloak|jubah tak terlihat
      yeti|yeti
      angel|malaikat
      cupid|cupid
      spell|mantra
      fairy wings|sayap peri
      suit of armor|baju zirah
      drawbridge|jembatan angkat
      moat|parit kastil
      gingerbread house|rumah permen
      golden egg|telur emas
      magic key|kunci ajaib
      fortune teller|peramal
      wizard tower|menara penyihir
      sea serpent|ular laut raksasa
      castle dungeon|penjara bawah tanah
    `),
  },
  {
    id: "space",
    name: { en: "Space", id: "Luar angkasa" },
    words: w(`
      rocket|roket
      planet|planet
      star|bintang
      moon|bulan
      sun|matahari
      alien|alien
      ufo|piring terbang
      comet|komet
      meteor|meteor
      black hole|lubang hitam
      galaxy|galaksi
      satellite|satelit
      telescope|teleskop
      space station|stasiun luar angkasa
      saturn|saturnus
      earth|bumi
      mars|mars
      crater|kawah
      spacesuit|baju astronaut
      constellation|rasi bintang
      eclipse|gerhana
      shooting star|bintang jatuh
      asteroid|asteroid
      moon landing|pendaratan di bulan
      jupiter|jupiter
      venus|venus
      mercury|merkurius
      neptune|neptunus
      uranus|uranus
      pluto|pluto
      space shuttle|pesawat ulang-alik
      mars rover|kendaraan penjelajah mars
      launch pad|landasan peluncuran
      countdown|hitung mundur
      zero gravity|tanpa gravitasi
      space helmet|helm astronaut
      oxygen tank|tabung oksigen
      orbit|orbit
      solar system|tata surya
      milky way|bima sakti
      nebula|nebula
      supernova|supernova
      crescent moon|bulan sabit
      full moon|bulan purnama
      flag on the moon|bendera di bulan
      big dipper|bintang biduk
      northern lights|aurora
      meteor shower|hujan meteor
      spacewalk|berjalan di luar angkasa
      mission control|pusat kendali misi
      space probe|wahana antariksa
      space capsule|kapsul luar angkasa
      alien abduction|penculikan alien
      jetpack|jetpack
      stargazing|mengamati bintang
      planetarium|planetarium
      space food|makanan astronaut
      robot arm|lengan robot
    `),
  },
  {
    id: "holidays",
    name: { en: "Holidays & celebrations", id: "Hari raya & perayaan" },
    words: w(`
      birthday cake|kue ulang tahun
      balloon|balon
      gift|kado
      fireworks|kembang api
      party hat|topi pesta
      christmas tree|pohon natal
      snowman|manusia salju
      ketupat|ketupat
      lantern|lentera
      firecracker|petasan
      wedding|pernikahan
      confetti|konfeti
      costume|kostum
      mask|topeng
      parade|pawai
      flag|bendera
      easter egg|telur paskah
      red envelope|angpao
      dragon dance|barongsai
      sack race|balap karung
      cracker eating contest|lomba makan kerupuk
      greeting card|kartu ucapan
      piñata|pinata
      santa claus|sinterklas
      reindeer|rusa kutub
      sleigh|kereta salju
      christmas stocking|kaus kaki natal
      gingerbread man|kue jahe
      christmas wreath|karangan bunga natal
      christmas ornament|hiasan natal
      christmas lights|lampu natal
      new year|tahun baru
      party horn|terompet tahun baru
      graduation|wisuda
      valentine|valentine
      love letter|surat cinta
      bouquet|buket bunga
      bride|pengantin wanita
      groom|pengantin pria
      wedding cake|kue pengantin
      eid|lebaran
      homecoming trip|mudik
      breaking the fast|buka puasa
      chinese new year|imlek
      mooncake|kue bulan
      independence day|hari kemerdekaan
      tug of war|tarik tambang
      marble spoon race|lomba kelereng
      roast turkey|kalkun panggang
      picnic|piknik
      birthday party|pesta ulang tahun
      surprise party|pesta kejutan
      barbecue|barbeku
      sparkler|kembang api lidi
      wrapping paper|kertas kado
      party invitation|undangan pesta
      hampers|parsel
    `),
  },
  {
    id: "toys",
    name: { en: "Toys & games", id: "Mainan & permainan" },
    words: w(`
      kite|layang-layang
      yo-yo|yoyo
      teddy bear|boneka beruang
      doll|boneka
      ball|bola
      jigsaw puzzle|puzzle
      dice|dadu
      playing cards|kartu remi
      marbles|kelereng
      spinning top|gasing
      toy car|mobil-mobilan
      swing|ayunan
      slide|perosotan
      seesaw|jungkat-jungkit
      jump rope|lompat tali
      building blocks|balok mainan
      water gun|pistol air
      rubber duck|bebek karet
      hula hoop|simpai
      robot toy|robot mainan
      board game|permainan papan
      hide and seek|petak umpet
      rocking horse|kuda goyang
      bubble wand|gelembung sabun
      trampoline|trampolin
      rubik cube|kubus rubik
      action figure|figur aksi
      hand puppet|boneka tangan
      toy train|kereta mainan
      toy soldier|tentara mainan
      jack in the box|kotak kejutan
      slinky|per mainan
      kaleidoscope|kaleidoskop
      sandbox|bak pasir
      sandcastle|istana pasir
      frisbee|frisbee
      boomerang|bumerang
      slingshot|ketapel
      dollhouse|rumah boneka
      remote control car|mobil remote
      pinwheel|kincir kertas
      play dough|lilin mainan
      coloring book|buku mewarnai
      sticker|stiker
      tic-tac-toe|tic-tac-toe
      hopscotch|engklek
      playing tag|main kejar-kejaran
      musical chairs|rebutan kursi
      dominoes|domino
      checkers|dam
      snakes and ladders|ular tangga
      pogo stick|tongkat pogo
      stilts|egrang
      water balloon|balon air
      claw machine|mesin capit
      toy box|kotak mainan
      paper boat|perahu kertas
      origami|origami
      fidget spinner|fidget spinner
      toy drum|drum mainan
    `),
  },
  {
    id: "ocean",
    name: { en: "Ocean life", id: "Kehidupan laut" },
    words: w(`
      octopus|gurita
      shark|hiu
      whale|paus
      dolphin|lumba-lumba
      jellyfish|ubur-ubur
      starfish|bintang laut
      crab|kepiting
      seahorse|kuda laut
      clownfish|ikan badut
      sea turtle|penyu
      coral|terumbu karang
      seaweed|rumput laut
      seashell|kerang
      lobster|lobster
      squid|cumi-cumi
      stingray|ikan pari
      pufferfish|ikan buntal
      scuba diver|penyelam
      pearl|mutiara
      seal|anjing laut
      sea urchin|bulu babi
      swordfish|ikan todak
      walrus|walrus
      sea lion|singa laut
      orca|paus pembunuh
      manta ray|pari manta
      eel|belut
      hermit crab|kelomang
      giant clam|kima
      oyster|tiram
      sea cucumber|teripang
      sea anemone|anemon laut
      narwhal|narwhal
      hammerhead shark|hiu martil
      whale shark|hiu paus
      flying fish|ikan terbang
      tuna|tuna
      salmon|salmon
      sardine|sardin
      goldfish|ikan mas koki
      fishing net|jaring ikan
      fishing boat|kapal nelayan
      buoy|pelampung
      life jacket|jaket pelampung
      snorkel|snorkel
      diving mask|masker selam
      flippers|kaki katak
      seagull|burung camar
      pelican|pelikan
      surfboard|papan selancar
      barracuda|barakuda
      school of fish|kawanan ikan
      beluga|beluga
      dugong|duyung
      sea snake|ular laut
      blue whale|paus biru
    `),
  },
  {
    id: "indonesia",
    name: { en: "Indonesian culture", id: "Budaya Indonesia" },
    words: w(`
      batik|batik
      shadow puppet|wayang
      kris|keris
      rice field|sawah
      tempeh|tempe
      garuda|garuda
      peci|peci
      kebaya|kebaya
      reog|reog
      rendang|rendang
      coconut tree|pohon kelapa
      traditional house|rumah adat
      boat race|pacu jalur
      climbing pole contest|panjat pinang
      sambal|sambal
      bamboo|bambu
      mortar and pestle|cobek
      coffee shop|warung kopi
      motorbike taxi|ojek
      angklung|angklung
      gamelan|gamelan
      kendang|kendang
      sasando|sasando
      gado-gado|gado-gado
      soto|soto
      martabak|martabak
      padang rice|nasi padang
      tumpeng|tumpeng
      klepon|klepon
      jamu|jamu
      corpse flower|bunga bangkai
      jasmine|melati
      songket|songket
      blangkon|blangkon
      ulos|ulos
      kecak dance|tari kecak
      saman dance|tari saman
      barong|barong
      ondel-ondel|ondel-ondel
      kuda lumping|kuda lumping
      congklak|congklak
      night market|pasar malam
      satay cart|gerobak sate
      bedug|bedug
      kentongan|kentongan
      lontong|lontong
      pempek|pempek
      rujak|rujak
      siomay|siomay
      kerak telor|kerak telor
      onde-onde|onde-onde
      traditional market|pasar tradisional
      batik pen|canting
      bamboo cannon|meriam bambu
      torch parade|pawai obor
      chicken noodles|mie ayam
      layered cake|kue lapis
      serabi|serabi
      ginger drink|wedang jahe
      es teler|es teler
      wayang golek|wayang golek
      becak driver|tukang becak
    `),
  },
  {
    id: "fruitveg",
    name: { en: "Fruits & vegetables", id: "Buah & sayur" },
    words: w(`
      banana|pisang
      apple|apel
      watermelon|semangka
      pineapple|nanas
      durian|durian
      mango|mangga
      grapes|anggur
      carrot|wortel
      corn|jagung
      chili|cabai
      tomato|tomat
      avocado|alpukat
      strawberry|stroberi
      coconut|kelapa
      orange|jeruk
      lemon|lemon
      lime|jeruk nipis
      cherry|ceri
      peach|persik
      pear|pir
      plum|plum
      kiwi|kiwi
      papaya|pepaya
      guava|jambu biji
      rambutan|rambutan
      mangosteen|manggis
      snake fruit|salak
      jackfruit|nangka
      dragon fruit|buah naga
      starfruit|belimbing
      blueberry|bluberi
      raspberry|raspberi
      pomegranate|delima
      melon|melon
      dates|kurma
      lychee|leci
      longan|kelengkeng
      passion fruit|markisa
      soursop|sirsak
      potato|kentang
      sweet potato|ubi
      cassava|singkong
      onion|bawang bombai
      garlic|bawang putih
      shallot|bawang merah
      cabbage|kubis
      lettuce|selada
      broccoli|brokoli
      cauliflower|kembang kol
      spinach|bayam
      cucumber|mentimun
      eggplant|terong
      pumpkin|labu
      peas|kacang polong
      green beans|buncis
      bean sprouts|tauge
      ginger|jahe
      celery|seledri
      radish|lobak
      beetroot|bit
      bell pepper|paprika
      asparagus|asparagus
      zucchini|zukini
      spring onion|daun bawang
      olive|zaitun
      almond|almon
      walnut|kenari
      okra|okra
      bitter melon|pare
      water spinach|kangkung
      long beans|kacang panjang
      fruit basket|keranjang buah
      banana peel|kulit pisang
      pickle|acar
      sugarcane|tebu
      tamarind|asam jawa
      lemongrass|serai
      chestnut|kastanye
      apricot|aprikot
      grapefruit|jeruk bali
      cranberry|kranberi
    `),
  },
  {
    id: "kitchen",
    name: { en: "Kitchen & cooking", id: "Dapur & memasak" },
    words: w(`
      frying pan|wajan
      stove|kompor
      spoon|sendok
      fork|garpu
      plate|piring
      refrigerator|kulkas
      knife|pisau
      chopsticks|sumpit
      bowl|mangkuk
      drinking glass|gelas
      cooking pot|panci
      kettle|ketel
      rice cooker|penanak nasi
      oven|oven
      microwave|microwave
      toaster|pemanggang roti
      blender|blender
      mixer|mixer
      whisk|pengocok telur
      rolling pin|penggiling adonan
      spatula|spatula
      ladle|sendok sayur
      cutting board|talenan
      grater|parutan
      peeler|pengupas
      can opener|pembuka kaleng
      bottle opener|pembuka botol
      colander|saringan
      measuring cup|gelas ukur
      kitchen scale|timbangan dapur
      oven mitt|sarung tangan oven
      apron|celemek
      chef hat|topi koki
      kitchen sink|bak cuci piring
      dish rack|rak piring
      dish soap|sabun cuci piring
      sponge|spons
      cupboard|lemari dapur
      freezer|lemari pembeku
      dishwasher|mesin cuci piring
      salt shaker|tempat garam
      jar|toples
      pot lid|tutup panci
      steamer|kukusan
      barbecue grill|panggangan
      skewer|tusuk sate
      tongs|penjepit makanan
      kitchen timer|pengatur waktu dapur
      recipe book|buku resep
      ice cube tray|cetakan es
      cooking oil|minyak goreng
      dough|adonan
      cake pan|cetakan kue
      cookie cutter|cetakan kue kering
      pressure cooker|panci presto
      napkin|serbet
      tablecloth|taplak meja
      tray|nampan
      jug|kendi
      gas canister|tabung gas
      wooden spoon|sendok kayu
      teacup|cangkir teh
      saucepan|panci kecil
      food cover|tudung saji
    `),
  },
  {
    id: "tools",
    name: { en: "Tools & DIY", id: "Perkakas & pertukangan" },
    words: w(`
      hammer|palu
      screw|sekrup
      screwdriver|obeng
      wrench|kunci inggris
      pliers|tang
      saw|gergaji
      drill|bor
      tape measure|meteran
      toolbox|kotak perkakas
      paint roller|rol cat
      paint can|kaleng cat
      shovel|sekop
      axe|kapak
      pickaxe|beliung
      chisel|pahat
      sandpaper|amplas
      glue gun|lem tembak
      duct tape|lakban
      rope|tali
      chain|rantai
      nut and bolt|mur dan baut
      workbench|meja kerja
      safety goggles|kacamata pelindung
      hard hat|helm proyek
      wheelbarrow|gerobak dorong
      crowbar|linggis
      sledgehammer|palu godam
      mallet|palu kayu
      clamp|penjepit
      tool belt|sabuk perkakas
      cement|semen
      brick|batu bata
      trowel|sendok semen
      funnel|corong
      oil can|kaleng oli
      car jack|dongkrak
      tire|ban
      air pump|pompa
      welding mask|topeng las
      chainsaw|gergaji mesin
      pocket knife|pisau lipat
      zip tie|kabel tis
      spirit level|waterpass
      wooden plank|papan kayu
      sawdust|serbuk gergaji
      allen key|kunci l
      scaffolding|perancah
      spray paint|cat semprot
      blueprint|cetak biru
      birdhouse|rumah burung
      staple gun|staples tembak
      soldering iron|solder
      wire|kawat
      drill bit|mata bor
      anvil|landasan tempa
      workshop|bengkel
      metal nail|paku
      wood glue|lem kayu
      paint tray|nampan cat
      stepladder|tangga lipat
      tool shed|gudang perkakas
      pipe wrench|kunci pipa
    `),
  },
  {
    id: "farm",
    name: { en: "Farm & garden", id: "Peternakan & kebun" },
    words: w(`
      farm|peternakan
      barn|lumbung
      scarecrow|orang-orangan sawah
      haystack|tumpukan jerami
      pitchfork|garpu rumput
      watering can|gembor
      garden hose|selang air
      rake|garu
      hoe|cangkul
      lawn mower|mesin pemotong rumput
      greenhouse|rumah kaca
      sprout|tunas
      vegetable garden|kebun sayur
      orchard|kebun buah
      beehive|sarang lebah
      chicken coop|kandang ayam
      pigsty|kandang babi
      stable|kandang kuda
      silo|silo
      milking a cow|memerah susu
      egg basket|keranjang telur
      bird nest|sarang burung
      horseshoe|tapal kuda
      saddle|pelana
      corn field|ladang jagung
      wheat|gandum
      rice plant|padi
      harvest|panen
      sickle|arit
      plow|bajak
      fertilizer|pupuk
      compost|kompos
      garden gnome|kurcaci taman
      sprinkler|penyiram otomatis
      flower bed|petak bunga
      hedge|pagar tanaman
      apple tree|pohon apel
      pond|kolam
      lamb|anak domba
      piglet|anak babi
      calf|anak sapi
      seed packet|bungkus benih
      bonsai|bonsai
      gardening gloves|sarung tangan berkebun
      garden shed|gudang kebun
      rabbit hutch|kandang kelinci
      dog house|rumah anjing
      feeding chickens|memberi makan ayam
      weathervane|penunjuk arah angin
      sack of rice|karung beras
      tractor ride|naik traktor
      hay bale|bal jerami
      farm gate|gerbang peternakan
      cow bell|kalung lonceng sapi
      fishpond|empang
      water buffalo plow|bajak kerbau
      sunflower field|ladang bunga matahari
      vegetable stall|lapak sayur
      fruit picking|memetik buah
    `),
  },
  {
    id: "home",
    name: { en: "Bedroom & bathroom", id: "Kamar tidur & kamar mandi" },
    words: w(`
      bed|kasur
      pillow|bantal
      blanket|selimut
      mirror|cermin
      toothbrush|sikat gigi
      toothpaste|pasta gigi
      soap|sabun
      towel|handuk
      bathtub|bak mandi
      shower|pancuran
      toilet|kloset
      toilet paper|tisu toilet
      bathroom sink|wastafel
      shampoo|sampo
      comb|sisir
      hairbrush|sikat rambut
      hair dryer|pengering rambut
      razor|pisau cukur
      bathrobe|jubah mandi
      slippers|sandal kamar
      shower cap|topi mandi
      bathroom scale|timbangan badan
      plunger|penyedot kloset
      alarm clock|jam weker
      bedside table|nakas
      wardrobe|lemari pakaian
      bunk bed|ranjang susun
      crib|boks bayi
      night light|lampu tidur
      pajamas|piyama
      dream catcher|penangkap mimpi
      poster|poster
      diaper|popok
      baby bottle|dot bayi
      pacifier|empeng
      bed sheet|seprai
      mattress|kasur busa
      sleep mask|penutup mata tidur
      nail clipper|gunting kuku
      tweezers|pinset
      cotton bud|cotton bud
      lipstick|lipstik
      perfume|parfum
      deodorant|deodoran
      face mask|masker wajah
      bath mat|keset kamar mandi
      mouthwash|obat kumur
      dental floss|benang gigi
      water dipper|gayung
      squat toilet|wc jongkok
      shower curtain|tirai kamar mandi
      hair clip|jepit rambut
      hair tie|ikat rambut
      bean bag|bean bag
      pillowcase|sarung bantal
      bubble bath|mandi busa
      rubber slippers|sandal karet
      hand mirror|cermin tangan
      makeup bag|tas kosmetik
      hot water bottle|kantong air panas
    `),
  },
  {
    id: "dinosaurs",
    name: { en: "Dinosaurs & prehistoric", id: "Dinosaurus & prasejarah" },
    words: w(`
      t-rex|t-rex
      triceratops|triceratops
      stegosaurus|stegosaurus
      brontosaurus|brontosaurus
      pterodactyl|pterodaktil
      velociraptor|velociraptor
      ankylosaurus|ankylosaurus
      spinosaurus|spinosaurus
      diplodocus|diplodocus
      iguanodon|iguanodon
      plesiosaurus|plesiosaurus
      mosasaurus|mosasaurus
      megalodon|megalodon
      dinosaur egg|telur dinosaurus
      dinosaur footprint|jejak dinosaurus
      dinosaur skeleton|kerangka dinosaurus
      dinosaur nest|sarang dinosaurus
      dinosaur tooth|gigi dinosaurus
      baby dinosaur|bayi dinosaurus
      hatching egg|telur menetas
      fossil|fosil
      amber|ambar
      mammoth|mamut
      saber-toothed tiger|harimau gigi pedang
      giant sloth|kungkang raksasa
      cave bear|beruang gua
      dodo|dodo
      caveman|manusia gua
      cave painting|lukisan gua
      stone axe|kapak batu
      spear|tombak
      stone tools|alat batu
      stone wheel|roda batu
      making fire|membuat api
      hunting|berburu
      animal skin clothes|baju kulit binatang
      archaeologist|arkeolog
      ice age|zaman es
      fern|pakis
      lava|lava
      meteor strike|hantaman meteor
      dinosaur park|taman dinosaurus
      trilobite|trilobita
      dinosaur bones dig|penggalian tulang dinosaurus
      stone hut|gubuk batu
      cave entrance|mulut gua
    `),
  },
  {
    id: "pirates",
    name: { en: "Pirates", id: "Bajak laut" },
    words: w(`
      pirate|bajak laut
      pirate ship|kapal bajak laut
      treasure chest|peti harta karun
      treasure map|peta harta karun
      eye patch|penutup mata bajak laut
      hook hand|tangan kait
      wooden leg|kaki kayu
      skull and crossbones|tengkorak dan tulang silang
      pirate flag|bendera bajak laut
      cannon|meriam
      cannonball|peluru meriam
      gold coins|koin emas
      spyglass|teropong
      compass|kompas
      anchor|jangkar
      ship wheel|kemudi kapal
      walking the plank|berjalan di papan
      captain|kapten
      tricorn hat|topi segitiga
      sail|layar
      mast|tiang kapal
      crow nest|tiang pengintai
      treasure island|pulau harta karun
      message in a bottle|pesan dalam botol
      shipwreck|kapal karam
      kraken|kraken
      barrel|tong
      x marks the spot|tanda silang harta
      jewels|permata
      sword fight|duel pedang
      porthole|jendela kapal
      lifeboat|sekoci
      dagger|belati
      bandana|bandana
      pirate parrot|burung beo bajak laut
      buried treasure|harta karun terkubur
      ship in a storm|kapal diterjang badai
      rope ladder|tangga tali
      pirate captain|kapten bajak laut
      deserted island|pulau terpencil
      ship cabin|kabin kapal
    `),
  },
  {
    id: "camping",
    name: { en: "Camping & outdoors", id: "Berkemah & alam terbuka" },
    words: w(`
      tent|tenda
      campfire|api unggun
      sleeping bag|kantong tidur
      hiking backpack|tas gunung
      roasting marshmallows|memanggang marshmallow
      binoculars|teropong binokular
      hiking|mendaki
      hiking boots|sepatu gunung
      log cabin|kabin kayu
      fishing rod|joran pancing
      hammock|tempat tidur gantung
      firewood|kayu bakar
      sunscreen|tabir surya
      trail sign|papan petunjuk jalan
      tent pegs|pasak tenda
      zipline|flying fox
      rafting|arung jeram
      ghost story|cerita hantu
      scout|pramuka
      knot|simpul tali
      smoke signal|sinyal asap
      walking stick|tongkat jalan
      bird watching|mengamati burung
      mosquito bite|gigitan nyamuk
      cooler box|kotak pendingin
      camping stove|kompor portabel
      canned food|makanan kaleng
      mountain bike|sepeda gunung
      folding chair|kursi lipat
      camp lantern|lampu kemah
      water canteen|botol air minum
      mountain summit|puncak gunung
      waterfall swim|berenang di air terjun
      fishing by the lake|memancing di danau
      picnic blanket|tikar piknik
    `),
  },
  {
    id: "circus",
    name: { en: "Circus & fair", id: "Sirkus & pasar malam" },
    words: w(`
      circus tent|tenda sirkus
      clown|badut
      magician|pesulap
      juggler|pemain juggling
      acrobat|akrobat
      tightrope walker|pemain tali
      trapeze|trapeze
      lion tamer|pawang singa
      ringmaster|pemimpin sirkus
      human cannonball|manusia meriam
      fire breather|penyembur api
      strongman|orang kuat
      ferris wheel|bianglala
      roller coaster|roller coaster
      carousel|komidi putar
      bumper cars|bom-bom car
      face painting|lukis wajah
      ticket|tiket
      ring toss|lempar gelang
      balloon animal|balon binatang
      rabbit in a hat|kelinci dalam topi
      card trick|trik kartu
      teacup ride|cangkir putar
      clown nose|hidung badut
      clown shoes|sepatu badut
      mime|pantomim
      puppet show|pertunjukan boneka
      stilt walker|pemain egrang
      ball balancing seal|anjing laut main bola
      elephant on a ball|gajah di atas bola
      prize stand|stan hadiah
      drop tower|wahana jatuh bebas
      swing ride|wahana ayunan
      ghost train|kereta hantu
      fun house mirror|cermin lucu
      magic show|pertunjukan sulap
      sawing in half|sulap potong badan
      clown car|mobil badut
      big top|tenda besar sirkus
      knife thrower|pelempar pisau
    `),
  },
  {
    id: "spooky",
    name: { en: "Spooky & Halloween", id: "Seram & Halloween" },
    words: w(`
      ghost|hantu
      witch|nenek sihir
      vampire|vampir
      zombie|zombi
      mummy|mumi
      werewolf|manusia serigala
      haunted house|rumah hantu
      skull|tengkorak
      halloween pumpkin|labu halloween
      black cat|kucing hitam
      broomstick|sapu terbang
      cauldron|kuali sihir
      spider web|sarang laba-laba
      graveyard|kuburan
      tombstone|batu nisan
      coffin|peti mati
      pocong|pocong
      kuntilanak|kuntilanak
      tuyul|tuyul
      frankenstein monster|monster frankenstein
      creepy doll|boneka seram
      ghost ship|kapal hantu
      grim reaper|malaikat maut
      eyeball|bola mata
      slime|lendir
      witch hat|topi nenek sihir
      claw|cakar
      fangs|taring
      monster under the bed|monster di bawah kasur
      shadow|bayangan
      ghost hunter|pemburu hantu
      pumpkin carving|mengukir labu
      trick or treat|minta permen halloween
      haunted mirror|cermin berhantu
      bat wings|sayap kelelawar
      candy bucket|ember permen
      creaky door|pintu berderit
      zombie hand|tangan zombi
      ghost in a sheet|hantu kain putih
      spooky forest|hutan angker
      genderuwo|genderuwo
      haunted well|sumur angker
    `),
  },
  {
    id: "heroes",
    name: { en: "Superheroes & powers", id: "Pahlawan super & kekuatan" },
    words: w(`
      superhero|pahlawan super
      cape|jubah
      hero mask|topeng pahlawan
      super strength|kekuatan super
      invisibility|tak terlihat
      x-ray vision|penglihatan sinar-x
      laser eyes|mata laser
      super speed|kecepatan super
      shrinking|mengecil
      teleporting|teleportasi
      mind reading|membaca pikiran
      force field|medan pelindung
      ice powers|kekuatan es
      fire powers|kekuatan api
      shapeshifter|pengubah wujud
      villain|penjahat
      sidekick|rekan pahlawan
      secret lair|markas rahasia
      hero landing|pendaratan pahlawan
      utility belt|sabuk peralatan
      robot suit|baju robot
      signal in the sky|sinyal di langit
      rescue|penyelamatan
      saving a cat from a tree|menyelamatkan kucing di pohon
      giant robot|robot raksasa
      alien invasion|invasi alien
      hero pose|pose pahlawan
      stretchy arms|lengan karet
      talking to animals|bicara dengan hewan
      freezing time|menghentikan waktu
      healing powers|kekuatan penyembuh
      super jump|lompatan super
      flying hero|pahlawan terbang
      secret identity|identitas rahasia
      hero costume change|ganti kostum pahlawan
      lightning powers|kekuatan petir
      wall crawling|merayap di dinding
      underwater breathing|bernapas di air
      catching a falling car|menangkap mobil jatuh
      giant monster attack|serangan monster raksasa
      hero team|tim pahlawan
      superhero logo|lambang pahlawan
      mad scientist|ilmuwan gila
    `),
  },
  {
    id: "landmarks",
    name: { en: "Famous landmarks", id: "Tempat terkenal" },
    words: w(`
      eiffel tower|menara eiffel
      pyramids|piramida
      sphinx|sphinx
      great wall of china|tembok besar china
      statue of liberty|patung liberty
      big ben|big ben
      leaning tower of pisa|menara miring pisa
      colosseum|colosseum
      taj mahal|taj mahal
      sydney opera house|gedung opera sydney
      mount fuji|gunung fuji
      christ the redeemer|patung kristus penebus
      stonehenge|stonehenge
      machu picchu|machu picchu
      golden gate bridge|jembatan golden gate
      mount everest|gunung everest
      niagara falls|air terjun niagara
      grand canyon|grand canyon
      burj khalifa|burj khalifa
      petronas towers|menara kembar petronas
      kaaba|kabah
      borobudur|borobudur
      prambanan|prambanan
      monas|monas
      mount bromo|gunung bromo
      lake toba|danau toba
      tanah lot|tanah lot
      raja ampat|raja ampat
      komodo island|pulau komodo
      merlion|merlion
      angkor wat|angkor wat
      moai statues|patung moai
      mount rushmore|gunung rushmore
      hollywood sign|tulisan hollywood
      white house|gedung putih
      parthenon|parthenon
      london eye|london eye
      tokyo tower|menara tokyo
      uluru|uluru
      kremlin|kremlin
      arc de triomphe|arc de triomphe
      tower bridge|tower bridge
      mount kilimanjaro|gunung kilimanjaro
      jam gadang|jam gadang
      gedung sate|gedung sate
      suramadu bridge|jembatan suramadu
      tower of london|menara london
      great barrier reef|great barrier reef
    `),
  },
  {
    id: "world",
    name: { en: "Around the world", id: "Keliling dunia" },
    words: w(`
      kimono|kimono
      sombrero|sombrero
      igloo|iglo
      kilt|kilt
      beret|baret
      baguette|roti baguette
      wooden shoes|sepatu kayu
      totem pole|totem
      teepee|tipi
      didgeridoo|didgeridoo
      matryoshka doll|boneka matryoshka
      samurai|samurai
      ninja|ninja
      oasis|oasis
      safari|safari
      tuk-tuk|tuk-tuk
      viking|viking
      gladiator|gladiator
      viking ship|kapal viking
      pharaoh|firaun
      flamenco dancer|penari flamenco
      hula dancer|penari hula
      flower necklace|kalung bunga
      poncho|ponco
      red phone booth|kotak telepon merah
      sari|sari
      turban|sorban
      dragon boat|perahu naga
      cherry blossom|bunga sakura
      cuckoo clock|jam kukuk
      lederhosen|lederhosen
      fez|topi fez
      belly dancer|penari perut
      passport|paspor
      suitcase|koper
      postcard|kartu pos
      souvenir|oleh-oleh
      tourist|turis
      cowboy hat|topi koboi
      rice hat|caping
      matador|matador
      gondolier|pendayung gondola
      camel caravan|kafilah unta
      desert tent|tenda gurun
      paper lantern|lampion
      pagoda|pagoda
      mosaic|mozaik
      tulip field|ladang tulip
      airplane ticket|tiket pesawat
      world map|peta dunia
    `),
  },
  {
    id: "emotions",
    name: { en: "Emotions & faces", id: "Perasaan & ekspresi" },
    hard: true,
    words: w(`
      happy|senang
      sad|sedih
      angry|marah
      scared|takut
      surprised|terkejut
      bored|bosan
      sleepy|mengantuk
      confused|bingung
      in love|jatuh cinta
      shy|malu
      proud|bangga
      jealous|cemburu
      nervous|gugup
      excited|bersemangat
      disgusted|jijik
      tired|lelah
      sick|sakit
      hungry|lapar
      thirsty|haus
      freezing cold|kedinginan
      too hot|kepanasan
      dizzy|pusing
      lonely|kesepian
      grumpy|cemberut
      silly face|wajah konyol
      winking|mengedipkan mata
      smirking|menyeringai
      crying with laughter|tertawa sampai menangis
      blushing|tersipu
      mind blown|takjub
      facepalm|tepuk jidat
      eye roll|memutar bola mata
      pouting|manyun
      shocked|kaget
      worried|khawatir
      relieved|lega
      guilty|merasa bersalah
      brave|berani
      curious|penasaran
      embarrassed|merasa malu
      evil laugh|tawa jahat
      smiling|tersenyum
      frowning|mengerutkan dahi
      sticking out tongue|menjulurkan lidah
      poker face|wajah datar
      heartbroken|patah hati
      starstruck|terpesona
      sneaky|licik
      calm|tenang
      stressed|stres
    `),
  },
  {
    id: "idioms",
    name: { en: "Phrases & idioms", id: "Ungkapan & peribahasa" },
    hard: true,
    words: w(`
      crocodile tears|air mata buaya
      two-faced|bermuka dua
      green light|lampu hijau
      blue blood|darah biru
      big-headed|besar kepala
      scapegoat|kambing hitam
      couch potato|kaum rebahan
      easy as turning your hand|membalik telapak tangan
      two birds with one stone|sekali dayung dua pulau terlampaui
      spilled milk|nasi sudah menjadi bubur
      frog in a well|katak dalam tempurung
      empty can rattles loudest|tong kosong nyaring bunyinya
      two peas in a pod|bagai pinang dibelah dua
      something fishy|ada udang di balik batu
      iron fist|tangan besi
      right-hand man|tangan kanan
      stubborn as a rock|kepala batu
      shrimp brain|otak udang
      teacher pet|anak emas
      window shopping|cuci mata
      break the ice|mencairkan suasana
      show your cards|buka kartu
      heart of gold|berhati emas
      work to the bone|banting tulang
      on cloud nine|di atas awan
      bolt from the blue|petir di siang bolong
      apple of my eye|biji mata
      sticky fingers|panjang tangan
      partner in crime|kaki tangan
      time is money|waktu adalah uang
      walls have ears|dinding punya telinga
      money does not grow on trees|uang tidak tumbuh di pohon
      big fish in a small pond|jago kandang
      night owl|begadang
      snake in the grass|musuh dalam selimut
      fish out of water|seperti ikan di darat
      rising star|naik daun
      getting fresh air|makan angin
      eyes bigger than stomach|lapar mata
      helping hand|ringan tangan
      fuel to the fire|menyiram minyak ke api
      under the weather|masuk angin
      cat and mouse|kucing-kucingan
      long face|muka masam
      cold shoulder|buang muka
      busy as a bee|serajin semut
    `),
  },
  {
    id: "duo",
    name: { en: "Two-person actions", id: "Aksi berdua" },
    hard: true,
    words: w(`
      high five|tos
      hugging|berpelukan
      piggyback ride|gendong di punggung
      handshake|berjabat tangan
      arm wrestling|panco
      waltz|berdansa
      pillow fight|perang bantal
      tickling|menggelitik
      whispering|berbisik
      fist bump|tos kepalan
      leapfrog|lompat kodok
      rock paper scissors|suit
      thumb war|adu jempol
      staring contest|adu tatap
      three-legged race|lari tiga kaki
      playing catch|main lempar tangkap
      giving a gift|memberi hadiah
      proposing|melamar
      haircut|potong rambut
      feeding someone|menyuapi
      teaching|mengajar
      arguing|bertengkar
      chasing|mengejar
      racing|balapan
      pushing a swing|mendorong ayunan
      helping someone up|membantu berdiri
      hand kiss greeting|salim
      massage|memijat
      doctor checkup|periksa dokter
      interview|wawancara
      carrying a sofa together|mengangkat sofa bersama
      sharing food|berbagi makanan
      dance battle|adu dansa
      secret handshake|salaman rahasia
      holding hands|bergandengan tangan
      back to back|saling memunggungi
      teasing|mengejek
      taking a photo of someone|memotret teman
      cheek pinch|cubit pipi
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
