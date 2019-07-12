<template>
    <BlogLayoutBase>
        <h1>{{$page.frontmatter.title}}</h1>
        <ul id="default-layout">
            <li v-if="$category" v-for="category in $category.list">
                <router-link class="page-link" :to="category.path">{{ category.name }}</router-link>
                ({{category.pages.length}})
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
