<template>
  <div class="site-shell">
    <header class="topbar">
      <nav class="container nav" aria-label="Navegación principal">
        <router-link class="logo" to="/">Bookstore</router-link>
        <div class="nav-links">
          <router-link to="/book">Libros</router-link>
          <router-link to="/author">Autores</router-link>
          <router-link to="/publisher">Editoriales</router-link>
        </div>
      </nav>
    </header>
    <main class="container"><router-view /></main>
  </div>
</template>
