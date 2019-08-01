<template>
    <BlogLayoutBase>
        <h1>{{ $page.frontmatter.title }}</h1>
        <ul v-if="$frontmatterKey && $frontmatterKey.list" id="default-layout">
            <li v-for="key in $frontmatterKey.list" :key="key.name">
                <router-link class="page-link" :to="key.path">{{
                    key.name
                }}</router-link>
                ({{ key.pages.length }})
            </li>
        </ul>
    </BlogLayoutBase>
</template>

<script>
import BlogLayoutBase from "@theme/layouts/BlogLayoutBase.vue";

export default {
    components: { BlogLayoutBase }
};
</script>
