<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { Editor } from "@tiptap/core";
    import StarterKit from "@tiptap/starter-kit";
    import Underline from "@tiptap/extension-underline";
    import Link from "@tiptap/extension-link";
    import TextAlign from "@tiptap/extension-text-align";
    import Highlight from "@tiptap/extension-highlight";
    import Image from "@tiptap/extension-image";
    import Youtube from "@tiptap/extension-youtube";
    import { Modal, Input, Button } from "$lib/components/ui";
    import { blogApi } from "$lib/api";

    let {
        value = $bindable(""),
        placeholder = "Write something...",
        label = "",
        id = "wysiwyg-editor",
        class: className = "",
        blogId = null as string | null,
        oncommit = () => {},
        parentCommit = false,
    } = $props();

    let editorElement: HTMLDivElement;
    let editor: Editor;

    // URL Modal State
    let showUrlModal = $state(false);
    let urlInput = $state("");
    let urlType = $state<"link" | "image" | "video">("link");
    let isUploading = $state(false);
    let fileInput = $state<HTMLInputElement>();

    // Tracking uploaded images for cleanup
    let sessionImages = $state<string[]>([]);
    let isCommitted = $state(false);
    const modalConfig = {
        link: { title: "Tambah Tautan", label: "URL Tautan" },
        image: { title: "Tambah Gambar", label: "URL Gambar" },
        video: { title: "Tambah Video YouTube", label: "URL Video YouTube" },
    };

    function openModal(type: "link" | "image" | "video") {
        urlType = type;
        urlInput = "";

        // Predent with current value if editing a link
        if (type === "link" && editor.isActive("link")) {
            urlInput = editor.getAttributes("link").href || "";
        }

        showUrlModal = true;
    }

    function handleModalSubmit() {
        if (!urlInput) {
            if (urlType === "link") {
                editor.chain().focus().unsetLink().run();
            }
            showUrlModal = false;
            return;
        }

        const chain = editor.chain().focus();

        if (urlType === "link") {
            chain.setLink({ href: urlInput }).run();
        } else if (urlType === "image") {
            chain.setImage({ src: urlInput }).run();
        } else if (urlType === "video") {
            chain.setYoutubeVideo({ src: urlInput }).run();
        }

        showUrlModal = false;
    }

    async function handleFileChange(e: Event) {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        isUploading = true;
        try {
            const url = await blogApi.uploadImage(file, blogId || undefined);
            urlInput = url;
            sessionImages.push(url);
            // Auto submit if image uploaded
            handleModalSubmit();
        } catch (err) {
            console.error("Error uploading image:", err);
            alert("Gagal mengupload gambar");
        } finally {
            isUploading = false;
        }
    }

    onMount(() => {
        editor = new Editor({
            element: editorElement,
            extensions: [
                StarterKit,
                Underline,
                Link.configure({
                    openOnClick: false,
                }),
                TextAlign.configure({
                    types: ["heading", "paragraph"],
                }),
                Highlight,
                Image.configure({
                    HTMLAttributes: {
                        class: "max-w-full h-auto rounded-lg",
                    },
                }),
                Youtube.configure({
                    width: 480,
                    height: 320,
                }),
            ],
            content: value,
            editorProps: {
                attributes: {
                    class: "format format-sm sm:format-base lg:format-lg focus:outline-none max-w-none min-h-[300px] px-4 py-3",
                    id: id,
                },
            },
            onUpdate: ({ editor }) => {
                value = editor.getHTML();
            },
        });
    });

    onDestroy(async () => {
        if (editor) {
            editor.destroy();
        }

        // Cleanup unsaved images if not committed
        if (!isCommitted && sessionImages.length > 0) {
            console.log("Cleaning up unsaved images...", sessionImages);
            for (const url of sessionImages) {
                try {
                    await blogApi.deleteImage(url);
                } catch (err) {
                    console.error("Failed to delete unsaved image:", url, err);
                }
            }
        }
    });

    $effect(() => {
        if (parentCommit) {
            isCommitted = true;
            sessionImages = [];
        }
    });

    $effect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    });
</script>

<div class="flex flex-col gap-2 {className}">
    {#if label}
        <label for={id} class="text-sm font-bold text-gray-700">{label}</label>
    {/if}

    <div
        class="w-full bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
    >
        <!-- Toolbar -->
        <div
            class="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 bg-gray-50/50"
        >
            <button
                type="button"
                onclick={() => editor.chain().focus().toggleBold().run()}
                class="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all {editor?.isActive(
                    'bold',
                )
                    ? 'bg-white shadow-sm text-primary'
                    : ''}"
                title="Bold"
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6zM6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"
                    ></path></svg
                >
            </button>
            <button
                type="button"
                onclick={() => editor.chain().focus().toggleItalic().run()}
                class="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all {editor?.isActive(
                    'italic',
                )
                    ? 'bg-white shadow-sm text-primary'
                    : ''}"
                title="Italic"
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 20l4-16m-4 0h4m-4 16h4"
                    ></path></svg
                >
            </button>
            <button
                type="button"
                onclick={() => editor.chain().focus().toggleUnderline().run()}
                class="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all {editor?.isActive(
                    'underline',
                )
                    ? 'bg-white shadow-sm text-primary'
                    : ''}"
                title="Underline"
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 19H8m8-14v9a4 4 0 01-8 0V5"
                    ></path></svg
                >
            </button>
            <div class="w-px h-4 bg-gray-200 mx-1"></div>

            <button
                type="button"
                onclick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()}
                class="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all {editor?.isActive(
                    'heading',
                    { level: 1 },
                )
                    ? 'bg-white shadow-sm text-primary'
                    : ''}"
                title="H1"
            >
                <span class="text-xs font-bold">H1</span>
            </button>
            <button
                type="button"
                onclick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()}
                class="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all {editor?.isActive(
                    'heading',
                    { level: 2 },
                )
                    ? 'bg-white shadow-sm text-primary'
                    : ''}"
                title="H2"
            >
                <span class="text-xs font-bold">H2</span>
            </button>

            <div class="w-px h-4 bg-gray-200 mx-1"></div>

            <button
                type="button"
                onclick={() => editor.chain().focus().toggleBulletList().run()}
                class="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all {editor?.isActive(
                    'bulletList',
                )
                    ? 'bg-white shadow-sm text-primary'
                    : ''}"
                title="Bullet List"
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h16"
                    ></path></svg
                >
            </button>
            <button
                type="button"
                onclick={() => editor.chain().focus().toggleOrderedList().run()}
                class="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all {editor?.isActive(
                    'orderedList',
                )
                    ? 'bg-white shadow-sm text-primary'
                    : ''}"
                title="Ordered List"
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 8h13M7 12h13M7 16h13M4 8h.01M4 12h.01M4 16h.01"
                    ></path></svg
                >
            </button>

            <div class="w-px h-4 bg-gray-200 mx-1"></div>

            <button
                type="button"
                onclick={() =>
                    editor.chain().focus().setTextAlign("left").run()}
                class="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all {editor?.isActive(
                    { textAlign: 'left' },
                )
                    ? 'bg-white shadow-sm text-primary'
                    : ''}"
                title="Align Left"
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M4 12h10M4 18h16"
                    ></path></svg
                >
            </button>
            <button
                type="button"
                onclick={() =>
                    editor.chain().focus().setTextAlign("center").run()}
                class="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all {editor?.isActive(
                    { textAlign: 'center' },
                )
                    ? 'bg-white shadow-sm text-primary'
                    : ''}"
                title="Align Center"
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M7 12h10M4 18h16"
                    ></path></svg
                >
            </button>
            <button
                type="button"
                onclick={() =>
                    editor.chain().focus().setTextAlign("right").run()}
                class="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all {editor?.isActive(
                    { textAlign: 'right' },
                )
                    ? 'bg-white shadow-sm text-primary'
                    : ''}"
                title="Align Right"
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M10 12h10M4 18h16"
                    ></path></svg
                >
            </button>

            <div class="w-px h-4 bg-gray-200 mx-1"></div>

            <button
                type="button"
                onclick={() => editor.chain().focus().toggleBlockquote().run()}
                class="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all {editor?.isActive(
                    'blockquote',
                )
                    ? 'bg-white shadow-sm text-primary'
                    : ''}"
                title="Blockquote"
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    ></path></svg
                >
            </button>
            <button
                type="button"
                onclick={() => openModal("link")}
                class="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all {editor?.isActive(
                    'link',
                )
                    ? 'bg-white shadow-sm text-primary'
                    : ''}"
                title="Link"
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    ></path></svg
                >
            </button>
            <button
                type="button"
                onclick={() => openModal("image")}
                class="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all"
                title="Image"
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path></svg
                >
            </button>
            <button
                type="button"
                onclick={() => openModal("video")}
                class="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all"
                title="YouTube Video"
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    ></path></svg
                >
            </button>
        </div>

        <!-- Editor Content -->
        <div bind:this={editorElement}></div>
    </div>
</div>

<!-- Link/Image/Video Modal -->
<Modal
    open={showUrlModal}
    title={modalConfig[urlType].title}
    onclose={() => (showUrlModal = false)}
>
    <form
        onsubmit={(e) => {
            e.preventDefault();
            handleModalSubmit();
        }}
    >
        <div class="flex flex-col gap-4">
            <Input
                id="url-input"
                label={modalConfig[urlType].label}
                bind:value={urlInput}
                placeholder="https://..."
                required
                onkeydown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        handleModalSubmit();
                    }
                }}
            />

            {#if urlType === "image"}
                <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                        <div class="h-px flex-1 bg-border"></div>
                        <span
                            class="text-xs text-text-muted uppercase font-bold"
                            >Atau</span
                        >
                        <div class="h-px flex-1 bg-border"></div>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        class="hidden"
                        bind:this={fileInput}
                        onchange={handleFileChange}
                    />
                    <Button
                        variant="secondary"
                        class="w-full"
                        onclick={() => fileInput?.click()}
                        loading={isUploading}
                    >
                        Pilih Gambar dari Perangkat
                    </Button>
                </div>
            {/if}

            <div class="flex justify-end gap-2 pt-2">
                <Button
                    variant="secondary"
                    onclick={() => (showUrlModal = false)}
                >
                    Batal
                </Button>
                <Button type="submit" variant="primary">Simpan</Button>
            </div>
        </div>
    </form>
</Modal>

<style>
    /* TipTap Editor Styles */
    :global(.ProseMirror) {
        outline: none !important;
    }

    :global(.ProseMirror p.is-editor-empty:first-child::before) {
        content: attr(data-placeholder);
        float: left;
        color: #9ca3af;
        pointer-events: none;
        height: 0;
    }

    :global(.ProseMirror img) {
        display: block;
        max-width: 100%;
        height: auto;
    }

    :global(.ProseMirror img.ProseMirror-selectednode) {
        outline: 3px solid #4361ee;
    }
</style>
