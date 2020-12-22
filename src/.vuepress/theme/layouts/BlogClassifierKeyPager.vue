<template>
    <BlogLayoutBase>
        <h1>{{ $page.frontmatter.title }}</h1>
        <Pagination />
        <div v-if="$pagination">
            <BlogCard
                v-for="page in $pagination.pages"
                :page="page"
                :key="page.path"
            />
        </div>
        <Pagination />
    </BlogLayoutBase>
</template>

<script>
import BlogLayoutBase from "@theme/layouts/BlogLayoutBase.vue";
import Pagination from "@theme/components/Pagination.vue";
import BlogCard from "@theme/components/BlogCard.vue";

export default {
    components: { BlogLayoutBase, Pagination, BlogCard },
};
</script>
