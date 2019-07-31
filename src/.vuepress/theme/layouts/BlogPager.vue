<template>
    <BlogLayoutBase>
        <h1>{{ $page.frontmatter.title }}</h1>
        <div class="blog-header">
            <div class="blog-header-button-container">
                <div class="blog-header-button">
                    <router-link to="/blog/tag/">
                        <i class="fa fa-tag" aria-hidden="true"></i>
                        tag
                    </router-link>
                </div>
                <div class="blog-header-button">
                    <router-link to="/blog/category/">
                        <i class="fa fa-folder" aria-hidden="true"></i>
                        category
                    </router-link>
                </div>
            </div>
        </div>
        <Pagination />
        <div>
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
    components: { BlogLayoutBase, Pagination, BlogCard }
};
</script>

<style lang="stylus">
.blog-header
    margin auto
    text-align center

    .blog-header-button-container
        display inline-block

        .blog-header-button
            font-size 125%
            display inline

            + .blog-header-button
                margin 0px 0px 0px 24px
</style>
