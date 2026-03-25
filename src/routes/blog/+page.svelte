<script lang="ts">
    import { onMount } from "svelte";
    import { Plus, Pencil, Trash2, FileText } from "lucide-svelte";
    import { blogApi } from "$lib/api";
    import type { BlogPost } from "$lib/types";
    import { Card, CardBody, Button, Badge } from "$lib/components/ui";
    import { confirm } from "$lib/stores/confirm";
    import { format } from "date-fns";
    import { id } from "date-fns/locale";

    let blogs: BlogPost[] = $state([]);
    let isLoading = $state(true);
    let statusFilter = $state("");

    onMount(async () => {
        await loadData();
    });

    async function loadData() {
        isLoading = true;
        try {
            const res = await blogApi.getAll({
                limit: 100,
                status: statusFilter || undefined,
            });
            blogs = res.data || [];
        } catch (error) {
            console.error("Error loading blogs:", error);
        } finally {
            isLoading = false;
        }
    }

    async function handleDelete(id: string) {
        const ok = await confirm.show({
            title: "Hapus Artikel",
            message:
                "Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.",
            type: "danger",
            confirmText: "Ya, Hapus",
        });

        if (!ok) return;

        try {
            await blogApi.delete(id);
            await loadData();
        } catch (error) {
            console.error("Error deleting blog:", error);
        }
    }

    function handleFilterChange() {
        loadData();
    }

    function formatDate(dateStr: string) {
        return format(new Date(dateStr), "d MMM yyyy", { locale: id });
    }
</script>

<svelte:head>
    <title>Blog - Rosantibike Motorent</title>
</svelte:head>

<div class="page-header">
    <h1>Blog</h1>
    <div class="flex gap-3">
        <select
            class="px-3 py-2 bg-bg-tertiary border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            bind:value={statusFilter}
            onchange={handleFilterChange}
        >
            <option value="">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
        </select>
        <Button href="/blog/new" variant="primary">
            <Plus size={18} />
            Tulis Artikel
        </Button>
    </div>
</div>

{#if isLoading}
    <div class="loading-page">
        <div class="loading-spinner"></div>
    </div>
{:else if blogs.length === 0}
    <div class="empty-state">
        <div class="empty-state-icon">
            <FileText size={48} />
        </div>
        <h3>Belum Ada Artikel</h3>
        <p>Tulis artikel pertama Anda</p>
        <Button href="/blog/new" variant="primary" class="mt-4">
            <Plus size={18} />
            Tulis Artikel
        </Button>
    </div>
{:else}
    <Card>
        <CardBody class="p-0">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="bg-bg-tertiary/30">
                            <th
                                class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border"
                                >Thumbnail</th
                            >
                            <th
                                class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border"
                                >Judul</th
                            >
                            <th
                                class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border"
                                >Kategori</th
                            >
                            <th
                                class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border"
                                >Status</th
                            >
                            <th
                                class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border"
                                >Tanggal</th
                            >
                            <th
                                class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border"
                                >Aksi</th
                            >
                        </tr>
                    </thead>
                    <tbody>
                        {#each blogs as blog}
                            <tr
                                class="border-b border-border hover:bg-bg-tertiary/20 transition-colors"
                            >
                                <td class="px-4 py-3">
                                    {#if blog.thumbnail}
                                        <img
                                            src={blog.thumbnail}
                                            alt={blog.judul}
                                            class="w-20 h-12 object-cover rounded"
                                        />
                                    {:else}
                                        <div
                                            class="w-20 h-12 bg-bg-tertiary rounded flex items-center justify-center"
                                        >
                                            <FileText size={20} class="text-text-muted" />
                                        </div>
                                    {/if}
                                </td>
                                <td class="px-4 py-3">
                                    <div class="font-semibold">
                                        {blog.judul}
                                    </div>
                                    <div class="text-text-muted text-sm">
                                        {blog.slug}
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-sm"
                                    >{blog.kategori?.nama || "-"}</td
                                >
                                <td class="px-4 py-3">
                                    <Badge
                                        variant={blog.status === "TERBIT"
                                            ? "success"
                                            : "warning"}
                                        text={blog.status}
                                    />
                                </td>
                                <td class="px-4 py-3 text-text-muted text-sm"
                                    >{formatDate(blog.createdAt)}</td
                                >
                                <td class="px-4 py-3">
                                    <div class="flex gap-2">
                                        <Button
                                            href="/blog/{blog.id}/edit"
                                            variant="secondary"
                                            size="sm"
                                        >
                                            <Pencil size={16} />
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onclick={() =>
                                                handleDelete(blog.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </CardBody>
    </Card>
{/if}
