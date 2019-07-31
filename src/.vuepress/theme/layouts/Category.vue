<template>
    <BlogLayoutBase>
        <h1>{{ $page.frontmatter.title }}</h1>
        <ul v-if="$category && $category.list" id="default-layout">
            <li v-for="category in $category.list" :key="category.name">
                <router-link class="page-link" :to="category.path">{{
                    category.name
                }}</router-link>
                ({{ category.pages.length }})
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
