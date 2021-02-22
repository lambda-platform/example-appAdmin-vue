<template>
    <Modal v-model="show" :closable="false" width="252" class="logout-modal">
        <p slot="header" style="display:none;"></p>
        <div style="text-align:center">
            <a @click="logout()">
                <Icon type="log-out"></Icon>
                Гарах
            </a>
            <a @click="cancel()">
                <Icon type="ios-loop-strong"></Icon>
                Болих
            </a>
        </div>
        <div slot="footer" style="display:none;">
            <form action="/auth/logout"></form>
        </div>
    </Modal>
</template>

<script>
export default {
    props: ["show"],
    methods: {
        logout() {
            axios.post("/auth/logout", {}).then(o => {
                window.location = "/auth/login";
            });
        },
        cancel() {
            //this.$data.logoutModal = false;
        }
    }
};
</script>
