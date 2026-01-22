export declare enum PaymentMethod {
    CASH = "CASH",
    DEBIT_CARD = "DEBIT_CARD",
    CREDIT_CARD = "CREDIT_CARD",
    QRIS = "QRIS",
    EWALLET = "EWALLET",
    BANK_TRANSFER = "BANK_TRANSFER"
}
export declare enum TransactionStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare class CreateTransactionDto {
    orderUuid: string;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    referenceNumber?: string;
    notes?: string;
}
export declare class UpdateTransactionStatusDto {
    status: TransactionStatus;
}
export declare class RefundTransactionDto {
    reason: string;
}
