import { useState, useCallback } from 'react'
import { formatPhoneNumber, getPhoneDigits } from '@/lib/phoneMask'

export function usePhoneMask(initialValue: string = '') {
  const [phone, setPhone] = useState(initialValue)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
  }, [])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const digits = getPhoneDigits(e.target.value)
    if (digits.length >= 11) {
      setPhone(formatPhoneNumber(digits))
    }
  }, [])

  const getPhoneDigitsValue = useCallback(() => {
    return getPhoneDigits(phone)
  }, [phone])

  return {
    phone,
    setPhone,
    handleChange,
    handleBlur,
    getPhoneDigitsValue,
  }
}

