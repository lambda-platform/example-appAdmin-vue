
export function x(this_) {
    alert('refresh')
    localStorage.setItem("zoom", this_.mapView.zoom);
    // localStorage.setItem("page", this_.page);
    // localStorage.setItem("showPage", this_.showPage);
    let latLong = this_.mapView.center;
    localStorage.setItem("lat", latLong.latitude);
    localStorage.setItem("lng", latLong.longitude);
    let showedLayers = [];

    window.location.reload();
}

var templateRe = /\{ *([\w_-]+) *\}/g;
export function template(str, data) {
    return str.replace(templateRe, function (str, key) {
        var value = data[key];

        if (value === undefined) {
            throw new Error('No value provided for variable ' + str);

        } else if (typeof value === 'function') {
            value = value(data);
        }
        return value;
    });
}