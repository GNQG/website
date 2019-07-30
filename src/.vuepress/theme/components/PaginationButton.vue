<template>
    <li
        class="page-button"
        :class="
            isAvailable ? 'pgb-link' : disabled ? 'pgb-disabled' : 'pgb-active'
        "
    >
        <router-link class="pgb-inner" v-if="isAvailable" :to="link">{{
            label || index + 1
        }}</router-link>
        <span class="pgb-inner" v-else>{{ label || index + 1 }}</span>
    </li>
</template>

<script>
export default {
    props: {
        index: Number,
        label: String,
        disabled: Boolean
    },
    computed: {
        isAvailable() {
            return (
                this.$pagination.paginationIndex !== this.index &&
                0 <= this.index &&
                this.index < this.$pagination.length
            );
        },
        link() {
            return this.$pagination.getSpecificPageLink(this.index);
        }
    }
};
</script>

<style lang="stylus">
.page-button
    display inline-block
    border 1px solid #ddd
    list-style-type none

    .pgb-inner
        display block
        width 1.25rem
        height 1.75rem
        padding 0.25rem 0.5rem

.pgb-link:hover
    background-color #ded

.pgb-active
    background-color $accentColor
    color #eee

.pgb-disabled
    background-color #eee
    color #bbb
</style>
