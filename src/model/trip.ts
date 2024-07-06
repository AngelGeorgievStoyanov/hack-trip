import { Identifiable, IdType, toIsoDate } from "../shared/common-types";


export enum TripTransport {
    Car = 1, Bus, Aircraft, 'Another type'
}

export enum TripTipeOfGroup {
    Family = 1, 'Family with children', Friends, 'Another type'
}

export class Trip implements Identifiable<IdType> {
    constructor(
        public _id: IdType,
        public title: string,
        public description: string,
        public price: string,
        public transport: TripTransport = TripTransport.Car,
        public countPeoples: string,
        public typeOfPeople: TripTipeOfGroup = TripTipeOfGroup.Family,
        public destination: string,
        public coments: string,
        public likes: string[],
        public _ownerId: string,
        public lat: string,
        public lng: string,
        public timeCreated: string = toIsoDate(new Date()),
        public favorites: string[],
        public currency: string,
        public timeEdited?: string,
        public reportTrip?: string[],
        public imageFile?: string[],
        ) { }

}

export enum CurrencyCode {
    AED = 'AED', // UAE Dirham
    AFN = 'AFN', // Afghan Afghani
    ALL = 'ALL', // Albanian Lek
    AMD = 'AMD', // Armenian Dram
    ANG = 'ANG', // Netherlands Antillean Guilder
    AOA = 'AOA', // Angolan Kwanza
    ARS = 'ARS', // Argentine Peso
    AUD = 'AUD', // Australian Dollar
    AWG = 'AWG', // Aruban Florin
    AZN = 'AZN', // Azerbaijani Manat
    BAM = 'BAM', // Bosnia-Herzegovina Convertible Mark
    BBD = 'BBD', // Barbadian Dollar
    BDT = 'BDT', // Bangladeshi Taka
    BGN = 'BGN', // Bulgarian Lev
    BHD = 'BHD', // Bahraini Dinar
    BIF = 'BIF', // Burundian Franc
    BMD = 'BMD', // Bermudian Dollar
    BND = 'BND', // Brunei Dollar
    BOB = 'BOB', // Bolivian Boliviano
    BOV = 'BOV', // Bolivian Mvdol
    BRL = 'BRL', // Brazilian Real
    BSD = 'BSD', // Bahamian Dollar
    BTN = 'BTN', // Bhutanese Ngultrum
    BWP = 'BWP', // Botswanan Pula
    BYN = 'BYN', // Belarusian Ruble
    BZD = 'BZD', // Belize Dollar
    CAD = 'CAD', // Canadian Dollar
    CDF = 'CDF', // Congolese Franc
    CHE = 'CHE', // WIR Euro
    CHF = 'CHF', // Swiss Franc
    CHW = 'CHW', // WIR Franc
    CLF = 'CLF', // Chilean Unit of Account (UF)
    CLP = 'CLP', // Chilean Peso
    CNY = 'CNY', // Chinese Yuan
    COP = 'COP', // Colombian Peso
    COU = 'COU', // Unidad de Valor Real
    CRC = 'CRC', // Costa Rican Colón
    CUC = 'CUC', // Cuban Convertible Peso
    CUP = 'CUP', // Cuban Peso
    CVE = 'CVE', // Cape Verdean Escudo
    CZK = 'CZK', // Czech Koruna
    DJF = 'DJF', // Djiboutian Franc
    DKK = 'DKK', // Danish Krone
    DOP = 'DOP', // Dominican Peso
    DZD = 'DZD', // Algerian Dinar
    EGP = 'EGP', // Egyptian Pound
    ERN = 'ERN', // Eritrean Nakfa
    ETB = 'ETB', // Ethiopian Birr
    EUR = 'EUR', // Euro
    FJD = 'FJD', // Fijian Dollar
    FKP = 'FKP', // Falkland Islands Pound
    FOK = 'FOK', // Faroese Króna
    GBP = 'GBP', // British Pound Sterling
    GEL = 'GEL', // Georgian Lari
    GGP = 'GGP', // Guernsey Pound
    GHS = 'GHS', // Ghanaian Cedi
    GIP = 'GIP', // Gibraltar Pound
    GMD = 'GMD', // Gambian Dalasi
    GNF = 'GNF', // Guinean Franc
    GTQ = 'GTQ', // Guatemalan Quetzal
    GYD = 'GYD', // Guyanese Dollar
    HKD = 'HKD', // Hong Kong Dollar
    HNL = 'HNL', // Honduran Lempira
    HRK = 'HRK', // Croatian Kuna
    HTG = 'HTG', // Haitian Gourde
    HUF = 'HUF', // Hungarian Forint
    IDR = 'IDR', // Indonesian Rupiah
    ILS = 'ILS', // Israeli New Shekel
    IMP = 'IMP', // Isle of Man Pound
    INR = 'INR', // Indian Rupee
    IQD = 'IQD', // Iraqi Dinar
    IRR = 'IRR', // Iranian Rial
    ISK = 'ISK', // Icelandic Króna
    JEP = 'JEP', // Jersey Pound
    JMD = 'JMD', // Jamaican Dollar
    JOD = 'JOD', // Jordanian Dinar
    JPY = 'JPY', // Japanese Yen
    KES = 'KES', // Kenyan Shilling
    KGS = 'KGS', // Kyrgyzstani Som
    KHR = 'KHR', // Cambodian Riel
    KID = 'KID', // Kiribati Dollar
    KMF = 'KMF', // Comorian Franc
    KRW = 'KRW', // South Korean Won
    KWD = 'KWD', // Kuwaiti Dinar
    KYD = 'KYD', // Cayman Islands Dollar
    KZT = 'KZT', // Kazakhstani Tenge
    LAK = 'LAK', // Laotian Kip
    LBP = 'LBP', // Lebanese Pound
    LKR = 'LKR', // Sri Lankan Rupee
    LRD = 'LRD', // Liberian Dollar
    LSL = 'LSL', // Lesotho Loti
    LYD = 'LYD', // Libyan Dinar
    MAD = 'MAD', // Moroccan Dirham
    MDL = 'MDL', // Moldovan Leu
    MGA = 'MGA', // Malagasy Ariary
    MKD = 'MKD', // Macedonian Denar
    MMK = 'MMK', // Myanmar Kyat
    MNT = 'MNT', // Mongolian Tugrik
    MOP = 'MOP', // Macanese Pataca
    MRU = 'MRU', // Mauritanian Ouguiya
    MUR = 'MUR', // Mauritian Rupee
    MVR = 'MVR', // Maldivian Rufiyaa
    MWK = 'MWK', // Malawian Kwacha
    MXN = 'MXN', // Mexican Peso
    MXV = 'MXV', // Mexican Unidad de Inversion (UDI)
    MYR = 'MYR', // Malaysian Ringgit
    MZN = 'MZN', // Mozambican Metical
    NAD = 'NAD', // Namibian Dollar
    NGN = 'NGN', // Nigerian Naira
    NIO = 'NIO', // Nicaraguan Córdoba
    NOK = 'NOK', // Norwegian Krone
    NPR = 'NPR', // Nepalese Rupee
    NZD = 'NZD', // New Zealand Dollar
    OMR = 'OMR', // Omani Rial
    PAB = 'PAB', // Panamanian Balboa
    PEN = 'PEN', // Peruvian Sol
    PGK = 'PGK', // Papua New Guinean Kina
    PHP = 'PHP', // Philippine Peso
    PKR = 'PKR', // Pakistani Rupee
    PLN = 'PLN', // Polish Złoty
    PYG = 'PYG', // Paraguayan Guaraní
    QAR = 'QAR', // Qatari Riyal
    RON = 'RON', // Romanian Leu
    RSD = 'RSD', // Serbian Dinar
    RUB = 'RUB', // Russian Ruble
    RWF = 'RWF', // Rwandan Franc
    SAR = 'SAR', // Saudi Riyal
    SBD = 'SBD', // Solomon Islands Dollar
    SCR = 'SCR', // Seychellois Rupee
    SDG = 'SDG', // Sudanese Pound
    SEK = 'SEK', // Swedish Krona
    SGD = 'SGD', // Singapore Dollar
    SHP = 'SHP', // Saint Helena Pound
    SLL = 'SLL', // Sierra Leonean Leone
    SOS = 'SOS', // Somali Shilling
    SRD = 'SRD', // Surinamese Dollar
    SSP = 'SSP', // South Sudanese Pound
    STN = 'STN', // São Tomé and Príncipe Dobra
    SVC = 'SVC', // Salvadoran Colón
    SYP = 'SYP', // Syrian Pound
    SZL = 'SZL', // Swazi Lilangeni
    THB = 'THB', // Thai Baht
    TJS = 'TJS', // Tajikistani Somoni
    TMT = 'TMT', // Turkmenistani Manat
    TND = 'TND', // Tunisian Dinar
    TOP = 'TOP', // Tongan Pa'anga
    TRY = 'TRY', // Turkish Lira
    TTD = 'TTD', // Trinidad and Tobago Dollar
    TWD = 'TWD', // New Taiwan Dollar
    TZS = 'TZS', // Tanzanian Shilling
    UAH = 'UAH', // Ukrainian Hryvnia
    UGX = 'UGX', // Ugandan Shilling
    USD = 'USD', // United States Dollar
    USN = 'USN', // United States Dollar (Next day)
    USS = 'USS', // United States Dollar (Same day)
    UYI = 'UYI', // Uruguayan Peso en Unidades Indexadas (URUIURUI)
    UYU = 'UYU', // Uruguayan Peso
    UYW = 'UYW', // Unidad Previsional
    UZS = 'UZS', // Uzbekistan Som
    VES = 'VES', // Venezuelan Bolívar Soberano
    VND = 'VND', // Vietnamese Đồng
    VUV = 'VUV', // Vanuatu Vatu
    WST = 'WST', // Samoan Tala
    XAF = 'XAF', // CFA Franc BEAC
    XAG = 'XAG', // Silver Ounce
    XAU = 'XAU', // Gold Ounce
    XBA = 'XBA', // European Composite Unit (EURCO)
    XBB = 'XBB', // European Monetary Unit (E.M.U.-6)
    XBC = 'XBC', // European Unit of Account 9 (E.U.A.-9)
    XBD = 'XBD', // European Unit of Account 17 (E.U.A.-17)
    XCD = 'XCD', // East Caribbean Dollar
    XDR = 'XDR', // Special Drawing Rights
    XOF = 'XOF', // CFA Franc BCEAO
    XPD = 'XPD', // Palladium Ounce
    XPF = 'XPF', // CFP Franc
    XPT = 'XPT', // Platinum Ounce
    XSU = 'XSU', // Sucre
    XTS = 'XTS', // Testing Currency Code
    XUA = 'XUA', // ADB Unit of Account
    XXX = 'XXX', // No currency
    YER = 'YER', // Yemeni Rial
    ZAR = 'ZAR', // South African Rand
    ZMW = 'ZMW', // Zambian Kwacha
    ZWL = 'ZWL', // Zimbabwean Dollar
}

export const CurrencyCodeName = {
     'AED':'UAE Dirham',
     'AFN':'Afghan Afghani',
     'ALL':'Albanian Lek',
     'AMD':'Armenian Dram',
     'ANG':'Netherlands Antillean Guilder',
     'AOA':'Angolan Kwanza',
     'ARS':'Argentine Peso',
     'AUD':'Australian Dollar',
     'AWG':'Aruban Florin',
     'AZN':'Azerbaijani Manat',
     'BAM':'Bosnia-Herzegovina Convertible Mark',
     'BBD':'Barbadian Dollar',
     'BDT':'Bangladeshi Taka',
     'BGN':'Bulgarian Lev',
     'BHD':'Bahraini Dinar',
     'BIF':'Burundian Franc',
     'BMD':'Bermudian Dollar',
     'BND':'Brunei Dollar',
     'BOB':'Bolivian Boliviano',
     'BOV':'Bolivian Mvdol',
     'BRL':'Brazilian Real',
     'BSD':'Bahamian Dollar',
     'BTN':'Bhutanese Ngultrum',
     'BWP':'Botswanan Pula',
     'BYN':'Belarusian Ruble',
     'BZD':'Belize Dollar',
     'CAD':'Canadian Dollar',
     'CDF':'Congolese Franc',
     'CHE':'WIR Euro',
     'CHF':'Swiss Franc',
     'CHW':'WIR Franc',
     'CLF':'Chilean Unit of Account (UF)',
     'CLP':'Chilean Peso',
     'CNY':'Chinese Yuan',
     'COP':'Colombian Peso',
     'COU':'Unidad de Valor Real',
     'CRC':'Costa Rican Colón',
     'CUC':'Cuban Convertible Peso',
     'CUP':'Cuban Peso',
     'CVE':'Cape Verdean Escudo',
     'CZK':'Czech Koruna',
     'DJF':'Djiboutian Franc',
     'DKK':'Danish Krone',
     'DOP':'Dominican Peso',
     'DZD':'Algerian Dinar',
     'EGP':'Egyptian Pound',
     'ERN':'Eritrean Nakfa',
     'ETB':'Ethiopian Birr',
     'EUR':'Euro',
     'FJD':'Fijian Dollar',
     'FKP':'Falkland Islands Pound',
     'FOK':'Faroese Króna',
     'GBP':'British Pound Sterling',
     'GEL':'Georgian Lari',
     'GGP':'Guernsey Pound',
     'GHS':'Ghanaian Cedi',
     'GIP':'Gibraltar Pound',
     'GMD':'Gambian Dalasi',
     'GNF':'Guinean Franc',
     'GTQ':'Guatemalan Quetzal',
     'GYD':'Guyanese Dollar',
     'HKD':'Hong Kong Dollar',
     'HNL':'Honduran Lempira',
     'HRK':'Croatian Kuna',
     'HTG':'Haitian Gourde',
     'HUF':'Hungarian Forint',
     'IDR':'Indonesian Rupiah',
     'ILS':'Israeli New Shekel',
     'IMP':'Isle of Man Pound',
     'INR':'Indian Rupee',
     'IQD':'Iraqi Dinar',
     'IRR':'Iranian Rial',
     'ISK':'Icelandic Króna',
     'JEP':'Jersey Pound',
     'JMD':'Jamaican Dollar',
     'JOD':'Jordanian Dinar',
     'JPY':'Japanese Yen',
     'KES':'Kenyan Shilling',
     'KGS':'Kyrgyzstani Som',
     'KHR':'Cambodian Riel',
     'KID':'Kiribati Dollar',
     'KMF':'Comorian Franc',
     'KRW':'South Korean Won',
     'KWD':'Kuwaiti Dinar',
     'KYD':'Cayman Islands Dollar',
     'KZT':'Kazakhstani Tenge',
     'LAK':'Laotian Kip',
     'LBP':'Lebanese Pound',
     'LKR':'Sri Lankan Rupee',
     'LRD':'Liberian Dollar',
     'LSL':'Lesotho Loti',
     'LYD':'Libyan Dinar',
     'MAD':'Moroccan Dirham',
     'MDL':'Moldovan Leu',
     'MGA':'Malagasy Ariary',
     'MKD':'Macedonian Denar',
     'MMK':'Myanmar Kyat',
     'MNT':'Mongolian Tugrik',
     'MOP':'Macanese Pataca',
     'MRU':'Mauritanian Ouguiya',
     'MUR':'Mauritian Rupee',
     'MVR':'Maldivian Rufiyaa',
     'MWK':'Malawian Kwacha',
     'MXN':'Mexican Peso',
     'MXV':'Mexican Unidad de Inversion (UDI)',
     'MYR':'Malaysian Ringgit',
     'MZN':'Mozambican Metical',
     'NAD':'Namibian Dollar',
     'NGN':'Nigerian Naira',
     'NIO':'Nicaraguan Córdoba',
     'NOK':'Norwegian Krone',
     'NPR':'Nepalese Rupee',
     'NZD':'New Zealand Dollar',
     'OMR':'Omani Rial',
     'PAB':'Panamanian Balboa',
     'PEN':'Peruvian Sol',
     'PGK':'Papua New Guinean Kina',
     'PHP':'Philippine Peso',
     'PKR':'Pakistani Rupee',
     'PLN':'Polish Złoty',
     'PYG':'Paraguayan Guaraní',
     'QAR':'Qatari Riyal',
     'RON':'Romanian Leu',
     'RSD':'Serbian Dinar',
     'RUB':'Russian Ruble',
     'RWF':'Rwandan Franc',
     'SAR':'Saudi Riyal',
     'SBD':'Solomon Islands Dollar',
     'SCR':'Seychellois Rupee',
     'SDG':'Sudanese Pound',
     'SEK':'Swedish Krona',
     'SGD':'Singapore Dollar',
     'SHP':'Saint Helena Pound',
     'SLL':'Sierra Leonean Leone',
     'SOS':'Somali Shilling',
     'SRD':'Surinamese Dollar',
     'SSP':'South Sudanese Pound',
     'STN':'São Tomé and Príncipe Dobra',
     'SVC':'Salvadoran Colón',
     'SYP':'Syrian Pound',
     'SZL':'Swazi Lilangeni',
     'THB':'Thai Baht',
     'TJS':'Tajikistani Somoni',
     'TMT':'Turkmenistani Manat',
     'TND':'Tunisian Dinar',
     'TOP':'Tongan Pa anga',
     'TRY':'Turkish Lira',
     'TTD':'Trinidad and Tobago Dollar',
     'TWD':'New Taiwan Dollar',
     'TZS':'Tanzanian Shilling',
     'UAH':'Ukrainian Hryvnia',
     'UGX':'Ugandan Shilling',
     'USD':'United States Dollar',
     'USN':'United States Dollar (Next day)',
     'USS':'United States Dollar (Same day)',
     'UYI':'Uruguayan Peso en Unidades Indexadas (URUIURUI)',
     'UYU':'Uruguayan Peso',
     'UYW':'Unidad Previsional',
     'UZS':'Uzbekistan Som',
     'VES':'Venezuelan Bolívar Soberano',
     'VND':'Vietnamese Đồng',
     'VUV':'Vanuatu Vatu',
     'WST':'Samoan Tala',
     'XAF':'CFA Franc BEAC',
     'XAG':'Silver Ounce',
     'XAU':'Gold Ounce',
     'XBA':'European Composite Unit (EURCO)',
     'XBB':'European Monetary Unit (E.M.U.-6)',
     'XBC':'European Unit of Account 9 (E.U.A.-9)',
     'XBD':'European Unit of Account 17 (E.U.A.-17)',
     'XCD':'East Caribbean Dollar',
     'XDR':'Special Drawing Rights',
     'XOF':'CFA Franc BCEAO',
     'XPD':'Palladium Ounce',
     'XPF':'CFP Franc',
     'XPT':'Platinum Ounce',
     'XSU':'Sucre',
     'XTS':'Testing Currency Code',
     'XUA':'ADB Unit of Account',
     'XXX':'No currency',
     'YER':'Yemeni Rial',
     'ZAR':'South African Rand',
     'ZMW':'Zambian Kwacha',
     'ZWL':'Zimbabwean Dollar'
}


export class TripCreate implements Omit<Trip, '_id'>{
    constructor(
        public _id: IdType,
        public title: string,
        public description: string,
        public price: string,
        public transport: TripTransport = TripTransport.Car,
        public countPeoples: string,
        public typeOfPeople: TripTipeOfGroup = TripTipeOfGroup.Family,
        public destination: string,
        public coments: string,
        public likes: string[],
        public _ownerId: string,
        public lat: string,
        public lng: string,
        public timeCreated: string = toIsoDate(new Date()),
        public currency: CurrencyCode = CurrencyCode.EUR,
        public favorites: string[],
        public timeEdited?: string,
        public reportTrip?: string[],
        public imageFile?: string[],
    ) { }
}
