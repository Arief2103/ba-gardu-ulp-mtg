export interface PerformanceTestData {
  nomorForm: string;
  hari: string;
  tanggal: string;
  bulan: string;
  tahun: string;
  tanggalOperasi: string;
  garduInduk: string;
  penyulang: string;
  sectionLine: string;
  branchLine: string;
  nomorGardu: string;
  alamat: string;
  alamatLanjutan: string;

  sutrMerk: string;
  sutrPenampang: string;
  sutrPanjang: string;
  sutmMerk: string;
  sutmPenampang: string;
  sutmPanjang: string;
  sktmMerk: string;
  sktmPenampang: string;
  sktmPanjang: string;

  merkTrafo: string;
  noSeriTrafo: string;
  dayaTrafo: string;
  frekuensiTrafo: string;
  jumlahFase: string;
  kelompokVektor: string;
  teganganPrimer?: string;
  teganganSekunder?: string;
  arusPrimer: string;
  arusSekunder: string;
  impendans: string;
  tapTrafo: string;
  tapTrafoMax: string;
  teganganTap: string;

  caraPendinginan?: string;
  jenisMinyak?: string;
  beratMinyak: string;
  beratTotal: string;
  tingkatIsolasi: string;
  tahunPembuatan: string;
  pabrikPembuat: string;
  konstruksiTrafo?: string;
  transformatorStatus?: string;
  bengkelRekon?: string;
  trafoStatus?: string;

  meggerPrimerRG: string;
  meggerPrimerSG: string;
  meggerPrimerTG: string;
  meggerPrimerRS: string;
  meggerPrimerRT: string;
  meggerPrimerST: string;

  meggerSekunderRG: string;
  meggerSekunderSG: string;
  meggerSekunderTG: string;
  meggerSekunderRS: string;
  meggerSekunderRT: string;
  meggerSekunderST: string;

  meggerPrimSekRR: string;
  meggerPrimSekRS: string;
  meggerPrimSekRT: string;
  meggerPrimSekRN: string;
  meggerPrimSekSR: string;
  meggerPrimSekSS: string;
  meggerPrimSekST: string;
  meggerPrimSekSN: string;
  meggerPrimSekTR: string;
  meggerPrimSekTS: string;
  meggerPrimSekTT: string;
  meggerPrimSekTN: string;

  meggerSutrRG: string;
  meggerSutrSG: string;
  meggerSutrTG: string;
  meggerSutrRS: string;
  meggerSutrRT: string;
  meggerSutrST: string;

  meggerSutrKananRG: string;
  meggerSutrKananSG: string;
  meggerSutrKananTG: string;
  meggerSutrKananRS: string;
  meggerSutrKananRT: string;
  meggerSutrKananST: string;

  meggerSutmRG: string;
  meggerSutmSG: string;
  meggerSutmTG: string;
  meggerSutmRS: string;
  meggerSutmRT: string;
  meggerSutmST: string;

  gttNetral: string;
  gttArester: string;
  gttBody: string;

  jtrUjungNetral: string;

  fudengTrafoX: string;
  fudengTrafoY: string;
  fudengRG: string;
  fudengSG: string;
  fudengTG: string;
  fudengRS: string;
  fudengRT: string;
  fudengST: string;

  voltRN: string;
  voltSN: string;
  voltTN: string;
  voltRS: string;
  voltRT: string;
  voltST: string;

  merkPembatasTrafo: string;
  amperePembatasTrafo: string;
  merkSaklarUtama: string;
  arusNominasiSaklarUtama: string;
  merkPembatasUtama: string;
  amperePembatasUtama: string;
  merkPembatasLyne: string;
  amperePembatasLyne: string;
  merkPembatasLyne2: string;
  amperePembatasLyne2: string;

  arahUrutanFasa: string;
  keteranganOperasi: string;
  jamOperasi: string;

  namaPetugasMadiun: string;
  namaPimpinanUlp: string;
  namaPelaksana: string;
  signaturePetugasMadiun?: string;
  signaturePimpinanUlp?: string;
  signaturePelaksana?: string;
  sutrMemo: string;
  sutrKananMemo: string;
}

export function defaultPerformanceTestData(): PerformanceTestData {
  return {
    nomorForm: "",
    hari: "",
    tanggal: "",
    bulan: "",
    tahun: "",
    tanggalOperasi: "",
    garduInduk: "",
    penyulang: "",
    sectionLine: "",
    branchLine: "",
    nomorGardu: "",
    alamat: "",
    alamatLanjutan: "",

    sutrMerk: "",
    sutrPenampang: "",
    sutrPanjang: "",
    sutmMerk: "",
    sutmPenampang: "",
    sutmPanjang: "",
    sktmMerk: "",
    sktmPenampang: "",
    sktmPanjang: "",

    merkTrafo: "",
    noSeriTrafo: "",
    dayaTrafo: "",
    frekuensiTrafo: "50",
    jumlahFase: "3",
    kelompokVektor: "Yzn5",
    teganganPrimer: "20",
    teganganSekunder: "380/220",
    arusPrimer: "",
    arusSekunder: "",
    impendans: "",
    tapTrafo: "",
    tapTrafoMax: "5",
    teganganTap: "20.000",

    caraPendinginan: "ONAN",
    jenisMinyak: "MINERAL",
    beratMinyak: "",
    beratTotal: "",
    tingkatIsolasi: "",
    tahunPembuatan: "",
    pabrikPembuat: "",
    konstruksiTrafo: "",
    transformatorStatus: "",
    bengkelRekon: "",
    trafoStatus: "Umum",

    meggerPrimerRG: "",
    meggerPrimerSG: "",
    meggerPrimerTG: "",
    meggerPrimerRS: "",
    meggerPrimerRT: "",
    meggerPrimerST: "",

    meggerSekunderRG: "",
    meggerSekunderSG: "",
    meggerSekunderTG: "",
    meggerSekunderRS: "",
    meggerSekunderRT: "",
    meggerSekunderST: "",

    meggerPrimSekRR: "",
    meggerPrimSekRS: "",
    meggerPrimSekRT: "",
    meggerPrimSekRN: "",
    meggerPrimSekSR: "",
    meggerPrimSekSS: "",
    meggerPrimSekST: "",
    meggerPrimSekSN: "",
    meggerPrimSekTR: "",
    meggerPrimSekTS: "",
    meggerPrimSekTT: "",
    meggerPrimSekTN: "",

    meggerSutrRG: "",
    meggerSutrSG: "",
    meggerSutrTG: "",
    meggerSutrRS: "",
    meggerSutrRT: "",
    meggerSutrST: "",

    meggerSutrKananRG: "",
    meggerSutrKananSG: "",
    meggerSutrKananTG: "",
    meggerSutrKananRS: "",
    meggerSutrKananRT: "",
    meggerSutrKananST: "",

    meggerSutmRG: "",
    meggerSutmSG: "",
    meggerSutmTG: "",
    meggerSutmRS: "",
    meggerSutmRT: "",
    meggerSutmST: "",

    gttNetral: "",
    gttArester: "",
    gttBody: "",

    jtrUjungNetral: "",

    fudengTrafoX: "",
    fudengTrafoY: "",
    fudengRG: "",
    fudengSG: "",
    fudengTG: "",
    fudengRS: "",
    fudengRT: "",
    fudengST: "",

    voltRN: "",
    voltSN: "",
    voltTN: "",
    voltRS: "",
    voltRT: "",
    voltST: "",

    merkPembatasTrafo: "",
    amperePembatasTrafo: "",
    merkSaklarUtama: "",
    arusNominasiSaklarUtama: "",
    merkPembatasUtama: "",
    amperePembatasUtama: "",
    merkPembatasLyne: "",
    amperePembatasLyne: "",
    merkPembatasLyne2: "",
    amperePembatasLyne2: "",

    arahUrutanFasa: "KANAN",
    keteranganOperasi: "SUDAH",
    jamOperasi: "",

    namaPetugasMadiun: "",
    namaPimpinanUlp: "",
    namaPelaksana: "",
    signaturePetugasMadiun: "",
    signaturePimpinanUlp: "",
    signaturePelaksana: "",
    sutrMemo: "",
    sutrKananMemo: ""
  };
}
