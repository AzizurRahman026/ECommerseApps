import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Cart, CartItem } from '../../shared/models/cart';
import { Product } from '../../shared/models/product';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  cart = signal<Cart | null> (null);

  itemCount = computed(() => {
    return this.cart()?.items.reduce((sum, item) => sum + item.quantity, 0);
  });
  
  getCart(id: string) {
    // this return an observable...
    return this.http.get<Cart>(this.baseUrl + 'cart?id=' + id).pipe(
      map(cart => {
        this.cart.set(cart);
        return cart;
      })
    )

    // this return an subscription...
    // return this.http.get<Cart>(this.baseUrl + 'cart?id=' + id).subscribe({
    //   next: cart => {
    //     this.cart.set(cart),
    //     console.log("Cart value", cart);
    //   }
    // })
  }

  setCart(cart: Cart) {
    return this.http.post<Cart>(this.baseUrl + 'cart', cart).subscribe({
      next: cart => this.cart.set(cart)
    })
  }


    addItemToCart(item: CartItem | Product, quantity = 1) {
      console.log("Card Item Added Service Function Called Successfully...");
      console.log(item.pictureUrl);
      // Unwrap the signal value and ensure it's not null
      let cart = this.cart();
      if (!cart) {
        cart = this.createCart(); // Create a new cart if null
        this.cart.set(cart);
      }

      // Convert Product to CartItem if necessary
      const cartItem: CartItem = this.isProduct(item) ? this.mapProductToCartItem(item) : item;

      // Update cart items
      cart.items = this.addOrUpdateItem(cart.items, cartItem, quantity);
      this.setCart(cart);
    }
    
    private addOrUpdateItem(items: CartItem[], item: CartItem, quantity: number): CartItem[] {
      const index = items.findIndex(x => x.productId === item.productId);
      if (index === -1) {
        item.quantity = quantity;
        items.push(item);
      } else {
        items[index].quantity += quantity;
      }
      return items;
    }
    
    private mapProductToCartItem(item: Product): CartItem {
      return {
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: 0,
        pictureUrl: item.pictureUrl,
        brand: item.brand,
        type: item.type
      };
    }
    
    private isProduct(item: CartItem | Product): item is Product {
      return (item as Product).id !== undefined;
    }
    

  private createCart(): Cart {
    const cart = new Cart();
    localStorage.setItem('cart_id', cart.id);
    return cart;
  }
}
