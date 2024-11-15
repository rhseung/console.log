import { format } from "./format";

type Stream = {
    debug: (data: string, showToast?: boolean) => void;
    error: (data: string, showToast?: boolean) => void;
    info: (data: string, showToast?: boolean) => void;
    clear: () => void;
}

const kSecond = 1000;
const kMinute = 60 * kSecond;
const kHour = 60 * kMinute;

export class Console {
    private _times: { [key: string]: number } = {};
    private _counts: { [key: string]: number } = {};
    private _showToast: boolean = false;

    constructor(private _stream: Stream) {
        if (!(this._stream
            && typeof this._stream.info === 'function'
            && typeof this._stream.error === 'function'
            && typeof this._stream.debug === 'function'
            && typeof this._stream.clear === 'function'
        )) {
            throw new TypeError("Console expects a writable stream instance");
        }
    }

    get showToast(): Console {
        this._showToast = true;
        return this;
    }

    stringify(msg: string, ...format: any[]): string;
    stringify(obj: any): string;
    stringify(...args: any): string {
        this._showToast = false;
        return format.apply(this, args);
    }

    info(msg: string, ...format: any[]): void;
    info(obj: any): void;
    info(...args: any): void {
        this._stream.info(this.stringify.apply(this, args), this._showToast);
        this._showToast = false;
    }

    log(msg: string, ...format: any[]): void;
    log(obj: any): void;
    log(...args: any): void {
        this._stream.info(this.stringify.apply(this, args), this._showToast);
        this._showToast = false;
    }

    error(msg: string, ...format: any[]): void;
    error(obj: any): void;
    error(...args: any): void {
        this._stream.error(this.stringify.apply(this, args), this._showToast);
        this._showToast = false;
    }

    warn(msg: string, ...format: any[]): void;
    warn(obj: any): void;
    warn(...args: any): void {
        this._stream.error(this.stringify.apply(this, args), this._showToast);
        this._showToast = false;
    }

    debug(msg: string, ...format: any[]): void;
    debug(obj: any): void;
    debug(...args: any): void {
        this._stream.debug(this.stringify.apply(this, args), this._showToast);
        this._showToast = false;
    }

    clear(): void {
        this._stream.clear();
        this._showToast = false;
    }

    assert(value: boolean, msg?: string, ...format: any[]): void {
        if (value) return;
        this.error(`Assertion failed${msg === undefined ? '' : ': ' + msg}`, ...format);
    }

    count(label: string = 'default') {
        if (!(label in this._counts))
            this._counts[label] = 0;
        this.debug(`${label}: ${++this._counts[label]}`);
    }

    countReset(label: string = 'default') {
        delete this._counts[label];
        this._showToast = false;
    }

    time(label: string = 'default') {
        this._times[label] = Date.now();
        this._showToast = false;
    }

    timeLog(label: string = 'default', ...data: any[]) {
        if (!(label in this._times))
            throw new Error(`No such label: ${label}`);
        this.debug("%s: %s", label, formatTime(Date.now() - this._times[label]), ...data);
    }

    timeEnd(label: string = 'default') {
        this.timeLog(label);
        delete this._times[label];
    }

    trace(...data: any[]) {
        const err = new Error();
        err.name = 'Trace';
        // @ts-ignore
        err.message = format(...data);
        // @ts-ignore
        Error.captureStackTrace(err, this.trace);
        this.error(err.stack);
    }
}