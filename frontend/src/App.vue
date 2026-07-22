<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { client } from '@/api/client'
import { Button } from '@/components/ui/button'

const health = ref<string>('đang kiểm tra...')

async function check() {
  try {
    const { data } = await client.get('/health')
    health.value = `${data.data.app} · db=${data.data.db} · ${data.data.time}`
  } catch (e) {
    health.value = 'Không kết nối được backend'
  }
}
onMounted(check)
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center gap-4">
    <h1 class="text-2xl font-bold">cafe-connect</h1>
    <p class="text-sm text-muted-foreground">{{ health }}</p>
    <Button @click="check">Kiểm tra lại</Button>
  </main>
</template>