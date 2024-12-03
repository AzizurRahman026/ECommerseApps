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

  totals = computed(() => {
    const cart = this.cart();
    if (!cart) return null;
    
    let subtotal = this.cart()?.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const shipping = 0;
    const discount = 0;
    if (subtotal === undefined) {
      subtotal = 0;
    }
    return {
      subtotal,
      shipping,
      discount,
      total: subtotal + shipping - discount
    }
  })
  
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
    console.log("set cart");
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
      console.log("after push: " + cartItem.productId);
      this.setCart(cart);
    }

    removeItemFromCart(productId: string, quantity = 1) {
      const cart = this.cart();
      if (!cart) return;
      const index = cart.items.findIndex((x: { productId: string; }) => x.productId === productId);
      if (index !== -1) {
        if (cart.items[index].quantity > quantity) {
          cart.items[index].quantity -= quantity;
        } else {
          cart.items.splice(index, 1);
        }
        if (cart.items.length === 0) {
          this.deleteCart();
        } else {
          this.setCart(cart);
        }
      }
    }

    deleteCart() {
      this.http.delete(this.baseUrl + 'cart?id=' + this.cart()?.id).subscribe({
        next: () => {
          localStorage.removeItem('cart_id');
          this.cart.set(null);
        }
      })
    }
    
    private addOrUpdateItem(items: CartItem[], item: CartItem, quantity: number): CartItem[] {
      const index = items.findIndex(x => x.productId === item.productId);
      console.log("add or update item fun in: ");
      if (index === -1) {
        item.quantity = quantity;
        items.push(item);
      } else {
        items[index].quantity += quantity;
      }
      console.log("add or update item fun out: ");
      return items;
    }
    
    private mapProductToCartItem(item: Product): CartItem {
      console.log("Map fun")
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
