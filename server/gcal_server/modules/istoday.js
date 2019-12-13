/**
 * Function checks if given timestamp matches current day
 * @param {string/object} date1 The timestamp used for comparison
 */
function isToday(date1) {
    const today = new Date()
    var date = new Date(date1);
    return date.getDate() == today.getDate() &&
      date.getMonth() == today.getMonth() &&
      date.getFullYear() == today.getFullYear()
}
module.exports.isToday = isToday;