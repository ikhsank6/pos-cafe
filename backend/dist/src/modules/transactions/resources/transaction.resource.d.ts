export declare class TransactionResource {
    uuid: string;
    transactionNo: string;
    paymentMethod: string;
    status: string;
    amount: number;
    paidAmount: number;
    changeAmount: number;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    order: {
        uuid: string;
        orderNumber: string;
        status: string;
        table?: {
            uuid: string;
            number: string;
        } | null;
    } | null;
    constructor(transaction: any);
    static collection(transactions: any[]): TransactionResource[];
    toJSON(): {
        uuid: string;
        transactionNo: string;
        paymentMethod: string;
        status: string;
        amount: number;
        paidAmount: number;
        changeAmount: number;
        notes: string | null;
        createdAt: string;
        updatedAt: string;
        createdBy: string | null;
        order: {
            uuid: string;
            orderNumber: string;
            status: string;
            table?: {
                uuid: string;
                number: string;
            } | null;
        } | null;
    };
}
