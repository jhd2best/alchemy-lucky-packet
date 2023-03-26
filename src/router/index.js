import Vue from 'vue'
import VueRouter from 'vue-router'
import Send from '../views/Send.vue'
import History from '../views/History.vue'
import Claim from '../views/Claim.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/send' },
  {
    path: '/send',
    name: 'send',
    component: Send
  },
  {
    path: '/history',
    name: 'history',
    component: History
  },
  {
    path: '/claim',
    name: 'claimIndex',
    component: Claim
  },
  {
    path: '/claim/:id',
    name: 'claimPacket',
    component: Claim
  }
]

const router = new VueRouter({
  routes
})

export default router
