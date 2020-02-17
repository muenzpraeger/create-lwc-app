export declare function log(logMessage: Message, ...args: string[]): void;
export declare function welcome(): void;
export interface Message {
    message: string;
    emoji?: string;
}
