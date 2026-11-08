import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/Home.vue';
import BookIndex from './components/BookIndex.vue';
import BookDetails from './components/BookDetails.vue';
import AuthorIndex from './components/AuthorIndex.vue';
import AuthorDetails from './components/AuthorDetails.vue';
import PublisherIndex from './components/PublisherIndex.vue';
import PublisherDetails from './components/PublisherDetails.vue';
const routes = [
  { path: '/', component: Home },
  ...[
    ['book', BookIndex, BookDetails],
    ['author', AuthorIndex, AuthorDetails],
    ['publisher', PublisherIndex, PublisherDetails]
  ].flatMap(([name, Index, Details]) => [
    { path: `/${name}`, component: Index },
    { path: `/${name}/create`, component: Details, props: { mode: 'create' } },
    { path: `/${name}/edit/:id`, component: Details, props: { mode: 'edit' } },
    { path: `/${name}/show/:id`, component: Details, props: { mode: 'show' } }
  ]),
  { path: '/:pathMatch(.*)*', redirect: '/' }
];
export default createRouter({ history: createWebHistory(), routes });
