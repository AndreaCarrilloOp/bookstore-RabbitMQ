<template>
  <div class="site-shell">
    <a class="skip-link" href="#contenido">Saltar al contenido principal</a>
    <header class="topbar">
      <nav class="container nav" aria-label="Navegación principal">
        <router-link class="logo" to="/" aria-label="Bookstore, inicio">Bookstore</router-link>
        <div class="nav-links">
          <router-link to="/book">Libros</router-link>
          <router-link to="/author">Autores</router-link>
          <router-link to="/publisher">Editoriales</router-link>
        </div>
      </nav>
    </header>
    <main id="contenido" class="container"><router-view /></main>
  </div>
</template>
