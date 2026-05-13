import App from '@/App.vue'
import setupRouter, { router } from '@/plugins/1.router'
import { registerPlugins } from '@core/utils/plugins'
import { createApp } from 'vue'
import VueGtag from 'vue-gtag-next'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// Create vue app
const app = createApp(App)

// Register plugins
registerPlugins(app)
app.use(VueGtag, {
  property: {
    id: 'G-IN7F060RNP', // 你的 GA4 ID
    params: {
      send_page_view: true
    }
  },
  router, // ✅ 这里需要 router 实例
})

setupRouter(app)
// Mount vue app
app.mount('#app')
