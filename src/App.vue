<template>
    <layout :auth-dialog="authDialog" @close-dialog="closeDialog">
        <trans @should-auth="shouldAuth"></trans>
    </layout>
</template>

<script setup>
    import layout from '@/pages/layout/index.vue'
    import trans from '@/pages/trans/index.vue'
    
    import {ref} from 'vue'

    const authDialog=ref(false)

    function shouldAuth(){
        authDialog.value=true
    }

    function closeDialog(){
        authDialog.value=false
    }
</script>
