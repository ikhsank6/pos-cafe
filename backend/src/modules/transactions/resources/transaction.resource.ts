export class TransactionResource {
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
        order?: {
            uuid: string;
            orderNumber: string;
            status: string;
            subtotal: number;
            discount: number;
            tax: number;
            total: number;
            table?: {
                uuid: string;
                number: string;
            } | null;
        } | null;

    constructor(transaction: any) {
        this.uuid = transaction.uuid;
        this.transactionNo = transaction.transactionNo;
        this.paymentMethod = transaction.paymentMethod;
        this.status = transaction.status;
        this.amount = Number(transaction.amount);
        this.paidAmount = Number(transaction.paidAmount);
        this.changeAmount = Number(transaction.changeAmount);
        this.notes = transaction.notes || null;
        this.createdAt = transaction.createdAt?.toISOString?.() || transaction.createdAt;
        this.updatedAt = transaction.updatedAt?.toISOString?.() || transaction.updatedAt;
        this.createdBy = transaction.createdBy || null;

        this.order = transaction.order ? {
            uuid: transaction.order.uuid,
            orderNumber: transaction.order.orderNumber,
            status: transaction.order.status,
            subtotal: Number(transaction.order.subtotal),
            discount: Number(transaction.order.discount),
            tax: Number(transaction.order.tax),
            total: Number(transaction.order.total),
            table: transaction.order.table ? {
                uuid: transaction.order.table.uuid,
                number: transaction.order.table.number,
            } : null,
        } : null;
    }

    static collection(transactions: any[]): TransactionResource[] {
        return transactions.map((transaction) => new TransactionResource(transaction));
    }

    toJSON() {
        return {
            uuid: this.uuid,
            transactionNo: this.transactionNo,
            paymentMethod: this.paymentMethod,
            status: this.status,
            amount: this.amount,
            paidAmount: this.paidAmount,
            changeAmount: this.changeAmount,
            notes: this.notes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            order: this.order,
        };
    }
}
