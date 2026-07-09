// Données complètes des 24 gouvernorats tunisiens et leurs délégations (= "villes")
// Source: Ministère de l'Intérieur (opendata) + corrections des codes ISO 3166-2
// Généré le 2026-07-10 -- ne pas modifier à la main, régénérer si besoin de mise à jour

export type TnGovernorate = {
  code: string;
  name: string;
  cities: string[];
};

export const TUNISIA_GOVERNORATES: TnGovernorate[] = [
  {
    code: "TN-12",
    name: "Ariana",
    cities: ["Ariana Ville", "Ettadhamen", "Kalâat el-Andalous", "La Soukra", "M’nihla", "Raoued", "Sidi Thabet"],
  },
  {
    code: "TN-13",
    name: "Ben Arous",
    cities: ["Ben Arous", "Boumhel Bassatine", "Ezzahra", "Fouchana", "Hammam Chatt", "Hammam Lif", "Mornag", "Mourouj", "Mégrine", "M’hamdia", "Nouvelle Médina", "Radès"],
  },
  {
    code: "TN-23",
    name: "Bizerte",
    cities: ["Bizerte Nord", "Bizerte Sud", "El Alia", "Ghar El Melh", "Ghezala", "Jarzouna", "Joumine", "Mateur", "Menzel Bourguiba", "Menzel Jemil", "Ras Jebel", "Sejnane", "Tinja", "Utique"],
  },
  {
    code: "TN-31",
    name: "Béja",
    cities: ["Amdoun", "Béja Nord", "Béja Sud", "Goubellat", "Medjez el-Bab", "Nefza", "Testour", "Tibar", "Téboursouk"],
  },
  {
    code: "TN-81",
    name: "Gabès",
    cities: ["Gabès MEDINA", "Gabès Ouest", "Gabès sud", "Ghannouch", "Hamma", "Mareth", "Matmata", "Matmata nouvelle", "Menzel habib", "Metouia"],
  },
  {
    code: "TN-71",
    name: "Gafsa",
    cities: ["Belkhir", "El Guettar", "El Ksar", "El Mdhilla", "Gafsa Nord", "Gafsa Sud", "Moulares", "Métlaoui", "Redyef", "Sidi Aich", "Sned"],
  },
  {
    code: "TN-32",
    name: "Jendouba",
    cities: ["Ain Drahem", "Balta Bouaouene", "Boussalem", "Fernana", "Ghardimaou", "Jendouba", "Jendouba Nord", "Oued Mliz", "Tabarka"],
  },
  {
    code: "TN-41",
    name: "Kairouan",
    cities: ["Bouhajla", "Chebika", "Cherarda", "El Ala", "Haffouz", "Hajeb El Ayoun", "Kairouan Nord", "Kairouan Sud", "Nasrallah", "Oueslatia", "Sebikha"],
  },
  {
    code: "TN-42",
    name: "Kasserine",
    cities: ["Azzouhour", "El Ayoun", "Feriana", "Foussana", "Hassi ferid", "Hidra", "Jedliane", "Kasserine Nord", "Kasserine Sud", "Mejel Bel Abbes", "Sbiba", "Sbitla", "Tela"],
  },
  {
    code: "TN-33",
    name: "Kef",
    cities: ["Dahmani", "Jerissa", "Kalâa El khasba", "Kalâat sinane", "Kef Est", "Kef Ouest", "Ksour", "Le Sers", "Nebeur", "Sakiet Sidi Youssef", "Tejerouine"],
  },
  {
    code: "TN-73",
    name: "Kébili",
    cities: ["Douz", "El Faouar", "Kébili Nord", "Kébili Sud", "Souk El Ahad"],
  },
  {
    code: "TN-53",
    name: "Mahdia",
    cities: ["Boumerdes", "Chebba", "Chorbane", "Eljem", "Hbira", "Ksour Essef", "Mahdia", "Malloulech", "Ouled Chamekh", "Sidi Alouane", "Souassi"],
  },
  {
    code: "TN-14",
    name: "Manouba",
    cities: ["Battan", "Borj Amri", "Douar Hicher", "Jedaida", "Manouba", "Mornaguia", "Oued Ellil", "Tebourba"],
  },
  {
    code: "TN-82",
    name: "Medenine",
    cities: ["Ben Guerdene", "Béni khedach", "Jerba Ajim", "Jerba Houmet Souk", "Jerba Midoun", "Mednine Nord", "Mednine Sud", "Sidi Makhlouf", "Zazis"],
  },
  {
    code: "TN-52",
    name: "Mounastir",
    cities: ["Bekalta", "Benbla", "Béni Hassan", "Jemmel", "Ksar Helal", "Ksibet Medyouni", "Moknine", "Monastir", "Ouerdanine", "Sahline", "Sayada Lamta Bouhjar", "Teboulba", "Zéramdine"],
  },
  {
    code: "TN-21",
    name: "Nabeul",
    cities: ["Bouârgoub", "Béni Khalled", "Béni Khiar", "Dar Chaâbane Elfehri", "Grombalia", "Hammam Ghezaz", "Hammamet", "Haouaria", "Kelibia", "Korba", "Menzel Bouzelfa", "Menzel Temime", "Mida", "Nabeul", "Slimane", "Takelsa"],
  },
  {
    code: "TN-61",
    name: "Sfax",
    cities: ["Agareb", "Bir Ali Ben Khelifa", "El Amra", "El Hencha", "Ghraiba", "Jebeniana", "Kerkennah", "Mahrès", "Menzel chaker", "Sakiet Eddaier", "Sakiet Ezzit", "Sekhira", "Sfax Ville", "Sfax sud", "Tina"],
  },
  {
    code: "TN-43",
    name: "Sidi Bouzid",
    cities: ["Bir Hfay", "Jelma", "Meknassi", "Menzel Bouzayane", "Mezouna", "Ouled Haffouz", "Regueb", "Sabbalet Ouled Askar", "Sidi Ali Benôun", "Sidi Bouzid Est", "Sidi Bouzid Ouest", "Souk Jedid"],
  },
  {
    code: "TN-34",
    name: "Siliana",
    cities: ["Bargou", "Bouarada", "Bourouis", "El Aroussa", "Gâafour", "Kesra", "Le Krib", "Makther", "Rouhia", "Siliana nord", "Siliana sud"],
  },
  {
    code: "TN-51",
    name: "Sousse",
    cities: ["Akouda", "Bouficha", "Enfidha", "Hammam sousse", "Hergla", "Kalâa Elkébira", "Kalâa Ességhira", "Koundar", "Msaken", "Sidi Bouali", "Sidi Elheni", "Sousse", "Sousse Jawhara", "Sousse Ryadh", "Sousse Ville"],
  },
  {
    code: "TN-83",
    name: "Tataouine",
    cities: ["Bir Lahmer", "Dhehiba", "Ghomrassen", "Remada", "Smar", "Tataouine Nord", "Tataouine Sud"],
  },
  {
    code: "TN-72",
    name: "Tozeur",
    cities: ["Degueche", "Hezoua", "Nefta", "Tameghza", "Tozeur"],
  },
  {
    code: "TN-11",
    name: "Tunis",
    cities: ["Alhrairia", "Azzouhour", "Bab Bhar", "Bab Souika", "Carthage", "Cité Alkhadhra", "El Kabbaria", "El Menzah", "El Omrane", "Ettahrir", "Jebel Jelloud", "La Goulette", "La Marsa", "La Médina", "Le Kram", "Omrane Supérieur", "Ouardia", "Sidi Elbéchir", "Sidi Hsine", "Séjoumi"],
  },
  {
    code: "TN-22",
    name: "Zaghouan",
    cities: ["Bir Mecharga", "Fahs", "Nadhour", "Saouaf", "Zaghouan", "Zériba"],
  },
];