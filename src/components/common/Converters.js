const convertImagesToUriArray = (images) => {
    var uri = [];
    images.forEach((value) => {
        const u = {
            url: value
        }
        uri.push(u);
    });
    return uri;

}
const convertImagesToStringArray = (images) => {

    var strings = [];
    if (images) {
        images.forEach(value => {
            const string = value.full_url;
            strings.push(string);
        });
    }
    return strings;
}
export {convertImagesToStringArray, convertImagesToUriArray}