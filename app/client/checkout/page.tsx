'use client';

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ShoppingBag, Truck, Store, CheckCircle,
  XCircle, AlertCircle, X, User, CreditCard, ChevronDown,
} from "lucide-react";

type CartItem = {
  id: number;
  quantity: number;
  size: string | null;
  product: { id: number; name: string; price: number; images: string[]; category: string };
};
type DeliveryMethod = "PICKUP" | "DELIVERY";

const DELIVERY_FEE = 7;

// ─── Full country list (200+) ─────────────────────────────────────────────────
const COUNTRIES = [
  { code: "TN", name: "Tunisie",               dial: "+216", flag: "🇹🇳" },
  { code: "DZ", name: "Algérie",               dial: "+213", flag: "🇩🇿" },
  { code: "MA", name: "Maroc",                 dial: "+212", flag: "🇲🇦" },
  { code: "LY", name: "Libye",                 dial: "+218", flag: "🇱🇾" },
  { code: "EG", name: "Égypte",                dial: "+20",  flag: "🇪🇬" },
  { code: "MR", name: "Mauritanie",            dial: "+222", flag: "🇲🇷" },
  { code: "SD", name: "Soudan",                dial: "+249", flag: "🇸🇩" },
  { code: "SO", name: "Somalie",               dial: "+252", flag: "🇸🇴" },
  { code: "DJ", name: "Djibouti",              dial: "+253", flag: "🇩🇯" },
  { code: "KM", name: "Comores",               dial: "+269", flag: "🇰🇲" },
  { code: "SA", name: "Arabie Saoudite",       dial: "+966", flag: "🇸🇦" },
  { code: "AE", name: "Émirats arabes unis",   dial: "+971", flag: "🇦🇪" },
  { code: "QA", name: "Qatar",                 dial: "+974", flag: "🇶🇦" },
  { code: "KW", name: "Koweït",                dial: "+965", flag: "🇰🇼" },
  { code: "BH", name: "Bahreïn",               dial: "+973", flag: "🇧🇭" },
  { code: "OM", name: "Oman",                  dial: "+968", flag: "🇴🇲" },
  { code: "YE", name: "Yémen",                 dial: "+967", flag: "🇾🇪" },
  { code: "IQ", name: "Irak",                  dial: "+964", flag: "🇮🇶" },
  { code: "SY", name: "Syrie",                 dial: "+963", flag: "🇸🇾" },
  { code: "JO", name: "Jordanie",              dial: "+962", flag: "🇯🇴" },
  { code: "LB", name: "Liban",                 dial: "+961", flag: "🇱🇧" },
  { code: "PS", name: "Palestine",             dial: "+970", flag: "🇵🇸" },
  { code: "IL", name: "Israël",                dial: "+972", flag: "🇮🇱" },
  { code: "TR", name: "Turquie",               dial: "+90",  flag: "🇹🇷" },
  { code: "IR", name: "Iran",                  dial: "+98",  flag: "🇮🇷" },
  { code: "AF", name: "Afghanistan",           dial: "+93",  flag: "🇦🇫" },
  { code: "PK", name: "Pakistan",              dial: "+92",  flag: "🇵🇰" },
  { code: "IN", name: "Inde",                  dial: "+91",  flag: "🇮🇳" },
  { code: "BD", name: "Bangladesh",            dial: "+880", flag: "🇧🇩" },
  { code: "LK", name: "Sri Lanka",             dial: "+94",  flag: "🇱🇰" },
  { code: "NP", name: "Népal",                 dial: "+977", flag: "🇳🇵" },
  { code: "BT", name: "Bhoutan",               dial: "+975", flag: "🇧🇹" },
  { code: "MV", name: "Maldives",              dial: "+960", flag: "🇲🇻" },
  { code: "CN", name: "Chine",                 dial: "+86",  flag: "🇨🇳" },
  { code: "JP", name: "Japon",                 dial: "+81",  flag: "🇯🇵" },
  { code: "KR", name: "Corée du Sud",          dial: "+82",  flag: "🇰🇷" },
  { code: "KP", name: "Corée du Nord",         dial: "+850", flag: "🇰🇵" },
  { code: "MN", name: "Mongolie",              dial: "+976", flag: "🇲🇳" },
  { code: "TW", name: "Taïwan",                dial: "+886", flag: "🇹🇼" },
  { code: "HK", name: "Hong Kong",             dial: "+852", flag: "🇭🇰" },
  { code: "MO", name: "Macao",                 dial: "+853", flag: "🇲🇴" },
  { code: "VN", name: "Viêt Nam",              dial: "+84",  flag: "🇻🇳" },
  { code: "TH", name: "Thaïlande",             dial: "+66",  flag: "🇹🇭" },
  { code: "MY", name: "Malaisie",              dial: "+60",  flag: "🇲🇾" },
  { code: "SG", name: "Singapour",             dial: "+65",  flag: "🇸🇬" },
  { code: "ID", name: "Indonésie",             dial: "+62",  flag: "🇮🇩" },
  { code: "PH", name: "Philippines",           dial: "+63",  flag: "🇵🇭" },
  { code: "KH", name: "Cambodge",              dial: "+855", flag: "🇰🇭" },
  { code: "LA", name: "Laos",                  dial: "+856", flag: "🇱🇦" },
  { code: "MM", name: "Myanmar",               dial: "+95",  flag: "🇲🇲" },
  { code: "BN", name: "Brunei",                dial: "+673", flag: "🇧🇳" },
  { code: "TL", name: "Timor oriental",        dial: "+670", flag: "🇹🇱" },
  { code: "KZ", name: "Kazakhstan",            dial: "+7",   flag: "🇰🇿" },
  { code: "UZ", name: "Ouzbékistan",           dial: "+998", flag: "🇺🇿" },
  { code: "TM", name: "Turkménistan",          dial: "+993", flag: "🇹🇲" },
  { code: "KG", name: "Kirghizistan",          dial: "+996", flag: "🇰🇬" },
  { code: "TJ", name: "Tadjikistan",           dial: "+992", flag: "🇹🇯" },
  { code: "AZ", name: "Azerbaïdjan",           dial: "+994", flag: "🇦🇿" },
  { code: "AM", name: "Arménie",               dial: "+374", flag: "🇦🇲" },
  { code: "GE", name: "Géorgie",               dial: "+995", flag: "🇬🇪" },
  { code: "FR", name: "France",                dial: "+33",  flag: "🇫🇷" },
  { code: "BE", name: "Belgique",              dial: "+32",  flag: "🇧🇪" },
  { code: "CH", name: "Suisse",                dial: "+41",  flag: "🇨🇭" },
  { code: "DE", name: "Allemagne",             dial: "+49",  flag: "🇩🇪" },
  { code: "AT", name: "Autriche",              dial: "+43",  flag: "🇦🇹" },
  { code: "NL", name: "Pays-Bas",              dial: "+31",  flag: "🇳🇱" },
  { code: "LU", name: "Luxembourg",            dial: "+352", flag: "🇱🇺" },
  { code: "GB", name: "Royaume-Uni",           dial: "+44",  flag: "🇬🇧" },
  { code: "IE", name: "Irlande",               dial: "+353", flag: "🇮🇪" },
  { code: "ES", name: "Espagne",               dial: "+34",  flag: "🇪🇸" },
  { code: "PT", name: "Portugal",              dial: "+351", flag: "🇵🇹" },
  { code: "IT", name: "Italie",                dial: "+39",  flag: "🇮🇹" },
  { code: "GR", name: "Grèce",                 dial: "+30",  flag: "🇬🇷" },
  { code: "CY", name: "Chypre",                dial: "+357", flag: "🇨🇾" },
  { code: "MT", name: "Malte",                 dial: "+356", flag: "🇲🇹" },
  { code: "SE", name: "Suède",                 dial: "+46",  flag: "🇸🇪" },
  { code: "NO", name: "Norvège",               dial: "+47",  flag: "🇳🇴" },
  { code: "DK", name: "Danemark",              dial: "+45",  flag: "🇩🇰" },
  { code: "FI", name: "Finlande",              dial: "+358", flag: "🇫🇮" },
  { code: "IS", name: "Islande",               dial: "+354", flag: "🇮🇸" },
  { code: "PL", name: "Pologne",               dial: "+48",  flag: "🇵🇱" },
  { code: "CZ", name: "République tchèque",    dial: "+420", flag: "🇨🇿" },
  { code: "SK", name: "Slovaquie",             dial: "+421", flag: "🇸🇰" },
  { code: "HU", name: "Hongrie",               dial: "+36",  flag: "🇭🇺" },
  { code: "RO", name: "Roumanie",              dial: "+40",  flag: "🇷🇴" },
  { code: "BG", name: "Bulgarie",              dial: "+359", flag: "🇧🇬" },
  { code: "HR", name: "Croatie",               dial: "+385", flag: "🇭🇷" },
  { code: "SI", name: "Slovénie",              dial: "+386", flag: "🇸🇮" },
  { code: "RS", name: "Serbie",                dial: "+381", flag: "🇷🇸" },
  { code: "BA", name: "Bosnie-Herzégovine",    dial: "+387", flag: "🇧🇦" },
  { code: "ME", name: "Monténégro",            dial: "+382", flag: "🇲🇪" },
  { code: "MK", name: "Macédoine du Nord",     dial: "+389", flag: "🇲🇰" },
  { code: "AL", name: "Albanie",               dial: "+355", flag: "🇦🇱" },
  { code: "XK", name: "Kosovo",                dial: "+383", flag: "🇽🇰" },
  { code: "UA", name: "Ukraine",               dial: "+380", flag: "🇺🇦" },
  { code: "MD", name: "Moldavie",              dial: "+373", flag: "🇲🇩" },
  { code: "BY", name: "Biélorussie",           dial: "+375", flag: "🇧🇾" },
  { code: "LT", name: "Lituanie",              dial: "+370", flag: "🇱🇹" },
  { code: "LV", name: "Lettonie",              dial: "+371", flag: "🇱🇻" },
  { code: "EE", name: "Estonie",               dial: "+372", flag: "🇪🇪" },
  { code: "RU", name: "Russie",                dial: "+7",   flag: "🇷🇺" },
  { code: "US", name: "États-Unis",            dial: "+1",   flag: "🇺🇸" },
  { code: "CA", name: "Canada",                dial: "+1",   flag: "🇨🇦" },
  { code: "MX", name: "Mexique",               dial: "+52",  flag: "🇲🇽" },
  { code: "GT", name: "Guatemala",             dial: "+502", flag: "🇬🇹" },
  { code: "BZ", name: "Belize",                dial: "+501", flag: "🇧🇿" },
  { code: "HN", name: "Honduras",              dial: "+504", flag: "🇭🇳" },
  { code: "SV", name: "Salvador",              dial: "+503", flag: "🇸🇻" },
  { code: "NI", name: "Nicaragua",             dial: "+505", flag: "🇳🇮" },
  { code: "CR", name: "Costa Rica",            dial: "+506", flag: "🇨🇷" },
  { code: "PA", name: "Panama",                dial: "+507", flag: "🇵🇦" },
  { code: "CU", name: "Cuba",                  dial: "+53",  flag: "🇨🇺" },
  { code: "JM", name: "Jamaïque",              dial: "+1876",flag: "🇯🇲" },
  { code: "HT", name: "Haïti",                 dial: "+509", flag: "🇭🇹" },
  { code: "DO", name: "Rép. dominicaine",      dial: "+1809",flag: "🇩🇴" },
  { code: "PR", name: "Porto Rico",            dial: "+1787",flag: "🇵🇷" },
  { code: "TT", name: "Trinité-et-Tobago",     dial: "+1868",flag: "🇹🇹" },
  { code: "BB", name: "Barbade",               dial: "+1246",flag: "🇧🇧" },
  { code: "CO", name: "Colombie",              dial: "+57",  flag: "🇨🇴" },
  { code: "VE", name: "Venezuela",             dial: "+58",  flag: "🇻🇪" },
  { code: "EC", name: "Équateur",              dial: "+593", flag: "🇪🇨" },
  { code: "PE", name: "Pérou",                 dial: "+51",  flag: "🇵🇪" },
  { code: "BO", name: "Bolivie",               dial: "+591", flag: "🇧🇴" },
  { code: "CL", name: "Chili",                 dial: "+56",  flag: "🇨🇱" },
  { code: "AR", name: "Argentine",             dial: "+54",  flag: "🇦🇷" },
  { code: "UY", name: "Uruguay",               dial: "+598", flag: "🇺🇾" },
  { code: "PY", name: "Paraguay",              dial: "+595", flag: "🇵🇾" },
  { code: "BR", name: "Brésil",                dial: "+55",  flag: "🇧🇷" },
  { code: "GY", name: "Guyana",                dial: "+592", flag: "🇬🇾" },
  { code: "SR", name: "Suriname",              dial: "+597", flag: "🇸🇷" },
  { code: "NG", name: "Nigeria",               dial: "+234", flag: "🇳🇬" },
  { code: "GH", name: "Ghana",                 dial: "+233", flag: "🇬🇭" },
  { code: "SN", name: "Sénégal",               dial: "+221", flag: "🇸🇳" },
  { code: "CI", name: "Côte d'Ivoire",         dial: "+225", flag: "🇨🇮" },
  { code: "ML", name: "Mali",                  dial: "+223", flag: "🇲🇱" },
  { code: "BF", name: "Burkina Faso",          dial: "+226", flag: "🇧🇫" },
  { code: "NE", name: "Niger",                 dial: "+227", flag: "🇳🇪" },
  { code: "TD", name: "Tchad",                 dial: "+235", flag: "🇹🇩" },
  { code: "CM", name: "Cameroun",              dial: "+237", flag: "🇨🇲" },
  { code: "GA", name: "Gabon",                 dial: "+241", flag: "🇬🇦" },
  { code: "CG", name: "Congo",                 dial: "+242", flag: "🇨🇬" },
  { code: "CD", name: "RD Congo",              dial: "+243", flag: "🇨🇩" },
  { code: "CF", name: "Centrafrique",          dial: "+236", flag: "🇨🇫" },
  { code: "GQ", name: "Guinée équatoriale",    dial: "+240", flag: "🇬🇶" },
  { code: "ST", name: "São Tomé-et-Príncipe",  dial: "+239", flag: "🇸🇹" },
  { code: "AO", name: "Angola",                dial: "+244", flag: "🇦🇴" },
  { code: "ZM", name: "Zambie",                dial: "+260", flag: "🇿🇲" },
  { code: "ZW", name: "Zimbabwe",              dial: "+263", flag: "🇿🇼" },
  { code: "MZ", name: "Mozambique",            dial: "+258", flag: "🇲🇿" },
  { code: "MW", name: "Malawi",                dial: "+265", flag: "🇲🇼" },
  { code: "TZ", name: "Tanzanie",              dial: "+255", flag: "🇹🇿" },
  { code: "KE", name: "Kenya",                 dial: "+254", flag: "🇰🇪" },
  { code: "UG", name: "Ouganda",               dial: "+256", flag: "🇺🇬" },
  { code: "RW", name: "Rwanda",                dial: "+250", flag: "🇷🇼" },
  { code: "BI", name: "Burundi",               dial: "+257", flag: "🇧🇮" },
  { code: "ET", name: "Éthiopie",              dial: "+251", flag: "🇪🇹" },
  { code: "ER", name: "Érythrée",              dial: "+291", flag: "🇪🇷" },
  { code: "SS", name: "Soudan du Sud",         dial: "+211", flag: "🇸🇸" },
  { code: "ZA", name: "Afrique du Sud",        dial: "+27",  flag: "🇿🇦" },
  { code: "NA", name: "Namibie",               dial: "+264", flag: "🇳🇦" },
  { code: "BW", name: "Botswana",              dial: "+267", flag: "🇧🇼" },
  { code: "LS", name: "Lesotho",               dial: "+266", flag: "🇱🇸" },
  { code: "SZ", name: "Eswatini",              dial: "+268", flag: "🇸🇿" },
  { code: "MG", name: "Madagascar",            dial: "+261", flag: "🇲🇬" },
  { code: "MU", name: "Maurice",               dial: "+230", flag: "🇲🇺" },
  { code: "SC", name: "Seychelles",            dial: "+248", flag: "🇸🇨" },
  { code: "GN", name: "Guinée",                dial: "+224", flag: "🇬🇳" },
  { code: "GW", name: "Guinée-Bissau",         dial: "+245", flag: "🇬🇼" },
  { code: "SL", name: "Sierra Leone",          dial: "+232", flag: "🇸🇱" },
  { code: "LR", name: "Libéria",               dial: "+231", flag: "🇱🇷" },
  { code: "TG", name: "Togo",                  dial: "+228", flag: "🇹🇬" },
  { code: "BJ", name: "Bénin",                 dial: "+229", flag: "🇧🇯" },
  { code: "GM", name: "Gambie",                dial: "+220", flag: "🇬🇲" },
  { code: "CV", name: "Cap-Vert",              dial: "+238", flag: "🇨🇻" },
  { code: "AU", name: "Australie",             dial: "+61",  flag: "🇦🇺" },
  { code: "NZ", name: "Nouvelle-Zélande",      dial: "+64",  flag: "🇳🇿" },
  { code: "FJ", name: "Fidji",                 dial: "+679", flag: "🇫🇯" },
  { code: "PG", name: "Papouasie-N.-Guinée",   dial: "+675", flag: "🇵🇬" },
  { code: "SB", name: "Îles Salomon",          dial: "+677", flag: "🇸🇧" },
  { code: "VU", name: "Vanuatu",               dial: "+678", flag: "🇻🇺" },
  { code: "WS", name: "Samoa",                 dial: "+685", flag: "🇼🇸" },
  { code: "TO", name: "Tonga",                 dial: "+676", flag: "🇹🇴" },
];

// ─── Tunisia data — toutes les délégations officielles ────────────────────────
const TUNISIA_DATA: Record<string, string[]> = {
  "Ariana": [
    "Ariana Ville", "Ettadhamen", "Ghazela", "Kalâat el-Andalous",
    "Mnihla", "Raoued", "Sidi Thabet",
  ],
  "Béja": [
    "Amdoun", "Béja Nord", "Béja Sud", "Goubellat",
    "Medjez el-Bab", "Nefza", "Téboursouk", "Testour", "Thibar",
  ],
  "Ben Arous": [
    "Ben Arous", "Bou Mhel el-Bassatine", "El Mourouj", "Ezzahra",
    "Fouchana", "Hammam Chott", "Hammam Lif", "Mégrine", "Mornag", "Radès",
  ],
  "Bizerte": [
    "Bizerte Nord", "Bizerte Sud", "El Alia", "Ghar El Melh",
    "Ghezala", "Joumine", "Mateur", "Menzel Bourguiba", "Menzel Jemil",
    "Ras Jebel", "Sejnane", "Tinja", "Utique",
  ],
  "Gabès": [
    "El Hamma", "Gabès Médina", "Gabès Ouest", "Gabès Sud",
    "Ghannouch", "Mareth", "Matmata", "Menzel el-Habib", "Métouia",
    "Nouvelle Matmata",
  ],
  "Gafsa": [
    "Belkhir", "El Guettar", "El Ksar", "Gafsa Nord", "Gafsa Sud",
    "Mdhilla", "Métlaoui", "Redeyef", "Sidi Aïch", "Sned",
  ],
  "Jendouba": [
    "Aïn Draham", "Balta-Bou Aouane", "Bou Salem", "Fernana",
    "Ghardimaou", "Jendouba", "Jendouba Nord", "Oued Mliz", "Tabarka",
  ],
  "Kairouan": [
    "Bouhajla", "Cherarda", "El Alaa", "Haffouz", "Hajeb El Ayoun",
    "Kairouan Nord", "Kairouan Sud", "Nasrallah", "Oueslatia",
    "Sbikha", "Echbika",
  ],
  "Kasserine": [
    "Ezzouhour", "Fériana", "Foussana", "Haïdra", "Hassi El Frid",
    "Jedeliane", "Kasserine Nord", "Kasserine Sud", "Majel Bel Abbès",
    "Sbeitla", "Sbiba", "Thala",
  ],
  "Kébili": [
    "Douz Nord", "Douz Sud", "El Faouar", "Kébili Nord",
    "Kébili Sud", "Souk Lahad",
  ],
  "Le Kef": [
    "Dahmani", "El Ksour", "Jerissa", "Kalaat Khasba", "Kalâat Sinane",
    "Le Kef Est", "Le Kef Ouest", "Nebeur", "Sakiet Sidi Youssef",
    "Sers", "Tajerouine",
  ],
  "Mahdia": [
    "Bou Merdes", "Chebba", "Chorbane", "El Bradaa", "El Jem",
    "Ksour Essef", "Mahdia", "Melloulèche", "Ouled Chamekh", "Sidi Alouane",
  ],
  "Manouba": [
    "Borj El Amri", "Djedeida", "Douar Hicher", "El Battan",
    "Manouba", "Mornaguia", "Oued Ellil", "Tébourba",
  ],
  "Médenine": [
    "Ben Gardane", "Beni Khedache", "Djerba — Ajim", "Djerba — Houmt Souk",
    "Djerba — Midoun", "Médenine Nord", "Médenine Sud",
    "Sidi Makhlouf", "Zarzis",
  ],
  "Monastir": [
    "Bekalta", "Bembla", "Beni Hassen", "Jammel", "Ksar Hellal",
    "Ksibet el-Médiouni", "Moknine", "Monastir", "Ouerdanine",
    "Sahline", "Sayada-Lamta-Bou Hajar", "Téboulba", "Zeramdine",
  ],
  "Nabeul": [
    "Béni Khiar", "Beni Khalled", "Bou Argoub", "Dar Chaâbane el-Fehri",
    "El Haouaria", "El Mida", "Grombalia", "Hammamet", "Kelibia",
    "Korba", "Menzel Bouzelfa", "Menzel Temime", "Nabeul",
    "Soliman", "Takelsa",
  ],
  "Sfax": [
    "Agareb", "Bir Ali Ben Khalifa", "Chihia", "Djebeniana",
    "El Amra", "El Hencha", "Graïba", "Jebiniana", "Kerkennah",
    "Mahres", "Menzel Chaker", "Sakiet Eddaier", "Sakiet Ezzit",
    "Sfax Est", "Sfax Médina", "Sfax Ouest", "Sfax Sud", "Skhira",
  ],
  "Sidi Bouzid": [
    "Bir El Hafey", "Cebbala Ouled Asker", "Jilma", "Maknassy",
    "Menzel Bouzaiane", "Mezzouna", "Ouled Haffouz", "Regueb",
    "Sidi Ali Ben Aoun", "Sidi Bouzid Est", "Sidi Bouzid Ouest",
    "Souk Jedid",
  ],
  "Siliana": [
    "Bargou", "Bouarada", "El Aroussa", "El Krib", "Gaâfour",
    "Kesra", "Makthar", "Rouhia", "Sidi Morched", "Siliana Nord",
    "Siliana Sud",
  ],
  "Sousse": [
    "Akouda", "Bouficha", "Enfidha", "Hammam Sousse", "Hergla",
    "Kalâa Kebira", "Kalâa Seghira", "Kondar", "Msaken",
    "M'saken", "Sidi Bou Ali", "Sidi El Hani", "Sousse Jawhara",
    "Sousse Khzama", "Sousse Médina", "Sousse Riadh",
  ],
  "Tataouine": [
    "Bir Lahmar", "Dehiba", "Ghomrassen", "Remada",
    "Smâr", "Tataouine Nord", "Tataouine Sud",
  ],
  "Tozeur": [
    "Degache", "Hazoua", "Nefta", "Tamaghza", "Tozeur",
  ],
  "Tunis": [
    "Bab Bhar", "Bab Souika", "Carthage", "Djebel Jelloud",
    "El Hrairia", "El Kabaria", "El Kram", "El Menzah",
    "El Mourouj (Tunis)", "El Omrane", "El Omrane Supérieur",
    "El Ouardia", "Ettahrir", "Ezzouhour (Tunis)", "Jebel Jelloud",
    "Kalâat el-Andalous (Tunis)", "La Goulette", "La Marsa",
    "Le Bardo", "Séjoumi", "Sidi Bou Saïd", "Sidi El Béchir",
    "Sidi Hassine", "Tunis Médina",
  ],
  "Zaghouan": [
    "Bir Mcherga", "El Fahs", "En-Nadhour", "Saouaf",
    "Zaghouan", "Zriba",
  ],
};

const GOVERNORATES = Object.keys(TUNISIA_DATA).sort();

// ─── Component ────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [cart, setCart] = useState<{ items: CartItem[] }>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState<{ show: boolean; type: string; message: string }>({
    show: false, type: "success", message: "",
  });

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("PICKUP");

  // Phone
  const [phoneCountry, setPhoneCountry] = useState(COUNTRIES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  // Address
  const [addressCountry, setAddressCountry] = useState("TN");
  const [selectedGov, setSelectedGov] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "",
    streetAddress: "", postalCode: "", notes: "",
    freeCity: "",   // for non-TN countries
  });

  const showAlert = (type: "success" | "error" | "warning", message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "success", message: "" }), 3500);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
        setCountrySearch("");
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => { setSelectedCity(""); }, [selectedGov]);
  useEffect(() => { setSelectedGov(""); setSelectedCity(""); }, [addressCountry]);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data);
        if (!data.items?.length) router.push("/client/panier");
      } else {
        showAlert("error", "Erreur lors du chargement du panier");
      }
    } catch {
      showAlert("error", "Impossible de charger le panier");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      showAlert("warning", "Prénom et nom sont obligatoires"); return;
    }
    if (!form.phone.trim()) {
      showAlert("warning", "Le numéro de téléphone est obligatoire"); return;
    }
    if (deliveryMethod === "DELIVERY") {
      if (addressCountry === "TN" && (!selectedGov || !selectedCity)) {
        showAlert("warning", "Veuillez sélectionner le gouvernorat et la ville"); return;
      }
      if (addressCountry !== "TN" && !form.freeCity.trim()) {
        showAlert("warning", "Veuillez remplir la ville"); return;
      }
    }

    setProcessing(true);
    try {
      const city = addressCountry === "TN" ? selectedCity : form.freeCity;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryMethod,
          deliveryFee: deliveryMethod === "DELIVERY" ? DELIVERY_FEE : 0,
          customerInfo: {
            firstName:   form.firstName.trim(),
            lastName:    form.lastName.trim(),
            phone:       `${phoneCountry.dial} ${form.phone.trim()}`,
            address:     deliveryMethod === "DELIVERY" ? (form.streetAddress.trim() || null) : null,
            city:        deliveryMethod === "DELIVERY" ? (city || null) : null,
            governorate: deliveryMethod === "DELIVERY" && addressCountry === "TN" ? (selectedGov || null) : null,
            postalCode:  deliveryMethod === "DELIVERY" ? (form.postalCode.trim() || null) : null,
            country:     deliveryMethod === "DELIVERY" ? addressCountry : null,
            notes:       form.notes.trim() || null,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showAlert("success", "Commande confirmée avec succès !");
        setTimeout(() => router.push(`/client/orders/${data.orderId}`), 1500);
      } else {
        showAlert("error", data.error || "Erreur lors de la commande");
      }
    } catch {
      showAlert("error", "Erreur réseau");
    } finally {
      setProcessing(false);
    }
  };

  const subtotal = cart.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const deliveryFee = deliveryMethod === "DELIVERY" ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.dial.includes(countrySearch)
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="text-[#D4AF37] text-2xl">Chargement...</div>
    </div>
  );

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@300;400;500;600;700&family=Syne:wght@500;600;700;800&display=swap');

        .co-page { font-family:'Instrument Sans',system-ui,sans-serif; background:#0A0A0A; color:#F8F6F2; }

        .co-glass {
          background:rgba(17,17,17,0.88);
          backdrop-filter:blur(24px);
          border:1px solid rgba(255,255,255,0.08);
        }

        /* ── inputs ── */
        .co-input {
          display:block; width:100%;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.12);
          border-radius:.875rem;
          padding:.9rem 1.2rem;
          font-size:1rem; font-family:inherit;
          color:#F8F6F2; outline:none;
          transition:border-color .25s,box-shadow .25s;
        }
        .co-input::placeholder{color:rgba(255,255,255,0.28);}
        .co-input:focus{border-color:#D4AF37;box-shadow:0 0 0 3px rgba(212,175,55,.18);}
        .co-input:disabled{opacity:.4;cursor:not-allowed;}

        .co-select-wrap{position:relative;}
        .co-select-wrap .co-chevron{
          position:absolute;right:.9rem;top:50%;transform:translateY(-50%);
          pointer-events:none;color:rgba(255,255,255,.35);
        }
        select.co-input{
          appearance:none;-webkit-appearance:none;
          padding-right:2.5rem;cursor:pointer;
        }
        select.co-input option{background:#1a1a1a;color:#F8F6F2;}

        /* ── phone composite ── */
        .co-phone-wrap{
          display:flex;
          border:1px solid rgba(255,255,255,0.12);
          border-radius:.875rem;
          overflow:visible;
          background:rgba(255,255,255,0.05);
          transition:border-color .25s,box-shadow .25s;
          position:relative;
        }
        .co-phone-wrap:focus-within{border-color:#D4AF37;box-shadow:0 0 0 3px rgba(212,175,55,.18);}

        .co-dial-btn{
          display:flex;align-items:center;gap:.4rem;
          padding:.85rem 1rem;
          border:none;border-right:1px solid rgba(255,255,255,.1);
          border-radius:.875rem 0 0 .875rem;
          background:rgba(255,255,255,.06);
          color:#F8F6F2;cursor:pointer;
          font-size:.88rem;font-family:inherit;white-space:nowrap;
          transition:background .2s;min-width:100px;
        }
        .co-dial-btn:hover{background:rgba(255,255,255,.11);}
        .co-flag{font-size:1.2rem;line-height:1;}

        .co-phone-input{
          flex:1;min-width:0;background:transparent;
          border:none;outline:none;
          color:#F8F6F2;font-size:1rem;font-family:inherit;
          padding:.9rem 1rem;
        }
        .co-phone-input::placeholder{color:rgba(255,255,255,.28);}

        /* ── dropdown ── */
        .co-dropdown{
          position:absolute;
          top:calc(100% + 6px);left:0;
          width:300px;max-width:90vw;
          background:#191919;
          border:1px solid rgba(255,255,255,.15);
          border-radius:1rem;
          z-index:200;
          box-shadow:0 20px 60px rgba(0,0,0,.7);
          animation:coDropIn .15s ease;
          overflow:hidden;
        }
        @keyframes coDropIn{
          from{opacity:0;transform:translateY(-6px);}
          to  {opacity:1;transform:translateY(0);}
        }
        .co-dropdown-search{
          width:100%;background:rgba(255,255,255,.05);
          border:none;border-bottom:1px solid rgba(255,255,255,.08);
          color:#F8F6F2;padding:.75rem 1rem;
          font-size:.9rem;font-family:inherit;outline:none;
        }
        .co-dropdown-search::placeholder{color:rgba(255,255,255,.3);}
        .co-dropdown-list{
          max-height:220px;overflow-y:auto;
          scrollbar-width:thin;scrollbar-color:rgba(212,175,55,.3) transparent;
        }
        .co-country-item{
          display:flex;align-items:center;gap:.75rem;
          padding:.65rem 1rem;cursor:pointer;
          font-size:.9rem;transition:background .12s;
        }
        .co-country-item:hover{background:rgba(255,255,255,.07);}
        .co-country-item.sel{background:rgba(212,175,55,.12);}
        .co-country-dial{color:#D4AF37;font-weight:600;margin-left:auto;font-size:.82rem;}
        .co-country-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

        /* ── delivery btns ── */
        .co-dlv-btn{
          padding:1.75rem;border-radius:1.5rem;
          border:1px solid rgba(255,255,255,.1);
          background:transparent;text-align:left;
          cursor:pointer;transition:all .2s;
          color:#F8F6F2;width:100%;
        }
        .co-dlv-btn:hover{border-color:rgba(255,255,255,.28);}
        .co-dlv-btn.active{border-color:#D4AF37;background:rgba(212,175,55,.09);}

        /* ── confirm btn ── */
        .co-confirm-btn{
          margin-top:2rem;width:100%;
          background:linear-gradient(135deg,#D4AF37,#F5E6A3);
          color:#000;font-weight:700;
          padding:1.2rem;border-radius:1rem;
          font-size:1.1rem;font-family:inherit;
          display:flex;align-items:center;justify-content:center;gap:.75rem;
          border:none;cursor:pointer;
          transition:filter .2s;
        }
        .co-confirm-btn:hover:not(:disabled){filter:brightness(1.08);}
        .co-confirm-btn:disabled{opacity:.55;cursor:not-allowed;}

        /* ── alert ── */
        .co-alert{
          position:fixed;top:24px;right:24px;z-index:9999;
          padding:14px 20px;border-radius:14px;
          display:flex;align-items:center;gap:10px;
          font-weight:500;font-size:.95rem;
          box-shadow:0 8px 32px rgba(0,0,0,.5);
          animation:coSlideIn .3s ease;
        }
        @keyframes coSlideIn{from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}}
        .co-alert.success{background:rgba(110,231,183,.13);border:1px solid rgba(110,231,183,.3);color:#6ee7b7;}
        .co-alert.error  {background:rgba(248,113,113,.13);border:1px solid rgba(248,113,113,.3);color:#f87171;}
        .co-alert.warning{background:rgba(251,191, 36,.13);border:1px solid rgba(251,191, 36,.3);color:#fbbf24;}

        .co-label{display:block;font-size:.82rem;color:rgba(255,255,255,.45);margin-bottom:.45rem;letter-spacing:.025em;}

        @media(max-width:768px){
          .co-glass{padding:1.5rem!important;}
          .co-dlv-btn{padding:1.25rem!important;}
          .co-dropdown{width:92vw;}
        }
      `}</style>

      {/* Alert */}
      {alert.show && (
        <div className={`co-alert ${alert.type}`}>
          {alert.type === "success" && <CheckCircle size={18} />}
          {alert.type === "error"   && <XCircle     size={18} />}
          {alert.type === "warning" && <AlertCircle size={18} />}
          <span>{alert.message}</span>
          <button onClick={() => setAlert(a => ({ ...a, show: false }))}
            style={{ marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:"inherit",display:"flex" }}>
            <X size={15} />
          </button>
        </div>
      )}

      <div className="co-page min-h-screen relative overflow-x-hidden">
        {/* Dot grid */}
        <div style={{
          position:"fixed",inset:0,zIndex:0,opacity:.08,pointerEvents:"none",
          backgroundImage:"radial-gradient(#D4AF37 0.8px,transparent 1px)",
          backgroundSize:"60px 60px",
        }}/>

        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
          {/* Back */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/client/panier" className="text-[#D4AF37] flex items-center gap-2 hover:text-white transition-colors">
              <ArrowLeft size={20}/> Retour au panier
            </Link>
            <div className="h-px flex-1 bg-white/10"/>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* ── LEFT ── */}
            <div className="lg:col-span-7 space-y-8">

              {/* Delivery method */}
              <div className="co-glass rounded-3xl p-6 md:p-10">
                <h2 className="text-2xl font-semibold mb-7 flex items-center gap-3">
                  <Truck color="#D4AF37" size={26}/> Mode de livraison
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button type="button" onClick={() => setDeliveryMethod("DELIVERY")}
                    className={`co-dlv-btn ${deliveryMethod==="DELIVERY"?"active":""}`}>
                    <div className="flex justify-between items-start mb-5">
                      <Truck size={30} color={deliveryMethod==="DELIVERY"?"#D4AF37":"rgba(255,255,255,.28)"}/>
                      <span className="text-sm font-bold text-[#D4AF37]">{DELIVERY_FEE} TND</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Livraison à domicile</h3>
                    <p className="text-sm text-white/55">Votre commande vous sera livrée directement</p>
                  </button>
                  <button type="button" onClick={() => setDeliveryMethod("PICKUP")}
                    className={`co-dlv-btn ${deliveryMethod==="PICKUP"?"active":""}`}>
                    <div className="flex justify-between items-start mb-5">
                      <Store size={30} color={deliveryMethod==="PICKUP"?"#D4AF37":"rgba(255,255,255,.28)"}/>
                      <span className="text-sm font-bold text-[#6ee7b7]">Gratuit</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Retrait en magasin</h3>
                    <p className="text-sm text-white/55">Venez récupérer votre commande sur place</p>
                  </button>
                </div>
              </div>

              {/* Personal info */}
              <div className="co-glass rounded-3xl p-6 md:p-10">
                <h2 className="text-2xl font-semibold mb-7 flex items-center gap-3">
                  <User color="#D4AF37" size={26}/> Informations personnelles
                </h2>
                <div className="space-y-5">

                  {/* Prénom + Nom */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="co-label">Prénom *</label>
                      <input type="text" value={form.firstName}
                        onChange={e => setForm(f=>({...f,firstName:e.target.value}))}
                        className="co-input" placeholder="Votre prénom"/>
                    </div>
                    <div>
                      <label className="co-label">Nom *</label>
                      <input type="text" value={form.lastName}
                        onChange={e => setForm(f=>({...f,lastName:e.target.value}))}
                        className="co-input" placeholder="Votre nom de famille"/>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="co-label">Téléphone *</label>
                    <div className="co-phone-wrap" ref={dropdownRef}>
                      <button type="button" className="co-dial-btn"
                        onClick={() => setShowCountryDropdown(v=>!v)}>
                        <span className="co-flag">{phoneCountry.flag}</span>
                        <span>{phoneCountry.dial}</span>
                        <ChevronDown size={13} style={{opacity:.5,marginLeft:"auto"}}/>
                      </button>
                      <input type="tel" value={form.phone}
                        onChange={e => setForm(f=>({...f,phone:e.target.value}))}
                        className="co-phone-input" placeholder="XX XXX XXX"/>

                      {showCountryDropdown && (
                        <div className="co-dropdown">
                          <input type="text" className="co-dropdown-search"
                            placeholder="Rechercher pays ou indicatif..."
                            value={countrySearch}
                            onChange={e => setCountrySearch(e.target.value)}
                            autoFocus/>
                          <div className="co-dropdown-list">
                            {filteredCountries.length === 0 && (
                              <div style={{padding:"1rem",color:"rgba(255,255,255,.4)",fontSize:".88rem",textAlign:"center"}}>
                                Aucun résultat
                              </div>
                            )}
                            {filteredCountries.map(c => (
                              <div key={c.code}
                                className={`co-country-item ${phoneCountry.code===c.code?"sel":""}`}
                                onClick={() => {
                                  setPhoneCountry(c);
                                  setShowCountryDropdown(false);
                                  setCountrySearch("");
                                }}>
                                <span className="co-flag">{c.flag}</span>
                                <span className="co-country-name">{c.name}</span>
                                <span className="co-country-dial">{c.dial}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery address — shown only for DELIVERY */}
                  {deliveryMethod === "DELIVERY" && (
                    <>
                      {/* Address country */}
                      <div>
                        <label className="co-label">Pays de livraison *</label>
                        <div className="co-select-wrap">
                          <select value={addressCountry}
                            onChange={e => setAddressCountry(e.target.value)}
                            className="co-input">
                            {COUNTRIES.map(c => (
                              <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                            ))}
                          </select>
                          <ChevronDown size={15} className="co-chevron"/>
                        </div>
                      </div>

                      {/* Tunisia: Governorate → City */}
                      {addressCountry === "TN" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="co-label">Gouvernorat *</label>
                            <div className="co-select-wrap">
                              <select value={selectedGov}
                                onChange={e => setSelectedGov(e.target.value)}
                                className="co-input">
                                <option value="">— Choisir un gouvernorat —</option>
                                {GOVERNORATES.map(g => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                              <ChevronDown size={15} className="co-chevron"/>
                            </div>
                          </div>
                          <div>
                            <label className="co-label">Ville *</label>
                            <div className="co-select-wrap">
                              <select value={selectedCity}
                                onChange={e => setSelectedCity(e.target.value)}
                                className="co-input"
                                disabled={!selectedGov}>
                                <option value="">
                                  {selectedGov ? "— Choisir une ville —" : "Choisissez d'abord un gouvernorat"}
                                </option>
                                {selectedGov && TUNISIA_DATA[selectedGov]?.map(city => (
                                  <option key={city} value={city}>{city}</option>
                                ))}
                              </select>
                              <ChevronDown size={15} className="co-chevron"/>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Other country: free text city */
                        <div>
                          <label className="co-label">Ville *</label>
                          <input type="text" value={form.freeCity}
                            onChange={e => setForm(f=>({...f,freeCity:e.target.value}))}
                            className="co-input" placeholder="Votre ville"/>
                        </div>
                      )}

                      {/* Street address */}
                      <div>
                        <label className="co-label">
                          {addressCountry==="TN" ? "Adresse (rue, immeuble…)" : "Adresse complète *"}
                        </label>
                        <input type="text" value={form.streetAddress}
                          onChange={e => setForm(f=>({...f,streetAddress:e.target.value}))}
                          className="co-input"
                          placeholder={addressCountry==="TN" ? "Rue, n°, résidence..." : "Adresse complète"}/>
                      </div>

                      {/* Postal code */}
                      <div style={{maxWidth:180}}>
                        <label className="co-label">Code postal</label>
                        <input type="text" value={form.postalCode}
                          onChange={e => setForm(f=>({...f,postalCode:e.target.value}))}
                          className="co-input" placeholder="1000"/>
                      </div>
                    </>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="co-label">Notes / Instructions</label>
                    <textarea value={form.notes} rows={4}
                      onChange={e => setForm(f=>({...f,notes:e.target.value}))}
                      className="co-input" style={{resize:"none"}}
                      placeholder="Instructions spéciales pour la livraison..."/>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT ── */}
            <div className="lg:col-span-5">
              <div className="co-glass rounded-3xl p-6 md:p-10 sticky top-6 lg:top-8">
                <h2 className="text-2xl font-semibold mb-7 flex items-center gap-3">
                  <ShoppingBag color="#D4AF37" size={26}/> Résumé de la commande
                </h2>

                <div className="space-y-5 mb-8 max-h-[380px] overflow-y-auto pr-1"
                  style={{scrollbarWidth:"thin",scrollbarColor:"rgba(212,175,55,.25) transparent"}}>
                  {cart.items.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                        <img src={item.product.images[0]||"/placeholder.jpg"} alt={item.product.name}
                          className="w-full h-full object-cover"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold leading-tight truncate">{item.product.name}</h4>
                        {item.size && <p className="text-white/45 text-sm">Taille : {item.size}</p>}
                        <p className="text-[#D4AF37] font-medium mt-1 text-sm">
                          {item.quantity} × {item.product.price} TND
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Sous-total</span>
                    <span>{subtotal.toFixed(2)} TND</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Livraison</span>
                    <span className={deliveryFee===0?"text-[#6ee7b7]":""}>
                      {deliveryFee===0?"Gratuit":`${deliveryFee} TND`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-5 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-[#D4AF37]">{total.toFixed(2)} TND</span>
                  </div>
                </div>

                <button type="button" onClick={handleSubmit} disabled={processing} className="co-confirm-btn">
                  {processing ? "Traitement en cours..." : <><CreditCard size={20}/> Confirmer la commande</>}
                </button>
                <p className="text-center text-white/35 text-sm mt-4">Paiement à la livraison • Sécurisé</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}