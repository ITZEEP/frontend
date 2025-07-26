import './assets/index.css'
import 'vue-awesome-paginate/dist/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueAwesomePaginate } from 'vue-awesome-paginate'

import App from './App.vue'
import router from './router'
import { useKakao } from 'vue3-kakao-maps/@utils'

window.global = window

const app = createApp(App)
const kakao_map_key = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY
useKakao(kakao_map_key, ['services'])

app.use(VueAwesomePaginate)
app.use(createPinia())
app.use(router)

app.mount('#app')
