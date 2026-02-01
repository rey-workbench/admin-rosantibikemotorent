<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { ArrowLeft, Save } from "lucide-svelte";
    import { blogApi } from "$lib/api";
    import type { BlogKategori, BlogPost } from "$lib/types";
    import {
        Card,
        CardBody,
        Button,
        Input,
        Select,
        FileUpload,
        RichTextEditor,
    } from "$lib/components/ui";

    let blog: BlogPost | null = $state(null);
    let judul = $state("");
    let konten = $state("");
    let kategoriId = $state("");
    let status = $state<"DRAFT" | "TERBIT">("DRAFT");
    let metaDescription = $state("");
    let tags = $state("");
    let imageFile: File | null = $state(null);
    let imagePreview = $state("");

    let kategoris: BlogKategori[] = $state([]);
    let isLoading = $state(true);
    let isSaving = $state(false);
    let isCommitted = $state(false);

    const blogId = $derived(page.params.id ?? "");

    onMount(async () => {
        try {
            const [blogRes, katRes] = await Promise.all([
                blogApi.getById(blogId),
                blogApi.getKategori(),
            ]);

            blog = blogRes;
            kategoris = katRes || [];

            judul = blog.judul;
            konten = blog.konten;
            kategoriId = blog.kategoriId || "";
            status = blog.status;
            metaDescription = blog.metaDescription || "";
            tags = blog.tags?.map((t) => t.nama).join(", ") || "";
            imagePreview = blog.thumbnail || blog.featuredImage || "";
        } catch (err) {
            console.error("Error loading blog:", err);
        } finally {
            isLoading = false;
        }
    });

    function handleImageChange(file: File) {
        imageFile = file;
        imagePreview = URL.createObjectURL(file);
    }

    async function handleSubmit(e: Event) {
        e.preventDefault();
        isSaving = true;

        try {
            const formData = new FormData();
            formData.append("judul", judul);
            formData.append("konten", konten);
            formData.append("status", status);
            if (kategoriId) formData.append("kategoriId", kategoriId);
            if (metaDescription)
                formData.append("metaDescription", metaDescription);
            if (tags) {
                tags.split(",").forEach((t) => {
                    formData.append("tags[]", t.trim());
                });
            }
            if (imageFile) formData.append("file", imageFile);

            await blogApi.update(blogId, formData);
            isCommitted = true;
            goto("/blog");
        } finally {
            isSaving = false;
        }
    }

    const kategoriOptions = $derived(
        kategoris.map((k) => ({ value: k.id, label: k.nama })),
    );
    const statusOptions = [
        { value: "DRAFT", label: "Draft" },
        { value: "TERBIT", label: "Terbit" },
    ];
</script>

<svelte:head>
    <title>Edit Artikel - Rosantibike Motorent</title>
</svelte:head>

<div class="page-header">
    <div class="flex items-center gap-3">
        <Button href="/blog" variant="secondary">
            <ArrowLeft size={18} />
        </Button>
        <h1>Edit Artikel</h1>
    </div>
</div>

{#if isLoading}
    <div class="loading-page">
        <div class="loading-spinner"></div>
    </div>
{:else}
    <Card>
        <CardBody>
            <form class="flex flex-col gap-5" onsubmit={handleSubmit}>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                        id="judul"
                        label="Judul Artikel"
                        bind:value={judul}
                        placeholder="Masukkan judul artikel"
                        required
                        class="md:col-span-2"
                    />

                    <Select
                        id="kategori"
                        label="Kategori"
                        bind:value={kategoriId}
                        options={kategoriOptions}
                        placeholder="Pilih Kategori"
                    />

                    <Select
                        id="status"
                        label="Status"
                        bind:value={status}
                        options={statusOptions}
                    />

                    <RichTextEditor
                        id="konten"
                        label="Konten"
                        bind:value={konten}
                        placeholder="Tulis konten artikel..."
                        class="md:col-span-2"
                        parentCommit={isCommitted}
                    />

                    <Input
                        id="tags"
                        label="Tags (pisahkan dengan koma)"
                        bind:value={tags}
                        placeholder="motor, rental, tips"
                    />

                    <Input
                        id="meta"
                        label="Meta Description"
                        bind:value={metaDescription}
                        placeholder="Deskripsi untuk SEO"
                    />

                    <FileUpload
                        label="Featured Image"
                        preview={imagePreview}
                        onchange={handleImageChange}
                        class="md:col-span-2"
                    />
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button href="/blog" variant="secondary">Batal</Button>
                    <Button type="submit" variant="primary" loading={isSaving}>
                        <Save size={18} />
                        Simpan Perubahan
                    </Button>
                </div>
            </form>
        </CardBody>
    </Card>
{/if}
