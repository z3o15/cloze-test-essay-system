import { createRouter, createWebHistory } from 'vue-router'
import Record from './views/Record.vue'
import Display from './views/Display.vue'
import Manage from './views/Manage.vue'

const routes = [
  {
    path: '/',
    redirect: '/manage'
  },
  {
    path: '/record',
    name: 'record',
    component: Record,
    meta: {
      title: '录入作文'
    }
  },
  {
    path: '/display/:id',
    name: 'display',
    component: Display,
    meta: {
      title: '作文详情'
    }
  },
  {
    path: '/manage',
    name: 'manage',
    component: Manage,
    meta: {
      title: '作文管理'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫，设置页面标题
router.beforeEach((to, _from, next) => {
  document.title = to.meta.title as string || '考研英语作文助手'
  next()
})

export default router