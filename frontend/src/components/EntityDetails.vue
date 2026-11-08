<template>
  <section class="content narrow">
    <h2>{{ heading }}</h2>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <p v-if="message" class="notice" role="status">{{ message }}</p>
    <p v-if="loading">Cargando datos…</p>
    <form v-else @submit.prevent="submit">
      <div class="form-grid">
        <div v-for="field in config.fields" :key="field.key">
          <label :for="field.key">{{ field.label }}</label>
          <input :id="field.key" v-model="form[field.key]" class="u-full-width" :type="field.type || 'text'"
            :required="Boolean(field.required)" :readonly="mode === 'show' || submitted" />
        </div>
      </div>
      <div class="form-actions">
        <router-link :to="`/${entity}`" class="button">Volver a {{ config.plural.toLowerCase() }}</router-link>
        <button v-if="mode !== 'show'" type="submit" class="button button-primary" :disabled="saving || submitted">
          {{ saving ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </form>
  </section>
</template>
<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { entities } from '../lib/entities.js';
import { callFunction } from '../lib/api.js';
const props = defineProps({ entity: { type: String, required: true }, mode: { type: String, required: true } });
const route = useRoute();
const config = computed(() => entities[props.entity]);
const heading = computed(() => ({ create: 'Agregar', edit: 'Editar', show: 'Consultar' }[props.mode] + ' ' + config.value.singular));
const form = reactive({}); const loading = ref(false); const saving = ref(false);
const submitted = ref(false); const message = ref(''); const error = ref('');
async function initialize() {
  error.value = ''; message.value = ''; submitted.value = false;
  for (const key of Object.keys(form)) delete form[key];
  for (const fld of config.value.fields) form[fld.key] = fld.type === 'number' ? 0 : '';
  if (props.mode !== 'create') {
    loading.value = true;
    try {
      const found = await callFunction(`${props.entity}Find`, { id: route.params.id });
      if (!found.length) throw new Error('No existe el registro solicitado');
      for (const field of config.value.fields) form[field.key] = found[0][field.key] ?? (field.type === 'number' ? 0 : '');
    } catch (err) { error.value = err.message; }
    finally { loading.value = false; }
  }
}
async function submit() {
  if (saving.value || submitted.value) return;
  saving.value = true; error.value = '';
  const body = Object.fromEntries(config.value.fields.map((field) => [field.key,
    field.type === 'number' ? Number(form[field.key] ?? 0) : String(form[field.key] ?? '').trim()]));
  try {
    await (props.mode === 'create'
      ? callFunction(`${props.entity}Insert`, { method: 'POST', body })
      : callFunction(`${props.entity}Update`, { method: 'PUT', id: route.params.id, body }));
    submitted.value = true;
    message.value = 'Solicitud enviada.';
  } catch (err) { error.value = err.message; }
  finally { saving.value = false; }
}
watch(() => [props.entity, props.mode, route.params.id], initialize, { immediate: true });
</script>
