type StatusArtikel = "DRAFT" | "TERBIT";
export interface BlogPost {
  id: string;
  judul: string;
  slug: string;
  konten: string;
  thumbnail?: string;
  featuredImage?: string;
  status: StatusArtikel;
  kategoriId?: string;
  kategori?: BlogKategori;
  tags?: BlogTag[];
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

interface BlogKategori {
  id: string;
  nama: string;
  slug: string;
}

interface BlogTag {
  id: string;
  nama: string;
  slug: string;
}
