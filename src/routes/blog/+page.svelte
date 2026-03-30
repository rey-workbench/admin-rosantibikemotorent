<script lang="ts">
  import { onMount } from "svelte";
  import { Plus, Pencil, Trash2, FileText } from "lucide-svelte";
  import { formatDateShort } from "$lib/utils";
  import { STATUS_ARTIKEL } from "$lib/constants";
  import { blogApi } from "$lib/api";
  import type { BlogPost } from "$lib/types";
  import {
    Card,
    CardBody,
    Button,
    Badge,
    DataTable,
    Loading,
    EmptyState,
  } from "$lib/components/ui";
  import { PageHeader } from "$lib/components/layout";
  import { confirm } from "$lib/stores/confirm";

  let blogs: BlogPost[] = $state([]);
  let isLoading = $state(true);
  let statusFilter = $state("");

  const columns = [
    { key: "thumbnail", label: "Thumbnail" },
    { key: "judul", label: "Judul" },
    { key: "kategori", label: "Kategori" },
    { key: "status", label: "Status" },
    { key: "tanggal", label: "Tanggal" },
    { key: "aksi", label: "Aksi", class: "w-24" },
  ];

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
      message: "Apakah Anda yakin ingin menghapus artikel ini?",
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

  function getStatusVariant(status: string) {
    return status === STATUS_ARTIKEL.TERBIT ? "success" : "warning";
  }
</script>

<svelte:head>
  <title>Blog - Rosantibike Motorent</title>
</svelte:head>

<PageHeader title="Blog">
  <div class="flex gap-3">
    <select
      class="px-3 py-2 bg-bg-tertiary border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
      bind:value={statusFilter}
      onchange={handleFilterChange}
    >
      <option value="">Semua Status</option>
      <option value={STATUS_ARTIKEL.TERBIT}>Published</option>
      <option value={STATUS_ARTIKEL.DRAFT}>Draft</option>
    </select>
    <Button href="/blog/new" variant="primary">
      <Plus size={18} />
      Tulis Artikel
    </Button>
  </div>
</PageHeader>

{#if isLoading}
  <Loading />
{:else if blogs.length === 0}
  <EmptyState
    icon={FileText}
    title="Belum Ada Artikel"
    description="Tulis artikel pertama Anda"
  >
    {#snippet action()}
      <Button href="/blog/new" variant="primary" class="mt-4">
        <Plus size={18} />
        Tulis Artikel
      </Button>
    {/snippet}
  </EmptyState>
{:else}
  <Card>
    <CardBody class="p-0">
      <DataTable {columns}>
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
              <div class="font-semibold">{blog.judul}</div>
              <div class="text-text-muted text-sm">{blog.slug}</div>
            </td>
            <td class="px-4 py-3 text-sm">{blog.kategori?.nama || "-"}</td>
            <td class="px-4 py-3">
              <Badge
                variant={getStatusVariant(blog.status)}
                text={blog.status}
              />
            </td>
            <td class="px-4 py-3 text-text-muted text-sm"
              >{formatDateShort(blog.createdAt)}</td
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
                  onclick={() => handleDelete(blog.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </td>
          </tr>
        {/each}
      </DataTable>
    </CardBody>
  </Card>
{/if}
