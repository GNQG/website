<template>
    <div class="v-fa-icon">
        <a :href="href" target="_blank" rel="noopener noreferrer">
            <div class="v-fa-icon-holder">
                <i class="fa" :class="iconName" aria-hidden="true" />
            </div>
        </a>
    </div>
</template>

<script>
export default {
    props: ["href", "iconName"],
};
</script>

<style lang="stylus">
.v-fa-icon
    user-select none
    margin auto
    text-align center
    padding 8px

    .v-fa-icon-holder
        width 80px
        height 80px

    .fa
        color $textColor
        font-size 64px
        line-height 80px

@media (max-width $MQMobile)
    .v-fa-icon
        padding 6px

        .v-fa-icon-holder
            width 72px
            height 72px

        .fa
            font-size 56px
            line-height 72px

@media (max-width $MQMobileNarrow)
    .v-fa-icon
        padding 4px

        .v-fa-icon-holder
            width 48px
            height 48px

        .fa
            font-size 36px
            line-height 48px
</style>
