import Vue from 'vue'
import VueRouter from 'vue-router'

const visualization = () => import('@/views/Visualization')
Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Visualization',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: visualization,
    meta:{
      title: "可视化系统"
    },
  }
]

const router = new VueRouter({
  mode: 'history',
  // base: process.env.BASE_URL,
  routes: routes
})

router.beforeEach((to, from, next) => {
  // 自动化修改页面标签的 title
  document.title = to.meta.title;
  next()
});

export default router
