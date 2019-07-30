<template>
    <BlogLayoutBase>
        <h1>{{ $page.frontmatter.title }}</h1>
        <Pagination />
        <ul id="default-layout">
            <li v-for="page in $pagination.pages" :key="page">
                <router-link class="page-link" :to="page.path">{{
                    page.title
                }}</router-link>
            </li>
        </ul>
        <Pagination />
    </BlogLayoutBase>
</template>

<script>
import BlogLayoutBase from "@theme/layouts/BlogLayoutBase.vue";
import Pagination from "@theme/components/Pagination.vue";

export default {
    components: { BlogLayoutBase, Pagination }
};
</script>
