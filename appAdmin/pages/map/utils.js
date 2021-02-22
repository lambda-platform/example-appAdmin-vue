const templateRe = /\{ *([\w_-]+) *\}/g;
export function template(str, data) {
    return str.replace(templateRe, function(str, key) {
        let value = data[key];

        if (value === undefined) {
            throw new Error('No value provided for variable ' + str);
        } else if (typeof value === 'function') {
            value = value(data);
        }
        return value;
    });
}

export function formatDate(d) {
    let month = '' + (d.getMonth() + 1),
        day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}
export function dateToString(data) {
    // console.log(data)
    Object.keys(data).map(key => {
        if (Number.isInteger(data[key])) {
            if (data[key].toString().length == 13) {
                const preDate = new Date(data[key]);

                const date = formatDate(preDate);

                data[key] = date;
            }
        }
    });
    return data;
}
export const hex2rgba = (hex, alpha) => {
    const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
    return [r, g, b, alpha];
};
