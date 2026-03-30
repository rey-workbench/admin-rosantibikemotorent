<script lang="ts">
    import { onMount } from "svelte";
    import { RefreshCw, Trash2, Play, Pause, ListOrdered } from "lucide-svelte";
    import { queueApi } from "$lib/api";
    import websocketService, { queueUpdates, socketConnected } from "$lib/services/websocket";
    import {
        Card,
        CardBody,
        CardHeader,
        Button,
        Badge,
    } from "$lib/components/ui";
    import { PageHeader } from "$lib/components/layout";
    import { confirm } from "$lib/stores/confirm";

    interface QueueStats {
        name: string;
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
        paused: boolean;
    }

    let queues: QueueStats[] = $state([]);
    let isLoading = $state(true);
    let error = $state("");

    async function loadData(showLoading = true) {
        if (showLoading) isLoading = true;
        error = "";
        try {
            const res = await queueApi.getStatus();
            queues = res || [];
        } catch (err: any) {
            error = err.response?.data?.message || "Gagal memuat status queue";
            console.error("Error loading queues:", err);
        } finally {
            if (showLoading) isLoading = false;
        }
    }

    onMount(() => {
        // Hubungkan websocket jika belum terhubung
        websocketService.connect();
        
        loadData(true);

        // Subscribe to real-time queue updates
        const unsubscribe = queueUpdates.subscribe((update) => {
            if (update) {
                console.log("[Queue] Update received:", update);
                loadData(false); // Silent refresh
            }
        });

        return () => unsubscribe();
    });

    async function handlePauseResume(queueName: string, isPaused: boolean) {
        try {
            if (isPaused) {
                await queueApi.resumeQueue(queueName);
            } else {
                await queueApi.pauseQueue(queueName);
            }
            await loadData();
        } catch (err) {
            console.error("Error:", err);
        }
    }

    async function handleCleanQueue(queueName: string) {
        const ok = await confirm.show({
            title: "Bersihkan Queue",
            message: `Apakah Anda yakin ingin membersihkan semua job di queue "${queueName}"?`,
            type: "warning",
            confirmText: "Ya, Bersihkan",
        });

        if (!ok) return;

        try {
            await queueApi.cleanQueue(queueName);
            await loadData();
        } catch (err) {
            console.error("Error:", err);
        }
    }
</script>

<svelte:head>
    <title>Queue Monitor - Rosantibike Motorent</title>
</svelte:head>

<PageHeader title="Queue Monitor">
    {#if $socketConnected}
        <Badge variant="success" text="Real-time" />
    {:else}
        <Badge variant="danger" text="Offline" />
    {/if}
    <Button variant="secondary" onclick={() => loadData(true)}>
        <RefreshCw size={18} />
        Refresh
    </Button>
</PageHeader>

{#if isLoading}
    <div class="loading-page">
        <div class="loading-spinner"></div>
    </div>
{:else if error}
    <Card>
        <CardBody>
            <div class="text-center py-8 text-danger">{error}</div>
        </CardBody>
    </Card>
{:else if queues.length === 0}
    <div class="empty-state">
        <div class="empty-state-icon">
            <ListOrdered size={48} />
        </div>
        <h3>Tidak Ada Queue</h3>
        <p>Tidak ada antrian yang aktif saat ini</p>
    </div>
{:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each queues as queue}
            <Card>
                <CardHeader class="flex justify-between items-center">
                    <span class="font-semibold">{queue.name}</span>
                    {#if queue.paused}
                        <Badge variant="warning" text="Jeda" />
                    {:else}
                        <Badge variant="success" text="Aktif" />
                    {/if}
                </CardHeader>
                <CardBody>
                    <div class="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div class="flex justify-between">
                            <span class="text-text-muted">Menunggu:</span>
                            <span class="font-medium">{queue.waiting}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-text-muted">Aktif:</span>
                            <span class="font-medium text-info"
                                >{queue.active}</span
                            >
                        </div>
                        <div class="flex justify-between">
                            <span class="text-text-muted">Selesai:</span>
                            <span class="font-medium text-success"
                                >{queue.completed}</span
                            >
                        </div>
                        <div class="flex justify-between">
                            <span class="text-text-muted">Gagal:</span>
                            <span class="font-medium text-danger"
                                >{queue.failed}</span
                            >
                        </div>
                        <div class="flex justify-between col-span-2">
                            <span class="text-text-muted">Tertunda:</span>
                            <span class="font-medium text-warning"
                                >{queue.delayed}</span
                            >
                        </div>
                    </div>

                    <div class="flex gap-2 pt-3 border-t border-border">
                        <Button
                            variant="secondary"
                            size="sm"
                            onclick={() =>
                                handlePauseResume(queue.name, queue.paused)}
                            class="flex-1"
                        >
                            {#if queue.paused}
                                <Play size={14} />
                                Lanjutkan
                            {:else}
                                <Pause size={14} />
                                Jeda
                            {/if}
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onclick={() => handleCleanQueue(queue.name)}
                        >
                            <Trash2 size={14} />
                        </Button>
                    </div>
                </CardBody>
            </Card>
        {/each}
    </div>
{/if}
