import path from 'path';

export function formatLoggerName(name: string): string {
    // Extract filename if path
    let formattedName = path.basename(name);

    // Remove extension if exists
    if(formattedName.includes('.')) {
        formattedName = formattedName.split('.')[0];
    }

    return formattedName;
}

