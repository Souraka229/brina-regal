'use client'
import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext()

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload || []
      }
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id)
      let newItems
      
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }]
      }

      // Sauvegarder dans localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('brina-cart', JSON.stringify(newItems))
      }

      return { ...state, items: newItems }
    
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('brina-cart', JSON.stringify(filteredItems))
      }

      return { ...state, items: filteredItems }
    
    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0)

      if (typeof window !== 'undefined') {
        localStorage.setItem('brina-cart', JSON.stringify(updatedItems))
      }

      return { ...state, items: updatedItems }
    
    case 'CLEAR_CART':
      if (typeof window !== 'undefined') {
        localStorage.removeItem('brina-cart')
      }
      return { ...state, items: [] }
    
    default:
      return state
  }
}

const initialState = {
  items: []
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  useEffect(() => {
    // Charger le panier depuis localStorage
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('brina-cart')
      if (savedCart) {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) })
      }
    }
  }, [])

  const addItem = (product) => {
    dispatch({ type: 'ADD_ITEM', payload: product })
  }

  const removeItem = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.prix * item.quantity), 0)
  }

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider value={{
      items: state.items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
