<script lang="ts">
    import { onMount } from "svelte";
    import { Plus, Pencil, Trash2, UserCog } from "lucide-svelte";
    import { adminApi } from "$lib/api";
    import type { Admin } from "$lib/types";
    import { Card, CardBody, Button, Modal, Input, DataTable, Loading, EmptyState } from "$lib/components/ui";
    import { confirm } from "$lib/stores/confirm";
  import { PageHeader } from "$lib/components";

    let admins: Admin[] = $state([]);
    let isLoading = $state(true);
    let showModal = $state(false);
    let editingAdmin: Admin | null = $state(null);
    let isSaving = $state(false);

    let formUsername = $state("");
    let formNama = $state("");
    let formEmail = $state("");
    let formPassword = $state("");

    const columns = [
        { key: "username", label: "Username" },
        { key: "nama", label: "Nama" },
        { key: "email", label: "Email" },
        { key: "aksi", label: "Aksi", class: "w-24" },
    ];

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
            message: "Apakah Anda yakin ingin menghapus admin ini?",
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

<PageHeader title="Kelola Admin">
    <Button variant="primary" onclick={openCreateModal}>
        <Plus size={18} />
        Tambah Admin
    </Button>
</PageHeader>

{#if isLoading}
    <Loading />
{:else if admins.length === 0}
    <EmptyState
        icon={UserCog}
        title="Belum Ada Admin"
        description="Tambahkan admin pertama"
    >
        {#snippet action()}
            <Button variant="primary" class="mt-4" onclick={openCreateModal}>
                <Plus size={18} />
                Tambah Admin
            </Button>
        {/snippet}
    </EmptyState>
{:else}
    <Card>
        <CardBody class="p-0">
            <DataTable {columns}>
                {#each admins as admin}
                    <tr class="border-b border-border hover:bg-bg-tertiary/20 transition-colors">
                        <td class="px-4 py-3 font-semibold text-sm">{admin.username}</td>
                        <td class="px-4 py-3 text-sm">{admin.nama}</td>
                        <td class="px-4 py-3 text-text-muted text-sm">{admin.email || "-"}</td>
                        <td class="px-4 py-3">
                            <div class="flex gap-2">
                                <Button variant="secondary" size="sm" onclick={() => openEditModal(admin)}>
                                    <Pencil size={16} />
                                </Button>
                                <Button variant="danger" size="sm" onclick={() => handleDelete(admin.id)}>
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
