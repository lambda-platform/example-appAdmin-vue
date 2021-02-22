
function getColorWithAlpha(source_color, alpha){
    var color = source_color.split(',');

    return color[0]+','+color[1]+','+color[2]+','+alpha+")";
}
export function getLayerShow(layer_id, layer_show, showedLayers, frame){
    if(frame == 'true')
        return false
    let isShow = false;
    if(showedLayers){

        let isIndex = showedLayers.findIndex(showedLayer=>{return showedLayer==layer_id});

        if(isIndex >= 0){
            isShow = true;


        } else {
            isShow = false;


        }
    } else {
        isShow = layer_show == '1' ? true: false;
    }

    return isShow;
}

export function getRerender(legend){

    if(legend.element_type == 'point'){


        let symbol = {
            type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
            url: legend.icon.destinationUrl+legend.icon.uniqueName,
            width: "18px",
            height: "18px"
        };

        return {
            type: "simple", // autocasts as new SimpleRenderer()
            symbol: symbol,
        }



    }
    if(legend.element_type == 'polygon'){
        if(legend.style_type == '0'){


            return {
                type: "simple",
                symbol: {
                    type: "simple-fill",
                    color: getColorWithAlpha(legend.fill_color, '0.5'),
                    style: "solid",
                    outline: {
                        width: '1px',
                        color: getColorWithAlpha(legend.border_color, '1'),

                    }
                }
            };
        }
        if(legend.style_type == '2'){


            return {
                type: "simple",
                symbol: {
                    type: "simple-fill",
                    color: getColorWithAlpha(legend.fill_color, '1'),
                    width: '2px',
                    style: "horizontal",
                    outline: {
                        width: '1px',
                        color: getColorWithAlpha(legend.border_color, '1'),
                        opacity:1
                    }
                }
            };
        }
        if(legend.style_type == '3'){


            return {
                type: "simple",
                symbol: {
                    type: "simple-fill",
                    color: getColorWithAlpha(legend.fill_color, '1'),
                    width: '2px',
                    style: "vertical",
                    outline: {
                        width: '1px',
                        color: getColorWithAlpha(legend.border_color, '1'),
                        opacity:1
                    }
                }
            };
        }
        if(legend.style_type == '4'){


            return {
                type: "simple",
                symbol: {
                    type: "simple-fill",
                    color: getColorWithAlpha(legend.fill_color, '1'),
                    width: '2px',
                    style: "backward-diagonal",
                    outline: {
                        width: '1px',
                        color: getColorWithAlpha(legend.border_color, '1'),

                    }
                }
            };
        }
        if(legend.style_type == '5'){


            return {
                type: "simple",
                symbol: {
                    type: "simple-fill",
                    color: getColorWithAlpha(legend.fill_color, '1'),
                    width: '2px',
                    style: "forward-diagonal",
                    outline: {
                        width: '1px',
                        color: getColorWithAlpha(legend.border_color, '1'),
                    }
                }
            };
        }
        if(legend.style_type == '1'){


            return {
                type: "simple",
                symbol: {
                    type: "simple-fill",
                    color: getColorWithAlpha(legend.fill_color, '1'),
                    width: '2px',
                    style: "diagonal-cross",
                    outline: {
                        width: '1px',
                        color: getColorWithAlpha(legend.border_color, '1'),
                    }
                }
            };
        }


    }

    if(legend.element_type == 'line'){


        return {
            type: "simple", // autocasts as new SimpleRenderer()
            symbol: {
                type:  "simple-line", // autocasts as new SimpleLineSymbol()
                width: 3,
                color: getColorWithAlpha(legend.fill_color, '1')
            }
        }
    }

}
