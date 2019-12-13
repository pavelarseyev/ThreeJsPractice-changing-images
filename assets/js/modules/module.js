
// these properties will be available from anywhere via this.property
export const constants = {
    isTouch: "ontouchstart" in window ? function () {document.body.classList.add("touch"); return true;}() : function () {document.body.classList.add("no-touch"); return false;}(),
    body: $("body")
};
