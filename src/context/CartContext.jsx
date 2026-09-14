import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext({})

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) }
              : i
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }],
      }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) }
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
        ).filter(i => i.quantity > 0),
      }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    case 'TOGGLE_DRAWER':
      return { ...state, isOpen: !state.isOpen }
    case 'OPEN_DRAWER':
      return { ...state, isOpen: true }
    case 'CLOSE_DRAWER':
      return { ...state, isOpen: false }
    default:
      return state
  }
}

const initialState = {
  items: JSON.parse(localStorage.getItem('eco_herb_cart') || '[]'),
  isOpen: false,
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('eco_herb_cart', JSON.stringify(state.items))
  }, [state.items])

  const addItem = (product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...product, quantity } })
    dispatch({ type: 'OPEN_DRAWER' })
  }

  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id })

  const updateQty = (id, quantity) => dispatch({ type: 'UPDATE_QTY', payload: { id, quantity } })

  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  const toggleDrawer = () => dispatch({ type: 'TOGGLE_DRAWER' })
  const closeDrawer = () => dispatch({ type: 'CLOSE_DRAWER' })

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items: state.items,
      isOpen: state.isOpen,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      toggleDrawer,
      closeDrawer,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
