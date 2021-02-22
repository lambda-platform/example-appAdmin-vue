<template>
    <div class="subform-grid-agent" >
        <div class="subform-header-agent" v-show="typeof form.name!= undefined && form.name && form.name.length>0">
            <h3>{{ form.name }}</h3>
        </div>
        <div class="subform-description-agent">
            <Alert show-icon v-show="typeof form.desc!= undefined && form.desc && form.desc.length>0">{{form.desc}}</Alert>
        </div>
        <table border="1" style="display: block; overflow-x: auto">
            <thead>
            <tr>
                <th v-for="item in form.schema"  :key="item.index" style="min-width: 200px">
                    {{ item.label }}
                </th>
                <th class="action">...</th>
            </tr>
            </thead>

            <tbody>
            <grid-form v-for="(item, index) in listData" :schema="form.schema" :model="item" key="index">
                <template slot="action">
                    <a href="javscript:void(0)" @click="remove(index)">
                        <Icon type="trash-a"></Icon>
                    </a>
                </template>
            </grid-form>
            </tbody>
        </table>

        <a class="sub-grid-add" href="javascript:void(0)" @click="add">
            <Icon type="plus"></Icon> Нэмэх
        </a>
    </div>
</template>

<script>
     import GridForm from "./subtableInlineForm";

    export default {
        props: ["form","listData"],
        components: {
             "grid-form": GridForm
        },
        methods: {
            checkAddable() {
                return new Promise((resolve, reject) => {
                    if(this.listData.length==0)
                    {
                        resolve(true);
                    }
                    let obj = this.listData[this.listData.length - 1];
                    if (obj) {
                        let hasValue = false;
                        let lastModel = obj;

                        for (let key in lastModel) {
                            if (
                                typeof lastModel[key] != undefined &&
                                lastModel[key] != null &&
                                lastModel[key] != "" &&
                                lastModel[key] != false
                            ) {
                                hasValue = true;
                            }
                        }
                        hasValue ? resolve(true) : reject(false);
                    } else {
                        resolve(true);
                    }
                });
            },
            addSubForm() {
                // console.log('ADD SUB FORM');
                // console.log(this.listData);
                let listItem={};
                this.form.schema.forEach(item => {
                    listItem[item.index]='';
                });
                // console.log(listItem);
                this.listData.push(listItem);
                // console.log(this.listData);
            },

            add() {
                this.checkAddable()
                    .then(o => {
                        setTimeout(() => {
                            this.addSubForm();
                        }, 200);
                    })
                    .catch(e => {
                        console.log(e);
                    });
            },

            remove(index) {
                this.listData.splice(index, 1);
            }
        }
    };
</script>

