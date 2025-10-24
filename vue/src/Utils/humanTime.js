const sec = 1000;
const min = sec * 60;
const hour = min * 60;
const day = hour * 24;
const month = day * 30;
const year = month * 12;
const milenia = year * 100;

export default (date) => {
	const round = (value, interval, label) => {
		const val = Math.round(value/interval);
		return `${ val } ${ label + (val > 1 ? 's' : '') } ago`;
	};

	const today = new Date();
	const target = date.constructor.name === "date" ? date : new Date(date);
	const diff = Math.abs(target - today);

	if (diff < min) return round(diff, sec, "second");
	if (diff < hour) return round(diff, min, "minute");
	if (diff < day) return round(diff, min, "hour");
	if (diff < month) return round(diff, day, "day");
	if (diff < year) return round(diff, month, "month");
	return round(diff, year, "year");
};