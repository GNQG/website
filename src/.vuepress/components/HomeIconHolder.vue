<template>
    <div class="home-icon-holder">
        <div class="center">
            <slot />
        </div>
    </div>
</template>

<script>
export default {};
</script>

<style lang="stylus">
.home-icon-holder
    text-align center
    margin auto

    .center
        display inline-table

        > *
            float left
</style>
