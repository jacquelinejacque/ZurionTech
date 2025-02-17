<script>
import 'bootstrap/dist/css/bootstrap.min.css';



export default {
  name: "contactRegistry",
  components: {

  }
}
</script>

<template>
  <main class="d-flex flex-column">
    <router-view :key="$route.fullPath"></router-view>


  </main>
</template>