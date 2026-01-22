"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionResource = void 0;
class TransactionResource {
    uuid;
    transactionNo;
    paymentMethod;
    status;
    amount;
    paidAmount;
    changeAmount;
    notes;
    createdAt;
    updatedAt;
    createdBy;
    order;
    constructor(transaction) {
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
            table: transaction.order.table ? {
                uuid: transaction.order.table.uuid,
                number: transaction.order.table.number,
            } : null,
        } : null;
    }
    static collection(transactions) {
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
exports.TransactionResource = TransactionResource;
//# sourceMappingURL=transaction.resource.js.map