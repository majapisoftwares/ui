export default function formatClock(time?: number) {
  if (time === undefined) {
    return "";
  }
  const totalSeconds = Math.floor(time / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  let formattedTime = "";

  if (hours > 0) {
    formattedTime += `${hours.toString().padStart(2, "0")}:`;
  }
  if (minutes > 0) {
    formattedTime += `${minutes.toString().padStart(2, "0")}:`;
  } else {
    formattedTime += `00:`;
  }
  formattedTime += remainingSeconds.toString().padStart(2, "0");

  return formattedTime.trim();
}
