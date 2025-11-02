export class OrdersController {
  private orders: any[] = []; // This will hold the orders temporarily

  public placeOrder(req: any, res: any): void {
    const order = req.body;

    // Basic validation
    if (!order.productId || !order.quantity || !order.customerDetails) {
      res.status(400).send({ message: 'Invalid order data' });
      return;
    }

    // Simulate saving the order
    this.orders.push(order);
    res.status(201).send({ message: 'Order placed successfully', order });
  }
}
