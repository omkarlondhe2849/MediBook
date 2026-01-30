
// Formats date string/array to readable string
export const formatDate = (dateInput: any): string => {
    if (!dateInput) return 'Invalid Date';

    let date: Date;

    // Java array [y,m,d,h,m,s] to JS Date
    if (Array.isArray(dateInput)) {
        const [year, month, day, hour, minute, second] = dateInput;
        date = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
    } else {
        date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Formats to time string
export const formatTime = (dateInput: any): string => {
    if (!dateInput) return '--:--';

    let date: Date;

    if (Array.isArray(dateInput)) {
        const [year, month, day, hour, minute, second] = dateInput;
        date = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
    } else {
        date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) return '--:--';

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Gets day of month
export const getDayOfMonth = (dateInput: any): number | string => {
    if (!dateInput) return '';

    if (Array.isArray(dateInput)) {
        return dateInput[2]; // [y, m, d]
    }

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    return date.getDate();
};

// Gets short month
export const getMonthShort = (dateInput: any): string => {
    if (!dateInput) return '';

    if (Array.isArray(dateInput)) {
        const monthIndex = dateInput[1] - 1;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[monthIndex] || '';
    }

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('default', { month: 'short' });
};
