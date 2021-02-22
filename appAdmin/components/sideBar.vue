<template>
    <div :class="showSidebar == 'full' ? 'side-bar full-side': 'side-bar hidden-side'">
        <div class="side-top">
            <Menu width="auto"  :open-names="top_open" :accordion="true" @on-select="onSelectMain" :active-name="top_active">
                <div  v-for="(item, index) in menu" :key="index">
                    <MenuItem :name="item.id" v-if="can(item) && !hasItems(item) && item.link_to != 'link'"
                              :to="item.link_to != 'link' ? `/p/${item.id}` : undefined"
                    >
                        <i v-if="item.icon" :class="item.icon"></i>
                        <span v-html="getTitle(item)"></span>
                    </MenuItem>
                    <Submenu :name="item.id"  v-if="can(item) && hasItems(item)">
                        <template slot="title">
                            <i v-if="item.icon" :class="item.icon"></i>
                            <span v-html="getTitle(item)"></span>

                        </template>
                        <MenuItem  v-if="can(subitem) && !hasItems(subitem)"
                                   v-for="subitem in item.children"
                                   :name="`${item.id}-${subitem.id}`"
                                   :key="`sub-item-${subitem.name}`"
                                   :to="subitem.link_to != 'link' ? `/p/${item.id}/${subitem.id}` : undefined"
                        >
                            <i v-if="subitem.icon" :class="subitem.icon"></i>
                            <span v-html="getTitle(subitem)"></span>
                        </MenuItem>

                        <Submenu :name="`${item.id}-${subitem.id}`"
                                 v-if="can(subitem) && hasItems(subitem)"
                                 v-for="subitem in item.children"

                                 :key="`sub-item-children-${subitem.name}`"
                        >
                            <template slot="title">
                                <i v-if="subitem.icon" :class="subitem.icon"></i>
                                <span v-html="getTitle(subitem)"></span>

                            </template>

                            <MenuItem
                                    :name="`${item.id}-${subitem.id}-${subSubitem.id}`"
                                    v-for="subSubitem in subitem.children"
                                    :key="`sub-sub-item-${subSubitem.name}`"
                                    :to="subSubitem.link_to != 'link' ? `/p/${item.id}/${subitem.id}/${subSubitem.id}` : undefined"

                                    v-if="can(subSubitem) && !hasItems(subSubitem) && subSubitem.link_to != 'link'"
                            >
                                <i v-if="subSubitem.icon" :class="subSubitem.icon"></i>
                                <span v-html="getTitle(subSubitem)"></span>
                            </MenuItem>

                            <a  v-for="subSubitem in subitem.children"
                                :key="`sub-sub-item-${subSubitem.name}`" :href="subSubitem.url" v-if="can(subSubitem) && !hasItems(subSubitem) && subSubitem.link_to == 'link'" target="_blank" class="ivu-menu-item "><i v-if="subSubitem.icon" :class="subSubitem.icon"></i> <span v-html="getTitle(subSubitem)"></span></a>


                        </Submenu>
                    </Submenu>

                    <a :href="item.url" v-if="can(item) && !hasItems(item) && item.link_to == 'link'" target="_blank" class="ivu-menu-item "><i v-if="item.icon" :class="item.icon"></i> <span v-html="getTitle(item)"></span></a>

                </div>

            </Menu>

        </div>


        <div class="side-bottom">

            <Menu width="270px" class="side-bottom-menu" @on-select="onSelect" :active-name="bottom_active">
                <!--                <MenuItem name="geo-data" :to="`/geo-data`">-->
                <!--                    <i class="ti-server"></i>-->
                <!--                    <span>Геомэдээллийн сан</span>-->
                <!--                </MenuItem>-->
<!--                <MenuItem name="analytic" v-if="show_analytic" :to="`/analytics`">-->
<!--                    <i class="ti-pie-chart"></i>-->
<!--                    <span>Анализ</span>-->
<!--                </MenuItem>-->
                <MenuItem  v-for="customItem in customMenuItems" :name="customItem.link" :key="customItem.index" :to="customItem.link">
                    <i :class="customItem.icon"></i>
                    <span>{{customItem.title}}</span>
                </MenuItem>



                <MenuItem name="logout" >
                    <Icon type="ios-log-out"></Icon>
                    <span>Гарах</span>
                </MenuItem>
            </Menu>

        </div>
    </div>
</template>
<script>
    import {mapGetters} from "vuex";

    export default {
        props:["show_analytic", "logout", "customMenuItems"],
        data () {
            return {
                theme2: 'light',
                menu: window.init.menu,
                cruds: window.init.cruds,
                permissions: window.init.permissions.permissions,
                extra: window.init.permissions.extra,
                bottom_active:"",
                top_active:"",
                top_open:[]
            }
        },
        beforeMount() {
            if(this.$route.fullPath == "/analytics"){
                this.bottom_active = "analytic"
            } else if(this.$route.fullPath == "/geo-data"){
                this.bottom_active = "geo-data"
            } else
                this.findActiveMenu(this.menu, "/p", "");


        },
        methods:{
            findActiveMenu(menus, prefix, parentID){
                menus.forEach(menu=>{
                    if(menu.children){
                        if(menu.children.length >= 1){
                            this.findActiveMenu(menu.children, `${prefix}/${menu.id}`, `${parentID}${menu.id}`)
                        } else {
                            this.setActiveMenu(menu, prefix, parentID)
                        }
                    }else {
                        this.setActiveMenu(menu, prefix, parentID)
                    }

                })
            },
            setActiveMenu(menu, prefix, parentID){
                if(menu.link_to == "router-link"){
                    if(this.$route.fullPath == menu.url){
                        this.top_active = menu.id;
                    }
                }else if(menu.link_to == "iframe" || menu.link_to =="crud"){

                    if(this.$route.fullPath == `${prefix}/${menu.id}`){

                        if(parentID != ""){
                            this.top_open = [parentID];
                            this.top_active = `${parentID}-${menu.id}`;


                        } else {
                            this.top_active = `${parentID}${menu.id}`;
                        }

                    }
                }
            },
            onSelect(name){
                let children = document.querySelector(".side-bottom-menu").children;

                for (let i = 0; i < children.length; i++) {
                    children[i].classList.remove("ivu-menu-item-active");
                }
                if(name == "logout"){
                    this.$emit('logout')
                }
                this.top_active = "";
                this.bottom_active = name;
            },
            onSelectMain(name){


                this.top_active = name;
                this.bottom_active = "";


            },
            can(menu) {
                if (this.permissions[menu.id]) {
                    if (this.permissions[menu.id].show)
                        return true;
                    else
                        return false
                } else
                    return false;
            },
            getTitle(item) {

                if (item.link_to == 'crud') {
                    let crudIndex = this.cruds.findIndex(crud => crud.id == item.url);


                    if (crudIndex >= 0)
                        return this.cruds[crudIndex].title;
                    else
                        return ''
                } else
                    return item.title;
            },
            hasItems(item) {

                return item && item.children !== undefined
                    ? item.children.length > 0
                    : false
            },
        },
        watch:{
            // fullPath(){
            //     if(this.$route.fullPath == "/analytics"){
            //         this.bottom_active = "analytic"
            //     } else{
            //         console.log(this.$route.fullPath, "bbbadfdsafdsafdsafdsafdsafdsa")
            //         this.findActiveMenu(this.menu, "/p", "");
            //     }
            //
            // }
        },
        computed:{
            fullPath(){
                return this.$route.fullPath
            },
            ...mapGetters({
                showSidebar: "showSidebar",

            })
        }
    }
</script>