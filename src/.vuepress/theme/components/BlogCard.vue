<template>
    <div class="blog-card">
        <div class="bc-head">
            <div class="bc-date left">
                {{ formattedDate }}
            </div>
            <div class="bc-labeled right">
                <div class="bc-value">
                    <router-link
                        v-if="page.frontmatter.category"
                        :to="
                            '/blog/category/' + page.frontmatter.category + '/'
                        "
                    >
                        <i class="fa fa-folder" aria-hidden="true"></i>
                        {{ page.frontmatter.category }}
                    </router-link>
                </div>
            </div>
        </div>
        <div class="bc-body">
            <div class="bc-title">
                <router-link :to="page.path">
                    {{
                        page.title ||
                            page.frontmatter.title ||
                            decodeURIComponent(page.path)
                    }}
                </router-link>
            </div>
            <hr class="bc-sep" />
            <div v-if="page.frontmatter.tag" class="bc-labeled">
                <div
                    v-for="tag in page.frontmatter.tag"
                    :key="tag"
                    class="bc-value"
                >
                    <router-link :to="'/blog/tag/' + tag + '/'">
                        <i class="fa fa-tag" aria-hidden="true"></i>
                        {{ tag }}
                    </router-link>
                </div>
            </div>
            <p class="bc-description">
                {{ page.frontmatter.description || "(no discription)" }}
            </p>
        </div>
    </div>
</template>

<script>
import * as moment from "moment-timezone";
export default {
    props: ["page"],
    computed: {
        formattedDate() {
            const date = this.page.date || this.page.frontmatter.date;
            return date
                ? moment.tz(date, "Asia/Tokyo").format("YYYY-MM-DD")
                : "XXXX-YY-ZZ";
        }
    }
};
</script>

<style lang="stylus">
.blog-card
    padding 8px
    background-color rgba($accentColor, 0.1)
    border solid 1px $accentColor
    box-shadow 2px 2px 4px $accentColor

    .bc-head
        .left
            float left

        .right
            float right

        + *
            clear both

    .bc-body
        padding 0px 12px

    .bc-title
        font-size 175%

    .bc-sep
        height 1px
        background-color $accentColor

    .bc-description
        padding 8px
        display inline-block
        background-color white

    .bc-labeled
        color $accentColor

        *
            display inline

        .bc-value + .bc-value
            margin 0px 0px 0px 8px

.blog-card + .blog-card
    margin 12px 0px 0px 0px
</style>
