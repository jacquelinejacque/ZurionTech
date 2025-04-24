<script>
export default {
  components: {},
  data() {
    return {}
  },
  props: [],

  methods: {
    handleLogout() {
      localStorage.clear()
      window.location.reload()
    }
  }
}
</script>

<template>

  <header class="navbar-expand-md">
    <div class="collapse navbar-collapse" id="navbar-menu">
      <div class="navbar">
        <div class="container-xxl">
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu"
            aria-controls="navbar-menu" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <!-- <h1 class="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
            <a href="/"> SalesLink </a>
          </h1> -->



          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" href="/stockManager/dashboard/dashboard-view">
                <span class="nav-link-icon d-md-none d-lg-inline-block">
                  <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  
                  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  
                  class="icon icon-tabler icons-tabler-outline icon-tabler-brand-databricks">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M3 17l9 5l9 -5v-3l-9 5l-9 -5v-3l9 5l9 -5v-3l-9 5l-9 -5l9 -5l5.418 3.01" />
                  </svg>
                </span>
                <span class="nav-link-title"> Contact </span>
              </a>
            </li>
            <li class="nav-item">
           
            </li>

          </ul>
          <!-- search form  -->
          <!-- <div class="my-2 my-md-0 flex-grow-1 flex-md-grow-0 order-first order-md-last">
            <form action="./" method="get" autocomplete="off" novalidate>
              <div class="input-icon">
                <span class="input-icon-addon">
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24"
                    stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                    <path d="M21 21l-6 -6" />
                  </svg>
                </span>
                <input type="text" value="" class="form-control" placeholder="Search…" aria-label="Search in website" />
              </div>
            </form>
          </div> -->

          <!-- search form  -->
          <!-- profile and settings menu  -->
          <div class="navbar-nav flex-row ms-auto order-md-last">
            <div class="nav-item dropdown">
              <a href="#" class="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown"
                aria-label="Open user menu">
                <span class="avatar avatar-sm" style="background-image: url(./static/avatars/000m.jpg)"></span>
                <div class="d-none d-xl-block ps-2">
                  <div>ZurionTech</div>
                  <div class="mt-1 small text-muted">Manager</div>
                </div>
              </a>
              <div class="dropdown-menu dropdown-menu-end dropdown-menu-arrow">


                <div class="dropdown-divider"></div>
                <a href="/saleslink/settings" class="dropdown-item">Settings</a>
                <a class="dropdown-item" @click="handleLogout">Logout</a>
              </div>
            </div>
          </div>
          <!-- profile and settings menu  -->
        </div>
      </div>
    </div>
  </header>
</template>


<style>
.nav-link {
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-link-icon {
  margin-right: 0.2rem;

}
</style>