<script lang="ts">
    import { onMount } from "svelte";
    import {
        Truck,
        CheckCircle2,
        Clock,
        MoreHorizontal,
        Calendar as CalendarIcon,
        ChevronDown,
        Activity,
    } from "lucide-svelte";
    import { formatDateShort, getStatusColor, getStatusDot } from "$lib/utils";
    import { STATUS_TRANSAKSI } from "$lib/constants";
    import { unitMotorApi, transaksiApi } from "$lib/api";
    import type { UnitMotor, Transaksi } from "$lib/types";
    import { authStore } from "$lib/stores/auth";
    import { Loading } from "$lib/components/ui";

    let units: UnitMotor[] = $state([]);
    let transaksis: Transaksi[] = $state([]);
    let historyTransaksis: Transaksi[] = $state([]);
    let isLoading = $state(true);

    onMount(async () => {
        try {
            const [unitRes, activeTxRes, historyTxRes] = await Promise.all([
                unitMotorApi.getAll({ limit: 100 }),
                transaksiApi.getAll({ limit: 100 }),
                transaksiApi.getHistory({ limit: 100 }),
            ]);
            units = unitRes.data || [];
            transaksis = activeTxRes.data || [];
            historyTransaksis = historyTxRes.data || [];
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            isLoading = false;
        }
    });

    const tersedia = $derived(
        units.filter((u) => u.status?.toLowerCase() === "tersedia").length,
    );
    const disewa = $derived(
        units.filter((u) => u.status?.toLowerCase() === "disewa").length,
    );
    const completed = $derived(
        historyTransaksis.filter((t) => t.status === STATUS_TRANSAKSI.SELESAI).length,
    );

    const efficiency = $derived(
        units.length > 0 ? Math.round((disewa / units.length) * 100) : 0,
    );

    const chartData = $derived.by(() => {
        const days = 7;
        const data = new Array(days).fill(0);
        const labels = new Array(days).fill("");
        const now = new Date();
        const allTx = [...transaksis, ...historyTransaksis];

        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(now.getDate() - (days - 1 - i));
            labels[i] = date.toLocaleDateString("en-GB", { day: "2-digit" });

            const count = allTx.filter((t) => {
                const tDate = new Date(t.createdAt);
                return (
                    tDate.getDate() === date.getDate() &&
                    tDate.getMonth() === date.getMonth() &&
                    tDate.getFullYear() === date.getFullYear()
                );
            }).length;
            data[i] = count;
        }
        return { data, labels };
    });

    const chartPath = $derived.by(() => {
        const { data } = chartData;
        if (data.length === 0) return "";

        const max = Math.max(...data, 5);
        const width = 950;
        const height = 150;
        const stepX = width / (data.length - 1);

        const points = data.map((val, i) => {
            const x = i * stepX;
            const y = 200 - (val / max) * height;
            return `${x},${y}`;
        });

        if (points.length < 2) return "";

        let d = `M ${points[0]}`;

        for (let i = 0; i < points.length - 1; i++) {
            const [x0, y0] = points[i].split(",").map(Number);
            const [x1, y1] = points[i + 1].split(",").map(Number);
            const midX = (x0 + x1) / 2;
            d += ` C ${midX},${y0} ${midX},${y1} ${x1},${y1}`;
        }

        const fillD = `${d} L 950,200 L 0,200 Z`;

        return { stroke: d, fill: fillD };
    });
</script>

<svelte:head>
    <title>Dashboard - Rosantibike Motorent</title>
</svelte:head>

<div class="flex flex-col gap-8 w-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 class="text-3xl md:text-4xl font-bold text-text-primary mb-2 tracking-tight">
                Halo, {$authStore.admin?.nama?.split(" ")[0] || "Admin"}
            </h1>
            <p class="text-text-secondary">Pantau progres tim di sini.</p>
        </div>
        <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-border/50 text-sm font-medium text-text-secondary">
            <CalendarIcon size={16} class="text-text-muted" />
            <span>{formatDateShort(new Date())}</span>
        </div>
    </div>

    {#if isLoading}
        <Loading />
    {:else}
        <!-- Stats Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Stat 1 -->
            <div
                class="bg-bg-secondary p-6 rounded-3xl shadow-sm border border-border/40 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300"
            >
                <div
                    class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"
                >
                    <CheckCircle2 size={22} />
                </div>
                <div>
                    <p class="text-sm font-semibold text-text-secondary mb-1">
                        Selesai
                    </p>
                    <div class="flex items-center gap-2">
                        <span class="text-2xl font-bold text-text-primary"
                            >{completed}</span
                        >
                        <span
                            class="text-xs font-medium text-success bg-success/10 px-1.5 py-0.5 rounded"
                            >+8 tugas</span
                        >
                    </div>
                </div>
            </div>

            <!-- Stat 2 -->
            <div
                class="bg-bg-secondary p-6 rounded-3xl shadow-sm border border-border/40 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300"
            >
                <div
                    class="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning shrink-0"
                >
                    <Clock size={22} />
                </div>
                <div>
                    <p class="text-sm font-semibold text-text-secondary mb-1">
                        Disewa
                    </p>
                    <div class="flex items-center gap-2">
                        <span class="text-2xl font-bold text-text-primary"
                            >{disewa}</span
                        >
                        <span
                            class="text-xs font-medium text-danger bg-danger/10 px-1.5 py-0.5 rounded"
                            >-6 jam</span
                        >
                    </div>
                </div>
            </div>

            <!-- Stat 3 -->
            <div
                class="bg-bg-secondary p-6 rounded-3xl shadow-sm border border-border/40 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300"
            >
                <div
                    class="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center text-info shrink-0"
                >
                    <Activity size={22} />
                </div>
                <div>
                    <p class="text-sm font-semibold text-text-secondary mb-1">
                        Efisiensi
                    </p>
                    <div class="flex items-center gap-2">
                        <span class="text-2xl font-bold text-text-primary"
                            >{efficiency}%</span
                        >
                        <span
                            class="text-xs font-medium text-success bg-success/10 px-1.5 py-0.5 rounded"
                            >+12%</span
                        >
                    </div>
                </div>
            </div>
        </div>

        <!-- Performance Chart Placeholder -->
        <div
            class="bg-bg-secondary rounded-3xl shadow-sm border border-border/40 p-8 relative overflow-hidden"
        >
            <div class="flex justify-between items-start mb-8">
                <h3 class="text-xl font-bold text-text-primary">Performa</h3>
                <button
                    class="flex items-center gap-2 text-sm font-medium text-text-secondary bg-bg-tertiary px-3 py-1.5 rounded-lg hover:bg-bg-primary transition-colors"
                >
                    7 Hari Terakhir
                    <ChevronDown size={14} />
                </button>
            </div>

            <!-- Simple SVG Chart Mockup -->
            <div class="h-64 w-full relative">
                <!-- Grid Lines -->
                <div
                    class="absolute inset-0 flex flex-col justify-between text-xs text-text-muted"
                >
                    <div
                        class="w-full border-b border-dashed border-border/60 pb-1"
                    ></div>
                    <div
                        class="w-full border-b border-dashed border-border/60 pb-1"
                    ></div>
                    <div
                        class="w-full border-b border-dashed border-border/60 pb-1"
                    ></div>
                    <div
                        class="w-full border-b border-dashed border-border/60 pb-1"
                    ></div>
                    <div class="w-full border-b border-border/60 pb-1">0</div>
                </div>

                <!-- Chart Line -->
                {#if chartPath}
                    <svg
                        class="absolute inset-0 w-full h-full"
                        preserveAspectRatio="none"
                        viewBox="0 0 950 200"
                    >
                        <!-- Gradient Defs -->
                        <defs>
                            <linearGradient
                                id="gradient"
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                            >
                                <stop
                                    offset="0%"
                                    stop-color="#F59E0B"
                                    stop-opacity="0.2"
                                />
                                <stop
                                    offset="100%"
                                    stop-color="#F59E0B"
                                    stop-opacity="0"
                                />
                            </linearGradient>
                        </defs>

                        <!-- Fill Path -->
                        <path
                            d={chartPath.fill}
                            fill="url(#gradient)"
                            class="transition-all duration-1000 ease-out"
                        />

                        <!-- Stroke Path -->
                        <path
                            d={chartPath.stroke}
                            stroke="#F59E0B"
                            stroke-width="3"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            vector-effect="non-scaling-stroke"
                            class="transition-all duration-1000 ease-out"
                        />
                    </svg>
                {/if}
            </div>

            <div
                class="flex justify-between mt-4 px-2 text-xs text-text-muted font-medium"
            >
                {#each chartData.labels as label}
                    <span>{label}</span>
                {/each}
            </div>
        </div>

        <!-- Current Tasks / Transactions -->
        <div
            class="bg-bg-secondary rounded-3xl shadow-sm border border-border/40 p-8 pb-4"
        >
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-4">
                    <h3 class="text-xl font-bold text-text-primary">
                        Transaksi Terbaru
                    </h3>
                    <div
                        class="bg-bg-tertiary px-3 py-1 rounded-full text-xs font-semibold text-text-secondary"
                    >
                        Selesai 30%
                    </div>
                </div>
                <button
                    class="flex items-center gap-2 text-sm font-medium text-text-secondary bg-bg-tertiary px-3 py-1.5 rounded-lg hover:bg-bg-primary transition-colors"
                >
                    Minggu
                    <ChevronDown size={14} />
                </button>
            </div>

            <div class="space-y-4">
                {#each transaksis.slice(0, 5) as t}
                    <div
                        class="flex items-center gap-4 p-4 hover:bg-bg-primary/50 rounded-2xl transition-colors group"
                    >
                        <div
                            class="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-text-secondary group-hover:bg-white group-hover:shadow-sm transition-all"
                        >
                            <Truck size={18} />
                        </div>

                        <div
                            class="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                        >
                            <div
                                class="md:col-span-5 font-semibold text-text-primary truncate"
                            >
                                Rental: {t.unitMotor?.platNomor ||
                                    "Unknown Unit"}
                            </div>

                            <div class="md:col-span-3 flex items-center gap-2">
                                <div
                                    class="w-2 h-2 rounded-full {getStatusDot(
                                        t.status,
                                    )}"
                                ></div>
                                <span
                                    class="text-sm font-medium {getStatusColor(
                                        t.status,
                                    )}">{t.status}</span
                                >
                            </div>

                            <div
                                class="md:col-span-3 flex items-center gap-2 text-text-muted text-sm"
                            >
                                <Clock size={14} />
                                <span
                                    >{new Date(t.createdAt).toLocaleTimeString(
                                        [],
                                        { hour: "2-digit", minute: "2-digit" },
                                    )}</span
                                >
                            </div>
                        </div>

                        <button
                            class="p-2 text-text-muted hover:text-primary transition-colors"
                        >
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                {/each}
                {#if transaksis.length === 0}
                    <div class="text-center py-10 text-text-muted">
                        Tidak ada transaksi terbaru
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>
