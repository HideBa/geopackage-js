/**
 * Paint module.
 * @module tiles/features
 */
class Paint {
  constructor() {
    this.color = '#000000FF';
    this.strokeWidth = 1.0;
  }
  /**
   * Get the color
   * @returns {String} color String color in the format #RRGGBB or #RRGGBBAA
   */
  getColor() {
    return this.color;
  }
  /**
   * Get the color
   * @returns {String} color
   */
  getColorRGBA() {
    // assumes color is in the format #RRGGBB or #RRGGBBAA
    var red = parseInt(this.color.substr(1, 2), 16);
    var green = parseInt(this.color.substr(3, 2), 16);
    var blue = parseInt(this.color.substr(5, 2), 16);
    var alpha = 1.0;
    if (this.color.length > 7) {
      alpha = parseInt(this.color.substr(7, 2), 16) / 255;
    }
    return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
  }
  /**
   * Set the color
   * @param {String} color String color in the format #RRGGBB or #RRGGBBAA
   */
  setColor(color) {
    this.color = color;
  }
  /**
   * Get the stroke width
   * @returns {Number} strokeWidth width in pixels
   */
  getStrokeWidth() {
    return this.strokeWidth;
  }
  /**
   * Set the stroke width
   * @param {Number} strokeWidth width in pixels
   */
  setStrokeWidth(strokeWidth) {
    this.strokeWidth = strokeWidth;
  }
}

module.exports = Paint;