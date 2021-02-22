<template>
    <Modal
            :value=modalvisible[modalvisiblename]
            :title=title
            :okText=oktext
            cancelText="Цуцлах"
            width="800"
            @on-visible-change="visiblechange"
            @on-ok="addmethod"
            @on-cancel="" class="mbsubtable">
        <datagrid :classname="classname" :schemaID="gridid" :paginate="20" :hasSelection="true" :highlights="highlights" :onSelected="selectrow"></datagrid>
        <!--<i-table ref="selectiontable"  @on-selection-change="selectrow"   size="small" height="200" :columns=columns :data="griddata"></i-table>-->
    </Modal>
</template>
<script>
    import axios from 'axios';
    export default {
        props: ['modalvisible','modalvisiblename','title','oktext','columns','datacontainer','datacontainername','classname','gridid'],//['columns', 'modalvisible','modalvisiblename','ajaxurl','title','oktext','datefilter','datacontainer','datacontainername'],
        data() {
            return {
                griddata: [],
                selected:[],
                highlights:[]
            }
        },
        mounted(){
            setTimeout(()=>{
                this.datacontainer[this.datacontainername].map((item)=>{
                    this.highlights.push(item.id);
                });
            },1000);
        },
        methods: {
            addmethod:function()
            {
                this.datacontainer[this.datacontainername].map((item)=>{
                    this.highlights=this.highlights.filter((f)=>{ return f.id!=item.id});
                });
                this.datacontainer[this.datacontainername]=[...this.highlights, ...this.datacontainer[this.datacontainername]];
            },
            selectrow:function(row){
               this.highlights=row;
            },
            ajaxreq:function(sdate){
                this.$parent.$parent.$Message.loading({
                    content: 'Ачаалж байна...',
                    duration: 0
                });

                console.log('sdate',sdate);
                let localurl=this.hasdatefilter?this.ajaxurl+'/'+sdate:this.ajaxurl;
                axios.get(localurl).then(o => {
                    this.griddata=o.data;
                    this.$parent.$parent.$Message.destroy();
                    setTimeout(()=>{
                        for(let i in this.$refs.selectiontable.objData)
                        {
                            this.datacontainer[this.datacontainername].map((item)=>{
                                if(this.$refs.selectiontable.objData[i].id==item.id){
                                    this.$refs.selectiontable.objData[i]._isChecked=true;
                                }
                            });
                        }
                    },500);
                });
            },
            visiblechange: function(tt) {
                if(tt==false)
                {
                    this.modalvisible[this.modalvisiblename]=tt;
                }

            }
        }
    };
</script>

<style scoped>
      .ivu-modal{
          height:50%!important;
          max-height: 1024px;
      }
</style>
