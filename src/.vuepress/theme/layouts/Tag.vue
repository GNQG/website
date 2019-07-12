<template>
    <BlogLayoutBase>
        <h1>{{$page.frontmatter.title}}</h1>
        <ul v-if="$tag && $tag.list" id="default-layout">
            <li v-for="tag in $tag.list">
                <router-link class="page-link" :to="tag.path">{{ tag.name }}</router-link>
                ({{tag.pages.length}})
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
