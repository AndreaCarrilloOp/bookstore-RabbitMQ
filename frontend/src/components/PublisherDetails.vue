<template><EntityDetails entity="publisher" :mode="mode" /></template>
<script setup>
import EntityDetails from "./EntityDetails.vue";
defineProps({ mode: { type: String, required: true } });
</script>
