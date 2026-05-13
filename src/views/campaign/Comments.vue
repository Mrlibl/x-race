<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useDisplay } from "vuetify";
import { themeConfig } from "@themeConfig";
import avatar1 from "@/assets/images/avatars/avatar-1.png";
import avatar2 from "@/assets/images/avatars/avatar-2.png";
import { init } from "@waline/client";
import "@waline/client/style";

const { t } = useI18n();

const display = useDisplay();
const isMobile = computed(() => display.smAndDown.value);
const message = ref("");
const checkboxOne = ref(true);
const checkboxTwo = ref(false);
const checkboxThree = ref(false);
let waline: ReturnType<typeof init> | null = null;

const userData = computed(() => {
  return localStorage.getItem("userData")
    ? JSON.parse(localStorage.getItem("userData")!)
    : null;
});

const nick = computed(() => {
  return userData.value?.username
    ? userData.value.username
    : userData.value?.wallet;
});

onMounted(() => {
  const params = new URLSearchParams(location.search);
  waline = init({
    el: "#waline",
    serverURL: "https://waline.carx.cz",
    lang: "en-US",
    login: "disable",
    copyright: false,
    // path: window.location.pathname+'?'+(params.get('id') || '')+,
    path: `${window.location.pathname}?id=${params.get("id")}&gameId=${params.get("gameId")}`,
    comment: true, // 开启评论功能
    reaction: false, // 开启表情 Reaction
    pageview: true, // 开启浏览量统计
    dark: true, // 跟随系统暗色模式,
    noCopyright: true,
    locale: {
      anonymous: nick.value,
      submit: "post",
    },
    hooks: {
      // 提交评论之前
      submit(comment) {
        // 这里可以改 comment 对象，例如加头像、打标记等
        comment.avatar = "https://cravatar.cn/avatar/匿名.png?d=retro";
        // 必须 return 才会真正发出去
        return comment;
      },

      // 提交评论成功之后
      afterSubmit(comment) {
        console.log("评论已提交成功：", comment);
      },
    },
  });
});
onBeforeUnmount(() => {
  // 组件卸载时销毁 Waline 实例，避免内存泄漏
  waline?.destroy();
});
</script>

<template>
  <VRow>
    <!-- <VCol col="12" sm="6">
      <VTextField v-model="message" clear-icon="ri-close-line" placeholder="Add a Commet" type="text">
        <template #append-inner>
          <VFadeTransition leave-absolute>
            <div>post</div>
          </VFadeTransition>
        </template>

      </VTextField>
    </VCol>

    <VCol col="12" sm="6" style="margin: auto;">
      <div class="d-flex align-center justify-space-between">
        <VCheckbox v-model="checkboxOne" label="Newest" />

        <VCheckbox v-model="checkboxTwo" label="More Likes" />

        <VCheckbox v-model="checkboxThree" label="Holders" />

        <a style="text-decoration: underline;">Watch out for external links</a>
      </div>
    </VCol> -->

    <VCol col="12">
      <div class="d-flex gap-2">
        <div class="div-q" id="waline"></div>
        <!-- <div>
          <img :src="avatar1" style="width: 2.5rem; border-radius: 9999px;" />
        </div> -->
        <!-- <div>
          <div class="d-flex gap-2">
            <div style="font-size: 1rem ;color: #fff">Fasters</div>
            <div class="px-2"
              style="font-size: 0.875rem; background: rgba(62,196,25,0.2); color: #3EC419; border-radius: 12px">
              51
              Williams
              Yes</div>
            <div style="font-size: 0.875rem; ">8h ago</div>
          </div>
          <div class="mt-2" style="color: #fff">
            Being a tifosi need a strong heart
          </div>
          <div class="d-flex gap-2 mt-4">
            <div>
              <img src="@/assets/images/campaign/icon_20_comment.png" style="width: 1.25rem;" />
            </div>

          </div>
        </div> -->
      </div>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
:deep(.wl-actions a) {
  display: none !important;
}
.div-q {
  width: 100%;
  height: 100%;
}
</style>
