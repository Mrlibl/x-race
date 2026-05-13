<script setup>
import defultIcon from '@/assets/images/campaign/icon1.png'
import { useI18n } from "vue-i18n";
const { t } = useI18n()

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})
const cardData = computed(() => props.data || {})
const userId = ref(JSON.parse(localStorage.getItem('userData'))?.id)

// 本地收藏状态（初始化时取cardData.isCollect）
const isCollect = ref(!!cardData.value.isCollect)

const followClick = async () => {
  isCollect.value = true
  try {
    const url = `https://nodeapi.carx.cz/lottery/follow_project`
    const payload = {
      userId: userId.value,
      projectId: cardData.value.id
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
    if (data.code === 200) {
      document.dispatchEvent(
        new CustomEvent('updateFollowList'),
      )
    } else {
      isCollect.value = false
    }
  } catch (err) {
    isCollect.value = false
    console.error('请求失败:', err)
  }
}


const unfollowClick = async () => {
  isCollect.value = false
  try {
    const url = `https://nodeapi.carx.cz/lottery/unfollow_project`
    const payload = {
      userId: userId.value,
      projectId: cardData.value.id
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
    if (data.code === 200) {
      document.dispatchEvent(
        new CustomEvent('updateFollowList'),
      )
    } else {
      isCollect.value = true
    }
  } catch (err) {
    isCollect.value = true
    console.error('请求失败:', err)
  }
}


const handleErrorAvatar = (event) => {
  event.target.src = defultIcon
}
</script>

<template>
  <VCard class="position-relative">
    <VCardText>
      <div class="d-flex align-center gap-2 mb-2">
        <img :src="cardData.icon || defultIcon" @error="handleErrorAvatar"
          style="width: 4rem; height: 4rem; border-radius: 5px;" />
        <h5 class="text-h5">
          {{ cardData.title }}
        </h5>
      </div>
      <div class="d-flex align-center justify-space-between">
        <h4 class="text-h6 ">
          {{ cardData?.options && cardData?.options[0]?.option_key }}
        </h4>
        <div class="d-flex align-center gap-2">
          <span>{{ Math.round(cardData?.options && cardData?.options[0]?.prices?.yesPrice * 100) || 0 }}%</span>
          <div class="yes-no-wrap"> <!-- ✅ 整体容器 -->
            <!-- 左：YES -->
            <div class="yn__half yes">
              <img src="@/assets/images/campaign/yes.png" alt="YES" />
              <span>{{ t('YES') }}</span>
            </div>

            <!-- 右：NO -->
            <div class="yn__half no">
              <img src="@/assets/images/campaign/no.png" alt="NO" />
              <span>{{ t('NO') }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="d-flex align-center justify-space-between mt-4">
        <h4 class="text-h6 ">
          {{ cardData?.options && cardData?.options[1]?.option_key }}
        </h4>
        <div class="d-flex align-center gap-2">
          <span>{{ Math.round(cardData?.options && cardData?.options[1]?.prices?.yesPrice * 100) || 0 }}%</span>
          <div class="yes-no-wrap"> <!-- ✅ 整体容器 -->
            <!-- 左：YES -->
            <div class="yn__half yes">
              <img src="@/assets/images/campaign/yes.png" alt="YES" />
              <span>{{ t('YES') }}</span>
            </div>

            <!-- 右：NO -->
            <div class="yn__half no">
              <img src="@/assets/images/campaign/no.png" alt="NO" />
              <span>{{ t('NO') }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="d-flex align-center justify-space-between mt-4">
        <div class="d-flex align-center gap-2">
          <img src="@/assets/images/campaign/icon_20_total.png" style="width: 1.25rem;" />
          <div class="mt-1" style="font-size: 0.875rem; color: #ccc;">
            {{ t('totalVol') }} <span style="color: #FF3434">{{ Number(cardData?.total_bet_amount || 0).toFixed(2)
              }}</span>
          </div>
        </div>
        <img v-if="isCollect" src="@/assets/images/campaign/icon_32_flag_sel.png"
          style="width: 1.25rem; cursor: pointer;" @click.stop="unfollowClick" />

        <img v-else src="@/assets/images/campaign/icon_32_flag_nor.png" style="width: 1.25rem; cursor: pointer;"
          @click.stop="followClick" />
      </div>

    </VCardText>


  </VCard>
</template>

<style lang="scss" scoped>
.v-card--variant-elevated {
  background-color: rgb(var(--v-theme-181818));
}

/* 可调参数：斜角宽度 */
.yes-no-wrap {
  --skew: 14px;
  /* 斜角尺寸，按需要调大/调小 */
}

.yes-no-wrap {
  position: relative;
  width: 11.25rem;
  /* 总宽度，自行调整 */
  height: 2.25rem;
  /* 跟你原来图片一样高 */
  display: flex;
  overflow: hidden;
  /* ✅ 由容器统一裁圆角 */
  border-radius: 6px;
}

@media (max-width: 1650px) {
  .yes-no-wrap {
    width: 10rem;
  }
}

@media (max-width: 1550px) {
  .yes-no-wrap {
    width: 8rem;
  }
}

@media (max-width: 1430px) {
  .yes-no-wrap {
    width: 6rem;
  }
}

@media (max-width: 960px) {
  .yes-no-wrap {
    width: 11.25rem;
  }
}

@media (max-width: 600px) {
  .yes-no-wrap {
    width: 11.25rem;
  }
}



.yn__half {
  position: relative;
  flex: 1 0 50%;
  cursor: pointer;
}

.yn__half img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 文本覆盖在图片上 */
.yn__half span {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 0.9rem;
  letter-spacing: .5px;
  pointer-events: none;
}

/* 绿色文字 */
.yes span {
  color: #3EC419;
}

/* 红色文字 */
.no span {
  color: #FF3434;
}


/* 斜角切割 + 右半块压住左半块避免缝隙 */
.yes {
  clip-path: polygon(0 0,
      calc(100%) 0,
      calc(100% - (var(--skew))) 100%,
      0 100%);
}

.no {
  clip-path: polygon(var(--skew) 0, 100% 0, 100% 100%, 0 100%);
  margin-left: calc(var(--skew) * -1);
  /* ✅ 关键：向左叠一点，消除缝 */
}
</style>
