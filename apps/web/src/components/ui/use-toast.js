import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

const TOAST_LIMIT = 1

let count = 0
let externalToast = null

function generateId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const ToastContext = createContext(undefined)

function useToastState() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const timeouts = []

    toasts.forEach((toast) => {
      if (toast.duration === Infinity) {
        return
      }

      const timeout = setTimeout(() => {
        toast.dismiss()
      }, toast.duration || 5000)

      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [toasts])

  const dismissToast = useCallback((id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(({ ...props }) => {
    const id = generateId()
    const dismiss = () => dismissToast(id)

    const update = (nextProps) => {
      setToasts((currentToasts) =>
        currentToasts.map((currentToast) =>
          currentToast.id === id
            ? { ...currentToast, ...nextProps, dismiss }
            : currentToast
        )
      )
    }

    setToasts((currentToasts) =>
      [
        { ...props, id, dismiss },
        ...currentToasts.filter((currentToast) => currentToast.id !== id),
      ].slice(0, TOAST_LIMIT)
    )

    return {
      id,
      dismiss,
      update,
    }
  }, [dismissToast])

  useEffect(() => {
    externalToast = toast

    return () => {
      if (externalToast === toast) {
        externalToast = null
      }
    }
  }, [toast])

  return useMemo(() => ({
    toast,
    toasts,
  }), [toast, toasts])
}

function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}

function useToastContext() {
  return useToast()
}

const toast = (props) => {
  if (!externalToast) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return externalToast(props)
}

export { useToast, useToastContext, useToastState, ToastContext, toast }
