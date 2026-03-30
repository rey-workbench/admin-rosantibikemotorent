<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Send, Phone, X } from "lucide-svelte";
  import { whatsappMessages } from "$lib/services/websocket";
  import websocketService from "$lib/services/websocket";
  import { whatsappApi } from "$lib/api";
  import { Button, Input, Badge } from "$lib/components/ui";
  import { toast } from "$lib/stores/toast";

  let isOpen = $state(false);
  let messageInput = $state("");
  let selectedChat = $state<string | null>(null);
  let selectedChatName = $state<string>("");
  let isSending = $state(false);
  let unreadCount = $derived($whatsappMessages.filter(m => !m.fromMe).length);

  let unsubscribe: (() => void) | null = null;

  onMount(() => {
    // Subscribe to incoming messages
    unsubscribe = websocketService.onWhatsAppMessage((message) => {
      console.log("New message received:", message);
      
      // Show browser notification
      if (!message.fromMe && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(message.notifyName || message.from, {
          body: message.body,
          icon: '/favicon.png'
        });
      }
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  async function handleSend() {
    if (!selectedChat || !messageInput.trim()) return;

    isSending = true;
    try {
      await whatsappApi.sendMessage(selectedChat, messageInput);
      messageInput = "";
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Gagal mengirim pesan");
    } finally {
      isSending = false;
    }
  }

  function selectChat(from: string, notifyName?: string) {
    selectedChat = from;
    selectedChatName = notifyName || from;
    
    // Mark as read
    whatsappMessages.update(messages => 
      messages.map(m => m.from === from ? { ...m, read: true } : m)
    );
  }

  function toggleWidget() {
    isOpen = !isOpen;
  }

  function getUniqueChats() {
    const chatsMap = new Map();
    
    $whatsappMessages.forEach(msg => {
      const key = msg.from;
      if (!chatsMap.has(key)) {
        chatsMap.set(key, {
          from: msg.from,
          notifyName: msg.notifyName || msg.from,
          lastMessage: msg.body,
          timestamp: msg.timestamp,
          unread: !msg.fromMe
        });
      }
    });

    return Array.from(chatsMap.values());
  }
</script>

<!-- Floating Button -->
{#if !isOpen}
  <button
    class="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all z-50"
    onclick={toggleWidget}
  >
    <Phone size={24} />
    {#if unreadCount > 0}
      <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
        {unreadCount}
      </span>
    {/if}
  </button>
{/if}

<!-- Chat Widget -->
{#if isOpen}
  <div class="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-border-color">
    <!-- Header -->
    <div class="bg-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
      <div>
        <h3 class="font-semibold">WhatsApp Messages</h3>
        {#if selectedChatName}
          <p class="text-xs opacity-90">{selectedChatName}</p>
        {/if}
      </div>
      <button onclick={toggleWidget} class="hover:bg-green-700 p-1 rounded">
        <X size={20} />
      </button>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <!-- Chat List -->
      {#if !selectedChat}
        <div class="flex-1 overflow-y-auto">
          {#if getUniqueChats().length === 0}
            <div class="p-8 text-center text-text-muted">
              <Phone size={48} class="mx-auto mb-4 opacity-30" />
              <p>Tidak ada pesan</p>
            </div>
          {:else}
            {#each getUniqueChats() as chat}
              <button
                class="w-full p-4 border-b border-border-color hover:bg-bg-surface transition-colors text-left"
                onclick={() => selectChat(chat.from, chat.notifyName)}
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <p class="font-semibold text-sm">{chat.notifyName}</p>
                    <p class="text-xs text-text-muted truncate">{chat.lastMessage}</p>
                  </div>
                  {#if chat.unread}
                    <Badge variant="success" text="Baru" />
                  {/if}
                </div>
              </button>
            {/each}
          {/if}
        </div>
      {:else}
        <!-- Message View -->
        <div class="flex-1 flex flex-col">
          <!-- Back Button -->
          <div class="p-2 border-b border-border-color">
            <button
              class="text-sm text-primary hover:underline"
              onclick={() => (selectedChat = null)}
            >
              ← Back to chats
            </button>
          </div>

          <!-- Messages -->
          <div class="flex-1 overflow-y-auto p-4 space-y-2">
            {#each $whatsappMessages.filter(m => m.from === selectedChat) as message}
              <div class="flex {message.fromMe ? 'justify-end' : 'justify-start'}">
                <div
                  class="max-w-[80%] rounded-lg p-3 {message.fromMe
                    ? 'bg-green-100 text-green-900'
                    : 'bg-gray-100 text-gray-900'}"
                >
                  <p class="text-sm">{message.body}</p>
                  <p class="text-xs opacity-60 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            {/each}
          </div>

          <!-- Input -->
          <div class="p-4 border-t border-border-color">
            <div class="flex gap-2">
              <input
                type="text"
                bind:value={messageInput}
                placeholder="Type a message..."
                class="flex-1 px-4 py-2 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                onkeydown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button
                variant="primary"
                onclick={handleSend}
                loading={isSending}
                disabled={!messageInput.trim()}
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
