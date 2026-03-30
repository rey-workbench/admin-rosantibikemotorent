export type StatusArtikel = 'DRAFT' | 'TERBIT';

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

export interface BlogKategori {
    id: string;
    nama: string;
    slug: string;
}

export interface BlogTag {
    id: string;
    nama: string;
    slug: string;
}

export interface BlogFilter {
    page?: number;
    limit?: number;
    status?: string;
    kategoriId?: string;
}
