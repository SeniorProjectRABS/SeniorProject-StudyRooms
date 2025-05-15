export const formatTimeToHHMM = (timeStr: string): string => {
    const [time, modifier] = timeStr.toUpperCase().split(' ');
    if (!time || !modifier) return timeStr; // Return original if format is unexpected

    let [hours, minutes] = time.split(':');
    let numericHours = parseInt(hours, 10);

    if (modifier === 'AM') {
        if (numericHours === 12) { // 12 AM is 00 hours
            numericHours = 0;
        }
    } else if (modifier === 'PM') {
        if (numericHours !== 12) { // 12 PM is 12 hours, others add 12
            numericHours += 12;
        }
    }
    return `${String(numericHours).padStart(2, '0')}:${minutes}`;
};

/**
 * Converts a time string from HH:MM (24-hour) format to "HH:MM AM/PM" format.
 * @param timeHHMM The time string in "HH:MM" format.
 * @returns The time in "HH:MM AM/PM" format.
 */
export const formatHHMMToAMPM = (timeHHMM: string): string => {
    const [hoursStr, minutes] = timeHHMM.split(':');
    if (!hoursStr || !minutes) return timeHHMM; // Return original if format is unexpected

    let hours = parseInt(hoursStr, 10);
    const modifier = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${String(hours).padStart(2, '0')}:${minutes} ${modifier}`;
};