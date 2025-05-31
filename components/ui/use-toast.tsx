"use client";

import * as React from "react"

const TOAST_LIMIT = 1

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "success" | "error" | "default"
}

// Define action type constants
const ADD_TOAST = "ADD_TOAST"
const UPDATE_TOAST = "UPDATE_TOAST" 
const DISMISS_TOAST = "DISMISS_TOAST"
const REMOVE_TOAST = "REMOVE_TOAST"

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type Action =
  | {
      type: typeof ADD_TOAST
      toast: ToasterToast
    }
  | {
      type: typeof UPDATE_TOAST
      toast: Partial<ToasterToast>
    }
  | {
      type: typeof DISMISS_TOAST
      toastId?: string
    }
  | {
      type: typeof REMOVE_TOAST
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case DISMISS_TOAST: {
      const { toastId } = action

      // Dismiss all toasts
      if (toastId === undefined) {
        return {
          ...state,
          toasts: state.toasts.map((t) => ({
            ...t,
          })),
        }
      }

      // Dismiss specific toast
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId ? { ...t } : t
        ),
      }
    }

    case REMOVE_TOAST: {
      const { toastId } = action

      if (toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }

      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== toastId),
      }
    }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

function toast({
  title,
  description,
  variant,
  action,
}: {
  title?: string
  description?: string
  variant?: "success" | "error" | "default"
  action?: React.ReactNode
}) {
  const id = genId()

  const update = (props: Partial<ToasterToast>) =>
    dispatch({
      type: UPDATE_TOAST,
      toast: { ...props, id },
    })

  const dismiss = () => dispatch({ type: DISMISS_TOAST, toastId: id })

  dispatch({
    type: ADD_TOAST,
    toast: {
      id,
      title,
      description,
      variant,
      action,
    },
  })

  return {
    id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: DISMISS_TOAST, toastId }),
  }
}

export { useToast, toast } 