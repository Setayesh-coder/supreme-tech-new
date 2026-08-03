// src/constants/partners.ts

export interface Partner {
  id: string;
  name: string;
  logo?: string;
  url?: string;
  order: number;
  isActive: boolean;
}

export const PARTNERS_DATA: Partner[] = [
  {
    id: "1",
    name: "دانشگاه آزاد اسلامی",
    logo: "/partners/iau-svgrepo-com.svg",
    url: "https://iau.ir/",
    order: 1,
    isActive: true,
  },
  {
    id: "2",
    name: "مرکز نوآوری شروع",
    logo: "/partners/smallمرکز-نوآوری-شروع (1).png",
    url: "https://innostart.ir/",
    order: 2,
    isActive: true,
  },
  {
    id: "3",
    name: "انجمن علمی دانشجویی هوافضا",
    logo: "/partners/انجمن-علمی-دانشجویی هوافضا.png",
    url: "https://ias.ir",
    order: 3,
    isActive: true,
  },
  {
    id: "4",
    name: "نشریه علمی تخصصی پر‌واز ",
    logo: "/partners/nashrieh parvaz.png",
    url: "#",
    order: 4,
    isActive: true,
  },
  {
    id: "5",
    name: "مرکز نوآوری دانش‌گستران",
    logo: "/partners/DaneshGostaran-sefid.png",
    url: "https://innosoraya.ir/",
    order: 5,
    isActive: true,
  },
  {
    id: "6",
    name: "مرکز رشد میکروالکترونیک",
    logo: "/partners/Microelectronic (1).png",
    url: "https://microinnovate.ir/",
    order: 6,
    isActive: true,
  },
  {
    id: "7",
    name: "باشگاه پژوهشگران جوان و نخبگان",
    logo: "/partners/cropped-bpj_logo sefid.png",
    url: "https://bpj.srbiau.ac.ir/",
    order: 7,
    isActive: true,
  },
  {
    id: "8",
    name: "معاونت علمی٬ فناوری و اقتصادی دانش بنیان",
    logo: "/partners/معاونت-sefid.png",
    url: "https://isti.ir/",
    order: 8,
    isActive: true,
  },
  {
    id: "9",
    name: "مرکز رشد واحد های فن‌آور",
    logo: "/partners/roshd-sefid.png",
    url: "#",
    order: 9,
    isActive: true,
  },
];
