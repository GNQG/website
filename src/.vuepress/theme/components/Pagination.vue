<template>
    <div class="center">
        <ul v-if="$pagination" class="pagination-container">
            <!-- left arrow -->
            <router-link v-if="$pagination.hasPrev" :to="$pagination.prevLink">
                <li class="page-link">❮</li>
            </router-link>
            <li v-else class="page-disabled">❮</li>
            <!-- 1 -->
            <router-link
                v-if="$pagination.paginationIndex !== 0"
                :to="$pagination.getSpecificPageLink(0)"
            >
                <li class="page-link">1</li>
            </router-link>
            <li v-else class="page-active">1</li>
            <!-- 2 - (end-1) -->
            <li v-if="hasLeftOmission" class="page-disabled">⋯</li>
            <span v-if="displayAll" v-for="index in $pagination.length-2" :key="index+1">
                <router-link
                    v-if="$pagination.paginationIndex !== index"
                    :to="$pagination.getSpecificPageLink(index)"
                >
                    <li class="page-link">{{ index+1 }}</li>
                </router-link>
                <li v-else class="page-active">{{ index+1 }}</li>
            </span>
            <span v-if="!displayAll" v-for="index in displayRange">
                <router-link
                    v-if="$pagination.paginationIndex !== index"
                    :to="$pagination.getSpecificPageLink(index)"
                >
                    <li class="page-link">{{ index+1 }}</li>
                </router-link>
                <li v-else class="page-active">{{ index+1 }}</li>
            </span>
            <li v-if="hasRightOmission" class="page-disabled">⋯</li>
            <!-- end -->
            <router-link
                v-if="$pagination.length > 1 && $pagination.paginationIndex !== $pagination.length-1"
                :to="$pagination.getSpecificPageLink($pagination.length-1)"
            >
                <li class="page-link">{{$pagination.length}}</li>
            </router-link>
            <span v-else="$pagination.length > 1">
                <li class="page-active">{{$pagination.length}}</li>
            </span>
            <!-- Right arrow -->
            <router-link v-if="$pagination.hasNext" :to="$pagination.nextLink">
                <li class="page-link">❯</li>
            </router-link>
            <li v-else class="page-disabled">❯</li>
        </ul>
    </div>
</template>

<script>
export default {
    computed: {
        displayAll() {
            return this.$pagination.length <= 5;
        },
        hasLeftOmission() {
            return this.$pagination.paginationIndex >= 3;
        },
        hasRightOmission() {
            return (
                this.$pagination.paginationIndex <= this.$pagination.length - 4
            );
        },
        displayRange() {
            if (this.$pagination.paginationIndex <= 1) {
                return [1, 2];
            } else if (
                this.$pagination.paginationIndex >=
                this.$pagination.length - 2
            ) {
                return [
                    this.$pagination.length - 3,
                    this.$pagination.length - 2
                ];
            } else {
                return [
                    this.$pagination.paginationIndex - 1,
                    this.$pagination.paginationIndex,
                    this.$pagination.paginationIndex + 1
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

    .page-active, .page-disabled, .page-link
        display inline-block
        padding 0.25rem 0.5rem
        border 1px solid #ddd
        list-style-type none
        float left
        width 1.25rem
        height 1.75rem

    span:hover:not(.page-active):not(.page-disabled)
        background-color #ded

    .page-active
        background-color $accentColor
        color #eee

    .page-disabled
        background-color #eee
        color #bbb
</style>
