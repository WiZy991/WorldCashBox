'use client'

import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { Lock, LogIn, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function AdminLoginContent() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const { login } = useAuth()
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		const success = await login(username, password)

		if (success) {
			router.push('/admin')
		} else {
			setError('Неверные учетные данные')
		}

		setLoading(false)
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-4'>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className='w-full max-w-md'
			>
				<div className='bg-white rounded-2xl shadow-2xl p-8'>
					<div className='text-center mb-8'>
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.2, type: 'spring' }}
							className='inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4'
						>
							<Lock className='w-8 h-8 text-white' />
						</motion.div>
						<h1 className='text-3xl font-bold text-gray-900 mb-2'>
							Админ-панель
						</h1>
						<p className='text-gray-600'>Войдите для управления сайтом</p>
					</div>

					<form onSubmit={handleSubmit} className='space-y-6'>
						{error && (
							<motion.div
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'
							>
								{error}
							</motion.div>
						)}

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Имя пользователя
							</label>
							<div className='relative'>
								<User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
								<input
									type='text'
									value={username}
									onChange={e => setUsername(e.target.value)}
									required
									className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
									placeholder='Введите имя пользователя'
								/>
							</div>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Пароль
							</label>
							<div className='relative'>
								<Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
								<input
									type='password'
									value={password}
									onChange={e => setPassword(e.target.value)}
									required
									className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
									placeholder='Введите пароль'
								/>
							</div>
						</div>

						<motion.button
							type='submit'
							disabled={loading}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className='w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{loading ? (
								<span>Вход...</span>
							) : (
								<>
									<LogIn className='w-5 h-5' />
									<span>Войти</span>
								</>
							)}
						</motion.button>
					</form>
				</div>
			</motion.div>
		</div>
	)
}

export default function AdminLogin() {
	return <AdminLoginContent />
}
