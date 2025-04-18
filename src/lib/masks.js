
import Inputmask from "inputmask"

export const masks = {
  cpf: {
    mask: "999.999.999-99"
  },
  
  cnpj: {
    mask: "99.999.999/9999-99"
  },
  
  phone: {
    mask: ["(99) 9999-9999", "(99) 99999-9999"]
  },
  
  cep: {
    mask: "99999-999"
  },
  
  money: {
    mask: "R$ 999.999.999,99",
    numericInput: true,
    radixPoint: ",",
    groupSeparator: ".",
    autoGroup: true,
    digits: 2,
    digitsOptional: false,
    prefix: "R$ "
  },
  
  date: {
    mask: "99/99/9999"
  },
  
  percentage: {
    mask: "99,99%",
    numericInput: true,
    radixPoint: ",",
    digits: 2,
    suffix: "%"
  }
}

export const applyMask = (element, maskType) => {
  if (!element || !masks[maskType]) return
  
  const im = new Inputmask(masks[maskType])
  im.mask(element)
}
