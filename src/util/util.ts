
export const timeDiffMinutes = (firstDate:Date, secondDate:Date):number => {
    return Math.round(Math.abs(firstDate.getTime() - secondDate.getTime()) / 60000);
}