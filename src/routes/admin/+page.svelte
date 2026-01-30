<script lang="ts">
    import { onMount } from "svelte";
    import { Plus, Pencil, Trash2, UserCog } from "lucide-svelte";
    import { adminApi } from "$lib/api";
    import type { Admin } from "$lib/types";
    import { Card, CardBody, Button, Modal, Input } from "$lib/components/ui";
    import { confirm } from "$lib/stores/confirm";

    let admins: Admin[] = $state([]);
    let isLoading = $state(true);
    let showModal = $state(false);
    let editingAdmin: Admin | null = $state(null);
    let isSaving = $state(false);

    let formUsername = $state("");
    let formNama = $state("");
    let formEmail = $state("");
    let formPassword = $state("");

    onMount(async () => {
        await loadData();
    });

    async function loadData() {
        isLoading = true;
        try {
            admins = await adminApi.getAll();
        } catch (err) {
            console.error("Error loading admins:", err);
        } finally {
            isLoading = false;
        }
    }

    function openCreateModal() {
        editingAdmin = null;
        formUsername = "";
        formNama = "";
        formEmail = "";
        formPassword = "";
        showModal = true;
    }

    function openEditModal(admin: Admin) {
        editingAdmin = admin;
        formUsername = admin.username;
        formNama = admin.nama;
        formEmail = admin.email || "";
        formPassword = "";
        showModal = true;
    }

    function closeModal() {
        showModal = false;
        editingAdmin = null;
    }

    async function handleSubmit(e: Event) {
        e.preventDefault();
        isSaving = true;

        try {
            if (editingAdmin) {
                const updateData: Partial<Admin> = {
                    username: formUsername,
                    nama: formNama,
                    email: formEmail || undefined,
                };
                await adminApi.update(editingAdmin.id, updateData);
            } else {
                await adminApi.create({
                    username: formUsername,
                    nama: formNama,
                    email: formEmail || undefined,
                    password: formPassword,
                });
            }
            closeModal();
            await loadData();
        } catch (err: any) {
            console.error("Save error:", err);
        } finally {
            isSaving = false;
        }
    }

    async function handleDelete(id: string) {
        const ok = await confirm.show({
            title: "Hapus Admin",
            message:
                "Apakah Anda yakin ingin menghapus admin ini? Tindakan ini tidak dapat dibatalkan.",
            type: "danger",
            confirmText: "Ya, Hapus",
        });

        if (!ok) return;

        try {
            await adminApi.delete(id);
            await loadData();
        } catch (err) {
            console.error("Error deleting:", err);
        }
    }
</script>

<svelte:head>
    <title>Admin Management - Rosantibike Motorent</title>
</svelte:head>

<div class="page-header">
    <h1>Kelola Admin</h1>
    <Button variant="primary" onclick={openCreateModal}>
        <Plus size={18} />
        Tambah Admin
    </Button>
</div>

{#if isLoading}
    <div class="loading-page">
        <div class="loading-spinner"></div>
    </div>
{:else if admins.length === 0}
    <div class="empty-state">
        <div class="empty-state-icon"><UserCog size={48} /></div>
        <h3>Belum Ada Admin</h3>
        <p>Tambahkan admin pertama</p>
        <Button variant="primary" class="mt-4" onclick={openCreateModal}>
            <Plus size={18} />
            Tambah Admin
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
                                >Username</th
                            >
                            <th
                                class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border"
                                >Nama</th
                            >
                            <th
                                class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border"
                                >Email</th
                            >
                            <th
                                class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border"
                                >Aksi</th
                            >
                        </tr>
                    </thead>
                    <tbody>
                        {#each admins as admin}
                            <tr
                                class="border-b border-border hover:bg-bg-tertiary/20 transition-colors"
                            >
                                <td class="px-4 py-3 font-semibold text-sm"
                                    >{admin.username}</td
                                >
                                <td class="px-4 py-3 text-sm">{admin.nama}</td>
                                <td class="px-4 py-3 text-text-muted text-sm"
                                    >{admin.email || "-"}</td
                                >
                                <td class="px-4 py-3">
                                    <div class="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onclick={() => openEditModal(admin)}
                                        >
                                            <Pencil size={16} />
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onclick={() =>
                                                handleDelete(admin.id)}
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

<Modal
    open={showModal}
    title={editingAdmin ? "Edit Admin" : "Tambah Admin"}
    onclose={closeModal}
>
    <form class="flex flex-col gap-4" onsubmit={handleSubmit}>
        <Input
            id="username"
            label="Username"
            bind:value={formUsername}
            required
        />
        <Input id="nama" label="Nama" bind:value={formNama} required />
        <Input id="email" label="Email" type="email" bind:value={formEmail} />

        {#if !editingAdmin}
            <Input
                id="password"
                label="Password"
                type="password"
                bind:value={formPassword}
                required
            />
        {/if}

        <div class="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onclick={closeModal}>Batal</Button>
            <Button type="submit" variant="primary" loading={isSaving}>
                {editingAdmin ? "Simpan Perubahan" : "Simpan"}
            </Button>
        </div>
    </form>
</Modal>
```
