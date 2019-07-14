<template>
    <span class="pgb-wrapper">
        <router-link v-if="isAvailable" :to="link">
            <li class="page-button pgb-link">{{ label || index+1 }}</li>
        </router-link>
        <li
            v-else
            class="page-button"
            :class="disabled ? 'pgb-disabled' : 'pgb-active'"
        >{{ label || index+1 }}</li>
    </span>
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
.pgb-link, .pgb-disabled, .pgb-active
    display inline-block
    padding 0.25rem 0.5rem
    border 1px solid #ddd
    list-style-type none
    width 1.25rem
    height 1.75rem

.pgb-link:hover
    background-color #ded

.pgb-active
    background-color $accentColor
    color #eee

.pgb-disabled
    background-color #eee
    color #bbb
</style>
