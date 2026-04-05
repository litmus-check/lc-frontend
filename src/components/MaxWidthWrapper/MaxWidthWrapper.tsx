import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'

interface MaxWidthWrapperProps {
  className?: string
  children: ReactNode
}

const MaxWidthWrapper: FC<MaxWidthWrapperProps> = ({ className, children }) => {
  return (
    <div className={cn('mx-auto w-full max-w-screen-3xl', className)}>
      {children}
    </div>
  )
}

export default MaxWidthWrapper
