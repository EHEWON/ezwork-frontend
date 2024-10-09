<template>
    <layout :auth-dialog="authDialog" @close-dialog="closeDialog" @open-set="openSet">
        <trans @should-auth="shouldAuth" :setShow="setShow" @set-hide="hideSet" @open-set="openSet"></trans>
    </layout>
</template>

<script setup>
    import layout from '@/pages/layout/index.vue'
    import trans from '@/pages/trans/index.vue'
    
    import {ref} from 'vue'

    const authDialog=ref(false)
    const setShow=ref(false)

    function shouldAuth(){
        authDialog.value=true
    }

    function openSet(){
      console.log(2222222)
      setShow.value = true;
    }

    function hideSet(){
      setShow.value = false;
    }

    function closeDialog(){
        authDialog.value=false
    }
</script>
