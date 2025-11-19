
import validator from "validator"

export const validators = {
  cpf: (value) => {
    if (!value) return false
    
    const cpf = value.replace(/[^\d]/g, "")
    
    if (cpf.length !== 11) return false
    if (/^(\d)\1+$/.test(cpf)) return false
    
    let sum = 0
    let remainder
    
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i-1, i)) * (11 - i)
    }
    
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cpf.substring(9, 10))) return false
    
    sum = 0
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i-1, i)) * (12 - i)
    }
    
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cpf.substring(10, 11))) return false
    
    return true
  },

  cnpj: (value) => {
    if (!value) return false
    
    const cnpj = value.replace(/[^\d]/g, "")
    
    if (cnpj.length !== 14) return false
    if (/^(\d)\1+$/.test(cnpj)) return false
    
    let size = cnpj.length - 2
    let numbers = cnpj.substring(0, size)
    const digits = cnpj.substring(size)
    let sum = 0
    let pos = size - 7
    
    for (let i = size; i >= 1; i--) {
      sum += numbers.charAt(size - i) * pos--
      if (pos < 2) pos = 9
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - sum % 11
    if (result !== parseInt(digits.charAt(0))) return false
    
    size = size + 1
    numbers = cnpj.substring(0, size)
    sum = 0
    pos = size - 7
    
    for (let i = size; i >= 1; i--) {
      sum += numbers.charAt(size - i) * pos--
      if (pos < 2) pos = 9
    }
    
    result = sum % 11 < 2 ? 0 : 11 - sum % 11
    if (result !== parseInt(digits.charAt(1))) return false
    
    return true
  },

  email: (value) => {
    return validator.isEmail(value)
  },

  phone: (value) => {
    const phone = value.replace(/[^\d]/g, "")
    return phone.length >= 10 && phone.length <= 11
  },

  cep: (value) => {
    const cep = value.replace(/[^\d]/g, "")
    return cep.length === 8
  }
}
