<script lang="ts">
    import { onMount } from "svelte";
    import { whatsappApi } from "$lib/api";
    import {
        Card,
        CardBody,
        CardHeader,
        Button,
        Table,
        Badge,
        Modal,
        Input,
        Textarea,
    } from "$lib/components/ui";
    import { Plus, Pencil, Trash2, RefreshCw } from "lucide-svelte";
    import { toast } from "$lib/stores/toast";
    import { confirm } from "$lib/stores/confirm";

    let templates: any[] = [];
    let isLoading = false;
    let showModal = false;
    let isSaving = false;

    // Form State
    let formId = "";
    let formKey = "";
    let formTitle = "";
    let formContent = "";
    let formCategory = "";
    let isEditing = false;

    onMount(() => {
        loadTemplates();
    });

    async function loadTemplates() {
        isLoading = true;
        try {
            templates = await whatsappApi.getAllTemplates();
        } catch (error) {
            console.error("Error loading templates:", error);
            toast.error("Gagal memuat template");
        } finally {
            isLoading = false;
        }
    }

    function openCreateModal() {
        isEditing = false;
        formId = "";
        formKey = "";
        formTitle = "";
        formContent = "";
        formCategory = "";
        showModal = true;
    }

    function openEditModal(template: any) {
        isEditing = true;
        formId = template.id;
        formKey = template.key;
        formTitle = template.title || "";
        formContent = template.content || "";
        formCategory = template.category || "";
        showModal = true;
    }

    async function handleSave() {
        if (!formKey || !formContent) {
            toast.warning("Key dan Content wajib diisi");
            return;
        }

        isSaving = true;
        try {
            if (isEditing) {
                await whatsappApi.updateTemplate(formId, {
                    key: formKey,
                    title: formTitle,
                    content: formContent,
                    category: formCategory,
                });
            } else {
                await whatsappApi.createTemplate({
                    key: formKey,
                    title: formTitle,
                    content: formContent,
                    category: formCategory,
                });
            }
            toast.success(
                isEditing ? "Template diperbarui" : "Template dibuat",
            );
            showModal = false;
            loadTemplates();
        } catch (error) {
            console.error("Error saving template:", error);
            toast.error("Gagal menyimpan template");
        } finally {
            isSaving = false;
        }
    }

    async function handleDelete(id: string, key: string) {
        const ok = await confirm.show({
            title: "Hapus Template",
            message: `Apakah Anda yakin ingin menghapus template "${key}"?`,
            type: "danger",
            confirmText: "Hapus",
        });

        if (!ok) return;

        try {
            await whatsappApi.deleteTemplate(id);
            toast.success("Template dihapus");
            loadTemplates();
        } catch (error) {
            console.error("Error deleting template:", error);
            toast.error("Gagal menghapus template");
        }
    }
</script>

<Card>
    <CardHeader class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Daftar Template</h3>
        <div class="flex gap-2">
            <Button
                variant="secondary"
                onclick={loadTemplates}
                disabled={isLoading}
            >
                <RefreshCw size={18} class={isLoading ? "animate-spin" : ""} />
            </Button>
            <Button variant="primary" onclick={openCreateModal}>
                <Plus size={18} class="mr-2" />
                Buat Template
            </Button>
        </div>
    </CardHeader>
    <CardBody>
        {#if isLoading}
            <div class="text-center py-8">Loading templates...</div>
        {:else if templates.length === 0}
            <div class="text-center py-8 text-text-muted">
                Belum ada template. Silakan buat baru.
            </div>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-bg-surface border-b border-border-color">
                        <tr>
                            <th class="p-3">Key</th>
                            <th class="p-3">Title</th>
                            <th class="p-3">Category</th>
                            <th class="p-3">Content Preview</th>
                            <th class="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each templates as t}
                            <tr
                                class="border-b border-border-color hover:bg-bg-surface/50"
                            >
                                <td class="p-3 font-medium">{t.key}</td>
                                <td class="p-3">{t.title || "-"}</td>
                                <td class="p-3">
                                    {#if t.category}
                                        <Badge
                                            variant="info"
                                            text={t.category}
                                        />
                                    {:else}
                                        -
                                    {/if}
                                </td>
                                <td
                                    class="p-3 truncate max-w-[200px]"
                                    title={t.content}
                                >
                                    {t.content}
                                </td>
                                <td class="p-3 text-right">
                                    <div class="flex justify-end gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onclick={() => openEditModal(t)}
                                        >
                                            <Pencil size={14} />
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onclick={() => handleDelete(t.id, t.key)}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </CardBody>
</Card>

<Modal
    open={showModal}
    onclose={() => (showModal = false)}
    title={isEditing ? "Edit Template" : "Buat Template Baru"}
>
    <div class="space-y-4">
        <Input
            id="key"
            label="Template Key (Unique ID)"
            bind:value={formKey}
            placeholder="e.g. welcome-message"
            disabled={isEditing}
        />
        <Input
            id="title"
            label="Title (Optional)"
            bind:value={formTitle}
            placeholder="Judul Template"
        />
        <Input
            id="category"
            label="Category (Optional)"
            bind:value={formCategory}
            placeholder="Kategori, e.g. marketing, system"
        />
        <Textarea
            id="content"
            label="Content"
            bind:value={formContent}
            placeholder="Isi pesan WhatsApp..."
            rows={5}
        />
        <div class="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onclick={() => (showModal = false)}>
                Batal
            </Button>
            <Button variant="primary" onclick={handleSave} loading={isSaving}>
                Simpan
            </Button>
        </div>
    </div>
</Modal>
