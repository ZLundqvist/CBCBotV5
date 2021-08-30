export function Tableize(rows: any[], keys: string[] = extractKeys(rows)): string {
    // Map values to key
    const mappedValues = mapValuesToKeys(rows, keys);

    const formattedRows: string[] = [];
    // First and second row (titles)
    formattedRows[0] = '';
    formattedRows[1] = '';
    for(const key of keys) {
        // Get column width for key
        const width = getColumnWidth([key].concat(mappedValues[key]));
        formattedRows[0] += key.padEnd(width);
        formattedRows[1] += '-'.repeat(width);

        // Add some spacing between columns
        formattedRows[0] += '  ';
        formattedRows[1] += '  ';
    }

    // Rest of rows
    for(let i = 0; i < rows.length; i++) {
        formattedRows[i + 2] = '';

        // For each column
        for(const key of keys) {
            const width = getColumnWidth([key].concat(mappedValues[key]));

            formattedRows[i + 2] += valueToString(mappedValues[key][i]).padEnd(width);

            // Add some spacing between columns
            formattedRows[i + 2] += '  ';
        }
    }
    
    return formattedRows.join('\n');
}

/**
 * Converts values into string
 * Specific function because some types of values need special convertions
 * @param value 
 */
function valueToString(value: any): string {
    if(value instanceof Date) {
        return value.toLocaleString()
    } else {
        return String(value);
    }
}

/**
 * Given a array of values, returns the number of characters long the longest value is when converted to a string
 * @param values 
 */
function getColumnWidth(values: any[]): number {
    let length = 0;
    
    for(const value of values) {
        if(!value)
            continue;

        let valueLength = valueToString(value).length;

        if(valueLength > length) {
            length = valueLength;
        }
    }

    return length;
}

function extractKeys(rows: any[]): string[] {
    const keys: Set<string> = new Set();

    for(const row of rows) {
        for(const key of Object.keys(row)) {
            keys.add(key);
        }
    }

    return Array.from(keys);
}

function mapValuesToKeys(rows: any[], keys: string[]): any {
    let obj: any = {};

    for(const key of keys) {
        obj[key] = rows.map(row => row[key]);
    }

    return obj;
}