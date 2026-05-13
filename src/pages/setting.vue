<script setup lang="ts">
import defultIcon from '@/assets/images/user/1.png'
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

const inputAddress = ref('')
const isAvatar = ref(false)

const changeAvatar = () => {
  isAvatar.value = true
}

const snackbar = ref(false)
const snackbarText = ref('')

const userInfo = ref({})
const userName = ref('')
const userIcon = ref('')
const iconList = ref([])
const currentImg = ref()


const currentIcon = computed(() => {
  if (!userInfo.value || !iconList.value.length) return null
  return iconList.value.find(
    (icon: any) => String(icon.id) === String(userInfo.value.icon)
  ) || null
})

console.log(currentIcon.value, 'bbbbbbbbbb')

const getUserInfo = async () => {
  try {
    const url = `https://nodeapi.carx.cz/member/getUserDetail`
    const payload = {
      user_id: JSON.parse(localStorage.getItem('userData'))?.id,
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.message)
    if (data.code === 200 && data.data) {
      userInfo.value = data.data
      userName.value = data.data?.username
      userIcon.value = data.data.icon_image
      document.dispatchEvent(
        new CustomEvent('updateImg', {
          detail: { data: data.data.icon_image },
        }),
      )
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}



const getIconList = async () => {
  try {
    const url = `https://nodeapi.carx.cz/member/getIconList`
    const payload = {

    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.message)
    if (data.code === 200 && data.data) {
      iconList.value = data.data
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}


const saveClick = async () => {
  try {
    const url = `https://nodeapi.carx.cz/member/updateUserInfo`
    const payload = {
      user_id: JSON.parse(localStorage.getItem('userData'))?.id,
      icon_id: currentImg.value,
      username: userName.value
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.message)
    if (data.code === 200 && data.data) {
      isAvatar.value = false
      snackbar.value = true;
      snackbarText.value = "Profile Settings Submit Succeed."
      getUserInfo()
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}

const backClick = () => {
  isAvatar.value = false
}

const imgClick = (item) => {
  currentImg.value = String(item.id)
}


const handleDrawerModelValueUpdate = val => {
  isAvatar.value = false
}

const renderCodeAt = (char) => {
  if (!char) return 1
  let asciiCode = char.charCodeAt(0);
  return (asciiCode % 8) + 1;
};

onMounted(() => {
  getIconList()
  getUserInfo()
})
</script>

<template>
  <VSnackbar v-model="snackbar" :timeout="2000" location="top">
    {{ snackbarText }}
  </VSnackbar>
  <VRow class="match-height home-div mt-2">
    <VCol cols="12">
      <VCard style="height: 90vh;">
        <div class="d-flex align-center justify-center">
          <div style="text-align: center;">
            <div class="title">{{ t('profile.setting_title') }}</div>
            <div style="display: inline-block;">
              <img
                :src="userIcon || `https://xrace-resource.s3.us-west-2.amazonaws.com/user-images/avatar-${renderCodeAt(userInfo?.wallet)}.png`"
                style="width: 10rem; height: 10rem; margin-top: 2rem;" />
              <div class="change_btn py-2 mt-4" @click="changeAvatar">
                {{ t('profile.setting_btn') }}
              </div>
            </div>


            <div class="mt-6">
              <div style="">
                <div style="text-align: left;">{{ t('profile.setting_userName') }}</div>
                <VTextField class="mt-2" v-model="userName" placeholder="" type="text">
                </VTextField>
                <div class="mt-2" style="text-align: left;">
                  {{ t('profile.setting_edit') }}
                </div>
                <div class="save_btn py-2 mt-6" @click="saveClick">
                  {{ t('profile.setting_save') }}
                </div>
              </div>
            </div>
          </div>
        </div>

      </VCard>

    </VCol>
  </VRow>
  <VNavigationDrawer temporary location="end" :width="400" :model-value="isAvatar" class="scrollable-content"
    @update:model-value="handleDrawerModelValueUpdate">

    <div class="d-flex align-center gap-2 mt-4">
      <img src="@/assets/images/login/back.png" style="width: 2rem; cursor: pointer;" @click="backClick" />
      <div style="font-size: 1rem; color: #fff; font-weight: bold;">{{ t('profile.setting_choose') }}</div>
    </div>

    <PerfectScrollbar class="scroll-area mt-10" :options="{ wheelPropagation: false }">
      <div class="mx-6 avatars-grid">
        <div v-for="(item, index) in iconList" :key="index" :class="{ selected: currentImg === String(item.id) }"
          @click="imgClick(item)"
          style="text-align: center; padding:4px; border:1px dashed transparent; border-radius:99999px; cursor:pointer;">
          <img :src="item?.icon_image" style="width: 4rem; border-radius: 99999px; margin-top: 4px;" />
        </div>
      </div>

      <div class="d-flex justify-center">
        <div class="confirm py-2 mt-6" style="width: 7rem" @click="saveClick">
          {{ t('profile.setting_confirm') }}
        </div>
      </div>

    </PerfectScrollbar>

  </VNavigationDrawer>
</template>



<style lang="scss" scoped>
.home-div {
  overflow-x: hidden;
}

.title {
  font-weight: bold;
  font-size: 2rem;
  color: #FFFFFF;
  line-height: 2rem;
  margin-top: 5rem;
}

.change_btn {
  background-color: #461E1D;
  color: #FF3434;
  border-radius: 20px;
  cursor: pointer;
}

.save_btn {
  background: #FF3434;
  font-weight: 400;
  font-size: 0.875rem;
  color: #FFFFFF;
  border-radius: 4px;
}


:deep(.v-navigation-drawer__content) {
  background-color: #070707 !important;
}

/* 滚动区占满剩余高度 */
.scroll-area {
  flex: 1 1 auto;
  /* 关键：占据剩余高度 */
  overflow: hidden;
  /* 交给 PerfectScrollbar 管理滚动 */
  padding-bottom: 1rem;
  /* 视需要留底部间距 */
}

.avatars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(4rem, 1fr));
  /* 64px 起步，按宽度自适应分列 */
  gap: 0.6rem;
  /* 网格间距 */
  // padding: 12px 8px;
  /* 内边距可调 */
}


.selected {
  border-color: #FF3434;
  box-shadow: 0 0 0 2px #FF3434 inset;
  position: relative;
}

.confirm {
  background: #FF3434;
  font-weight: 400;
  font-size: 0.875rem;
  color: #FFFFFF;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
}
</style>
