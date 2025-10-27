import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/types'

export function successResponse<T>(
  data: T,
  meta?: ApiResponse['meta']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta,
  })
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  )
}

export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number = 400,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401)
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', message, 403)
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Not found') {
    super('NOT_FOUND', message, 404)
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details)
  }
}
