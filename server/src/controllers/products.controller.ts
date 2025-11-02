class ProductsController {
  private products: any;

  constructor() {
    this.products = require('../data/products.json');
  }

  public getAllProducts(req: any, res: any) {
    res.json(this.products);
  }
}

export default ProductsController;
