<script setup>
import LoginForm from './LoginForm.vue'
</script>

<template>
  <!-- <div class=" d-flex flex-column"> -->
  <div class="page page-center">
    <div class="container container-tight py-4">
      <div class="text-center mb-4">
        <!-- <a href="." class="navbar-brand navbar-brand-autodark">
          <img src="./static/logo.svg" height="36" alt=""></a> -->
      </div>
      <div class="card card-md mx-auto w-75 w-md-50" style="max-width: 400px;">

        <div class="card-body">
          <h2 class="h2 text-center mb-4">Login to your account</h2>
          <LoginForm />
        </div>
      </div>


    </div>
  </div>
  <!-- </div> -->
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>