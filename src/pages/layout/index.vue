<template>
    <div class="page-container">
        <layout-header :auth-dialog="authDialog" @close-auth-dialog="closeAuthDialog" @open-set-form="openSetForm"></layout-header>
        <slot></slot>
        <!--<layout-footer></layout-footer>-->
    </div>
</template>
<script setup>
    import layoutHeader from './header.vue'
    import layoutFooter from './footer.vue'
    import {ref,defineProps,defineEmits} from 'vue'

    const emit=defineEmits(['close-dialog','open-set'])

    defineProps({
        authDialog:Boolean
    })

    function closeAuthDialog(){
      emit("close-dialog")
    }
    function openSetForm(){
      emit("open-set")
    }
</script>
<style scoped>
.page-container{
  width: 100%;
  height: 100vh;
  background: #F3F8FF;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>