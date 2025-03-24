import ms from "ms";
export default function wait(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, typeof time !== "number" ? ms(time) : time);
    });
}
