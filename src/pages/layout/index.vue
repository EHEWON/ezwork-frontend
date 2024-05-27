<template>
    <div class="page-container">
        <layout-header :auth-dialog="authDialog" @close-auth-dialog="closeAuthDialog"></layout-header>
        <slot></slot>
        <layout-footer></layout-footer>
    </div>
</template>
<script setup>
    import layoutHeader from './header.vue'
    import layoutFooter from './footer.vue'
    import {ref,defineProps,defineEmits} from 'vue'

    const emit=defineEmits(['close-dialog'])

    defineProps({
        authDialog:Boolean
    })

    function closeAuthDialog(){
        emit("close-dialog")
    }
</script>