<script lang="ts">
        import { onMount, onDestroy } from "svelte";
    import { unitMotorApi } from "$lib/api";
    import { fade } from "svelte/transition";
    import {
        Calendar,
        ChevronLeft,
        ChevronRight,
        Filter,
        AlertCircle,
    } from "lucide-svelte";
    import { PageHeader } from "$lib/components/layout";
    import { websocketService } from "$lib/services/websocket";

    let currentDate = $state(new Date());
    let currentMonth = $state(currentDate.getMonth());
    let currentYear = $state(currentDate.getFullYear());
    let unitTypeFilter = $state("");
    let isLoading = $state(false);
    let availabilityData = $state<any>(null);
    let brands = $state<{ id: string; merk: string }[]>([]);
    let error = $state("");
    let unsubs: (() => void)[] = [];

    // Generate days for the selected month
    let daysInMonth = $derived(new Date(currentYear, currentMonth + 1, 0).getDate());
    let monthDays = $derived(Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(currentYear, currentMonth, i + 1);
        return {
            date: d,
            dayName: d.toLocaleDateString("id-ID", { weekday: "short" }),
            dayNum: i + 1,
            isToday: d.toDateString() === new Date().toDateString(),
        };
    }));

    let monthLabel = $derived(new Date(currentYear, currentMonth).toLocaleDateString(
        "id-ID",
        {
            month: "long",
            year: "numeric",
        },
    ));

    onMount(async () => {
        await loadBrands();
        await loadAvailability();

        // Connect to websocket
        websocketService.connect();

        // Listen for all transaction events & unit updates
        const refresh = () => {
            console.log("[Availability] Refreshing data due to realtime update...");
            loadAvailability();
        };

        unsubs = [
            websocketService.onTransaksiCreated(refresh),
            websocketService.onTransaksiUpdated(refresh),
            websocketService.onTransaksiDeleted(refresh),
            websocketService.onTransaksiSelesai(refresh),
            websocketService.onUnitMotorUpdate(refresh)
        ];
    });

    onDestroy(() => {
        unsubs.forEach(unsub => unsub());
    });


    async function loadBrands() {
        try {
            brands = await unitMotorApi.getBrands();
        } catch (e) {
            console.error(e);
        }
    }

    async function loadAvailability() {
        isLoading = true;
        error = "";
        try {
            // Format dates for API: YYYY-MM-DD
            const startDate = new Date(currentYear, currentMonth, 1)
                .toISOString()
                .split("T")[0];
            const endDate = new Date(currentYear, currentMonth, daysInMonth)
                .toISOString()
                .split("T")[0];

            let params: any = { startDate, endDate };
            if (unitTypeFilter) params.jenisId = unitTypeFilter;
            availabilityData = await unitMotorApi.checkAvailability(
                params as any,
            );
        } catch (e) {
            console.error(e);
            error = "Gagal memuat data ketersediaan.";
        } finally {
            isLoading = false;
        }
    }

    function prevMonth() {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
        loadAvailability();
    }

    function nextMonth() {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
        loadAvailability();
    }

    function handleFilterChange() {
        loadAvailability();
    }

    // Tooltip Logic
    let hoveredBooking = $state<any>(null);
    let tooltipPosition = $state({ x: 0, y: 0 });

    function handleMouseEnter(event: MouseEvent, status: any) {
        if (!status.isAvailable && status.booking) {
            hoveredBooking = status.booking;
            updateTooltipPosition(event);
        }
    }

    function handleMouseMove(event: MouseEvent) {
        if (hoveredBooking) {
            updateTooltipPosition(event);
        }
    }

    function updateTooltipPosition(event: MouseEvent) {
        // Prevent tooltip from going off screen
        const x = Math.min(event.clientX + 15, window.innerWidth - 270);
        const y = Math.min(event.clientY + 15, window.innerHeight - 200);

        tooltipPosition = { x, y };
    }

    function handleMouseLeave() {
        hoveredBooking = null;
    }
</script>

<div class="p-6 max-w-[1600px] mx-auto min-h-screen flex flex-col">
    <PageHeader title="Kalender Ketersediaan" subtitle="Pantau stok unit motor secara real-time.">
        <div
            class="flex items-center gap-3 bg-white dark:bg-bg-secondary p-1.5 rounded-xl shadow-sm border border-border/50"
        >
            <button
                onclick={prevMonth}
                class="p-2 hover:bg-bg-tertiary rounded-lg text-text-secondary transition-colors"
            >
                <ChevronLeft size={20} />
            </button>
            <span class="font-bold text-text-primary min-w-[150px] text-center">
                {monthLabel}
            </span>
            <button
                onclick={nextMonth}
                class="p-2 hover:bg-bg-tertiary rounded-lg text-text-secondary transition-colors"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    </PageHeader>

    <!-- Filters & Legend -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-3">
            <div class="relative">
                <Filter
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                    size={16}
                />
                <select
                    bind:value={unitTypeFilter}
                    onchange={handleFilterChange}
                    class="pl-9 pr-4 py-2 bg-white dark:bg-bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                >
                    <option value="">Semua Merek</option>
                    {#each brands as brand}
                        <option value={brand.id}>{brand.merk}</option>
                        <!-- Note: brand might only have merk string based on API response, verifying... -->
                        <!-- unitMotorApi.getBrands returns {id, merk}[]? Controller says distinct: ['merk'], select id, merk. So yes. -->
                    {/each}
                </select>
            </div>

            <button
                onclick={loadAvailability}
                class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
                Refresh
            </button>
        </div>

        <div
            class="flex items-center gap-4 text-xs font-medium bg-white dark:bg-bg-secondary px-4 py-2 rounded-lg border border-border/50 shadow-sm"
        >
            <div class="flex items-center gap-2">
                <div
                    class="w-3 h-3 rounded bg-green-500/20 border border-green-500"
                ></div>
                <span>Tersedia</span>
            </div>
            <div class="flex items-center gap-2">
                <div
                    class="w-3 h-3 rounded bg-red-500/20 border border-red-500"
                ></div>
                <span>Disewa / Overdue</span>
            </div>
            <div class="flex items-center gap-2">
                <div
                    class="w-3 h-3 rounded bg-gray-200 border border-gray-300"
                ></div>
                <span>Service / Lainnya</span>
            </div>
        </div>
    </div>

    <!-- Scheduler Grid -->
    <div
        class="flex-1 overflow-hidden bg-white dark:bg-bg-secondary rounded-2xl border border-border shadow-sm flex flex-col relative"
    >
        {#if isLoading}
            <div
                class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/50 z-20 backdrop-blur-sm"
                transition:fade
            >
                <div
                    class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
                ></div>
            </div>
        {/if}

        {#if error}
            <div
                class="flex-1 flex flex-col items-center justify-center text-danger gap-2 p-10"
            >
                <AlertCircle size={32} />
                <p>{error}</p>
                <button onclick={loadAvailability} class="text-sm underline"
                    >Coba lagi</button
                >
            </div>
        {:else if availabilityData && availabilityData.units}
            <!-- Scrollable Container -->
            <div class="overflow-auto flex-1 h-full scrollbar-thin">
                <table class="w-full border-collapse">
                    <thead class="sticky top-0 z-10 bg-bg-tertiary">
                        <tr>
                            <th
                                class="sticky left-0 z-20 bg-bg-tertiary p-3 text-left font-semibold text-sm border-b border-r border-border min-w-[200px] shadow-[2px_0_5px_rgba(0,0,0,0.05)]"
                            >
                                Unit Motor
                            </th>
                            {#each monthDays as day}
                                <th
                                    class="p-2 text-center border-b border-border min-w-[40px] {day.isToday
                                        ? 'bg-primary/10 text-primary'
                                        : ''}"
                                >
                                    <div
                                        class="text-[10px] text-text-muted uppercase"
                                    >
                                        {day.dayName}
                                    </div>
                                    <div class="font-bold text-sm">
                                        {day.dayNum}
                                    </div>
                                </th>
                            {/each}
                        </tr>
                    </thead>
                    <tbody>
                        {#each availabilityData.units as unit}
                            <tr
                                class="hover:bg-bg-tertiary/30 transition-colors group"
                            >
                                <td
                                    class="sticky left-0 z-10 bg-white dark:bg-bg-secondary p-3 border-b border-r border-border group-hover:bg-bg-tertiary/30 shadow-[2px_0_5px_rgba(0,0,0,0.05)]"
                                >
                                    <div
                                        class="font-bold text-text-primary text-sm"
                                    >
                                        {unit.jenis?.merk ?? ''}
                                        {unit.jenis?.model ?? ''}
                                    </div>
                                    <div
                                        class="text-xs text-text-muted mt-0.5 font-mono bg-bg-tertiary px-1.5 py-0.5 rounded inline-block"
                                    >
                                        {unit.platNomor}
                                    </div>
                                </td>
                                {#each unit.availability as status, i}
                                    {@const isAvailable = status.isAvailable}
                                    <!-- We match status against the day. If status.date matches monthDays[i].date ISOString -->
                                    <td
                                        class="border-b border-r border-border/50 p-1 relative h-[60px]"
                                    >
                                        <div
                                            class="w-full h-full rounded transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/50
                                            {isAvailable
                                                ? 'bg-green-500/10 hover:bg-green-500/20'
                                                : 'bg-red-500/10 hover:bg-red-500/20 cursor-help'}"
                                            role="button"
                                            tabindex="0"
                                            onmouseenter={(e) =>
                                                handleMouseEnter(e, status)}
                                            onmousemove={handleMouseMove}
                                            onmouseleave={handleMouseLeave}
                                            onfocus={(e) =>
                                                handleMouseEnter(
                                                    e as any,
                                                    status,
                                                )}
                                        >
                                            {#if !isAvailable}
                                                <div
                                                    class="w-full h-full flex items-center justify-center"
                                                >
                                                    <div
                                                        class="w-1.5 h-1.5 rounded-full bg-red-500"
                                                    ></div>
                                                </div>
                                            {/if}
                                        </div>
                                    </td>
                                {/each}
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <!-- Summary Footer -->
            <div
                class="p-3 border-t border-border bg-bg-tertiary text-xs text-text-muted flex justify-between"
            >
                <span>Total Unit: {availabilityData.totalUnits}</span>
                <span>Periode: {monthLabel}</span>
            </div>
        {:else}
            <div
                class="flex-1 flex flex-col items-center justify-center opacity-50 p-10"
            >
                <p>Tidak ada data untuk ditampilkan</p>
            </div>
        {/if}
    </div>

    <!-- Custom Tooltip -->
    {#if hoveredBooking}
        <div
            class="fixed z-50 bg-white dark:bg-bg-secondary p-4 rounded-xl shadow-xl border border-border pointer-events-none min-w-[280px] animate-in fade-in zoom-in-95 duration-150"
            style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px;"
        >
            <div
                class="flex items-start justify-between mb-3 pb-2 border-b border-border/50"
            >
                <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full
                    {hoveredBooking.status === 'DISEWA'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : hoveredBooking.status === 'OVERDUE'
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-gray-100 text-gray-600'} 
                    uppercase tracking-wider"
                >
                    {hoveredBooking.status}
                </span>
            </div>

            <div class="space-y-3 text-sm">
                <div>
                    <div
                        class="text-[10px] text-text-muted uppercase font-bold mb-0.5"
                    >
                        Penyewa
                    </div>
                    <div
                        class="font-bold text-text-primary text-base leading-tight"
                    >
                        {hoveredBooking.namaPenyewa}
                    </div>
                    <div class="text-xs text-text-secondary mt-0.5">
                        {hoveredBooking.noWhatsapp}
                    </div>
                </div>

                <div
                    class="grid grid-cols-2 gap-3 bg-bg-tertiary/50 p-2 rounded-lg"
                >
                    <div>
                        <div
                            class="text-[10px] text-text-muted uppercase font-bold mb-1"
                        >
                            Mulai
                        </div>
                        <div class="text-text-primary font-medium">
                            {new Date(
                                hoveredBooking.tanggalMulai,
                            ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                            })}
                        </div>
                        <div class="text-xs text-text-secondary">
                            {hoveredBooking.jamMulai}
                        </div>
                    </div>
                    <div>
                        <div
                            class="text-[10px] text-text-muted uppercase font-bold mb-1"
                        >
                            Selesai
                        </div>
                        <div class="text-text-primary font-medium">
                            {new Date(
                                hoveredBooking.tanggalSelesai,
                            ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                            })}
                        </div>
                        <div class="text-xs text-text-secondary">
                            {hoveredBooking.jamSelesai}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    /* Custom Scrollbar for the grid */
    .scrollbar-thin::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    .scrollbar-thin::-webkit-scrollbar-track {
        background: transparent;
    }
    .scrollbar-thin::-webkit-scrollbar-thumb {
        background-color: rgba(156, 163, 175, 0.3);
        border-radius: 4px;
    }
    .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background-color: rgba(156, 163, 175, 0.5);
    }
</style>
