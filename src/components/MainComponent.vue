<template>

  <div class="page">
    <AppHeader></AppHeader>
    <div class="page-wrapper">
  <div>
    <router-view />
  </div>

    </div>
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue';


export default {
  name: "EuroLux",
  components: {
    AppHeader,
  }
};
</script>