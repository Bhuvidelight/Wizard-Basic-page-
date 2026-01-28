namespace db;

using {
    cuid,
    managed
} from '@sap/cds/common';



entity Customer {

    key customerId                     : String;
        customerName                   : String;
        email                          : String;
        phoneNumber                    : String;
        address                        : String;
        CustomerToAuditHistoryCustomer : Composition of many AuditHistoryCustomer
                                             on CustomerToAuditHistoryCustomer.AuditHistoryCustomerToCustomer = $self;
        CustomerToOrders               : Composition of many Orders
                                             on CustomerToOrders.OrdersToCustomer = $self;
}

entity AuditHistoryCustomer : cuid, managed {
    key customerId                     : String;
        customerName                   : String;
        email                          : String;
        phoneNumber                    : String;
        address                        : String;
        AuditHistoryCustomerToCustomer : Association to one Customer
                                             on AuditHistoryCustomerToCustomer.customerId = customerId;

}

entity Orders {
        @readonly
            key customerId       : String;
                key orderId          : String;
                        orderDate        : DateTime;
                                orderAmount      : Integer;
                                        status           : String default 'Pending';
        OrdersToCustomer : Association to one Customer
                               on OrdersToCustomer.customerId = customerId;
        OrderToPayment   : Composition of one Payment
                               on OrderToPayment.orderId = $self.orderId;
}


entity Payment {
    key paymentId      : String;

        @readonly
    key orderId        : String;
        paymentDate    : DateTime;
        amount         : Integer;

        PaymentToOrder : Association to one Orders
                             on PaymentToOrder.orderId = orderId;
}














