<template>
    <div v-if="$pagination" class="center">
        <ul v-if="pageLength > 0" class="pagination-container">
            <!-- head -->
            <PaginationButton
                class="pgb-mobile-narrow"
                label="❮❮"
                :index="0"
                :disabled="!$pagination.hasPrev"
            />
            <!-- prev -->
            <PaginationButton
                label="❮"
                :index="currentIndex - 1"
                :disabled="!$pagination.hasPrev"
            />
            <!-- 1 -->
            <PaginationButton class="pgb-wide" :index="0" />
            <PaginationButton
                class="pgb-wide"
                v-if="hasLeftOmission"
                label="⋯"
                disabled
            />
            <!-- 2 - (end - 1) -->
            <PaginationButton
                class="pgb-wide"
                v-for="index in displayRange"
                :index="index"
                :key="index"
            />
            <PaginationButton
                class="pgb-wide"
                v-if="hasRightOmission"
                label="⋯"
                disabled
            />
            <!-- end -->
            <PaginationButton
                class="pgb-wide"
                v-if="pageLength > 1"
                :index="pageLength - 1"
            />
            <!-- next -->
            <PaginationButton
                label="❯"
                :index="currentIndex + 1"
                :disabled="!$pagination.hasNext"
            />
            <!-- tail -->
            <PaginationButton
                class="pgb-mobile-narrow"
                label="❯❯"
                :index="pageLength - 1"
                :disabled="!$pagination.hasNext"
            />
        </ul>
    </div>
</template>

<script>
import PaginationButton from "./PaginationButton.vue";
export default {
    components: { PaginationButton },
    computed: {
        currentIndex() {
            return this.$pagination.paginationIndex;
        },
        pageLength() {
            return this.$pagination.length;
        },
        hasLeftOmission() {
            return this.pageLength > 5 && this.currentIndex >= 3;
        },
        hasRightOmission() {
            return (
                this.pageLength > 5 && this.currentIndex <= this.pageLength - 4
            );
        },
        displayRange() {
            if (this.pageLength <= 5) {
                return [...Array(Math.max(0, this.pageLength - 2)).keys()].map(
                    i => i + 1
                );
            } else if (this.currentIndex <= 1) {
                return [1, 2];
            } else if (this.currentIndex >= this.pageLength - 2) {
                return [this.pageLength - 3, this.pageLength - 2];
            } else {
                return [
                    this.currentIndex - 1,
                    this.currentIndex,
                    this.currentIndex + 1
                ];
            }
        }
    }
};
</script>

<style lang="stylus">
.center
    text-align center
    margin auto

.pagination-container
    display inline-table
    -webkit-user-select none
    -moz-user-select none
    -ms-user-select none
    user-select none
    padding 0

    .page-button
        float left

    .pgb-mobile-narrow
        display none

    @media (max-width: $MQMobileNarrow)
        .pgb-mobile-narrow
            display inline-block

        .pgb-wide:not(.pgb-active)
            display none
</style>
