<script setup lang="ts">
import { SDK_PLATFORMS } from './sdk-platforms.mjs'
/**
 * Home page only (rendered in VPHome's home-features-after slot, see index.ts): links to
 * the Skapi SDK docs for the other languages. The same file is in all four docs sites
 * (docs-skapi-js, -py, -swift, -kotlin); each passes its own language as `current`, and
 * that one is left out. Logos are in each site's public/lang/.
 */
const props = defineProps<{ current: 'js' | 'py' | 'swift' | 'jvm' }>()

// The tiles come from the SDK list the base prompts are built from (sdk-platforms.mjs).
const languages = SDK_PLATFORMS.filter((lang) => lang.tile !== false && lang.id !== props.current)
</script>

<template>
  <section class="OtherLanguages" aria-labelledby="other-languages-title">
    <div class="container">
      <h2 id="other-languages-title" class="heading">Skapi in other languages</h2>
      <p class="lead">The same Skapi project works from every SDK. Pick the docs for your language.</p>
      <div class="items">
        <div v-for="lang in languages" :key="lang.id" class="item">
          <a class="card" :href="lang.link" target="_blank" rel="noopener">
            <div class="logos">
              <span v-for="logo in lang.logos" :key="logo.src" class="logo">
                <img :src="logo.src" :alt="logo.alt" width="28" height="28" />
              </span>
            </div>
            <h3 class="title" translate="no">{{ lang.name }}</h3>
            <p class="details">{{ lang.details }}</p>
            <p class="link-text" translate="no">
              {{ lang.host }} <span class="vpi-arrow-right link-text-icon" />
            </p>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.OtherLanguages {
  position: relative;
  padding: 64px 24px 0;
}

@media (min-width: 640px) {
  .OtherLanguages {
    padding: 64px 48px 0;
  }
}

@media (min-width: 960px) {
  .OtherLanguages {
    padding: 64px 64px 0;
  }
}

.container {
  margin: 0 auto;
  max-width: 1152px;
}

.heading {
  line-height: 32px;
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.lead {
  padding-top: 8px;
  line-height: 24px;
  font-size: 16px;
  color: var(--vp-c-text-2);
}

.items {
  display: flex;
  flex-wrap: wrap;
  margin: 16px -8px -8px;
}

.item {
  padding: 8px;
  width: 100%;
}

@media (min-width: 768px) {
  .item {
    width: calc(100% / 3);
  }
}

.card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  background-color: var(--vp-c-bg-soft);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.25s;
}

.card:hover {
  border-color: var(--vp-c-brand-1);
}

.logos {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  background-color: var(--vp-c-default-soft);
  width: 48px;
  height: 48px;
}

.logo img {
  width: 28px;
  height: 28px;
}

.title {
  line-height: 24px;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.details {
  flex-grow: 1;
  padding-top: 8px;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.link-text {
  display: flex;
  align-items: center;
  padding-top: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}

.link-text-icon {
  margin-left: 6px;
}
</style>
