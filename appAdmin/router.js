export const routes = [
    {
        path: '/analytics',
        component: require('./pages/analytics/analytics.vue').default,
    },
    {
        path: '/analytics-full',
        component: require('./pages/analytics/analytics.vue').default,
    },
    {
        path: '/extra',
        component: require('./pages/extra/index').default,
        children: [{
            path: 'datasource',
            component: require('./pages/extra/datasource/views/index.vue').default,
            children: [{
                name: 'data-source.list',
                path: '',
                component: require('./pages/extra/datasource/views/list.vue').default,
            },
                {
                    name: 'data-source.builder',
                    path: 'builder/:id?',
                    component: require('./pages/extra/datasource/views/builder.vue').default,
                }
            ]
        },{
            path: 'moqup',
            component: require('./pages/extra/moqup/views/index.vue').default,
            children: [{
                name: 'moqup.list',
                path: '',
                component: require('./pages/extra/moqup/views/list.vue').default,
            },
                {
                    name: 'moqup.builder',
                    path: 'builder/:id?',
                    component: require('./pages/extra/moqup/views/builder.vue').default,
                },
                {
                    name: 'moqup.preview',
                    path: 'preview/:id',
                    component: require('./pages/extra/moqup/views/preview.vue').default,
                },
            ]
        },
            {
                path: 'chart',
                component: require('./pages/extra/chart/views/index.vue').default,
                children: [{
                    name: 'chart.list',
                    path: '',
                    component: require('./pages/extra/chart/views/list.vue').default,
                },
                    {
                        name: 'chart.builder',
                        path: 'builder/:id?',
                        component: require('./pages/extra/chart/views/builder.vue').default,
                    },
                    {
                        name: 'chart.preview',
                        path: 'preview/:id',
                        component: require('./pages/extra/chart/views/preview.vue').default,
                    },
                ]
            },]
    },


];

