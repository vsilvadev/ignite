import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
       const stockResponse= await api.get<Stock>(`http://localhost:3333/stock/${productId}`);
       const stockAmount = stockResponse.data.amount;

      const productAlreadyInCart = cart.find(product => {
        return product.id === productId;
      })

      if (productAlreadyInCart) {
        if (stockAmount > productAlreadyInCart.amount) {
          const updatedCart = cart.map(item => {
            if(item.id === productId) {
              item.amount = item.amount + 1;
            }
            return item;
          });
          setCart(updatedCart);
          localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
          return;
        } else {
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }
      }

      const productResponse = await api.get<Product>(`http://localhost:3333/products/${productId}`);
      const product = productResponse.data;

      const newCart = [...cart, {...product, amount: 1}] 
      setCart(newCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productExists = cart.find(product => {
        return product.id === productId;
      })

      if(!productExists) {
        toast.error('Erro na remoção do produto');
        return;
      }

      const newCart = cart.filter(item => item.id !==  productId);
      setCart(newCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
    } catch {
      toast.error('Erro ao remover produto do carrinho');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if(amount < 1) {
        return;
      }
      
      const response = await api.get(`http://localhost:3333/stock/${productId}`);
      const stockAmount = response.data.amount;
      
      if (amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const updatedCart = cart.map(item => {
        if(item.id === productId) {
          item.amount = amount;
        }
        return item;
      });
      
      setCart(updatedCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
