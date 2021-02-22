<template>
    <section class="page page-list">
        <div class="page-list-header">
            <h3>{{ title }} ({{ listData.length }})</h3>
            <div class="page-list-header-search">
                <Input @on-keyup="filterList" icon="ios-search" placeholder="Хайх утгаа оруулна уу..." style="width: 200px" />
            </div>
            <div class="page-list-header-control">
                <router-link :to="`${prefix ? prefix : ''}/${type}/builder`" class="btn-del">
                    <Button type="success">
                        <Icon type="md-add"></Icon> Нэмэх

                    </Button>
                </router-link>
            </div>
        </div>

        <div v-if="loading" class="loader">
            <div class="loader-wrapper">
                <div class="lds-roller">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <h3>Түр хүлээнэ үү</h3>
            </div>
        </div>

        <Row v-else :gutter="16" class="pz-list">
            <Col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in filteredList" :key="item.index">
            <div class="pz-list-item">
                <div class="pz-list-item-body">
                    <h3>{{ item.name }}</h3>
                    <small>{{ item.created_at }}</small>
                </div>
                <div class="pz-list-item-control">
                    <router-link :to="`${prefix ? prefix : ''}/${type}/preview/${item.id}`" class="btn-preview" v-if="preview != 'hidden'">
                        <Icon type="ios-eye"></Icon>
                    </router-link>
                    <span>
                        <router-link :to="`${prefix ? prefix : ''}/${type}/builder/${item.id}`" class="btn-edit">
                            <Icon type="md-create"></Icon>
                        </router-link>
                        <Poptip confirm title="Өгөгдөлийг устгах уу?" confirm width="180" ok-text="Тийм" cancel-text="Үгүй" @on-ok="deleteListItem(item.id)" @on-cancel="cancel">
                            <a href="javascript:void(0)" class="btn-del">
                                <Icon type="ios-trash"></Icon>
                            </a>
                        </Poptip>
                    </span>
                </div>
            </div>
            </Col>
        </Row>
    </section>
</template>

<script>
export default {
    props: ["title", "type", "src", "preview", "prefix"],
    data() {
        return {
            loading: true,
            listData: [],
            filteredList: []
        };
    },

    created() {
      console.log(this.$props.src);
      console.log("========");
        axios.get(this.$props.src).then(({ data }) => {
            this.loading = false;
            this.filteredList = this.listData = data.data;
        });
    },
    methods: {
        deleteListItem(id) {
            axios.delete(`/lambda/puzzle/delete/vb_schemas/${this.type}/${id}`).then(o => {
                this.filteredList = this.filteredList.filter(
                    item => item.id !== id
                );
                this.listData = this.listData.filter(item => item.id !== id);
                this.$Message.success("Амжилттай устгалаа!");
            });
        },
        cancel() {},
        filterList($event) {
            let vm = this;
            let q = $event.target.value;
            if (q != "") {
                vm.filteredList = vm.listData.filter(
                    item =>
                        item.name
                            .toString()
                            .toLowerCase()
                            .indexOf(q.toLowerCase()) >= 0
                );
            } else {
                vm.filteredList = vm.listData;
            }
        }
    }
};
</script>
