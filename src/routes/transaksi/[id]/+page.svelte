<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { transaksiApi } from "$lib/api";
    import { format } from "date-fns";
    import { id as idLocale } from "date-fns/locale";
    import { Button } from "$lib/components/ui";
    import { Printer, ArrowLeft } from "lucide-svelte";
    import type { Transaksi } from "$lib/types";

    let transaction: (Transaksi & { qrisBase64?: string }) | null =
        $state(null);
    let isLoading = $state(true);
    let error = $state<string | null>(null);

    const id = $page.params.id;

    onMount(async () => {
        if (id) {
            loadTransaction(id);
        }
    });

    async function loadTransaction(transaksiId: string) {
        isLoading = true;
        try {
            const data = await transaksiApi.getById(transaksiId);
            // Calculate duration if not provided by backend
            const startDate = new Date(data.tanggalMulai);
            const endDate = new Date(data.tanggalSelesai);
            const duration =
                Math.ceil(
                    (endDate.getTime() - startDate.getTime()) /
                        (1000 * 60 * 60 * 24),
                ) || 1;

            transaction = {
                ...data,
                durasiHari: data.durasiHari || duration,
            };
        } catch (err) {
            console.error(err);
            error = "Gagal memuat data transaksi";
        } finally {
            isLoading = false;
        }
    }

    function formatDate(date: string) {
        if (!date) return "-";
        return format(new Date(date), "dd MMMM yyyy", { locale: idLocale });
    }

    function formatRupiah(amount: number) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    }

    function handlePrint() {
        window.print();
    }
</script>

<svelte:head>
    <title>Invoice #{id} - Rosantibike Motorent</title>
</svelte:head>

<div
    class="max-w-4xl mx-auto p-4 md:p-8 print:p-0 print:m-0 print:max-w-none print:w-full"
>
    <div class="mb-6 flex justify-between items-center print:hidden">
        <Button href="/transaksi" variant="secondary">
            <ArrowLeft size={18} class="mr-2" />
            Kembali
        </Button>
        <div class="flex gap-2">
            <Button variant="primary" onclick={handlePrint}>
                <Printer size={18} class="mr-2" />
                Cetak Invoice
            </Button>
        </div>
    </div>

    {#if isLoading}
        <div class="text-center py-12">
            <div class="loading-spinner mx-auto mb-4"></div>
            <p class="text-text-muted">Memuat invoice...</p>
        </div>
    {:else if error}
        <div class="bg-danger-50 text-danger-600 p-4 rounded-lg text-center">
            {error}
        </div>
    {:else if transaction}
        <!-- Invoice Container -->
        <div
            class="bg-white rounded-xl shadow-sm border border-border p-8 md:p-12 print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none"
        >
            <!-- Header: Company Info & Invoice Label -->
            <div class="flex justify-between items-start mb-8 print:mb-6">
                <div class="print:flex-1">
                    <h1
                        class="text-xl font-black tracking-tight text-gray-900 mb-1 print:text-base"
                    >
                        ROSANTIBIKE MOTORENT
                    </h1>
                    <div
                        class="text-xs text-gray-500 print:text-black leading-tight print:text-[10px]"
                    >
                        <p>Jln. Bauksit No 90C</p>
                        <p>Telp: 0852-3215-2313</p>
                        <p>www.rosantibikemotorent.com</p>
                    </div>
                </div>
                <div class="text-right print:flex-1">
                    <h2
                        class="text-3xl font-light text-gray-300 print:text-black print:text-lg uppercase tracking-tighter mb-1"
                    >
                        INVOICE
                    </h2>
                    <div class="text-xs print:text-[10px]">
                        <p
                            class="font-bold text-gray-900 print:text-black break-all max-w-[140px] ml-auto leading-tight"
                        >
                            #{transaction.id}
                        </p>
                        <p class="text-gray-500 print:text-black mt-0.5">
                            {formatDate(transaction.createdAt)}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Info Bar -->
            <div
                class="grid grid-cols-2 gap-8 border-t border-b border-gray-100 py-8 mb-10 print:border-black print:py-4 print:mb-6"
            >
                <div>
                    <p
                        class="text-xs font-bold text-gray-400 print:text-black uppercase tracking-widest mb-2"
                    >
                        Bill To
                    </p>
                    <div class="text-gray-900 print:text-black">
                        <p class="font-bold text-base print:text-sm">
                            {transaction.namaPenyewa}
                        </p>
                        <p class="text-sm print:text-xs">
                            {transaction.noWhatsapp}
                        </p>
                        {#if transaction.noKTP}
                            <p
                                class="text-xs text-gray-500 print:text-black mt-1 print:text-[10px]"
                            >
                                KTP: {transaction.noKTP}
                            </p>
                        {/if}
                    </div>
                </div>
                <div class="text-right">
                    <p
                        class="text-xs font-bold text-gray-400 print:text-black uppercase tracking-widest mb-2"
                    >
                        Rental Info
                    </p>
                    <div class="text-sm text-gray-900 print:text-black">
                        <div class="mb-1">
                            <span
                                class="text-gray-400 print:text-black font-medium"
                                >From:</span
                            >
                            <span class="font-bold ml-1"
                                >{formatDate(transaction.tanggalMulai)} ({transaction.jamMulai})</span
                            >
                        </div>
                        <div>
                            <span
                                class="text-gray-400 print:text-black font-medium"
                                >To:</span
                            >
                            <span class="font-bold ml-1"
                                >{formatDate(transaction.tanggalSelesai)} ({transaction.jamSelesai})</span
                            >
                        </div>
                    </div>
                </div>
            </div>

            <!-- Line Items Table -->
            <div class="mb-10 print:mb-8">
                <table class="w-full text-left">
                    <thead>
                        <tr
                            class="border-b-2 border-gray-900 print:border-black"
                        >
                            <th
                                class="pb-3 font-bold text-xs uppercase text-gray-900 print:text-black tracking-wider"
                                >Description</th
                            >
                            <th
                                class="pb-3 font-bold text-xs uppercase text-gray-900 print:text-black tracking-wider text-center"
                                >Duration</th
                            >
                            <th
                                class="pb-3 font-bold text-xs uppercase text-gray-900 print:text-black tracking-wider text-right"
                                >Price</th
                            >
                            <th
                                class="pb-3 font-bold text-xs uppercase text-gray-900 print:text-black tracking-wider text-right"
                                >Amount</th
                            >
                        </tr>
                    </thead>
                    <tbody
                        class="divide-y divide-gray-100 print:divide-gray-300"
                    >
                        <tr>
                            <td class="py-3 print:py-2">
                                <div
                                    class="font-bold text-gray-900 print:text-black uppercase text-[13px] print:text-xs"
                                >
                                    {transaction.unitMotor?.jenis?.merk}
                                    {transaction.unitMotor?.jenis?.model}
                                </div>
                                <div
                                    class="text-[10px] text-gray-500 print:text-black print:text-[8px]"
                                >
                                    {transaction.unitMotor?.platNomor}
                                </div>
                            </td>
                            <td
                                class="py-3 print:py-2 text-center text-gray-900 print:text-black text-sm print:text-xs"
                            >
                                {transaction.durasiHari} Hari
                            </td>
                            <td
                                class="py-3 print:py-2 text-right text-gray-900 print:text-black text-sm print:text-xs"
                            >
                                {formatRupiah(
                                    transaction.unitMotor?.hargaSewa || 0,
                                )}
                            </td>
                            <td
                                class="py-3 print:py-2 text-right font-bold text-gray-900 print:text-black text-sm print:text-xs"
                            >
                                {formatRupiah(
                                    (transaction.unitMotor?.hargaSewa || 0) *
                                        transaction.durasiHari,
                                )}
                            </td>
                        </tr>

                        {#if transaction.helm >= 0}
                            <tr>
                                <td class="py-3">
                                    <div
                                        class="font-bold text-gray-900 print:text-black uppercase text-xs"
                                    >
                                        Helm SNI
                                    </div>
                                    <div
                                        class="text-[10px] text-gray-500 print:text-black"
                                    >
                                        Perlengkapan Keamanan
                                    </div>
                                </td>
                                <td
                                    class="py-3 text-center text-gray-900 print:text-black text-sm"
                                >
                                    {transaction.helm} Pcs
                                </td>
                                <td
                                    class="py-3 text-right text-gray-900 print:text-black text-sm"
                                >
                                    Rp 0
                                </td>
                                <td
                                    class="py-3 text-right font-bold text-gray-900 print:text-black text-sm uppercase"
                                >
                                    Free
                                </td>
                            </tr>
                        {/if}

                        {#if transaction.jasHujan >= 0}
                            <tr>
                                <td class="py-3">
                                    <div
                                        class="font-bold text-gray-900 print:text-black uppercase text-xs"
                                    >
                                        Jas Hujan
                                    </div>
                                    <div
                                        class="text-[10px] text-gray-500 print:text-black"
                                    >
                                        Perlengkapan Musim Hujan
                                    </div>
                                </td>
                                <td
                                    class="py-3 text-center text-gray-900 print:text-black text-sm"
                                >
                                    {transaction.jasHujan} Pcs
                                </td>
                                <td
                                    class="py-3 text-right text-gray-900 print:text-black text-sm"
                                >
                                    Rp 0
                                </td>
                                <td
                                    class="py-3 text-right font-bold text-gray-900 print:text-black text-sm uppercase"
                                >
                                    Free
                                </td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>

            <!-- Payment Information Section -->
            <div
                class="grid grid-cols-2 gap-8 pt-6 border-t border-gray-900 print:border-black mt-8"
            >
                <div>
                    <p
                        class="text-xs font-bold text-gray-400 print:text-black uppercase tracking-widest mb-3"
                    >
                        Status Pembayaran
                    </p>
                    <div class="flex items-center gap-2">
                        {#if transaction.status === "PENDING"}
                            <div
                                class="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded print:border-black print:text-black"
                            >
                                Belum Lunas (Menunggu DP)
                            </div>
                        {:else if transaction.status === "DIBATALKAN"}
                            <div
                                class="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded print:border-black print:text-black line-through"
                            >
                                Transaksi Dibatalkan
                            </div>
                        {:else}
                            <div
                                class="px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded print:border-black print:text-black"
                            >
                                LUNAS Terbayar
                            </div>
                        {/if}
                    </div>
                    <p
                        class="text-[10px] text-gray-400 print:text-black mt-2 italic"
                    >
                        {#if transaction.status === "PENDING"}
                            * DP minimal 30% diperlukan untuk konfirmasi
                            booking.
                        {:else if transaction.status === "AKTIF" || transaction.status === "SELESAI"}
                            Pembayaran telah diterima dan divalidasi oleh
                            sistem.
                        {/if}
                    </p>
                </div>

                <div class="flex justify-end">
                    <div class="w-full sm:w-64">
                        <div class="flex justify-between items-center mb-1">
                            <span
                                class="text-xs text-gray-500 print:text-black uppercase font-medium"
                                >Total Biaya</span
                            >
                            <span
                                class="text-sm font-bold text-gray-900 print:text-black"
                                >{formatRupiah(transaction.totalBiaya)}</span
                            >
                        </div>

                        {#if transaction.status === "PENDING"}
                            <div
                                class="flex justify-between items-center mb-1 text-amber-600 print:text-black"
                            >
                                <span class="text-[10px] uppercase font-bold"
                                    >DP (30%) Minimal</span
                                >
                                <span class="text-sm font-bold"
                                    >{formatRupiah(
                                        transaction.totalBiaya * 0.3,
                                    )}</span
                                >
                            </div>
                            <div
                                class="flex justify-between items-center pt-2 border-t border-gray-100 print:border-black mt-2"
                            >
                                <span
                                    class="text-[10px] text-gray-400 print:text-black uppercase font-medium"
                                    >Sisa Pelunasan</span
                                >
                                <span
                                    class="text-sm font-bold text-gray-900 print:text-black"
                                    >{formatRupiah(
                                        transaction.totalBiaya * 0.7,
                                    )}</span
                                >
                            </div>
                        {:else if transaction.status !== "DIBATALKAN"}
                            <div
                                class="flex justify-between items-center mb-1 text-green-600 print:text-black"
                            >
                                <span class="text-[10px] uppercase font-bold"
                                    >Dibayar (Lunas)</span
                                >
                                <span class="text-sm font-bold"
                                    >{formatRupiah(
                                        transaction.totalBiaya,
                                    )}</span
                                >
                            </div>
                            <div
                                class="flex justify-between items-center pt-2 border-t border-gray-100 print:border-black mt-2"
                            >
                                <span
                                    class="text-[10px] text-gray-400 print:text-black uppercase font-medium"
                                    >Sisa Tagihan</span
                                >
                                <span
                                    class="text-sm font-bold text-gray-900 print:text-black"
                                    >Rp 0</span
                                >
                            </div>
                        {/if}

                        <div
                            class="flex justify-between items-center pt-3 border-t-2 border-gray-900 print:border-black mt-3"
                        >
                            <span
                                class="text-sm font-black text-gray-900 print:text-black uppercase tracking-widest print:text-xs"
                            >
                                {transaction.status === "PENDING"
                                    ? "Tagihan"
                                    : "Grand Total"}
                            </span>
                            <span
                                class="text-lg font-black text-gray-900 print:text-black print:text-base"
                            >
                                {#if transaction.status === "PENDING"}
                                    {formatRupiah(transaction.totalBiaya * 0.3)}
                                    <span
                                        class="block text-[8px] font-normal normal-case text-right text-gray-400 print:text-black"
                                    >
                                        (Min. DP)
                                    </span>
                                {:else}
                                    {formatRupiah(transaction.totalBiaya)}
                                {/if}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Disclaimer -->
            <div class="mt-12 print:mt-10 text-center">
                <p
                    class="text-[10px] text-gray-400 print:text-black italic mb-1 uppercase tracking-widest font-bold"
                >
                    Thank You For Your Business
                </p>
                <p
                    class="text-[8px] text-gray-300 print:text-black uppercase tracking-tighter leading-none font-medium"
                >
                    Rosantibike Motorent - Professional Bike Rental Service in
                    Bali
                </p>
            </div>

            <!-- QR Code Section -->
            {#if transaction.status === "PENDING" && transaction.qrisBase64}
                <div
                    class="mt-12 pt-8 border-t border-dashed border-gray-200 text-center"
                >
                    <p
                        class="text-xs font-bold text-gray-900 print:text-black mb-4 uppercase tracking-widest"
                    >
                        Lakukan Pembayaran Via QRIS
                    </p>
                    <div
                        class="inline-block p-4 bg-white border-2 border-gray-900 rounded-xl shadow-lg print:shadow-none"
                    >
                        <img
                            src={transaction.qrisBase64}
                            alt="QRIS Payment"
                            class="w-40 h-40 mx-auto filter print:grayscale"
                        />
                    </div>
                    <p
                        class="mt-4 text-[10px] text-gray-400 print:text-black flex flex-col items-center gap-1"
                    >
                        <span class="font-bold">SCAN UNTUK BAYAR</span>
                        <span
                            >Silahkan konfirmasi setelah pembayaran berhasil</span
                        >
                    </p>
                </div>
            {/if}
        </div>
    {/if}
</div>
