import * as AColorPicker from "a-color-picker";

//  Element.closest() polyfill
if (!Element.prototype.closest) {
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
  }
  Element.prototype.closest = function (s) {
    var el = this;
    var ancestor = this;
    if (!document.documentElement.contains(el)) return null;
    do {
      if (ancestor.matches(s)) return ancestor;
      ancestor = ancestor.parentElement;
    } while (ancestor !== null);
    return null;
  };
}

let pickerElement = document.querySelector(".picker");
let picker = AColorPicker.createPicker(pickerElement, {
  color: "#FFFFFF",
  showRGB: false,
  showHSL: false,
  showHEX: true,
  showAlpha: false
});
picker.hide();

window.addEventListener("mousedown", function () {
  if (event.target.closest(".picker")) return;
  picker.hide();
});

pickerElement.addEventListener("mousedown", function () {
  if (event.target.closest(".a-color-picker")) return;
  picker.toggle();
});

export { picker, pickerElement };
