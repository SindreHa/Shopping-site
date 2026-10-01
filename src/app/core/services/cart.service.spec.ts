import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { Product } from '../models/product.model';
import { API_URL } from '../../api/api.config';

const product: Product = {
    id: 'p1',
    name: 'Mug',
    description: 'A mug',
    price: 10,
    stock: 2,
};

const configure = (snackBar: { open: ReturnType<typeof vi.fn> }) =>
    TestBed.configureTestingModule({
        providers: [
            { provide: MatSnackBar, useValue: snackBar },
            provideHttpClient(),
            provideHttpClientTesting(),
        ],
    });

describe('CartService', () => {
    let service: CartService;
    let snackBar: { open: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        localStorage.clear();
        snackBar = { open: vi.fn() };
        configure(snackBar);
        service = TestBed.inject(CartService);
    });

    it('adds a new product with quantity 1', () => {
        service.addProductToCart(product);

        expect(service.getItems$()()).toEqual([expect.objectContaining({ product, quantity: 1 })]);
        expect(service.cartTotal$()).toBe(10);
    });

    it('does not add more than the available stock', () => {
        service.addProductToCart(product);
        service.addProductToCart(product);
        service.addProductToCart(product);

        expect(service.numberOfItemsInCart$()).toBe(2);
        expect(snackBar.open).toHaveBeenLastCalledWith(
            'No more of this product in stock',
            'Close',
            expect.anything()
        );
    });

    it('keeps quantity between 1 and stock', () => {
        service.addProductToCart(product);

        service.updateProductQuantity(product.id, -1);
        expect(service.numberOfItemsInCart$()).toBe(1);

        service.updateProductQuantity(product.id, 1);
        service.updateProductQuantity(product.id, 1);
        expect(service.numberOfItemsInCart$()).toBe(2);
    });

    it('saves the cart to localStorage and restores it', () => {
        service.addProductToCart(product);
        TestBed.tick();

        const saved = JSON.parse(localStorage.getItem('cart') ?? '[]');
        expect(saved).toHaveLength(1);

        TestBed.resetTestingModule();
        configure(snackBar);
        const restored = TestBed.inject(CartService);

        expect(restored.numberOfItemsInCart$()).toBe(1);
    });

    it('clears saved items when the cart is emptied', () => {
        service.addProductToCart(product);
        TestBed.tick();
        service.clearCart();
        TestBed.tick();

        expect(JSON.parse(localStorage.getItem('cart') ?? '[]')).toEqual([]);
    });

    describe('live updates', () => {
        beforeEach(() => {
            service.addProductToCart(product);
            service.addProductToCart(product);
        });

        it('clamps quantity when stock drops elsewhere', () => {
            service.applyProductUpdate({ ...product, stock: 1, price: 12 });

            expect(service.numberOfItemsInCart$()).toBe(1);
            expect(service.cartTotal$()).toBe(12);
            expect(snackBar.open).toHaveBeenLastCalledWith(
                'Only 1 of Mug left, your cart was updated',
                'Close',
                expect.anything()
            );
        });

        it('removes sold out and deleted products', () => {
            service.applyProductUpdate({ ...product, stock: 0 });
            expect(service.getItems$()()).toEqual([]);

            service.addProductToCart(product);
            service.applyProductRemoval(product.id);
            expect(service.getItems$()()).toEqual([]);
        });

        it('ignores stock updates caused by its own checkout', () => {
            const http = TestBed.inject(HttpTestingController);
            let placed = false;

            service.checkout({ name: 'Ada', address: 'Here' }).subscribe(() => (placed = true));
            service.applyProductUpdate({ ...product, stock: 0 });
            expect(service.numberOfItemsInCart$()).toBe(2);

            http.expectOne(`${API_URL}/orders`).flush({ message: 'ok', order: {} });

            expect(placed).toBe(true);
            expect(service.getItems$()()).toEqual([]);
            expect(service.isCheckingOut$()).toBe(false);
            http.verify();
        });
    });
});
