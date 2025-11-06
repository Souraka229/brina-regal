'use client'

import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext()

const initialState = { items: [] }

// Helper pour vérifier si on est côté client
const isClient = typeof window !== 'undefined'

// Helper pour sauvegarder le panier dans localStorage
const saveCart = (items) => {
  if (isClient) localStorage.setItem('brina-cart', JSON.stringify(items))
}

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return { items: action.payload || [] }

    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      const newItems = existingItem
        ? state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...state.items, { ...action.payload, quantity: 1 }]

      saveCart(newItems)
      return { items: newItems }
    }

    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(item => item.id !== action.payload)
      saveCart(filteredItems)
      return { items: filteredItems }
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items
        .map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
        .filter(item => item.quantity > 0)

      saveCart(updatedItems)
      return { items: updatedItems }
    }

    case 'CLEAR_CART':
      if (isClient) localStorage.removeItem('brina-cart')
      return { items: [] }

    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  useEffect(() => {
    if (isClient) {
      const savedCart = localStorage.getItem('brina-cart')
      if (savedCart) {
        try {
          dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) })
        } catch (error) {
          console.error('Erreur lors du chargement du panier:', error)
        }
      }
    }
  }, [])

  // Actions du panier
  const addItem = (product) => dispatch({ type: 'ADD_ITEM', payload: product })
  const removeItem = (productId) => dispatch({ type: 'REMOVE_ITEM', payload: productId })
  const updateQuantity = (productId, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } })
  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  // Calculs du panier
  const getTotalPrice = () =>
    state.items.reduce((total, item) => total + parseFloat(item.prix) * item.quantity, 0)
  const getTotalItems = () =>
    state.items.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart doit être utilisé dans un CartProvider')
  }
  return context
}
