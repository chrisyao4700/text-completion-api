import axios from 'axios';
import fs from 'fs';
export const timeDiffMinutes = (firstDate: Date, secondDate: Date): number => {
    return Math.round(Math.abs(firstDate.getTime() - secondDate.getTime()) / 60000);
}

export const delayReply = (seconds: number, response: string): Promise<string> => {
    return new Promise(resolve => setTimeout(() => {
        resolve(response);
    }, seconds * 1000));
}

export const sendAxiosRequest = async (url: string, method: string, data?: any, headers?: any): Promise<any> => {
    try {
        const response = await axios({
            url,
            method,
            data,
            headers
        });
        return response.data;
    } catch (error) {
        console.error(error);
        return error;
    }
}
export const saveAMRToTempFile = async (amrData: Buffer, name: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const tempFilePath = `db/temp/voice/${name}.amr`;
        fs.writeFile(tempFilePath, amrData, "binary", (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(tempFilePath);
            }
        });
    });
}

export const deleteFileAtPath = async (filePath: string): Promise<void>=> {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}
