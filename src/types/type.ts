
export type Tmeta = {
    page?: number;
    limit?: number;
    total?: number;
}

export type TResponseData<T> = {
    success: boolean;
    statusCode: number;
    message: string;
    total?: number;
    data?: T;
    meta?: Tmeta;
}
