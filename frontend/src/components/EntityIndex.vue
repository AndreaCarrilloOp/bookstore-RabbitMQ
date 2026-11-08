<template>
  <section class="content">
    <header class="page-heading">
      <h2>{{ config.plural }}</h2>
      <router-link class="button button-primary" :to="`/${entity}/create`">Agregar {{ config.singular }}</router-link>
    </header>
    <p v-if="message" class="notice" role="status">{{ message }}</p>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <div class="toolbar"><button class="button" :disabled="loading" @click="load">{{ loading ? 'Consultando…' : 'Actualizar' }}</button></div>
    <div v-if="loading && !items.length" class="empty">Cargando información…</div>
    <div v-else-if="!items.length" class="empty">No hay registros.</div>
    <div v-else class="table-wrap"><table class="u-full-width">
      <thead><tr><th v-for="col in config.columns" :key="col.key">{{ col.label }}</th><th>Acciones</th></tr></thead>
      <tbody><tr v-for="item in items" :key="item._id">
        <td v-for="col in config.columns" :key="col.key">{{ item[col.key] ?? '—' }}</td>
        <td class="actions">
          <router-link class="button button-small" :to="`/${entity}/show/${item._id}`">Ver</router-link>
          <router-link class="button button-small" :to="`/${entity}/edit/${item._id}`">Editar</router-link>
          <button class="button button-small danger" :disabled="deletingId === item._id" @click="remove(item)">Eliminar</button>
        </td>
      </tr></tbody>
    </table></div>
  </section>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { entities } from '../lib/entities.js';
import { callFunction } from '../lib/api.js';
const props = defineProps({ entity: { type: String, required: true } });
const config = computed(() => entities[props.entity]);
const items = ref([]); const error = ref(''); const message = ref('');
const loading = ref(false); const deletingId = ref(null);
async function load() {
  loading.value = true; error.value = '';
  try { items.value = await callFunction(`${props.entity}FindAll`); }
  catch (err) { error.value = err.message; }
  finally { loading.value = false; }
}
async function remove(item) {
  if (!window.confirm(`¿Eliminar ${config.value.singular} #${item._id}?`)) return;
  deletingId.value = item._id; error.value = '';
  try {
    await callFunction(`${props.entity}Delete`, { method: 'DELETE', id: item._id });
    message.value = 'Solicitud enviada.';
  } catch (err) { error.value = err.message; }
  finally { deletingId.value = null; }
}
watch(() => props.entity, () => { items.value = []; message.value = ''; load(); }, { immediate: true });
</script>
