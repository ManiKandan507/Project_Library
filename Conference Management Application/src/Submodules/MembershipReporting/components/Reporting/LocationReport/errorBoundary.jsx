import * as React from 'react'

const changedArray = (a = [], b = []) =>
  a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]))


const initialState = {error: null}

class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return {error}
  }

  state = initialState
  resetErrorBoundary = (...args) => {
    this.props.onReset?.(...args)
    this.reset()
  }

  reset() {
    this.setState(initialState)
  }

  componentDidCatch(error, info) {
    this.props.onError?.(error, info)
  }

  componentDidUpdate(
    prevProps,
    prevState,
  ) {
    const {error} = this.state
    const {resetKeys} = this.props

    // There's an edge case where if the thing that triggered the error
    // happens to *also* be in the resetKeys array, we'd end up resetting
    // the error boundary immediately. This would likely trigger a second
    // error to be thrown.
    // So we make sure that we don't check the resetKeys on the first call
    // of cDU after the error is set

    if (
      error !== null &&
      prevState.error !== null &&
      changedArray(prevProps.resetKeys, resetKeys)
    ) {
      this.props.onResetKeysChange?.(prevProps.resetKeys, resetKeys)
      this.reset()
    }
  }

  render() {
    const {error} = this.state

    const {FallbackComponent, fallback} = this.props

    if (error !== null) {
      const props = {
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      }
      if (React.isValidElement(fallback)) {
        return fallback
      } else if (FallbackComponent) {
        return <FallbackComponent {...props} />
      } else {
        throw new Error(
          'react-error-boundary requires either a fallback, fallbackRender, or FallbackComponent prop',
        )
      }
    }

    return this.props.children
  }
}

function ErrorFallback({error, resetErrorBoundary}) {
  return (
      <div role="alert">
          <p style={{fontSize:"20px"}}>Something went wrong while render the Map component. Please click the below button to load the Map component.</p>
          {/* <pre>{error.message}</pre> */}
          <button onClick={resetErrorBoundary}>Try again</button>
      </div>
  )
}

export {ErrorBoundary, ErrorFallback
    // withErrorBoundary, useErrorHandler
}
