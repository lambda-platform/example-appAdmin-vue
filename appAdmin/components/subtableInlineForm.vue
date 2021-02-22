<template>
    <tr>
        <td v-for="item in schema" :key="item.index">
            <Input v-model="model[item.index]" size="small"></Input>
        </td>

        <td class="action">
            <slot name="action"></slot>
        </td>
    </tr>
</template>

<script>
export default {
    props: ["model", "schema"],
};
</script>

