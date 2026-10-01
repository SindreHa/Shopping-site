import { Request, RequestHandler, Response } from 'express';
import { ProductsService } from '../services/products.service';

type IdParams = { id: string };

export class ProductsController {
    constructor(private readonly products: ProductsService) {}

    public list: RequestHandler = (_req, res) => {
        res.json(this.products.list());
    };

    public create: RequestHandler = (req, res) => {
        res.status(201).json(this.products.create(req.body));
    };

    public update = (req: Request<IdParams>, res: Response): void => {
        const product = this.products.update(req.params.id, req.body);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json(product);
    };

    public remove = (req: Request<IdParams>, res: Response): void => {
        if (!this.products.delete(req.params.id)) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.status(204).end();
    };
}
